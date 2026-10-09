import type { P6Activity, SimulationScenario, SimulationResult } from '@/types'
import { addDays, parseISO, format, differenceInDays, max as dateMax, min as dateMin } from 'date-fns'

/**
 * Recalculate CPM Schedule (Forward & Backward Pass)
 * Computes Early Start/Finish, Late Start/Finish, Total Float, and Critical Path
 */
export function calculateCPM(activities: P6Activity[]): P6Activity[] {
  if (!activities || activities.length === 0) return []

  const actMap = new Map<string, P6Activity>()
  activities.forEach(a => actMap.set(a.id, { ...a }))

  // Build adjacency graph
  const inDegree = new Map<string, number>()
  const outgoing = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()

  activities.forEach(a => {
    inDegree.set(a.id, 0)
    outgoing.set(a.id, [])
    incoming.set(a.id, [])
  })

  activities.forEach(a => {
    a.predecessors.forEach(predId => {
      if (actMap.has(predId)) {
        outgoing.get(predId)?.push(a.id)
        incoming.get(a.id)?.push(predId)
        inDegree.set(a.id, (inDegree.get(a.id) || 0) + 1)
      }
    })
  })

  // Topological sorting using Kahn's algorithm
  const queue: string[] = []
  activities.forEach(a => {
    if ((inDegree.get(a.id) || 0) === 0) {
      queue.push(a.id)
    }
  })

  const topoOrder: string[] = []
  const tempInDegree = new Map(inDegree)

  while (queue.length > 0) {
    const u = queue.shift()!
    topoOrder.push(u)

    outgoing.get(u)?.forEach(v => {
      const deg = (tempInDegree.get(v) || 0) - 1
      tempInDegree.set(v, deg)
      if (deg === 0) queue.push(v)
    })
  }

  // Include any remaining activities if cycles existed
  if (topoOrder.length < activities.length) {
    activities.forEach(a => {
      if (!topoOrder.includes(a.id)) topoOrder.push(a.id)
    })
  }

  // ─── 1. Forward Pass (Early Start & Early Finish) ──────────────────────────
  topoOrder.forEach(id => {
    const act = actMap.get(id)!
    const preds = incoming.get(id) || []

    let esDate = parseISO(act.plannedStart)

    if (preds.length > 0) {
      const predFinishDates = preds
        .map(pId => actMap.get(pId)?.earlyFinish)
        .filter(Boolean)
        .map(dStr => parseISO(dStr!))

      if (predFinishDates.length > 0) {
        const latestPredFinish = dateMax(predFinishDates)
        if (latestPredFinish > esDate) {
          esDate = addDays(latestPredFinish, 1)
        }
      }
    }

    const duration = Math.max(1, act.remainingDuration > 0 ? act.remainingDuration : act.plannedDuration)
    const efDate = addDays(esDate, duration - 1)

    act.earlyStart = format(esDate, 'yyyy-MM-dd')
    act.earlyFinish = format(efDate, 'yyyy-MM-dd')
  })

  // ─── 2. Backward Pass (Late Start & Late Finish) ───────────────────────────
  // Find project end date
  const allEfDates = Array.from(actMap.values())
    .map(a => parseISO(a.earlyFinish || a.plannedFinish))
  const projectEndDate = allEfDates.length > 0 ? dateMax(allEfDates) : new Date()

  const reverseTopo = [...topoOrder].reverse()

  reverseTopo.forEach(id => {
    const act = actMap.get(id)!
    const succs = outgoing.get(id) || []

    let lfDate = projectEndDate

    if (succs.length > 0) {
      const succStartDates = succs
        .map(sId => actMap.get(sId)?.lateStart)
        .filter(Boolean)
        .map(dStr => parseISO(dStr!))

      if (succStartDates.length > 0) {
        const earliestSuccStart = dateMin(succStartDates)
        lfDate = addDays(earliestSuccStart, -1)
      }
    }

    const duration = Math.max(1, act.remainingDuration > 0 ? act.remainingDuration : act.plannedDuration)
    const lsDate = addDays(lfDate, -(duration - 1))

    act.lateFinish = format(lfDate, 'yyyy-MM-dd')
    act.lateStart = format(lsDate, 'yyyy-MM-dd')

    // Float = LS - ES (in days)
    const es = parseISO(act.earlyStart!)
    const ls = parseISO(act.lateStart!)
    act.totalFloat = Math.max(0, differenceInDays(ls, es))
    act.isCritical = act.totalFloat === 0
  })

  return Array.from(actMap.values())
}

