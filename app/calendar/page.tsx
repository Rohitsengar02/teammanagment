'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { mockEvents } from '@/lib/mock-data'
import { Calendar, Video, Clock, User, Link as LinkIcon, Sparkles, AlertCircle, ArrowUpRight, History } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'past'>('scheduled')
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)

  useEffect(() => {
    const loggedInStr = localStorage.getItem('loggedInEmployee')
    if (loggedInStr) {
      try {
        const emp = JSON.parse(loggedInStr)
        setEmployeeInfo(emp)

        if (emp.employerId && emp.id) {
          const remindersRef = collection(db, 'employers', emp.employerId, 'employees', emp.id, 'reminders')
          
          const unsubscribe = onSnapshot(remindersRef, (snapshot) => {
            const list: any[] = []
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() })
            })
            setReminders(list)
            setLoading(false)
          }, (error) => {
            console.error('Error fetching calendar reminders:', error)
            setLoading(false)
          })

          return () => unsubscribe()
        }
      } catch (err) {
        console.error('Error parsing employee info in calendar:', err)
        setLoading(false)
      }
    } else {
      // Fallback simulation (mock events map to reminder fields)
      const mapped = mockEvents.map((evt) => ({
        id: evt.id,
        title: evt.title,
        description: evt.notes,
        dateTime: `${evt.date}T${evt.time.includes('AM') || evt.time.includes('PM') ? '12:00' : evt.time}`,
        leadName: evt.participant,
        meetLink: 'https://meet.google.com/abc-defg-hij',
        triggered: false
      }))
      setReminders(mapped)
      setLoading(false)
    }
  }, [])

  // Process reminders into Scheduled and Past categories
  const now = new Date()

  const processedReminders = reminders.map((r) => {
    const rDate = r.dateTime ? new Date(r.dateTime) : new Date(r.date + 'T12:00')
    const isPast = r.triggered || rDate.getTime() < now.getTime()
    return {
      ...r,
      parsedDate: rDate,
      isPast
    }
  })

  // Filter & Sort
  // Scheduled meetings: isPast === false, sorted ASCENDING (closest first)
  const scheduledMeetings = processedReminders
    .filter((r) => !r.isPast)
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())

  // Past meetings: isPast === true, sorted DESCENDING (newest past meetings first)
  const pastMeetings = processedReminders
    .filter((r) => r.isPast)
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())

  const displayedMeetings = activeTab === 'scheduled' ? scheduledMeetings : pastMeetings

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Meeting Calendar</h1>
            <p className="text-slate-600 mt-2">View upcoming Google Meet schedule and archive of past Client talks.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-widest self-start md:self-auto">
            <Sparkles size={12} className="text-indigo-600" /> Live Updates
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-100 pb-px mb-6">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'scheduled'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Clock size={16} />
            Scheduled Meetings
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'scheduled' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
              {scheduledMeetings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'past'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <History size={16} />
            Past Meetings
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'past' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
              {pastMeetings.length}
            </span>
          </button>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
          <p className="text-slate-500 text-sm font-semibold">Syncing calendar schedule...</p>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          <AnimatePresence mode="popLayout">
            {displayedMeetings.map((meeting, idx) => {
              const formattedDate = meeting.parsedDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
              const formattedTime = meeting.parsedDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex-1 space-y-3.5">
                    {/* Time & Date Header */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700">
                        <Clock size={14} className="text-indigo-400" />
                        <span>{formattedTime}</span>
                      </div>
                      {meeting.isPast && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-lg md:text-xl">{meeting.title}</h3>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">{meeting.description || meeting.notes || 'No description provided.'}</p>
                    </div>

                    {/* Participant Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        <span>Client: {meeting.leadName || 'Unnamed Lead'}</span>
                      </div>
                      {meeting.clientCompany && (
                        <>
                          <span>•</span>
                          <span>Company: {meeting.clientCompany}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions / Join Links */}
                  {meeting.meetLink ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch md:self-auto justify-end md:border-l md:border-slate-50 md:pl-6">
                      <a
                        href={meeting.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-rose-100 transition-all shadow-md"
                      >
                        <Video size={16} />
                        Join Google Meet
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold self-end md:self-auto py-2">
                      <AlertCircle size={14} />
                      No meeting link provided
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {displayedMeetings.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 font-semibold">No {activeTab} meetings found.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
