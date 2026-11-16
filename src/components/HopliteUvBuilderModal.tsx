import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Eye, Layers, Play, RotateCw, Shield, Sparkles, Swords, X, Building2, User } from 'lucide-react';
import { createGreekUnitMesh } from '../civilizacao/gregos/gregosModels';
import { createBuildingMesh, createMaterialPalette, createUnitMesh } from '../game/models';
import { BuildingKind, UnitKind } from '../game/types';
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

const INSPECTABLE_UNITS: { id: UnitKind; name: string; role: string }[] = [
  { id: 'hoplite', name: 'Hoplita Espartano', role: 'Infantaria pesada com lança e escudo hoplon' },
  { id: 'hipaspist', name: 'Hipaspista', role: 'Infantaria de elite ágil' },
  { id: 'archer', name: 'Arqueiro Toxotes', role: 'Combatente à distância' },
  { id: 'cavalry', name: 'Cavalaria Pródromo', role: 'Cavalaria rápida de reconhecimento' },
  { id: 'hero', name: 'Herói (Ajax / Odisseu)', role: 'Líder lendário com aura mítica' },
  { id: 'villager', name: 'Aldeão Grego', role: 'Unidade econômica de coleta' },
  { id: 'minotaur', name: 'Minotauro Mítico', role: 'Criatura mítica feroz' },
];

const INSPECTABLE_BUILDINGS: { id: BuildingKind; name: string; role: string }[] = [
  { id: 'town_center', name: 'Centro da Cidade', role: 'Sede principal — treina aldeões e avança eras' },
  { id: 'barracks', name: 'Quartel', role: 'Treina infantaria e hoplitas' },
  { id: 'armory', name: 'Arsenal', role: 'Pesquisa tecnologias de armas e armaduras' },
  { id: 'temple', name: 'Templo', role: 'Gera Favor e treina unidades míticas' },
  { id: 'fortress', name: 'Fortaleza', role: 'Defesa pesada e cerco' },
  { id: 'house', name: 'Casa', role: 'Aumenta o limite de população' },
  { id: 'tower', name: 'Torre de Vigia', role: 'Defesa avançada contra invasores' },
];

