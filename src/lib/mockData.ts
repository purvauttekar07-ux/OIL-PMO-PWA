import type {
  Project, P6Activity, WBSNode, AIProcessingResult,
  Alert, SCurveDataPoint, User, DPREntry, AnomalyReport, AuditLogEntry,
  UnmatchedActivity, DisciplineSpreadsheetRow, BatchSpreadsheetResult,
  HistoricalProject, RecurringBottleneck, ProductivityBenchmark, KnowledgeQueryRecord
} from '@/types'

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Rajesh Borah', role: 'field_supervisor', projectIds: ['p1', 'p2'] },
  { id: 'u2', name: 'Priya Gogoi', role: 'planner', projectIds: ['p1', 'p2', 'p3'] },
  { id: 'u3', name: 'Amit Sharma', role: 'pmo_manager', projectIds: ['p1', 'p2', 'p3'] },
  { id: 'u4', name: 'Dipankar Das', role: 'site_engineer', projectIds: ['p1'] },
]

export const CURRENT_USER: User = MOCK_USERS[0]

// ─── Projects ─────────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Numaligarh–Sivasagar Pipeline (48" Crude Carrier)',
    code: 'OIL-PL-2024-01',
    type: 'pipeline',
    location: 'Numaligarh to Sivasagar',
    district: 'Golaghat',
    state: 'Assam',
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    plannedProgress: 72,
    actualProgress: 61,
    status: 'delayed',
    contractValue: 485000000,
    contractor: 'Megha Engineering & Infra Ltd',
    spi: 0.84,
    cpi: 0.91,
    plannedValue: 349200000,
    earnedValue: 295850000,
    actualCost: 325100000,
  },
  {
    id: 'p2',
    name: 'Duliajan Refinery Expansion – Phase II',
    code: 'OIL-RF-2024-02',
    type: 'refinery',
    location: 'Duliajan',
    district: 'Dibrugarh',
    state: 'Assam',
    startDate: '2024-03-01',
    endDate: '2026-02-28',
    plannedProgress: 38,
    actualProgress: 35,
    status: 'in_progress',
    contractValue: 1200000000,
    contractor: 'Larsen & Toubro Limited',
    spi: 0.92,
    cpi: 0.96,
    plannedValue: 456000000,
    earnedValue: 420000000,
    actualCost: 437500000,
  },
  {
    id: 'p3',
    name: 'Arunachal Access Road – Miao to Naharlagun',
    code: 'OIL-RD-2024-03',
    type: 'road',
    location: 'Miao to Naharlagun',
    district: 'Changlang',
    state: 'Arunachal Pradesh',
    startDate: '2024-06-01',
    endDate: '2025-12-31',
    plannedProgress: 45,
    actualProgress: 28,
    status: 'delayed',
    contractValue: 320000000,
    contractor: 'NPCC Limited',
    spi: 0.62,
    cpi: 0.78,
    plannedValue: 144000000,
    earnedValue: 89600000,
    actualCost: 114870000,
  },
]

// ─── Multi-Discipline WBS (L1 through L6) ──────────────────────────────────────

export const MOCK_WBS: WBSNode[] = [
  // L1 - Root Project
  { id: 'w1', projectId: 'p1', wbsCode: '1', name: 'Numaligarh–Sivasagar 48" Pipeline & Terminal', parentId: null, level: 0, wbsLevel: 'L1' },
  
  // L2 - Major Facilities / Subprojects
  { id: 'w2', projectId: 'p1', wbsCode: '1.1', name: 'Right of Way & Pre-Construction', parentId: 'w1', level: 1, wbsLevel: 'L2', discipline: 'civil' },
  { id: 'w3', projectId: 'p1', wbsCode: '1.2', name: 'Civil & Structural Works', parentId: 'w1', level: 1, wbsLevel: 'L2', discipline: 'civil' },
  { id: 'w6', projectId: 'p1', wbsCode: '1.3', name: 'Mainline Mechanical & Piping Works', parentId: 'w1', level: 1, wbsLevel: 'L2', discipline: 'piping' },
  { id: 'w15', projectId: 'p1', wbsCode: '1.4', name: 'Static & Rotating Equipment Packages', parentId: 'w1', level: 1, wbsLevel: 'L2', discipline: 'equipment' },
  { id: 'w18', projectId: 'p1', wbsCode: '1.5', name: 'Electrical Power Infrastructure', parentId: 'w1', level: 1, wbsLevel: 'L2', discipline: 'electrical' },
  { id: 'w21', projectId: 'p1', wbsCode: '1.6', name: 'Instrumentation, SCADA & Telecom', parentId: 'w1', level: 1, wbsLevel: 'L2', discipline: 'instrumentation' },
  { id: 'w24', projectId: 'p1', wbsCode: '1.7', name: 'HSE & Environmental Compliance', parentId: 'w1', level: 1, wbsLevel: 'L2', discipline: 'hse' },
  { id: 'w13', projectId: 'p1', wbsCode: '1.8', name: 'Commissioning & Reinstatement', parentId: 'w1', level: 1, wbsLevel: 'L2', discipline: 'civil' },

  // L3 - Discipline Work Packages
  { id: 'w4', projectId: 'p1', wbsCode: '1.2.1', name: 'Grading & Land Grubbing', parentId: 'w3', level: 2, wbsLevel: 'L3', discipline: 'civil' },
  { id: 'w5', projectId: 'p1', wbsCode: '1.2.2', name: 'Trench Excavation & Shoring', parentId: 'w3', level: 2, wbsLevel: 'L3', discipline: 'civil' },
  { id: 'w5b', projectId: 'p1', wbsCode: '1.2.3', name: 'Equipment Foundation & Civil Plinths', parentId: 'w3', level: 2, wbsLevel: 'L3', discipline: 'civil' },
  
  { id: 'w7', projectId: 'p1', wbsCode: '1.3.1', name: 'Pipe Stringing & Cold Bending', parentId: 'w6', level: 2, wbsLevel: 'L3', discipline: 'piping' },
  { id: 'w8', projectId: 'p1', wbsCode: '1.3.2', name: 'Trench Lowering & Laying', parentId: 'w6', level: 2, wbsLevel: 'L3', discipline: 'piping' },
  { id: 'w9', projectId: 'p1', wbsCode: '1.3.3', name: 'Mainline Butt Welding & Fabrication', parentId: 'w6', level: 2, wbsLevel: 'L3', discipline: 'piping' },
  { id: 'w10', projectId: 'p1', wbsCode: '1.3.4', name: 'NDT Radiographic & Ultrasonic Testing', parentId: 'w6', level: 2, wbsLevel: 'L3', discipline: 'piping' },
  { id: 'w14', projectId: 'p1', wbsCode: '1.3.5', name: 'Terminal Piping Spool Erection & Tie-In', parentId: 'w6', level: 2, wbsLevel: 'L3', discipline: 'piping' },
  
  { id: 'w16', projectId: 'p1', wbsCode: '1.4.1', name: 'Gas Booster Compressor Package C-201', parentId: 'w15', level: 2, wbsLevel: 'L3', discipline: 'equipment' },
  { id: 'w17', projectId: 'p1', wbsCode: '1.4.2', name: 'Terminal Crude Booster Pumps & Skids', parentId: 'w15', level: 2, wbsLevel: 'L3', discipline: 'equipment' },
  
  { id: 'w19', projectId: 'p1', wbsCode: '1.5.1', name: '11kV Main Receiving Substation (MRS)', parentId: 'w18', level: 2, wbsLevel: 'L3', discipline: 'electrical' },
  { id: 'w20', projectId: 'p1', wbsCode: '1.5.2', name: 'Cathodic Protection & Feeder Cabling', parentId: 'w18', level: 2, wbsLevel: 'L3', discipline: 'electrical' },
  
  { id: 'w22', projectId: 'p1', wbsCode: '1.6.1', name: 'DCS Marshalling & Control Cabinets', parentId: 'w21', level: 2, wbsLevel: 'L3', discipline: 'instrumentation' },
  { id: 'w23', projectId: 'p1', wbsCode: '1.6.2', name: 'Field Transmitter Tubing & Loop Tests', parentId: 'w21', level: 2, wbsLevel: 'L3', discipline: 'instrumentation' },
  
  { id: 'w25', projectId: 'p1', wbsCode: '1.7.1', name: 'Work Permits, Gas Sniffing & Audits', parentId: 'w24', level: 2, wbsLevel: 'L3', discipline: 'hse' },
]

