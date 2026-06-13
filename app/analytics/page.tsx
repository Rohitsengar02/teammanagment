'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MetricsCard } from '@/components/metrics-card'

const chartData = [
  { month: 'Jan', deals: 12, revenue: 450000, closed: 8 },
  { month: 'Feb', deals: 19, revenue: 620000, closed: 14 },
  { month: 'Mar', deals: 25, revenue: 850000, closed: 18 },
  { month: 'Apr', deals: 22, revenue: 780000, closed: 16 },
  { month: 'May', deals: 31, revenue: 1200000, closed: 24 },
  { month: 'Jun', deals: 35, revenue: 1400000, closed: 28 },
]

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-2">Detailed insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricsCard
          title="Total Deals Closed"
          value="128"
          metric="Last 6 months"
          icon={Target}
          backgroundColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <MetricsCard
          title="Total Revenue"
          value="₹46.50L"
          metric="YTD"
          icon={TrendingUp}
          backgroundColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricsCard
          title="Active Leads"
          value="47"
          metric="In pipeline"
          icon={Users}
          backgroundColor="bg-cyan-50"
          iconColor="text-cyan-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="floating-card p-6 rounded-xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" dataKey="month" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deals Closed Chart */}
        <div className="floating-card p-6 rounded-xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Deals Closed vs Total</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" dataKey="month" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Bar dataKey="deals" fill="#06b6d4" name="Total Deals" />
              <Bar dataKey="closed" fill="#10b981" name="Closed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="floating-card p-6 rounded-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Monthly Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Month</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Total Deals</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Closed Deals</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Close Rate</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.month} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900">{row.month}</td>
                  <td className="px-4 py-3 text-slate-900">{row.deals}</td>
                  <td className="px-4 py-3 text-slate-900">{row.closed}</td>
                  <td className="px-4 py-3">
                    <span className="text-green-600 font-semibold">{Math.round((row.closed / row.deals) * 100)}%</span>
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-semibold">₹{(row.revenue / 100000).toFixed(1)}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
