from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import re
from rapidfuzz import fuzz
from activities import ACTIVITIES
import os

app = FastAPI(title="Nirman Setu AI - Schedule Linking Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy SBERT - load on first request to avoid startup delay
_sbert_model = None
_sbert_embeddings = None

def get_sbert():
    global _sbert_model, _sbert_embeddings
    if _sbert_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            from sklearn.metrics.pairwise import cosine_similarity
            import numpy as np
            _sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
            # Pre-embed all WBS names
            names = [a["name"] for a in ACTIVITIES]
            _sbert_embeddings = _sbert_model.encode(names, normalize_embeddings=True)
            print(f"SBERT loaded - {len(ACTIVITIES)} WBS embeddings ready")
        except Exception as e:
            print(f"SBERT load failed, falling back to RapidFuzz only: {e}")
            _sbert_model = False
    return _sbert_model, _sbert_embeddings

# Entity extraction helpers (mirrors frontend nlpMatcher.ts)
CHAINAGE_RE = re.compile(r"(?:ch(?:ainage)?\.?\s*|km\s*)(\d+\+\d+|\d+\.\d+|\d+)", re.I)
PROGRESS_RE = re.compile(r"(\d{1,3})\s*%\s*(?:done|complete|completed|progress|finished)?", re.I)
WEATHER_WORDS = ['rain','sunny','cloudy','fog','clear','overcast','storm','humid','monsoon']
WORKFORCE_RE = re.compile(r"(\d+)\s*(?:workers?|labour|men|persons?|manpower|welders?|fitters?)", re.I)

def detect_discipline(text: str) -> str:
    l = text.lower()
    if any(k in l for k in ['spool','weld','joint','pipe','hydrotest','ndt','radiograph']): return 'piping'
    if any(k in l for k in ['compressor','pump','skid','alignment','turbine','cold box','c-201','p-101']): return 'equipment'
    if any(k in l for k in ['cable','tray','transformer','substation','switchgear','breaker','megger','11kv','feeder']): return 'electrical'
    if any(k in l for k in ['loop','transmitter','dcs','marshalling','scada','tubing','calibration','4-20ma']): return 'instrumentation'
    if any(k in l for k in ['permit','safety','scaffold','toolbox','gas test','lel','hse','tbt']): return 'hse'
    if any(k in l for k in ['trench','excavation','pcc','rcc','concrete','foundation','mud mat','survey','grading','clearing','backfill']): return 'civil'
    return 'civil'

def extract_entities(text: str):
    m_chain = CHAINAGE_RE.search(text)
    m_prog = PROGRESS_RE.search(text)
    m_work = WORKFORCE_RE.search(text)
    weather = next((w for w in WEATHER_WORDS if w in text.lower()), None)
    # quantity: first number with unit
    qty = None; unit = None
    qty_re = re.search(r"(\d+(?:\.\d+)?)\s*(meters?|m\b|km\b|joints?|spools?|loops?|cum|%|percent|panels?|nos?|packages?)", text, re.I)
    if qty_re:
        qty = float(qty_re.group(1))
        unit = qty_re.group(2).lower()
    return {
        "discipline": detect_discipline(text),
        "chainage": m_chain.group(1) if m_chain else None,
        "progress": int(m_prog.group(1)) if m_prog else None,
        "weather": weather,
        "workforce": int(m_work.group(1)) if m_work else None,
        "quantity": qty,
        "unit": unit
    }

def score_activity(text: str, act: dict, inferred_disc: str):
    lower = text.lower()
    score = 0.0
    matched_keywords = []
    matched_jargon = None

    if act["discipline"] == inferred_disc:
        score += 0.20

    for j in act.get("jargon", []):
        if j.lower() in lower:
            score += 0.45
            matched_jargon = j
            matched_keywords.append(j)
            break

    for kw in act.get("keywords", []):
        if kw.lower() in lower:
            score += 0.25 if len(kw.split()) > 1 else 0.15
            matched_keywords.append(kw)

    # name word bonus
    for w in act["name"].lower().split():
        if len(w) > 4 and w in lower:
            score += 0.08

    if act.get("chainage") and CHAINAGE_RE.search(text):
        score += 0.12

    # SBERT semantic boost if model loaded
    sbert, embs = get_sbert()
    if sbert and embs is not None:
        try:
            from sklearn.metrics.pairwise import cosine_similarity
            import numpy as np
            idx = next(i for i,a in enumerate(ACTIVITIES) if a["id"]==act["id"])
            q_emb = sbert.encode([text], normalize_embeddings=True)
            cos = float(cosine_similarity(q_emb, [embs[idx]])[0][0])
            # blend: 40% semantic
            score = score * 0.6 + cos * 0.4
        except Exception:
            pass

    # RapidFuzz final blend
    rf = fuzz.token_set_ratio(text.lower(), act["name"].lower()) / 100.0
    score = max(score, rf * 0.85 + (0.1 if act["discipline"]==inferred_disc else 0))

    return min(score, 1.0), list(dict.fromkeys(matched_keywords)), matched_jargon

class IngestRequest(BaseModel):
    rawText: str
    projectId: str = "p1"
    date: Optional[str] = None
    location: Optional[str] = None

class BatchRequest(BaseModel):
    rows: List[dict]
    projectId: str = "p1"

@app.get("/api/health")
def health():
    return {"status": "ok", "model": "SBERT+RapidFuzz", "activities": len(ACTIVITIES)}

@app.get("/api/activities")
def get_activities(projectId: str = "p1"):
    return [a for a in ACTIVITIES if a["projectId"] == projectId]

@app.post("/api/ingest")
def ingest(req: IngestRequest):
    text = req.rawText.strip()
    if not text:
        raise HTTPException(status_code=400, detail="rawText empty")
    entities = extract_entities(text)
    date_str = req.date or __import__("datetime").date.today().isoformat()

    scored = []
    for act in [a for a in ACTIVITIES if a["projectId"]==req.projectId]:
        s, kws, j = score_activity(text, act, entities["discipline"])
        scored.append((s, act, kws, j))
    scored.sort(key=lambda x: x[0], reverse=True)

    top_score, top_act, top_kws, top_j = scored[0] if scored else (0, None, [], None)
    confidence = float(top_score)
    is_unmatched = confidence < 0.45
    level = "high" if confidence >= 0.85 else ("medium" if confidence >= 0.60 else "low")
    auto_applied = confidence >= 0.90 and not is_unmatched

    top_match = {
        "activityId": "" if is_unmatched else top_act["id"],
        "activityName": "Unmatched Field Activity" if is_unmatched else top_act["name"],
        "activityCode": "UNLINKED" if is_unmatched else top_act["activityId"],
        "discipline": (top_act["discipline"] if top_act else entities["discipline"]),
        "wbsLevel": top_act["wbsLevel"] if top_act else "L5",
        "confidence": confidence,
        "confidenceLevel": level,
        "matchedKeywords": top_kws,
        "matchedJargon": top_j,
        "extractedQuantity": entities["quantity"],
        "extractedUnit": entities["unit"],
        "extractedLocation": req.location or entities["chainage"],
        "extractedProgress": entities["progress"],
        "actualStartTime": None,
        "actualEndTime": None,
        "reasoning": f"Field jargon: '{top_j}'" if top_j else f"Matched keywords: {', '.join(top_kws[:3])}" if top_kws else "No direct match - flagged for review"
    }

    alternatives = []
    for s, act, kws, j in scored[1:3]:
        if s > 0.25:
            lvl = "high" if s >= 0.85 else ("medium" if s >= 0.60 else "low")
            alternatives.append({
                "activityId": act["id"], "activityName": act["name"], "activityCode": act["activityId"],
                "discipline": act["discipline"], "wbsLevel": act["wbsLevel"], "confidence": float(s),
                "confidenceLevel": lvl, "matchedKeywords": kws[:2], "matchedJargon": j,
                "extractedQuantity": entities["quantity"], "extractedUnit": entities["unit"],
                "extractedLocation": req.location, "extractedProgress": entities["progress"],
                "reasoning": f"Alternative in {act['discipline'].upper()} ({int(s*100)}%)"
            })

    return {
        "id": f"ai_{__import__('time').time_ns() % 1000000}",
        "dprEntryId": f"dpr_{__import__('time').time_ns() % 1000000}",
        "status": "needs_review" if is_unmatched or not auto_applied else "approved",
        "topMatch": top_match,
        "alternativeMatches": alternatives,
        "extractedData": {
            "date": date_str, "location": req.location or entities["chainage"],
            "chainage": entities["chainage"], "activity": top_act["name"] if top_act and not is_unmatched else None,
            "discipline": entities["discipline"], "quantity": entities["quantity"], "unit": entities["unit"],
            "progress": entities["progress"], "remarks": text[:120], "workforce": entities["workforce"],
            "equipment": [], "weather": entities["weather"]
        },
        "autoApplied": auto_applied,
        "processedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "modelUsed": "sbert+rapidfuzz"
    }

@app.post("/api/batch")
def batch(req: BatchRequest):
    results = []
    for row in req.rows:
        txt = row.get("fieldDescription") or row.get("rawText") or str(row)
        r = ingest(IngestRequest(rawText=txt, projectId=req.projectId, date=row.get("date")))
        results.append({"input": row, "result": r})
    matched = sum(1 for x in results if x["result"]["topMatch"]["confidence"] >= 0.60)
    return {"total": len(results), "matched": matched, "flagged": len(results)-matched, "results": results}
