import { useState, useRef } from 'react'
import {
  ChevronRight, ChevronDown, AlertTriangle, CheckCircle2, Clock,
  Minus, Download, Upload, RefreshCw, FileSpreadsheet, Calendar,
  Layers, ShieldAlert, Zap, Filter, Tag, CheckSquare
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MOCK_WBS } from '@/lib/mockData'
import { useToast } from '@/hooks/useToast'
import type { WBSNode, P6Activity, EngineeringDiscipline } from '@/types'
import clsx from 'clsx'

const DISCIPLINES: { id: string; label: string; color: string }[] = [
  { id: 'all', label: 'All Disciplines', color: 'bg-slate-800 text-slate-300' },
  { id: 'piping', label: 'Piping', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'civil', label: 'Civil', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'equipment', label: 'Equipment', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'electrical', label: 'Electrical', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'instrumentation', label: 'Instrumentation', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'hse', label: 'HSE', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
]

function statusVariant(status: P6Activity['status']) {
  switch (status) {
    case 'completed': return 'success'
    case 'in_progress': return 'info'
    case 'delayed': return 'danger'
    case 'not_started': return 'outline'
    default: return 'default'
  }
}

function statusIcon(status: P6Activity['status']) {
  switch (status) {
    case 'completed': return <CheckCircle2 size={13} className="text-emerald-400" />
    case 'in_progress': return <Clock size={13} className="text-blue-400" />
    case 'delayed': return <AlertTriangle size={13} className="text-red-400" />
    default: return <Minus size={13} className="text-slate-500" />
  }
}

export function Schedule() {
  const {
    activities, selectedProjectId, runCPMRecalculation,
    importXERFile, exportCurrentXER, exportCurrentCSV, projects
  } = useAppStore()
  const { toast } = useToast()

  const project = projects.find(p => p.id === selectedProjectId) || projects[0]
  const projectActivities = activities.filter(a => a.projectId === selectedProjectId)

  const [selectedActivity, setSelectedActivity] = useState<P6Activity | null>(projectActivities[0] || null)
  const [view, setView] = useState<'list' | 'gantt' | 'wbs'>('list')
  const [filter, setFilter] = useState<'all' | 'critical' | 'delayed' | 'in_progress'>('all')
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | 'L5' | 'L6'>('all')

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['w1', 'w3', 'w6', 'w15', 'w18']))
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [xerInput, setXerInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const projectWbs = MOCK_WBS.filter(w => w.projectId === selectedProjectId)
  const rootNodes = projectWbs.filter(w => w.parentId === null)

  function toggleNode(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleRecalculate() {
    runCPMRecalculation()
    toast({
      type: 'success',
      title: 'CPM Schedule Recalculated',
      message: 'Critical Path and Float recalculated dynamically across multi-discipline dependencies.'
    })
  }

  function handleExportXER() {
    const xerData = exportCurrentXER()
    const blob = new Blob([xerData], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.code}_PrimaveraP6_Schedule.xer`
    a.click()
    URL.revokeObjectURL(url)
    toast({ type: 'success', title: 'Primavera P6 (.XER) Exported', message: 'Oracle P6 EPPM file generated.' })
  }

  function handleExportCSV() {
    const csvData = exportCurrentCSV()
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.code}_Schedule_Export.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ type: 'success', title: 'Schedule CSV Exported', message: 'Spreadsheet downloaded.' })
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const ok = importXERFile(content)
        if (ok) {
          toast({ type: 'success', title: 'Primavera P6 File Imported', message: `Imported schedule from ${file.name}` })
          setIsImportModalOpen(false)
        } else {
          toast({ type: 'error', title: 'Import Failed', message: 'Invalid XER structure.' })
        }
      }
    }
    reader.readAsText(file)
  }

  function handlePasteImport() {
    if (!xerInput.trim()) return
    const ok = importXERFile(xerInput)
    if (ok) {
      toast({ type: 'success', title: 'Primavera P6 Content Imported', message: 'Schedule activities updated.' })
      setIsImportModalOpen(false)
      setXerInput('')
    } else {
      toast({ type: 'error', title: 'Import Failed', message: 'Invalid XER format.' })
    }
  }

  const filtered = projectActivities.filter(a => {
    if (disciplineFilter !== 'all' && a.discipline !== disciplineFilter) return false
    if (levelFilter !== 'all' && a.wbsLevel !== levelFilter) return false
    if (filter === 'critical') return a.isCritical
    if (filter === 'delayed') return a.status === 'delayed'
    if (filter === 'in_progress') return a.status === 'in_progress'
    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Multi-Discipline Schedule & CPM Engine</h1>
            <Badge variant="info" size="sm">L1–L6 WBS Cascading</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time critical path recalculation, discipline-wise float analysis, and Oracle Primavera P6 (.XER) / MS Project interoperability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleRecalculate} icon={<RefreshCw size={14} />}>
            Recalculate CPM
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsImportModalOpen(true)} icon={<Upload size={14} />}>
            Import .XER
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV} icon={<FileSpreadsheet size={14} />}>
            CSV
          </Button>
          <Button size="sm" variant="primary" onClick={handleExportXER} icon={<Download size={14} />}>
            Export P6 (.XER)
          </Button>
        </div>
      </div>

      {/* Discipline & Level Filter Bar */}
      <div className="space-y-2.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter size={12} /> Discipline:
            </span>
            {DISCIPLINES.map(d => (
              <button
                key={d.id}
                onClick={() => setDisciplineFilter(d.id)}
                className={clsx(
                  'px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all',
                  disciplineFilter === d.id
                    ? 'bg-oil-600 text-white border-oil-500 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">WBS Level:</span>
            {(['all', 'L5', 'L6'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={clsx(
                  'px-2 py-0.5 text-xs rounded-md font-mono font-bold border transition-all',
                  levelFilter === lvl
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                )}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle + Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {(['list', 'gantt', 'wbs'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-md font-semibold transition-all',
                  view === v ? 'bg-oil-600 text-white shadow' : 'text-slate-400 hover:text-white'
                )}
              >
                {v === 'list' ? 'Activity List' : v === 'gantt' ? 'Gantt Timeline' : 'WBS Hierarchy'}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'critical', 'delayed', 'in_progress'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-full border transition-all font-medium',
                  filter === f
                    ? 'border-oil-500/60 bg-oil-500/15 text-oil-300'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                )}
              >
                {f === 'all' ? 'All Statuses' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Side: Schedule Content (List / Gantt / WBS) */}
        <div className="lg:col-span-8 space-y-3">
          {view === 'list' && (
            <div className="space-y-2.5">
              {filtered.map(activity => {
                const isSelected = selectedActivity?.id === activity.id
                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className={clsx(
                      'p-4 rounded-xl border cursor-pointer transition-all',
                      isSelected
                        ? 'border-oil-500/60 bg-oil-500/10 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {statusIcon(activity.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-oil-300 border border-slate-700">
                              {activity.wbsLevel}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {activity.discipline}
                            </span>
                            <p className="text-sm font-bold text-white truncate">{activity.name}</p>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {activity.activityId} · WBS {activity.wbsCode} · Float: <strong className={activity.isCritical ? 'text-red-400' : 'text-emerald-400'}>{activity.totalFloat ?? 0}d</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {activity.isCritical && (
                          <Badge variant="danger" size="sm">Critical Path</Badge>
                        )}
                        <Badge variant={statusVariant(activity.status)} size="sm">
                          {activity.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <ProgressBar
                      planned={activity.plannedProgress}
                      actual={activity.actualProgress}
                      height="sm"
                      showLabels={true}
                    />

                    <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Planned Window</span>
                        <span className="font-mono text-slate-300">{activity.plannedStart}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Actual Start</span>
                        <span className="font-mono text-emerald-400 font-semibold">{activity.actualStart || '--'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Progress Qty</span>
                        <span className="text-slate-300">{activity.completedQuantity.toLocaleString()} / {activity.totalQuantity.toLocaleString()} {activity.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Remaining Float</span>
                        <span className={clsx('font-bold', activity.remainingDuration > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                          {activity.remainingDuration}d
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {view === 'gantt' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Multi-Discipline CPM Gantt Timeline</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-3 h-2 bg-slate-600 inline-block rounded-sm" /> Planned</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-2 bg-oil-500 inline-block rounded-sm" /> Actual</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-500 inline-block rounded-sm" /> Critical Path</span>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-4">
                {filtered.map(act => (
                  <div key={act.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-bold flex items-center gap-1.5 truncate max-w-xs">
                        {act.isCritical && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                        <span className="text-[10px] text-oil-400 font-mono">[{act.wbsLevel}]</span>
                        {act.activityId}: {act.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {act.plannedStart} → {act.plannedFinish}
                      </span>
                    </div>

                    <div className="h-6 bg-slate-800 rounded-md overflow-hidden relative border border-slate-700/60 flex items-center">
                      <div
                        className="h-full bg-slate-700/50 absolute left-0"
                        style={{ width: `${act.plannedProgress}%` }}
                      />
                      <div
                        className={clsx('h-full absolute left-0 transition-all', act.isCritical ? 'bg-red-500/80' : 'bg-oil-500/80')}
                        style={{ width: `${act.actualProgress}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-semibold text-white">
                        <span>{act.actualProgress}% actual ({act.discipline})</span>
                        <span>Float: {act.totalFloat ?? 0}d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {view === 'wbs' && (
            <Card>
              <CardBody className="py-4 space-y-2">
                {rootNodes.map(node => (
                  <div key={node.id} className="space-y-1">
                    <div
                      className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg cursor-pointer hover:bg-slate-800"
                      onClick={() => toggleNode(node.id)}
                    >
                      {expandedIds.has(node.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="font-mono text-xs text-oil-400 font-bold">{node.wbsCode}</span>
                      <span className="text-sm font-bold text-white">{node.name}</span>
                    </div>
                    {expandedIds.has(node.id) && (
                      <div className="pl-6 space-y-1">
                        {projectActivities.filter(a => a.wbsCode.startsWith(node.wbsCode)).map(a => (
                          <div
                            key={a.id}
                            onClick={() => setSelectedActivity(a)}
                            className="p-2 border-l-2 border-slate-700 hover:border-oil-500 bg-slate-900/30 rounded flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span className="text-slate-300 font-medium">[{a.wbsLevel}] {a.activityId}: {a.name} ({a.discipline})</span>
                            <Badge variant={statusVariant(a.status)} size="sm">{a.actualProgress}%</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Side: Activity Detail Inspector */}
        <div className="lg:col-span-4">
          {selectedActivity ? (
            <Card className="sticky top-20 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Activity Inspector</p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-oil-500/20 text-oil-300 border border-oil-500/30">
                      {selectedActivity.wbsLevel}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {selectedActivity.isCritical && <Badge variant="danger" size="sm">Critical Path</Badge>}
                    <Badge variant={statusVariant(selectedActivity.status)} size="sm">
                      {selectedActivity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white leading-snug">{selectedActivity.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedActivity.activityId} · WBS {selectedActivity.wbsCode}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {selectedActivity.discipline}
                    </span>
                  </div>
                </div>

                <ProgressBar
                  planned={selectedActivity.plannedProgress}
                  actual={selectedActivity.actualProgress}
                  height="md"
                  showLabels={true}
                />

                {/* Field Jargon Bridges */}
                {selectedActivity.fieldJargonSynonyms && selectedActivity.fieldJargonSynonyms.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 mb-1">
                      <Tag size={11} className="text-oil-400" /> Recognized Field Jargon:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedActivity.fieldJargonSynonyms.map((jargon, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-oil-300 border border-slate-700">
                          "{jargon}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CPM & Float Statistics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Planned Start', value: selectedActivity.plannedStart },
                    { label: 'Actual Start', value: selectedActivity.actualStart || 'Not started' },
                    { label: 'Planned Finish', value: selectedActivity.plannedFinish },
                    { label: 'Actual Finish', value: selectedActivity.actualFinish || 'In progress' },
                    { label: 'Total Float (TF)', value: `${selectedActivity.totalFloat ?? 0} days` },
                    { label: 'Free Float (FF)', value: `${selectedActivity.freeFloat ?? 0} days` },
                    { label: 'Total Planned Qty', value: `${selectedActivity.totalQuantity.toLocaleString()} ${selectedActivity.unit}` },
                    { label: 'Verified Actual Qty', value: `${selectedActivity.completedQuantity.toLocaleString()} ${selectedActivity.unit}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/50">
                      <p className="text-slate-500 text-[10px] uppercase font-semibold">{label}</p>
                      <p className="text-slate-200 font-bold font-mono mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Sub-Activities (L6 Micro Tasks) if present */}
                {selectedActivity.subActivities && selectedActivity.subActivities.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-3 text-xs space-y-2 border border-slate-700/50">
                    <p className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                      <CheckSquare size={12} className="text-oil-400" /> Executable L6 Sub-Tasks:
                    </p>
                    <div className="space-y-1.5">
                      {selectedActivity.subActivities.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between text-[11px] p-1.5 bg-slate-900/60 rounded border border-slate-800">
                          <span className={clsx(sub.completed ? 'line-through text-slate-500' : 'text-slate-200')}>
                            {sub.name}
                          </span>
                          <span className={clsx('font-bold', sub.completed ? 'text-emerald-400' : 'text-amber-400')}>
                            {sub.completed ? '✓ Completed' : `${sub.quantity} units`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <Card className="text-center py-20 text-slate-500">
              <CardBody>
                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an activity to view CPM & Float details.</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* XER Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-oil-500/40 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-oil-400" />
                  <p className="text-sm font-bold text-white">Import Oracle Primavera P6 (.XER)</p>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 hover:border-oil-500 rounded-xl p-6 text-center cursor-pointer bg-slate-800/30 transition-all"
              >
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-200">Click to upload .XER file from Oracle Primavera</p>
                <p className="text-[10px] text-slate-500 mt-1">Parses PROJECT, PROJWBS, TASK, and TASKPRED tables</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xer,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Or Paste .XER Text Content Directly</label>
                <textarea
                  value={xerInput}
                  onChange={e => setXerInput(e.target.value)}
                  placeholder="ERMHDR 8.0 ... %T PROJECT ... %T TASK ..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setIsImportModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handlePasteImport} disabled={!xerInput.trim()}>
                  Parse & Load Schedule
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
