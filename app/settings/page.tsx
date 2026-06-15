'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Settings, Bell, Lock, User, Mail, Save, Key, Briefcase, Calendar, MapPin, Award, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)
  const [taskStats, setTaskStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 })
  const [loading, setLoading] = useState(true)

  // Profile forms
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    department: '',
    location: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // Security passwords
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [updatingPassword, setUpdatingPassword] = useState(false)

  // Fetch stats and profile details from Firestore
  useEffect(() => {
    const loggedInStr = localStorage.getItem('loggedInEmployee')
    if (loggedInStr) {
      try {
        const emp = JSON.parse(loggedInStr)
        setEmployeeInfo(emp)
        setProfileForm({
          name: emp.name || '',
          email: emp.email || '',
          department: emp.department || 'sales',
          location: emp.location || 'Remote'
        })

        if (emp.employerId && emp.id) {
          // Listen to employee profile modifications
          const empDocRef = doc(db, 'employers', emp.employerId, 'employees', emp.id)
          const unsubProfile = onSnapshot(empDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data()
              const updatedEmp = { ...emp, ...data }
              setEmployeeInfo(updatedEmp)
              localStorage.setItem('loggedInEmployee', JSON.stringify(updatedEmp))
              setProfileForm({
                name: data.name || '',
                email: data.email || '',
                department: data.department || 'sales',
                location: data.location || 'Remote'
              })
            }
          })

          // Listen to tasks to aggregate statistics
          const tasksRef = collection(db, 'employers', emp.employerId, 'tasks')
          const tasksQuery = query(tasksRef, where('assignedTo', '==', emp.id))
          const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
            let total = 0
            let pending = 0
            let inProgress = 0
            let completed = 0

            snapshot.forEach((docSnap) => {
              total++
              const status = docSnap.data().status
              if (status === 'pending') pending++
              else if (status === 'in-progress') inProgress++
              else if (status === 'completed') completed++
            })

            setTaskStats({ total, pending, inProgress, completed })
            setLoading(false)
          }, (err) => {
            console.error('Error fetching stats:', err)
            setLoading(false)
          })

          return () => {
            unsubProfile()
            unsubTasks()
          }
        }
      } catch (err) {
        console.error('Error parsing employee info in settings:', err)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  // Update profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      alert('Name and Email are required.')
      return
    }

    setSavingProfile(true)
    if (employeeInfo?.employerId && employeeInfo?.id) {
      try {
        const empDocRef = doc(db, 'employers', employeeInfo.employerId, 'employees', employeeInfo.id)
        const updatedFields = {
          name: profileForm.name,
          email: profileForm.email,
          department: profileForm.department,
          location: profileForm.location
        }
        await updateDoc(empDocRef, updatedFields)

        const updated = { ...employeeInfo, ...updatedFields }
        setEmployeeInfo(updated)
        localStorage.setItem('loggedInEmployee', JSON.stringify(updated))
        window.dispatchEvent(new Event('local-storage-update'))
        alert('Profile updated successfully!')
      } catch (err) {
        console.error('Error updating profile in DB:', err)
        alert('Failed to update profile settings.')
      } finally {
        setSavingProfile(false)
      }
    } else {
      // Local simulated updates
      const updated = { ...employeeInfo, ...profileForm }
      setEmployeeInfo(updated)
      localStorage.setItem('loggedInEmployee', JSON.stringify(updated))
      window.dispatchEvent(new Event('local-storage-update'))
      setSavingProfile(false)
      alert('Local profile settings simulated successfully!')
    }
  }

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = securityForm

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('New Password and Confirm Password do not match.')
      return
    }

    setUpdatingPassword(true)

    if (employeeInfo?.employerId && employeeInfo?.id) {
      try {
        const empDocRef = doc(db, 'employers', employeeInfo.employerId, 'employees', employeeInfo.id)
        const docSnap = await getDoc(empDocRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.password && data.password !== currentPassword) {
            alert('Incorrect Current Password.')
            setUpdatingPassword(false)
            return
          }

          // Update password
          await updateDoc(empDocRef, { password: newPassword })
          alert('Password updated successfully!')
          setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } else {
          alert('Employee account record not found.')
        }
      } catch (err) {
        console.error('Error updating password:', err)
        alert('Failed to update security password.')
      } finally {
        setUpdatingPassword(false)
      }
    } else {
      alert('Simulated password update successful!')
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setUpdatingPassword(false)
    }
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-600 mt-2">Manage your employee account details, check security, and monitor productivity stats.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-widest self-start md:self-auto">
            <Sparkles size={12} className="text-indigo-600" /> Account Dashboard
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-100 pb-px text-left">
        {[
          { id: 'profile', label: 'Profile settings', icon: User },
          { id: 'stats', label: 'Productivity Stats', icon: Award },
          { id: 'security', label: 'Security & Password', icon: Lock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Main Info */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-50 pb-4">
              <h2 className="text-xl font-black text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Profile details associated with your workspace login.</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-amber-600 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                    Profile details can only be edited by your Employer. If you need to make changes, please contact your manager.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold">
                    {profileForm.name || 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold">
                    {profileForm.email || 'Not specified'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold capitalize">
                    {profileForm.department || 'sales'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Location</label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold">
                    {profileForm.location || 'Remote'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Profile Summary Badge Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-2xl shadow-md">
                {(employeeInfo?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{employeeInfo?.name || 'Employee'}</h3>
                <span className="inline-block px-2.5 py-0.5 mt-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {employeeInfo?.role || 'employee'}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-slate-50 pt-5 text-slate-600 text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-slate-400" />
                <span>{employeeInfo?.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Briefcase size={16} className="text-slate-400" />
                <span className="capitalize">{employeeInfo?.department || 'sales'} Department</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-slate-400" />
                <span>{employeeInfo?.location || 'Remote'}</span>
              </div>
              {employeeInfo?.joinDate && (
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-slate-400" />
                  <span>Joined: {new Date(employeeInfo.joinDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Productivity Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-6 text-left">
          {/* Stats summary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Tasks Assigned</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{taskStats.total}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</p>
              <h3 className="text-3xl font-black text-amber-600 mt-2">{taskStats.pending}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">In Progress</p>
              <h3 className="text-3xl font-black text-blue-600 mt-2">{taskStats.inProgress}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-2">{taskStats.completed}</h3>
            </div>
          </div>

          {/* Productivity progress visual */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Goal Completion Rate</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Review percentage of goals completed successfully.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                <span>Completion progress</span>
                <span>
                  {taskStats.total > 0
                    ? Math.round((taskStats.completed / taskStats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl text-left space-y-6">
          <div className="border-b border-slate-50 pb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Key className="text-indigo-600" size={20} />
              Password Settings
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Manage portal login keys and update access credentials.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Current Password</label>
              <input
                type="password"
                required
                value={securityForm.currentPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">New Password</label>
              <input
                type="password"
                required
                value={securityForm.newPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={securityForm.confirmPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm font-medium transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="px-6 py-3.5 rounded-xl bg-indigo-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {updatingPassword ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  )
}
