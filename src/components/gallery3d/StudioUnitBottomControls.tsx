import { MutableRefObject } from 'react';
import * as THREE from 'three';
import {
  CloudLightning,
  Compass,
  Crown,
  Eye,
  Flame,
  Hammer,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Skull,
  Sparkles,
  Sun,
  Swords,
  Trees,
  User,
  Users,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';
import { AtlanteanAction } from '../../civilizacao/atlantes/atlanteanVillagerModel';
import { EgyptianLaborerAction } from '../../civilizacao/egipcios/egyptianVillagerModel';
import { ZeusHopliteAction } from '../../civilizacao/gregos/zeusHopliteModel';
import { NorseWorkerRole, NorseWorkerTask } from '../../civilizacao/nordicos/norseVillagerModel';
import { PantheonId } from '../../game/types';
import { InspectableUnitId } from '../gallery3dCatalog';

export interface StudioUnitBottomControlsProps {
  selectedUnit: InspectableUnitId;
  selectedCiv: PantheonId;
  selectedMajorGod: string;
  entityMeshRef: MutableRefObject<THREE.Group | null>;

  zeusMode: 'pairar' | 'voar' | 'raios' | 'tempestade';
  setZeusMode: (m: 'pairar' | 'voar' | 'raios' | 'tempestade') => void;
  poseidonMode: 'conduzido' | 'correnteza' | 'golpe' | 'tsunami';
  setPoseidonMode: (m: 'conduzido' | 'correnteza' | 'golpe' | 'tsunami') => void;
  hadesMode: 'reinar' | 'marcha' | 'chama' | 'portal';
  setHadesMode: (m: 'reinar' | 'marcha' | 'chama' | 'portal') => void;
  artemisMode: 'vigilia' | 'cacada' | 'raizes' | 'alcateia';
  setArtemisMode: (m: 'vigilia' | 'cacada' | 'raizes' | 'alcateia') => void;
  hefestoMode: 'forja' | 'martelo' | 'automato' | 'erupcao';
  setHefestoMode: (m: 'forja' | 'martelo' | 'automato' | 'erupcao') => void;
  dionisioMode: 'banquete' | 'danca' | 'vinhas' | 'extase';
  setDionisioMode: (m: 'banquete' | 'danca' | 'vinhas' | 'extase') => void;
  afroditeMode: 'graca' | 'danca' | 'encanto' | 'mare';
  setAfroditeMode: (m: 'graca' | 'danca' | 'encanto' | 'mare') => void;
  apoloMode: 'pairar' | 'voo' | 'flecha' | 'helio';
  setApoloMode: (m: 'pairar' | 'voo' | 'flecha' | 'helio') => void;
  aresMode: 'postura' | 'investida' | 'sismico' | 'furia';
  setAresMode: (m: 'postura' | 'investida' | 'sismico' | 'furia') => void;
  atenaMode: 'guardia' | 'avanco' | 'egide' | 'furia';
  setAtenaMode: (m: 'guardia' | 'avanco' | 'egide' | 'furia') => void;
  hermesMode: 'flutuar' | 'velocidade' | 'rajada' | 'relampago';
  setHermesMode: (m: 'flutuar' | 'velocidade' | 'rajada' | 'relampago') => void;
  isisMode: 'majestade' | 'heka' | 'ankh' | 'sopdet';
  setIsisMode: (m: 'majestade' | 'heka' | 'ankh' | 'sopdet') => void;
  setMode: 'senhor' | 'tempestade' | 'deserto' | 'monstro';
  setSetMode: (m: 'senhor' | 'tempestade' | 'deserto' | 'monstro') => void;
  raMode: 'gloria' | 'bencao' | 'chuva' | 'ira';
  setRaMode: (m: 'gloria' | 'bencao' | 'chuva' | 'ira') => void;

  hopliteAction: ZeusHopliteAction;
  setHopliteAction: (a: ZeusHopliteAction) => void;
  villagerGender: 'homem' | 'mulher' | 'ambos';
  setVillagerGender: (g: 'homem' | 'mulher' | 'ambos') => void;
  villagerTask: 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir';
  setVillagerTask: (t: 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir') => void;
  norseWorkerMode: NorseWorkerRole | 'todos';
  setNorseWorkerMode: (m: NorseWorkerRole | 'todos') => void;
  norseWorkerTask: NorseWorkerTask;
  setNorseWorkerTask: (t: NorseWorkerTask) => void;
  egyptianLaborerGender: 'homem' | 'mulher' | 'ambos';
  setEgyptianLaborerGender: (g: 'homem' | 'mulher' | 'ambos') => void;
  egyptianLaborerTask: EgyptianLaborerAction;
  setEgyptianLaborerTask: (t: EgyptianLaborerAction) => void;
  atlanteanIsHero: boolean;
  setAtlanteanIsHero: (v: boolean) => void;
  atlanteanCitizenMode: 'todos' | 'homem' | 'mulher';
  setAtlanteanCitizenMode: (m: 'todos' | 'homem' | 'mulher') => void;
  atlanteanCitizenTask: AtlanteanAction;
  setAtlanteanCitizenTask: (t: AtlanteanAction) => void;

  medusaMode: 'auto' | 'flechas' | 'vigilia';
  setMedusaMode: (m: 'auto' | 'flechas' | 'vigilia') => void;
  medusaGazeCooldown: number;
  colossusTier: number;
  setColossusTier: (t: number) => void;
  colossusAction: 'slam' | 'marcha' | 'eat_tree' | 'vigilia';
  setColossusAction: (a: 'slam' | 'marcha' | 'eat_tree' | 'vigilia') => void;
  hydraActionMode: 'combate' | 'vigilia' | 'manual_bite';
  setHydraActionMode: (m: 'combate' | 'vigilia' | 'manual_bite') => void;
  hydraTargetCount: number;
  setHydraTargetCount: (c: number) => void;
  hydraHeads: number;
  setHydraHeads: (h: number) => void;
  hydraTotalDamage: number;
  setHydraTotalDamage: (d: number) => void;
  setHydraTotalHits: (h: number) => void;
  manticoreMode: 'combate' | 'vigilia';
  setManticoreMode: (m: 'combate' | 'vigilia') => void;
  manticoreVolleyCooldown: number;
  manticoreAutoCast: boolean;
  setManticoreAutoCast: React.Dispatch<React.SetStateAction<boolean>>;
  manticoreTargetCount: number;
  setManticoreTargetCount: (c: number) => void;
  manticoreFrontline: boolean;
  setManticoreFrontline: React.Dispatch<React.SetStateAction<boolean>>;
  manticoreQuillsFired: number;
  manticorePiercingDamage: number;
  cyclopsMode: 'combate' | 'vigilia';
  setCyclopsMode: (m: 'combate' | 'vigilia') => void;
  cyclopsThrowCooldown: number;
  cyclopsIsElder: boolean;
  cyclopsAutoCast: boolean;
  setCyclopsAutoCast: React.Dispatch<React.SetStateAction<boolean>>;
  cyclopsTargetId: number;
  cyclopsTotalDamage: number;

  animState: 'idle' | 'move' | 'attack';
  setAnimState: (s: 'idle' | 'move' | 'attack') => void;
  myrmidonFury: boolean;
  setMyrmidonFury: React.Dispatch<React.SetStateAction<boolean>>;
}

export function StudioUnitBottomControls(props: StudioUnitBottomControlsProps) {
  const {
    selectedUnit,
    selectedCiv,
    selectedMajorGod,
    entityMeshRef,
    zeusMode,
    setZeusMode,
    poseidonMode,
    setPoseidonMode,
    hadesMode,
    setHadesMode,
    artemisMode,
    setArtemisMode,
    hefestoMode,
    setHefestoMode,
    dionisioMode,
    setDionisioMode,
    afroditeMode,
    setAfroditeMode,
    apoloMode,
    setApoloMode,
    aresMode,
    setAresMode,
    atenaMode,
    setAtenaMode,
    hermesMode,
    setHermesMode,
    isisMode,
    setIsisMode,
    setMode,
    setSetMode,
    raMode,
    setRaMode,
    hopliteAction,
    setHopliteAction,
    villagerGender,
    setVillagerGender,
    villagerTask,
    setVillagerTask,
    norseWorkerMode,
    setNorseWorkerMode,
    norseWorkerTask,
    setNorseWorkerTask,
    egyptianLaborerGender,
    setEgyptianLaborerGender,
    egyptianLaborerTask,
    setEgyptianLaborerTask,
    atlanteanIsHero,
    setAtlanteanIsHero,
    atlanteanCitizenMode,
    setAtlanteanCitizenMode,
    atlanteanCitizenTask,
    setAtlanteanCitizenTask,
    medusaMode,
    setMedusaMode,
    medusaGazeCooldown,
    colossusTier,
    setColossusTier,
    colossusAction,
    setColossusAction,
    hydraActionMode,
    setHydraActionMode,
    hydraTargetCount,
    setHydraTargetCount,
    hydraHeads,
    setHydraHeads,
    hydraTotalDamage,
    setHydraTotalDamage,
    setHydraTotalHits,
    manticoreMode,
    setManticoreMode,
    manticoreVolleyCooldown,
    manticoreAutoCast,
    setManticoreAutoCast,
    manticoreTargetCount,
    setManticoreTargetCount,
    manticoreFrontline,
    setManticoreFrontline,
    manticoreQuillsFired,
    manticorePiercingDamage,
    cyclopsMode,
    setCyclopsMode,
    cyclopsThrowCooldown,
    cyclopsIsElder,
    cyclopsAutoCast,
    setCyclopsAutoCast,
    cyclopsTargetId,
    cyclopsTotalDamage,
    animState,
    setAnimState,
    myrmidonFury,
    setMyrmidonFury,
  } = props;

  if (selectedUnit === 'zeus' && selectedCiv === 'greek') {
    return (
      <>
        <button
          type="button"
          onClick={() => setZeusMode('pairar')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            zeusMode === 'pairar'
              ? 'bg-yellow-400 text-slate-950 shadow'
              : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Pairar</span>
        </button>
        <button
          type="button"
          onClick={() => setZeusMode('voar')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            zeusMode === 'voar'
              ? 'bg-yellow-400 text-slate-950 shadow'
              : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
          }`}
        >
          <Wind className="h-3.5 w-3.5" />
          <span>Voar</span>
        </button>
        <button
          type="button"
          onClick={() => setZeusMode('raios')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            zeusMode === 'raios'
              ? 'bg-yellow-400 text-slate-950 shadow'
              : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Lançar Raios</span>
        </button>
        <button
          type="button"
          onClick={() => setZeusMode('tempestade')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            zeusMode === 'tempestade'
              ? 'bg-yellow-400 text-slate-950 shadow'
              : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
          }`}
        >
          <CloudLightning className="h-3.5 w-3.5" />
          <span>Tempestade</span>
        </button>
      </>
    );
  }

  if (selectedUnit === 'poseidon' && selectedCiv === 'greek') {
    return (
      <>
        <button
          type="button"
          onClick={() => setPoseidonMode('conduzido')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            poseidonMode === 'conduzido'
              ? 'bg-teal-400 text-slate-950 shadow'
              : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
          }`}
        >
          <Waves className="h-3.5 w-3.5" />
          <span>Conduzido</span>
        </button>
        <button
          type="button"
          onClick={() => setPoseidonMode('correnteza')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            poseidonMode === 'correnteza'
              ? 'bg-teal-400 text-slate-950 shadow'
              : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
          }`}
        >
          <Wind className="h-3.5 w-3.5" />
          <span>Correnteza</span>
        </button>
        <button
          type="button"
          onClick={() => setPoseidonMode('golpe')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            poseidonMode === 'golpe'
              ? 'bg-teal-400 text-slate-950 shadow'
              : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
          <span>Golpe Tridente</span>
        </button>
        <button
          type="button"
          onClick={() => setPoseidonMode('tsunami')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            poseidonMode === 'tsunami'
              ? 'bg-teal-400 text-slate-950 shadow'
              : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tsunami</span>
        </button>
      </>
    );
  }

  if (selectedUnit === 'hades' && selectedCiv === 'greek') {
    return (
      <>
        <button
          type="button"
          onClick={() => setHadesMode('reinar')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            hadesMode === 'reinar'
              ? 'bg-emerald-400 text-slate-950 shadow'
              : 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
          }`}
        >
          <Crown className="h-3.5 w-3.5" />
          <span>Reinar</span>
        </button>
        <button
          type="button"
          onClick={() => setHadesMode('marcha')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            hadesMode === 'marcha'
              ? 'bg-purple-400 text-slate-950 shadow'
              : 'border border-purple-400/30 text-purple-200 hover:bg-purple-400/15'
          }`}
        >
          <Wind className="h-3.5 w-3.5" />
          <span>Marcha Sombria</span>
        </button>
        <button
          type="button"
          onClick={() => setHadesMode('chama')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            hadesMode === 'chama'
              ? 'bg-emerald-400 text-slate-950 shadow'
              : 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Chama Tártaro</span>
        </button>
        <button
          type="button"
          onClick={() => setHadesMode('portal')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            hadesMode === 'portal'
              ? 'bg-purple-400 text-slate-950 shadow'
              : 'border border-purple-400/30 text-purple-200 hover:bg-purple-400/15'
          }`}
        >
          <Skull className="h-3.5 w-3.5" />
          <span>Portal Almas</span>
        </button>
      </>
    );
  }

  if (selectedUnit === 'artemis' && selectedCiv === 'greek') {
    return (
      <>
        {(
          [
            { id: 'vigilia', label: 'Vigília Lunar', icon: Compass },
            { id: 'cacada', label: 'Caçada Ágil', icon: Wind },
            { id: 'raizes', label: 'Raízes Espinhosas', icon: Sparkles },
            { id: 'alcateia', label: 'Alcateia Noturna', icon: Crown },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setArtemisMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                artemisMode === m.id
                  ? 'bg-sky-400 text-slate-950 shadow'
                  : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'hefesto' && selectedCiv === 'greek') {
    return (
      <>
        {(
          [
            { id: 'forja', label: 'Forja Divina', icon: Flame },
            { id: 'martelo', label: 'Golpe Bigorna', icon: Swords },
            { id: 'automato', label: 'Autômato Ouro', icon: Crown },
            { id: 'erupcao', label: 'Erupção Lemnos', icon: Zap },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setHefestoMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                hefestoMode === m.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'dionisio' && selectedCiv === 'greek') {
    return (
      <>
        {(
          [
            { id: 'banquete', label: 'Banquete', icon: Crown },
            { id: 'danca', label: 'Dança Báquica', icon: Wind },
            { id: 'vinhas', label: 'Vinhas', icon: Sparkles },
            { id: 'extase', label: 'Êxtase', icon: Zap },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setDionisioMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                dionisioMode === m.id
                  ? 'bg-purple-500 text-white shadow'
                  : 'border border-purple-400/30 text-purple-200 hover:bg-purple-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'afrodite' && selectedCiv === 'greek') {
    return (
      <>
        {(
          [
            { id: 'graca', label: 'Graça Divina', icon: Crown },
            { id: 'danca', label: 'Pétalas', icon: Wind },
            { id: 'encanto', label: 'Encanto', icon: Sparkles },
            { id: 'mare', label: 'Maré Paixão', icon: Waves },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setAfroditeMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                afroditeMode === m.id
                  ? 'bg-rose-500 text-white shadow'
                  : 'border border-rose-400/30 text-rose-200 hover:bg-rose-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'apolo' && selectedCiv === 'greek') {
    return (
      <>
        {(
          [
            { id: 'pairar', label: 'Pairar Solar', icon: Sun },
            { id: 'voo', label: 'Voo Radiante', icon: Wind },
            { id: 'flecha', label: 'Flecha Divina', icon: Sparkles },
            { id: 'helio', label: 'Chama Hélio', icon: Flame },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setApoloMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                apoloMode === m.id
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'ares' && selectedCiv === 'greek') {
    return (
      <>
        {(
          [
            { id: 'postura', label: 'Postura Guerra', icon: Shield },
            { id: 'investida', label: 'Investida', icon: Wind },
            { id: 'sismico', label: 'Sísmico', icon: Zap },
            { id: 'furia', label: 'Fúria Sangue', icon: Flame },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setAresMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                aresMode === m.id
                  ? 'bg-red-600 text-white shadow'
                  : 'border border-red-400/30 text-red-200 hover:bg-red-500/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'atena' && selectedCiv === 'greek') {
    return (
      <>
        {(
          [
            { id: 'guardia', label: 'Guardiã', icon: Shield },
            { id: 'avanco', label: 'Avanço Tático', icon: Wind },
            { id: 'egide', label: 'Égide', icon: Sparkles },
            { id: 'furia', label: 'Fúria Estratégica', icon: Flame },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setAtenaMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                atenaMode === m.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'border border-blue-400/30 text-blue-200 hover:bg-blue-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'hermes' && selectedCiv === 'greek') {
    return (
      <>
        {(
          [
            { id: 'flutuar', label: 'Flutuar', icon: Wind },
            { id: 'velocidade', label: 'Velocidade', icon: Zap },
            { id: 'rajada', label: 'Rajada Vento', icon: Sparkles },
            { id: 'relampago', label: 'Passo Relâmpago', icon: Flame },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setHermesMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                hermesMode === m.id
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'isis' && selectedCiv === 'egyptian') {
    return (
      <>
        {(
          [
            { id: 'majestade', label: 'Majestade Alada', icon: Wind },
            { id: 'heka', label: 'Magia Heka', icon: Sparkles },
            { id: 'ankh', label: 'Sopro Ankh', icon: Shield },
            { id: 'sopdet', label: 'Estrela Sopdet', icon: Flame },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setIsisMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isisMode === m.id
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'set' && selectedCiv === 'egyptian') {
    return (
      <>
        {(
          [
            { id: 'senhor', label: 'Senhor Caos', icon: Crown },
            { id: 'tempestade', label: 'Tempestade Areia', icon: Wind },
            { id: 'deserto', label: 'Ira Deserto', icon: Zap },
            { id: 'monstro', label: 'Horda Monstros', icon: Skull },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSetMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                setMode === m.id
                  ? 'bg-orange-500 text-white shadow'
                  : 'border border-orange-400/30 text-orange-200 hover:bg-orange-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedUnit === 'ra' && selectedCiv === 'egyptian') {
    return (
      <>
        {(
          [
            { id: 'gloria', label: 'Glória Solar', icon: Sun },
            { id: 'bencao', label: 'Bênção Faraó', icon: Sparkles },
            { id: 'chuva', label: 'Chuva Dourada', icon: Wind },
            { id: 'ira', label: 'Raio de Rá', icon: Zap },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setRaMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                raMode === m.id
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedCiv === 'greek' && selectedUnit === 'hoplite') {
    const acts =
      selectedMajorGod === 'Poseidon'
        ? [
            { id: 'guarda', label: 'Guarda Marinha', icon: Shield },
            { id: 'marcha', label: 'Marcha', icon: Play },
            { id: 'corrida', label: 'Corrida', icon: Wind },
            { id: 'ataque', label: 'Estocada Tridente', icon: Zap },
            { id: 'defesa', label: 'Muralha de Coral', icon: Shield },
          ]
        : selectedMajorGod === 'Hades'
        ? [
            { id: 'guarda', label: 'Guarda Sombria', icon: Shield },
            { id: 'marcha', label: 'Marcha', icon: Play },
            { id: 'corrida', label: 'Corrida', icon: Wind },
            { id: 'ataque', label: 'Estocada Bidente', icon: Zap },
            { id: 'defesa', label: 'Égide do Tártaro', icon: Shield },
          ]
        : [
            { id: 'guarda', label: 'Guarda Falange', icon: Shield },
            { id: 'marcha', label: 'Marcha', icon: Play },
            { id: 'corrida', label: 'Corrida', icon: Wind },
            { id: 'ataque', label: 'Ataque Lança', icon: Zap },
            { id: 'defesa', label: 'Defesa Escudo', icon: Shield },
          ];
    const isPoseidon = selectedMajorGod === 'Poseidon';
    const isHades = selectedMajorGod === 'Hades';
    const activeColor = isPoseidon
      ? 'bg-teal-400 text-slate-950 shadow'
      : isHades
      ? 'bg-emerald-500 text-slate-950 shadow'
      : 'bg-amber-400 text-slate-950 shadow';
    const inactiveColor = isPoseidon
      ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
      : isHades
      ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
      : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

    return (
      <>
        {acts.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => setHopliteAction(act.id as ZeusHopliteAction)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                hopliteAction === act.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedCiv === 'greek' && selectedUnit === 'villager') {
    const isPoseidon = selectedMajorGod === 'Poseidon';
    const isHades = selectedMajorGod === 'Hades';
    const activeColor = isPoseidon
      ? 'bg-teal-400 text-slate-950 shadow'
      : isHades
      ? 'bg-emerald-500 text-slate-950 shadow'
      : 'bg-amber-400 text-slate-950 shadow';
    const inactiveColor = isPoseidon
      ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
      : isHades
      ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
      : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

    return (
      <>
        {(
          [
            { id: 'ambos', label: 'Ambos', icon: Users },
            { id: 'homem', label: 'Homem', icon: User },
            { id: 'mulher', label: 'Mulher', icon: User },
          ] as const
        ).map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setVillagerGender(g.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                villagerGender === g.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{g.label}</span>
            </button>
          );
        })}
        <div className="h-4 w-px bg-white/20 mx-1" />
        {(
          [
            { id: 'vigilia', label: 'Vigília', icon: Shield },
            { id: 'andar', label: 'Andando', icon: Play },
            { id: 'madeira', label: 'Madeira', icon: Trees },
            { id: 'ouro', label: 'Ouro', icon: Sparkles },
            { id: 'fruta', label: 'Frutas', icon: Sun },
            { id: 'construir', label: 'Construir', icon: Hammer },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setVillagerTask(t.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                villagerTask === t.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedCiv === 'norse' && (selectedUnit === 'villager' || selectedUnit === 'norse_dwarf')) {
    const god = selectedMajorGod.toLowerCase();
    const activeColor =
      god === 'thor'
        ? 'bg-amber-500 text-slate-950 shadow'
        : god === 'loki'
        ? 'bg-emerald-500 text-slate-950 shadow'
        : god === 'freyr'
        ? 'bg-yellow-400 text-slate-950 shadow'
        : 'bg-sky-400 text-slate-950 shadow';
    const inactiveColor =
      god === 'thor'
        ? 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
        : god === 'loki'
        ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
        : god === 'freyr'
        ? 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
        : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

    return (
      <>
        {(
          [
            { id: 'todos', label: 'Todos (3)', icon: Users },
            { id: 'homem', label: 'Coletor', icon: User },
            { id: 'mulher', label: 'Coletora', icon: User },
            { id: 'anao', label: 'Anão Minerador', icon: Hammer },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setNorseWorkerMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                norseWorkerMode === m.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
        <div className="h-4 w-px bg-white/20 mx-1" />
        {(
          [
            { id: 'vigilia', label: 'Vigília', icon: Shield },
            { id: 'andar', label: 'Andando', icon: Play },
            { id: 'madeira', label: 'Pinheiro', icon: Trees },
            { id: 'ouro', label: 'Ouro', icon: Sparkles },
            { id: 'fruta', label: 'Bagas', icon: Sun },
            { id: 'construir', label: 'Construir', icon: Hammer },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setNorseWorkerTask(t.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                norseWorkerTask === t.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedCiv === 'egyptian' && selectedUnit === 'villager') {
    const god = selectedMajorGod.toLowerCase();
    const activeColor =
      god === 'isis' || god === 'ísis'
        ? 'bg-teal-400 text-slate-950 shadow'
        : god === 'set'
        ? 'bg-orange-500 text-slate-950 shadow'
        : 'bg-amber-400 text-slate-950 shadow';
    const inactiveColor =
      god === 'isis' || god === 'ísis'
        ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
        : god === 'set'
        ? 'border border-orange-400/30 text-orange-200 hover:bg-orange-400/15'
        : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

    return (
      <>
        {(
          [
            { id: 'ambos', label: 'Ambos', icon: Users },
            { id: 'homem', label: 'Homem', icon: User },
            { id: 'mulher', label: 'Mulher', icon: User },
          ] as const
        ).map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setEgyptianLaborerGender(g.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                egyptianLaborerGender === g.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{g.label}</span>
            </button>
          );
        })}
        <div className="h-4 w-px bg-white/20 mx-1" />
        {(
          [
            { id: 'vigilia', label: 'Vigília', icon: Shield },
            { id: 'andar', label: 'Andando', icon: Play },
            { id: 'madeira', label: 'Palmeira', icon: Trees },
            { id: 'ouro', label: 'Ouro', icon: Sparkles },
            { id: 'fruta', label: 'Tâmaras', icon: Sun },
            { id: 'construir', label: 'Templo', icon: Hammer },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setEgyptianLaborerTask(t.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                egyptianLaborerTask === t.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedCiv === 'atlantean' && (selectedUnit === 'villager' || selectedUnit === 'citizen')) {
    const god = selectedMajorGod.toLowerCase();
    const activeColor =
      god === 'gaia'
        ? 'bg-emerald-500 text-slate-950 shadow'
        : god === 'urano' || god === 'oranos'
        ? 'bg-amber-400 text-slate-950 shadow'
        : 'bg-sky-400 text-slate-950 shadow';
    const inactiveColor =
      god === 'gaia'
        ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
        : god === 'urano' || god === 'oranos'
        ? 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
        : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

    return (
      <>
        <button
          type="button"
          onClick={() => setAtlanteanIsHero(!atlanteanIsHero)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            atlanteanIsHero
              ? 'bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/50 ring-2 ring-yellow-200'
              : 'border border-amber-400/40 text-amber-300 bg-amber-950/40 hover:bg-amber-900/40'
          }`}
        >
          <Crown className="h-3.5 w-3.5" />
          <span>{atlanteanIsHero ? 'Herói Ativo' : 'Promover Herói'}</span>
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        {(
          [
            { id: 'todos', label: 'Casal + Lhama', icon: Users },
            { id: 'homem', label: 'Cidadão', icon: User },
            { id: 'mulher', label: 'Cidadã', icon: User },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setAtlanteanCitizenMode(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                atlanteanCitizenMode === m.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
        <div className="h-4 w-px bg-white/20 mx-1" />
        {(
          [
            { id: 'vigilia', label: 'Vigília', icon: Shield },
            { id: 'andar', label: 'Com Lhama', icon: Play },
            { id: 'madeira', label: 'Madeira', icon: Trees },
            { id: 'ouro', label: 'Ouro', icon: Sparkles },
            { id: 'fruta', label: 'Frutas', icon: Sun },
            { id: 'construir', label: 'Construir', icon: Hammer },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAtlanteanCitizenTask(t.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                atlanteanCitizenTask === t.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </>
    );
  }

  if (selectedCiv === 'greek' && selectedUnit === 'medusa') {
    return (
      <>
        <button
          type="button"
          onClick={() => setMedusaMode('auto')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            medusaMode === 'auto'
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
          <span>🏹 Combate Auto</span>
        </button>
        <button
          type="button"
          onClick={() => setMedusaMode('flechas')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            medusaMode === 'flechas'
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>🎯 Só Flechas</span>
        </button>
        <button
          type="button"
          onClick={() => setMedusaMode('vigilia')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            medusaMode === 'vigilia'
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>🛡️ Vigília</span>
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => entityMeshRef.current?.userData?.triggerGaze?.()}
          disabled={medusaGazeCooldown > 0}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            medusaGazeCooldown > 0
              ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300/60 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 ring-1 ring-emerald-300'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>
            {medusaGazeCooldown > 0
              ? `⏳ Olhar (${Math.ceil(medusaGazeCooldown)}s)`
              : '⚡ Olhar Petrificante'}
          </span>
        </button>
      </>
    );
  }

  if (selectedCiv === 'greek' && selectedUnit === 'colossus') {
    return (
      <>
        {(
          [
            { tier: 1, label: 'Bronze' },
            { tier: 2, label: 'Prata (Talos)' },
            { tier: 3, label: 'Ouro (Rodes)' },
          ] as const
        ).map((spec) => (
          <button
            key={spec.tier}
            type="button"
            onClick={() => setColossusTier(spec.tier)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              colossusTier === spec.tier
                ? spec.tier === 3
                  ? 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-400/30 ring-1 ring-amber-300'
                  : spec.tier === 2
                  ? 'bg-gradient-to-r from-slate-200 to-sky-300 text-slate-950 font-black shadow-lg shadow-sky-400/30 ring-1 ring-sky-300'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 font-black shadow-lg shadow-amber-600/30 ring-1 ring-amber-500'
                : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>{spec.label}</span>
          </button>
        ))}
        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setColossusAction('slam')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            colossusAction === 'slam'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
          <span>⚔️ Montante</span>
        </button>
        <button
          type="button"
          onClick={() => setColossusAction('marcha')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            colossusAction === 'marcha'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          <span>🛡️ Marcha</span>
        </button>
        <button
          type="button"
          onClick={() => setColossusAction('eat_tree')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            colossusAction === 'eat_tree'
              ? 'bg-emerald-400 text-slate-950 shadow ring-1 ring-emerald-300'
              : 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
          }`}
        >
          <Trees className="h-3.5 w-3.5" />
          <span>🌲 Devorar Árvore</span>
        </button>
        <button
          type="button"
          onClick={() => setColossusAction('vigilia')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            colossusAction === 'vigilia'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Vigília</span>
        </button>
      </>
    );
  }

  if (selectedCiv === 'greek' && selectedUnit === 'hydra') {
    return (
      <>
        <button
          type="button"
          onClick={() => setHydraActionMode('combate')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            hydraActionMode === 'combate'
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
          <span>🐉 Auto Bote</span>
        </button>
        <button
          type="button"
          onClick={() => setHydraActionMode('vigilia')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            hydraActionMode === 'vigilia'
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Vigília</span>
        </button>
        <button
          type="button"
          onClick={() => entityMeshRef.current?.userData?.triggerBite?.()}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold border border-amber-400/40 text-amber-200 hover:bg-amber-400/20 active:scale-95 transition cursor-pointer whitespace-nowrap"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>⚡ Morder</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setHydraTotalDamage(0);
            setHydraTotalHits(0);
            setHydraHeads(1);
            entityMeshRef.current?.userData?.setHeadCount?.(1);
          }}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold border border-red-400/30 text-red-300 hover:bg-red-400/15 transition cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setHydraTargetCount(1)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            hydraTargetCount === 1
              ? 'bg-blue-500 text-white shadow ring-1 ring-blue-300'
              : 'border border-blue-400/30 text-blue-200 hover:bg-blue-400/15'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>1 Soldado</span>
        </button>
        <button
          type="button"
          onClick={() => setHydraTargetCount(3)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            hydraTargetCount === 3
              ? 'bg-blue-500 text-white shadow ring-1 ring-blue-300'
              : 'border border-blue-400/30 text-blue-200 hover:bg-blue-400/15'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>3 Soldados</span>
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        {[1, 2, 3, 4, 5].map((cnt) => (
          <button
            key={cnt}
            type="button"
            onClick={() => {
              setHydraHeads(cnt);
              entityMeshRef.current?.userData?.setHeadCount?.(cnt);
            }}
            className={`flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              hydraHeads === cnt
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow'
                : 'border border-amber-400/30 text-amber-200/80 hover:bg-amber-400/15'
            }`}
          >
            <span>
              {cnt} Cab ({cnt * 30})
            </span>
          </button>
        ))}
        <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-amber-400/30 px-2.5 py-1 text-xs">
          <span className="font-bold text-amber-300">💥 {hydraTotalDamage}/1600</span>
          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((hydraTotalDamage / 1600) * 100))}%` }}
            />
          </div>
        </div>
      </>
    );
  }

  if (selectedCiv === 'greek' && selectedUnit === 'manticore') {
    return (
      <>
        <button
          type="button"
          onClick={() => setManticoreMode('combate')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            manticoreMode === 'combate'
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
          <span>🦂 Ataque à Distância</span>
        </button>
        <button
          type="button"
          onClick={() => setManticoreMode('vigilia')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            manticoreMode === 'vigilia'
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>🦁 Vigília Alada</span>
        </button>
        <button
          type="button"
          onClick={() => entityMeshRef.current?.userData?.triggerVolley?.()}
          disabled={manticoreVolleyCooldown > 0}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            manticoreVolleyCooldown > 0
              ? 'bg-red-950/60 border border-red-500/30 text-red-300/60 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-red-800 text-white font-black shadow-lg shadow-red-500/40 hover:scale-105 active:scale-95 ring-1 ring-red-300'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>
            {manticoreVolleyCooldown > 0
              ? `⏳ Recarga (${manticoreVolleyCooldown.toFixed(1)}s)`
              : '💥 Rajada de Espinhos (PRONTO)'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setManticoreAutoCast((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            manticoreAutoCast
              ? 'bg-emerald-600 text-white font-black shadow ring-1 ring-emerald-300'
              : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15'
          }`}
        >
          <span>{manticoreAutoCast ? '⚙️ Auto-Cast: ON' : '⚙️ Auto-Cast: OFF'}</span>
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setManticoreTargetCount(1)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            manticoreTargetCount === 1
              ? 'bg-sky-500 text-white shadow ring-1 ring-sky-300'
              : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>1 Alvo</span>
        </button>
        <button
          type="button"
          onClick={() => setManticoreTargetCount(5)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            manticoreTargetCount === 5
              ? 'bg-sky-500 text-white shadow ring-1 ring-sky-300'
              : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>5 Alvos (Grupo)</span>
        </button>
        <button
          type="button"
          onClick={() => setManticoreFrontline((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            manticoreFrontline
              ? 'bg-blue-600 text-amber-300 font-bold shadow ring-1 ring-amber-300'
              : 'border border-blue-400/30 text-blue-200 hover:bg-blue-400/15'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>{manticoreFrontline ? '🛡️ Escolta: ON' : '⚠️ Escolta: OFF'}</span>
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-red-500/30 px-2.5 py-1 text-xs">
          <span className="font-bold text-red-300">🦂 Recarga:</span>
          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-100"
              style={{
                width: `${Math.round(((12.0 - manticoreVolleyCooldown) / 12.0) * 100)}%`,
              }}
            />
          </div>
          <span className="font-bold text-amber-300">🏹 {manticoreQuillsFired} espinhos</span>
          <span className="text-slate-400">💥 {manticorePiercingDamage} dano</span>
        </div>
      </>
    );
  }

  if (selectedCiv === 'greek' && selectedUnit === 'cyclops') {
    return (
      <>
        <button
          type="button"
          onClick={() => setCyclopsMode('combate')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            cyclopsMode === 'combate'
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
          <span>🔨 Combate (Arremesso + Clava)</span>
        </button>
        <button
          type="button"
          onClick={() => setCyclopsMode('vigilia')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            cyclopsMode === 'vigilia'
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>👁️ Vigília</span>
        </button>
        <button
          type="button"
          onClick={() => entityMeshRef.current?.userData?.triggerThrow?.()}
          disabled={cyclopsThrowCooldown > 0}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            cyclopsThrowCooldown > 0
              ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300/60 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/40 hover:scale-105 active:scale-95 ring-1 ring-amber-300'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>
            {cyclopsThrowCooldown > 0
              ? `⏳ Recarga (${cyclopsThrowCooldown.toFixed(1)}s)`
              : '🤾 Arremessar Inimigo (PRONTO)'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => entityMeshRef.current?.userData?.toggleElder?.()}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            cyclopsIsElder
              ? 'bg-gradient-to-r from-red-600 to-red-800 text-white font-black shadow-lg shadow-red-500/40 ring-1 ring-red-300'
              : 'border border-amber-400/30 text-amber-300 hover:bg-amber-400/15'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>{cyclopsIsElder ? '🌟 Ciclope Ancião (Ativo)' : '⚡ Vontade de Cronos (Ciclope Ancião)'}</span>
        </button>
        <button
          type="button"
          onClick={() => setCyclopsAutoCast((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            cyclopsAutoCast
              ? 'bg-emerald-600 text-white font-black shadow ring-1 ring-emerald-300'
              : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15'
          }`}
        >
          <span>{cyclopsAutoCast ? '⚙️ Auto-Arremesso: ON' : '⚙️ Auto-Arremesso: OFF'}</span>
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => entityMeshRef.current?.userData?.selectTarget?.(1)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            cyclopsTargetId === 1
              ? 'bg-amber-500 text-slate-950 font-bold shadow ring-1 ring-amber-300'
              : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Hoplita 1</span>
        </button>
        <button
          type="button"
          onClick={() => entityMeshRef.current?.userData?.selectTarget?.(2)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            cyclopsTargetId === 2
              ? 'bg-amber-500 text-slate-950 font-bold shadow ring-1 ring-amber-300'
              : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Hoplita 2</span>
        </button>
        <button
          type="button"
          onClick={() => entityMeshRef.current?.userData?.selectTarget?.(3)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            cyclopsTargetId === 3
              ? 'bg-purple-600 text-white font-bold shadow ring-1 ring-purple-300'
              : 'border border-purple-400/30 text-purple-300 hover:bg-purple-400/15'
          }`}
        >
          <Crown className="h-3.5 w-3.5" />
          <span>Herói (Imune)</span>
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-amber-500/30 px-2.5 py-1 text-xs">
          <span className="font-bold text-amber-300">🤾 Recarga:</span>
          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
              style={{
                width: `${Math.round(((20.0 - cyclopsThrowCooldown) / 20.0) * 100)}%`,
              }}
            />
          </div>
          <span className="font-bold text-amber-300">💥 {cyclopsTotalDamage} dano</span>
          <span className="text-slate-400">{cyclopsIsElder ? '🎯 65 (Raio +50%)' : '🎯 65 (Área)'}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAnimState('idle')}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
          animState === 'idle' ? 'bg-[#d4af37] text-[#090c12]' : 'text-[#9ca3af] hover:text-white'
        }`}
      >
        <Pause className="h-3.5 w-3.5" />
        <span>Guarda</span>
      </button>
      <button
        type="button"
        onClick={() => setAnimState('move')}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
          animState === 'move' ? 'bg-[#d4af37] text-[#090c12]' : 'text-[#9ca3af] hover:text-white'
        }`}
      >
        <Play className="h-3.5 w-3.5" />
        <span>Marcha</span>
      </button>
      <button
        type="button"
        onClick={() => setAnimState('attack')}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
          animState === 'attack' ? 'bg-[#d4af37] text-[#090c12]' : 'text-[#9ca3af] hover:text-white'
        }`}
      >
        <Swords className="h-3.5 w-3.5" />
        <span>Ataque</span>
      </button>
      {selectedUnit === 'myrmidon' && selectedCiv === 'greek' && (
        <button
          type="button"
          onClick={() => setMyrmidonFury((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            myrmidonFury
              ? 'bg-sky-400 text-slate-950 shadow'
              : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>{myrmidonFury ? 'Fúria de Zeus: ON' : 'Fúria de Zeus: OFF'}</span>
        </button>
      )}
    </>
  );
}
