'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatIndexPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/chat/general')
  }, [router])

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-slate-500 text-sm font-semibold animate-pulse">Loading general channel...</p>
    </div>
  )
}
