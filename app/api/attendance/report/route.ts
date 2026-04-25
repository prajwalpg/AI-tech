import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "Teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const subject = searchParams.get('subject');

    const whereClause: any = {};
    if (dateStr) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      const d2 = new Date(dateStr);
      d2.setHours(23, 59, 59, 999);
      whereClause.date = { gte: d, lte: d2 };
    }
    if (subject && subject !== 'All') {
      whereClause.subject = subject;
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalPresent = records.filter(r => r.status === 'Present').length;
    const totalAbsent = records.filter(r => r.status === 'Absent').length;
    const attendanceRate = records.length > 0 ? (totalPresent / records.length) * 100 : 0;

    return NextResponse.json({ success: true, data: { records, totalPresent, totalAbsent, attendanceRate } });
  } catch (error: any) {
    console.error("Report Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
