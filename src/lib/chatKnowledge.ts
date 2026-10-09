// ─── Chatbot Knowledge Base ───────────────────────────────────────────────────
// Every entry has: keywords to match, a simple answer, an optional Hindi/Assamese
// translation hint, and optional follow-up chips.

export interface KBEntry {
  id: string
  keywords: string[]
  question: string          // canonical question shown as suggestion
  answer: string            // plain-language answer
  hindiHint?: string        // key phrase in Hindi so field workers relate
  followUps?: string[]      // quick-reply chips shown after this answer
  tags: string[]            // page context tags: 'field' | 'approvals' | 'schedule' | 'dashboard' | 'general'
}

export const KNOWLEDGE_BASE: KBEntry[] = [
  // ── DPR ──────────────────────────────────────────────────────────────────
  {
    id: 'dpr',
    keywords: ['dpr', 'daily progress', 'progress report', 'report', 'din ki report', 'daily'],
    question: 'What is a DPR?',
    answer:
      '📋 **DPR = Daily Progress Report.**\n\nIt is a simple daily record of what work was done on site today — like a diary for the construction site.\n\nYou just write:\n• What work was done (e.g. "Pipe laying 500m")\n• Where it was done (location / chainage)\n• How many workers were present\n• Any problems faced\n\nThat\'s it! The app then automatically links it to the correct activity in the plan.',
    hindiHint: 'DPR = रोज़ का काम का हिसाब',
    followUps: ['What is chainage?', 'How do I fill DPR?', 'What is GPS capture?'],
    tags: ['field', 'general'],
  },
  {
    id: 'how-fill-dpr',
    keywords: ['how to fill', 'fill dpr', 'submit dpr', 'kaise bhare', 'entry kaise', 'how to submit'],
    question: 'How do I fill the DPR?',
    answer:
      '✍️ **Filling a DPR is easy — 4 steps:**\n\n1. **Select your project** from the dropdown\n2. **Choose how you want to enter** — type, voice, photo, Excel, or WhatsApp paste\n3. **Describe today\'s work** in plain words — e.g. "Today we laid 480m pipe at Ch. 62+400. 45 workers. Clear weather."\n4. **Tap GPS** to capture your location, then hit **Submit**\n\nThe AI reads your text and automatically finds the right activity in the schedule. If it\'s very sure (≥90%), it updates directly. If not, it sends to the planner for quick approval.',
    hindiHint: 'Kaam ki report likhke Submit dabao',
    followUps: ['What is AI confidence?', 'What is chainage?', 'What happens after I submit?'],
    tags: ['field'],
  },
  {
    id: 'chainage',
    keywords: ['chainage', 'ch.', 'kilometer marker', 'location marker', 'chain', 'rods', 'distance mark'],
    question: 'What is chainage?',
    answer:
      '📍 **Chainage = distance marker along a pipeline or road.**\n\nThink of it like milestones on a highway. Instead of "km 5", pipeline engineers write **Ch. 5+200** — meaning 5 km and 200 metres from the starting point.\n\nExamples:\n• Ch. 0+000 = Start point\n• Ch. 52+800 = 52.8 km from start\n• Ch. 148+000 = End of pipeline\n\nWhen filling a DPR, writing the chainage tells the system *exactly* where today\'s work happened.',
    hindiHint: 'Pipeline ki shuruat se kitni door — woh number',
    followUps: ['What is a DPR?', 'How do I fill DPR?', 'What is pipe laying?'],
    tags: ['field', 'schedule'],
  },
  {
    id: 'gps',
    keywords: ['gps', 'location', 'coordinates', 'capture location', 'gps kya hai'],
    question: 'What is GPS capture?',
    answer:
      '🛰️ **GPS capture records your exact site location** when you submit a DPR.\n\nWhy it matters:\n• It proves the work was reported from the actual site\n• Helps the system match your entry to the correct pipeline section\n• Useful if chainage is not written — GPS can figure it out\n\nJust tap the **"Capture GPS"** button before submitting. It only takes 2–3 seconds. Works even in remote areas with basic connectivity.',
    hindiHint: 'Aapki jagah ki location mobile se lena',
    followUps: ['What if I am offline?', 'What is chainage?'],
    tags: ['field'],
  },
  {
    id: 'offline',
    keywords: ['offline', 'no internet', 'no network', 'internet nahi', 'network nahi', 'sync', 'pending'],
    question: 'What if I am offline / no internet?',
    answer:
      '📶 **No internet? No problem!**\n\nThe app works fully offline. Here\'s what happens:\n\n1. You fill and submit your DPR as normal\n2. It gets saved on your phone automatically\n3. When internet comes back, it **auto-syncs** to the server — you don\'t need to do anything\n\nYou\'ll see a small **orange number** near the top of the screen showing how many entries are waiting to sync.\n\nThis is especially important in remote sites in Assam and Arunachal where network is unreliable.',
    hindiHint: 'Internet na ho toh bhi kaam hoga, baad mein sync hoga',
    followUps: ['What is a DPR?', 'What is GPS capture?'],
    tags: ['field', 'general'],
  },

  // ── AI & Confidence ──────────────────────────────────────────────────────
  {
    id: 'ai-confidence',
    keywords: ['confidence', 'ai confidence', 'percentage', 'confidence score', '78%', '65%', 'high confidence', 'low confidence', 'medium confidence'],
    question: 'What is AI confidence?',
    answer:
      '🤖 **Confidence = how sure the AI is about its match.**\n\nWhen you submit a DPR, the AI reads your text and tries to find the matching task in the P6 schedule. It gives a score:\n\n🟢 **≥90% = High** → Auto-applied, no review needed\n🟡 **60–89% = Medium** → Sent to planner for quick approval\n🔴 **<60% = Low** → Needs manual assignment\n\nExample: You write "pipe laying 500m". AI sees "pipe laying" in Activity A1050 and gives 95% confidence — done!\n\nIf you write something vague like "work done today", AI can\'t be sure, so it asks a planner to check.',
    hindiHint: 'AI kitna sure hai — zyada % = zyada pakka',
    followUps: ['How do I approve an entry?', 'What is the approval queue?', 'What is P6?'],
    tags: ['approvals', 'field', 'general'],
  },
  {
    id: 'approval-queue',
    keywords: ['approval', 'approve', 'queue', 'review', 'pending approval', 'needs review', 'reject', 'manzoori'],
    question: 'What is the approval queue?',
    answer:
      '✅ **The Approval Queue is where planners review DPR entries that the AI isn\'t 100% sure about.**\n\nHere\'s the flow:\n1. Field supervisor submits DPR\n2. AI reads it and gives a confidence score\n3. If confidence < 90%, it lands in this queue\n4. You (as planner) review:\n   • Is the matched activity correct?\n   • Is the quantity right?\n5. **Approve** → Updates P6 schedule immediately\n   **Reject** → Entry is discarded\n   **Reassign** → Pick a different P6 activity manually\n\nThis queue replaces the old method where someone manually read WhatsApp messages and typed into P6 for hours!',
    hindiHint: 'Planner check karta hai aur approve karta hai',
    followUps: ['What is AI confidence?', 'How do I approve an entry?', 'What is P6?'],
    tags: ['approvals'],
  },
  {
    id: 'how-approve',
    keywords: ['how to approve', 'approve kaise', 'approve entry', 'how approve', 'approve dpr'],
    question: 'How do I approve an entry?',
    answer:
      '👍 **Approving an entry — 3 taps:**\n\n1. Go to **AI Approvals** page (checklist icon in menu)\n2. Review the card:\n   • Check the matched P6 activity name\n   • Check extracted quantity and location\n   • Read the AI\'s reasoning\n3. Choose an action:\n   • ✅ **Approve & Apply to P6** — updates the schedule\n   • ❌ **Reject** — entry discarded\n   • 🔄 **Reassign** — pick a different activity from dropdown\n\nYou can optionally add a note before approving (e.g. "Rock encountered — flag for cost team").',
    hindiHint: 'Check karo, sahi hai toh Approve karo',
    followUps: ['What is AI confidence?', 'What is the approval queue?'],
    tags: ['approvals'],
  },

  // ── P6 / Schedule ─────────────────────────────────────────────────────────
  {
    id: 'p6',
    keywords: ['p6', 'primavera', 'primavera p6', 'schedule software', 'planning software', 'p6 kya hai'],
    question: 'What is Primavera P6?',
    answer:
      '🗓️ **P6 = Bada Time-Table.**\n\nSocho school ka time-table — kaun sa kaam kab shuru hoga, kab khatam hoga, sab likha hota hai.\n\nP6 me har kaam ka date likha hota hai. Agar ek kaam late hua, to agle kaam bhi late honge — ye P6 khud calculate kar leta hai.\n\nPehle field ka data WhatsApp me tha, P6 se alag. Ab ye app dono ko jodta hai.',
    hindiHint: 'Bada time-table jisme pure project ke dates hote hain',
    followUps: ['What is WBS?', 'What is an activity?', 'What is Critical Path?'],
    tags: ['schedule', 'general'],
  },
  {
    id: 'wbs',
    keywords: ['wbs', 'work breakdown', 'structure', 'hierarchy', 'breakdown'],
    question: 'What is WBS?',
    answer:
      '🌳 **WBS = Work Breakdown Structure.**\n\nIt\'s how the project is divided into smaller pieces, like a family tree:\n\n```\nProject (Pipeline)\n├── 1.1 Survey & Land Acquisition\n├── 1.2 Civil Works\n│   ├── 1.2.1 Land Clearing\n│   └── 1.2.2 Trench Excavation\n└── 1.3 Pipe Works\n    ├── 1.3.1 Stringing\n    ├── 1.3.2 Pipe Laying\n    └── 1.3.3 Welding\n```\n\nEach box at the bottom is an **Activity** with its own schedule, quantity, and progress tracking.',
    hindiHint: 'Kaam ko tote tote karna — bade kaam ko chhote chhote kamon mein banana',
    followUps: ['What is an activity?', 'What is P6?', 'What is Critical Path?'],
    tags: ['schedule'],
  },
  {
    id: 'activity',
    keywords: ['activity', 'task', 'p6 activity', 'activity id', 'a1050', 'a1020', 'kaam'],
    question: 'What is a P6 Activity?',
    answer:
      '⚙️ **An Activity is one specific task in the schedule.**\n\nEach activity has:\n• **Activity ID** (e.g. A1050) — unique code\n• **Name** (e.g. "Pipe Laying")\n• **Start & Finish dates** (planned)\n• **Quantity** (e.g. 148,000 metres total)\n• **Progress** — planned vs actual %\n\nWhen you submit a DPR saying "laid 500m pipe today", the AI matches it to Activity A1050 (Pipe Laying) and adds 500m to its actual quantity.\n\nThis is how field work automatically updates the HQ schedule!',
    hindiHint: 'Ek kaam = ek activity, jaise "Trench Khudai"',
    followUps: ['What is WBS?', 'What is planned vs actual?', 'What is Critical Path?'],
    tags: ['schedule', 'general'],
  },
  {
    id: 'critical-path',
    keywords: ['critical path', 'critical', 'cp', 'cpm', 'critical activity', 'delay critical', 'critical kya'],
    question: 'What is Critical Path?',
    answer:
      '🔴 **Critical Path = Sabse important kaamon ki line.**\n\nSocho: Khudai → Pipe dalna → Jodna → Check karna\n\nAgar beech ka ek kaam 10 din late hua, to pura project 10 din late. Kyunki agle kaam usi par depend hain.\n\nApp me ye kaam **red badge** se dikhte hain. Ine roz check karna zaroori hai!',
    hindiHint: 'Ye line late = pura project late',
    followUps: ['What is SPI?', 'What is an activity?', 'What is P6?'],
    tags: ['schedule', 'dashboard'],
  },
  {
    id: 'planned-vs-actual',
    keywords: ['planned', 'actual', 'planned vs actual', 'difference', 'variance', 'planned progress', 'actual progress'],
    question: 'What is planned vs actual progress?',
    answer:
      '📊 **Planned = what should have been done by today. Actual = what was really done.**\n\nExample for Pipe Laying:\n• **Planned:** 75% complete by today\n• **Actual:** 58% complete\n• **Variance:** −17% (behind schedule)\n\nThe progress bars in the app always show both:\n🔵 Grey bar marker = Planned\n🟠 Orange fill = Actual\n\nIf actual is behind planned by more than 5–10%, alerts are triggered and planners are notified.',
    hindiHint: 'Kya hona chahiye tha vs. kya hua — farq hi delay hai',
    followUps: ['What is SPI?', 'What is Critical Path?', 'What is an alert?'],
    tags: ['dashboard', 'schedule'],
  },
  {
    id: 'spi',
    keywords: ['spi', 'schedule performance', 'schedule performance index', 'cpi', 'cost performance', '0.84', '0.92', 'performance index'],
    question: 'What is SPI / CPI?',
    answer:
      '📈 **SPI = Simple number jo batata hai kaam time par hai ya late.**\n\n• **SPI = 1.0** → Bilkul time par ✅\n• **SPI = 0.84** → Thoda peeche, 16% delay ⚠️\n• **SPI = 0.62** → Bahut peeche, dhyan chahiye 🔴\n\nCPI same hai par paise ke liye — kitna kharch vs kitna kaam hua.\n\nSimple: 1 se kam = peeche, 1 = sahi, 1 se zyada = aage.',
    hindiHint: '1 matlab time par, kam matlab late',
    followUps: ['What is Critical Path?', 'What is planned vs actual?'],
    tags: ['dashboard'],
  },

  // ── Alerts ───────────────────────────────────────────────────────────────
  {
    id: 'alerts',
    keywords: ['alert', 'notification', 'alarm', 'warning', 'red alert', 'what is alert', 'kya hua'],
    question: 'What is an alert?',
    answer:
      '🔔 **Alerts are automatic warnings sent when something needs attention.**\n\nTypes of alerts:\n\n🔴 **Critical** — Needs action NOW\n• Activity on Critical Path is delayed\n• SPI dropped below 0.8\n\n🟡 **Warning** — Monitor closely\n• Activity falling behind plan\n• Site hasn\'t submitted DPR for 3+ days\n• AI approval entries piling up\n\n🔵 **Info** — FYI\n• Milestone achieved\n• Activity completed ahead of plan\n\nAlerts appear as a number on the bell icon (top right). Tap to see details and act.',
    hindiHint: 'Kuch galat ho raha hai ya dhyan chahiye — app khud batata hai',
    followUps: ['What is Critical Path?', 'What is SPI?', 'What is the approval queue?'],
    tags: ['dashboard', 'general'],
  },
  {
    id: 'no-update-alert',
    keywords: ['no update', 'no dpr', '3 days', 'no submission', 'site not submitted', 'koi report nahi'],
    question: 'Why did I get a "No Update" alert?',
    answer:
      '⚠️ **A "No Update" alert means a site hasn\'t submitted a DPR for 3 or more consecutive days.**\n\nThis is a concern because:\n• We don\'t know if work is happening or stopped\n• The schedule can\'t be updated without data\n• HQ might make wrong decisions\n\n**What to do:**\n1. Contact the site supervisor\n2. Check if there was a genuine reason (rain shutdown, holiday, etc.)\n3. Ask them to submit DPR for the missed days\n\nEven if no work happened, a "Nil report" (zero progress) should be submitted.',
    hindiHint: '3 din se koi report nahi aayi site se',
    followUps: ['What is a DPR?', 'How do I fill DPR?'],
    tags: ['dashboard', 'general'],
  },

  // ── Specific field terms ──────────────────────────────────────────────────
  {
    id: 'pipe-laying',
    keywords: ['pipe laying', 'laying', 'lowering in', 'pipe lowering', 'pipelaying'],
    question: 'What is Pipe Laying?',
    answer:
      '🔧 **Pipe Laying = placing the actual pipe sections into the prepared trench.**\n\nIt comes after:\n1. ✅ Trench is dug\n2. ✅ Pipe sections are strung alongside\n3. ➡️ **Pipe lowered into trench** ← this is Pipe Laying\n4. Welding\n5. NDT testing\n\nIt\'s measured in **RMT (Running Metres)** or simply **metres**.\n\nWhen you report "laid 500m pipe", the AI looks for the Pipe Laying activity and adds 500m to the actual quantity.',
    hindiHint: 'Pipe ko khudai mein daalna',
    followUps: ['What is welding?', 'What is trench excavation?', 'What is chainage?'],
    tags: ['field', 'schedule'],
  },
  {
    id: 'welding',
    keywords: ['welding', 'weld', 'joint', 'butt weld', 'welding works', 'veld', 'joints'],
    question: 'What is Welding (in pipeline context)?',
    answer:
      '🔥 **Welding = permanently joining two pipe sections together.**\n\nAfter pipes are laid in the trench, the ends are welded (fused) together to make one continuous pipeline.\n\nIt\'s measured in **joints** — each weld between two pipes = 1 joint.\n\nAfter welding, each joint is tested by NDT (X-ray / ultrasound) to ensure it\'s strong and leak-proof.\n\nIn your DPR, report as:\n*"Completed 28 welding joints at Ch. 52+800"*',
    hindiHint: 'Do pipe ko jodna — weld = jodd',
    followUps: ['What is NDT?', 'What is pipe laying?', 'What is chainage?'],
    tags: ['field', 'schedule'],
  },
  {
    id: 'ndt',
    keywords: ['ndt', 'radiographic', 'rt', 'ultrasonic', 'x-ray', 'testing', 'inspection', 'radiography'],
    question: 'What is NDT?',
    answer:
      '🔬 **NDT = Non-Destructive Testing. It checks if welds are strong without breaking them.**\n\nThink of it like an X-ray at a hospital — it finds problems inside without cutting open.\n\nCommon types:\n• **Radiographic Testing (RT)** — uses X-rays to image the weld\n• **Ultrasonic Testing (UT)** — uses sound waves\n\nIf a weld **fails** NDT, it must be **cut out and redone** before the pipeline can be used.\n\nIn a DPR: *"RT done for 28 joints at Ch. 52+800. 2 joints failed, will redo tomorrow."*',
    hindiHint: 'Weld sahi hai ya nahi — X-ray se check karna',
    followUps: ['What is welding?', 'What is hydrotesting?'],
    tags: ['field', 'schedule'],
  },
  {
    id: 'hydrotesting',
    keywords: ['hydrotest', 'hydrotesting', 'pressure test', 'water test', 'hydro test'],
    question: 'What is Hydrotesting?',
    answer:
      '💧 **Hydrotesting = filling the pipeline with water and pressurising it to check for leaks.**\n\nIt\'s the final test before a pipeline is put into service.\n\nHow it works:\n1. A section of pipeline is sealed at both ends\n2. Filled completely with water\n3. Pressure pumped up to 1.5× operating pressure\n4. Held for several hours\n5. If pressure holds steady = pipeline is safe ✅\n6. If pressure drops = there\'s a leak → find and fix\n\nThis activity comes near the end of the project, after all welding and NDT is done.',
    hindiHint: 'Pipeline mein paani bharo, pressure do — leak hai ya nahi check karo',
    followUps: ['What is NDT?', 'What is Critical Path?'],
    tags: ['field', 'schedule'],
  },
  {
    id: 'trench',
    keywords: ['trench', 'excavation', 'khudai', 'trench digging', 'digging', 'trenching'],
    question: 'What is Trench Excavation?',
    answer:
      '⛏️ **Trench Excavation = digging a long channel in the ground for the pipeline.**\n\nThe trench must be:\n• Deep enough to protect the pipe (usually 1–2m deep)\n• Wide enough for the pipe + workers\n• Stable walls (sometimes needs shoring in loose soil)\n\nIt\'s measured in **metres** of trench length completed.\n\nDPR example: *"250m trench excavation done at Ch. 62+400. Rock encountered at 1.8m depth."* — that rock note is important for cost tracking!',
    hindiHint: 'Zameen mein lambi khudai — pipe dalane ke liye',
    followUps: ['What is pipe laying?', 'What is chainage?'],
    tags: ['field', 'schedule'],
  },

  // ── General app help ──────────────────────────────────────────────────────
  {
    id: 'roles',
    keywords: ['role', 'field supervisor', 'site engineer', 'planner', 'pmo', 'manager', 'who does what', 'kaun kya karta'],
    question: 'Who does what in this app?',
    answer:
      '👥 **Different people use different parts of the app:**\n\n🦺 **Field Supervisor / Site Engineer**\n→ Submits daily DPR from site\n→ Captures GPS, photos, voice notes\n\n📐 **Planner**\n→ Reviews AI approval queue\n→ Approves/rejects/reassigns matched entries\n→ Monitors schedule vs actual\n\n📊 **PMO Manager**\n→ Views dashboard, S-Curve, KPIs\n→ Receives critical alerts\n→ Makes decisions based on real-time data\n\nAll roles see the Alerts page and can ask this assistant for help!',
    hindiHint: 'Koun kya karta hai — field = DPR, planner = approve, PMO = dekh-rekh',
    followUps: ['What is a DPR?', 'What is the approval queue?', 'What is SPI?'],
    tags: ['general'],
  },
  {
    id: 's-curve',
    keywords: ['s curve', 's-curve', 'scurve', 'graph', 'chart', 'progress chart', 'cumulative'],
    question: 'What is the S-Curve?',
    answer:
      '📈 **S-Curve = time ke saath kitna kaam hua — graph me.**\n\nGrey line = plan ke hisab se kitna hona chahiye tha\nOrange line = asal me kitna hua\nAgar orange grey se neeche = peeche hai.',
    hindiHint: 'S-shape graph = time ke saath kitna kaam hua',
    followUps: ['What is planned vs actual?', 'What is SPI?', 'What is Critical Path?'],
    tags: ['dashboard'],
  },
  {
    id: 'what-is-nirman-setu',
    keywords: ['nirman setu', 'what is nirman', 'nirman kya hai', 'what does this app do', 'app kya karta hai', 'software kya hai'],
    question: 'What is Nirman Setu?',
    answer:
      '🌉 **Nirman Setu = Site aur HQ ke beech ka bridge.**\n\nAap field se DPR bhejte ho — photo, voice, text. App usko padh kar sahi P6 activity se jodta hai aur progress update kar deta hai.\n\nSimple: Aap bolo, app samjhe, schedule update ho gaya.',
    hindiHint: 'Site aur HQ ko jodne wala bridge',
    followUps: ['How do I fill DPR?', 'What is AI confidence?', 'Who does what in this app?'],
    tags: ['general'],
  },
  {
    id: 'how-to-use-app',
    keywords: ['how to use', 'kaise use kare', 'app kaise chalana', 'how does this work', 'kya karna hai'],
    question: 'How do I use Nirman Setu?',
    answer:
      '📱 **3 simple steps:**\n\n1. **Field Capture** — DPR likho ya bolo, photo lo, GPS lo\n2. **AI check** — App khud P6 activity dhoodega\n3. **Planner dekhega** — High confidence auto-update, low wale queue me\n\nDashboard par live progress dekho. Bas itna hi!',
    hindiHint: 'Field me entry karo, AI jodega, planner dekhega',
    followUps: ['How do I fill DPR?', 'What is the approval queue?', 'What is the S-Curve?'],
    tags: ['general', 'field'],
  },
]

