'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { DollarSign, Download, Calculator } from 'lucide-react'
import { mockPayroll } from '@/lib/mock-data'
import { useState } from 'react'

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState('May 2026')
  
  const totalPayroll = mockPayroll.reduce((sum, p) => sum + p.netSalary, 0)
  const totalAllowances = mockPayroll.reduce((sum, p) => sum + p.allowances, 0)
  const totalDeductions = mockPayroll.reduce((sum, p) => sum + p.deductions, 0)

  const stats = [
    { label: 'Total Payroll', value: `₹${(totalPayroll / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Allowances', value: `₹${(totalAllowances / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Deductions', value: `₹${(totalDeductions / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Payroll Management</h1>
          <p className="text-slate-600">Manage employee salaries and payroll processing</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-6 py-3 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 flex items-center gap-2"
        >
          <Download size={20} />
          Export Payroll
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`${stat.bg} p-6 rounded-xl shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                <h3 className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg bg-white/50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Month Selector */}
      <div className="mb-8 flex items-center gap-4">
        <label className="font-medium text-slate-700">Select Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option>January 2026</option>
          <option>February 2026</option>
          <option>March 2026</option>
          <option>April 2026</option>
          <option selected>May 2026</option>
          <option>June 2026</option>
        </select>
      </div>

      {/* Payroll Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-4 font-bold text-slate-900">Employee</th>
                <th className="text-right px-6 py-4 font-bold text-slate-900">Base Salary</th>
                <th className="text-right px-6 py-4 font-bold text-slate-900">Allowances</th>
                <th className="text-right px-6 py-4 font-bold text-slate-900">Deductions</th>
                <th className="text-right px-6 py-4 font-bold text-slate-900">Net Salary</th>
                <th className="text-left px-6 py-4 font-bold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockPayroll.map((record, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{record.employeeName}</td>
                  <td className="px-6 py-4 text-right text-slate-600">₹{(record.baseSalary / 100000).toFixed(1)}L</td>
                  <td className="px-6 py-4 text-right text-green-600 font-medium">₹{(record.allowances / 1000).toFixed(0)}K</td>
                  <td className="px-6 py-4 text-right text-red-600 font-medium">₹{(record.deductions / 1000).toFixed(0)}K</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">₹{(record.netSalary / 100000).toFixed(1)}L</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : record.status === 'processed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Process Payroll Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="mt-8 px-8 py-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg transition-shadow flex items-center gap-2"
      >
        <Calculator size={20} />
        Process Payroll
      </motion.button>
    </EmployerLayout>
  )
}
