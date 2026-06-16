'use client'

import { useState, useEffect } from 'react'
import { CollaborationLayout } from '@/components/collaboration-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layers, 
  Plus, 
  X, 
  FolderKanban, 
  Users, 
  Info,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockEmployers } from '@/lib/mock-data'

interface Workspace {
  id: string
  name: string
  description: string
  members: string[]
  createdAt: string
}

export default function WorkspacesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [employerId, setEmployerId] = useState<string | null>(null)
  const [isEmployer, setIsEmployer] = useState(false)

  // Workspaces Data
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Create Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  // 1. Resolve User Session
  useEffect(() => {
    const employerSessionId = localStorage.getItem('registeredEmployerId')
    const employeeSessionStr = localStorage.getItem('loggedInEmployee')

    if (employeeSessionStr) {
      try {
        const emp = JSON.parse(employeeSessionStr)
        setCurrentUser({
          id: emp.id,
          name: emp.name,
          role: emp.role || 'employee'
        })
        setEmployerId(emp.employerId)
        setIsEmployer(false)
      } catch (e) {
        console.error(e)
      }
    } else if (employerSessionId) {
      setCurrentUser({
        id: employerSessionId,
        name: 'Employer Admin',
        role: 'employer'
      })
      setEmployerId(employerSessionId)
      setIsEmployer(true)
    } else {
      setCurrentUser({
        id: 'mock-user-id',
        name: 'Demo Guest',
        role: 'sales-executive'
      })
      setEmployerId('mock-employer-id')
      setIsEmployer(false)
    }
  }, [])

  // 2. Fetch Employees for assignment selection
  useEffect(() => {
    if (!employerId) return
    const fetchEmployees = async () => {
      try {
        if (employerId === 'mock-employer-id') {
          setEmployeesList(mockEmployers[0].employees)
          return
        }
        const querySnapshot = await getDocs(collection(db, 'employers', employerId, 'employees'))
        const list: any[] = []
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() })
        })
        setEmployeesList(list)
      } catch (err) {
        console.error('Error fetching employees for workspace setup:', err)
        setEmployeesList(mockEmployers[0].employees)
      }
    }
    fetchEmployees()
  }, [employerId])

  // 3. Sync Workspaces in Real-Time
  useEffect(() => {
    if (!employerId) return
    setLoading(true)

    const workspacesRef = collection(db, 'employers', employerId, 'workspaces')
    const q = query(workspacesRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Workspace[] = []
      snapshot.forEach((docSnap) => {
        const wsData = { id: docSnap.id, ...docSnap.data() } as Workspace
        if (!isEmployer && currentUser) {
          if (wsData.members && wsData.members.includes(currentUser.id)) {
            list.push(wsData)
          }
        } else {
          list.push(wsData)
        }
      })
      setWorkspaces(list)
      setLoading(false)
    }, (error) => {
      console.error('Error synchronizing workspaces:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [employerId, isEmployer, currentUser])

  // 4. Create Workspace Action
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !employerId) return

    const membersList = [...selectedMembers]
    if (!isEmployer && currentUser && !membersList.includes(currentUser.id)) {
      membersList.push(currentUser.id)
    }

    try {
      await addDoc(collection(db, 'employers', employerId, 'workspaces'), {
        name,
        description,
        members: membersList,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || 'unknown'
      })

      // Reset Form
      setName('')
      setDescription('')
      setSelectedMembers([])
      setShowCreateModal(false)
    } catch (err) {
      console.error('Error writing workspace:', err)
    }
  }

  const toggleMemberSelection = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(prev => prev.filter(m => m !== id))
    } else {
      setSelectedMembers(prev => [...prev, id])
    }
  }

  return (
    <CollaborationLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Workspaces</h1>
          <p className="text-slate-600 font-medium">Create isolated task hubs, milestones, and project notebooks for your departments.</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all text-sm shadow-md"
        >
          <Plus size={16} />
          Create Workspace
        </motion.button>
      </div>

      {/* Info warning for employees */}
      {!isEmployer && (
        <div className="mb-6 p-4 bg-purple-50/50 border border-purple-100 rounded-3xl text-left flex items-start gap-3">
          <Info className="text-purple-600 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider mb-1">Collaborative Project Hubs</h4>
            <p className="text-xs text-purple-800 leading-relaxed font-semibold">
              You are viewing workspaces you have been assigned to. Contact your employer to join new workspaces or departments.
            </p>
          </div>
        </div>
      )}

      {/* Workspaces List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Layers className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Syncing workspaces...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {workspaces.map((ws) => (
            <motion.div
              layout
              key={ws.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                    <FolderKanban size={20} />
                  </div>
                  <span className="text-[10px] bg-purple-100/50 text-purple-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <Users size={12} /> {ws.members ? ws.members.length : 0} members
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{ws.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Created: {new Date(ws.createdAt).toLocaleDateString()}</p>
                </div>

                {ws.description && (
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold line-clamp-3">{ws.description}</p>
                )}
              </div>

              <div className="p-6 pt-0 mt-2">
                <Link href={`/workspaces/${ws.id}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors">
                  Open Workspace
                  <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}

          {workspaces.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <Layers className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 font-semibold">No active workspaces found.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 p-8 shadow-2xl relative z-10 w-full max-w-lg text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="text-purple-600" size={22} />
                  Create Project Workspace
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Workspace Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Q3 Product Roadmap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    placeholder="Provide details about the target milestones and scope of work..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold resize-none"
                  />
                </div>

                {/* Team Assignment checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Assign Team Members</label>
                  <div className="border border-slate-200 rounded-2xl max-h-40 overflow-y-auto p-3 space-y-2.5">
                    {employeesList.map((emp) => {
                      const selected = selectedMembers.includes(emp.id)
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleMemberSelection(emp.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all border ${
                            selected 
                              ? 'border-purple-500 bg-purple-50/50 text-purple-700' 
                              : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                              {(emp.name || 'E').charAt(0).toUpperCase()}
                            </div>
                            {emp.name}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">{emp.role}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all text-xs"
                  >
                    Create Workspace
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CollaborationLayout>
  )
}
