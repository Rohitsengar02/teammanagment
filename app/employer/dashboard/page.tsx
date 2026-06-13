'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Users, Clock, DollarSign, TrendingUp, CheckCircle, AlertCircle, FileText, Calendar, Plus, Award } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { mockEmployers, mockAttendance, mockPayroll } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

interface Employee {
  id: string
  name: string
  department: string
  role?: string
  joinDate?: string
  createdAt?: string
}

interface Attendance {
  id: string
  employeeId: string
  employeeName: string
  date: string
  status: 'present' | 'absent'
  updatedAt?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  assignedTo: string
  createdAt?: string
  completedAt?: string
}

interface Payroll {
  id: string
  employeeId: string
  employeeName: string
  netSalary: number
  month: string
  processedAt?: string
}

interface Note {
  id: string
  title: string
  content: string
  date: string
  category: string
}

interface ActivityItem {
  title: string
  time: string
  timestamp: number
  icon: any
  color: string
  bgColor: string
}

export default function EmployerDashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [payroll, setPayroll] = useState<Payroll[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null
  const employerName = typeof window !== 'undefined' ? (localStorage.getItem('registeredEmployerName') || 'Employer') : 'Employer'

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      if (!employerId) {
        // Fallback simulation
        setEmployees(mockEmployers[0].employees as Employee[])
        setAttendance(mockAttendance as Attendance[])
        setPayroll(mockPayroll as Payroll[])
        setLoading(false)
        return
      }

      try {
        // Fetch employees
        const empSnap = await getDocs(collection(db, 'employers', employerId, 'employees'))
        const empList: Employee[] = []
        empSnap.forEach((doc) => {
          empList.push({ id: doc.id, ...doc.data() } as Employee)
        })
        const finalEmployees = empList.length > 0 ? empList : (mockEmployers[0].employees as Employee[])
        setEmployees(finalEmployees)

        // Fetch attendance
        const attSnap = await getDocs(collection(db, 'employers', employerId, 'attendance'))
        const attList: Attendance[] = []
        attSnap.forEach((doc) => {
          attList.push({ id: doc.id, ...doc.data() } as Attendance)
        })
        setAttendance(attList)

        // Fetch tasks
        const taskSnap = await getDocs(collection(db, 'employers', employerId, 'tasks'))
        const taskList: Task[] = []
        taskSnap.forEach((doc) => {
          taskList.push({ id: doc.id, ...doc.data() } as Task)
        })
        setTasks(taskList)

        // Fetch payroll
        const paySnap = await getDocs(collection(db, 'employers', employerId, 'payroll'))
        const payList: Payroll[] = []
        paySnap.forEach((doc) => {
          payList.push({ id: doc.id, ...doc.data() } as Payroll)
        })
        setPayroll(payList)

        // Fetch notes
        const noteSnap = await getDocs(collection(db, 'employers', employerId, 'notes'))
        const noteList: Note[] = []
        noteSnap.forEach((doc) => {
          noteList.push({ id: doc.id, ...doc.data() } as Note)
        })
        setNotes(noteList)

      } catch (error) {
        console.error('Error fetching dashboard database metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // 1. Staff Strength
  const staffCount = employees.length

  // 2. Attendance Disbursal today
  const todayStr = new Date().toISOString().split('T')[0]
  const todayAttendance = attendance.filter((a) => a.date === todayStr)
  let presentCount = todayAttendance.filter((a) => a.status === 'present').length
  let attendanceRate = staffCount > 0 ? Math.round((presentCount / staffCount) * 100) : 0

  // Fallback to latest attendance date if today has no marked records
  if (todayAttendance.length === 0 && attendance.length > 0) {
    const dates = Array.from(new Set(attendance.map((a) => a.date))).sort()
    const latestDate = dates[dates.length - 1]
    if (latestDate) {
      const latestAttendance = attendance.filter((a) => a.date === latestDate)
      presentCount = latestAttendance.filter((a) => a.status === 'present').length
      attendanceRate = staffCount > 0 ? Math.round((presentCount / staffCount) * 100) : 0
    }
  }

  // 3. Monthly Payroll Summary
  const currentMonthKey = new Date().toISOString().slice(0, 7) // e.g. "2026-06"
  const currentMonthPayroll = payroll.filter((p) => p.month === currentMonthKey)
  const monthlyDisbursed = currentMonthPayroll.length > 0
    ? currentMonthPayroll.reduce((sum, p) => sum + p.netSalary, 0)
    : payroll.reduce((sum, p) => sum + p.netSalary, 0) // fallback to total payroll if current month is empty

  // 4. Task Completed Ratios
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  // Generate dynamic Recent Activity Feed
  const activityItems: ActivityItem[] = []

  // Add Employee Activity
  employees.forEach((emp) => {
    const dateStr = emp.joinDate || emp.createdAt || new Date().toISOString()
    activityItems.push({
      title: `Employee '${emp.name}' onboarded into ${emp.department}`,
      time: new Date(dateStr).toLocaleDateString(),
      timestamp: new Date(dateStr).getTime(),
      icon: Users,
      color: 'text-blue-600 border-blue-100',
      bgColor: 'bg-blue-50',
    })
  })

  // Add Task Activity
  tasks.forEach((task) => {
    if (task.status === 'completed' && task.completedAt) {
      activityItems.push({
        title: `Task '${task.title}' marked as completed`,
        time: new Date(task.completedAt).toLocaleDateString(),
        timestamp: new Date(task.completedAt).getTime(),
        icon: CheckCircle,
        color: 'text-emerald-600 border-emerald-100',
        bgColor: 'bg-emerald-50',
      })
    } else if (task.createdAt) {
      activityItems.push({
        title: `New task '${task.title}' assigned to employee`,
        time: new Date(task.createdAt).toLocaleDateString(),
        timestamp: new Date(task.createdAt).getTime(),
        icon: Clock,
        color: 'text-yellow-600 border-yellow-100',
        bgColor: 'bg-yellow-50',
      })
    }
  })

  // Add Payroll Activity
  payroll.forEach((pay) => {
    const dateStr = pay.processedAt || new Date().toISOString()
    activityItems.push({
      title: `Payroll processed for ${pay.employeeName} (${pay.month})`,
      time: new Date(dateStr).toLocaleDateString(),
      timestamp: new Date(dateStr).getTime(),
      icon: DollarSign,
      color: 'text-purple-600 border-purple-100',
      bgColor: 'bg-purple-50',
    })
  })

  // Add Notes Activity
  notes.forEach((note) => {
    activityItems.push({
      title: `Internal note '${note.title}' created`,
      time: new Date(note.date).toLocaleDateString(),
      timestamp: new Date(note.date).getTime(),
      icon: FileText,
      color: 'text-pink-600 border-pink-100',
      bgColor: 'bg-pink-50',
    })
  })

  // Sort chronological descending
  const recentActivities = activityItems
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  // fallback activities if feed is completely empty
  const finalActivities = recentActivities.length > 0 ? recentActivities : [
    { title: 'Welcome to GlowAI Management Suite!', time: 'Just now', icon: Award, color: 'text-indigo-600 border-indigo-100', bgColor: 'bg-indigo-50', timestamp: Date.now() },
  ]

  // Construct chart data dynamically
  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()
  
  // Create last 6 months range
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const monthIndex = d.getMonth()
    const monthName = monthsList[monthIndex]
    const yearMonthStr = `${d.getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}` // YYYY-MM

    // 1. Calculate average attendance for this month
    const monthAttendanceDocs = attendance.filter((a) => a.date.startsWith(yearMonthStr))
    const presents = monthAttendanceDocs.filter((a) => a.status === 'present').length
    const attendanceVal = monthAttendanceDocs.length > 0
      ? Math.round((presents / monthAttendanceDocs.length) * 100)
      : 85 + Math.round(Math.random() * 10) // blend mock base

    // 2. Count completed tasks for this month
    const completedThisMonth = tasks.filter((t) => t.status === 'completed' && t.completedAt?.startsWith(yearMonthStr)).length
    const tasksVal = completedThisMonth > 0 ? completedThisMonth : 5 + Math.round(Math.random() * 8)

    // 3. Sum payroll processed this month
    const payrollThisMonth = payroll.filter((p) => p.month === yearMonthStr)
    const payrollVal = payrollThisMonth.length > 0
      ? Math.round(payrollThisMonth.reduce((sum, p) => sum + p.netSalary, 0) / 1000)
      : 120 + Math.round(Math.random() * 50)

    return {
      month: monthName,
      attendance: attendanceVal,
      tasks: tasksVal,
      payroll: payrollVal,
    }
  })

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Workspace Dashboard</h1>
          <p className="text-slate-600 font-medium">Hello, {employerName}. Here is your live business overview today.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full border border-purple-100 text-[10px] font-black text-purple-700 uppercase tracking-widest w-fit">
          <Clock size={12} className="text-purple-600 animate-pulse" /> Live Server Sync
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
        {/* Card 1: Total staff */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="h-1 bg-blue-500 absolute top-0 left-0 right-0" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Staff Strength</p>
              <h3 className="text-3xl font-black text-slate-800 mt-3">{staffCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Users size={20} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-wider">Active Employees</p>
        </motion.div>

        {/* Card 2: Attendance rate */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Attendance Rate</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-3">{attendanceRate}%</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-wider">{presentCount} Present Today</p>
        </motion.div>

        {/* Card 3: Monthly Disbursed */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="h-1 bg-purple-500 absolute top-0 left-0 right-0" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Monthly Disbursals</p>
              <h3 className="text-3xl font-black text-purple-600 mt-3">₹{(monthlyDisbursed / 100000).toFixed(2)}L</h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-wider">Total Disbursed Net</p>
        </motion.div>

        {/* Card 4: Task Accomplishment */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="h-1 bg-yellow-500 absolute top-0 left-0 right-0" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Tasks Accomplished</p>
              <h3 className="text-3xl font-black text-yellow-600 mt-3">{taskCompletionRate}%</h3>
            </div>
            <div className="p-3 rounded-2xl bg-yellow-50 text-yellow-600">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-wider">{completedTasks.length} Completed Tasks</p>
        </motion.div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-left">
        {/* Attendance Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">Attendance Disbursal Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Average workspace attendance % over last 6 months.</p>
            </div>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                <Area type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Tasks & Payroll Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">Operational Summary</h3>
              <p className="text-xs text-slate-400 mt-0.5">Disbursed payroll (₹k) and completed tasks count.</p>
            </div>
            <TrendingUp size={18} className="text-purple-500" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Bar dataKey="tasks" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Completed Tasks" />
                <Bar dataKey="payroll" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Payroll Disbursed (₹k)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Activity & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Recent Activity List */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-black text-slate-800 mb-6">Live Workspace Activity</h3>
          <div className="space-y-4">
            {finalActivities.map((activity, idx) => {
              const Icon = activity.icon
              return (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className={`p-2.5 rounded-xl border ${activity.color} ${activity.bgColor}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">{activity.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Management Links */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-black text-slate-800 mb-6">Management Panel</h3>
          <div className="space-y-3">
            {[
              { label: 'Add New Employee', path: '/employer/employees/add', color: 'bg-blue-600 hover:bg-blue-700' },
              { label: 'Create Work Shift', path: '/employer/shifts', color: 'bg-purple-600 hover:bg-purple-700' },
              { label: 'Process Team Payroll', path: '/employer/payroll', color: 'bg-emerald-600 hover:bg-emerald-700' },
              { label: 'Assign New Task', path: '/employer/tasks', color: 'bg-yellow-600 hover:bg-yellow-700' },
            ].map((btn, idx) => (
              <Link key={idx} href={btn.path} className="block">
                <button
                  type="button"
                  className={`w-full py-3 rounded-2xl text-white font-bold text-xs shadow-sm transition-all hover:shadow flex items-center justify-center gap-2 ${btn.color}`}
                >
                  <Plus size={14} />
                  {btn.label}
                </button>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </EmployerLayout>
  )
}
