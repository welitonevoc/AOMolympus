import * as THREE from 'three';
import { soundEngine } from '../audio';
import { createOrderMarkerMesh, groundHeightAt, OrderMarkerKind } from '../models';
import type { GodPowerId, TeamId, UnitKind } from '../types';
import type { AoMEngineContext, BuildingEntity } from './engineTypes';

export class VfxAndOrdersSystem {
  public orderVisualGroup = new THREE.Group();
  private trailDotMesh!: THREE.InstancedMesh;
  private trailLinePool: THREE.Line[] = [];
  private rallyArrowGroup: THREE.Group | null = null;
  private rallyPreviewArrowGroup: THREE.Group | null = null;
  private particleGlowTex: THREE.CanvasTexture | null = null;
  private markerPool: Record<OrderMarkerKind, THREE.Group[]> = {
    flag: [],
    sword: [],
    wood: [],
    gold: [],
    food: [],
    build: [],
  };

  // Shared projectile geometries & materials
  private arrowGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5);
  private arrowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  private fireArrowMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
  private poisonArrowMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
  private boulderGeo = new THREE.DodecahedronGeometry(0.28, 0);
  private boulderMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.75,
    roughness: 0.72,
  });
  private fireOrbGeo = new THREE.SphereGeometry(0.22, 8, 8);
  private fireOrbMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });
  private petrifyBoltGeo = new THREE.OctahedronGeometry(0.16, 0);
  private petrifyBoltMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });

  public initOrderVisuals(scene: THREE.Scene) {
    const dotGeo = new THREE.SphereGeometry(0.18, 6, 5);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
    });
    this.trailDotMesh = new THREE.InstancedMesh(dotGeo, dotMat, 320);
    this.trailDotMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.trailDotMesh.setColorAt(0, new THREE.Color(0xfacc15));
    this.trailDotMesh.count = 0;
    this.trailDotMesh.frustumCulled = false;
    this.orderVisualGroup.add(this.trailDotMesh);

    for (let i = 0; i < 18; i++) {
      const buf = new Float32Array(64 * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.85,
      });
      const line = new THREE.Line(geo, mat);
      line.frustumCulled = false;
      line.visible = false;
      this.trailLinePool.push(line);
      this.orderVisualGroup.add(line);
    }

    this.rallyArrowGroup = this.createRallyArrowMesh(0xfacc15, 0.96);
    this.rallyArrowGroup.visible = false;
    this.orderVisualGroup.add(this.rallyArrowGroup);

    this.rallyPreviewArrowGroup = this.createRallyArrowMesh(0x38bdf8, 0.68);
    this.rallyPreviewArrowGroup.visible = false;
    this.orderVisualGroup.add(this.rallyPreviewArrowGroup);

    scene.add(this.orderVisualGroup);
  }

  public createRallyArrowMesh(colorHex: number, opacity: number): THREE.Group {
    const group = new THREE.Group();

    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: opacity * 0.85,
      side: THREE.DoubleSide,
    });
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.82, 28), ringMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.08;
    group.add(outerRing);

    const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.32, 20), ringMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.09;
    group.add(innerRing);

    const groundChevron = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.72, 4), ringMat);
    groundChevron.rotation.x = Math.PI / 2;
    groundChevron.rotation.z = Math.PI / 4;
    groundChevron.position.set(0, 0.12, 0.55);
    group.add(groundChevron);

    const arrowBody = new THREE.Group();
    const arrowMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity,
    });
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.85, 12), arrowMat);
    tip.rotation.x = Math.PI;
    tip.position.y = 0.75;
    arrowBody.add(tip);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.15, 10), arrowMat);
    shaft.position.y = 1.65;
    arrowBody.add(shaft);

    const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), arrowMat);
    crest.position.y = 2.42;
    arrowBody.add(crest);

    group.add(arrowBody);
    group.userData.arrowBody = arrowBody;
    group.userData.outerRing = outerRing;
    return group;
  }

  public setBuildingRallyPointFromEvent(
    ctx: AoMEngineContext,
    b: BuildingEntity,
    clientX: number,
    clientY: number
  ) {
    const picked = ctx.pickEntityFromEvent(clientX, clientY);
    let targetPos: THREE.Vector3 | null = null;
    if (picked.type === 'node' && picked.id) {
      const n = ctx.nodes.get(picked.id);
      if (n) targetPos = n.mesh.position.clone();
    } else if (picked.type === 'fauna' && picked.id) {
      const f = ctx.fauna.get(picked.id);
      if (f) targetPos = f.mesh.position.clone();
    }
    if (!targetPos) {
      const pt = ctx.getGroundPointFromEvent(clientX, clientY);
      if (pt) {
        const cx = THREE.MathUtils.clamp(pt.x, -ctx.playableHalfSize + 2, ctx.playableHalfSize - 2);
        const cz = THREE.MathUtils.clamp(pt.z, -ctx.playableHalfSize + 2, ctx.playableHalfSize - 2);
        targetPos = new THREE.Vector3(cx, groundHeightAt(cx, cz, ctx.mapId, ctx.worldSize), cz);
      }
    }
    if (!targetPos) return;

    b.rallyPoint = targetPos;
    this.spawnRingVfx(ctx, targetPos, 1.65, 0xfacc15, 0.55);
    soundEngine.playSelect();
    const bName = ctx.buildingStats(b.kind, 'player').name;
    ctx.notifyStatus(`Seta de nascimento de ${bName} posicionada no mapa!`);
    ctx.emitHudSnapshot();
  }

  public hideAllOrderVisuals() {
    if (this.trailDotMesh) this.trailDotMesh.count = 0;
    for (const line of this.trailLinePool) line.visible = false;
    if (this.rallyArrowGroup) this.rallyArrowGroup.visible = false;
    if (this.rallyPreviewArrowGroup) this.rallyPreviewArrowGroup.visible = false;
    for (const kind of Object.keys(this.markerPool) as OrderMarkerKind[]) {
      for (const m of this.markerPool[kind]) m.visible = false;
    }
  }

  private acquireOrderMarker(ctx: AoMEngineContext, kind: OrderMarkerKind, index: number): THREE.Group {
    const pool = this.markerPool[kind];
    while (pool.length <= index) {
      const m = createOrderMarkerMesh(kind, ctx.palette);
      m.visible = false;
      this.orderVisualGroup.add(m);
      pool.push(m);
    }
    return pool[index];
  }

  public updateOrderVisuals(ctx: AoMEngineContext, nowMs: number) {
    this.hideAllOrderVisuals();
    if (ctx.phase !== 'playing' && ctx.phase !== 'paused') return;

    const markerCounts: Record<OrderMarkerKind, number> = {
      flag: 0,
      sword: 0,
      wood: 0,
      gold: 0,
      food: 0,
      build: 0,
    };
    let lineIdx = 0;
    let dotIdx = 0;

    const dotMatrix = new THREE.Matrix4();
    const dotScale = new THREE.Vector3();
    const dotQuat = new THREE.Quaternion();
    const dotPos = new THREE.Vector3();
    const dotColor = new THREE.Color();

    const addTrailPath = (pts: THREE.Vector3[], colorHex: number, isPreview: boolean) => {
      if (pts.length < 2) return;
      if (lineIdx < this.trailLinePool.length) {
        const line = this.trailLinePool[lineIdx++];
        const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
        const count = Math.min(64, pts.length);
        for (let i = 0; i < count; i++) {
          const p = pts[i];
          attr.setXYZ(i, p.x, groundHeightAt(p.x, p.z, ctx.mapId, ctx.worldSize) + 0.16, p.z);
        }
        attr.needsUpdate = true;
        line.geometry.setDrawRange(0, count);
        (line.material as THREE.LineBasicMaterial).color.setHex(colorHex);
        line.visible = true;
      }

      dotColor.setHex(colorHex);
      const spacing = isPreview ? 1.45 : 2.1;
      const pulsePhase = nowMs * 0.006;

      for (let s = 0; s < pts.length - 1 && dotIdx < 320; s++) {
        const a = pts[s];
        const b = pts[s + 1];
        const segLen = Math.hypot(b.x - a.x, b.z - a.z);
        if (segLen < 0.25) continue;
        const steps = Math.max(1, Math.floor(segLen / spacing));
        for (let k = 1; k <= steps && dotIdx < 320; k++) {
          const frac = k / (steps + 0.2);
          const wx = a.x + (b.x - a.x) * frac;
          const wz = a.z + (b.z - a.z) * frac;
          const wy = groundHeightAt(wx, wz, ctx.mapId, ctx.worldSize) + 0.2;
          const wave = 0.78 + 0.28 * Math.sin(pulsePhase - dotIdx * 0.65);
          const sc = (isPreview ? 1.15 : 0.9) * wave;
          dotPos.set(wx, wy, wz);
          dotScale.set(sc, sc * 0.65, sc);
          dotMatrix.compose(dotPos, dotQuat, dotScale);
          this.trailDotMesh.setMatrixAt(dotIdx, dotMatrix);
          this.trailDotMesh.setColorAt(dotIdx, dotColor);
          dotIdx++;
        }
      }
    };

    const placeMarker = (kind: OrderMarkerKind, x: number, z: number, extraY = 0) => {
      const idx = markerCounts[kind]++;
      if (idx >= 28) return;
      const m = this.acquireOrderMarker(ctx, kind, idx);
      const gy = groundHeightAt(x, z, ctx.mapId, ctx.worldSize);
      const bob = kind === 'flag' ? 0 : Math.sin(nowMs * 0.0045 + idx) * 0.18;
      m.position.set(x, gy + extraY + bob, z);
      if (m.userData.spinTarget) {
        (m.userData.spinTarget as THREE.Object3D).rotation.y = nowMs * 0.0022 + idx;
      } else if (kind === 'flag') {
        m.rotation.y = Math.sin(nowMs * 0.002 + idx) * 0.14;
      }
      m.visible = true;
    };

    if (ctx.isCommandDragging && ctx.commandDragWaypoints.length > 0 && ctx.commandDragPreviewKind) {
      const colorByKind: Record<OrderMarkerKind, number> = {
        flag: 0xfacc15,
        sword: 0xef4444,
        wood: 0x4ade80,
        gold: 0xf59e0b,
        food: 0xfb7185,
        build: 0xf59e0b,
      };
      const previewPath = [...ctx.commandDragWaypoints, ctx.commandDragTargetPos];
      addTrailPath(previewPath, colorByKind[ctx.commandDragPreviewKind], true);
      placeMarker(
        ctx.commandDragPreviewKind,
        ctx.commandDragTargetPos.x,
        ctx.commandDragTargetPos.z,
        ctx.commandDragTargetElevation
      );
    }

    const selBuilding = ctx.getSelectedPlayerBuilding();
    if (selBuilding) {
      const bPos = selBuilding.mesh.position;
      if (selBuilding.rallyPoint && this.rallyArrowGroup) {
        const rp = selBuilding.rallyPoint;
        const gy = groundHeightAt(rp.x, rp.z, ctx.mapId, ctx.worldSize);
        this.rallyArrowGroup.position.set(rp.x, gy, rp.z);
        this.rallyArrowGroup.rotation.y = Math.atan2(rp.x - bPos.x, rp.z - bPos.z);
        const arrowBody = this.rallyArrowGroup.userData.arrowBody as THREE.Object3D | undefined;
        if (arrowBody) {
          arrowBody.position.y = Math.sin(nowMs * 0.006) * 0.22;
          arrowBody.rotation.y = nowMs * 0.0025;
        }
        this.rallyArrowGroup.visible = true;
        addTrailPath([bPos, rp], 0xfacc15, true);
      }

      if (ctx.rallyHoverPos && this.rallyPreviewArrowGroup && !ctx.activeBuildMode && !ctx.activeGodPowerMode) {
        const hp = ctx.rallyHoverPos;
        const distFromBuilding = Math.hypot(hp.x - bPos.x, hp.z - bPos.z);
        if (distFromBuilding > selBuilding.radius + 0.8) {
          const gy = groundHeightAt(hp.x, hp.z, ctx.mapId, ctx.worldSize);
          this.rallyPreviewArrowGroup.position.set(hp.x, gy, hp.z);
          this.rallyPreviewArrowGroup.rotation.y = Math.atan2(hp.x - bPos.x, hp.z - bPos.z);
          const arrowBody = this.rallyPreviewArrowGroup.userData.arrowBody as THREE.Object3D | undefined;
          if (arrowBody) {
            arrowBody.position.y = Math.sin(nowMs * 0.0075) * 0.2;
          }
          this.rallyPreviewArrowGroup.visible = true;
          addTrailPath([bPos, hp], 0x38bdf8, true);
        }
      }
    }

    const placedFlags: { x: number; z: number }[] = [];
    const markedTargetIds = new Set<string>();
    const hasNearbyFlag = (x: number, z: number) => {
      for (const f of placedFlags) {
        if (Math.hypot(f.x - x, f.z - z) < 4.2) return true;
      }
      return false;
    };

    for (const u of ctx.units.values()) {
      if (u.team !== 'player') continue;

      if (u.state === 'move' && u.targetPos) {
        const path = [u.mesh.position, u.targetPos, ...u.waypoints];
        addTrailPath(path, 0xfacc15, u.selected);
        const dest = path[path.length - 1];
        if (!hasNearbyFlag(dest.x, dest.z)) {
          placedFlags.push({ x: dest.x, z: dest.z });
          placeMarker('flag', dest.x, dest.z, 0);
        }
      } else if (u.state === 'attack' && u.targetEntityId) {
        const targetU = ctx.units.get(u.targetEntityId);
        const targetB = !targetU ? ctx.buildings.get(u.targetEntityId) : undefined;
        const targetPos = targetU ? targetU.mesh.position : targetB?.mesh.position;
        if (targetPos) {
          if (u.selected) {
            addTrailPath([u.mesh.position, targetPos], 0xef4444, false);
          }
          if (!markedTargetIds.has(u.targetEntityId)) {
            markedTargetIds.add(u.targetEntityId);
            placeMarker('sword', targetPos.x, targetPos.z, targetB ? 4.4 : 2.3);
          }
        }
      } else if (ctx.isWorkerKind(u.kind) && u.state === 'hunt' && u.targetFaunaId) {
        const animal = ctx.fauna.get(u.targetFaunaId);
        if (animal) {
          if (u.selected) {
            addTrailPath([u.mesh.position, animal.mesh.position], 0xfb923c, false);
          }
          if (!markedTargetIds.has(animal.id)) {
            markedTargetIds.add(animal.id);
            placeMarker('food', animal.mesh.position.x, animal.mesh.position.z, 2.0);
          }
        }
      } else if (ctx.isWorkerKind(u.kind) && (u.state === 'gather' || u.state === 'return') && u.targetEntityId) {
        const farmB = ctx.buildings.get(u.targetEntityId);
        if (farmB && farmB.kind === 'farm') {
          if (u.selected) {
            if (u.state === 'return') {
              const drop = ctx.findNearestDropOff('player', u.mesh.position, 'food');
              if (drop) addTrailPath([u.mesh.position, drop.pos], 0x38bdf8, false);
            } else {
              addTrailPath([u.mesh.position, farmB.mesh.position], 0x4ade80, false);
            }
          }
          if (!markedTargetIds.has(farmB.id)) {
            markedTargetIds.add(farmB.id);
            placeMarker('food', farmB.mesh.position.x, farmB.mesh.position.z, 2.2);
          }
        }
      } else if (ctx.isWorkerKind(u.kind) && (u.state === 'gather' || u.state === 'return') && u.targetNodeId) {
        const node = ctx.nodes.get(u.targetNodeId);
        if (node) {
          if (u.selected) {
            if (u.state === 'return') {
              const drop = ctx.findNearestDropOff('player', u.mesh.position, node.resourceType);
              if (drop) addTrailPath([u.mesh.position, drop.pos], 0x38bdf8, false);
            } else {
              addTrailPath(
                [u.mesh.position, node.mesh.position],
                node.kind === 'gold_mine' ? 0xf59e0b : 0x4ade80,
                false
              );
            }
          }
          if (!markedTargetIds.has(node.id)) {
            markedTargetIds.add(node.id);
            const markerKind: OrderMarkerKind =
              node.kind === 'tree' ? 'wood' : node.kind === 'gold_mine' ? 'gold' : 'food';
            placeMarker(markerKind, node.mesh.position.x, node.mesh.position.z, node.kind === 'tree' ? 4.4 : 2.2);
          }
        }
      } else if (u.state === 'build' && u.targetEntityId) {
        const b = ctx.buildings.get(u.targetEntityId);
        if (b && !b.isConstructed) {
          if (u.selected) {
            addTrailPath([u.mesh.position, b.mesh.position], 0xf59e0b, false);
          }
          if (!markedTargetIds.has(b.id)) {
            markedTargetIds.add(b.id);
            placeMarker('build', b.mesh.position.x, b.mesh.position.z, 3.2);
          }
        }
      } else if ((u.state === 'pray' || u.state === 'empower') && u.targetEntityId) {
        const targetB = ctx.buildings.get(u.targetEntityId);
        if (targetB && targetB.isConstructed) {
          if (u.selected) {
            addTrailPath(
              [u.mesh.position, targetB.mesh.position],
              u.state === 'pray' ? 0x38bdf8 : 0xfacc15,
              false
            );
          }
          if (!markedTargetIds.has(targetB.id)) {
            markedTargetIds.add(targetB.id);
            placeMarker('flag', targetB.mesh.position.x, targetB.mesh.position.z, targetB.radius + 0.6);
          }
        }
      } else if (
        u.state === 'idle' &&
        (!ctx.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero) || u.rallyFlagPos !== null)
      ) {
        if (!hasNearbyFlag(u.mesh.position.x, u.mesh.position.z)) {
          placedFlags.push({ x: u.mesh.position.x, z: u.mesh.position.z });
          placeMarker('flag', u.mesh.position.x, u.mesh.position.z, 0);
        }
      }
    }

    this.trailDotMesh.count = dotIdx;
    if (dotIdx > 0) {
      this.trailDotMesh.instanceMatrix.needsUpdate = true;
      if (this.trailDotMesh.instanceColor) {
        this.trailDotMesh.instanceColor.needsUpdate = true;
      }
    }
  }

  public spawnRingVfx(
    ctx: AoMEngineContext,
    pos: THREE.Vector3,
    maxRadius: number,
    colorHex: number,
    lifetime: number
  ) {
    const geo = new THREE.RingGeometry(0.65, 1, 28);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, groundHeightAt(pos.x, pos.z, ctx.mapId, ctx.worldSize) + 0.14, pos.z);
    ctx.scene.add(mesh);
    ctx.transientVfx.push({
      object: mesh,
      age: 0,
      lifetime,
      onUpdate: (t) => {
        mesh.scale.setScalar(0.3 + t * maxRadius);
        mat.opacity = 0.9 * (1 - t);
      },
    });
  }

  public spawnPillarVfx(ctx: AoMEngineContext, pos: THREE.Vector3, colorHex: number, lifetime: number) {
    const geo = new THREE.CylinderGeometry(0.45, 1.3, 28, 12, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, groundHeightAt(pos.x, pos.z, ctx.mapId, ctx.worldSize) + 14, pos.z);
    ctx.scene.add(mesh);
    ctx.transientVfx.push({
      object: mesh,
      age: 0,
      lifetime,
      onUpdate: (t) => {
        mesh.scale.set(1 + t * 0.8, 1, 1 + t * 0.8);
        mesh.rotation.y += 0.12;
        mat.opacity = 0.85 * (1 - t);
      },
    });
  }

  public spawnLightningBoltVfx(ctx: AoMEngineContext, center: THREE.Vector3, radius: number) {
    const group = new THREE.Group();
    const groundY = groundHeightAt(center.x, center.z, ctx.mapId, ctx.worldSize);
    const boltMats: THREE.LineBasicMaterial[] = [];

    const strikes = 4;
    for (let s = 0; s < strikes; s++) {
      const ang = (s / strikes) * Math.PI * 2 + Math.random() * 0.6;
      const offsetR = s === 0 ? 0 : radius * (0.25 + Math.random() * 0.35);
      const tx = center.x + Math.cos(ang) * offsetR;
      const tz = center.z + Math.sin(ang) * offsetR;
      const ty = groundHeightAt(tx, tz, ctx.mapId, ctx.worldSize);

      const pts: THREE.Vector3[] = [];
      const segments = 10;
      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const jitter = i === 0 || i === segments ? 0 : (1 - frac * 0.5) * 1.4;
        pts.push(
          new THREE.Vector3(
            tx + (Math.random() - 0.5) * jitter,
            ty + 26 * (1 - frac),
            tz + (Math.random() - 0.5) * jitter
          )
        );
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: s === 0 ? 0xe0f2fe : 0x60a5fa,
        transparent: true,
        opacity: 1,
      });
      boltMats.push(lineMat);
      group.add(new THREE.Line(lineGeo, lineMat));
    }

    const flashMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.75, 26, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      })
    );
    flashMesh.position.set(center.x, groundY + 13, center.z);
    group.add(flashMesh);

    ctx.scene.add(group);
    ctx.transientVfx.push({
      object: group,
      age: 0,
      lifetime: 0.75,
      onUpdate: (t) => {
        const fade = Math.max(0, 1 - t);
        for (const m of boltMats) m.opacity = fade;
        (flashMesh.material as THREE.MeshBasicMaterial).opacity = 0.75 * fade * fade;
      },
    });

    this.spawnDivineParticleBurst(ctx, center, {
      behavior: 'shock',
      count: 68,
      radius: Math.max(2.5, radius * 0.6),
      height: 5.5,
      primaryColor: 0xe0f2fe,
      secondaryColor: 0x38bdf8,
      size: 1.15,
      lifetime: 0.85,
      speed: 1.55,
    });
  }

  public spawnMeteorShowerVfx(ctx: AoMEngineContext, center: THREE.Vector3, radius: number) {
    for (let i = 0; i < 7; i++) {
      const ang = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
      const r = (i === 0 ? 0 : 0.35 + Math.random() * 0.55) * radius * 0.75;
      const tx = center.x + Math.cos(ang) * r;
      const tz = center.z + Math.sin(ang) * r;
      const ty = groundHeightAt(tx, tz, ctx.mapId, ctx.worldSize);

      const meteorGroup = new THREE.Group();
      const coreMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.15, 0),
        new THREE.MeshBasicMaterial({ color: 0xf97316 })
      );
      const auraMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.55, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xfde047,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      meteorGroup.add(coreMesh, auraMesh);
      const startPos = new THREE.Vector3(tx - 11, ty + 30 + i * 2.8, tz - 9);
      const endPos = new THREE.Vector3(tx, ty + 0.45, tz);
      meteorGroup.position.copy(startPos);
      ctx.scene.add(meteorGroup);

      let exploded = false;
      ctx.transientVfx.push({
        object: meteorGroup,
        age: -i * 0.1,
        lifetime: 0.65,
        onUpdate: (t) => {
          if (t < 0) {
            meteorGroup.visible = false;
            return;
          }
          meteorGroup.visible = true;
          meteorGroup.position.lerpVectors(startPos, endPos, t);
          coreMesh.rotation.x += 0.18;
          coreMesh.rotation.z += 0.15;
          if (t > 0.88 && !exploded) {
            exploded = true;
            this.spawnRingVfx(ctx, endPos, 5.8, 0xf97316, 0.75);
            this.spawnRingVfx(ctx, endPos, 3.8, 0x1c1917, 3.0);
            this.spawnDivineParticleBurst(ctx, endPos, {
              behavior: 'fountain',
              count: 58,
              radius: 3.8,
              height: 11,
              primaryColor: 0xfde047,
              secondaryColor: 0xef4444,
              size: 1.35,
              lifetime: 1.2,
              speed: 1.4,
              gravity: 13.5,
            });
          }
        },
      });
    }
  }

  public spawnDustParticleVfx(ctx: AoMEngineContext, pos: THREE.Vector3) {
    const geo = new THREE.SphereGeometry(0.35, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xc2b280,
      transparent: true,
      opacity: 0.5,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      pos.x + (Math.random() - 0.5) * 0.6,
      groundHeightAt(pos.x, pos.z, ctx.mapId, ctx.worldSize) + 0.1,
      pos.z + (Math.random() - 0.5) * 0.6
    );
    ctx.scene.add(mesh);
    ctx.transientVfx.push({
      object: mesh,
      age: 0,
      lifetime: 0.45,
      onUpdate: (t) => {
        mesh.scale.setScalar(0.5 + t * 1.5);
        mesh.position.y += 0.03;
        mat.opacity = 0.5 * (1 - t);
      },
    });
  }

  public spawnSparkParticleVfx(ctx: AoMEngineContext, pos: THREE.Vector3) {
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfde047 : 0xffffff,
        transparent: true,
        opacity: 0.95,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos.x, pos.y + 0.8, pos.z);
      ctx.scene.add(mesh);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        Math.random() * 3.5 + 1,
        (Math.random() - 0.5) * 4.5
      );
      ctx.transientVfx.push({
        object: mesh,
        age: 0,
        lifetime: 0.35,
        onUpdate: (t, dt) => {
          mesh.position.addScaledVector(vel, dt);
          vel.y -= 9.8 * dt;
          mesh.rotation.x += 0.2;
          mesh.rotation.y += 0.2;
          mat.opacity = 0.95 * (1 - t);
        },
      });
    }
  }

  private getParticleGlowTex(): THREE.CanvasTexture {
    if (this.particleGlowTex) return this.particleGlowTex;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const c2d = canvas.getContext('2d')!;
    const grad = c2d.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.28, 'rgba(255,255,255,0.88)');
    grad.addColorStop(0.65, 'rgba(255,255,255,0.28)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    c2d.fillStyle = grad;
    c2d.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.particleGlowTex = tex;
    return tex;
  }

  public spawnDivineParticleBurst(
    ctx: AoMEngineContext,
    pos: THREE.Vector3,
    opts: {
      behavior: 'vortex' | 'fountain' | 'ascend' | 'rain' | 'shock';
      count: number;
      radius: number;
      height: number;
      primaryColor: number;
      secondaryColor: number;
      size: number;
      lifetime: number;
      speed?: number;
      gravity?: number;
      swirl?: number;
      inward?: boolean;
      additive?: boolean;
    }
  ) {
    const count = opts.count;
    const radius = Math.max(1.5, opts.radius);
    const height = Math.max(2.0, opts.height);
    const speed = opts.speed ?? 1.0;
    const gravity = opts.gravity ?? 10.5;
    const swirl = opts.swirl ?? (opts.behavior === 'vortex' ? 4.2 : 1.1);
    const groundY = groundHeightAt(pos.x, pos.z, ctx.mapId, ctx.worldSize);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    const vz = new Float32Array(count);
    const radial = new Float32Array(count);
    const angle = new Float32Array(count);

    const c1 = new THREE.Color(opts.primaryColor);
    const c2 = new THREE.Color(opts.secondaryColor);
    const tmpC = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const a = Math.random() * Math.PI * 2;
      const rFrac = Math.pow(Math.random(), 0.65);
      const r = rFrac * radius;
      angle[i] = a;
      radial[i] = r;

      tmpC.copy(c1).lerp(c2, Math.random());
      colors[idx] = tmpC.r;
      colors[idx + 1] = tmpC.g;
      colors[idx + 2] = tmpC.b;

      if (opts.behavior === 'rain') {
        positions[idx] = Math.cos(a) * r;
        positions[idx + 1] = height * (0.45 + Math.random() * 0.95);
        positions[idx + 2] = Math.sin(a) * r;
        vx[i] = (Math.random() - 0.5) * 1.4 * speed;
        vy[i] = -(height * (0.7 + Math.random() * 0.55)) * speed;
        vz[i] = (Math.random() - 0.5) * 1.4 * speed;
      } else if (opts.behavior === 'fountain') {
        const launchR = Math.random() * Math.min(2.4, radius * 0.35);
        positions[idx] = Math.cos(a) * launchR;
        positions[idx + 1] = 0.25 + Math.random() * 0.5;
        positions[idx + 2] = Math.sin(a) * launchR;
        const outSpeed = (1.8 + Math.random() * (radius * 0.65)) * speed;
        vx[i] = Math.cos(a) * outSpeed;
        vy[i] = (height * 0.55 + Math.random() * height * 0.6) * speed;
        vz[i] = Math.sin(a) * outSpeed;
      } else if (opts.behavior === 'shock') {
        positions[idx] = Math.cos(a) * (0.3 + Math.random() * 0.7);
        positions[idx + 1] = 0.35 + Math.random() * 1.4;
        positions[idx + 2] = Math.sin(a) * (0.3 + Math.random() * 0.7);
        const burstSpd = radius * (0.65 + Math.random() * 0.75) * speed;
        vx[i] = Math.cos(a) * burstSpd;
        vy[i] = (1.5 + Math.random() * height) * speed;
        vz[i] = Math.sin(a) * burstSpd;
      } else if (opts.behavior === 'vortex') {
        const y0 = Math.random() * height;
        const coneR = opts.inward ? radius * (0.35 + Math.random() * 0.65) : 0.4 + (y0 / height) * radius * 0.85;
        radial[i] = coneR;
        positions[idx] = Math.cos(a) * coneR;
        positions[idx + 1] = y0;
        positions[idx + 2] = Math.sin(a) * coneR;
        vy[i] = opts.inward ? (Math.random() - 0.35) * 2.2 : (3.0 + Math.random() * 5.5) * speed;
      } else {
        positions[idx] = Math.cos(a) * r;
        positions[idx + 1] = 0.15 + Math.random() * 1.8;
        positions[idx + 2] = Math.sin(a) * r;
        vx[i] = Math.cos(a) * 0.5 * speed;
        vy[i] = (height * (0.45 + Math.random() * 0.65)) * speed;
        vz[i] = Math.sin(a) * 0.5 * speed;
      }
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: opts.size,
      map: this.getParticleGlowTex(),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: opts.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.position.set(pos.x, groundY + 0.08, pos.z);
    points.renderOrder = 8;
    points.frustumCulled = false;
    ctx.scene.add(points);

    const baseOpacity = 0.95;
    ctx.transientVfx.push({
      object: points,
      age: 0,
      lifetime: opts.lifetime,
      onUpdate: (t, dt) => {
        const arr = posAttr.array as Float32Array;
        const stepDt = Math.min(dt, 0.05);
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          if (opts.behavior === 'vortex') {
            angle[i] += swirl * speed * stepDt * (opts.inward ? 1.35 : 1.0);
            if (opts.inward) {
              radial[i] = Math.max(0.15, radial[i] - (radius / Math.max(0.4, opts.lifetime)) * stepDt * 1.15);
              arr[idx + 1] += vy[i] * stepDt;
              if (arr[idx + 1] < 0.2) arr[idx + 1] = 0.2;
            } else {
              radial[i] += radius * 0.22 * stepDt;
              arr[idx + 1] += vy[i] * stepDt;
              if (arr[idx + 1] > height * 1.15) arr[idx + 1] = 0.25;
            }
            arr[idx] = Math.cos(angle[i]) * radial[i];
            arr[idx + 2] = Math.sin(angle[i]) * radial[i];
          } else if (opts.behavior === 'fountain') {
            vy[i] -= gravity * stepDt;
            arr[idx] += vx[i] * stepDt;
            arr[idx + 1] += vy[i] * stepDt;
            arr[idx + 2] += vz[i] * stepDt;
            if (arr[idx + 1] < 0.08) {
              arr[idx + 1] = 0.08;
              vy[i] = Math.abs(vy[i]) * 0.28;
              vx[i] *= 0.6;
              vz[i] *= 0.6;
            }
          } else if (opts.behavior === 'rain') {
            arr[idx] += (vx[i] + Math.sin(t * 6 + i) * swirl * 0.5) * stepDt;
            arr[idx + 1] += vy[i] * stepDt;
            arr[idx + 2] += (vz[i] + Math.cos(t * 6 + i) * swirl * 0.5) * stepDt;
            if (arr[idx + 1] < 0.05) {
              arr[idx + 1] = height * (0.85 + Math.random() * 0.4);
            }
          } else if (opts.behavior === 'shock') {
            const drag = Math.max(0.84, 1 - 1.8 * stepDt);
            vx[i] *= drag;
            vz[i] *= drag;
            vy[i] -= gravity * 0.35 * stepDt;
            arr[idx] += vx[i] * stepDt;
            arr[idx + 1] = Math.max(0.08, arr[idx + 1] + vy[i] * stepDt);
            arr[idx + 2] += vz[i] * stepDt;
          } else {
            angle[i] += swirl * stepDt;
            arr[idx] += (vx[i] + Math.cos(angle[i]) * 0.6) * stepDt;
            arr[idx + 1] += vy[i] * stepDt;
            arr[idx + 2] += (vz[i] + Math.sin(angle[i]) * 0.6) * stepDt;
          }
        }
        posAttr.needsUpdate = true;
        mat.opacity = t < 0.7 ? baseOpacity : baseOpacity * (1 - (t - 0.7) / 0.3);
      },
    });
  }

  public spawnGodPowerParticles(ctx: AoMEngineContext, id: GodPowerId, worldPos: THREE.Vector3, radius: number) {
    const epicScale = ctx.age >= 5 ? 1.25 : 1.0;
    const countScale = ctx.isSoftwareGl ? 0.65 : epicScale;
    const n = (base: number) => Math.max(30, Math.round(base * countScale));

    switch (id) {
      case 'prosperity': {
        for (const b of ctx.buildings.values()) {
          if (b.team === 'player' && b.kind === 'town_center') {
            this.spawnDivineParticleBurst(ctx, b.mesh.position, {
              behavior: 'ascend',
              count: n(130),
              radius: 7.5,
              height: 14,
              primaryColor: 0xfacc15,
              secondaryColor: 0xfef08a,
              size: 1.35,
              lifetime: 2.1,
              swirl: 1.6,
            });
          }
        }
        break;
      }
      case 'rain': {
        for (const b of ctx.buildings.values()) {
          if (b.team === 'player' && (b.kind === 'town_center' || b.kind === 'farm')) {
            this.spawnDivineParticleBurst(ctx, b.mesh.position, {
              behavior: 'rain',
              count: n(110),
              radius: 9.0,
              height: 18,
              primaryColor: 0x38bdf8,
              secondaryColor: 0xbae6fd,
              size: 1.05,
              lifetime: 2.2,
              speed: 1.15,
            });
            this.spawnDivineParticleBurst(ctx, b.mesh.position, {
              behavior: 'ascend',
              count: n(55),
              radius: 6.5,
              height: 9,
              primaryColor: 0x22c55e,
              secondaryColor: 0x86efac,
              size: 1.15,
              lifetime: 1.9,
            });
          }
        }
        break;
      }
      case 'create_gold': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'fountain',
          count: n(150),
          radius: 6.5,
          height: 14,
          primaryColor: 0xffd700,
          secondaryColor: 0xf59e0b,
          size: 1.4,
          lifetime: 2.0,
          speed: 1.25,
          gravity: 11.0,
        });
        break;
      }
      case 'great_hunt': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'ascend',
          count: n(135),
          radius,
          height: 11,
          primaryColor: 0xfb923c,
          secondaryColor: 0xfde047,
          size: 1.25,
          lifetime: 2.0,
          swirl: 1.8,
        });
        break;
      }
      case 'healing':
      case 'restoration': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'ascend',
          count: n(id === 'restoration' ? 190 : 140),
          radius,
          height: 14,
          primaryColor: 0x34d399,
          secondaryColor: 0xfef08a,
          size: 1.35,
          lifetime: 2.2,
          swirl: 2.1,
        });
        if (id === 'restoration') {
          this.spawnRingVfx(ctx, worldPos, radius * 0.72, 0xfef08a, 1.9);
        }
        break;
      }
      case 'flaming_weapons': {
        let boosted = 0;
        for (const u of ctx.units.values()) {
          if (u.team === 'player' && (!ctx.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero))) {
            if (boosted < 16) {
              this.spawnDivineParticleBurst(ctx, u.mesh.position, {
                behavior: 'ascend',
                count: n(28),
                radius: 1.8,
                height: 5.5,
                primaryColor: 0xf97316,
                secondaryColor: 0xfde047,
                size: 1.1,
                lifetime: 1.4,
                swirl: 2.4,
              });
            }
            boosted++;
          }
        }
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'vortex',
          count: n(140),
          radius: 9,
          height: 12,
          primaryColor: 0xf97316,
          secondaryColor: 0xfef08a,
          size: 1.4,
          lifetime: 1.9,
        });
        break;
      }
      case 'sentinel': {
        const tc = ctx.findNearestTownCenter('player', worldPos);
        const center = tc ? tc.mesh.position : worldPos;
        this.spawnDivineParticleBurst(ctx, center, {
          behavior: 'fountain',
          count: n(160),
          radius: 8.5,
          height: 11,
          primaryColor: 0xd97706,
          secondaryColor: 0xfde047,
          size: 1.35,
          lifetime: 1.9,
          gravity: 9.0,
        });
        break;
      }
      case 'frost':
      case 'blizzard': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'rain',
          count: n(id === 'blizzard' ? 220 : 165),
          radius,
          height: 20,
          primaryColor: 0xbae6fd,
          secondaryColor: 0xffffff,
          size: 1.3,
          lifetime: 2.4,
          speed: 1.25,
          swirl: 2.8,
        });
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'shock',
          count: n(110),
          radius: radius * 0.9,
          height: 5.5,
          primaryColor: 0x38bdf8,
          secondaryColor: 0xe0f2fe,
          size: 1.25,
          lifetime: 1.4,
        });
        break;
      }
      case 'lightning':
      case 'lightning_storm':
      case 'solar_beam': {
        const isSolar = id === 'solar_beam';
        const isStorm = id === 'lightning_storm';
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: isStorm ? 'vortex' : 'shock',
          count: n(isStorm ? 210 : 150),
          radius,
          height: isStorm ? 22 : 13,
          primaryColor: isSolar ? 0xfde047 : 0x60a5fa,
          secondaryColor: 0xffffff,
          size: 1.45,
          lifetime: isStorm ? 2.2 : 1.4,
          speed: 1.45,
          swirl: isStorm ? 4.8 : 1.5,
        });
        if (isSolar) {
          this.spawnDivineParticleBurst(ctx, worldPos, {
            behavior: 'rain',
            count: n(120),
            radius: radius * 0.55,
            height: 26,
            primaryColor: 0xfef08a,
            secondaryColor: 0xf97316,
            size: 1.5,
            lifetime: 1.5,
            speed: 1.9,
          });
        }
        break;
      }
      case 'meteor':
      case 'volcanic_eruption': {
        const isVolcano = id === 'volcanic_eruption';
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'fountain',
          count: n(isVolcano ? 240 : 180),
          radius,
          height: isVolcano ? 22 : 16,
          primaryColor: 0xef4444,
          secondaryColor: 0xfde047,
          size: 1.65,
          lifetime: 2.4,
          speed: 1.35,
          gravity: 11.5,
        });
        if (isVolcano) {
          this.spawnDivineParticleBurst(ctx, worldPos, {
            behavior: 'vortex',
            count: n(140),
            radius: radius * 0.8,
            height: 20,
            primaryColor: 0x44403c,
            secondaryColor: 0xea580c,
            size: 1.9,
            lifetime: 2.6,
            additive: false,
          });
        }
        break;
      }
      case 'tornado': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'vortex',
          count: n(250),
          radius,
          height: 24,
          primaryColor: 0xe2e8f0,
          secondaryColor: 0x94a3b8,
          size: 1.55,
          lifetime: 2.7,
          speed: 1.45,
          swirl: 6.2,
          additive: false,
        });
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'shock',
          count: n(90),
          radius,
          height: 6,
          primaryColor: 0xc2b280,
          secondaryColor: 0xf1f5f9,
          size: 1.3,
          lifetime: 1.6,
        });
        break;
      }
      case 'tremor':
      case 'undermine': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'fountain',
          count: n(190),
          radius,
          height: 13,
          primaryColor: 0xd97706,
          secondaryColor: 0x57534e,
          size: 1.55,
          lifetime: 2.0,
          speed: 1.3,
          gravity: 14.0,
          additive: false,
        });
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'shock',
          count: n(110),
          radius,
          height: 4.5,
          primaryColor: 0xf59e0b,
          secondaryColor: 0xfef3c7,
          size: 1.25,
          lifetime: 1.35,
        });
        break;
      }
      case 'darkest_night': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'ascend',
          count: n(180),
          radius: 16,
          height: 20,
          primaryColor: 0xa855f7,
          secondaryColor: 0xf472b6,
          size: 1.5,
          lifetime: 2.5,
          swirl: 2.2,
        });
        let glowCount = 0;
        for (const u of ctx.units.values()) {
          if (u.team === 'player' && glowCount < 14) {
            this.spawnDivineParticleBurst(ctx, u.mesh.position, {
              behavior: 'ascend',
              count: n(24),
              radius: 1.6,
              height: 5.5,
              primaryColor: 0xc084fc,
              secondaryColor: 0xffffff,
              size: 1.05,
              lifetime: 1.5,
            });
            glowCount++;
          }
        }
        break;
      }
      case 'disease':
      case 'pestilence':
      case 'locust_swarm': {
        const isLocust = id === 'locust_swarm';
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'vortex',
          count: n(isLocust ? 230 : 170),
          radius,
          height: isLocust ? 15 : 13,
          primaryColor: isLocust ? 0xca8a04 : 0x84cc16,
          secondaryColor: isLocust ? 0x713f12 : 0x365314,
          size: isLocust ? 1.2 : 1.55,
          lifetime: 2.5,
          speed: isLocust ? 1.65 : 1.05,
          swirl: isLocust ? 5.6 : 2.6,
          additive: !isLocust,
        });
        break;
      }
      case 'sandstorm': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'vortex',
          count: n(240),
          radius,
          height: 18,
          primaryColor: 0xf59e0b,
          secondaryColor: 0xfde68a,
          size: 1.6,
          lifetime: 2.5,
          speed: 1.4,
          swirl: 5.2,
        });
        break;
      }
      case 'maelstrom':
      case 'black_hole': {
        const isBh = id === 'black_hole';
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'vortex',
          count: n(240),
          radius: radius * 1.15,
          height: isBh ? 14 : 18,
          primaryColor: isBh ? 0x7e22ce : 0x0ea5e9,
          secondaryColor: isBh ? 0xe879f9 : 0xe0f2fe,
          size: 1.55,
          lifetime: 2.5,
          speed: 1.4,
          swirl: isBh ? 5.4 : 4.8,
          inward: isBh,
        });
        if (isBh) {
          this.spawnDivineParticleBurst(ctx, worldPos, {
            behavior: 'shock',
            count: n(100),
            radius,
            height: 8,
            primaryColor: 0xc084fc,
            secondaryColor: 0x38bdf8,
            size: 1.4,
            lifetime: 1.7,
          });
        }
        break;
      }
      case 'necromancy':
      case 'walking_woods':
      case 'spiders': {
        const isNecro = id === 'necromancy';
        const isSpiders = id === 'spiders';
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: isSpiders ? 'shock' : 'ascend',
          count: n(165),
          radius,
          height: 12,
          primaryColor: isNecro ? 0x9333ea : isSpiders ? 0xdc2626 : 0x22c55e,
          secondaryColor: isNecro ? 0xe879f9 : isSpiders ? 0x84cc16 : 0xa3e635,
          size: 1.35,
          lifetime: 2.0,
          swirl: 2.4,
        });
        break;
      }
      case 'chaos': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'shock',
          count: n(170),
          radius,
          height: 12,
          primaryColor: 0xef4444,
          secondaryColor: 0xf97316,
          size: 1.45,
          lifetime: 1.8,
          speed: 1.35,
        });
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'vortex',
          count: n(110),
          radius: radius * 0.85,
          height: 14,
          primaryColor: 0xfacc15,
          secondaryColor: 0xdc2626,
          size: 1.25,
          lifetime: 2.0,
          swirl: 4.5,
        });
        break;
      }
      case 'traitors': {
        this.spawnDivineParticleBurst(ctx, worldPos, {
          behavior: 'vortex',
          count: n(160),
          radius,
          height: 14,
          primaryColor: 0xa855f7,
          secondaryColor: 0xfacc15,
          size: 1.35,
          lifetime: 2.1,
          swirl: 3.6,
        });
        break;
      }
    }
  }

  public spawnProjectile(
    ctx: AoMEngineContext,
    start: THREE.Vector3,
    end: THREE.Vector3,
    targetId: string,
    damage: number,
    team: TeamId,
    opts?: {
      splashRadius?: number;
      isBoulder?: boolean;
      isPetrify?: boolean;
      isFireball?: boolean;
      hasBallistics?: boolean;
      isFireArrow?: boolean;
      isPoisonArrow?: boolean;
      targetRadius?: number;
      attackerKind?: UnitKind;
      fromGreatHall?: boolean;
    }
  ) {
    const isBoulder = Boolean(opts?.isBoulder);
    const isPetrify = Boolean(opts?.isPetrify);
    const isFireball = Boolean(opts?.isFireball);
    const isFireArrow = Boolean(opts?.isFireArrow);
    const isPoisonArrow = Boolean(opts?.isPoisonArrow);
    const hasBallistics = Boolean(opts?.hasBallistics);
    const mesh = isBoulder
      ? new THREE.Mesh(this.boulderGeo, this.boulderMat)
      : isFireball
      ? new THREE.Mesh(this.fireOrbGeo, this.fireOrbMat)
      : isPetrify
      ? new THREE.Mesh(this.petrifyBoltGeo, this.petrifyBoltMat)
      : isPoisonArrow
      ? new THREE.Mesh(this.arrowGeo, this.poisonArrowMat)
      : isFireArrow
      ? new THREE.Mesh(this.arrowGeo, this.fireArrowMat)
      : new THREE.Mesh(this.arrowGeo, this.arrowMat);
    mesh.position.copy(start);
    ctx.scene.add(mesh);
    const dist = start.distanceTo(end);
    const baseDur = Math.max(isBoulder ? 0.35 : 0.18, dist / (isBoulder ? 16 : 24));
    const baseArc = Math.min(isBoulder ? 6.0 : 3.5, dist * (isBoulder ? 0.28 : 0.18));
    ctx.projectiles.push({
      mesh,
      start: start.clone(),
      end: end.clone(),
      targetId,
      damage,
      team,
      progress: 0,
      duration: hasBallistics ? baseDur * 0.7 : baseDur,
      arcHeight: hasBallistics ? baseArc * 0.78 : baseArc,
      splashRadius: opts?.splashRadius,
      isBoulder,
      isPetrify,
      isFireball,
      hasBallistics,
      isFireArrow,
      isPoisonArrow,
      targetRadius: opts?.targetRadius,
      attackerKind: opts?.attackerKind,
      fromGreatHall: opts?.fromGreatHall,
    });
  }

  public updateProjectiles(ctx: AoMEngineContext, dt: number) {
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      p.progress += dt / p.duration;
      if (p.progress >= 1) {
        ctx.removeAndDisposeMesh(p.mesh);
        ctx.projectiles.splice(i, 1);
        if (p.damage > 0) {
          const targetU = ctx.units.get(p.targetId);
          if (targetU) {
            const dodgeThreshold = (p.targetRadius ?? 0.5) + 1.5;
            const targetMovedDist = Math.hypot(targetU.mesh.position.x - p.end.x, targetU.mesh.position.z - p.end.z);
            const missedMovingTarget =
              !p.hasBallistics &&
              !p.isBoulder &&
              !p.isFireball &&
              targetU.state === 'move' &&
              targetMovedDist > dodgeThreshold;

            if (missedMovingTarget) {
              this.spawnRingVfx(ctx, p.end, 0.55, 0x94a3b8, 0.25);
            } else {
              if (p.isPetrify) {
                targetU.frozenTimer = Math.max(targetU.frozenTimer, 1.6);
                this.spawnRingVfx(ctx, targetU.mesh.position, 1.5, 0x2dd4bf, 0.45);
              }
              if (p.isPoisonArrow) {
                targetU.poisonTimer = 4.5;
                targetU.poisonTickTimer = Math.min(targetU.poisonTickTimer ?? 1.0, 0.75);
                targetU.poisonTeam = p.team;
                this.spawnRingVfx(ctx, targetU.mesh.position, 1.0, 0x4ade80, 0.35);
              }
              if (p.isFireArrow) {
                this.spawnRingVfx(ctx, targetU.mesh.position, 0.7, 0xf97316, 0.25);
              }
              ctx.damageUnit(targetU, p.damage, p.team);
              ctx.awardNorseCombatFavor(p.team, p.attackerKind, p.fromGreatHall, p.damage);
            }
          } else {
            const targetB = ctx.buildings.get(p.targetId);
            if (targetB) {
              if (p.isFireArrow) {
                this.spawnRingVfx(ctx, p.end, 1.15, 0xf97316, 0.35);
              }
              ctx.damageBuilding(targetB, p.damage);
              ctx.awardNorseCombatFavor(p.team, p.attackerKind, p.fromGreatHall, p.damage);
            }
          }

          if (p.splashRadius && p.splashRadius > 0) {
            this.spawnRingVfx(ctx, p.end, p.splashRadius, p.isFireball ? 0xfb923c : 0xf97316, 0.45);
            const splashDmg = Math.max(4, Math.round(p.damage * 0.55));
            for (const splashU of [...ctx.units.values()]) {
              if (
                ctx.getDiplomacy(p.team, splashU.team) === 'enemy' &&
                splashU.id !== p.targetId &&
                splashU.mesh.position.distanceTo(p.end) <= p.splashRadius
              ) {
                ctx.damageUnit(splashU, splashDmg, p.team);
                ctx.awardNorseCombatFavor(p.team, p.attackerKind, p.fromGreatHall, splashDmg);
              }
            }
            for (const splashB of [...ctx.buildings.values()]) {
              if (
                ctx.getDiplomacy(p.team, splashB.team) === 'enemy' &&
                splashB.id !== p.targetId &&
                splashB.mesh.position.distanceTo(p.end) - splashB.radius <= p.splashRadius
              ) {
                ctx.damageBuilding(splashB, splashDmg);
              }
            }
          }
        }
        continue;
      }

      const targetU = ctx.units.get(p.targetId);
      if (targetU) {
        if (p.hasBallistics || p.isBoulder || p.isFireball) {
          p.end.copy(targetU.mesh.position).setY(targetU.mesh.position.y + 1.0);
        }
      } else {
        const targetF = ctx.fauna.get(p.targetId);
        if (targetF) {
          p.end.copy(targetF.mesh.position).setY(targetF.mesh.position.y + 0.7);
        }
      }
      p.mesh.position.lerpVectors(p.start, p.end, p.progress);
      p.mesh.position.y += Math.sin(p.progress * Math.PI) * p.arcHeight;
      if (p.isBoulder || p.isFireball || p.isFireArrow || p.isPoisonArrow || p.isPetrify) {
        if (Math.random() < dt * 28) {
          ctx.vfxManager?.spawnParticles(
            p.mesh.position.x,
            p.mesh.position.y,
            p.mesh.position.z,
            1,
            {
              colorHex:
                p.isFireball || p.isFireArrow
                  ? 0xf97316
                  : p.isPoisonArrow
                  ? 0x4ade80
                  : p.isPetrify
                  ? 0x2dd4bf
                  : 0xcbd5e1,
              speed: 0.35,
              upSpeed: 0.35,
              lifetime: 0.28,
              startScale: p.isBoulder || p.isFireball ? 0.6 : 0.3,
              endScale: 0.04,
              gravity: -0.2,
              spread: 0.1,
            }
          );
        }
      }
      if (p.isBoulder || p.isFireball) {
        p.mesh.rotation.x += dt * 7.5;
        p.mesh.rotation.z += dt * 5.2;
      } else {
        p.mesh.lookAt(p.end);
        p.mesh.rotateX(Math.PI / 2);
      }
    }
  }

  public updateTransientVfx(ctx: AoMEngineContext, dt: number) {
    for (let i = ctx.transientVfx.length - 1; i >= 0; i--) {
      const v = ctx.transientVfx[i];
      v.age += dt;
      if (v.age >= v.lifetime) {
        ctx.scene.remove(v.object);
        v.object.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh || (obj as THREE.Line).isLine || (obj as THREE.Points).isPoints) {
            const m = obj as THREE.Mesh | THREE.Line | THREE.Points;
            m.geometry.dispose();
            if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
            else (m.material as THREE.Material).dispose();
          }
        });
        ctx.transientVfx.splice(i, 1);
        continue;
      }
      v.onUpdate(v.age / v.lifetime, dt);
    }
  }

  public dispose() {
    this.arrowGeo.dispose();
    this.arrowMat.dispose();
    this.fireArrowMat.dispose();
    this.poisonArrowMat.dispose();
    this.boulderGeo.dispose();
    this.boulderMat.dispose();
    this.fireOrbGeo.dispose();
    this.fireOrbMat.dispose();
    this.petrifyBoltGeo.dispose();
    this.petrifyBoltMat.dispose();
    if (this.particleGlowTex) {
      this.particleGlowTex.dispose();
      this.particleGlowTex = null;
    }
  }
}
