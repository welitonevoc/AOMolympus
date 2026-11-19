import * as THREE from 'three';
import {
  animateZeus,
  buildZeus,
  createZeusTempleEnvironment,
  getCachedZeusTextures,
} from '../../civilizacao/gregos/zeusModel';
import {
  animatePoseidon,
  buildPoseidon,
  createPoseidonEnvironment,
  getCachedPoseidonTextures,
} from '../../civilizacao/gregos/poseidonModel';
import {
  animateHades,
  buildHades,
  createHadesUnderworldEnvironment,
  getCachedHadesTextures,
  HadesUnderworldEnvironment,
} from '../../civilizacao/gregos/hadesModel';
import {
  animateArtemis,
  buildArtemis,
  getCachedArtemisTextures,
} from '../../civilizacao/gregos/artemisModel';
import {
  animateHephaestus,
  buildHephaestus,
  getCachedHephaestusTextures,
} from '../../civilizacao/gregos/hefestoModel';
import {
  animateDionysus,
  buildDionysus,
  getCachedDionysusTextures,
} from '../../civilizacao/gregos/dionisioModel';
import {
  animateAphrodite,
  buildAphrodite,
  getCachedAphroditeTextures,
} from '../../civilizacao/gregos/afroditeModel';
import {
  animateApollo,
  buildApollo,
  getCachedApolloTextures,
} from '../../civilizacao/gregos/apoloModel';
import {
  animateAres,
  buildAres,
  getCachedAresTextures,
} from '../../civilizacao/gregos/aresModel';
import {
  animateAthena,
  buildAthena,
  getCachedAtenaTextures,
} from '../../civilizacao/gregos/atenaModel';
import {
  animateHermes,
  buildHermes,
  getCachedHermesTextures,
} from '../../civilizacao/gregos/hermesModel';
import {
  animateIsis,
  buildIsis,
  getCachedIsisTextures,
} from '../../civilizacao/egipcios/isisModel';
import {
  animateSet,
  buildSet,
  getCachedSetTextures,
} from '../../civilizacao/egipcios/setModel';
import {
  animateRa,
  buildRa,
  getCachedRaTextures,
} from '../../civilizacao/egipcios/raModel';
import { PantheonId } from '../../game/types';
import { InspectableUnitId } from '../gallery3dCatalog';

export interface GodStudioBuildContext {
  scene: THREE.Scene;
  environmentGroup: THREE.Group;
  selectedCiv: PantheonId;
  selectedUnit: InspectableUnitId;
  bidentLight: THREE.PointLight;
  ashPoints: THREE.Points;
  getSimTime: () => number;
  addPedestal: (radiusTop: number, radiusBottom: number, ringColor: number) => void;
  pushLocalDisposable: (d: { dispose: () => void }) => void;
  spawnSpray: (originX: number, originY: number, originZ: number, spreadH: number, vMin: number, vSpread: number) => void;
  spawnShadowTrail: (x: number, z: number) => void;
  zeusModeRef: { current: 'pairar' | 'voar' | 'raios' | 'tempestade' };
  poseidonModeRef: { current: 'conduzido' | 'correnteza' | 'golpe' | 'tsunami' };
  hadesModeRef: { current: 'reinar' | 'marcha' | 'chama' | 'portal' };
  artemisModeRef: { current: 'vigilia' | 'cacada' | 'raizes' | 'alcateia' };
  hefestoModeRef: { current: 'forja' | 'martelo' | 'automato' | 'erupcao' };
  dionisioModeRef: { current: 'banquete' | 'danca' | 'vinhas' | 'extase' };
  afroditeModeRef: { current: 'graca' | 'danca' | 'encanto' | 'mare' };
  apoloModeRef: { current: 'pairar' | 'voo' | 'flecha' | 'helio' };
  aresModeRef: { current: 'postura' | 'investida' | 'sismico' | 'furia' };
  atenaModeRef: { current: 'guardia' | 'avanco' | 'egide' | 'furia' };
  hermesModeRef: { current: 'flutuar' | 'velocidade' | 'rajada' | 'relampago' };
  isisModeRef: { current: 'majestade' | 'heka' | 'ankh' | 'sopdet' };
  setModeRef: { current: 'senhor' | 'tempestade' | 'deserto' | 'monstro' };
  raModeRef: { current: 'gloria' | 'bencao' | 'chuva' | 'ira' };
}

