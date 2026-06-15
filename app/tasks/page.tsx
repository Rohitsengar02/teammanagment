'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { mockAssignedTasks } from '@/lib/mock-data'
import { Filter, CheckCircle2, Circle, Clock, Play, AlertTriangle, X, Sparkles, Send, Loader2, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')

  // Auth / Session info
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)

  // Modal / Completion report states
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [accomplishmentNotes, setAccomplishmentNotes] = useState('')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [submittingReport, setSubmittingReport] = useState(false)

  // Load employee info from localStorage and setup Firestore listener
  useEffect(() => {
    const loggedInStr = localStorage.getItem('loggedInEmployee')
    if (loggedInStr) {
      try {
        const emp = JSON.parse(loggedInStr)
        setEmployeeInfo(emp)

        if (emp.employerId && emp.id) {
          // Setup real-time listener for tasks assigned to this employee
          const q = query(
            collection(db, 'employers', emp.employerId, 'tasks'),
            where('assignedTo', '==', emp.id)
          )

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: any[] = []
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() })
            })
            // Sort by createdAt desc if available, or fall back to title
            list.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
              return dateB - dateA
            })
            setTasks(list)
            setLoading(false)
          }, (error) => {
            console.error('Error fetching tasks from firestore:', error)
            setLoading(false)
          })

          return () => unsubscribe()
        }
      } catch (err) {
        console.error('Error parsing employee info:', err)
        setLoading(false)
      }
    } else {
      // Fallback simulation (mock tasks)
      const mappedMocks = mockAssignedTasks.map((t: any) => ({
        ...t,
        description: t.description || 'No description provided',
        dueDate: t.dueDate || new Date().toISOString().split('T')[0]
      }))
      setTasks(mappedMocks)
      setLoading(false)
    }
  }, [])

  // Filter tasks
  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  // Stats calculation
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  // Handle setting task status to In Progress
  const startTask = async (taskId: string) => {
    if (employeeInfo?.employerId) {
      try {
        const docRef = doc(db, 'employers', employeeInfo.employerId, 'tasks', taskId)
        await updateDoc(docRef, { status: 'in-progress' })
      } catch (err) {
        console.error('Error starting task:', err)
        alert('Failed to start task in database.')
      }
    } else {
      // Local fallback
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'in-progress' } : t))
    }
  }

  // Open complete modal
  const openCompleteModal = (taskId: string) => {
    setActiveTaskId(taskId)
    setAccomplishmentNotes('')
    setIsCompleteModalOpen(true)
  }

  // Handle task completion submit
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTaskId) return
    if (!accomplishmentNotes.trim()) {
      alert('Please fill in what you have completed.')
      return
    }

    setSubmittingReport(true)

    const updatePayload = {
      status: 'completed',
      completionNotes: accomplishmentNotes,
      completedAt: new Date().toISOString()
    }

    if (employeeInfo?.employerId) {
      try {
        const docRef = doc(db, 'employers', employeeInfo.employerId, 'tasks', activeTaskId)
        await updateDoc(docRef, updatePayload)
        setIsCompleteModalOpen(false)
        setActiveTaskId(null)
      } catch (err) {
        console.error('Error completing task:', err)
        alert('Failed to complete task in database.')
      } finally {
        setSubmittingReport(false)
      }
    } else {
      // Local fallback
      setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, ...updatePayload } : t))
      setIsCompleteModalOpen(false)
      setActiveTaskId(null)
      setSubmittingReport(false)
    }
  }

  const priorityColors = {
    low: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border border-amber-100',
    high: 'bg-rose-50 text-rose-700 border border-rose-100',
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>
      case 'in-progress':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold uppercase tracking-wider">In Progress</span>
      case 'completed':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Tasks</h1>
            <p className="text-slate-600 mt-2">Manage your goals, report progress, and submit daily task reports.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-widest self-start md:self-auto">
            <Sparkles size={12} className="text-indigo-600" /> Real-time Sync
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Tasks</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">{stats.total}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-black text-amber-600 mt-2">{stats.pending}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-black text-blue-600 mt-2">{stats.inProgress}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-2">{stats.completed}</h3>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'in-progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'bg-white border border-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-indigo-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading assignments...</p>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {filteredTasks.map((task) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className={`font-bold text-slate-800 text-lg ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex gap-2">
                    {getStatusBadge(task.status)}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${priorityColors[task.priority as 'low' | 'medium' | 'high' || 'medium']}`}>
                      {task.priority || 'medium'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">{task.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  {task.assignedBy && (
                    <>
                      <span>•</span>
                      <span>Assigned by: {task.assignedBy}</span>
                    </>
                  )}
                </div>

                {/* Accomplishment details if completed */}
                {task.status === 'completed' && task.completionNotes && (
                  <div className="mt-3 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Your Accomplishment Report</p>
                    <p className="text-xs text-emerald-900 leading-relaxed font-semibold">"{task.completionNotes}"</p>
                    {task.completedAt && (
                      <p className="text-[9px] text-emerald-600 mt-2 font-bold uppercase tracking-wider">
                        Submitted at: {new Date(task.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {task.status !== 'completed' && (
                <div className="flex items-center gap-3 self-end md:self-auto border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 w-full md:w-auto justify-end">
                  {task.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startTask(task.id)}
                      className="px-4 py-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Play size={14} /> Start Working
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openCompleteModal(task.id)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 hover:shadow-lg hover:shadow-emerald-100 transition-all"
                  >
                    <CheckCircle2 size={14} /> Complete Task
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
              <p className="text-slate-500 font-medium">No tasks found in this status category.</p>
            </div>
          )}
        </div>
      )}

      {/* Completion Notes Popup Drawer Modal */}
      <AnimatePresence>
        {isCompleteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-left z-10 overflow-hidden border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Task Execution Report</h2>
                    <p className="text-xs text-slate-500 font-medium">Submit details of what you've done today</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCompleteSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                    What did you accomplish today?
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={accomplishmentNotes}
                    onChange={(e) => setAccomplishmentNotes(e.target.value)}
                    placeholder="Describe specific achievements, changes, deliverables, or updates..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 text-sm font-medium transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCompleteModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {submittingReport ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    Submit Report & Complete
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
