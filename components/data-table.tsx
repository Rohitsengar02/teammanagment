'use client'

import { motion } from 'framer-motion'

interface Column {
  key: string
  label: string
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  title: string
  columns: Column[]
  data: any[]
  actions?: (row: any) => React.ReactNode
}

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-green-100 text-green-700',
  proposal: 'bg-orange-100 text-orange-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
}

export function DataTable({ title, columns, data, actions }: DataTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="floating-card rounded-xl overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-slate-50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-slate-900">
                    {column.render
                      ? column.render(row[column.key], row)
                      : (
                          row[column.key]?.toString()
                        )}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-right">
                    {actions(row)}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <p>No data available</p>
        </div>
      )}
    </motion.div>
  )
}
