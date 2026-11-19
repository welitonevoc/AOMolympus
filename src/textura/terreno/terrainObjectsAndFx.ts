import * as THREE from 'three';

export type TerrainRockKind =
  | 'rock_granite_small'
  | 'rock_granite_large'
  | 'basalt_pillar'
  | 'underworld_stalagmite'
  | 'sandstone_mesa'
  | 'olympus_marble_rock';

export interface TerrainRockSpec {
  kind: TerrainRockKind;
  xsProto: string;
  label: string;
  blocksPathing: boolean;
  collisionRadius: number;
  desc: string;
}

export const TERRAIN_ROCK_SPECS: Record<TerrainRockKind, TerrainRockSpec> = {
  rock_granite_small: {
    kind: 'rock_granite_small',
    xsProto: 'Rock Granite Small',
    label: 'Pedras de Granito Pequenas',
    blocksPathing: false,
    collisionRadius: 0,
    desc: 'Pedras decorativas sem colisão (unidades caminham livremente)',
  },
  rock_granite_large: {
    kind: 'rock_granite_large',
    xsProto: 'Rock Granite Large',
    label: 'Rochedo de Granito',
    blocksPathing: true,
    collisionRadius: 2.1,
    desc: 'Grande rochedo que bloqueia tropas e construções',
  },
  basalt_pillar: {
    kind: 'basalt_pillar',
    xsProto: 'Basalt Pillar',
    label: 'Pilar de Basalto Vulcânico',
    blocksPathing: true,
    collisionRadius: 1.75,
    desc: 'Coluna hexagonal de basalto que bloqueia passagem',
  },
  underworld_stalagmite: {
    kind: 'underworld_stalagmite',
    xsProto: 'Stalagmite',
    label: 'Estalagmite do Submundo',
    blocksPathing: true,
    collisionRadius: 1.65,
    desc: 'Formação rochosa do Tártaro com brasas na base (bloqueia tropas)',
  },
  sandstone_mesa: {
    kind: 'sandstone_mesa',
    xsProto: 'Egyptian Rock Formation',
    label: 'Formação de Arenito',
    blocksPathing: true,
    collisionRadius: 2.2,
    desc: 'Afloramento rochoso de deserto que bloqueia unidades',
  },
  olympus_marble_rock: {
    kind: 'olympus_marble_rock',
    xsProto: 'Olympus Marble Outcrop',
    label: 'Afloramento de Mármore',
    blocksPathing: false,
    collisionRadius: 0,
    desc: 'Pedras claras decorativas do Olimpo (sem colisão)',
  },
};

/**
 * Layer 2A — Procedural 3D Rocks & Geological Formations
 * Multi-part composite Three.js Groups distinguishing decorative vs blocking formations.
 */
