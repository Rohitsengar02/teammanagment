'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  metric: string
  icon: LucideIcon
  trend?: number
  trendUp?: boolean
  backgroundColor?: string
  iconColor?: string
}

export function MetricsCard({
  title,
  value,
  metric,
  icon: Icon,
  trend,
  trendUp = true,
  backgroundColor = 'bg-slate-50',
  iconColor = 'text-indigo-600',
}: MetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="floating-card p-6 rounded-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${backgroundColor}`}>
          <Icon size={24} className={iconColor} />
        </div>
        {trend !== undefined && (
          <span className={`text-sm font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}%
          </span>
        )}
      </div>
      <p className="text-slate-600 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
      <p className="text-xs text-slate-500 mt-2">{metric}</p>
    </motion.div>
  )
}
