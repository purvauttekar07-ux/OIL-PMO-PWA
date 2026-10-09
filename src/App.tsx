import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { FieldEntry } from '@/pages/FieldEntry'
import { Schedule } from '@/pages/Schedule'
import { WhatIfSimulation } from '@/pages/WhatIfSimulation'
import { AnomalyDetection } from '@/pages/AnomalyDetection'
import { Approvals } from '@/pages/Approvals'
import { InstitutionalMemory } from '@/pages/InstitutionalMemory'
import { Alerts } from '@/pages/Alerts'
import { Projects } from '@/pages/Projects'
import { Settings } from '@/pages/Settings'
import { useAppStore } from '@/store/useAppStore'

export default function App() {
  const { setOnline, darkMode } = useAppStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/field" element={<FieldEntry />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/institutional-memory" element={<InstitutionalMemory />} />
        <Route path="/simulation" element={<WhatIfSimulation />} />
        <Route path="/anomalies" element={<AnomalyDetection />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
