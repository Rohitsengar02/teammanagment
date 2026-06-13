'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Plus } from 'lucide-react'
import { mockLeaves } from '@/lib/mock-data'

export default function LeavesPage() {
  const stats = {
    pending: mockLeaves.filter((l) => l.status === 'pending').length,
    approved: mockLeaves.filter((l) => l.status === 'approved').length,
    rejected: mockLeaves.filter((l) => l.status === 'rejected').length,
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Leave Management</h1>
          <p className="text-slate-600">Manage and approve employee leave requests</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Leave
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 p-6 rounded-xl shadow-md">
          <p className="text-slate-600 text-sm font-medium">Pending</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">{stats.pending}</h3>
          <p className="text-xs text-slate-500 mt-2">Awaiting approval</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 p-6 rounded-xl shadow-md"
        >
          <p className="text-slate-600 text-sm font-medium">Approved</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</h3>
          <p className="text-xs text-slate-500 mt-2">This month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 p-6 rounded-xl shadow-md"
        >
          <p className="text-slate-600 text-sm font-medium">Rejected</p>
          <h3 className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</h3>
          <p className="text-xs text-slate-500 mt-2">Not approved</p>
        </motion.div>
      </div>

      {/* Leave Requests */}
      <div className="space-y-4">
        {mockLeaves.map((leave, idx) => {
          const getIcon = (status: string) => {
            switch (status) {
              case 'pending':
                return <Clock className="text-blue-600" size={24} />
              case 'approved':
                return <CheckCircle className="text-green-600" size={24} />
              case 'rejected':
                return <XCircle className="text-red-600" size={24} />
            }
          }

          const getStatusColor = (status: string) => {
            switch (status) {
              case 'pending':
                return 'bg-blue-100 text-blue-700'
              case 'approved':
                return 'bg-green-100 text-green-700'
              case 'rejected':
                return 'bg-red-100 text-red-700'
            }
          }

          return (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getIcon(leave.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{leave.employeeName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(leave.status)}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3 capitalize">{leave.type} Leave</p>
                  <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                    <div>
                      <p className="font-medium text-slate-700">Duration:</p>
                      <p>
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Days:</p>
                      <p>{leave.days} days</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Reason:</span> {leave.reason}
                  </p>
                </div>
                {leave.status === 'pending' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-lg bg-green-50 text-green-600 font-medium hover:bg-green-100"
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100"
                    >
                      Reject
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </EmployerLayout>
  )
}
