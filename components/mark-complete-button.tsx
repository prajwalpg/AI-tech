'use client';

import { useState } from 'react';

export function MarkCompleteButton({ lessonId }: { lessonId: string }) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
      if (res.ok) {
        setCompleted(true);
        alert('Lesson marked as complete! 🎉');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return <button disabled className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold shadow flex items-center gap-2">Completed ✓</button>;
  }

  return (
    <button onClick={handleComplete} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
      {loading ? 'Saving...' : 'Mark as Complete'}
    </button>
  );
}
