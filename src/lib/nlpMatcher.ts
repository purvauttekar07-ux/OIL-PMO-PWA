import { MOCK_ACTIVITIES } from './mockData'
import type { ActivityMatch, AIProcessingResult, EngineeringDiscipline, P6Activity } from '@/types'

// ─── Keyword & Quantity Patterns ──────────────────────────────────────────────

const QUANTITY_PATTERNS = [
  /(\d+(?:\.\d+)?)\s*(?:m\b|meters?|metre)/i,
  /(\d+(?:\.\d+)?)\s*(?:km\b|kilometres?|kilometers?)/i,
  /(\d+(?:\.\d+)?)\s*(?:joints?|jts?)/i,
  /(\d+(?:\.\d+)?)\s*(?:spools?|spls?)/i,
  /(\d+(?:\.\d+)?)\s*(?:loops?)/i,
  /(\d+(?:\.\d+)?)\s*(?:panels?)/i,
  /(\d+(?:\.\d+)?)\s*(?:skids?|packages?)/i,
  /(\d+(?:\.\d+)?)\s*(?:permits?)/i,
  /(\d+(?:\.\d+)?)\s*(?:rmt\b|rm\b)/i,
  /(\d+(?:\.\d+)?)\s*(?:%|percent)/i,
  /(\d+(?:\.\d+)?)\s*(?:cum\b|cubic meters?|m3)/i,
  /(\d+(?:\.\d+)?)\s*(?:nos?\b|numbers?|units?)/i,
]

const UNIT_MAP: Record<string, string> = {
  m: 'meters', meters: 'meters', metre: 'meters', metres: 'meters',
  km: 'km', kilometres: 'km', kilometers: 'km',
  joint: 'joints', joints: 'joints', jt: 'joints', jts: 'joints',
  spool: 'spools', spools: 'spools',
  loop: 'loops', loops: 'loops',
  panel: 'panels', panels: 'panels',
  skid: 'packages', skids: 'packages', package: 'packages', packages: 'packages',
  permit: 'permits', permits: 'permits',
  rmt: 'meters', rm: 'meters',
  '%': '%', percent: '%',
  cum: 'cum', 'cubic meters': 'cum', m3: 'cum',
  no: 'nos', nos: 'nos', number: 'nos', numbers: 'nos', unit: 'nos',
}

const CHAINAGE_PATTERN = /(?:ch(?:ainage)?\.?\s*|km\s*)(\d+\+\d+|\d+\.\d+|\d+)/i
const PROGRESS_PATTERN = /(\d{1,3})\s*%\s*(?:done|complete|completed|progress|finished)?/i
const WEATHER_KEYWORDS = ['rain', 'sunny', 'cloudy', 'fog', 'clear', 'overcast', 'storm', 'humid', 'monsoon']
const WORKFORCE_PATTERN = /(\d+)\s*(?:workers?|labour|labours?|men|persons?|manpower|welders?|fitters?)/i

// Time extraction patterns: e.g. "08:30 to 17:00", "started at 08:00 ended 16:30", "from 9 am to 5 pm"
const TIME_RANGE_PATTERN = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|until)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i

// ─── Discipline Inference Helper ──────────────────────────────────────────────

