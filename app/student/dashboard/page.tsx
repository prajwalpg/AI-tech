import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/navigation'
import { LessonCard } from '@/components/lesson-card'
import { BookOpen, MessageCircle, Calendar, GraduationCap, Target, Bell } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }
  const userId = (session.user as any).id

  let lessons: any[] = []
  try {
    lessons = await prisma.lesson.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  } catch (e) {
    lessons = []
  }

  // Group lessons by subject
  const lessonsBySubject = lessons?.reduce((acc: any, lesson: any) => {
    const subject = lesson?. subject ?? 'Other'
    if (!acc[subject]) {
      acc[subject] = []
    }
    acc[subject].push(lesson)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600 mt-2">Access teacher-approved content and get help from the Student Agent</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
            <Target className="w-5 h-5" /><span>Learning Fast-Track</span>
          </div>
        </div>

        {/* Student Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/student/study-plan" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-blue-100 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">"What should I study?"</h3>
            <p className="text-sm text-gray-500">View your timetable and daily objectives</p>
          </Link>

          <Link href="/student/assignments" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-indigo-100 flex flex-col items-center text-center">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Assignments</h3>
            <p className="text-sm text-gray-500">Attempt worksheets and practice questions</p>
          </Link>

          <Link href="/student/tracking" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-green-100 flex flex-col items-center text-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Learning Tracking</h3>
            <p className="text-sm text-gray-500">Monitor your progress and weak areas</p>
          </Link>

          <Link href="/student/notifications" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-purple-100 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-4 rounded-full mb-4 relative">
              <Bell className="h-8 w-8 text-purple-600" />
              <span className="absolute top-0 right-0 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Notifications</h3>
            <p className="text-sm text-gray-500">New topics, assignments, and deadlines</p>
          </Link>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">Continue Learning</h2>
        {lessons?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No lessons available yet
            </h3>
            <p className="text-gray-600">
              Your teacher hasn't approved any content for the knowledge base yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object?.entries(lessonsBySubject ?? {})?.map(([subject, subjectLessons]: [string, any]) => (
              <div key={subject}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{subject}</h2>
                  <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {subjectLessons?.length ?? 0} {subjectLessons?.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectLessons?.map((lesson: any) => (
                    <LessonCard key={lesson?.id} lesson={lesson} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Chat Button (Student Agent) */}
        <Link
          href="/student/chat"
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 flex items-center space-x-2 group z-50 ring-4 ring-blue-600/30"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium pr-1 pl-1">
            Ask Student Agent
          </span>
        </Link>
      </main>
    </div>
  )
}
