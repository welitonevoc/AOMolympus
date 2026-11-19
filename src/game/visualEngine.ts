import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { MapId, WorldSizeId } from './types';
import { getWorldSizeSpec, resolveEffectiveMapId } from '../maps';

const _v3A = new THREE.Vector3();
const _v3B = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _color = new THREE.Color();

export interface VisualParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  lifetime: number;
  startScale: number;
  endScale: number;
  gravity: number;
  flatOnGround: boolean;
  colorHex: number;
}

export interface CorpseAnimEntry {
  mesh: THREE.Group;
  baseY: number;
  baseRotY: number;
  fallDir: number;
  age: number;
  duration: number;
  isMythicOrHero: boolean;
  isNaval: boolean;
}

export interface SlashArcEntry {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  age: number;
  lifetime: number;
  startYaw: number;
  sweepDir: number;
}

export interface FloatingPopupEntry {
  sprite: THREE.Sprite;
  mat: THREE.SpriteMaterial;
  tex: THREE.CanvasTexture;
  age: number;
  lifetime: number;
  vy: number;
}

export interface BuildingDebrisEntry {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  groundY: number;
  age: number;
  lifetime: number;
}

export {
  buildInstancedGroundDecor,
  createTerrainNormalTexture,
  createTerrainRoughnessTexture,
  upgradeTerrainMaterial,
  upgradeWaterMaterial,
} from '../textura/terreno';

/**
 * Adds gentle GPU vertex wind sway to shared foliage materials.
 */
