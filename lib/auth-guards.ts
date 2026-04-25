import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';

export async function requireAuth(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

export async function requireTeacher(req: Request) {
  const user = await requireAuth(req);

  if (user.role?.toLowerCase() !== 'teacher') {
    throw new Error('Teacher role required. Found role: ' + user.role);
  }

  return user;
}

export async function requireStudent(req: Request) {
  const user = await requireAuth(req);

  // Teachers might need to view student interfaces
  if (user.role !== 'Student' && user.role !== 'Teacher') {
    throw new Error('Forbidden');
  }

  return user;
}
