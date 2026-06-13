'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const employeeDistribution = [
  { dept: 'Sales', count: 2 },
  { dept: 'Tech', count: 1 },
]

const performanceData = [
  { month: 'Jan', rating: 3.8 },
  { month: 'Feb', rating: 3.9 },
  { month: 'Mar', rating: 4.1 },
  { month: 'Apr', rating: 4.2 },
  { month: 'May', rating: 4.5 },
  { month: 'Jun', rating: 4.6 },
]

const COLORS = ['#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Analytics</h1>
        <p className="text-slate-600">Comprehensive HR analytics and insights</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Employee Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Employee Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={employeeDistribution} dataKey="count" nameKey="dept" cx="50%" cy="50%" outerRadius={100} label>
                {employeeDistribution.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Rating Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" dataKey="month" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="rating" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* More Analytics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Avg. Tenure', value: '1.2 years', change: '+5% YoY' },
            { label: 'Turnover Rate', value: '8%', change: '-2% improvement' },
            { label: 'Engagement Score', value: '4.2/5', change: '+0.3 points' },
          ].map((metric, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">{metric.label}</p>
              <h4 className="text-2xl font-bold text-slate-900">{metric.value}</h4>
              <p className="text-xs text-green-600 mt-2">{metric.change}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </EmployerLayout>
  )
}
