'use client'

import { EmployerLayout } from '@/components/employer-layout'
import { motion } from 'framer-motion'
import { Plus, Download, Trash2, FileText } from 'lucide-react'
import { useState } from 'react'

interface Document {
  id: string
  name: string
  type: string
  date: string
  size: string
  category: 'policy' | 'contract' | 'handbook' | 'form'
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Employee Handbook 2024', type: 'PDF', date: '2026-06-01', size: '2.4 MB', category: 'handbook' },
  { id: '2', name: 'Company Code of Conduct', type: 'PDF', date: '2026-05-15', size: '1.8 MB', category: 'policy' },
  { id: '3', name: 'Employment Contract Template', type: 'DOCX', date: '2026-05-10', size: '450 KB', category: 'contract' },
  { id: '4', name: 'Leave Application Form', type: 'PDF', date: '2026-04-20', size: '320 KB', category: 'form' },
]

const categoryColors = {
  policy: 'bg-red-100 text-red-700',
  contract: 'bg-blue-100 text-blue-700',
  handbook: 'bg-green-100 text-green-700',
  form: 'bg-purple-100 text-purple-700',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)

  return (
    <EmployerLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Documents</h1>
          <p className="text-slate-600">Manage company policies and employee documents</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Upload Document
        </motion.button>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((doc, idx) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-slate-100 rounded-lg">
                <FileText size={24} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                <div className="flex gap-4 mt-2 text-sm text-slate-600">
                  <span>{new Date(doc.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${categoryColors[doc.category]}`}>
                    {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.1 }} className="p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                <Download size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                className="p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={20} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </EmployerLayout>
  )
}
