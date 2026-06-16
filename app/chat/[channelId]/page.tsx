'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CollaborationLayout } from '@/components/collaboration-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hash, 
  Send, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Users, 
  Volume2, 
  Trash2, 
  Info, 
  AtSign,
  Plus,
  Play,
  Pause,
  X,
  Menu,
  Paperclip,
  Image as ImageIcon,
  Smile,
  BarChart2,
  CheckSquare,
  Briefcase,
  ChevronDown,
  Download,
  FileText,
  ThumbsUp,
  ExternalLink
} from 'lucide-react'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockEmployers, mockLeads, mockTasks } from '@/lib/mock-data'

interface Channel {
  id: string
  name: string
  description: string
  isAnnouncements?: boolean
  isPublic?: boolean
  members?: string[]
}

interface ThreadReply {
  senderName: string
  senderRole: string
  text: string
  timestamp: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  text: string
  timestamp: any
  voiceUrl?: string
  mentions?: string[]
  threadReplies?: ThreadReply[]
  
  // Rich Media Attachments
  type?: 'text' | 'image' | 'file' | 'poll' | 'task' | 'lead' | 'voice'
  imageContent?: string
  fileContent?: string
  fileName?: string
  pollQuestion?: string
  pollOptions?: string[]
  pollVotes?: { [optionText: string]: string[] }
  sharedTaskId?: string
  sharedTaskTitle?: string
  sharedTaskAssignee?: string
  sharedLeadId?: string
  sharedLeadName?: string
  sharedLeadCompany?: string
}

const popularEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🎒', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'
]

