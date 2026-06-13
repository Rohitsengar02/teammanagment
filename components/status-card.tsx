'use client'

import { motion } from 'framer-motion'

interface StatusCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: 'green' | 'yellow' | 'blue' | 'red' | 'purple'
  badge?: string
}

const colorStyles = {
  green: 'bg-green-100 text-green-700 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
}

export function StatusCard({
  title,
  value,
  icon,
  color = 'blue',
  badge,
}: StatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl border-2 ${colorStyles[color]} transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      {badge && (
        <div className="mt-4 text-xs font-semibold opacity-75">
          {badge}
        </div>
      )}
    </motion.div>
  )
}
