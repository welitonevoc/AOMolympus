import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CloudLightning, Compass, Eye, Sparkles, Wind, X, Zap } from 'lucide-react';
import {
  buildZeus,
  createZeusProceduralTextures,
  createZeusTempleEnvironment,
  ZeusMeshHierarchy
} from '../civilizacao/gregos/zeusModel';

interface ZeusViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ZeusViewerModal({ isOpen, onClose }: ZeusViewerModalProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'pairar' | 'voar' | 'raios' | 'tempestade'>('pairar');
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

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Scene & Fog
    const scene = new THREE.Scene();
    const baseBg = new THREE.Color(0x7fb8bd);
    const stormBg = new THREE.Color(0x243d46);
    scene.background = baseBg.clone();
    scene.fog = new THREE.FogExp2(0x7fb8bd, 0.018);

    // Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 120);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x475569, 1.05);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfffbeb, 2.15);
    sun.position.set(3.5, 6.8, 4.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 25 });
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.25);
    rimLight.position.set(-3, 4.5, -5);
    scene.add(rimLight);

    const goldLight = new THREE.PointLight(0xffd76a, 1.6, 7);
    scene.add(goldLight);

    const flashLight = new THREE.PointLight(0xfff3c4, 0, 10);
    scene.add(flashLight);

    // Textures & Environment
    const textures = createZeusProceduralTextures();
    const { clouds } = createZeusTempleEnvironment(scene, textures);

    // Ground blob shadow
    function createShadowTex() {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      if (g) {
        const gr = g.createRadialGradient(64, 64, 6, 64, 64, 64);
        gr.addColorStop(0, 'rgba(0,0,0,0.48)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, 128, 128);
      }
      return new THREE.CanvasTexture(c);
    }
    const blob = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: createShadowTex(), transparent: true, depthWrite: false })
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.02;
    scene.add(blob);

    // Zeus Mesh
    const zeus: ZeusMeshHierarchy = buildZeus(textures);
    scene.add(zeus.flight);

    // Spark particles
    const SPARK_N = 280;
    const sparkPos = new Float32Array(SPARK_N * 3).fill(-100);
    const sparkVel = new Float32Array(SPARK_N * 3);
    const sparkLife = new Float32Array(SPARK_N);
    let sparkIdx = 0;

    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    scene.add(
      new THREE.Points(
        sparkGeo,
        new THREE.PointsMaterial({
          color: 0xfff3a0,
          size: 0.095,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false
        })
      )
    );

    function spawnSpark(p: THREE.Vector3) {
      const i = sparkIdx;
      sparkIdx = (sparkIdx + 1) % SPARK_N;
      sparkPos[i * 3] = p.x;
      sparkPos[i * 3 + 1] = 0.1;
      sparkPos[i * 3 + 2] = p.z;
      sparkVel[i * 3] = (Math.random() - 0.5) * 3.4;
      sparkVel[i * 3 + 1] = Math.random() * 3.5 + 1.2;
      sparkVel[i * 3 + 2] = (Math.random() - 0.5) * 3.4;
      sparkLife[i] = 0.55 + Math.random() * 0.45;
    }

    function updateSparks(dt: number) {
      for (let i = 0; i < SPARK_N; i++) {
        if (sparkLife[i] <= 0) continue;
        sparkLife[i] -= dt;
        sparkVel[i * 3 + 1] -= 9.5 * dt;
        sparkPos[i * 3] += sparkVel[i * 3] * dt;
        sparkPos[i * 3 + 1] += sparkVel[i * 3 + 1] * dt;
        sparkPos[i * 3 + 2] += sparkVel[i * 3 + 2] * dt;
        if (sparkLife[i] <= 0) sparkPos[i * 3 + 1] = -100;
      }
      sparkGeo.attributes.position.needsUpdate = true;
    }

    // Lightning bolts and flashes
    const bolts: Array<{ meshes: THREE.Mesh[]; life: number; max: number }> = [];
    const flashes: Array<{ mesh: THREE.Mesh; life: number; max: number }> = [];
    const coreBase = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    const glowBase = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    const electricBase = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    const flashBase = new THREE.MeshBasicMaterial({
      color: 0xfff7c2,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    const tmpV = new THREE.Vector3();

    function makeBolt(from: THREE.Vector3, to: THREE.Vector3) {
      const pts = [from.clone()];
      const len = from.distanceTo(to);
      const n = Math.max(6, Math.round(len * 3.5));
      for (let i = 1; i < n; i++) {
        const p = from.clone().lerp(to, i / n);
        const j = len * 0.04;
        p.x += (Math.random() - 0.5) * j;
        p.y += (Math.random() - 0.5) * j;
        p.z += (Math.random() - 0.5) * j;
        pts.push(p);
      }
      pts.push(to.clone());
      const curve = new THREE.CatmullRomCurve3(pts);

      const core = new THREE.Mesh(new THREE.TubeGeometry(curve, n * 6, 0.022, 6, false), coreBase.clone());
      const goldHalo = new THREE.Mesh(new THREE.TubeGeometry(curve, n * 6, 0.075, 6, false), glowBase.clone());
      const blueHalo = new THREE.Mesh(new THREE.TubeGeometry(curve, n * 6, 0.13, 6, false), electricBase.clone());
      scene.add(core, goldHalo, blueHalo);
      bolts.push({ meshes: [core, goldHalo, blueHalo], life: 0.48, max: 0.48 });
    }

    function impact(p: THREE.Vector3) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), flashBase.clone());
      m.position.set(p.x, 0.22, p.z);
      scene.add(m);
      flashes.push({ mesh: m, life: 0.35, max: 0.35 });
      flashLight.position.set(p.x, 0.7, p.z);
      flashLight.intensity = 9.5;
      for (let i = 0; i < 18; i++) spawnSpark(p);
    }

    let recoil = 0;
    function fireBolt() {
      zeus.flight.updateMatrixWorld(true);
      zeus.handAnchor.getWorldPosition(tmpV);
      const from = tmpV.clone();
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 3.4;
      const to = new THREE.Vector3(Math.cos(a) * r, 0.05, Math.sin(a) * r);
      makeBolt(from, to);
      impact(to);
      recoil = 1;
    }

    // Camera orbit parameters
    let camAngle = 0.55;
    let camPitch = 0.18;
    let camDist = 8.6;
    let targetCamDist = 8.6;
    const currentLookAt = new THREE.Vector3(0, 1.85, 0);

    let dragging = false;
    let lastX = 0, lastY = 0;
    let pinchStartDist = 0;

    let fireTimer = 0.15;
    let stormW = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerUp = () => { dragging = false; };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      camAngle -= (e.clientX - lastX) * 0.009;
      camPitch = THREE.MathUtils.clamp(camPitch + (e.clientY - lastY) * 0.006, -0.35, 0.85);
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCamDist = THREE.MathUtils.clamp(targetCamDist + e.deltaY * 0.005, 1.8, 15.0);
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
        targetCamDist = THREE.MathUtils.clamp(targetCamDist + delta * 0.015, 1.8, 15.0);
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

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      const currentMode = modeRef.current;
      const isFocused = focusFaceRef.current;

      // Flight trajectory
      let x = 0, z = 0, yaw = Math.sin(elapsed * 0.35) * 0.22, roll = 0, pitch = 0.08;
      let h = 1.45 + Math.sin(elapsed * 1.1) * 0.11;

      if (currentMode === 'voar') {
        const a = elapsed * 0.45, R = 3.0;
        x = Math.cos(a) * R;
        z = Math.sin(a) * R;
        yaw = -a;
        roll = -0.32;
        pitch = 0.24;
        h = 1.95 + Math.sin(elapsed * 0.8) * 0.18;
      }

      zeus.flight.position.set(x, h, z);
      zeus.flight.rotation.set(0, yaw, 0);
      zeus.body.rotation.set(pitch, 0, roll);

      zeus.legs.R.hip.rotation.x = 0.18 + Math.sin(elapsed * 1.4) * 0.07;
      zeus.legs.L.hip.rotation.x = -0.48 + Math.sin(elapsed * 1.4 + 1.1) * 0.07;

      recoil = Math.max(0, recoil - dt * 3.2);
      zeus.rightArm.arm.rotation.z = 2.38 + Math.sin(elapsed * 1.6) * 0.04 - recoil * 0.25;
      zeus.rightArm.arm.rotation.x = -0.35 + recoil * 0.38;
      zeus.rightArm.elbow.rotation.x = 0.55 - recoil * 0.35;
      zeus.leftArm.arm.rotation.z = -0.78 + Math.cos(elapsed * 1.3) * 0.04;

      const charging = (currentMode === 'raios' || currentMode === 'tempestade') ? 1 : 0.35;
      const pulse = 1 + Math.sin(elapsed * 16) * 0.16;
      zeus.handGlow.scale.setScalar((0.85 + 0.65 * charging) * pulse);
      zeus.handGlow.material.opacity = 0.4 + 0.45 * charging;
      zeus.leftOrb.scale.setScalar(0.9 + Math.cos(elapsed * 14) * 0.15 + 0.35 * charging);

      const windFactor = (currentMode === 'voar' || currentMode === 'tempestade') ? 1.8 : 1.0;
      for (const b of zeus.beardLocks) {
        b.mesh.rotation.x = b.rx + Math.sin(elapsed * 2.8 * windFactor + b.phase) * 0.045;
        b.mesh.rotation.z = b.rz + Math.cos(elapsed * 2.2 * windFactor + b.phase) * 0.035;
      }
      for (const s of zeus.hairStrands) {
        s.mesh.rotation.x = Math.sin(elapsed * 2.5 * windFactor + s.phase) * 0.04;
        s.mesh.rotation.z = Math.cos(elapsed * 2.0 * windFactor + s.phase) * 0.035;
      }

      const cAttr = zeus.cape.geometry.attributes.position;
      for (let i = 0; i < cAttr.count; i++) {
        const bx = zeus.capeBase[i * 3];
        const by = zeus.capeBase[i * 3 + 1];
        const bz = zeus.capeBase[i * 3 + 2];
        const normY = (0.91 - by) / 1.82;
        const wave1 = Math.sin(elapsed * 3.4 * windFactor - normY * 4.5 + bx * 2.6) * 0.14 * normY;
        const wave2 = Math.cos(elapsed * 2.3 * windFactor - normY * 3.0) * 0.06 * normY;
        cAttr.setXYZ(i, bx + Math.sin(elapsed * 2.5 - normY * 3.0) * 0.035 * normY, by, bz + wave1 + wave2);
      }
      cAttr.needsUpdate = true;
      zeus.cape.geometry.computeVertexNormals();

      const skAttr = zeus.skirtMesh.geometry.attributes.position;
      for (let i = 0; i < skAttr.count; i++) {
        const bx = zeus.skirtBase[i * 3];
        const by = zeus.skirtBase[i * 3 + 1];
        const bz = zeus.skirtBase[i * 3 + 2];
        const normY = (0.42 - by) / 0.84;
        skAttr.setZ(i, bz + Math.sin(elapsed * 3.5 * windFactor - normY * 4.0 + bx * 4.0) * 0.04 * normY);
      }
      skAttr.needsUpdate = true;
      zeus.skirtMesh.geometry.computeVertexNormals();

      zeus.ring1.material.opacity = 0.38 + 0.22 * Math.sin(elapsed * 2.2);
      zeus.ring2.rotation.z += dt * 0.65;

      if (currentMode === 'raios' || currentMode === 'tempestade') {
        const rate = currentMode === 'tempestade' ? 0.18 : 0.88;
        fireTimer -= dt;
        if (fireTimer <= 0) {
          fireTimer = rate * (0.7 + Math.random() * 0.6);
          fireBolt();
          if (currentMode === 'tempestade' && Math.random() < 0.42) fireBolt();
        }
      }

      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.life -= dt;
        const k = Math.max(0, b.life / b.max);
        (b.meshes[0].material as THREE.MeshBasicMaterial).opacity = k;
        (b.meshes[1].material as THREE.MeshBasicMaterial).opacity = 0.6 * k;
        (b.meshes[2].material as THREE.MeshBasicMaterial).opacity = 0.45 * k;
        if (b.life <= 0) {
          b.meshes.forEach((m) => {
            scene.remove(m);
            m.geometry.dispose();
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => mat.dispose());
            } else {
              m.material.dispose();
            }
          });
          bolts.splice(i, 1);
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= dt;
        const k = Math.max(0, f.life / f.max);
        f.mesh.scale.setScalar(1 + (1 - k) * 1.6);
        (f.mesh.material as THREE.MeshBasicMaterial).opacity = 0.92 * k;
        if (f.life <= 0) {
          scene.remove(f.mesh);
          f.mesh.geometry.dispose();
          if (Array.isArray(f.mesh.material)) {
            f.mesh.material.forEach((mat) => mat.dispose());
          } else {
            f.mesh.material.dispose();
          }
          flashes.splice(i, 1);
        }
      }
      flashLight.intensity = Math.max(0, flashLight.intensity - dt * 14);
      updateSparks(dt);

      for (const c of clouds) {
        c.g.position.y = c.baseY + Math.sin(elapsed * 0.65 + c.ph) * 0.08;
      }

      blob.position.set(x, 0.02, z);
      const s = Math.max(0.55, 1.9 - h * 0.22);
      blob.scale.set(s, s, 1);
      blob.material.opacity = Math.max(0.18, 0.85 - (h - 1) * 0.22);

      const stormTarget = currentMode === 'tempestade' ? 1 : 0;
      stormW = THREE.MathUtils.damp(stormW, stormTarget, 2.2, dt);
      scene.background = scene.background instanceof THREE.Color ? scene.background.lerpColors(baseBg, stormBg, stormW) : baseBg;
      if (scene.fog) scene.fog.color.copy(scene.background);
      sun.intensity = 2.15 - 1.35 * stormW;
      hemi.intensity = 1.05 - 0.45 * stormW;
      goldLight.position.set(x, h + 1.5, z);

      targetCamDist = isFocused ? 2.45 : targetCamDist;
      camDist = THREE.MathUtils.damp(camDist, targetCamDist, 6, dt);
      if (!dragging && !isFocused) camAngle += dt * 0.06;

      const desiredTarget = isFocused
        ? new THREE.Vector3(x, h + 1.88, z)
        : new THREE.Vector3(0, 1.75, 0);
      currentLookAt.lerp(desiredTarget, 0.12);

      const horizDist = Math.cos(camPitch) * camDist;
      const vertDist = Math.sin(camPitch) * camDist;
      camera.position.set(
        currentLookAt.x + Math.sin(camAngle) * horizDist,
        currentLookAt.y + vertDist,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#1b2e35]">
        {/* Top bar controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between pointer-events-none gap-3">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setMode('pairar')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                mode === 'pairar'
                  ? 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 ring-2 ring-yellow-300 shadow-yellow-500/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-yellow-500/30'
              }`}
            >
              <Compass className="w-4 h-4" />
              Pairar
            </button>
            <button
              onClick={() => setMode('voar')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                mode === 'voar'
                  ? 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 ring-2 ring-yellow-300 shadow-yellow-500/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-yellow-500/30'
              }`}
            >
              <Wind className="w-4 h-4" />
              Voar
            </button>
            <button
              onClick={() => setMode('raios')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                mode === 'raios'
                  ? 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 ring-2 ring-yellow-300 shadow-yellow-500/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-yellow-500/30'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Lançar Raios
            </button>
            <button
              onClick={() => setMode('tempestade')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                mode === 'tempestade'
                  ? 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 ring-2 ring-yellow-300 shadow-yellow-500/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-yellow-500/30'
              }`}
            >
              <CloudLightning className="w-4 h-4 text-cyan-400" />
              Tempestade
            </button>
            <button
              onClick={() => setFocusFace(!focusFace)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-1.5 ${
                focusFace
                  ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white ring-2 ring-sky-300'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-sky-200 border border-sky-400/40'
              }`}
            >
              <Eye className="w-4 h-4" />
              {focusFace ? 'Visão Geral' : 'Focar Rosto'}
            </button>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-yellow-500/40 px-3 py-1.5 rounded-xl shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                Zeus • Pai dos Deuses e dos Homens
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-red-900/80 text-slate-300 hover:text-white border border-white/20 transition-all shadow-lg"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 3D Canvas Container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Bottom hint banner */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-slate-950/75 border border-white/20 px-4 py-1.5 rounded-full text-xs text-slate-200 shadow-xl backdrop-blur-md flex items-center gap-2">
            <span>🖱️ Arraste para girar</span>
            <span className="text-white/40">•</span>
            <span>📜 Scroll / Pinça para zoom</span>
            <span className="text-white/40">•</span>
            <span className="text-yellow-300 font-semibold">⚡ Deus Maior dos Gregos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
