import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest, { params }: { params: { examId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.proctoringLog.findMany({
      where: { examId: params.examId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const studentsMap: any = {};
    for (const log of logs) {
       if (!studentsMap[log.studentId]) {
          studentsMap[log.studentId] = {
             studentId: log.studentId,
             studentName: log.student.name || log.student.email,
             violations: [],
             riskScore: 0
          };
       }
       studentsMap[log.studentId].violations.push(log);
       let add = 0;
       if (log.severity === 'high') add = 3;
       else if (log.severity === 'medium') add = 1;
       else add = 0.5;
       studentsMap[log.studentId].riskScore += add;
    }

    const data = Object.values(studentsMap).map((s: any) => ({
       ...s,
       riskScore: Math.min(s.riskScore, 100)
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
