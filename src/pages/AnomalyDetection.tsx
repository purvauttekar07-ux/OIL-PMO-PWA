import { useState } from 'react'
import {
  ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Search,
  Eye, FileText, Activity, Zap, Info, ShieldCheck, Filter
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import type { AnomalyReport, AnomalyType } from '@/types'
import clsx from 'clsx'

const TYPE_CONFIG: Record<AnomalyType, { label: string; icon: string; badge: 'danger' | 'warning' | 'info' }> = {
  rate_spike: { label: 'Velocity Anomaly', icon: '⚡', badge: 'danger' },
  weather_conflict: { label: 'Weather Quality Risk', icon: '🌧️', badge: 'warning' },
  sequence_violation: { label: 'Ghost Progress (CPM Break)', icon: '🚫', badge: 'danger' },
  duplicate_claim: { label: 'Duplicate Billing', icon: '📑', badge: 'warning' },
  workforce_mismatch: { label: 'Manpower Mismatch', icon: '👥', badge: 'info' },
  chainage_overlap: { label: 'Spatial Chainage Collision', icon: '📍', badge: 'warning' }
}

export function AnomalyDetection() {
  const { anomalies, resolveAnomaly, dismissAnomaly } = useAppStore()
  const { toast } = useToast()

  const [filter, setFilter] = useState<'all' | 'active' | 'investigating' | 'resolved'>('active')
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyReport | null>(anomalies[0] || null)
  const [resolutionInput, setResolutionInput] = useState('')

  const filtered = anomalies.filter(a => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const criticalCount = anomalies.filter(a => a.severity === 'critical' && a.status === 'active').length
  const highCount = anomalies.filter(a => a.severity === 'high' && a.status === 'active').length
  const resolvedCount = anomalies.filter(a => a.status === 'resolved').length

  function handleResolve(id: string) {
    if (!resolutionInput.trim()) {
      toast({ type: 'warning', title: 'Resolution note required', message: 'Please enter verification findings before marking resolved.' })
      return
    }
    resolveAnomaly(id, resolutionInput)
    toast({ type: 'success', title: 'Anomaly Verified & Resolved', message: 'Investigation notes logged into PMO audit trail.' })
    setResolutionInput('')
  }

  function handleDismiss(id: string) {
    dismissAnomaly(id)
    toast({ type: 'info', title: 'Anomaly Dismissed', message: 'Flagged item marked as false positive.' })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">AI Anomaly & Risk Detection Center</h1>
            <Badge variant="danger" size="sm">XGBoost & OISD Rules</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Automated machine learning audits on progress claims, physical machine capacities, OISD weather standards, and spatial chainage collisions.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
          <p className="text-xs text-red-300">Critical Risk Flags</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{highCount}</p>
          <p className="text-xs text-amber-300">Quality / Weather Warnings</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{resolvedCount}</p>
          <p className="text-xs text-emerald-300">Audited & Resolved</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">96.4%</p>
          <p className="text-xs text-blue-300">Model Precision Score</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['active', 'investigating', 'resolved', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={clsx(
              'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all capitalize',
              filter === tab
                ? 'border-oil-500/60 bg-oil-500/15 text-oil-300'
                : 'border-slate-700 text-slate-400 hover:text-slate-200'
            )}
          >
            {tab === 'active' ? `Active Alerts (${anomalies.filter(a => a.status === 'active').length})` : tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Anomaly Feed + Detail Inspector */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Anomaly Feed */}
        <div className="lg:col-span-6 space-y-3">
          {filtered.map(anom => {
            const typeInfo = TYPE_CONFIG[anom.type] || { label: anom.type, icon: '⚠️', badge: 'warning' }
            const isSelected = selectedAnomaly?.id === anom.id

            return (
              <div
                key={anom.id}
                onClick={() => setSelectedAnomaly(anom)}
                className={clsx(
                  'p-4 rounded-xl border cursor-pointer transition-all',
                  isSelected
                    ? 'border-oil-500 bg-oil-500/10 shadow-lg'
                    : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeInfo.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{anom.title}</p>
                      <p className="text-[11px] text-slate-400">{anom.activityName}</p>
                    </div>
                  </div>
                  <Badge variant={anom.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                    {anom.severity.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 my-2">{anom.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/50">
                  <span>Confidence: <strong>{Math.round(anom.confidence * 100)}%</strong></span>
                  <Badge variant={anom.status === 'resolved' ? 'success' : 'outline'} size="sm">
                    {anom.status}
                  </Badge>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <ShieldCheck size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">No anomalies in this category</p>
              <p className="text-xs text-slate-500">All field progress entries are within statistical engineering benchmarks.</p>
            </div>
          )}
        </div>

        {/* Anomaly Inspection & Verification Inspector */}
        <div className="lg:col-span-6">
          {selectedAnomaly ? (
            <Card className="border-slate-700 sticky top-20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={18} className="text-red-400" />
                    <p className="text-sm font-bold text-white">AI Forensic Inspection</p>
                  </div>
                  <Badge variant={selectedAnomaly.severity === 'critical' ? 'danger' : 'warning'}>
                    ML Confidence: {Math.round(selectedAnomaly.confidence * 100)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white">{selectedAnomaly.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Target: {selectedAnomaly.activityName}</p>
                </div>

                <div className="bg-slate-800/80 rounded-lg p-3 text-xs text-slate-300 space-y-2 border border-slate-700">
                  <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Info size={14} className="text-blue-400" /> Diagnostic Evidence:
                  </p>
                  <p>{selectedAnomaly.description}</p>
                </div>

                {/* Evidence Metrics Table */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">
                    <span className="text-[10px] text-red-400 font-semibold uppercase block">Reported Value</span>
                    <span className="text-slate-200 font-bold font-mono text-sm">{selectedAnomaly.evidence.reportedValue}</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5">
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase block">Permissible Threshold</span>
                    <span className="text-slate-200 font-bold font-mono text-sm">{selectedAnomaly.evidence.expectedThreshold}</span>
                  </div>
                </div>

                {selectedAnomaly.status !== 'resolved' && selectedAnomaly.status !== 'dismissed' ? (
                  <div className="space-y-3 pt-2 border-t border-slate-700">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Site Engineer / PMO Verification Notes
                    </label>
                    <textarea
                      value={resolutionInput}
                      onChange={e => setResolutionInput(e.target.value)}
                      placeholder="e.g. Conducted site audit with laser scan: Contractor mobilized 2 extra welding teams under emergency directive. Approved with revised crew ledger."
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-oil-500"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        icon={<CheckCircle2 size={14} />}
                        onClick={() => handleResolve(selectedAnomaly.id)}
                      >
                        Verify & Resolve Anomaly
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<XCircle size={14} />}
                        onClick={() => handleDismiss(selectedAnomaly.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Anomaly Closed
                    </p>
                    {selectedAnomaly.resolutionNotes && (
                      <p className="text-slate-300">"{selectedAnomaly.resolutionNotes}" — by {selectedAnomaly.resolvedBy}</p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <Card className="text-center py-20 text-slate-500">
              <CardBody>
                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an anomaly card on the left to inspect forensic evidence.</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
