// ─── Core Domain Types ───────────────────────────────────────────────────────

export type ProjectType = 'pipeline' | 'building' | 'road' | 'utility' | 'refinery' | 'other'
export type ActivityStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'on_hold'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type InputMethod = 'manual' | 'voice' | 'photo' | 'excel' | 'whatsapp' | 'time_agent' | 'spreadsheet_batch'
export type UserRole = 'field_supervisor' | 'site_engineer' | 'planner' | 'pmo_manager' | 'admin'

export type EngineeringDiscipline =
  | 'civil'
  | 'piping'
  | 'equipment'
  | 'electrical'
  | 'instrumentation'
  | 'hse'

export type WBSLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6'

// ─── Project & WBS ───────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  code: string
  type: ProjectType
  location: string
  district: string
  state: string
  startDate: string
  endDate: string
  plannedProgress: number
  actualProgress: number
  status: ActivityStatus
  contractValue: number
  contractor: string
  spi: number // Schedule Performance Index
  cpi: number // Cost Performance Index
  plannedValue?: number // PV
  earnedValue?: number  // EV
  actualCost?: number   // AC
}

export interface WBSNode {
  id: string
  projectId: string
  wbsCode: string
  name: string
  parentId: string | null
  level: number // 0 = L1, 1 = L2, etc.
  wbsLevel?: WBSLevel
  discipline?: EngineeringDiscipline
  children?: WBSNode[]
}

export interface P6Activity {
  id: string
  activityId: string   // e.g. A1020
  projectId: string
  wbsId: string
  wbsCode: string
  name: string
  discipline: EngineeringDiscipline
  wbsLevel: WBSLevel
  granularity?: 'macro' | 'standard' | 'micro'
  keywords: string[]   // for NLP matching & synonym bridging
  fieldJargonSynonyms?: string[] // e.g. "spool erected", "mud mat poured", "feeder pulled"
  plannedStart: string
  plannedFinish: string
  actualStart: string | null
  actualFinish: string | null
  plannedDuration: number // days
  remainingDuration: number
  plannedProgress: number  // 0-100
  actualProgress: number   // 0-100
  status: ActivityStatus
  isCritical: boolean
  predecessors: string[]   // activity ids
  successors: string[]     // activity ids
  unit: string             // e.g. 'meters', 'joints', 'spools', 'skids', 'cum'
  totalQuantity: number
  completedQuantity: number
  location: string
  chainage?: string
  resourceCode?: string
  subActivities?: { id: string; name: string; completed: boolean; quantity?: number }[]
  // CPM & EVM Fields
  earlyStart?: string
  earlyFinish?: string
  lateStart?: string
  lateFinish?: string
  totalFloat?: number      // in days
  freeFloat?: number       // in days
  budgetCost?: number      // in INR
  actualCost?: number      // in INR
  earnedValue?: number     // in INR
  maxDailyCapacity?: number // for rate anomaly detection
}

// ─── DPR / Field Input ───────────────────────────────────────────────────────

export interface GPSCoords {
  lat: number
  lng: number
  accuracy: number
}

export interface MediaAttachment {
  id: string
  type: 'photo' | 'voice' | 'document'
  name: string
  url: string
  thumbnailUrl?: string
  size: number
  capturedAt: string
}

export interface DPREntry {
  id: string
  projectId: string
  discipline?: EngineeringDiscipline
  submittedBy: string
  submittedByRole: UserRole
  inputMethod: InputMethod
  rawText: string          // original messy input
  date: string
  actualStart?: string | null
  actualEnd?: string | null
  gps: GPSCoords | null
  attachments: MediaAttachment[]
  syncStatus: 'pending' | 'synced' | 'failed'
  createdAt: string
  updatedAt: string
}

// ─── AI Match Result ──────────────────────────────────────────────────────────

export interface ActivityMatch {
  activityId: string
  activityName: string
  activityCode: string
  discipline?: EngineeringDiscipline
  wbsLevel?: WBSLevel
  confidence: number          // 0–1
  confidenceLevel: ConfidenceLevel
  matchedKeywords: string[]
  matchedJargon?: string
  extractedQuantity: number | null
  extractedUnit: string | null
  extractedLocation: string | null
  extractedProgress: number | null // 0–100
  actualStartTime?: string | null
  actualEndTime?: string | null
  reasoning: string
}

