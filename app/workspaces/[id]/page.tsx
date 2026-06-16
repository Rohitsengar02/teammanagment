'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CollaborationLayout } from '@/components/collaboration-layout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  ArrowLeft,
  ClipboardList,
  FileText,
  Users,
  Plus,
  CheckCircle2,
  Save,
  FileEdit,
  Clock,
  Briefcase,
  Trash2,
  FileImage,
  BookOpen,
  MousePointer,
  BarChart2,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Upload,
  Hand,
  Highlighter,
  Eraser,
  Pencil,
  StickyNote,
  Type,
  Network,
  GitBranch,
  Shapes,
  Circle,
  Square,
  Triangle
} from 'lucide-react'
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs,
  arrayUnion
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockEmployers } from '@/lib/mock-data'
import Link from 'next/link'

interface Workspace {
  id: string
  name: string
  description: string
  members: string[]
  createdAt: string
  milestones?: string[]
  scratchpad?: string
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string

  // User Profile
  const [employerId, setEmployerId] = useState<string | null>(null)

  // Workspace Data
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [allEmployees, setAllEmployees] = useState<any[]>([])
  const [allTasks, setAllTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Tabs: 'overview' | 'board' | 'docs' | 'whiteboard' | 'members'
  const [activeTab, setActiveTab] = useState<'overview' | 'board' | 'docs' | 'whiteboard' | 'members'>('overview')

  // Edit / Input States
  const [newMilestone, setNewMilestone] = useState('')

  // 1. Notion Docs Tab States
  const [docsList, setDocsList] = useState<any[]>([
    { id: 'doc1', title: 'Workspace Guidelines', content: 'Use the Outfit font. GlowAI brand styling applies to all components.' },
    { id: 'doc2', title: 'API Integrations SOP', content: 'Database records store channels and chat details.' }
  ])
  const [selectedDocId, setSelectedDocId] = useState('doc1')
  const [docContentDraft, setDocContentDraft] = useState('')

  // 2. Miro Whiteboard Tab States
  const [whiteboardTool, setWhiteboardTool] = useState<string>('select')
  const [stickyNotes, setStickyNotes] = useState<any[]>([
    { id: 's1', type: 'sticky', text: 'Brand Redesign Task', description: 'Ensure the purple/cyan theme matches GlowAI guidelines.', assignee: 'Priya', color: '#fef08a', x: 50, y: 50 },
    { id: 's2', type: 'analytics', filterAssignee: 'All', filterPriority: 'All', x: 480, y: 50 }
  ])
  const [newStickyText, setNewStickyText] = useState('')
  const [newStickyDesc, setNewStickyDesc] = useState('')
  const [newStickyAssignee, setNewStickyAssignee] = useState('')
  const [newStickyColor, setNewStickyColor] = useState('#fef08a') // Yellow

  // Advanced whiteboard states
  const [newTextCardContent, setNewTextCardContent] = useState('')
  const [newTextCardSize, setNewTextCardSize] = useState<string>('md')
  const [newFlowchartShape, setNewFlowchartShape] = useState<string>('process')
  const [newVotingTitle, setNewVotingTitle] = useState('')
  const [newMindmapRoot, setNewMindmapRoot] = useState('')

  const [whiteboardColor, setWhiteboardColor] = useState<string>('#8b5cf6')
  const [shapesPopupOpen, setShapesPopupOpen] = useState<boolean>(false)

  const hexToRgba = (hex: string, alpha: number) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    } catch (e) {
      return `rgba(139, 92, 246, ${alpha})` // fallback purple
    }
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [draggedStickyId, setDraggedStickyId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // 1. Resolve User Session
  useEffect(() => {
    const employerSessionId = localStorage.getItem('registeredEmployerId')
    const employeeSessionStr = localStorage.getItem('loggedInEmployee')

    if (employeeSessionStr) {
      try {
        const emp = JSON.parse(employeeSessionStr)
        setEmployerId(emp.employerId)
      } catch (e) {
        console.error(e)
      }
    } else if (employerSessionId) {
      setEmployerId(employerSessionId)
    } else {
      setEmployerId('mock-employer-id')
    }
  }, [])

  // 2. Fetch Employees & Tasks
  useEffect(() => {
    if (!employerId) return
    const fetchAuxData = async () => {
      try {
        if (employerId === 'mock-employer-id') {
          setAllEmployees(mockEmployers[0].employees)
          return
        }

        // Employees
        const empSnap = await getDocs(collection(db, 'employers', employerId, 'employees'))
        const empList: any[] = []
        empSnap.forEach(d => empList.push({ id: d.id, ...d.data() }))
        setAllEmployees(empList)

        // Tasks
        const taskSnap = await getDocs(collection(db, 'employers', employerId, 'tasks'))
        const taskList: any[] = []
        taskSnap.forEach(d => taskList.push({ id: d.id, ...d.data() }))
        setAllTasks(taskList)
      } catch (err) {
        console.error('Error fetching aux data:', err)
        setAllEmployees(mockEmployers[0].employees)
      }
    }
    fetchAuxData()
  }, [employerId])

  // 3. Real-Time Workspace Document Sync
  useEffect(() => {
    if (!employerId || !workspaceId) return
    setLoading(true)

    const docRef = doc(db, 'employers', employerId, 'workspaces', workspaceId)
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as Workspace
        setWorkspace(data)
      } else {
        // Fallback for mocks
        setWorkspace({
          id: workspaceId,
          name: 'Sales Acceleration Hub',
          description: 'Dedicated workspace to coordinate the sales sprint, qualified pipelines, and milestones.',
          members: allEmployees.slice(0, 3).map(e => e.id),
          createdAt: new Date().toISOString(),
          milestones: ['Setup deal pipelines', 'Import initial Excel employee records', 'Integrate video scheduler'],
          scratchpad: 'Collaborative notes scratchpad. Edit this live!'
        })
      }
      setLoading(false)
    }, (error) => {
      console.error('Error syncing workspace detail:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [employerId, workspaceId, allEmployees])

  // Setup Whiteboard Drawing
  useEffect(() => {
    if (activeTab === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width || 800
      canvas.height = rect.height || 450
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineCap = 'round'
        ctx.strokeStyle = whiteboardColor
        ctx.lineWidth = 3
      }
    }
  }, [activeTab, whiteboardColor])

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (whiteboardTool !== 'pencil' && whiteboardTool !== 'eraser' && whiteboardTool !== 'marker') return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      
      if (whiteboardTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = 25
      } else if (whiteboardTool === 'marker') {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = hexToRgba(whiteboardColor, 0.35)
        ctx.lineWidth = 12
      } else {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = whiteboardColor
        ctx.lineWidth = 3
      }
      
      setIsDrawing(true)
    }
  }

