'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { mockEmployers } from '@/lib/mock-data'
import { collectionGroup, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const allEmployees = mockEmployers.flatMap((emp) => emp.employees)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      // Query collection group for employee doc
      const q = query(collectionGroup(db, 'employees'), where('email', '==', email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // Fallback: If not found in DB, check mock data for easier prototyping/demoing
        const mockEmp = allEmployees.find(emp => emp.email.toLowerCase() === email.toLowerCase())
        if (mockEmp) {
          localStorage.setItem('loggedInEmployee', JSON.stringify({
            id: mockEmp.id,
            name: mockEmp.name,
            email: mockEmp.email,
            department: mockEmp.department,
            role: mockEmp.role,
            location: mockEmp.status,
            employerId: localStorage.getItem('registeredEmployerId') || 'mock-employer-id',
          }))
          await new Promise((resolve) => setTimeout(resolve, 800))
          router.push('/dashboard')
          return
        }
        setErrorMsg('No employee account found with this email.')
        setIsLoading(false)
        return
      }

      const employeeDoc = querySnapshot.docs[0]
      const employeeData = employeeDoc.data()

      if (employeeData.password !== password) {
        setErrorMsg('Incorrect password. Please try again.')
        setIsLoading(false)
        return
      }

      // Store logged-in employee details
      localStorage.setItem('loggedInEmployee', JSON.stringify({
        id: employeeDoc.id,
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
        role: employeeData.role,
        location: employeeData.location,
        employerId: employeeData.employerId || localStorage.getItem('registeredEmployerId') || 'mock-employer-id',
      }))

      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push('/dashboard')
    } catch (err) {
      console.error('Error during employee login:', err)
      setErrorMsg('Login failed. Please check connection and credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="h-2 bg-gradient-to-r from-blue-600 to-cyan-600" />

          <div className="p-8">
            {/* Portal Switcher (Employer / Employee) */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 max-w-[280px] mx-auto">
              <Link
                href="/employer/login"
                className="flex-1 py-2 text-sm font-bold rounded-xl transition-all text-center text-slate-500 hover:text-slate-800"
              >
                Employer
              </Link>
              <Link
                href="/employee/login"
                className="flex-1 py-2 text-sm font-bold rounded-xl transition-all text-center bg-white text-blue-700 shadow-sm"
              >
                Employee
              </Link>
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">LF</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">LeadFlow</h1>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Employee Login</h2>
            <p className="text-slate-600 text-center mb-8">Access your task dashboard</p>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 mb-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium text-left">
                <AlertCircle className="flex-shrink-0" size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
                {!isLoading && <ArrowRight size={20} />}
              </motion.button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-slate-600 mb-2">Demo Credentials:</p>
              <p className="text-sm font-mono text-slate-900">Email: {allEmployees[0]?.email}</p>
            </div>

            {/* Back Link */}
            <div className="mt-8 text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Back to Role Selection
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
