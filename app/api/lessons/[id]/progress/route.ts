import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request).catch(() => null);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const studentId = user.id;
    const body = await request.json();
    const { status, score } = body;

    const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const existingProgress = await prisma.progress.findFirst({
      where: { studentId, lessonId: params.id }
    });

    let updatedRecord;
    if (existingProgress) {
      updatedRecord = await prisma.progress.update({
        where: { id: existingProgress.id },
        data: { status, score }
      });
    } else {
      updatedRecord = await prisma.progress.create({
        data: {
          studentId,
          lessonId: params.id,
          subject: lesson.subject,
          status,
          score
        }
      });
    }

    return NextResponse.json({ success: true, progress: updatedRecord });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
