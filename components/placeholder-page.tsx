'use client'

import { DashboardLayout } from './dashboard-layout'
import { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: LucideIcon
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 mb-6">
            <Icon size={40} className="text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400 text-lg mb-8">{description}</p>
          <div className="floating-card inline-block p-6 rounded-2xl">
            <p className="text-sm text-slate-300">Coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
