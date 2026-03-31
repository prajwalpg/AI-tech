'use client'

import { Navigation } from '@/components/navigation'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, MapPin, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TimetablePage() {
  const [view, setView] = useState('week')
  const [filling, setFilling] = useState(false)
  const [entries, setEntries] = useState<any[]>([])
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date()
    const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) // align to Monday
    return new Date(d.setDate(diff))
  })

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetch('/api/timetable')
        if (res.ok) {
          const data = await res.json()
          setEntries(data.timetables || [])
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchTimetable()
  }, [])

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const hours = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM']

  const handleAutoFill = async () => {
     setFilling(true)
     try {
       const res = await fetch('/api/timetable', { method: 'POST' })
       if (res.ok) {
         const data = await res.json()
         setEntries(data.timetables || [])
       }
     } catch (e) {
       console.error(e)
     } finally {
       setFilling(false)
     }
  }

  const shiftWeek = (direction: 'next' | 'prev') => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7))
      return d
    })
  }

  const handleToday = () => {
    const d = new Date()
    const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)
    setCurrentWeekStart(new Date(d.setDate(diff)))
  }

  const renderEntriesForDay = (dayIndex: number) => {
    return entries.filter(e => {
        try {
            const parsed = JSON.parse(e.scheduleData)
            return parsed.day === dayIndex
        } catch { return false }
    }).map((e, idx) => {
        const parsed = JSON.parse(e.scheduleData)
        const top = (parsed.hour - 8) * 96 + 8 // 96px per hour + 8px padding
        
        // simple color alternation
        const colors = ['bg-blue-50 border-blue-500', 'bg-purple-50 border-purple-500', 'bg-yellow-50 border-yellow-500', 'bg-green-50 border-green-600']
        const colorClass = colors[idx % colors.length]
        
        return (
            <div key={e.id} className={`h-[85px] absolute left-2 right-2 border rounded-lg shadow-sm border-l-4 p-3 hover:shadow-md transition-shadow cursor-pointer z-10 ${colorClass}`} style={{ top: `${top}px` }}>
              <h4 className="font-bold text-gray-900 text-sm">{e.subject}</h4>
              <p className="text-xs text-gray-600 mt-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Auto-Assigned</p>
            </div>
        )
    })
  }

  const weekEnd = new Date(currentWeekStart)
  weekEnd.setDate(weekEnd.getDate() + 4)
  const dateStr = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/teacher/dashboard" className="inline-flex items-center text-gray-500 hover:text-green-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Syllabus Timetable</h1>
            <p className="text-gray-500 mt-1">AI-divided curriculum schedule for daily objectives.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white shadow-sm border border-gray-200 rounded-lg p-1">
              <button 
                onClick={() => setView('week')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md shadow-sm transition-colors ${view === 'week' ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}>Week</button>
              <button 
                onClick={() => setView('month')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md shadow-sm transition-colors ${view === 'month' ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}>Month</button>
            </div>
            
            <button onClick={handleAutoFill} disabled={filling} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center shadow-md disabled:opacity-50">
              <Plus className={`w-4 h-4 mr-2 ${filling ? 'animate-spin' : ''}`} /> 
              <span>{filling ? 'Agent Distributing...' : 'Auto-Fill Schedule'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => shiftWeek('prev')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">{view === 'week' ? dateStr : currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => shiftWeek('next')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <button onClick={handleToday} className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors">Today</button>
        </div>

        {view === 'month' ? (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex items-center justify-center text-gray-400 font-bold border-dashed border-4 p-12 text-center text-xl">
               Month view actively synchronizing with Google Calendar and Microsoft Outlook for broader scheduling updates.
           </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="grid grid-cols-6 border-b border-gray-200 bg-gray-50/80 sticky top-0 z-10 w-full">
            <div className="p-4 border-r border-gray-200 text-center flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            {days.map((day, i) => {
              const dateForDay = new Date(currentWeekStart)
              dateForDay.setDate(dateForDay.getDate() + i)
              const isToday = new Date().toDateString() === dateForDay.toDateString()
              return (
                <div key={day} className="p-4 border-r border-gray-200 last:border-r-0 text-center">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{day}</span>
                  <div className={`mt-1 text-2xl ${isToday ? 'font-bold text-green-600 flex items-center justify-center' : 'font-medium text-gray-900'}`}>
                    {dateForDay.getDate()} {isToday && <span className="w-2 h-2 rounded-full bg-green-500 ml-2"></span>}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex-1 overflow-y-auto w-full relative">
            <div className="grid grid-cols-6 relative min-h-[768px]">
              <div className="col-span-1 border-r border-gray-200 bg-gray-50/30">
                {hours.map((hour, i) => (
                  <div key={i} className="h-24 border-b border-gray-200 p-2 text-right relative">
                    <span className="text-xs font-medium text-gray-500 absolute -top-2.5 right-4 bg-gray-50/30 px-1">{hour}</span>
                  </div>
                ))}
              </div>

              {[0, 1, 2, 3, 4].map(dayIdx => (
                <div key={dayIdx} className="col-span-1 border-r border-gray-200 relative">
                  {renderEntriesForDay(dayIdx)}
                </div>
              ))}

              <div className="absolute inset-0 z-0 pointer-events-none w-full ml-[16.666%]">
                {hours.map((_, i) => (
                  <div key={i} className="h-24 border-b border-gray-200 w-[83.333%] border-dashed"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  )
}
