'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  Menu,
  MessageSquare,
  Settings,
  Target,
  Users,
  X,
  ChevronRight,
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/leads', label: 'Leads', icon: Target },
  { href: '/pipeline', label: 'Pipeline', icon: BarChart3 },
  { href: '/tasks', label: 'Tasks', icon: FileText },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/companies', label: 'Companies', icon: Users },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/notes', label: 'Notes', icon: MessageSquare },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
      >
        {isOpen ? <X size={20} className="text-slate-900" /> : <Menu size={20} className="text-slate-900" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: isOpen ? 0 : -256 } : { x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`w-64 bg-white border-r border-slate-200 flex flex-col h-full fixed left-0 top-0 z-40 shadow-lg lg:shadow-none lg:relative lg:static`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">LF</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">LeadFlow</h1>
              <p className="text-xs text-slate-500">CRM</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="flex-1 font-medium">{item.label}</span>
                {isActive && <ChevronRight size={16} />}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Sales Team</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
