'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { GraduationCap, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Navigation() {
  const { data: session, status } = useSession() || {}
  
  const userRole = (session?.user as any)?.role || 'Student'
  const userName = session?.user?.name || 'Demo User'

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
            {userRole === 'Teacher' && (
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
              </>
            )}
            
            {userRole === 'Student' && (
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
              </>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {userRole}
                </span>
              </div>
              
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => {
                  try { signOut({ callbackUrl: '/' }) } catch(e) {}
                }}
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Exit</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