// ─── Multi-Discipline Activities (L4 / L5 / L6 Nodes) ──────────────────────────

export const MOCK_ACTIVITIES: P6Activity[] = [
  // ── CIVIL DISCIPLINE ──
  {
    id: 'a1', activityId: 'A1010', projectId: 'p1', wbsId: 'w2', wbsCode: '1.1',
    name: 'Survey & Right of Way Demarcation',
    discipline: 'civil', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['survey', 'row', 'right of way', 'demarcation', 'boundary', 'alignment', 'centerline'],
    fieldJargonSynonyms: ['row demarcated', 'centerline staked', 'boundary marked', 'peg survey'],
    plannedStart: '2024-01-15', plannedFinish: '2024-02-28',
    actualStart: '2024-01-15', actualFinish: '2024-02-25',
    earlyStart: '2024-01-15', earlyFinish: '2024-02-28',
    lateStart: '2024-01-15', lateFinish: '2024-02-28',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 44, remainingDuration: 0,
    plannedProgress: 100, actualProgress: 100,
    status: 'completed', isCritical: false,
    predecessors: [], successors: ['a2'],
    unit: 'km', totalQuantity: 148, completedQuantity: 148,
    location: 'Ch. 0+000 to Ch. 148+000', chainage: '0+000 to 148+000',
    budgetCost: 15000000, actualCost: 14500000, maxDailyCapacity: 6,
  },
  {
    id: 'a2', activityId: 'A1020', projectId: 'p1', wbsId: 'w4', wbsCode: '1.2.1',
    name: 'Land Clearing & Grubbing',
    discipline: 'civil', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['land clearing', 'grubbing', 'vegetation removal', 'clearing', 'jungle cutting', 'tree felling'],
    fieldJargonSynonyms: ['clearing done', 'jungle cleared', 'bush cutting', 'grubbing completed'],
    plannedStart: '2024-02-01', plannedFinish: '2024-04-15',
    actualStart: '2024-02-05', actualFinish: '2024-04-20',
    earlyStart: '2024-02-01', earlyFinish: '2024-04-15',
    lateStart: '2024-02-01', lateFinish: '2024-04-15',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 74, remainingDuration: 0,
    plannedProgress: 100, actualProgress: 100,
    status: 'completed', isCritical: true,
    predecessors: ['a1'], successors: ['a3'],
    unit: 'km', totalQuantity: 148, completedQuantity: 148,
    location: 'Full alignment', chainage: '0+000 to 148+000',
    budgetCost: 28000000, actualCost: 29000000, maxDailyCapacity: 5,
  },
  {
    id: 'a3', activityId: 'A1030', projectId: 'p1', wbsId: 'w5', wbsCode: '1.2.2',
    name: 'Trench Excavation',
    discipline: 'civil', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['trench', 'excavation', 'digging', 'trench cutting', 'trenching', 'trench dig', 'excavated'],
    fieldJargonSynonyms: ['ditch dug', 'trench cut', 'excavator run', 'trench opened'],
    plannedStart: '2024-03-15', plannedFinish: '2024-07-30',
    actualStart: '2024-03-20', actualFinish: null,
    earlyStart: '2024-03-15', earlyFinish: '2024-07-30',
    lateStart: '2024-03-15', lateFinish: '2024-07-30',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 137, remainingDuration: 18,
    plannedProgress: 90, actualProgress: 82,
    status: 'in_progress', isCritical: true,
    predecessors: ['a2'], successors: ['a4', 'a5'],
    unit: 'meters', totalQuantity: 148000, completedQuantity: 121360,
    location: 'Ch. 0+000 to Ch. 148+000', chainage: 'Multiple',
    budgetCost: 75000000, actualCost: 68000000, maxDailyCapacity: 1200,
    subActivities: [
      { id: 'sa1', name: 'Micro-trenching Ch 62+400 to 62+650', completed: true, quantity: 250 },
      { id: 'sa2', name: 'Rock breaker chipping at Ch 62+700', completed: false, quantity: 180 },
    ]
  },
  {
    id: 'a11', activityId: 'A1110', projectId: 'p1', wbsId: 'w5b', wbsCode: '1.2.3',
    name: 'Compressor & Equipment Foundation Casting',
    discipline: 'civil', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['foundation', 'concrete', 'casting', 'rebar', 'pcc', 'rcc', 'shuttering', 'raft'],
    fieldJargonSynonyms: ['mud mat poured', 'raft cast', 'rebar tied', 'shuttering stripped', 'cube test passed'],
    plannedStart: '2024-04-01', plannedFinish: '2024-07-15',
    actualStart: '2024-04-10', actualFinish: '2024-07-28',
    earlyStart: '2024-04-01', earlyFinish: '2024-07-15',
    lateStart: '2024-04-15', lateFinish: '2024-07-30',
    totalFloat: 15, freeFloat: 5,
    plannedDuration: 105, remainingDuration: 0,
    plannedProgress: 100, actualProgress: 100,
    status: 'completed', isCritical: false,
    predecessors: ['a2'], successors: ['a12'],
    unit: 'cum', totalQuantity: 1250, completedQuantity: 1250,
    location: 'Terminal Unit 101 Plinth',
    budgetCost: 22000000, actualCost: 23800000, maxDailyCapacity: 45,
  },

  // ── PIPING DISCIPLINE ──
  {
    id: 'a4', activityId: 'A1040', projectId: 'p1', wbsId: 'w7', wbsCode: '1.3.1',
    name: 'Pipe Stringing & Bending',
    discipline: 'piping', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['pipe stringing', 'stringing', 'bending', 'pipe bending', 'string', 'bends', 'cold bend'],
    fieldJargonSynonyms: ['pipes lined up', 'stringing along trench', 'cold bend formed', 'pipes laid out'],
    plannedStart: '2024-05-01', plannedFinish: '2024-08-31',
    actualStart: '2024-05-08', actualFinish: null,
    earlyStart: '2024-05-01', earlyFinish: '2024-08-31',
    lateStart: '2024-05-15', lateFinish: '2024-09-14',
    totalFloat: 14, freeFloat: 5,
    plannedDuration: 122, remainingDuration: 12,
    plannedProgress: 88, actualProgress: 80,
    status: 'in_progress', isCritical: false,
    predecessors: ['a3'], successors: ['a5'],
    unit: 'meters', totalQuantity: 148000, completedQuantity: 118400,
    location: 'Multiple sections', chainage: 'Multiple',
    budgetCost: 45000000, actualCost: 39000000, maxDailyCapacity: 1500,
  },
  {
    id: 'a5', activityId: 'A1050', projectId: 'p1', wbsId: 'w8', wbsCode: '1.3.2',
    name: 'Pipe Lowering & Laying',
    discipline: 'piping', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['pipe laying', 'laying', 'lowering', 'pipe lowering', 'lowering in', 'pipe lay', 'pipelaying', 'laid'],
    fieldJargonSynonyms: ['lowered in', 'spool in ditch', 'pipe dropped in trench', 'sideboom lowering'],
    plannedStart: '2024-06-01', plannedFinish: '2024-09-30',
    actualStart: '2024-06-10', actualFinish: null,
    earlyStart: '2024-06-01', earlyFinish: '2024-09-30',
    lateStart: '2024-06-01', lateFinish: '2024-09-30',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 121, remainingDuration: 22,
    plannedProgress: 75, actualProgress: 58,
    status: 'delayed', isCritical: true,
    predecessors: ['a4'], successors: ['a6'],
    unit: 'meters', totalQuantity: 148000, completedQuantity: 85840,
    location: 'Ch. 0+000 to Ch. 85+840', chainage: '0+000 to 85+840',
    budgetCost: 95000000, actualCost: 82000000, maxDailyCapacity: 1000,
  },
  {
    id: 'a6', activityId: 'A1060', projectId: 'p1', wbsId: 'w9', wbsCode: '1.3.3',
    name: 'Mainline Butt Welding & Fabrication',
    discipline: 'piping', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['welding', 'weld', 'joint', 'butt weld', 'welding works', 'welds', 'welded', 'root pass', 'hot pass'],
    fieldJargonSynonyms: ['joints welded', 'golden joint done', 'root welded', 'capping complete', 'tie-in weld'],
    plannedStart: '2024-07-01', plannedFinish: '2024-10-31',
    actualStart: '2024-07-08', actualFinish: null,
    earlyStart: '2024-07-01', earlyFinish: '2024-10-31',
    lateStart: '2024-07-01', lateFinish: '2024-10-31',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 122, remainingDuration: 35,
    plannedProgress: 68, actualProgress: 50,
    status: 'delayed', isCritical: true,
    predecessors: ['a5'], successors: ['a7'],
    unit: 'joints', totalQuantity: 4800, completedQuantity: 2400,
    location: 'Multiple', chainage: '0+000 to 85+840',
    budgetCost: 85000000, actualCost: 71000000, maxDailyCapacity: 60,
  },
  {
    id: 'a7', activityId: 'A1070', projectId: 'p1', wbsId: 'w10', wbsCode: '1.3.4',
    name: 'NDT & Radiographic Inspection',
    discipline: 'piping', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['ndt', 'radiographic', 'testing', 'inspection', 'ultrasonic', 'rt', 'x-ray', 'radiography', 'weld test'],
    fieldJargonSynonyms: ['rt done', 'x-ray passed', 'joint clearance', 'ut scan', 'ndt clear'],
    plannedStart: '2024-08-01', plannedFinish: '2024-11-30',
    actualStart: '2024-08-10', actualFinish: null,
    earlyStart: '2024-08-01', earlyFinish: '2024-11-30',
    lateStart: '2024-08-15', lateFinish: '2024-12-14',
    totalFloat: 14, freeFloat: 14,
    plannedDuration: 121, remainingDuration: 40,
    plannedProgress: 55, actualProgress: 40,
    status: 'in_progress', isCritical: false,
    predecessors: ['a6'], successors: ['a8'],
    unit: 'joints', totalQuantity: 4800, completedQuantity: 1920,
    location: 'Multiple', chainage: 'Multiple',
    budgetCost: 32000000, actualCost: 26000000, maxDailyCapacity: 70,
  },
  {
    id: 'a14', activityId: 'A2040', projectId: 'p1', wbsId: 'w14', wbsCode: '1.3.5',
    name: 'Erect Line 24"-CS-01 Process Piping Spools (Unit 101)',
    discipline: 'piping', wbsLevel: 'L5', granularity: 'micro',
    keywords: ['spool', 'erect line', 'spool erection', 'line 24', 'piping spool', 'flange fit-up', 'isometric'],
    fieldJargonSynonyms: ['spool erected', 'spool fitted', 'line 24 erected', 'spool hung', 'spool bolted up', 'flange aligned'],
    plannedStart: '2024-08-15', plannedFinish: '2024-11-15',
    actualStart: '2024-08-20', actualFinish: null,
    earlyStart: '2024-08-15', earlyFinish: '2024-11-15',
    lateStart: '2024-08-20', lateFinish: '2024-11-20',
    totalFloat: 5, freeFloat: 5,
    plannedDuration: 92, remainingDuration: 45,
    plannedProgress: 42, actualProgress: 36,
    status: 'in_progress', isCritical: false,
    predecessors: ['a11'], successors: ['a12'],
    unit: 'spools', totalQuantity: 180, completedQuantity: 65,
    location: 'Terminal Process Unit 101',
    budgetCost: 28000000, actualCost: 22000000, maxDailyCapacity: 4,
  },

  // ── STATIC & ROTATING EQUIPMENT DISCIPLINE ──
  {
    id: 'a12', activityId: 'A3010', projectId: 'p1', wbsId: 'w16', wbsCode: '1.4.1',
    name: 'Erect & Align Gas Booster Compressor C-201',
    discipline: 'equipment', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['compressor', 'c-201', 'equipment erection', 'alignment', 'skid placement', 'cold alignment', 'grouting', 'baseplate'],
    fieldJargonSynonyms: ['compressor placed', 'skid positioned', 'alignment checked', 'cold box aligned', 'baseplate grouted'],
    plannedStart: '2024-08-20', plannedFinish: '2024-10-30',
    actualStart: '2024-08-28', actualFinish: null,
    earlyStart: '2024-08-20', earlyFinish: '2024-10-30',
    lateStart: '2024-08-20', lateFinish: '2024-10-30',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 71, remainingDuration: 30,
    plannedProgress: 48, actualProgress: 35,
    status: 'delayed', isCritical: true,
    predecessors: ['a11'], successors: ['a15'],
    unit: 'packages', totalQuantity: 2, completedQuantity: 0.7,
    location: 'Compressor House Bay A',
    budgetCost: 88000000, actualCost: 79000000, maxDailyCapacity: 0.1,
  },
  {
    id: 'a13', activityId: 'A3020', projectId: 'p1', wbsId: 'w17', wbsCode: '1.4.2',
    name: 'Install Terminal Crude Booster Pumps (P-101A/B)',
    discipline: 'equipment', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['pump', 'booster pump', 'p-101', 'motor skid', 'pump placement', 'coupling'],
    fieldJargonSynonyms: ['pump installed', 'pump grouted', 'coupling aligned', 'motor set on base'],
    plannedStart: '2024-09-01', plannedFinish: '2024-11-15',
    actualStart: '2024-09-05', actualFinish: null,
    earlyStart: '2024-09-01', earlyFinish: '2024-11-15',
    lateStart: '2024-09-10', lateFinish: '2024-11-25',
    totalFloat: 9, freeFloat: 9,
    plannedDuration: 75, remainingDuration: 42,
    plannedProgress: 35, actualProgress: 25,
    status: 'in_progress', isCritical: false,
    predecessors: ['a11'], successors: ['a15'],
    unit: 'units', totalQuantity: 4, completedQuantity: 1,
    location: 'Pump Station Manifold Area',
    budgetCost: 44000000, actualCost: 31000000, maxDailyCapacity: 0.2,
  },

  // ── ELECTRICAL DISCIPLINE ──
  {
    id: 'a15', activityId: 'A4010', projectId: 'p1', wbsId: 'w19', wbsCode: '1.5.1',
    name: '11kV Substation Switchgear & Transformer Installation',
    discipline: 'electrical', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['substation', '11kv', 'transformer', 'switchgear', 'mrs', 'breaker', 'busbar'],
    fieldJargonSynonyms: ['transformer set', 'switchgear placed', 'breaker racked', 'busbar torqued', 'mrs ready'],
    plannedStart: '2024-09-15', plannedFinish: '2024-12-15',
    actualStart: null, actualFinish: null,
    earlyStart: '2024-09-15', earlyFinish: '2024-12-15',
    lateStart: '2024-09-25', lateFinish: '2024-12-25',
    totalFloat: 10, freeFloat: 10,
    plannedDuration: 91, remainingDuration: 91,
    plannedProgress: 15, actualProgress: 5,
    status: 'delayed', isCritical: false,
    predecessors: ['a12'], successors: ['a16'],
    unit: 'panels', totalQuantity: 18, completedQuantity: 2,
    location: 'Substation Building SS-01',
    budgetCost: 52000000, actualCost: 12000000, maxDailyCapacity: 1,
  },
  {
    id: 'a16', activityId: 'A4020', projectId: 'p1', wbsId: 'w20', wbsCode: '1.5.2',
    name: 'Pull 11kV Feeder & Motor Power Cables (Cable Tray Pulling)',
    discipline: 'electrical', wbsLevel: 'L5', granularity: 'micro',
    keywords: ['cable', 'cable tray', 'feeder', 'cable pulling', '11kv cable', 'glanding', 'megger', 'termination'],
    fieldJargonSynonyms: ['pulled 300m cable', 'cable pulled in tray', 'drum laid', 'glanded and terminated', 'megger tested ok'],
    plannedStart: '2024-10-01', plannedFinish: '2025-01-15',
    actualStart: null, actualFinish: null,
    earlyStart: '2024-10-01', earlyFinish: '2025-01-15',
    lateStart: '2024-10-15', lateFinish: '2025-01-30',
    totalFloat: 14, freeFloat: 14,
    plannedDuration: 106, remainingDuration: 106,
    plannedProgress: 0, actualProgress: 0,
    status: 'not_started', isCritical: false,
    predecessors: ['a15'], successors: ['a17'],
    unit: 'meters', totalQuantity: 18500, completedQuantity: 0,
    location: 'Terminal Cable Trench & Trays',
    budgetCost: 36000000, actualCost: 0, maxDailyCapacity: 400,
  },

  // ── INSTRUMENTATION DISCIPLINE ──
  {
    id: 'a17', activityId: 'A5010', projectId: 'p1', wbsId: 'w22', wbsCode: '1.6.1',
    name: 'DCS Marshalling Cabinet Termination & Earthing',
    discipline: 'instrumentation', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['dcs', 'marshalling', 'cabinet', 'termination', 'i/o card', 'scada', 'plc', 'ferrule'],
    fieldJargonSynonyms: ['marshalling done', 'cabinet wired', 'ferruled and terminated', 'i/o verified'],
    plannedStart: '2024-11-01', plannedFinish: '2025-02-15',
    actualStart: null, actualFinish: null,
    earlyStart: '2024-11-01', earlyFinish: '2025-02-15',
    lateStart: '2024-11-01', lateFinish: '2025-02-15',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 106, remainingDuration: 106,
    plannedProgress: 0, actualProgress: 0,
    status: 'not_started', isCritical: true,
    predecessors: ['a16'], successors: ['a18'],
    unit: 'cabinets', totalQuantity: 8, completedQuantity: 0,
    location: 'Central Control Room (CCR)',
    budgetCost: 29000000, actualCost: 0, maxDailyCapacity: 0.2,
  },
  {
    id: 'a18', activityId: 'A5020', projectId: 'p1', wbsId: 'w23', wbsCode: '1.6.2',
    name: 'Field Instrument Tubing & Cold Loop Checking',
    discipline: 'instrumentation', wbsLevel: 'L5', granularity: 'micro',
    keywords: ['transmitters', 'tubing', 'loop checking', 'loop test', 'pressure transmitter', 'flowmeter', 'calibration'],
    fieldJargonSynonyms: ['loop checked', '4-20ma loop tested', 'transmitter calibrated', 'impulse line tubed', 'cold loop ok'],
    plannedStart: '2024-12-01', plannedFinish: '2025-03-15',
    actualStart: null, actualFinish: null,
    earlyStart: '2024-12-01', earlyFinish: '2025-03-15',
    lateStart: '2024-12-01', lateFinish: '2025-03-15',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 104, remainingDuration: 104,
    plannedProgress: 0, actualProgress: 0,
    status: 'not_started', isCritical: true,
    predecessors: ['a17'], successors: ['a9'],
    unit: 'loops', totalQuantity: 340, completedQuantity: 0,
    location: 'Process Area & Pipeline Manifold',
    budgetCost: 24000000, actualCost: 0, maxDailyCapacity: 8,
  },

  // ── HSE DISCIPLINE ──
  {
    id: 'a19', activityId: 'A6010', projectId: 'p1', wbsId: 'w25', wbsCode: '1.7.1',
    name: 'Hot Work Permits & Trench Safety Shoring Certification',
    discipline: 'hse', wbsLevel: 'L5', granularity: 'micro',
    keywords: ['safety', 'permit', 'hot work', 'trench shoring', 'gas test', 'clearance', 'toolbox talk', 'scaffolding tag'],
    fieldJargonSynonyms: ['hot work permit signed', 'gas tested zero lel', 'green tag on scaffold', 'trench barricaded', 'tbt conducted'],
    plannedStart: '2024-01-15', plannedFinish: '2025-06-30',
    actualStart: '2024-01-15', actualFinish: null,
    earlyStart: '2024-01-15', earlyFinish: '2025-06-30',
    lateStart: '2024-01-15', lateFinish: '2025-06-30',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 532, remainingDuration: 280,
    plannedProgress: 70, actualProgress: 68,
    status: 'in_progress', isCritical: false,
    predecessors: [], successors: [],
    unit: 'permits', totalQuantity: 950, completedQuantity: 646,
    location: 'All Active Sectors',
    budgetCost: 12000000, actualCost: 11400000, maxDailyCapacity: 5,
  },

  // ── TESTING & REINSTATEMENT ──
  {
    id: 'a8', activityId: 'A1080', projectId: 'p1', wbsId: 'w6', wbsCode: '1.3',
    name: 'Anti-Corrosion Joint Coating & Field Wrapping',
    discipline: 'piping', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['coating', 'wrapping', 'anti-corrosion', 'tape wrapping', 'fbe', 'epoxy coating', 'shrink sleeve'],
    fieldJargonSynonyms: ['shrink sleeve shrunk', 'holiday detector pass', 'joint coated', 'wrapping complete'],
    plannedStart: '2024-08-15', plannedFinish: '2024-12-15',
    actualStart: null, actualFinish: null,
    earlyStart: '2024-08-15', earlyFinish: '2024-12-15',
    lateStart: '2024-08-15', lateFinish: '2024-12-15',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 122, remainingDuration: 122,
    plannedProgress: 30, actualProgress: 0,
    status: 'not_started', isCritical: true,
    predecessors: ['a7'], successors: ['a9'],
    unit: 'meters', totalQuantity: 148000, completedQuantity: 0,
    location: 'Multiple', chainage: 'Multiple',
    budgetCost: 42000000, actualCost: 0, maxDailyCapacity: 1200,
  },
  {
    id: 'a9', activityId: 'A1090', projectId: 'p1', wbsId: 'w1', wbsCode: '1',
    name: 'Full Mainline Hydrotesting (Section 1 to 12)',
    discipline: 'piping', wbsLevel: 'L5', granularity: 'macro',
    keywords: ['hydrotesting', 'hydro test', 'pressure test', 'hydrotest', 'water pressure', 'dewatering'],
    fieldJargonSynonyms: ['hydro done', 'pressure held 24hr', 'pipeline pressurized', 'water filling'],
    plannedStart: '2025-01-01', plannedFinish: '2025-03-31',
    actualStart: null, actualFinish: null,
    earlyStart: '2025-01-01', earlyFinish: '2025-03-31',
    lateStart: '2025-01-01', lateFinish: '2025-03-31',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 89, remainingDuration: 89,
    plannedProgress: 0, actualProgress: 0,
    status: 'not_started', isCritical: true,
    predecessors: ['a8', 'a18'], successors: ['a10'],
    unit: 'sections', totalQuantity: 12, completedQuantity: 0,
    location: 'Multiple', chainage: 'Multiple',
    budgetCost: 38000000, actualCost: 0, maxDailyCapacity: 2,
  },
  {
    id: 'a10', activityId: 'A1100', projectId: 'p1', wbsId: 'w13', wbsCode: '1.8',
    name: 'Trench Backfilling & RoW Reinstatement',
    discipline: 'civil', wbsLevel: 'L5', granularity: 'standard',
    keywords: ['backfilling', 'backfill', 'reinstatement', 'soil compaction', 'restoration', 'fill', 'padding'],
    fieldJargonSynonyms: ['trench backfilled', 'padding poured', 'row leveled', 'crown compacted'],
    plannedStart: '2025-03-15', plannedFinish: '2025-06-30',
    actualStart: null, actualFinish: null,
    earlyStart: '2025-03-15', earlyFinish: '2025-06-30',
    lateStart: '2025-03-15', lateFinish: '2025-06-30',
    totalFloat: 0, freeFloat: 0,
    plannedDuration: 107, remainingDuration: 107,
    plannedProgress: 0, actualProgress: 0,
    status: 'not_started', isCritical: true,
    predecessors: ['a9'], successors: [],
    unit: 'meters', totalQuantity: 148000, completedQuantity: 0,
    location: 'Full alignment', chainage: '0+000 to 148+000',
    budgetCost: 30000000, actualCost: 0, maxDailyCapacity: 1500,
  },
]

