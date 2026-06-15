'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Plus, Trash2, Search, Sparkles, BookOpen, Loader2, Calendar } from 'lucide-react'
import { collection, query, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
  general: 'bg-blue-50 text-blue-700 border border-blue-100',
  lead: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  task: 'bg-purple-50 text-purple-700 border border-purple-100',
  meeting: 'bg-orange-50 text-orange-700 border border-orange-100',
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' as const })
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)

  useEffect(() => {
    const loggedInStr = localStorage.getItem('loggedInEmployee')
    if (loggedInStr) {
      try {
        const emp = JSON.parse(loggedInStr)
        setEmployeeInfo(emp)

        if (emp.employerId && emp.id) {
          const notesRef = collection(db, 'employers', emp.employerId, 'employees', emp.id, 'notes')
          
          const unsubscribe = onSnapshot(notesRef, (snapshot) => {
            const list: Note[] = []
            snapshot.forEach((docSnap) => {
              const data = docSnap.data()
              list.push({
                id: docSnap.id,
                title: data.title || '',
                content: data.content || '',
                date: data.date || '',
                category: data.category || 'general'
              })
            })
            // Sort by date desc
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            setNotes(list)
            setLoading(false)
          }, (error) => {
            console.error('Error fetching employee notes:', error)
            setLoading(false)
          })

          return () => unsubscribe()
        }
      } catch (err) {
        console.error('Error parsing employee info in notes:', err)
        setLoading(false)
      }
    } else {
      // Fallback simulation (mock notes)
      setNotes(mockNotes)
      setLoading(false)
    }
  }, [])

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in both title and content.')
      return
    }

    const payload = {
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      date: new Date().toISOString().split('T')[0],
    }

    if (employeeInfo?.employerId && employeeInfo?.id) {
      try {
        const notesRef = collection(db, 'employers', employeeInfo.employerId, 'employees', employeeInfo.id, 'notes')
        await addDoc(notesRef, payload)
        setNewNote({ title: '', content: '', category: 'general' })
        setIsCreating(false)
      } catch (err) {
        console.error('Error saving note to firestore:', err)
        alert('Failed to save note in database.')
      }
    } else {
      // Fallback local update
      const note: Note = {
        id: Date.now().toString(),
        ...payload,
      }
      setNotes([note, ...notes])
      setNewNote({ title: '', content: '', category: 'general' })
      setIsCreating(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    if (employeeInfo?.employerId && employeeInfo?.id) {
      try {
        const noteRef = doc(db, 'employers', employeeInfo.employerId, 'employees', employeeInfo.id, 'notes', id)
        await deleteDoc(noteRef)
      } catch (err) {
        console.error('Error deleting note from firestore:', err)
        alert('Failed to delete note.')
      }
    } else {
      // Fallback local delete
      setNotes(notes.filter((note) => note.id !== id))
    }
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Personal Notes</h1>
            <p className="text-slate-600 mt-2">Log tasks, meeting conclusions, checklist records, or reminder notes.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-widest self-start md:self-auto">
              <Sparkles size={12} className="text-indigo-600" /> Database Synced
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={16} />
              New Note
            </motion.button>
          </div>
        </div>
      </div>

      {/* Create Note Dialog Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-left z-10 border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Create New Note</h2>
                    <p className="text-xs text-slate-500 font-medium">Record meetings or daily insights</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Note title..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Content</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Write your note details here..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-white transition-all"
                  >
                    <option value="general">General</option>
                    <option value="lead">Lead</option>
                    <option value="task">Task</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNote}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold hover:shadow-lg transition-all text-sm"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="mb-8 text-left">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-indigo-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading notes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredNotes.map((note, idx) => (
            <motion.div
              layout
              key={note.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${categoryColors[note.category]}`}>
                    {note.category}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{note.title}</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
              <div className="flex items-center gap-1.5 border-t border-slate-50 pt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Calendar size={12} />
                <span>{new Date(note.date).toLocaleDateString('en-IN')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNotes.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-semibold">No notes found. Create a new note to start tracking insights!</p>
        </div>
      )}
    </DashboardLayout>
  )
}
