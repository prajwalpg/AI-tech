import { Navigation } from '@/components/navigation'
import { Bell, BookOpen, AlertCircle, MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/student/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Bell className="w-8 h-8 mr-3 text-purple-600" /> Notifications
          </h1>
          <button className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors">
            Mark all read
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-start space-x-4">
             <div className="bg-purple-100 p-3 rounded-full text-purple-600 flex-shrink-0 mt-1">
               <BookOpen className="w-6 h-6" />
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-gray-900 text-lg">New Notes Published!</h3>
               <p className="text-gray-600 mt-1">Your teacher just approved new notes for <b>Introduction to Algebra</b>. These are now available in the Knowledge Base.</p>
               <span className="text-xs font-semibold text-gray-400 mt-2 block">10 mins ago</span>
             </div>
             <div className="w-3 h-3 bg-purple-600 rounded-full flex-shrink-0 mt-3"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-start space-x-4">
             <div className="bg-red-50 p-3 rounded-full text-red-500 flex-shrink-0 mt-1">
               <AlertCircle className="w-6 h-6" />
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-gray-900 text-lg">Assignment Due Soon</h3>
               <p className="text-gray-600 mt-1">Don't forget to submit your <b>World War 2 - Comprehensive Essay</b>. Due tonight at 11:59 PM!</p>
               <span className="text-xs font-semibold text-gray-400 mt-2 block">2 hours ago</span>
             </div>
             <div className="w-3 h-3 bg-red-600 rounded-full flex-shrink-0 mt-3"></div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200 flex items-start space-x-4 opacity-70">
             <div className="bg-green-100 p-3 rounded-full text-green-600 flex-shrink-0 mt-1">
               <MessageSquare className="w-6 h-6" />
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-gray-900 text-lg">Feedback Received</h3>
               <p className="text-gray-600 mt-1">Your teacher reviewed your recent assignment: <b>Cell Biology Quiz</b>. Great job!</p>
               <span className="text-xs font-semibold text-gray-400 mt-2 block">Yesterday</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
