import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || 'demo-teacher-id';
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'Pending';

    const generations = await prisma.contentGeneration.findMany({
      where: { 
        teacherId: userId === 'demo-teacher-id' ? undefined : userId,
        status 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: generations });
  } catch (error: any) {
    console.error('Generations Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch contents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { title, subject, topic, generatedText, type, status } = body;

    let teacherId = (session?.user as any)?.id;
    if (!teacherId) {
      const fallbackTeacher = await prisma.user.findFirst({ where: { role: 'Teacher' } });
      teacherId = fallbackTeacher?.id || 'demo-teacher-id';
    }

    const generation = await prisma.contentGeneration.create({
      data: {
        teacherId,
        title,
        subject,
        topic,
        generatedText,
        type: type || 'notes',
        status: status || 'Pending'
      }
    });

    return NextResponse.json({ success: true, data: generation });
  } catch (error: any) {
    console.error('Generation Create Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
