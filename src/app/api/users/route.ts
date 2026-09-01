import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MIN_DESCRIPTOR_LENGTH = 100; // el descriptor de face-api.js tiene 128 valores

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { presentes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name ?? '').trim();
    const email = (body.email ?? '').trim().toLowerCase();
    const descriptor = body.descriptor;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nombre y email son obligatorios' }, { status: 400 });
    }
    if (!Array.isArray(descriptor) || descriptor.length < MIN_DESCRIPTOR_LENGTH) {
      return NextResponse.json(
        { error: 'No se detectó un rostro válido. Asegurate de mirar a la cámara.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        faceDescriptor: descriptor,
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
