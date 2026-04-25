import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTeacher } from '@/lib/auth-guards';

export async function GET(request: NextRequest) {
  try {
    const user = await requireTeacher(request).catch(() => null);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = user.id;
    
    // Fetch user's timetable
    const timetables = await prisma.timetable.findMany({
      where: { teacherId: userId }
    });
    
    return NextResponse.json({ success: true, timetables });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireTeacher(request).catch(() => null);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = user.id;
    
    const lessons = await prisma.lesson.findMany({
      where: { teacherId: userId }
    });
    
    await prisma.timetable.deleteMany({
      where: { teacherId: userId }
    });
    
    const newEntries = []
    let dayOffset = 0;
    
    for (const lesson of lessons) {
        const scheduleData = JSON.stringify({
            day: dayOffset % 5,
            hour: 8 + (Math.floor(dayOffset / 5) % 8)
        });
        
        const entry = await prisma.timetable.create({
            data: {
                teacherId: userId,
                subject: lesson.subject,
                scheduleData
            }
        });
        newEntries.push(entry);
        dayOffset++;
    }
    
    return NextResponse.json({ success: true, timetables: newEntries });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
