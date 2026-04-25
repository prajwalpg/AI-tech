import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireTeacher } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

/**
 * Handle Knowledge Base operations
 * GET: Fetch all active topics
 * POST: Add new content to the knowledge base (after approval)
 */

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request).catch(() => null);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
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
    const user = await requireTeacher(request).catch(() => null);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, subject, topic, content, type } = await request.json();

    if (!title || !subject || !topic || !content) {
      return NextResponse.json({ error: 'Missing required curriculum data' }, { status: 400 });
    }

    const teacherId = user.id;

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
