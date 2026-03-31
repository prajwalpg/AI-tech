'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LessonFormProps {
  lesson?: {
    id: string
    title: string
    subject: string
    description: string
    content: string
  } | null
}

export function LessonForm({ lesson }: LessonFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: lesson?.title ?? '',
    subject: lesson?.subject ?? '',
    description: lesson?.description ?? '',
    content: lesson?.content ?? ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = lesson?.id ? `/api/lessons/${lesson.id}` : '/api/lessons'
      const method = lesson?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.error ?? 'Something went wrong')
        setLoading(false)
        return
      }

      router.push('/teacher/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Form error:', error)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData?.title ?? ''}
          onChange={(e) => setFormData({ ...formData, title: e?.target?.value ?? '' })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Introduction to Algebra"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject *
        </label>
        <input
          id="subject"
          type="text"
          required
          value={formData?.subject ?? ''}
          onChange={(e) => setFormData({ ...formData, subject: e?.target?.value ?? '' })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Mathematics"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          required
          rows={3}
          value={formData?.description ?? ''}
          onChange={(e) => setFormData({ ...formData, description: e?.target?.value ?? '' })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="A brief overview of what students will learn..."
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Content *
        </label>
        <textarea
          id="content"
          required
          rows={12}
          value={formData?.content ?? ''}
          onChange={(e) => setFormData({ ...formData, content: e?.target?.value ?? '' })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
          placeholder="Enter your lesson content here. This is what the AI will reference when helping students..."
        />
        <p className="text-sm text-gray-500 mt-2">
          Tip: Include key concepts, definitions, examples, and explanations that students should learn.
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (lesson?.id ? 'Updating...' : 'Creating...') : (lesson?.id ? 'Update Lesson' : 'Create Lesson')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/teacher/dashboard')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
