import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const subject = searchParams.get('subject')
    const teacherId = searchParams.get('teacherId')

    const where: any = {}
    if (subject) where.subject = subject
    if (teacherId) where.teacherId = teacherId

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ lessons })
  } catch (error: any) {
    console.error('Get lessons error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'Teacher') {
      return NextResponse.json(
        { error: 'Only teachers can create lessons' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, subject, description, content } = body

    if (!title || !subject || !description || !content) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const userId = (session.user as any)?.id

    const lesson = await prisma.lesson.create({
      data: {
        title,
        subject,
        description,
        content,
        teacherId: userId
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

    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error: any) {
    console.error('Create lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
