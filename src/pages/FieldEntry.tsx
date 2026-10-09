import { useState, useRef, useEffect } from 'react'
import {
  Mic, Camera, FileSpreadsheet, MapPin,
  Send, Loader2, CheckCircle2, Brain, Zap,
  Sparkles, FileText, Upload, HardHat, FileCheck
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import type { AIProcessingResult, EngineeringDiscipline, BatchSpreadsheetResult, TimeAgentMessage } from '@/types'
import { MOCK_SPREADSHEET_TEMPLATES } from '@/lib/mockData'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

type IngestMode = 'spreadsheet' | 'dpr_form'

const DISCIPLINES: { id: EngineeringDiscipline; label: string; color: string }[] = [
  { id: 'piping', label: 'Piping Works', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'civil', label: 'Civil Infrastructure', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'equipment', label: 'Static & Rotary Equip', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'electrical', label: 'Electrical Power', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'instrumentation', label: 'Instrumentation & DCS', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'hse', label: 'HSE & Clearances', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
]

const QUICK_PROMPTS = [
  {
    discipline: 'piping',
    text: 'Erected 2 spools on Line 24"-CS-01 at Unit 101 header. Flange torque checked, 14 fitters, 08:30 to 16:30.',
    label: 'Line 24 Spool Erection (Piping)'
  },
  {
    discipline: 'piping',
    text: 'Namaskar, aaj Ch 62+400 pe 480 meter pipe lowering complete hua. 47 workers the, mausam saaf tha.',
    label: 'Ch 62+400 Pipe Lowering (Hindi/Assamese)'
  },
  {
    discipline: 'civil',
    text: 'Mud mat PCC 1:3:6 poured 35 cum for Compressor Foundation C-201. 16 workers, cube samples taken.',
    label: 'Foundation Mud Mat (Civil)'
  },
  {
    discipline: 'electrical',
    text: 'Pulled 450m of 11kV feeder cable in main trench tray SS-01. Megger test cleared 500 Mohm.',
    label: '11kV Feeder Cable Pulling (Electrical)'
  },
  {
    discipline: 'equipment',
    text: 'Compressor Package C-201 placed on foundation plinth. Cold alignment completed, shims torqued.',
    label: 'Compressor Skid Alignment (Equipment)'
  },
  {
    discipline: 'civil',
    text: 'Constructed temporary RCC culvert detour bypass at Ch 44+200 due to sudden stream overflow.',
    label: 'Temporary Bypass (Unmatched Field Task)'
  }
]

export function FieldEntry() {
  const {
    projects, submitDPR, user, isOnline,
    importSpreadsheetBatch
  } = useAppStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [mode, setMode] = useState<IngestMode>('spreadsheet')
  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline>('piping')
  const [projectId, setProjectId] = useState(projects[0].id)

  // Spreadsheet Batch State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<'piping' | 'civil' | 'electrical'>('piping')
  const [currentBatchRows, setCurrentBatchRows] = useState(MOCK_SPREADSHEET_TEMPLATES.piping.rows)
  const [isBatchImporting, setIsBatchImporting] = useState(false)

  // DPR Form State
  const [rawText, setRawText] = useState(QUICK_PROMPTS[0].text)
  const [gps] = useState<{ lat: number; lng: number; accuracy: number } | null>({
    lat: 26.7821, lng: 93.9412, accuracy: 4
  })
  const [isProcessingDPR, setIsProcessingDPR] = useState(false)
  const [dprResult, setDprResult] = useState<AIProcessingResult | null>(null)

  function handleSelectTemplate(key: 'piping' | 'civil' | 'electrical') {
    setSelectedTemplateKey(key)
    setCurrentBatchRows(MOCK_SPREADSHEET_TEMPLATES[key].rows)
  }

  async function handleBatchReconciliation() {
    setIsBatchImporting(true)
    try {
      await new Promise(r => setTimeout(r, 900))
      const matched = currentBatchRows.filter(r => r.status === 'matched').length
      const review = currentBatchRows.filter(r => r.status === 'needs_review').length
      const unmatched = currentBatchRows.filter(r => r.status === 'unmatched').length

      const batchResult: BatchSpreadsheetResult = {
        batchId: `batch_${Date.now()}`,
        fileName: MOCK_SPREADSHEET_TEMPLATES[selectedTemplateKey].name,
        discipline: selectedTemplateKey as EngineeringDiscipline,
        totalRows: currentBatchRows.length,
        matchedCount: matched,
        reviewCount: review,
        unmatchedCount: unmatched,
        rows: currentBatchRows,
        importedAt: new Date().toISOString()
      }

      importSpreadsheetBatch(batchResult)
      toast({
        type: 'success',
        title: 'Batch Schedule Reconciliation Complete',
        message: `Updated ${matched} activities in P6. Routed ${unmatched} unlinked row(s) to Planner Review Queue.`
      })
    } finally {
      setIsBatchImporting(false)
    }
  }

  async function handleDPRSubmit() {
    if (!rawText.trim()) return
    setIsProcessingDPR(true)
    setDprResult(null)

    try {
      const res = await submitDPR({
        projectId,
        discipline: selectedDiscipline,
        submittedBy: user.id,
        submittedByRole: user.role,
        inputMethod: 'manual',
        rawText,
        date: new Date().toISOString().split('T')[0],
        gps,
        attachments: []
      })
      setDprResult(res)
      toast({
        type: 'success',
        title: res.autoApplied ? 'Auto-Applied to P6 (≥90% Confidence)' : 'Queued for Planner Verification',
        message: `Matched to "${res.topMatch.activityName}" with ${Math.round(res.topMatch.confidence * 100)}% confidence.`
      })
    } finally {
      setIsProcessingDPR(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-oil-950 to-slate-900 p-6 rounded-2xl border border-oil-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-oil-500/20 text-oil-400 font-mono text-[11px] font-bold border border-oil-500/30">
              SIH26122 · INGESTION LAYER
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold border border-emerald-500/30">
              {isOnline ? 'Online Sync' : 'Offline Buffer (IndexedDB)'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Intelligent Field Data Capture & Schedule Bridge
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Ingest heterogeneous multi-discipline inputs · Conversational Time Agent · Fuzzy L5/L6 Schedule Auto-Link
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Active Project:</label>
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-oil-500 focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name.slice(0, 32)}…</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Navigation — 2 simple modes (Time Agent removed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => setMode('spreadsheet')}
          className={clsx(
            'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
            mode === 'spreadsheet'
              ? 'bg-oil-600/20 border-oil-500 shadow-lg shadow-oil-500/10 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          )}
        >
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            mode === 'spreadsheet' ? 'bg-oil-500 text-white' : 'bg-slate-800 text-slate-400'
          )}>
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm">Discipline Spreadsheet Batch</p>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-bold">Batch CSV</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Multi-row Piping, Civil & Electrical bulk reconciliation</p>
          </div>
        </button>

        <button
          onClick={() => setMode('dpr_form')}
          className={clsx(
            'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
            mode === 'dpr_form'
              ? 'bg-oil-600/20 border-oil-500 shadow-lg shadow-oil-500/10 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          )}
        >
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            mode === 'dpr_form' ? 'bg-oil-500 text-white' : 'bg-slate-800 text-slate-400'
          )}>
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm">Free-Text DPR & OCR Slip</p>
              <span className="text-[10px] bg-cyan-500/30 text-cyan-300 px-1.5 py-0.5 rounded font-bold">Diary / Slip</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Unstructured field diary, photo OCR & GPS stamp</p>
          </div>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: CONVERSATIONAL TIME AGENT
          ────────────────────────────────────────────────────────────────────────── */}
      {/* Time Agent removed — now at bottom-left Sahayak */}
      {/* ── TAB 2: DISCIPLINE SPREADSHEET BATCH INGESTION
          ────────────────────────────────────────────────────────────────────────── */}
      {mode === 'spreadsheet' && (
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Discipline-Wise Spreadsheet Batch Reconciler</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bulk ingest contractor spreadsheets (CSV / XLSX) with automatic terminology cross-referencing and WBS linking.
                </p>
              </div>

              {/* Template Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSelectTemplate('piping')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    selectedTemplateKey === 'piping' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  )}
                >
                  Piping Spool CSV
                </button>
                <button
                  onClick={() => handleSelectTemplate('civil')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    selectedTemplateKey === 'civil' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  )}
                >
                  Civil Log XLSX
                </button>
                <button
                  onClick={() => handleSelectTemplate('electrical')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    selectedTemplateKey === 'electrical' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  )}
                >
                  Electrical Cable CSV
                </button>
              </div>
            </CardHeader>

            <CardBody className="space-y-4">
              {/* Batch Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400">Total Rows in File</span>
                  <p className="text-lg font-bold text-white">{currentBatchRows.length} rows</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <span className="text-[11px] text-emerald-400">Matched to L5/L6</span>
                  <p className="text-lg font-bold text-emerald-400">
                    {currentBatchRows.filter(r => r.status === 'matched').length} rows
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <span className="text-[11px] text-amber-400">Needs Review (60-84%)</span>
                  <p className="text-lg font-bold text-amber-400">
                    {currentBatchRows.filter(r => r.status === 'needs_review').length} rows
                  </p>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30">
                  <span className="text-[11px] text-rose-400">Unmatched / New Task</span>
                  <p className="text-lg font-bold text-rose-400">
                    {currentBatchRows.filter(r => r.status === 'unmatched').length} rows
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 text-[11px] font-semibold">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Discipline</th>
                      <th className="p-3">Contractor Field Description</th>
                      <th className="p-3">Qty & Unit</th>
                      <th className="p-3">Target P6 Activity Node</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Routing Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {currentBatchRows.map(row => (
                      <tr key={row.rowId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 text-slate-400 whitespace-nowrap">{row.date}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {row.discipline}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="font-medium text-slate-200">{row.fieldDescription}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Subcontractor: {row.subcontractor}</p>
                        </td>
                        <td className="p-3 text-slate-300 whitespace-nowrap font-mono font-semibold">
                          {row.quantity} {row.unit}
                        </td>
                        <td className="p-3">
                          {row.status === 'matched' ? (
                            <div>
                              <p className="font-semibold text-white">{row.matchedActivityName}</p>
                              <p className="text-[10px] text-oil-400 font-mono">{row.matchedActivityCode}</p>
                            </div>
                          ) : (
                            <span className="text-rose-400 italic text-[11px]">Unlinked (No direct baseline node)</span>
                          )}
                        </td>
                        <td className="p-3">
                          {row.confidence ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={clsx(
                                    'h-full rounded-full',
                                    row.confidence >= 0.85 ? 'bg-emerald-400' : 'bg-amber-400'
                                  )}
                                  style={{ width: `${Math.round(row.confidence * 100)}%` }}
                                />
                              </div>
                              <span className="font-mono text-[11px] text-slate-300">
                                {Math.round(row.confidence * 100)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[10px]">--</span>
                          )}
                        </td>
                        <td className="p-3">
                          {row.status === 'matched' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Auto-Update P6
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Route to Planner Queue
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Importing will update actual progress in Primavera P6 and record an immutable entry in the audit trail.
                </p>
                <Button
                  variant="primary"
                  onClick={handleBatchReconciliation}
                  disabled={isBatchImporting}
                  className="w-full sm:w-auto"
                >
                  {isBatchImporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Reconciling Schedule...
                    </>
                  ) : (
                    <>
                      <FileCheck size={16} />
                      Reconcile & Batch Update P6 Schedule
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: FREE-TEXT DPR & OCR INSPECTION SLIP
          ────────────────────────────────────────────────────────────────────────── */}
      {mode === 'dpr_form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-oil-400" />
                    <h3 className="text-sm font-bold text-white">Daily Progress Report (DPR) Ingestion</h3>
                  </div>
                  <button
                    onClick={() => {
                      setRawText(
                        'OIL INDIA LIMITED - DAILY SITE PROGRESS SLIP\n' +
                        'Date: 10/09/2024 | Location: Numaligarh Section Ch 48+500\n' +
                        'Discipline: Civil | Activity: Trench Excavation | Qty: 350 meters\n' +
                        'Excavators: 3x CAT 330 | Workforce: 28 Men | Weather: Clear'
                      )
                      toast({ type: 'info', title: 'OCR Template Loaded', message: 'Simulated OCR text extracted from scanned field slip.' })
                    }}
                    className="text-[11px] text-oil-400 hover:text-oil-300 font-semibold flex items-center gap-1"
                  >
                    <Camera size={13} /> Load Scanned OCR Slip
                  </button>
                </div>
              </CardHeader>

              <CardBody className="space-y-4">
                {/* Discipline Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Reporting Discipline:</label>
                  <div className="flex flex-wrap gap-2">
                    {DISCIPLINES.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDiscipline(d.id)}
                        className={clsx(
                          'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                          selectedDiscipline === d.id
                            ? d.color
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Raw Input Box */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    Free-Text Field Report / Supervisor Diary Notes:
                  </label>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl p-3 text-xs focus:ring-2 focus:ring-oil-500 focus:outline-none"
                    placeholder="Enter messy field supervisor notes or paste WhatsApp text..."
                  />
                </div>

                {/* Metadata & GPS */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={14} className="text-oil-400" />
                    <span>GPS Lock:</span>
                    <span className="font-mono text-slate-200">
                      {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)} (±${gps.accuracy}m)` : 'No fix'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Reporter:</span>
                    <span className="font-semibold text-white">{user.name} ({user.role})</span>
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  variant="primary"
                  onClick={handleDPRSubmit}
                  disabled={isProcessingDPR || !rawText.trim()}
                  className="w-full"
                >
                  {isProcessingDPR ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Parsing Entities & Schedule Linking...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Process with Nirman AI & Link to Schedule
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* AI Result & Schedule Match (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {dprResult ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">AI Extraction & Schedule Link</h3>
                    <Badge variant={dprResult.autoApplied ? 'success' : 'warning'}>
                      {dprResult.autoApplied ? 'Auto-Applied (≥90%)' : 'Planner Verification'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  {/* Top Match Card */}
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-oil-400 font-bold">
                        {dprResult.topMatch.activityCode}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {Math.round(dprResult.topMatch.confidence * 100)}% Match
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{dprResult.topMatch.activityName}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{dprResult.topMatch.reasoning}</p>
                  </div>

                  {/* Extracted Parameters */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <span className="text-slate-400 text-[10px]">Actual Quantity</span>
                      <p className="font-bold text-white">
                        {dprResult.extractedData.quantity ? `${dprResult.extractedData.quantity} ${dprResult.extractedData.unit || ''}` : 'Not specified'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <span className="text-slate-400 text-[10px]">Location / Chainage</span>
                      <p className="font-bold text-white">{dprResult.extractedData.location || 'Alignment'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <span className="text-slate-400 text-[10px]">Workforce</span>
                      <p className="font-bold text-white">{dprResult.extractedData.workforce ? `${dprResult.extractedData.workforce} Men` : '--'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <span className="text-slate-400 text-[10px]">Weather</span>
                      <p className="font-bold text-white">{dprResult.extractedData.weather || 'Normal'}</p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/schedule')}
                      className="flex-1 text-xs"
                    >
                      View in Schedule
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/approvals')}
                      className="flex-1 text-xs"
                    >
                      Planner Queue
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500">
                <Brain size={36} className="text-slate-700 mb-2 animate-bounce" />
                <p className="font-semibold text-slate-400 text-sm">Schedule Link Preview</p>
                <p className="text-xs text-slate-600 max-w-xs mt-1">
                  Submit a DPR or OCR slip on the left to view real-time entity extraction and fuzzy WBS schedule node linking.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
