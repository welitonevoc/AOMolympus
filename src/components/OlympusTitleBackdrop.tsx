import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { getCachedZeusTextures } from '../civilizacao/gregos/zeusModel';

interface OlympusTitleBackdropProps {
  paused?: boolean;
  cinematicMode?: boolean;
}

const _dummy = new THREE.Object3D();
const _tmpColor = new THREE.Color();

export function OlympusTitleBackdrop({
  paused = false,
  cinematicMode = false,
}: OlympusTitleBackdropProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const cinematicRef = useRef(cinematicMode);
  cinematicRef.current = cinematicMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    try {
      const probeGl = document.createElement('canvas').getContext('webgl2');
      if (!probeGl) {
        setContextLost(true);
        return;
      }
      const ext = probeGl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER;
      const gpu = String(probeGl.getParameter(param));
      probeGl.getExtension('WEBGL_lose_context')?.loseContext();
      const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);

      const width = container.clientWidth || 1280;
      const height = container.clientHeight || 720;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x28566e);
      scene.fog = new THREE.FogExp2(0x6e857a, 0.011);

      const initAspect = width / Math.max(1, height);
      const getResponsiveFov = (asp: number) => (asp < 0.75 ? 54 : asp < 1.05 ? 48 : 42);
      const getPortraitPullback = (asp: number) =>
        asp < 1.0 ? Math.min(4.8, (1.0 - asp) * 7.2) : 0;

      const camera = new THREE.PerspectiveCamera(getResponsiveFov(initAspect), initAspect, 0.1, 180);
      camera.position.set(0, 1.85, 18.4 + getPortraitPullback(initAspect));
      camera.lookAt(0, 5.3, -1.5);

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.94;
      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const onContextLost = (e: Event) => {
        e.preventDefault();
        setContextLost(true);
      };
      const onContextRestored = () => setContextLost(false);
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

      const localGeos: THREE.BufferGeometry[] = [];
      const localMats: THREE.Material[] = [];
      const localTexs: THREE.Texture[] = [];

      const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
        localGeos.push(g);
        return g;
      };
      const trackMat = <T extends THREE.Material>(m: T): T => {
        localMats.push(m);
        return m;
      };

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.38;
      roomEnv.dispose();
      pmremGenerator.dispose();

      // ── Painterly Sky Dome (Cerulean-Teal Zenith into Radiant Golden Olympus Haze) ──
      const skyCanvas = document.createElement('canvas');
      skyCanvas.width = 16;
      skyCanvas.height = 256;
      const sCtx = skyCanvas.getContext('2d');
      if (sCtx) {
        const grad = sCtx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0.0, '#133d57');
        grad.addColorStop(0.24, '#24667e');
        grad.addColorStop(0.45, '#598d84');
        grad.addColorStop(0.62, '#c8b86b');
        grad.addColorStop(0.75, '#f6d878');
        grad.addColorStop(0.86, '#eab354');
        grad.addColorStop(1.0, '#182430');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 16, 256);
      }
      const skyTex = new THREE.CanvasTexture(skyCanvas);
      skyTex.colorSpace = THREE.SRGBColorSpace;
      localTexs.push(skyTex);

      scene.add(
        new THREE.Mesh(
          trackGeo(new THREE.SphereGeometry(105, 28, 18)),
          trackMat(
            new THREE.MeshBasicMaterial({
              map: skyTex,
              side: THREE.BackSide,
              fog: false,
              depthWrite: false,
            })
          )
        )
      );

      // ── Soft Radial Sun Halo Texture (prevents harsh clipped white disc) ──
      const haloCanvas = document.createElement('canvas');
      haloCanvas.width = 128;
      haloCanvas.height = 128;
      const hCtx = haloCanvas.getContext('2d');
      if (hCtx) {
        const g = hCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
        g.addColorStop(0.0, 'rgba(255, 248, 220, 0.92)');
        g.addColorStop(0.32, 'rgba(253, 224, 71, 0.45)');
        g.addColorStop(0.7, 'rgba(245, 158, 11, 0.14)');
        g.addColorStop(1.0, 'rgba(245, 158, 11, 0.0)');
        hCtx.fillStyle = g;
        hCtx.fillRect(0, 0, 128, 128);
      }
      const sunHaloTex = new THREE.CanvasTexture(haloCanvas);
      sunHaloTex.colorSpace = THREE.SRGBColorSpace;
      localTexs.push(sunHaloTex);

      // ── Radiant Sun Halo Behind Summit Parthenon ──
      const sunHaloOuter = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(30, 30)),
        trackMat(
          new THREE.MeshBasicMaterial({
            map: sunHaloTex,
            color: 0xfde047,
            transparent: true,
            opacity: 0.24,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
          })
        )
      );
      sunHaloOuter.position.set(1.8, 12.2, -32);
      scene.add(sunHaloOuter);

      const sunHaloInner = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(14, 14)),
        trackMat(
          new THREE.MeshBasicMaterial({
            map: sunHaloTex,
            color: 0xfef3c7,
            transparent: true,
            opacity: 0.34,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
          })
        )
      );
      sunHaloInner.position.set(1.8, 12.2, -31.5);
      scene.add(sunHaloInner);

      // ── Dramatic Golden Backlight & Sculpting Key Lighting Rig ──
      const hemi = new THREE.HemisphereLight(0xa5d8e6, 0x3b2d22, 0.65);
      scene.add(hemi);

      const sunKey = new THREE.DirectionalLight(0xffe19c, 1.75);
      sunKey.position.set(14, 15, -4);
      sunKey.castShadow = !isSoftwareGl;
      sunKey.shadow.mapSize.set(1024, 1024);
      sunKey.shadow.camera.near = 1;
      sunKey.shadow.camera.far = 55;
      sunKey.shadow.camera.left = -20;
      sunKey.shadow.camera.right = 20;
      sunKey.shadow.camera.top = 18;
      sunKey.shadow.camera.bottom = -14;
      sunKey.shadow.bias = -0.0005;
      sunKey.shadow.normalBias = 0.02;
      scene.add(sunKey);

      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.52);
      fillLight.position.set(-12, 8, 14);
      scene.add(fillLight);

      const frontWarmGlow = new THREE.DirectionalLight(0xfbbf24, 0.36);
      frontWarmGlow.position.set(6, 5, 16);
      scene.add(frontWarmGlow);

      // ── Material Library ──
      const zeusTex = getCachedZeusTextures();
      const marbleMat = trackMat(
        new THREE.MeshStandardMaterial({
          map: zeusTex.marbleTex,
          color: 0xf7f0df,
          roughness: 0.44,
          metalness: 0.08,
        })
      );
      const travertineMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xdccbb0,
          roughness: 0.62,
          metalness: 0.06,
        })
      );
      const goldMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xeab949,
          roughness: 0.22,
          metalness: 0.92,
        })
      );
      const cliffWarmMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x705d49,
          roughness: 0.92,
          metalness: 0.04,
        })
      );
      const cliffShadowMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x2f3b49,
          roughness: 0.94,
          metalness: 0.05,
        })
      );
      const torchMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xfdba74,
          transparent: true,
          opacity: 0.72,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );

      const addMesh = (
        parent: THREE.Object3D,
        geo: THREE.BufferGeometry,
        mat: THREE.Material,
        x = 0,
        y = 0,
        z = 0,
        rx = 0,
        ry = 0,
        rz = 0
      ) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.rotation.set(rx, ry, rz);
        if (!isSoftwareGl) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
        parent.add(m);
        return m;
      };

      const olympus = new THREE.Group();
      scene.add(olympus);

      // ── 1. Massive Craggy Mountain Massif & Distant Spires ──
      const cragGeo = trackGeo(new THREE.ConeGeometry(1, 1, 7));
      const spireSpecs: Array<[number, number, number, number, number, number, boolean]> = [
        // Central massive core mountain
        [0, 3.6, -2.5, 6.8, 9.8, 5.2, true],
        [-2.2, 2.2, -1.2, 4.8, 8.2, 4.0, false],
        [2.6, 2.5, -1.0, 4.9, 8.6, 4.2, true],
        [-4.8, 1.0, -0.5, 3.9, 7.0, 3.6, false],
        [4.9, 1.4, -0.8, 4.2, 7.6, 3.8, true],
        [0.4, 0.5, 1.2, 4.6, 5.6, 3.4, true],
        [-2.6, 0.2, 2.1, 3.4, 4.8, 2.8, false],
        [3.1, 0.4, 2.2, 3.5, 5.0, 2.9, true],
        // Foreground & framing jagged rock peaks rising from clouds
        [-11.8, -0.2, 4.5, 2.2, 6.2, 2.2, false],
        [-9.2, -0.8, 1.5, 2.4, 5.4, 2.4, false],
        [11.5, -0.1, 4.2, 2.3, 6.4, 2.3, true],
        [9.4, -0.6, 0.8, 2.6, 5.6, 2.4, true],
        [-13.5, 1.5, -9.5, 4.5, 10.5, 4.2, false],
        [14.2, 1.8, -10.5, 4.8, 11.2, 4.5, true],
      ];
      for (let i = 0; i < spireSpecs.length; i++) {
        const [x, y, z, sx, sy, sz, warm] = spireSpecs[i];
        const m = addMesh(olympus, cragGeo, warm ? cliffWarmMat : cliffShadowMat, x, y, z, 0, i * 0.7, 0);
        m.scale.set(sx, sy, sz);
      }

      // Helper: Build a classical Greek Temple (configurable columns & scale)
      const colShaftGeo = trackGeo(new THREE.CylinderGeometry(0.16, 0.21, 2.6, 12));
      const colBaseGeo = trackGeo(new THREE.BoxGeometry(0.46, 0.12, 0.46));
      const colCapGeo = trackGeo(new THREE.BoxGeometry(0.48, 0.14, 0.48));
      const pedTriShape = new THREE.Shape();
      pedTriShape.moveTo(-1, 0);
      pedTriShape.lineTo(1, 0);
      pedTriShape.lineTo(0, 0.36);
      pedTriShape.closePath();
      const pedUnitGeo = trackGeo(
        new THREE.ExtrudeGeometry(pedTriShape, {
          depth: 1,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 1,
        })
      );
      pedUnitGeo.translate(0, 0, -0.5);

      const buildTemple = (
        w: number,
        d: number,
        colsX: number,
        colsZ: number,
        colHeightScale = 1.0,
        withGlow = true
      ) => {
        const tg = new THREE.Group();
        // Stepped Stylobate
        addMesh(tg, trackGeo(new THREE.BoxGeometry(w + 0.9, 0.28, d + 0.9)), travertineMat, 0, 0.14, 0);
        addMesh(tg, trackGeo(new THREE.BoxGeometry(w + 0.45, 0.24, d + 0.45)), marbleMat, 0, 0.4, 0);
        addMesh(tg, trackGeo(new THREE.BoxGeometry(w + 0.5, 0.07, d + 0.5)), goldMat, 0, 0.55, 0);

        const baseTop = 0.58;
        const colH = 2.6 * colHeightScale;

        // Cella core
        addMesh(tg, trackGeo(new THREE.BoxGeometry(w * 0.62, colH * 0.96, d * 0.68)), travertineMat, 0, baseTop + colH * 0.48, 0);
        if (withGlow) {
          const glow = new THREE.Mesh(
            trackGeo(new THREE.PlaneGeometry(w * 0.36, colH * 0.72)),
            trackMat(
              new THREE.MeshBasicMaterial({
                color: 0xfde047,
                transparent: true,
                opacity: 0.34,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
            )
          );
          glow.position.set(0, baseTop + colH * 0.44, d * 0.345);
          tg.add(glow);
        }

        const placeCol = (cx: number, cz: number) => {
          const cg = new THREE.Group();
          cg.position.set(cx, baseTop, cz);
          addMesh(cg, colBaseGeo, marbleMat, 0, 0.06, 0);
          const sh = addMesh(cg, colShaftGeo, marbleMat, 0, colH * 0.5 + 0.1, 0);
          sh.scale.set(1, colHeightScale, 1);
          addMesh(cg, colCapGeo, marbleMat, 0, colH + 0.14, 0);
          tg.add(cg);
        };

        const hx = w * 0.45;
        const hz = d * 0.45;
        for (let ix = 0; ix < colsX; ix++) {
          const x = colsX === 1 ? 0 : -hx + (ix / (colsX - 1)) * (hx * 2);
          placeCol(x, hz);
          placeCol(x, -hz);
        }
        for (let iz = 1; iz < colsZ - 1; iz++) {
          const z = -hz + (iz / (colsZ - 1)) * (hz * 2);
          placeCol(-hx, z);
          placeCol(hx, z);
        }

        // Entablature & Gable Pediment
        const entY = baseTop + colH + 0.36;
        addMesh(tg, trackGeo(new THREE.BoxGeometry(w + 0.35, 0.34, d + 0.35)), marbleMat, 0, entY, 0);
        addMesh(tg, trackGeo(new THREE.BoxGeometry(w + 0.45, 0.08, d + 0.45)), goldMat, 0, entY + 0.2, 0);

        const pedMesh = addMesh(tg, pedUnitGeo, marbleMat, 0, entY + 0.24, 0);
        pedMesh.scale.set((w + 0.45) * 0.5, w * 0.48, d + 0.35);

        // Acroterion Apex Crest
        addMesh(tg, trackGeo(new THREE.OctahedronGeometry(0.24, 0)), goldMat, 0, entY + 0.24 + w * 0.185, d * 0.16);
        return tg;
      };

      // ── 2. Crown Summit Parthenon (Towering at the Peak like image_e2f4e546) ──
      const summitParthenon = buildTemple(7.6, 9.6, 8, 10, 1.16, true);
      summitParthenon.position.set(0, 7.65, -2.2);
      summitParthenon.rotation.y = 0.26;
      olympus.add(summitParthenon);

      // Summit Marble Terrace Platform under Parthenon
      addMesh(olympus, trackGeo(new THREE.BoxGeometry(10.6, 0.85, 11.4)), travertineMat, 0, 7.22, -2.2, 0, 0.26, 0);
      addMesh(olympus, trackGeo(new THREE.BoxGeometry(11.4, 0.55, 12.2)), cliffWarmMat, 0, 6.72, -2.2, 0, 0.26, 0);

      // ── 3. Flanking Secondary Acropolis Temples & Tholos Rotunda (Left & Right) ──
      // Left Western Cliff Temple
      const westTemple = buildTemple(4.2, 5.4, 5, 6, 0.88, true);
      westTemple.position.set(-5.8, 5.15, -1.6);
      westTemple.rotation.y = 0.34;
      olympus.add(westTemple);
      addMesh(olympus, trackGeo(new THREE.BoxGeometry(5.2, 0.7, 6.0)), travertineMat, -5.8, 4.82, -1.6, 0, 0.34, 0);

      // Right Eastern Tholos Rotunda (matching circular tower in image_e2f4e546)
      const tholos = new THREE.Group();
      tholos.position.set(6.35, 5.45, -2.8);
      addMesh(tholos, trackGeo(new THREE.CylinderGeometry(1.75, 2.0, 1.1, 18)), travertineMat, 0, -0.55, 0);
      addMesh(tholos, trackGeo(new THREE.CylinderGeometry(1.55, 1.65, 0.25, 20)), marbleMat, 0, 0.12, 0);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        addMesh(tholos, trackGeo(new THREE.CylinderGeometry(0.11, 0.14, 2.0, 10)), marbleMat, Math.cos(a) * 1.28, 1.22, Math.sin(a) * 1.28);
      }
      addMesh(tholos, trackGeo(new THREE.CylinderGeometry(1.55, 1.55, 0.24, 20)), marbleMat, 0, 2.34, 0);
      addMesh(tholos, trackGeo(new THREE.ConeGeometry(1.62, 0.95, 20)), goldMat, 0, 2.92, 0);
      olympus.add(tholos);

      // ── 4. Winding Switchback Stairways, Terraced Porticoes & Golden Statues (from both refs) ──
      const buildGoldenStatue = (scale = 1.0) => {
        const sg = new THREE.Group();
        addMesh(sg, trackGeo(new THREE.BoxGeometry(0.46, 0.52, 0.46)), marbleMat, 0, 0.26, 0);
        addMesh(sg, trackGeo(new THREE.CylinderGeometry(0.13, 0.17, 0.76, 10)), goldMat, 0, 0.88, 0);
        addMesh(sg, trackGeo(new THREE.SphereGeometry(0.14, 10, 10)), goldMat, 0, 1.38, 0);
        addMesh(sg, trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 1.25, 6)), goldMat, 0.18, 1.18, 0.05, 0, 0, -0.2);
        addMesh(sg, trackGeo(new THREE.BoxGeometry(0.55, 0.22, 0.06)), goldMat, 0, 1.05, -0.14, 0.25, 0, 0);
        sg.scale.setScalar(scale);
        return sg;
      };

      // Tiered Switchback Terrace Platforms + Stair Flights Climbing the Mountain
      const terraceSpecs: Array<[number, number, number, number, number, number]> = [
        [2.4, 2.0, 2.6, 4.4, 2.2, 0.2],
        [-2.8, 3.4, 1.6, 4.6, 2.4, -0.25],
        [2.2, 4.9, 0.6, 4.8, 2.4, 0.18],
        [-5.2, 2.5, 2.8, 3.2, 2.2, 0.35],
        [5.5, 3.1, 2.2, 3.4, 2.4, -0.32],
      ];

      const torchFlames: THREE.Mesh[] = [];
      const torchGeo = trackGeo(new THREE.ConeGeometry(0.08, 0.26, 8));

      for (const [tx, ty, tz, tw, td, rotY] of terraceSpecs) {
        const terrace = new THREE.Group();
        terrace.position.set(tx, ty, tz);
        terrace.rotation.y = rotY;
        addMesh(terrace, trackGeo(new THREE.BoxGeometry(tw, 0.45, td)), travertineMat, 0, 0, 0);
        addMesh(terrace, trackGeo(new THREE.BoxGeometry(tw + 0.15, 0.1, td + 0.15)), goldMat, 0, 0.26, 0);

        // Front terrace colonnade + golden statue
        const nCols = 4;
        for (let c = 0; c < nCols; c++) {
          const cx = -tw * 0.42 + (c / (nCols - 1)) * (tw * 0.84);
          addMesh(terrace, trackGeo(new THREE.CylinderGeometry(0.09, 0.11, 1.35, 8)), marbleMat, cx, 0.95, -td * 0.32);
        }
        addMesh(terrace, trackGeo(new THREE.BoxGeometry(tw * 0.94, 0.2, td * 0.44)), marbleMat, 0, 1.72, -td * 0.3);

        const statue = buildGoldenStatue(0.88);
        statue.position.set(tw * 0.26, 0.3, td * 0.28);
        terrace.add(statue);

        const fl = new THREE.Mesh(torchGeo, torchMat);
        fl.position.set(-tw * 0.32, 0.56, td * 0.32);
        terrace.add(fl);
        torchFlames.push(fl);

        olympus.add(terrace);
      }

      // Diagonal Ascending Marble Stairway Ramp linking terraces toward the Summit
      for (let step = 0; step < 18; step++) {
        const t = step / 17;
        const sx = THREE.MathUtils.lerp(2.6, 0.4, t) + Math.sin(t * Math.PI * 2.2) * 1.1;
        const sy = THREE.MathUtils.lerp(1.4, 6.95, t);
        const sz = THREE.MathUtils.lerp(3.2, -0.4, t);
        addMesh(olympus, trackGeo(new THREE.BoxGeometry(1.75, 0.22, 0.72)), marbleMat, sx, sy, sz, 0, 0.22, 0);
      }

      // ── 5. Billowy Sunlit Cumulus Cloud Sea & Framing Cloud Pillars (InstancedMesh) ──
      const CLOUD_COUNT = 135;
      const cloudGeo = trackGeo(new THREE.SphereGeometry(1, 16, 12));
      const cloudMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xede4d0,
          emissive: 0x5c3e1c,
          emissiveIntensity: 0.12,
          roughness: 0.94,
          metalness: 0.02,
        })
      );
      const cloudInst = new THREE.InstancedMesh(cloudGeo, cloudMat, CLOUD_COUNT);
      cloudInst.frustumCulled = false;

      const cloudMeta: Array<{
        baseX: number;
        baseY: number;
        baseZ: number;
        sx: number;
        sy: number;
        sz: number;
        driftAmp: number;
        speed: number;
        phase: number;
      }> = [];

      for (let i = 0; i < CLOUD_COUNT; i++) {
        let bx = 0;
        let by = 0;
        let bz = 0;
        let sc = 1.6;

        if (i < 65) {
          // Dense rolling cloud carpet at mountain base
          bx = (Math.random() - 0.5) * 34;
          by = -1.6 + Math.random() * 2.6;
          bz = -8 + Math.random() * 19;
          sc = 1.6 + Math.random() * 2.4;
        } else if (i < 100) {
          // Left towering cumulus pillar framing Olympus
          const h = (i - 65) / 35;
          bx = -13.5 - Math.random() * 5.0 + h * 2.5;
          by = 0.5 + h * 13.5;
          bz = -14 + (Math.random() - 0.5) * 10;
          sc = 2.0 + Math.random() * 2.5;
        } else {
          // Right towering cumulus pillar bathed in sun
          const h = (i - 100) / 35;
          bx = 12.5 + Math.random() * 5.5 - h * 2.0;
          by = 0.8 + h * 14.0;
          bz = -14 + (Math.random() - 0.5) * 10;
          sc = 2.1 + Math.random() * 2.6;
        }

        cloudMeta.push({
          baseX: bx,
          baseY: by,
          baseZ: bz,
          sx: sc * 1.5,
          sy: sc * 0.72,
          sz: sc * 1.25,
          driftAmp: 0.25 + Math.random() * 0.45,
          speed: 0.18 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
        });

        _dummy.position.set(bx, by, bz);
        _dummy.scale.set(sc * 1.5, sc * 0.72, sc * 1.25);
        _dummy.updateMatrix();
        cloudInst.setMatrixAt(i, _dummy.matrix);
        _tmpColor.setHex(i % 3 === 0 ? 0xfff3d1 : i % 3 === 1 ? 0xfffbeb : 0xd9e8ec);
        cloudInst.setColorAt(i, _tmpColor);
      }
      cloudInst.instanceMatrix.needsUpdate = true;
      if (cloudInst.instanceColor) cloudInst.instanceColor.needsUpdate = true;
      cloudInst.computeBoundingSphere();
      olympus.add(cloudInst);

      // ── 6. Slanted Sunbeams & Floating Golden Dust Motes ──
      const beamMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xfde68a,
          transparent: true,
          opacity: 0.038,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const beamGeo = trackGeo(new THREE.CylinderGeometry(0.8, 3.6, 24, 16, 1, true));
      for (let b = 0; b < 4; b++) {
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(-4.5 + b * 3.4, 9.2, -5.0 + b * 0.6);
        beam.rotation.z = -0.38;
        beam.rotation.x = 0.16;
        olympus.add(beam);
      }

      const MOTE_N = 180;
      const motePos = new Float32Array(MOTE_N * 3);
      const moteSpeed = new Float32Array(MOTE_N);
      for (let i = 0; i < MOTE_N; i++) {
        motePos[i * 3] = (Math.random() - 0.5) * 24;
        motePos[i * 3 + 1] = Math.random() * 14;
        motePos[i * 3 + 2] = (Math.random() - 0.5) * 16;
        moteSpeed[i] = 0.2 + Math.random() * 0.45;
      }
      const moteGeo = trackGeo(new THREE.BufferGeometry());
      moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      const moteMat = trackMat(
        new THREE.PointsMaterial({
          color: 0xfef08a,
          size: 0.09,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      olympus.add(new THREE.Points(moteGeo, moteMat));

      // Mouse parallax tracking
      let mouseNormX = 0;
      let mouseNormY = 0;
      const onPointerMove = (e: PointerEvent) => {
        if (prefersReducedMotion) return;
        mouseNormX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        mouseNormY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const w = Math.max(1, Math.floor(entry.contentRect.width));
        const h = Math.max(1, Math.floor(entry.contentRect.height));
        const asp = w / h;
        camera.aspect = asp;
        camera.fov = getResponsiveFov(asp);
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resizeObserver.observe(container);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      let frameId = 0;
      let timeoutId = 0;
      let disposed = false;
      let lastTime = performance.now();
      let simTime = 0;

      const afterDraw = (cb: () => void) => {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (!gl || typeof gl.fenceSync !== 'function') {
          timeoutId = window.setTimeout(cb, 80);
          return;
        }
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            timeoutId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            timeoutId = window.setTimeout(cb, 80);
          }
        };
        timeoutId = window.setTimeout(poll, 5);
      };

      const tick = () => {
        if (disposed) return;
        const now = performance.now();
        const rawDt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        if (pausedRef.current) {
          timeoutId = window.setTimeout(tick, 140);
          return;
        }

        const dt = prefersReducedMotion ? 0 : rawDt;
        simTime += dt;

        const isCine = cinematicRef.current;
        const portraitPullback = getPortraitPullback(camera.aspect);
        const baseCamX = Math.sin(simTime * 0.14) * (isCine ? 4.2 : 2.1);
        const baseCamY = 1.85 + Math.sin(simTime * 0.22) * 0.38;
        const baseCamZ =
          (isCine ? 16.8 : 18.4) + portraitPullback + Math.cos(simTime * 0.14) * 0.85;

        const targetCamX = baseCamX + (prefersReducedMotion ? 0 : mouseNormX * 0.8);
        const targetCamY = baseCamY - (prefersReducedMotion ? 0 : mouseNormY * 0.35);

        if (dt > 0) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 2.6, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 2.6, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, baseCamZ, 2.6, dt);
        }
        camera.lookAt(0, 5.35, -1.5);

        for (let i = 0; i < torchFlames.length; i++) {
          const fl = torchFlames[i];
          const sc = 0.9 + Math.sin(simTime * 10 + i * 1.9) * 0.18;
          fl.scale.set(sc, 1.0 + Math.cos(simTime * 8 + i) * 0.22, sc);
        }

        if (!prefersReducedMotion) {
          for (let i = 0; i < CLOUD_COUNT; i++) {
            const cm = cloudMeta[i];
            _dummy.position.set(
              cm.baseX + Math.sin(simTime * cm.speed + cm.phase) * cm.driftAmp,
              cm.baseY + Math.cos(simTime * cm.speed * 0.8 + cm.phase) * (cm.driftAmp * 0.45),
              cm.baseZ
            );
            _dummy.scale.set(cm.sx, cm.sy, cm.sz);
            _dummy.updateMatrix();
            cloudInst.setMatrixAt(i, _dummy.matrix);
          }
          cloudInst.instanceMatrix.needsUpdate = true;

          for (let i = 0; i < MOTE_N; i++) {
            motePos[i * 3 + 1] += moteSpeed[i] * dt;
            motePos[i * 3] += Math.sin(simTime * 1.0 + i) * 0.08 * dt;
            if (motePos[i * 3 + 1] > 14.0) {
              motePos[i * 3 + 1] = 0.2;
              motePos[i * 3] = (Math.random() - 0.5) * 24;
              motePos[i * 3 + 2] = (Math.random() - 0.5) * 16;
            }
          }
          moteGeo.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);

        if (isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };

      tick();

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        clearTimeout(timeoutId);
        window.removeEventListener('pointermove', onPointerMove);
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

        localGeos.forEach((g) => g.dispose());
        localMats.forEach((m) => m.dispose());
        localTexs.forEach((t) => t.dispose());
        envRT.dispose();
        renderer.dispose();
        container.innerHTML = '';
      };
    } catch {
      setContextLost(true);
    }
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_22%,rgba(246,216,120,0.42)_0%,rgba(36,102,126,0.68)_48%,#0a1320_100%)]">
      {!contextLost && <div ref={mountRef} className="h-full w-full" />}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          cinematicMode
            ? 'bg-gradient-to-t from-[#060b14]/55 via-transparent to-transparent'
            : 'bg-[radial-gradient(circle_at_center,rgba(6,10,18,0.48)_0%,rgba(6,10,18,0.18)_48%,rgba(6,10,18,0.55)_100%)]'
        }`}
      />
    </div>
  );
}
