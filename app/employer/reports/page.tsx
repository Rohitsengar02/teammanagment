'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Download, BarChart3 } from 'lucide-react'

const reports = [
  { name: 'Monthly Attendance Report', date: '2026-06-12', size: '2.4 MB', type: 'PDF' },
  { name: 'Q2 Payroll Summary', date: '2026-06-10', size: '1.8 MB', type: 'Excel' },
  { name: 'Employee Performance Review', date: '2026-06-08', size: '3.2 MB', type: 'PDF' },
  { name: 'Leave Balances Report', date: '2026-06-05', size: '0.9 MB', type: 'PDF' },
  { name: 'Department Wise Analytics', date: '2026-06-01', size: '2.1 MB', type: 'Excel' },
]

export default function ReportsPage() {
  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Reports</h1>
        <p className="text-slate-600">Access and download HR and business reports</p>
      </div>

      {/* Generate Report Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="mb-8 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg flex items-center gap-2"
      >
        <BarChart3 size={20} />
        Generate New Report
      </motion.button>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900">{report.name}</h3>
              <div className="flex gap-4 mt-2 text-sm text-slate-600">
                <span>{new Date(report.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{report.size}</span>
                <span>•</span>
                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">{report.type}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-3 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <Download size={20} />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </EmployerLayout>
  )
}