// ─── Greeting & fallback messages ─────────────────────────────────────────────

export const GREETINGS_BY_ROLE: Record<string, string> = {
  field_supervisor:
    'Namaste! 👋 Main Sahayak hun.\n\nAap mujhse simple bhasha me puch sakte ho:\n• DPR kaise bharna hai?\n• Chainage, SPI jaise shabdon ka matlab\n• Internet na ho to kya karna hai\n\nBolo, kya madad chahiye?',
  site_engineer:
    'Hello! 👋 Main Sahayak hun.\n\nKoi bhi doubt — chhota ya bada — simple shabdon me samjhaunga. Bas pucho!',
  planner:
    'Hello! 👋 Main Sahayak hun.\n\nApproval kaise karna hai ya SPI ka matlab — sab simple bhasha me batata hun. Kya puchna hai?',
  pmo_manager:
    'Hello! 👋 Main Sahayak hun.\n\nDashboard ke numbers ya schedule ke shabdon ko simple tarike se samjhaunga. Kya jan na hai?',
  admin:
    'Hello! 👋 Main Sahayak hun. Jo bhi doubt hai, simple bhasha me pucho!',
}

export const FALLBACK_RESPONSE =
  "🤔 Samjha nahi — simple me pucho!\n\nTry:\n• \"DPR kya hai?\"\n• \"SPI kya hai?\"\n• \"Chainage matlab?\"\n• \"Approve kaise karna hai?\"\n\nKoi bhi shabd jo screen par dikhe, bas type karo — simple me samjhaunga!"

