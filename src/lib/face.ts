'use client';

export { findBestMatch } from './match';

// Utilidades para el reconocimiento facial usando face-api.js
// Nota: face-api.js se importa de forma dinámica porque depende de APIs del navegador.

const MODEL_URL = '/models';

export interface DetectedFace {
  descriptor: number[]; // vector de 128 dimensiones
}

/**
 * Carga los modelos de face-api.js (detector + landmarks + reconocimiento).
 * Se ejecuta una sola vez.
 */
export async function loadModels() {
  const faceapi = await import('@vladmandic/face-api');
  if (!(faceapi as any).nets.tinyFaceDetector.isLoaded) {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  }
  if (!(faceapi as any).nets.faceLandmark68Net.isLoaded) {
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  }
  if (!(faceapi as any).nets.faceRecognitionNet.isLoaded) {
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  }
  return faceapi;
}

/**
 * Detiene el stream de video de una cámara.
 */
export function stopStream(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * Obtiene el descriptor facial de un video HTMLVideoElement.
 * Devuelve null si no se detecta ningún rostro.
 */
export async function detectFaceFromVideo(
  video: HTMLVideoElement
): Promise<number[] | null> {
  const faceapi = await loadModels();

  const result = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;
  return Array.from(result.descriptor);
}
