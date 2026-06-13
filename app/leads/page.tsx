'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard-layout'
import { LeadsFilter } from '@/components/leads-filter'
import { DataTable } from '@/components/data-table'
import { StatusCard } from '@/components/status-card'
import { MetricsCard } from '@/components/metrics-card'
import {
  Users,
  TrendingUp,
  Target,
  Plus,
  Mail,
  Phone,
} from 'lucide-react'
import { mockLeads } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function LeadsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter leads based on status and search term
  const filteredLeads = useMemo(() => {
    return mockLeads.filter((lead) => {
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [selectedStatus, searchTerm])

  // Calculate statistics
  const stats = {
    total: mockLeads.length,
    new: mockLeads.filter((l) => l.status === 'new').length,
    qualified: mockLeads.filter((l) => l.status === 'qualified').length,
    won: mockLeads.filter((l) => l.status === 'won').length,
    totalValue: mockLeads.reduce((sum, l) => sum + l.value, 0),
    avgValue: Math.round(mockLeads.reduce((sum, l) => sum + l.value, 0) / mockLeads.length),
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Management</h1>
          <p className="text-slate-600 mt-2">Manage and track all your sales leads</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          Add New Lead
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard
          title="Total Leads"
          value={stats.total}
          color="blue"
          badge="All statuses"
        />
        <StatusCard
          title="New Leads"
          value={stats.new}
          color="green"
          badge="This month"
        />
        <StatusCard
          title="Qualified"
          value={stats.qualified}
          color="purple"
          badge="Ready for pitch"
        />
        <StatusCard
          title="Won Deals"
          value={stats.won}
          color="yellow"
          badge="Closed"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricsCard
          title="Total Lead Value"
          value={formatCurrency(stats.totalValue)}
          metric="All leads combined"
          icon={Target}
          backgroundColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <MetricsCard
          title="Average Lead Value"
          value={formatCurrency(stats.avgValue)}
          metric="Per lead"
          icon={TrendingUp}
          backgroundColor="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <MetricsCard
          title="Total Leads"
          value={stats.total}
          metric="Active pipeline"
          icon={Users}
          backgroundColor="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Filter Section */}
      <LeadsFilter
        onStatusChange={(status) => setSelectedStatus(status)}
        onSearch={(search) => setSearchTerm(search)}
      />

      {/* Leads Table */}
      <DataTable
        title={`Leads (${filteredLeads.length})`}
        columns={[
          { key: 'name', label: 'Lead Name', width: 'w-1/5' },
          { key: 'company', label: 'Company', width: 'w-1/5' },
          {
            key: 'status',
            label: 'Status',
            render: (status) => {
              const statusMap: Record<string, { bg: string; text: string }> = {
                new: { bg: 'bg-blue-100', text: 'text-blue-700' },
                contacted: { bg: 'bg-purple-100', text: 'text-purple-700' },
                qualified: { bg: 'bg-green-100', text: 'text-green-700' },
                proposal: { bg: 'bg-orange-100', text: 'text-orange-700' },
                negotiation: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
                won: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
                lost: { bg: 'bg-red-100', text: 'text-red-700' },
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
            label: 'Deal Value',
            render: (value) => (
              <span className="font-semibold text-slate-900">{formatCurrency(value)}</span>
            ),
          },
          { key: 'lastContact', label: 'Last Contact' },
        ]}
        data={filteredLeads}
        actions={(row) => (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Call"
            >
              <Phone size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Email"
            >
              <Mail size={16} />
            </motion.button>
            <Link
              href={`/leads/${row.id}`}
              className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors"
            >
              View
            </Link>
          </div>
        )}
      />

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="floating-card p-12 rounded-xl text-center"
        >
          <Users size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No leads found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first lead to get started'}
          </p>
          {!searchTerm && (
            <button className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
              Create Lead
            </button>
          )}
        </motion.div>
      )}
    </DashboardLayout>
  )
}