// ─── Unmatched / New Activities HITL Queue ───────────────────────────────────

export const MOCK_UNMATCHED_ACTIVITIES: UnmatchedActivity[] = [
  {
    id: 'unm_1',
    dprEntryId: 'dpr_unm_101',
    reportedText: 'Constructed temporary RCC culvert detour bypass at Ch. 44+200 due to flash flood washaway of PWD road.',
    discipline: 'civil',
    extractedQuantity: 1,
    extractedUnit: 'detour culvert',
    extractedLocation: 'Ch. 44+200',
    suggestedParentWbsId: 'w3',
    status: 'pending_review',
    plannerNotes: 'Unplanned contingency work. Candidate to promote to new L6 activity under Civil Works or claim as contractor extra.',
    submittedBy: 'Rajesh Borah (Civil Foreman)',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'unm_2',
    dprEntryId: 'dpr_unm_102',
    reportedText: 'Installed 4x 500kVA temporary diesel generators with cabling for site night welding lighting.',
    discipline: 'electrical',
    extractedQuantity: 4,
    extractedUnit: 'generators',
    extractedLocation: 'Sector 2 Pipe Yard',
    suggestedParentWbsId: 'w18',
    status: 'pending_review',
    plannerNotes: 'Contractor indirect enablement activity; verify if tracking under WBS 1.5 or contractor site overhead.',
    submittedBy: 'Pranjal Neog (Electrical Lead)',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'unm_3',
    dprEntryId: 'dpr_unm_103',
    reportedText: 'Fabricated custom nitrogen purging manifold for testing station tie-in valve battery.',
    discipline: 'piping',
    extractedQuantity: 1,
    extractedUnit: 'manifold',
    extractedLocation: 'Terminal Station Tie-In',
    suggestedParentWbsId: 'w14',
    status: 'pending_review',
    plannerNotes: 'Micro-fabrication task under Terminal Spool Works; suggested promotion to L6 micro-activity under A2040.',
    submittedBy: 'Dipankar Das (Site Engineer)',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  }
]

