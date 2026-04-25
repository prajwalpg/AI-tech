'use client'

import React, { useEffect, useState } from 'react';
import { Bell, X, FileText } from 'lucide-react';
import Link from 'next/link';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notifications').then(res => res.json()).then(data => {
      if (data.success && data.data) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: any) => !n.read).length);
      }
    }).catch(e => {});

    const eventSource = new EventSource('/api/notifications/stream');
    eventSource.onmessage = (event) => {
      const newNotif = JSON.parse(event.data);
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      setToasts(prev => [...prev, newNotif]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newNotif.id));
      }, 8000);
      
      if (newNotif.type === 'exam') {
        const dot = document.getElementById('exam-live-dot');
        if (dot) dot.classList.remove('hidden');
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const markAsRead = async (id: string) => {
    if (id === 'all') {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id: 'all' }) });
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
    } else {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id }) });
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-500 hover:text-indigo-600 transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-3 border-b flex justify-between items-center bg-gray-50">
            <span className="font-bold text-gray-700">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead('all')} 
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No notifications</div>
            ) : (
              notifications.map((n, i) => (
                <div 
                  key={i} 
                  onClick={() => { if (!n.read) markAsRead(n.id); }}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition ${!n.read ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 text-indigo-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{n.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Toasts */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto transform transition-all duration-500 translate-x-0">
            <div className="p-4 flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mr-3">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 leading-tight">{toast.title}</h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{toast.message}</p>
                {toast.type === 'exam' && (
                  <Link 
                    href="/student/exams" 
                    onClick={() => removeToast(toast.id)}
                    className="mt-3 inline-block bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 w-full text-center"
                  >
                    Take Exam Now
                  </Link>
                )}
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-1 bg-gray-100">
              <div className="h-full bg-indigo-500 animate-[shrink_8s_linear_forwards]"></div>
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html:`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}} />
    </div>
  );
}
