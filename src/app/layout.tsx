import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Reconocimiento Facial',
  description: 'Sistema de asistencia por reconocimiento facial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
