'use client';

import { useEffect, useRef, useState } from 'react';

interface CameraProps {
  onReady?: () => void;
  captureLabel?: string;
  onCapture?: (frame: string) => void;
}

export default function Camera({ onReady, captureLabel = 'Capturar', onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          onReady?.();
        }
      } catch (e) {
        console.error(e);
        setError('No se pudo acceder a la cámara. Asegurate de permitir el permiso.');
      }
    }
    start();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture?.(canvas.toDataURL('image/jpeg', 0.9));
  }

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', maxWidth: 480, borderRadius: 8, background: '#000' }}
      />
      {error && <p style={{ color: '#e53e3e' }}>{error}</p>}
      {ready && !error && (
        <button
          type="button"
          onClick={handleCapture}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          📸 {captureLabel}
        </button>
      )}
    </div>
  );
}
