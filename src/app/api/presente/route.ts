import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findBestMatch } from '@/lib/match';

// Umbral de distancia para considerar un rostro como "el mismo". Menor = más estricto.
const MATCH_THRESHOLD = 0.55;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const descriptor = body.descriptor;

    if (!Array.isArray(descriptor) || descriptor.length < 100) {
      return NextResponse.json(
        { error: 'No se detectó un rostro válido. Asegurate de mirar a la cámara.' },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, faceDescriptor: true },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No hay usuarios registrados todavía.' },
        { status: 404 }
      );
    }

    const knownDescriptors = users.map((u) => u.faceDescriptor as number[]);
    const match = findBestMatch(descriptor, knownDescriptors, MATCH_THRESHOLD);

    if (!match) {
      return NextResponse.json(
        { error: 'Tu rostro no fue reconocido. Probá de nuevo con mejor iluminación.' },
        { status: 404 }
      );
    }

    const matched = users[match.index];

    // Verificar que no haya dado presente recién (evita doble presente en 2 min)
    const recent = await prisma.presente.findFirst({
      where: { userId: matched.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    if (recent && recent.createdAt.getTime() > twoMinutesAgo) {
      return NextResponse.json(
        { error: `${matched.name} ya registró presente hace menos de 2 minutos.` },
        { status: 409 }
      );
    }

    await prisma.presente.create({
      data: { userId: matched.id },
    });

    return NextResponse.json({
      user: matched.name,
      distance: Number(match.distance.toFixed(4)),
      message: `¡Presente registrado para ${matched.name}!`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