export function createTerrainRockMesh(kind: TerrainRockKind, enableShadows = true, seed = 1): THREE.Group {
  const g = new THREE.Group();
  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x676b70, roughness: 0.9, metalness: 0.08 });
  const graniteDark = new THREE.MeshStandardMaterial({ color: 0x4b4e54, roughness: 0.92, metalness: 0.1 });
  const basaltMat = new THREE.MeshStandardMaterial({ color: 0x2f2b30, roughness: 0.85, metalness: 0.18 });
  const emberMat = new THREE.MeshStandardMaterial({ color: 0xff6224, emissive: 0xd93800, emissiveIntensity: 1.25, roughness: 0.45 });
  const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xc2985d, roughness: 0.88, metalness: 0.04 });
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe6dfd0, roughness: 0.65, metalness: 0.08 });

  const addPart = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = enableShadows;
    m.receiveShadow = enableShadows;
    g.add(m);
    return m;
  };

  const s = (seed % 7) * 0.4;

  switch (kind) {
    case 'rock_granite_small': {
      addPart(new THREE.DodecahedronGeometry(0.42, 0), graniteMat, 0, 0.2, 0, 0.2, s, 0.1);
      addPart(new THREE.DodecahedronGeometry(0.28, 0), graniteDark, 0.48, 0.14, 0.22, 0.5, s + 1, 0.3);
      addPart(new THREE.DodecahedronGeometry(0.22, 0), graniteMat, -0.35, 0.11, 0.3, 0.3, s + 2, 0.2);
      break;
    }
    case 'rock_granite_large': {
      addPart(new THREE.DodecahedronGeometry(1.45, 1), graniteMat, 0, 0.92, 0, 0.15, s, 0.1);
      addPart(new THREE.DodecahedronGeometry(1.02, 0), graniteDark, 1.05, 0.62, 0.42, 0.3, s + 0.8, 0.2);
      addPart(new THREE.DodecahedronGeometry(0.88, 0), graniteMat, -0.95, 0.55, -0.5, 0.2, s + 1.5, 0.4);
      addPart(new THREE.DodecahedronGeometry(0.65, 0), graniteDark, 0.15, 1.72, -0.1, 0.4, s, 0.2);
      break;
    }
    case 'basalt_pillar': {
      // Hexagonal columnar basalt cluster
      addPart(new THREE.CylinderGeometry(0.62, 0.72, 3.4, 6), basaltMat, 0, 1.7, 0);
      addPart(new THREE.CylinderGeometry(0.48, 0.54, 2.35, 6), basaltMat, 0.82, 1.18, 0.32);
      addPart(new THREE.CylinderGeometry(0.45, 0.52, 1.85, 6), basaltMat, -0.74, 0.92, 0.42);
      addPart(new THREE.CylinderGeometry(0.42, 0.48, 1.35, 6), graniteDark, 0.15, 0.68, -0.85);
      break;
    }
    case 'underworld_stalagmite': {
      addPart(new THREE.ConeGeometry(0.92, 3.6, 7), basaltMat, 0, 1.8, 0, 0.04, s, -0.05);
      addPart(new THREE.ConeGeometry(0.58, 2.35, 6), basaltMat, 0.75, 1.18, 0.38, -0.06, s + 1, 0.12);
      addPart(new THREE.ConeGeometry(0.48, 1.8, 6), basaltMat, -0.68, 0.9, -0.32, 0.08, s + 2, -0.1);
      // Glowing magma crust ring at base
      addPart(new THREE.TorusGeometry(0.95, 0.12, 6, 12), emberMat, 0, 0.14, 0, Math.PI / 2, 0, 0);
      break;
    }
    case 'sandstone_mesa': {
      addPart(new THREE.CylinderGeometry(1.15, 1.65, 1.85, 7), sandstoneMat, 0, 0.92, 0, 0, s, 0);
      addPart(new THREE.CylinderGeometry(0.82, 1.12, 1.05, 7), sandstoneMat, 0.22, 2.25, -0.12, 0, s + 0.5, 0);
      addPart(new THREE.DodecahedronGeometry(0.75, 0), sandstoneMat, -1.2, 0.42, 0.62, 0.2, s, 0.1);
      break;
    }
    case 'olympus_marble_rock': {
      addPart(new THREE.DodecahedronGeometry(0.58, 0), marbleMat, 0, 0.28, 0, 0.15, s, 0.2);
      addPart(new THREE.DodecahedronGeometry(0.36, 0), marbleMat, 0.55, 0.18, -0.22, 0.4, s + 1, 0.1);
      break;
    }
  }

  g.userData.terrainRockKind = kind;
  g.userData.blocksPathing = TERRAIN_ROCK_SPECS[kind].blocksPathing;
  return g;
}

// ── Layer 2B — Atmospheric FX & Particle Emitters (Dust, Volcanic Smoke, Magma Sparks, Low Mist, Sunbeams) ──

export type AtmosphericEmitterKind =
  | 'wind_dust'
  | 'volcanic_smoke'
  | 'magma_sparks'
  | 'low_mist'
  | 'sunbeams';

export interface AtmosphericEmitterSpec {
  kind: AtmosphericEmitterKind;
  xsProto: string;
  label: string;
  desc: string;
  markerColorHex: number;
}

