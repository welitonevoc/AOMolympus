import * as THREE from 'three';

function hash2d(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

export function createTerrainTexture(
  maxAnisotropy: number,
  baseColor = '#4e6b3b',
  patchA = 'rgba(98, 128, 62, 0.22)',
  patchB = 'rgba(56, 82, 42, 0.22)'
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Organic biome mottling and subtle stone flecks
  for (let i = 0; i < 6500; i++) {
    const x = hash2d(i, 1) * size;
    const y = hash2d(i, 2) * size;
    const r = 2 + hash2d(i, 3) * 10;
    const pick = hash2d(i, 4);
    if (pick < 0.45) {
      ctx.fillStyle = patchA;
    } else if (pick < 0.8) {
      ctx.fillStyle = patchB;
    } else {
      ctx.fillStyle = 'rgba(138, 125, 88, 0.14)';
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createMarbleTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e7dfd0';
  ctx.fillRect(0, 0, size, size);

  // Subtle stone block grid & veins
  ctx.strokeStyle = 'rgba(145, 134, 118, 0.35)';
  ctx.lineWidth = 2;
  for (let y = 0; y < size; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
    const offset = (y / 32) % 2 === 0 ? 0 : 32;
    for (let x = offset; x < size; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 32);
      ctx.stroke();
    }
  }

  for (let i = 0; i < 180; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(120,110,95,0.08)';
    ctx.fillRect(hash2d(i, 7) * size, hash2d(i, 9) * size, 12, 6);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(10, 12, 16, 0.55)');
  grad.addColorStop(0.65, 'rgba(10, 12, 16, 0.22)');
  grad.addColorStop(1, 'rgba(10, 12, 16, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSelectionRingTexture(colorHex: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.41, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
