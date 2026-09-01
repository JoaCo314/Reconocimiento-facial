import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const take = Number(req.nextUrl.searchParams.get('take') ?? 50);

  const presentes = await prisma.presente.findMany({
    where: userId ? { userId } : undefined,
    select: {
      id: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(take, 200),
  });

  return NextResponse.json(presentes);
}