// ─── Discipline Spreadsheet Batch Templates & Samples ─────────────────────────

export const MOCK_SPREADSHEET_TEMPLATES: Record<string, { name: string; discipline: string; rows: DisciplineSpreadsheetRow[] }> = {
  piping: {
    name: 'Piping Discipline - Daily Spool & Joint Tracker.csv',
    discipline: 'piping',
    rows: [
      {
        rowId: 'pip_1', date: '2024-09-10', discipline: 'piping',
        fieldDescription: 'Spool 24-CS-01 erected and tack welded at Unit 101 header',
        quantity: 2, unit: 'spools', location: 'Unit 101', manpower: 14, subcontractor: 'Megha Piping Team',
        actualStartTime: '08:00', actualEndTime: '16:30',
        matchedActivityId: 'a14', matchedActivityCode: 'A2040', matchedActivityName: 'Erect Line 24"-CS-01 Process Piping Spools',
        confidence: 0.94, status: 'matched', reasoning: 'Matched "spool erected" and "Line 24-CS-01" to A2040 with 94% confidence.'
      },
      {
        rowId: 'pip_2', date: '2024-09-10', discipline: 'piping',
        fieldDescription: 'Butt welding of 18 mainline joints between Ch. 54+100 and 54+600',
        quantity: 18, unit: 'joints', location: 'Ch. 54+100', manpower: 22, subcontractor: 'Precision Welds Ltd',
        actualStartTime: '07:30', actualEndTime: '17:00',
        matchedActivityId: 'a6', matchedActivityCode: 'A1060', matchedActivityName: 'Mainline Butt Welding & Fabrication',
        confidence: 0.91, status: 'matched', reasoning: 'Matched "butt welding" and joints count to A1060.'
      },
      {
        rowId: 'pip_3', date: '2024-09-10', discipline: 'piping',
        fieldDescription: 'Radiography testing of 16 completed mainline welds (14 cleared, 2 slag defect)',
        quantity: 16, unit: 'joints', location: 'Ch. 53+800', manpower: 6, subcontractor: 'NDT Inspection Agency',
        actualStartTime: '19:00', actualEndTime: '02:00',
        matchedActivityId: 'a7', matchedActivityCode: 'A1070', matchedActivityName: 'NDT & Radiographic Inspection',
        confidence: 0.89, status: 'matched', reasoning: 'Matched "radiography testing" to A1070 with high fidelity.'
      },
      {
        rowId: 'pip_4', date: '2024-09-10', discipline: 'piping',
        fieldDescription: 'Fabricated nitrogen purge skid test manifold',
        quantity: 1, unit: 'manifold', location: 'Terminal Yard', manpower: 4, subcontractor: 'Megha Piping Team',
        confidence: 0.42, status: 'unmatched', reasoning: 'No direct L5 schedule node for nitrogen skid test manifold; flagged for planner review.'
      }
    ]
  },
  civil: {
    name: 'Civil Discipline - Daily Progress Log.xlsx',
    discipline: 'civil',
    rows: [
      {
        rowId: 'civ_1', date: '2024-09-10', discipline: 'civil',
        fieldDescription: 'Trench excavation in soft soil Ch. 63+100 to 63+450 (350 meters)',
        quantity: 350, unit: 'meters', location: 'Ch. 63+100', manpower: 28, subcontractor: 'Assam Earthmovers',
        actualStartTime: '08:00', actualEndTime: '17:30',
        matchedActivityId: 'a3', matchedActivityCode: 'A1030', matchedActivityName: 'Trench Excavation',
        confidence: 0.96, status: 'matched', reasoning: 'Exact keyword match "trench excavation" and chainage.'
      },
      {
        rowId: 'civ_2', date: '2024-09-10', discipline: 'civil',
        fieldDescription: 'Mud mat PCC 1:3:6 poured for Compressor Foundation C-201',
        quantity: 35, unit: 'cum', location: 'Terminal Plinth', manpower: 16, subcontractor: 'NorthEast Infra',
        actualStartTime: '09:00', actualEndTime: '14:00',
        matchedActivityId: 'a11', matchedActivityCode: 'A1110', matchedActivityName: 'Compressor & Equipment Foundation Casting',
        confidence: 0.88, status: 'matched', reasoning: 'Jargon match: "mud mat PCC poured" -> A1110 Foundation Casting.'
      },
      {
        rowId: 'civ_3', date: '2024-09-10', discipline: 'civil',
        fieldDescription: 'Constructed brick masonry drainage catchpit at perimeter wall',
        quantity: 2, unit: 'nos', location: 'Substation boundary', manpower: 8, subcontractor: 'Assam Civil Works',
        confidence: 0.38, status: 'unmatched', reasoning: 'Perimeter drainage pit not linked to mainline WBS; sent to review queue.'
      }
    ]
  },
  electrical: {
    name: 'Electrical Discipline - Cable & Panel Schedule.csv',
    discipline: 'electrical',
    rows: [
      {
        rowId: 'ele_1', date: '2024-09-10', discipline: 'electrical',
        fieldDescription: 'Pulled 450m of 11kV 3C x 300 sq.mm XLPE armored feeder cable in main trench tray',
        quantity: 450, unit: 'meters', location: 'Terminal Cable Route B', manpower: 18, subcontractor: 'Brahmaputra Power Tech',
        actualStartTime: '08:30', actualEndTime: '16:00',
        matchedActivityId: 'a16', matchedActivityCode: 'A4020', matchedActivityName: 'Pull 11kV Feeder & Motor Power Cables',
        confidence: 0.95, status: 'matched', reasoning: 'Matched "pulled 11kV cable" to A4020 cable pulling.'
      },
      {
        rowId: 'ele_2', date: '2024-09-10', discipline: 'electrical',
        fieldDescription: 'Positioned and bolted 2x 11kV Incomer Vacuum Circuit Breaker panels at MRS-01',
        quantity: 2, unit: 'panels', location: 'Substation SS-01', manpower: 10, subcontractor: 'ABB / Local Partner',
        actualStartTime: '10:00', actualEndTime: '15:30',
        matchedActivityId: 'a15', matchedActivityCode: 'A4010', matchedActivityName: '11kV Substation Switchgear & Transformer Installation',
        confidence: 0.92, status: 'matched', reasoning: 'Matched "breaker panels positioned" to A4010 Switchgear installation.'
      }
    ]
  }
}

