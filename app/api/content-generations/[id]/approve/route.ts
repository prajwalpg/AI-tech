import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { action } = body; // 'Approve' or 'Reject'

    const generation = await prisma.contentGeneration.findUnique({
      where: { id: params.id },
    });

    if (!generation) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (action === 'Approve') {
      // 1. Update generation status
      await prisma.contentGeneration.update({
        where: { id: params.id },
        data: { status: 'Approved' }
      });

      // 2. Create KnowledgeBase entry (for RAG)
      await prisma.knowledgeBase.create({
        data: {
          teacherId: generation.teacherId,
          title: generation.title,
          subject: generation.subject,
          topic: generation.topic,
          content: generation.generatedText,
          type: generation.type,
        }
      });

      // 3. Create Lesson entry (for Dashboard)
      await prisma.lesson.create({
        data: {
          title: generation.title,
          subject: generation.subject,
          description: `Comprehensive notes on ${generation.topic} generated and approved.`,
          content: generation.generatedText,
          teacherId: generation.teacherId,
        }
      });

      return NextResponse.json({ success: true, message: 'Content approved and published' });
    } else {
      await prisma.contentGeneration.update({
        where: { id: params.id },
        data: { status: 'Rejected' }
      });
      return NextResponse.json({ success: true, message: 'Content rejected' });
    }
  } catch (error: any) {
    console.error('Approval Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
