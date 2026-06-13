'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Trash2, Loader2, Sparkles, Save, X } from 'lucide-react'
import Link from 'next/link'
import { mockEmployers, mockPayroll, mockAttendance } from '@/lib/mock-data'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  // Payroll edit states
  const [isEditingPayroll, setIsEditingPayroll] = useState(false)
  const [editBase, setEditBase] = useState(0)
  const [editAllowances, setEditAllowances] = useState(0)
  const [editDeductions, setEditDeductions] = useState(0)
  const [savingPayroll, setSavingPayroll] = useState(false)

  useEffect(() => {
    const fetchEmployee = async () => {
      const employerId = localStorage.getItem('registeredEmployerId')
      if (!employerId) {
        const mockEmp = mockEmployers[0].employees.find((e) => e.id === employeeId)
        if (mockEmp) setEmployee(mockEmp)
        setLoading(false)
        return
      }
      try {
        const docRef = doc(db, 'employers', employerId, 'employees', employeeId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setEmployee({ id: docSnap.id, ...docSnap.data() })
        } else {
          const mockEmp = mockEmployers[0].employees.find((e) => e.id === employeeId)
          if (mockEmp) setEmployee(mockEmp)
        }
      } catch (error) {
        console.error('Error fetching employee:', error)
        const mockEmp = mockEmployers[0].employees.find((e) => e.id === employeeId)
        if (mockEmp) setEmployee(mockEmp)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [employeeId])

  // Initialize edit fields
  useEffect(() => {
    if (employee) {
      setEditBase(employee.baseSalary !== undefined ? employee.baseSalary : 0)
      setEditAllowances(employee.allowances !== undefined ? employee.allowances : 0)
      setEditDeductions(employee.deductions !== undefined ? employee.deductions : 0)
    }
  }, [employee])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this employee?')) return
    
    setDeleting(true)
    const employerId = localStorage.getItem('registeredEmployerId')
    if (employerId) {
      try {
        const docRef = doc(db, 'employers', employerId, 'employees', employeeId)
        await deleteDoc(docRef)
        router.push('/employer/employees')
        return
      } catch (error) {
        console.error('Error deleting employee:', error)
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.push('/employer/employees')
  }

  const handleSavePayroll = async () => {
    setSavingPayroll(true)
    const employerId = localStorage.getItem('registeredEmployerId')
    if (employerId) {
      try {
        const docRef = doc(db, 'employers', employerId, 'employees', employeeId)
        await updateDoc(docRef, {
          baseSalary: Number(editBase),
          allowances: Number(editAllowances),
          deductions: Number(editDeductions)
        })
        setEmployee((prev: any) => ({
          ...prev,
          baseSalary: Number(editBase),
          allowances: Number(editAllowances),
          deductions: Number(editDeductions)
        }))
        setIsEditingPayroll(false)
      } catch (error) {
        console.error('Error saving payroll:', error)
        alert('Failed to update salary records in database.')
      } finally {
        setSavingPayroll(false)
      }
    } else {
      setEmployee((prev: any) => ({
        ...prev,
        baseSalary: Number(editBase),
        allowances: Number(editAllowances),
        deductions: Number(editDeductions)
      }))
      setIsEditingPayroll(false)
      setSavingPayroll(false)
    }
  }

  const baseSalary = employee?.baseSalary !== undefined ? employee.baseSalary : 0
  const allowances = employee?.allowances !== undefined ? employee.allowances : 0
  const deductions = employee?.deductions !== undefined ? employee.deductions : 0
  const netSalary = baseSalary + allowances - deductions

  const employeeAttendance = mockAttendance.filter((a) => a.employeeId === employeeId).length > 0
    ? mockAttendance.filter((a) => a.employeeId === employeeId)
    : [
        { date: new Date().toISOString(), checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present' },
        { date: new Date(Date.now() - 86400000).toISOString(), checkIn: '09:15 AM', checkOut: '06:05 PM', status: 'present' }
      ]

  if (loading) {
    return (
      <EmployerLayout>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
          <p className="text-slate-500 font-bold">Retrieving profile...</p>
        </div>
      </EmployerLayout>
    )
  }

  if (!employee) {
    return (
      <EmployerLayout>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <p className="text-slate-500 font-bold text-lg">Employee not found</p>
          <Link href="/employer/employees" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold">
            <ArrowLeft size={16} /> Back to List
          </Link>
        </div>
      </EmployerLayout>
    )
  }

  return (
    <EmployerLayout>
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/employer/employees"
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Employees
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full border border-purple-100 text-[10px] font-black text-purple-700 uppercase tracking-widest">
          <Sparkles size={12} className="text-purple-600" /> Real-time Profile
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-4xl mx-auto mb-6 shadow-md border-2 border-white">
              {(employee.name || 'E').charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-black text-slate-900 text-center mb-1">{employee.name}</h1>
            <p className="text-center text-purple-600 font-bold text-xs uppercase tracking-wider mb-8">
              {(employee.role || 'Sales').replace('-', ' ')}
            </p>
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="text-sm text-slate-700 font-medium truncate">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                  <p className="text-sm text-slate-700 font-medium capitalize">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Join Date</p>
                  <p className="text-sm text-slate-700 font-medium">
                    {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="text-sm text-slate-700 font-medium capitalize">{employee.location || 'Bangalore, India'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-8 border-t border-slate-100 pt-6">
            <button 
              disabled={deleting}
              onClick={handleDelete}
              className="w-full px-4 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? 'Removing...' : 'Remove Employee'}
            </button>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Payroll Overview</h2>
              {isEditingPayroll ? (
                <div className="flex gap-2">
                  <button
                    disabled={savingPayroll}
                    onClick={handleSavePayroll}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xs hover:shadow-md transition-shadow flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    {savingPayroll ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    disabled={savingPayroll}
                    onClick={() => {
                      setIsEditingPayroll(false)
                      setEditBase(baseSalary)
                      setEditAllowances(allowances)
                      setEditDeductions(deductions)
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingPayroll(true)}
                  className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs hover:bg-purple-100 transition-colors flex items-center gap-1.5 border border-purple-100"
                >
                  <Edit2 size={14} />
                  Update Salaries
                </button>
              )}
            </div>

            {isEditingPayroll ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Base Salary (₹)</label>
                    <input
                      type="number"
                      value={editBase}
                      onChange={(e) => setEditBase(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Allowances (₹)</label>
                    <input
                      type="number"
                      value={editAllowances}
                      onChange={(e) => setEditAllowances(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Deductions (₹)</label>
                    <input
                      type="number"
                      value={editDeductions}
                      onChange={(e) => setEditDeductions(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                  <p className="text-xs text-purple-800 font-bold uppercase tracking-wider">Calculated Net Pay</p>
                  <p className="text-lg font-black text-purple-700">₹{(Number(editBase) + Number(editAllowances) - Number(editDeductions)).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Base Salary</p>
                  <p className="text-2xl font-black text-slate-900">₹{baseSalary.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Allowances</p>
                  <p className="text-2xl font-black text-emerald-600">₹{allowances.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Deductions</p>
                  <p className="text-2xl font-black text-red-600">₹{deductions.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100/50">
                  <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Net Pay</p>
                  <p className="text-2xl font-black text-purple-700">₹{netSalary.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
          >
            <h2 className="text-xl font-black text-slate-900 mb-6">Recent Shifts & Attendance</h2>
            <div className="space-y-3">
              {employeeAttendance.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check-In: {record.checkIn} | Check-Out: {record.checkOut}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      record.status === 'present'
                        ? 'bg-emerald-100 text-emerald-700'
                        : record.status === 'absent'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
          >
            <h2 className="text-xl font-black text-slate-900 mb-6">Performance Evaluation</h2>
            <div className="space-y-5">
              {[
                { name: 'Productivity & Execution', score: '4.8/5.0', pct: 'w-24/25' },
                { name: 'Communication & Collaboration', score: '4.5/5.0', pct: 'w-9/10' },
                { name: 'Client Retention & Sales', score: '4.7/5.0', pct: 'w-23/25' }
              ].map((metric, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-700 text-sm">{metric.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{metric.score}</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-purple-600 to-pink-600 ${metric.pct} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </EmployerLayout>
  )
}
