import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/navigation'
import { LessonForm } from '../../_components/lesson-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditLessonPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const userRole = (session.user as any)?.role
  const userId = (session.user as any)?.id
  
  if (userRole !== 'Teacher') {
    redirect('/student/dashboard')
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id }
  })

  if (!lesson) {
    redirect('/teacher/dashboard')
  }

  if (lesson.teacherId !== userId) {
    redirect('/teacher/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Lesson</h1>
          <p className="text-gray-600 mb-8">Update your lesson content</p>
          
          <LessonForm lesson={{ ...lesson, description: lesson.description ?? '' }} />
        </div>
      </main>
    </div>
  )
}
