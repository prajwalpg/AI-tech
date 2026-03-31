import { BookOpen, GraduationCap, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Sahayak
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/student/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Continue as Student
              </Link>
              <Link
                href="/teacher/dashboard"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium"
              >
                Continue as Teacher
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center">
        <div className="text-center space-y-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Sahayak AI powered
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Teaching assistant
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sahayak is an AI platform where teachers control the knowledge base. 
            Students learn and solve doubts based ONLY on syllabus-aligned, teacher-approved content.
          </p>
          <div className="flex justify-center space-x-4 pt-8">
            <Link
              href="/teacher/dashboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold flex items-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Continue as Teacher</span>
            </Link>
            <Link
              href="/student/dashboard"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-lg font-semibold border-2 border-blue-600 flex items-center space-x-2"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Continue as Student</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="bg-blue-600 text-white py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl font-bold">Powered by Advanced Multi-Agent Architecture</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-blue-700/50 p-6 rounded-xl border border-blue-500">
              <h4 className="font-bold text-xl mb-2">Content Agent</h4>
              <p className="text-blue-100 text-sm">Generates initial notes and worksheets from curriculum uploads.</p>
            </div>
            <div className="bg-blue-700/50 p-6 rounded-xl border border-blue-500">
              <h4 className="font-bold text-xl mb-2">Memory Agent</h4>
              <p className="text-blue-100 text-sm">Safely stores ONLY teacher-approved content in the knowledge base.</p>
            </div>
            <div className="bg-blue-700/50 p-6 rounded-xl border border-blue-500">
              <h4 className="font-bold text-xl mb-2">Student Agent</h4>
              <p className="text-blue-100 text-sm">Retrieves answers strictly from the approved memory base.</p>
            </div>
            <div className="bg-blue-700/50 p-6 rounded-xl border border-blue-500">
              <h4 className="font-bold text-xl mb-2">Orchestrator</h4>
              <p className="text-blue-100 text-sm">Safely routes workflows between teachers, students, and agents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">How Sahayak Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              1. Teacher Curates
            </h3>
            <p className="text-gray-600">
              Upload textbooks, generate materials with our AI, review them, and approve them to build the classroom knowledge base.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              2. Student Learns
            </h3>
            <p className="text-gray-600">
              Students access a tailored dashboard, view structured notes, attempt teacher-aligned worksheets, and get timetables.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              3. AI Safely Tutors
            </h3>
            <p className="text-gray-600">
              Students ask doubts, and the Student Agent retrieves answers ONLY from the teacher-approved knowledge base. Zero hallucinations.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>© 2026 Sahayak. Teacher-Centric Education, Empowered by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
