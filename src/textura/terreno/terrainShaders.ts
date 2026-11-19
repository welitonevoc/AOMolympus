import * as THREE from 'three';
import { MapId, WorldSizeId } from '../../game/types';
import { getWorldSizeSpec, resolveEffectiveMapId } from '../../maps';

function hash2d(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Generates seamless procedural terrain albedo texture with organic mottling & stone flecks.
 */
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

/**
 * Generates seamless procedural normal map for terrain relief, dust, and rock grain.
 */
export function createTerrainNormalTexture(maxAniso: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(size, size);
    const data = img.data;
    const heightAt = (ix: number, iy: number) => {
      const u = (ix / size) * Math.PI * 2;
      const v = (iy / size) * Math.PI * 2;
      const macro =
        Math.sin(u * 2 + v * 1) * 0.35 +
        Math.cos(u * 3 - v * 2) * 0.25 +
        Math.sin(u * 5 + v * 4) * 0.18;
      const micro =
        Math.sin(u * 11 + v * 9) * 0.12 +
        Math.cos(u * 17 - v * 13) * 0.08 +
        Math.sin(u * 23 + v * 19) * 0.05;
      return macro + micro;
    };

    const strength = 2.6;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const xm = (x - 1 + size) % size;
        const xp = (x + 1) % size;
        const ym = (y - 1 + size) % size;
        const yp = (y + 1) % size;
        const dx = (heightAt(xp, y) - heightAt(xm, y)) * strength;
        const dy = (heightAt(x, yp) - heightAt(x, ym)) * strength;
        const nx = -dx;
        const ny = -dy;
        const nz = 1.0;
        const invLen = 1 / Math.hypot(nx, ny, nz);
        const idx = (y * size + x) * 4;
        data[idx] = Math.round(((nx * invLen) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.round(((ny * invLen) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.round(((nz * invLen) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = Math.min(8, maxAniso);
  return tex;
}

/**
 * Generates seamless procedural roughness map for terrain micro-specularity.
 */
export function createTerrainRoughnessTexture(maxAniso: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(size, size);
    const data = img.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x / size) * Math.PI * 2;
        const v = (y / size) * Math.PI * 2;
        const n =
          0.5 +
          0.25 * Math.sin(u * 4 + v * 3) +
          0.15 * Math.cos(u * 9 - v * 7) +
          0.1 * Math.sin(u * 17 + v * 15);
        const val = Math.round(THREE.MathUtils.clamp(198 + n * 48, 175, 250));
        const idx = (y * size + x) * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = Math.min(8, maxAniso);
  return tex;
}

export interface WaterShaderUniforms {
  uTime: { value: number };
  uIsLava: { value: number };
  uIsIce: { value: number };
  uRedTide: { value: number };
}

/**
 * Upgrades the water MeshStandardMaterial with animated wave displacement,
 * dynamic ripple normals, shoreline Fresnel highlights, flowing magma lava veins,
 * and live RED TIDE blood-crimson transformation support.
 */
export function upgradeWaterMaterial(
  mat: THREE.MeshStandardMaterial,
  mapId: MapId
): { uniforms: WaterShaderUniforms } {
  const effId = resolveEffectiveMapId(mapId);
  const uniforms: WaterShaderUniforms = {
    uTime: { value: 0 },
    uIsLava: { value: effId === 'erebus' ? 1.0 : 0.0 },
    uIsIce: { value: effId === 'tundra' || effId === 'ghost_lake' ? 1.0 : 0.0 },
    uRedTide: { value: 0.0 },
  };

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uIsLava = uniforms.uIsLava;
    shader.uniforms.uIsIce = uniforms.uIsIce;
    shader.uniforms.uRedTide = uniforms.uRedTide;

    shader.vertexShader =
      `
      uniform float uTime;
      uniform float uIsIce;
      varying vec3 vWaterWorldPos;
      ` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vec4 wPosPre = modelMatrix * vec4(transformed, 1.0);
        float waveScale = mix(1.0, 0.2, uIsIce);
        float w1 = sin(wPosPre.x * 0.22 + uTime * 1.45) * cos(wPosPre.z * 0.19 + uTime * 1.15);
        float w2 = sin((wPosPre.x + wPosPre.z) * 0.38 - uTime * 2.1);
        transformed.y += (w1 * 0.09 + w2 * 0.045) * waveScale;
        vWaterWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `
      );

    shader.fragmentShader =
      `
      uniform float uTime;
      uniform float uIsLava;
      uniform float uIsIce;
      uniform float uRedTide;
      varying vec3 vWaterWorldPos;
      ` +
      shader.fragmentShader
        .replace(
          '#include <normal_fragment_maps>',
          `
          #include <normal_fragment_maps>
          float nScale = mix(1.0, 0.15, uIsIce);
          float r1 = sin(vWaterWorldPos.x * 1.15 + uTime * 1.9 + cos(vWaterWorldPos.z * 0.7)) * 0.08;
          float r2 = cos(vWaterWorldPos.z * 1.35 - uTime * 1.6 + sin(vWaterWorldPos.x * 0.8)) * 0.08;
          normal = normalize(normal + vec3(r1 * nScale, 0.0, r2 * nScale));
          `
        )
        .replace(
          '#include <color_fragment>',
          `
          #include <color_fragment>
          float caustic = sin(vWaterWorldPos.x * 0.72 + uTime * 1.3) * sin(vWaterWorldPos.z * 0.68 - uTime * 1.1);
          float shimmer = smoothstep(0.45, 0.96, caustic);
          vec3 waterTint = mix(vec3(0.28, 0.62, 0.78), vec3(1.0, 0.45, 0.12), uIsLava);
          waterTint = mix(waterTint, vec3(0.75, 0.92, 1.0), uIsIce);
          // RED TIDE cheat blood-red water override
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.46, 0.03, 0.04), uRedTide * 0.88);
          waterTint = mix(waterTint, vec3(0.88, 0.12, 0.12), uRedTide);
          diffuseColor.rgb = mix(diffuseColor.rgb, waterTint, shimmer * 0.18);
          // Flowing magma glowing crust when uIsLava > 0.5
          if (uIsLava > 0.5) {
            float flow = sin(vWaterWorldPos.x * 0.48 + uTime * 0.9 + sin(vWaterWorldPos.z * 0.35 - uTime * 0.6));
            float vein = smoothstep(0.55, 0.95, flow);
            diffuseColor.rgb = mix(vec3(0.28, 0.07, 0.03), vec3(1.0, 0.52, 0.10), vein);
          }
          `
        )
        .replace(
          '#include <emissivemap_fragment>',
          `
          #include <emissivemap_fragment>
          vec3 viewDirW = normalize(cameraPosition - vWaterWorldPos);
          float fresnelW = pow(1.0 - max(dot(viewDirW, vec3(0.0, 1.0, 0.0)), 0.0), 3.2);
          vec3 fresnelCol = mix(vec3(0.36, 0.62, 0.80), vec3(0.92, 0.44, 0.12), uIsLava);
          fresnelCol = mix(fresnelCol, vec3(0.85, 0.14, 0.14), uRedTide);
          totalEmissiveRadiance += fresnelCol * fresnelW * mix(0.06, 0.11, uIsIce);
          `
        );
  };
  mat.customProgramCacheKey = () => `aom-water-v3-${effId}`;
  mat.needsUpdate = true;
  return { uniforms };
}

export interface TerrainShaderUniforms {
  uTime: { value: number };
  uWaterY: { value: number };
  uIsLava: { value: number };
}

/**
 * Upgrades the terrain MeshStandardMaterial with multi-texture procedural PBR
 * detail splatting (micro grass/sand/dust grain, rock cliff strata on steep slopes,
 * flowing volcanic magma glow on HadesLava areas, wet shoreline darkening, and
 * animated lapping coastal foam).
 */
export function upgradeTerrainMaterial(
  mat: THREE.MeshStandardMaterial,
  mapId: MapId,
  waterY = -0.68
): { uniforms: TerrainShaderUniforms } {
  const effId = resolveEffectiveMapId(mapId);
  const uniforms: TerrainShaderUniforms = {
    uTime: { value: 0 },
    uWaterY: { value: waterY },
    uIsLava: { value: effId === 'erebus' ? 1.0 : 0.0 },
  };

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uWaterY = uniforms.uWaterY;
    shader.uniforms.uIsLava = uniforms.uIsLava;

    shader.vertexShader =
      `
      varying vec3 vTerrainWorldPos;
      varying vec3 vTerrainWorldNorm;
      ` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vTerrainWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vTerrainWorldNorm = normalize(mat3(modelMatrix) * objectNormal);
        `
      );

    shader.fragmentShader =
      `
      uniform float uTime;
      uniform float uWaterY;
      uniform float uIsLava;
      varying vec3 vTerrainWorldPos;
      varying vec3 vTerrainWorldNorm;
      ` +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>
        // 1. Multi-scale procedural micro-detail splatting (dust/grass/sand grain)
        float microA = sin(vTerrainWorldPos.x * 2.4 + cos(vTerrainWorldPos.z * 2.1)) * 0.5 + 0.5;
        float microB = cos(vTerrainWorldPos.x * 5.7 - vTerrainWorldPos.z * 5.3) * 0.5 + 0.5;
        float macroVar = sin(vTerrainWorldPos.x * 0.19) * cos(vTerrainWorldPos.z * 0.21);
        diffuseColor.rgb *= (0.93 + microA * 0.08 + microB * 0.05 + macroVar * 0.04);

        // 2. Rock strata banding on steep cliffs (Cliffs layer)
        float cliffFactor = smoothstep(0.10, 0.34, 1.0 - clamp(vTerrainWorldNorm.y, 0.0, 1.0));
        float strata = sin(vTerrainWorldPos.y * 9.0 + vTerrainWorldPos.x * 0.45) * 0.5 + 0.5;
        vec3 rockTint = mix(vec3(0.32, 0.30, 0.28), vec3(0.56, 0.53, 0.48), strata);
        if (uIsLava > 0.5) {
          rockTint = mix(vec3(0.16, 0.12, 0.13), vec3(0.38, 0.20, 0.15), strata);
        }
        diffuseColor.rgb = mix(diffuseColor.rgb, rockTint, cliffFactor * 0.58);

        // 3. Flowing HadesLava glow on magma fissures (non-navigable volcanic terrain)
        float isMagmaVert = smoothstep(0.45, 0.72, diffuseColor.r - diffuseColor.b) * smoothstep(0.22, 0.48, diffuseColor.r - diffuseColor.g * 0.55);
        if (isMagmaVert > 0.05) {
          float magmaFlow = sin(vTerrainWorldPos.x * 0.65 + uTime * 1.45 + cos(vTerrainWorldPos.z * 0.58 - uTime * 0.9)) * 0.5 + 0.5;
          vec3 hotCore = mix(vec3(0.65, 0.12, 0.02), vec3(1.0, 0.62, 0.12), magmaFlow);
          diffuseColor.rgb = mix(diffuseColor.rgb, hotCore, isMagmaVert * 0.65);
        }

        // 4. Wet darkened beach band & animated shoreline coastal foam
        float heightAboveWater = vTerrainWorldPos.y - uWaterY;
        float wetBand = 1.0 - smoothstep(-0.08, 0.42, heightAboveWater);
        diffuseColor.rgb *= mix(1.0, 0.72, wetBand * (1.0 - uIsLava * 0.6));

        float wavePush = sin(uTime * 2.1 + vTerrainWorldPos.x * 0.42 + vTerrainWorldPos.z * 0.37) * 0.07;
        float foamDist = abs(heightAboveWater - (0.04 + wavePush));
        float foamMask = (1.0 - smoothstep(0.0, 0.13, foamDist)) * smoothstep(-0.22, -0.02, heightAboveWater);
        float foamBreakup = smoothstep(0.25, 0.78, sin(vTerrainWorldPos.x * 1.9 + uTime * 1.1) * cos(vTerrainWorldPos.z * 1.8 - uTime * 0.9) * 0.5 + 0.5);
        vec3 shoreAccent = mix(vec3(0.88, 0.95, 0.98), vec3(1.0, 0.42, 0.12), uIsLava);
        diffuseColor.rgb = mix(diffuseColor.rgb, shoreAccent, foamMask * (0.45 + 0.45 * foamBreakup));
        `
      );
  };
  mat.customProgramCacheKey = () => `aom-terrain-splat-v2-${effId}`;
  mat.needsUpdate = true;
  return { uniforms };
}

/**
 * Builds a single GPU-instanced biome ground foliage / shrub / stone tuft layer
 * so Normal, Large and Giant (264x264) maps stay lush at 60 FPS with 1 draw call.
 */
export function buildInstancedGroundDecor(
  mapId: MapId,
  worldSize: WorldSizeId,
  groundHeightFn: (x: number, z: number) => number,
  isSoftwareGl: boolean
): THREE.InstancedMesh {
  const spec = getWorldSizeSpec(worldSize);
  const effId = resolveEffectiveMapId(mapId);
  const isSnow = effId === 'tundra' || effId === 'ghost_lake' || effId === 'jotunheim';
  const isDesert = effId === 'nile' || effId === 'oasis' || effId === 'valley_of_the_kings' || effId === 'savannah';
  const isLava = effId === 'erebus';

  const geo = isSnow || isLava
    ? new THREE.DodecahedronGeometry(0.26, 0)
    : new THREE.ConeGeometry(0.22, 0.55, 5);
  geo.translate(0, 0.22, 0);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.02,
  });

  const targetCount = isSoftwareGl
    ? 140
    : worldSize === 'giant'
    ? 680
    : worldSize === 'large'
    ? 480
    : 320;

  const inst = new THREE.InstancedMesh(geo, mat, targetCount);
  inst.castShadow = false;
  inst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const limit = spec.playableHalfSize - 2;
  let placed = 0;

  for (let i = 0; i < targetCount * 3 && placed < targetCount; i++) {
    const rx = (hash2d(i * 1.37, 11.7) * 2 - 1) * limit;
    const rz = (hash2d(i * 2.91, 27.3) * 2 - 1) * limit;
    const y = groundHeightFn(rx, rz);
    if (y < -0.15 || y > 3.6) continue;

    dummy.position.set(rx, y - 0.04, rz);
    dummy.rotation.set(0, hash2d(i, 5.1) * Math.PI * 2, 0);
    const sc = 0.65 + hash2d(i, 8.9) * 0.95;
    dummy.scale.set(sc, sc * (0.8 + hash2d(i, 3.3) * 0.6), sc);
    dummy.updateMatrix();
    inst.setMatrixAt(placed, dummy.matrix);

    if (isLava) {
      color.setHex(i % 4 === 0 ? 0xc2410c : 0x3f3738);
    } else if (isSnow) {
      color.setHex(i % 3 === 0 ? 0xbcd4e6 : 0x738496);
    } else if (isDesert) {
      color.setHex(i % 3 === 0 ? 0xa6894b : 0x7a8a43);
    } else {
      color.setHex(i % 4 === 0 ? 0x5c7f3b : i % 2 === 0 ? 0x456930 : 0x6b8744);
    }
    inst.setColorAt(placed, color);
    placed++;
  }

  inst.count = placed;
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  return inst;
}
