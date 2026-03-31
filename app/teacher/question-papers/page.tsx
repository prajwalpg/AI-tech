'use client'

import { Navigation } from '@/components/navigation'
import { FileText, Sparkles, Download, Upload, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function QuestionPapersPage() {
  const [generating, setGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [type, setType] = useState('MCQ')
  const [quantity, setQuantity] = useState(5)

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedData(null)
    
    let uploadedFilePath = null;

    try {
      // 1. Upload Agent Call
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
           uploadedFilePath = uploadData.filepath;
        }
      }

      // 2. Question Generator API Call
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          questionType: type,
          quantity,
          filepath: uploadedFilePath
        })
      });

      const genData = await genRes.json();
      if (genData.success && genData.data) {
         setGeneratedData(genData.data);
      } else {
         console.error("Gen Error:", genData.error);
         alert("Generator Error: " + genData.error);
      }
    } catch (err) {
       console.error(err);
       alert("Network connection failed.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         <Link href="/teacher/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Question Papers</h1>
            <p className="text-gray-600 mt-2">Auto-generate exams driven fully by Gemini AI parsing your uploaded content.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content - Generated Papers */}
          <div className="lg:col-span-2 space-y-6">
            
            {generatedData && generatedData.questions && (
              <div className="bg-white rounded-xl shadow-lg border border-indigo-200 p-8 mb-6 border-t-4 border-t-indigo-600 transition-all duration-500 ease-in-out">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <CheckCircle className="text-green-600 w-6 h-6 mr-2" /> Question Paper Ready!
                  </h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow shadow-green-200 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </button>
                </div>
                
                <div className="space-y-6">
                   {generatedData.questions.map((q: any, index: number) => (
                     <div key={index} className="p-4 bg-gray-50 border rounded-xl">
                        <div className="flex justify-between">
                          <p className="font-bold text-gray-800">{index + 1}. {q.questionText}</p>
                          <span className="text-sm font-semibold text-gray-500 bg-white px-2 py-1 border rounded">{q.marks} Marks</span>
                        </div>
                        {q.options && q.options.length > 0 && (
                          <div className="ml-4 mt-3 space-y-2 text-gray-700 font-medium">
                            {q.options.map((opt: string, optIndex: number) => (
                               <p key={optIndex} className={q.correctAnswer === opt || q.correctAnswer === String.fromCharCode(65 + optIndex) ? "font-bold text-green-700 flex items-center" : ""}>
                                  {String.fromCharCode(65 + optIndex)}) {opt}
                                  {(q.correctAnswer === opt || q.correctAnswer === String.fromCharCode(65 + optIndex)) && <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 rounded-full hidden sm:inline-flex">Correct Answer</span>}
                               </p>
                            ))}
                          </div>
                        )}
                        {!q.options && q.correctAnswer && (
                           <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 italic text-gray-700 text-sm">
                             <strong className="not-italic text-blue-900">Expected Master Answer: </strong> {q.correctAnswer}
                           </div>
                        )}
                     </div>
                   ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">History Log</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: 'Algebra Midterm Form A', subject: 'Mathematics', questions: 25, marks: 50, diff: 'Medium', date: 'Oct 15' },
                ].map((paper, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 group opacity-50">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{paper.title}</h3>
                        <div className="flex text-sm text-gray-500 mt-1">
                          <span>{paper.subject} • {paper.questions} Qs / {paper.marks} Marks • Archived</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Generation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-indigo-100 p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">AI Quick Generator</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Textbook Reference Mode</label>
                  <label className="border-2 border-dashed border-indigo-300 bg-indigo-50/50 rounded-lg p-6 text-center hover:bg-indigo-50 cursor-pointer flex flex-col items-center group transition">
                    <input type="file" onChange={handleFileChange} accept=".txt,.pdf,.docx" className="hidden" />
                    <Upload className="w-8 h-8 text-indigo-400 mb-2 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-sm font-semibold text-indigo-700">{file ? file.name : 'Click to Upload Chapter Source (.txt/.pdf)'}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject / Topic Focus</label>
                  <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. History: French Revolution" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="w-full border border-gray-300 text-sm font-medium rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                    <select value={type} onChange={e=>setType(e.target.value)} className="w-full border border-gray-300 text-sm font-medium rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                       <option>MCQ</option>
                       <option>Short Answers</option>
                       <option>Long Descriptive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input type="number" min="1" max="50" value={quantity} onChange={e=>setQuantity(parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white" />
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={generating || !topic.trim()}
                  className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 outline-none shadow-lg transition-all mt-4 flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {generating ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Generate Smart Exam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
