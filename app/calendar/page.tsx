'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { mockEvents } from '@/lib/mock-data'
import { Plus, Phone, Users, Mail } from 'lucide-react'
import { useState } from 'react'

const typeIcons = {
  call: Phone,
  meeting: Users,
  email: Mail,
  task: Users,
}

const typeColors = {
  call: 'bg-blue-100 text-blue-700',
  meeting: 'bg-purple-100 text-purple-700',
  email: 'bg-green-100 text-green-700',
  task: 'bg-orange-100 text-orange-700',
}

export default function CalendarPage() {
  const [events] = useState(mockEvents)

  // Group events by date
  const eventsByDate = events.reduce(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = []
      }
      acc[event.date].push(event)
      return acc
    },
    {} as Record<string, typeof events>
  )

  const sortedDates = Object.keys(eventsByDate).sort()

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-600 mt-2">{events.length} events scheduled</p>
          </div>
          <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg">
            <Plus size={18} />
            <span className="text-sm font-medium">New Event</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date}>
            {/* Date Header */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {new Date(date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
            </div>

            {/* Events for this date */}
            <div className="space-y-3">
              {eventsByDate[date].map((event) => {
                const Icon = typeIcons[event.type]
                return (
                  <div
                    key={event.id}
                    className="floating-card p-4 rounded-xl flex items-start gap-4 hover:border-indigo-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-lg ${typeColors[event.type]}`}>
                        <Icon size={20} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-lg">{event.title}</h4>
                          <p className="text-sm text-slate-600">{event.participant}</p>
                        </div>
                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg">
                          {event.time}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{event.notes}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
