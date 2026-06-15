'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Plus, Loader2, Sparkles, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockLeaves } from '@/lib/mock-data'

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null

  // Setup real-time listener for leaves
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    if (employerId) {
      const leavesRef = collection(db, 'employers', employerId, 'leaves')
      unsubscribe = onSnapshot(leavesRef, (snapshot) => {
        const list: any[] = []
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() })
        })
        // Sort by createdAt desc if available
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        setLeaves(list)
        setLoading(false)
      }, (error) => {
        console.error('Error fetching leaves:', error)
        setLoading(false)
      })
    } else {
      // Simulation fallback
      setLeaves(mockLeaves)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [employerId])

  // Stats calculation
  const stats = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  }

  // Handle Approve/Reject action
  const handleUpdateStatus = async (leaveId: string, employeeId: string, status: 'approved' | 'rejected') => {
    if (!employerId) {
      // Local simulated updates
      setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l))
      alert(`Simulated leave ${status} successfully!`)
      return
    }

    try {
      const leaveDocRef = doc(db, 'employers', employerId, 'leaves', leaveId)
      await updateDoc(leaveDocRef, { status })

      // Create notification for employee
      const notificationTitle = status === 'approved' ? 'Leave Request Approved' : 'Leave Request Rejected'
      const notificationMsg = status === 'approved' 
        ? 'Your leave request has been approved by your employer.' 
        : 'Your leave request has been rejected by your employer.'

      await addDoc(collection(db, 'employers', employerId, 'employees', employeeId, 'notifications'), {
        title: notificationTitle,
        message: notificationMsg,
        type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
        read: false,
        createdAt: new Date().toISOString()
      })

      alert(`Leave request successfully ${status}!`)
    } catch (err) {
      console.error('Error updating leave status:', err)
      alert('Failed to update leave request status in database.')
    }
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Leave Management</h1>
          <p className="text-slate-600">Review, manage, and approve employee leave requests in real-time.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full border border-purple-100 text-[10px] font-black text-purple-700 uppercase tracking-widest self-start md:self-auto">
          <Sparkles size={12} className="text-purple-600" /> Live Synchronizer
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</p>
          <h3 className="text-3xl font-black text-blue-600 mt-2">{stats.pending}</h3>
          <p className="text-xs text-slate-500 mt-1">Awaiting employer action</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">{stats.approved}</h3>
          <p className="text-xs text-slate-500 mt-1">Scheduled absences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rejected</p>
          <h3 className="text-3xl font-black text-rose-600 mt-2">{stats.rejected}</h3>
          <p className="text-xs text-slate-500 mt-1">Declined requests</p>
        </motion.div>
      </div>

      {/* Leave Requests List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading leave requests...</p>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {leaves.map((leave, idx) => {
            const getIcon = (status: string) => {
              switch (status) {
                case 'pending':
                  return <Clock className="text-blue-500" size={20} />
                case 'approved':
                  return <CheckCircle className="text-emerald-500" size={20} />
                case 'rejected':
                  return <XCircle className="text-rose-500" size={20} />
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-2xl flex-shrink-0">
                      {getIcon(leave.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-extrabold text-slate-800 text-base">{leave.employeeName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs font-semibold capitalize">{leave.type || 'General'} Leave Request</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 mt-2">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Duration</p>
                          <p>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Days</p>
                          <p>{leave.days} {leave.days === 1 ? 'day' : 'days'}</p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                        <span className="font-bold text-slate-800">Reason:</span> {leave.reason || 'No reason specified'}
                      </p>
                    </div>
                  </div>

                  {leave.status === 'pending' && (
                    <div className="flex gap-2.5 self-end md:self-auto border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 w-full md:w-auto justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUpdateStatus(leave.id, leave.employeeId, 'approved')}
                        className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-100 transition-colors"
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUpdateStatus(leave.id, leave.employeeId, 'rejected')}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-100 transition-colors"
                      >
                        Reject
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {leaves.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <p className="text-slate-500 font-medium">No leave requests logged in system.</p>
            </div>
          )}
        </div>
      )}
    </EmployerLayout>
  )
}
