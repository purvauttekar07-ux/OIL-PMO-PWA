import type { AIProcessingResult, EngineeringDiscipline, P6Activity } from '@/types'
import { processWithAI, detectDiscipline } from './nlpMatcher'

export interface GeminiExtractResponse {
  activity: string | null
  discipline: EngineeringDiscipline | null
  quantity: number | null
  unit: string | null
  chainage: string | null
  location: string | null
  actualStartTime: string | null
  actualEndTime: string | null
  workforce: number | null
  equipment: string[]
  weather: string | null
  remarks: string | null
  matchedActivityCode: string | null
  confidence: number
  reasoning: string
}

/**
 * Extract structured project actuals using Google Gemini 1.5/2.0 API with fallback to local multi-discipline NLP
 */
export async function extractWithGemini(
  rawText: string,
  projectId: string,
  activities: P6Activity[],
  apiKey?: string
): Promise<AIProcessingResult> {
  const dprId = `dpr_${Date.now()}`
  const today = new Date().toISOString().split('T')[0]

  if (!apiKey || apiKey.trim() === '') {
    // Graceful high-speed local multi-discipline neural/jargon extractor fallback
    return processWithAI(dprId, rawText, projectId, today)
  }

  const projectActivities = activities.filter(a => a.projectId === projectId)
  const activitiesSummary = projectActivities
    .map(a => `- Code: ${a.activityId}, Discipline: ${a.discipline}, Name: "${a.name}", Unit: "${a.unit}", Keywords: [${a.keywords.join(', ')}]`)
    .join('\n')

  const prompt = `You are Nirman Setu, an AI Time Agent for Oil India Limited (OIL).
Analyze this unstructured field construction report (which may be in Hindi, Assamese, English, or Hinglish):

FIELD REPORT:
"""
${rawText}
"""

TARGET SCHEDULE ACTIVITIES (Primavera P6 L5/L6 WBS):
${activitiesSummary}

Extract all parameters and match to the most appropriate activity code from the list above.
Return ONLY a valid JSON object matching this exact TypeScript structure:
{
  "activity": string | null,
  "discipline": "civil" | "piping" | "equipment" | "electrical" | "instrumentation" | "hse" | null,
  "matchedActivityCode": string | null,
  "quantity": number | null,
  "unit": string | null,
  "chainage": string | null,
  "location": string | null,
  "actualStartTime": string | null,
  "actualEndTime": string | null,
  "workforce": number | null,
  "equipment": string[],
  "weather": string | null,
  "remarks": string | null,
  "confidence": number, // float 0.0 to 1.0
  "reasoning": string // concise explanation in English
}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed: GeminiExtractResponse = JSON.parse(textContent || '{}')

    const inferredDiscipline = parsed.discipline || detectDiscipline(rawText)
    const matchedAct = projectActivities.find(a => a.activityId === parsed.matchedActivityCode) || projectActivities[0]
    const confidence = Math.min(1, Math.max(0, parsed.confidence || 0.85))
    const isUnmatched = confidence < 0.45
    const confidenceLevel = confidence >= 0.85 ? 'high' : confidence >= 0.60 ? 'medium' : 'low'
    const autoApplied = confidence >= 0.90 && !isUnmatched

    return {
      id: `ai_${Date.now()}_gemini`,
      dprEntryId: dprId,
      status: isUnmatched ? 'needs_review' : autoApplied ? 'approved' : 'needs_review',
      topMatch: {
        activityId: isUnmatched ? '' : (matchedAct?.id || 'a1'),
        activityName: isUnmatched ? 'Unmatched Field Activity' : (matchedAct?.name || parsed.activity || 'Matched Activity'),
        activityCode: isUnmatched ? 'UNLINKED' : (matchedAct?.activityId || parsed.matchedActivityCode || 'A1000'),
        discipline: matchedAct?.discipline || inferredDiscipline,
        wbsLevel: matchedAct?.wbsLevel || 'L5',
        confidence,
        confidenceLevel,
        matchedKeywords: matchedAct?.keywords || [],
        extractedQuantity: parsed.quantity,
        extractedUnit: parsed.unit || matchedAct?.unit || null,
        extractedLocation: parsed.location || parsed.chainage,
        extractedProgress: null,
        actualStartTime: parsed.actualStartTime,
        actualEndTime: parsed.actualEndTime,
        reasoning: parsed.reasoning || `Gemini LLM extraction (${Math.round(confidence * 100)}% confidence).`
      },
      alternativeMatches: projectActivities
        .filter(a => a.id !== matchedAct?.id)
        .slice(0, 2)
        .map(a => ({
          activityId: a.id,
          activityName: a.name,
          activityCode: a.activityId,
          discipline: a.discipline,
          wbsLevel: a.wbsLevel,
          confidence: 0.45,
          confidenceLevel: 'low' as const,
          matchedKeywords: a.keywords.slice(0, 2),
          extractedQuantity: parsed.quantity,
          extractedUnit: parsed.unit,
          extractedLocation: parsed.location,
          extractedProgress: null,
          actualStartTime: parsed.actualStartTime,
          actualEndTime: parsed.actualEndTime,
          reasoning: 'Alternative candidate based on schedule proximity.'
        })),
      extractedData: {
        date: today,
        actualStart: parsed.actualStartTime,
        actualEnd: parsed.actualEndTime,
        location: parsed.location,
        chainage: parsed.chainage,
        activity: parsed.activity,
        discipline: inferredDiscipline,
        quantity: parsed.quantity,
        unit: parsed.unit,
        progress: null,
        remarks: parsed.remarks || rawText,
        workforce: parsed.workforce,
        equipment: parsed.equipment || [],
        weather: parsed.weather,
      },
      autoApplied,
      reviewedBy: autoApplied ? 'gemini_agent' : null,
      reviewedAt: autoApplied ? new Date().toISOString() : null,
      reviewNotes: autoApplied ? 'Auto-approved via Gemini 1.5 LLM confidence ≥ 90%' : null,
      processedAt: new Date().toISOString(),
      modelUsed: 'gemini-1.5-flash'
    }
  } catch (err) {
    console.warn('Falling back to local multi-discipline matcher:', err)
    return processWithAI(dprId, rawText, projectId, today)
  }
}
