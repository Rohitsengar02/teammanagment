'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Plus, Trash2, Search } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  date: string
  category: 'general' | 'lead' | 'task' | 'meeting'
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'TechCorp India Meeting Notes',
    content: 'Discussed Q3 goals. They are interested in our enterprise package. Next call scheduled for next week.',
    date: '2026-06-12',
    category: 'meeting',
  },
  {
    id: '2',
    title: 'Follow up with Innovate Solutions',
    content: 'Need to send product demo video. Contact person is Rajesh Kumar. His email: rajesh@innovate.com',
    date: '2026-06-11',
    category: 'lead',
  },
  {
    id: '3',
    title: 'Q2 Planning Notes',
    content: 'Key objectives: Increase conversion rate by 25%, expand to 3 new markets, improve customer retention.',
    date: '2026-06-10',
    category: 'general',
  },
]

const categoryColors = {
  general: 'bg-blue-100 text-blue-700',
  lead: 'bg-green-100 text-green-700',
  task: 'bg-purple-100 text-purple-700',
  meeting: 'bg-orange-100 text-orange-700',
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' as const })

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        ...newNote,
        date: new Date().toISOString().split('T')[0],
      }
      setNotes([note, ...notes])
      setNewNote({ title: '', content: '', category: 'general' })
      setIsCreating(false)
    }
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notes</h1>
          <p className="text-slate-600 mt-2">Keep track of important notes and observations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          New Note
        </motion.button>
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="floating-card p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Note</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note here..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="general">General</option>
                <option value="lead">Lead</option>
                <option value="task">Task</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateNote}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                Save Note
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreating(false)}
                className="px-6 py-2 rounded-lg bg-slate-200 text-slate-900 font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note, idx) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="floating-card p-6 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[note.category]}`}>
                {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDeleteNote(note.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{note.title}</h3>
            <p className="text-sm text-slate-600 mb-4 line-clamp-3">{note.content}</p>
            <p className="text-xs text-slate-500">{new Date(note.date).toLocaleDateString('en-IN')}</p>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="floating-card p-12 rounded-xl text-center"
        >
          <p className="text-slate-600">No notes found. Create one to get started!</p>
        </motion.div>
      )}
    </DashboardLayout>
  )
}
