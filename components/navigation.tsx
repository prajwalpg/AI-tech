'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { GraduationCap, LogOut, User, Loader2 } from 'lucide-react'
import { NotificationBell } from '@/components/notification-bell'

export function Navigation() {
  const { data: session, status } = useSession()
  
  const userRole = (session?.user as any)?.role
  const userName = session?.user?.name

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Sahayak
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {status === 'authenticated' && userRole === 'Teacher' && (
              <>
                <Link
                  href="/teacher/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  Dashboard
                </Link>
                <Link
                  href="/teacher/lessons/new"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  Create Content
                </Link>
                <Link href="/teacher/exams" className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer">
                  Exams
                </Link>
                <Link href="/teacher/attendance" className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer">
                  Attendance
                </Link>
              </>
            )}
            
            {status === 'authenticated' && userRole === 'Student' && (
              <>
                <Link
                  href="/student/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  Dashboard
                </Link>
                <Link
                  href="/student/chat"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  Student Agent
                </Link>
                <Link href="/student/exams" className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer flex items-center">
                  Exams
                  <span className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse hidden" id="exam-live-dot"></span>
                </Link>
                <Link href="/student/attendance" className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer">
                  Attendance
                </Link>
              </>
            )}

            <div className="flex items-center space-x-4">
              {status === 'loading' && (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
              )}

              {status === 'unauthenticated' && (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                  Sign In
                </Link>
              )}

              {status === 'authenticated' && (
                <>
                  {userRole === 'Student' && <NotificationBell />}
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{userName}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {userRole}
                    </span>
                  </div>
                  
                  <button
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Exit</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
