'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Sparkles, Loader2, Award, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { mockEmployers } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function PerformancePage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true)
      if (!employerId) {
        setEmployees(mockEmployers[0].employees)
        setLoading(false)
        return
      }

      try {
        // Fetch employees
        const empSnap = await getDocs(collection(db, 'employers', employerId, 'employees'))
        const empList: any[] = []
        empSnap.forEach((doc) => {
          empList.push({ id: doc.id, ...doc.data() })
        })
        const finalEmployees = empList.length > 0 ? empList : mockEmployers[0].employees
        setEmployees(finalEmployees)

        // Fetch Tasks
        const taskSnap = await getDocs(collection(db, 'employers', employerId, 'tasks'))
        const taskList: any[] = []
        taskSnap.forEach((doc) => {
          taskList.push({ id: doc.id, ...doc.data() })
        })
        setTasks(taskList)
      } catch (error) {
        console.error('Error fetching performance metrics:', error)
        setEmployees(mockEmployers[0].employees)
      } finally {
        setLoading(false)
      }
    }
    fetchPerformanceData()
  }, [])

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
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review in database.')
    }
  }

  // Calculate overall statistics
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const ratedTasks = tasks.filter(t => t.rating !== undefined)
  const globalAvgRating = ratedTasks.length > 0
    ? (ratedTasks.reduce((sum, t) => sum + t.rating, 0) / ratedTasks.length).toFixed(1)
    : '0.0'

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Performance Reviews</h1>
          <p className="text-slate-600">Track and calculate dynamic ratings based on completed employee tasks.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full border border-purple-100 text-[10px] font-black text-purple-700 uppercase tracking-widest w-fit">
          <Sparkles size={12} className="text-purple-600" /> Auto-Generated Stats
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Average Workspace Rating</p>
            <div className="flex items-end gap-3 mt-3">
              <h3 className="text-4xl font-black text-yellow-500">{globalAvgRating}</h3>
              <p className="text-xs text-slate-400 font-bold mb-1">out of 5.0</p>
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= Math.round(Number(globalAvgRating))
              return (
                <Star key={star} size={20} className={isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Evaluated Tasks</p>
            <h3 className="text-4xl font-black text-purple-600 mt-3">{ratedTasks.length}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="text-emerald-500" size={16} /> Rated out of {completedTasks.length} completed tasks.
          </p>
        </motion.div>
      </div>

      {/* Performance Reviews List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Calculating performance metrics...</p>
        </div>
      ) : (
        <div className="space-y-6 text-left">
          <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-3">Team Performance Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employees.map((emp, idx) => {
              // Calculate specific employee performance
              const empTasks = tasks.filter(t => t.assignedTo === emp.id)
              const empCompleted = empTasks.filter(t => t.status === 'completed')
              const empRated = empTasks.filter(t => t.rating !== undefined)
              const empAvgRating = empRated.length > 0
                ? (empRated.reduce((sum, t) => sum + t.rating, 0) / empRated.length).toFixed(1)
                : '0.0'

              return (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 absolute top-0 left-0 right-0" />

                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">{emp.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{(emp.role || 'Sales').replace('-', ' ')}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= Math.round(Number(empAvgRating))
                            return (
                              <Star key={star} size={14} className={isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                            )
                          })}
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">{empAvgRating} / 5.0 Avg Rating</p>
                      </div>
                    </div>

                    {/* Progress Bar representation */}
                    <div className="space-y-1.5 mt-6">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Task Accomplishment</span>
                        <span className="text-purple-600">{empCompleted.length} / {empTasks.length} Done</span>
                      </div>
                      <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: empTasks.length > 0 ? `${(empCompleted.length / empTasks.length) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Award size={15} className="text-purple-500" />
                      <span>{empRated.length} rated tasks</span>
                    </div>
                    {Number(empAvgRating) >= 4.0 ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Top Performer
                      </span>
                    ) : Number(empAvgRating) > 0 ? (
                      <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Active Contributor
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Pending Reviews
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Individual Task Reviews List */}
          <div className="mt-12 space-y-6">
            <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-3">Recent Task Reviews & Feedback</h2>
            <div className="grid grid-cols-1 gap-4">
              {ratedTasks.map((task, idx) => {
                const assignee = employees.find((e) => e.id === task.assignedTo)
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                          {task.title}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          Completed by {assignee?.name || 'Employee'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 italic">
                        "{task.reviewFeedback || 'No written feedback was provided.'}"
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end flex-shrink-0">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= task.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                        Reviewed on {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(task.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all text-[10px] font-bold flex items-center gap-1 mt-2 border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={11} /> Delete Review
                      </button>
                    </div>
                  </motion.div>
                )
              })}

              {ratedTasks.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
                  <p className="text-slate-500 text-sm font-medium">No tasks have been rated or reviewed yet by the employer.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </EmployerLayout>
  )
}
