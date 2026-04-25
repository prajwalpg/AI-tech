'use client'

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProctoringReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/proctoring/report/${params.id}`).then(res => res.json()).then(data => {
      if (data.success) setReport(data.data);
    });
  }, [params.id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
         <div className="flex items-center mb-8 space-x-4">
           <Link href="/teacher/exams" className="p-2 bg-white rounded-full shadow hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
           <div>
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center"><ShieldAlert className="w-8 h-8 text-black mr-3" /> Proctoring Report</h1>
           </div>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {report.map(student => (
               <div key={student.studentId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`p-6 border-l-4 ${student.riskScore > 60 ? 'border-red-500 bg-red-50' : student.riskScore > 30 ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'} flex justify-between items-center`}>
                     <div>
                        <h2 className="text-xl font-black text-gray-900">{student.studentName}</h2>
                        <div className="text-sm font-bold text-gray-600 mt-1">{student.violations.length} Violations Logged</div>
                     </div>
                     <div className="text-right flex flex-col items-end">
                        <span className="text-xs font-black uppercase text-gray-500 tracking-wider mb-1">Risk Score</span>
                        <div className="text-3xl font-black text-gray-900">{student.riskScore}</div>
                     </div>
                  </div>
                  <div className="p-6">
                     <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                           <tr><th className="text-left text-xs text-gray-400 font-bold uppercase pb-2">Time</th><th className="text-left text-xs text-gray-400 font-bold uppercase pb-2">Type</th><th className="text-left text-xs text-gray-400 font-bold uppercase pb-2">Description</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {student.violations.map((v: any, i: number) => (
                              <tr key={i}>
                                 <td className="py-3 text-xs text-gray-500 font-medium">{new Date(v.createdAt).toLocaleTimeString()}</td>
                                 <td className="py-3 text-xs font-bold uppercase text-gray-800">{v.violationType}</td>
                                 <td className="py-3 text-sm text-gray-600">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${v.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                    {v.description}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            ))}
            {report.length === 0 && <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-2xl shadow-sm">No proctoring logs for this exam.</div>}
         </div>
      </main>
    </div>
  );
}