// ─── ML Anomaly Reports ──────────────────────────────────────────────────────

export const MOCK_ANOMALIES: AnomalyReport[] = [
  {
    id: 'anom_1',
    projectId: 'p1',
    activityId: 'a5',
    activityName: 'Pipe Lowering & Laying (A1050)',
    discipline: 'piping',
    dprEntryId: 'dpr102',
    type: 'rate_spike',
    severity: 'critical',
    confidence: 0.95,
    title: 'Excessive Velocity: 2,400m Pipe Laying Claimed in 1 Day',
    description: 'Contractor reported laying 2,400 meters of 48" pipe on 28-Aug with 1 crew. Historical maximum physical capacity is 1,000m/day. Anomaly probability: 95.4% (XGBoost Outlier Score: 0.95).',
    evidence: {
      reportedValue: '2,400 meters / day',
      expectedThreshold: '≤ 1,000 meters / day',
      metric: 'Heavy Machinery Deployment Limit'
    },
    detectedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'active'
  },
  {
    id: 'anom_2',
    projectId: 'p1',
    activityId: 'a6',
    activityName: 'Mainline Butt Welding (A1060)',
    discipline: 'piping',
    dprEntryId: 'dpr104',
    type: 'weather_conflict',
    severity: 'high',
    confidence: 0.89,
    title: 'Severe Weather Conflict: 42 Butt Welds during 65mm/hr Downpour',
    description: 'Golaghat Weather Station recorded continuous monsoon torrential rainfall (65mm/hr). Outdoor un-shielded welding yields severe hydrogen cracking risks under OISD-141 guidelines.',
    evidence: {
      reportedValue: '42 Mainline Welds Completed',
      expectedThreshold: 'Zero outdoor welding during rainfall > 5mm/hr',
      metric: 'OISD-141 / API 1104 Quality Rule'
    },
    detectedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'active'
  },
  {
    id: 'anom_3',
    projectId: 'p1',
    activityId: 'a5',
    activityName: 'Pipe Lowering & Laying (A1050)',
    discipline: 'piping',
    dprEntryId: 'dpr105',
    type: 'chainage_overlap',
    severity: 'medium',
    confidence: 0.84,
    title: 'Duplicate Chainage Progress Claim: Ch. 62+400 to 62+900',
    description: 'Spatial collision detected: Chainage 62+400 to 62+900 was already reported and approved on 24-Aug (DPR-88). Second claim submitted by Subcontractor Team B.',
    evidence: {
      reportedValue: 'Ch. 62+400 to 62+900 (500m)',
      expectedThreshold: 'Previously approved in DPR-88',
      metric: 'Spatial Geofence & Chainage Ledger'
    },
    detectedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'investigating'
  }
]

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'al1', projectId: 'p1', activityId: 'a5', discipline: 'piping',
    type: 'delay', severity: 'critical',
    title: 'Critical Path Delay – Pipe Laying',
    message: 'Pipe Laying (A1050) is 17% behind plan. Will delay Welding start by ~12 days. Projected delay to hydrotesting: 3 weeks.',
    daysImpact: 12, isRead: false, createdAt: new Date().toISOString(),
  },
  {
    id: 'al2', projectId: 'p1', activityId: 'a12', discipline: 'equipment',
    type: 'critical_path', severity: 'critical',
    title: 'Compressor Package C-201 Foundation Delay Impact',
    message: 'Compressor erection (A3010) is lagging by 13 days due to late anchor bolt alignment. On P6 Critical Path.',
    daysImpact: 13, isRead: false, createdAt: new Date().toISOString(),
  },
  {
    id: 'al3', projectId: 'p3', discipline: 'civil',
    type: 'spi_low', severity: 'critical',
    title: 'SPI Below 0.65 – Arunachal Road',
    message: 'OIL-RD-2024-03 has SPI of 0.62. Project is significantly behind schedule. Escalation recommended.',
    daysImpact: 45, isRead: false, createdAt: new Date().toISOString(),
  },
  {
    id: 'al4', projectId: 'p1',
    type: 'approval_needed', severity: 'warning',
    title: '3 Unmatched Field Activities Awaiting Planner Action',
    message: 'Field reported activities in Civil, Electrical & Piping not mapped to L5 baseline nodes. Planner review queue active.',
    daysImpact: 0, isRead: false, createdAt: new Date().toISOString(),
  }
]

