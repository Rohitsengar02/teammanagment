'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Building, Lock, Globe, MapPin, Calendar, HelpCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  
  // Custom company details state
  const [companyDetails, setCompanyDetails] = useState({
    name: 'TechFlow Solutions',
    email: 'admin@techflow.com',
    phone: '+91-9876543210',
    website: 'https://techflow.io',
    location: 'Bangalore, India',
    founded: '2022',
    size: '51-200',
    industry: 'Technology & Software',
    description: 'Providing premium pipeline automation and custom sales logs for enterprise clients.',
  })

  // Security credentials state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [isSaved, setIsSaved] = useState(false)

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: Building },
    { id: 'security', label: 'Security & Access', icon: Lock },
  ]

  // Fetch from Firebase on mount
  useEffect(() => {
    const fetchEmployerData = async () => {
      const employerId = localStorage.getItem('registeredEmployerId')
      if (!employerId) return

      try {
        const docRef = doc(db, 'employers', employerId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          setCompanyDetails((prev) => ({
            ...prev,
            name: data.companyName || prev.name,
            email: data.email || prev.email,
            phone: data.mobile || prev.phone,
            industry: data.industry || prev.industry,
            size: data.companySize || prev.size,
            location: data.locations || prev.location,
            website: data.website || prev.website,
            description: data.description || (data.features 
              ? `Workspace pre-configured for: ${data.features.join(', ')}. Shift model: ${data.shiftModel || 'Hybrid'}.`
              : prev.description)
          }))
        }
      } catch (error) {
        console.error('Error fetching employer settings from Firestore:', error)
      }
    }

    fetchEmployerData()
  }, [])

  const handleSave = async () => {
    setIsSaved(true)
    const employerId = localStorage.getItem('registeredEmployerId')
    if (employerId) {
      try {
        const docRef = doc(db, 'employers', employerId)
        await updateDoc(docRef, {
          companyName: companyDetails.name,
          industry: companyDetails.industry,
          companySize: companyDetails.size,
          locations: companyDetails.location,
          website: companyDetails.website,
          description: companyDetails.description,
        })
      } catch (error) {
        console.error('Error updating settings in Firestore:', error)
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaved(false)
  }

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Settings</h1>
        <p className="text-slate-600">Customize your business portal and manage security credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Modern animated Tab Switches */}
        <div className="lg:col-span-3 flex lg:flex-col gap-2 p-1.5 bg-slate-100/80 rounded-2xl">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-3 px-5 py-4 rounded-xl font-bold text-sm text-left transition-all w-full ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-md shadow-purple-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-purple-600' : 'text-slate-400'} />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute right-2 w-1.5 h-6 rounded-full bg-purple-600 hidden lg:block"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Right Side: Active Settings Panel Content */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col justify-between"
            >
              {activeTab === 'company' && (
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Company Information</h2>
                      <p className="text-slate-500 text-xs mt-1">Configure parameters for your CRM client interface.</p>
                    </div>
                    <Building className="text-purple-600" size={28} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Company Name</label>
                      <input
                        type="text"
                        value={companyDetails.name}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Corporate Website</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="url"
                          value={companyDetails.website}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, website: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Corporate Email (Unchangeable)</label>
                      <input
                        type="email"
                        value={companyDetails.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm font-medium outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number (Unchangeable)</label>
                      <input
                        type="tel"
                        value={companyDetails.phone}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm font-medium outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Headquarters Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={companyDetails.location}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, location: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Year Founded</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={companyDetails.founded}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, founded: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Industry Sector</label>
                      <input
                        type="text"
                        value={companyDetails.industry}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, industry: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Company Size</label>
                      <select
                        value={companyDetails.size}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, size: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white text-slate-800 text-sm font-medium transition-all"
                      >
                        <option value="1-10">1-10 Employees</option>
                        <option value="11-50">11-50 Employees</option>
                        <option value="51-200">51-200 Employees</option>
                        <option value="200+">200+ Employees</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Business Description</label>
                    <textarea
                      rows={3}
                      value={companyDetails.description}
                      onChange={(e) => setCompanyDetails({ ...companyDetails, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Security & Access</h2>
                      <p className="text-slate-500 text-xs mt-1">Manage passwords and session lock configurations.</p>
                    </div>
                    <Lock className="text-purple-600" size={28} />
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={security.newPassword}
                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={security.confirmPassword}
                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 border-t border-slate-100 pt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSave}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <Save size={18} />
                  {isSaved ? 'Changes Saved!' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </EmployerLayout>
  )
}
