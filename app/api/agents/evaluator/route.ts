import { NextResponse } from 'next/server';
import { runEvaluatorAgent } from '@/lib/agents/evaluator';

export async function POST(req: Request) {
  try {
    const { question, studentAnswer, expectedAnswer } = await req.json();
    const evaluation = await runEvaluatorAgent(question, studentAnswer, expectedAnswer);
    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
