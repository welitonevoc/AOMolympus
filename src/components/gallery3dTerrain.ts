import * as THREE from 'three';
import {
  ATMOSPHERIC_EMITTER_SPECS,
  AtmosphericEmitterKind,
  AtmosphericFxSystem,
  createTerrainRockMesh,
  RETOLD_TERRAIN_CATALOG,
  RetoldTerrainEntry,
  TERRAIN_ROCK_SPECS,
  TerrainCivBiome,
  TerrainRockKind,
} from '../textura/terreno';

export type TerrainGalleryFilter =
  | 'all'
  | 'rock_cliff'
  | 'magma'
  | 'dust_snow'
  | 'water'
  | 'rocks_3d'
  | 'fx';

export type TerrainGalleryKind = 'surface' | 'rock' | 'fx';

export interface GalleryTerrainItem {
  id: string;
  kind: TerrainGalleryKind;
  filterGroup: Exclude<TerrainGalleryFilter, 'all'>;
  name: string;
  subtitle: string;
  xsName: string;
  rmConstant: string;
  layerLabel: string;
  biomeLabel: string;
  swatchHex: number;
  swatchCss: string;
  passableLabel: string;
  buildableLabel: string;
  navigableLabel: string;
  desc: string;
  surfaceEntry?: RetoldTerrainEntry;
  rockKind?: TerrainRockKind;
  blocksPathing?: boolean;
  collisionRadius?: number;
  emitterKind?: AtmosphericEmitterKind;
}

export interface StudioTerrainHandle {
  group: THREE.Group;
  animate: (simTime: number, dt: number, fxEnabled: boolean) => void;
  dispose: () => void;
}

const CIV_BIOME_LABELS: Record<TerrainCivBiome, string> = {
  greek: 'Grego · Mediterrâneo',
  egyptian: 'Egípcio · Nilo & Deserto',
  norse: 'Nórdico · Midgard',
  atlantean: 'Atlante · Imperial',
  hades: 'Submundo · Hades / Tártaro',
  olympus: 'Monte Olimpo',
  campaign: 'Campanha / Universal',
};

function surfaceFilterGroup(entry: RetoldTerrainEntry): Exclude<TerrainGalleryFilter, 'all'> {
  if (entry.category === 'rock_cliff') return 'rock_cliff';
  if (entry.category === 'magma_underworld') return 'magma';
  if (entry.category === 'water') return 'water';
  return 'dust_snow';
}

const SURFACE_ITEMS: GalleryTerrainItem[] = RETOLD_TERRAIN_CATALOG.map((entry) => ({
  id: `surface:${entry.id}`,
  kind: 'surface',
  filterGroup: surfaceFilterGroup(entry),
  name: entry.label,
  subtitle: entry.xsName,
  xsName: entry.xsName,
  rmConstant: entry.rmConstant,
  layerLabel: 'Camada 1 · Pintura de Terreno',
  biomeLabel: CIV_BIOME_LABELS[entry.civBiome],
  swatchHex: entry.colorHex,
  swatchCss: entry.swatch,
  passableLabel: entry.passable ? 'Transitável (Tropas)' : 'Intransponível',
  buildableLabel: entry.buildable ? 'Construível' : 'Bloqueia Construções',
  navigableLabel: entry.navigableWater ? 'Navegável (Navios)' : 'Não Navegável',
  desc: entry.desc,
  surfaceEntry: entry,
}));