export const ATMOSPHERIC_EMITTER_SPECS: Record<AtmosphericEmitterKind, AtmosphericEmitterSpec> = {
  wind_dust: {
    kind: 'wind_dust',
    xsProto: 'FX Wind Dust',
    label: 'Emissor: Poeira ao Vento',
    desc: 'Partículas de areia e poeira arrastadas pelo vento no deserto',
    markerColorHex: 0xd9b37c,
  },
  volcanic_smoke: {
    kind: 'volcanic_smoke',
    xsProto: 'FX Volcanic Smoke',
    label: 'Emissor: Fumaça Vulcânica',
    desc: 'Colunas escuras de fumaça subindo de crateras e lava',
    markerColorHex: 0x52525b,
  },
  magma_sparks: {
    kind: 'magma_sparks',
    xsProto: 'FX Magma Sparks',
    label: 'Emissor: Faíscas de Magma',
    desc: 'Brasas incandescentes saltando de fissuras vulcânicas',
    markerColorHex: 0xff6b2b,
  },
  low_mist: {
    kind: 'low_mist',
    xsProto: 'FX Low Mist',
    label: 'Emissor: Névoa Baixa',
    desc: 'Névoa atmosférica pairando sobre pântanos, rios e geleiras',
    markerColorHex: 0xbae6fd,
  },
  sunbeams: {
    kind: 'sunbeams',
    xsProto: 'FX Sunbeams',
    label: 'Emissor: Raios de Luz (Sunbeams)',
    desc: 'Feixes dourados de luz divina descendo dos céus',
    markerColorHex: 0xfef08a,
  },
};

interface ActiveEmitterInstance {
  kind: AtmosphericEmitterKind;
  group: THREE.Group;
  particles: {
    mesh: THREE.Mesh;
    phase: number;
    speed: number;
    radius: number;
    baseY: number;
    maxRise: number;
    driftX: number;
    driftZ: number;
  }[];
}

/**
 * Builds a compact 3D preview representation of an FX Emitter (used in Scenario Editor & live game).
 */
export function createEmitterPreviewMesh(kind: AtmosphericEmitterKind): THREE.Group {
  const g = new THREE.Group();
  const spec = ATMOSPHERIC_EMITTER_SPECS[kind];

  if (kind === 'sunbeams') {
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfff3b0,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 3; i++) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 1.85, 14, 10, 1, true), beamMat);
      beam.position.set((i - 1) * 1.4, 6.8, (i % 2) * 0.8);
      beam.rotation.z = -0.22;
      g.add(beam);
    }
    return g;
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 1.0, 20),
    new THREE.MeshBasicMaterial({ color: spec.markerColorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.08;
  g.add(ring);

  const count = kind === 'magma_sparks' ? 10 : 6;
  const pMat = new THREE.MeshBasicMaterial({
    color: spec.markerColorHex,
    transparent: true,
    opacity: kind === 'low_mist' ? 0.28 : kind === 'magma_sparks' ? 0.9 : 0.45,
    depthWrite: false,
  });
  for (let i = 0; i < count; i++) {
    const rad = kind === 'magma_sparks' ? 0.12 : kind === 'low_mist' ? 1.4 : 0.55;
    const p = new THREE.Mesh(new THREE.SphereGeometry(rad, 7, 6), pMat);
    const ang = (i / count) * Math.PI * 2;
    p.position.set(Math.cos(ang) * (kind === 'low_mist' ? 1.8 : 0.85), 0.5 + i * 0.42, Math.sin(ang) * (kind === 'low_mist' ? 1.8 : 0.85));
    if (kind === 'low_mist') p.scale.set(1.6, 0.35, 1.6);
    g.add(p);
  }
  return g;
}

let cachedMistTexture: THREE.CanvasTexture | null = null;
let cachedSunbeamTexture: THREE.CanvasTexture | null = null;

function getSoftMistTexture(): THREE.CanvasTexture | null {
  if (cachedMistTexture) return cachedMistTexture;
  if (typeof document === 'undefined') return null;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 2, half, half, half);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.32, 'rgba(255, 255, 255, 0.45)');
  grad.addColorStop(0.68, 'rgba(255, 255, 255, 0.12)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  cachedMistTexture = tex;
  return tex;
}

