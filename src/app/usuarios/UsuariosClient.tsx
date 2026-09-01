'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { presentes: number };
}

interface Presente {
  id: string;
  createdAt: string;
  user: { id: string; name: string };
}

export default function UsuariosClient({
  users,
  presentes,
}: {
  users: User[];
  presentes: Presente[];
}) {
  const [selPresentes, setSelPresentes] = useState<string | null>(null);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const filtered =
    selPresentes === null ? presentes : presentes.filter((p) => p.user.id === selPresentes);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>👥 Usuarios registrados</h2>
      <div className="card">
        {users.length === 0 ? (
          <p className="helper">Todavía no hay usuarios registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Registrado</th>
                <th>Presentes</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{fmt(u.createdAt)}</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '4px 12px', fontSize: '0.9rem' }}
                      onClick={() => setSelPresentes(selPresentes === u.id ? null : u.id)}
                    >
                      {u._count.presentes} {selPresentes === u.id ? '(ocultar)' : '(ver)'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 style={{ marginTop: 0 }}>🕒 Asistencias {selPresentes ? `de ${users.find((u) => u.id === selPresentes)?.name}` : '(últimas)'}</h2>
      <div className="card">
        {filtered.length === 0 ? (
          <p className="helper">Sin asistencias registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>
                    <span className="status-badge ok">✓</span> {p.user.name}
                  </td>
                  <td>{fmt(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
