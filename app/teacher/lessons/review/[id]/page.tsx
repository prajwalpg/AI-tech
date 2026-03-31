'use client'

import { Navigation } from '@/components/navigation'
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ReviewContentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/content-generations/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error)
        }
      })
      .catch(err => setError('Failed to load content'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApprove = async () => {
    setSaving(true)
    try {
      // First update the text if they edited it
      await fetch(`/api/content-generations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatedText: data.generatedText, title: data.title })
      })

      // Then approve
      const res = await fetch(`/api/content-generations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'Approve' })
      })
      
      if (res.ok) {
        router.push('/teacher/dashboard')
        router.refresh()
      }
    } catch (e) {
      setError('Failed to approve content')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <Link href="/teacher/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {data && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-amber-50 p-8 border-b border-amber-100 flex justify-between items-center">
               <div>
                  <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Review AI Generation</h1>
                  <p className="text-amber-700 font-bold mt-1 uppercase text-xs tracking-widest">Status: Pending Approval</p>
               </div>
               <div className="flex space-x-3">
                  <button 
                    onClick={handleApprove}
                    disabled={saving}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-green-700 transition-all flex items-center space-x-2 active:scale-95"
                  >
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span>Approve & Publish</span>
                  </button>
               </div>
            </div>

            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Subject</label>
                    <p className="bg-gray-50 p-4 rounded-xl font-bold text-gray-700 border border-gray-100">{data.subject}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Topic</label>
                    <p className="bg-gray-50 p-4 rounded-xl font-bold text-gray-700 border border-gray-100">{data.topic}</p>
                  </div>
               </div>

               <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Editor Title</label>
                <input 
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({...data, title: e.target.value})}
                  className="w-full bg-gray-50 p-4 rounded-xl font-bold text-gray-900 border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                />
               </div>

               <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Content (Markdown)</label>
                <textarea 
                  rows={20}
                  value={data.generatedText}
                  onChange={(e) => setData({...data, generatedText: e.target.value})}
                  className="w-full bg-gray-50 p-6 rounded-2xl font-mono text-sm text-gray-800 border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed"
                />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
