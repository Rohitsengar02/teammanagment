'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { BarChart3, TrendingUp, Users, Target, Sparkles, Loader2, PieChart, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockLeads, mockAssignedTasks } from '@/lib/mock-data'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)

  useEffect(() => {
    const loggedInStr = localStorage.getItem('loggedInEmployee')
    if (loggedInStr) {
      try {
        const emp = JSON.parse(loggedInStr)
        setEmployeeInfo(emp)

        if (emp.employerId && emp.id) {
          // Listen to employee's leads
          const leadsRef = collection(db, 'employers', emp.employerId, 'employees', emp.id, 'leads')
          const unsubLeads = onSnapshot(leadsRef, (snapshot) => {
            const list: any[] = []
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() })
            })
            setLeads(list)
          }, (err) => {
            console.error('Error listening to leads:', err)
          })

          // Listen to employee's tasks
          const tasksRef = collection(db, 'employers', emp.employerId, 'tasks')
          const tasksQuery = query(tasksRef, where('assignedTo', '==', emp.id))
          const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
            const list: any[] = []
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() })
            })
            setTasks(list)
            setLoading(false)
          }, (err) => {
            console.error('Error listening to tasks:', err)
            setLoading(false)
          })

          return () => {
            unsubLeads()
            unsubTasks()
          }
        }
      } catch (err) {
        console.error('Error parsing employee session:', err)
        setLoading(false)
      }
    } else {
      // Simulation Fallback
      setLeads(mockLeads)
      setTasks(mockAssignedTasks)
      setLoading(false)
    }
  }, [])

  // Calculate Metrics
  const totalLeadsCount = leads.length
  const wonLeads = leads.filter(l => l.status === 'won')
  const lostLeads = leads.filter(l => l.status === 'lost')
  const activeLeadsCount = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length

  const totalRevenue = wonLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0)
  const activePipelineValue = leads
    .filter(l => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0)

  // Conversion rate (Won / Won + Lost) or (Won / Total Leads)
  const totalClosedCount = wonLeads.length + lostLeads.length
  const conversionRate = totalClosedCount > 0 
    ? Math.round((wonLeads.length / totalClosedCount) * 100) 
    : totalLeadsCount > 0 ? Math.round((wonLeads.length / totalLeadsCount) * 100) : 0

  // Task metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Format Rupees nicely
  const formatRupees = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`
    return `₹${value.toLocaleString('en-IN')}`
  }

  // Lead Stage chart data
  const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  const stageNamesMap: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    won: 'Won (Closed)',
    lost: 'Lost (Closed)'
  }
  const leadStagesData = stages.map(stage => {
    const stageLeads = leads.filter(l => l.status === stage)
    const count = stageLeads.length
    const value = stageLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0)
    return {
      stage: stageNamesMap[stage],
      count,
      value: value / 100000 // In Lakhs
    }
  })

  // Lead Source counts
  const sourceCounts = leads.reduce((acc: Record<string, number>, lead) => {
    const src = lead.source || 'Other'
    acc[src] = (acc[src] || 0) + 1
    return acc
  }, {})

  const sortedSources = Object.keys(sourceCounts).map(source => ({
    source,
    count: sourceCounts[source],
    percentage: totalLeadsCount > 0 ? Math.round((sourceCounts[source] / totalLeadsCount) * 100) : 0
  })).sort((a, b) => b.count - a.count)

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Performance Analytics</h1>
            <p className="text-slate-600 mt-2">Monitor conversions, pipeline valuations, lead acquisitions, and task accomplishments.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-widest self-start md:self-auto">
            <Sparkles size={12} className="text-indigo-600" /> Real-time Analytics
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-indigo-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Aggregating database statistics...</p>
        </div>
      ) : (
        <div className="space-y-8 text-left">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Closed Revenue</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{formatRupees(totalRevenue)}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-4">
                <TrendingUp size={14} />
                <span>From {wonLeads.length} deals won</span>
              </div>
            </div>

            {/* Active Pipeline */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Pipeline</p>
                <h3 className="text-2xl md:text-3xl font-black text-indigo-600 mt-2">{formatRupees(activePipelineValue)}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mt-4">
                <Users size={14} />
                <span>Across {activeLeadsCount} active leads</span>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Lead Win Rate</p>
                <h3 className="text-2xl md:text-3xl font-black text-emerald-600 mt-2">{conversionRate}%</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-4">
                <Target size={14} className="text-slate-400" />
                <span>Won vs total closed deals</span>
              </div>
            </div>

            {/* Task Completion */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Task Completion</p>
                <h3 className="text-2xl md:text-3xl font-black text-purple-600 mt-2">{taskCompletionRate}%</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 mt-4">
                <CheckCircle2 size={14} />
                <span>{completedTasks} / {totalTasks} goals cleared</span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pipeline Stages Volume Chart */}
            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Pipeline Stages Volume</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Leads and deal values mapped per stage.</p>
              </div>

              <div className="h-72 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={leadStagesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis stroke="#94a3b8" dataKey="stage" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                    <Bar dataKey="count" name="Leads Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="value" name="Valuation (Lakhs)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lead Acquisition Sources Distribution */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Acquisition Channels</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Primary sources driving lead acquisitions.</p>
              </div>

              <div className="space-y-4 pt-2">
                {sortedSources.map((sourceItem) => (
                  <div key={sourceItem.source} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>{sourceItem.source}</span>
                      <span>{sourceItem.count} ({sourceItem.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${sourceItem.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {sortedSources.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No lead sources found to compile distribution channels.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabular Performance Sheet */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">Channel Performance Metrics</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Detailed channel distribution, conversions, and revenue breakdowns.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Source Channel</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Deals Won</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Won Ratio</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSources.map((sourceItem) => {
                    const sourceLeads = leads.filter(l => l.source === sourceItem.source)
                    const won = sourceLeads.filter(l => l.status === 'won').length
                    const ratio = sourceLeads.length > 0 ? Math.round((won / sourceLeads.length) * 100) : 0
                    const revenue = sourceLeads.filter(l => l.status === 'won').reduce((sum, l) => sum + (Number(l.value) || 0), 0)

                    return (
                      <tr key={sourceItem.source} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{sourceItem.source}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-600">{sourceLeads.length}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-600">{won}</td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span className={ratio > 30 ? 'text-emerald-600' : 'text-slate-500'}>{ratio}%</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">{formatRupees(revenue)}</td>
                      </tr>
                    )
                  })}

                  {sortedSources.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm font-medium">
                        No performance details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
