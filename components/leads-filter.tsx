'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

interface LeadsFilterProps {
  onStatusChange: (status: string) => void
  onSearch: (search: string) => void
}

export function LeadsFilter({ onStatusChange, onSearch }: LeadsFilterProps) {
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statuses = [
    { id: 'all', label: 'All Leads', color: 'bg-slate-100 text-slate-700' },
    { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
    { id: 'contacted', label: 'Contacted', color: 'bg-purple-100 text-purple-700' },
    { id: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-700' },
    { id: 'proposal', label: 'Proposal', color: 'bg-orange-100 text-orange-700' },
    { id: 'negotiation', label: 'Negotiation', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'won', label: 'Won', color: 'bg-emerald-100 text-emerald-700' },
  ]

  const handleStatusChange = (status: string) => {
    setActiveStatus(status)
    onStatusChange(status)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    onSearch(term)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="floating-card p-6 rounded-xl mb-6"
    >
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search leads by name or company..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">
          <Filter size={20} />
          More Filters
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        {statuses.map((status) => (
          <motion.button
            key={status.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStatusChange(status.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeStatus === status.id
                ? `${status.color} ring-2 ring-offset-2 ring-slate-300`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