// ─── AI Processing Results ────────────────────────────────────────────────────

export const MOCK_AI_RESULTS: AIProcessingResult[] = [
  {
    id: 'ai1',
    dprEntryId: 'dpr1',
    status: 'needs_review',
    topMatch: {
      activityId: 'a14', activityName: 'Erect Line 24"-CS-01 Process Piping Spools', activityCode: 'A2040',
      discipline: 'piping', wbsLevel: 'L5',
      confidence: 0.82, confidenceLevel: 'medium',
      matchedKeywords: ['spool', 'erected', 'line 24'],
      matchedJargon: 'spool erected',
      extractedQuantity: 2, extractedUnit: 'spools',
      extractedLocation: 'Unit 101', extractedProgress: null,
      actualStartTime: '08:30', actualEndTime: '16:00',
      reasoning: 'Field report states "2 spools erected for Line 24 at Unit 101". Cross-referenced terminology jargon dictionary: "spool erected" -> A2040.',
    },
    alternativeMatches: [
      {
        activityId: 'a6', activityName: 'Mainline Butt Welding & Fabrication', activityCode: 'A1060',
        discipline: 'piping', wbsLevel: 'L5',
        confidence: 0.45, confidenceLevel: 'low',
        matchedKeywords: ['spool'], matchedJargon: 'welding',
        extractedQuantity: 2, extractedUnit: 'spools',
        extractedLocation: 'Unit 101', extractedProgress: null,
        reasoning: 'Alternative candidate; lower confidence because spool erection is mechanical rather than mainline welding.',
      },
    ],
    extractedData: {
      date: new Date().toISOString().split('T')[0],
      actualStart: '08:30', actualEnd: '16:00',
      location: 'Unit 101 Header', chainage: null, activity: 'spool erection',
      discipline: 'piping',
      quantity: 2, unit: 'spools', progress: null,
      remarks: 'Erected 2 spools on piperack rack bay 3. Flange torque checked.',
      workforce: 14, equipment: ['Crane 25T', 'Torque Wrench'],
      weather: 'Clear',
    },
    autoApplied: false,
    reviewedBy: null, reviewedAt: null, reviewNotes: null,
    processedAt: new Date(Date.now() - 3600000).toISOString(),
    modelUsed: 'local-nlp-engine'
  },
  {
    id: 'ai2',
    dprEntryId: 'dpr2',
    status: 'needs_review',
    topMatch: {
      activityId: 'a6', activityName: 'Mainline Butt Welding & Fabrication', activityCode: 'A1060',
      discipline: 'piping', wbsLevel: 'L5',
      confidence: 0.68, confidenceLevel: 'medium',
      matchedKeywords: ['welding', 'joints'],
      matchedJargon: 'butt weld',
      extractedQuantity: 28, extractedUnit: 'joints',
      extractedLocation: 'Ch. 52+800', extractedProgress: null,
      actualStartTime: '07:30', actualEndTime: '17:00',
      reasoning: '"Welding" and "joints" matched. Chainage 52+800 falls within welding section. Needs review due to 2 NDT rejected joints.',
    },
    alternativeMatches: [],
    extractedData: {
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      actualStart: '07:30', actualEnd: '17:00',
      location: 'Ch. 52+800', chainage: '52+800', activity: 'welding',
      discipline: 'piping',
      quantity: 28, unit: 'joints', progress: null,
      remarks: 'Completed 28 joints. 2 rejected by NDT radiographer.', workforce: 30,
      equipment: ['Welding Machine x4'], weather: 'Clear',
    },
    autoApplied: false,
    reviewedBy: null, reviewedAt: null, reviewNotes: null,
    processedAt: new Date(Date.now() - 7200000).toISOString(),
    modelUsed: 'local-nlp-engine'
  },
  {
    id: 'ai3',
    dprEntryId: 'dpr3',
    status: 'approved',
    topMatch: {
      activityId: 'a3', activityName: 'Trench Excavation', activityCode: 'A1030',
      discipline: 'civil', wbsLevel: 'L5',
      confidence: 0.96, confidenceLevel: 'high',
      matchedKeywords: ['trench', 'excavation', '250m', 'ch. 62+400'],
      matchedJargon: 'trench cut',
      extractedQuantity: 250, extractedUnit: 'meters',
      extractedLocation: 'Ch. 62+400', extractedProgress: null,
      actualStartTime: '08:00', actualEndTime: '17:00',
      reasoning: 'High confidence: exact keywords "trench excavation" + chainage + quantity with unit all present.',
    },
    alternativeMatches: [],
    extractedData: {
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      actualStart: '08:00', actualEnd: '17:00',
      location: 'Ch. 62+400', chainage: '62+400', activity: 'trench excavation',
      discipline: 'civil',
      quantity: 250, unit: 'meters', progress: null,
      remarks: 'Trench excavation completed 250m at Ch. 62+400. Rock encountered at 1.8m depth.', workforce: 60,
      equipment: ['CAT 330 Excavator x3', 'Tipper x5'], weather: 'Rain',
    },
    autoApplied: true,
    reviewedBy: 'u2', reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    reviewNotes: 'Confirmed – rock comment noted for cost tracking.',
    processedAt: new Date(Date.now() - 180000000).toISOString(),
    modelUsed: 'gemini-1.5-flash'
  },
]