export interface GodStudioBuildResult {
  group: THREE.Group;
  zeusClouds?: Array<{ g: THREE.Group; baseY: number; ph: number }>;
  poseidonOceanPos?: THREE.BufferAttribute;
  poseidonOceanInitY?: Float32Array;
  hadesEnv?: HadesUnderworldEnvironment;
  hadesBidentAnchor?: THREE.Group;
}

function markTexturesShared(texBag: Record<string, unknown>): void {
  for (const val of Object.values(texBag)) {
    if (val instanceof THREE.Texture) {
      val.userData.shared = true;
    }
  }
}

export function buildGodStudioSubject(ctx: GodStudioBuildContext): GodStudioBuildResult | null {
  const {
    scene,
    environmentGroup,
    selectedCiv,
    selectedUnit,
    bidentLight,
    ashPoints,
    getSimTime,
    addPedestal,
    pushLocalDisposable,
    spawnSpray,
    spawnShadowTrail,
    zeusModeRef,
    poseidonModeRef,
    hadesModeRef,
    artemisModeRef,
    hefestoModeRef,
    dionisioModeRef,
    afroditeModeRef,
    apoloModeRef,
    aresModeRef,
    atenaModeRef,
    hermesModeRef,
    isisModeRef,
    setModeRef,
    raModeRef,
  } = ctx;

  if (selectedUnit === 'zeus' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x7fb8bd);
    scene.fog = new THREE.FogExp2(0x7fb8bd, 0.018);

    const zTex = getCachedZeusTextures();
    markTexturesShared(zTex as unknown as Record<string, unknown>);
    const temple = createZeusTempleEnvironment(environmentGroup, zTex);

    const blobGeo = new THREE.CircleGeometry(1.9, 24);
    const blobMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    const blob = new THREE.Mesh(blobGeo, blobMat);
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.02;
    environmentGroup.add(blob);
    pushLocalDisposable(blobGeo);
    pushLocalDisposable(blobMat);

    const zeus = buildZeus(zTex);
    const group = zeus.flight;
    group.scale.setScalar(1.38);
    group.position.set(0, 0.25, 0);
    group.userData.animatePose = (dt: number) => {
      animateZeus(zeus, dt, getSimTime(), zeusModeRef.current);
    };
    return { group, zeusClouds: temple.clouds };
  }

  if (selectedUnit === 'poseidon' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x04151f);
    scene.fog = new THREE.FogExp2(0x04151f, 0.022);

    const pTex = getCachedPoseidonTextures();
    markTexturesShared(pTex as unknown as Record<string, unknown>);
    const oceanEnv = createPoseidonEnvironment(environmentGroup, pTex);
    const poseidonOceanPos = oceanEnv.oceanPos as THREE.BufferAttribute;
    const poseidonOceanInitY = new Float32Array(oceanEnv.oceanPos.count);
    for (let i = 0; i < oceanEnv.oceanPos.count; i++) {
      poseidonOceanInitY[i] = oceanEnv.oceanPos.getY(i);
    }

    const poseidon = buildPoseidon(pTex);
    const group = poseidon.vessel;
    group.scale.setScalar(1.05);
    group.position.set(0, -0.1, 0);
    group.userData.animatePose = (dt: number) => {
      const m = poseidonModeRef.current;
      animatePoseidon(poseidon, dt, getSimTime(), m === 'conduzido' ? 'ondas' : m);
      if (m === 'correnteza' && Math.random() < 0.3) {
        spawnSpray((Math.random() - 0.5) * 1.2, 0.2, (Math.random() - 0.5) * 1.2, 2.5, 1.2, 2.8);
      }
    };
    return { group, poseidonOceanPos, poseidonOceanInitY };
  }

  if (selectedUnit === 'hades' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x090b14);
    scene.fog = new THREE.FogExp2(0x090b14, 0.026);
    ashPoints.visible = true;

    const hTex = getCachedHadesTextures();
    markTexturesShared(hTex as unknown as Record<string, unknown>);
    const hadesEnv = createHadesUnderworldEnvironment(environmentGroup, hTex);

    const hades = buildHades(hTex);
    const hadesBidentAnchor = hades.bidentAnchor;
    const group = hades.vessel;
    group.scale.setScalar(1.02);
    group.position.set(0, -0.05, 0);
    let trailTimer = 0;
    group.userData.animatePose = (dt: number) => {
      const m = hadesModeRef.current;
      animateHades(hades, dt, getSimTime(), m, bidentLight, false);
      if (m === 'marcha') {
        trailTimer -= dt;
        if (trailTimer <= 0) {
          trailTimer = 0.12;
          spawnShadowTrail(hades.vessel.position.x, hades.vessel.position.z);
        }
      }
    };
    return { group, hadesEnv, hadesBidentAnchor };
  }

  if (selectedUnit === 'artemis' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x050d14);
    scene.fog = new THREE.FogExp2(0x050d14, 0.02);
    addPedestal(2.3, 2.5, 0x38bdf8);

    const aTex = getCachedArtemisTextures();
    markTexturesShared(aTex as unknown as Record<string, unknown>);
    const artemis = buildArtemis(aTex);
    const group = artemis.root;
    group.scale.setScalar(0.81);
    group.userData.animatePose = (dt: number) => {
      animateArtemis(artemis, dt, getSimTime(), artemisModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'hefesto' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x160b07);
    scene.fog = new THREE.FogExp2(0x160b07, 0.025);
    addPedestal(2.3, 2.5, 0xea580c);

    const anvilGeo = new THREE.BoxGeometry(0.72, 0.22, 0.36);
    const anvilMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.9, roughness: 0.2 });
    const anvil = new THREE.Mesh(anvilGeo, anvilMat);
    anvil.position.set(0.18, 0.65, 0.95);
    anvil.receiveShadow = true;
    environmentGroup.add(anvil);
    pushLocalDisposable(anvilGeo);
    pushLocalDisposable(anvilMat);

    const hTex = getCachedHephaestusTextures();
    markTexturesShared(hTex as unknown as Record<string, unknown>);
    const hefesto = buildHephaestus(hTex);
    const group = hefesto.root;
    group.scale.setScalar(0.85);
    group.userData.animatePose = (dt: number) => {
      animateHephaestus(hefesto, dt, getSimTime(), hefestoModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'dionisio' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x1a0726);
    scene.fog = new THREE.FogExp2(0x1a0726, 0.02);
    addPedestal(2.3, 2.5, 0xa855f7);

    const dTex = getCachedDionysusTextures();
    markTexturesShared(dTex as unknown as Record<string, unknown>);
    const dionisio = buildDionysus(dTex);
    const group = dionisio.root;
    group.scale.setScalar(0.83);
    group.userData.animatePose = (dt: number) => {
      animateDionysus(dionisio, dt, getSimTime(), dionisioModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'afrodite' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x2a0e1d);
    scene.fog = new THREE.FogExp2(0x3b1228, 0.016);
    addPedestal(2.4, 2.6, 0xfb7185);

    const aTex = getCachedAphroditeTextures();
    markTexturesShared(aTex as unknown as Record<string, unknown>);
    const afrodite = buildAphrodite(aTex);
    const group = afrodite.root;
    group.scale.setScalar(1.22);
    group.userData.animatePose = (dt: number) => {
      animateAphrodite(afrodite, dt, getSimTime(), afroditeModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'apolo' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x181206);
    scene.fog = new THREE.FogExp2(0x241808, 0.016);
    addPedestal(2.4, 2.6, 0xfacc15);

    const apoTex = getCachedApolloTextures();
    markTexturesShared(apoTex as unknown as Record<string, unknown>);
    const apolo = buildApollo(apoTex);
    const group = apolo.root;
    group.scale.setScalar(0.82);
    group.userData.animatePose = (dt: number) => {
      animateApollo(apolo, dt, getSimTime(), apoloModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'ares' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x190806);
    scene.fog = new THREE.FogExp2(0x280c08, 0.018);
    addPedestal(2.4, 2.6, 0xef4444);

    const aresTex = getCachedAresTextures();
    markTexturesShared(aresTex as unknown as Record<string, unknown>);
    const ares = buildAres(aresTex);
    const group = ares.root;
    group.scale.setScalar(0.79);
    group.userData.animatePose = (dt: number) => {
      animateAres(ares, dt, getSimTime(), aresModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'atena' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x0c1628);
    scene.fog = new THREE.FogExp2(0x13233e, 0.016);
    addPedestal(2.4, 2.6, 0xfacc15);

    const atenaTex = getCachedAtenaTextures();
    markTexturesShared(atenaTex as unknown as Record<string, unknown>);
    const atena = buildAthena(atenaTex);
    const group = atena.root;
    group.scale.setScalar(0.80);
    group.userData.animatePose = (dt: number) => {
      animateAthena(atena, dt, getSimTime(), atenaModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'hermes' && selectedCiv === 'greek') {
    scene.background = new THREE.Color(0x0c1d30);
    scene.fog = new THREE.FogExp2(0x102842, 0.018);
    addPedestal(2.4, 2.6, 0x2dd4bf);

    const hermesTex = getCachedHermesTextures();
    markTexturesShared(hermesTex as unknown as Record<string, unknown>);
    const hermes = buildHermes(hermesTex);
    const group = hermes.root;
    group.scale.setScalar(0.81);
    group.userData.animatePose = (dt: number) => {
      animateHermes(hermes, dt, getSimTime(), hermesModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'isis' && selectedCiv === 'egyptian') {
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.022);

    const isisTex = getCachedIsisTextures();
    markTexturesShared(isisTex as unknown as Record<string, unknown>);
    const pedGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.2, 48);
    const pedMat = new THREE.MeshStandardMaterial({ map: isisTex.floorTex, roughness: 0.5, metalness: 0.2 });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.1;
    pedestal.receiveShadow = true;
    environmentGroup.add(pedestal);

    const ringGeo = new THREE.RingGeometry(2.4, 2.65, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    environmentGroup.add(ring);

    const obeliskMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7 });
    const goldTipMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 1, roughness: 0.1 });
    const obBaseGeo = new THREE.BoxGeometry(1.0, 0.35, 1.0);
    const obShaftGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.0, 4);
    const obTipGeo = new THREE.ConeGeometry(0.26, 0.6, 4);
    for (const x of [-3.0, 3.0]) {
      const obelisk = new THREE.Group();
      obelisk.position.set(x, 0, -2.8);
      const baseMesh = new THREE.Mesh(obBaseGeo, obeliskMat);
      const shaftMesh = new THREE.Mesh(obShaftGeo, obeliskMat);
      shaftMesh.position.y = 1.65;
      shaftMesh.rotation.y = Math.PI / 4;
      const tipMesh = new THREE.Mesh(obTipGeo, goldTipMat);
      tipMesh.position.y = 3.45;
      tipMesh.rotation.y = Math.PI / 4;
      obelisk.add(baseMesh, shaftMesh, tipMesh);
      environmentGroup.add(obelisk);
    }
    [pedGeo, pedMat, ringGeo, ringMat, obeliskMat, goldTipMat, obBaseGeo, obShaftGeo, obTipGeo].forEach(pushLocalDisposable);

    const isis = buildIsis(isisTex);
    const group = isis.root;
    group.scale.setScalar(0.85);
    group.userData.animatePose = (dt: number) => {
      animateIsis(isis, dt, getSimTime(), isisModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'set' && selectedCiv === 'egyptian') {
    scene.background = new THREE.Color(0x0b0504);
    scene.fog = new THREE.FogExp2(0x0b0504, 0.022);

    const setTex = getCachedSetTextures();
    markTexturesShared(setTex as unknown as Record<string, unknown>);
    const pedGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.2, 48);
    const pedMat = new THREE.MeshStandardMaterial({ map: setTex.floorTex, roughness: 0.6, metalness: 0.1 });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.1;
    pedestal.receiveShadow = true;
    environmentGroup.add(pedestal);

    const ringGeo = new THREE.RingGeometry(2.4, 2.65, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    environmentGroup.add(ring);

    const obeliskMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7 });
    const chaosTipMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, emissive: 0x7e22ce, emissiveIntensity: 0.8 });
    const obBaseGeo = new THREE.BoxGeometry(1.0, 0.35, 1.0);
    const obShaftGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.0, 4);
    const obTipGeo = new THREE.ConeGeometry(0.26, 0.6, 4);
    for (const x of [-3.0, 3.0]) {
      const obelisk = new THREE.Group();
      obelisk.position.set(x, 0, -2.8);
      const baseMesh = new THREE.Mesh(obBaseGeo, obeliskMat);
      const shaftMesh = new THREE.Mesh(obShaftGeo, obeliskMat);
      shaftMesh.position.y = 1.65;
      shaftMesh.rotation.y = Math.PI / 4;
      const tipMesh = new THREE.Mesh(obTipGeo, chaosTipMat);
      tipMesh.position.y = 3.45;
      tipMesh.rotation.y = Math.PI / 4;
      obelisk.add(baseMesh, shaftMesh, tipMesh);
      environmentGroup.add(obelisk);
    }
    [pedGeo, pedMat, ringGeo, ringMat, obeliskMat, chaosTipMat, obBaseGeo, obShaftGeo, obTipGeo].forEach(pushLocalDisposable);

    const setGod = buildSet(setTex);
    const group = setGod.root;
    group.scale.setScalar(0.85);
    group.userData.animatePose = (dt: number) => {
      animateSet(setGod, dt, getSimTime(), setModeRef.current);
    };
    return { group };
  }

  if (selectedUnit === 'ra' && selectedCiv === 'egyptian') {
    scene.background = new THREE.Color(0x1e3a8a);
    scene.fog = new THREE.FogExp2(0x1e3a8a, 0.016);

    const raTex = getCachedRaTextures();
    markTexturesShared(raTex as unknown as Record<string, unknown>);
    const pedGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.2, 48);
    const pedMat = new THREE.MeshStandardMaterial({ map: raTex.floorTex, roughness: 0.42, metalness: 0.15 });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.1;
    pedestal.receiveShadow = true;
    environmentGroup.add(pedestal);

    const ringGeo = new THREE.RingGeometry(2.4, 2.65, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    environmentGroup.add(ring);

    const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xd6b076, roughness: 0.68, metalness: 0.1 });
    const goldColMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.92, roughness: 0.18 });
    const lapisColMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.25 });
    const colBaseGeo = new THREE.BoxGeometry(0.65, 0.15, 0.65);
    const colShaftGeo = new THREE.CylinderGeometry(0.22, 0.28, 2.4, 16);
    const colBandGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.06, 16);
    const colCapGeo = new THREE.CylinderGeometry(0.38, 0.22, 0.28, 16);
    const colAbacusGeo = new THREE.BoxGeometry(0.58, 0.12, 0.58);
    const colSunGeo = new THREE.SphereGeometry(0.14, 14, 14);

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.25;
      const dist = 3.6;
      const col = new THREE.Group();
      col.position.set(Math.cos(a) * dist, 0, Math.sin(a) * dist);
      col.rotation.y = -a + Math.PI / 2;

      const baseMesh = new THREE.Mesh(colBaseGeo, sandstoneMat);
      baseMesh.position.y = 0.075;
      const shaftMesh = new THREE.Mesh(colShaftGeo, sandstoneMat);
      shaftMesh.position.y = 1.35;
      const f1 = new THREE.Mesh(colBandGeo, goldColMat);
      f1.position.y = 0.8;
      const f2 = new THREE.Mesh(colBandGeo, lapisColMat);
      f2.position.y = 1.4;
      const f3 = new THREE.Mesh(colBandGeo, goldColMat);
      f3.position.y = 2.0;
      const capMesh = new THREE.Mesh(colCapGeo, goldColMat);
      capMesh.position.y = 2.65;
      const abacusMesh = new THREE.Mesh(colAbacusGeo, sandstoneMat);
      abacusMesh.position.y = 2.85;
      const sunDiskMesh = new THREE.Mesh(colSunGeo, goldColMat);
      sunDiskMesh.position.y = 3.08;
      sunDiskMesh.scale.set(1, 1, 0.35);

      col.add(baseMesh, shaftMesh, f1, f2, f3, capMesh, abacusMesh, sunDiskMesh);
      environmentGroup.add(col);
    }
    [
      pedGeo, pedMat, ringGeo, ringMat, sandstoneMat, goldColMat, lapisColMat,
      colBaseGeo, colShaftGeo, colBandGeo, colCapGeo, colAbacusGeo, colSunGeo,
    ].forEach(pushLocalDisposable);

    const raGod = buildRa(raTex);
    const group = raGod.root;
    group.scale.setScalar(0.85);
    group.userData.animatePose = (dt: number) => {
      animateRa(raGod, dt, getSimTime(), raModeRef.current);
    };
    return { group };
  }

  return null;
}
