'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Mail, Phone, Calendar, Briefcase, Tag, DollarSign, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { mockEmployers, mockLeads, Lead } from '@/lib/mock-data'

export default function EmployeeClientsPage() {
  const params = useParams()
  const employeeId = params.id as string

  const employer = mockEmployers[0]
  const employee = employer.employees.find((e) => e.id === employeeId)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  if (!employee) {
    return (
      <EmployerLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Employee not found</p>
          <Link href="/employer/employees" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to Employees
          </Link>
        </div>
      </EmployerLayout>
    )
  }

  // Filter leads assigned to this employee
  const employeeClients = mockLeads.filter((lead) => lead.assignedEmployeeId === employeeId)

  // Apply search and status filters
  const filteredClients = employeeClients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Format currency helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Status Badge coloring helper
  const getStatusStyle = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'qualified':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'proposal':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'negotiation':
        return 'bg-pink-50 text-pink-700 border-pink-200'
      case 'won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'lost':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <EmployerLayout>
      {/* Back Button */}
      <Link
        href="/employer/employees"
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Employees
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Clients managed by {employee.name}
          </h1>
          <p className="text-slate-600">
            {employee.name} ({employee.role.replace('-', ' ')}) manages {employeeClients.length} clients in the {employee.department} department.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search clients by name, email or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all bg-white font-medium text-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 border border-slate-100 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header Gradient bar based on status */}
                <div className={`h-1.5 ${
                  client.status === 'won' ? 'bg-emerald-500' :
                  client.status === 'lost' ? 'bg-rose-500' :
                  'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`} />

                <div className="p-6">
                  {/* Top Bar with Avatar and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200/50 shadow-sm text-lg capitalize">
                      {client.name.charAt(0)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(client.status)} capitalize`}>
                      {client.status}
                    </span>
                  </div>

                  {/* Client Name & Company */}
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{client.name}</h3>
                  <div className="flex items-center gap-1.5 text-indigo-600 font-medium text-sm mb-4">
                    <Briefcase size={14} />
                    <span>{client.company}</span>
                  </div>

                  {/* Value Card */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <DollarSign size={14} className="text-slate-400" />
                      <span>Deal Value</span>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">
                      {formatCurrency(client.value)}
                    </span>
                  </div>

                  {/* Contact Info & Details */}
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-slate-400 shrink-0" />
                      <span>Last Contacted: {new Date(client.lastContact).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tag size={16} className="text-slate-400 shrink-0" />
                      <span className="capitalize">Source: {client.source}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Footer */}
              {client.notes && (
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex gap-2.5 items-start">
                  <MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-2">
                    "{client.notes}"
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-100"
        >
          <p className="text-slate-600 text-lg">No clients found matching the filters or assigned to this employee.</p>
        </motion.div>
      )}
    </EmployerLayout>
  )
}