// ─── DPR Entries ──────────────────────────────────────────────────────────────

export const MOCK_DPR_ENTRIES: DPREntry[] = [
  {
    id: 'dpr1', projectId: 'p1', discipline: 'piping',
    submittedBy: 'u1', submittedByRole: 'field_supervisor',
    inputMethod: 'manual',
    rawText: 'Today we laid 500m pipe at site 3. Work going good. 45 workers present. Equipment: Excavator and pipe crane.',
    date: new Date().toISOString().split('T')[0],
    actualStart: '08:00', actualEnd: '16:30',
    gps: { lat: 26.7821, lng: 93.9412, accuracy: 10 },
    attachments: [],
    syncStatus: 'synced',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'dpr2', projectId: 'p1', discipline: 'piping',
    submittedBy: 'u1', submittedByRole: 'field_supervisor',
    inputMethod: 'whatsapp',
    rawText: 'Welding done today 28 joints at chainage 52+800. 2 joints rejected by NDT will redo tomorrow.',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    actualStart: '07:30', actualEnd: '17:00',
    gps: null,
    attachments: [],
    syncStatus: 'synced',
    createdAt: new Date(Date.now() - 86400000 - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 - 3600000).toISOString(),
  },
]

// ─── S-Curve Data with Monte Carlo ML Bands ──────────────────────────────────

export const MOCK_SCURVE: SCurveDataPoint[] = [
  { date: 'Jan 24', planned: 2, actual: 0, forecastLower: 0, forecastUpper: 0 },
  { date: 'Feb 24', planned: 5, actual: 3, forecastLower: 3, forecastUpper: 3 },
  { date: 'Mar 24', planned: 10, actual: 8, forecastLower: 8, forecastUpper: 8 },
  { date: 'Apr 24', planned: 18, actual: 15, forecastLower: 15, forecastUpper: 15 },
  { date: 'May 24', planned: 27, actual: 23, forecastLower: 23, forecastUpper: 23 },
  { date: 'Jun 24', planned: 38, actual: 32, forecastLower: 32, forecastUpper: 32 },
  { date: 'Jul 24', planned: 50, actual: 42, forecastLower: 42, forecastUpper: 42 },
  { date: 'Aug 24', planned: 62, actual: 52, forecastLower: 52, forecastUpper: 52 },
  { date: 'Sep 24', planned: 72, actual: 61, forecast: 61, forecastLower: 59, forecastUpper: 63 },
  { date: 'Oct 24', planned: 80, actual: null as unknown as number, forecast: 67, forecastLower: 63, forecastUpper: 71 },
  { date: 'Nov 24', planned: 87, actual: null as unknown as number, forecast: 74, forecastLower: 69, forecastUpper: 79 },
  { date: 'Dec 24', planned: 93, actual: null as unknown as number, forecast: 81, forecastLower: 75, forecastUpper: 86 },
  { date: 'Jan 25', planned: 97, actual: null as unknown as number, forecast: 88, forecastLower: 82, forecastUpper: 94 },
  { date: 'Jun 25', planned: 100, actual: null as unknown as number, forecast: 100, forecastLower: 94, forecastUpper: 100 },
]

// ─── Immutable Audit Trail ───────────────────────────────────────────────────

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: 'u1',
    userName: 'Rajesh Borah',
    userRole: 'field_supervisor',
    discipline: 'piping',
    action: 'time_agent_logged',
    entityId: 'dpr1',
    entityType: 'dpr',
    details: 'Logged 2 spools erected on Line 24"-CS-01 via conversational Time Agent.',
    confidence: 0.94
  },
  {
    id: 'aud_2',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    userId: 'u2',
    userName: 'Priya Gogoi',
    userRole: 'planner',
    discipline: 'civil',
    action: 'planner_approved',
    entityId: 'a3',
    entityType: 'activity',
    details: 'Approved 250m Trench Excavation at Ch. 62+400. Written back to Oracle P6 schedule baseline.',
    oldValue: '78%',
    newValue: '82%',
    confidence: 0.96
  },
  {
    id: 'aud_3',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    userId: 'sys',
    userName: 'Nirman Setu AI Engine',
    userRole: 'admin',
    action: 'cpm_recalculated',
    entityId: 'p1',
    entityType: 'schedule',
    details: 'CPM Forward/Backward pass completed. Critical path dynamically shifted to A1050 (Pipe Laying).',
  },
  {
    id: 'aud_4',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    userId: 'u2',
    userName: 'Priya Gogoi',
    userRole: 'planner',
    discipline: 'piping',
    action: 'spreadsheet_batch_imported',
    entityId: 'batch_pip_01',
    entityType: 'activity',
    details: 'Imported batch spreadsheet "Piping Discipline Daily Tracker.csv". 4 rows processed, 3 matched to L5 nodes, 1 routed to Unmatched Review Queue.',
    confidence: 0.92
  }
]

// ─── Institutional Memory: Historical Projects & Lessons Learned ──────────────

export const MOCK_HISTORICAL_PROJECTS: HistoricalProject[] = [
  {
    id: 'hist_1',
    code: 'OIL-CDU-2021',
    name: 'Duliajan Crude Distillation Unit (CDU-1) Expansion',
    type: 'refinery',
    disciplineFocus: 'Mechanical & Piping',
    plannedDurationDays: 450,
    actualDurationDays: 524,
    varianceDays: 74,
    variancePercent: 16.4,
    primaryBottleneck: 'Monsoon Flooding & Delayed Spool Delivery from Vendor',
    completedDate: '2022-11-14',
    contractor: 'Larsen & Toubro Limited',
    state: 'Assam',
    terrain: 'riverine'
  },
  {
    id: 'hist_2',
    code: 'OIL-PL-2020',
    name: 'Numaligarh–Guwahati Gas Feeder Link (24")',
    type: 'pipeline',
    disciplineFocus: 'Cross-Country Civil & Pipeline',
    plannedDurationDays: 360,
    actualDurationDays: 432,
    varianceDays: 72,
    variancePercent: 20.0,
    primaryBottleneck: 'Forest Department Right-of-Way (RoW) Clearance Disputes',
    completedDate: '2021-08-30',
    contractor: 'Megha Engineering & Infra Ltd',
    state: 'Assam',
    terrain: 'hilly'
  },
  {
    id: 'hist_3',
    code: 'OIL-DIG-2022',
    name: 'Digboi Refinery Heritage Process Modernization',
    type: 'refinery',
    disciplineFocus: 'Electrical, Instrumentation & DCS Upgrade',
    plannedDurationDays: 240,
    actualDurationDays: 268,
    varianceDays: 28,
    variancePercent: 11.7,
    primaryBottleneck: 'DCS Marshalling Wiring Re-verification & Sensor Calibration Lag',
    completedDate: '2023-04-18',
    contractor: 'Honeywell Automation India',
    state: 'Assam',
    terrain: 'plain'
  },
  {
    id: 'hist_4',
    code: 'OIL-BORD-2023',
    name: 'Arunachal Border Wellhead Interconnect Pipeline (16")',
    type: 'pipeline',
    disciplineFocus: 'High-Altitude Trenching & River Crossing HDD',
    plannedDurationDays: 300,
    actualDurationDays: 395,
    varianceDays: 95,
    variancePercent: 31.7,
    primaryBottleneck: 'River Sub-bed HDD Reaming Failure & Rock Strata Collapse',
    completedDate: '2024-02-10',
    contractor: 'NPCC Limited',
    state: 'Arunachal Pradesh',
    terrain: 'hilly'
  },
  {
    id: 'hist_5',
    code: 'OIL-TERMINAL-2022',
    name: 'Sivasagar Crude Dispatch & Tank Farm Facility',
    type: 'refinery',
    disciplineFocus: 'Civil Foundations & Storage Tank Fabrication',
    plannedDurationDays: 420,
    actualDurationDays: 442,
    varianceDays: 22,
    variancePercent: 5.2,
    primaryBottleneck: 'High Water Table Pumping & Deep Piling Delays',
    completedDate: '2023-09-22',
    contractor: 'Punj Lloyd Infrastructure',
    state: 'Assam',
    terrain: 'marshy'
  }
]

