'use client'

import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { Navigation } from '@/components/navigation';
import { Camera, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function StudentAttendancePage() {
  const [activeTab, setActiveTab] = useState<'register' | 'mark'>('register');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Loading AI Models...' });
  const [period, setPeriod] = useState('Period 1');
  const [subject, setSubject] = useState('Maths');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)
        ]);
        setModelsLoaded(true);
        setStatus({ type: 'info', message: 'Models loaded. Please grant camera access.' });
        startVideo();
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to load face-api models.' });
      }
    };
    loadModels();

    return () => {
        if(videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    }
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus({ type: 'info', message: 'Ready. Position your face in the circle.' });
      })
      .catch((err) => {
        setStatus({ type: 'error', message: 'Camera permission denied or not found.' });
      });
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !modelsLoaded) return null;
    setStatus({ type: 'info', message: 'Analyzing face...' });
    const detections = await faceapi.detectAllFaces(videoRef.current).withFaceLandmarks().withFaceDescriptors();
    
    if (detections.length === 0) {
      setStatus({ type: 'error', message: 'No face detected. Please ensure good lighting.' });
      return null;
    }
    if (detections.length > 1) {
      setStatus({ type: 'error', message: 'Multiple faces detected. Only one face allowed.' });
      return null;
    }
    return detections[0].descriptor;
  };

  const handleRegister = async () => {
    const descriptor = await captureAndDetect();
    if (!descriptor) return;

    try {
      const res = await fetch('/api/attendance/register-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: Array.from(descriptor) })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: 'Face registered! You can now mark attendance.' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to register face.' });
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: 'Network error.' });
    }
  };

  const handleMark = async () => {
    const descriptor = await captureAndDetect();
    if (!descriptor) return;

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: Array.from(descriptor), period, subject })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: `✅ Attendance Marked! Present for ${period} - ${subject}` });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to mark attendance.' });
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: 'Network error.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Attendance System</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button 
              className={`flex-1 py-4 font-bold text-sm tracking-wide uppercase transition-colors ${activeTab === 'register' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('register')}
            >
              1. Register Face
            </button>
            <button 
              className={`flex-1 py-4 font-bold text-sm tracking-wide uppercase transition-colors ${activeTab === 'mark' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('mark')}
            >
              2. Mark Attendance
            </button>
          </div>

          <div className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-full md:w-1/2 max-w-sm flex flex-col items-center">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-100 shadow-inner bg-gray-100">
                {!modelsLoaded ? (
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : null}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Live Camera Feed</p>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center">
              {activeTab === 'mark' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
                      {['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
                      {['Maths', 'Science', 'English', 'History', 'Geography'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {status.message && (
                <div className={`p-4 rounded-xl mb-6 flex items-start space-x-3 text-sm font-medium ${
                  status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                  status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                  'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  {status.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                  {status.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
                  {status.type === 'info' && <Camera className="w-5 h-5 shrink-0" />}
                  <span>{status.message}</span>
                </div>
              )}

              {activeTab === 'register' ? (
                <button 
                  onClick={handleRegister}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-indigo-700 transition flex justify-center items-center"
                >
                  <Camera className="w-5 h-5 mr-2" /> Capture & Register Face
                </button>
              ) : (
                <button 
                  onClick={handleMark}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-700 transition flex justify-center items-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" /> Mark My Attendance
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