/**
 * Interactive What-If Delay Propagation Simulator
 * Injects a delay on a specific activity and computes downstream ripple effects
 */
export function simulateDelayImpact(
  activities: P6Activity[],
  scenario: SimulationScenario
): SimulationResult {
  const baseCPM = calculateCPM(activities)
  const target = baseCPM.find(a => a.id === scenario.targetActivityId)

  if (!target) {
    const origEnd = baseCPM.map(a => a.earlyFinish || a.plannedFinish).sort().pop() || ''
    return {
      scenarioId: scenario.id,
      targetActivityId: scenario.targetActivityId,
      originalEndDate: origEnd,
      simulatedEndDate: origEnd,
      totalSlippageDays: 0,
      criticalPathChanged: false,
      costImpactINR: 0,
      affectedActivities: []
    }
  }

  // Clone activities and apply scenario modifications
  const modifiedActivities = baseCPM.map(a => {
    if (a.id === scenario.targetActivityId) {
      const adjustedDuration = Math.max(1, Math.round((a.plannedDuration + scenario.delayDays) / Math.max(0.1, scenario.productivityModifier)))
      return {
        ...a,
        plannedDuration: adjustedDuration,
        remainingDuration: Math.max(1, a.remainingDuration + scenario.delayDays)
      }
    }
    return { ...a }
  })

  const simulatedCPM = calculateCPM(modifiedActivities)

  // Find original & simulated project completion date
  const origEndStr = baseCPM.map(a => a.earlyFinish || a.plannedFinish).sort().pop() || ''
  const simEndStr = simulatedCPM.map(a => a.earlyFinish || a.plannedFinish).sort().pop() || ''

  const origEnd = parseISO(origEndStr)
  const simEnd = parseISO(simEndStr)
  const totalSlippage = Math.max(0, differenceInDays(simEnd, origEnd))

  // Estimate financial burn rate impact (Standard Oil Pipeline average per-day overhead ~ ₹4,50,000 / day)
  const costImpactINR = totalSlippage * 450000

  // Check if critical path changed
  const origCP = new Set(baseCPM.filter(a => a.isCritical).map(a => a.id))
  const simCP = new Set(simulatedCPM.filter(a => a.isCritical).map(a => a.id))
  const criticalPathChanged = origCP.size !== simCP.size || [...origCP].some(id => !simCP.has(id))

  // Collect affected activities with shift
  const affectedActivities = simulatedCPM
    .map(sim => {
      const orig = baseCPM.find(b => b.id === sim.id)!
      const simEf = parseISO(sim.earlyFinish || sim.plannedFinish)
      const origEf = parseISO(orig.earlyFinish || orig.plannedFinish)
      const delay = differenceInDays(simEf, origEf)

      return {
        activityId: sim.id,
        name: sim.name,
        originalStart: orig.earlyStart || orig.plannedStart,
        simulatedStart: sim.earlyStart || sim.plannedStart,
        originalFinish: orig.earlyFinish || orig.plannedFinish,
        simulatedFinish: sim.earlyFinish || sim.plannedFinish,
        delayDays: delay,
        isCritical: sim.isCritical
      }
    })
    .filter(item => item.delayDays > 0 || item.activityId === scenario.targetActivityId)

  return {
    scenarioId: scenario.id,
    targetActivityId: scenario.targetActivityId,
    originalEndDate: origEndStr,
    simulatedEndDate: simEndStr,
    totalSlippageDays: totalSlippage,
    criticalPathChanged,
    costImpactINR,
    affectedActivities
  }
}
