import { useState } from 'react'
import {
  Bell, Wifi, Moon, Globe, Database, Shield, Info,
  ChevronRight, Key, Sparkles, CheckCircle2, Sliders, RefreshCw
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store/useAppStore'
import { MOCK_USERS } from '@/lib/mockData'
import { useToast } from '@/hooks/useToast'
import clsx from 'clsx'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-11 h-6 rounded-full transition-colors flex items-center',
        checked ? 'bg-oil-600' : 'bg-slate-700'
      )}
    >
      <span className={clsx(
        'absolute w-4 h-4 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-6' : 'translate-x-1'
      )} />
    </button>
  )
}

export function Settings() {
  const { user, toggleDarkMode, darkMode, geminiApiKey, setGeminiApiKey, switchUserRole } = useAppStore()
  const { toast } = useToast()

  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey)
  const [notifs, setNotifs] = useState({ delay: true, spi: true, approval: true, noUpdate: false, anomalies: true })
  const [offlineMode, setOfflineMode] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [lang, setLang] = useState('hi')
  const [aiThreshold, setAiThreshold] = useState(90)

  function handleSaveApiKey() {
    setGeminiApiKey(apiKeyInput)
    toast({
      type: 'success',
      title: apiKeyInput ? 'Gemini API Key Saved' : 'Switched to Offline Neural Engine',
      message: apiKeyInput ? 'Live multi-lingual Gemini 1.5/2.0 LLM extraction enabled.' : 'Local neural matcher active.'
    })
  }

  const SECTION = 'space-y-3'
  const ROW = 'flex items-center justify-between py-2.5 border-b border-slate-700/40 last:border-0'

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">System Settings & Integrations</h1>
        <p className="text-sm text-slate-400 mt-0.5">Configure AI models, Primavera P6 connectors, role switching, and preferences.</p>
      </div>

      {/* User Role Switching Card */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Shield size={16} className="text-oil-400" /> Active Session & Role Switcher
          </p>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <div className="flex items-center gap-4 p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-oil-500 to-oil-700 flex items-center justify-center text-lg font-bold text-white shrink-0">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')} · Oil India Limited</p>
            </div>
            <Badge variant="info">{user.role.replace('_', ' ')}</Badge>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-300 font-semibold">Switch Persona (Live Demonstration)</span>
            <select
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              value={user.id}
              onChange={e => switchUserRole(e.target.value)}
            >
              {MOCK_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.role.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Live Gemini LLM Key Configuration */}
      <Card className="border-oil-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-oil-400" /> Google Gemini Multilingual LLM Integration
            </p>
            <Badge variant={geminiApiKey ? 'success' : 'outline'} size="sm">
              {geminiApiKey ? 'Live API Active' : 'Offline Neural Matcher'}
            </Badge>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <p className="text-xs text-slate-400">
            Provide a Google Gemini API key to enable zero-shot extraction from Hindi, Assamese, and Hinglish site voice logs.
            If left blank, Nirman Setu uses the built-in high-speed offline neural entity matcher.
          </p>

          <div className="space-y-1.5">
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-oil-500"
              />
              <Button size="sm" variant="primary" onClick={handleSaveApiKey}>
                Save Key
              </Button>
            </div>
            <p className="text-[10px] text-slate-500">Keys are stored securely in local browser memory only.</p>
          </div>
        </CardBody>
      </Card>

      {/* AI Thresholds */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Sliders size={16} className="text-blue-400" /> Schedule-Linking Confidence Gate
          </p>
        </CardHeader>
        <CardBody className="pt-0 space-y-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-xs font-semibold text-slate-200">Auto-Apply Threshold</p>
              <span className="text-xs font-bold text-oil-400 font-mono">{aiThreshold}% Confidence</span>
            </div>
            <input
              type="range"
              min={75}
              max={98}
              value={aiThreshold}
              onChange={e => setAiThreshold(Number(e.target.value))}
              className="w-full accent-oil-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Field extractions with confidence score ≥ {aiThreshold}% automatically update Primavera P6 with full audit trail. Entries between 60%–{aiThreshold - 1}% route to Planning Engineer for review.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Oracle Primavera P6 Connector Settings */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Database size={16} className="text-emerald-400" /> Oracle Primavera P6 EPPM Connector
          </p>
        </CardHeader>
        <CardBody className="pt-0 space-y-3 text-xs text-slate-300">
          <div className={ROW}>
            <div>
              <p className="font-semibold text-white">Integration Engine</p>
              <p className="text-slate-500">Native XER 8.0 Parser & Tab-Delimited Exporter</p>
            </div>
            <Badge variant="success" size="sm">Active (Bidirectional)</Badge>
          </div>
          <div className={ROW}>
            <div>
              <p className="font-semibold text-white">CPM Calculation Algorithm</p>
              <p className="text-slate-500">Forward/Backward Pass with Total Float Computation</p>
            </div>
            <Badge variant="info" size="sm">Topological Sort</Badge>
          </div>
        </CardBody>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Globe size={16} /> Regional & Offline Settings
          </p>
        </CardHeader>
        <CardBody className="pt-0 space-y-2 text-xs">
          <div className={ROW}>
            <div>
              <p className="font-semibold text-white">Dark Industrial Theme</p>
              <p className="text-slate-500">High-contrast PMO dashboard</p>
            </div>
            <Toggle checked={darkMode} onChange={() => toggleDarkMode()} />
          </div>
          <div className={ROW}>
            <div>
              <p className="font-semibold text-white">IndexedDB Offline Mode</p>
              <p className="text-slate-500">Store field reports locally when in remote Northeast regions</p>
            </div>
            <Toggle checked={offlineMode} onChange={setOfflineMode} />
          </div>
          <div className={ROW}>
            <div>
              <p className="font-semibold text-white">Speech Transcription Language</p>
              <p className="text-slate-500">Default acoustic model target</p>
            </div>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              <option value="hi">Hindi (North/Central)</option>
              <option value="as">Assamese (Northeast Pipeline)</option>
              <option value="en">English (EPC Standard)</option>
            </select>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
