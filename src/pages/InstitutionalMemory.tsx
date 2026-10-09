import { useState } from 'react'
import {
  Brain, BookOpen, Database, TrendingUp, AlertTriangle,
  Sparkles, Download, Search, CheckCircle2, Compass, Layers,
  ChevronRight, BarChart3, Clock, DollarSign, ShieldCheck,
  Send, HelpCircle, HardHat, FileText
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MOCK_HISTORICAL_PROJECTS,
  MOCK_RECURRING_BOTTLENECKS,
  MOCK_PRODUCTIVITY_BENCHMARKS,
  MOCK_KNOWLEDGE_QUERIES
} from '@/lib/mockData'
import { useToast } from '@/hooks/useToast'
import clsx from 'clsx'

type KnowledgeTab = 'overview' | 'duration_variance' | 'bottlenecks' | 'benchmarks' | 'ask_engine'

export function InstitutionalMemory() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('overview')

  // Ask Engine State
  const [searchQuery, setSearchQuery] = useState('')
  const [customQueries, setCustomQueries] = useState(MOCK_KNOWLEDGE_QUERIES)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all')

  function handleRunQuery(queryText: string) {
    if (!queryText.trim()) return
    setIsSearching(true)

    setTimeout(() => {
      setIsSearching(false)
      const lower = queryText.toLowerCase()
      let reply = ''
      let bufferDays = 14
      let benchmarks = ['General Civil/Piping Benchmark']

      if (lower.includes('hydrotest') || lower.includes('monsoon')) {
        reply = 'Historical data across 4 Assam cross-country pipelines indicates a median duration slippage of +38.5% (average +27 days) for hydrotesting scheduled between June and September. Primary causes: dewatering turbidity compliance and localized road washaway impeding tanker transport. Recommended contingency buffer: +30% duration.'
        bufferDays = 24
        benchmarks = ['Mainline Butt Welding (bm_2)', 'Monsoon Welding Stoppage (bot_1)']
      } else if (lower.includes('compressor') || lower.includes('foundation')) {
        reply = '1) High groundwater table requiring continuous dewatering during raft casting (avg 14 days delay). 2) Overseas vendor anchor bolt template mismatches discovered at site (avg 18 days delay). 3) Grout curing failures in sub-tropical high humidity (avg 7 days delay). Recommended mitigation: Pre-pour 3D laser scan of bolt layout.'
        bufferDays = 21
        benchmarks = ['Heavy Rotary Equipment Alignment (bm_4)', 'Vendor Transit Lag (bot_4)']
      } else if (lower.includes('excavation') || lower.includes('trench')) {
        reply = 'Empirical actual median productivity is 540 meters/day per excavator crew (vs planned tender standard of 650 m/day). During dry season (Nov–April), rates reach 750–820 m/day, while monsoon rates drop to 280 m/day. For tender baseline, assume 500 m/day with a 20% weather contingency buffer.'
        bufferDays = 14
        benchmarks = ['Trench Excavation Alluvial (bm_1)']
      } else if (lower.includes('cable') || lower.includes('electrical')) {
        reply = 'Electrical cable tray installation and pulling in refinery offsites averages 290 m/day for 11kV feeders (planned: 350 m/day). Cable drum handling on unpaved terrain during rain is the primary bottleneck. Recommend 18% schedule float.'
        bufferDays = 12
        benchmarks = ['11kV Feeder Cable Pulling (bm_5)']
      } else {
        reply = `Cross-referencing 5 historical OIL projects: Similar works exhibited an average actual-to-planned duration ratio of 1.18x (+18% variance). Recommend structuring baseline schedule with an empirical contingency buffer of ${bufferDays} days and milestone inspection sign-offs.`
      }

      const newQuery = {
        id: `kq_${Date.now()}`,
        query: queryText,
        timestamp: new Date().toISOString(),
        aiResponse: reply,
        relevantBenchmarks: benchmarks,
        recommendedBufferDays: bufferDays
      }

      setCustomQueries([newQuery, ...customQueries])
      setSearchQuery('')
      toast({
        type: 'success',
        title: 'Institutional Knowledge Queried',
        message: 'Synthesized lessons learned from past project repository.'
      })
    }, 600)
  }

  function handleExportDataset(format: 'json' | 'csv') {
    const dataset = {
      projectRepository: MOCK_HISTORICAL_PROJECTS,
      recurringBottlenecks: MOCK_RECURRING_BOTTLENECKS,
      productivityBenchmarks: MOCK_PRODUCTIVITY_BENCHMARKS,
      exportedAt: new Date().toISOString(),
      governance: 'Oil India Limited - PMO Knowledge Base'
    }

    const content = format === 'json'
      ? JSON.stringify(dataset, null, 2)
      : 'Discipline,ActivityType,PlannedRate,ActualMedian,P10Rate,P90Rate,BufferPercent\n' +
        MOCK_PRODUCTIVITY_BENCHMARKS.map(b => `${b.discipline},"${b.activityType}",${b.plannedBenchmarkRate},${b.actualHistoricalMedian},${b.p10Rate},${b.p90Rate},${b.recommendedContingencyBufferPercent}%`).join('\n')

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Nirman_Setu_Discipline_Progress_Memory.${format}`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      type: 'success',
      title: `Dataset Exported (${format.toUpperCase()})`,
      message: 'Clean, structured discipline-tagged historical dataset downloaded for future project planning.'
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[11px] font-bold border border-indigo-500/30 flex items-center gap-1.5">
                <Brain size={13} /> INSTITUTIONAL MEMORY ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold border border-emerald-500/30">
                Future Planning Repository
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Oil India Knowledge Base & Empirical Execution Memory
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
              Preserves the hard-won lessons of closed infrastructure projects: actual durations, recurring bottlenecks, and discipline productivity benchmarks to eliminate optimistic planning bias in future tenders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportDataset('csv')}
              icon={<Download size={14} />}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleExportDataset('json')}
              icon={<Database size={14} />}
            >
              Export Dataset (JSON)
            </Button>
          </div>
        </div>

        {/* High-Level Impact Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-500/20">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-500/20">
            <span className="text-[11px] text-slate-400">Closed Projects Ingested</span>
            <p className="text-xl font-bold text-white">5 Projects</p>
            <span className="text-[10px] text-indigo-400">Refinery, Pipeline & Road</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-500/20">
            <span className="text-[11px] text-slate-400">Avg Duration Variance</span>
            <p className="text-xl font-bold text-amber-400">+18.3%</p>
            <span className="text-[10px] text-slate-400">Real Execution vs Plan</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-500/20">
            <span className="text-[11px] text-slate-400">Bottlenecks Cataloged</span>
            <p className="text-xl font-bold text-rose-400">5 Major Patterns</p>
            <span className="text-[10px] text-rose-300">Weather, RoW, Vendor lag</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-500/20">
            <span className="text-[11px] text-slate-400">Productivity Benchmarks</span>
            <p className="text-xl font-bold text-emerald-400">6 Standards</p>
            <span className="text-[10px] text-emerald-300">P10 / Median / P90 rates</span>
          </div>
        </div>
      </div>

      {/* View Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Repository Overview', icon: BookOpen },
          { id: 'duration_variance', label: 'Actual vs Planned Durations', icon: TrendingUp },
          { id: 'bottlenecks', label: 'Recurring Bottlenecks & Causes', icon: AlertTriangle },
          { id: 'benchmarks', label: 'Discipline Productivity Benchmarks', icon: BarChart3 },
          { id: 'ask_engine', label: 'Ask Nirman Knowledge Engine', icon: Sparkles },
        ].map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as KnowledgeTab)}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              )}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: REPOSITORY OVERVIEW
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* The Value Proposition Card */}
            <Card className="lg:col-span-2 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Why Institutional Memory Matters in EPC Projects</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  Infrastructure mega-projects in India consistently suffer from an average <strong>20–35% schedule slippage</strong> because baseline plans (in Primavera P6 / MS Project) are constructed using generic manual standards or optimistic vendor assertions, rather than empirical historical data from the same geographical terrain.
                </p>
                <p>
                  Nirman Setu's <strong>Institutional Memory Layer</strong> continuously captures actual execution events from field daily reports, site diaries, and contractor spreadsheets, indexing them into a queryable knowledge graph. When a planner creates a new schedule for a pipeline or refinery expansion in Assam, the knowledge engine provides:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-indigo-400 block mb-1">Empirical Durations</span>
                    <p className="text-slate-400 text-[11px]">
                      Realistic activity durations derived from actual completion records rather than static tender books.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-amber-400 block mb-1">Bottleneck Defense</span>
                    <p className="text-slate-400 text-[11px]">
                      Historical frequency of delays (monsoon rainfall, NDT radiographic defects, RoW approvals).
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-emerald-400 block mb-1">Productivity P10/P90</span>
                    <p className="text-slate-400 text-[11px]">
                      Measured progress velocities per crew/day across differing weather and soil conditions.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="font-bold text-purple-400 block mb-1">Interactive Planner Queries</span>
                    <p className="text-slate-400 text-[11px]">
                      Ask questions like "What buffer should we keep for 48\" hydrotesting in monsoon?"
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Action to Ask Engine */}
            <Card className="border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-oil-400" />
                  <h3 className="text-sm font-bold text-white">Ask Nirman Knowledge</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Instant historical retrieval for tender estimates</p>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="text-xs text-slate-300">
                  Select a pre-compiled query to see how Nirman Setu leverages closed project data:
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('ask_engine')
                      handleRunQuery('What was the actual vs planned duration variance for 48" pipe hydrotesting during monsoon season?')
                    }}
                    className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-xs text-slate-200 transition-all"
                  >
                    🌧️ Hydrotesting duration variance in monsoon
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ask_engine')
                      handleRunQuery('What are the top 3 recurring delay causes in North-East refinery compressor foundation and alignment?')
                    }}
                    className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-xs text-slate-200 transition-all"
                  >
                    ⚙️ Compressor foundation delay causes
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ask_engine')
                      handleRunQuery('What productivity rate should we assume in future tenders for trench excavation in alluvial plain soil?')
                    }}
                    className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-xs text-slate-200 transition-all"
                  >
                    🚜 Trench excavation rate in alluvial soil
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: ACTUAL VS PLANNED DURATIONS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'duration_variance' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-400" />
                  Historical Project Duration Variance Repository
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparative performance of completed Oil India projects showing real schedule slippage and root cause attribution.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">5 Projects Indexed</span>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 text-[11px] font-semibold">
                    <tr>
                      <th className="p-3.5">Project Code & Name</th>
                      <th className="p-3.5">Discipline Focus</th>
                      <th className="p-3.5">Terrain</th>
                      <th className="p-3.5">Planned Days</th>
                      <th className="p-3.5">Actual Days</th>
                      <th className="p-3.5">Variance</th>
                      <th className="p-3.5">Primary Bottleneck</th>
                      <th className="p-3.5">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {MOCK_HISTORICAL_PROJECTS.map(proj => (
                      <tr key={proj.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-white">{proj.name}</p>
                          <p className="text-[10px] text-oil-400 font-mono mt-0.5">{proj.code} · {proj.contractor}</p>
                        </td>
                        <td className="p-3.5 text-slate-300">{proj.disciplineFocus}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] capitalize font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {proj.terrain}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">{proj.plannedDurationDays}d</td>
                        <td className="p-3.5 font-mono font-bold text-white">{proj.actualDurationDays}d</td>
                        <td className="p-3.5">
                          <span className={clsx(
                            'px-2 py-0.5 rounded text-[11px] font-bold font-mono',
                            proj.variancePercent > 20 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          )}>
                            +{proj.varianceDays}d (+{proj.variancePercent}%)
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs">{proj.primaryBottleneck}</td>
                        <td className="p-3.5 text-slate-400 font-mono whitespace-nowrap">{proj.completedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: RECURRING BOTTLENECK PATTERNS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'bottlenecks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_RECURRING_BOTTLENECKS.map(bot => (
              <Card key={bot.id} className="border-slate-800 hover:border-slate-700 transition-all">
                <CardHeader className="flex items-start justify-between gap-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-oil-300 border border-slate-700">
                        {bot.discipline}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        {bot.causeCategory.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5">{bot.title}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Frequency</span>
                    <span className="text-base font-extrabold text-rose-400 font-mono">{bot.frequencyPercent}%</span>
                  </div>
                </CardHeader>

                <CardBody className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <span className="text-slate-400 text-[10px]">Avg Schedule Impact</span>
                      <p className="font-bold text-amber-400 font-mono">+{bot.averageDelayDays} Days Delay</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <span className="text-slate-400 text-[10px]">Typical Cost Slippage</span>
                      <p className="font-bold text-white font-mono">₹{(bot.typicalCostImpactINR / 100000).toFixed(1)} Lakhs</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-bold text-emerald-400 text-[11px] block mb-1">
                      Recommended Engineering Mitigation:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {bot.mitigationStrategy}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span>Observed in:</span>
                    {bot.sampleProjects.map((p, i) => (
                      <span key={i} className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: DISCIPLINE PRODUCTIVITY BENCHMARKS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 size={16} className="text-emerald-400" />
                  Empirical Discipline Productivity Benchmark Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actual progress rates measured across closed projects. P10 = adverse monsoon/difficult terrain; P90 = dry winter plain.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">6 Benchmarks Active</span>
            </CardHeader>

            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 text-[11px] font-semibold">
                    <tr>
                      <th className="p-3.5">Discipline</th>
                      <th className="p-3.5">Activity Type</th>
                      <th className="p-3.5">Measurement Unit</th>
                      <th className="p-3.5">Planned Tender Rate</th>
                      <th className="p-3.5">Actual Historical Median</th>
                      <th className="p-3.5">P10 (Adverse)</th>
                      <th className="p-3.5">P90 (Optimal)</th>
                      <th className="p-3.5">Recommended Buffer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {MOCK_PRODUCTIVITY_BENCHMARKS.map(bm => (
                      <tr key={bm.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {bm.discipline}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">{bm.activityType}</td>
                        <td className="p-3.5 text-slate-400 text-[11px]">{bm.unit}</td>
                        <td className="p-3.5 font-mono text-slate-400">{bm.plannedBenchmarkRate}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                          {bm.actualHistoricalMedian}
                        </td>
                        <td className="p-3.5 font-mono text-rose-400">{bm.p10Rate}</td>
                        <td className="p-3.5 font-mono text-blue-400">{bm.p90Rate}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            +{bm.recommendedContingencyBufferPercent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 5: ASK NIRMAN KNOWLEDGE ENGINE
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'ask_engine' && (
        <div className="space-y-6">
          <Card className="border-indigo-500/40 bg-slate-900/90 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-oil-400" />
                <h3 className="text-sm font-bold text-white">Ask Nirman Knowledge Engine</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Query empirical project execution records to formulate robust baseline durations and contingency buffers for upcoming tenders.
              </p>
            </CardHeader>

            <CardBody className="space-y-4">
              {/* Search Bar */}
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleRunQuery(searchQuery)
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="e.g. What is the historical duration variance for 48 inch pipe hydrotesting in monsoon season?"
                    className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                  />
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  {isSearching ? 'Synthesizing...' : 'Query Knowledge Base'}
                </Button>
              </form>

              {/* Sample Fast Prompts */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <HelpCircle size={12} /> Suggested Queries:
                </span>
                {[
                  'What was the actual vs planned duration variance for 48" pipe hydrotesting during monsoon season?',
                  'What are the top 3 recurring delay causes in North-East refinery compressor foundation and alignment?',
                  'What productivity rate should we assume in future tenders for trench excavation in alluvial plain soil?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRunQuery(q)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors"
                  >
                    "{q.slice(0, 48)}…"
                  </button>
                ))}
              </div>

              {/* Query Response Stream */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                {customQueries.map(kq => (
                  <div key={kq.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          Q
                        </span>
                        <h4 className="font-bold text-white text-xs">{kq.query}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                        {new Date(kq.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                      <p className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-oil-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          AI
                        </span>
                        <span>{kq.aiResponse}</span>
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>Referenced Benchmarks:</span>
                          {kq.relevantBenchmarks.map((b, i) => (
                            <span key={i} className="text-oil-400 font-mono font-semibold">
                              {b}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Recommended Contingency Buffer:</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            +{kq.recommendedBufferDays} Days
                          </span>
                        </div>
                      </div>
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
