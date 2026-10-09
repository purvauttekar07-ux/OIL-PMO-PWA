import { useState, useCallback, createContext, useContext } from 'react'
import type {
  Project, P6Activity, Alert, AIProcessingResult, DPREntry, User,
  AnomalyReport, AuditLogEntry, SimulationScenario, SimulationResult,
  UnmatchedActivity, BatchSpreadsheetResult, TimeAgentMessage, EngineeringDiscipline
} from '@/types'
import {
  MOCK_PROJECTS, MOCK_ACTIVITIES, MOCK_ALERTS,
  MOCK_AI_RESULTS, MOCK_DPR_ENTRIES, CURRENT_USER,
  MOCK_ANOMALIES, MOCK_AUDIT_LOGS, MOCK_WBS,
  MOCK_UNMATCHED_ACTIVITIES
} from '@/lib/mockData'
import { saveDPREntry } from '@/lib/db'
import { processWithAI } from '@/lib/nlpMatcher'
import { extractWithGemini } from '@/lib/geminiExtractor'
import { extractWithBackend, isBackendAlive } from '@/lib/backendExtractor'
import { calculateCPM, simulateDelayImpact } from '@/lib/cpmEngine'
import { parseXER, exportToXER, exportToCSV } from '@/lib/xerParser'
import { detectAnomalies } from '@/lib/anomalyDetector'
import React from 'react'

