import Link from 'next/link'
import { BookOpen, User, ArrowRight } from 'lucide-react'

interface LessonCardProps {
  lesson: {
    id: string
    title: string
    subject: string
    description: string
    teacher: {
      name: string | null
    }
  }
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <Link href={`/student/lessons/${lesson?.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 h-full flex flex-col group cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-blue-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            {lesson?.subject}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {lesson?.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {lesson?.description}
        </p>
        
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{lesson?.teacher?.name ?? 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
              <span className="text-sm">View</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
