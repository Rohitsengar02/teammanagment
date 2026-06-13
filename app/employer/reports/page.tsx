'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Download, BarChart3, Users, CheckCircle, DollarSign, Calendar, Loader2, FileSpreadsheet, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockEmployers, mockAttendance, mockPayroll, mockTasks } from '@/lib/mock-data'

interface EmployeeReportData {
  id: string
  name: string
  email: string
  department: string
  role: string
  joinDate: string
  totalTasks: number
  completedTasks: number
  taskDoneRate: number
  avgTaskRating: number
  totalLeaves: number
  attendanceRate: number
  totalSalaryDisbursed: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<EmployeeReportData[]>([])
  const [loading, setLoading] = useState(true)

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null

  const fetchReportDetails = async () => {
    setLoading(true)
    try {
      let employeesList: any[] = []
      let tasksList: any[] = []
      let attendanceList: any[] = []
      let payrollList: any[] = []

      if (!employerId) {
        // Fallback simulation
        employeesList = mockEmployers[0].employees
        tasksList = mockTasks // we can map mock tasks
        attendanceList = mockAttendance
        payrollList = mockPayroll
      } else {
        // Fetch real data from firestore
        const empSnap = await getDocs(collection(db, 'employers', employerId, 'employees'))
        empSnap.forEach((doc) => {
          employeesList.push({ id: doc.id, ...doc.data() })
        })

        const taskSnap = await getDocs(collection(db, 'employers', employerId, 'tasks'))
        taskSnap.forEach((doc) => {
          tasksList.push({ id: doc.id, ...doc.data() })
        })

        const attSnap = await getDocs(collection(db, 'employers', employerId, 'attendance'))
        attSnap.forEach((doc) => {
          attendanceList.push({ id: doc.id, ...doc.data() })
        })

        const paySnap = await getDocs(collection(db, 'employers', employerId, 'payroll'))
        paySnap.forEach((doc) => {
          payrollList.push({ id: doc.id, ...doc.data() })
        })
      }

      // If no employees loaded, fallback to mock
      if (employeesList.length === 0) {
        employeesList = mockEmployers[0].employees
      }

      // Process and compile data for each employee
      const compiledReports: EmployeeReportData[] = employeesList.map((emp) => {
        // Tasks
        const empTasks = tasksList.filter((t) => t.assignedTo === emp.id)
        const completed = empTasks.filter((t) => t.status === 'completed')
        const taskDoneRate = empTasks.length > 0 ? Math.round((completed.length / empTasks.length) * 100) : 0
        
        const ratedTasks = empTasks.filter((t) => t.rating !== undefined)
        const avgTaskRating = ratedTasks.length > 0
          ? Number((ratedTasks.reduce((sum, t) => sum + t.rating, 0) / ratedTasks.length).toFixed(1))
          : 0

        // Attendance & Leaves
        const empAttendance = attendanceList.filter((a) => a.employeeId === emp.id)
        const presents = empAttendance.filter((a) => a.status === 'present').length
        const absents = empAttendance.filter((a) => a.status === 'absent').length
        
        const attendanceRate = empAttendance.length > 0
          ? Math.round((presents / empAttendance.length) * 100)
          : 100 // default to 100 if no record yet

        // Payroll
        const empPayroll = payrollList.filter((p) => p.employeeId === emp.id)
        const totalSalary = empPayroll.reduce((sum, p) => sum + p.netSalary, 0)

        return {
          id: emp.id,
          name: emp.name,
          email: emp.email || 'N/A',
          department: emp.department || 'Sales',
          role: emp.role || 'Executive',
          joinDate: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : 'N/A',
          totalTasks: empTasks.length,
          completedTasks: completed.length,
          taskDoneRate,
          avgTaskRating,
          totalLeaves: absents, // absent days represent leaves taken
          attendanceRate,
          totalSalaryDisbursed: totalSalary,
        }
      })

      setReportData(compiledReports)
    } catch (error) {
      console.error('Error compiling reports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportDetails()
  }, [])

  // CSV Generation & Trigger Download
  const downloadCSVReport = (type: 'full' | 'tasks' | 'attendance' | 'payroll') => {
    let headers: string[] = []
    let rows: string[][] = []
    let filename = 'workspace_report.csv'

    if (type === 'full') {
      headers = [
        'Employee ID',
        'Name',
        'Email',
        'Department',
        'Role',
        'Join Date',
        'Total Tasks Assigned',
        'Completed Tasks',
        'Task Done Rate (%)',
        'Average Rating',
        'Leaves Count (Absents)',
        'Attendance Rate (%)',
        'Total Salary Disbursed (₹)',
      ]
      rows = reportData.map((d) => [
        d.id,
        d.name,
        d.email,
        d.department,
        d.role,
        d.joinDate,
        d.totalTasks.toString(),
        d.completedTasks.toString(),
        `${d.taskDoneRate}%`,
        d.avgTaskRating.toString(),
        d.totalLeaves.toString(),
        `${d.attendanceRate}%`,
        d.totalSalaryDisbursed.toString(),
      ])
      filename = `full_workspace_report_${new Date().toISOString().slice(0, 10)}.csv`
    } else if (type === 'tasks') {
      headers = ['Employee Name', 'Department', 'Role', 'Total Tasks', 'Completed Tasks', 'Completion Rate (%)', 'Avg Star Rating']
      rows = reportData.map((d) => [
        d.name,
        d.department,
        d.role,
        d.totalTasks.toString(),
        d.completedTasks.toString(),
        `${d.taskDoneRate}%`,
        d.avgTaskRating.toString(),
      ])
      filename = `tasks_performance_report_${new Date().toISOString().slice(0, 10)}.csv`
    } else if (type === 'attendance') {
      headers = ['Employee Name', 'Department', 'Role', 'Total Absents (Leaves)', 'Attendance Rate (%)']
      rows = reportData.map((d) => [
        d.name,
        d.department,
        d.role,
        d.totalLeaves.toString(),
        `${d.attendanceRate}%`,
      ])
      filename = `attendance_leaves_report_${new Date().toISOString().slice(0, 10)}.csv`
    } else if (type === 'payroll') {
      headers = ['Employee Name', 'Department', 'Role', 'Total Disbursed Net Salary (₹)']
      rows = reportData.map((d) => [
        d.name,
        d.department,
        d.role,
        `₹${d.totalSalaryDisbursed.toLocaleString('en-IN')}`,
      ])
      filename = `payroll_disbursal_report_${new Date().toISOString().slice(0, 10)}.csv`
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Reports Hub</h1>
          <p className="text-slate-600 font-medium">Export operational spreadsheets and monitor employee indexes.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => downloadCSVReport('full')}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg flex items-center justify-center gap-2 text-sm shadow-md w-fit"
        >
          <Download size={18} />
          Export Master Report
        </motion.button>
      </div>

      {/* Quick Downloads Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
        {/* Card 1: Task performance report */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 w-fit">
              <CheckCircle size={20} />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mt-4">Tasks Done & Ratings</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Task accomplishment rates and overall ratings calculated from completed task reviews.</p>
          </div>
          <button
            type="button"
            onClick={() => downloadCSVReport('tasks')}
            className="w-full mt-6 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-100 hover:border-amber-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <FileSpreadsheet size={14} /> Download CSV
          </button>
        </motion.div>

        {/* Card 2: Attendance & leaves */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 w-fit">
              <Calendar size={20} />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mt-4">Attendance & Leaves</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Summarized attendance frequencies, present ratios, and leave count aggregates.</p>
          </div>
          <button
            type="button"
            onClick={() => downloadCSVReport('attendance')}
            className="w-full mt-6 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-100 hover:border-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <FileSpreadsheet size={14} /> Download CSV
          </button>
        </motion.div>

        {/* Card 3: Payroll report */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 w-fit">
              <DollarSign size={20} />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mt-4">Payroll & Disbursals</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Sum of disbursed salaries, base values, allowances, and leave salary reductions.</p>
          </div>
          <button
            type="button"
            onClick={() => downloadCSVReport('payroll')}
            className="w-full mt-6 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-100 hover:border-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <FileSpreadsheet size={14} /> Download CSV
          </button>
        </motion.div>
      </div>

      {/* Detailed Report Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left mb-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">Team Summary Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live operational indices calculated directly from your workspace.</p>
          </div>
          <button
            type="button"
            onClick={fetchReportDetails}
            className="text-xs font-bold text-purple-600 hover:underline"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600 mb-3" size={32} />
            <p className="text-slate-500 text-sm font-semibold">Compiling workspace reports...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Employee</th>
                  <th className="text-left px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Department</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Task Completion</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Avg Rating</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Attendance</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Leaves Taken</th>
                  <th className="text-right px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-wider">Total Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-800 text-sm">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{emp.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-extrabold text-slate-800 text-sm">{emp.taskDoneRate}%</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{emp.completedTasks} of {emp.totalTasks} tasks</p>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800 text-sm">
                      {emp.avgTaskRating > 0 ? `⭐ ${emp.avgTaskRating}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800 text-sm">
                      {emp.attendanceRate}%
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800 text-sm">
                      {emp.totalLeaves} days
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                      ₹{emp.totalSalaryDisbursed.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}

                {reportData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium text-sm">
                      No employee reports available to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EmployerLayout>
  )
}
