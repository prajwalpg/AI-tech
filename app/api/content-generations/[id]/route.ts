import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, generatedText } = await request.json();
    const updated = await prisma.contentGeneration.update({
      where: { id: params.id },
      data: { title, generatedText }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
      const generation = await prisma.contentGeneration.findUnique({
        where: { id: params.id },
      });
  
      if (!generation) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, data: generation });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }
