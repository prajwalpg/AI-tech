'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, BookOpen, Sparkles, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  lessons: any[]
  preselectedLessonId: string | null
}

export function ChatInterface({ lessons, preselectedLessonId }: ChatInterfaceProps) {
  const [selectedLesson, setSelectedLesson] = useState(preselectedLessonId ?? '')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input?.trim() || !selectedLesson) {
      return
    }

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          lessonId: selectedLesson
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response?.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (!reader) {
        throw new Error('No reader available')
      }

      // Add empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      let partialRead = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            }
            try {
              const parsed = JSON.parse(data)
              const content = parsed?.choices?.[0]?.delta?.content ?? ''
              if (content) {
                assistantMessage += content
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantMessage
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setLoading(false)
    } catch (error: any) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ])
      setLoading(false)
    }
  }

  const selectedLessonData = lessons?.find((l: any) => l?.id === selectedLesson)

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Lesson Selector */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6">
        <label htmlFor="lesson-select" className="block text-white font-semibold mb-3">
          Select a lesson to discuss:
        </label>
        <div className="flex items-center space-x-3">
          <BookOpen className="h-5 w-5 text-white" />
          <select
            id="lesson-select"
            value={selectedLesson}
            onChange={(e) => {
              setSelectedLesson(e?.target?.value ?? '')
              setMessages([])
            }}
            className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white text-gray-900"
          >
            <option value="">Choose a lesson...</option>
            {lessons?.map((lesson: any) => (
              <option key={lesson?.id} value={lesson?.id}>
                {lesson?.subject} - {lesson?.title}
              </option>
            ))}
          </select>
        </div>
        
        {selectedLessonData && (
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <p className="text-white text-sm">
              <strong>Teacher:</strong> {selectedLessonData?.teacher?.name ?? 'Unknown'}
            </p>
            <p className="text-white text-sm mt-1">
              {selectedLessonData?.description}
            </p>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto p-6 space-y-4">
        {!selectedLesson ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a lesson to start chatting
            </h3>
            <p className="text-gray-600">
              Choose a lesson above to ask questions and get personalized help
            </p>
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Sparkles className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to help you learn!
            </h3>
            <p className="text-gray-600">
              Ask me any question about the lesson content
            </p>
          </div>
        ) : (
          <>
            {messages?.map((message: Message, index: number) => (
              <div
                key={index}
                className={`flex ${message?.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-3 ${
                    message?.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message?.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-6 py-3">
                  <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e?.target?.value ?? '')}
            placeholder={selectedLesson ? 'Ask a question about the lesson...' : 'Select a lesson first...'}
            disabled={!selectedLesson || loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!selectedLesson || !input?.trim() || loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="h-5 w-5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
