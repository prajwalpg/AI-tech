'use client'

import React from 'react';
import { useProctoring } from '@/hooks/use-proctoring';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function ProctoringOverlay({ examId, enabled, children }: { examId: string, enabled: boolean, children: React.ReactNode }) {
  const { violationCount, isMonitoring, warningMessage } = useProctoring({ examId, enabled });

  if (violationCount >= 5) {
     return (
       <div className="min-h-[100dvh] bg-red-50 flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-600">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-gray-900 mb-2">Exam Terminated</h1>
            <p className="text-gray-600 mb-6 font-medium">You have exceeded the maximum allowed high-severity proctoring violations. This attempt has been logged and reported to your teacher.</p>
            <button className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl w-full" onClick={() => window.location.href='/student/dashboard'}>Return to Dashboard</button>
         </div>
       </div>
     );
  }

  return (
    <div className="relative min-h-[100dvh]">
      {enabled && isMonitoring && (
         <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-300 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span> Monitored
           <ShieldCheck className="w-4 h-4 ml-2 opacity-50" />
         </div>
      )}

      {warningMessage && (
         <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
           <div className="bg-white p-6 rounded-2xl border-4 border-red-500 max-w-lg w-full shadow-2xl text-center flex flex-col items-center">
             <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
             <h2 className="text-2xl font-black text-red-600 mb-2">Proctoring Warning</h2>
             <p className="text-gray-800 text-lg font-bold mb-4">{warningMessage}</p>
             <p className="text-sm text-gray-500 mb-6 text-center">This violation has been logged. {5 - violationCount} strikes remaining.</p>
           </div>
         </div>
      )}

      {children}
    </div>
  );
}
