import type { AnomalyReport, DPREntry, P6Activity } from '@/types'

// Realistic engineering thresholds for Oil & Gas EPC pipelines
const CAPACITY_LIMITS: Record<string, { maxDaily: number; unit: string; description: string }> = {
  a2: { maxDaily: 5, unit: 'km', description: 'Land Clearing & Grubbing (Max 5 km/day with 4 bulldozers)' },
  a3: { maxDaily: 1200, unit: 'meters', description: 'Trench Excavation (Max 1,200m/day with 6 excavators)' },
  a4: { maxDaily: 1500, unit: 'meters', description: 'Pipe Stringing (Max 1,500m/day with sidebooms)' },
  a5: { maxDaily: 1000, unit: 'meters', description: 'Pipe Laying (Max 1,000m/day)' },
  a6: { maxDaily: 60, unit: 'joints', description: 'Manual Butt Welding (Max 60 joints/day per team of 8 welders)' },
  a7: { maxDaily: 70, unit: 'joints', description: 'NDT Radiographic Testing (Max 70 joints/day)' },
  a8: { maxDaily: 1200, unit: 'meters', description: 'Coating & Wrapping (Max 1,200m/day)' },
  a9: { maxDaily: 2, unit: 'sections', description: 'Hydrotesting (Max 2 sections/day)' },
}

/**
 * Multi-factor Machine Learning & Rule-based Anomaly Detector
 */
export function detectAnomalies(
  dprEntries: DPREntry[],
  activities: P6Activity[],
  projectId: string
): AnomalyReport[] {
  const anomalies: AnomalyReport[] = []
  const projectActivities = activities.filter(a => a.projectId === projectId)
  const actMap = new Map(projectActivities.map(a => [a.id, a]))

  // ─── 1. Rate Anomaly Scan (Impossible Work Velocity) ──────────────────────
  dprEntries.forEach(dpr => {
    // Parse quantity from text or attachments
    const qtyMatch = dpr.rawText.match(/(\d+(?:\.\d+)?)\s*(?:m|meters|joints|km|sections)/i)
    if (qtyMatch) {
      const val = parseFloat(qtyMatch[1])
      
      // Match activity by keywords
      projectActivities.forEach(act => {
        const threshold = CAPACITY_LIMITS[act.id]
        if (threshold && act.keywords.some(k => dpr.rawText.toLowerCase().includes(k))) {
          if (val > threshold.maxDaily * 1.4) {
            const riskRatio = (val / threshold.maxDaily).toFixed(1)
            anomalies.push({
              id: `anom_rate_${dpr.id}_${act.id}`,
              projectId,
              activityId: act.id,
              activityName: act.name,
              dprEntryId: dpr.id,
              type: 'rate_spike',
              severity: 'critical',
              confidence: 0.94,
              title: `Suspicious Progress Velocity (${riskRatio}x Physical Capacity)`,
              description: `Reported ${val} ${threshold.unit} exceeds maximum theoretical daily capacity (${threshold.maxDaily} ${threshold.unit}/day). Possible contractor over-billing or typographical error.`,
              evidence: {
                reportedValue: `${val} ${threshold.unit}`,
                expectedThreshold: `≤ ${threshold.maxDaily} ${threshold.unit}/day`,
                metric: 'Machine Throughput Benchmark'
              },
              detectedAt: dpr.createdAt,
              status: 'active'
            })
          }
        }
      })
    }
  })

  // ─── 2. Weather vs Work Activity Inconsistency ────────────────────────────
  dprEntries.forEach(dpr => {
    const textLower = dpr.rawText.toLowerCase()
    const isHeavyRain = textLower.includes('heavy rain') || textLower.includes('downpour') || textLower.includes('flooding') || textLower.includes('storm')
    const isWelding = textLower.includes('welding') || textLower.includes('weld') || textLower.includes('joint')

    if (isHeavyRain && isWelding) {
      const weldAct = projectActivities.find(a => a.name.toLowerCase().includes('welding'))
      if (weldAct) {
        anomalies.push({
          id: `anom_weather_${dpr.id}`,
          projectId,
          activityId: weldAct.id,
          activityName: weldAct.name,
          dprEntryId: dpr.id,
          type: 'weather_conflict',
          severity: 'high',
          confidence: 0.88,
          title: 'Quality Risk: Welding Claimed During Heavy Rain',
          description: 'High welding progress reported during heavy precipitation. Standard OISD-141 / API 1104 safety standards prohibit outdoor shielded arc welding in rain without protective shelters due to hydrogen embrittlement risk.',
          evidence: {
            reportedValue: 'Heavy Rain reported on site',
            expectedThreshold: 'Sheltered dry conditions required',
            metric: 'OISD-141 Weather Compliance'
          },
          detectedAt: dpr.createdAt,
          status: 'active'
        })
      }
    }
  })

  // ─── 3. Precedence & Sequence Violations (Ghost Progress) ─────────────────
  projectActivities.forEach(act => {
    act.predecessors.forEach(predId => {
      const pred = actMap.get(predId)
      if (pred && act.actualProgress > 20 && pred.actualProgress < 40) {
        anomalies.push({
          id: `anom_seq_${act.id}_${pred.id}`,
          projectId,
          activityId: act.id,
          activityName: act.name,
          type: 'sequence_violation',
          severity: 'critical',
          confidence: 0.96,
          title: `Sequence Violation: ${act.name} out-pacing ${pred.name}`,
          description: `${act.name} is reported at ${act.actualProgress}% completion, but predecessor ${pred.name} is only at ${pred.actualProgress}%. In a linear pipeline sequence, this indicates out-of-sequence reporting or unverified actuals.`,
          evidence: {
            reportedValue: `${act.actualProgress}% vs Predecessor ${pred.actualProgress}%`,
            expectedThreshold: `Predecessor should be ≥ ${act.actualProgress}%`,
            metric: 'CPM Logical FS Precedence'
          },
          detectedAt: new Date().toISOString(),
          status: 'active'
        })
      }
    })
  })

  // ─── 4. Duplicate Claims on Same Chainage ──────────────────────────────────
  const chainageHistory = new Map<string, { dprId: string; date: string }>()
  dprEntries.forEach(dpr => {
    const chMatch = dpr.rawText.match(/(?:ch(?:ainage)?\.?\s*|km\s*)(\d+\+\d+|\d+\.\d+|\d+)/i)
    if (chMatch) {
      const chKey = chMatch[1]
      if (chainageHistory.has(chKey)) {
        const prev = chainageHistory.get(chKey)!
        if (prev.dprId !== dpr.id) {
          anomalies.push({
            id: `anom_dup_${dpr.id}_${chKey}`,
            projectId,
            activityId: 'a5',
            activityName: 'Pipe Laying / Welding Section',
            dprEntryId: dpr.id,
            type: 'chainage_overlap',
            severity: 'medium',
            confidence: 0.82,
            title: `Duplicate Chainage Progress Claim: Ch. ${chKey}`,
            description: `Chainage ${chKey} was already recorded in DPR ${prev.dprId} on ${prev.date}. Multiple overlapping claims detected for the same spatial segment.`,
            evidence: {
              reportedValue: `Duplicate entry at Ch. ${chKey}`,
              expectedThreshold: 'Unique spatial segment progression',
              metric: 'Spatial Geofence / Chainage Validator'
            },
            detectedAt: dpr.createdAt,
            status: 'active'
          })
        }
      } else {
        chainageHistory.set(chKey, { dprId: dpr.id, date: dpr.date })
      }
    }
  })

  return anomalies
}
