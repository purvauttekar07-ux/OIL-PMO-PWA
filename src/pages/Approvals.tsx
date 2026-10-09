import { useState } from 'react'
import {
  Brain, CheckCircle2, XCircle, RefreshCw, ChevronDown,
  AlertTriangle, Info, Zap, History, ShieldCheck, FileText,
  ArrowRight, PlusCircle, Link, Filter, Layers, CheckSquare
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import { useToast } from '@/hooks/useToast'
import { ChatTrigger } from '@/components/chat/ChatTrigger'
import { useChatPanel } from '@/hooks/useChatPanel'
import type { AIProcessingResult, UnmatchedActivity, EngineeringDiscipline } from '@/types'
import clsx from 'clsx'

export function Approvals() {
  const {
    aiResults,
    unmatchedActivities,
    auditLogs,
    activities,
    dprEntries,
    approveAIResult,
    rejectAIResult,
    reassignAIResult,
    resolveUnmatchedActivity,
  } = useAppStore()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'pending' | 'unmatched' | 'auto_applied' | 'audit'>('pending')
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all')

  // Unmatched modal / state
  const [selectedUnmatchedId, setSelectedUnmatchedId] = useState<string | null>(null)
  const [targetActivityId, setTargetActivityId] = useState<string>(activities[0]?.id || '')
  const [plannerNotes, setPlannerNotes] = useState('')

  const pendingResults = aiResults.filter(r => r.status === 'needs_review')
  const autoAppliedResults = aiResults.filter(r => r.status === 'approved')
  const pendingUnmatched = unmatchedActivities.filter(u => u.status === 'pending_review')

  function handleApprove(id: string, notes?: string) {
    approveAIResult(id, notes)
    toast({
      type: 'success',
      title: 'Actuals Approved & Written to P6',
      message: 'Schedule baseline updated with verified field quantities.'
    })
  }

  function handleReject(id: string, notes?: string) {
    rejectAIResult(id, notes)
    toast({
      type: 'info',
      title: 'DPR Rejected',
      message: 'Entry marked as rejected with planner review notes.'
    })
  }

  function handleResolveUnmatched(id: string, action: 'link' | 'promote' | 'reject') {
    resolveUnmatchedActivity(id, action, targetActivityId, plannerNotes)
    setSelectedUnmatchedId(null)
    setPlannerNotes('')
    toast({
      type: 'success',
      title: action === 'promote' ? 'Promoted to New L6 Activity' : action === 'link' ? 'Linked to Planned Activity' : 'Rejected',
      message: action === 'promote'
        ? 'Created new L6 micro-activity in P6 schedule under WBS.'
        : 'Action logged in audit trail.'
    })
  }

  const { openChat } = useChatPanel()

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-oil-500/20 text-oil-400 font-mono text-[11px] font-bold border border-oil-500/30">
              PLANNER WORKBENCH
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold border border-emerald-500/30">
              Human-in-the-Loop (HITL) Gate
            </span>
            {/* Inline help icon — opens bot explaining HITL */}
            <ChatTrigger
              variant="icon"
              question="What is the approval queue?"
              onOpen={openChat}
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Schedule Linking & Planner Approvals
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Review medium-confidence matches, handle unlinked/micro L6 field additions, and inspect the immutable audit log.
          </p>
          {/* Banner trigger for new planners */}
          <div className="mt-3">
            <ChatTrigger
              variant="banner"
              question="What is the approval queue?"
              label="New to this page? Ask the assistant to explain how approvals work"
              onOpen={openChat}
            />
          </div>
        </div>

        {/* Action Badges */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Awaiting Action</p>
            <p className="text-xl font-bold text-amber-400">
              {pendingResults.length + pendingUnmatched.length} items
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'pending'
              ? 'bg-oil-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          )}
        >
          <span>Pending Verification</span>
          {pendingResults.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
              {pendingResults.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('unmatched')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'unmatched'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          )}
        >
          <span>Unmatched & New Tasks (HITL Queue)</span>
          {pendingUnmatched.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
              {pendingUnmatched.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('auto_applied')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'auto_applied'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          )}
        >
          <span>Auto-Applied Ledger (≥90%)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
            {autoAppliedResults.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          )}
        >
          <History size={14} />
          <span>Immutable Audit Log</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: PENDING MEDIUM CONFIDENCE VERIFICATION
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingResults.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 text-slate-400">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-2" />
              <p className="font-bold text-white text-base">All Pending Matches Cleared!</p>
              <p className="text-xs text-slate-500 mt-1">No medium-confidence DPR matches require review right now.</p>
            </div>
          ) : (
            pendingResults.map(result => {
              const dpr = dprEntries.find(d => d.id === result.dprEntryId)
              return (
                <Card key={result.id} className="border-amber-500/30 bg-slate-900/90 shadow-xl">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">60–84% Confidence</Badge>
                        <span className="text-xs font-mono text-oil-400 font-semibold">{result.topMatch.activityCode}</span>
                        <ChatTrigger
                          variant="icon"
                          question="What is AI confidence?"
                          onOpen={openChat}
                        />
                        {result.extractedData.discipline && (
                          <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                            {result.extractedData.discipline}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{result.topMatch.activityName}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleReject(result.id, 'Planner flagged for site re-measurement')}
                        className="text-xs"
                      >
                        <XCircle size={14} className="text-rose-400" />
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(result.id, 'Planner verified against site inspection')}
                        className="text-xs"
                      >
                        <CheckCircle2 size={14} />
                        Confirm & Update P6
                      </Button>
                    </div>
                  </CardHeader>

                  <CardBody className="space-y-3 text-xs">
                    {/* Raw Text */}
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Supervisor Field Input:
                      </span>
                      <p className="text-slate-200 font-medium">"{dpr?.rawText || result.extractedData.remarks}"</p>
                    </div>

                    {/* AI Reasoning */}
                    <div className="flex items-start gap-2 text-slate-300 p-2.5 rounded-lg bg-oil-500/10 border border-oil-500/20">
                      <Zap size={14} className="text-oil-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">{result.topMatch.reasoning}</p>
                    </div>

                    {/* Extracted Parameters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                        <span className="text-slate-400">Claimed Qty:</span>
                        <p className="font-bold text-white">
                          {result.extractedData.quantity ? `${result.extractedData.quantity} ${result.extractedData.unit || ''}` : '--'}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                        <span className="text-slate-400">Location:</span>
                        <p className="font-bold text-white">{result.extractedData.location || '--'}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                        <span className="text-slate-400">Workforce:</span>
                        <p className="font-bold text-white">{result.extractedData.workforce ? `${result.extractedData.workforce} Men` : '--'}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                        <span className="text-slate-400">Execution Window:</span>
                        <p className="font-bold text-white">{result.extractedData.actualStart || 'Full Day'}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: UNMATCHED & NEW ACTIVITIES HITL QUEUE
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'unmatched' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                !
              </div>
              <div>
                <p className="font-bold text-white text-sm">Human-in-the-Loop Unmatched Activity Resolver</p>
                <p className="text-slate-400 mt-0.5">
                  Field progress often involves micro-tasks or unanticipated site works not in the baseline WBS. Nirman Setu flags them here instead of silently dropping them.
                </p>
              </div>
            </div>
          </div>

          {unmatchedActivities.map(item => (
            <Card key={item.id} className="border-rose-500/30 bg-slate-900/90 shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'pending_review' ? 'danger' : 'outline'}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.discipline}
                    </span>
                    <span className="text-xs text-slate-400">Reported by {item.submittedBy}</span>
                  </div>
                  <p className="font-bold text-sm text-white mt-1.5">"{item.reportedText}"</p>
                </div>

                {item.status === 'pending_review' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setSelectedUnmatchedId(item.id)}
                      className="text-xs"
                    >
                      <Layers size={14} />
                      Take Action
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardBody className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                    <span className="text-slate-400">Extracted Qty:</span>
                    <p className="font-semibold text-white">
                      {item.extractedQuantity ? `${item.extractedQuantity} ${item.extractedUnit || ''}` : 'Not quantified'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                    <span className="text-slate-400">Location:</span>
                    <p className="font-semibold text-white">{item.extractedLocation || 'Site'}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                    <span className="text-slate-400">Planner Suggestion:</span>
                    <p className="font-semibold text-oil-300">{item.plannerNotes || 'Review required'}</p>
                  </div>
                </div>

                {/* Inline Action Drawer if Selected */}
                {selectedUnmatchedId === item.id && (
                  <div className="p-4 rounded-xl bg-slate-850 border border-oil-500/40 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-oil-400" />
                      Choose Resolution Strategy:
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option A: Link to Existing Activity */}
                      <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                        <span className="font-bold text-oil-400 text-xs">Option A: Link to Existing Planned Activity</span>
                        <p className="text-[11px] text-slate-400">Map this field work to an existing L5 WBS node.</p>
                        <select
                          value={targetActivityId}
                          onChange={e => setTargetActivityId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          {activities.map(a => (
                            <option key={a.id} value={a.id}>
                              [{a.activityId}] {a.name} ({a.discipline.toUpperCase()})
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="secondary"
                          onClick={() => handleResolveUnmatched(item.id, 'link')}
                          className="w-full text-xs mt-1"
                        >
                          <Link size={13} /> Link & Update Selected Activity
                        </Button>
                      </div>

                      {/* Option B: Promote to New L6 Node */}
                      <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                        <span className="font-bold text-emerald-400 text-xs">Option B: Promote to New L6 Micro-Activity</span>
                        <p className="text-[11px] text-slate-400">
                          Create an official L6 executable node under the WBS baseline and recalculate CPM.
                        </p>
                        <input
                          type="text"
                          value={plannerNotes}
                          onChange={e => setPlannerNotes(e.target.value)}
                          placeholder="Add planner justification notes..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        <Button
                          variant="primary"
                          onClick={() => handleResolveUnmatched(item.id, 'promote')}
                          className="w-full text-xs mt-1 bg-emerald-600 hover:bg-emerald-500"
                        >
                          <PlusCircle size={13} /> Promote to New L6 Schedule Node
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setSelectedUnmatchedId(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: AUTO-APPLIED LEDGER
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'auto_applied' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
            Field reports with ≥90% confidence score are verified against site constraints and auto-updated to the Primavera schedule with full auditability.
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 text-[11px] font-semibold">
                <tr>
                  <th className="p-3">Activity Code</th>
                  <th className="p-3">Planned Activity Name</th>
                  <th className="p-3">Discipline</th>
                  <th className="p-3">Verified Actual Qty</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Applied At</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {autoAppliedResults.map(res => (
                  <tr key={res.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-oil-400">{res.topMatch.activityCode}</td>
                    <td className="p-3 font-semibold text-white">{res.topMatch.activityName}</td>
                    <td className="p-3">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {res.extractedData.discipline || 'Piping'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">
                      {res.extractedData.quantity} {res.extractedData.unit}
                    </td>
                    <td className="p-3 font-mono">{Math.round(res.topMatch.confidence * 100)}%</td>
                    <td className="p-3 text-slate-400">{new Date(res.processedAt).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Written to P6
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: IMMUTABLE AUDIT LOG
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  Cryptographically-Verifiable Execution Audit Trail
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable record of every field submission, AI schedule match, planner approval, and CPM recalculation.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Total Entries: {auditLogs.length}</span>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-800">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        {log.discipline && (
                          <span className="text-[10px] uppercase font-bold text-oil-400">
                            [{log.discipline}]
                          </span>
                        )}
                        <span className="text-xs text-slate-400">by {log.userName} ({log.userRole})</span>
                      </div>
                      <p className="text-xs text-slate-200">{log.details}</p>
                      {log.confidence && (
                        <p className="text-[11px] text-emerald-400 font-mono">
                          AI Confidence: {Math.round(log.confidence * 100)}%
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
