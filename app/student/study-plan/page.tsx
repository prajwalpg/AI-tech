'use client'

import { Navigation } from '@/components/navigation'
import { BookOpen, ArrowLeft, Target, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function StudyPlanPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/study-plan')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/student/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">"What should I study?"</h1>
            <p className="text-gray-500 mt-1">Your AI-generated daily learning plan based on the class timetable.</p>
          </div>
          {loading && (
             <div className="flex items-center text-sm font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse shadow-sm">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> 
                Refining Plan based on recent doubts...
             </div>
          )}
        </div>

        {loading ? (
           <div className="p-24 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600" />
              <p className="mt-4 text-gray-500 font-medium">Analyzing your latest Doubts & Timetable...</p>
           </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 border-l-[6px] border-l-blue-600 group hover:shadow-lg transition-all">
                 <div className="flex items-center space-x-3 mb-4">
                   <Target className="w-8 h-8 text-blue-600" />
                   <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Today's Priority</h2>
                 </div>
                 <h3 className="text-2xl font-black text-gray-800 mb-2 leading-tight">
                    {data?.priority?.title}
                 </h3>
                 <p className="text-gray-600 mb-6 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100 italic flex items-center">
                    <span className="text-blue-600 font-black mr-2 text-xl italic group-hover:scale-125 transition-transform">"</span> 
                    {data?.priority?.reason}
                 </p>
                 
                 <div className="flex space-x-4">
                   <a href="/student/chat" className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 font-bold shadow-md hover:shadow-xl transition-all flex items-center">
                     <BookOpen className="w-5 h-5 mr-3" /> Start {data?.priority?.title} Lesson
                   </a>
                 </div>
               </div>

               <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Personalized Recommendations</h2>
               <div className="grid md:grid-cols-2 gap-4">
                 {data?.recommendations?.map((r: string, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-indigo-50 shadow-sm flex items-start space-x-3 hover:translate-y-[-2px] transition-all">
                      <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                         <Target className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-gray-700">{r}</p>
                    </div>
                 ))}
                 {(!data?.recommendations || data?.recommendations.length === 0) && (
                   <p className="text-gray-400 italic">No recommendations yet. Ask more doubts in the chat!</p>
                 )}
               </div>

               <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">Upcoming Schedule</h2>
               <div className="space-y-4">
                 {data?.upcomingSchedule?.length > 0 ? data.upcomingSchedule.map((item: any, i: number) => (
                   <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer group">
                     <div className="flex items-center space-x-4">
                       <span className="font-bold text-gray-400 bg-gray-50 border px-3 py-1 rounded-lg w-28 text-center text-xs group-hover:text-indigo-600 group-hover:border-indigo-100">{item.time}</span>
                       <div>
                         <h4 className="font-black text-gray-900 group-hover:text-indigo-700 transition-colors uppercase text-sm tracking-tight">{item.topic}</h4>
                         <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.type}</span>
                       </div>
                     </div>
                     <span className={`text-xs font-black uppercase tracking-widest ${item.status === 'Next' ? 'text-blue-600' : 'text-gray-400'}`}>{item.status}</span>
                   </div>
                 )) : (
                   <p className="text-gray-500 italic">No upcoming classes scheduled by your teacher.</p>
                 )}
               </div>
            </div>

            <div className="lg:col-span-1">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                 <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Weekly Progress</h3>
                 <div className="mb-6">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-gray-500 uppercase tracking-widest text-[10px]">Tasks Completed</span>
                      <span className="text-green-600">{data?.stats?.tasksCompleted} / {data?.stats?.totalTasks}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-50">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full shadow-inner transition-all duration-1000" style={{ width: `${data?.stats?.progressPercent}%` }}></div>
                    </div>
                 </div>
                 <p className="text-sm text-gray-500 font-medium leading-relaxed italic">
                    You are on <span className="text-green-600 font-black">track</span> to finish your weekly syllabus! Your AI coach suggests focusing on <span className="text-indigo-600 font-black">{data?.weakTopics?.[0] || 'your core subjects'}</span> to improve your quiz scores.
                 </p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