const ROCK_ITEMS: GalleryTerrainItem[] = (Object.keys(TERRAIN_ROCK_SPECS) as TerrainRockKind[]).map((rk) => {
  const spec = TERRAIN_ROCK_SPECS[rk];
  const colorMap: Record<TerrainRockKind, number> = {
    rock_granite_small: 0x878d96,
    rock_granite_large: 0x6b7280,
    basalt_pillar: 0x3f3a40,
    underworld_stalagmite: 0x9a3412,
    sandstone_mesa: 0xb4834e,
    olympus_marble_rock: 0xe7e1d3,
  };
  const hex = colorMap[rk];
  return {
    id: `rock:${rk}`,
    kind: 'rock',
    filterGroup: 'rocks_3d',
    name: spec.label,
    subtitle: spec.xsProto,
    xsName: spec.xsProto,
    rmConstant: `cUnit${spec.xsProto.replace(/\s+/g, '')}`,
    layerLabel: 'Camada 2 · Formação Rochosa 3D',
    biomeLabel:
      rk === 'underworld_stalagmite' || rk === 'basalt_pillar'
        ? 'Vulcânico · Submundo'
        : rk === 'sandstone_mesa'
        ? 'Egípcio · Deserto'
        : rk === 'olympus_marble_rock'
        ? 'Monte Olimpo'
        : 'Universal · Rochoso',
    swatchHex: hex,
    swatchCss: `#${hex.toString(16).padStart(6, '0')}`,
    passableLabel: spec.blocksPathing
      ? `Bloqueia Tropas (Raio ${spec.collisionRadius.toFixed(1)}u)`
      : 'Decorativo (Sem Colisão)',
    buildableLabel: spec.blocksPathing ? 'Bloqueia Construções' : 'Sobrepõe Solo',
    navigableLabel: 'Terrestre',
    desc: spec.desc,
    rockKind: rk,
    blocksPathing: spec.blocksPathing,
    collisionRadius: spec.collisionRadius,
  };
});

const FX_ITEMS: GalleryTerrainItem[] = (Object.keys(ATMOSPHERIC_EMITTER_SPECS) as AtmosphericEmitterKind[]).map(
  (ek) => {
    const spec = ATMOSPHERIC_EMITTER_SPECS[ek];
    const hex = spec.markerColorHex;
    return {
      id: `fx:${ek}`,
      kind: 'fx',
      filterGroup: 'fx',
      name: spec.label,
      subtitle: spec.xsProto,
      xsName: spec.xsProto,
      rmConstant: `cFx${spec.xsProto.replace(/^FX\s*/i, '').replace(/\s+/g, '')}`,
      layerLabel: 'Camada 2 · Emissor Atmosférico FX',
      biomeLabel:
        ek === 'magma_sparks' || ek === 'volcanic_smoke'
          ? 'Submundo · Vulcões'
          : ek === 'wind_dust'
          ? 'Deserto · Savana'
          : ek === 'low_mist'
          ? 'Pântanos · Geleiras'
          : 'Olimpo · Acrópole',
      swatchHex: hex,
      swatchCss: `#${hex.toString(16).padStart(6, '0')}`,
      passableLabel: 'Sem Colisão (Partículas)',
      buildableLabel: 'Atmosférico / Ambiental',
      navigableLabel: 'Dinâmico em Tempo Real',
      desc: spec.desc,
      emitterKind: ek,
    };
  }
);

export const GALLERY_TERRAIN_ITEMS: GalleryTerrainItem[] = [
  ...SURFACE_ITEMS,
  ...ROCK_ITEMS,
  ...FX_ITEMS,
];

