'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, GitBranch, CheckCircle2, AlertCircle, LogOut } from 'lucide-react'
import Link from 'next/link'

interface TechTask {
  id: string
  title: string
  description: string
  type: 'feature' | 'bugfix' | 'refactor'
  status: 'todo' | 'in-progress' | 'review' | 'done'
  assignee: string
  dueDate: string
  branch?: string
}

const mockTechTasks: TechTask[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication to API',
    type: 'feature',
    status: 'in-progress',
    assignee: 'Neha Sharma',
    dueDate: '2026-06-20',
    branch: 'feature/auth-system',
  },
  {
    id: '2',
    title: 'Fix database connection pooling',
    description: 'Resolve connection timeout issues in production',
    type: 'bugfix',
    status: 'review',
    assignee: 'Neha Sharma',
    dueDate: '2026-06-18',
    branch: 'fix/connection-pool',
  },
  {
    id: '3',
    title: 'Refactor API endpoint handlers',
    description: 'Clean up and optimize request handling code',
    type: 'refactor',
    status: 'todo',
    assignee: 'Neha Sharma',
    dueDate: '2026-06-25',
  },
  {
    id: '4',
    title: 'Add unit tests for service layer',
    description: 'Improve code coverage for business logic',
    type: 'feature',
    status: 'done',
    assignee: 'Neha Sharma',
    dueDate: '2026-06-12',
  },
]

const typeColors = {
  feature: 'bg-blue-100 text-blue-700',
  bugfix: 'bg-red-100 text-red-700',
  refactor: 'bg-purple-100 text-purple-700',
}

const statusColors = {
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  review: 'bg-cyan-100 text-cyan-700',
  done: 'bg-green-100 text-green-700',
}

export default function TechDashboardPage() {
  const [tasks, setTasks] = useState<TechTask[]>(mockTechTasks)
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'done'>('all')

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 size={32} />
            <div>
              <h1 className="text-3xl font-bold">Tech Development Hub</h1>
              <p className="text-emerald-100 mt-1">Project management & code collaboration</p>
            </div>
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
      <main className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm mb-2">Total Tasks</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm mb-2">To Do</p>
            <p className="text-3xl font-bold text-slate-900">{stats.todo}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm mb-2">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm mb-2">Review</p>
            <p className="text-3xl font-bold text-cyan-600">{tasks.filter((t) => t.status === 'review').length}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.done}</p>
          </motion.div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Development Tasks</h2>

          {/* Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'todo', 'in-progress', 'review', 'done'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === f
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                    : 'border border-slate-300 text-slate-700 hover:text-slate-900'
                }`}
              >
                {f.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-slate-200 rounded-lg p-5 hover:border-emerald-300 transition-colors"
              >
                {/* Type Badge */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[task.type]}`}>
                    {task.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[task.status]}`}>
                    {task.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-slate-900 mb-2">{task.title}</h3>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4">{task.description}</p>

                {/* Branch */}
                {task.branch && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <GitBranch size={14} />
                    <code className="bg-slate-100 px-2 py-1 rounded">{task.branch}</code>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-200">
                  <span>{task.assignee}</span>
                  <span>{task.dueDate}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No tasks in this status</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
