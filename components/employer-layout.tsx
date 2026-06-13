'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EmployerSidebar } from './employer-sidebar'
import { motion } from 'framer-motion'
import { Bell, Settings } from 'lucide-react'

export function EmployerLayout({ children }: { children: React.ReactNode }) {
  const [employerName, setEmployerName] = useState('Priya')
  const [employerEmail, setEmployerEmail] = useState('priya@company.com')
  const [avatarLetter, setAvatarLetter] = useState('P')

  useEffect(() => {
    const fetchEmployer = async () => {
      const employerId = localStorage.getItem('registeredEmployerId')
      if (!employerId) return
      try {
        const docRef = doc(db, 'employers', employerId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          const name = data.companyName || 'Employer'
          setEmployerName(name)
          setEmployerEmail(data.email || 'priya@company.com')
          setAvatarLetter(name.charAt(0).toUpperCase())
        }
      } catch (error) {
        console.error('Error fetching layout data:', error)
      }
    }
    fetchEmployer()
  }, [])

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <EmployerSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">Employer Management</h2>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </motion.button>
            
            {/* Real Account Profile Card */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-bold text-slate-800 leading-none">{employerName}</span>
                <span className="text-[10px] font-semibold text-purple-600 mt-1 uppercase tracking-wider">{employerEmail}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-md border border-white">
                {avatarLetter}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
