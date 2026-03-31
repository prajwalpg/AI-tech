import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ lesson })
  } catch (error: any) {
    console.error('Get lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userId = (session.user as any)?.id

    if (userRole !== 'Teacher') {
      return NextResponse.json(
        { error: 'Only teachers can update lessons' },
        { status: 403 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    if (lesson.teacherId !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own lessons' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, subject, description, content } = body

    const updatedLesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        title: title ?? lesson.title,
        subject: subject ?? lesson.subject,
        description: description ?? lesson.description,
        content: content ?? lesson.content
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ lesson: updatedLesson })
  } catch (error: any) {
    console.error('Update lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userId = (session.user as any)?.id

    if (userRole !== 'Teacher') {
      return NextResponse.json(
        { error: 'Only teachers can delete lessons' },
        { status: 403 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    if (lesson.teacherId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own lessons' },
        { status: 403 }
      )
    }

    await prisma.lesson.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