export interface AIProcessingResult {
  id: string
  dprEntryId: string
  status: 'processing' | 'matched' | 'needs_review' | 'approved' | 'rejected' | 'applied' | 'unmatched_flagged'
  topMatch: ActivityMatch
  alternativeMatches: ActivityMatch[]
  extractedData: {
    date: string | null
    actualStart?: string | null
    actualEnd?: string | null
    location: string | null
    chainage: string | null
    activity: string | null
    discipline?: EngineeringDiscipline | null
    quantity: number | null
    unit: string | null
    progress: number | null
    remarks: string | null
    workforce: number | null
    equipment: string[]
    weather: string | null
  }
  isGranularityMismatch?: boolean
  parentPlannedActivityId?: string | null
  autoApplied: boolean
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  processedAt: string
  modelUsed?: 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'local-nlp-engine'
}

// ─── Unmatched / New Activities HITL Queue ───────────────────────────────────

export interface UnmatchedActivity {
  id: string
  dprEntryId: string
  reportedText: string
  discipline: EngineeringDiscipline
  extractedQuantity: number | null
  extractedUnit: string | null
  extractedLocation: string | null
  suggestedParentWbsId?: string
  status: 'pending_review' | 'linked_existing' | 'promoted_new_l6' | 'rejected'
  resolvedActivityId?: string
  plannerNotes?: string
  submittedBy: string
  createdAt: string
}

// ─── Discipline Spreadsheet Batch Ingest ─────────────────────────────────────

export interface DisciplineSpreadsheetRow {
  rowId: string
  date: string
  discipline: EngineeringDiscipline
  fieldDescription: string // e.g. "Spool 24-CS-01 erected at Unit 101"
  quantity: number
  unit: string
  location: string
  manpower: number
  subcontractor: string
  actualStartTime?: string
  actualEndTime?: string
  matchedActivityId?: string
  matchedActivityCode?: string
  matchedActivityName?: string
  confidence?: number
  status: 'matched' | 'unmatched' | 'needs_review'
  reasoning?: string
}

export interface BatchSpreadsheetResult {
  batchId: string
  fileName: string
  discipline: EngineeringDiscipline
  totalRows: number
  matchedCount: number
  reviewCount: number
  unmatchedCount: number
  rows: DisciplineSpreadsheetRow[]
  importedAt: string
}

// ─── Conversational Time Agent ───────────────────────────────────────────────

export interface TimeAgentMessage {
  id: string
  sender: 'user' | 'agent' | 'system'
  text: string
  timestamp: string
  audioUrl?: string
  isTranscribing?: boolean
  extractedEntities?: {
    discipline?: EngineeringDiscipline
    activity?: string
    quantity?: number
    unit?: string
    location?: string
    startTime?: string
    endTime?: string
    workforce?: number
    weather?: string
    matchedActivityCode?: string
    matchedActivityName?: string
    confidence?: number
  }
  scheduleUpdatePreview?: {
    activityId: string
    activityName: string
    discipline: EngineeringDiscipline
    oldProgress: number
    newProgress: number
    actualStart: string
    actualFinish?: string | null
    confidence: number
  }
}

// ─── Institutional Memory & Knowledge Engine ─────────────────────────────────

export interface HistoricalProject {
  id: string
  code: string
  name: string
  type: ProjectType
  disciplineFocus: string
  plannedDurationDays: number
  actualDurationDays: number
  varianceDays: number
  variancePercent: number
  primaryBottleneck: string
  completedDate: string
  contractor: string
  state: string
  terrain: 'plain' | 'hilly' | 'riverine' | 'marshy'
}

export interface RecurringBottleneck {
  id: string
  discipline: EngineeringDiscipline
  title: string
  causeCategory: 'weather' | 'vendor_delay' | 'inspection_rework' | 'row_clearance' | 'design_change' | 'manpower'
  frequencyPercent: number // e.g. 78% of past projects
  averageDelayDays: number
  typicalCostImpactINR: number
  mitigationStrategy: string
  sampleProjects: string[]
}

