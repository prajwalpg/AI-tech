import { Navigation } from '@/components/navigation'
import { CheckCircle, Clock, BookOpen, FileText, Type, Target, ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const assignments = await prisma.contentGeneration.findMany({
    where: {
      type: 'worksheet',
      status: 'Approved'
    },
    orderBy: { createdAt: 'desc' }
  })

  // Optionally fetch completed ones from Progress model later if needed 
  // For now we'll just show the pending ones dynamically.
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/student/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Assignments</h1>

        <div className="grid gap-6">
          {assignments.length === 0 && (
            <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-500">
              No pending assignments found. Check back later!
            </div>
          )}
          {assignments.map(assignment => (
            <div key={assignment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-indigo-300 transition-colors border-l-4 border-l-indigo-500">
              <div className="flex space-x-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{assignment.subject} • {assignment.topic}</p>
                </div>
              </div>
              <a href={`/student/chat?context=${assignment.id}`} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-indigo-700 transition">
                Start Assignment
              </a>
            </div>
          ))}

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Completed</h2>
          <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-500 italic">
            Completed assignments feature is coming soon...
          </div>
        </div>
      </main>
    </div>
  )
}
