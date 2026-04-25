import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { BookOpen, Plus, Edit, FileText, Calendar, Eye, Bell, Sparkles, CheckCircle } from 'lucide-react'
import { DeleteLessonButton } from './_components/delete-lesson-button'
import { ApproveButtons } from './_components/approve-buttons'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/api/auth/signin')
  }
  const userId = (session.user as any).id
  if ((session.user as any).role !== 'Teacher') {
    redirect('/student/dashboard')
  }
  
  let lessons: any[] = []
  let pendingGenerations: any[] = []
  
  try {
    lessons = await prisma.lesson.findMany({
      where: { teacherId: userId },
      orderBy: { createdAt: 'desc' }
    })
    
    pendingGenerations = await prisma.contentGeneration.findMany({
      where: { 
        teacherId: userId,
        status: 'Pending'
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (e) {
    lessons = []
    pendingGenerations = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight">Teacher Control Center</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage everything your students see and learn</p>
          </div>
          <Link
            href="/teacher/lessons/new"
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-2xl flex items-center space-x-2 font-extrabold"
          >
            <Plus className="h-6 w-6" />
            <span>Generate New Content</span>
          </Link>
        </div>

        {/* Dashboard Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link href="/teacher/knowledge-base" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-blue-100 flex flex-col items-center text-center group">
            <div className="bg-blue-100 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Knowledge Base</h3>
            <p className="text-xs text-gray-400 font-medium px-4 leading-relaxed">View what students can ask the AI about</p>
          </Link>

          <Link href="/teacher/question-papers" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-indigo-100 flex flex-col items-center text-center group">
            <div className="bg-indigo-100 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Question Papers</h3>
            <p className="text-xs text-gray-400 font-medium px-4 leading-relaxed">Auto-generate exams from approved notes</p>
          </Link>

          <Link href="/teacher/timetable" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-green-100 flex flex-col items-center text-center group">
            <div className="bg-green-100 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Timetable</h3>
            <p className="text-xs text-gray-400 font-medium px-4 leading-relaxed">Divide syllabus into daily schedules</p>
          </Link>

          <Link href="/teacher/monitoring" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-purple-100 flex flex-col items-center text-center group">
            <div className="bg-purple-100 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Monitoring</h3>
            <p className="text-xs text-gray-400 font-medium px-4 leading-relaxed">Track views, doubts, and assignments</p>
          </Link>
        </div>

        {/* Pending Approvals Section */}
        {pendingGenerations.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-amber-100 p-2 rounded-lg"><Bell className="h-6 w-6 text-amber-600" /></div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Action Required: AI Content Verification</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingGenerations.map((gen: any) => (
                <div key={gen.id} className="bg-white rounded-3xl shadow-sm border-2 border-amber-100 p-8 hover:shadow-xl transition-all relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
                   <div className="flex justify-between items-start mb-6">
                      <div className="bg-amber-50 p-3 rounded-2xl">
                         <Sparkles className="h-6 w-6 text-amber-600" />
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{gen.subject}</span>
                   </div>
                   <h3 className="text-xl font-black text-gray-900 mb-3 leading-tight uppercase tracking-tight">{gen.title}</h3>
                   <p className="text-gray-500 text-sm mb-8 line-clamp-3 font-medium bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">{gen.generatedText}</p>
                   
                   <ApproveButtons id={gen.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3 mb-8">
           <div className="bg-blue-100 p-2 rounded-lg"><CheckCircle className="h-6 w-6 text-blue-600" /></div>
           <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Approved Classroom Content</h2>
        </div>

        {lessons?.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-16 text-center border-2 border-dashed border-gray-100 max-w-2xl mx-auto">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">
              Syllabus is Empty
            </h3>
            <p className="text-gray-500 mb-10 font-medium leading-relaxed">
              Upload curriculum or textbook to let the Multi-Agent System generate notes. Once you approve them, they will appear here and become visible to students.
            </p>
            <Link
              href="/teacher/lessons/new"
              className="inline-flex items-center space-x-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-md font-bold text-lg"
            >
              <Plus className="h-6 w-6" />
              <span>Generate Content</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons?.map((lesson: any) => (
              <div
                key={lesson?.id}
                className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all p-8 border border-gray-100 group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="bg-blue-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="bg-green-50 text-green-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-green-100">
                    {lesson?.subject}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight leading-tight">
                  {lesson?.title}
                </h3>
                <p className="text-gray-500 text-sm mb-8 line-clamp-2 font-medium">
                  {lesson?.description}
                </p>
                
                <div className="flex items-center space-x-3 pt-6 border-t border-gray-50">
                  <Link
                    href={`/teacher/lessons/${lesson?.id}/edit`}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-50 text-gray-600 px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    <Edit className="h-4 w-4" />
                    <span>View / Edit</span>
                  </Link>
                  <DeleteLessonButton lessonId={lesson?.id ?? ''} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