// ─── Institutional Memory: Recurring Bottlenecks ─────────────────────────────

export const MOCK_RECURRING_BOTTLENECKS: RecurringBottleneck[] = [
  {
    id: 'bot_1',
    discipline: 'piping',
    title: 'Monsoon Outdoor Welding Stoppage & Hydrogen Embrittlement',
    causeCategory: 'weather',
    frequencyPercent: 88,
    averageDelayDays: 34,
    typicalCostImpactINR: 18500000,
    mitigationStrategy: 'Mandate automated welding shelters with dehumidifiers and schedule tie-in spool work during monsoon window.',
    sampleProjects: ['OIL-CDU-2021', 'OIL-PL-2020', 'OIL-PL-2024-01']
  },
  {
    id: 'bot_2',
    discipline: 'civil',
    title: 'Right-of-Way (RoW) Demarcation & Forest Clearance Hold',
    causeCategory: 'row_clearance',
    frequencyPercent: 76,
    averageDelayDays: 48,
    typicalCostImpactINR: 24000000,
    mitigationStrategy: 'Execute early aerial LiDAR + DGPS pegging prior to contractor mobilization with pre-deposited state compensation.',
    sampleProjects: ['OIL-PL-2020', 'OIL-BORD-2023']
  },
  {
    id: 'bot_3',
    discipline: 'piping',
    title: 'Radiographic Testing (RT) Repair Cycles on Heavy-Wall Pipes',
    causeCategory: 'inspection_rework',
    frequencyPercent: 62,
    averageDelayDays: 19,
    typicalCostImpactINR: 9200000,
    mitigationStrategy: 'Enforce pre-qualification for welder root passes and introduce real-time PAUT (Phased Array Ultrasonic) instead of film RT.',
    sampleProjects: ['OIL-PL-2024-01', 'OIL-CDU-2021']
  },
  {
    id: 'bot_4',
    discipline: 'equipment',
    title: 'Heavy Compressor & Column Delivery Vendor Transit Lag',
    causeCategory: 'vendor_delay',
    frequencyPercent: 58,
    averageDelayDays: 42,
    typicalCostImpactINR: 32000000,
    mitigationStrategy: 'Include milestones for critical forged rotor testing and lock heavy-haul logistics permissions 90 days before dispatch.',
    sampleProjects: ['OIL-CDU-2021', 'OIL-TERMINAL-2022']
  },
  {
    id: 'bot_5',
    discipline: 'instrumentation',
    title: 'DCS Loop Checking & Marshalling Wiring Drawing Mismatches',
    causeCategory: 'design_change',
    frequencyPercent: 52,
    averageDelayDays: 16,
    typicalCostImpactINR: 6500000,
    mitigationStrategy: 'Conduct 100% factory acceptance test (FAT) loop simulation with smart marshalling I/O before dispatching cabinets to site.',
    sampleProjects: ['OIL-DIG-2022']
  }
]

// ─── Institutional Memory: Empirical Productivity Benchmarks ─────────────────

export const MOCK_PRODUCTIVITY_BENCHMARKS: ProductivityBenchmark[] = [
  {
    id: 'bm_1',
    discipline: 'civil',
    activityType: 'Trench Excavation (Alluvial Clay / Soil)',
    unit: 'meters / day / excavator crew',
    plannedBenchmarkRate: 650,
    actualHistoricalMedian: 540,
    p10Rate: 280, // monsoon / rocky
    p90Rate: 820, // dry winter
    sampleSizeProjects: 12,
    recommendedContingencyBufferPercent: 20
  },
  {
    id: 'bm_2',
    discipline: 'piping',
    activityType: 'Mainline 48" Butt Welding (SMAW + SAW)',
    unit: 'joints / day / welding gang',
    plannedBenchmarkRate: 25,
    actualHistoricalMedian: 19.4,
    p10Rate: 11.2,
    p90Rate: 28.5,
    sampleSizeProjects: 8,
    recommendedContingencyBufferPercent: 28
  },
  {
    id: 'bm_3',
    discipline: 'piping',
    activityType: 'Process Piping Spool Erection (Piperack)',
    unit: 'spools / day / crew',
    plannedBenchmarkRate: 4.5,
    actualHistoricalMedian: 3.2,
    p10Rate: 1.8,
    p90Rate: 5.5,
    sampleSizeProjects: 6,
    recommendedContingencyBufferPercent: 25
  },
  {
    id: 'bm_4',
    discipline: 'equipment',
    activityType: 'Heavy Rotary Equipment Placement & Cold Alignment',
    unit: 'days / compressor package',
    plannedBenchmarkRate: 14,
    actualHistoricalMedian: 21.5,
    p10Rate: 32, // prolonged baseplate shimming
    p90Rate: 15,
    sampleSizeProjects: 5,
    recommendedContingencyBufferPercent: 35
  },
  {
    id: 'bm_5',
    discipline: 'electrical',
    activityType: '11kV Feeder Cable Pulling in Trays',
    unit: 'meters / day / pulling team',
    plannedBenchmarkRate: 350,
    actualHistoricalMedian: 290,
    p10Rate: 160,
    p90Rate: 420,
    sampleSizeProjects: 9,
    recommendedContingencyBufferPercent: 18
  },
  {
    id: 'bm_6',
    discipline: 'instrumentation',
    activityType: 'DCS Loop Checking & Cold Calibration',
    unit: 'loops / day / commissioning pair',
    plannedBenchmarkRate: 12,
    actualHistoricalMedian: 8.8,
    p10Rate: 4.5,
    p90Rate: 14,
    sampleSizeProjects: 7,
    recommendedContingencyBufferPercent: 26
  }
]

// ─── Institutional Memory: Knowledge Query Presets ───────────────────────────

export const MOCK_KNOWLEDGE_QUERIES: KnowledgeQueryRecord[] = [
  {
    id: 'kq_1',
    query: 'What was the actual vs planned duration variance for 48" pipe hydrotesting during monsoon season?',
    timestamp: '2024-09-08T11:20:00Z',
    discipline: 'piping',
    aiResponse: 'Historical data across 4 Assam cross-country pipelines indicates a median duration slippage of +38.5% (average +27 days) for hydrotesting scheduled between June and September. Primary causes: dewatering turbidity compliance and localized road washaway impeding tanker transport. Recommended contingency buffer: +30% duration.',
    relevantBenchmarks: ['Mainline Butt Welding (bm_2)', 'Monsoon Welding Stoppage (bot_1)'],
    recommendedBufferDays: 24
  },
  {
    id: 'kq_2',
    query: 'What are the top 3 recurring delay causes in North-East refinery compressor foundation and alignment?',
    timestamp: '2024-09-09T14:45:00Z',
    discipline: 'equipment',
    aiResponse: '1) High groundwater table requiring continuous dewatering during raft casting (avg 14 days delay). 2) Overseas vendor anchor bolt template mismatches discovered at site (avg 18 days delay). 3) Grout curing failures in sub-tropical high humidity (avg 7 days delay). Recommended mitigation: Pre-pour 3D laser scan of bolt layout.',
    relevantBenchmarks: ['Heavy Rotary Equipment Alignment (bm_4)', 'Vendor Transit Lag (bot_4)'],
    recommendedBufferDays: 21
  },
  {
    id: 'kq_3',
    query: 'What productivity rate should we assume in future tenders for trench excavation in alluvial plain soil?',
    timestamp: '2024-09-10T16:00:00Z',
    discipline: 'civil',
    aiResponse: 'Empirical actual median productivity is 540 meters/day per excavator crew (vs planned tender standard of 650 m/day). During dry season (Nov–April), rates reach 750–820 m/day, while monsoon rates drop to 280 m/day. For tender baseline, assume 500 m/day with a 20% weather contingency buffer.',
    relevantBenchmarks: ['Trench Excavation Alluvial (bm_1)'],
    recommendedBufferDays: 14
  }
]
