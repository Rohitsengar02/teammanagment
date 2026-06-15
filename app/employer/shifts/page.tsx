'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Clock, X, Edit2, Trash2, Users, Check, Loader2, AlertTriangle, Calendar, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockShifts, mockEmployers } from '@/lib/mock-data'

interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  daysPerWeek: number
  employees: string[]
  isRotational?: boolean
  dayStartTime?: string
  dayEndTime?: string
  nightStartTime?: string
  nightEndTime?: string
  rotationCycle?: string
}

interface Employee {
  id: string
  name: string
  department: string
  role?: string
  shiftId?: string
  shiftName?: string
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null)

  // Form states
  const [shiftName, setShiftName] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([])

  // Rotational states
  const [isRotational, setIsRotational] = useState(false)
  const [dayStartTime, setDayStartTime] = useState('09:00')
  const [dayEndTime, setDayEndTime] = useState('17:00')
  const [nightStartTime, setNightStartTime] = useState('17:00')
  const [nightEndTime, setNightEndTime] = useState('01:00')
  const [rotationCycle, setRotationCycle] = useState('1 week Day / 1 week Night')

  const employerId = typeof window !== 'undefined' ? localStorage.getItem('registeredEmployerId') : null

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    if (!employerId) {
      // Offline Simulation / Fallback
      setEmployees(mockEmployers[0].employees)
      const formattedMock = mockShifts.map((s) => ({
        id: s.id,
        name: s.name,
        startTime: s.startTime,
        endTime: s.endTime,
        daysPerWeek: s.daysPerWeek,
        employees: s.employees,
        isRotational: false,
      }))
      setShifts(formattedMock)
      setLoading(false)
      return
    }

    try {
      // 1. Fetch employees
      const empSnap = await getDocs(collection(db, 'employers', employerId, 'employees'))
      const empList: Employee[] = []
      empSnap.forEach((doc) => {
        empList.push({ id: doc.id, ...doc.data() } as Employee)
      })
      const finalEmployees = empList.length > 0 ? empList : (mockEmployers[0].employees as Employee[])
      setEmployees(finalEmployees)

      // 2. Fetch shifts
      const shiftSnap = await getDocs(collection(db, 'employers', employerId, 'shifts'))
      let shiftList: Shift[] = []
      shiftSnap.forEach((doc) => {
        shiftList.push({ id: doc.id, ...doc.data() } as Shift)
      })

      // Seed if empty
      if (shiftList.length === 0) {
        const initialShifts = [
          {
            name: 'Morning Shift',
            startTime: '09:00',
            endTime: '17:00',
            daysPerWeek: 5,
            employees: finalEmployees.slice(0, 2).map((e) => e.id),
            isRotational: false
          },
          {
            name: 'Evening Shift',
            startTime: '17:00',
            endTime: '01:00',
            daysPerWeek: 5,
            employees: finalEmployees.slice(2, 3).map((e) => e.id),
            isRotational: false
          },
        ]

        const seededShifts: Shift[] = []
        for (const s of initialShifts) {
          const docRef = await addDoc(collection(db, 'employers', employerId, 'shifts'), s)
          seededShifts.push({ id: docRef.id, ...s })

          // Update profiles of employees initially assigned
          for (const empId of s.employees) {
            const empRef = doc(db, 'employers', employerId, 'employees', empId)
            await updateDoc(empRef, {
              shiftId: docRef.id,
              shiftName: s.name,
            })
          }
        }
        shiftList = seededShifts

        // Refresh employees state
        const refreshedEmpSnap = await getDocs(collection(db, 'employers', employerId, 'employees'))
        const refreshedEmpList: Employee[] = []
        refreshedEmpSnap.forEach((doc) => {
          refreshedEmpList.push({ id: doc.id, ...doc.data() } as Employee)
        })
        setEmployees(refreshedEmpList)
      }

      setShifts(shiftList)
    } catch (error) {
      console.error('Error fetching shifts data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAddModal = () => {
    setModalMode('add')
    setSelectedShiftId(null)
    setShiftName('')
    setStartTime('09:00')
    setEndTime('17:00')
    setDaysPerWeek(5)
    setAssignedEmployeeIds([])
    setIsRotational(false)
    setDayStartTime('09:00')
    setDayEndTime('17:00')
    setNightStartTime('17:00')
    setNightEndTime('01:00')
    setRotationCycle('1 week Day / 1 week Night')
    setIsModalOpen(true)
  }

  const openEditModal = (shift: Shift) => {
    setModalMode('edit')
    setSelectedShiftId(shift.id)
    setShiftName(shift.name)
    setStartTime(shift.startTime)
    setEndTime(shift.endTime)
    setDaysPerWeek(shift.daysPerWeek)
    setAssignedEmployeeIds(shift.employees || [])
    setIsRotational(!!shift.isRotational)
    setDayStartTime(shift.dayStartTime || '09:00')
    setDayEndTime(shift.dayEndTime || '17:00')
    setNightStartTime(shift.nightStartTime || '17:00')
    setNightEndTime(shift.nightEndTime || '01:00')
    setRotationCycle(shift.rotationCycle || '1 week Day / 1 week Night')
    setIsModalOpen(true)
  }

  const toggleEmployeeAssignment = (empId: string) => {
    setAssignedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    )
  }

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shiftName.trim()) return

    setSaving(true)
    const shiftData: Partial<Shift> = {
      name: shiftName,
      startTime: isRotational ? dayStartTime : startTime,
      endTime: isRotational ? dayEndTime : endTime,
      daysPerWeek,
      employees: assignedEmployeeIds,
      isRotational,
      dayStartTime: isRotational ? dayStartTime : dayStartTime,
      dayEndTime: isRotational ? dayEndTime : dayEndTime,
      nightStartTime: isRotational ? nightStartTime : nightStartTime,
      nightEndTime: isRotational ? nightEndTime : nightEndTime,
      rotationCycle: isRotational ? rotationCycle : rotationCycle
    }

    if (!employerId) {
      // Simulation logic
      if (modalMode === 'add') {
        const newShiftObj = { id: `mock-${Date.now()}`, ...shiftData } as Shift
        setShifts((prev) => [...prev, newShiftObj])
      } else if (selectedShiftId) {
        setShifts((prev) =>
          prev.map((s) => (s.id === selectedShiftId ? { ...s, ...shiftData } as Shift : s))
        )
      }
      setSaving(false)
      setIsModalOpen(false)
      return
    }

    try {
      let shiftId = selectedShiftId
      let oldEmployeeIds: string[] = []

      if (modalMode === 'add') {
        const docRef = await addDoc(collection(db, 'employers', employerId, 'shifts'), shiftData)
        shiftId = docRef.id
      } else if (selectedShiftId) {
        const oldShift = shifts.find((s) => s.id === selectedShiftId)
        if (oldShift) {
          oldEmployeeIds = oldShift.employees || []
        }
        const docRef = doc(db, 'employers', employerId, 'shifts', selectedShiftId)
        await updateDoc(docRef, shiftData)
      }

      if (shiftId) {
        // Find added and removed employees
        const addedEmployees = assignedEmployeeIds.filter((id) => !oldEmployeeIds.includes(id))
        const removedEmployees = oldEmployeeIds.filter((id) => !assignedEmployeeIds.includes(id))

        // Update added employees
        for (const empId of addedEmployees) {
          const empRef = doc(db, 'employers', employerId, 'employees', empId)
          await updateDoc(empRef, {
            shiftId: shiftId,
            shiftName: isRotational ? `${shiftName} (Rotational)` : shiftName,
          })
        }

        // Update removed employees
        for (const empId of removedEmployees) {
          const empRef = doc(db, 'employers', employerId, 'employees', empId)
          await updateDoc(empRef, {
            shiftId: null,
            shiftName: null,
          })
        }
      }

      await fetchData()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving shift:', error)
      alert('Failed to save shift in database.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteShift = async (shiftId: string, assignedEmps: string[]) => {
    if (!confirm('Are you sure you want to delete this shift? All assigned employees will be unassigned.')) return

    if (!employerId) {
      setShifts((prev) => prev.filter((s) => s.id !== shiftId))
      return
    }

    try {
      const docRef = doc(db, 'employers', employerId, 'shifts', shiftId)
      await deleteDoc(docRef)

      // Unassign employees
      for (const empId of assignedEmps) {
        const empRef = doc(db, 'employers', employerId, 'employees', empId)
        await updateDoc(empRef, {
          shiftId: null,
          shiftName: null,
        })
      }

      await fetchData()
    } catch (error) {
      console.error('Error deleting shift:', error)
      alert('Failed to delete shift.')
    }
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Shifts Management</h1>
          <p className="text-slate-600 font-medium">Create shifts, edit timings, and assign employees dynamically to fixed or rotational cycles.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg flex items-center justify-center gap-2 text-sm shadow-md w-fit"
        >
          <Plus size={18} />
          Create Shift
        </motion.button>
      </div>

      {/* Shifts View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading work shifts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          {shifts.map((shift, idx) => {
            const shiftEmployees = employees.filter((emp) => shift.employees?.includes(emp.id))
            return (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300"
              >
                <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 absolute top-0 left-0 right-0 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-slate-800">{shift.name}</h3>
                        {shift.isRotational && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[9px] font-black uppercase tracking-wider">
                            <RefreshCw size={10} className="animate-spin-slow" /> Rotational
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 bg-indigo-50/50 text-indigo-600 border border-indigo-100/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
                        <Calendar size={12} /> {shift.daysPerWeek} days / week
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(shift)}
                        className="p-2 text-slate-500 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-100 rounded-xl transition-all"
                        title="Edit Shift"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteShift(shift.id, shift.employees || [])}
                        className="p-2 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl transition-all"
                        title="Delete Shift"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {shift.isRotational ? (
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 bg-purple-50/50 border border-purple-100/30 p-2.5 rounded-2xl text-slate-700 w-fit">
                        <Clock size={15} className="text-purple-500" />
                        <span className="text-xs font-extrabold">
                          Week 1 Day: {shift.dayStartTime || '09:00'} - {shift.dayEndTime || '17:00'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100/30 p-2.5 rounded-2xl text-slate-700 w-fit">
                        <Clock size={15} className="text-indigo-500" />
                        <span className="text-xs font-extrabold">
                          Week 2 Night: {shift.nightStartTime || '17:00'} - {shift.nightEndTime || '01:00'}
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider pl-1 mt-1">
                        Rotates: {shift.rotationCycle || '1 week Day / 1 week Night'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-50/60 border border-slate-100 p-3 rounded-2xl mb-6 text-slate-700 w-fit">
                      <Clock size={16} className="text-purple-500" />
                      <span className="text-sm font-bold">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Assigned Employees</p>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Users size={11} /> {shiftEmployees.length}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {shiftEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 rounded-2xl flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 text-purple-600 flex items-center justify-center text-xs font-black">
                              {emp.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">{emp.name}</p>
                              {shift.isRotational ? (
                                <p className="text-[9px] text-purple-600 font-bold uppercase tracking-wider">
                                  Alternating Day/Night Roster
                                </p>
                              ) : (
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                  {emp.role || emp.department}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {shiftEmployees.length === 0 && (
                        <div className="p-6 bg-slate-50/30 border border-dashed border-slate-200 rounded-2xl text-center">
                          <p className="text-xs text-slate-400 font-medium">No employees assigned to this shift.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {shifts.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <AlertTriangle className="text-slate-400 mx-auto mb-3" size={36} />
              <p className="text-slate-500 text-sm font-semibold mb-4">No work shifts created yet.</p>
              <button
                type="button"
                onClick={openAddModal}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                Create First Shift
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-left"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {modalMode === 'add' ? 'Create Work Shift' : 'Edit Shift Details'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Define schedule and assign team members.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveShift} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Shift Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Shift Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roster Rotational A"
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                  />
                </div>

                {/* Rotational Toggle */}
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-sm font-black text-purple-950 flex items-center gap-1.5">
                      <RefreshCw size={14} className={isRotational ? 'animate-spin-slow' : ''} />
                      Rotational Shift Schedule
                    </p>
                    <p className="text-[10px] text-purple-700/80 font-bold">Alternates employees between day & night timings weekly.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isRotational}
                    onChange={(e) => setIsRotational(e.target.checked)}
                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                {/* Timings */}
                {!isRotational ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                      <input
                        type="time"
                        required={!isRotational}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                      <input
                        type="time"
                        required={!isRotational}
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border-l-2 border-purple-200 pl-4">
                    {/* Day Timings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-purple-700 uppercase tracking-wider mb-2">Week 1 Day Start</label>
                        <input
                          type="time"
                          required={isRotational}
                          value={dayStartTime}
                          onChange={(e) => setDayStartTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-purple-700 uppercase tracking-wider mb-2">Week 1 Day End</label>
                        <input
                          type="time"
                          required={isRotational}
                          value={dayEndTime}
                          onChange={(e) => setDayEndTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                        />
                      </div>
                    </div>

                    {/* Night Timings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-700 uppercase tracking-wider mb-2">Week 2 Night Start</label>
                        <input
                          type="time"
                          required={isRotational}
                          value={nightStartTime}
                          onChange={(e) => setNightStartTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-700 uppercase tracking-wider mb-2">Week 2 Night End</label>
                        <input
                          type="time"
                          required={isRotational}
                          value={nightEndTime}
                          onChange={(e) => setNightEndTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                        />
                      </div>
                    </div>

                    {/* Rotation Cycle */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Rotation Cycle</label>
                      <input
                        type="text"
                        required={isRotational}
                        value={rotationCycle}
                        onChange={(e) => setRotationCycle(e.target.value)}
                        placeholder="e.g. 1 week Day / 1 week Night"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Days per Week */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Days per Week</label>
                  <select
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-semibold bg-white transition-all"
                  >
                    <option value={4}>4 days</option>
                    <option value={5}>5 days</option>
                    <option value={6}>6 days</option>
                    <option value={7}>7 days</option>
                  </select>
                </div>

                {/* Assign Employees */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Assign Employees</label>
                  <div className="border border-slate-100 rounded-2xl max-h-48 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
                    {employees.map((emp) => {
                      const isAssigned = assignedEmployeeIds.includes(emp.id)
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleEmployeeAssignment(emp.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                            isAssigned
                              ? 'bg-purple-50 border border-purple-100/50 text-purple-900 shadow-sm'
                              : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                                isAssigned ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {emp.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-xs font-bold">{emp.name}</p>
                              <p className={`text-[9px] font-medium capitalize ${isAssigned ? 'text-purple-600' : 'text-slate-400'}`}>
                                {emp.role || emp.department}
                              </p>
                            </div>
                          </div>
                          {isAssigned && (
                            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      )
                    })}

                    {employees.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">No employees registered yet.</p>
                    )}
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-md"
                  >
                    {saving && <Loader2 className="animate-spin" size={14} />}
                    {modalMode === 'add' ? 'Create Shift' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spinSlow 8s linear infinite;
        }
      `}</style>
    </EmployerLayout>
  )
}