  const drawLine = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (whiteboardTool !== 'pencil' && whiteboardTool !== 'eraser' && whiteboardTool !== 'marker')) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  // Add Sticky Note
  const handleAddSticky = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStickyText.trim()) return
    const newSticky = {
      id: `sticky_${Date.now()}`,
      type: 'sticky',
      text: newStickyText,
      description: newStickyDesc,
      assignee: newStickyAssignee,
      color: newStickyColor,
      x: Math.random() * 200 + 40,
      y: Math.random() * 200 + 40
    }
    setStickyNotes([...stickyNotes, newSticky])
    setNewStickyText('')
    setNewStickyDesc('')
    setNewStickyAssignee('')
  }

  // Add Image on Whiteboard
  const handleAddImage = (base64: string, name: string) => {
    const newSticky = {
      id: `img_${Date.now()}`,
      type: 'image',
      imageSrc: base64,
      text: name,
      x: Math.random() * 200 + 40,
      y: Math.random() * 200 + 40
    }
    setStickyNotes([...stickyNotes, newSticky])
  }

  // Add Analytics Widget
  const handleAddAnalytics = () => {
    const newSticky = {
      id: `analytics_${Date.now()}`,
      type: 'analytics',
      filterAssignee: 'All',
      filterPriority: 'All',
      x: Math.random() * 200 + 40,
      y: Math.random() * 200 + 40
    }
    setStickyNotes([...stickyNotes, newSticky])
  }

  // Add Text Card
  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTextCardContent.trim()) return
    const newSticky = {
      id: `text_${Date.now()}`,
      type: 'text',
      content: newTextCardContent,
      size: newTextCardSize,
      x: Math.random() * 200 + 40,
      y: Math.random() * 200 + 40
    }
    setStickyNotes([...stickyNotes, newSticky])
    setNewTextCardContent('')
  }

  // Add Flowchart shape
  const handleAddFlowchart = () => {
    const newSticky = {
      id: `flow_${Date.now()}`,
      type: 'flowchart',
      shape: newFlowchartShape,
      text: newFlowchartShape === 'process' ? 'Process Step' : newFlowchartShape === 'decision' ? 'Decision Point' : 'Start/End',
      x: Math.random() * 200 + 40,
      y: Math.random() * 200 + 40
    }
    setStickyNotes([...stickyNotes, newSticky])
  }

  // Add Voting Idea card
  const handleAddVoting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVotingTitle.trim()) return
    const newSticky = {
      id: `voting_${Date.now()}`,
      type: 'voting',
      text: newVotingTitle,
      votesUp: 0,
      votesDown: 0,
      x: Math.random() * 200 + 40,
      y: Math.random() * 200 + 40
    }
    setStickyNotes([...stickyNotes, newSticky])
    setNewVotingTitle('')
  }

  // Add MindMap tree node
  const handleAddMindmap = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMindmapRoot.trim()) return
    const newSticky = {
      id: `mindmap_${Date.now()}`,
      type: 'mindmap',
      text: newMindmapRoot,
      branches: ['Topic A', 'Topic B'],
      x: Math.random() * 200 + 40,
      y: Math.random() * 200 + 40
    }
    setStickyNotes([...stickyNotes, newSticky])
    setNewMindmapRoot('')
  }

  // Add Shape card helper
  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'star') => {
    const newSticky = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      shapeType,
      text: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
      color: whiteboardColor,
      x: Math.random() * 200 + 40,
      y: Math.random() * 200 + 40
    }
    setStickyNotes([...stickyNotes, newSticky])
  }

  // Sticky Drag Handlers
  const handleStickyMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return
    if (whiteboardTool !== 'select' && whiteboardTool !== 'hand') return
    e.stopPropagation()
    const sticky = stickyNotes.find(s => s.id === id)
    if (sticky) {
      const container = e.currentTarget.parentElement?.getBoundingClientRect()
      if (container) {
        setDraggedStickyId(id)
        setDragOffset({
          x: e.clientX - container.left - sticky.x,
          y: e.clientY - container.top - sticky.y
        })
      }
    }
  }

  const handleWhiteboardMouseMove = (e: React.MouseEvent) => {
    if (draggedStickyId) {
      const containerRect = e.currentTarget.getBoundingClientRect()
      const calculatedX = e.clientX - containerRect.left - dragOffset.x
      const calculatedY = e.clientY - containerRect.top - dragOffset.y

      const boundedX = Math.max(10, Math.min(containerRect.width - 190, calculatedX))
      const boundedY = Math.max(10, Math.min(containerRect.height - 190, calculatedY))

      setStickyNotes(prev => prev.map(s => s.id === draggedStickyId ? { ...s, x: boundedX, y: boundedY } : s))
    }
  }

  const handleWhiteboardMouseUp = () => {
    setDraggedStickyId(null)
  }

  // Move Board Task Status
  const handleMoveTask = async (taskId: string, newStatus: string) => {
    if (!employerId) return
    try {
      const taskRef = doc(db, 'employers', employerId, 'tasks', taskId)
      await updateDoc(taskRef, {
        status: newStatus
      })
      // Local optimistic update
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (err) {
      console.error("Error moving task:", err)
    }
  }

  // Save Document edit
  const handleSaveDoc = () => {
    setDocsList(prev => prev.map(d => d.id === selectedDocId ? { ...d, content: docContentDraft } : d))
    alert("Document updated successfully!")
  }

  // Create document page
  const handleCreateDoc = () => {
    const newDoc = {
      id: `doc_${Date.now()}`,
      title: 'New Page Draft',
      content: 'Start writing SOP page contents...'
    }
    setDocsList([...docsList, newDoc])
    setSelectedDocId(newDoc.id)
    setDocContentDraft('Start writing SOP page contents...')
  }

  // Filter tasks belonging to members in this workspace
  const workspaceTasks = allTasks.filter(task =>
    workspace?.members?.includes(task.assignedTo)
  )

  // Map workspace member profile details
  const workspaceMembers = allEmployees.filter(emp =>
    workspace?.members?.includes(emp.id)
  )

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestone.trim() || !employerId || !workspace) return

    try {
      const docRef = doc(db, 'employers', employerId, 'workspaces', workspace.id)
      await updateDoc(docRef, {
        milestones: arrayUnion(newMilestone)
      })
      setNewMilestone('')
    } catch (err) {
      console.error('Error adding milestone:', err)
    }
  }

  if (loading) {
    return (
      <CollaborationLayout>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-left">
          <Clock className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold animate-pulse">Loading workspace details...</p>
        </div>
      </CollaborationLayout>
    )
  }

  return (
    <CollaborationLayout>
      {/* Back link */}
      <div className="mb-6 flex items-center gap-4 text-left">
        <Link href="/workspaces" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{workspace?.name}</h1>
          <p className="text-slate-500 text-xs mt-1">Project Workspace</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 mb-8 gap-6 text-left">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'board', label: 'Kanban Board', icon: ClipboardList },
          { id: 'docs', label: 'Notion Docs', icon: BookOpen },
          { id: 'whiteboard', label: 'Miro Whiteboard', icon: Layers },
          { id: 'members', label: 'Team Members', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any)
                if (tab.id === 'docs') {
                  const currDoc = docsList.find(d => d.id === selectedDocId)
                  setDocContentDraft(currDoc ? currDoc.content : '')
                }
              }}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${active
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div className="text-left">

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">About Workspace</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">{workspace?.description || 'No description provided.'}</p>
                <div className="border-t border-slate-50 pt-4 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Created: {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : ''}
                </div>
              </div>

              {/* Milestones Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Project Milestones</h3>

                <div className="space-y-3">
                  {workspace?.milestones && workspace.milestones.length > 0 ? (
                    workspace.milestones.map((ms, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-purple-50/50 border border-purple-100/50 rounded-2xl">
                        <CheckCircle2 size={16} className="text-purple-600" />
                        <span className="text-xs font-semibold text-purple-950">{ms}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 font-bold">No milestones added yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddMilestone} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter new milestone description..."
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-xs font-semibold"
                  />
                  <button type="submit" className="px-5 py-3 bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md">
                    <Plus size={14} /> Add
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Stats sidebar */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-fit space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Workspace summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500 font-bold">Members</span>
                  <span className="text-xs text-slate-900 font-black">{workspace?.members?.length || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500 font-bold">Milestones</span>
                  <span className="text-xs text-slate-900 font-black">{workspace?.milestones?.length || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500 font-bold">Workspace Tasks</span>
                  <span className="text-xs text-slate-900 font-black">{workspaceTasks.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ClickUp Kanban Board */}
        {activeTab === 'board' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Sprint Kanban Board</h3>
              <span className="text-xs font-black text-slate-400 uppercase">Active Workspace Tasks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Columns */}
              {[
                { id: 'pending', title: 'To Do', color: 'border-t-slate-400 bg-slate-50/50' },
                { id: 'in-progress', title: 'In Progress', color: 'border-t-blue-500 bg-blue-50/20' },
                { id: 'completed', title: 'Completed', color: 'border-t-emerald-500 bg-emerald-50/20' }
              ].map((col) => {
                const colTasks = workspaceTasks.filter(t => t.status === col.id || (!t.status && col.id === 'pending'))
                return (
                  <div key={col.id} className={`p-4 rounded-3xl border border-slate-100 border-t-4 ${col.color} space-y-3 min-h-[400px]`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">{col.title}</h4>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{colTasks.length}</span>
                    </div>

                    <div className="space-y-3">
                      {colTasks.map((task) => (
                        <div key={task.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
                          <h5 className="text-xs font-black text-slate-800 leading-snug">{task.title}</h5>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{task.description}</p>

                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 pt-2 border-t border-slate-50 uppercase">
                            <span>Due: {task.dueDate}</span>
                            <div className="flex gap-1">
                              {col.id !== 'pending' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.id === 'completed' ? 'in-progress' : 'pending')}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-purple-600 rounded"
                                >
                                  ←
                                </button>
                              )}
                              {col.id !== 'completed' && (
                                <button
                                  onClick={() => handleMoveTask(task.id, col.id === 'pending' ? 'in-progress' : 'completed')}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-purple-600 rounded"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {colTasks.length === 0 && (
                        <p className="text-[10px] text-slate-400 text-center font-bold py-6">No tasks in column</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Notion Docs */}
        {activeTab === 'docs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar list */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 space-y-3 h-fit">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Notion Wiki Pages</span>
                <button onClick={handleCreateDoc} className="p-1 bg-white hover:bg-slate-200 border rounded text-purple-600">
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-1.5 flex flex-col">
                {docsList.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id)
                      setDocContentDraft(doc.content)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${selectedDocId === doc.id ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-250/50 text-slate-700'
                      }`}
                  >
                    📄 {doc.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Content view/edit */}
            <div className="md:col-span-2 border border-slate-100 rounded-3xl p-6 bg-white space-y-4 shadow-sm">
              <input
                type="text"
                value={docsList.find(d => d.id === selectedDocId)?.title || ''}
                onChange={e => {
                  const val = e.target.value
                  setDocsList(prev => prev.map(d => d.id === selectedDocId ? { ...d, title: val } : d))
                }}
                className="w-full text-lg font-black text-slate-900 outline-none pb-2 border-b border-slate-100 focus:border-purple-500"
              />
              <textarea
                value={docContentDraft}
                onChange={e => setDocContentDraft(e.target.value)}
                rows={10}
                className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none focus:ring-1 focus:ring-purple-500 text-xs font-semibold leading-relaxed font-mono"
              />
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveDoc}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save size={12} /> Save Page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Miro Whiteboard */}
        {activeTab === 'whiteboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Add Cards:</span>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1.5 flex-wrap items-center">
                  {[
                    { id: 'sticky', icon: StickyNote, label: 'Sticky Note' },
                    { id: 'text', icon: Type, label: 'Text Card' },
                    { id: 'flowchart', icon: Network, label: 'Flowchart' },
                    { id: 'voting', icon: ThumbsUp, label: 'Voting Card' },
                    { id: 'mindmap', icon: GitBranch, label: 'Mind Map' },
                    { id: 'analytics', icon: BarChart2, label: 'Analytics' }
                  ].map(tool => {
                    const Icon = tool.icon
                    return (
                      <button
                        key={tool.id}
                        title={tool.label}
                        onClick={() => setWhiteboardTool(tool.id)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${whiteboardTool === tool.id ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
                          }`}
                      >
                        <Icon size={16} />
                      </button>
                    )
                  })}

                  {/* Shapes Dropdown Selector */}
                  <div className="relative">
                    <button
                      title="Add Shapes"
                      onClick={() => setShapesPopupOpen(!shapesPopupOpen)}
                      className={`p-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${shapesPopupOpen ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'}`}
                    >
                      <Shapes size={16} />
                    </button>
                    {shapesPopupOpen && (
                      <div className="absolute top-10 left-0 bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-40 flex flex-col gap-1 min-w-[120px] pointer-events-auto">
                        {[
                          { id: 'rectangle', icon: Square, label: 'Rectangle' },
                          { id: 'circle', icon: Circle, label: 'Circle' },
                          { id: 'triangle', icon: Triangle, label: 'Triangle' },
                          { id: 'arrow', icon: ChevronDown, label: 'Arrow' },
                          { id: 'star', icon: Sparkles, label: 'Star' }
                        ].map(shape => {
                          const ShapeIcon = shape.icon
                          return (
                            <button
                              key={shape.id}
                              onClick={() => {
                                handleAddShape(shape.id as any)
                                setShapesPopupOpen(false)
                              }}
                              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-left text-xs font-semibold text-slate-700 w-full transition-colors cursor-pointer"
                            >
                              <ShapeIcon size={14} className="text-slate-500" />
                              {shape.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* File Upload trigger button */}
                  <label title="Add Image Card" className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-650 cursor-pointer flex items-center gap-1 transition-all">
                    <Upload size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.readAsDataURL(file)
                        reader.onloadend = () => {
                           handleAddImage(reader.result as string, file.name)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Sticky Note input form */}
              {whiteboardTool === 'sticky' && (
                <form onSubmit={handleAddSticky} className="flex gap-2 items-center flex-wrap bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <input
                    type="text"
                    placeholder="Sticky Title..."
                    value={newStickyText}
                    onChange={e => setNewStickyText(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Add Description / More info..."
                    value={newStickyDesc}
                    onChange={e => setNewStickyDesc(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold flex-1 min-w-[150px]"
                  />
                  <select
                    value={newStickyAssignee}
                    onChange={e => setNewStickyAssignee(e.target.value)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="">No Assignee</option>
                    {workspaceMembers.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <select
                    value={newStickyColor}
                    onChange={e => setNewStickyColor(e.target.value)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="#fef08a">Yellow</option>
                    <option value="#bfdbfe">Blue</option>
                    <option value="#bbf7d0">Green</option>
                    <option value="#fecaca">Red</option>
                  </select>
                  <button type="submit" className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">
                    Add Note
                  </button>
                </form>
              )}

              {/* Text Card Form */}
              {whiteboardTool === 'text' && (
                <form onSubmit={handleAddText} className="flex gap-2 items-center flex-wrap bg-slate-50 p-3 rounded-2xl border border-slate-155">
                  <input
                    type="text"
                    placeholder="Text Card Content..."
                    value={newTextCardContent}
                    onChange={e => setNewTextCardContent(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold flex-1 min-w-[200px]"
                    required
                  />
                  <select
                    value={newTextCardSize}
                    onChange={e => setNewTextCardSize(e.target.value)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="sm">Small Text</option>
                    <option value="md">Heading</option>
                    <option value="lg">Title Header</option>
                  </select>
                  <button type="submit" className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">
                    Add Text
                  </button>
                </form>
              )}

              {/* Flowchart Form */}
              {whiteboardTool === 'flowchart' && (
                <div className="flex gap-2 items-center flex-wrap bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-xs font-bold text-slate-700">Shape:</span>
                  <select
                    value={newFlowchartShape}
                    onChange={e => setNewFlowchartShape(e.target.value)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="process">Process (Rectangle)</option>
                    <option value="decision">Decision (Diamond)</option>
                    <option value="start">Start/End (Oval)</option>
                  </select>
                  <button onClick={handleAddFlowchart} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">
                    Add Flow Shape
                  </button>
                </div>
              )}

              {/* Voting Card Form */}
              {whiteboardTool === 'voting' && (
                <form onSubmit={handleAddVoting} className="flex gap-2 items-center flex-wrap bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <input
                    type="text"
                    placeholder="Proposal idea topic..."
                    value={newVotingTitle}
                    onChange={e => setNewVotingTitle(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold flex-1 min-w-[200px]"
                    required
                  />
                  <button type="submit" className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">
                    Add Vote Card
                  </button>
                </form>
              )}

              {/* Mindmap Card Form */}
              {whiteboardTool === 'mindmap' && (
                <form onSubmit={handleAddMindmap} className="flex gap-2 items-center flex-wrap bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <input
                    type="text"
                    placeholder="Mind Map Core Concept..."
                    value={newMindmapRoot}
                    onChange={e => setNewMindmapRoot(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold flex-1 min-w-[200px]"
                    required
                  />
                  <button type="submit" className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">
                    Add Mind Node
                  </button>
                </form>
              )}

              {/* Analytics Card creator */}
              {whiteboardTool === 'analytics' && (
                <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <span className="text-xs font-bold text-slate-700">Real-Time CRM Tasks Analytics Card:</span>
                  <button onClick={handleAddAnalytics} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">
                    Add Analytics Card
                  </button>
                </div>
              )}
            </div>

            {/* Drawing Surface Canvas */}
            <div
              onMouseMove={handleWhiteboardMouseMove}
              onMouseUp={handleWhiteboardMouseUp}
              onMouseLeave={handleWhiteboardMouseUp}
              className={`border border-slate-200 rounded-3xl overflow-hidden bg-slate-50 relative h-[450px] ${
                whiteboardTool === 'hand' 
                  ? (draggedStickyId ? 'cursor-grabbing' : 'cursor-grab') 
                  : 'cursor-default'
              }`}
            >
              {/* Photoshop-style vertical toolbar panel on the right */}
              <div className="absolute right-4 top-4 z-30 flex flex-col gap-2 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-2 shadow-xl pointer-events-auto">
                {[
                  { id: 'select', icon: MousePointer, label: 'Select Tool' },
                  { id: 'hand', icon: Hand, label: 'Hand Pan/Drag' },
                  { id: 'pencil', icon: Pencil, label: 'Pen Sketch' },
                  { id: 'marker', icon: Highlighter, label: 'Marker Highlight' },
                  { id: 'eraser', icon: Eraser, label: 'Eraser' }
                ].map(tool => {
                  const Icon = tool.icon
                  const active = whiteboardTool === tool.id
                  return (
                    <button
                      key={tool.id}
                      title={tool.label}
                      onClick={() => setWhiteboardTool(tool.id)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        active 
                          ? 'bg-purple-600 text-white shadow-md' 
                          : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={18} />
                    </button>
                  )
                })}

                {/* Drawing/Marker Color Selector Sub-panel */}
                {(whiteboardTool === 'pencil' || whiteboardTool === 'marker') && (
                  <div className="border-t border-slate-200 pt-2 mt-1 flex flex-col gap-2 items-center">
                    {[
                      { hex: '#8b5cf6', name: 'Purple' },
                      { hex: '#3b82f6', name: 'Blue' },
                      { hex: '#10b981', name: 'Green' },
                      { hex: '#ef4444', name: 'Red' },
                      { hex: '#fbbf24', name: 'Yellow' },
                      { hex: '#000000', name: 'Black' }
                    ].map(col => (
                      <button
                        key={col.hex}
                        title={col.name}
                        onClick={() => setWhiteboardColor(col.hex)}
                        className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                          whiteboardColor === col.hex ? 'ring-2 ring-purple-600 ring-offset-1 border-transparent scale-110' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Clear sketch button */}
                {(whiteboardTool === 'pencil' || whiteboardTool === 'eraser' || whiteboardTool === 'marker') && (
                  <button 
                    onClick={clearCanvas} 
                    title="Clear Sketch"
                    className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all cursor-pointer border border-rose-100 mt-1"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className={`absolute inset-0 z-10 ${
                  whiteboardTool === 'pencil' 
                    ? 'cursor-crosshair' 
                    : whiteboardTool === 'marker'
                      ? 'cursor-crosshair'
                      : whiteboardTool === 'eraser' 
                        ? 'cursor-cell' 
                        : 'pointer-events-none'
                }`}
                onMouseDown={startDrawing}
                onMouseMove={drawLine}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />

              <div className="absolute inset-0 z-20 pointer-events-none">
                {stickyNotes.map((sticky) => {
                  // Render elements based on type
                  
                  // Custom Shape Card
                  if (sticky.type === 'shape') {
                    const isCircle = sticky.shapeType === 'circle'
                    const isTriangle = sticky.shapeType === 'triangle'
                    const isArrow = sticky.shapeType === 'arrow'
                    const isStar = sticky.shapeType === 'star'
                    
                    return (
                      <div
                        key={sticky.id}
                        onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                        className="absolute w-32 h-32 flex flex-col justify-between items-center group cursor-move select-none pointer-events-auto"
                        style={{ left: sticky.x, top: sticky.y }}
                      >
                        <div className="w-full h-full relative flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full drop-shadow-md overflow-visible animate-fade-in" viewBox="0 0 100 100">
                            {isCircle && (
                              <circle cx="50" cy="50" r="45" fill={sticky.color} fillOpacity="0.18" stroke={sticky.color} strokeWidth="3" />
                            )}
                            {isTriangle && (
                              <polygon points="50,8 92,90 8,90" fill={sticky.color} fillOpacity="0.18" stroke={sticky.color} strokeWidth="3" />
                            )}
                            {isArrow && (
                              <polygon points="5,38 55,38 55,18 95,50 55,82 55,62 5,62" fill={sticky.color} fillOpacity="0.18" stroke={sticky.color} strokeWidth="3" />
                            )}
                            {isStar && (
                              <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill={sticky.color} fillOpacity="0.18" stroke={sticky.color} strokeWidth="3" />
                            )}
                            {!isCircle && !isTriangle && !isArrow && !isStar && (
                              <rect x="5" y="5" width="90" height="90" rx="8" fill={sticky.color} fillOpacity="0.18" stroke={sticky.color} strokeWidth="3" />
                            )}
                          </svg>
                          
                          <input
                            type="text"
                            value={sticky.text}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const val = e.target.value
                              setStickyNotes(prev => prev.map(s => s.id === sticky.id ? { ...s, text: val } : s))
                            }}
                            className="relative z-10 w-4/5 text-center bg-transparent border-none outline-none font-bold text-[10px] text-slate-800 uppercase tracking-wide focus:ring-0"
                          />
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setStickyNotes(prev => prev.filter(s => s.id !== sticky.id))
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[9px] text-rose-600 hover:text-rose-800 font-black cursor-pointer absolute -top-1 -right-1 bg-white border border-slate-200 rounded-full w-5 h-5 flex items-center justify-center shadow transition-opacity z-20"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  }

                  // 1. Image Card
                  if (sticky.type === 'image') {
                    return (
                      <div
                        key={sticky.id}
                        onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                        className="absolute p-1.5 w-48 h-48 bg-white rounded-2xl shadow-md border cursor-move select-none flex flex-col justify-between hover:shadow-lg transition-shadow pointer-events-auto"
                        style={{ left: sticky.x, top: sticky.y }}
                      >
                        <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100">
                          <img src={sticky.imageSrc} alt={sticky.text} className="w-full h-full object-cover pointer-events-none" />
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-slate-500 truncate max-w-[100px] font-bold">{sticky.text}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setStickyNotes(prev => prev.filter(s => s.id !== sticky.id))
                            }}
                            className="text-[9px] text-rose-600 hover:text-rose-800 font-extrabold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  }

                  // 2. Real-Time Filterable Analytics Card
                  if (sticky.type === 'analytics') {
                    // Filter tasks list in real time based on select elements inside this card
                    const selectedAssigneeName = sticky.filterAssignee || 'All'
                    const selectedPriority = sticky.filterPriority || 'All'
                    
                    // Filter
                    const filtered = workspaceTasks.filter(t => {
                      // Check assignee
                      const assigneeMatch = selectedAssigneeName === 'All' || t.assigneeName === selectedAssigneeName || t.assignee === selectedAssigneeName
                      // Check priority
                      const priorityMatch = selectedPriority === 'All' || t.priority === selectedPriority
                      return assigneeMatch && priorityMatch
                    })
                    
                    const totalCount = filtered.length
                    const completedCount = filtered.filter(t => t.status === 'completed').length
                    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

                    return (
                      <div
                        key={sticky.id}
                        onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                        className="absolute p-4 w-56 h-60 bg-slate-900 text-white rounded-3xl shadow-xl border border-slate-800 cursor-move flex flex-col justify-between hover:shadow-2xl transition-all pointer-events-auto"
                        style={{ left: sticky.x, top: sticky.y }}
                      >
                        <div className="space-y-3 min-w-0">
                          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                            <BarChart2 className="text-purple-400" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">Live Task Analytics</span>
                          </div>
                          
                          {/* Live interactive filter dropdowns */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-[9px] text-slate-400 font-bold">Assignee:</span>
                              <select
                                value={sticky.filterAssignee}
                                onMouseDown={e => e.stopPropagation()} // Stop drag
                                onChange={(e) => {
                                  const val = e.target.value
                                  setStickyNotes(prev => prev.map(s => s.id === sticky.id ? { ...s, filterAssignee: val } : s))
                                }}
                                className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-white outline-none"
                              >
                                <option value="All">All Members</option>
                                {workspaceMembers.map(m => (
                                  <option key={m.id} value={m.name}>{m.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-[9px] text-slate-400 font-bold">Priority:</span>
                              <select
                                value={sticky.filterPriority}
                                onMouseDown={e => e.stopPropagation()} // Stop drag
                                onChange={(e) => {
                                  const val = e.target.value
                                  setStickyNotes(prev => prev.map(s => s.id === sticky.id ? { ...s, filterPriority: val } : s))
                                }}
                                className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-white outline-none"
                              >
                                <option value="All">All Priorities</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                          </div>

                          {/* Dynamic results */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="bg-slate-850 p-2 rounded-xl text-center border border-slate-800">
                              <p className="text-xs font-black text-purple-400">{totalCount}</p>
                              <p className="text-[8px] text-slate-500 font-bold uppercase">Tasks</p>
                            </div>
                            <div className="bg-slate-850 p-2 rounded-xl text-center border border-slate-800">
                              <p className="text-xs font-black text-emerald-400">{completedCount}</p>
                              <p className="text-[8px] text-slate-500 font-bold uppercase">Done</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                              <span>Completion Rate</span>
                              <span>{completionRate}%</span>
                            </div>
                            <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${completionRate}%` }} />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setStickyNotes(prev => prev.filter(s => s.id !== sticky.id))
                          }}
                          className="text-[9px] text-rose-500 hover:text-rose-700 font-black text-right self-end mt-1 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )
                  }

                  // 3. Text Card Node
                  if (sticky.type === 'text') {
                    return (
                      <div
                        key={sticky.id}
                        onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                        className="absolute p-2 w-56 h-fit bg-transparent hover:bg-slate-200/40 rounded-xl cursor-move select-none group flex items-start justify-between gap-2 border border-transparent hover:border-slate-300 transition-all pointer-events-auto"
                        style={{ left: sticky.x, top: sticky.y }}
                      >
                        <div className="flex-1 min-w-0">
                          <input 
                            type="text"
                            value={sticky.content}
                            onChange={(e) => {
                              const val = e.target.value
                              setStickyNotes(prev => prev.map(s => s.id === sticky.id ? { ...s, content: val } : s))
                            }}
                            className={`w-full bg-transparent border-none outline-none font-bold text-slate-900 ${
                              sticky.size === 'lg' ? 'text-lg font-black' : sticky.size === 'md' ? 'text-sm font-extrabold' : 'text-xs'
                            }`}
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setStickyNotes(prev => prev.filter(s => s.id !== sticky.id))
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[9px] text-rose-600 hover:text-rose-800 font-black cursor-pointer transition-opacity"
                        >
                          X
                        </button>
                      </div>
                    )
                  }

                  // 4. Flowchart Shape Node
                  if (sticky.type === 'flowchart') {
                    const isDecision = sticky.shape === 'decision'
                    const isStart = sticky.shape === 'start'
                    return (
                      <div
                        key={sticky.id}
                        onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                        className={`absolute cursor-move select-none flex flex-col justify-between items-center border hover:shadow-lg transition-shadow shadow-sm pointer-events-auto ${
                          isDecision 
                            ? 'w-36 h-36 rotate-45 bg-amber-50 border-amber-300' 
                            : isStart 
                              ? 'w-40 h-24 rounded-[50px] bg-blue-50 border-blue-300' 
                              : 'w-40 h-28 rounded-xl bg-purple-50 border-purple-300'
                        }`}
                        style={{ left: sticky.x, top: sticky.y }}
                      >
                        <div className={`flex flex-col items-center justify-center flex-1 w-full px-4 ${isDecision ? '-rotate-45' : ''}`}>
                          <input 
                            type="text"
                            value={sticky.text}
                            onChange={(e) => {
                              const val = e.target.value
                              setStickyNotes(prev => prev.map(s => s.id === sticky.id ? { ...s, text: val } : s))
                            }}
                            className="w-full bg-transparent border-none outline-none font-black text-center text-slate-800 text-[10px] uppercase tracking-wider"
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setStickyNotes(prev => prev.filter(s => s.id !== sticky.id))
                          }}
                          className={`text-[8px] text-rose-600 hover:text-rose-800 font-extrabold mb-1.5 ${isDecision ? '-rotate-45 relative right-2 bottom-1' : ''}`}
                        >
                          Delete
                        </button>
                      </div>
                    )
                  }

                  // 5. Decision Voting Card Node
                  if (sticky.type === 'voting') {
                    return (
                      <div
                        key={sticky.id}
                        onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                        className="absolute p-4 w-44 h-40 bg-white rounded-3xl shadow-md border border-slate-150 cursor-move select-none flex flex-col justify-between hover:shadow-lg transition-shadow pointer-events-auto"
                        style={{ left: sticky.x, top: sticky.y }}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <span className="text-[8px] font-black uppercase text-purple-600 tracking-wider">Proposal Vote</span>
                          <div className="font-extrabold text-xs text-slate-800 truncate">{sticky.text}</div>
                          
                          <div className="flex gap-2 justify-center pt-2">
                            <button
                              onMouseDown={e => e.stopPropagation()} // Stop drag
                              onClick={() => {
                                setStickyNotes(prev => prev.map(s => s.id === sticky.id ? { ...s, votesUp: s.votesUp + 1 } : s))
                              }}
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
                            >
                              👍 {sticky.votesUp}
                            </button>
                            <button
                              onMouseDown={e => e.stopPropagation()} // Stop drag
                              onClick={() => {
                                setStickyNotes(prev => prev.map(s => s.id === sticky.id ? { ...s, votesDown: s.votesDown + 1 } : s))
                              }}
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
                            >
                              👎 {sticky.votesDown}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setStickyNotes(prev => prev.filter(s => s.id !== sticky.id))
                          }}
                          className="text-[9px] text-rose-700 hover:text-rose-900 font-black text-right self-end mt-1 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )
                  }

                  // 6. MindMap Node
                  if (sticky.type === 'mindmap') {
                    return (
                      <div
                        key={sticky.id}
                        onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                        className="absolute p-4 w-48 h-48 bg-slate-900 text-white rounded-3xl shadow-lg border border-slate-850 cursor-move select-none flex flex-col justify-between hover:shadow-2xl transition-shadow pointer-events-auto"
                        style={{ left: sticky.x, top: sticky.y }}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider">Concept Node</span>
                          <div className="font-extrabold text-xs text-slate-100 border-b border-slate-800 pb-1 truncate">{sticky.text}</div>
                          
                          <div className="space-y-1 pt-1 max-h-20 overflow-y-auto pr-1">
                            {sticky.branches?.map((branch: string, bIdx: number) => (
                              <div key={bIdx} className="text-[9px] text-slate-400 font-bold truncate">
                                ├── {branch}
                              </div>
                            ))}
                          </div>
                          
                          {/* Branch adder input */}
                          <div className="pt-1">
                            <input 
                              type="text" 
                              placeholder="+ Add node branch..."
                              onMouseDown={e => e.stopPropagation()} // Stop drag
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = e.currentTarget.value.trim()
                                  if (val) {
                                    setStickyNotes(prev => prev.map(s => s.id === sticky.id ? { 
                                      ...s, 
                                      branches: [...(s.branches || []), val] 
                                    } : s))
                                    e.currentTarget.value = ''
                                  }
                                }
                              }}
                              className="w-full bg-slate-800 border-none rounded px-2 py-0.5 text-[9px] outline-none text-white font-bold"
                            />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setStickyNotes(prev => prev.filter(s => s.id !== sticky.id))
                          }}
                          className="text-[9px] text-rose-500 hover:text-rose-700 font-black text-right self-end mt-1 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )
                  }

                  // 7. Standard Sticky Note
                  return (
                    <div
                      key={sticky.id}
                      onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                      className="absolute p-3.5 w-44 h-44 rounded-2xl shadow-md border text-[11px] font-semibold overflow-y-auto cursor-move flex flex-col justify-between select-none hover:shadow-lg transition-shadow pointer-events-auto"
                      style={{ left: sticky.x, top: sticky.y, backgroundColor: sticky.color }}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="font-extrabold text-xs text-slate-900 border-b border-slate-900/10 pb-1 truncate">
                          {sticky.text}
                        </div>
                        {sticky.description && (
                          <p className="text-slate-700 leading-relaxed font-semibold break-words line-clamp-3">
                            {sticky.description}
                          </p>
                        )}
                        {sticky.assignee && (
                          <div className="inline-block bg-slate-950/5 text-slate-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded capitalize">
                            👤 {sticky.assignee}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setStickyNotes(prev => prev.filter(s => s.id !== sticky.id))
                        }}
                        className="text-[9px] text-rose-700 hover:text-rose-900 font-black text-right mt-1.5 self-end bg-transparent border-none cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Team Members */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaceMembers.map((member, idx) => (
              <div
                key={member.id || idx}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-all"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {(member.name || 'E').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-snug">{member.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold capitalize mt-0.5">{member.role}</p>
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                    <Briefcase size={12} /> {member.department}
                  </p>
                </div>
              </div>
            ))}

            {workspaceMembers.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                <Users className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-slate-500 font-semibold">No assigned workspace members found.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </CollaborationLayout>
  )
}
