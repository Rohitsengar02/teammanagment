'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Search, Loader2, AlertTriangle, X, Check, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' as const })

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null

  // Fetch Notes
  const fetchNotes = async () => {
    setLoading(true)
    if (!employerId) {
      setNotes(mockNotes)
      setLoading(false)
      return
    }

    try {
      const notesSnap = await getDocs(collection(db, 'employers', employerId, 'notes'))
      let notesList: Note[] = []
      notesSnap.forEach((doc) => {
        notesList.push({ id: doc.id, ...doc.data() } as Note)
      })

      // Seed if empty
      if (notesList.length === 0) {
        const seededList: Note[] = []
        for (const n of mockNotes) {
          const docRef = await addDoc(collection(db, 'employers', employerId, 'notes'), {
            title: n.title,
            content: n.content,
            category: n.category,
            date: n.date,
          })
          seededList.push({ ...n, id: docRef.id })
        }
        notesList = seededList
      }

      // Sort by date descending
      notesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setNotes(notesList)
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.title.trim() || !newNote.content.trim()) return

    setSaving(true)
    const noteData = {
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      date: new Date().toISOString().split('T')[0],
    }

    if (!employerId) {
      // Offline Simulation
      const offlineNote = { id: `mock-${Date.now()}`, ...noteData }
      setNotes((prev) => [offlineNote, ...prev])
      setNewNote({ title: '', content: '', category: 'general' })
      setIsCreating(false)
      setSaving(false)
      return
    }

    try {
      await addDoc(collection(db, 'employers', employerId, 'notes'), noteData)
      await fetchNotes()
      setNewNote({ title: '', content: '', category: 'general' })
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating note:', error)
      alert('Failed to save note.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    if (!employerId) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      return
    }

    try {
      const docRef = doc(db, 'employers', employerId, 'notes', noteId)
      await deleteDoc(docRef)
      await fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note.')
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categoryColors = {
    hr: 'bg-blue-50 text-blue-700 border-blue-100',
    performance: 'bg-purple-50 text-purple-700 border-purple-100',
    compliance: 'bg-rose-50 text-rose-700 border-rose-100',
    general: 'bg-slate-50 text-slate-700 border-slate-100',
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Notes</h1>
          <p className="text-slate-600 font-medium">Create and manage internal HR, policy, and management files.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreating(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg flex items-center justify-center gap-2 text-sm shadow-md w-fit"
        >
          <Plus size={18} />
          Create Note
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="mb-8 relative text-left">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search notes by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all shadow-sm"
        />
      </div>

      {/* Main View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading HR notes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredNotes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 absolute top-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${categoryColors[note.category]}`}>
                    {note.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                    title="Delete Note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-2 leading-snug">{note.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 whitespace-pre-wrap">{note.content}</p>
              </div>

              <div className="border-t border-slate-50 pt-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <FileText size={12} className="text-slate-400" />
                <span>Saved on {new Date(note.date).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <AlertTriangle className="text-slate-400 mx-auto mb-3" size={36} />
              <p className="text-slate-500 text-sm font-semibold">No notes match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Note Slide-over or Popup Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-left"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-purple-50/10 to-pink-50/10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Add Management Note</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Keep track of team updates and checklists.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateNote} className="p-6 space-y-4">
                {/* Note Title */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Note Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 Hiring Deadlines"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-850 text-sm font-semibold bg-white transition-all"
                  >
                    <option value="hr">HR & Operations</option>
                    <option value="performance">Performance & Review</option>
                    <option value="compliance">Compliance & Law</option>
                    <option value="general">General Note</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Note Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type details, guidelines, or checklists here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all resize-none"
                  />
                </div>

                {/* Submit buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-md"
                  >
                    {saving && <Loader2 className="animate-spin" size={14} />}
                    Save Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </EmployerLayout>
  )
}
