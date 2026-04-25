'use client'

import React, { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Plus, Trash2, Wand2, Save, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeacherExamCreator() {
  const router = useRouter();
  const [exam, setExam] = useState<any>({ title: '', subject: '', duration: 45, passingMarks: 35, scheduledAt: '', instructions: '', status: 'Draft' });
  const [questions, setQuestions] = useState<any[]>([]);

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiForm, setAiForm] = useState({ topic: '', difficulty: 'medium', questionType: 'MCQ', quantity: 5 });
  const [isGenerating, setIsGenerating] = useState(false);

  const addQuestion = () => setQuestions([...questions, { type: 'MCQ', questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1, order: questions.length }]);
  const updateQ = (idx: number, key: string, val: any) => { const n = [...questions]; n[idx][key] = val; setQuestions(n); };
  const removeQ = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));

  const saveExam = async (status: string) => {
     try {
        const res = await fetch('/api/exams', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ...exam, status, questions })
        });
        if(res.ok) router.push('/teacher/exams');
     } catch(e) {}
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm)
      });
      const data = await res.json();
      if (data.success && data.data?.questions) {
        const newQs = data.data.questions.map((q: any, i: number) => ({
          type: aiForm.questionType,
          questionText: q.questionText || '',
          options: q.options || ['', '', '', ''],
          correctAnswer: q.correctAnswer || '',
          marks: q.marks || (aiForm.questionType === 'MCQ' ? 1 : 5),
          order: questions.length + i
        }));
        setQuestions([...questions, ...newQs]);
        setShowAIModal(false);
      } else {
        alert(data.error || 'Failed to generate questions. Ensure Gemini API key is valid.');
      }
    } catch(e) {
      alert('Error connecting to AI service.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-8">
         <div className="w-full md:w-1/3">
            <h1 className="text-2xl font-black mb-6">Exam Settings</h1>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
               <div><label className="text-xs font-bold uppercase text-gray-500">Title</label><input className="w-full border p-2 rounded-lg" value={exam.title} onChange={e=>setExam({...exam, title: e.target.value})} /></div>
               <div><label className="text-xs font-bold uppercase text-gray-500">Subject</label><input className="w-full border p-2 rounded-lg" value={exam.subject} onChange={e=>setExam({...exam, subject: e.target.value})} /></div>
               <div><label className="text-xs font-bold uppercase text-gray-500">Duration (mins)</label><input type="number" className="w-full border p-2 rounded-lg" value={exam.duration} onChange={e=>setExam({...exam, duration: parseInt(e.target.value)})} /></div>
               <div><label className="text-xs font-bold uppercase text-gray-500">Passing Marks</label><input type="number" className="w-full border p-2 rounded-lg" value={exam.passingMarks} onChange={e=>setExam({...exam, passingMarks: parseInt(e.target.value)})} /></div>
               <div><label className="text-xs font-bold uppercase text-gray-500">Scheduled At</label><input type="datetime-local" className="w-full border p-2 rounded-lg" value={exam.scheduledAt} onChange={e=>setExam({...exam, scheduledAt: e.target.value})} /></div>
               <div><label className="text-xs font-bold uppercase text-gray-500">Instructions</label><textarea className="w-full border p-2 rounded-lg" value={exam.instructions} onChange={e=>setExam({...exam, instructions: e.target.value})} /></div>
               <button onClick={() => setShowAIModal(true)} className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg border border-indigo-200 flex items-center justify-center"><Wand2 className="w-4 h-4 mr-2" /> AI Generate Qs</button>
            </div>
         </div>
         <div className="w-full md:w-2/3">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-2xl font-black">Question Builder</h1>
               <button onClick={addQuestion} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl shadow hover:bg-indigo-700 flex items-center text-sm"><Plus className="w-4 h-4 mr-1"/> Add Question</button>
            </div>
            <div className="space-y-6 mb-24">
               {questions.map((q, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative">
                     <button onClick={()=>removeQ(i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                     <div className="text-xs font-black text-gray-500 mb-2">QUESTION {i+1}</div>
                     <select value={q.type} onChange={e=>updateQ(i, 'type', e.target.value)} className="border p-2 rounded-lg mb-4 text-sm font-bold w-48">
                        <option value="MCQ">Multiple Choice</option><option value="Short">Short Answer</option><option value="Descriptive">Descriptive</option>
                     </select>
                     <textarea placeholder="Question Text" className="w-full border p-3 rounded-lg mb-4 shadow-sm" value={q.questionText} onChange={e=>updateQ(i, 'questionText', e.target.value)} />
                     {q.type === 'MCQ' && (
                        <div className="space-y-2 mb-4 pl-4 border-l-2 border-indigo-100">
                           {q.options.map((opt:any, oi:number) => (
                              <div key={oi} className="flex items-center space-x-2">
                                 <input type="radio" checked={q.correctAnswer === opt && opt !== ''} onChange={()=>updateQ(i, 'correctAnswer', opt)} className="w-4 h-4 text-indigo-600" />
                                 <input className="border p-2 rounded-lg text-sm flex-1" placeholder={`Option ${oi+1}`} value={opt} onChange={e=>{
                                    const opts = [...q.options]; opts[oi] = e.target.value; updateQ(i, 'options', opts);
                                 }} />
                              </div>
                           ))}
                        </div>
                     )}
                     <div><label className="text-xs font-bold text-gray-500 mr-2 uppercase">Marks</label><input type="number" className="border p-2 rounded w-24 text-center" value={q.marks} onChange={e=>updateQ(i, 'marks', parseInt(e.target.value))} /></div>
                  </div>
               ))}
               {questions.length === 0 && <div className="text-center text-gray-400 py-12">No questions. Add one to begin.</div>}
            </div>
         </div>
      </main>

      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-4 flex items-center text-indigo-900"><Wand2 className="w-5 h-5 mr-2 text-indigo-600"/> Generate Questions via AI</h2>
            <p className="text-sm text-gray-500 mb-6">Enter the topic or syllabus context below. The AI will strictly stick to it.</p>
            <div className="space-y-4">
              <div><label className="text-xs font-bold uppercase text-gray-500">Syllabus Topic</label><input className="w-full border-2 border-gray-100 focus:border-indigo-500 p-3 rounded-xl outline-none transition" value={aiForm.topic} onChange={e=>setAiForm({...aiForm, topic: e.target.value})} placeholder="E.g., Nitrogen Cycle or World War II" /></div>
              <div className="flex gap-4">
                <div className="w-1/2"><label className="text-xs font-bold uppercase text-gray-500">Difficulty</label>
                  <select className="w-full border-2 border-gray-100 focus:border-indigo-500 p-3 rounded-xl outline-none transition" value={aiForm.difficulty} onChange={e=>setAiForm({...aiForm, difficulty: e.target.value})}>
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
                <div className="w-1/2"><label className="text-xs font-bold uppercase text-gray-500">Total Qs</label><input type="number" min={1} max={20} className="w-full border-2 border-gray-100 focus:border-indigo-500 p-3 rounded-xl outline-none transition" value={aiForm.quantity} onChange={e=>setAiForm({...aiForm, quantity: parseInt(e.target.value)})} /></div>
              </div>
              <div><label className="text-xs font-bold uppercase text-gray-500">Question Format</label>
                <select className="w-full border-2 border-gray-100 focus:border-indigo-500 p-3 rounded-xl outline-none transition" value={aiForm.questionType} onChange={e=>setAiForm({...aiForm, questionType: e.target.value})}>
                  <option value="MCQ">Multiple Choice</option><option value="Short">Short Answer</option><option value="Descriptive">Descriptive</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                 <button onClick={()=>setShowAIModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
                 <button onClick={handleAIGenerate} disabled={isGenerating || !aiForm.topic} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center">
                    {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Generate Qs'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-lg font-black text-gray-800">Total: {questions.reduce((a,b)=>a+b.marks, 0)} marks</div>
            <div className="flex space-x-4">
               <button onClick={()=>saveExam('Draft')} className="bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-xl hover:bg-gray-200 flex items-center"><Save className="w-4 h-4 mr-2"/> Save Draft</button>
               <button onClick={()=>saveExam('Published')} disabled={questions.length===0} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"><Send className="w-4 h-4 mr-2"/> Publish Exam</button>
            </div>
         </div>
      </div>
    </div>
  );
}
