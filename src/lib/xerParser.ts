import type { P6Activity, Project, WBSNode } from '@/types'

export interface ParsedXERData {
  projects: Partial<Project>[]
  wbsNodes: WBSNode[]
  activities: P6Activity[]
}

/**
 * Parse standard Oracle Primavera P6 (.XER) tab-delimited text
 */
export function parseXER(xerText: string): ParsedXERData {
  const lines = xerText.split(/\r?\n/)
  let currentTable = ''
  let currentFields: string[] = []

  const rawTasks: Record<string, string>[] = []
  const rawPreds: Record<string, string>[] = []
  const rawWBS: Record<string, string>[] = []
  const rawProjects: Record<string, string>[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('%T')) {
      currentTable = trimmed.split(/\t/)[1]?.trim() || ''
      currentFields = []
    } else if (trimmed.startsWith('%F')) {
      currentFields = line.split('\t').slice(1).map(f => f.trim())
    } else if (trimmed.startsWith('%R')) {
      const values = line.split('\t').slice(1)
      const row: Record<string, string> = {}
      currentFields.forEach((field, i) => {
        row[field] = values[i] ?? ''
      })

      if (currentTable === 'PROJECT') rawProjects.push(row)
      else if (currentTable === 'PROJWBS') rawWBS.push(row)
      else if (currentTable === 'TASK') rawTasks.push(row)
      else if (currentTable === 'TASKPRED') rawPreds.push(row)
    }
  }

  // Convert raw records to internal domain models
  const projectId = rawProjects[0]?.proj_id || `proj_${Date.now()}`
  const projectName = rawProjects[0]?.proj_short_name || 'Imported Primavera P6 Project'

  const parsedProject: Partial<Project> = {
    id: projectId,
    name: projectName,
    code: rawProjects[0]?.proj_short_name || 'OIL-P6-IMPORT',
    type: 'pipeline',
    startDate: rawProjects[0]?.plan_start_date?.split(' ')[0] || new Date().toISOString().split('T')[0],
    endDate: rawProjects[0]?.plan_end_date?.split(' ')[0] || new Date().toISOString().split('T')[0],
    status: 'in_progress',
    plannedProgress: 50,
    actualProgress: 45,
    spi: 0.90,
    cpi: 0.95
  }

  const wbsNodes: WBSNode[] = rawWBS.map(w => ({
    id: w.wbs_id || `wbs_${Math.random()}`,
    projectId,
    wbsCode: w.wbs_short_name || '1',
    name: w.wbs_name || 'WBS Component',
    parentId: w.parent_wbs_id || null,
    level: 1
  }))

  // Map dependencies
  const predMap = new Map<string, string[]>()
  const succMap = new Map<string, string[]>()

  rawPreds.forEach(p => {
    const taskId = p.task_id
    const predId = p.pred_task_id
    if (taskId && predId) {
      if (!predMap.has(taskId)) predMap.set(taskId, [])
      predMap.get(taskId)!.push(predId)

      if (!succMap.has(predId)) succMap.set(predId, [])
      succMap.get(predId)!.push(taskId)
    }
  })

  const activities: P6Activity[] = rawTasks.map((t, idx) => {
    const taskId = t.task_id || `a_${idx + 1}`
    const taskCode = t.task_code || `A10${idx * 10}`
    const taskName = t.task_name || `Activity ${taskCode}`
    const durationDays = Math.max(1, Math.round((parseFloat(t.target_drtn_hr_cnt || '64') / 8)))
    const progress = Math.min(100, Math.max(0, parseFloat(t.phys_complete_pct || '0')))

    return {
      id: taskId,
      activityId: taskCode,
      projectId,
      wbsId: t.wbs_id || wbsNodes[0]?.id || 'w1',
      wbsCode: '1.1',
      name: taskName,
      discipline: 'piping',
      wbsLevel: 'L5',
      keywords: taskName.toLowerCase().split(/\s+/).filter(w => w.length > 3),
      plannedStart: t.target_start_date?.split(' ')[0] || '2024-01-01',
      plannedFinish: t.target_end_date?.split(' ')[0] || '2024-06-30',
      actualStart: t.act_start_date?.split(' ')[0] || null,
      actualFinish: t.act_end_date?.split(' ')[0] || null,
      plannedDuration: durationDays,
      remainingDuration: progress >= 100 ? 0 : Math.round(durationDays * (1 - progress / 100)),
      plannedProgress: Math.min(100, progress + 10),
      actualProgress: progress,
      status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
      isCritical: parseFloat(t.total_float_hr_cnt || '0') <= 0,
      predecessors: predMap.get(taskId) || [],
      successors: succMap.get(taskId) || [],
      unit: 'meters',
      totalQuantity: 1000,
      completedQuantity: Math.round(1000 * (progress / 100)),
      location: 'Pipeline Section',
      budgetCost: 5000000,
      actualCost: 5000000 * (progress / 100)
    }
  })

  return {
    projects: [parsedProject],
    wbsNodes,
    activities
  }
}

