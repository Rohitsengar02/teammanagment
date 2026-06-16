'use client'

import { useState, useEffect } from 'react'
import { EmployerLayout } from './employer-layout'
import { DashboardLayout } from './dashboard-layout'

export function CollaborationLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'employer' | 'employee' | null>(null)

  useEffect(() => {
    const employerId = localStorage.getItem('registeredEmployerId')
    const employeeData = localStorage.getItem('loggedInEmployee')

    if (employeeData) {
      setRole('employee')
    } else if (employerId) {
      setRole('employer')
    } else {
      setRole('employee') // Fallback to employee sidebar layout
    }
  }, [])

  if (role === 'employer') {
    return <EmployerLayout>{children}</EmployerLayout>
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
