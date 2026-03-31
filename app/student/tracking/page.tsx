import { Navigation } from '@/components/navigation'
import { Target, TrendingUp, TrendingDown, Award, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/student/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Learning Tracking</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between col-span-1">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Overall Class Rank</p>
              <h2 className="text-4xl font-black text-gray-900">4th</h2>
            </div>
            <Award className="w-12 h-12 text-yellow-500" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between col-span-1">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Average Quiz Score</p>
              <h2 className="text-4xl font-black text-gray-900">92%</h2>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-600 flex items-center space-x-1 font-semibold text-sm">
              <TrendingUp className="w-4 h-4" /> <span>+4%</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between col-span-1">
            <div>
               <p className="text-sm font-semibold text-gray-500 mb-1">Longest Streak</p>
               <h2 className="text-4xl font-black text-gray-900">14 <span className="text-lg text-gray-500">days</span></h2>
            </div>
            <Star className="w-12 h-12 text-orange-400" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 bg-gradient-to-r from-transparent to-green-50/50">
             <div className="flex items-center space-x-3 mb-6">
               <TrendingUp className="w-6 h-6 text-green-600" />
               <h2 className="text-xl font-bold text-gray-900">Strongest Topics</h2>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center bg-white p-3 border rounded-xl">
                 <span className="font-semibold text-gray-700">Cell Biology</span>
                 <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">98% Mastery</span>
               </div>
               <div className="flex justify-between items-center bg-white p-3 border rounded-xl">
                 <span className="font-semibold text-gray-700">World War II</span>
                 <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">94% Mastery</span>
               </div>
               <div className="flex justify-between items-center bg-white p-3 border rounded-xl">
                 <span className="font-semibold text-gray-700">Literary Devices</span>
                 <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">90% Mastery</span>
               </div>
             </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 bg-gradient-to-r from-transparent to-red-50/50">
             <div className="flex items-center space-x-3 mb-6">
               <TrendingDown className="w-6 h-6 text-red-600" />
               <h2 className="text-xl font-bold text-gray-900">Needs Improvement</h2>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center bg-white p-3 border rounded-xl border-l-4 border-l-red-500">
                 <div>
                   <span className="font-semibold text-gray-700 block">Algebra</span>
                   <span className="text-xs text-gray-500">Linear Equations</span>
                 </div>
                 <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-sm">74% Mastery</span>
               </div>
               <div className="flex justify-between items-center bg-white p-3 border rounded-xl border-l-4 border-l-yellow-500">
                 <div>
                   <span className="font-semibold text-gray-700 block">Physics</span>
                   <span className="text-xs text-gray-500">Newton&apos;s Third Law</span>
                 </div>
                 <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-sm">81% Mastery</span>
               </div>
             </div>
             <button className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md transition-all flex justify-center items-center">
               <Target className="w-5 h-5 mr-2" /> Start Focus Session
             </button>
          </div>
        </div>
      </main>
    </div>
  )
}