export interface ProductivityBenchmark {
  id: string
  discipline: EngineeringDiscipline
  activityType: string
  unit: string
  plannedBenchmarkRate: number // standard rate per crew/day
  actualHistoricalMedian: number
  p10Rate: number // conservative (monsoon/challenging conditions)
  p90Rate: number // optimal (dry season/flat plains)
  sampleSizeProjects: number
  recommendedContingencyBufferPercent: number
}

export interface KnowledgeQueryRecord {
  id: string
  query: string
  timestamp: string
  discipline?: EngineeringDiscipline
  aiResponse: string
  relevantBenchmarks: string[]
  recommendedBufferDays: number
}

// ─── Notifications & Alerts ──────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  projectId: string
  activityId?: string
  discipline?: EngineeringDiscipline
  type: 'delay' | 'critical_path' | 'spi_low' | 'no_update' | 'approval_needed' | 'milestone' | 'anomaly'
  severity: AlertSeverity
  title: string
  message: string
  daysImpact: number
  isRead: boolean
  createdAt: string
}

// ─── Anomaly Detection ───────────────────────────────────────────────────────

export type AnomalyType =
  | 'rate_spike'
  | 'weather_conflict'
  | 'sequence_violation'
  | 'duplicate_claim'
  | 'workforce_mismatch'
  | 'chainage_overlap'

export interface AnomalyReport {
  id: string
  projectId: string
  activityId: string
  activityName: string
  discipline?: EngineeringDiscipline
  dprEntryId?: string
  type: AnomalyType
  severity: 'critical' | 'high' | 'medium'
  confidence: number // 0-1
  title: string
  description: string
  evidence: {
    reportedValue: string
    expectedThreshold: string
    metric: string
  }
  detectedAt: string
  status: 'active' | 'investigating' | 'resolved' | 'dismissed'
  resolutionNotes?: string
  resolvedBy?: string
}

// ─── What-If CPM Simulation ──────────────────────────────────────────────────

export interface SimulationScenario {
  id: string
  name: string
  targetActivityId: string
  delayDays: number
  productivityModifier: number // e.g. 0.7 = 30% slower
  reason: string
}

export interface SimulationResult {
  scenarioId: string
  targetActivityId: string
  originalEndDate: string
  simulatedEndDate: string
  totalSlippageDays: number
  criticalPathChanged: boolean
  costImpactINR: number
  affectedActivities: {
    activityId: string
    name: string
    discipline?: EngineeringDiscipline
    originalStart: string
    simulatedStart: string
    originalFinish: string
    simulatedFinish: string
    delayDays: number
    isCritical: boolean
  }[]
}

// ─── Immutable Audit Log ─────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: UserRole
  discipline?: EngineeringDiscipline
  action:
    | 'dpr_submitted'
    | 'ai_auto_applied'
    | 'planner_approved'
    | 'planner_rejected'
    | 'activity_reassigned'
    | 'unmatched_promoted_l6'
    | 'spreadsheet_batch_imported'
    | 'time_agent_logged'
    | 'p6_xer_imported'
    | 'p6_xer_exported'
    | 'cpm_recalculated'
  entityId: string
  entityType: 'dpr' | 'activity' | 'schedule' | 'anomaly' | 'unmatched_queue'
  details: string
  oldValue?: string | null
  newValue?: string | null
  confidence?: number
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id: string
  type: 'dpr_entry' | 'activity_update' | 'approval'
  payload: unknown
  retryCount: number
  createdAt: string
  lastAttemptAt: string | null
  error: string | null
}

// ─── Dashboard & EVM ─────────────────────────────────────────────────────────

export interface SCurveDataPoint {
  date: string
  planned: number
  actual: number
  forecast?: number
  forecastLower?: number
  forecastUpper?: number
}

export interface WeeklyProgress {
  week: string
  planned: number
  actual: number
  variance: number
}

export interface User {
  id: string
  name: string
  role: UserRole
  projectIds: string[]
  avatar?: string
}
