import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import UsuariosClient from './UsuariosClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Usuarios · Reconocimiento Facial' };

export default async function UsuariosPage() {
  const [users, presentes] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { presentes: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.presente.findMany({
      select: {
        id: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));
  const serializedPresentes = presentes.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <p>
        <Link href="/">← Volver al inicio</Link>
      </p>
      <UsuariosClient users={serializedUsers} presentes={serializedPresentes} />
    </div>
  );
}
