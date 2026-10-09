# 🛢️ OIL PMO – Field Progress Tracker

**Intelligent Data Capture & Schedule-Linking for Infrastructure Projects – Oil India Limited**

A mobile-first Progressive Web App (PWA) that lets project teams capture progress data from the field and link it to project schedules, giving the PMO a clear, real-time view of how infrastructure work is moving.

🔗 **Live Demo:** https://oil-pmo-pwa.vercel.app/

## ✨ Features
- 📱 **Installable PWA**: works like a native app on phones and desktops
- 📝 **Field Entry**: quick progress data capture from the site
- 🔗 **Schedule Linking**: matches field updates to schedule activities using an NLP matcher
- 📅 **Schedule & CPM Engine**: critical path calculation, with Primavera `.xer` file parsing
- 🚨 **Anomaly Detection**: flags unusual progress patterns
- 🔮 **What-If Simulation**: test schedule impact before deciding
- ✅ **Approvals & Alerts**: review workflow with notifications
- 🧠 **Institutional Memory**: keeps lessons learned from past projects
- 🤖 **AI Chatbot**: Gemini-powered assistant with an offline fallback matcher
- 🌙 Dark mode and role switching

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| State & Storage | Zustand-style store, IndexedDB (offline support) |
| Backend | Python (FastAPI) |
| AI | Google Gemini API |
| Hosting | Vercel (frontend), Railway (backend) |

## 📸 Screenshots
<!-- Add your screenshots here, e.g. ![Dashboard](docs/screenshots/dashboard.png) -->

## 🚀 Run Locally
```bash
git clone https://github.com/purvauttekar07-ux/OIL-PMO-PWA.git
cd OIL-PMO-PWA
npm install
npm run dev
```

**Backend (optional):**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🔑 Configuration
Add your Gemini API key from the app's **Settings** page to enable the AI assistant. Without it, the app uses the offline matcher.

## 👩‍💻 Author
**Purva Uttekar**: B.Tech, Artificial Intelligence & Data Science
[LinkedIn](https://www.linkedin.com/) · [GitHub](https://github.com/purvauttekar07-ux)
