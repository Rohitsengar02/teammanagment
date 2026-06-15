'use client'

import { useState, useEffect, useRef } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Video, X, User, Briefcase, Mail, Phone, MessageSquare, Volume2, VolumeX } from 'lucide-react'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Reminder {
  id: string
  leadId: string
  leadName: string
  clientEmail: string
  clientPhone: string
  clientCompany: string
  lastTalkNotes: string
  title: string
  dateTime: string
  meetLink: string
  triggered: boolean
  description: string
}

// Custom Web Audio API alarm sound synthesizer
class AlarmSound {
  private ctx: AudioContext | null = null
  private interval: any = null

  play() {
    if (this.ctx) return
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    this.ctx = new AudioContextClass()

    const playTone = () => {
      if (!this.ctx) return
      
      const osc1 = this.ctx.createOscillator()
      const osc2 = this.ctx.createOscillator()
      const gainNode = this.ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime) // C5
      
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime) // E5

      gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4)

      osc1.connect(gainNode)
      osc2.connect(gainNode)
      gainNode.connect(this.ctx.destination)

      osc1.start()
      osc2.start()
      osc1.stop(this.ctx.currentTime + 1.4)
      osc2.stop(this.ctx.currentTime + 1.4)
    }

    playTone()
    this.interval = setInterval(playTone, 1600)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
  }
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [triggeredReminder, setTriggeredReminder] = useState<Reminder | null>(null)
  const alarmRef = useRef<AlarmSound | null>(null)

  useEffect(() => {
    alarmRef.current = new AlarmSound()
    return () => {
      if (alarmRef.current) {
        alarmRef.current.stop()
      }
    }
  }, [])

  // Poll active reminders from Firestore
  useEffect(() => {
    const loggedInEmployeeStr = localStorage.getItem('loggedInEmployee')
    if (!loggedInEmployeeStr) return

    let unsubscribe: () => void = () => {}

    try {
      const employee = JSON.parse(loggedInEmployeeStr)
      const employerId = employee.employerId
      const employeeId = employee.id

      if (employerId && employeeId && employerId !== 'mock-employer-id') {
        const remindersRef = collection(db, 'employers', employerId, 'employees', employeeId, 'reminders')
        const activeQuery = query(remindersRef, where('triggered', '==', false))
        
        unsubscribe = onSnapshot(activeQuery, (snapshot) => {
          const list: Reminder[] = []
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Reminder)
          })
          setReminders(list)
        }, (error) => {
          console.error("Error listening to reminders:", error)
        })
      }
    } catch (e) {
      console.error(e)
    }

    return () => unsubscribe()
  }, [])

  // Check reminder times every 3 seconds
  useEffect(() => {
    const checkReminders = async () => {
      if (reminders.length === 0 || triggeredReminder) return

      const now = new Date()
      const triggered = reminders.find((r) => {
        const triggerTime = new Date(r.dateTime)
        return triggerTime <= now
      })

      if (triggered) {
        setTriggeredReminder(triggered)
        if (alarmRef.current) {
          alarmRef.current.play()
        }

        // Add to timeline and mark triggered in Firestore immediately to prevent duplicates
        const loggedInEmployeeStr = localStorage.getItem('loggedInEmployee')
        if (loggedInEmployeeStr) {
          try {
            const employee = JSON.parse(loggedInEmployeeStr)
            const employerId = employee.employerId
            const employeeId = employee.id

            if (employerId && employeeId && employerId !== 'mock-employer-id') {
              // Mark as triggered in DB
              const docRef = doc(db, 'employers', employerId, 'employees', employeeId, 'reminders', triggered.id)
              await updateDoc(docRef, { triggered: true })

              // Create timeline record
              const timelineRef = collection(db, 'employers', employerId, 'employees', employeeId, 'leads', triggered.leadId, 'timeline')
              await addDoc(timelineRef, {
                title: `Reminder Triggered: ${triggered.title}`,
                notes: triggered.description || 'Meeting reminder triggered.',
                type: 'meeting',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().split(' ')[0].substring(0, 5),
                meetLink: triggered.meetLink || '',
              })
            }
          } catch (error) {
            console.error('Error logging trigger to timeline:', error)
          }
        }
      }
    }

    const interval = setInterval(checkReminders, 3000)
    return () => clearInterval(interval)
  }, [reminders, triggeredReminder])

  // Dismiss Triggered Reminder
  const handleDismiss = () => {
    if (alarmRef.current) {
      alarmRef.current.stop()
    }
    setTriggeredReminder(null)
  }

  // Join Google Meet and Dismiss
  const handleJoinMeet = () => {
    if (!triggeredReminder) return

    if (alarmRef.current) {
      alarmRef.current.stop()
    }

    if (triggeredReminder.meetLink) {
      window.open(triggeredReminder.meetLink, '_blank')
    }

    setTriggeredReminder(null)
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      {/* Desktop Sidebar Container */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar - overlays when open */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden">
          <Sidebar />
        </div>
        
        {/* Header & Content */}
        <Header />
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </div>

      {/* Reminder Trigger Alert Overlay Modal */}
      <AnimatePresence>
        {triggeredReminder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-955/80 backdrop-blur-md"
            />

            {/* Glowing reminder container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-slate-900 border border-purple-500/30 text-white rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden z-10 p-6 md:p-8 flex flex-col"
            >
              {/* Header Pulse */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-bounce shadow-lg shadow-purple-500/20">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-none">Reminder Triggered!</h3>
                  <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                    </span>
                    Live Meeting Alert
                  </p>
                </div>
              </div>

              {/* Title & Details */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6 text-left">
                <h4 className="font-extrabold text-lg text-white mb-2">{triggeredReminder.title}</h4>
                {triggeredReminder.description && (
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{triggeredReminder.description}</p>
                )}
                
                {/* Google Meet CTA Link */}
                {triggeredReminder.meetLink && (
                  <button
                    onClick={handleJoinMeet}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-xl shadow-emerald-500/10 cursor-pointer"
                  >
                    <Video size={18} />
                    Join Google Meet &rarr;
                  </button>
                )}
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><User size={12}/> Client Profile</span>
                  <p className="text-sm font-bold text-white">{triggeredReminder.leadName}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5"><Briefcase size={12} /> {triggeredReminder.clientCompany}</p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Phone size={12}/> Contact Details</span>
                  <p className="text-xs text-slate-300 truncate">{triggeredReminder.clientEmail}</p>
                  <p className="text-xs text-slate-300">{triggeredReminder.clientPhone}</p>
                </div>
              </div>

              {/* Last Talk/Notes timeline */}
              {triggeredReminder.lastTalkNotes && (
                <div className="p-4 bg-purple-950/20 border border-purple-500/10 rounded-xl text-left mb-8">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <MessageSquare size={12} /> Last Timeline Talks
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">&quot;{triggeredReminder.lastTalkNotes}&quot;</p>
                </div>
              )}

              {/* Dismiss CTA */}
              <div className="flex gap-4 border-t border-slate-800 pt-6">
                <button
                  onClick={handleDismiss}
                  className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-all text-sm border border-slate-700 flex items-center justify-center gap-2"
                >
                  <X size={16} /> Dismiss Alarm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
