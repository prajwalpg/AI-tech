import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTeacher } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireTeacher(request).catch((err) => {
      console.error("requireTeacher Error:", err);
      return null;
    });
    if (!user) return NextResponse.json({ error: 'Session Expired! Please Sign Out AND Sign Back In to renew your credentials.' }, { status: 401 });
    const userId = user.id;
    
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
    const user = await requireTeacher(request).catch((err) => {
      console.error("requireTeacher Error in POST:", err);
      return null;
    });
    if (!user) return NextResponse.json({ error: 'Session Expired! Please click Back to Dashboard, Sign Out, and Sign In again.' }, { status: 401 });
    const teacherId = user.id;

    const body = await request.json();
    const { title, subject, topic, generatedText, type, status } = body;

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
