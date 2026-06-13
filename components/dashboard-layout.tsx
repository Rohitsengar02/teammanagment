'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Desktop Sidebar Container */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar + Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Sidebar - overlays when open */}
        <div className="lg:hidden">
          <Sidebar />
        </div>
        
        {/* Header & Content */}
        <Header />
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