/**
 * Generate standard Oracle Primavera P6 (.XER) file export content
 */
export function exportToXER(project: Project, activities: P6Activity[], wbsNodes: WBSNode[]): string {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)

  const header = [
    `ERMHDR\t8.0\t${timestamp}\tEXPORT\tPrimavera P6 EPPM\tOil India Limited Nirman Setu Engine`,
    '%T\tPROJECT',
    '%F\tproj_id\tproj_short_name\tplan_start_date\tplan_end_date\tstatus_code',
    `%R\t${project.id}\t${project.code}\t${project.startDate} 08:00\t${project.endDate} 17:00\tActive`,
    '%T\tPROJWBS',
    '%F\twbs_id\tproj_id\twbs_short_name\twbs_name\tparent_wbs_id',
    ...wbsNodes.map(w => `%R\t${w.id}\t${project.id}\t${w.wbsCode}\t${w.name}\t${w.parentId || ''}`),
    '%T\tTASK',
    '%F\ttask_id\tproj_id\twbs_id\ttask_code\ttask_name\ttarget_start_date\ttarget_end_date\ttarget_drtn_hr_cnt\tphys_complete_pct\tact_start_date\tact_end_date\ttotal_float_hr_cnt\tstatus_code',
    ...activities.map(a =>
      `%R\t${a.id}\t${project.id}\t${a.wbsId}\t${a.activityId}\t${a.name}\t${a.plannedStart} 08:00\t${a.plannedFinish} 17:00\t${a.plannedDuration * 8}\t${a.actualProgress}\t${a.actualStart ? a.actualStart + ' 08:00' : ''}\t${a.actualFinish ? a.actualFinish + ' 17:00' : ''}\t${(a.totalFloat ?? 0) * 8}\t${a.status === 'completed' ? 'TK_Complete' : a.status === 'in_progress' ? 'TK_Active' : 'TK_NotStart'}`
    ),
    '%T\tTASKPRED',
    '%F\ttask_pred_id\ttask_id\tpred_task_id\tpred_type',
    ...activities.flatMap((a, aIdx) =>
      a.predecessors.map((predId, pIdx) =>
        `%R\trel_${aIdx}_${pIdx}\t${a.id}\t${predId}\tPR_FS`
      )
    ),
    '%E\tEND OF FILE'
  ].join('\n')

  return header
}

/**
 * Export activities to Excel CSV format
 */
export function exportToCSV(activities: P6Activity[]): string {
  const headers = [
    'Activity ID', 'Activity Name', 'WBS Code', 'Status', 'Critical Path',
    'Planned Start', 'Planned Finish', 'Actual Start', 'Actual Finish',
    'Planned Duration (Days)', 'Remaining (Days)', 'Planned %', 'Actual %',
    'Total Float (Days)', 'Total Qty', 'Done Qty', 'Unit', 'Location'
  ]

  const rows = activities.map(a => [
    `"${a.activityId}"`,
    `"${a.name.replace(/"/g, '""')}"`,
    `"${a.wbsCode}"`,
    `"${a.status}"`,
    `"${a.isCritical ? 'Yes' : 'No'}"`,
    `"${a.plannedStart}"`,
    `"${a.plannedFinish}"`,
    `"${a.actualStart || ''}"`,
    `"${a.actualFinish || ''}"`,
    a.plannedDuration,
    a.remainingDuration,
    a.plannedProgress,
    a.actualProgress,
    a.totalFloat ?? 0,
    a.totalQuantity,
    a.completedQuantity,
    `"${a.unit}"`,
    `"${a.location}"`
  ].join(','))

  return [headers.join(','), ...rows].join('\n')
}
