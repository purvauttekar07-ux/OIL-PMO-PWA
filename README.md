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
**Purva Uttekar**: Second Year in B.E, Artificial Intelligence & Data Science
[LinkedIn](https://www.linkedin.com/in/purvauttekar1397) · [GitHub](https://github.com/purvauttekar07-ux)
<img width="537" height="833" alt="Screenshot 2026-10-09 154624" src="https://github.com/user-attachments/assets/5cfcf963-6dc0-4e42-86cb-36ca9152458c" />
<img width="1920" height="1080" alt="Screenshot 2026-10-09 154557" src="https://github.com/user-attachments/assets/2119391a-61e2-4a5b-958a-b6089a477320" />
<img width="1920" height="1080" alt="Screenshot 2026-10-09 154519" src="https://github.com/user-attachments/assets/a9654c80-1de6-4f2b-a82f-da6d32254045" />
<img width="1920" height="1080" alt="Screenshot 2026-10-09 154459" src="https://github.com/user-attachments/assets/9e92e76b-2a3c-44c8-a07d-301f1ce0d7d7" />
<img width="1920" height="1080" alt="Screenshot 2026-10-09 154445" src="https://github.com/user-attachments/assets/332d5dc7-93fc-41bf-bdfe-9c3556bd84ae" />
<img width="1920" height="1080" alt="Screenshot 2026-10-09 154425" src="https://github.com/user-attachments/assets/5cf0c9c0-f891-4a53-981d-fd0722add8a9" />
<img width="1920" height="1080" alt="Screenshot 2026-10-09 154232" src="https://github.com/user-attachments/assets/b4d629ea-9ffb-48f2-ab89-356364d342eb" />

