'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Plus, Search, Mail, Phone, MapPin, Briefcase, Users, Loader2, Upload, FileSpreadsheet, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { mockEmployers } from '@/lib/mock-data'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import * as XLSX from 'xlsx'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null

  const fetchEmployees = async () => {
    setLoading(true)
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
        setEmployees(mockEmployers[0].employees)
      }
    } catch (error) {
      console.error('Error fetching employees from Firestore:', error)
      setEmployees(mockEmployers[0].employees)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

  // Parse CSV helper
  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
    if (lines.length < 2) return []
    
    // Headers parsing
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
    
    return lines.slice(1).map(line => {
      // Handle simple comma split
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
      const emp: any = {}
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          emp[header] = values[index]
        }
      })
      return emp
    })
  }

  // Parse XML helper
  const parseXML = (text: string) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, "text/xml")
    const employeeNodes = xmlDoc.getElementsByTagName("employee")
    const list: any[] = []
    
    for (let i = 0; i < employeeNodes.length; i++) {
      const node = employeeNodes[i]
      const getVal = (tagName: string) => node.getElementsByTagName(tagName)[0]?.textContent || ''
      list.push({
        name: getVal('name'),
        email: getVal('email'),
        password: getVal('password'),
        department: getVal('department'),
        role: getVal('role'),
        location: getVal('location')
      })
    }
    return list
  }

  // Parse Excel helper
  const parseExcel = (arrayBuffer: ArrayBuffer) => {
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const json = XLSX.utils.sheet_to_json(worksheet)
    return json.map((row: any) => {
      const normalizedRow: any = {}
      Object.keys(row).forEach(key => {
        normalizedRow[key.toLowerCase().trim()] = row[key]
      })
      return normalizedRow
    })
  }

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

    reader.onload = async (event) => {
      const result = event.target?.result
      let parsedEmployees: any[] = []

      try {
        if (isExcel) {
          parsedEmployees = parseExcel(result as ArrayBuffer)
        } else {
          const text = result as string
          if (file.name.endsWith('.xml')) {
            parsedEmployees = parseXML(text)
          } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
            parsedEmployees = parseCSV(text)
          } else {
            alert('Unsupported file format. Please upload a .csv, .xml, .xlsx, or .xls file.')
            setUploading(false)
            return
          }
        }

        if (parsedEmployees.length === 0) {
          alert('No employee records found in the file.')
          setUploading(false)
          return
        }

        // Validate and save parsed employees
        let addedCount = 0
        for (const emp of parsedEmployees) {
          if (!emp.name || !emp.email) continue

          const newEmployee = {
            name: emp.name,
            email: emp.email,
            password: emp.password || '123456',
            department: emp.department || 'sales',
            role: emp.role || 'employee',
            location: emp.location || 'Bangalore, India',
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0]
          }

          if (employerId) {
            await addDoc(collection(db, 'employers', employerId, 'employees'), newEmployee)
          }
          addedCount++
        }

        alert(`Successfully imported ${addedCount} employees!`)
        fetchEmployees()
      } catch (err) {
        console.error('Error parsing/uploading employees file:', err)
        alert('Failed to parse employee upload file.')
      } finally {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    if (isExcel) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  }

  // Delete employee handler
  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}?`)) return
    if (!employerId) {
      alert('Employer session not found.')
      return
    }
    try {
      await deleteDoc(doc(db, 'employers', employerId, 'employees', employeeId))
      alert('Employee deleted successfully.')
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Failed to delete employee.')
    }
  }

  // Download template helpers
  const downloadCSVTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,password,department,role,location\nJane Doe,jane@company.com,pass123,tech,software-engineer,Mumbai, India\n"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "employee_import_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadXMLTemplate = () => {
    const xmlContent = `data:text/xml;charset=utf-8,<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee>
    <name>Jane Doe</name>
    <email>jane@company.com</email>
    <password>pass123</password>
    <department>tech</department>
    <role>software-engineer</role>
    <location>Mumbai, India</location>
  </employee>
