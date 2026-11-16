import * as THREE from 'three';

/**
 * BRG (BANG Resource Geometry) Vertex-Cache Morphing Animation System.
 * Faithfully mirrors the Age of Mythology native port engine (src/anim/animation_system.cpp):
 * - Chunk-based clip structure (ASET header, MESI frame vertex buffers)
 * - Per-frame vertex position and normal caches
 * - Linear vertex-by-vertex morph interpolation:
 *     out_positions[v] = glm::mix(p0[v], p1[v], alpha);
 *     out_normals[v]   = glm::normalize(glm::mix(n0[v], n1[v], alpha));
 * - UnitAnimationState playback with fmod looping and event dispatch.
 */

export interface BrgFrame {
  positions: Float32Array; // 3 floats per vertex (x, y, z)
  normals: Float32Array;   // 3 floats per vertex (nx, ny, nz)
}

export interface BrgAnimationClip {
  name: string;
  fps: number;
  duration: number;
  frameCount: number;
  frames: BrgFrame[];
}

export class UnitAnimationState {
  public currentClipName = 'idle';
  public currentTime = 0;
  public loop = true;
  public speed = 1.0;
  public onEvent?: (eventName: string) => void;

  private clips = new Map<string, BrgAnimationClip>();

  public registerClip(clip: BrgAnimationClip) {
    this.clips.set(clip.name.toLowerCase(), clip);
  }

  public getClip(name: string): BrgAnimationClip | undefined {
    return this.clips.get(name.toLowerCase());
  }

  public play(clipName: string, loop = true, speed = 1.0) {
    const key = clipName.toLowerCase();
    if (this.currentClipName === key && this.loop === loop) return;
    this.currentClipName = key;
    this.currentTime = 0;
    this.loop = loop;
    this.speed = speed;
  }

  public update(dt: number): { clip: BrgAnimationClip; t: number } | null {
    const clip = this.clips.get(this.currentClipName) ?? this.clips.get('idle');
    if (!clip || clip.duration <= 0) return null;

    this.currentTime += dt * this.speed;

    if (this.currentTime >= clip.duration) {
      if (this.loop) {
        // fmod looping matching native AoM port: fmod(currentTime, duration)
        this.currentTime = this.currentTime % clip.duration;
      } else {
        this.currentTime = clip.duration;
      }
    }

    return { clip, t: this.currentTime };
  }
}

/**
 * Evaluate a BRG clip at time t using linear vertex-by-vertex morphing (glm::mix).
 */
export function evaluateBrgClip(
  clip: BrgAnimationClip,
  time: number,
  outPositions: Float32Array,
  outNormals: Float32Array
): void {
  const frameCount = clip.frames.length;
  if (frameCount === 0) return;
  if (frameCount === 1) {
    outPositions.set(clip.frames[0].positions);
    outNormals.set(clip.frames[0].normals);
    return;
  }

  // Wrap time inside clip duration (fmod)
  const wrappedT = ((time % clip.duration) + clip.duration) % clip.duration;
  const frameTime = 1 / clip.fps;
  const rawIdx = wrappedT / frameTime;
  const f0 = Math.floor(rawIdx) % frameCount;
  const f1 = (f0 + 1) % frameCount;
  const alpha = rawIdx - Math.floor(rawIdx); // normalized blend factor between 0.0 and 1.0

  const p0 = clip.frames[f0].positions;
  const p1 = clip.frames[f1].positions;
  const n0 = clip.frames[f0].normals;
  const n1 = clip.frames[f1].normals;

  const len = outPositions.length;
  for (let i = 0; i < len; i += 3) {
    // out_positions[v] = glm::mix(p0[v], p1[v], alpha);
    outPositions[i] = p0[i] * (1 - alpha) + p1[i] * alpha;
    outPositions[i + 1] = p0[i + 1] * (1 - alpha) + p1[i + 1] * alpha;
    outPositions[i + 2] = p0[i + 2] * (1 - alpha) + p1[i + 2] * alpha;

    // out_normals[v] = glm::normalize(glm::mix(n0[v], n1[v], alpha));
    const nx = n0[i] * (1 - alpha) + n1[i] * alpha;
    const ny = n0[i + 1] * (1 - alpha) + n1[i + 1] * alpha;
    const nz = n0[i + 2] * (1 - alpha) + n1[i + 2] * alpha;
    const invLen = 1 / (Math.hypot(nx, ny, nz) || 1);
    outNormals[i] = nx * invLen;
    outNormals[i + 1] = ny * invLen;
    outNormals[i + 2] = nz * invLen;
  }
}

