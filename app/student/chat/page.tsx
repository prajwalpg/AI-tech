'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Send, User, Bot, Paperclip, ChevronRight, Mic, Cpu, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ChatSystemPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'agent', content: any, agentUsed?: string }[]>([
    { role: 'agent', content: "Hello! I am connected to the Orchestrator. What would you like to learn today? You can ask for explanation, practice quizzes, or code help.", agentUsed: "orchestrator" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, userId: "demo-student-id", context: {} })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: data.response, 
        agentUsed: data.agentUsed 
      }]);
    } catch (error) {
       setMessages(prev => [...prev, { role: 'agent', content: "Connection Error.", agentUsed: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: any, agentUsed?: string) => {
    if (agentUsed === 'code' && typeof content === 'object') {
       return (
         <div className="space-y-4 w-full text-sm">
           <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-md">
             <strong className="text-indigo-700">Explanation:</strong> {content.explanation}
           </div>
           {content.issues?.length > 0 && <div className="bg-red-50 border border-red-100 p-3 rounded-md">
             <strong className="text-red-700">Detected Issues:</strong> 
             <ul className="list-disc ml-5 mt-1 text-red-600">{content.issues.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
           </div>}
           <div className="bg-gray-900 border border-gray-800 p-3 rounded-md overflow-x-auto text-green-400">
             <strong className="text-gray-400 block mb-2">Optimized Code:</strong>
             <pre><code>{content.improvedCode}</code></pre>
           </div>
         </div>
       )
    }

    if (agentUsed === 'analytics' && typeof content === 'object') {
       return (
         <div className="space-y-3 w-full text-sm">
           <div className="flex justify-between items-center bg-gray-50 border p-3 rounded-md">
             <strong>Progress Score:</strong> <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">{content.progressScore}/100</span>
           </div>
           <div className="bg-blue-50 border p-3 rounded-md">
             <strong>Strengths:</strong> {content.strengths?.join(', ')}
           </div>
           <div className="bg-red-50 border p-3 rounded-md">
             <strong>Weaknesses:</strong> {content.weakTopics?.join(', ')}
           </div>
           <div className="bg-yellow-50 border p-3 rounded-md">
             <strong>Recommendations:</strong> <ul className="list-disc ml-5">{content.recommendations?.map((r: string, idx: number) => <li key={idx}>{r}</li>)}</ul>
           </div>
         </div>
       )
    }

    return <div className="whitespace-pre-wrap">{typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</div>;
  };

  const getAgentColor = (agent?: string) => {
     switch(agent) {
       case 'teacher': return 'bg-blue-600';
       case 'code': return 'bg-indigo-600';
       case 'quiz': return 'bg-purple-600';
       case 'analytics': return 'bg-orange-500';
       case 'orchestrator': return 'bg-gray-800';
       case 'retrieval': return 'bg-teal-600';
       default: return 'bg-green-600';
     }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-5xl mx-auto p-4 w-full flex flex-col h-[calc(100vh-64px)]">
        <Link href="/student/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-2 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-4 mt-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
             <Cpu className="w-8 h-8 mr-3 text-indigo-600" /> Multi-Agent Chat Interface
          </h1>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
          
          <div className="bg-gray-50 border-b px-6 py-3 flex items-center justify-between text-sm text-gray-500 font-medium">
            <span>Orchestrator Activity Monitor</span>
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>Memory Agent Active</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'agent' && (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3 mt-1 flex-shrink-0 shadow-sm ${getAgentColor(m.agentUsed)}`}>
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                
                <div className={`max-w-[80%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.role === 'agent' && (
                     <span className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider flex items-center">
                       {m.agentUsed} Agent Executed <ChevronRight className="w-3 h-3 ml-1" />
                     </span>
                  )}
                  
                  <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'}`}>
                    {renderContent(m.content, m.agentUsed)}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 ml-3 mt-1 flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3 mt-1 bg-gray-400 shadow-sm">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                 <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-tl-none font-medium text-gray-400 italic flex items-center">
                    Orchestrator routing query...
                 </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex space-x-2">
              <button className="p-3 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Message orchestrator (e.g., 'Grade my answer: Force=MA', 'My progress?', 'Debug my python loop')" 
                className="flex-1 border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button 
                 onClick={handleSend}
                 disabled={loading || !input.trim()}
                 className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition font-bold flex items-center disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center">
               <Cpu className="w-3 h-3 mr-1" /> Multi-Agent Engine v2.0 Live
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
