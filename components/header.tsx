'use client'

import { Bell, Search, Settings, User } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:ml-0">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex-1 flex items-center gap-4 ml-12 lg:ml-0">
          <div className="relative hidden sm:flex flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search leads, companies..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>

          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
        </div>
      </div>
    </header>
  )
}
