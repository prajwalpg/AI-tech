import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentEmail, period, subject, status } = await req.json();
    const teacherId = (session.user as any).id;

    const student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const attendance = await prisma.attendance.create({
       data: {
          studentId: student.id,
          period,
          subject,
          status,
          markedByFace: false,
          teacherId
       }
    });

    return NextResponse.json({ success: true, message: "Manual attendance marked!", attendance });
  } catch (error: any) {
    console.error("Manual Marks Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
