'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { detectFaceFromVideo, findBestMatch, loadModels, stopStream } from '@/lib/face';

type Tab = 'presente' | 'registro';

export default function HomeUI() {
  const [tab, setTab] = useState<Tab>('presente');
  const [tip, setTip] = useState('Iniciando cámara…');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camReady, setCamReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // formulario de registro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const startCamera = useCallback(async () => {
    stopStream(streamRef.current);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 360 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCamReady(true);
      }
    } catch {
      setTip('No se pudo acceder a la cámara. Verificá los permisos.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    // pre-cargar modelos en segundo plano
    loadModels().catch(() => {});
    return () => stopStream(streamRef.current);
  }, [startCamera]);

  const captureDescriptor = async () => {
    const video = videoRef.current;
    if (!video) throw new Error('Cámara no disponible');
    const desc = await detectFaceFromVideo(video);
    if (!desc) throw new Error('No se detectó ningún rostro. Ajustá la posición e iluminación.');
    return desc;
  };

  const handlePresente = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const descriptor = await captureDescriptor();
      const res = await fetch('/api/presente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'No se pudo registrar el presente');
      setStatus({ type: 'success', text: data.message });
    } catch (e: any) {
      setStatus({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const handleRegistro = async () => {
    if (!name || !email) {
      setStatus({ type: 'error', text: 'Ingresá nombre y email.' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const descriptor = await captureDescriptor();
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, descriptor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'No se pudo registrar el usuario');
      setStatus({ type: 'success', text: `Usuario ${data.name} registrado correctamente.` });
      setName('');
      setEmail('');
    } catch (e: any) {
      setStatus({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="tabs">
        <button className={tab === 'presente' ? 'active' : ''} onClick={() => setTab('presente')}>
          ✅ Dar Presente
        </button>
        <button className={tab === 'registro' ? 'active' : ''} onClick={() => setTab('registro')}>
          👤 Registrar Usuario
        </button>
        <a href="/usuarios">
          <button>👥 Ver Usuarios</button>
        </a>
      </div>

      <div className="card">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', maxWidth: 480, borderRadius: 8, background: '#000', display: 'block', margin: '0 auto' }}
        />

        {tab === 'presente' && (
          <>
            <p style={{ textAlign: 'center' }} className="helper">
              Mirá a la cámara y presioná el botón para dejar tu presente.
            </p>
            <div style={{ textAlign: 'center' }}>
              <button className="primary" onClick={handlePresente} disabled={busy || !camReady}>
                {busy ? 'Analizando rostro…' : '📸 Dar Presente'}
              </button>
            </div>
          </>
        )}

        {tab === 'registro' && (
          <>
            <p style={{ textAlign: 'center' }} className="helper">
              Completá tus datos y mostrá tu rostro a la cámara. Mirá con buena iluminación.
            </p>
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
            />
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@ejemplo.com"
            />
            <div style={{ textAlign: 'center' }}>
              <button className="primary" onClick={handleRegistro} disabled={busy || !camReady}>
                {busy ? 'Registrando…' : '💾 Registrar con mi rostro'}
              </button>
            </div>
          </>
        )}

        {tip && <p className="helper">{tip}</p>}
        {status && <div className={`msg ${status.type}`}>{status.text}</div>}
      </div>
    </div>
  );
}
