'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Download, Calculator, X, Loader2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { mockPayroll, mockEmployers } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  month: string // format: YYYY-MM
  baseSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: 'paid' | 'processed' | 'pending'
  processedAt?: string
}

interface Employee {
  id: string
  name: string
  department: string
  role?: string
}

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Calendar filter: Year-Month format (default: '2026-05')
  const [selectedMonth, setSelectedMonth] = useState('2026-05')

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states for Process Payroll
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [baseSalary, setBaseSalary] = useState('500000')
  const [allowances, setAllowances] = useState('50000')
  const [deductions, setDeductions] = useState('25000')
  const [status, setStatus] = useState<'paid' | 'processed' | 'pending'>('paid')

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null

  // Fetch Payroll and Employees data
  const fetchData = async () => {
    setLoading(true)
    if (!employerId) {
      // Offline fallback
      setEmployees(mockEmployers[0].employees)
      const mappedMock = mockPayroll.map((p) => ({
        id: p.id,
        employeeId: p.employeeId,
        employeeName: p.employeeName,
        month: p.month === 'May 2026' ? '2026-05' : p.month,
        baseSalary: p.baseSalary,
        allowances: p.allowances,
        deductions: p.deductions,
        netSalary: p.netSalary,
        status: p.status as 'paid' | 'processed' | 'pending',
        processedAt: new Date('2026-05-31T12:00:00Z').toISOString(),
      }))
      setPayroll(mappedMock)
      setLoading(false)
      return
    }

    try {
      // 1. Fetch employees
      const empSnap = await getDocs(collection(db, 'employers', employerId, 'employees'))
      const empList: Employee[] = []
      empSnap.forEach((doc) => {
        empList.push({ id: doc.id, ...doc.data() } as Employee)
      })
      const finalEmployees = empList.length > 0 ? empList : (mockEmployers[0].employees as Employee[])
      setEmployees(finalEmployees)

      // 2. Fetch payroll
      const paySnap = await getDocs(collection(db, 'employers', employerId, 'payroll'))
      let payList: PayrollRecord[] = []
      paySnap.forEach((doc) => {
        payList.push({ id: doc.id, ...doc.data() } as PayrollRecord)
      })

      // Seed mock records if empty
      if (payList.length === 0) {
        const initialPayroll = mockPayroll.map((p) => ({
          employeeId: p.employeeId,
          employeeName: p.employeeName,
          month: p.month === 'May 2026' ? '2026-05' : p.month,
          baseSalary: p.baseSalary,
          allowances: p.allowances,
          deductions: p.deductions,
          netSalary: p.netSalary,
          status: p.status as 'paid' | 'processed' | 'pending',
          processedAt: new Date('2026-05-31T12:00:00Z').toISOString(),
        }))

        const seededList: PayrollRecord[] = []
        for (const p of initialPayroll) {
          const docRef = await addDoc(collection(db, 'employers', employerId, 'payroll'), p)
          seededList.push({ id: docRef.id, ...p })
        }
        payList = seededList
      }

      setPayroll(payList)
    } catch (error) {
      console.error('Error fetching payroll data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Live calculated fields
  const calcNetSalary = () => {
    const base = Number(baseSalary) || 0
    const allow = Number(allowances) || 0
    const ded = Number(deductions) || 0
    return base + allow - ded
  }

  // Filtered payroll list based on selected calendar month (YYYY-MM)
  const filteredPayroll = payroll.filter((p) => p.month === selectedMonth)

  // Aggregate stats based on filtered payroll list
  const totalPayroll = filteredPayroll.reduce((sum, p) => sum + p.netSalary, 0)
  const totalAllowances = filteredPayroll.reduce((sum, p) => sum + p.allowances, 0)
  const totalDeductions = filteredPayroll.reduce((sum, p) => sum + p.deductions, 0)

  const stats = [
    { label: 'Total Payroll', value: `₹${(totalPayroll / 100000).toFixed(2)}L`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/50' },
    { label: 'Total Allowances', value: `₹${(totalAllowances / 100000).toFixed(2)}L`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100/50' },
    { label: 'Total Deductions', value: `₹${(totalDeductions / 100000).toFixed(2)}L`, icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100/50' },
  ]

  const openProcessModal = () => {
    setSelectedEmployeeId(employees[0]?.id || '')
    setBaseSalary('500000')
    setAllowances('50000')
    setDeductions('25000')
    setStatus('paid')
    setIsModalOpen(true)
  }

  const handleProcessPayroll = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetEmployee = employees.find((emp) => emp.id === selectedEmployeeId)
    if (!targetEmployee) {
      alert('Please select an employee.')
      return
    }

    setSaving(true)
    const net = calcNetSalary()
    const payrollData: Omit<PayrollRecord, 'id'> = {
      employeeId: selectedEmployeeId,
      employeeName: targetEmployee.name,
      month: selectedMonth, // process for currently filtered month
      baseSalary: Number(baseSalary) || 0,
      allowances: Number(allowances) || 0,
      deductions: Number(deductions) || 0,
      netSalary: net,
      status,
      processedAt: new Date().toISOString(),
    }

    if (!employerId) {
      // Offline fallback
      setPayroll((prev) => [{ id: `mock-${Date.now()}`, ...payrollData }, ...prev])
      setSaving(false)
      setIsModalOpen(false)
      return
    }

    try {
      await addDoc(collection(db, 'employers', employerId, 'payroll'), payrollData)
      await fetchData()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving payroll record:', error)
      alert('Failed to process payroll.')
    } finally {
      setSaving(false)
    }
  }

  // Helper to get formatted display of Year-Month (e.g. "May 2026")
  const getDisplayMonth = (yyyyMm: string) => {
    const [year, month] = yyyyMm.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Payroll Management</h1>
          <p className="text-slate-600 font-medium">Manage employee salaries, process payrolls, and review disbursals.</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openProcessModal}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Calculator size={18} />
            Process Payroll
          </motion.button>
        </div>
      </div>

      {/* Dynamic Month/Calendar Filter */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left">
        <div className="flex items-center gap-3">
          <Calendar className="text-purple-500" size={20} />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Disbursal Period</p>
            <p className="text-sm font-extrabold text-slate-800">{getDisplayMonth(selectedMonth)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-xs font-semibold text-slate-800 bg-white"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`${stat.bg} p-6 rounded-3xl border shadow-sm flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <h3 className={`text-3xl font-black ${stat.color} mt-3`}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl bg-white/80 shadow-sm ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payroll Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading payroll summaries...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Employee</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Base Salary</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Allowances</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Deductions</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Net Salary</th>
                  <th className="text-left px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Processed Date</th>
                  <th className="text-left px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayroll.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-slate-800 text-sm">{record.employeeName}</td>
                    <td className="px-6 py-4 text-right text-slate-600 font-semibold text-sm">₹{record.baseSalary.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-semibold text-sm">+₹{record.allowances.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-rose-600 font-semibold text-sm">-₹{record.deductions.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">₹{record.netSalary.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-slate-500 font-semibold text-xs">
                      {record.processedAt ? new Date(record.processedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          record.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : record.status === 'processed'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredPayroll.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium text-sm">
                      No payroll records processed for {getDisplayMonth(selectedMonth)}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Process Payroll Popup Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-left"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-purple-50/10 to-pink-50/10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Process Employee Payroll</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Calculate disburse values and save disbursal records.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleProcessPayroll} className="p-6 space-y-4">
                {/* Select Employee */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Select Employee</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-850 text-sm font-semibold bg-white transition-all"
                  >
                    <option value="" disabled>-- Select Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Base Salary */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Base Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                  />
                </div>

                {/* Allowances and Deductions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Allowances (₹)</label>
                    <input
                      type="number"
                      required
                      value={allowances}
                      onChange={(e) => setAllowances(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Deductions (₹)</label>
                    <input
                      type="number"
                      required
                      value={deductions}
                      onChange={(e) => setDeductions(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold bg-white transition-all"
                  >
                    <option value="paid">Paid</option>
                    <option value="processed">Processed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Calculated Net Salary Breakdown */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                    <span>Calculation Breakdown</span>
                    <span>₹{Number(baseSalary) || 0} + ₹{Number(allowances) || 0} - ₹{Number(deductions) || 0}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-800">
                    <span>Net Disbursed Salary</span>
                    <span className="text-purple-600 text-base">₹{calcNetSalary().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-md"
                  >
                    {saving && <Loader2 className="animate-spin" size={14} />}
                    Complete & Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </EmployerLayout>
  )
}
