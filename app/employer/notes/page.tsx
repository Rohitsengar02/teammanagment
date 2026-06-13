'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Plus, Trash2, Search } from 'lucide-react'
import { useState } from 'react'

interface Note {
  id: string
  title: string
  content: string
  date: string
  category: 'hr' | 'performance' | 'compliance' | 'general'
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Q2 Performance Review Schedule',
    content: 'Schedule reviews for all employees next month. Amit - 7th, Neha - 8th, Vikram - 9th.',
    date: '2026-06-12',
    category: 'performance',
  },
  {
    id: '2',
    title: 'New Compliance Requirements',
    content: 'Update employee handbook with new data protection policies. Deadline: June 30.',
    date: '2026-06-11',
    category: 'compliance',
  },
  {
    id: '3',
    title: 'Team Building Event',
    content: 'Plan quarterly team outing for July. Budget: ₹50,000. Include all departments.',
    date: '2026-06-10',
    category: 'general',
  },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' as const })

  const filteredNotes = notes.filter(
    (note) => note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase())
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

  const categoryColors = {
    hr: 'bg-blue-100 text-blue-700',
    performance: 'bg-purple-100 text-purple-700',
    compliance: 'bg-red-100 text-red-700',
    general: 'bg-slate-100 text-slate-700',
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Notes</h1>
          <p className="text-slate-600">Keep important HR and management notes</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Note
        </motion.button>
      </div>

      {isCreating && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Create Note</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <textarea
              placeholder="Content..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
            />
            <select
              value={newNote.category}
              onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="hr">HR</option>
              <option value="performance">Performance</option>
              <option value="compliance">Compliance</option>
              <option value="general">General</option>
            </select>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleCreateNote}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                Save
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setIsCreating(false)} className="px-6 py-2 rounded-lg bg-slate-200 text-slate-900 font-medium hover:bg-slate-300">
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note, idx) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[note.category]}`}>
                {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{note.title}</h3>
            <p className="text-sm text-slate-600 mb-4 line-clamp-3">{note.content}</p>
            <p className="text-xs text-slate-500">{new Date(note.date).toLocaleDateString()}</p>
          </motion.div>
        ))}
      </div>
    </EmployerLayout>
  )
}