const INITIAL_TIME_AGENT_MESSAGES: TimeAgentMessage[] = [
  {
    id: 'msg_0',
    sender: 'agent',
    text: 'Namaskar! I am Nirman Setu Time Agent. You can speak or type in English, Hindi, or Assamese to log actual progress, start/finish times, and workforce. For example: "Completed 2 spools erected for Line 24 at Unit 101, 14 fitters, 08:30 to 16:30."',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
]

interface AppState {
  user: User
  projects: Project[]
  activities: P6Activity[]
  alerts: Alert[]
  aiResults: AIProcessingResult[]
  dprEntries: DPREntry[]
  anomalies: AnomalyReport[]
  auditLogs: AuditLogEntry[]
  unmatchedActivities: UnmatchedActivity[]
  timeAgentMessages: TimeAgentMessage[]
  isOnline: boolean
  pendingSyncCount: number
  selectedProjectId: string
  darkMode: boolean
  geminiApiKey: string
  simulationResult: SimulationResult | null
}

interface AppActions {
  setSelectedProject: (id: string) => void
  toggleDarkMode: () => void
  setGeminiApiKey: (key: string) => void
  submitDPR: (entry: Omit<DPREntry, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<AIProcessingResult>
  approveAIResult: (id: string, notes?: string) => void
  rejectAIResult: (id: string, notes?: string) => void
  reassignAIResult: (id: string, newActivityId: string) => void
  resolveUnmatchedActivity: (id: string, action: 'link' | 'promote' | 'reject', targetActivityId?: string, notes?: string) => void
  importSpreadsheetBatch: (batch: BatchSpreadsheetResult) => void
  sendTimeAgentMessage: (text: string) => Promise<TimeAgentMessage>
  applyScheduleUpdateFromTimeAgent: (preview: NonNullable<TimeAgentMessage['scheduleUpdatePreview']>) => void
  markAlertRead: (id: string) => void
  updateActivityProgress: (activityId: string, progress: number, quantity: number) => void
  runCPMRecalculation: () => void
  runWhatIfSimulation: (scenario: SimulationScenario) => SimulationResult
  resolveAnomaly: (id: string, resolutionNotes: string) => void
  dismissAnomaly: (id: string) => void
  importXERFile: (xerContent: string) => boolean
  exportCurrentXER: () => string
  exportCurrentCSV: () => string
  setOnline: (online: boolean) => void
  switchUserRole: (userId: string) => void
}

export type AppStore = AppState & AppActions

function createInitialState(): AppState {
  const initialCPM = calculateCPM(MOCK_ACTIVITIES)
  const savedApiKey = typeof window !== 'undefined' ? localStorage.getItem('nirman_gemini_key') || '' : ''

  return {
    user: CURRENT_USER,
    projects: MOCK_PROJECTS,
    activities: initialCPM,
    alerts: MOCK_ALERTS,
    aiResults: MOCK_AI_RESULTS,
    dprEntries: MOCK_DPR_ENTRIES,
    anomalies: MOCK_ANOMALIES,
    auditLogs: MOCK_AUDIT_LOGS,
    unmatchedActivities: MOCK_UNMATCHED_ACTIVITIES,
    timeAgentMessages: INITIAL_TIME_AGENT_MESSAGES,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingSyncCount: 0,
    selectedProjectId: 'p1',
    darkMode: true,
    geminiApiKey: savedApiKey,
    simulationResult: null,
  }
}

const StoreContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState)

  const addAuditLog = useCallback((
    action: AuditLogEntry['action'],
    entityId: string,
    entityType: AuditLogEntry['entityType'],
    details: string,
    oldValue?: string | null,
    newValue?: string | null,
    confidence?: number,
    discipline?: EngineeringDiscipline
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: state.user.id,
      userName: state.user.name,
      userRole: state.user.role,
      discipline,
      action,
      entityId,
      entityType,
      details,
      oldValue,
      newValue,
      confidence
    }
    setState(s => ({ ...s, auditLogs: [newEntry, ...s.auditLogs] }))
  }, [state.user])

  const setSelectedProject = useCallback((id: string) => {
    setState(s => ({ ...s, selectedProjectId: id }))
  }, [])

  const toggleDarkMode = useCallback(() => {
    setState(s => {
      const next = !s.darkMode
      document.documentElement.classList.toggle('dark', next)
      return { ...s, darkMode: next }
    })
  }, [])

  const setGeminiApiKey = useCallback((key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nirman_gemini_key', key)
    }
    setState(s => ({ ...s, geminiApiKey: key }))
  }, [])

  const switchUserRole = useCallback((userId: string) => {
    const newUser = [
      { id: 'u1', name: 'Rajesh Borah', role: 'field_supervisor' as const, projectIds: ['p1', 'p2'] },
      { id: 'u2', name: 'Priya Gogoi', role: 'planner' as const, projectIds: ['p1', 'p2', 'p3'] },
      { id: 'u3', name: 'Amit Sharma', role: 'pmo_manager' as const, projectIds: ['p1', 'p2', 'p3'] },
      { id: 'u4', name: 'Dipankar Das', role: 'site_engineer' as const, projectIds: ['p1'] },
    ].find(u => u.id === userId)
    if (newUser) {
      setState(s => ({ ...s, user: newUser }))
    }
  }, [])

  const runCPMRecalculation = useCallback(() => {
    setState(s => {
      const updatedCPM = calculateCPM(s.activities)
      return { ...s, activities: updatedCPM }
    })
    addAuditLog('cpm_recalculated', state.selectedProjectId, 'schedule', 'Recalculated Critical Path & Floats across all WBS activities.')
  }, [addAuditLog, state.selectedProjectId])

  const runWhatIfSimulation = useCallback((scenario: SimulationScenario): SimulationResult => {
    const result = simulateDelayImpact(state.activities, scenario)
    setState(s => ({ ...s, simulationResult: result }))
    return result
  }, [state.activities])

  const submitDPR = useCallback(async (
    entry: Omit<DPREntry, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
  ): Promise<AIProcessingResult> => {
    const id = `dpr_${Date.now()}`
    const now = new Date().toISOString()
    const full: DPREntry = {
      ...entry,
      id,
      syncStatus: navigator.onLine ? 'synced' : 'pending',
      createdAt: now,
      updatedAt: now,
    }

    try { await saveDPREntry(full) } catch (_) { /* IndexedDB fallback */ }

    // Run AI entity extraction: Backend SBERT+RapidFuzz > Gemini > local fallback
    let aiResult: AIProcessingResult
    const backendUp = await isBackendAlive()
    if (backendUp) {
      try {
        aiResult = await extractWithBackend(entry.rawText, entry.projectId, entry.date, entry.gps ? `${entry.gps.lat.toFixed(4)}, ${entry.gps.lng.toFixed(4)}` : undefined)
        aiResult.dprEntryId = id
      } catch {
        if (state.geminiApiKey) {
          aiResult = await extractWithGemini(entry.rawText, entry.projectId, state.activities, state.geminiApiKey)
          aiResult.dprEntryId = id
        } else {
          aiResult = processWithAI(id, entry.rawText, entry.projectId, entry.date, entry.gps ? `${entry.gps.lat.toFixed(4)}, ${entry.gps.lng.toFixed(4)}` : undefined)
        }
      }
    } else if (state.geminiApiKey) {
      aiResult = await extractWithGemini(entry.rawText, entry.projectId, state.activities, state.geminiApiKey)
      aiResult.dprEntryId = id
    } else {
      aiResult = processWithAI(
        id, entry.rawText, entry.projectId,
        entry.date, entry.gps ? `${entry.gps.lat.toFixed(4)}, ${entry.gps.lng.toFixed(4)}` : undefined
      )
    }

    // Auto-detect anomalies in real-time
    const detectedAnomalies = detectAnomalies([full, ...state.dprEntries], state.activities, entry.projectId)

    // Check if entry is completely unmatched (< 45% confidence)
    const isUnmatched = aiResult.topMatch.confidence < 0.45

    setState(s => {
      let activities = s.activities
      // Auto-apply if confidence >= 90%
      if (aiResult.status === 'approved' && aiResult.extractedData.quantity && aiResult.topMatch.activityId) {
        activities = s.activities.map(a => {
          if (a.id === aiResult.topMatch.activityId && aiResult.extractedData.quantity) {
            const newCompleted = Math.min(a.completedQuantity + aiResult.extractedData.quantity, a.totalQuantity)
            const newProgress = Math.round((newCompleted / a.totalQuantity) * 100)
            return {
              ...a,
              completedQuantity: newCompleted,
              actualProgress: newProgress,
              status: newProgress >= 100 ? 'completed' : 'in_progress',
              remainingDuration: Math.max(0, Math.round(a.plannedDuration * (1 - newProgress / 100))),
              actualStart: a.actualStart ?? entry.date
            }
          }
          return a
        })
        activities = calculateCPM(activities)
      }

      // If unmatched, also route to Unmatched Activities Queue
      let newUnmatched = s.unmatchedActivities
      if (isUnmatched) {
        const item: UnmatchedActivity = {
          id: `unm_${Date.now()}`,
          dprEntryId: id,
          reportedText: entry.rawText,
          discipline: aiResult.extractedData.discipline || 'civil',
          extractedQuantity: aiResult.extractedData.quantity,
          extractedUnit: aiResult.extractedData.unit,
          extractedLocation: aiResult.extractedData.location,
          status: 'pending_review',
          submittedBy: `${s.user.name} (${s.user.role})`,
          createdAt: now
        }
        newUnmatched = [item, ...newUnmatched]
      }

      return {
        ...s,
        dprEntries: [full, ...s.dprEntries],
        aiResults: [aiResult, ...s.aiResults],
        anomalies: [...detectedAnomalies, ...s.anomalies.filter(a => !detectedAnomalies.some(d => d.id === a.id))],
        activities,
        unmatchedActivities: newUnmatched,
        pendingSyncCount: navigator.onLine ? s.pendingSyncCount : s.pendingSyncCount + 1,
      }
    })

    addAuditLog(
      aiResult.status === 'approved' ? 'ai_auto_applied' : 'dpr_submitted',
      id,
      'dpr',
      isUnmatched
        ? `Field report flagged to Unmatched Queue: "${entry.rawText.slice(0, 80)}…"`
        : `Submitted DPR via ${entry.inputMethod}. AI matched to "${aiResult.topMatch.activityName}" with ${Math.round(aiResult.topMatch.confidence * 100)}% confidence.`,
      null,
      aiResult.extractedData.quantity ? `${aiResult.extractedData.quantity} ${aiResult.extractedData.unit ?? ''}` : null,
      aiResult.topMatch.confidence,
      aiResult.extractedData.discipline || undefined
    )

    return aiResult
  }, [state.geminiApiKey, state.activities, state.dprEntries, addAuditLog])

  const approveAIResult = useCallback((id: string, notes?: string) => {
    setState(s => {
      const updated = s.aiResults.map(r =>
        r.id === id
          ? { ...r, status: 'approved' as const, reviewedBy: s.user.id, reviewedAt: new Date().toISOString(), reviewNotes: notes ?? null }
          : r
      )
      const result = updated.find(r => r.id === id)
      let activities = s.activities

      if (result?.extractedData.quantity && result.topMatch.activityId) {
        activities = s.activities.map(a => {
          if (a.id === result.topMatch.activityId && result.extractedData.quantity) {
            const newCompleted = Math.min(a.completedQuantity + result.extractedData.quantity, a.totalQuantity)
            const newProgress = Math.round((newCompleted / a.totalQuantity) * 100)
            return {
              ...a,
              completedQuantity: newCompleted,
              actualProgress: newProgress,
              status: newProgress >= 100 ? 'completed' : 'in_progress',
              remainingDuration: Math.max(0, Math.round(a.plannedDuration * (1 - newProgress / 100))),
              actualStart: a.actualStart ?? new Date().toISOString().split('T')[0]
            }
          }
          return a
        })
        activities = calculateCPM(activities)
      }

      return { ...s, aiResults: updated, activities }
    })

    const targetResult = state.aiResults.find(r => r.id === id)
    addAuditLog(
      'planner_approved',
      id,
      'activity',
      `Planner approved actuals for ${targetResult?.topMatch.activityName || 'Activity'}. Applied to P6 schedule baseline. ${notes ? `Notes: ${notes}` : ''}`,
      null,
      targetResult?.extractedData.quantity ? `${targetResult.extractedData.quantity} ${targetResult.extractedData.unit}` : null,
      targetResult?.topMatch.confidence,
      targetResult?.topMatch.discipline
    )
  }, [state.aiResults, addAuditLog])

  const rejectAIResult = useCallback((id: string, notes?: string) => {
    setState(s => ({
      ...s,
      aiResults: s.aiResults.map(r =>
        r.id === id
          ? { ...r, status: 'rejected' as const, reviewedBy: s.user.id, reviewedAt: new Date().toISOString(), reviewNotes: notes ?? null }
          : r
      ),
    }))
    addAuditLog('planner_rejected', id, 'dpr', `Planner rejected DPR entry. Reason: ${notes || 'Not specified'}`)
  }, [addAuditLog])

  const reassignAIResult = useCallback((id: string, newActivityId: string) => {
    setState(s => {
      const activity = s.activities.find(a => a.id === newActivityId)
      if (!activity) return s
      return {
        ...s,
        aiResults: s.aiResults.map(r =>
          r.id === id
            ? {
                ...r,
                topMatch: {
                  ...r.topMatch,
                  activityId: newActivityId,
                  activityName: activity.name,
                  activityCode: activity.activityId,
                  discipline: activity.discipline,
                  wbsLevel: activity.wbsLevel,
                  confidence: 1,
                  confidenceLevel: 'high' as const,
                  reasoning: 'Manually reassigned by project planning engineer.',
                },
                status: 'approved' as const,
                reviewedBy: s.user.id,
                reviewedAt: new Date().toISOString(),
              }
            : r
        ),
      }
    })
    addAuditLog('activity_reassigned', id, 'activity', `Reassigned DPR match to activity ${newActivityId}`)
  }, [addAuditLog])

  // Resolve Unmatched Activity from Planner Review Queue
  const resolveUnmatchedActivity = useCallback((
    id: string,
    action: 'link' | 'promote' | 'reject',
    targetActivityId?: string,
    notes?: string
  ) => {
    setState(s => {
      const item = s.unmatchedActivities.find(u => u.id === id)
      if (!item) return s

      let activities = s.activities

      if (action === 'link' && targetActivityId) {
        const act = activities.find(a => a.id === targetActivityId)
        if (act && item.extractedQuantity) {
          activities = activities.map(a => {
            if (a.id === targetActivityId) {
              const newCompleted = Math.min(a.completedQuantity + (item.extractedQuantity || 0), a.totalQuantity)
              const newProgress = Math.round((newCompleted / a.totalQuantity) * 100)
              return {
                ...a,
                completedQuantity: newCompleted,
                actualProgress: newProgress,
                status: newProgress >= 100 ? 'completed' : 'in_progress',
              }
            }
            return a
          })
          activities = calculateCPM(activities)
        }
      } else if (action === 'promote') {
        // Promote into a new L6 micro-activity node under the baseline schedule!
        const newActId = `act_l6_${Date.now()}`
        const codeNum = activities.length + 1
        const newL6Activity: P6Activity = {
          id: newActId,
          activityId: `A${3000 + codeNum}`,
          projectId: s.selectedProjectId,
          wbsId: item.suggestedParentWbsId || 'w3',
          wbsCode: '1.2.9',
          name: `[Field L6] ${item.reportedText.slice(0, 60)}`,
          discipline: item.discipline,
          wbsLevel: 'L6',
          granularity: 'micro',
          keywords: [item.discipline, 'field-addition'],
          plannedStart: new Date().toISOString().split('T')[0],
          plannedFinish: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          actualStart: new Date().toISOString().split('T')[0],
          actualFinish: null,
          plannedDuration: 7,
          remainingDuration: 7,
          plannedProgress: 100,
          actualProgress: 50,
          status: 'in_progress',
          isCritical: false,
          predecessors: [],
          successors: [],
          unit: item.extractedUnit || 'nos',
          totalQuantity: item.extractedQuantity || 1,
          completedQuantity: (item.extractedQuantity || 1) * 0.5,
          location: item.extractedLocation || 'Site',
          budgetCost: 500000,
          actualCost: 250000
        }
        activities = calculateCPM([...activities, newL6Activity])
      }

      const updatedUnmatched = s.unmatchedActivities.map(u =>
        u.id === id
          ? {
              ...u,
              status: action === 'link' ? 'linked_existing' as const : action === 'promote' ? 'promoted_new_l6' as const : 'rejected' as const,
              resolvedActivityId: targetActivityId,
              plannerNotes: notes
            }
          : u
      )

      return {
        ...s,
        activities,
        unmatchedActivities: updatedUnmatched
      }
    })

    addAuditLog(
      action === 'promote' ? 'unmatched_promoted_l6' : action === 'link' ? 'activity_reassigned' : 'planner_rejected',
      id,
      'unmatched_queue',
      `Planner resolved unmatched field entry: ${action.toUpperCase()}. ${notes ? `Notes: ${notes}` : ''}`
    )
  }, [addAuditLog])

  // Batch Spreadsheet Ingest
  const importSpreadsheetBatch = useCallback((batch: BatchSpreadsheetResult) => {
    setState(s => {
      let activities = s.activities
      const newUnmatched: UnmatchedActivity[] = []

      batch.rows.forEach(row => {
        if (row.status === 'matched' && row.matchedActivityId && row.quantity) {
          activities = activities.map(a => {
            if (a.id === row.matchedActivityId) {
              const newCompleted = Math.min(a.completedQuantity + row.quantity, a.totalQuantity)
              const newProgress = Math.round((newCompleted / a.totalQuantity) * 100)
              return {
                ...a,
                completedQuantity: newCompleted,
                actualProgress: newProgress,
                status: newProgress >= 100 ? 'completed' : 'in_progress',
                actualStart: a.actualStart ?? row.date
              }
            }
            return a
          })
        } else if (row.status === 'unmatched') {
          newUnmatched.push({
            id: `unm_batch_${Date.now()}_${row.rowId}`,
            dprEntryId: `batch_${batch.batchId}`,
            reportedText: row.fieldDescription,
            discipline: row.discipline,
            extractedQuantity: row.quantity,
            extractedUnit: row.unit,
            extractedLocation: row.location,
            status: 'pending_review',
            plannerNotes: `Imported from spreadsheet ${batch.fileName} (Unmatched)`,
            submittedBy: `${row.subcontractor} (${s.user.name})`,
            createdAt: new Date().toISOString()
          })
        }
      })

      return {
        ...s,
        activities: calculateCPM(activities),
        unmatchedActivities: [...newUnmatched, ...s.unmatchedActivities]
      }
    })

    addAuditLog(
      'spreadsheet_batch_imported',
      batch.batchId,
      'activity',
      `Imported ${batch.totalRows} rows from "${batch.fileName}". Auto-linked ${batch.matchedCount} rows; routed ${batch.unmatchedCount} unmatched rows to review queue.`,
      null,
      `${batch.matchedCount} matched / ${batch.totalRows} total`,
      0.92,
      batch.discipline
    )
  }, [addAuditLog])

  // Conversational Time Agent Interaction
  const sendTimeAgentMessage = useCallback(async (text: string): Promise<TimeAgentMessage> => {
    const userMsg: TimeAgentMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setState(s => ({
      ...s,
      timeAgentMessages: [...s.timeAgentMessages, userMsg]
    }))

    // Run extraction logic: Backend > Gemini > local
    const today = new Date().toISOString().split('T')[0]
    let aiRes: AIProcessingResult
    const backendUp = await isBackendAlive()
    if (backendUp) {
      try { aiRes = await extractWithBackend(text, state.selectedProjectId, today) } catch {
        if (state.geminiApiKey) aiRes = await extractWithGemini(text, state.selectedProjectId, state.activities, state.geminiApiKey)
        else aiRes = processWithAI(`agent_${Date.now()}`, text, state.selectedProjectId, today)
      }
    } else if (state.geminiApiKey) {
      aiRes = await extractWithGemini(text, state.selectedProjectId, state.activities, state.geminiApiKey)
    } else {
      aiRes = processWithAI(`agent_${Date.now()}`, text, state.selectedProjectId, today)
    }

    const matchedAct = state.activities.find(a => a.id === aiRes.topMatch.activityId)
    const oldProgress = matchedAct?.actualProgress ?? 0
    const qty = aiRes.extractedData.quantity ?? 1
    const totalQty = matchedAct?.totalQuantity ?? 100
    const newProgress = Math.min(100, oldProgress + Math.round((qty / totalQty) * 100))

    let replyText = ''
    if (aiRes.topMatch.confidence >= 0.85 && matchedAct) {
      replyText = `Understood! I matched this to **${matchedAct.activityId} - ${matchedAct.name}** (${matchedAct.discipline.toUpperCase()}) with ${Math.round(aiRes.topMatch.confidence * 100)}% confidence.\n\n` +
        `• Actual Quantity: **${qty} ${aiRes.extractedData.unit || matchedAct.unit}**\n` +
        `• Progress: **${oldProgress}% → ${newProgress}%**\n` +
        (aiRes.extractedData.actualStart ? `• Execution Time: **${aiRes.extractedData.actualStart} to ${aiRes.extractedData.actualEnd || 'end'}**\n` : '') +
        (aiRes.extractedData.workforce ? `• Workforce: **${aiRes.extractedData.workforce} personnel**\n` : '') +
        `\nWould you like to auto-commit this directly to the Primavera P6 schedule baseline?`
    } else if (matchedAct) {
      replyText = `Recorded field note for **${aiRes.extractedData.discipline?.toUpperCase() || 'CIVIL'}**. Potential match is **${matchedAct.name}** (Confidence: ${Math.round(aiRes.topMatch.confidence * 100)}%). Flagged for planner verification.`
    } else {
      replyText = `I have logged your report: "${text.slice(0, 60)}…". Because no existing L5 schedule node directly matches, I have forwarded it to the **Planner Review Queue** so it is not dropped.`
    }

    const agentMsg: TimeAgentMessage = {
      id: `msg_a_${Date.now()}`,
      sender: 'agent',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      extractedEntities: {
        discipline: aiRes.extractedData.discipline || undefined,
        activity: aiRes.topMatch.activityName,
        quantity: aiRes.extractedData.quantity || undefined,
        unit: aiRes.extractedData.unit || undefined,
        location: aiRes.extractedData.location || undefined,
        startTime: aiRes.extractedData.actualStart || undefined,
        endTime: aiRes.extractedData.actualEnd || undefined,
        workforce: aiRes.extractedData.workforce || undefined,
        weather: aiRes.extractedData.weather || undefined,
        matchedActivityCode: aiRes.topMatch.activityCode,
        matchedActivityName: aiRes.topMatch.activityName,
        confidence: aiRes.topMatch.confidence
      },
      scheduleUpdatePreview: matchedAct ? {
        activityId: matchedAct.id,
        activityName: matchedAct.name,
        discipline: matchedAct.discipline,
        oldProgress,
        newProgress,
        actualStart: aiRes.extractedData.actualStart || today,
        actualFinish: newProgress >= 100 ? today : null,
        confidence: aiRes.topMatch.confidence
      } : undefined
    }

    setState(s => ({
      ...s,
      timeAgentMessages: [...s.timeAgentMessages, agentMsg]
    }))

    return agentMsg
  }, [state.geminiApiKey, state.selectedProjectId, state.activities])

  // Apply Schedule Update from Time Agent
  const applyScheduleUpdateFromTimeAgent = useCallback((preview: NonNullable<TimeAgentMessage['scheduleUpdatePreview']>) => {
    setState(s => {
      const updated = s.activities.map(a => {
        if (a.id === preview.activityId) {
          const compQty = Math.round((preview.newProgress / 100) * a.totalQuantity)
          return {
            ...a,
            actualProgress: preview.newProgress,
            completedQuantity: compQty,
            actualStart: a.actualStart ?? preview.actualStart,
            actualFinish: preview.newProgress >= 100 ? (preview.actualFinish ?? null) : a.actualFinish,
            status: preview.newProgress >= 100 ? 'completed' as const : 'in_progress' as const,
            remainingDuration: Math.max(0, Math.round(a.plannedDuration * (1 - preview.newProgress / 100)))
          }
        }
        return a
      })

      const cpm = calculateCPM(updated)
      return { ...s, activities: cpm }
    })

    addAuditLog(
      'time_agent_logged',
      preview.activityId,
      'activity',
      `Auto-applied actual progress (${preview.oldProgress}% → ${preview.newProgress}%) via Conversational Time Agent for ${preview.activityName}.`,
      `${preview.oldProgress}%`,
      `${preview.newProgress}%`,
      preview.confidence,
      preview.discipline
    )
  }, [addAuditLog])

  const resolveAnomaly = useCallback((id: string, resolutionNotes: string) => {
    setState(s => ({
      ...s,
      anomalies: s.anomalies.map(a =>
        a.id === id
          ? { ...a, status: 'resolved' as const, resolutionNotes, resolvedBy: s.user.name }
          : a
      )
    }))
  }, [])

  const dismissAnomaly = useCallback((id: string) => {
    setState(s => ({
      ...s,
      anomalies: s.anomalies.map(a =>
        a.id === id ? { ...a, status: 'dismissed' as const } : a
      )
    }))
  }, [])

  const importXERFile = useCallback((xerContent: string): boolean => {
    try {
      const parsed = parseXER(xerContent)
      if (parsed.activities.length > 0) {
        const cpmActivities = calculateCPM(parsed.activities)
        setState(s => ({
          ...s,
          activities: cpmActivities,
          projects: parsed.projects[0] ? [parsed.projects[0] as Project, ...s.projects] : s.projects,
          selectedProjectId: parsed.projects[0]?.id || s.selectedProjectId
        }))
        addAuditLog('p6_xer_imported', parsed.projects[0]?.id || 'p1', 'schedule', `Imported Primavera P6 XER file with ${parsed.activities.length} activities.`)
        return true
      }
      return false
    } catch (e) {
      console.error('XER import failed:', e)
      return false
    }
  }, [addAuditLog])

  const exportCurrentXER = useCallback((): string => {
    const project = state.projects.find(p => p.id === state.selectedProjectId) || state.projects[0]
    const content = exportToXER(project, state.activities, MOCK_WBS)
    addAuditLog('p6_xer_exported', project.id, 'schedule', `Exported Oracle Primavera P6 .XER schedule.`)
    return content
  }, [state.projects, state.activities, state.selectedProjectId, addAuditLog])

  const exportCurrentCSV = useCallback((): string => {
    return exportToCSV(state.activities)
  }, [state.activities])

  const markAlertRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      alerts: s.alerts.map(a => a.id === id ? { ...a, isRead: true } : a),
    }))
  }, [])

  const updateActivityProgress = useCallback((activityId: string, progress: number, quantity: number) => {
    setState(s => {
      const updated = s.activities.map(a =>
        a.id === activityId
          ? { ...a, actualProgress: progress, completedQuantity: quantity, status: progress >= 100 ? 'completed' as const : 'in_progress' as const }
          : a
      )
      return { ...s, activities: calculateCPM(updated) }
    })
  }, [])

  const setOnline = useCallback((online: boolean) => {
    setState(s => ({ ...s, isOnline: online }))
  }, [])

  const store: AppStore = {
    ...state,
    setSelectedProject,
    toggleDarkMode,
    setGeminiApiKey,
    switchUserRole,
    submitDPR,
    approveAIResult,
    rejectAIResult,
    reassignAIResult,
    resolveUnmatchedActivity,
    importSpreadsheetBatch,
    sendTimeAgentMessage,
    applyScheduleUpdateFromTimeAgent,
    markAlertRead,
    updateActivityProgress,
    runCPMRecalculation,
    runWhatIfSimulation,
    resolveAnomaly,
    dismissAnomaly,
    importXERFile,
    exportCurrentXER,
    exportCurrentCSV,
    setOnline,
  }

  return React.createElement(StoreContext.Provider, { value: store }, children)
}

export function useAppStore(): AppStore {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
