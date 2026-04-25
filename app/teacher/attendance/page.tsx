'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Users, UserX, Percent, Search, Download, Edit } from 'lucide-react';

export default function TeacherAttendanceDashboard() {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, rate: 0 });
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [subjectFilter, setSubjectFilter] = useState('All');
  
  const [manualEmail, setManualEmail] = useState('');
  const [manualPeriod, setManualPeriod] = useState('Period 1');
  const [manualSubject, setManualSubject] = useState('Maths');
  const [manualStatus, setManualStatus] = useState('Present');
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/attendance/report?date=${date}&subject=${subjectFilter}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records);
        setStats({ present: data.data.totalPresent, absent: data.data.totalAbsent, rate: data.data.attendanceRate });
      }
    } catch(e) {}
  };

  useEffect(() => {
    fetchReport();
  }, [date, subjectFilter]);

  const handleManualMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/mark-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail: manualEmail, period: manualPeriod, subject: manualSubject, status: manualStatus })
      });
      if (res.ok) {
        setManualEmail('');
        fetchReport();
      } else {
        alert('Failed to mark manually. Ensure email is correct.');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Period', 'Subject', 'Student Name', 'Status', 'Method'];
    const rows = records.map(r => [
      new Date(r.createdAt).toLocaleDateString(),
      r.period,
      r.subject,
      r.student.name || r.student.email,
      r.status,
      r.markedByFace ? 'AI Face' : 'Manual'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendance Dashboard</h1>
            <p className="text-gray-500 mt-2">Monitor AI facial recognition attendance daily</p>
          </div>
          <button onClick={exportCSV} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center font-bold text-sm shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Subject</label>
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border">
              <option value="All">All Subjects</option>
              <option value="Maths">Maths</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-l-4 border-green-500 shadow-sm flex items-center">
            <div className="bg-green-100 p-4 rounded-xl mr-4"><Users className="text-green-600 w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Present</p>
              <p className="text-3xl font-black text-gray-900">{stats.present}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-red-500 shadow-sm flex items-center">
            <div className="bg-red-100 p-4 rounded-xl mr-4"><UserX className="text-red-600 w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Absent</p>
              <p className="text-3xl font-black text-gray-900">{stats.absent}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-indigo-500 shadow-sm flex items-center">
            <div className="bg-indigo-100 p-4 rounded-xl mr-4"><Percent className="text-indigo-600 w-8 h-8" /></div>
            <div className="w-full">
              <p className="text-sm font-bold text-gray-500 uppercase">Attendance Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-black text-gray-900">{Math.round(stats.rate)}%</p>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${stats.rate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Period/Subject</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map(r => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.student.name || r.student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.period} • {r.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.markedByFace ? '🤖 Face AI' : '✍️ Manual'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${r.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">No attendance records found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 bg-gradient-to-br from-white to-orange-50">
           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Edit className="w-5 h-5 mr-2 text-orange-500"/> Manual Override</h3>
           <form onSubmit={handleManualMark} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Student Email</label>
                <input required type="email" value={manualEmail} onChange={e=>setManualEmail(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" placeholder="student@sahayak.com"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Period</label>
                <select value={manualPeriod} onChange={e=>setManualPeriod(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border">
                   {['Period 1','Period 2', 'Period 3', 'Period 4'].map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status</label>
                <select value={manualStatus} onChange={e=>setManualStatus(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border">
                   <option value="Present">Present</option>
                   <option value="Absent">Absent</option>
                   <option value="Late">Late</option>
                </select>
              </div>
              <button disabled={loading} type="submit" className="bg-gray-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 h-10">{loading ? 'Saving...' : 'Mark Manually'}</button>
           </form>
        </div>
      </main>
    </div>
  );
}
