'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Phone, Briefcase, Users, LayoutGrid, Check, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function EmployerLoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Auth fields
  const [email, setEmail] = useState('priya@company.com')
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')

  // Multi-step signup onboarding state
  const [step, setStep] = useState(0) // 0 = Credentials, 1 = Company, 2 = Features, 3 = Team, 4 = Review

  // Onboarding Fields
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('Technology')
  const [companySize, setCompanySize] = useState('11-50')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Leads Management',
    'Visual Deal Pipelines',
  ])
  const [teamCount, setTeamCount] = useState('15')
  const [locations, setLocations] = useState('')
  const [shiftModel, setShiftModel] = useState('Hybrid')

  const featuresList = [
    'Leads Management',
    'Visual Deal Pipelines',
    'Automated Shift Planner',
    'Performance Reporting',
    'Document Hub',
  ]

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature))
    } else {
      setSelectedFeatures([...selectedFeatures, feature])
    }
  }

  // Handle simulated login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Query Firebase for existing account by email
      const q = query(collection(db, 'employers'), where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        alert('No employer account found with this email. Please sign up first.')
        setIsLoading(false)
        return
      }

      const empDoc = querySnapshot.docs[0]
      const empData = empDoc.data()

      // Enforce password check
      if (empData.password && empData.password !== password) {
        alert('Incorrect password. Please try again.')
        setIsLoading(false)
        return
      }

      const docId = empDoc.id

      // Store doc ID and generate an access token
      localStorage.setItem('registeredEmployerId', docId)
      const mockToken = `token_${Math.random().toString(36).substring(2, 15)}_${docId}`
      localStorage.setItem('employerAccessToken', mockToken)

      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push('/employer/dashboard')
    } catch (err) {
      console.error('Error logging in:', err)
      alert('Login failed. Please check your network or credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle final registration step
  const handleSignupSubmit = async () => {
    setIsLoading(true)
    try {
      // Save onboarding data in Firestore 'employers' collection
      const docRef = await addDoc(collection(db, 'employers'), {
        email,
        password, // Save password
        mobile,
        companyName,
        industry,
        companySize,
        features: selectedFeatures,
        teamCount,
        locations,
        shiftModel,
        createdAt: new Date().toISOString(),
      })

      localStorage.setItem('registeredEmployerId', docRef.id)
      const mockToken = `token_${Math.random().toString(36).substring(2, 15)}_${docRef.id}`
      localStorage.setItem('employerAccessToken', mockToken)

      // Simulate a small loading delay for a premium feedback feel
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      // Redirect to dashboard
      router.push('/employer/dashboard')
    } catch (error) {
      console.error('Error saving employer data:', error)
      alert('Failed to register. Please check your Firebase credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600" />
          
          <div className="p-8 md:p-10">
            {/* Header branding */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-lg">G</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">GlowAI</h1>
            </div>

            {/* Toggle tabs for Login vs Register */}
            {step === 0 && (
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 max-w-[280px] mx-auto">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                    isLogin ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                    !isLogin ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Step Wizard Headings */}
            {!isLogin && step > 0 && (
              <div className="mb-8">
                {/* Horizontal Step Tracker */}
                <div className="flex items-center justify-between mb-4 max-w-md mx-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          step >= i
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {step > i ? <Check size={14} /> : i}
                      </div>
                      {i < 4 && (
                        <div
                          className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                            step > i ? 'bg-purple-600' : 'bg-slate-100'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <h2 className="text-2xl font-black text-slate-900 text-center">
                  {step === 1 && 'Company Details'}
                  {step === 2 && 'Select Features'}
                  {step === 3 && 'Team & Schedule Options'}
                  {step === 4 && 'Onboarding Review'}
                </h2>
                <p className="text-sm text-slate-500 text-center mt-1">
                  {step === 1 && 'Configure your business settings'}
                  {step === 2 && 'Pick tools for your workspace'}
                  {step === 3 && 'Define team size and shift logs'}
                  {step === 4 && 'Accept terms to finalize registration'}
                </p>
              </div>
            )}

            {/* Auth Layout blocks */}
            {isLogin ? (
              // Login Screen
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 text-center mb-1">Employer Login</h2>
                  <p className="text-sm text-slate-500 text-center mb-8">Access your management dashboard</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@company.com"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 mt-8"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  {!isLoading && <ArrowRight size={18} />}
                </motion.button>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 mt-6">
                  <p className="text-xs font-bold text-purple-700 mb-1">Demo Credentials:</p>
                  <p className="text-sm font-semibold text-purple-900">Email: priya@company.com</p>
                </div>
              </form>
            ) : (
              // Signup Screen (Step 0) & Onboarding Steps 1, 2, 3, 4
              <div className="space-y-6">
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 text-center mb-1">Create Account</h2>
                      <p className="text-sm text-slate-500 text-center mb-8">Register using email and mobile credentials</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                          required
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setStep(1)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md mt-6"
                    >
                      Continue to Onboarding
                      <ArrowRight size={18} />
                    </motion.button>
                  </div>
                )}

                {/* Step 1: Company Profile */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 font-sans">Company Name</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme CRM Corp"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Industry Sector</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white text-slate-800 text-sm font-medium transition-all"
                      >
                        <option value="Technology">Technology & Software</option>
                        <option value="Finance">Finance & Insurance</option>
                        <option value="Retail">Retail & E-Commerce</option>
                        <option value="Healthcare">Healthcare & Biotech</option>
                        <option value="Marketing">Marketing & Sales Agencies</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Company Size</label>
                      <div className="grid grid-cols-4 gap-3">
                        {['1-10', '11-50', '51-200', '200+'].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setCompanySize(sz)}
                            className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                              companySize === sz
                                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setStep(0)}
                        className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        disabled={!companyName.trim()}
                        className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        Continue <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Features Selections */}
                {step === 2 && (
                  <div className="space-y-5">
                    <label className="block text-sm font-bold text-slate-700">Select CRM tools you plan to operate</label>
                    <div className="flex flex-col gap-3">
                      {featuresList.map((feature) => {
                        const isSelected = selectedFeatures.includes(feature)
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => toggleFeature(feature)}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="text-sm">{feature}</span>
                            <div
                              className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all ${
                                isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <Check size={12} />}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={selectedFeatures.length === 0}
                        className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        Continue <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Team Configuration */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 font-sans">Number of Employees</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="number"
                          value={teamCount}
                          onChange={(e) => setTeamCount(e.target.value)}
                          placeholder="15"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Operating Locations</label>
                      <input
                        type="text"
                        value={locations}
                        onChange={(e) => setLocations(e.target.value)}
                        placeholder="e.g. New York, London"
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Shift Schedule Model</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Hybrid', 'Remote-first', '24/7 Rotations'].map((model) => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => setShiftModel(model)}
                            className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                              shiftModel === model
                                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        onClick={() => setStep(4)}
                        disabled={!teamCount || !locations.trim()}
                        className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        Continue <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Final Confirmation */}
                {step === 4 && (
                  <div className="space-y-5 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500" size={20} /> Onboarding Summary
                    </h3>
                    
                    <div className="space-y-2.5 text-sm">
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Email:</strong> {email}
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Mobile:</strong> {mobile}
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Company:</strong> {companyName} ({industry})
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Company Size:</strong> {companySize}
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Employees count:</strong> {teamCount} employees
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Shift Model:</strong> {shiftModel}
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Locations:</strong> {locations}
                      </p>
                      <div>
                        <strong className="text-slate-800 block mb-1">Selected Features:</strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedFeatures.map((f) => (
                            <span key={f} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        onClick={handleSignupSubmit}
                        disabled={isLoading}
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Register & Save'}
                        {!isLoading && <Check size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Role selection link */}
            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <Link href="/" className="text-purple-600 hover:text-purple-700 font-bold text-sm transition-colors">
                Back to Role Selection
              </Link>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  )
}
