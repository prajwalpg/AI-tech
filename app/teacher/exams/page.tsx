'use client'

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Plus, BarChart2, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<any[]>([]);

  const fetchExams = async () => {
    fetch('/api/exams').then(res => res.json()).then(data => {
      if (data.success) setExams(data.data);
    });
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const deleteExam = async (id: string) => {
    if(confirm('Are you sure?')) {
       await fetch(`/api/exams/${id}`, { method: 'DELETE' });
       fetchExams();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Exams</h1>
          </div>
          <Link href="/teacher/exams/new">
            <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center text-sm">
              <Plus className="w-4 h-4 mr-1" /> Create Exam
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Title / Subject</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map(exam => (
                <tr key={exam.id}>
                  <td className="px-6 py-4">
                     <div className="font-bold text-gray-900">{exam.title}</div>
                     <div className="text-xs text-gray-500 font-medium">{exam.subject}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 text-xs font-bold outline outline-1 rounded-full ${exam.status === 'Published' || exam.status === 'Active' ? 'bg-green-50 text-green-700 outline-green-200' : 'bg-gray-100 text-gray-600 outline-gray-200'}`}>{exam.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{new Date(exam.scheduledAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                     {exam._count?.questions} Qs • {exam._count?.submissions} Subs
                  </td>
                  <td className="px-6 py-4 text-sm flex space-x-3">
                     <Link href={`/teacher/exams/${exam.id}/results`} className="text-indigo-600 hover:text-indigo-900 p-1 bg-indigo-50 rounded"><BarChart2 className="w-4 h-4" /></Link>
                     <Link href={`/teacher/exams/${exam.id}/proctoring`} className="text-orange-600 hover:text-orange-900 p-1 bg-orange-50 rounded"><Eye className="w-4 h-4" /></Link>
                     <button onClick={() => deleteExam(exam.id)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">No exams created yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
