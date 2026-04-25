import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role === 'Teacher') {
      const exams = await prisma.exam.findMany({
        where: { teacherId: userId },
        include: {
           _count: { select: { questions: true, submissions: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: exams });
    } else {
      const exams = await prisma.exam.findMany({
        where: { status: { in: ['Published', 'Active'] } },
        select: { id: true, title: true, subject: true, duration: true, scheduledAt: true, status: true, totalMarks: true },
        orderBy: { scheduledAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: exams });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, subject, duration, scheduledAt, instructions, questions, status } = await req.json();
    const teacherId = (session.user as any).id;

    let totalMarks = 0;
    const mappedQuestions = questions.map((q: any) => {
       totalMarks += Number(q.marks || 1);
       return {
          questionText: q.questionText,
          type: q.type,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer || null,
          marks: Number(q.marks || 1),
          order: Number(q.order || 0)
       };
    });

    const exam = await prisma.exam.create({
      data: {
        teacherId,
        title,
        subject,
        duration: Number(duration),
        scheduledAt: new Date(scheduledAt),
        status: status || 'Draft',
        instructions,
        totalMarks,
        questions: {
          create: mappedQuestions
        }
      }
    });

    if (exam.status === 'Published') {
       const students = await prisma.user.findMany({ where: { role: 'Student' }, select: { id: true } });
       const notifs = students.map(s => ({
          userId: s.id,
          title: "New Exam Published!",
          message: `${exam.title} in ${exam.subject} is now available. Duration: ${exam.duration} mins`,
          type: "exam"
       }));
       if (notifs.length > 0) {
          await prisma.notification.createMany({ data: notifs });
       }
    }

    return NextResponse.json({ success: true, exam });
  } catch (err: any) {
    console.error("Exam create error", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
