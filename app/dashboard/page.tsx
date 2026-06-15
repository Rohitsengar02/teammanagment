'use client'

import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GlowingCard } from '@/components/ui/glowing-card'
import { MetricsCard } from '@/components/metrics-card'
import { DataTable } from '@/components/data-table'
import { BarChart3, TrendingUp, Users, Target, CheckCircle, Clock, DollarSign, Loader2, Sparkles } from 'lucide-react'
import { mockLeads, mockStats } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)

  // Real-time Firestore sync
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
            console.error('Error fetching leads:', err)
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
            console.error('Error fetching tasks:', err)
            setLoading(false)
          })

          return () => {
            unsubLeads()
            unsubTasks()
          }
        }
      } catch (err) {
        console.error('Error parsing employee session details:', err)
        setLoading(false)
      }
    } else {
      // Simulation fallback
      setLeads(mockLeads)
      setLoading(false)
    }
  }, [])

  // Calculate Real stats
  const totalLeads = leads.length
  const newLeads = leads.filter((l) => l.status === 'new').length
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length
  const wonLeadsCount = leads.filter((l) => l.status === 'won').length
  const lostLeadsCount = leads.filter((l) => l.status === 'lost').length

  const pipelineValue = leads
    .filter((l) => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0)

  const avgDealSize = totalLeads > 0 
    ? leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0) / totalLeads 
    : 0

  const closedCount = wonLeadsCount + lostLeadsCount
  const winRate = closedCount > 0 
    ? Math.round((wonLeadsCount / closedCount) * 100) 
    : totalLeads > 0 ? Math.round((wonLeadsCount / totalLeads) * 100) : 0

  // Funnel data
  const funnelStages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won']
  const funnelLabels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    won: 'Won'
  }
  const conversionData = funnelStages.map(stage => ({
    stage: funnelLabels[stage],
    count: leads.filter(l => l.status === stage).length
  }))

  // Task Completion Rate
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Revenue chart data (monthly breakdown of won deals)
  // Let's build a breakdown from actual lead data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = months.map((month, idx) => {
    const monthLeads = leads.filter(l => {
      if (l.status !== 'won') return false
      const dateStr = l.lastContact || l.createdAt
      if (!dateStr) return false
      const date = new Date(dateStr)
      return date.getMonth() === idx && date.getFullYear() === currentYear
    })
    const value = monthLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0)
    return { month, value }
  })

  // Take the last 6 months that have data
  const currentMonthIdx = new Date().getMonth()
  const chartData = monthlyRevenue.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1)

  // Recent leads limit to 6
  const recentLeads = [...leads]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 6)

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sales Dashboard</h1>
            <p className="text-slate-600 mt-2">Welcome back, {employeeInfo?.name || 'Representative'}. Track leads, conversions, and metrics.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-widest self-start md:self-auto">
            <Sparkles size={12} className="text-indigo-600" /> Active Session
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-indigo-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Syncing sales pipeline data...</p>
        </div>
      ) : (
        <div className="space-y-8 text-left">
          {/* Status Cards - Top Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <GlowingCard label="Total Leads" value={totalLeads} />
            <GlowingCard label="New Leads" value={newLeads} />
            <GlowingCard label="Qualified Leads" value={qualifiedLeads} />
            <GlowingCard label="Won Deals" value={wonLeadsCount} />
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard
              title="Active Pipeline"
              value={formatCurrency(pipelineValue)}
              metric="In-progress deals"
              icon={DollarSign}
              backgroundColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            <MetricsCard
              title="Average Deal Size"
              value={formatCurrency(avgDealSize)}
              metric="Value per client"
              icon={Target}
              backgroundColor="bg-cyan-50"
              iconColor="text-cyan-600"
            />
            <MetricsCard
              title="Deals Win Rate"
              value={`${winRate}%`}
              metric="Conversion ratio"
              icon={CheckCircle}
              backgroundColor="bg-green-50"
              iconColor="text-green-600"
            />
            <MetricsCard
              title="Task Accomplishments"
              value={`${taskCompletionRate}%`}
              metric={`${completedTasks} / ${totalTasks} completed`}
              icon={Clock}
              backgroundColor="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Revenue Trend</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Value generated by won deals over the last 6 months</p>
                </div>
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis stroke="#94a3b8" dataKey="month" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(val) => [formatCurrency(Number(val)), 'Revenue']}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Conversion Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Leads Stages Funnel</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Leads counts currently distributed by sales step</p>
                </div>
                <BarChart3 className="text-cyan-600" size={24} />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData}>
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
                    <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Leads Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Recent Leads Table */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <DataTable
              title="Recent Active Leads"
              columns={[
                { key: 'name', label: 'Lead Name', width: 'w-1/4' },
                { key: 'company', label: 'Company', width: 'w-1/4' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (status) => {
                    const statusMap: Record<string, { bg: string; text: string }> = {
                      new: { bg: 'bg-blue-50 text-blue-700 border border-blue-100', text: 'New' },
                      contacted: { bg: 'bg-purple-50 text-purple-700 border border-purple-100', text: 'Contacted' },
                      qualified: { bg: 'bg-green-50 text-green-700 border border-green-100', text: 'Qualified' },
                      proposal: { bg: 'bg-orange-50 text-orange-700 border border-orange-100', text: 'Proposal' },
                      negotiation: { bg: 'bg-amber-50 text-amber-700 border border-amber-100', text: 'Negotiation' },
                      won: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-100', text: 'Won' },
                      lost: { bg: 'bg-rose-50 text-rose-700 border border-rose-100', text: 'Lost' },
                    }
                    const s = statusMap[status] || { bg: 'bg-slate-50 text-slate-700 border border-slate-100', text: status }
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg}`}>
                        {s.text}
                      </span>
                    )
                  },
                },
                {
                  key: 'value',
                  label: 'Deal Value',
                  render: (value) => formatCurrency(Number(value) || 0),
                },
              ]}
              data={recentLeads}
              actions={(row) => (
                <Link
                  href={`/leads/${row.id}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
                >
                  Open Detail
                </Link>
              )}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
