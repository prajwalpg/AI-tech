import { NextResponse } from 'next/server';
import { runTeacherAgent } from '@/lib/agents/teacher';

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();
    const explanation = await runTeacherAgent(prompt, context);
    return NextResponse.json({ success: true, explanation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
