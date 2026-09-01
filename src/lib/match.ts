/**
 * Lógica de comparación de descriptores faciales (distancia euclidiana).
 * Usada tanto en el servidor (dar presente) como en el cliente.
 */

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

/**
 * Encuentra el descriptor guardado más cercano al buscado.
 * Devuelve { index, distance } si la distancia está por debajo del umbral.
 * El índice corresponde a la posición en `knownDescriptors`.
 */
export function findBestMatch(
  queryDescriptor: number[],
  knownDescriptors: number[][],
  threshold = 0.55
): { index: number; distance: number } | null {
  if (knownDescriptors.length === 0) return null;

  let bestIndex = -1;
  let bestDistance = Infinity;

  for (let i = 0; i < knownDescriptors.length; i++) {
    const d = euclideanDistance(queryDescriptor, knownDescriptors[i]);
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = i;
    }
  }

  if (bestDistance > threshold) return null;
  return { index: bestIndex, distance: bestDistance };
}
