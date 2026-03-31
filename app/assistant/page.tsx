'use client';

import React, { useState } from 'react';

// Example Frontend Integration for AI Agent Orchestration
export default function AssistantPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // We maintain this state for the sake of recommendation agent tracking
  const [currentTopic, setCurrentTopic] = useState('General Education');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Send history and current input to Controller
      const response = await fetch('/api/agents/controller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          currentTopic,
          query: input, // Send the user's latest query
          prompt: input, // and as prompt for the teacher
        }),
      });

      const data = await response.json();

      if (data.success) {
        let aiResponse = '';
        if (typeof data.result?.content === 'string') {
          aiResponse = data.result.content;
        } else if (data.result?.content) {
          aiResponse = JSON.stringify(data.result.content, null, 2);
        }

        if (data.result?.recommendation) {
          aiResponse += '\n\n**Recommendation:**\n' + JSON.stringify(data.result.recommendation, null, 2);
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Ops! AI Controller Error: ' + data.error }]);
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network or Server Error: ' + e.message }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-gray-50 border shadow-sm">
      <div className="pb-4 border-b mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">multi-Agent AI Educational Assistant</h1>
        <div className="text-sm text-gray-500">
          Current Topic: <input className="border p-1 rounded" value={currentTopic} onChange={e => setCurrentTopic(e.target.value)} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center mt-10">
            Send a query! The Agent Controller will automatically route it to: <br/>
            Teacher • Quiz • Evaluator • Recommendation • Retrieval
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`p-4 rounded-lg shadow-sm ${m.role === 'user' ? 'bg-blue-100 self-end ml-12' : 'bg-white self-start mr-12'}`}>
            <strong className="block mb-1 capitalize text-gray-600 font-semibold">{m.role}</strong>
            <pre className="whitespace-pre-wrap font-sans text-gray-800">{m.content}</pre>
          </div>
        ))}

        {loading && <div className="text-gray-400 p-4">Agent Controller is thinking...</div>}
      </div>

      <div className="flex space-x-2">
        <input
          className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e: any) => setInput(e.target.value)}
          onKeyDown={(e: any) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me to explain gravity, generate a quiz, or evaluate an answer..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
