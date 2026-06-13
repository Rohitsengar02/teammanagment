'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { mockTasks } from '@/lib/mock-data'
import { Plus, Filter, CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'

export default function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  }

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
            <p className="text-slate-600 mt-2">{filteredTasks.length} tasks to manage</p>
          </div>
          <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg">
            <Plus size={18} />
            <span className="text-sm font-medium">New Task</span>
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {['all', 'pending', 'in-progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg'
                  : 'floating-card text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="floating-card p-4 rounded-xl flex items-start gap-4 hover:border-indigo-500/50 transition-all"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
            >
              {task.status === 'completed' ? (
                <CheckCircle2 size={24} className="text-green-600" />
              ) : (
                <Circle size={24} />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {task.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{task.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span>Due: {task.dueDate}</span>
                <span>•</span>
                <span>Assigned to: {task.assignee}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
