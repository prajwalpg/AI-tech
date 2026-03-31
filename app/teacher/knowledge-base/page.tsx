'use client'

import { Navigation } from '@/components/navigation'
import { BookOpen, Search, Filter, CheckCircle, Clock, Loader2, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function KnowledgeBasePage() {
  const [kbData, setKbData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const mockData = [
    { topic: 'Introduction to Algebra', subject: 'Mathematics', type: 'Notes', status: 'Approved', conf: '98%' },
    { topic: 'Cell Structure', subject: 'Biology', type: 'Concept Map', status: 'Approved', conf: '95%' },
    { topic: 'World War II Timeline', subject: 'History', type: 'Key Concepts', status: 'Pending Review', conf: '88%' },
    { topic: 'Newton\'s Laws', subject: 'Physics', type: 'Worksheet', status: 'Approved', conf: '99%' },
    { topic: 'Chemical Reactions', subject: 'Chemistry', type: 'Notes', status: 'Approved', conf: '96%' },
  ]

  useEffect(() => {
    fetch('/api/knowledge-base')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Map DB fields to UI fields
          const mapped = data.data.map((item: any) => ({
            id: item.id,
            topic: item.topic,
            subject: item.subject,
            type: item.type || 'Notes',
            status: 'Approved',
            conf: '100% (Manual)'
          }))
          setKbData(mapped)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const displayData = [...kbData, ...mockData].filter(item => 
    item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    // Note: In a real implementation we'd call a DELETE API
    setKbData(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/teacher/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <BookOpen className="w-4 h-4 mr-2" /> Back to Dashboard
        </a>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-600 mt-2">Manage the memory base that powers the Student AI Agent. Currently showing {displayData.length} records.</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topics or subjects..." 
                className="pl-10 pr-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm min-w-[300px]"
              />
            </div>
            <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:ring-2 focus:ring-blue-200">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Real-time Topics</p>
              <p className="text-2xl font-bold text-gray-900">{kbData.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">System Ready</p>
              <p className="text-2xl font-bold text-gray-900">100%</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Synced</p>
              <p className="text-2xl font-bold text-gray-900">Just Now</p>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
             <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                Updating Knowledge Base...
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Confidence</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayData.map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.topic}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[4rem]">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: item.conf }}></div>
                          </div>
                          <span className="text-xs text-gray-500">{item.conf}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3 flex items-center justify-end">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">Edit</button>
                        {item.id && (
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {displayData.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                           No matching topics found in Knowledge Base.
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
