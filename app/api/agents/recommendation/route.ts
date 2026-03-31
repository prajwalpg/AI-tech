import { NextResponse } from 'next/server';
import { runRecommendationAgent } from '@/lib/agents/recommendation';

export async function POST(req: Request) {
  try {
    const { history, currentTopic, score } = await req.json();
    const recommendation = await runRecommendationAgent(history, currentTopic, score);
    return NextResponse.json({ success: true, recommendation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
