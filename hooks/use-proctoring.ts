'use client'

import { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';

export function useProctoring({ examId, enabled }: { examId: string, enabled: boolean }) {
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolation, setLastViolation] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const lastLogTime = useRef<Record<string, number>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const logViolation = async (violationType: string, severity: string, description: string, snapshotBase64?: string) => {
    const now = Date.now();
    if (lastLogTime.current[violationType] && (now - lastLogTime.current[violationType] < 10000)) return;
    lastLogTime.current[violationType] = now;

    setViolationCount(prev => prev + 1);
    setLastViolation({ violationType, description, timestamp: new Date() });
    setWarningMessage(description);
    setTimeout(() => setWarningMessage(''), 5000);

    try {
      await fetch('/api/proctoring/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, violationType, severity, description, snapshotBase64 })
      });
    } catch(e) {}
  };

  useEffect(() => {
    if (!enabled) return;

    setIsMonitoring(true);

    const handleVisibility = () => {
      if (document.hidden) {
        logViolation('tab_switch', 'high', 'Student switched to another tab/window');
      }
    };

    const handleBlur = () => {
      logViolation('tab_switch', 'high', 'Student clicked outside the exam window');
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        logViolation('fullscreen_exit', 'medium', 'Student exited fullscreen mode');
        try { document.documentElement.requestFullscreen(); } catch(e) {}
      }
    };

    const blockCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation('copy_attempt', 'low', 'Copy/paste operations are disabled');
    };

    const blockRightClick = (e: MouseEvent) => {
      e.preventDefault();
      logViolation('right_click', 'low', 'Right clicking is disabled');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && ['c','v','a','t','w'].includes(e.key.toLowerCase())) || e.key === 'F12' || (e.altKey && e.key === 'Tab')) {
         e.preventDefault();
         logViolation('keyboard_shortcut', 'low', 'Prohibited keyboard shortcut used');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreen);
    document.addEventListener('copy', blockCopyPaste);
    document.addEventListener('paste', blockCopyPaste);
    document.addEventListener('cut', blockCopyPaste);
    document.addEventListener('contextmenu', blockRightClick);
    document.addEventListener('keydown', handleKeyDown);

    let interval: any;
    const startFaceAPI = async () => {
      try {
        const url = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(url);
        
        const video = document.createElement('video');
        video.muted = true;
        video.autoplay = true;
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        videoRef.current = video;

        interval = setInterval(async () => {
           if (video.readyState === 4) {
             const detections = await faceapi.detectAllFaces(video);
             if (detections.length === 0) {
                logViolation('no_face', 'high', 'No face detected in camera view');
             } else if (detections.length > 1) {
                logViolation('multiple_faces', 'high', 'Multiple faces detected');
             }
           }
        }, 5000);
      } catch(e) {}
    };
    startFaceAPI();

    return () => {
       document.removeEventListener('visibilitychange', handleVisibility);
       window.removeEventListener('blur', handleBlur);
       document.removeEventListener('fullscreenchange', handleFullscreen);
       document.removeEventListener('copy', blockCopyPaste);
       document.removeEventListener('paste', blockCopyPaste);
       document.removeEventListener('cut', blockCopyPaste);
       document.removeEventListener('contextmenu', blockRightClick);
       document.removeEventListener('keydown', handleKeyDown);
       clearInterval(interval);
       if (videoRef.current?.srcObject) {
         (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
       }
       setIsMonitoring(false);
    };
  }, [enabled, examId]);

  return { violationCount, lastViolation, isMonitoring, warningMessage };
}
