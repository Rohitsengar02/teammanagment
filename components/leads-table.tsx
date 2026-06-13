'use client'

import { motion } from 'framer-motion'
import { Lead } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface LeadsTableProps {
  leads: Lead[]
}

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-green-100 text-green-700',
  proposal: 'bg-orange-100 text-orange-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
}

const statusLabels = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
}

export function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <div className="floating-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Last Contact
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {leads.map((lead, idx) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <Link href={`/leads/${lead.id}`} className="text-slate-900 font-medium hover:text-indigo-600">
                    {lead.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-slate-600">{lead.company}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status]}`}>
                    {statusLabels[lead.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-900 font-semibold">{formatCurrency(lead.value)}</td>
                <td className="px-6 py-4 text-slate-600 text-sm">{lead.lastContact}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