export function HopliteUvBuilderModal({
  isOpen,
  onClose,
  activeMode,
  activeTier,
  onSelectMode,
  onSelectTier,
}: HopliteUvBuilderModalProps) {
  const mount3DRef = useRef<HTMLDivElement | null>(null);
  const entityMeshRef = useRef<THREE.Group | null>(null);

  const [entityType, setEntityType] = useState<'unit' | 'building'>('unit');
  const [selectedUnit, setSelectedUnit] = useState<UnitKind>('hoplite');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingKind>('town_center');
  const [animState, setAnimState] = useState<'idle' | 'move' | 'attack'>('attack');
  const [autoRotate3D, setAutoRotate3D] = useState(true);

  const animStateRef = useRef(animState);
  animStateRef.current = animState;
  const autoRotateRef = useRef(autoRotate3D);
  autoRotateRef.current = autoRotate3D;

  useEffect(() => {
    if (!isOpen || !mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 4.8);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, 1.25);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xfff3da, 1.95);
    dir.position.set(4, 7, 5);
    dir.castShadow = true;
    scene.add(dir);

    const rim = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rim.position.set(-4, 3, -4);
    scene.add(rim);

    // Pedestal & Golden Ring
    const pedGeo = new THREE.CylinderGeometry(1.4, 1.55, 0.16, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x161c28,
      roughness: 0.5,
      metalness: 0.4,
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.08;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const ringGeo = new THREE.RingGeometry(1.25, 1.34, 32);
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

    // Build Mesh
    const buildCurrentEntity = () => {
      if (entityMeshRef.current) {
        scene.remove(entityMeshRef.current);
      }
      let group: THREE.Group;
      if (entityType === 'unit') {
        if (selectedUnit === 'hoplite' || selectedUnit === 'hipaspist') {
          group = createGreekUnitMesh(selectedUnit, 'player', pal, true, activeTier);
          group.userData.setArmorTier?.(activeTier);
          group.userData.setMode?.('3d');
        } else {
          group = createUnitMesh(selectedUnit, 'player', pal, true);
        }
      } else {
        group = createBuildingMesh(selectedBuilding, 'player', pal, true, 'greek');
      }
      scene.add(group);
      entityMeshRef.current = group;
    };

    buildCurrentEntity();

    let frameId = 0;
    let lastTime = performance.now();
    let simTime = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      simTime += dt;

      if (autoRotateRef.current && entityMeshRef.current) {
        entityMeshRef.current.rotation.y += dt * 0.45;
      }

      if (entityMeshRef.current?.userData.animatePose) {
        const moving = animStateRef.current === 'move';
        const attacking = animStateRef.current === 'attack';
        const attackT = attacking ? (Math.sin(simTime * 3.5) + 1) * 0.5 : null;
        entityMeshRef.current.userData.animatePose(dt, moving, 3.2, attackT);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isOpen, entityType, selectedUnit, selectedBuilding, activeTier]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090f]/85 p-3 backdrop-blur-md">
      <div className="flex w-full max-w-5xl flex-col rounded-2xl border border-[#d4af37]/60 bg-[#10141d] text-[#f3efe6] shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#161c28] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3d27a]">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#f3d27a]">Modelo 3D/2.5D — Age of Mythology</h2>
              <p className="text-xs text-[#9ca3af]">Inspecione unidades, heróis e edifícios em tempo real com iluminação 3D e animações procedurais</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#121620] text-[#9ca3af] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Panel: Entity Selectors */}
          <div className="col-span-1 md:col-span-4 border-r border-white/10 bg-[#121620]/70 p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Category Toggle */}
            <div className="flex rounded-xl bg-[#171c28] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setEntityType('unit')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  entityType === 'unit' ? 'bg-[#d4af37] text-[#0b0e14] shadow' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Unidades & Heróis</span>
              </button>
              <button
                type="button"
                onClick={() => setEntityType('building')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  entityType === 'building' ? 'bg-[#d4af37] text-[#0b0e14] shadow' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Edificações</span>
              </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
              {entityType === 'unit'
                ? INSPECTABLE_UNITS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUnit(u.id)}
                      className={`flex flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                        selectedUnit === u.id
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f3d27a]'
                          : 'border-white/10 bg-[#171c26]/60 text-[#d1d5db] hover:border-white/25 hover:bg-[#1f2636]'
                      }`}
                    >
                      <span className="font-display text-sm font-bold">{u.name}</span>
                      <span className="text-[11px] text-[#9ca3af]">{u.role}</span>
                    </button>
                  ))
                : INSPECTABLE_BUILDINGS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBuilding(b.id)}
                      className={`flex flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                        selectedBuilding === b.id
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f3d27a]'
                          : 'border-white/10 bg-[#171c26]/60 text-[#d1d5db] hover:border-white/25 hover:bg-[#1f2636]'
                      }`}
                    >
                      <span className="font-display text-sm font-bold">{b.name}</span>
                      <span className="text-[11px] text-[#9ca3af]">{b.role}</span>
                    </button>
                  ))}
            </div>

            {/* Hoplite Tier Selector (if hoplite) */}
            {entityType === 'unit' && selectedUnit === 'hoplite' && (
              <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#171c28] p-3">
                <span className="text-xs font-bold text-[#f3d27a]">Nível de Armadura do Hoplita</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => onSelectTier(tier as any)}
                      className={`rounded py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        activeTier === tier ? 'bg-[#d4af37] text-[#0b0e14]' : 'bg-[#222938] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      T{tier}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: 3D Viewport & Controls */}
          <div className="col-span-1 md:col-span-8 flex flex-col bg-[#0b0e14] relative">
            <div ref={mount3DRef} className="flex-1 w-full h-[380px] md:h-full relative overflow-hidden flex items-center justify-center" />

            {/* Floating Action Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl border border-white/15 bg-[#161c28]/90 p-2 shadow-xl backdrop-blur">
              {entityType === 'unit' && (
                <>
                  <button
                    type="button"
                    onClick={() => setAnimState('idle')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      animState === 'idle' ? 'bg-[#d4af37] text-[#0b0e14]' : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Idle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimState('move')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      animState === 'move' ? 'bg-[#d4af37] text-[#0b0e14]' : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Marcha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimState('attack')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      animState === 'attack' ? 'bg-[#d4af37] text-[#0b0e14]' : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <Swords className="h-3.5 w-3.5" />
                    <span>Ataque</span>
                  </button>
                  <div className="h-5 w-[1px] bg-white/15 mx-1" />
                </>
              )}
              <button
                type="button"
                onClick={() => setAutoRotate3D(!autoRotate3D)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  autoRotate3D ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Girar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
