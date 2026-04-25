'use client'

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Calendar, Clock, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StudentExamsPage() {
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/exams').then(res => res.json()).then(data => {
      if (data.success) setExams(data.data);
    }).catch(e => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Available Exams</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
             <div key={exam.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col">
               <div className="border-l-4 border-indigo-500 absolute left-0 top-0 bottom-0"></div>
               <div className="flex justify-between items-start mb-4">
                 <span className="text-xs font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 px-2 py-1 rounded">{exam.subject}</span>
                 {exam.status === 'Active' ? (
                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span> Live Now
                    </span>
                 ) : (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{exam.status}</span>
                 )}
               </div>
               <h3 className="text-lg font-black text-gray-900 mb-2">{exam.title}</h3>
               <div className="flex flex-col space-y-2 mb-6">
                 <div className="flex items-center text-sm font-medium text-gray-500"><Calendar className="w-4 h-4 mr-2" /> {new Date(exam.scheduledAt).toLocaleString()}</div>
                 <div className="flex items-center text-sm font-medium text-gray-500"><Clock className="w-4 h-4 mr-2" /> {exam.duration} mins</div>
                 <div className="flex items-center text-sm font-medium text-gray-500"><FileText className="w-4 h-4 mr-2" /> {exam.totalMarks} marks</div>
               </div>
               <div className="mt-auto pt-4 border-t border-gray-100">
                  <Link href={`/student/exams/${exam.id}`}>
                    <button disabled={exam.status !== 'Active' && exam.status !== 'Published'} className={`w-full py-3 rounded-xl font-bold flex justify-center items-center transition ${exam.status === 'Active' || exam.status === 'Published' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                       {exam.status === 'Active' || exam.status === 'Published' ? 'Start Exam' : 'Not Started Yet'} <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </Link>
               </div>
             </div>
          ))}
          {exams.length === 0 && <div className="col-span-full py-12 text-center text-gray-500 font-medium">No active or upcoming exams at the moment.</div>}
        </div>
      </main>
    </div>
  );
}
