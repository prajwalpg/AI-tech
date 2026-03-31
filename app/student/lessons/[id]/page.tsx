import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/navigation'
import { ArrowLeft, BookOpen, User, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LessonDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  if (!lesson) {
    redirect('/student/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lessons</span>
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-xl">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {lesson?.subject}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">
                  {lesson?.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-gray-600 mb-6 pb-6 border-b border-gray-200">
            <User className="h-4 w-4" />
            <span className="text-sm">
              Teacher: {lesson?.teacher?.name ?? 'Unknown'}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About this lesson</h2>
            <p className="text-gray-700 leading-relaxed">
              {lesson?.description}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Lesson Content</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {lesson?.content}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Have questions about this lesson?
                </h3>
                <p className="text-sm text-gray-600">
                  Ask our AI tutor for personalized help based on this lesson
                </p>
              </div>
              <Link
                href={`/student/chat?lessonId=${lesson?.id}`}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Ask Questions
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
