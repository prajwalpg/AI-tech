'use client'

import { useState } from 'react'
import { Check, X, Loader2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ApproveButtonsProps {
  id: string
}

export function ApproveButtons({ id }: ApproveButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleAction = async (action: 'Approve' | 'Reject') => {
    setLoading(action)
    try {
      const res = await fetch(`/api/content-generations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <Link 
        href={`/teacher/lessons/review/${id}`}
        className="w-full bg-blue-50 text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-100 flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-widest border border-blue-100 transition-all active:scale-95"
      >
        <Eye className="w-4 h-4" />
        <span>Read & Edit Full Content</span>
      </Link>
      
      <div className="flex space-x-2">
        <button
          onClick={() => handleAction('Approve')}
          disabled={!!loading}
          className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 flex items-center justify-center space-x-1 text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
        >
          {loading === 'Approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>Quick Approve</span>
        </button>
        <button
          onClick={() => handleAction('Reject')}
          disabled={!!loading}
          className="flex-1 bg-white border border-red-200 text-red-600 px-4 py-3 rounded-xl hover:bg-red-50 flex items-center justify-center space-x-1 text-xs font-black uppercase tracking-widest transition-all"
        >
          {loading === 'Reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          <span>Reject</span>
        </button>
      </div>
    </div>
  )
}
