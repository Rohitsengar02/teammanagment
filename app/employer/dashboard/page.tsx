'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Users, Clock, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mockEmployers, mockAttendance, mockPayroll } from '@/lib/mock-data'

const dashboardChartData = [
  { month: 'Jan', attendance: 92, tasks: 15, payroll: 45 },
  { month: 'Feb', attendance: 88, tasks: 18, payroll: 48 },
  { month: 'Mar', attendance: 94, tasks: 22, payroll: 52 },
  { month: 'Apr', attendance: 91, tasks: 25, payroll: 58 },
  { month: 'May', attendance: 96, tasks: 28, payroll: 62 },
  { month: 'Jun', attendance: 93, tasks: 32, payroll: 68 },
]

const KPICard = ({
  icon: Icon,
  label,
  value,
  change,
  bgColor,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  bgColor: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${bgColor} p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-600 text-sm font-medium">{label}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
        {change && <p className="text-xs text-green-600 mt-2">↑ {change}</p>}
      </div>
      <div className="p-3 rounded-lg bg-white/50">{Icon}</div>
    </div>
  </motion.div>
)

export default function EmployerDashboardPage() {
  const employer = mockEmployers[0]
  const totalEmployees = employer.employees.length
  const presentToday = mockAttendance.filter((a) => a.status === 'present').length
  const totalPayroll = mockPayroll.reduce((sum, p) => sum + p.netSalary, 0)

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back, {employer.name}. Here&apos;s your team overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPICard
          label="Total Employees"
          value={totalEmployees}
          change="2 new this month"
          icon={<Users size={24} className="text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <KPICard
          label="Present Today"
          value={`${presentToday}/${totalEmployees}`}
          change="96% attendance"
          icon={<Clock size={24} className="text-green-600" />}
          bgColor="bg-green-50"
        />
        <KPICard
          label="Monthly Payroll"
          value={`₹${(totalPayroll / 100000).toFixed(1)}L`}
          change="Processed"
          icon={<DollarSign size={24} className="text-purple-600" />}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" dataKey="month" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tasks & Payroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tasks & Payroll</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" dataKey="month" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
              <Legend />
              <Bar dataKey="tasks" fill="#f59e0b" name="Tasks" />
              <Bar dataKey="payroll" fill="#8b5cf6" name="Payroll" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Employee Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { title: 'New employee onboarded', time: '2 hours ago', icon: Users },
              { title: 'Payroll processed', time: '5 hours ago', icon: DollarSign },
              { title: 'Leave request approved', time: '1 day ago', icon: CheckCircle },
              { title: 'Low attendance alert', time: '2 days ago', icon: AlertCircle },
            ].map((activity, idx) => {
              const Icon = activity.icon
              return (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Icon size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: 'Active Tasks', value: 12, color: 'text-blue-600' },
              { label: 'Pending Leaves', value: 3, color: 'text-orange-600' },
              { label: 'Performance Reviews', value: 8, color: 'text-green-600' },
              { label: 'Upcoming Shifts', value: 5, color: 'text-purple-600' },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <p className="text-slate-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </EmployerLayout>
  )
}
