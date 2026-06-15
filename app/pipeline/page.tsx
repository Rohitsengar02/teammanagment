'use client'

import { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Lead } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, Loader2, Award, ArrowRightLeft } from 'lucide-react'
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from 'framer-motion'
import Link from 'next/link'

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
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [employerId, setEmployerId] = useState<string | null>(null)
  const [employeeId, setEmployeeId] = useState<string | null>(null)

  // Load leads from Firestore
  useEffect(() => {
    const fetchLeads = async () => {
      const loggedInEmployeeStr = localStorage.getItem('loggedInEmployee')
      if (!loggedInEmployeeStr) {
        setLoading(false)
        return
      }

      try {
        const employee = JSON.parse(loggedInEmployeeStr)
        const empId = employee.employerId
        const emplyId = employee.id
        setEmployerId(empId)
        setEmployeeId(emplyId)

        if (empId && emplyId && empId !== 'mock-employer-id') {
          const leadsRef = collection(db, 'employers', empId, 'employees', emplyId, 'leads')
          const querySnapshot = await getDocs(leadsRef)
          const list: Lead[] = []
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Lead)
          })
          setLeads(list)
        }
      } catch (error) {
        console.error('Error fetching leads for pipeline:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  // Transition Lead Stage
  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    if (!employerId || !employeeId) return

    // Pre-emptively update local state for immediate feedback
    const oldLeads = [...leads]
    const currentLead = leads.find((l) => l.id === leadId)
    if (!currentLead || currentLead.status === newStatus) return

    setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)))

    try {
      // 1. Update Lead status in Firestore
      const leadRef = doc(db, 'employers', employerId, 'employees', employeeId, 'leads', leadId)
      await updateDoc(leadRef, { status: newStatus })

      // 2. Add auto-generated timeline event for status transition
      const timelineRef = collection(db, 'employers', employerId, 'employees', employeeId, 'leads', leadId, 'timeline')
      await addDoc(timelineRef, {
        title: `Pipeline Transition: Moved to ${stageLabels[newStatus]}`,
        notes: `Lead stage changed from ${stageLabels[currentLead.status]} to ${stageLabels[newStatus]} via Kanban board.`,
        type: 'status_change',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      })

    } catch (error) {
      console.error('Error updating lead stage:', error)
      alert('Failed to update stage in database. Rolling back change.')
      setLeads(oldLeads)
    }
  }

  // Filter/categorize leads by stage
  const leadsByStage = useMemo(() => {
    return stages.reduce(
      (acc, stage) => {
        acc[stage] = leads.filter((lead) => lead.status === stage)
        return acc
      },
      {} as Record<typeof stages[number], typeof leads>
    )
  }, [leads])

  // Calculate values by stage
  const stageValues = useMemo(() => {
    return stages.reduce(
      (acc, stage) => {
        acc[stage] = leadsByStage[stage].reduce((sum, lead) => sum + lead.value, 0)
        return acc
      },
      {} as Record<typeof stages[number], number>
    )
  }, [leadsByStage])

  const totalPipelineValue = useMemo(() => {
    return Object.values(stageValues).reduce((sum, val) => sum + val, 0)
  }, [stageValues])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500 font-semibold text-sm">Loading visual pipeline...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold text-slate-900">Sales Pipeline</h1>
        <p className="text-slate-600 mt-2">
          Total Pipeline Value:{' '}
          <span className="text-indigo-600 font-extrabold text-lg">{formatCurrency(totalPipelineValue)}</span>
        </p>
      </div>

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-8">
        <div className="flex gap-6 min-w-min">
          {stages.map((stage) => {
            const stageLeads = leadsByStage[stage]
            const stageValue = stageValues[stage]
            return (
              <div key={stage} className="w-80 flex-shrink-0 bg-slate-50/50 rounded-3xl p-5 border border-slate-100/80">
                
                {/* Stage Header */}
                <div className="mb-5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                      <span className={`h-3 w-3 rounded-full bg-gradient-to-r ${stageColors[stage]}`} />
                      {stageLabels[stage]}
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-800">{formatCurrency(stageValue)}</p>
                  <div className="h-1 mt-3 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stageColors[stage]}`}
                      style={{
                        width: totalPipelineValue > 0 ? `${(stageValue / totalPipelineValue) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-4">
                  {stageLeads.map((lead) => (
                    <motion.div
                      layoutId={`lead-${lead.id}`}
                      key={lead.id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all text-left relative group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <Link href={`/leads/${lead.id}`} className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-sm truncate pr-2">
                            {lead.name}
                          </Link>
                          <ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mb-4">{lead.company}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-800">{formatCurrency(lead.value)}</span>
                          <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full truncate max-w-[100px]">{lead.source}</span>
                        </div>

                        {/* Status/Stage Transition Selector */}
                        <div className="flex items-center gap-1 bg-slate-50 rounded-xl px-2 py-1.5 border border-slate-100">
                          <ArrowRightLeft size={11} className="text-slate-400 flex-shrink-0" />
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                            className="bg-transparent text-[11px] font-bold text-slate-600 focus:outline-none w-full cursor-pointer"
                          >
                            {stages.map((st) => (
                              <option key={st} value={st}>
                                Stage: {stageLabels[st]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="h-28 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center bg-white p-4">
                      <p className="text-xs text-slate-400 font-semibold">No active leads</p>
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
