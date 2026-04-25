import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentId = (session.user as any).id;

    const existing = await prisma.examSubmission.findUnique({
      where: { examId_studentId: { examId: params.id, studentId } }
    });
    if (existing) {
      return NextResponse.json({ success: false, error: "Already submitted." }, { status: 409 });
    }

    const { answers } = await req.json();

    const questions = await prisma.question.findMany({ where: { examId: params.id } });
    const exam = await prisma.exam.findUnique({ where: { id: params.id } });

    let score = 0;
    questions.forEach(q => {
       const studentAnswer = answers[q.id];
       if (q.type === 'MCQ' && q.correctAnswer && studentAnswer === q.correctAnswer) {
          score += q.marks;
       }
    });

    const submission = await prisma.examSubmission.create({
      data: {
        examId: params.id,
        studentId,
        answers: JSON.stringify(answers),
        score,
        status: "Submitted",
        submittedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, score, totalMarks: exam?.totalMarks, message: "Exam submitted successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
