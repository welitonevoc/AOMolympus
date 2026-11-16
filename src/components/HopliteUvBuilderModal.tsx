import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Layers, Play, RotateCw, Shield, Sparkles, Swords, X } from 'lucide-react';
import {
  AOM_HOPLITE_UV_TIERS,
  createGreekUnitMesh,
  drawHoplite2DPaperDollFrame,
  HOPLITE_UV_REGIONS,
} from '../civilizacao/gregos/gregosModels';
import { createMaterialPalette } from '../game/models';
import {
  createContactShadowTexture,
  createMarbleTexture,
  createSelectionRingTexture,
} from '../game/textures';

interface HopliteUvBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: '3d' | 'sprite' | 'brg' | 'uv2d';
  activeTier: 1 | 2 | 3 | 4;
  onSelectMode: (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => void;
  onSelectTier: (tier: 1 | 2 | 3 | 4) => void;
}

const REGION_3D_2D_META: Record<string, { part3D: string; part2D: string }> = {
  cuirass: {
    part3D: 'Torso Lathe 3D + Peitoral BRG',
    part2D: 'Tronco Central do Boneco 2D',
  },
  face: {
    part3D: 'Cabeça Esférica sob Elmo Coríntio',
    part2D: 'Rosto sob a Fenda do Elmo 2D',
  },
  pteruges: {
    part3D: 'Cilindro da Saia de Tiras de Couro',
    part2D: 'Saia Militar Articulada no Quadril',
  },
  chiton: {
    part3D: 'Bainha da Túnica Grega Branca',
    part2D: 'Fralda Plissada sob as Pteruges',
  },
  greaves: {
    part3D: 'Cnêmides (Canelas Esquerda/Direita)',
    part2D: 'Canelas Articuladas na Corrida',
  },
  thighs: {
    part3D: 'Coxas Superiores Articuladas',
    part2D: 'Coxas com Pêndulo de Passo',
  },
  arms: {
    part3D: 'Braço da Lança Dory & Braço do Escudo',
    part2D: 'Braços Articulados (Estocada)',
  },
  back: {
    part3D: 'Dorso / Omoplatas Traseiras',
    part2D: 'Camada Dorsal & Ombros',
  },
  sandals: {
    part3D: 'Sandálias Espartanas (Pés)',
    part2D: 'Pés com Rotação de Marcha',
  },
};

