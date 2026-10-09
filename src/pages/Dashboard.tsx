import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, BarChart, Bar
} from 'recharts'
import {
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle2,
  Activity, MapPin, Clock, Zap, ShieldAlert, Sliders, DollarSign
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { MOCK_SCURVE } from '@/lib/mockData'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const WEEKLY_DATA = [
  { week: 'W32', planned: 4.2, actual: 3.1 },
  { week: 'W33', planned: 4.5, actual: 3.8 },
  { week: 'W34', planned: 4.8, actual: 3.5 },
  { week: 'W35', planned: 5.0, actual: 4.2 },
  { week: 'W36', planned: 4.6, actual: 3.9 },
  { week: 'W37', planned: 4.9, actual: 4.1 },
]

export function Dashboard() {
  const { projects, activities, alerts, aiResults, anomalies, selectedProjectId } = useAppStore()
  const navigate = useNavigate()

  const project = projects.find(p => p.id === selectedProjectId) ?? projects[0]
  const projectActivities = activities.filter(a => a.projectId === project.id)
  const unreadAlerts = alerts.filter(a => !a.isRead)
  const activeAnomalies = anomalies.filter(a => a.status === 'active')
  const pendingApprovals = aiResults.filter(r => r.status === 'needs_review').length
  const criticalActivities = projectActivities.filter(a => a.isCritical && a.status !== 'completed')
  const delayedActivities = projectActivities.filter(a => a.actualProgress < a.plannedProgress - 10)

  const [showConfidenceBands, setShowConfidenceBands] = useState(true)

  // Earned Value Management Metrics
  const pv = project.plannedValue || (project.contractValue * (project.plannedProgress / 100))
  const ev = project.earnedValue || (project.contractValue * (project.actualProgress / 100))
  const ac = project.actualCost || (ev * 1.08)
  const cv = ev - ac
  const sv = ev - pv
  const totalVariance = project.actualProgress - project.plannedProgress

  function formatCr(val: number) {
    return `₹${(val / 10000000).toFixed(2)} Cr`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl space-y-1">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4 font-mono">
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value != null ? `${entry.value}%` : '—'}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Executive PMO Command Center</h1>
            <Badge variant="info" size="sm">Nirman Setu v1.0</Badge>
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
            <MapPin size={13} className="text-oil-400" /> {project.name} · {project.contractor}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/simulation')} icon={<Sliders size={14} />}>
            What-If Simulation
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/field')} icon={<Zap size={14} />}>
            New Field DPR
          </Button>
        </div>
      </div>

      {/* Critical Alert & ML Anomaly Banner */}
      {activeAnomalies.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <ShieldAlert size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-red-300">
                {activeAnomalies.length} AI Anomaly & Fraud Flags Detected
              </p>
              <p className="text-xs text-red-400 mt-0.5 truncate">
                {activeAnomalies[0]?.title}
              </p>
            </div>
          </div>
          <Button size="xs" variant="danger" onClick={() => navigate('/anomalies')}>
            Inspect Forensic Evidence →
          </Button>
        </div>
      )}

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Overall Progress"
          value={`${project.actualProgress}%`}
          sub={`Planned Baseline: ${project.plannedProgress}%`}
          icon={<Activity size={16} className="text-oil-400" />}
          trend={totalVariance >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(totalVariance)}% ${totalVariance >= 0 ? 'ahead' : 'behind'}`}
          color={totalVariance < -5 ? 'danger' : 'orange'}
        />
        <StatCard
          label="Schedule Index (SPI)"
          value={project.spi.toFixed(2)}
          sub={project.spi < 0.9 ? 'Critical schedule delay' : 'On schedule track'}
          icon={<TrendingDown size={16} className={project.spi < 0.9 ? 'text-red-400' : 'text-emerald-400'} />}
          color={project.spi < 0.85 ? 'danger' : project.spi < 0.95 ? 'warning' : 'success'}
        />
        <StatCard
          label="Cost Index (CPI)"
          value={project.cpi.toFixed(2)}
          sub="Budget Utilization Efficiency"
          icon={<DollarSign size={16} className={project.cpi < 0.95 ? 'text-amber-400' : 'text-emerald-400'} />}
          color={project.cpi < 0.95 ? 'warning' : 'success'}
        />
        <StatCard
          label="Active Critical Path"
          value={`${criticalActivities.length} Activities`}
          sub={`${delayedActivities.length} activities with >10% variance`}
          icon={<Clock size={16} className="text-amber-400" />}
          color={delayedActivities.length > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Earned Value Management (EVM) Strip */}
      <Card className="border-slate-700/80 bg-slate-800/40">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" /> Earned Value Analysis (EVA / OISD Benchmark)
            </span>
            <Badge variant="outline" size="sm">Contract Value: {formatCr(project.contractValue)}</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Planned Value (PV)</span>
              <span className="text-slate-200 font-bold font-mono text-sm">{formatCr(pv)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Earned Value (EV)</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">{formatCr(ev)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Actual Cost (AC)</span>
              <span className="text-amber-400 font-bold font-mono text-sm">{formatCr(ac)}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Schedule Var (SV)</span>
              <span className={clsx('font-bold font-mono text-sm', sv < 0 ? 'text-red-400' : 'text-emerald-400')}>
                {formatCr(sv)}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Cost Var (CV)</span>
              <span className={clsx('font-bold font-mono text-sm', cv < 0 ? 'text-red-400' : 'text-emerald-400')}>
                {formatCr(cv)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* S-Curve with Monte Carlo ML Bands */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Live Project S-Curve: Planned Baseline vs Actual vs Forecast</h2>
              <p className="text-xs text-slate-400 mt-0.5">Statistical trajectory computed from daily field verified actuals</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-500 inline-block" /> Planned Baseline</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-oil-500 inline-block" /> Actual Progress</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block border-dashed" /> ML Forecast</span>
              <button
                onClick={() => setShowConfidenceBands(b => !b)}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded border border-slate-700"
              >
                {showConfidenceBands ? 'Hide 95% Band' : 'Show 95% Band'}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MOCK_SCURVE} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x="Sep 24" stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'Today', fill: '#f59e0b', fontSize: 10 }} />

              {showConfidenceBands && (
                <Area type="monotone" dataKey="forecastUpper" stroke="none" fill="url(#gradConfidence)" connectNulls={false} />
              )}
              <Area type="monotone" dataKey="planned" name="Planned Baseline" stroke="#64748b" strokeWidth={2} fill="url(#gradPlanned)" dot={false} />
              <Area type="monotone" dataKey="actual" name="Actual Verified" stroke="#f97316" strokeWidth={2.5} fill="url(#gradActual)" dot={{ r: 3, fill: '#f97316' }} connectNulls={false} />
              <Area type="monotone" dataKey="forecast" name="ML Forecast" stroke="#60a5fa" strokeWidth={1.8} strokeDasharray="5 3" fill="none" dot={false} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-between text-xs text-amber-400 mt-2 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={13} />
              Current velocity projects ~3.2 weeks delay to final Hydrotesting. Critical Path Bottleneck: <strong>Pipe Laying (A1050)</strong>.
            </span>
            <Button size="xs" variant="outline" onClick={() => navigate('/simulation')}>
              Run What-If Fix →
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Lower Section: Weekly Breakdown & Critical Path List */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-white">Weekly Execution Rate (Planned vs Actual)</h2>
          </CardHeader>
          <CardBody className="pt-0">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={WEEKLY_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="planned" name="Planned" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Critical Path Activities (0 Float)</h2>
              <Button size="xs" variant="ghost" onClick={() => navigate('/schedule')}>Full Schedule →</Button>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            {criticalActivities.slice(0, 4).map(activity => (
              <div key={activity.id} className="space-y-1.5 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{activity.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{activity.activityId} · {activity.location.slice(0, 25)}</p>
                  </div>
                  <Badge variant={activity.status === 'delayed' ? 'danger' : 'info'} size="sm">
                    {activity.status.replace('_', ' ')}
                  </Badge>
                </div>
                <ProgressBar
                  planned={activity.plannedProgress}
                  actual={activity.actualProgress}
                  showLabels={true}
                  height="sm"
                />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