function getSoftSunbeamTexture(): THREE.CanvasTexture | null {
  if (cachedSunbeamTexture) return cachedSunbeamTexture;
  if (typeof document === 'undefined') return null;
  const w = 64;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Vertical fade to 0 at both top and bottom so cylinders never show hard edges
  const vGrad = ctx.createLinearGradient(0, 0, 0, h);
  vGrad.addColorStop(0.0, 'rgba(255, 250, 224, 0.0)');
  vGrad.addColorStop(0.28, 'rgba(255, 250, 224, 0.65)');
  vGrad.addColorStop(0.65, 'rgba(255, 245, 200, 0.45)');
  vGrad.addColorStop(1.0, 'rgba(255, 245, 200, 0.0)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, w, h);

  // Soft horizontal feathering across wrap seam
  ctx.globalCompositeOperation = 'destination-in';
  const hGrad = ctx.createLinearGradient(0, 0, w, 0);
  hGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.15)');
  hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
  hGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.15)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  cachedSunbeamTexture = tex;
  return tex;
}

/**
 * Runtime manager for animated Layer 2B Atmospheric FX Emitters in Three.js scenes.
 */
export class AtmosphericFxSystem {
  private scene: THREE.Object3D;
  private emitters: ActiveEmitterInstance[] = [];
  private mistVisible = true;
  private elapsed = 0;

  constructor(scene: THREE.Object3D) {
    this.scene = scene;
  }

