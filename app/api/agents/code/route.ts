import { NextResponse } from 'next/server';
import { runCodeAgent } from '@/lib/agents/code-agent';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runCodeAgent(body);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
