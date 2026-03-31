'use client'

import { Navigation } from '@/components/navigation'
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef } from 'react'

export default function GenerateNewContentPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleGenerate = async () => {
    if (!subject || !topic) {
      setError('Please fill in Subject and Topic');
      return;
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Step 1: Upload the file
      let contentToSave = content;
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
           method: 'POST',
           body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
        
        // Step 2: Use the new extraction API to get text from the textbook
        if (!contentToSave) {
          const extractRes = await fetch('/api/extract-text', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ filepath: uploadData.filepath })
          });
          const extractData = await extractRes.json();
          if (extractData.success) {
            contentToSave = extractData.text;
          } else {
            contentToSave = `Manual entry for ${file.name}`;
          }
        }
      }

      const response = await fetch('/api/content-generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${subject}: ${topic} Notes`,
          subject,
          topic,
          generatedText: contentToSave || `This is generated content about ${topic}`,
          type: 'notes',
          status: 'Pending'
        })
      });

      if (response.ok) {
        setDone(true);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to generate content for review');
      }
    } catch (e: any) {
      setError(e.message || 'Network error updating system.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <Link href="/teacher/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Generate Content</h1>
          <p className="text-gray-500 mt-2 mb-8">Upload textbook chapters to update the Knowledge Base that powers the Student AI.</p>
          
          <div 
            onClick={handleFileClick}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer mb-6 relative"
          >
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               className="hidden" 
               accept=".pdf,.docx,.txt"
             />
             <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
             {file ? (
               <div className="text-indigo-600 font-bold">
                 <p>File Ready for Analysis:</p>
                 <p className="text-xl">{file.name}</p>
                 <p className="text-xs text-gray-400 mt-2">Click to change file</p>
               </div>
             ) : (
               <>
                 <p className="text-gray-700 font-semibold mb-1">Click to upload textbook PDF or Drag and Drop</p>
                 <p className="text-xs text-gray-500">Supports NCERT, State Board Syllabus (PDF, DOCX)</p>
               </>
             )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Science" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic Name</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Light Reflection" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content / Raw Text (Optional if uploading PDF)</label>
              <textarea 
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the educational content here..." 
                className="w-full border border-gray-300 rounded-lg px-4 py-2" 
              />
            </div>
          </div>

          {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}

          {done ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-green-700 flex items-center mb-6">
               <CheckCircle className="w-6 h-6 mr-3" /> 
               <div>
                  <h3 className="font-bold">Generation Complete!</h3>
                  <p className="text-sm">Content generated and sent for your review. Please approve it from the dashboard to make it visible to students.</p>
               </div>
            </div>
          ) : (
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {loading ? 'Content Agent is Analyzing...' : 'Generate Notes & Update Knowledge Base'}
            </button>
          )}

          {done && (
            <Link href="/teacher/dashboard" className="w-full block text-center border font-bold py-3 mt-4 rounded-xl hover:bg-gray-50 uppercase tracking-tight text-sm">
              Go to Dashboard to Approve
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}

