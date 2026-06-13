'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, LogOut, Edit2, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { mockEmployers, mockAssignedTasks } from '@/lib/mock-data'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function EmployeeDashboardPage() {
  const [employee, setEmployee] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')

  useEffect(() => {
    const fetchEmployeeTasks = async () => {
      const dataStr = localStorage.getItem('loggedInEmployee')
      if (dataStr) {
        const parsed = JSON.parse(dataStr)
        setEmployee(parsed)

        const employerId = parsed.employerId
        if (employerId && employerId !== 'mock-employer-id') {
          try {
            const q = query(
              collection(db, 'employers', employerId, 'tasks'),
              where('assignedTo', '==', parsed.id)
            )
            const querySnapshot = await getDocs(q)
            const list: any[] = []
            querySnapshot.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() })
            })
            setTasks(list)
          } catch (error) {
            console.error('Error fetching tasks from Firestore:', error)
            setTasks([])
          }
        } else {
          setTasks([])
        }
      } else {
        setEmployee(mockEmployers[0].employees[0])
        setTasks([])
      }
      setLoading(false)
    }
    fetchEmployeeTasks()
  }, [])

  if (loading || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
        <p className="text-slate-500 font-semibold text-sm">Loading dashboard...</p>
      </div>
    )
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length

  const handleCompleteTask = async (taskId: string) => {
    if (completionNotes.trim()) {
      const taskObj = tasks.find(t => t.id === taskId)
      if (taskObj && employee?.employerId && employee.employerId !== 'mock-employer-id') {
        try {
          const docRef = doc(db, 'employers', employee.employerId, 'tasks', taskId)
          await updateDoc(docRef, {
            status: 'completed',
            completionNotes: completionNotes,
            completedAt: new Date().toISOString()
          })
        } catch (error) {
          console.error('Error updating task in Firestore:', error)
        }
      }

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: 'completed' as const, completionNotes }
            : t
        )
      )
      setCompletingTaskId(null)
      setCompletionNotes('')
    }
  }

  const handleStartTask = async (taskId: string) => {
    const taskObj = tasks.find(t => t.id === taskId)
    if (taskObj && employee?.employerId && employee.employerId !== 'mock-employer-id') {
      try {
        const docRef = doc(db, 'employers', employee.employerId, 'tasks', taskId)
        await updateDoc(docRef, {
          status: 'in-progress'
        })
      } catch (error) {
        console.error('Error starting task in Firestore:', error)
      }
    }

    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'in-progress' as const }
          : t
      )
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold">{employee.name}</h1>
            <p className="text-blue-100 mt-1">{employee.department} Department</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <p className="text-slate-600 text-sm mb-2">Total Tasks</p>
            <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <p className="text-slate-600 text-sm mb-2">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{pendingTasks}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <p className="text-slate-600 text-sm mb-2">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <p className="text-slate-600 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
          </motion.div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Assigned Tasks</h2>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
                        ) : (
                          <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
                        )}
                        <h3 className="font-semibold text-slate-900 text-lg">{task.title}</h3>
                      </div>
                      <p className="text-slate-600 mt-2">{task.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {task.status === 'completed' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>

                  {/* Task Details */}
                  <div className="flex items-center gap-6 text-sm text-slate-600 mb-4 flex-wrap">
                    <span>
                      Due: <span className="font-semibold text-slate-900">{task.dueDate}</span>
                    </span>
                    <span>
                      Priority:{' '}
                      <span
                        className={`font-semibold ${
                          task.priority === 'high'
                            ? 'text-red-600'
                            : task.priority === 'medium'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </span>
                    <span>
                      Assigned by: <span className="font-semibold text-slate-900">{task.assignedBy}</span>
                    </span>
                  </div>

                  {/* Completion Notes */}
                  {task.status === 'completed' && task.completionNotes && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-4">
                      <p className="text-sm font-semibold text-green-900 mb-1">Your Completion Notes:</p>
                      <p className="text-sm text-green-800">{task.completionNotes}</p>
                    </div>
                  )}

                  {/* Task Actions */}
                  {completingTaskId === task.id ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          What did you accomplish?
                        </label>
                        <textarea
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="Describe what you completed and any notes..."
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 size={18} />
                          Mark Complete
                        </button>
                        <button
                          onClick={() => {
                            setCompletingTaskId(null)
                            setCompletionNotes('')
                          }}
                          className="px-6 py-2 rounded-lg bg-slate-300 text-slate-900 font-medium hover:bg-slate-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : task.status === 'completed' ? null : (
                    <div className="flex gap-3">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleStartTask(task.id)}
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                        >
                          Start Task
                        </button>
                      )}
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => setCompletingTaskId(task.id)}
                          className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 size={18} />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