export default function ChannelChatPage() {
  const params = useParams()
  const router = useRouter()
  const channelId = (params.channelId as string) || 'general'

  // User Profile
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [employerId, setEmployerId] = useState<string | null>(null)
  const [isEmployer, setIsEmployer] = useState(false)

  // Chat Data
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [employerInfo, setEmployerInfo] = useState<any>(null)

  // UI States
  const [inputText, setInputText] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [selectedMessageForThread, setSelectedMessageForThread] = useState<Message | null>(null)
  const [threadInput, setThreadInput] = useState('')
  const [showMobileChannels, setShowMobileChannels] = useState(false)
  
  // Custom Chat Creation Modal
  const [showCreateChatModal, setShowCreateChatModal] = useState(false)
  const [newChatName, setNewChatName] = useState('')
  const [newChatDescription, setNewChatDescription] = useState('')
  const [newChatIsPublic, setNewChatIsPublic] = useState(true)
  const [newChatSelectedMembers, setNewChatSelectedMembers] = useState<string[]>([])
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)

  // Rich Media Attachments States
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
  const [showTaskSelector, setShowTaskSelector] = useState(false)
  const [showLeadSelector, setShowLeadSelector] = useState(false)
  
  // Loaded Tasks & Leads for sharing
  const [dbTasks, setDbTasks] = useState<any[]>([])
  const [dbLeads, setDbLeads] = useState<any[]>([])

  // Refs
  const messageEndRef = useRef<HTMLDivElement>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

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
          role: emp.role || 'employee',
          avatarLetter: emp.name.charAt(0).toUpperCase()
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
        role: 'employer',
        avatarLetter: 'A'
      })
      setEmployerId(employerSessionId)
      setIsEmployer(true)
    } else {
      // Demo Fallback
      setCurrentUser({
        id: 'mock-user-id',
        name: 'Demo Guest',
        role: 'sales-executive',
        avatarLetter: 'D'
      })
      setEmployerId('mock-employer-id')
      setIsEmployer(false)
    }
  }, [])

  // Sync channels from Firestore and seed defaults if empty
  useEffect(() => {
    if (!employerId) return

    const channelsRef = collection(db, 'employers', employerId, 'channels')
    
    const unsubscribe = onSnapshot(channelsRef, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const defaults = [
            { name: 'general', description: 'Company-wide general discussions', isPublic: true },
            { name: 'announcements', description: 'Important alerts (Employers only)', isPublic: true, isAnnouncements: true },
            { name: 'tech-talk', description: 'Developer and technical notes', isPublic: true },
            { name: 'sales-leads', description: 'Daily leads conversions and pipelines', isPublic: true },
          ]
          for (const ch of defaults) {
            await addDoc(channelsRef, ch)
          }
        } catch (err) {
          console.error("Error seeding default channels:", err)
        }
        return
      }

      const list: Channel[] = []
      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        list.push({
          id: docSnap.id,
          name: data.name,
          description: data.description || '',
          isAnnouncements: data.isAnnouncements || false,
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          members: data.members || []
        } as Channel)
      })
      setChannels(list)
    }, (error) => {
      console.error("Error syncing channels:", error)
    })

    return () => unsubscribe()
  }, [employerId])

  // Update Active Channel object
  useEffect(() => {
    if (channels.length === 0) return
    const current = channels.find(c => c.id === channelId || c.name === channelId)
    if (current) {
      setActiveChannel(current)
    } else {
      setActiveChannel(channels[0])
    }
  }, [channelId, channels])

  // 2. Fetch Employees & Employer Profile details
  useEffect(() => {
    if (!employerId) return
    const fetchUserData = async () => {
      try {
        // Fetch Employer
        if (employerId === 'mock-employer-id') {
          setEmployerInfo({ id: 'mock-employer-id', name: 'Priya Singh (CEO)', role: 'employer' })
          setEmployeesList(mockEmployers[0].employees)
          return
        }
        
        const empDoc = await getDoc(doc(db, 'employers', employerId))
        if (empDoc.exists()) {
          const data = empDoc.data()
          setEmployerInfo({
            id: employerId,
            name: data.companyName || 'Employer Admin',
            role: 'employer'
          })
        }

        // Fetch Employees
        const querySnapshot = await getDocs(collection(db, 'employers', employerId, 'employees'))
        const list: any[] = []
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() })
        })
        setEmployeesList(list)
      } catch (err) {
        console.error('Error fetching user data for chat room creation:', err)
        setEmployeesList(mockEmployers[0].employees)
      }
    }
    fetchUserData()
  }, [employerId])

  // 3. Real-time Message Sync
  useEffect(() => {
    if (!employerId || !channelId) return

    const messagesRef = collection(db, 'employers', employerId, 'channels', channelId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Message[] = []
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Message)
      })
      setMessages(list)
      setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }, (error) => {
      console.error('Error listening to chat messages:', error)
    })

    return () => unsubscribe()
  }, [employerId, channelId])

  // Keep selected thread message updated in real-time
  useEffect(() => {
    if (!selectedMessageForThread) return
    const currentMsg = messages.find(m => m.id === selectedMessageForThread.id)
    if (currentMsg) {
      setSelectedMessageForThread(currentMsg)
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [messages])

  // Fetch Tasks and Leads for sharing
  useEffect(() => {
    if (!employerId) return
    
    const loadTasksAndLeads = async () => {
      try {
        // Fetch Tasks
        let tasksList: any[] = []
        if (employerId !== 'mock-employer-id') {
          const tasksRef = collection(db, 'employers', employerId, 'tasks')
          const tasksSnap = await getDocs(tasksRef)
          tasksSnap.forEach(doc => {
            tasksList.push({ id: doc.id, ...doc.data() })
          })
        }
        if (tasksList.length === 0) {
          tasksList = mockTasks
        }
        setDbTasks(tasksList)
        
        // Fetch Leads
        let leadsList: any[] = []
        if (employerId !== 'mock-employer-id') {
          if (isEmployer) {
            // Fetch leads for all employees
            for (const emp of employeesList) {
              const leadsRef = collection(db, 'employers', employerId, 'employees', emp.id, 'leads')
              const leadsSnap = await getDocs(leadsRef)
              leadsSnap.forEach(doc => {
                leadsList.push({ id: doc.id, ...doc.data(), assignedEmployeeName: emp.name })
              })
            }
          } else if (currentUser) {
            const leadsRef = collection(db, 'employers', employerId, 'employees', currentUser.id, 'leads')
            const leadsSnap = await getDocs(leadsRef)
            leadsSnap.forEach(doc => {
              leadsList.push({ id: doc.id, ...doc.data() })
            })
          }
        }
        if (leadsList.length === 0) {
          leadsList = mockLeads
        }
        setDbLeads(leadsList)
      } catch (err) {
        console.error("Error loading tasks/leads for sharing:", err)
        setDbTasks(mockTasks)
        setDbLeads(mockLeads)
      }
    }
    
    loadTasksAndLeads()
  }, [employerId, employeesList, currentUser, isEmployer])

  // 4. Send Message
  const handleSendMessage = async (e?: React.FormEvent, voiceBase64?: string) => {
    if (e) e.preventDefault()
    
    const hasText = inputText.trim()
    const hasImage = !!selectedImage
    const hasFile = !!selectedFile
    const hasVoice = !!voiceBase64
    
    if (!hasText && !hasImage && !hasFile && !hasVoice) return
    if (!employerId || !currentUser) return

    // Announcements restriction
    if (activeChannel?.isAnnouncements && !isEmployer) {
      alert('Only employers can post in the #announcements channel.')
      return
    }

    // Resolve mentions
    const textWords = inputText.split(' ')
    const mentions = textWords
      .filter(w => w.startsWith('@'))
      .map(w => w.substring(1))

    let msgType: 'text' | 'image' | 'file' | 'voice' = 'text'
    if (hasVoice) msgType = 'voice'
    else if (hasImage) msgType = 'image'
    else if (hasFile) msgType = 'file'

    const messageData: any = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: inputText,
      timestamp: new Date().toISOString(),
      mentions,
      threadReplies: [],
      type: msgType,
      ...(hasVoice ? { voiceUrl: voiceBase64 } : {}),
      ...(hasImage ? { imageContent: selectedImage, fileName: selectedImageName } : {}),
      ...(hasFile ? { fileContent: selectedFile, fileName: selectedFileName } : {})
    }

    try {
      await addDoc(collection(db, 'employers', employerId, 'channels', channelId, 'messages'), messageData)
      setInputText('')
      setRecordedAudioUrl(null)
      setSelectedImage(null)
      setSelectedImageName(null)
      setSelectedFile(null)
      setSelectedFileName(null)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // 5. Thread Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!threadInput.trim() || !selectedMessageForThread || !employerId || !currentUser) return

    const reply: ThreadReply = {
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: threadInput,
      timestamp: new Date().toISOString(),
    }

    try {
      const msgRef = doc(db, 'employers', employerId, 'channels', channelId, 'messages', selectedMessageForThread.id)
      await updateDoc(msgRef, {
        threadReplies: arrayUnion(reply)
      })
      setThreadInput('')
    } catch (error) {
      console.error('Error sending thread reply:', error)
    }
  }

  // 6. Handle Input Mentions Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setInputText(text)

    const words = text.split(' ')
    const lastWord = words[words.length - 1]

    if (lastWord.startsWith('@')) {
      setShowMentions(true)
      setMentionSearch(lastWord.substring(1))
    } else {
      setShowMentions(false)
    }
  }

  const selectMention = (name: string) => {
    const words = inputText.split(' ')
    words.pop() // Remove the partial mention word
    setInputText([...words, `@${name}`, ''].join(' '))
    setShowMentions(false)
  }

  // Filter employees for mentions dropdown
  const filteredEmployees = employeesList.filter((emp) =>
    (emp.name || '').toLowerCase().includes(mentionSearch.toLowerCase())
  )

  // 7. Audio Recorder Logic
  const startRecording = async () => {
    setRecordedAudioUrl(null)
    setAudioChunks([])
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data])
        }
      }

      recorder.onstop = () => {
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      console.warn('Microphone access denied. Using mock recording simulation.', err)
      // Fallback: Simulate voice note by generating mock beep tone
      setIsRecording(true)
      setTimeout(() => {
        // Simulated voice note base64 audio
        const mockVoice = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA"
        setRecordedAudioUrl(mockVoice)
        setIsRecording(false)
      }, 2000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)

      mediaRecorder.onstop = () => {
        // Create audio blob and file reader
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64Data = reader.result as string
          setRecordedAudioUrl(base64Data)
        }
      }
    } else {
      setIsRecording(false)
    }
  }

  const sendVoiceMessage = () => {
    if (recordedAudioUrl) {
      handleSendMessage(undefined, recordedAudioUrl)
    }
  }

  // Create Dynamic Channel/Chat
  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChatName.trim() || !employerId || !currentUser) return

    const membersList = [...newChatSelectedMembers]
    // Creator must be a member of their own private chat
    if (!newChatIsPublic && !membersList.includes(currentUser.id)) {
      membersList.push(currentUser.id)
    }

    try {
      const docRef = await addDoc(collection(db, 'employers', employerId, 'channels'), {
        name: newChatName.trim().replace(/\s+/g, '-').toLowerCase(),
        description: newChatDescription,
        isPublic: newChatIsPublic,
        isAnnouncements: false,
        members: membersList,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
      })

      // Reset
      setNewChatName('')
      setNewChatDescription('')
      setNewChatIsPublic(true)
      setNewChatSelectedMembers([])
      setShowCreateChatModal(false)
      
      // Navigate to the newly created channel
      router.push(`/chat/${docRef.id}`)
    } catch (err) {
      console.error("Error creating chat channel:", err)
    }
  }

  const toggleChatMemberSelection = (id: string) => {
    if (newChatSelectedMembers.includes(id)) {
      setNewChatSelectedMembers(prev => prev.filter(m => m !== id))
    } else {
      setNewChatSelectedMembers(prev => [...prev, id])
    }
  }

  // Filter channels based on memberships and role (Employers see all)
  const visibleChannels = channels.filter((chan) => {
    if (isEmployer) return true
    if (chan.isPublic) return true
    return chan.members && chan.members.includes(currentUser?.id)
  })

  // Image and Document Input Handlers
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      const img = new window.Image()
      img.src = reader.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          // Compress to JPEG with 40% quality (0.4)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4)
          setSelectedImage(compressedDataUrl)
          setSelectedImageName(file.name.replace(/\.[^/.]+$/, "") + ".jpg")
        } else {
          setSelectedImage(reader.result as string)
          setSelectedImageName(file.name)
        }
        setSelectedFile(null)
        setSelectedFileName(null)
        setIsAttachmentMenuOpen(false)
      }
    }
  }

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 800 * 1024) {
      alert("Please upload a file smaller than 800KB.")
      return
    }
    
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setSelectedFile(reader.result as string)
      setSelectedFileName(file.name)
      setSelectedImage(null)
      setSelectedImageName(null)
      setIsAttachmentMenuOpen(false)
    }
  }

  // Send Poll Action
  const handleSendPoll = async () => {
    if (!employerId || !currentUser) return
    if (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2) {
      alert("Please enter a question and at least 2 options.")
      return
    }
    
    const cleanOptions = pollOptions.map(opt => opt.trim()).filter(Boolean)
    const initialVotes: { [key: string]: string[] } = {}
    cleanOptions.forEach(opt => {
      initialVotes[opt] = []
    })

    const messageData = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: `📊 Poll: ${pollQuestion}`,
      timestamp: new Date().toISOString(),
      mentions: [],
      threadReplies: [],
      type: 'poll',
      pollQuestion: pollQuestion,
      pollOptions: cleanOptions,
      pollVotes: initialVotes
    }

    try {
      await addDoc(collection(db, 'employers', employerId, 'channels', channelId, 'messages'), messageData)
      setShowPollCreator(false)
      setPollQuestion('')
      setPollOptions(['', ''])
    } catch (err) {
      console.error("Error creating poll message:", err)
    }
  }

  // Share Task Action
  const handleShareTask = async (task: any) => {
    if (!employerId || !currentUser) return
    
    const messageData = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: `📋 Shared Task: ${task.title}`,
      timestamp: new Date().toISOString(),
      mentions: [],
      threadReplies: [],
      type: 'task',
      sharedTaskId: task.id,
      sharedTaskTitle: task.title,
      sharedTaskAssignee: task.assignee || 'Unassigned'
    }

    try {
      await addDoc(collection(db, 'employers', employerId, 'channels', channelId, 'messages'), messageData)
      setShowTaskSelector(false)
    } catch (err) {
      console.error("Error sharing task:", err)
    }
  }

  // Share Lead Action
  const handleShareLead = async (lead: any) => {
    if (!employerId || !currentUser) return
    
    const messageData = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: `💼 Shared Lead: ${lead.name}`,
      timestamp: new Date().toISOString(),
      mentions: [],
      threadReplies: [],
      type: 'lead',
      sharedLeadId: lead.id,
      sharedLeadName: lead.name,
      sharedLeadCompany: lead.company || 'Unknown'
    }

    try {
      await addDoc(collection(db, 'employers', employerId, 'channels', channelId, 'messages'), messageData)
      setShowLeadSelector(false)
    } catch (err) {
      console.error("Error sharing lead:", err)
    }
  }

  // Vote on Poll Option
  const handleVote = async (messageId: string, option: string) => {
    if (!employerId || !currentUser) return
    const msgRef = doc(db, 'employers', employerId, 'channels', channelId, 'messages', messageId)
    
    try {
      const msgSnap = await getDoc(msgRef)
      if (!msgSnap.exists()) return
      const data = msgSnap.data() as Message
      const pollVotes = data.pollVotes || {}
      
      const newVotes: { [key: string]: string[] } = {}
      
      if (data.pollOptions) {
        data.pollOptions.forEach(opt => {
          newVotes[opt] = pollVotes[opt] || []
        })
      }
      
      const userId = currentUser.id
      
      Object.keys(newVotes).forEach(opt => {
        if (opt === option) {
          if (newVotes[opt].includes(userId)) {
            newVotes[opt] = newVotes[opt].filter(id => id !== userId)
          } else {
            newVotes[opt] = [...newVotes[opt], userId]
          }
        } else {
          newVotes[opt] = newVotes[opt].filter(id => id !== userId)
        }
      })
      
      await updateDoc(msgRef, { pollVotes: newVotes })
    } catch (err) {
      console.error("Error updating vote:", err)
    }
  }

  return (
    <CollaborationLayout>
      <div className="flex h-[calc(100vh-120px)] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative">
        {/* Mobile Sidebar overlay backdrop */}
        {showMobileChannels && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setShowMobileChannels(false)}
          />
        )}

        {/* Left Side Channels Drawer */}
        <div className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          showMobileChannels ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 border-b border-slate-800 text-left flex items-center justify-between">
            <div>
              <h3 className="text-white font-extrabold flex items-center gap-2">
                <Users size={18} className="text-purple-400" />
                Team Chats
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">GlowAI Workspace</p>
            </div>
            <button
              onClick={() => setShowCreateChatModal(true)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Create Chat Group"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 text-left">
            {visibleChannels.map((chan) => {
              const active = chan.id === channelId || chan.name === channelId
              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    router.push(`/chat/${chan.id}`)
                    setShowMobileChannels(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    active
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Hash size={16} className={active ? 'text-white' : 'text-slate-500'} />
                    {chan.name}
                  </span>
                  {chan.isAnnouncements && (
                    <span className="text-[9px] bg-slate-800 text-purple-300 px-1.5 py-0.5 rounded font-black uppercase flex-shrink-0">Announce</span>
                  )}
                  {!chan.isPublic && (
                    <span className="text-[9px] bg-slate-800 text-pink-300 px-1.5 py-0.5 rounded font-black uppercase flex-shrink-0">Private</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Center Main Chat Panel */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* Active Channel Header */}
          <div className="px-4 lg:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 text-left">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setShowMobileChannels(true)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl mr-2 flex-shrink-0"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <Hash className="text-purple-500 flex-shrink-0" size={18} />
                  <span className="truncate">{activeChannel?.name}</span>
                </h2>
                <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5 line-clamp-1">{activeChannel?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <Users size={14} className="text-slate-400" />
              <span className="hidden sm:inline">{employeesList.length + 1} Active</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                <MessageSquare className="text-slate-300 animate-bounce" size={40} />
                <p className="text-slate-500 font-semibold text-sm">Welcome to #{activeChannel?.name}!</p>
                <p className="text-slate-400 text-xs max-w-xs">Be the first to start a conversation in this team channel.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = currentUser && msg.senderId === currentUser.id
                return (
                  <div key={msg.id} className={`flex items-start gap-3 text-left group`}>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{msg.senderName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded capitalize font-bold">
                          {msg.senderRole.replace('-', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      
                      {/* Message Bubble content */}
                      <div className="mt-1.5 text-sm text-slate-800 leading-relaxed font-medium">
                        {/* Mention highlights */}
                        {msg.text && msg.text.split(' ').map((word, idx) => {
                          if (word.startsWith('@')) {
                            return <span key={idx} className="bg-purple-100 text-purple-700 font-bold px-1 rounded mr-1">{word}</span>
                          }
                          return word + ' '
                        })}

                        {/* Image attachment rendering */}
                        {msg.type === 'image' && msg.imageContent && (
                          <div className="mt-2.5 rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-w-sm group relative">
                            <img 
                              src={msg.imageContent} 
                              alt={msg.fileName || "Uploaded Image"} 
                              className="w-full h-auto object-cover max-h-60 transition-transform duration-300 hover:scale-105"
                            />
                            {msg.fileName && (
                              <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 p-2 text-white text-[10px] truncate font-bold">
                                {msg.fileName}
                              </div>
                            )}
                          </div>
                        )}

                        {/* File attachment rendering */}
                        {msg.type === 'file' && msg.fileContent && (
                          <div className="mt-2.5 p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between max-w-sm shadow-sm hover:border-purple-300 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                                <FileText size={20} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{msg.fileName || 'Attached File'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Document</p>
                              </div>
                            </div>
                            <a 
                              href={msg.fileContent} 
                              download={msg.fileName || 'file'}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors flex-shrink-0"
                              title="Download document"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        )}

                        {/* Interactive Poll rendering */}
                        {msg.type === 'poll' && msg.pollQuestion && (
                          <div className="mt-3 p-5 bg-white border border-purple-100 rounded-3xl max-w-md shadow-sm space-y-4">
                            <div className="flex items-start gap-2.5">
                              <BarChart2 className="text-purple-600 mt-0.5" size={18} />
                              <h4 className="text-xs font-extrabold text-slate-800">{msg.pollQuestion}</h4>
                            </div>
                            <div className="space-y-3">
                              {msg.pollOptions?.map((option, oIdx) => {
                                const votes = msg.pollVotes?.[option] || []
                                const hasVoted = currentUser && votes.includes(currentUser.id)
                                const totalVotes = Object.values(msg.pollVotes || {}).reduce((acc, curr) => acc + curr.length, 0)
                                const percentage = totalVotes > 0 ? Math.round((votes.length / totalVotes) * 100) : 0
                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleVote(msg.id, option)}
                                    className={`w-full text-left p-3 rounded-2xl border transition-all relative overflow-hidden group flex items-center justify-between ${
                                      hasVoted 
                                        ? 'border-purple-600 bg-purple-50/20 text-purple-900 font-black' 
                                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700 font-semibold'
                                    }`}
                                  >
                                    <div 
                                      className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                        hasVoted ? 'bg-purple-500/10' : 'bg-slate-200/50'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                    <span className="relative z-10 text-xs truncate flex items-center gap-2">
                                      {hasVoted && <ThumbsUp size={12} className="text-purple-600 flex-shrink-0" />}
                                      {option}
                                    </span>
                                    <span className="relative z-10 text-[10px] text-slate-400 font-bold ml-2">
                                      {votes.length} ({percentage}%)
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold tracking-wide flex justify-between">
                              <span>Click an option to cast or retract vote</span>
                              <span>Total Votes: {Object.values(msg.pollVotes || {}).reduce((acc, curr) => acc + curr.length, 0)}</span>
                            </div>
                          </div>
                        )}

                        {/* CRM Task Card rendering */}
                        {msg.type === 'task' && msg.sharedTaskId && (
                          <div className="mt-2.5 p-4 bg-white border border-indigo-100 rounded-2xl flex flex-col max-w-sm shadow-sm hover:border-indigo-300 transition-colors">
                            <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-wider mb-2">
                              <CheckSquare size={14} />
                              Shared CRM Task
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">{msg.sharedTaskTitle}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Assignee: {msg.sharedTaskAssignee}</p>
                            <button
                              onClick={() => router.push('/tasks')}
                              className="mt-3 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-[10px] font-bold text-indigo-700 transition-colors flex items-center justify-center gap-1.5 w-full"
                            >
                              View on Tasks Manager
                              <ExternalLink size={10} />
                            </button>
                          </div>
                        )}

                        {/* CRM Lead Card rendering */}
                        {msg.type === 'lead' && msg.sharedLeadId && (
                          <div className="mt-2.5 p-4 bg-white border border-pink-100 rounded-2xl flex flex-col max-w-sm shadow-sm hover:border-pink-300 transition-colors">
                            <div className="flex items-center gap-2 text-pink-600 text-[10px] font-black uppercase tracking-wider mb-2">
                              <Briefcase size={14} />
                              Shared CRM Lead
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">{msg.sharedLeadName}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Company: {msg.sharedLeadCompany}</p>
                            <button
                              onClick={() => router.push('/leads')}
                              className="mt-3 py-1.5 px-3 bg-pink-50 hover:bg-pink-100 rounded-xl text-[10px] font-bold text-pink-700 transition-colors flex items-center justify-center gap-1.5 w-full"
                            >
                              Open in Leads pipeline
                              <ExternalLink size={10} />
                            </button>
                          </div>
                        )}

                        {/* Playable Voice Note */}
                        {msg.voiceUrl && (
                          <div className="mt-2 flex items-center gap-2 p-2.5 bg-purple-50 border border-purple-100 rounded-2xl max-w-sm">
                            <Volume2 size={16} className="text-purple-600 animate-pulse" />
                            <audio src={msg.voiceUrl} controls className="h-8 max-w-full accent-purple-600 outline-none" />
                          </div>
                        )}
                      </div>

                      {/* Thread triggers & actions */}
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => setSelectedMessageForThread(msg)}
                          className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-bold"
                        >
                          <MessageSquare size={12} />
                          {msg.threadReplies && msg.threadReplies.length > 0 
                            ? `${msg.threadReplies.length} replies` 
                            : 'Reply in thread'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Mentions Dropdown UI */}
          <AnimatePresence>
            {showMentions && filteredEmployees.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-24 left-6 z-20 w-64 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-2 text-left"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 border-b border-slate-50 mb-1">Mention Employee</p>
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => selectMention(emp.name)}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    <div className="h-5 w-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {(emp.name || 'E').charAt(0).toUpperCase()}
                    </div>
                    {emp.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Form Area */}
          <div className="p-4 border-t border-slate-100 bg-white relative">
            {/* Hidden Input File Element hooks */}
            <input 
              type="file" 
              ref={imageInputRef} 
              accept="image/*" 
              onChange={handleImageFileChange} 
              className="hidden" 
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.xml" 
              onChange={handleDocumentFileChange} 
              className="hidden" 
            />

            {/* Premium Floating Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-24 right-6 z-30 w-72 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 text-left"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-black text-slate-800">Quick Emojis</span>
                    <button onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-2.5 max-h-40 overflow-y-auto pr-1">
                    {popularEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInputText(prev => prev + emoji)
                          setShowEmojiPicker(false)
                        }}
                        className="text-lg hover:scale-125 transition-transform duration-100 flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CRM Task Selector Dropdown */}
            <AnimatePresence>
              {showTaskSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-24 left-6 z-30 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 text-left"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-indigo-600" />
                      Select Task to Share
                    </span>
                    <button onClick={() => setShowTaskSelector(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {dbTasks.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center font-bold py-6">No tasks found</p>
                    ) : (
                      dbTasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleShareTask(task)}
                          className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/20 text-left transition-all text-xs font-semibold text-slate-700"
                        >
                          <p className="font-extrabold truncate text-slate-800">{task.title}</p>
                          <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Assignee: {task.assignee || 'Unassigned'}</p>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CRM Lead Selector Dropdown */}
            <AnimatePresence>
              {showLeadSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-24 left-6 z-30 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 text-left"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-pink-600" />
                      Select Lead to Share
                    </span>
                    <button onClick={() => setShowLeadSelector(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {dbLeads.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center font-bold py-6">No leads found</p>
                    ) : (
                      dbLeads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => handleShareLead(lead)}
                          className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-pink-300 hover:bg-pink-50/20 text-left transition-all text-xs font-semibold text-slate-700"
                        >
                          <p className="font-extrabold truncate text-slate-800">{lead.name}</p>
                          <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Company: {lead.company || 'Unknown'}</p>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Poll Creator Modal overlay */}
            <AnimatePresence>
              {showPollCreator && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" 
                    onClick={() => setShowPollCreator(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xl relative z-10 w-full max-w-sm text-left space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <BarChart2 size={18} className="text-purple-600" />
                        Create Workspace Poll
                      </h4>
                      <button onClick={() => setShowPollCreator(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Question</label>
                        <input
                          type="text"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder="e.g. Where should we go for lunch?"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs font-semibold focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Options</label>
                        {pollOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...pollOptions]
                                newOpts[idx] = e.target.value
                                setPollOptions(newOpts)
                              }}
                              placeholder={`Option ${idx + 1}`}
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs font-semibold focus:ring-1 focus:ring-purple-500"
                            />
                            {pollOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== idx))}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setPollOptions(prev => [...prev, ''])}
                          className="text-[10px] font-bold text-purple-600 hover:text-purple-800 mt-1 flex items-center gap-1"
                        >
                          <Plus size={12} />
                          Add Option
                        </button>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPollCreator(false)}
                        className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSendPoll}
                        className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs"
                      >
                        Send Poll
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {activeChannel?.isAnnouncements && !isEmployer ? (
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-left flex items-start gap-3">
                <Info className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-xs text-purple-800 font-bold leading-relaxed">
                  Only employers are allowed to post broadcasts and news updates inside this announcements channel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                {/* Image upload draft preview */}
                {selectedImage && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={selectedImage} className="w-10 h-10 object-cover rounded-xl" alt="Preview" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedImageName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Image draft</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null)
                        setSelectedImageName(null)
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* File upload draft preview */}
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedFileName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Document draft</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null)
                        setSelectedFileName(null)
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Voice Note draft area */}
                {recordedAudioUrl && (
                  <div className="flex items-center justify-between p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} className="text-purple-600" />
                      <audio src={recordedAudioUrl} controls className="h-8 max-w-xs" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecordedAudioUrl(null)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {/* Microphone / Recording Button */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3.5 rounded-2xl flex items-center justify-center transition-all ${
                      isRecording 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Record Voice Note'}
                  >
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  {/* Attachment Toggle Popover Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAttachmentMenuOpen(!isAttachmentMenuOpen)
                        setShowEmojiPicker(false)
                      }}
                      className={`p-3.5 rounded-2xl flex items-center justify-center transition-all ${
                        isAttachmentMenuOpen 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Attachments & Actions"
                    >
                      <Paperclip size={18} />
                    </button>

                    <AnimatePresence>
                      {isAttachmentMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 15 }}
                          className="absolute bottom-16 left-0 z-30 w-56 bg-white border border-slate-200 rounded-3xl shadow-2xl p-2.5 text-left flex flex-col gap-1.5"
                        >
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all"
                          >
                            <ImageIcon size={16} className="text-purple-600" />
                            Upload Image
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all"
                          >
                            <FileText size={16} className="text-blue-600" />
                            Attach Document
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPollCreator(true)
                              setIsAttachmentMenuOpen(false)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all"
                          >
                            <BarChart2 size={16} className="text-amber-600" />
                            Create Poll
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowTaskSelector(true)
                              setIsAttachmentMenuOpen(false)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all"
                          >
                            <CheckSquare size={16} className="text-indigo-600" />
                            Share CRM Task
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLeadSelector(true)
                              setIsAttachmentMenuOpen(false)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all"
                          >
                            <Briefcase size={16} className="text-pink-600" />
                            Share CRM Lead
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Main Text Input */}
                  <div className="flex-1 relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder="Type a message (use @ to mention)..."
                      className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                    />
                    
                    {/* Emoji Popover trigger inside input */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker)
                        setIsAttachmentMenuOpen(false)
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <Smile size={18} />
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={recordedAudioUrl ? sendVoiceMessage : () => handleSendMessage()}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side Threads Drawer Backdrop */}
        {selectedMessageForThread && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 lg:hidden"
            onClick={() => setSelectedMessageForThread(null)}
          />
        )}

        {/* Right Side Threads Drawer */}
        <AnimatePresence>
          {selectedMessageForThread && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: typeof window !== 'undefined' && window.innerWidth < 1024 ? 300 : 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="fixed lg:static inset-y-0 right-0 z-40 w-[300px] lg:w-[340px] bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden shadow-2xl lg:shadow-none"
            >
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 text-left">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Thread Replies</h3>
                  <p className="text-[10px] text-slate-500">In #{activeChannel?.name}</p>
                </div>
                <button
                  onClick={() => setSelectedMessageForThread(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Original Message Panel */}
              <div className="p-4 border-b border-slate-100 bg-purple-50/20 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {selectedMessageForThread.senderName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-slate-800">{selectedMessageForThread.senderName}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold pl-8">{selectedMessageForThread.text}</p>
              </div>

              {/* Replies Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
                {selectedMessageForThread.threadReplies && selectedMessageForThread.threadReplies.length > 0 ? (
                  selectedMessageForThread.threadReplies.map((rep, idx) => (
                    <div key={idx} className="text-left space-y-1 pl-4 border-l-2 border-purple-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rep.senderName}</span>
                        <span className="text-[9px] text-slate-400 font-bold capitalize font-medium">({rep.senderRole.replace('-', ' ')})</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">{rep.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center font-bold py-10">No replies yet. Start the thread!</p>
                )}
                <div ref={threadEndRef} />
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={threadInput}
                  onChange={(e) => setThreadInput(e.target.value)}
                  placeholder="Reply in thread..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-purple-500 outline-none text-xs font-semibold"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Reply
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Chat Modal */}
      <AnimatePresence>
        {showCreateChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateChatModal(false)}
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
                  <Hash className="text-purple-600" size={22} />
                  Create Chat Room
                </h3>
                <button onClick={() => setShowCreateChatModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateChat} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Chat Room Name</label>
                  <input
                    type="text"
                    required
                    placeholder="marketing-sync"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    placeholder="E.g. private channel to discuss Q3 campaign strategies..."
                    value={newChatDescription}
                    onChange={(e) => setNewChatDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold resize-none"
                  />
                </div>

                {/* Public Toggle Switch */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Public Channel</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Anyone in the company can see and join</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newChatIsPublic}
                    onChange={(e) => setNewChatIsPublic(e.target.checked)}
                    className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>

                {/* Select private members */}
                {!newChatIsPublic && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Invite Members (Private Chat)</label>
                    <div className="border border-slate-200 rounded-2xl max-h-40 overflow-y-auto p-3 space-y-2.5">
                      {/* Employer option (only show for employees creating chat) */}
                      {employerInfo && !isEmployer && (
                        <button
                          key={employerInfo.id}
                          type="button"
                          onClick={() => toggleChatMemberSelection(employerInfo.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all border ${
                            newChatSelectedMembers.includes(employerInfo.id) 
                              ? 'border-purple-500 bg-purple-50/50 text-purple-700' 
                              : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newChatSelectedMembers.includes(employerInfo.id)}
                              readOnly
                              className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 mr-1"
                            />
                            <div className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                              {employerInfo.name.charAt(0).toUpperCase()}
                            </div>
                            {employerInfo.name} (Employer)
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">Owner / CEO</span>
                        </button>
                      )}
                      {employeesList.filter((emp) => emp.id !== currentUser?.id).map((emp) => {
                        const selected = newChatSelectedMembers.includes(emp.id)
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => toggleChatMemberSelection(emp.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all border ${
                              selected 
                                ? 'border-purple-500 bg-purple-50/50 text-purple-700' 
                                : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selected}
                                readOnly
                                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 mr-1"
                              />
                              <div className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                                {(emp.name || 'E').charAt(0).toUpperCase()}
                              </div>
                              {emp.name}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize font-medium">{emp.role}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateChatModal(false)}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all text-xs"
                  >
                    Create Room
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
