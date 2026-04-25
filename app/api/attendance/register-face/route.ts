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

    const { descriptor } = await req.json();
    if (!descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json({ error: "Invalid descriptor" }, { status: 400 });
    }

    const studentId = (session.user as any).id;

    await prisma.faceProfile.upsert({
      where: { studentId },
      update: { descriptor: JSON.stringify(descriptor) },
      create: { studentId, descriptor: JSON.stringify(descriptor) },
    });

    return NextResponse.json({ success: true, message: "Face registered successfully" });
  } catch (error: any) {
    console.error("Face Register Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
