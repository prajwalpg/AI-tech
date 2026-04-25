'use client'

import React, { useEffect, useState } from 'react';
import { ProctoringOverlay } from '@/components/proctoring-overlay';
import { Clock, Play, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExamTakingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch(`/api/exams/${params.id}`).then(res => res.json()).then(data => {
      if (data.success) {
         setExam(data.exam);
         setTimeLeft(data.exam.duration * 60);
      }
    });
  }, [params.id]);

  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
       setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(interval); submitExam(); return 0; }
          return prev - 1;
       });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted, timeLeft]);

  const startExam = async () => {
    try { await document.documentElement.requestFullscreen(); } catch (e) {}
    setStarted(true);
  };

  const submitExam = async () => {
     try { if(document.fullscreenElement) await document.exitFullscreen(); } catch(e) {}
     setSubmitted(true);
     const res = await fetch(`/api/exams/${params.id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
     });
     const data = await res.json();
     if(data.success) setScore(data.score);
  };

  if (!exam) return <div className="p-12 text-center">Loading...</div>;

  if (submitted) {
     return (
       <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 font-bold text-3xl">✅</div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Exam Complete!</h1>
            <p className="text-gray-500 mb-8">You scored {score} out of {exam.totalMarks}</p>
            <button onClick={() => router.push('/student/dashboard')} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700">Return to Dashboard</button>
         </div>
       </div>
     );
  }

  if (!started) {
     return (
       <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
            <h1 className="text-3xl font-black text-gray-900 mb-2">{exam.title}</h1>
            <p className="text-indigo-600 font-bold mb-6">{exam.subject} • {exam.duration} mins • {exam.totalMarks} marks</p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 text-sm text-orange-800 font-medium rounded-r-lg">
               ⚠️ This is a proctored exam. Your camera, screen, and keyboard will be monitored. Tab switching or exiting fullscreen will result in termination.
            </div>
            <div className="space-y-3 mb-8">
               <label className="flex items-center space-x-3"><input type="checkbox" className="w-5 h-5 cursor-pointer" required /> <span className="font-bold text-gray-700 text-sm">I have closed other tabs</span></label>
               <label className="flex items-center space-x-3"><input type="checkbox" className="w-5 h-5 cursor-pointer" required /> <span className="font-bold text-gray-700 text-sm">I am in a well-lit space</span></label>
            </div>
            <button onClick={startExam} className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 flex items-center justify-center shadow-lg transform transition active:scale-95"><Play className="w-5 h-5 mr-2"/> Begin Exam</button>
         </div>
       </div>
     );
  }

  return (
     <ProctoringOverlay examId={params.id} enabled={true}>
        <div className="h-[100dvh] flex flex-col bg-gray-50">
           <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
              <h1 className="font-black text-lg text-gray-900">{exam.title}</h1>
              <div className={`font-mono text-2xl font-bold flex items-center ${timeLeft < 180 ? 'text-red-600' : 'text-gray-800'}`}>
                 <Clock className="w-6 h-6 mr-2" /> {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
              </div>
              <button onClick={submitExam} className="bg-gray-900 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 shadow">Finish & Submit</button>
           </header>
           
           <main className="flex-1 overflow-auto p-4 md:p-8 max-w-3xl mx-auto w-full">
              {exam.questions.map((q: any, i: number) => (
                 <div key={q.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-6 relative">
                    <div className="text-xs font-black text-indigo-500 uppercase mb-4 tracking-widest flex justify-between">
                       <span>Question {i + 1}</span> <span>{q.marks} Marks</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-6">{q.questionText}</p>
                    
                    {q.type === 'MCQ' && (
                       <div className="space-y-3">
                          {JSON.parse(q.options).map((opt: string, oi: number) => (
                             <label key={oi} className={`flex items-center p-4 rounded-xl border ${answers[q.id] === opt ? 'bg-indigo-50 border-indigo-600 align-left' : 'hover:bg-gray-50 border-gray-200'} cursor-pointer transition`}>
                                <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswers({...answers, [q.id]: opt})} className="w-5 h-5 text-indigo-600 border-gray-300 mr-4" />
                                <span className="font-medium text-gray-800">{opt}</span>
                             </label>
                          ))}
                       </div>
                    )}
                    {q.type === 'Short' && <input className="w-full border p-4 rounded-xl text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Your Answer..." value={answers[q.id]||''} onChange={e=>setAnswers({...answers, [q.id]: e.target.value})} />}
                    {q.type === 'Descriptive' && <textarea className="w-full border p-4 rounded-xl text-lg h-40 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Detailed Answer..." value={answers[q.id]||''} onChange={e=>setAnswers({...answers, [q.id]: e.target.value})} />}
                 </div>
              ))}
           </main>
        </div>
     </ProctoringOverlay>
  );
}
