import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId, violationType, description, severity, snapshotBase64 } = await req.json();
    const studentId = (session.user as any).id;

    await prisma.proctoringLog.create({
      data: {
        examId,
        studentId,
        violationType,
        description,
        severity,
        snapshotUrl: snapshotBase64 || null
      }
    });

    if (severity === 'high') {
       const highLogs = await prisma.proctoringLog.count({
          where: { examId, studentId, severity: 'high' }
       });
       if (highLogs % 3 === 0) {
          const exam = await prisma.exam.findUnique({ where: { id: examId } });
          if(exam) {
              await prisma.notification.create({
                 data: {
                    userId: exam.teacherId,
                    title: "Proctoring Alert",
                    message: `Student ${(session.user as any).name} has multiple high-severity violations in ${exam.title}`,
                    type: "alert"
                 }
              });
          }
       }
    }

    return NextResponse.json({ success: true, logged: true });
  } catch (err: any) {
    console.error("Proctoring log error", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
