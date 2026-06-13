'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Plus, Search, Mail, Phone, MapPin, Briefcase, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { mockEmployers } from '@/lib/mock-data'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDept, setFilterDept] = useState('all')

  useEffect(() => {
    const fetchEmployees = async () => {
      const employerId = localStorage.getItem('registeredEmployerId')
      if (!employerId) {
        setEmployees(mockEmployers[0].employees)
        setLoading(false)
        return
      }
      try {
        const querySnapshot = await getDocs(collection(db, 'employers', employerId, 'employees'))
        const list: any[] = []
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() })
        })
        if (list.length > 0) {
          setEmployees(list)
        } else {
          // Fallback to mock data so the screen isn't empty on first run
          setEmployees(mockEmployers[0].employees)
        }
      } catch (error) {
        console.error('Error fetching employees from Firestore:', error)
        setEmployees(mockEmployers[0].employees)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  const filteredEmployees = employees.filter((emp) => {
    const nameStr = emp.name || ''
    const emailStr = emp.email || ''
    const deptStr = emp.department || ''
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || emailStr.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = filterDept === 'all' || deptStr.toLowerCase() === filterDept.toLowerCase()
    return matchesSearch && matchesDept
  })

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Employees</h1>
          <p className="text-slate-600">Manage your team members</p>
        </div>
        <Link href="/employer/employees/add">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            <Plus size={20} />
            Add Employee
          </motion.button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700"
        >
          <option value="all">All Departments</option>
          <option value="sales">Sales</option>
          <option value="tech">Tech</option>
          <option value="hr">HR & Operations</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading team members...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee, idx) => (
            <motion.div
              key={employee.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group text-left"
            >
              {/* Header Bar */}
              <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-600" />

              {/* Content */}
              <div className="p-6">
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mb-4">
                  {(employee.name || 'E').charAt(0).toUpperCase()}
                </div>

                {/* Name and Role */}
                <h3 className="text-lg font-bold text-slate-900 mb-1">{employee.name}</h3>
                <p className="text-sm text-slate-600 mb-4 capitalize">{(employee.role || '').replace('-', ' ')}</p>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-slate-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  {employee.mobile && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone size={16} className="text-slate-400" />
                      <span>{employee.mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Briefcase size={16} className="text-slate-400" />
                    <span className="capitalize">{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="capitalize">{employee.location || 'Bangalore, India'}</span>
                  </div>
                </div>

                {/* Join Date */}
                <p className="text-xs text-slate-500 mb-6">
                  Joined {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/employer/employees/${employee.id || 'mock'}`}
                    className="px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-colors text-center text-sm"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/employer/employees/${employee.id || 'mock'}/clients`}
                    className="px-3 py-2.5 rounded-lg bg-purple-50 text-purple-600 font-medium hover:bg-purple-100 transition-colors text-center text-sm flex items-center justify-center gap-1.5"
                  >
                    <Users size={15} />
                    Clients
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-12 text-center"
        >
          <p className="text-slate-600">No employees found</p>
        </motion.div>
      )}
    </EmployerLayout>
  )
}

