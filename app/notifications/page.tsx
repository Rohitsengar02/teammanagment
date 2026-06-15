'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, Clipboard, Clock, AlertTriangle, Eye, Loader2, Sparkles, Check, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface AppNotification {
  id: string
  title: string
  message: string
  type: 'task' | 'leave_approved' | 'leave_rejected'
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)

  useEffect(() => {
    const loggedInStr = localStorage.getItem('loggedInEmployee')
    if (loggedInStr) {
      try {
        const emp = JSON.parse(loggedInStr)
        setEmployeeInfo(emp)

        if (emp.employerId && emp.id) {
          const notificationsRef = collection(db, 'employers', emp.employerId, 'employees', emp.id, 'notifications')
          const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
            const list: AppNotification[] = []
            snapshot.forEach((docSnap) => {
              const data = docSnap.data()
              list.push({
                id: docSnap.id,
                title: data.title || 'Notification',
                message: data.message || '',
                type: data.type || 'task',
                read: !!data.read,
                createdAt: data.createdAt || new Date().toISOString()
              })
            })
            // Sort by createdAt desc
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            setNotifications(list)
            setLoading(false)
          }, (err) => {
            console.error('Error fetching notifications:', err)
            setLoading(false)
          })

          return () => unsubscribe()
        }
      } catch (err) {
        console.error('Error parsing employee session:', err)
        setLoading(false)
      }
    } else {
      // Fallback mock notifications
      const mockList: AppNotification[] = [
        {
          id: 'mock-1',
          title: 'Welcome to GlowAI',
          message: 'Your portal login has been created successfully.',
          type: 'task',
          read: false,
          createdAt: new Date().toISOString()
        }
      ]
      setNotifications(mockList)
      setLoading(false)
    }
  }, [])

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (!employeeInfo?.employerId || !employeeInfo?.id) return

    try {
      const promises = notifications
        .filter(n => !n.read)
        .map(n => {
          const docRef = doc(db, 'employers', employeeInfo.employerId, 'employees', employeeInfo.id, 'notifications', n.id)
          return updateDoc(docRef, { read: true })
        })
      await Promise.all(promises)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  // Toggle single read status
  const handleMarkRead = async (id: string, currentRead: boolean) => {
    if (!employeeInfo?.employerId || !employeeInfo?.id) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !currentRead } : n))
      return
    }

    try {
      const docRef = doc(db, 'employers', employeeInfo.employerId, 'employees', employeeInfo.id, 'notifications', id)
      await updateDoc(docRef, { read: !currentRead })
    } catch (err) {
      console.error('Error toggling notification read status:', err)
    }
  }

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    if (!employeeInfo?.employerId || !employeeInfo?.id) {
      setNotifications(prev => prev.filter(n => n.id !== id))
      return
    }

    try {
      const docRef = doc(db, 'employers', employeeInfo.employerId, 'employees', employeeInfo.id, 'notifications', id)
      await deleteDoc(docRef)
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <Clipboard className="text-blue-500" size={18} />
      case 'leave_approved':
        return <CheckCircle2 className="text-emerald-500" size={18} />
      case 'leave_rejected':
        return <AlertTriangle className="text-rose-500" size={18} />
      default:
        return <Bell className="text-slate-500" size={18} />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-600 mt-2">Track real-time alerts from your manager regarding task assignments and leave request decisions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-widest self-start md:self-auto">
              <Sparkles size={12} className="text-indigo-600" /> Live Updates
            </div>
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:shadow-lg transition-all"
              >
                <Check size={14} /> Mark all as read
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-indigo-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Retrieving updates...</p>
        </div>
      ) : (
        <div className="space-y-3 text-left">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif) => (
              <motion.div
                layout
                key={notif.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                  notif.read
                    ? 'bg-white border-slate-100 text-slate-500 opacity-70'
                    : 'bg-white border-indigo-100 shadow-sm text-slate-900 ring-1 ring-indigo-500/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-2xl flex-shrink-0 mt-0.5 ${notif.read ? 'bg-slate-50' : 'bg-indigo-50/50'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-bold text-base ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                      <Clock size={12} />
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMarkRead(notif.id, notif.read)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      notif.read
                        ? 'border-slate-100 text-slate-400 hover:bg-slate-50'
                        : 'border-indigo-100 text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title={notif.read ? "Mark as Unread" : "Mark as Read"}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="p-1.5 rounded-xl border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors"
                    title="Delete Notification"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {notifications.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <Bell className="mx-auto text-slate-300 mb-3 animate-bounce" size={40} />
              <p className="text-slate-500 font-semibold">You're all caught up! No notifications received.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