export function detectDiscipline(text: string): EngineeringDiscipline {
  const lower = text.toLowerCase()
  if (lower.includes('spool') || lower.includes('weld') || lower.includes('joint') || lower.includes('pipe') || lower.includes('hydrotest') || lower.includes('ndt') || lower.includes('radiograph')) {
    return 'piping'
  }
  if (lower.includes('compressor') || lower.includes('pump') || lower.includes('skid') || lower.includes('alignment') || lower.includes('turbine') || lower.includes('cold box') || lower.includes('c-201') || lower.includes('p-101')) {
    return 'equipment'
  }
  if (lower.includes('cable') || lower.includes('tray') || lower.includes('transformer') || lower.includes('substation') || lower.includes('switchgear') || lower.includes('breaker') || lower.includes('megger') || lower.includes('11kv') || lower.includes('feeder')) {
    return 'electrical'
  }
  if (lower.includes('loop') || lower.includes('transmitter') || lower.includes('dcs') || lower.includes('marshalling') || lower.includes('scada') || lower.includes('tubing') || lower.includes('calibration') || lower.includes('4-20ma')) {
    return 'instrumentation'
  }
  if (lower.includes('permit') || lower.includes('safety') || lower.includes('scaffold') || lower.includes('toolbox') || lower.includes('gas test') || lower.includes('lel') || lower.includes('hse') || lower.includes('tbt')) {
    return 'hse'
  }
  if (lower.includes('trench') || lower.includes('excavation') || lower.includes('pcc') || lower.includes('rcc') || lower.includes('concrete') || lower.includes('foundation') || lower.includes('mud mat') || lower.includes('survey') || lower.includes('grading') || lower.includes('clearing') || lower.includes('backfill')) {
    return 'civil'
  }
  return 'civil'
}

// ─── Entity Extraction ────────────────────────────────────────────────────────

export interface ExtractedEntities {
  discipline: EngineeringDiscipline
  quantity: number | null
  unit: string | null
  chainage: string | null
  progress: number | null
  weather: string | null
  workforce: number | null
  actualStartTime: string | null
  actualEndTime: string | null
  equipment: string[]
}

export function extractEntities(text: string): ExtractedEntities {
  const lower = text.toLowerCase()
  const discipline = detectDiscipline(text)

  // Quantity & Unit
  let quantity: number | null = null
  let unit: string | null = null
  for (const pattern of QUANTITY_PATTERNS) {
    const m = text.match(pattern)
    if (m) {
      quantity = parseFloat(m[1])
      const unitRaw = m[0].replace(m[1], '').trim().toLowerCase()
      unit = UNIT_MAP[unitRaw] ?? unitRaw
      break
    }
  }

  // Chainage
  const chainageMatch = text.match(CHAINAGE_PATTERN)
  const chainage = chainageMatch ? chainageMatch[1] : null

  // Progress
  const progressMatch = text.match(PROGRESS_PATTERN)
  const progress = progressMatch ? parseInt(progressMatch[1], 10) : null

  // Weather
  const weather = WEATHER_KEYWORDS.find(w => lower.includes(w)) ?? null

  // Workforce
  const workforceMatch = text.match(WORKFORCE_PATTERN)
  const workforce = workforceMatch ? parseInt(workforceMatch[1], 10) : null

  // Times
  let actualStartTime: string | null = null
  let actualEndTime: string | null = null
  const timeMatch = text.match(TIME_RANGE_PATTERN)
  if (timeMatch) {
    actualStartTime = timeMatch[1].trim()
    actualEndTime = timeMatch[2].trim()
  }

  // Equipment keywords scan across all disciplines
  const equipmentKeywords = [
    'excavator', 'crane', 'bulldozer', 'tipper', 'truck', 'welding machine',
    'sideboom', 'compressor', 'generator', 'cable puller', 'poclain', 'jcb',
    'torque wrench', 'megger', 'calibrator', 'water tanker'
  ]
  const equipment = equipmentKeywords
    .filter(eq => lower.includes(eq))
    .map(e => e.charAt(0).toUpperCase() + e.slice(1))

  return {
    discipline,
    quantity,
    unit,
    chainage,
    progress,
    weather,
    workforce,
    actualStartTime,
    actualEndTime,
    equipment
  }
}

// ─── Activity Scoring with Discipline & Jargon Bridges ───────────────────────