function hash2d(x: number, z: number, seed: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

/**
 * Generates a detailed procedural albedo canvas texture tailored to each Retold terrain surface.
 */
function createSurfaceSwatchTexture(entry: RetoldTerrainEntry, redTide: boolean): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const baseColor = new THREE.Color(redTide && entry.navigableWater ? 0x7a0c12 : entry.colorHex);
  ctx.fillStyle = `#${baseColor.getHexString()}`;
  ctx.fillRect(0, 0, size, size);

  // Fine mineral grain
  for (let i = 0; i < 2400; i++) {
    const x = Math.floor(hash2d(i, 1, entry.terrainCode) * size);
    const y = Math.floor(hash2d(i, 2, entry.terrainCode) * size);
    const r = 1 + hash2d(i, 3, entry.terrainCode) * 2.5;
    const bright = hash2d(i, 4, entry.terrainCode) > 0.5;
    ctx.fillStyle = bright ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, y, r, r);
  }

  if (entry.id === 'greek_road' || entry.id === 'atlantean_cobble') {
    // Interlocking flagstones
    const rows = 8;
    const cols = 8;
    const cw = size / cols;
    const ch = size / rows;
    ctx.strokeStyle = 'rgba(25, 22, 18, 0.45)';
    ctx.lineWidth = 2;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * (cw * 0.5);
      for (let c = -1; c <= cols; c++) {
        const shade = (hash2d(c, r, 11) - 0.5) * 28;
        const rr = Math.min(255, Math.max(0, Math.round(baseColor.r * 255 + shade)));
        const gg = Math.min(255, Math.max(0, Math.round(baseColor.g * 255 + shade)));
        const bb = Math.min(255, Math.max(0, Math.round(baseColor.b * 255 + shade)));
        ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
        ctx.fillRect(c * cw + off + 1.5, r * ch + 1.5, cw - 3, ch - 3);
        ctx.strokeRect(c * cw + off + 1.5, r * ch + 1.5, cw - 3, ch - 3);
      }
    }
  } else if (entry.id === 'olympus_marble') {
    // Sacred white marble slabs with gold trim and subtle veining
    const tile = size / 4;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
    ctx.lineWidth = 2;
    for (let y = 0; y < size; y += tile) {
      for (let x = 0; x < size; x += tile) {
        ctx.strokeRect(x + 2, y + 2, tile - 4, tile - 4);
      }
    }
    ctx.strokeStyle = 'rgba(160, 152, 140, 0.28)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      let vx = hash2d(i, 1, 91) * size;
      let vy = hash2d(i, 2, 91) * size;
      ctx.moveTo(vx, vy);
      for (let s = 0; s < 6; s++) {
        vx += (hash2d(i, s + 3, 91) - 0.35) * 32;
        vy += (hash2d(i, s + 9, 91) - 0.4) * 26;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }
  } else if (entry.id === 'hades_lava') {
    // Dark cooled volcanic crust with incandescent magma rivers
    ctx.fillStyle = '#241414';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 18; i++) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#ff3b00');
      grad.addColorStop(0.5, '#ff8811');
      grad.addColorStop(1, '#ffe066');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4 + hash2d(i, 5, 33) * 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      let lx = hash2d(i, 1, 33) * size;
      let ly = 0;
      ctx.moveTo(lx, ly);
      for (let s = 1; s <= 6; s++) {
        lx += (hash2d(i, s + 2, 33) - 0.5) * 60;
        ly = (s / 6) * size;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
  } else if (entry.id === 'norse_cliff' || entry.id === 'hades_cliff' || entry.id === 'egyptian_rock') {
    // Stratified geological rock layers
    for (let y = 0; y < size; y += 10) {
      const alpha = 0.08 + hash2d(y, 1, 44) * 0.16;
      ctx.fillStyle = hash2d(y, 2, 44) > 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha * 0.55})`;
      ctx.fillRect(0, y, size, 4 + hash2d(y, 3, 44) * 5);
    }
  } else if (entry.id === 'egyptian_sand' || entry.id === 'desert_dust' || entry.id === 'savannah') {
    // Wind-blown sand ripples
    ctx.strokeStyle = 'rgba(255, 240, 200, 0.18)';
    ctx.lineWidth = 3;
    for (let y = 8; y < size; y += 14) {
      ctx.beginPath();
      for (let x = 0; x <= size; x += 12) {
        const wy = y + Math.sin(x * 0.06 + y * 0.1) * 4;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }
  } else if (entry.id === 'hades_ash' || entry.id === 'charred_dirt') {
    // Cracked charred earth & faint embers
    ctx.strokeStyle = 'rgba(12, 8, 8, 0.55)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      const sx = hash2d(i, 1, 55) * size;
      const sy = hash2d(i, 2, 55) * size;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (hash2d(i, 3, 55) - 0.5) * 46, sy + (hash2d(i, 4, 55) - 0.5) * 46);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 102, 26, 0.72)';
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.arc(hash2d(i, 5, 55) * size, hash2d(i, 6, 55) * size, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (entry.id === 'ice' || entry.id === 'norse_snow') {
    // Glacial sheen & fracture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      const x1 = hash2d(i, 1, 77) * size;
      const y1 = hash2d(i, 2, 77) * size;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + (hash2d(i, 3, 77) - 0.5) * 75, y1 + (hash2d(i, 4, 77) - 0.5) * 75);
      ctx.stroke();
    }
  } else if (entry.id === 'marsh') {
    // Muddy puddles and mossy clumps
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(30, 52, 42, 0.45)' : 'rgba(92, 118, 56, 0.35)';
      ctx.beginPath();
      ctx.ellipse(
        hash2d(i, 1, 88) * size,
        hash2d(i, 2, 88) * size,
        14 + hash2d(i, 3, 88) * 24,
        10 + hash2d(i, 4, 88) * 18,
        hash2d(i, 5, 88) * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Builds an interactive 3D showcase diorama for any Terrain Gallery item:
 * - Surface: sculpted 3D geological cross-section slab with live magma/water shaders & details
 * - Rock: genuine 3D rock formation mesh + passable/blocking collision footprint ring
 * - FX: matching biome plinth + live animated AtmosphericFxSystem particles
 */
export function buildTerrainGalleryMesh(
  item: GalleryTerrainItem,
  options: {
    showWireframe?: boolean;
    variantSeed?: number;
    redTide?: boolean;
    castShadows?: boolean;
  } = {}
): StudioTerrainHandle {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const seed = options.variantSeed ?? 0;
  const castShadows = options.castShadows ?? true;
  const showWireframe = Boolean(options.showWireframe);
  const redTide = Boolean(options.redTide);

  let fxSystem: AtmosphericFxSystem | null = null;
  let waterPlane: THREE.Mesh | null = null;
  let waterPosAttr: THREE.BufferAttribute | null = null;
  let waterBaseY: Float32Array | null = null;
  let lavaMat: THREE.MeshStandardMaterial | null = null;
  let lavaTex: THREE.CanvasTexture | null = null;
  let lavaLight: THREE.PointLight | null = null;

  // ── CASE 1: SURFACE TERRAIN SLAB (Layer 1) ──
  if (item.kind === 'surface' && item.surfaceEntry) {
    const entry = item.surfaceEntry;
    const slabW = 4.6;
    const slabD = 4.6;
    const segs = 36;

    // Geological bedrock pedestal underneath the terrain surface
    const skirtGeo = new THREE.BoxGeometry(slabW, 0.72, slabD);
    const skirtColor =
      entry.category === 'magma_underworld'
        ? 0x1e1416
        : entry.civBiome === 'olympus'
        ? 0x9c9282
        : entry.civBiome === 'egyptian'
        ? 0x5c4630
        : 0x2a241e;
    const skirtMat = new THREE.MeshStandardMaterial({
      color: skirtColor,
      roughness: 0.9,
      metalness: 0.08,
    });
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.position.y = 0.36;
    skirt.receiveShadow = true;
    skirt.castShadow = castShadows;
    group.add(skirt);
    disposables.push(skirtGeo, skirtMat);

    // Sculpted top terrain surface
    const topGeo = new THREE.PlaneGeometry(slabW, slabD, segs, segs);
    topGeo.rotateX(-Math.PI / 2);
    const pos = topGeo.attributes.position as THREE.BufferAttribute;

    const isCliff = entry.id === 'norse_cliff' || entry.id === 'hades_cliff';
    const isLava = entry.id === 'hades_lava';
    const isWater = entry.navigableWater;
    const isFlatMarble = entry.id === 'olympus_marble' || entry.id === 'greek_road' || entry.id === 'atlantean_cobble';

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      let y = 0.74;

      if (isCliff) {
        // Stepped dramatic cliff escarpment rising diagonally
        const t = THREE.MathUtils.clamp((x + z * 0.65 + 2.4) / 4.2, 0, 1);
        const ridge = Math.pow(t, 1.35) * 1.95;
        const crag =
          Math.sin(x * 2.6 + seed) * Math.cos(z * 2.4 - seed) * 0.16 +
          Math.sin((x - z) * 4.5) * 0.07;
        y += ridge + crag;
      } else if (isLava) {
        // Raised obsidian banks around a sunken glowing magma channel
        const distFromChannel = Math.abs(x + Math.sin(z * 0.9 + seed) * 0.55);
        const bank = THREE.MathUtils.smoothstep(distFromChannel, 0.75, 1.85);
        y += -0.18 + bank * 0.58 + Math.sin(x * 3.1 + z * 2.3) * 0.05;
      } else if (isWater) {
        // Submerged seabed basin
        const edge = Math.max(Math.abs(x), Math.abs(z)) / (slabW * 0.5);
        const rim = THREE.MathUtils.smoothstep(edge, 0.72, 1.0);
        const depth = entry.id === 'deep_water' ? -0.45 : -0.18;
        y += depth + rim * 0.42 + Math.sin(x * 2.2 + seed) * Math.cos(z * 2.2) * 0.04;
      } else if (isFlatMarble) {
        y += 0.04 + Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.015;
      } else {
        // Gentle dunes / snow drifts / natural undulations
        const amp = entry.id === 'norse_snow' || entry.id === 'egyptian_sand' ? 0.24 : 0.14;
        y +=
          Math.sin(x * 1.2 + seed * 1.1) * Math.cos(z * 1.1 - seed * 0.7) * amp +
          Math.sin(x * 2.9 - z * 2.2) * (amp * 0.28);
      }

      pos.setY(i, y);
    }
    topGeo.computeVertexNormals();

    const surfaceTex = createSurfaceSwatchTexture(entry, redTide);
    disposables.push(surfaceTex);

    const topMat = new THREE.MeshStandardMaterial({
      map: surfaceTex,
      roughness:
        entry.id === 'ice'
          ? 0.18
          : entry.id === 'olympus_marble'
          ? 0.34
          : entry.id === 'hades_lava'
          ? 0.45
          : 0.86,
      metalness: entry.id === 'ice' ? 0.22 : entry.id === 'olympus_marble' ? 0.12 : 0.06,
      emissive: isLava ? new THREE.Color(0xff4a08) : new THREE.Color(0x000000),
      emissiveMap: isLava ? surfaceTex : null,
      emissiveIntensity: isLava ? 1.45 : 0,
      wireframe: showWireframe,
    });

    if (isLava) {
      lavaMat = topMat;
      lavaTex = surfaceTex;
      lavaLight = new THREE.PointLight(0xff5e1a, 2.2, 8);
      lavaLight.position.set(0, 1.6, 0);
      group.add(lavaLight);

      // Live sparks rising over magma channel
      fxSystem = new AtmosphericFxSystem(group);
      fxSystem.addEmitter('magma_sparks', 0, 0.72, 0, 0.65);
    }

    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.receiveShadow = true;
    topMesh.castShadow = castShadows;
    group.add(topMesh);
    disposables.push(topGeo, topMat);

    // Translucent animated water sheet for water / marsh entries
    if (isWater || entry.id === 'marsh') {
      const wGeo = new THREE.PlaneGeometry(slabW - 0.12, slabD - 0.12, 24, 24);
      wGeo.rotateX(-Math.PI / 2);
      waterPosAttr = wGeo.attributes.position as THREE.BufferAttribute;
      waterBaseY = new Float32Array(waterPosAttr.count);
      const waterLevel = entry.id === 'marsh' ? 0.77 : entry.id === 'shallow_water' ? 0.82 : 0.88;
      for (let i = 0; i < waterPosAttr.count; i++) {
        waterBaseY[i] = waterLevel;
        waterPosAttr.setY(i, waterLevel);
      }
      const wColor =
        redTide && isWater
          ? 0x8f0d14
          : entry.id === 'marsh'
          ? 0x3b4d30
          : entry.id === 'shallow_water'
          ? 0x38bdf8
          : 0x0e5c8a;
      const wMat = new THREE.MeshStandardMaterial({
        color: wColor,
        roughness: 0.16,
        metalness: 0.28,
        transparent: true,
        opacity: entry.id === 'marsh' ? 0.52 : entry.id === 'shallow_water' ? 0.68 : 0.82,
        emissive: redTide && isWater ? new THREE.Color(0x4a0508) : new THREE.Color(0x061b2a),
        emissiveIntensity: redTide && isWater ? 0.35 : 0.14,
      });
      waterPlane = new THREE.Mesh(wGeo, wMat);
      waterPlane.receiveShadow = true;
      group.add(waterPlane);
      disposables.push(wGeo, wMat);
    }

    // Contextual surface accents (scattered boulders on NorseGrassRocks2, obsidian spires on HadesCliff, marble trim)
    if (entry.id === 'norse_grass_rocks' || entry.id === 'hades_cliff' || entry.id === 'egyptian_rock') {
      const rk: TerrainRockKind =
        entry.id === 'hades_cliff'
          ? 'underworld_stalagmite'
          : entry.id === 'egyptian_rock'
          ? 'sandstone_mesa'
          : 'rock_granite_small';
      const accentRock = createTerrainRockMesh(rk, castShadows, seed + 1);
      accentRock.scale.setScalar(entry.id === 'norse_grass_rocks' ? 0.85 : 0.45);
      accentRock.position.set(0.95, isCliff ? 1.55 : 0.78, -0.7);
      group.add(accentRock);
    } else if (entry.id === 'olympus_marble') {
      const plinthGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.55, 16);
      const plinthMat = new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.35, metalness: 0.1 });
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.set(-1.35, 1.04, -1.2);
      plinth.castShadow = castShadows;
      group.add(plinth);
      disposables.push(plinthGeo, plinthMat);
    }
  }

  // ── CASE 2: 3D ROCK FORMATIONS (Layer 2A) ──
  else if (item.kind === 'rock' && item.rockKind) {
    const rockSpec = TERRAIN_ROCK_SPECS[item.rockKind];

    // Natural soil/stone plinth disc
    const baseGeo = new THREE.CylinderGeometry(2.65, 2.85, 0.28, 36);
    const baseColor =
      item.rockKind === 'underworld_stalagmite' || item.rockKind === 'basalt_pillar'
        ? 0x2c2224
        : item.rockKind === 'sandstone_mesa'
        ? 0x9e7d52
        : item.rockKind === 'olympus_marble_rock'
        ? 0xd9d2c4
        : 0x4b5548;
    const baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.9, metalness: 0.05 });
    const baseDisc = new THREE.Mesh(baseGeo, baseMat);
    baseDisc.position.y = 0.14;
    baseDisc.receiveShadow = true;
    group.add(baseDisc);
    disposables.push(baseGeo, baseMat);

    // Real 3D rock formation mesh from src/textura/terreno
    const rockMesh = createTerrainRockMesh(item.rockKind, castShadows, seed + 1);
    rockMesh.position.y = 0.28;
    if (showWireframe) {
      rockMesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m && 'wireframe' in m) m.wireframe = true;
        }
      });
    }
    group.add(rockMesh);

    // Visual collision footprint ring (Red/Orange = Blocking Obstacle, Emerald = Decorative Passable)
    const ringRadius = rockSpec.blocksPathing ? Math.max(1.2, rockSpec.collisionRadius) : 1.15;
    const ringGeo = new THREE.RingGeometry(ringRadius - 0.07, ringRadius + 0.05, 42);
    const ringMat = new THREE.MeshBasicMaterial({
      color: rockSpec.blocksPathing ? 0xf97316 : 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.3;
    group.add(ring);
    disposables.push(ringGeo, ringMat);

    if (item.rockKind === 'underworld_stalagmite') {
      fxSystem = new AtmosphericFxSystem(group);
      fxSystem.addEmitter('magma_sparks', 0, 0.35, 0, 0.55);
    }
  }

  // ── CASE 3: ATMOSPHERIC FX EMITTERS (Layer 2B) ──
  else if (item.kind === 'fx' && item.emitterKind) {
    const ek = item.emitterKind;
    const slabColor =
      ek === 'magma_sparks' || ek === 'volcanic_smoke'
        ? 0x2d2324
        : ek === 'wind_dust'
        ? 0xb89660
        : ek === 'low_mist'
        ? 0x3c4d4a
        : 0xd9d2c2;

    const baseGeo = new THREE.CylinderGeometry(2.7, 2.95, 0.32, 36);
    const baseMat = new THREE.MeshStandardMaterial({ color: slabColor, roughness: 0.88, metalness: 0.08 });
    const baseDisc = new THREE.Mesh(baseGeo, baseMat);
    baseDisc.position.y = 0.16;
    baseDisc.receiveShadow = true;
    group.add(baseDisc);
    disposables.push(baseGeo, baseMat);

    // Subtle emitter origin marker ring
    const ringGeo = new THREE.RingGeometry(0.65, 0.82, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: item.swatchHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.34;
    group.add(ring);
    disposables.push(ringGeo, ringMat);

    // Contextual rock prop beside emitter so particles have rich depth reference
    if (ek === 'magma_sparks' || ek === 'volcanic_smoke') {
      const ventRock = createTerrainRockMesh('basalt_pillar', castShadows, 2);
      ventRock.scale.setScalar(0.55);
      ventRock.position.set(1.15, 0.32, -0.75);
      group.add(ventRock);
    } else if (ek === 'wind_dust') {
      const mesa = createTerrainRockMesh('sandstone_mesa', castShadows, 1);
      mesa.scale.setScalar(0.45);
      mesa.position.set(-1.1, 0.32, -0.65);
      group.add(mesa);
    }

    // Live animated particle system mounted inside this studio group
    fxSystem = new AtmosphericFxSystem(group);
    fxSystem.addEmitter(ek, 0, 0.36, 0, ek === 'sunbeams' ? 0.45 : 0.88);
  }

  return {
    group,
    animate: (simTime: number, dt: number, fxEnabled: boolean) => {
      if (fxSystem) {
        fxSystem.setMistVisible(fxEnabled);
        if (fxEnabled) {
          fxSystem.update(dt);
        }
      }
      if (lavaTex && lavaMat && fxEnabled) {
        lavaTex.offset.y = (simTime * 0.09) % 1;
        lavaTex.offset.x = Math.sin(simTime * 0.4) * 0.04;
        lavaMat.emissiveIntensity = 1.25 + Math.sin(simTime * 3.2) * 0.35;
        if (lavaLight) {
          lavaLight.intensity = 2.0 + Math.sin(simTime * 3.8) * 0.55;
        }
      }
      if (waterPlane && waterPosAttr && waterBaseY && fxEnabled) {
        for (let i = 0; i < waterPosAttr.count; i++) {
          const x = waterPosAttr.getX(i);
          const z = waterPosAttr.getZ(i);
          const wave = Math.sin(simTime * 2.2 + x * 1.45) * Math.cos(simTime * 1.7 + z * 1.35) * 0.032;
          waterPosAttr.setY(i, waterBaseY[i] + wave);
        }
        waterPosAttr.needsUpdate = true;
      }
    },
    dispose: () => {
      fxSystem?.clear();
      for (const d of disposables) {
        d.dispose();
      }
    },
  };
}
