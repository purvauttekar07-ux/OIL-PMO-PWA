import type { AIProcessingResult } from '@/types'

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000'

export async function extractWithBackend(
  rawText: string,
  projectId: string,
  date?: string,
  location?: string
): Promise<AIProcessingResult> {
  const res = await fetch(`${BACKEND_URL}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, projectId, date, location }),
  })
  if (!res.ok) throw new Error(`Backend ${res.status}`)
  return (await res.json()) as AIProcessingResult
}

export async function isBackendAlive(): Promise<boolean> {
  try {
    const r = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(1500) })
    return r.ok
  } catch { return false }
}