  public addEmitter(kind: AtmosphericEmitterKind, x: number, y: number, z: number, scale = 1): void {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.scale.setScalar(scale);

    const particles: ActiveEmitterInstance['particles'] = [];
    const mistTex = getSoftMistTexture();

    if (kind === 'sunbeams') {
      const beamTex = getSoftSunbeamTexture();
      for (let i = 0; i < 2; i++) {
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xfff0c2,
          map: beamTex ?? undefined,
          transparent: true,
          opacity: 0.04,
          side: THREE.DoubleSide,
          depthWrite: false,
          fog: false,
          blending: THREE.AdditiveBlending,
        });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 2.0, 14, 12, 1, true), beamMat);
        mesh.position.set((i - 0.5) * 2.2, 6.8, (i % 2) * 0.9);
        mesh.rotation.z = -0.22;
        group.add(mesh);
        particles.push({ mesh, phase: i * 1.9, speed: 0.45, radius: 0, baseY: 6.8, maxRise: 0, driftX: 0, driftZ: 0 });
      }
    } else if (kind === 'low_mist' || kind === 'wind_dust' || kind === 'volcanic_smoke') {
      const isMist = kind === 'low_mist';
      const isSmoke = kind === 'volcanic_smoke';
      const count = isMist ? 5 : isSmoke ? 7 : 6;
      const color = ATMOSPHERIC_EMITTER_SPECS[kind].markerColorHex;
      const planeSize = isMist ? 6.4 : isSmoke ? 2.4 : 2.1;
      const geo = new THREE.PlaneGeometry(planeSize, planeSize);
      if (isMist) {
        geo.rotateX(-Math.PI / 2);
      }

      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color,
          map: mistTex ?? undefined,
          transparent: true,
          opacity: isMist ? 0.085 : isSmoke ? 0.24 : 0.11,
          side: THREE.DoubleSide,
          depthWrite: false,
          fog: !isMist,
          blending: THREE.NormalBlending,
        });
        const mesh = new THREE.Mesh(geo, mat);
        if (!isMist) {
          mesh.rotation.x = -0.35;
          mesh.rotation.y = (i / count) * Math.PI;
        }
        group.add(mesh);
        particles.push({
          mesh,
          phase: (i / count) * Math.PI * 2,
          speed: isSmoke ? 0.48 + (i % 3) * 0.1 : isMist ? 0.18 : 0.72,
          radius: isMist ? 3.8 : 2.2,
          baseY: isMist ? 0.26 + (i % 2) * 0.14 : 0.3,
          maxRise: isSmoke ? 5.6 : isMist ? 0.3 : 1.5,
          driftX: kind === 'wind_dust' ? 4.4 : isMist ? 1.8 : 0.55,
          driftZ: kind === 'wind_dust' ? 1.8 : 0.55,
        });
      }
    } else {
      // Magma sparks
      const count = 10;
      const color = ATMOSPHERIC_EMITTER_SPECS[kind].markerColorHex;
      const geo = new THREE.OctahedronGeometry(0.12, 0);

      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.65,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        particles.push({
          mesh,
          phase: (i / count) * Math.PI * 2,
          speed: 1.5 + (i % 3) * 0.35,
          radius: 1.5,
          baseY: 0.2,
          maxRise: 4.5,
          driftX: 0.55,
          driftZ: 0.5,
        });
      }
    }

    if (kind === 'low_mist' || kind === 'wind_dust') {
      group.visible = this.mistVisible;
    }

    this.scene.add(group);
    this.emitters.push({ kind, group, particles });
  }

  public setMistVisible(visible: boolean): void {
    this.mistVisible = visible;
    for (const em of this.emitters) {
      if (em.kind === 'low_mist' || em.kind === 'wind_dust') {
        em.group.visible = visible;
      }
    }
  }

  public update(dt: number): void {
    if (this.emitters.length === 0) return;
    this.elapsed += dt;

    for (const em of this.emitters) {
      if (!em.group.visible) continue;
      if (em.kind === 'sunbeams') {
        for (const p of em.particles) {
          const mat = p.mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.038 + Math.sin(this.elapsed * p.speed + p.phase) * 0.018;
        }
        continue;
      }

      for (const p of em.particles) {
        const cycle = ((this.elapsed * p.speed + p.phase) % 1 + 1) % 1;
        const ang = p.phase + this.elapsed * 0.22;
        if (em.kind === 'low_mist') {
          p.mesh.position.set(
            Math.cos(ang) * p.radius + Math.sin(this.elapsed * 0.28 + p.phase) * p.driftX,
            p.baseY + Math.sin(this.elapsed * 0.45 + p.phase) * 0.08,
            Math.sin(ang) * p.radius
          );
          p.mesh.rotation.z = this.elapsed * 0.06 + p.phase;
          const sc = 0.9 + Math.sin(this.elapsed * 0.35 + p.phase) * 0.18;
          p.mesh.scale.setScalar(sc);
        } else if (em.kind === 'wind_dust') {
          p.mesh.position.set(
            (cycle - 0.5) * p.driftX * 2.2,
            p.baseY + Math.sin(cycle * Math.PI) * p.maxRise,
            Math.sin(ang) * p.radius + (cycle - 0.5) * p.driftZ
          );
          const fade = Math.sin(cycle * Math.PI);
          p.mesh.scale.setScalar(0.65 + fade * 0.85);
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.11 * fade;
        } else {
          // Rising volcanic smoke or magma sparks
          p.mesh.position.set(
            Math.cos(ang) * p.radius * (0.4 + cycle * 0.8),
            p.baseY + cycle * p.maxRise,
            Math.sin(ang) * p.radius * (0.4 + cycle * 0.8)
          );
          const sc = em.kind === 'magma_sparks' ? Math.max(0.15, 1 - cycle * 0.85) : 0.65 + cycle * 1.25;
          p.mesh.scale.setScalar(sc);
          if (em.kind === 'volcanic_smoke') {
            (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.24 * Math.sin(cycle * Math.PI);
          }
        }
      }
    }
  }

  public clear(): void {
    const disposedGeos = new Set<THREE.BufferGeometry>();
    for (const em of this.emitters) {
      this.scene.remove(em.group);
      em.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          if (m.geometry && !disposedGeos.has(m.geometry)) {
            m.geometry.dispose();
            disposedGeos.add(m.geometry);
          }
          if (Array.isArray(m.material)) m.material.forEach((mt) => mt.dispose());
          else (m.material as THREE.Material | undefined)?.dispose();
        }
      });
    }
    this.emitters = [];
  }
}
