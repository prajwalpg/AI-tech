'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('Student')
  const [institution, setInstitution] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, role })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error && typeof data.error === 'object') {
            // Zod error flattening
            const msgs = Object.values(data.error.fieldErrors || {}).flat()
            setError(msgs.join(', ') || 'Validation error')
        } else {
            setError(data.error || 'Failed to sign up')
        }
        setLoading(false)
        return
      }

      router.push('/api/auth/signin?registered=true')
    } catch (err) {
      setError('An error occurred during signup')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 border-b-4 border-indigo-500 pb-2 inline-block mx-auto">
            Join Sahayak
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a new account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm border border-red-200 bg-red-50 p-3 rounded-lg text-center">{error}</div>}
          
          <div className="flex gap-4 p-2 bg-gray-100 rounded-lg justify-center">
             <label className="flex items-center space-x-2 cursor-pointer">
               <input type="radio" value="Student" checked={role === 'Student'} onChange={(e) => setRole(e.target.value)} className="form-radio text-indigo-600 focus:ring-indigo-500" />
               <span className="text-gray-800 text-sm font-medium">I am a Student</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
               <input type="radio" value="Teacher" checked={role === 'Teacher'} onChange={(e) => setRole(e.target.value)} className="form-radio text-indigo-600 focus:ring-indigo-500" />
               <span className="text-gray-800 text-sm font-medium">I am a Teacher</span>
             </label>
          </div>

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input name="name" type="text" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {role === 'Teacher' && (
               <div>
                  <input name="institution" type="text" className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="School/Institution Name (Optional)" value={institution} onChange={(e) => setInstitution(e.target.value)} />
               </div>
            )}
            <div>
              <input name="email" type="email" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <input name="password" type="password" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <input name="confirmPassword" type="password" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
           <Link href="/api/auth/signin" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  )
}
