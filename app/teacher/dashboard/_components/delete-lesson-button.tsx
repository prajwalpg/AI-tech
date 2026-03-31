'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete lesson')
      }

      router.refresh()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert('Failed to delete lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className="h-4 w-4" />
      <span>{loading ? 'Deleting...' : 'Delete'}</span>
    </button>
  )
}
