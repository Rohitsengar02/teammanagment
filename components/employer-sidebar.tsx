'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Clock,
  CheckSquare,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  BarChart3,
  Briefcase,
  Calendar,
  Settings,
  ChevronRight,
  LogOut,
  Layers,
  Video,
} from 'lucide-react'

interface MenuSection {
  label: string
  items: Array<{
    label: string
    href: string
    icon: React.ReactNode
  }>
}

const menuSections: MenuSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/employer/dashboard', icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    label: 'Employee Management',
    items: [
      { label: 'Employees', href: '/employer/employees', icon: <Users size={20} /> },
      { label: 'Attendance', href: '/employer/attendance', icon: <Clock size={20} /> },
      { label: 'Shifts', href: '/employer/shifts', icon: <Briefcase size={20} /> },
      { label: 'Leaves', href: '/employer/leaves', icon: <Calendar size={20} /> },
    ],
  },
  {
    label: 'Task & Performance',
    items: [
      { label: 'Tasks', href: '/employer/tasks', icon: <CheckSquare size={20} /> },
      { label: 'Performance', href: '/employer/performance', icon: <TrendingUp size={20} /> },
    ],
  },
  {
    label: 'Finance & Reports',
    items: [
      { label: 'Payroll', href: '/employer/payroll', icon: <DollarSign size={20} /> },
      { label: 'Reports', href: '/employer/reports', icon: <FileText size={20} /> },
    ],
  },
  {
    label: 'Collaboration',
    items: [
      { label: 'Team Chat', href: '/chat', icon: <MessageSquare size={20} /> },
      { label: 'Workspaces', href: '/workspaces', icon: <Layers size={20} /> },
      { label: 'Meetings', href: '/video-meetings', icon: <Video size={20} /> },
      { label: 'Notes', href: '/employer/notes', icon: <MessageSquare size={20} /> },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Settings', href: '/employer/settings', icon: <Settings size={20} /> },
    ],
  },
]

export function EmployerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => pathname === href

  const handleLogout = () => {
    localStorage.removeItem('registeredEmployerId')
    localStorage.removeItem('employerAccessToken')
    router.push('/employer/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
      >
        {isOpen ? <X size={20} className="text-slate-900" /> : <Menu size={20} className="text-slate-900" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: isOpen ? 0 : -288 } : { x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 flex flex-col z-40 shadow-lg lg:shadow-none lg:relative lg:translate-x-0"
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link href="/employer/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">EM</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">Employer</h1>
              <p className="text-xs text-slate-500">Panel</p>
            </div>
          </Link>
        </div>

        {/* Menu Sections */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">
                {section.label}
              </p>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        active
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {active && <ChevronRight size={16} />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
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