function scoreActivity(
  text: string,
  activity: P6Activity,
  inferredDiscipline: EngineeringDiscipline
): { score: number; matchedKeywords: string[]; matchedJargon?: string; isGranularityMismatch: boolean } {
  const lower = text.toLowerCase()
  const matchedKeywords: string[] = []
  let matchedJargon: string | undefined
  let score = 0
  let isGranularityMismatch = false

  // Discipline match boost / penalty
  if (activity.discipline === inferredDiscipline) {
    score += 0.20
  }

  // Check Field Jargon Synonyms (HIGH FIDELITY MATCH)
  if (activity.fieldJargonSynonyms && activity.fieldJargonSynonyms.length > 0) {
    for (const jargon of activity.fieldJargonSynonyms) {
      if (lower.includes(jargon.toLowerCase())) {
        score += 0.45
        matchedJargon = jargon
        matchedKeywords.push(jargon)
        break
      }
    }
  }

  // Check Schedule Keywords
  for (const keyword of activity.keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      score += keyword.split(' ').length > 1 ? 0.25 : 0.15
      matchedKeywords.push(keyword)
    }
  }

  // Match Activity Name Words
  const nameWords = activity.name.toLowerCase().split(/\s+/)
  for (const word of nameWords) {
    if (word.length > 4 && lower.includes(word)) {
      score += 0.08
    }
  }

  // Chainage proximity boost
  if (activity.chainage && text.match(CHAINAGE_PATTERN)) {
    score += 0.12
  }

  // Granularity mismatch detection:
  // If text refers to a micro sub-task (e.g. line 24 spool, root pass, joint fit-up, raft rebar)
  // while activity is L5 planned node, recognize granularity hierarchy
  if (
    activity.wbsLevel === 'L5' &&
    (lower.includes('spool') || lower.includes('joint') || lower.includes('root pass') || lower.includes('tray') || lower.includes('loop'))
  ) {
    isGranularityMismatch = true
  }

  return {
    score: Math.min(score, 1.0),
    matchedKeywords: Array.from(new Set(matchedKeywords)),
    matchedJargon,
    isGranularityMismatch
  }
}

// ─── Main AI Processing & Linking Engine ──────────────────────────────────────