</employees>`
    const encodedUri = encodeURI(xmlContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "employee_import_template.xml")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadExcelTemplate = () => {
    const wb = XLSX.utils.book_new()
    const wsData = [
      ["name", "email", "password", "department", "role", "location"],
      ["Jane Doe", "jane@company.com", "pass123", "tech", "software-engineer", "Mumbai, India"]
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, "Employees")
    XLSX.writeFile(wb, "employee_import_template.xlsx")
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Employees Directory</h1>
          <p className="text-slate-600 font-medium">Manage your team members or upload data sheets to bulk import credentials.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* File input (Hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xml,.txt,.xlsx,.xls"
            className="hidden"
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-3.5 border border-slate-200 text-slate-700 bg-white rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm shadow-sm disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Upload size={16} />
            )}
            Bulk Import (CSV/XML)
          </motion.button>

          <Link href="/employer/employees/add">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all text-sm shadow-md"
            >
              <Plus size={16} />
              Add Employee
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 text-left">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search employees by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700 text-sm font-semibold transition-all"
        >
          <option value="all">All Departments</option>
          <option value="sales">Sales</option>
          <option value="tech">Tech</option>
          <option value="hr">HR & Operations</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      {/* Upload Instructions Card helper */}
      <div className="mb-6 p-5 bg-gradient-to-r from-purple-50/70 to-pink-50/70 border border-purple-100 rounded-3xl text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="text-purple-600 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider mb-1">Bulk Import Formats</h4>
            <p className="text-xs text-purple-800 leading-relaxed font-semibold">
              Upload an <span className="font-black">Excel sheet (.xlsx/.xls)</span>, a <span className="font-black">CSV</span> with headers (<code className="bg-purple-100/50 px-1 py-0.5 rounded text-[10px]">name, email, password, department, role, location</code>), or an <span className="font-black">XML</span> file.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={downloadExcelTemplate}
            className="px-3 py-1.5 bg-white border border-purple-200 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
          >
            Get Excel Template
          </button>
          <button
            onClick={downloadCSVTemplate}
            className="px-3 py-1.5 bg-white border border-purple-200 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
          >
            Get CSV Template
          </button>
          <button
            onClick={downloadXMLTemplate}
            className="px-3 py-1.5 bg-white border border-purple-200 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
          >
            Get XML Template
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading team members...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredEmployees.map((employee, idx) => (
            <motion.div
              layout
              key={employee.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all overflow-hidden group flex flex-col justify-between"
            >
              <div>
                {/* Header Bar */}
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                        {(employee.name || 'E').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{employee.name}</h3>
                        <p className="text-xs text-slate-500 font-semibold capitalize">{(employee.role || 'employee').replace('-', ' ')}</p>
                      </div>
                    </div>
                    {employee.id && (
                      <button
                        onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 border-t border-b border-slate-50 py-4 text-slate-600 text-sm font-medium">
                    <div className="flex items-center gap-2.5">
                      <Mail size={16} className="text-slate-400" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    {employee.mobile && (
                      <div className="flex items-center gap-2.5">
                        <Phone size={16} className="text-slate-400" />
                        <span>{employee.mobile}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={16} className="text-slate-400" />
                      <span className="capitalize">{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="capitalize">{employee.location || 'Bangalore, India'}</span>
                    </div>
                  </div>

                  {/* Join Date */}
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Joined: {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 grid grid-cols-2 gap-3 border-t border-slate-50/50 mt-4">
                <Link
                  href={`/employer/employees/${employee.id || 'mock'}`}
                  className="px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors text-center text-xs"
                >
                  View Details
                </Link>
                <Link
                  href={`/employer/employees/${employee.id || 'mock'}/clients`}
                  className="px-3 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-colors text-center text-xs flex items-center justify-center gap-1.5"
                >
                  <Users size={14} />
                  Clients
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
          <Users className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-semibold">No employee directory records found.</p>
        </div>
      )}
    </EmployerLayout>
  )
}
