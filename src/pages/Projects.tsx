import { MapPin, Calendar, TrendingUp, TrendingDown, Building2, Layers } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import type { Project } from '@/types'

const TYPE_ICONS: Record<Project['type'], string> = {
  pipeline: '🛢️',
  building: '🏗️',
  road: '🛣️',
  utility: '⚡',
  refinery: '🏭',
  other: '📦',
}

function formatCrore(value: number) {
  return `₹${(value / 10000000).toFixed(1)} Cr`
}

export function Projects() {
  const { projects, setSelectedProject, selectedProjectId } = useAppStore()
  const navigate = useNavigate()

  function openProject(id: string) {
    setSelectedProject(id)
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">All Projects</h1>
        <p className="text-sm text-slate-400 mt-0.5">OIL infrastructure portfolio – Assam & Arunachal Pradesh</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map(project => {
          const variance = project.actualProgress - project.plannedProgress
          const spiColor = project.spi < 0.8 ? 'danger' : project.spi < 0.95 ? 'warning' : 'success'

          return (
            <Card
              key={project.id}
              hover
              onClick={() => openProject(project.id)}
              className={clsx(
                project.id === selectedProjectId && 'border-oil-500/40 bg-oil-500/5'
              )}
            >
              <CardBody className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-2xl shrink-0">{TYPE_ICONS[project.type]}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white leading-tight">{project.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{project.code}</p>
                    </div>
                  </div>
                  <Badge variant={project.status === 'delayed' ? 'danger' : project.status === 'in_progress' ? 'info' : 'success'}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Progress */}
                <ProgressBar
                  planned={project.plannedProgress}
                  actual={project.actualProgress}
                  height="md"
                />

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-slate-500 mb-0.5">SPI</p>
                    <p className={clsx(
                      'font-bold text-base',
                      spiColor === 'danger' ? 'text-red-400' : spiColor === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                    )}>
                      {project.spi.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-slate-500 mb-0.5">CPI</p>
                    <p className={clsx('font-bold text-base', project.cpi < 0.95 ? 'text-amber-400' : 'text-emerald-400')}>
                      {project.cpi.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-slate-500 mb-0.5">Variance</p>
                    <p className={clsx('font-bold text-base flex items-center justify-center gap-0.5',
                      variance < 0 ? 'text-red-400' : 'text-emerald-400'
                    )}>
                      {variance < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                      {Math.abs(variance)}%
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-slate-500" />
                    <span>{project.location}, {project.district}, {project.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-slate-500" />
                    <span>{project.startDate} → {project.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 size={11} className="text-slate-500" />
                    <span className="truncate">{project.contractor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers size={11} className="text-slate-500" />
                    <span className="font-medium text-slate-300">{formatCrore(project.contractValue)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