export function processWithAI(
  dprId: string,
  rawText: string,
  projectId: string,
  dateStr: string,
  location?: string,
): AIProcessingResult {
  const projectActivities = MOCK_ACTIVITIES.filter(a => a.projectId === projectId)
  const entities = extractEntities(rawText)

  // Score all project activities
  const scored = projectActivities.map(activity => {
    const match = scoreActivity(rawText, activity, entities.discipline)
    return { activity, ...match }
  }).sort((a, b) => b.score - a.score)

  const top = scored[0]
  const confidence = top ? top.score : 0
  const isUnmatched = confidence < 0.45

  const confidenceLevel = confidence >= 0.85 ? 'high' : confidence >= 0.60 ? 'medium' : 'low'

  const topMatch: ActivityMatch = {
    activityId: isUnmatched ? '' : (top?.activity.id ?? ''),
    activityName: isUnmatched ? 'Unmatched Field Activity' : (top?.activity.name ?? 'Unmatched'),
    activityCode: isUnmatched ? 'UNLINKED' : (top?.activity.activityId ?? 'UNMATCHED'),
    discipline: top?.activity.discipline ?? entities.discipline,
    wbsLevel: top?.activity.wbsLevel,
    confidence,
    confidenceLevel: confidenceLevel as ActivityMatch['confidenceLevel'],
    matchedKeywords: top?.matchedKeywords ?? [],
    matchedJargon: top?.matchedJargon,
    extractedQuantity: entities.quantity,
    extractedUnit: entities.unit ?? top?.activity.unit ?? null,
    extractedLocation: location ?? entities.chainage,
    extractedProgress: entities.progress,
    actualStartTime: entities.actualStartTime,
    actualEndTime: entities.actualEndTime,
    reasoning: buildReasoning(confidence, top?.matchedKeywords ?? [], top?.matchedJargon, entities, isUnmatched),
  }

  const alternativeMatches: ActivityMatch[] = scored.slice(1, 3)
    .filter(s => s.score > 0.25)
    .map(s => ({
      activityId: s.activity.id,
      activityName: s.activity.name,
      activityCode: s.activity.activityId,
      discipline: s.activity.discipline,
      wbsLevel: s.activity.wbsLevel,
      confidence: s.score,
      confidenceLevel: (s.score >= 0.85 ? 'high' : s.score >= 0.60 ? 'medium' : 'low') as ActivityMatch['confidenceLevel'],
      matchedKeywords: s.matchedKeywords,
      matchedJargon: s.matchedJargon,
      extractedQuantity: entities.quantity,
      extractedUnit: entities.unit ?? s.activity.unit ?? null,
      extractedLocation: location ?? null,
      extractedProgress: entities.progress,
      actualStartTime: entities.actualStartTime,
      actualEndTime: entities.actualEndTime,
      reasoning: `Alternative match candidate in ${s.activity.discipline.toUpperCase()} discipline with ${Math.round(s.score * 100)}% confidence.`,
    }))

  const autoApplied = confidence >= 0.90 && !isUnmatched

  return {
    id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    dprEntryId: dprId,
    status: isUnmatched
      ? 'needs_review'
      : autoApplied
        ? 'approved'
        : 'needs_review',
    topMatch,
    alternativeMatches,
    extractedData: {
      date: dateStr,
      actualStart: entities.actualStartTime,
      actualEnd: entities.actualEndTime,
      location: location ?? entities.chainage,
      chainage: entities.chainage,
      activity: top?.activity.name ?? null,
      discipline: entities.discipline,
      quantity: entities.quantity,
      unit: entities.unit,
      progress: entities.progress,
      remarks: rawText.length > 120 ? rawText.slice(0, 120) + '…' : rawText,
      workforce: entities.workforce,
      equipment: entities.equipment,
      weather: entities.weather,
    },
    isGranularityMismatch: top?.isGranularityMismatch ?? false,
    parentPlannedActivityId: top?.activity.id ?? null,
    autoApplied,
    reviewedBy: autoApplied ? 'system' : null,
    reviewedAt: autoApplied ? new Date().toISOString() : null,
    reviewNotes: autoApplied ? 'Auto-approved: confidence ≥ 90%' : null,
    processedAt: new Date().toISOString(),
  }
}

function buildReasoning(
  confidence: number,
  matchedKeywords: string[],
  matchedJargon: string | undefined,
  entities: ExtractedEntities,
  isUnmatched: boolean
): string {
  if (isUnmatched) {
    return `No direct match found in current baseline schedule nodes (confidence ${Math.round(confidence * 100)}% < 45%). Preserved full field report and routed to Planner Review Queue for manual linking or promotion to new L6 activity.`
  }

  const parts: string[] = []
  if (matchedJargon) {
    parts.push(`Field jargon cross-referenced: "${matchedJargon}"`)
  } else if (matchedKeywords.length > 0) {
    parts.push(`Matched keywords: "${matchedKeywords.join('", "')}"`)
  }

  if (entities.discipline) {
    parts.push(`Discipline: ${entities.discipline.toUpperCase()}`)
  }
  if (entities.quantity !== null) {
    parts.push(`Extracted actuals: ${entities.quantity} ${entities.unit ?? ''}`)
  }
  if (entities.actualStartTime && entities.actualEndTime) {
    parts.push(`Execution window: ${entities.actualStartTime} – ${entities.actualEndTime}`)
  }
  if (entities.chainage) {
    parts.push(`Chainage: ${entities.chainage}`)
  }

  if (confidence >= 0.85) {
    parts.push('High confidence match – eligible for near real-time P6 schedule auto-update.')
  } else if (confidence >= 0.60) {
    parts.push('Medium confidence – planner review queue recommended.')
  } else {
    parts.push('Low confidence – routed to human-in-the-loop review.')
  }

  return parts.join('. ')
}
