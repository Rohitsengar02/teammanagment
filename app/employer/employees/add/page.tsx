'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Mail, Lock, Phone, MapPin, Briefcase, Info } from 'lucide-react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

export default function AddEmployeePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    department: 'sales',
    role: 'sales-executive',
    location: '',
    status: 'active',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const employerId = localStorage.getItem('registeredEmployerId')
    if (!employerId) {
      alert('Employer session not found. Please log in again.')
      router.push('/employer/login')
      return
    }

    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in Name, Email, and Password.')
      return
    }

    setIsLoading(true)
    try {
      // Create subcollection: employers/{employerId}/employees
      const employeesCollectionRef = collection(db, 'employers', employerId, 'employees')
      await addDoc(employeesCollectionRef, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        department: formData.department,
        role: formData.role,
        location: formData.location || 'Bangalore, India',
        status: formData.status,
        joinDate: new Date().toISOString(),
        employerId: employerId, // denormalized for direct query convenience if needed
        createdAt: new Date().toISOString(),
      })

      // Simulate slight delay for premium feedback
      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push('/employer/employees')
    } catch (error) {
      console.error('Error adding employee to Firestore:', error)
      alert('Failed to add employee. Please check your network or credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <EmployerLayout>
      {/* Header */}
      <div className="mb-8 flex items-center gap-4 text-left">
        <Link href="/employer/employees" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-1">Add Employee</h1>
          <p className="text-slate-600">Register a new team member and generate portal access credentials.</p>
        </div>
      </div>

      <div className="max-w-3xl bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <User className="text-purple-600" size={24} />
          <h2 className="text-xl font-bold text-slate-900">Employee Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="tel"
                  placeholder="+91-9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Login Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Portal Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium bg-white transition-all"
                >
                  <option value="sales">Sales</option>
                  <option value="tech">Tech</option>
                  <option value="hr">HR & Operations</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Role/Title</label>
              <input
                type="text"
                placeholder="Sales Executive"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Office Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Bangalore, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium bg-white transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-start gap-3 mt-4">
            <Info className="text-purple-600 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-xs text-purple-800 leading-relaxed font-medium">
              Creating this account will write the login credentials directly to the secure employee portal database. The employee will be able to log in immediately using their email and password.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Link
              href="/employer/employees"
              className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </Link>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md"
            >
              <Save size={18} />
              {isLoading ? 'Saving...' : 'Add Employee'}
            </motion.button>
          </div>
        </form>
      </div>
    </EmployerLayout>
  )
}