export function attachWindSwayShader(
  mat: THREE.MeshStandardMaterial
): { uTime: { value: number } } {
  const uTime = { value: 0 };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = uTime;
    shader.vertexShader =
      `
      uniform float uWindTime;
      ` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vec4 wLeaf = modelMatrix * vec4(transformed, 1.0);
        float swayMask = clamp((transformed.y - 0.8) * 0.35, 0.0, 1.0);
        float gust = sin(uWindTime * 1.65 + wLeaf.x * 0.38 + wLeaf.z * 0.31) * 0.09
                   + cos(uWindTime * 2.85 + wLeaf.x * 0.82) * 0.035;
        transformed.x += gust * swayMask;
        transformed.z += gust * 0.55 * swayMask;
        `
      );
  };
  mat.customProgramCacheKey = () => 'aom-foliage-wind-v1';
  mat.needsUpdate = true;
  return { uTime };
}

// Terrain shader splatting & instanced ground decor migrated to src/textura/terreno/terrainShaders.ts

export class VisualEffectsManager {
  private scene: THREE.Scene;
  private isSoftwareGl: boolean;

  // Post-processing (hardware GPU only)
  private composer: EffectComposer | null = null;
  private renderPass: RenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;

  // Pooled GPU instanced particles (dust, sparks, wakes, embers, heal, magic)
  private readonly maxParticles = 380;
  private particlePool: VisualParticle[] = [];
  private particleMesh: THREE.InstancedMesh;

  // Ambient soaring birds
  private readonly birdCount = 16;
  private birdMesh: THREE.InstancedMesh;
  private birdStates: Array<{
    cx: number;
    cz: number;
    radius: number;
    speed: number;
    phase: number;
    height: number;
  }> = [];

  // Ambient floating biome motes (pollen, fireflies, snow sparkles, ash)
  private biomeMotes: THREE.Points | null = null;
  private biomeMotesMat: THREE.PointsMaterial | null = null;
  private currentBiomeMap: MapId = 'mediterranean';

  // Dying unit ragdoll / ascension list
  private corpses: CorpseAnimEntry[] = [];

  // Weapon melee slash arcs
  private slashArcs: SlashArcEntry[] = [];
  private slashGeo: THREE.RingGeometry;

  // Floating combat/resource popups
  private popups: FloatingPopupEntry[] = [];
  private readonly maxPopups = 14;

  // Pooled dynamic night torch PointLights (nearest active constructed buildings)
  private nightLights: THREE.PointLight[] = [];

  // Shared scaffolding geometries & materials
  private scaffoldWoodMat: THREE.MeshStandardMaterial;
  private scaffoldPoleGeo: THREE.CylinderGeometry;
  private scaffoldBeamGeo: THREE.BoxGeometry;

  // Physical collapsing building debris chunks
  private debrisChunks: BuildingDebrisEntry[] = [];
  private debrisGeo: THREE.BoxGeometry;
  private debrisStoneMat: THREE.MeshStandardMaterial;
  private debrisTimberMat: THREE.MeshStandardMaterial;
  private damageSmokeTimer = 0;

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
    isSoftwareGl: boolean
  ) {
    this.scene = scene;
    this.isSoftwareGl = isSoftwareGl;

    // 1. Setup selective-threshold Bloom + ACES OutputPass on hardware GPUs
    if (!isSoftwareGl) {
      const w = renderer.domElement.clientWidth || window.innerWidth;
      const h = Math.max(1, renderer.domElement.clientHeight || window.innerHeight);
      this.composer = new EffectComposer(renderer);
      this.composer.setPixelRatio(renderer.getPixelRatio());
      this.composer.setSize(w, h);

      this.renderPass = new RenderPass(scene, camera);
      this.composer.addPass(this.renderPass);

      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(Math.max(1, Math.floor(w / 2)), Math.max(1, Math.floor(h / 2))),
        0.38, // subtle epic glow strength
        0.46, // smooth bloom radius
        0.93  // high threshold so only emissive magic/fire/gold highlights bloom
      );
      this.composer.addPass(this.bloomPass);
      this.composer.addPass(new OutputPass());
    }

    // 2. Initialize instanced particle pool (zero per-frame allocations)
    const partGeo = new THREE.DodecahedronGeometry(0.22, 0);
    const partMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    this.particleMesh = new THREE.InstancedMesh(partGeo, partMat, this.maxParticles);
    this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.particleMesh.frustumCulled = false;
    this.particleMesh.renderOrder = 6;
    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePool.push({
        active: false,
        x: 0,
        y: -99,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        age: 0,
        lifetime: 1,
        startScale: 1,
        endScale: 0,
        gravity: 0,
        flatOnGround: false,
        colorHex: 0xffffff,
      });
      _mat4.makeScale(0, 0, 0);
      this.particleMesh.setMatrixAt(i, _mat4);
      this.particleMesh.setColorAt(i, _color.setHex(0xffffff));
    }
    this.particleMesh.count = 0;
    this.scene.add(this.particleMesh);

    // 3. Initialize soaring ambient birds (high-altitude life)
    const birdShape = new THREE.BufferGeometry();
    const birdVerts = new Float32Array([
      // Left wing
      0, 0, 0.25, -0.85, 0.14, -0.15, 0, 0, -0.18,
      // Right wing
      0, 0, 0.25, 0, 0, -0.18, 0.85, 0.14, -0.15,
    ]);
    birdShape.setAttribute('position', new THREE.BufferAttribute(birdVerts, 3));
    birdShape.computeVertexNormals();
    const birdMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
    });
    this.birdMesh = new THREE.InstancedMesh(birdShape, birdMat, this.birdCount);
    this.birdMesh.frustumCulled = false;
    for (let i = 0; i < this.birdCount; i++) {
      const st = {
        cx: ((i * 37) % 70) - 35,
        cz: ((i * 53) % 70) - 35,
        radius: 10 + (i % 5) * 4.5,
        speed: 0.26 + (i % 4) * 0.06,
        phase: (i / this.birdCount) * Math.PI * 2,
        height: 15 + (i % 4) * 2.5,
      };
      this.birdStates.push(st);
    }
    this.scene.add(this.birdMesh);

    // 4. Shared melee slash wedge geometry
    this.slashGeo = new THREE.RingGeometry(0.55, 1.18, 12, 1, -Math.PI * 0.42, Math.PI * 0.84);
    this.slashGeo.rotateX(-Math.PI / 2);

    // 5. Night building warm PointLights (max 4 active around camera)
    if (!isSoftwareGl) {
      for (let i = 0; i < 4; i++) {
        const pl = new THREE.PointLight(0xff9b3d, 0, 14, 1.8);
        pl.visible = false;
        this.scene.add(pl);
        this.nightLights.push(pl);
      }
    }

    // 6. Scaffolding shared timber geometries
    this.scaffoldWoodMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.88,
      metalness: 0.02,
    });
    this.scaffoldPoleGeo = new THREE.CylinderGeometry(0.08, 0.1, 1, 6);
    this.scaffoldBeamGeo = new THREE.BoxGeometry(1, 0.09, 0.09);

    // 7. Demolition debris shared geometry & materials
    this.debrisGeo = new THREE.BoxGeometry(0.45, 0.34, 0.42);
    this.debrisStoneMat = new THREE.MeshStandardMaterial({ color: 0x8f887a, roughness: 0.92, metalness: 0.05 });
    this.debrisTimberMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9, metalness: 0.02 });

    this.rebuildBiomeMotes('mediterranean');
  }

  public rebuildBiomeMotes(mapId: MapId) {
    this.currentBiomeMap = mapId;
    if (this.biomeMotes) {
      this.scene.remove(this.biomeMotes);
      this.biomeMotes.geometry.dispose();
      this.biomeMotesMat?.dispose();
      this.biomeMotes = null;
      this.biomeMotesMat = null;
    }

    const effId = resolveEffectiveMapId(mapId);
    const count = this.isSoftwareGl ? 60 : 150;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 116;
      positions[i * 3 + 1] = 0.8 + Math.random() * 8.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 116;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const colorHex =
      effId === 'erebus'
        ? 0xf97316
        : effId === 'tundra' || effId === 'midgard'
        ? 0xe0f2fe
        : effId === 'nile' || effId === 'oasis'
        ? 0xfde68a
        : 0xfef08a;

    this.biomeMotesMat = new THREE.PointsMaterial({
      color: colorHex,
      size: effId === 'erebus' ? 0.34 : 0.26,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.biomeMotes = new THREE.Points(geo, this.biomeMotesMat);
    this.biomeMotes.frustumCulled = false;
    this.biomeMotes.renderOrder = 6;
    this.scene.add(this.biomeMotes);

    // Customize ambient soaring birds per biome (gaivotas, corvos, abutres, falcões)
    const birdMat = this.birdMesh.material as THREE.MeshBasicMaterial;
    const isNordicRaven =
      effId === 'tundra' || effId === 'jotunheim' || effId === 'midgard' || effId === 'vinlandsaga' || effId === 'ghost_lake';
    const isDesertVulture =
      effId === 'nile' || effId === 'oasis' || effId === 'savannah' || effId === 'watering_hole';
    const isErebusBird = effId === 'erebus';
    birdMat.color.setHex(
      isErebusBird ? 0x7c2d12 : isNordicRaven ? 0x1e293b : isDesertVulture ? 0x5c3c24 : 0xf8fafc
    );
    for (let i = 0; i < this.birdCount; i++) {
      this.birdStates[i].speed = isDesertVulture ? 0.19 + (i % 4) * 0.04 : 0.26 + (i % 4) * 0.06;
      this.birdStates[i].height = isErebusBird ? 17 + (i % 4) * 2.5 : 14.5 + (i % 4) * 2.4;
    }
  }

  public setCamera(camera: THREE.Camera) {
    if (this.renderPass) {
      this.renderPass.camera = camera;
    }
  }

  public resize(width: number, height: number, pixelRatio: number) {
    if (!this.composer) return;
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    if (this.bloomPass) {
      this.bloomPass.resolution.set(
        Math.max(1, Math.floor(width / 2)),
        Math.max(1, Math.floor(height / 2))
      );
    }
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    if (this.composer && !this.isSoftwareGl) {
      if (this.renderPass) this.renderPass.camera = camera;
      this.composer.render();
    } else {
      renderer.render(this.scene, camera);
    }
  }

  /**
   * Keeps the directional sun shadow frustum centered around camTarget
   * (snapped to shadow texels to prevent shadow edge swimming).
   */
  public updateShadowFrustumFollow(
    sunLight: THREE.DirectionalLight,
    camTarget: THREE.Vector3,
    sunOffset: THREE.Vector3
  ) {
    if (this.isSoftwareGl || !sunLight.castShadow) return;
    const frustumHalf = 46;
    const shadowRes = sunLight.shadow.mapSize.width || 2048;
    const texelWorld = (frustumHalf * 2) / shadowRes;

    const snappedX = Math.round(camTarget.x / texelWorld) * texelWorld;
    const snappedZ = Math.round(camTarget.z / texelWorld) * texelWorld;

    sunLight.target.position.set(snappedX, 0, snappedZ);
    sunLight.position.set(
      snappedX + sunOffset.x,
      sunOffset.y,
      snappedZ + sunOffset.z
    );
    sunLight.target.updateMatrixWorld();

    if (sunLight.shadow.camera.right !== frustumHalf) {
      sunLight.shadow.camera.left = -frustumHalf;
      sunLight.shadow.camera.right = frustumHalf;
      sunLight.shadow.camera.top = frustumHalf;
      sunLight.shadow.camera.bottom = -frustumHalf;
      sunLight.shadow.camera.updateProjectionMatrix();
    }
  }

  public spawnParticles(
    x: number,
    y: number,
    z: number,
    count: number,
    opts: {
      colorHex: number;
      speed?: number;
      upSpeed?: number;
      lifetime?: number;
      startScale?: number;
      endScale?: number;
      gravity?: number;
      spread?: number;
      flatOnGround?: boolean;
    }
  ) {
    const speed = opts.speed ?? 2.2;
    const upSpeed = opts.upSpeed ?? 2.0;
    const lifetime = opts.lifetime ?? 0.65;
    const startScale = opts.startScale ?? 0.65;
    const endScale = opts.endScale ?? 0.05;
    const gravity = opts.gravity ?? 5.5;
    const spread = opts.spread ?? 0.45;
    const flatOnGround = Boolean(opts.flatOnGround);

    let spawned = 0;
    for (let i = 0; i < this.maxParticles && spawned < count; i++) {
      const p = this.particlePool[i];
      if (p.active) continue;
      const ang = Math.random() * Math.PI * 2;
      const spd = speed * (0.45 + Math.random() * 0.65);
      p.active = true;
      p.x = x + (Math.random() - 0.5) * spread;
      p.y = y + (flatOnGround ? 0.05 : Math.random() * 0.35);
      p.z = z + (Math.random() - 0.5) * spread;
      p.vx = Math.cos(ang) * spd;
      p.vy = upSpeed * (0.6 + Math.random() * 0.6);
      p.vz = Math.sin(ang) * spd;
      p.age = 0;
      p.lifetime = lifetime * (0.8 + Math.random() * 0.4);
      p.startScale = startScale;
      p.endScale = endScale;
      p.gravity = gravity;
      p.flatOnGround = flatOnGround;
      p.colorHex = opts.colorHex;
      spawned++;
    }
  }

  public spawnWaterWake(x: number, z: number, yaw: number) {
    // Emit two subtle expanding foam trails behind a moving ship's stern
    const backX = x - Math.sin(yaw) * 1.4;
    const backZ = z - Math.cos(yaw) * 1.4;
    const sideX = Math.cos(yaw) * 0.42;
    const sideZ = -Math.sin(yaw) * 0.42;
    for (const s of [-1, 1]) {
      this.spawnParticles(backX + sideX * s, -0.35, backZ + sideZ * s, 1, {
        colorHex: 0xe0f2fe,
        speed: 0.4,
        upSpeed: 0.05,
        lifetime: 0.75,
        startScale: 0.55,
        endScale: 1.65,
        gravity: 0,
        spread: 0.12,
        flatOnGround: true,
      });
    }
  }

  public spawnSlashArc(pos: THREE.Vector3, yaw: number, colorHex = 0xfef08a, scale = 1.0) {
    if (this.slashArcs.length >= 24) return;
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(this.slashGeo, mat);
    mesh.position.set(pos.x, pos.y + 0.95, pos.z);
    mesh.scale.setScalar(scale);
    mesh.rotation.y = yaw - 0.55;
    mesh.rotation.z = (Math.random() - 0.5) * 0.35;
    mesh.renderOrder = 6;
    this.scene.add(mesh);
    this.slashArcs.push({
      mesh,
      mat,
      age: 0,
      lifetime: 0.21,
      startYaw: yaw - 0.55,
      sweepDir: Math.random() > 0.5 ? 1 : -1,
    });
  }

  public spawnUnitDeathVisual(
    mesh: THREE.Group,
    groundY: number,
    isMythicOrHero: boolean,
    isNaval: boolean
  ) {
    // Detach any selection rings / health bars so corpses look clean on the battlefield
    if (mesh.userData.selectionRing) mesh.userData.selectionRing.visible = false;
    if (mesh.userData.hpBarGroup) mesh.userData.hpBarGroup.visible = false;

    this.spawnParticles(mesh.position.x, groundY + 0.4, mesh.position.z, isMythicOrHero ? 14 : 7, {
      colorHex: isMythicOrHero ? 0xfde047 : isNaval ? 0xbae6fd : 0xb8a386,
      speed: isMythicOrHero ? 3.2 : 1.9,
      upSpeed: isMythicOrHero ? 3.4 : 1.8,
      lifetime: isMythicOrHero ? 0.9 : 0.6,
      startScale: 0.75,
      endScale: 0.08,
      gravity: isMythicOrHero ? -0.6 : 4.2,
    });

    this.corpses.push({
      mesh,
      baseY: mesh.position.y,
      baseRotY: mesh.rotation.y,
      fallDir: Math.random() > 0.5 ? 1 : -1,
      age: 0,
      duration: isNaval ? 1.8 : 2.35,
      isMythicOrHero,
      isNaval,
    });

    // Cap active corpses to preserve 60fps in massive 6x6 brawls
    if (this.corpses.length > 36) {
      const oldest = this.corpses.shift();
      if (oldest) this.scene.remove(oldest.mesh);
    }
  }

  public spawnFloatingPopup(pos: THREE.Vector3, text: string, colorCss = '#fde047') {
    if (this.popups.length >= this.maxPopups) {
      const oldest = this.popups.shift();
      if (oldest) {
        this.scene.remove(oldest.sprite);
        oldest.mat.dispose();
        oldest.tex.dispose();
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(8, 12, 20, 0.9)';
      ctx.strokeText(text, 128, 32);
      ctx.fillStyle = colorCss;
      ctx.fillText(text, 128, 32);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(pos.x, pos.y + 2.35, pos.z);
    sprite.scale.set(2.8, 0.72, 1);
    sprite.renderOrder = 9;
    this.scene.add(sprite);

    this.popups.push({
      sprite,
      mat,
      tex,
      age: 0,
      lifetime: 1.15,
      vy: 1.35,
    });
  }

  /**
   * Attaches or updates procedural wooden construction scaffolding around
   * an unconstructed building, removing it cleanly upon completion.
   */
  public syncBuildingScaffolding(
    buildingMesh: THREE.Group,
    radius: number,
    buildProgress: number,
    isConstructed: boolean
  ) {
    let scaffold = buildingMesh.userData.scaffoldGroup as THREE.Group | undefined;
    if (isConstructed) {
      if (scaffold) {
        buildingMesh.remove(scaffold);
        delete buildingMesh.userData.scaffoldGroup;
      }
      return;
    }

    if (!scaffold) {
      scaffold = new THREE.Group();
      const r = Math.max(1.2, radius * 0.96);
      const corners: [number, number][] = [
        [-r, -r],
        [r, -r],
        [r, r],
        [-r, r],
      ];
      for (const [cx, cz] of corners) {
        const post = new THREE.Mesh(this.scaffoldPoleGeo, this.scaffoldWoodMat);
        post.scale.set(1, 3.2, 1);
        post.position.set(cx, 1.6, cz);
        scaffold.add(post);
      }
      // Cross beams on 2 tiers
      for (const tierY of [1.1, 2.35]) {
        const b1 = new THREE.Mesh(this.scaffoldBeamGeo, this.scaffoldWoodMat);
        b1.scale.set(r * 2, 1, 1);
        b1.position.set(0, tierY, r);
        scaffold.add(b1);

        const b2 = new THREE.Mesh(this.scaffoldBeamGeo, this.scaffoldWoodMat);
        b2.scale.set(r * 2, 1, 1);
        b2.position.set(0, tierY, -r);
        scaffold.add(b2);

        const b3 = new THREE.Mesh(this.scaffoldBeamGeo, this.scaffoldWoodMat);
        b3.scale.set(r * 2, 1, 1);
        b3.rotation.y = Math.PI / 2;
        b3.position.set(r, tierY, 0);
        scaffold.add(b3);

        const b4 = new THREE.Mesh(this.scaffoldBeamGeo, this.scaffoldWoodMat);
        b4.scale.set(r * 2, 1, 1);
        b4.rotation.y = Math.PI / 2;
        b4.position.set(-r, tierY, 0);
        scaffold.add(b4);
      }
      buildingMesh.add(scaffold);
      buildingMesh.userData.scaffoldGroup = scaffold;
    }

    // Counter-scale scaffold Y so posts stay tall even while the building rises!
    const yScale = Math.max(0.25, 0.25 + 0.75 * buildProgress);
    scaffold.scale.set(1, 1 / yScale, 1);
  }

  /**
   * Updates warm night/dusk torch PointLights on up to 4 nearest constructed buildings.
   */
  public updateNightLights(
    buildings: Iterable<{ mesh: THREE.Group; isConstructed: boolean; kind: string }>,
    camTarget: THREE.Vector3,
    isNightOrDusk: boolean,
    elapsed: number
  ) {
    if (this.nightLights.length === 0) return;
    if (!isNightOrDusk) {
      for (const pl of this.nightLights) {
        pl.visible = false;
        pl.intensity = 0;
      }
      return;
    }

    const candidates: Array<{ distSq: number; pos: THREE.Vector3 }> = [];
    for (const b of buildings) {
      if (!b.isConstructed || b.kind === 'farm' || b.kind === 'wall') continue;
      const dx = b.mesh.position.x - camTarget.x;
      const dz = b.mesh.position.z - camTarget.z;
      const dSq = dx * dx + dz * dz;
      if (dSq <= 48 * 48) {
        candidates.push({ distSq: dSq, pos: b.mesh.position });
      }
    }
    candidates.sort((a, b) => a.distSq - b.distSq);

    for (let i = 0; i < this.nightLights.length; i++) {
      const pl = this.nightLights[i];
      const cand = candidates[i];
      if (!cand) {
        pl.visible = false;
        continue;
      }
      pl.visible = true;
      pl.position.set(cand.pos.x, cand.pos.y + 3.2, cand.pos.z);
      const flicker = 0.88 + Math.sin(elapsed * 8.5 + i * 2.1) * 0.12 + Math.cos(elapsed * 13.2 + i) * 0.06;
      pl.intensity = 4.2 * flicker;
    }
  }

  /**
   * Emits progressive dark smoke (< 65% HP) and flickering fire embers (< 40% HP)
   * on damaged constructed buildings.
   */
  public syncBuildingDamageEffects(
    buildings: Iterable<{ mesh: THREE.Group; hp: number; maxHp: number; isConstructed: boolean; radius: number; kind: string }>,
    dt: number
  ) {
    this.damageSmokeTimer += dt;
    if (this.damageSmokeTimer < 0.22) return;
    this.damageSmokeTimer = 0;

    for (const b of buildings) {
      if (!b.isConstructed || b.kind === 'farm') continue;
      const ratio = b.hp / Math.max(1, b.maxHp);
      if (ratio >= 0.65) continue;

      const px = b.mesh.position.x + (Math.random() - 0.5) * b.radius * 0.9;
      const py = b.mesh.position.y + 1.4 + Math.random() * 1.1;
      const pz = b.mesh.position.z + (Math.random() - 0.5) * b.radius * 0.9;

      // Dark billowing smoke
      this.spawnParticles(px, py, pz, ratio < 0.35 ? 2 : 1, {
        colorHex: ratio < 0.35 ? 0x1f242d : 0x475569,
        speed: 0.55,
        upSpeed: 2.2,
        lifetime: 1.35,
        startScale: 0.45,
        endScale: 1.35,
        gravity: -0.45,
        spread: 0.65,
      });

      // Active flames & glowing sparks when critically damaged (< 40% HP)
      if (ratio < 0.4) {
        this.spawnParticles(px, py - 0.3, pz, 2, {
          colorHex: Math.random() > 0.4 ? 0xf97316 : 0xfacc15,
          speed: 0.9,
          upSpeed: 2.8,
          lifetime: 0.55,
          startScale: 0.52,
          endScale: 0.06,
          gravity: -0.8,
          spread: 0.75,
        });
      }
    }
  }

  /**
   * Triggers a physical demolition collapse with tumbling 3D masonry/timber
   * rubble chunks and an expanding dust shockwave.
   */
  public spawnBuildingCollapse(x: number, y: number, z: number, radius: number) {
    const chunkCount = this.isSoftwareGl ? 6 : 12;
    for (let i = 0; i < chunkCount; i++) {
      const mat = i % 3 === 0 ? this.debrisTimberMat : this.debrisStoneMat;
      const chunk = new THREE.Mesh(this.debrisGeo, mat);
      const ang = (i / chunkCount) * Math.PI * 2 + Math.random() * 0.5;
      const rad = Math.random() * Math.max(0.8, radius * 0.55);
      const sx = 0.6 + Math.random() * 1.25;
      const sy = 0.5 + Math.random() * 1.0;
      const sz = 0.6 + Math.random() * 1.25;
      chunk.scale.set(sx, sy, sz);
      chunk.position.set(x + Math.cos(ang) * rad, y + 0.8 + Math.random() * 1.8, z + Math.sin(ang) * rad);
      chunk.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      chunk.castShadow = !this.isSoftwareGl;
      this.scene.add(chunk);

      const spd = 2.4 + Math.random() * 4.2;
      this.debrisChunks.push({
        mesh: chunk,
        vx: Math.cos(ang) * spd,
        vy: 3.6 + Math.random() * 4.4,
        vz: Math.sin(ang) * spd,
        rx: (Math.random() - 0.5) * 8,
        ry: (Math.random() - 0.5) * 8,
        rz: (Math.random() - 0.5) * 8,
        groundY: y + 0.14,
        age: 0,
        lifetime: 2.8 + Math.random() * 1.0,
      });
    }

    // Expanding dust cloud & flame flash
    this.spawnParticles(x, y + 0.6, z, 22, {
      colorHex: 0x9ca3af,
      speed: 4.4,
      upSpeed: 3.1,
      lifetime: 1.4,
      startScale: 0.9,
      endScale: 2.1,
      gravity: 1.2,
      spread: Math.max(1.2, radius * 0.7),
    });
    this.spawnParticles(x, y + 0.9, z, 14, {
      colorHex: 0xf97316,
      speed: 3.4,
      upSpeed: 4.5,
      lifetime: 0.7,
      startScale: 0.85,
      endScale: 0.1,
      gravity: 3.2,
      spread: Math.max(0.8, radius * 0.45),
    });
  }

  public update(dt: number, elapsed: number) {
    // 1. Update pooled instanced particles
    let activeCount = 0;
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particlePool[i];
      if (!p.active) continue;
      p.age += dt;
      if (p.age >= p.lifetime) {
        p.active = false;
        continue;
      }
      const t = p.age / p.lifetime;
      p.vy -= p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      const sc = THREE.MathUtils.lerp(p.startScale, p.endScale, t);
      _v3A.set(p.x, p.y, p.z);
      if (p.flatOnGround) {
        _scale.set(sc, sc * 0.18, sc);
      } else {
        _scale.set(sc, sc, sc);
      }
      _quat.identity();
      _mat4.compose(_v3A, _quat, _scale);
      this.particleMesh.setMatrixAt(activeCount, _mat4);
      this.particleMesh.setColorAt(activeCount, _color.setHex(p.colorHex));
      activeCount++;
    }
    this.particleMesh.count = activeCount;
    if (activeCount > 0) {
      this.particleMesh.instanceMatrix.needsUpdate = true;
      if (this.particleMesh.instanceColor) this.particleMesh.instanceColor.needsUpdate = true;
    }

    // 2. Update soaring birds
    for (let i = 0; i < this.birdCount; i++) {
      const b = this.birdStates[i];
      const ang = elapsed * b.speed + b.phase;
      const bx = b.cx + Math.cos(ang) * b.radius;
      const bz = b.cz + Math.sin(ang) * b.radius;
      const by = b.height + Math.sin(elapsed * 1.4 + b.phase) * 0.65;
      const heading = Math.atan2(-Math.sin(ang), Math.cos(ang));
      const flap = 0.72 + Math.sin(elapsed * 9.5 + b.phase * 3) * 0.28;
      _v3A.set(bx, by, bz);
      _euler.set(0, heading, Math.sin(elapsed * 1.4 + b.phase) * 0.14);
      _quat.setFromEuler(_euler);
      _scale.set(1.0, flap, 1.0);
      _mat4.compose(_v3A, _quat, _scale);
      this.birdMesh.setMatrixAt(i, _mat4);
    }
    this.birdMesh.instanceMatrix.needsUpdate = true;

    // 3. Update biome atmospheric motes
    if (this.biomeMotes) {
      const posAttr = this.biomeMotes.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const effId = resolveEffectiveMapId(this.currentBiomeMap);
      const riseSpeed = effId === 'erebus' ? 1.4 : effId === 'tundra' || effId === 'midgard' ? -1.1 : 0.28;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += Math.sin(elapsed * 0.8 + i) * 0.35 * dt;
        arr[i + 1] += riseSpeed * dt;
        arr[i + 2] += Math.cos(elapsed * 0.7 + i) * 0.35 * dt;
        if (arr[i + 1] > 10.5) arr[i + 1] = 0.6;
        if (arr[i + 1] < 0.4) arr[i + 1] = 10.2;
      }
      posAttr.needsUpdate = true;
    }

    // 4. Update dying corpses (smooth tip-over + sink / mythic golden rise)
    for (let i = this.corpses.length - 1; i >= 0; i--) {
      const c = this.corpses[i];
      c.age += dt;
      if (c.age >= c.duration) {
        this.scene.remove(c.mesh);
        this.corpses.splice(i, 1);
        continue;
      }
      const t = c.age / c.duration;
      if (c.isNaval) {
        // Sinking ship tilts & submerges beneath waves
        const tilt = Math.min(1, t * 1.4) * 0.55;
        c.mesh.rotation.z = tilt * c.fallDir;
        c.mesh.rotation.x = tilt * 0.4;
        c.mesh.position.y = c.baseY - t * 1.45;
      } else {
        const fallProgress = Math.min(1, t / 0.24);
        const easedFall = 1 - Math.pow(1 - fallProgress, 3);
        c.mesh.rotation.z = easedFall * (Math.PI * 0.46) * c.fallDir;
        c.mesh.rotation.y = c.baseRotY + easedFall * 0.25 * c.fallDir;
        if (t > 0.68) {
          const sinkT = (t - 0.68) / 0.32;
          c.mesh.position.y = c.baseY - sinkT * 0.85;
        }
      }
    }

    // 5. Update melee slash arcs
    for (let i = this.slashArcs.length - 1; i >= 0; i--) {
      const s = this.slashArcs[i];
      s.age += dt;
      if (s.age >= s.lifetime) {
        this.scene.remove(s.mesh);
        s.mat.dispose();
        this.slashArcs.splice(i, 1);
        continue;
      }
      const t = s.age / s.lifetime;
      s.mesh.rotation.y = s.startYaw + t * 1.15 * s.sweepDir;
      s.mat.opacity = 0.88 * (1 - t);
    }

    // 6. Update floating popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.age += dt;
      if (p.age >= p.lifetime) {
        this.scene.remove(p.sprite);
        p.mat.dispose();
        p.tex.dispose();
        this.popups.splice(i, 1);
        continue;
      }
      const t = p.age / p.lifetime;
      p.sprite.position.y += p.vy * dt;
      p.mat.opacity = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
    }

    // 7. Update tumbling 3D building demolition debris chunks
    for (let i = this.debrisChunks.length - 1; i >= 0; i--) {
      const d = this.debrisChunks[i];
      d.age += dt;
      if (d.age >= d.lifetime) {
        this.scene.remove(d.mesh);
        this.debrisChunks.splice(i, 1);
        continue;
      }
      d.vy -= 14.5 * dt;
      d.mesh.position.x += d.vx * dt;
      d.mesh.position.y += d.vy * dt;
      d.mesh.position.z += d.vz * dt;
      if (d.mesh.position.y <= d.groundY) {
        d.mesh.position.y = d.groundY;
        d.vy = Math.abs(d.vy) * 0.28;
        d.vx *= 0.62;
        d.vz *= 0.62;
        d.rx *= 0.5;
        d.ry *= 0.5;
        d.rz *= 0.5;
      }
      d.mesh.rotation.x += d.rx * dt;
      d.mesh.rotation.y += d.ry * dt;
      d.mesh.rotation.z += d.rz * dt;
      const fadeT = d.age / d.lifetime;
      if (fadeT > 0.72) {
        d.mesh.position.y -= (fadeT - 0.72) * 1.4 * dt;
      }
    }
  }

  public clearMatchVisuals() {
    for (const p of this.particlePool) p.active = false;
    this.particleMesh.count = 0;

    for (const c of this.corpses) {
      this.scene.remove(c.mesh);
    }
    this.corpses = [];

    for (const d of this.debrisChunks) {
      this.scene.remove(d.mesh);
    }
    this.debrisChunks = [];

    for (const s of this.slashArcs) {
      this.scene.remove(s.mesh);
      s.mat.dispose();
    }
    this.slashArcs = [];

    for (const pop of this.popups) {
      this.scene.remove(pop.sprite);
      pop.mat.dispose();
      pop.tex.dispose();
    }
    this.popups = [];

    for (const pl of this.nightLights) {
      pl.visible = false;
      pl.intensity = 0;
    }
  }

  public dispose() {
    this.clearMatchVisuals();
    this.scene.remove(this.particleMesh);
    this.particleMesh.geometry.dispose();
    (this.particleMesh.material as THREE.Material).dispose();

    this.scene.remove(this.birdMesh);
    this.birdMesh.geometry.dispose();
    (this.birdMesh.material as THREE.Material).dispose();

    if (this.biomeMotes) {
      this.scene.remove(this.biomeMotes);
      this.biomeMotes.geometry.dispose();
      this.biomeMotesMat?.dispose();
      this.biomeMotes = null;
    }

    this.slashGeo.dispose();
    this.scaffoldWoodMat.dispose();
    this.scaffoldPoleGeo.dispose();
    this.scaffoldBeamGeo.dispose();
    this.debrisGeo.dispose();
    this.debrisStoneMat.dispose();
    this.debrisTimberMat.dispose();
    for (const pl of this.nightLights) {
      this.scene.remove(pl);
    }
    this.composer?.dispose();
  }
}
