import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any).role;

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { order: 'asc' } } }
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    if (role === 'Student') {
      const sanitizedQuestions = exam.questions.map(q => {
         const { correctAnswer, ...rest } = q;
         return rest;
      });
      return NextResponse.json({ success: true, exam: { ...exam, questions: sanitizedQuestions } });
    }

    return NextResponse.json({ success: true, exam });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();
    const existing = await prisma.exam.findUnique({ where: { id: params.id } });
    
    if (!existing) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const exam = await prisma.exam.update({
      where: { id: params.id },
      data: updates
    });

    if (existing.status !== 'Published' && updates.status === 'Published') {
       const students = await prisma.user.findMany({ where: { role: 'Student' }, select: { id: true } });
       const notifs = students.map(s => ({
          userId: s.id,
          title: "New Exam Published!",
          message: `${exam.title} in ${exam.subject} is now available. Duration: ${exam.duration} mins`,
          type: "exam"
       }));
       if(notifs.length > 0) {
          await prisma.notification.createMany({ data: notifs });
       }
    }

    return NextResponse.json({ success: true, exam });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.exam.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