export const PAGE_CONTEXT_HINTS: Record<string, string> = {
  '/field':
    'You\'re on the **DPR Entry** page. You can ask me:\n• "How do I fill the DPR?"\n• "What is chainage?"\n• "What happens after I submit?"',
  '/approvals':
    'You\'re on the **AI Approvals** page. You can ask me:\n• "What is AI confidence?"\n• "How do I approve an entry?"\n• "What does Reassign mean?"',
  '/schedule':
    'You\'re on the **P6 Schedule** page. You can ask me:\n• "What is an activity?"\n• "What is Critical Path?"\n• "What is WBS?"',
  '/':
    'You\'re on the **PMO Dashboard**. You can ask me:\n• "What is SPI?"\n• "What is the S-Curve?"\n• "What is Critical Path?"',
  '/alerts':
    'You\'re on the **Alerts** page. You can ask me:\n• "What is an alert?"\n• "What is a critical alert?"\n• "Why did I get a No Update alert?"',
}

// ─── Matching function ────────────────────────────────────────────────────────

export function findAnswer(query: string, pageTag?: string): KBEntry | null {
  const lower = query.toLowerCase().trim()
  if (!lower) return null

  let bestScore = 0
  let bestEntry: KBEntry | null = null

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0

    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        // Multi-word keyword = higher score
        score += kw.split(' ').length > 1 ? 3 : 1
      }
    }

    // Boost if page context matches
    if (pageTag && entry.tags.includes(pageTag)) {
      score += 0.5
    }

    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  return bestScore > 0 ? bestEntry : null
}
