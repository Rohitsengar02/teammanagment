'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter, CheckCircle, Clock, AlertCircle, Calendar, Sparkles, X, ChevronRight, CheckCircle2, User, AlertTriangle, Loader2, Star, Trash2 } from 'lucide-react'
import { mockAssignedTasks, mockEmployers } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, deleteField, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  // Modals / Panels toggles
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  // New task form states
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [savingTask, setSavingTask] = useState(false)

  // Review states
  const [taskRating, setTaskRating] = useState(5)
  const [reviewFeedback, setReviewFeedback] = useState('')

  useEffect(() => {
    if (selectedTask) {
      setTaskRating(selectedTask.rating !== undefined ? selectedTask.rating : 5)
      setReviewFeedback(selectedTask.reviewFeedback || '')
    } else {
      setReviewFeedback('')
      setTaskRating(5)
    }
  }, [selectedTask])

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null

  // Fetch tasks and employees with real-time sync
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const init = async () => {
      setLoading(true)
      const currentEmployerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null
      if (!currentEmployerId) {
        setTasks([])
        setEmployees(mockEmployers[0].employees)
        setLoading(false)
        return
      }

      try {
        // Fetch Employees once
        const empSnap = await getDocs(collection(db, 'employers', currentEmployerId, 'employees'))
        const empList: any[] = []
        empSnap.forEach((doc) => {
          empList.push({ id: doc.id, ...doc.data() })
        })
        const finalEmployees = empList.length > 0 ? empList : mockEmployers[0].employees
        setEmployees(finalEmployees)
        if (finalEmployees.length > 0) {
          setAssignedTo(finalEmployees[0].id)
        }

        // Setup real-time listener for Tasks
        unsubscribe = onSnapshot(
          collection(db, 'employers', currentEmployerId, 'tasks'),
          (taskSnap) => {
            const taskList: any[] = []
            taskSnap.forEach((doc) => {
              taskList.push({ id: doc.id, ...doc.data() })
            })
            // Sort tasks desc by createdAt
            taskList.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
              return dateB - dateA
            })
            setTasks(taskList)

            // Update selectedTask details dynamically in real-time
            setSelectedTask((prev: any) => {
              if (!prev) return null
              const updated = taskList.find((t) => t.id === prev.id)
              return updated || null
            })
          },
          (error) => {
            console.error('Error fetching tasks via listener:', error)
          }
        )
      } catch (error) {
        console.error('Error fetching employees:', error)
        setEmployees(mockEmployers[0].employees)
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || !taskDesc.trim() || !assignedTo) {
      alert('Please fill in Title, Description, and select an employee.')
      return
    }

    setSavingTask(true)
    try {
      const newTask = {
        title: taskTitle,
        description: taskDesc,
        assignedTo,
        priority,
        dueDate,
        status: 'pending',
        assignedBy: 'Employer',
        createdAt: new Date().toISOString()
      }

      if (employerId) {
        const docRef = await addDoc(collection(db, 'employers', employerId, 'tasks'), newTask)
        setTasks((prev) => [{ id: docRef.id, ...newTask }, ...prev])

        // Create notification for employee
        await addDoc(collection(db, 'employers', employerId, 'employees', assignedTo, 'notifications'), {
          title: 'New Task Assigned',
          message: `You have been assigned a new task: "${taskTitle}"`,
          type: 'task',
          read: false,
          createdAt: new Date().toISOString()
        })
      } else {
        // simulation fallback
        setTasks((prev) => [{ id: `mock-${Date.now()}`, ...newTask }, ...prev])
      }

      // Reset form
      setTaskTitle('')
      setTaskDesc('')
      setIsAssigning(false)
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setSavingTask(false)
    }
  }

  const handleSaveReview = async (taskId: string) => {
    if (!employerId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, rating: taskRating, reviewFeedback } : t))
      )
      setSelectedTask((prev: any) => (prev ? { ...prev, rating: taskRating, reviewFeedback } : null))
      return
    }
    try {
      const docRef = doc(db, 'employers', employerId, 'tasks', taskId)
      await updateDoc(docRef, {
        rating: taskRating,
        reviewFeedback: reviewFeedback
      })
      
      // Save in the 'reviews' subcollection
      await addDoc(collection(db, 'employers', employerId, 'tasks', taskId, 'reviews'), {
        rating: taskRating,
        reviewFeedback: reviewFeedback,
        createdAt: new Date().toISOString()
      })

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, rating: taskRating, reviewFeedback } : t))
      )
      setSelectedTask((prev: any) => (prev ? { ...prev, rating: taskRating, reviewFeedback } : null))
    } catch (error) {
      console.error('Error saving task rating:', error)
      alert('Failed to save task review in database.')
    }
  }

  const handleDeleteReview = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    if (!employerId) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const copy = { ...t }
            delete copy.rating
            delete copy.reviewFeedback
            return copy
          }
          return t
        })
      )
      setSelectedTask((prev: any) => {
        if (!prev) return null
        const copy = { ...prev }
        delete copy.rating
        delete copy.reviewFeedback
        return copy
      })
      return
    }

    try {
      const docRef = doc(db, 'employers', employerId, 'tasks', taskId)
      await updateDoc(docRef, {
        rating: deleteField(),
        reviewFeedback: deleteField()
      })

      const reviewsRef = collection(db, 'employers', employerId, 'tasks', taskId, 'reviews')
      const reviewsSnap = await getDocs(reviewsRef)
      const deletePromises = reviewsSnap.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const copy = { ...t }
            delete copy.rating
            delete copy.reviewFeedback
            return copy
          }
          return t
        })
      )
      setSelectedTask((prev: any) => {
        if (!prev) return null
        const copy = { ...prev }
        delete copy.rating
        delete copy.reviewFeedback
        return copy
      })
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review in database.')
    }
  }


  const filteredTasks = tasks.filter((task) => filterStatus === 'all' || task.status === filterStatus)

  const stats = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="text-orange-500" size={20} />
      case 'in-progress':
        return <Clock className="text-blue-500" size={20} />
      case 'completed':
        return <CheckCircle className="text-emerald-500" size={20} />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-50 text-orange-700 border border-orange-100'
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border border-blue-100'
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-100'
    }
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Tasks</h1>
          <p className="text-slate-600">Assign specific goals, monitor execution pipelines, and review employee reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full border border-purple-100 text-[10px] font-black text-purple-700 uppercase tracking-widest">
            <Sparkles size={12} className="text-purple-600" /> Interactive Logs
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAssigning(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg flex items-center gap-2 text-sm shadow-md"
          >
            <Plus size={18} />
            Assign Task
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</p>
          <h3 className="text-3xl font-black text-orange-600 mt-2">{stats.pending}</h3>
          <p className="text-xs text-slate-500 mt-1">Awaiting actions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">In Progress</p>
          <h3 className="text-3xl font-black text-blue-600 mt-2">{stats.inProgress}</h3>
          <p className="text-xs text-slate-500 mt-1">Currently active</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">{stats.completed}</h3>
          <p className="text-xs text-slate-500 mt-1">Resolved tasks</p>
        </motion.div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 text-left">
        {['all', 'pending', 'in-progress', 'completed'].map((status) => {
          const isActive = filterStatus === status
          return (
            <motion.button
              key={status}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                  : 'bg-white border border-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </motion.button>
          )
        })}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading assignments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {filteredTasks.map((task, idx) => {
            const assignee = employees.find((e) => e.id === task.assignedTo)
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedTask(task)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        {getStatusIcon(task.status)}
                      </div>
                      <h3 className="font-bold text-slate-800 text-base line-clamp-1">{task.title}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{task.description}</p>
                </div>

                <div className="border-t border-slate-50 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                      {(assignee?.name || 'E').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-600 font-semibold">{assignee?.name || 'Assigned'}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </motion.div>
            )
          })}

          {filteredTasks.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-12 text-center">
              <p className="text-slate-500 font-medium">No tasks found in this status category.</p>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Form Panel: Assign Task */}
      <AnimatePresence>
        {isAssigning && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssigning(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between p-8 text-left z-10"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="text-purple-600" size={20} />
                    <h2 className="text-xl font-black text-slate-900">Assign New Task</h2>
                  </div>
                  <button onClick={() => setIsAssigning(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAssignTask} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Task Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Update Pipeline Dashboard"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Provide specific notes and resources for execution..."
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Assign To</label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium bg-white transition-all"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({(emp.department || 'sales').toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium bg-white transition-all"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="border-t border-slate-100 pt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTask}
                  disabled={savingTask}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {savingTask && <Loader2 className="animate-spin" size={16} />}
                  Save Assignment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Panel: Task Details / What is Done */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between p-8 text-left z-10"
            >
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="text-purple-600" size={22} />
                    <h2 className="text-xl font-black text-slate-900">Task Detail View</h2>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl flex items-center gap-3 ${getStatusColor(selectedTask.status)}`}>
                    {getStatusIcon(selectedTask.status)}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">Current Status</p>
                      <p className="text-sm font-black capitalize">{selectedTask.status.replace('-', ' ')}</p>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">{selectedTask.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedTask.description}</p>
                  </div>

                  {/* Task Meta details */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Assignee</p>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-[10px]">
                          {((employees.find(e => e.id === selectedTask.assignedTo)?.name) || 'E').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-700 font-semibold">
                          {(employees.find(e => e.id === selectedTask.assignedTo)?.name) || 'Assigned Employee'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Due Date</p>
                      <span className="text-xs text-slate-700 font-semibold">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Priority</p>
                      <span className="text-xs text-slate-700 font-semibold capitalize">{selectedTask.priority}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Assigned By</p>
                      <span className="text-xs text-slate-700 font-semibold">{selectedTask.assignedBy || 'Employer'}</span>
                    </div>
                    {selectedTask.rating !== undefined && (
                      <div className="col-span-2 mt-2 bg-yellow-50/50 p-3 rounded-2xl border border-yellow-100/50">
                        <p className="text-[10px] text-yellow-800 font-black uppercase tracking-wider mb-1">Overall Rating Given</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= selectedTask.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                            />
                          ))}
                          <span className="text-xs font-bold text-yellow-700 ml-2">({selectedTask.rating} / 5)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* What is Done / Completion Notes */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Execution Report (What is Done)</p>
                    {selectedTask.status === 'completed' ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <p className="text-xs font-bold text-emerald-800 mb-1">Reported by Employee:</p>
                        <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                          {selectedTask.completionNotes || 'Task completed successfully with no additional notes.'}
                        </p>
                        {selectedTask.completedAt && (
                          <p className="text-[10px] text-emerald-700 mt-2 font-bold uppercase tracking-wider">
                            Completed at: {new Date(selectedTask.completedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : selectedTask.status === 'in-progress' ? (
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                        <Clock className="text-blue-500" size={18} />
                        <p className="text-xs font-semibold text-blue-900">
                          Employee has started working on this task. Awaiting final report.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                        <AlertTriangle className="text-slate-400" size={18} />
                        <p className="text-xs font-semibold text-slate-500">
                          Task is currently pending. Employee has not started yet.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rating & Review Feedback UI */}
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Employer Task Review</p>
                    {selectedTask.rating !== undefined ? (
                      <div className="space-y-2 bg-yellow-50/30 p-4 rounded-2xl border border-yellow-100/50 relative group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={star <= selectedTask.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                              />
                            ))}
                            <span className="text-xs font-bold text-slate-500 ml-2">({selectedTask.rating} / 5)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(selectedTask.id)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-all text-[10px] font-bold flex items-center gap-1 border border-transparent hover:border-rose-100"
                          >
                            <Trash2 size={12} /> Delete Review
                          </button>
                        </div>
                        {selectedTask.reviewFeedback && (
                          <p className="text-xs font-semibold text-slate-600 bg-white/60 p-2.5 rounded-xl border border-emerald-100/20 italic leading-relaxed">
                            "{selectedTask.reviewFeedback}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= taskRating
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setTaskRating(star)}
                                className="p-0.5 transition-all hover:scale-110"
                              >
                                <Star
                                  size={22}
                                  className={isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                                />
                              </button>
                            )
                          })}
                        </div>
                        <div>
                          <textarea
                            rows={2}
                            value={reviewFeedback}
                            onChange={(e) => setReviewFeedback(e.target.value)}
                            placeholder="Add review feedback for this task..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-xs font-medium bg-white transition-all resize-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveReview(selectedTask.id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xs hover:shadow-md transition-shadow"
                        >
                          Submit Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:shadow-lg transition-all text-center text-sm"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </EmployerLayout>
  )
}
