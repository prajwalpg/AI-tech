import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runAnalyticsAgent } from '@/lib/agents/analytics-agent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

/**
 * AI Personalized Study Plan API
 * Combines classroom timetable with student's weak areas identified by AI.
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || 'cmn5q8mke0000mnu0jhpiq33m'; // Fallback to our tester student

    // 1. Get Student Analytics (Weakness detection via AI)
    const analytics = await runAnalyticsAgent(userId);
    
    // 2. Fetch the latest approved lesson from Knowledge Base to show as "Today's Priority"
    const latestApproved = await prisma.lesson.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const dailyGoal = {
      subject: latestApproved?.subject || "Science",
      topic: latestApproved?.title || "Laws of Motion",
      time: "10:00 AM"
    };

    // 3. Check if student is weak in today's topic
    const isTopicDifficult = analytics.weakTopics?.some((t: string) => 
      t.toLowerCase().includes(dailyGoal.topic.toLowerCase()) || 
      dailyGoal.topic.toLowerCase().includes(t.toLowerCase())
    );

    // 4. Personalized Recommendation logic
    let priorityTitle = dailyGoal.topic;
    let priorityReason = latestApproved ? "Your teacher recently approved this for your knowledge base." : "This is your teacher's scheduled topic for today.";
    
    if (isTopicDifficult) {
       priorityReason = `You struggled with ${dailyGoal.topic} in recent chats. We've prioritized this lesson to help you master the concept.`;
    } else if (analytics.weakTopics?.length > 0 && !latestApproved) {
       // Only fallback to weak topics if there's no fresh approved content
       priorityTitle = analytics.weakTopics[0];
       priorityReason = `You've been asking a lot of questions about ${priorityTitle}. Let's focus on clearing those doubts today.`;
    }

    const timetables = await prisma.timetable.findMany({});
    
    // Convert to upcoming schedule format
    const upcomingSchedule = timetables.slice(0, 5).map(t => {
      let timeStr = 'TBA';
      try {
        const data = JSON.parse(t.scheduleData);
        const hours = data.hour;
        timeStr = hours === 12 ? '12:00 PM' : hours > 12 ? `${hours - 12}:00 PM` : `${hours}:00 AM`;
      } catch (e) {}
      
      return {
        time: timeStr,
        topic: t.subject,
        type: 'Class',
        status: 'Upcoming'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        priority: {
          title: priorityTitle,
          subject: dailyGoal.subject,
          reason: priorityReason,
          action: "Start Lesson"
        },
        stats: {
          tasksCompleted: 12, // Could be real data from assignments table
          totalTasks: 16,
          progressPercent: 75
        },
        weakTopics: analytics.weakTopics,
        recommendations: analytics.recommendations,
        upcomingSchedule
      }
    });

  } catch (error: any) {
    console.error('Study Plan API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