export function HopliteUvBuilderModal({
  isOpen,
  onClose,
  activeMode,
  activeTier,
  onSelectMode,
  onSelectTier,
}: HopliteUvBuilderModalProps) {
  const mount3DRef = useRef<HTMLDivElement | null>(null);
  const canvas2DRef = useRef<HTMLCanvasElement | null>(null);
  const unitMeshRef = useRef<THREE.Group | null>(null);

  const [animState, setAnimState] = useState<'idle' | 'move' | 'attack'>('attack');
  const [autoRotate3D, setAutoRotate3D] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('cuirass');
  const [showUvGrid, setShowUvGrid] = useState(true);

  const animStateRef = useRef(animState);
  animStateRef.current = animState;
  const autoRotateRef = useRef(autoRotate3D);
  autoRotateRef.current = autoRotate3D;

  // 1. Setup live Three.js 3D preview canvas
  useEffect(() => {
    if (!isOpen || !mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d121c);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 1.45, 3.25);
    camera.lookAt(0, 0.92, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, 1.15);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xfff3da, 1.85);
    dir.position.set(3, 5, 4);
    dir.castShadow = true;
    scene.add(dir);

    const rim = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rim.position.set(-3, 2, -3);
    scene.add(rim);

    // Pedestal
    const pedGeo = new THREE.CylinderGeometry(0.85, 0.98, 0.14, 24);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.07;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const ringGeo = new THREE.RingGeometry(0.76, 0.83, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    const marbleTex = createMarbleTexture(1);
    const shadowTex = createContactShadowTexture();
    const ringPlayerTex = createSelectionRingTexture('#38bdf8');
    const ringEnemyTex = createSelectionRingTexture('#ef4444');
    const pal = createMaterialPalette(marbleTex, shadowTex, ringPlayerTex, ringEnemyTex, 0x2563eb);

    const hoplite = createGreekUnitMesh('hoplite', 'player', pal, true);
    hoplite.userData.setArmorTier?.(activeTier);
    hoplite.userData.setMode?.(activeMode === 'brg' ? 'brg' : '3d');
    scene.add(hoplite);
    unitMeshRef.current = hoplite;

    let frameId = 0;
    let lastTime = performance.now();
    let phase = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      phase += dt * 6;

      if (autoRotateRef.current) {
        hoplite.rotation.y += dt * 0.65;
      }

      const st = animStateRef.current;
      hoplite.userData.updateBrg?.(dt, st);

      const lLeg = hoplite.userData.leftLeg as THREE.Object3D | undefined;
      const rLeg = hoplite.userData.rightLeg as THREE.Object3D | undefined;
      const lArm = hoplite.userData.leftArm as THREE.Object3D | undefined;
      const rArm = hoplite.userData.rightArm as THREE.Object3D | undefined;

      if (lLeg && rLeg && lArm && rArm) {
        if (st === 'move') {
          lLeg.rotation.x = Math.sin(phase * 1.4) * 0.55;
          rLeg.rotation.x = -Math.sin(phase * 1.4) * 0.55;
          rArm.rotation.x = -0.2 + Math.sin(phase * 1.4) * 0.25;
          lArm.rotation.y = Math.cos(phase * 1.4) * 0.15;
        } else if (st === 'attack') {
          const thrust = Math.sin(phase * 1.8);
          lLeg.rotation.x = 0.25;
          rLeg.rotation.x = -0.25;
          rArm.rotation.x = -0.45 + thrust * 0.65;
          lArm.rotation.y = -0.15 + thrust * 0.15;
        } else {
          lLeg.rotation.x = 0;
          rLeg.rotation.x = 0;
          rArm.rotation.x = Math.sin(phase * 0.4) * 0.06;
          lArm.rotation.y = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, [isOpen]);

  // Keep 3D unit tier & mode synced when user clicks buttons
  useEffect(() => {
    if (!unitMeshRef.current) return;
    unitMeshRef.current.userData.setArmorTier?.(activeTier);
    unitMeshRef.current.userData.setMode?.(activeMode === 'brg' ? 'brg' : '3d');
  }, [activeTier, activeMode]);

  // 2. Setup live 2D Paper-Doll Canvas animation loop using the uploaded 64x64 image
  useEffect(() => {
    if (!isOpen || !canvas2DRef.current) return;
    const canvas = canvas2DRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spec = AOM_HOPLITE_UV_TIERS[activeTier];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = spec.url;

    let frameId = 0;
    const startTime = performance.now();

    const render2D = () => {
      frameId = requestAnimationFrame(render2D);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle radial arena floor
      const grad = ctx.createRadialGradient(128, 215, 6, 128, 215, 75);
      grad.addColorStop(0, 'rgba(212, 175, 55, 0.24)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(128, 215, 72, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      const elapsed = (performance.now() - startTime) / 1000;
      const col = Math.floor(elapsed * 8) % 6;
      const row = animStateRef.current === 'idle' ? 0 : animStateRef.current === 'move' ? 1 : 2;

      drawHoplite2DPaperDollFrame(
        ctx,
        img.complete && img.naturalWidth > 0 ? img : null,
        activeTier,
        'player',
        row,
        col,
        256,
        256,
        0,
        0
      );
    };

    render2D();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isOpen, activeTier]);

  if (!isOpen) return null;

  const currentRegion =
    HOPLITE_UV_REGIONS.find((r) => r.id === selectedRegionId) ?? HOPLITE_UV_REGIONS[1];
  const currentRegionMeta =
    REGION_3D_2D_META[currentRegion.id] ?? REGION_3D_2D_META.cuirass;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border-2 border-[#d4af37]/80 bg-gradient-to-b from-[#161c28] via-[#101520] to-[#0b0e16] text-[#f5f0e6] shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/40 bg-[#1b2232] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#f3d27a] bg-gradient-to-b from-[#d4af37]/30 to-[#785c12]/40 text-[#f3d27a]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#f3d27a]">
                FORJA DE HEFESTO — MONTADOR 3D & 2D (ATLAS UV 64×64 AoM)
              </h2>
              <p className="text-xs text-[#cbd5e1]">
                Personagem 3D (Malha UV + BRG) e Personagem 2D (Paper-Doll Articulado) gerados direto das 4 texturas originais enviadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#cbd5e1] hover:border-[#f3d27a] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto p-4 sm:p-5">
          {/* LEFT COLUMN: 4 Uploaded Texture Tiers + Interactive 64x64 UV Atlas */}
          <div className="lg:col-span-4 flex flex-col gap-3.5">
            <div className="rounded-lg border border-[#d4af37]/35 bg-[#131824] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f3d27a]">
                  1. Escolha a Textura Enviada (64×64)
                </span>
                <span className="rounded bg-[#d4af37]/20 px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#f3d27a]">
                  4 Tiers AoM
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([1, 2, 3, 4] as const).map((tier) => {
                  const spec = AOM_HOPLITE_UV_TIERS[tier];
                  const isSelected = activeTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => onSelectTier(tier)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#facc15] bg-[#2a2312] shadow-[0_0_12px_rgba(250,204,21,0.28)]'
                          : 'border-white/10 bg-[#171d2b] hover:border-[#d4af37]/50'
                      }`}
                    >
                      <img
                        src={spec.url}
                        alt={spec.name}
                        className="h-10 w-10 shrink-0 rounded border border-white/20 bg-black"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold text-white">
                          Tier {tier} ({spec.id})
                        </div>
                        <div className="truncate text-[10px] text-[#cbd5e1]">
                          {tier === 1
                            ? 'Couro/Bronze'
                            : tier === 2
                            ? 'Bronze Médio'
                            : tier === 3
                            ? 'Pesado Ouro'
                            : 'Campeão Prata'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive 64x64 UV Atlas Map */}
            <div className="rounded-lg border border-[#d4af37]/35 bg-[#131824] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f3d27a]">
                  2. Mapa de Regiões UV (Clique na Peça)
                </span>
                <button
                  type="button"
                  onClick={() => setShowUvGrid((v) => !v)}
                  className="flex items-center gap-1 rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-[#cbd5e1] hover:text-white cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  <span>{showUvGrid ? 'Ocultar Guias' : 'Mostrar Guias'}</span>
                </button>
              </div>

              <div className="relative mx-auto aspect-square w-full max-w-[230px] overflow-hidden rounded-lg border-2 border-[#d4af37]/60 bg-black shadow-inner">
                <img
                  src={AOM_HOPLITE_UV_TIERS[activeTier].url}
                  alt="Hoplite 64x64 UV Atlas"
                  className="h-full w-full object-fill"
                  style={{ imageRendering: 'pixelated' }}
                />
                {showUvGrid &&
                  HOPLITE_UV_REGIONS.map((reg) => {
                    const active = selectedRegionId === reg.id;
                    const w = reg.x1 - reg.x0;
                    const h = reg.y1 - reg.y0;
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => setSelectedRegionId(reg.id)}
                        title={reg.label}
                        style={{
                          left: `${(reg.x0 / 64) * 100}%`,
                          top: `${(reg.y0 / 64) * 100}%`,
                          width: `${(w / 64) * 100}%`,
                          height: `${(h / 64) * 100}%`,
                          borderColor: reg.color,
                          backgroundColor: active ? `${reg.color}44` : `${reg.color}18`,
                        }}
                        className={`absolute border transition-all cursor-pointer ${
                          active ? 'border-2 z-20 ring-2 ring-white' : 'border opacity-80 hover:opacity-100 z-10'
                        }`}
                      />
                    );
                  })}
              </div>

              {/* Selected UV Region Details */}
              <div className="mt-2.5 rounded border border-white/10 bg-[#0d111a] p-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-[#f3d27a]">
                  <span>{currentRegion.label}</span>
                  <span className="font-mono-num text-[10px] text-[#94a3b8]">
                    UV ({currentRegion.x0},{currentRegion.y0}) → ({currentRegion.x1},{currentRegion.y1})
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-[#94a3b8]">{currentRegion.description}</p>
                <div className="mt-1.5 space-y-0.5 text-[11px] text-[#cbd5e1]">
                  <div>
                    <strong className="text-emerald-300">No 3D:</strong> {currentRegionMeta.part3D}
                  </div>
                  <div>
                    <strong className="text-sky-300">No 2D:</strong> {currentRegionMeta.part2D}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER & RIGHT COLUMNS: Live 3D Character vs Live 2D Character */}
          <div className="lg:col-span-8 flex flex-col gap-3.5">
            {/* Dual Live Viewports */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 3D Character Viewport */}
              <div className="flex flex-col rounded-lg border border-emerald-500/40 bg-[#121824] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      Personagem 3D (Malha UV Real)
                    </span>
                    <span className="text-[11px] text-[#94a3b8]">
                      Geometria 3D + BRG mapeada no Atlas 64×64
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoRotate3D((v) => !v)}
                    title="Girar câmera 360°"
                    className={`flex h-7 w-7 items-center justify-center rounded border cursor-pointer ${
                      autoRotate3D
                        ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300'
                        : 'border-white/15 bg-white/5 text-[#94a3b8]'
                    }`}
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div
                  ref={mount3DRef}
                  className="relative h-[260px] w-full overflow-hidden rounded-lg border border-white/10 bg-[#0d121c]"
                />

                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectMode('3d')}
                    className={`flex-1 rounded border py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      activeMode === '3d'
                        ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-md'
                        : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50'
                    }`}
                  >
                    {activeMode === '3d' ? '✓ Em Uso: 3D UV Real' : 'Usar 3D UV Real no Jogo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectMode('brg')}
                    className={`flex-1 rounded border py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      activeMode === 'brg'
                        ? 'border-purple-400 bg-purple-400 text-slate-950 shadow-md'
                        : 'border-purple-500/30 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50'
                    }`}
                  >
                    {activeMode === 'brg' ? '✓ Em Uso: 2.5D BRG UV' : 'Usar 2.5D BRG UV'}
                  </button>
                </div>
              </div>

              {/* 2D Paper-Doll Character Viewport */}
              <div className="flex flex-col rounded-lg border border-sky-500/40 bg-[#121824] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                      <Layers className="h-3.5 w-3.5" />
                      Personagem 2D (Paper-Doll UV)
                    </span>
                    <span className="text-[11px] text-[#94a3b8]">
                      Recortes 2D articulados direto da imagem 64×64
                    </span>
                  </div>
                  <span className="rounded border border-sky-400/40 bg-sky-950/60 px-2 py-0.5 font-mono-num text-[10px] text-sky-200">
                    18 Frames
                  </span>
                </div>

                <div className="relative flex h-[260px] w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#0d121c]">
                  <canvas ref={canvas2DRef} width={256} height={256} className="h-[240px] w-[240px]" />
                </div>

                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectMode('uv2d')}
                    className={`flex-1 rounded border py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      activeMode === 'uv2d'
                        ? 'border-sky-300 bg-sky-400 text-slate-950 shadow-md'
                        : 'border-sky-500/30 bg-sky-950/40 text-sky-200 hover:bg-sky-900/50'
                    }`}
                  >
                    {activeMode === 'uv2d' ? '✓ Em Uso: 2D Paper-Doll UV' : 'Usar 2D Paper-Doll UV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectMode('sprite')}
                    className={`flex-1 rounded border py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      activeMode === 'sprite'
                        ? 'border-amber-300 bg-amber-400 text-slate-950 shadow-md'
                        : 'border-amber-500/30 bg-amber-950/40 text-amber-200 hover:bg-amber-900/50'
                    }`}
                  >
                    {activeMode === 'sprite' ? '✓ Folha Iso PNG' : 'Folha Iso PNG'}
                  </button>
                </div>
              </div>
            </div>

            {/* Animation Controller & Active Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d4af37]/35 bg-[#131824] p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#f3d27a]">Testar Animação:</span>
                {(
                  [
                    { id: 'idle', label: 'Parado (Guarda)' },
                    { id: 'move', label: 'Correndo (Marcha)' },
                    { id: 'attack', label: 'Ataque (Estocada Dory)' },
                  ] as const
                ).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAnimState(a.id)}
                    className={`flex items-center gap-1 rounded border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      animState === a.id
                        ? 'border-[#f3d27a] bg-[#d4af37] text-[#0b0e13]'
                        : 'border-white/15 bg-[#1b2232] text-[#cbd5e1] hover:border-[#d4af37]/50'
                    }`}
                  >
                    {animState === a.id ? <Play className="h-3 w-3 fill-current" /> : <Swords className="h-3 w-3" />}
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#f5d77f] bg-gradient-to-b from-[#e0bc56] to-[#98721b] px-4 py-2 text-xs font-bold text-[#0d1017] shadow-lg hover:brightness-110 cursor-pointer"
              >
                Concluir e Voltar à Batalha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
