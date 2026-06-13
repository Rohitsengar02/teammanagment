'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { mockLeads } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const

const stageColors = {
  new: 'from-blue-600 to-blue-500',
  contacted: 'from-purple-600 to-purple-500',
  qualified: 'from-green-600 to-green-500',
  proposal: 'from-orange-600 to-orange-500',
  negotiation: 'from-yellow-600 to-yellow-500',
  won: 'from-emerald-600 to-emerald-500',
  lost: 'from-red-600 to-red-500',
}

const stageLabels = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
}

export default function PipelinePage() {
  const leadsByStage = stages.reduce(
    (acc, stage) => {
      acc[stage] = mockLeads.filter((lead) => lead.status === stage)
      return acc
    },
    {} as Record<typeof stages[number], typeof mockLeads>
  )

  const stageValues = stages.reduce(
    (acc, stage) => {
      acc[stage] = leadsByStage[stage].reduce((sum, lead) => sum + lead.value, 0)
      return acc
    },
    {} as Record<typeof stages[number], number>
  )

  const totalPipelineValue = Object.values(stageValues).reduce((sum, val) => sum + val, 0)

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Sales Pipeline</h1>
        <p className="text-slate-600 mt-2">
          Total Pipeline Value: <span className="text-indigo-600 font-bold">{formatCurrency(totalPipelineValue)}</span>
        </p>
      </div>

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-8">
        <div className="flex gap-6 min-w-min">
          {stages.map((stage) => {
            const stageLeads = leadsByStage[stage]
            const stageValue = stageValues[stage]
            return (
              <div key={stage} className="w-80 flex-shrink-0">
                {/* Stage Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full bg-gradient-to-r ${stageColors[stage]}`} />
                      {stageLabels[stage]}
                    </h3>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-1 rounded">
                      {stageLeads.length}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{formatCurrency(stageValue)}</p>
                  <div className="h-1 mt-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stageColors[stage]}`}
                      style={{ width: `${(stageValue / totalPipelineValue) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="floating-card p-4 rounded-xl hover:border-indigo-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                          {lead.name}
                        </h4>
                        <ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{lead.company}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <span className="text-sm font-bold text-indigo-600">{formatCurrency(lead.value)}</span>
                        <span className="text-xs text-slate-600">{lead.source}</span>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="h-24 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                      <p className="text-sm text-slate-600">No leads yet</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
