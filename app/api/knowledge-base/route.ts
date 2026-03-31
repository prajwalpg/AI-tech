import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Handle Knowledge Base operations
 * GET: Fetch all active topics
 * POST: Add new content to the knowledge base (after approval)
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Allow demo user to see the Knowledge Base too
    // In a real production app, this would be restricted.
    
    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');

    const kbEntries = await prisma.knowledgeBase.findMany({
      where: subject ? { subject } : {},
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: kbEntries });
  } catch (error: any) {
    console.error('KB Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch knowledge base' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // For demo purposes, we allow the "Demo User" (which navigates via URL inferred roles)
    // to update the knowledge base even if not strictly logged in via auth.
    const isTeacher = (session?.user as any)?.role === 'Teacher' || !session?.user;
    
    if (!isTeacher) {
      return NextResponse.json({ error: 'Teacher access required' }, { status: 401 });
    }

    const { title, subject, topic, content, type } = await request.json();

    if (!title || !subject || !topic || !content) {
      return NextResponse.json({ error: 'Missing required curriculum data' }, { status: 400 });
    }

    let teacherId = (session?.user as any)?.id;
    
    if (!teacherId) {
      // Fallback for demo: find any teacher in the database
      const fallbackTeacher = await prisma.user.findFirst({ where: { role: 'Teacher' } });
      teacherId = fallbackTeacher?.id;
      
      if (!teacherId) {
        throw new Error("No teacher user found in database to associate with this content.");
      }
    }

    const entry = await prisma.knowledgeBase.create({
      data: {
        teacherId,
        title,
        subject,
        topic,
        content,
        type: type || 'notes'
      }
    });

    return NextResponse.json({ success: true, data: entry, message: 'Knowledge Base updated' });
  } catch (error: any) {
    console.error('KB Create Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
