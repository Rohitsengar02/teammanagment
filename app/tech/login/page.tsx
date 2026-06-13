'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function TechLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('dev@company.com')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push('/tech/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600" />

          <div className="p-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">LF</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">LeadFlow</h1>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Tech Panel Login</h2>
            <p className="text-slate-600 text-center mb-8">Access your development dashboard</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
                {!isLoading && <ArrowRight size={20} />}
              </motion.button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-slate-600 mb-2">Demo Credentials:</p>
              <p className="text-sm font-mono text-slate-900">Email: dev@company.com</p>
            </div>

            <div className="mt-8 text-center">
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                Back to Role Selection
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
