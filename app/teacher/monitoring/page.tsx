'use client'

import { Navigation } from '@/components/navigation'
import { Users, Activity, Target, TrendingUp, Download, ArrowLeft, Bot, User, CheckCircle, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function MonitoringPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/monitoring')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    return `${Math.floor(diff/3600000)}h ago`;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/teacher/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Monitoring</h1>
            <p className="text-gray-500 mt-1">Track classroom engagement, assignment completion, and AI doubt-solving metrics.</p>
          </div>
          <div className="flex space-x-3">
             <button className="bg-white border text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all font-semibold flex items-center shadow-sm">
              <Download className="w-5 h-5 mr-2" /> 
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {loading ? (
           <div className="p-24 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600" />
              <p className="mt-4 text-gray-500 font-medium">Aggregating real-time classroom data...</p>
           </div>
        ) : (
          <>
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{data?.stats?.activeStudents}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Active Students Today</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{data?.stats?.doubtsAnswered}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Doubts Answered by AI</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{data?.stats?.aiSolvedRate}%</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">AI Solve Accuracy</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">76%</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Average Progress</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Recent AI Doubt Logs */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Live AI Conversation Logs</h2>
                </div>
                
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {data?.doubts?.map((d: any, idx: number) => (
                    <div key={idx} className={`border-l-4 ${d.wasAnsweredByAI ? 'border-green-500' : 'border-yellow-500'} pl-4 py-2 bg-gray-50/50 rounded-r-xl transition-all hover:bg-gray-50`}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">"{d.question}"</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase bg-white border border-gray-100 px-2 py-0.5 rounded shadow-sm flex items-center shrink-0 ml-2">
                          <Clock className="w-2.5 h-2.5 mr-1" /> {getTimeAgo(d.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 italic line-clamp-2">
                        <span className="font-bold text-indigo-600 not-italic mr-1 uppercase text-xs">AI Response:</span> "{d.answer}"
                      </p>
                      <div className="mt-3 text-[11px] text-gray-400 flex items-center space-x-3">
                        <span className="flex items-center font-semibold bg-white border border-gray-100 px-2 py-1 rounded shadow-sm">
                          <User className="w-3 h-3 mr-1.5 text-indigo-500"/> {d.studentName}
                        </span>
                        {d.wasAnsweredByAI ? (
                          <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded flex items-center border border-green-100 shadow-sm">
                            <CheckCircle className="w-3 h-3 mr-1"/> Answered via Knowledge Base
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded flex items-center border border-yellow-100 shadow-sm">
                            <Activity className="w-3 h-3 mr-1"/> Referred to Teacher
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!data?.doubts || data?.doubts.length === 0) && (
                    <div className="text-center p-12 text-gray-400 flex flex-col items-center">
                       <Bot className="w-12 h-12 mb-2 opacity-20" />
                       <p>No student conversations logged yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Class Engagement */}
               <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Class Engagement</h2>
                <div className="space-y-4 flex-1">
                  {data?.classEngagement?.length > 0 ? data.classEngagement.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-all border border-transparent hover:border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md">{s.name.charAt(0)}</div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{s.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Student</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{s.score}%</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm italic py-4 text-center">No student tracking data available yet.</p>
                  )}
                </div>
                <button className="w-full mt-6 py-3 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
                  View Detailed Portfolio
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