/**
 * Remaps the UV coordinates of a BufferGeometry into a pixel sub-rectangle [x0, y0, x1, y1]
 * of a 64x64 Age of Mythology UV texture atlas.
 */
export function remapUvRegion64(
  geo: THREE.BufferGeometry,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): THREE.BufferGeometry {
  const uvAttr = geo.getAttribute('uv') as THREE.BufferAttribute | undefined;
  if (!uvAttr) return geo;

  const uMin = x0 / 64;
  const uMax = x1 / 64;
  // In Three.js UV space with flipY=true, v=1 is top (y=0) and v=0 is bottom (y=64)
  const vMin = 1 - y1 / 64;
  const vMax = 1 - y0 / 64;

  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i);
    const v = uvAttr.getY(i);
    uvAttr.setXY(i, uMin + u * (uMax - uMin), vMin + v * (vMax - vMin));
  }
  uvAttr.needsUpdate = true;
  return geo;
}

/**
 * Procedural generator for 2.5D BRG Vertex-Cache animated Hoplite mesh.
 * UV-mapped to the authentic 64x64 Age of Mythology `infantry_g_hoplite_map_01..04.png` textures!
 * Generates base mesh and baking clips (Idle, Walk, Attack) with direct vertex deformation.
 */
export function buildBrgHopliteGeometry(): {
  geometry: THREE.BufferGeometry;
  animState: UnitAnimationState;
} {
  // 1. Torso / Muscle Cuirass mapped to [42, 24, 63, 51]
  const torsoGeo = remapUvRegion64(
    new THREE.CylinderGeometry(0.29, 0.25, 0.56, 12, 2).toNonIndexed(),
    42, 24, 63, 51
  );
  torsoGeo.translate(0, 0.34, 0);

  // 2. Pteruges Leather Battle Skirt mapped to [1, 43, 36, 52]
  const pterugesGeo = remapUvRegion64(
    new THREE.CylinderGeometry(0.26, 0.34, 0.24, 12, 1).toNonIndexed(),
    1, 43, 36, 52
  );
  pterugesGeo.translate(0, -0.02, 0);

  // 3. Pleated White Chiton Skirt Hem mapped to [1, 52, 35, 63]
  const chitonGeo = remapUvRegion64(
    new THREE.CylinderGeometry(0.32, 0.37, 0.14, 12, 1).toNonIndexed(),
    1, 52, 35, 63
  );
  chitonGeo.translate(0, -0.16, 0);

  // 4. Head & Face mapped to AoM Face [14, 26, 23, 42]
  const headGeo = remapUvRegion64(
    new THREE.SphereGeometry(0.20, 10, 8).toNonIndexed(),
    14, 26, 23, 42
  );
  headGeo.rotateY(-Math.PI / 2);
  headGeo.translate(0, 0.78, 0.02);

  // 5. Helmet Dome & Crest mapped to Armor/Crest [44, 36, 62, 51]
  const helmGeo = remapUvRegion64(
    new THREE.SphereGeometry(0.23, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65).toNonIndexed(),
    44, 36, 62, 51
  );
  helmGeo.translate(0, 0.82, 0);

  const crestGeo = remapUvRegion64(
    new THREE.BoxGeometry(0.06, 0.26, 0.48).toNonIndexed(),
    2, 44, 34, 51
  );
  crestGeo.translate(0, 1.06, -0.04);

  // 6. Left & Right Legs (Thighs [44, 52, 58, 63] + Greaves [5, 16, 13, 25] + Sandals [29, 1, 54, 11])
  const thighL = remapUvRegion64(
    new THREE.CylinderGeometry(0.095, 0.08, 0.28, 8, 1).toNonIndexed(),
    44, 52, 58, 63
  );
  thighL.translate(-0.13, -0.28, 0);

  const thighR = remapUvRegion64(
    new THREE.CylinderGeometry(0.095, 0.08, 0.28, 8, 1).toNonIndexed(),
    44, 52, 58, 63
  );
  thighR.translate(0.13, -0.28, 0);

  const greaveL = remapUvRegion64(
    new THREE.CylinderGeometry(0.085, 0.068, 0.34, 8, 1).toNonIndexed(),
    5, 16, 13, 25
  );
  greaveL.translate(-0.13, -0.56, 0.01);

  const greaveR = remapUvRegion64(
    new THREE.CylinderGeometry(0.085, 0.068, 0.34, 8, 1).toNonIndexed(),
    5, 16, 13, 25
  );
  greaveR.translate(0.13, -0.56, 0.01);

  const sandalL = remapUvRegion64(
    new THREE.BoxGeometry(0.09, 0.06, 0.20).toNonIndexed(),
    29, 1, 54, 11
  );
  sandalL.translate(-0.13, -0.73, 0.04);

  const sandalR = remapUvRegion64(
    new THREE.BoxGeometry(0.09, 0.06, 0.20).toNonIndexed(),
    29, 1, 54, 11
  );
  sandalR.translate(0.13, -0.73, 0.04);

  // 7. Left & Right Arms [2, 27, 13, 36]
  const armL = remapUvRegion64(
    new THREE.CylinderGeometry(0.075, 0.065, 0.42, 8, 1).toNonIndexed(),
    2, 27, 13, 36
  );
  armL.rotateX(-0.35);
  armL.translate(-0.34, 0.34, 0.08);

  const armR = remapUvRegion64(
    new THREE.CylinderGeometry(0.075, 0.065, 0.42, 8, 1).toNonIndexed(),
    2, 27, 13, 36
  );
  armR.rotateX(-0.45);
  armR.translate(0.34, 0.34, 0.08);

  // 8. Hoplon Shield & Doru Spear
  const shieldGeo = remapUvRegion64(
    new THREE.CylinderGeometry(0.48, 0.46, 0.05, 16).toNonIndexed(),
    44, 36, 62, 51
  );
  shieldGeo.rotateX(Math.PI / 2);
  shieldGeo.rotateY(0.22);
  shieldGeo.translate(-0.42, 0.28, 0.28);

  const spearGeo = remapUvRegion64(
    new THREE.CylinderGeometry(0.024, 0.024, 2.3, 6).toNonIndexed(),
    1, 43, 36, 52
  );
  spearGeo.rotateX(Math.PI / 2.3);
  spearGeo.translate(0.38, 0.25, 0.38);

  // Merge into single continuous buffer for vertex-cache deformation
  const merged = mergeGeometries([
    torsoGeo,
    pterugesGeo,
    chitonGeo,
    headGeo,
    helmGeo,
    crestGeo,
    thighL,
    thighR,
    greaveL,
    greaveR,
    sandalL,
    sandalR,
    armL,
    armR,
    shieldGeo,
    spearGeo,
  ]);
  const posAttr = merged.getAttribute('position') as THREE.BufferAttribute;
  const normAttr = merged.getAttribute('normal') as THREE.BufferAttribute;
  const vertexCount = posAttr.count;

  const basePositions = new Float32Array(posAttr.array);
  const baseNormals = new Float32Array(normAttr.array);

  // Helper to bake frame from deformer callback
  const bakeFrame = (deformFn: (x: number, y: number, z: number, idx: number) => [number, number, number]): BrgFrame => {
    const fPos = new Float32Array(vertexCount * 3);
    const fNorm = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      const idx = i * 3;
      const ox = basePositions[idx];
      const oy = basePositions[idx + 1];
      const oz = basePositions[idx + 2];
      const [nx, ny, nz] = deformFn(ox, oy, oz, i);
      fPos[idx] = nx;
      fPos[idx + 1] = ny;
      fPos[idx + 2] = nz;
      fNorm[idx] = baseNormals[idx];
      fNorm[idx + 1] = baseNormals[idx + 1];
      fNorm[idx + 2] = baseNormals[idx + 2];
    }
    return { positions: fPos, normals: fNorm };
  };

  // 1. Idle Clip (12 frames, 1.2s @ 10 FPS) — organic breathing & ready stance
  const idleFrames: BrgFrame[] = [];
  const idleCount = 12;
  for (let f = 0; f < idleCount; f++) {
    const phase = (f / idleCount) * Math.PI * 2;
    const breathY = Math.sin(phase) * 0.03;
    const swayZ = Math.cos(phase) * 0.018;
    idleFrames.push(
      bakeFrame((x, y, z) => {
        const isUpper = y > 0.05;
        const dy = isUpper ? breathY : 0;
        const dz = isUpper ? swayZ : 0;
        return [x, y + dy, z + dz];
      })
    );
  }
  const idleClip: BrgAnimationClip = {
    name: 'idle',
    fps: 10,
    duration: 1.2,
    frameCount: idleCount,
    frames: idleFrames,
  };

  // 2. Walk Clip (14 frames, 1.0s @ 14 FPS) — classic 2.5D vertex-striding march
  const walkFrames: BrgFrame[] = [];
  const walkCount = 14;
  for (let f = 0; f < walkCount; f++) {
    const phase = (f / walkCount) * Math.PI * 2;
    const strideLeft = Math.sin(phase);
    const strideRight = -Math.sin(phase);
    const bobY = Math.abs(Math.sin(phase * 2)) * 0.055;
    const torsoLeanZ = 0.05;

    walkFrames.push(
      bakeFrame((x, y, z) => {
        const px = x;
        let py = y + bobY;
        let pz = z + torsoLeanZ;

        // Deform lower vertices (legs) according to left/right hip x
        if (y < -0.1) {
          const legStride = x < 0 ? strideLeft : strideRight;
          const legDepth = Math.min(1, Math.max(0, (-y - 0.1) / 0.65));
          pz += legStride * 0.28 * legDepth;
          py += Math.max(0, legStride * 0.07 * legDepth);
        }
        // Swing shield & spear with march
        if (x < -0.22 && y > 0) pz -= strideLeft * 0.10; // shield arm
        if (x > 0.22 && y > 0) pz += strideLeft * 0.16;  // spear arm

        return [px, py, pz];
      })
    );
  }
  const walkClip: BrgAnimationClip = {
    name: 'walk',
    fps: 14,
    duration: 1.0,
    frameCount: walkCount,
    frames: walkFrames,
  };

  // 3. Attack Clip (10 frames, 0.7s @ 14 FPS) — spear thrust & shield brace
  const attackFrames: BrgFrame[] = [];
  const attackCount = 10;
  for (let f = 0; f < attackCount; f++) {
    const t = f / attackCount;
    const thrust = Math.sin(t * Math.PI);
    attackFrames.push(
      bakeFrame((x, y, z) => {
        let px = x;
        let py = y;
        let pz = z;

        // Right side (spear arm) lunges forward
        if (x > 0.18 && y > -0.05) {
          pz += thrust * 0.72;
          py += thrust * 0.04;
        }
        // Left side (shield) braces forward and turns slightly inward
        if (x < -0.18 && y > -0.05) {
          pz += thrust * 0.22;
          px += thrust * 0.05;
        }
        // Torso lunges forward
        if (y > -0.15) {
          pz += thrust * 0.26;
        }
        return [px, py, pz];
      })
    );
  }
  const attackClip: BrgAnimationClip = {
    name: 'attack',
    fps: 14,
    duration: 0.7,
    frameCount: attackCount,
    frames: attackFrames,
  };

  const animState = new UnitAnimationState();
  animState.registerClip(idleClip);
  animState.registerClip(walkClip);
  animState.registerClip(attackClip);
  animState.play('idle');

  return { geometry: merged, animState };
}

/**
 * Merge multiple non-indexed BufferGeometries into one continuous buffer while preserving UVs.
 */
function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0;
  for (const g of geos) totalVerts += g.getAttribute('position').count;

  const pos = new Float32Array(totalVerts * 3);
  const norm = new Float32Array(totalVerts * 3);
  const uv = new Float32Array(totalVerts * 2);
  let offset = 0;

  for (const g of geos) {
    const p = g.getAttribute('position') as THREE.BufferAttribute;
    const n = g.getAttribute('normal') as THREE.BufferAttribute;
    const u = g.getAttribute('uv') as THREE.BufferAttribute | undefined;
    pos.set(p.array, offset * 3);
    if (n) norm.set(n.array, offset * 3);
    if (u) uv.set(u.array, offset * 2);
    offset += p.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return merged;
}
