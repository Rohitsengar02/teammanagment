'use client'

import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatusCard } from '@/components/status-card'
import { GlowingCard } from '@/components/ui/glowing-card'
import { MetricsCard } from '@/components/metrics-card'
import { DataTable } from '@/components/data-table'
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  Activity,
  DollarSign,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { mockLeads, mockStats, mockTasks } from '@/lib/mock-data'
import { formatCurrency, formatPercent } from '@/lib/utils'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const chartData = [
  { month: 'Jan', value: 2400000 },
  { month: 'Feb', value: 2210000 },
  { month: 'Mar', value: 2290000 },
  { month: 'Apr', value: 2000000 },
  { month: 'May', value: 2181000 },
  { month: 'Jun', value: 3200000 },
]

const conversionData = [
  { stage: 'New', count: 45 },
  { stage: 'Contacted', count: 32 },
  { stage: 'Qualified', count: 28 },
  { stage: 'Proposal', count: 18 },
  { stage: 'Won', count: 12 },
]

export default function DashboardPage() {
  const recentLeads = mockLeads.slice(0, 8)
  const totalLeads = mockLeads.length
  const newLeads = mockLeads.filter((l) => l.status === 'new').length
  const qualifiedLeads = mockLeads.filter((l) => l.status === 'qualified').length
  const wonLeads = mockLeads.filter((l) => l.status === 'won').length

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Sales Dashboard</h1>
        <p className="text-slate-600 mt-2">Track your leads and pipeline performance</p>
      </div>

      {/* Status Cards - Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlowingCard
          label="Total Leads"
          value={totalLeads}
        />
        <GlowingCard
          label="New Leads"
          value={newLeads}
        />
        <GlowingCard
          label="Qualified Leads"
          value={qualifiedLeads}
        />
        <GlowingCard
          label="Won Deals"
          value={wonLeads}
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricsCard
          title="Total Pipeline"
          value={formatCurrency(mockStats.pipelineValue)}
          metric="Current value"
          icon={DollarSign}
          trend={12}
          trendUp={true}
          backgroundColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <MetricsCard
          title="Average Deal Size"
          value={formatCurrency(mockStats.avgDealSize)}
          metric="Per lead"
          icon={Target}
          trend={8}
          trendUp={true}
          backgroundColor="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <MetricsCard
          title="Win Rate"
          value={`${mockStats.closeRate}%`}
          metric="Closed deals"
          icon={CheckCircle}
          trend={5}
          trendUp={true}
          backgroundColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricsCard
          title="Avg Sales Cycle"
          value="45 days"
          metric="Lead to close"
          icon={Clock}
          trend={3}
          trendUp={false}
          backgroundColor="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="floating-card p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
              <p className="text-sm text-slate-600">6-month projection</p>
            </div>
            <TrendingUp className="text-indigo-600" size={24} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" dataKey="month" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#1e293b' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="floating-card p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sales Funnel</h3>
              <p className="text-sm text-slate-600">By stage</p>
            </div>
            <BarChart3 className="text-cyan-600" size={24} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" dataKey="stage" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#1e293b' }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Leads Table */}
      <DataTable
        title="Recent Leads"
        columns={[
          { key: 'name', label: 'Lead Name', width: 'w-1/4' },
          { key: 'company', label: 'Company', width: 'w-1/4' },
          {
            key: 'status',
            label: 'Status',
            render: (status) => {
              const statusMap: Record<string, { bg: string; text: string }> = {
                new: { bg: 'bg-blue-100', text: 'text-blue-700' },
                contacted: { bg: 'bg-purple-100', text: 'text-purple-700' },
                qualified: { bg: 'bg-green-100', text: 'text-green-700' },
                proposal: { bg: 'bg-orange-100', text: 'text-orange-700' },
                won: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
              }
              const s = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
              return (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              )
            },
          },
          {
            key: 'value',
            label: 'Value',
            render: (value) => formatCurrency(value),
          },
        ]}
        data={recentLeads}
        actions={(row) => (
          <Link
            href={`/leads/${row.id}`}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            View
          </Link>
        )}
      />
    </DashboardLayout>
  )
}
