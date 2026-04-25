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

    const { descriptor, period, subject } = await req.json();
    const studentId = (session.user as any).id;

    const profile = await prisma.faceProfile.findUnique({ where: { studentId } });
    if (!profile) {
      return NextResponse.json({ success: false, error: "Face not registered. Please register first." }, { status: 404 });
    }

    const storedDescriptor = JSON.parse(profile.descriptor);
    
    if (descriptor.length !== storedDescriptor.length) {
       return NextResponse.json({ success: false, error: "Descriptor mismatch" }, { status: 400 });
    }

    let sum = 0;
    for (let i = 0; i < descriptor.length; i++) {
       sum += Math.pow(descriptor[i] - storedDescriptor[i], 2);
    }
    const distance = Math.sqrt(sum);

    if (distance >= 0.5) {
       return NextResponse.json({ success: false, error: "Face not recognized. Please try again or contact teacher." }, { status: 400 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
       where: {
          studentId,
          period,
          date: { gte: startOfDay, lte: endOfDay }
       }
    });

    if (existing) {
       return NextResponse.json({ success: false, error: "Attendance already marked for this period." }, { status: 400 });
    }

    const attendance = await prisma.attendance.create({
       data: {
          studentId,
          period,
          subject,
          status: "Present",
          markedByFace: true
       }
    });

    return NextResponse.json({ success: true, message: "Attendance marked!", attendance });
  } catch (error: any) {
    console.error("Mark Attendance Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
