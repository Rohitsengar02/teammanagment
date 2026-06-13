'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
}

export function StatCard({ icon: Icon, label, value, change, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="floating-card p-6 rounded-2xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-xs font-semibold mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center">
          <Icon size={24} className="text-indigo-600" />
        </div>
        </div>
      </motion.div>
    )
  }
