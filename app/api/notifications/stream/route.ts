import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = (session.user as any).id;
  let lastCheckTime = new Date();

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
         const initials = await prisma.notification.findMany({
            where: { userId, read: false },
            orderBy: { createdAt: 'asc' }
         });
         for (const n of initials) {
             controller.enqueue(encoder.encode(`data: ${JSON.stringify(n)}\n\n`));
         }
         if (initials.length > 0) {
            await prisma.notification.updateMany({
                where: { id: { in: initials.map(x => x.id) } },
                data: { read: true }
            });
         }
      } catch(e) {}

      const interval = setInterval(async () => {
        try {
          const newNotifs = await prisma.notification.findMany({
            where: { userId, read: false, createdAt: { gt: lastCheckTime } },
            orderBy: { createdAt: 'asc' }
          });

          if (newNotifs.length > 0) {
            for (const n of newNotifs) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(n)}\n\n`));
            }
            lastCheckTime = new Date();
            
            await prisma.notification.updateMany({
               where: { id: { in: newNotifs.map(x => x.id) } },
               data: { read: true }
            });
          }
        } catch (err) {
        }
      }, 5000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
