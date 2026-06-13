'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Calendar, Download, Save, Loader2, Sparkles, Check, AlertTriangle } from 'lucide-react'
import { mockAttendance, mockEmployers } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [allAttendance, setAllAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [todayAttendance, setTodayAttendance] = useState<Record<string, 'present' | 'absent'>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const employerId = localStorage.getItem('registeredEmployerId')
      if (!employerId) {
        // Fallback for mock environment
        setEmployees(mockEmployers[0].employees)
        const todayMap: Record<string, 'present' | 'absent'> = {}
        mockEmployers[0].employees.forEach(emp => {
          todayMap[emp.id] = 'present'
        })
        setTodayAttendance(todayMap)
        setLoading(false)
        return
      }
      try {
        // Fetch all employees
        const empSnap = await getDocs(collection(db, 'employers', employerId, 'employees'))
        const empList: any[] = []
        empSnap.forEach((doc) => {
          empList.push({ id: doc.id, ...doc.data() })
        })
        const finalEmployees = empList.length > 0 ? empList : mockEmployers[0].employees
        setEmployees(finalEmployees)

        // Fetch all attendance records
        const attSnap = await getDocs(collection(db, 'employers', employerId, 'attendance'))
        const attList: any[] = []
        attSnap.forEach((doc) => {
          attList.push({ id: doc.id, ...doc.data() })
        })
        setAllAttendance(attList)

        // Map today's attendance status
        const todayMap: Record<string, 'present' | 'absent'> = {}
        finalEmployees.forEach((emp) => {
          const record = attList.find((a) => a.employeeId === emp.id && a.date === selectedDate)
          todayMap[emp.id] = record ? record.status : 'present'
        })
        setTodayAttendance(todayMap)
      } catch (err) {
        console.error('Error fetching attendance:', err)
        setEmployees(mockEmployers[0].employees)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedDate])

  const handleSaveAttendance = async () => {
    setSaving(true)
    const employerId = localStorage.getItem('registeredEmployerId')
    if (!employerId) {
      alert('Employer session not found. Standard simulation update applied.')
      setSaving(false)
      return
    }

    try {
      const promises = employees.map(async (emp) => {
        const docId = `${selectedDate}_${emp.id}`
        const docRef = doc(db, 'employers', employerId, 'attendance', docId)
        const status = todayAttendance[emp.id] || 'present'
        await setDoc(docRef, {
          employeeId: emp.id,
          employeeName: emp.name,
          date: selectedDate,
          status: status,
          updatedAt: new Date().toISOString()
        }, { merge: true })
      })

      await Promise.all(promises)

      // Re-fetch attendance records to update metrics
      const attSnap = await getDocs(collection(db, 'employers', employerId, 'attendance'))
      const attList: any[] = []
      attSnap.forEach((doc) => {
        attList.push({ id: doc.id, ...doc.data() })
      })
      setAllAttendance(attList)
      alert('Today\'s attendance saved successfully!')
    } catch (err) {
      console.error('Error saving attendance records:', err)
      alert('Failed to save attendance. Try checking firestore connection.')
    } finally {
      setSaving(false)
    }
  }

  // Stats cards calculations
  const totalEmployees = employees.length
  const todayPresent = Object.values(todayAttendance).filter(v => v === 'present').length
  const todayAbsent = Object.values(todayAttendance).filter(v => v === 'absent').length
  const attendanceRate = totalEmployees > 0 ? ((todayPresent / totalEmployees) * 100).toFixed(1) : '0'

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Attendance Management</h1>
          <p className="text-slate-600">Review shifts, calculate leave salary deductions, and mark present/absent logs.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full border border-purple-100 text-[10px] font-black text-purple-700 uppercase tracking-widest w-fit">
          <Sparkles size={12} className="text-purple-600" /> Live Payroll Sync
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Strength</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{totalEmployees}</h3>
          <p className="text-xs text-slate-500 mt-1">Registered members</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Present Today</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">{todayPresent}</h3>
          <p className="text-xs text-emerald-600/80 mt-1 font-semibold">{attendanceRate}% active rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Absent Today</p>
          <h3 className="text-3xl font-black text-rose-600 mt-2">{todayAbsent}</h3>
          <p className="text-xs text-slate-500 mt-1">Marked absent</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Attendance</p>
          <h3 className="text-3xl font-black text-purple-600 mt-2">{attendanceRate}%</h3>
          <p className="text-xs text-slate-500 mt-1">Based on current date</p>
        </motion.div>
      </div>

      {/* Date Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between">
        <div className="flex-1 flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm max-w-sm">
          <Calendar size={20} className="text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 outline-none text-slate-700 font-semibold text-sm bg-transparent"
          />
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all flex items-center gap-2 text-sm shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Attendance'}
          </motion.button>
        </div>
      </div>

      {/* Employees Attendance List Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Fetching attendance reports...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Leaves (Absent)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total Attendance %</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">One Day Salary (Salary / 26)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Salary Reduction</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  // Calculate leave count (absent count) in saved records
                  const empRecords = allAttendance.filter(r => r.employeeId === emp.id)
                  const totalPresent = empRecords.filter(r => r.status === 'present').length
                  const totalAbsent = empRecords.filter(r => r.status === 'absent').length
                  const totalLoggedDays = totalPresent + totalAbsent

                  // Total Attendance %
                  const empAttendanceRate = totalLoggedDays > 0 ? ((totalPresent / totalLoggedDays) * 100).toFixed(0) : '100'

                  // Salary details
                  const salary = emp.baseSalary || 30000 // default fallback
                  const oneDaySalary = salary / 26
                  const salaryReduction = totalAbsent * oneDaySalary

                  const currentStatus = todayAttendance[emp.id] || 'present'

                  return (
                    <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{(emp.role || 'Sales').replace('-', ' ')}</p>
                          </div>
                        </div>
                      </td>

                      {/* Leaves Count */}
                      <td className="px-6 py-5 text-center font-bold text-slate-700 text-sm">
                        {totalAbsent}
                      </td>

                      {/* Attendance % */}
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          Number(empAttendanceRate) >= 90 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : Number(empAttendanceRate) >= 75 
                              ? 'bg-amber-50 text-amber-700' 
                              : 'bg-rose-50 text-rose-700'
                        }`}>
                          {empAttendanceRate}%
                        </span>
                      </td>

                      {/* One Day Salary */}
                      <td className="px-6 py-5 text-right font-semibold text-slate-700 text-sm">
                        ₹{Math.round(oneDaySalary).toLocaleString('en-IN')}
                      </td>

                      {/* Salary Reduction */}
                      <td className="px-6 py-5 text-right font-bold text-rose-600 text-sm">
                        {salaryReduction > 0 ? `- ₹${Math.round(salaryReduction).toLocaleString('en-IN')}` : '₹0'}
                      </td>

                      {/* A / P Toggles */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTodayAttendance({ ...todayAttendance, [emp.id]: 'present' })}
                            className={`h-8 w-8 rounded-lg font-black text-xs transition-all flex items-center justify-center ${
                              currentStatus === 'present'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => setTodayAttendance({ ...todayAttendance, [emp.id]: 'absent' })}
                            className={`h-8 w-8 rounded-lg font-black text-xs transition-all flex items-center justify-center ${
                              currentStatus === 'absent'
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-100'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </EmployerLayout>
  )
}
