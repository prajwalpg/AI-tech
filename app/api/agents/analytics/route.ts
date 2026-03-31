import { NextResponse } from 'next/server';
import { runAnalyticsAgent } from '@/lib/agents/analytics-agent';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const result = await runAnalyticsAgent(userId);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
