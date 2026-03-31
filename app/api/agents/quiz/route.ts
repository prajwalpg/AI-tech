import { NextResponse } from 'next/server';
import { runQuizAgent } from '@/lib/agents/quiz';

export async function POST(req: Request) {
  try {
    const { topic, difficulty } = await req.json();
    const quiz = await runQuizAgent(topic, difficulty);
    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
