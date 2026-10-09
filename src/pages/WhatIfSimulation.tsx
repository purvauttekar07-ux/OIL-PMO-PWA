import { useState, useMemo } from 'react'
import {
  Sliders, AlertTriangle, TrendingDown, ArrowRight, Play,
  RefreshCw, CheckCircle2, DollarSign, Calendar, Zap, Layers
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { SimulationScenario } from '@/types'
import clsx from 'clsx'

export function WhatIfSimulation() {
  const { activities, selectedProjectId, runWhatIfSimulation, simulationResult, projects } = useAppStore()
  const project = projects.find(p => p.id === selectedProjectId) || projects[0]
  const projectActivities = activities.filter(a => a.projectId === selectedProjectId)

  const [selectedActivityId, setSelectedActivityId] = useState(
    projectActivities.find(a => a.name.includes('Pipe Laying'))?.id || projectActivities[0]?.id || 'a5'
  )
  const [delayDays, setDelayDays] = useState(15)
  const [productivity, setProductivity] = useState(0.8) // 80% speed
  const [reason, setReason] = useState('Monsoon heavy precipitation & flood inundation along Brahmaputra riverbanks')

  const currentActivity = projectActivities.find(a => a.id === selectedActivityId)

  // Run simulation whenever parameters change or button is clicked
  const activeResult = useMemo(() => {
    const scenario: SimulationScenario = {
      id: `sim_${Date.now()}`,
      name: 'Simulated Scenario',
      targetActivityId: selectedActivityId,
      delayDays,
      productivityModifier: productivity,
      reason
    }
    return runWhatIfSimulation(scenario)
  }, [selectedActivityId, delayDays, productivity, reason, runWhatIfSimulation])

  function formatLakhCrore(amount: number) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
    return `₹${(amount / 100000).toFixed(1)} Lakh`
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Interactive CPM "What-If" Simulator</h1>
            <Badge variant="warning" size="sm">Dynamic CPM Engine</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Simulate delays and productivity drops to evaluate downstream critical path ripple effects and financial burn in real-time.
          </p>
        </div>
      </div>

      {/* Main Grid: Control Panel + Simulation Impact Results */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Simulation Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-oil-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-oil-400" />
                <p className="text-sm font-semibold text-white">Simulation Scenario Parameters</p>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-5">
              {/* Select Target Activity */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Target Schedule Activity (P6)</label>
                <select
                  value={selectedActivityId}
                  onChange={e => setSelectedActivityId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-oil-500"
                >
                  {projectActivities.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.activityId}: {a.name} ({a.isCritical ? 'Critical Path' : `Float: ${a.totalFloat ?? 0}d`})
                    </option>
                  ))}
                </select>
                {currentActivity && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Planned Duration: {currentActivity.plannedDuration} days</span>
                    <span className={currentActivity.isCritical ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
                      {currentActivity.isCritical ? 'On Critical Path (0 Float)' : `Total Float: ${currentActivity.totalFloat ?? 0}d`}
                    </span>
                  </div>
                )}
              </div>

              {/* Delay Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Direct Activity Delay</label>
                  <span className="text-sm font-bold text-oil-400 font-mono">+{delayDays} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={delayDays}
                  onChange={e => setDelayDays(Number(e.target.value))}
                  className="w-full accent-oil-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0 Days</span>
                  <span>+15 Days</span>
                  <span>+30 Days</span>
                  <span>+60 Days</span>
                </div>
              </div>

              {/* Productivity Modifier Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Productivity Rate</label>
                  <span className="text-sm font-bold text-amber-400 font-mono">{Math.round(productivity * 100)}% Speed</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.5"
                  step="0.05"
                  value={productivity}
                  onChange={e => setProductivity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>30% (Severe Blocker)</span>
                  <span>100% (Normal)</span>
                  <span>150% (Fast Track)</span>
                </div>
              </div>

              {/* Simulation Preset Scenarios */}
              <div className="space-y-2 pt-2 border-t border-slate-700/50">
                <p className="text-xs font-medium text-slate-400">Quick Industry Presets</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setDelayDays(21); setProductivity(0.6); setReason('Assam Brahmaputra Monsoon Inundation') }}
                    className="p-2 bg-slate-800 hover:bg-slate-700/60 border border-slate-700 rounded-lg text-left text-xs text-slate-300 transition-colors"
                  >
                    🌧️ <strong className="text-white block">Monsoon Flooding</strong>
                    <span className="text-[10px] text-slate-500">+21d, 60% speed</span>
                  </button>
                  <button
                    onClick={() => { setDelayDays(12); setProductivity(0.75); setReason('Pipe Supply Chain Shipment Delay from Hazira') }}
                    className="p-2 bg-slate-800 hover:bg-slate-700/60 border border-slate-700 rounded-lg text-left text-xs text-slate-300 transition-colors"
                  >
                    📦 <strong className="text-white block">Material Stockout</strong>
                    <span className="text-[10px] text-slate-500">+12d on Pipe Stringing</span>
                  </button>
                  <button
                    onClick={() => { setDelayDays(18); setProductivity(0.5); setReason('Land Right-of-Way (RoW) Clearance dispute at Ch. 45') }}
                    className="p-2 bg-slate-800 hover:bg-slate-700/60 border border-slate-700 rounded-lg text-left text-xs text-slate-300 transition-colors"
                  >
                    🚧 <strong className="text-white block">RoW Land Dispute</strong>
                    <span className="text-[10px] text-slate-500">+18d Clearing delay</span>
                  </button>
                  <button
                    onClick={() => { setDelayDays(0); setProductivity(1.3); setReason('Fast-track mobilization of second welding crew') }}
                    className="p-2 bg-slate-800 hover:bg-slate-700/60 border border-slate-700 rounded-lg text-left text-xs text-slate-300 transition-colors"
                  >
                    ⚡ <strong className="text-white block">Crash Schedule (2x Crew)</strong>
                    <span className="text-[10px] text-slate-500">130% speed acceleration</span>
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: Simulation Impact Analysis */}
        <div className="lg:col-span-7 space-y-4">
          {/* Executive Impact Summary KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                <Calendar size={15} />
                <span className="text-xs font-semibold">Total Slippage</span>
              </div>
              <p className="text-2xl font-bold text-red-400 font-mono">
                +{activeResult.totalSlippageDays} <span className="text-sm font-normal">Days</span>
              </p>
              <p className="text-[10px] text-red-300 mt-0.5">Project Finish Delayed</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <DollarSign size={15} />
                <span className="text-xs font-semibold">Financial Impact</span>
              </div>
              <p className="text-2xl font-bold text-amber-400 font-mono">
                {formatLakhCrore(activeResult.costImpactINR)}
              </p>
              <p className="text-[10px] text-amber-300 mt-0.5">Overhead / Equipment Idle</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Layers size={15} />
                <span className="text-xs font-semibold">Critical Path Shift</span>
              </div>
              <p className="text-lg font-bold text-blue-300 mt-1">
                {activeResult.criticalPathChanged ? 'Path Shifted' : 'Locked on CP'}
              </p>
              <p className="text-[10px] text-blue-400 mt-0.5">
                {activeResult.affectedActivities.length} Successor Nodes Impacted
              </p>
            </div>
          </div>

          {/* Date Comparison Banner */}
          <Card>
            <CardBody className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40">
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-slate-400 block">Baseline Finish Date</span>
                <span className="text-sm font-bold text-slate-200 font-mono">{activeResult.originalEndDate}</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <ArrowRight size={18} className="animate-pulse" />
                <span className="text-xs font-semibold px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full">
                  +{activeResult.totalSlippageDays} Days Delay
                </span>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-[11px] text-slate-400 block">Simulated Project Completion</span>
                <span className="text-sm font-bold text-red-400 font-mono">{activeResult.simulatedEndDate}</span>
              </div>
            </CardBody>
          </Card>

          {/* Downstream Affected Activities Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Downstream Critical Path Ripple Effect</p>
                <Badge variant="outline" size="sm">{activeResult.affectedActivities.length} Activities Affected</Badge>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-3">
              {activeResult.affectedActivities.map(act => (
                <div key={act.activityId} className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{act.name}</span>
                        {act.isCritical && <Badge variant="danger" size="sm">CP</Badge>}
                        {act.activityId === selectedActivityId && (
                          <Badge variant="warning" size="sm">Trigger Source</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {act.activityId}</p>
                    </div>
                    <span className="text-xs font-bold text-red-400 shrink-0 font-mono">
                      +{act.delayDays}d finish push
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/50 p-2 rounded">
                    <div>
                      <span className="text-slate-500 block">Original Schedule:</span>
                      <span className="text-slate-300 font-mono">{act.originalStart} → {act.originalFinish}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Simulated Schedule:</span>
                      <span className="text-red-300 font-mono">{act.simulatedStart} → {act.simulatedFinish}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
