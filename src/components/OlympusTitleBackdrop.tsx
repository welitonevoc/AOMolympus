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
      scene.background = new THREE.Color(0x0d1b32);
      scene.fog = new THREE.FogExp2(0x1f2d47, 0.0125);

      const camera = new THREE.PerspectiveCamera(39, width / height, 0.1, 160);
      camera.position.set(-4.2, 4.4, 15.2);
      camera.lookAt(1.8, 2.2, -1.2);

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
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

      // Procedural PBR studio reflection environment
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      roomEnv.dispose();
      pmremGenerator.dispose();

      // ── Golden-Hour Olympian Sky Dome ──
      const skyCanvas = document.createElement('canvas');
      skyCanvas.width = 16;
      skyCanvas.height = 256;
      const sCtx = skyCanvas.getContext('2d');
      if (sCtx) {
        const grad = sCtx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0.0, '#071124');
        grad.addColorStop(0.28, '#10274a');
        grad.addColorStop(0.5, '#254a78');
        grad.addColorStop(0.68, '#7c5338');
        grad.addColorStop(0.8, '#e39a47');
        grad.addColorStop(0.89, '#fbd38d');
        grad.addColorStop(1.0, '#18243a');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 16, 256);
      }
      const skyTex = new THREE.CanvasTexture(skyCanvas);
      skyTex.colorSpace = THREE.SRGBColorSpace;
      localTexs.push(skyTex);

      scene.add(
        new THREE.Mesh(
          trackGeo(new THREE.SphereGeometry(95, 28, 18)),
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

      // Soft Sun Halo on Horizon behind Olympus
      const sunDisc = new THREE.Mesh(
        trackGeo(new THREE.CircleGeometry(6.5, 32)),
        trackMat(
          new THREE.MeshBasicMaterial({
            color: 0xffe4a0,
            transparent: true,
            opacity: 0.42,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
          })
        )
      );
      sunDisc.position.set(16, 9.5, -52);
      scene.add(sunDisc);

      // ── 3-Point Warm Sun & Sky Lighting Rig ──
      const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x2c2238, 1.3);
      scene.add(hemi);

      const sunLight = new THREE.DirectionalLight(0xffe1a3, 2.75);
      sunLight.position.set(11, 13, 8);
      sunLight.castShadow = !isSoftwareGl;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 48;
      sunLight.shadow.camera.left = -16;
      sunLight.shadow.camera.right = 16;
      sunLight.shadow.camera.top = 14;
      sunLight.shadow.camera.bottom = -14;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
      scene.add(sunLight);

      const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.75);
      rimLight.position.set(-9, 5, -12);
      scene.add(rimLight);

      const sanctumLight = new THREE.PointLight(0xfbbf24, 3.2, 16);
      sanctumLight.position.set(2.2, 3.8, -1.6);
      scene.add(sanctumLight);

      // ── Material Library ──
      const zeusTex = getCachedZeusTextures();
      const marbleMat = trackMat(
        new THREE.MeshStandardMaterial({
          map: zeusTex.marbleTex,
          color: 0xf7f2e7,
          roughness: 0.42,
          metalness: 0.06,
        })
      );
      const warmStoneMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xd9cdb8,
          roughness: 0.68,
          metalness: 0.04,
        })
      );
      const goldMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xe7b949,
          roughness: 0.2,
          metalness: 0.92,
        })
      );
      const bronzeMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x9b6b2f,
          roughness: 0.34,
          metalness: 0.85,
        })
      );
      const cliffMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x3b4254,
          roughness: 0.92,
          metalness: 0.05,
        })
      );
      const terraceGrassMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x4b6e42,
          roughness: 0.86,
          metalness: 0.02,
        })
      );
      const cypressMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x26482c,
          roughness: 0.84,
          metalness: 0.02,
        })
      );
      const oliveLeafMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x5c7d4b,
          roughness: 0.82,
          metalness: 0.02,
        })
      );
      const trunkMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x5d432c,
          roughness: 0.9,
          metalness: 0.02,
        })
      );
      const waterMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x2dd4bf,
          emissive: 0x0f766e,
          emissiveIntensity: 0.32,
          roughness: 0.14,
          metalness: 0.45,
          transparent: true,
          opacity: 0.86,
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

      // ── Mount Olympus Citadel & Gardens (Shifted Center-Right for Menu Balance) ──
      const olympusRoot = new THREE.Group();
      olympusRoot.position.set(2.2, 0, 0);
      scene.add(olympusRoot);

      // 1. Monumental Mountain Peak & Cliff Ridges
      addMesh(olympusRoot, trackGeo(new THREE.CylinderGeometry(8.2, 4.6, 5.2, 16)), cliffMat, 0, -3.1, -0.8);
      addMesh(olympusRoot, trackGeo(new THREE.CylinderGeometry(5.6, 7.6, 1.8, 14)), cliffMat, 0, -0.55, -0.5);
      addMesh(olympusRoot, trackGeo(new THREE.ConeGeometry(4.2, 7.5, 8)), cliffMat, -7.8, -1.6, -5.6, 0.08, 0.4);
      addMesh(olympusRoot, trackGeo(new THREE.ConeGeometry(4.8, 8.6, 8)), cliffMat, 8.4, -1.3, -6.2, -0.06, 0.8);
      addMesh(olympusRoot, trackGeo(new THREE.ConeGeometry(6.5, 11.0, 9)), cliffMat, 1.2, -1.8, -13.5, 0.05, 0.3);
      addMesh(olympusRoot, trackGeo(new THREE.ConeGeometry(5.2, 9.2, 7)), cliffMat, -13.5, -2.5, -12.0, 0.04, 1.1);
      addMesh(olympusRoot, trackGeo(new THREE.ConeGeometry(5.6, 9.8, 7)), cliffMat, 14.5, -2.2, -11.5, -0.05, 0.2);

      // 2. Lower Garden Terrace, Reflecting Pool & Cascading Waterfalls
      addMesh(olympusRoot, trackGeo(new THREE.BoxGeometry(10.8, 0.45, 7.2)), warmStoneMat, 0, 0.05, 2.2);
      addMesh(olympusRoot, trackGeo(new THREE.BoxGeometry(10.0, 0.14, 6.4)), terraceGrassMat, 0, 0.3, 2.2);

      // Marble Reflecting Pool in Courtyard
      addMesh(olympusRoot, trackGeo(new THREE.BoxGeometry(4.2, 0.16, 2.35)), marbleMat, 0, 0.36, 3.4);
      const poolSurface = addMesh(olympusRoot, trackGeo(new THREE.PlaneGeometry(3.8, 1.95)), waterMat, 0, 0.45, 3.4, -Math.PI / 2);

      // Cascading Waterfalls off the Terrace Rim into the Clouds
      const waterfallSheets: THREE.Mesh[] = [];
      const fallGeo = trackGeo(new THREE.PlaneGeometry(0.95, 4.6, 4, 12));
      const fallMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0x99f6e4,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      for (const wx of [-1.2, 1.2]) {
        const wf = new THREE.Mesh(fallGeo, fallMat);
        wf.position.set(wx, -1.85, 5.75);
        wf.rotation.x = 0.08;
        olympusRoot.add(wf);
        waterfallSheets.push(wf);
      }

      // 3. Stepped Marble Grand Stairway up to Acropolis Summit
      for (let s = 0; s < 5; s++) {
        addMesh(
          olympusRoot,
          trackGeo(new THREE.BoxGeometry(4.6 - s * 0.25, 0.24, 1.0)),
          marbleMat,
          0,
          0.42 + s * 0.22,
          1.4 - s * 0.46
        );
      }

      // Upper Acropolis Stylobate Base
      addMesh(olympusRoot, trackGeo(new THREE.BoxGeometry(9.6, 0.38, 7.4)), marbleMat, 0, 1.38, -2.0);
      addMesh(olympusRoot, trackGeo(new THREE.BoxGeometry(8.9, 0.26, 6.7)), marbleMat, 0, 1.7, -2.0);
      addMesh(olympusRoot, trackGeo(new THREE.BoxGeometry(9.05, 0.07, 6.85)), goldMat, 0, 1.84, -2.0);

      // 4. Grand Parthenon Temple of Olympus (Peristyle Colonnade + Sculpted Pediment)
      const templeGroup = new THREE.Group();
      templeGroup.position.set(0, 1.86, -2.15);
      olympusRoot.add(templeGroup);

      // Cella Sanctuary Walls & Glowing Golden Interior Hearth
      addMesh(templeGroup, trackGeo(new THREE.BoxGeometry(4.5, 2.95, 3.7)), warmStoneMat, 0, 1.48, 0);
      addMesh(templeGroup, trackGeo(new THREE.BoxGeometry(1.55, 2.25, 0.2)), goldMat, 0, 1.15, 1.82);
      const cellaGlow = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(1.32, 2.05)),
        trackMat(
          new THREE.MeshBasicMaterial({
            color: 0xfde047,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        )
      );
      cellaGlow.position.set(0, 1.15, 1.94);
      templeGroup.add(cellaGlow);

      // 16 Peristyle Doric Columns (6 Front, 6 Back, 2 Left, 2 Right)
      const colShaftGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.24, 3.15, 14));
      const colBaseGeo = trackGeo(new THREE.BoxGeometry(0.54, 0.14, 0.54));
      const colCapGeo = trackGeo(new THREE.CylinderGeometry(0.28, 0.19, 0.16, 14));
      const colAbacusGeo = trackGeo(new THREE.BoxGeometry(0.54, 0.11, 0.54));
      const colCollarGeo = trackGeo(new THREE.BoxGeometry(0.46, 0.05, 0.46));

      const colPositions: Array<[number, number]> = [];
      for (let i = 0; i < 6; i++) {
        const x = -3.65 + i * 1.46;
        colPositions.push([x, 2.75]);
        colPositions.push([x, -2.75]);
      }
      for (const sz of [-0.92, 0.92]) {
        colPositions.push([-3.65, sz]);
        colPositions.push([3.65, sz]);
      }

      for (const [cx, cz] of colPositions) {
        const col = new THREE.Group();
        col.position.set(cx, 0, cz);
        addMesh(col, colBaseGeo, marbleMat, 0, 0.07, 0);
        addMesh(col, colShaftGeo, marbleMat, 0, 1.71, 0);
        addMesh(col, colCapGeo, marbleMat, 0, 3.36, 0);
        addMesh(col, colAbacusGeo, marbleMat, 0, 3.49, 0);
        addMesh(col, colCollarGeo, goldMat, 0, 3.57, 0);
        templeGroup.add(col);
      }

      // Entablature Architrave & Cornice
      addMesh(templeGroup, trackGeo(new THREE.BoxGeometry(8.05, 0.42, 6.2)), marbleMat, 0, 3.8, 0);
      addMesh(templeGroup, trackGeo(new THREE.BoxGeometry(8.2, 0.1, 6.35)), goldMat, 0, 4.05, 0);

      // Sculpted Triangular Pediment Roof
      const pedShape = new THREE.Shape();
      pedShape.moveTo(-4.15, 0);
      pedShape.lineTo(4.15, 0);
      pedShape.lineTo(0, 1.48);
      pedShape.closePath();
      const pedGeo = trackGeo(
        new THREE.ExtrudeGeometry(pedShape, {
          depth: 6.1,
          bevelEnabled: true,
          bevelThickness: 0.06,
          bevelSize: 0.05,
          bevelSegments: 2,
        })
      );
      pedGeo.translate(0, 0, -3.05);
      addMesh(templeGroup, pedGeo, marbleMat, 0, 4.1, 0);

      // Golden Acroterion Apex & Sun Medallion
      addMesh(templeGroup, trackGeo(new THREE.OctahedronGeometry(0.28, 0)), goldMat, 0, 5.86, 3.06);
      addMesh(templeGroup, trackGeo(new THREE.CylinderGeometry(0.36, 0.36, 0.09, 20)), goldMat, 0, 4.78, 3.12, Math.PI / 2);
      for (const side of [-1, 1]) {
        addMesh(templeGroup, trackGeo(new THREE.OctahedronGeometry(0.18, 0)), goldMat, side * 4.1, 4.3, 3.05);
      }

      // 5. Flanking Ceremonial Bronze Braziers on Courtyard Steps
      const flameMeshes: THREE.Mesh[] = [];
      const flameMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xfb923c,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const flameCoreMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const brazierPedGeo = trackGeo(new THREE.CylinderGeometry(0.13, 0.24, 0.56, 10));
      const brazierBowlGeo = trackGeo(new THREE.CylinderGeometry(0.36, 0.16, 0.22, 14));
      const flameGeo = trackGeo(new THREE.ConeGeometry(0.2, 0.52, 10));
      const flameCoreGeo = trackGeo(new THREE.ConeGeometry(0.1, 0.32, 8));

      for (const bx of [-3.3, 3.3]) {
        const bGroup = new THREE.Group();
        bGroup.position.set(bx, 1.85, 1.15);
        addMesh(bGroup, brazierPedGeo, bronzeMat, 0, 0.28, 0);
        addMesh(bGroup, brazierBowlGeo, bronzeMat, 0, 0.64, 0);
        const fOuter = new THREE.Mesh(flameGeo, flameMat);
        fOuter.position.y = 0.96;
        const fInner = new THREE.Mesh(flameCoreGeo, flameCoreMat);
        fInner.position.y = 0.88;
        bGroup.add(fOuter, fInner);
        flameMeshes.push(fOuter, fInner);
        olympusRoot.add(bGroup);
      }

      // 6. Sculpted Mediterranean Cypresses & Sunlit Olive Trees on Terrace Flanks
      const cypressCoords: Array<[number, number, number]> = [
        [-4.55, 0.36, 3.9],
        [-4.75, 0.36, 1.2],
        [4.55, 0.36, 3.9],
        [4.75, 0.36, 1.2],
        [-5.25, -0.1, -1.8],
        [5.25, -0.1, -1.8],
      ];
      const cyTrunkGeo = trackGeo(new THREE.CylinderGeometry(0.08, 0.12, 0.7, 8));
      const cyConeAGeo = trackGeo(new THREE.ConeGeometry(0.48, 2.2, 10));
      const cyConeBGeo = trackGeo(new THREE.ConeGeometry(0.36, 1.7, 10));
      for (const [tx, ty, tz] of cypressCoords) {
        const tg = new THREE.Group();
        tg.position.set(tx, ty, tz);
        addMesh(tg, cyTrunkGeo, trunkMat, 0, 0.35, 0);
        addMesh(tg, cyConeAGeo, cypressMat, 0, 1.6, 0);
        addMesh(tg, cyConeBGeo, cypressMat, 0, 2.45, 0);
        olympusRoot.add(tg);
      }

      // Olive Trees
      const oliveTrunkGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.16, 0.95, 8));
      const oliveCrownGeo = trackGeo(new THREE.DodecahedronGeometry(0.75, 1));
      for (const [ox, oz] of [
        [-3.5, 4.5],
        [3.5, 4.5],
      ] as const) {
        const og = new THREE.Group();
        og.position.set(ox, 0.36, oz);
        addMesh(og, oliveTrunkGeo, trunkMat, 0, 0.48, 0, 0.08, 0, -0.06);
        const c1 = addMesh(og, oliveCrownGeo, oliveLeafMat, 0, 1.28, 0);
        c1.scale.set(1.3, 0.78, 1.15);
        addMesh(og, oliveCrownGeo, oliveLeafMat, 0.35, 1.15, 0.25).scale.set(0.8, 0.65, 0.8);
        olympusRoot.add(og);
      }

      // 7. Distant Floating Cloud Sanctuary Outcrops for Scale & Depth
      for (const [px, py, pz, s] of [
        [-11.5, 1.2, -16, 0.52],
        [13.0, 2.1, -18, 0.48],
      ] as const) {
        const distant = new THREE.Group();
        distant.position.set(px, py, pz);
        distant.scale.setScalar(s);
        addMesh(distant, trackGeo(new THREE.CylinderGeometry(3.8, 1.4, 3.6, 10)), cliffMat, 0, -1.8, 0);
        addMesh(distant, trackGeo(new THREE.BoxGeometry(5.0, 0.4, 3.4)), marbleMat, 0, 0.2, 0);
        addMesh(distant, trackGeo(new THREE.BoxGeometry(4.2, 2.0, 2.4)), warmStoneMat, 0, 1.4, 0);
        olympusRoot.add(distant);
      }

      // 8. Sea of Golden Olympus Clouds (InstancedMesh)
      const CLOUD_COUNT = 68;
      const cloudGeo = trackGeo(new THREE.SphereGeometry(1, 14, 12));
      const cloudMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xfdf8ee,
          emissive: 0x5c361c,
          emissiveIntensity: 0.28,
          roughness: 0.94,
          metalness: 0.02,
        })
      );
      const cloudInst = new THREE.InstancedMesh(cloudGeo, cloudMat, CLOUD_COUNT);
      cloudInst.frustumCulled = false;

      const cloudMeta: Array<{
        angle: number;
        radius: number;
        y: number;
        sx: number;
        sy: number;
        sz: number;
        speed: number;
        phase: number;
      }> = [];

      for (let i = 0; i < CLOUD_COUNT; i++) {
        const ringBand = i % 3;
        const radius = 8.2 + ringBand * 5.2 + Math.random() * 3.0;
        const angle = (i / CLOUD_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const y = -2.4 + ringBand * 0.45 + (Math.random() - 0.5) * 1.1;
        const sc = 1.45 + Math.random() * 1.85;
        cloudMeta.push({
          angle,
          radius,
          y,
          sx: sc * 1.75,
          sy: sc * 0.56,
          sz: sc * 1.32,
          speed: (0.014 + Math.random() * 0.018) * (i % 2 === 0 ? 1 : -0.65),
          phase: Math.random() * Math.PI * 2,
        });
        _dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        _dummy.scale.set(sc * 1.75, sc * 0.56, sc * 1.32);
        _dummy.updateMatrix();
        cloudInst.setMatrixAt(i, _dummy.matrix);
        _tmpColor.setHex(i % 3 === 0 ? 0xffefd2 : i % 3 === 1 ? 0xfff8eb : 0xdbeafe);
        cloudInst.setColorAt(i, _tmpColor);
      }
      cloudInst.instanceMatrix.needsUpdate = true;
      if (cloudInst.instanceColor) cloudInst.instanceColor.needsUpdate = true;
      cloudInst.computeBoundingSphere();
      olympusRoot.add(cloudInst);

      // 9. Slanted Golden Sunbeam Shafts
      const beamMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xfde68a,
          transparent: true,
          opacity: 0.06,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const beamGeo = trackGeo(new THREE.CylinderGeometry(0.55, 2.35, 16, 14, 1, true));
      for (let b = 0; b < 3; b++) {
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(-2.0 + b * 2.4, 6.2, -1.8 + b * 0.8);
        beam.rotation.z = -0.36;
        beam.rotation.x = 0.14;
        olympusRoot.add(beam);
      }

      // 10. Floating Golden Sunlight Motes
      const MOTE_N = 160;
      const motePos = new Float32Array(MOTE_N * 3);
      const moteSpeed = new Float32Array(MOTE_N);
      for (let i = 0; i < MOTE_N; i++) {
        motePos[i * 3] = (Math.random() - 0.5) * 18;
        motePos[i * 3 + 1] = Math.random() * 9.0 - 0.5;
        motePos[i * 3 + 2] = (Math.random() - 0.5) * 14;
        moteSpeed[i] = 0.22 + Math.random() * 0.45;
      }
      const moteGeo = trackGeo(new THREE.BufferGeometry());
      moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      const moteMat = trackMat(
        new THREE.PointsMaterial({
          color: 0xfef08a,
          size: 0.08,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      olympusRoot.add(new THREE.Points(moteGeo, moteMat));

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
        camera.aspect = w / h;
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

        // Graceful sweeping camera orbit showcasing the full Acropolis & Valleys
        const isCine = cinematicRef.current;
        const baseCamX = isCine
          ? Math.sin(simTime * 0.14) * 5.4
          : -3.6 + Math.sin(simTime * 0.12) * 0.85;
        const baseCamY = isCine
          ? 4.6 + Math.sin(simTime * 0.22) * 0.45
          : 4.35 + Math.sin(simTime * 0.2) * 0.2;
        const baseCamZ = isCine
          ? 13.6 + Math.cos(simTime * 0.14) * 1.8
          : 15.0 + Math.cos(simTime * 0.14) * 0.55;
        const lookX = isCine ? 2.2 : 0.8;

        const targetCamX = baseCamX + (prefersReducedMotion ? 0 : mouseNormX * 0.65);
        const targetCamY = baseCamY - (prefersReducedMotion ? 0 : mouseNormY * 0.3);

        if (dt > 0) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 2.8, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 2.8, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, baseCamZ, 2.8, dt);
        }
        camera.lookAt(lookX, 2.45, -1.2);

        // Animate braziers, pool shimmer, waterfall pulse
        sanctumLight.intensity = 3.0 + Math.sin(simTime * 5.4) * 0.35;
        for (let i = 0; i < flameMeshes.length; i++) {
          const fm = flameMeshes[i];
          const flicker = 0.92 + Math.sin(simTime * 9.5 + i * 1.7) * 0.14;
          fm.scale.set(flicker, 0.95 + Math.cos(simTime * 8.2 + i) * 0.18, flicker);
        }
        poolSurface.position.y = 0.45 + Math.sin(simTime * 2.1) * 0.008;
        fallMat.opacity = 0.56 + Math.sin(simTime * 4.5) * 0.1;
        for (let i = 0; i < waterfallSheets.length; i++) {
          waterfallSheets[i].scale.x = 0.95 + Math.sin(simTime * 5.2 + i * 2) * 0.06;
        }

        // Orbit golden cloud sea & rising golden motes
        if (!prefersReducedMotion) {
          for (let i = 0; i < CLOUD_COUNT; i++) {
            const cm = cloudMeta[i];
            const ang = cm.angle + simTime * cm.speed;
            _dummy.position.set(
              Math.cos(ang) * cm.radius,
              cm.y + Math.sin(simTime * 0.55 + cm.phase) * 0.16,
              Math.sin(ang) * cm.radius
            );
            _dummy.scale.set(cm.sx, cm.sy, cm.sz);
            _dummy.updateMatrix();
            cloudInst.setMatrixAt(i, _dummy.matrix);
          }
          cloudInst.instanceMatrix.needsUpdate = true;

          for (let i = 0; i < MOTE_N; i++) {
            motePos[i * 3 + 1] += moteSpeed[i] * dt;
            motePos[i * 3] += Math.sin(simTime * 1.1 + i) * 0.07 * dt;
            if (motePos[i * 3 + 1] > 8.8) {
              motePos[i * 3 + 1] = -0.3;
              motePos[i * 3] = (Math.random() - 0.5) * 18;
              motePos[i * 3 + 2] = (Math.random() - 0.5) * 14;
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
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[radial-gradient(ellipse_at_68%_42%,rgba(227,154,71,0.34)_0%,rgba(24,52,92,0.72)_50%,#071124_100%)]">
      {!contextLost && <div ref={mountRef} className="h-full w-full" />}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          cinematicMode
            ? 'bg-gradient-to-t from-[#060b16]/55 via-transparent to-transparent'
            : 'bg-gradient-to-r from-[#060b16]/88 via-[#060b16]/32 to-transparent'
        }`}
      />
    </div>
  );
}
