import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Eye, Sparkles, Waves, Wind, X, Zap } from 'lucide-react';
import {
  buildPoseidon,
  createPoseidonEnvironment,
  createPoseidonProceduralTextures,
  PoseidonMeshHierarchy
} from '../civilizacao/gregos/poseidonModel';

interface PoseidonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PoseidonViewerModal({ isOpen, onClose }: PoseidonViewerModalProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'conduzido' | 'correnteza' | 'golpe' | 'tsunami'>('conduzido');
  const [focusFace, setFocusFace] = useState(false);

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const focusFaceRef = useRef(focusFace);
  focusFaceRef.current = focusFace;

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const baseBg = new THREE.Color(0x0c4a6e);
    const stormBg = new THREE.Color(0x03111a);
    scene.background = baseBg.clone();
    scene.fog = new THREE.FogExp2(0x0c4a6e, 0.022);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 140);

    const hemi = new THREE.HemisphereLight(0xbae6fd, 0x042f2e, 0.65);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfef08a, 1.62);
    sun.position.set(4.5, 7.5, 5.0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 28 });
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const abyssUpLight = new THREE.DirectionalLight(0x2dd4bf, 0.78);
    abyssUpLight.position.set(0, -4, 2);
    scene.add(abyssUpLight);

    const tridentLight = new THREE.PointLight(0x2dd4bf, 1.35, 8);
    scene.add(tridentLight);

    const impactLight = new THREE.PointLight(0x99f6e4, 0, 14);
    scene.add(impactLight);

    const textures = createPoseidonProceduralTextures();
    const { oceanGeo, oceanPos, pillars } = createPoseidonEnvironment(scene, textures);

    const poseidon: PoseidonMeshHierarchy = buildPoseidon(textures);
    scene.add(poseidon.vessel);

    // Spray particles
    const SPRAY_N = 420;
    const sprayPos = new Float32Array(SPRAY_N * 3).fill(-100);
    const sprayVel = new Float32Array(SPRAY_N * 3);
    const sprayLife = new Float32Array(SPRAY_N);
    let sprayIdx = 0;

    const sprayGeo = new THREE.BufferGeometry();
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
    scene.add(
      new THREE.Points(
        sprayGeo,
        new THREE.PointsMaterial({
          color: 0xe0f2fe,
          size: 0.1,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      )
    );

    function spawnSpray(x: number, y: number, z: number, vxSpread = 3.5, vyMin = 1.5, vyMax = 4.8) {
      const i = sprayIdx;
      sprayIdx = (sprayIdx + 1) % SPRAY_N;
      sprayPos[i * 3] = x;
      sprayPos[i * 3 + 1] = y;
      sprayPos[i * 3 + 2] = z;
      sprayVel[i * 3] = (Math.random() - 0.5) * vxSpread;
      sprayVel[i * 3 + 1] = vyMin + Math.random() * (vyMax - vyMin);
      sprayVel[i * 3 + 2] = (Math.random() - 0.5) * vxSpread;
      sprayLife[i] = 0.65 + Math.random() * 0.5;
    }

    function updateSpray(dt: number) {
      for (let i = 0; i < SPRAY_N; i++) {
        if (sprayLife[i] <= 0) continue;
        sprayLife[i] -= dt;
        sprayVel[i * 3 + 1] -= 9.5 * dt;
        sprayPos[i * 3] += sprayVel[i * 3] * dt;
        sprayPos[i * 3 + 1] += sprayVel[i * 3 + 1] * dt;
        sprayPos[i * 3 + 2] += sprayVel[i * 3 + 2] * dt;
        if (sprayLife[i] <= 0) sprayPos[i * 3 + 1] = -100;
      }
      sprayGeo.attributes.position.needsUpdate = true;
    }

    const shockwaves: Array<{ mesh: THREE.Mesh; life: number; max: number; delay: number }> = [];
    const geysers: Array<{ mesh: THREE.Mesh; gx: number; gz: number; life: number; max: number; delay: number; erupted: boolean }> = [];
    const wakeRings: Array<{ mesh: THREE.Mesh; life: number; max: number }> = [];

    function spawnWakeRing(x: number, z: number) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.72, 32),
        new THREE.MeshBasicMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.08, z);
      scene.add(ring);
      wakeRings.push({ mesh: ring, life: 1.1, max: 1.1 });
    }

    function triggerTridentSlam(originX: number, originZ: number, facingYaw: number) {
      for (let k = 0; k < 3; k++) {
        const sw = new THREE.Mesh(
          new THREE.RingGeometry(0.35, 0.65, 48),
          new THREE.MeshBasicMaterial({
            color: k === 0 ? 0xe0f2fe : 0x2dd4bf,
            transparent: true,
            opacity: 0.58,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        sw.rotation.x = -Math.PI / 2;
        sw.position.set(originX, 0.14 + k * 0.03, originZ);
        scene.add(sw);
        shockwaves.push({ mesh: sw, life: 1.15, max: 1.15, delay: k * 0.12 });
      }

      const dirX = Math.sin(facingYaw);
      const dirZ = Math.cos(facingYaw);
      for (let g = 1; g <= 5; g++) {
        const gx = originX + dirX * (g * 1.15);
        const gz = originZ + dirZ * (g * 1.15);
        const gCol = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16 + g * 0.03, 0.38 + g * 0.04, 3.6, 18, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0x5eead4,
            transparent: true,
            opacity: 0.52,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        gCol.position.set(gx, 0.1, gz);
        gCol.scale.set(1, 0.01, 1);
        scene.add(gCol);
        geysers.push({ mesh: gCol, gx, gz, life: 1.1, max: 1.1, delay: g * 0.09, erupted: false });
      }

      impactLight.position.set(originX + dirX * 1.2, 1.2, originZ + dirZ * 1.2);
      impactLight.intensity = 3.6;
      for (let i = 0; i < 36; i++) spawnSpray(originX + dirX * 0.9, 0.25, originZ + dirZ * 0.9, 5.2, 2.2, 6.2);
    }

    // Tsunami setup
    const tsunamiGroup = new THREE.Group();
    tsunamiGroup.visible = false;
    scene.add(tsunamiGroup);

    const tsuWidth = 14.5;
    const tsuGeo = new THREE.PlaneGeometry(tsuWidth, 4.4, 48, 24);
    const tsuPos = tsuGeo.attributes.position;
    for (let i = 0; i < tsuPos.count; i++) {
      const x = tsuPos.getX(i);
      const y = tsuPos.getY(i);
      const v = Math.max(0, Math.min(1, (y + 2.2) / 4.4));
      const archForward = Math.sin(v * Math.PI * 0.85) * 1.65 + Math.pow(v, 3) * 1.1;
      const heightCurve = Math.pow(v, 0.78) * 4.5 - 0.2;
      const edgeDrop = 1 - Math.pow(Math.abs(x) / (tsuWidth * 0.5), 2.4) * 0.35;
      tsuPos.setXYZ(i, x, heightCurve * edgeDrop, archForward * edgeDrop);
    }
    tsuGeo.computeVertexNormals();

    const tsunamiWaveMesh = new THREE.Mesh(
      tsuGeo,
      new THREE.MeshStandardMaterial({
        map: textures.waterTex,
        color: 0x0284c7,
        emissive: new THREE.Color(0x0c4a6e),
        emissiveIntensity: 0.65,
        roughness: 0.16,
        metalness: 0.25,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      })
    );
    tsunamiGroup.add(tsunamiWaveMesh);

    const crestPuffs: Array<{ mesh: THREE.Mesh; baseY: number; baseZ: number; phase: number }> = [];
    const crestGeo = new THREE.SphereGeometry(0.45, 12, 10);
    const crestFoamMat = new THREE.MeshStandardMaterial({
      color: 0xf0f9ff,
      emissive: new THREE.Color(0x7dd3fc),
      emissiveIntensity: 0.45,
      roughness: 0.65,
      transparent: true,
      opacity: 0.9
    });
    for (let i = 0; i < 34; i++) {
      const u = (i / 33) - 0.5;
      const cx = u * (tsuWidth * 0.92);
      const edgeDrop = 1 - Math.pow(Math.abs(u * 2), 2.4) * 0.35;
      const cy = 4.25 * edgeDrop;
      const cz = 2.55 * edgeDrop;
      const puff = new THREE.Mesh(crestGeo, crestFoamMat);
      puff.position.set(cx, cy, cz);
      const sc = 0.85 + Math.random() * 0.55;
      puff.scale.set(1.4 * sc, 0.85 * sc, 1.2 * sc);
      tsunamiGroup.add(puff);
      crestPuffs.push({ mesh: puff, baseY: cy, baseZ: cz, phase: i * 0.6 });
    }

    let tsunamiZ = -13;
    let tsunamiActive = false;

    function launchTsunami() {
      tsunamiActive = true;
      tsunamiZ = -12.5;
      tsunamiGroup.visible = true;
      tsunamiGroup.position.set(0, 0, tsunamiZ);
    }

    // Camera orbit parameters
    let camAngle = 0.48;
    let camPitch = 0.22;
    let camDist = 9.2;
    let targetCamDist = 9.2;
    const currentLookAt = new THREE.Vector3(0, 2.0, 0);

    let dragging = false;
    let lastX = 0, lastY = 0;
    let pinchStartDist = 0;

    let slamAnim = 0;
    let slamTriggeredInCycle = false;
    let wakeTimer = 0;
    let stormW = 0;
    let quakeShake = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerUp = () => { dragging = false; };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      camAngle -= (e.clientX - lastX) * 0.009;
      camPitch = THREE.MathUtils.clamp(camPitch + (e.clientY - lastY) * 0.006, -0.25, 0.85);
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCamDist = THREE.MathUtils.clamp(targetCamDist + e.deltaY * 0.005, 1.9, 16.0);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = pinchStartDist - dist;
        targetCamDist = THREE.MathUtils.clamp(targetCamDist + delta * 0.015, 1.9, 16.0);
        pinchStartDist = dist;
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let elapsed = 0;
    let animId: number;

    const deepColor = new THREE.Color(0x032539);
    const shallowColor = new THREE.Color(0x0284c7);
    const crestFoamColor = new THREE.Color(0xbae6fd);
    const tmpV = new THREE.Vector3();

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      const currentMode = modeRef.current;
      const isFocused = focusFaceRef.current;

      const isStorm = (currentMode === 'tsunami' || tsunamiActive);
      const stormTarget = isStorm ? 1 : 0;
      stormW = THREE.MathUtils.damp(stormW, stormTarget, 2.2, dt);

      // 1. Ocean Waves
      const waveAmp = 0.14 + stormW * 0.24;
      const oColorAttr = oceanGeo.attributes.color;
      for (let i = 0; i < oceanPos.count; i++) {
        const ox = oceanPos.getX(i);
        const oz = oceanPos.getZ(i);
        const distFromCenter = Math.hypot(ox, oz);

        const w1 = Math.sin(ox * 0.75 + elapsed * 2.2) * Math.cos(oz * 0.65 + elapsed * 1.7);
        const w2 = Math.sin(distFromCenter * 1.4 - elapsed * 3.1) * 0.45;
        const h = (w1 + w2) * waveAmp;
        oceanPos.setY(i, h);

        const normH = THREE.MathUtils.clamp((h + waveAmp) / (waveAmp * 2), 0, 1);
        const c = deepColor.clone().lerp(shallowColor, normH);
        if (normH > 0.74) c.lerp(crestFoamColor, (normH - 0.74) * 2.6);
        oColorAttr.setXYZ(i, c.r, c.g, c.b);
      }
      oceanPos.needsUpdate = true;
      oColorAttr.needsUpdate = true;
      oceanGeo.computeVertexNormals();

      for (const p of pillars) {
        p.group.position.y = p.baseY + Math.sin(elapsed * 1.5 + p.phase) * 0.05;
      }

      // 2. Poseidon vortex motion
      let vx = 0, vz = 0, yaw = Math.sin(elapsed * 0.4) * 0.18, tiltPitch = 0.04, tiltRoll = 0;
      const seaLevel = Math.sin(vx * 0.75 + elapsed * 2.2) * Math.cos(vz * 0.65 + elapsed * 1.7) * waveAmp;

      if (currentMode === 'correnteza') {
        const a = elapsed * 0.62;
        const R = 3.1;
        vx = Math.cos(a) * R;
        vz = Math.sin(a) * R;
        yaw = -a;
        tiltPitch = 0.18;
        tiltRoll = -0.22;

        wakeTimer -= dt;
        if (wakeTimer <= 0) {
          wakeTimer = 0.11;
          spawnWakeRing(vx, vz);
          for (let s = 0; s < 4; s++) spawnSpray(vx, 0.15, vz, 2.8, 0.8, 2.4);
        }
      } else {
        vx = Math.sin(elapsed * 0.55) * 0.45;
        vz = Math.cos(elapsed * 0.42) * 0.35;
        if (Math.random() < 0.35) spawnSpray(vx + (Math.random() - 0.5) * 1.2, 0.12, vz + (Math.random() - 0.5) * 1.2, 1.8, 0.6, 1.8);
      }

      poseidon.vessel.position.set(vx, seaLevel * 0.65, vz);
      poseidon.vessel.rotation.set(0, yaw, 0);
      poseidon.body.rotation.set(tiltPitch, 0, tiltRoll);

      poseidon.vortexCone.rotation.y += dt * (currentMode === 'correnteza' ? 5.2 : 3.0);
      poseidon.baseFoam.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.06);
      for (const sw of poseidon.swirlRings) {
        sw.mesh.rotation.z += dt * 4.5;
        sw.mesh.position.y = sw.baseY + Math.sin(elapsed * 3.5 + sw.phase) * 0.05;
      }

      // 3. Trident Pose
      if (currentMode === 'golpe') {
        slamAnim += dt * 0.85;
        if (slamAnim >= 1.0) {
          slamAnim = 0.001;
          slamTriggeredInCycle = false;
        }

        if (slamAnim < 0.42) {
          const k = slamAnim / 0.42;
          poseidon.rightArm.arm.rotation.set(-0.95 * k, 0.1, 2.75 * k);
          poseidon.rightArm.elbow.rotation.set(0.85 * k, 0.1, 0.2);
          poseidon.trident.rotation.set(-0.45 * k, 0, -0.25);
          poseidon.torso.rotation.x = -0.18 * k;
        } else if (slamAnim < 0.62) {
          const k = (slamAnim - 0.42) / 0.20;
          poseidon.rightArm.arm.rotation.set(-0.95 + 1.55 * k, 0.1, 2.75 - 2.35 * k);
          poseidon.rightArm.elbow.rotation.set(0.85 - 0.55 * k, 0.1, 0.2);
          poseidon.trident.rotation.set(-0.45 + 0.85 * k, 0, -0.25);
          poseidon.torso.rotation.x = -0.18 + 0.42 * k;

          if (k > 0.75 && !slamTriggeredInCycle) {
            slamTriggeredInCycle = true;
            triggerTridentSlam(vx, vz, yaw);
            quakeShake = 0.14;
          }
        } else {
          const k = (slamAnim - 0.62) / 0.38;
          poseidon.rightArm.arm.rotation.set(0.60 * (1 - k) - 0.18 * k, 0.12, 0.40 * (1 - k) + 0.55 * k);
          poseidon.rightArm.elbow.rotation.set(0.30, 0.15, 0.2);
          poseidon.trident.rotation.set(0.40 * (1 - k) + 0.18 * k, 0, -0.38 * k);
          poseidon.torso.rotation.x = 0.24 * (1 - k);
        }
      } else if (currentMode === 'correnteza') {
        poseidon.rightArm.arm.rotation.set(0.38, 0.15, 0.72);
        poseidon.rightArm.elbow.rotation.set(-0.45, 0.1, 0.25);
        poseidon.trident.rotation.set(0.88, 0.1, -0.35);
        poseidon.torso.rotation.x = 0.14;
      } else if (currentMode === 'tsunami') {
        if (!tsunamiActive) launchTsunami();
        poseidon.rightArm.arm.rotation.set(-0.55, 0.15, 2.35 + Math.sin(elapsed * 2) * 0.05);
        poseidon.rightArm.elbow.rotation.set(0.55, 0.2, 0.28);
        poseidon.trident.rotation.set(0.22, 0, -0.24);
        poseidon.torso.rotation.x = -0.06;
      } else {
        poseidon.rightArm.arm.rotation.set(-0.18, 0.12, 0.55 + Math.sin(elapsed * 1.4) * 0.03);
        poseidon.rightArm.elbow.rotation.set(-0.52, 0.15, 0.22);
        poseidon.trident.rotation.set(0.18, 0, -0.46);
        poseidon.torso.rotation.x = 0.02;
      }

      poseidon.leftArm.arm.rotation.set(0.28, -0.22, -0.76 + Math.cos(elapsed * 1.3) * 0.04);
      poseidon.leftArm.elbow.rotation.set(-0.55, -0.25, -0.2);

      poseidon.tridentCore.rotation.y += dt * 2.5;
      poseidon.tridentHalo.rotation.z -= dt * 3.2;
      const powerBoost = (currentMode === 'golpe' || currentMode === 'tsunami') ? 1.5 : 1.0;
      poseidon.tridentTipGlow.scale.setScalar((0.9 + Math.sin(elapsed * 12) * 0.18) * powerBoost);

      poseidon.tridentTipAnchor.getWorldPosition(tmpV);
      tridentLight.position.copy(tmpV);
      tridentLight.intensity = 2.0 * powerBoost + Math.sin(elapsed * 14) * 0.35;

      const wind = (currentMode === 'correnteza' || currentMode === 'tsunami') ? 1.9 : 1.0;
      for (const b of poseidon.beardBraids) {
        b.group.rotation.x = Math.sin(elapsed * 2.5 * wind + b.phase) * 0.045;
        b.group.rotation.z = b.side * 0.04 + Math.cos(elapsed * 2.1 * wind + b.phase) * 0.035;
      }
      for (const s of poseidon.hairStrands) {
        s.mesh.rotation.x = Math.sin(elapsed * 2.4 * wind + s.phase) * 0.045;
        s.mesh.rotation.z = Math.cos(elapsed * 1.9 * wind + s.phase) * 0.038;
      }

      const cAttr = poseidon.cape.geometry.attributes.position;
      for (let i = 0; i < cAttr.count; i++) {
        const bx = poseidon.capeBase[i * 3];
        const by = poseidon.capeBase[i * 3 + 1];
        const bz = poseidon.capeBase[i * 3 + 2];
        const normY = (0.94 - by) / 1.88;
        const wave1 = Math.sin(elapsed * 3.2 * wind - normY * 4.5 + bx * 2.5) * 0.14 * normY;
        const wave2 = Math.cos(elapsed * 2.2 * wind - normY * 3.0) * 0.06 * normY;
        cAttr.setXYZ(i, bx + Math.sin(elapsed * 2.4 - normY * 3.0) * 0.035 * normY, by, bz + wave1 + wave2);
      }
      cAttr.needsUpdate = true;
      poseidon.cape.geometry.computeVertexNormals();

      const skAttr = poseidon.skirtMesh.geometry.attributes.position;
      for (let i = 0; i < skAttr.count; i++) {
        const bx = poseidon.skirtBase[i * 3];
        const by = poseidon.skirtBase[i * 3 + 1];
        const bz = poseidon.skirtBase[i * 3 + 2];
        const normY = (0.43 - by) / 0.86;
        skAttr.setZ(i, bz + Math.sin(elapsed * 3.4 * wind - normY * 4.0 + bx * 4.0) * 0.04 * normY);
      }
      skAttr.needsUpdate = true;
      poseidon.skirtMesh.geometry.computeVertexNormals();

      for (let i = wakeRings.length - 1; i >= 0; i--) {
        const w = wakeRings[i];
        w.life -= dt;
        const k = Math.max(0, w.life / w.max);
        w.mesh.scale.setScalar(1 + (1 - k) * 3.2);
        (w.mesh.material as THREE.MeshBasicMaterial).opacity = 0.65 * k;
        if (w.life <= 0) {
          scene.remove(w.mesh);
          w.mesh.geometry.dispose();
          if (Array.isArray(w.mesh.material)) w.mesh.material.forEach(m => m.dispose());
          else w.mesh.material.dispose();
          wakeRings.splice(i, 1);
        }
      }

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        if (sw.delay > 0) { sw.delay -= dt; continue; }
        sw.life -= dt;
        const k = Math.max(0, sw.life / sw.max);
        sw.mesh.scale.setScalar(1 + (1 - k) * 9.5);
        (sw.mesh.material as THREE.MeshBasicMaterial).opacity = 0.92 * k;
        if (sw.life <= 0) {
          scene.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          if (Array.isArray(sw.mesh.material)) sw.mesh.material.forEach(m => m.dispose());
          else sw.mesh.material.dispose();
          shockwaves.splice(i, 1);
        }
      }

      for (let i = geysers.length - 1; i >= 0; i--) {
        const g = geysers[i];
        if (g.delay > 0) { g.delay -= dt; continue; }
        if (!g.erupted) {
          g.erupted = true;
          for (let s = 0; s < 14; s++) spawnSpray(g.gx, 0.3, g.gz, 3.2, 3.0, 6.8);
        }
        g.life -= dt;
        const k = Math.max(0, g.life / g.max);
        const heightCurve = Math.sin((1 - k) * Math.PI);
        g.mesh.scale.y = Math.max(0.01, heightCurve * 1.15);
        g.mesh.position.y = 1.8 * g.mesh.scale.y;
        g.mesh.rotation.y += dt * 5.0;
        (g.mesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * k;
        if (g.life <= 0) {
          scene.remove(g.mesh);
          g.mesh.geometry.dispose();
          if (Array.isArray(g.mesh.material)) g.mesh.material.forEach(m => m.dispose());
          else g.mesh.material.dispose();
          geysers.splice(i, 1);
        }
      }

      if (tsunamiActive) {
        tsunamiZ += dt * 6.8;
        tsunamiGroup.position.z = tsunamiZ;

        for (const puff of crestPuffs) {
          puff.mesh.position.y = puff.baseY + Math.sin(elapsed * 8 + puff.phase) * 0.16;
          puff.mesh.position.z = puff.baseZ + Math.cos(elapsed * 7 + puff.phase) * 0.14;
        }
        for (let s = 0; s < 6; s++) {
          const rx = (Math.random() - 0.5) * 12;
          spawnSpray(rx, 3.8, tsunamiZ + 2.3, 4.2, 1.5, 4.2);
        }

        if (Math.abs(tsunamiZ - vz) < 1.2) {
          quakeShake = 0.12;
        }

        if (tsunamiZ > 13.5) {
          if (currentMode === 'tsunami') {
            tsunamiZ = -13.0;
          } else {
            tsunamiActive = false;
            tsunamiGroup.visible = false;
          }
        }
      }

      impactLight.intensity = Math.max(0, impactLight.intensity - dt * 12);
      updateSpray(dt);

      scene.background = scene.background instanceof THREE.Color ? scene.background.lerpColors(baseBg, stormBg, stormW) : baseBg;
      if (scene.fog) scene.fog.color.copy(scene.background);
      sun.intensity = 2.25 - 1.35 * stormW;
      hemi.intensity = 0.95 - 0.35 * stormW;

      quakeShake = Math.max(0, quakeShake - dt * 0.3);
      const shakeX = (Math.random() - 0.5) * quakeShake;
      const shakeY = (Math.random() - 0.5) * quakeShake;

      targetCamDist = isFocused ? 2.85 : targetCamDist;
      camDist = THREE.MathUtils.damp(camDist, targetCamDist, 6, dt);
      if (!dragging && !isFocused) camAngle += dt * 0.055;

      const desiredTarget = isFocused
        ? new THREE.Vector3(vx + 0.18, 3.12 + seaLevel * 0.65, vz)
        : new THREE.Vector3(0, 2.05, 0);
      currentLookAt.lerp(desiredTarget, 0.12);

      const horizDist = Math.cos(camPitch) * camDist;
      const vertDist = Math.sin(camPitch) * camDist;
      camera.position.set(
        currentLookAt.x + Math.sin(camAngle) * horizDist + shakeX,
        currentLookAt.y + vertDist + shakeY,
        currentLookAt.z + Math.cos(camAngle) * horizDist
      );
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      renderer.dispose();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#04151f]">
        {/* Top bar controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between pointer-events-none gap-3">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setMode('conduzido')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                mode === 'conduzido'
                  ? 'bg-gradient-to-r from-teal-400 to-sky-600 text-slate-950 ring-2 ring-teal-300 shadow-teal-500/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-teal-100 border border-teal-500/30'
              }`}
            >
              <Compass className="w-4 h-4" />
              Conduzido pelas Águas
            </button>
            <button
              onClick={() => setMode('correnteza')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                mode === 'correnteza'
                  ? 'bg-gradient-to-r from-teal-400 to-sky-600 text-slate-950 ring-2 ring-teal-300 shadow-teal-500/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-teal-100 border border-teal-500/30'
              }`}
            >
              <Wind className="w-4 h-4" />
              Navegar na Correnteza
            </button>
            <button
              onClick={() => setMode('golpe')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                mode === 'golpe'
                  ? 'bg-gradient-to-r from-teal-400 to-sky-600 text-slate-950 ring-2 ring-teal-300 shadow-teal-500/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-teal-100 border border-teal-500/30'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Golpe do Tridente
            </button>
            <button
              onClick={() => setMode('tsunami')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                mode === 'tsunami'
                  ? 'bg-gradient-to-r from-teal-400 to-sky-600 text-slate-950 ring-2 ring-teal-300 shadow-teal-500/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-teal-100 border border-teal-500/30'
              }`}
            >
              <Waves className="w-4 h-4 text-cyan-300" />
              Tsunami
            </button>
            <button
              onClick={() => setFocusFace(!focusFace)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                focusFace
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 ring-2 ring-yellow-300'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-amber-200 border border-amber-400/40'
              }`}
            >
              <Eye className="w-4 h-4" />
              {focusFace ? 'Visão Geral' : 'Focar Rosto / Tridente'}
            </button>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-teal-500/40 px-3 py-1.5 rounded-xl shadow-lg">
              <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Poseidon • Senhor dos Mares & Terremotos
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950/80 hover:bg-red-900/80 text-slate-300 hover:text-white border border-white/20 transition-all shadow-lg cursor-pointer"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Bottom hint banner */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-slate-950/80 border border-teal-500/30 px-4 py-1.5 rounded-full text-xs text-teal-100 shadow-xl backdrop-blur-md flex items-center gap-2">
            <span>🖱️ Arraste para girar 360°</span>
            <span className="text-white/40">•</span>
            <span>📜 Scroll / Pinça para zoom</span>
            <span className="text-white/40">•</span>
            <span className="text-teal-300 font-semibold">🌊 Deus Maior dos Gregos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
