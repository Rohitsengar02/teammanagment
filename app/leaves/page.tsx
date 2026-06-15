'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CheckCircle, XCircle, Plus, Send, Loader2, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockLeaves } from '@/lib/mock-data'

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRequesting, setIsRequesting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Auth session
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)

  // Form states
  const [leaveForm, setLeaveForm] = useState({
    type: 'sick',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  })

  // Load employee info and setup leaves listener
  useEffect(() => {
    const loggedInStr = localStorage.getItem('loggedInEmployee')
    if (loggedInStr) {
      try {
        const emp = JSON.parse(loggedInStr)
        setEmployeeInfo(emp)

        if (emp.employerId && emp.id) {
          const leavesRef = collection(db, 'employers', emp.employerId, 'leaves')
          const q = query(leavesRef, where('employeeId', '==', emp.id))

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: any[] = []
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() })
            })
            // Sort by createdAt desc
            list.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
              return dateB - dateA
            })
            setLeaves(list)
            setLoading(false)
          }, (err) => {
            console.error('Error fetching employee leaves:', err)
            setLoading(false)
          })

          return () => unsubscribe()
        }
      } catch (err) {
        console.error('Error parsing employee info in calendar:', err)
        setLoading(false)
      }
    } else {
      // Fallback mock simulation filtered for one employee
      const filtered = mockLeaves.map((l: any) => ({
        ...l,
        employeeId: 'emp1-1'
      }))
      setLeaves(filtered)
      setLoading(false)
    }
  }, [])

  // Submit leave request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaveForm.reason.trim()) {
      alert('Please state a reason for your leave request.')
      return
    }

    const start = new Date(leaveForm.startDate)
    const end = new Date(leaveForm.endDate)

    if (end.getTime() < start.getTime()) {
      alert('End date cannot be earlier than start date.')
      return
    }

    // Calculate duration in days (inclusive)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    setSubmitting(true)

    const payload = {
      employeeId: employeeInfo?.id || 'emp-demo',
      employeeName: employeeInfo?.name || 'Employee',
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: diffDays,
      type: leaveForm.type,
      reason: leaveForm.reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    if (employeeInfo?.employerId) {
      try {
        const leavesRef = collection(db, 'employers', employeeInfo.employerId, 'leaves')
        await addDoc(leavesRef, payload)
        setIsRequesting(false)
        setLeaveForm({
          type: 'sick',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: ''
        })
        alert('Leave request submitted successfully!')
      } catch (err) {
        console.error('Error submitting leave request:', err)
        alert('Failed to submit leave request to database.')
      } finally {
        setSubmitting(false)
      }
    } else {
      // Local fallback
      setLeaves(prev => [{ id: `sim-${Date.now()}`, ...payload }, ...prev])
      setIsRequesting(false)
      setLeaveForm({
        type: 'sick',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: ''
      })
      setSubmitting(false)
      alert('Simulated leave request submitted!')
    }
  }

  // Stats calculation
  const stats = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Leave Requests</h1>
            <p className="text-slate-600 mt-2">Request leaves, review your history, and monitor approvals.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-widest self-start md:self-auto">
              <Sparkles size={12} className="text-indigo-600" /> Database Sync
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsRequesting(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={16} />
              Request Leave
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-black text-blue-600 mt-2">{stats.pending}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-2">{stats.approved}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rejected</p>
            <h3 className="text-2xl font-black text-rose-600 mt-2">{stats.rejected}</h3>
          </div>
        </div>
      </div>

      {/* Leave Request Drawer Modal */}
      <AnimatePresence>
        {isRequesting && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequesting(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-left z-10 border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Request Leave</h2>
                    <p className="text-xs text-slate-500 font-medium">Apply for vacation or medical absence</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Leave Type</label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-white transition-all"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="special">Special Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Provide details for your absence request..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRequesting(false)}
                    className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-indigo-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading leave requests history...</p>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {leaves.map((leave, idx) => {
            const getIcon = (status: string) => {
              switch (status) {
                case 'pending':
                  return <Clock className="text-blue-500" size={18} />
                case 'approved':
                  return <CheckCircle className="text-emerald-500" size={18} />
                case 'rejected':
                  return <XCircle className="text-rose-500" size={18} />
                default:
                  return null
              }
            }

            const getStatusColor = (status: string) => {
              switch (status) {
                case 'pending':
                  return 'bg-blue-50 text-blue-700 border border-blue-100'
                case 'approved':
                  return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                case 'rejected':
                  return 'bg-rose-50 text-rose-700 border border-rose-100'
                default:
                  return 'bg-slate-50 text-slate-700 border border-slate-100'
              }
            }

            return (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
              >
                <div className="p-2 bg-slate-50 rounded-xl flex-shrink-0 mt-0.5">
                  {getIcon(leave.status)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800 capitalize">{leave.type} Leave</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span>Duration: {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Days: {leave.days} {leave.days === 1 ? 'day' : 'days'}</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed italic mt-1">"{leave.reason}"</p>
                </div>
              </motion.div>
            )
          })}

          {leaves.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <p className="text-slate-500 font-medium">No leave requests found. Submit your first request using the button above.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
