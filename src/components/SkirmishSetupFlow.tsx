import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  Map as MapIcon,
  Play,
  Shuffle,
  Sparkles,
  Swords,
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import {
  MAJOR_GODS,
  getCivGodPowerSpec,
  getMajorGodSpec,
  getMinorGodSpec,
} from '../game/divineData';
import { getMajorGodPortrait, getMapLandscapeImage } from '../game/mediaAssets';
import { AI_PERSONALITY_LABELS } from '../game/multiplayerTypes';
import {
  AGE_NAMES,
  AgeLevel,
  AiPersonality,
  COMING_SOON_PANTHEON_IDS,
  DifficultyId,
  GameOptionsConfig,
  GameTypeId,
  MAPS,
  MajorGodSpec,
  MapConfig,
  MapId,
  MatchStartOptions,
  PANTHEONS,
  PLAYABLE_PANTHEON_IDS,
  PantheonId,
  VisibilityMode,
  WorldSizeId,
} from '../game/types';
import { EraIcon, getEraSubtitle } from './EraIcon';
import { SkirmishDraft } from './PortSubMenus';

interface SkirmishSetupFlowProps {
  initialStep?: 'god' | 'map';
  skirmish: SkirmishDraft;
  options: GameOptionsConfig;
  hasSavedMatch: boolean;
  difficulties: { id: DifficultyId; label: string; desc: string }[];
  onUpdateSkirmish: (next: SkirmishDraft) => void;
  onStartMatch: (
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId,
    revealedMap: boolean,
    extras?: MatchStartOptions
  ) => void;
  onLoadSavedMatch: () => void;
  onBackSubMenu: () => void;
  onBackToMain: () => void;
}

const PANTHEON_DISPLAY_META: Record<
  PantheonId,
  { label: string; tagline: string; note?: string }
> = {
  greek: { label: 'Grego', tagline: 'Heróis lendários, falanges e o poder do Olimpo' },
  egyptian: { label: 'Egípcio', tagline: 'Monumentos solares, Faraós e criaturas sagradas' },
  norse: { label: 'Nórdico', tagline: 'Anões, Carros de Boi móveis e fúria de Valhalla' },
  atlantean: { label: 'Atlante', tagline: 'Oricalco, Cidadãos ágeis e Passagens Celestes' },
  chinese: {
    label: 'Chinês',
    tagline: 'Immortal Pillars · Tale of the Dragon',
    note: 'Xiwangmu também compõe o panteão e conceitos da expansão.',
  },
  japanese: {
    label: 'Japonês',
    tagline: 'Heavenly Spear · Santuários e espíritos Kami',
  },
  aztec: {
    label: 'Asteca',
    tagline: 'Obsidian Mirror · Templos solares e serpentes emplumadas',
  },
  roman: { label: 'Romanos', tagline: 'Legiões imperiais, fóruns e águias de Roma' },
  eldritch: { label: 'Eldritch', tagline: 'Monólitos abissais e entidades cósmicas' },
  celtic: { label: 'Celtas', tagline: 'Bosques druídicos, lanças solares e clãs guerreiros' },
  babylonian: { label: 'Babilônios', tagline: 'Zigurates dourados, lamassus e tempestades reais' },
  lakota: { label: 'Lakota (Iakota)', tagline: 'Pradarias sagradas, trovões e caça ágil' },
  jotunn: { label: 'Jotunn', tagline: 'Gigantes primordiais de gelo e magma vulcânico' },
};

const SPECIAL_RULE_LABELS: Record<NonNullable<MapConfig['specialRule']>, string> = {
  nomad: 'Regra Nômade (sem Centro inicial)',
  megalopolis: 'Início com Megalópole fortificada',
  sudden_death: 'Morte Súbita (Cidadela única)',
  koth_vault: 'Cofre Central disputado',
  land_unknown: 'Geração continental aleatória',
  the_unknown: 'Bioma e mares imprevisíveis',
  valley_guardians: 'Guardiões protegem minas centrais',
  sea_of_worms: 'Lagoas sinuosas com Fortaleza',
  total_war: 'Ilha central e mares contestados (Total War)',
};

const EXPANSION_LABELS: Record<MapConfig['expansion'], string> = {
  titans: 'The Titans',
  base: 'Clássico',
  bonus: 'Edição Bônus',
};

function SafeImage({
  src,
  alt,
  className,
  fallbackColor,
  fallbackLabel,
}: {
  src: string;
  alt: string;
  className: string;
  fallbackColor: string;
  fallbackLabel: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#1b2232] to-[#0b0f18] text-center font-display text-xs font-bold text-[#f3d27a] ${className}`}
        style={{
          backgroundImage: `radial-gradient(circle at 30% 25%, ${fallbackColor}44, transparent 70%)`,
        }}
      >
        <span className="px-2">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function SkirmishSetupFlow({
  initialStep = 'god',
  skirmish,
  options,
  hasSavedMatch,
  difficulties,
  onUpdateSkirmish,
  onStartMatch,
  onLoadSavedMatch,
  onBackSubMenu,
  onBackToMain,
}: SkirmishSetupFlowProps) {
  const [step, setStep] = useState<'god' | 'map'>(initialStep);
  const [rosterFilter, setRosterFilter] = useState<'all' | 'available' | 'coming_soon'>('all');
  const [mapFilter, setMapFilter] = useState<'all' | 'titans' | 'base' | 'bonus'>('all');
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);

  // Previewed god can be either playable or "Em breve", while confirmed playable god stays in `skirmish`.
  const [previewGodId, setPreviewGodId] = useState<string>(() => {
    const current = getMajorGodSpec(skirmish.minorGod, skirmish.pantheon);
    return current.id;
  });

  const previewGod: MajorGodSpec = useMemo(
    () => MAJOR_GODS.find((g) => g.id === previewGodId) ?? getMajorGodSpec(skirmish.minorGod, skirmish.pantheon),
    [previewGodId, skirmish.minorGod, skirmish.pantheon]
  );

  const activePlayableGod: MajorGodSpec = useMemo(() => {
    const spec = getMajorGodSpec(skirmish.minorGod, skirmish.pantheon);
    if (!spec.comingSoon) return spec;
    return MAJOR_GODS.find((g) => !g.comingSoon) ?? MAJOR_GODS[0];
  }, [skirmish.minorGod, skirmish.pantheon]);

  const clickSound = () => {
    soundEngine.unlock();
    soundEngine.playSelect();
  };

  const handleSelectGodCard = (god: MajorGodSpec) => {
    clickSound();
    setPreviewGodId(god.id);
    if (!god.comingSoon) {
      onUpdateSkirmish({
        ...skirmish,
        pantheon: god.pantheon,
        minorGod: god.name,
      });
      soundEngine.previewPantheonTheme(god.pantheon);
    }
  };

  const handleRandomPlayableGod = () => {
    clickSound();
    const playable = MAJOR_GODS.filter((g) => !g.comingSoon);
    const pick = playable[Math.floor(Math.random() * playable.length)] ?? MAJOR_GODS[0];
    setPreviewGodId(pick.id);
    onUpdateSkirmish({
      ...skirmish,
      pantheon: pick.pantheon,
      minorGod: pick.name,
    });
    soundEngine.previewPantheonTheme(pick.pantheon);
  };

  const handleProceedToMap = () => {
    if (previewGod.comingSoon) return;
    clickSound();
    onUpdateSkirmish({
      ...skirmish,
      pantheon: previewGod.pantheon,
      minorGod: previewGod.name,
    });
    setStep('map');
  };

  const playableGroups = useMemo(
    () =>
      PLAYABLE_PANTHEON_IDS.map((pid) => ({
        pantheon: PANTHEONS[pid],
        meta: PANTHEON_DISPLAY_META[pid],
        gods: MAJOR_GODS.filter((g) => g.pantheon === pid),
      })),
    []
  );

  const comingSoonGroups = useMemo(
    () =>
      COMING_SOON_PANTHEON_IDS.map((pid) => ({
        pantheon: PANTHEONS[pid],
        meta: PANTHEON_DISPLAY_META[pid],
        gods: MAJOR_GODS.filter((g) => g.pantheon === pid),
      })),
    []
  );

  const allMaps = useMemo(() => Object.values(MAPS), []);
  const filteredMaps = useMemo(
    () => (mapFilter === 'all' ? allMaps : allMaps.filter((m) => m.expansion === mapFilter)),
    [allMaps, mapFilter]
  );
  const selectedMap = MAPS[skirmish.mapId] ?? MAPS.mediterranean;

  const gameTypeOptions: { id: GameTypeId; label: string }[] = [
    { id: 'supremacy', label: 'Supremacia' },
    { id: 'conquest', label: 'Conquista' },
    { id: 'lightning', label: 'Relâmpago' },
    { id: 'deathmatch', label: 'Combate Mortal' },
    { id: 'regicide', label: 'Regicídio' },
  ];

  const worldSizeLabels: Record<WorldSizeId, string> = {
    normal: 'Normal',
    large: 'Grande',
    giant: 'Gigante',
  };

  const previewPower = getCivGodPowerSpec(previewGod.pantheon, previewGod.favoredPower);
  const previewPantheon = PANTHEONS[previewGod.pantheon];
  const previewPortrait = getMajorGodPortrait(previewGod.id, previewGod.pantheon);

  const safeEnemyPantheon: PantheonId = PLAYABLE_PANTHEON_IDS.includes(skirmish.enemyPantheon)
    ? skirmish.enemyPantheon
    : 'egyptian';

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Clean 2-Step Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4af37]/30 pb-3">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#f3d27a]">
            ESCARAMUÇA · UM JOGADOR
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                clickSound();
                setStep('god');
              }}
              className={`cursor-pointer font-semibold transition-colors whitespace-nowrap ${
                step === 'god'
                  ? 'text-[#f3d27a]'
                  : 'text-[#94a3b8] hover:text-[#e6dfd1]'
              }`}
            >
              1. Deus Maior
            </button>
            <span className="text-[#475569]">·</span>
            <button
              type="button"
              onClick={() => {
                if (previewGod.comingSoon && step === 'god') {
                  clickSound();
                  setPreviewGodId(activePlayableGod.id);
                } else {
                  clickSound();
                }
                setStep('map');
              }}
              className={`cursor-pointer font-semibold transition-colors whitespace-nowrap ${
                step === 'map'
                  ? 'text-[#f3d27a]'
                  : 'text-[#94a3b8] hover:text-[#e6dfd1]'
              }`}
            >
              2. Mapa e Batalha
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              clickSound();
              if (step === 'map') {
                setStep('god');
              } else {
                onBackSubMenu();
              }
            }}
            className="flex h-9 items-center gap-1.5 rounded border border-[#d4af37]/40 bg-[#181e29] px-3.5 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] hover:bg-[#222a38] cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#e5c45e]" />
            <span>{step === 'map' ? 'Trocar Deus' : 'Voltar'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              clickSound();
              onBackToMain();
            }}
            className="flex h-9 items-center gap-1.5 rounded border border-white/15 bg-[#151b26] px-3.5 text-xs font-semibold text-[#cbd5e1] hover:border-[#d4af37]/50 hover:text-white cursor-pointer whitespace-nowrap"
          >
            <span>Menu Principal</span>
          </button>
        </div>
      </div>

      {/* ── PASSO 1: DEUSES MAIORES ── */}
      {step === 'god' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Clean Roster grouped by Disponíveis & Em Breve */}
          <div className="lg:col-span-7 flex flex-col gap-3 rounded-lg border border-white/10 bg-[#121722] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-2.5">
              <div className="flex items-center gap-1 rounded border border-white/10 bg-[#0d121b] p-0.5 text-[11px] font-semibold">
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    {
                      id: 'available',
                      label: `Disponíveis (${MAJOR_GODS.filter((g) => !g.comingSoon).length})`,
                    },
                    {
                      id: 'coming_soon',
                      label: `Em breve (${COMING_SOON_PANTHEON_IDS.length} Civs)`,
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      clickSound();
                      setRosterFilter(tab.id);
                    }}
                    className={`rounded px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap ${
                      rosterFilter === tab.id
                        ? 'bg-[#d4af37] text-[#0b0e14] font-bold'
                        : 'text-[#cbd5e1] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRandomPlayableGod}
                className="flex items-center gap-1.5 rounded border border-[#d4af37]/40 bg-[#192130] px-3 py-1 text-[11px] font-semibold text-[#f3d27a] hover:border-[#f3d27a] hover:bg-[#222c40] cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>Sortear Deus</span>
              </button>
            </div>

            <div className="flex max-h-[300px] sm:max-h-[380px] lg:max-h-[430px] flex-col gap-4 overflow-y-auto pr-1">
              {rosterFilter !== 'coming_soon' &&
                playableGroups.map(({ pantheon, meta, gods }) => (
                  <div key={pantheon.id} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-2 border-b border-white/6 pb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-xs shrink-0"
                          style={{ backgroundColor: pantheon.primaryColor }}
                        />
                        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#f3d27a]">
                          {meta.label}
                        </h3>
                      </div>
                      <span className="text-[11px] text-[#94a3b8] truncate">{meta.tagline}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {gods.map((god) => {
                        const isSelected = previewGod.id === god.id;
                        const imgSrc = getMajorGodPortrait(god.id, god.pantheon);
                        return (
                          <button
                            key={god.id}
                            type="button"
                            onClick={() => handleSelectGodCard(god)}
                            className={`group flex flex-col overflow-hidden rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#f3d27a] bg-[#1e2738] shadow-[0_0_0_1px_rgba(243,210,122,0.45)]'
                                : 'border-white/10 bg-[#161c28] hover:border-[#d4af37]/55 hover:bg-[#1b2231]'
                            }`}
                          >
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0c1018]">
                              <SafeImage
                                src={imgSrc}
                                alt={god.name}
                                fallbackColor={pantheon.primaryColor}
                                fallbackLabel={god.name}
                                className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1119] via-[#0d1119]/65 to-transparent" />
                            </div>
                            <div className="px-2.5 py-2">
                              <div className="font-display text-xs font-bold text-[#f5e6bf] truncate">
                                {god.name}
                              </div>
                              <div className="text-[10px] leading-tight text-[#94a3b8] truncate">
                                {god.title ?? god.focus}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {rosterFilter !== 'available' && (
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center justify-between gap-2 border-t border-[#d4af37]/25 pt-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">
                      <Clock className="h-3.5 w-3.5 text-[#d4af37]" />
                      <span>Em Breve · Expansões em Desenvolvimento</span>
                    </div>
                    <span className="text-[11px] text-[#94a3b8]">Prévia visual e poderes</span>
                  </div>

                  {comingSoonGroups.map(({ pantheon, meta, gods }) => (
                    <div key={pantheon.id} className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/6 pb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-xs shrink-0 opacity-75"
                            style={{ backgroundColor: pantheon.primaryColor }}
                          />
                          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">
                            {meta.label}
                          </h4>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#d4af37]/80">
                            · Em breve
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748b] truncate">
                          {meta.note ? `${meta.tagline} · ${meta.note}` : meta.tagline}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {gods.map((god) => {
                          const isSelected = previewGod.id === god.id;
                          const imgSrc = getMajorGodPortrait(god.id, god.pantheon);
                          return (
                            <button
                              key={god.id}
                              type="button"
                              onClick={() => handleSelectGodCard(god)}
                              className={`group flex items-center gap-2.5 overflow-hidden rounded-lg border p-2 text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'border-[#d4af37]/80 bg-[#1c2333]'
                                  : 'border-white/8 bg-[#131823]/80 opacity-85 hover:opacity-100 hover:border-white/25'
                              }`}
                            >
                              <div className="h-14 w-11 shrink-0 overflow-hidden rounded bg-[#0c1018]">
                                <SafeImage
                                  src={imgSrc}
                                  alt={god.name}
                                  fallbackColor={pantheon.primaryColor}
                                  fallbackLabel={god.name}
                                  className="h-full w-full object-cover object-top"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-display text-xs font-bold text-[#e6dfd1] truncate">
                                  {god.name}
                                </div>
                                <div className="text-[10px] text-[#94a3b8] truncate">
                                  {god.title ?? god.focus}
                                </div>
                                <div className="mt-0.5 text-[10px] font-medium text-[#d4af37]/80">
                                  Em breve
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected God Portrait, Lore, Powers & Continue CTA */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-[#131823] p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              {/* Hero Portrait + Name */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 items-center sm:items-start text-center sm:text-left">
                <div className="relative h-36 w-28 sm:h-44 sm:w-32 shrink-0 overflow-hidden rounded-lg border border-[#d4af37]/40 bg-[#0b0f18]">
                  <SafeImage
                    src={previewPortrait}
                    alt={previewGod.name}
                    fallbackColor={previewPantheon.primaryColor}
                    fallbackLabel={previewGod.name}
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37]">
                    {PANTHEON_DISPLAY_META[previewGod.pantheon].label}
                    {previewGod.comingSoon ? ' · Em breve' : ' · Disponível'}
                  </div>
                  <h3 className="mt-0.5 font-display text-xl sm:text-2xl font-bold leading-tight text-[#f5e6bf]">
                    {previewGod.name}
                  </h3>
                  <p className="text-xs font-medium text-[#cbd5e1]">
                    {previewGod.title ?? previewGod.focus}
                  </p>
                  {previewGod.expansionLabel && (
                    <p className="mt-1 text-[11px] text-[#94a3b8]">{previewGod.expansionLabel}</p>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-[#94a3b8]">
                    {previewGod.lore ?? previewGod.focus}
                  </p>
                </div>
              </div>

              {/* Favored God Power */}
              <div className="rounded-lg border border-white/8 bg-[#0f141e] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#38bdf8]">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>Poder Divino: {previewPower.name}</span>
                  </span>
                  <span className="text-[10px] font-medium text-[#94a3b8] whitespace-nowrap">
                    {previewPower.category} · {previewPower.cooldown}s
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#e2e8f0]">
                  {previewGod.powerDescription ?? previewPower.description}
                </p>
              </div>

              {/* Pantheon Bonus & Minor Gods Path */}
              <div className="rounded-lg border border-white/8 bg-[#0f141e] p-3 text-xs">
                <div className="text-[11px] font-semibold text-[#e5c45e]">
                  Bônus do Panteão ({previewPantheon.name})
                </div>
                <p className="mt-0.5 text-[#cbd5e1]">{previewPantheon.bonusLabel}</p>

                {!previewGod.comingSoon ? (
                  <div className="mt-2.5 border-t border-white/8 pt-2">
                    <div className="text-[11px] font-semibold text-[#e5c45e]">
                      Deuses Menores por Era
                    </div>
                    <div className="mt-1 flex flex-col gap-1 text-[11px] text-[#94a3b8]">
                      <div>
                        <strong className="text-[#e6dfd1]">Era II:</strong>{' '}
                        {getMinorGodSpec(previewGod.minorChoices[2][0]).name} ou{' '}
                        {getMinorGodSpec(previewGod.minorChoices[2][1]).name}
                      </div>
                      <div>
                        <strong className="text-[#e6dfd1]">Era III:</strong>{' '}
                        {getMinorGodSpec(previewGod.minorChoices[3][0]).name} ou{' '}
                        {getMinorGodSpec(previewGod.minorChoices[3][1]).name}
                      </div>
                      <div>
                        <strong className="text-[#e6dfd1]">Era IV:</strong>{' '}
                        {getMinorGodSpec(previewGod.minorChoices[4][0]).name} ou{' '}
                        {getMinorGodSpec(previewGod.minorChoices[4][1]).name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 border-t border-white/8 pt-2 text-[11px] text-[#94a3b8]">
                    Esta civilização será liberada em uma próxima atualização. Selecione um Deus
                    Grego, Egípcio, Nórdico, Atlante ou Chinês para iniciar uma partida agora.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/8 pt-3">
              {!previewGod.comingSoon ? (
                <button
                  type="button"
                  onClick={handleProceedToMap}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#e5c45e] bg-[#d4af37] px-5 text-sm font-bold text-[#0b0e14] hover:bg-[#e3c252] cursor-pointer transition-colors whitespace-nowrap"
                >
                  <span>Avançar para Mapa ({previewGod.name})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-[#1a202e] px-4 text-xs font-semibold text-[#94a3b8] cursor-not-allowed whitespace-nowrap"
                  >
                    <Clock className="h-3.5 w-3.5 text-[#d4af37]" />
                    <span>Disponível em breve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clickSound();
                      setPreviewGodId(activePlayableGod.id);
                      setStep('map');
                    }}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded border border-[#d4af37]/40 bg-[#182030] px-4 text-xs font-semibold text-[#f3d27a] hover:bg-[#212b40] cursor-pointer whitespace-nowrap"
                  >
                    <span>Continuar com {activePlayableGod.name}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PASSO 2: MAPA (COM FOTO E DESCRIÇÃO) & CONFIGURAÇÃO DA PARTIDA ── */}
      {step === 'map' && (
        <div className="flex flex-col gap-3.5">
          {/* Compact Selected Major God Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d4af37]/30 bg-[#121722] px-3.5 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-9 shrink-0 overflow-hidden rounded border border-[#d4af37]/45 bg-[#0b0f18]">
                <SafeImage
                  src={getMajorGodPortrait(activePlayableGod.id, activePlayableGod.pantheon)}
                  alt={activePlayableGod.name}
                  fallbackColor={PANTHEONS[activePlayableGod.pantheon].primaryColor}
                  fallbackLabel={activePlayableGod.name}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                  {options.playerName} · Deus Maior Selecionado
                </div>
                <div className="font-display text-sm font-bold text-[#f5e6bf] truncate">
                  {activePlayableGod.name} · {activePlayableGod.title ?? activePlayableGod.focus} (
                  {PANTHEONS[activePlayableGod.pantheon].name})
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                clickSound();
                setPreviewGodId(activePlayableGod.id);
                setStep('god');
              }}
              className="flex h-8 items-center gap-1.5 rounded border border-[#d4af37]/45 bg-[#1b2232] px-3 text-xs font-semibold text-[#f3d27a] hover:bg-[#242e42] cursor-pointer whitespace-nowrap"
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Trocar Deus</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Featured Map Photo + Full Description + Map Grid */}
            <div className="lg:col-span-7 flex flex-col gap-3 rounded-lg border border-white/10 bg-[#131823] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#f3d27a]">
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>Seleção de Mapa</span>
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { id: 'all', label: `Todos (${allMaps.length})` },
                      { id: 'titans', label: 'The Titans' },
                      { id: 'base', label: 'Originais' },
                      { id: 'bonus', label: 'Extras' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        clickSound();
                        setMapFilter(t.id);
                      }}
                      className={`rounded border px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        mapFilter === t.id
                          ? 'border-[#d4af37] bg-[#d4af37] text-[#0b0e14]'
                          : 'border-white/10 bg-[#0e131c] text-[#cbd5e1] hover:border-[#d4af37]/45'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Map Photo + Description Card */}
              <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0d121b]">
                <div className="relative h-36 sm:h-44 md:h-48 w-full overflow-hidden">
                  <SafeImage
                    src={getMapLandscapeImage(selectedMap.id)}
                    alt={selectedMap.name}
                    fallbackColor={selectedMap.terrainTint}
                    fallbackLabel={selectedMap.name}
                    className="h-full w-full object-cover"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, rgba(13,18,27,0.96) 5%, rgba(13,18,27,0.35) 55%, transparent 100%)`,
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
                    <div className="text-[11px] font-semibold text-[#e5c45e]">
                      {selectedMap.biomeLabel} · {EXPANSION_LABELS[selectedMap.expansion]}
                      {selectedMap.specialRule
                        ? ` · ${SPECIAL_RULE_LABELS[selectedMap.specialRule]}`
                        : ''}
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#f8f4ea]">
                      {selectedMap.name}
                    </h3>
                  </div>
                </div>

                <div className="px-3.5 pb-3.5 pt-2">
                  <p className="text-xs leading-relaxed text-[#e2e8f0]">{selectedMap.subtitle}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#94a3b8]">
                    <span>
                      <strong className="text-[#86efac]">Flora:</strong> {selectedMap.floraLabel}
                    </span>
                    <span>
                      <strong className="text-[#fdba74]">Fauna:</strong> {selectedMap.faunaLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clean Map Grid with Thumbnail Strip */}
              <div className="grid max-h-40 sm:max-h-48 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                {filteredMaps.map((m) => {
                  const active = selectedMap.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        clickSound();
                        onUpdateSkirmish({ ...skirmish, mapId: m.id });
                      }}
                      className={`flex items-center gap-2 rounded border p-1.5 text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#f3d27a] bg-[#1e2738] text-white'
                          : 'border-white/8 bg-[#161c28] text-[#cbd5e1] hover:border-[#d4af37]/45'
                      }`}
                    >
                      <div className="h-9 w-12 shrink-0 overflow-hidden rounded bg-[#0c1018]">
                        <SafeImage
                          src={getMapLandscapeImage(m.id)}
                          alt={m.name}
                          fallbackColor={m.terrainTint}
                          fallbackLabel={m.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[11px] font-semibold">{m.name}</div>
                        <div className="truncate text-[10px] text-[#94a3b8]">{m.biomeLabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Focused Match Rules & Start */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-[#131823] p-4">
              <div className="flex flex-col gap-3">
                {/* Enemy AI & Difficulty */}
                <div>
                  <label className="flex flex-col gap-1.5 text-xs">
                    <span className="font-semibold text-[#e6dfd1]">Oponente IA</span>
                    <select
                      value={safeEnemyPantheon}
                      onChange={(e) => {
                        clickSound();
                        onUpdateSkirmish({
                          ...skirmish,
                          enemyPantheon: e.target.value as PantheonId,
                        });
                      }}
                      className="h-9 rounded border border-white/15 bg-[#0e131c] px-2.5 text-xs font-medium text-[#fca5a5] focus:border-[#d4af37] focus:outline-none cursor-pointer"
                    >
                      {PLAYABLE_PANTHEON_IDS.map((pid) => {
                        const p = PANTHEONS[pid];
                        return (
                          <option key={pid} value={pid}>
                            {p.name} ({p.deity})
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <div className="mt-2">
                    <div className="mb-1 text-[11px] font-semibold text-[#cbd5e1]">Dificuldade</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded border border-white/10 bg-[#0e131c] p-0.5">
                      {difficulties.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            clickSound();
                            onUpdateSkirmish({ ...skirmish, difficulty: d.id });
                          }}
                          title={d.desc}
                          className={`rounded px-2 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                            skirmish.difficulty === d.id
                              ? 'bg-[#d4af37] text-[#0b0e14]'
                              : 'text-[#cbd5e1] hover:text-white'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="mb-1 text-[11px] font-semibold text-[#cbd5e1]">
                      Personalidade da IA
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded border border-white/10 bg-[#0e131c] p-0.5">
                      {(['balanced', 'aggressive', 'defensive', 'economic'] as AiPersonality[]).map((pers) => {
                        const info = AI_PERSONALITY_LABELS[pers];
                        const activePers = (skirmish.aiPersonality ?? 'balanced') === pers;
                        return (
                          <button
                            key={pers}
                            type="button"
                            onClick={() => {
                              clickSound();
                              onUpdateSkirmish({ ...skirmish, aiPersonality: pers });
                            }}
                            title={info.hint}
                            className={`rounded px-2 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer truncate ${
                              activePers
                                ? 'bg-[#d4af37] text-[#0b0e14]'
                                : 'text-[#cbd5e1] hover:text-white'
                            }`}
                          >
                            {info.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Game Type */}
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#cbd5e1]">Modo de Jogo</div>
                  <div className="flex flex-wrap gap-1.5">
                    {gameTypeOptions.map((gt) => (
                      <button
                        key={gt.id}
                        type="button"
                        onClick={() => {
                          clickSound();
                          onUpdateSkirmish({
                            ...skirmish,
                            gameType: gt.id,
                            startingResources:
                              gt.id === 'deathmatch' ? 'abundant' : skirmish.startingResources,
                          });
                        }}
                        className={`rounded border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                          skirmish.gameType === gt.id
                            ? 'border-[#d4af37] bg-[#1f2838] text-[#f3d27a]'
                            : 'border-white/8 bg-[#161c28] text-[#cbd5e1] hover:border-white/20'
                        }`}
                      >
                        {gt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Starting Age & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="mb-1.5 text-[11px] font-semibold text-[#cbd5e1]">
                      Era Inicial
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {([1, 2, 3, 4] as AgeLevel[]).map((ageLv) => (
                        <button
                          key={ageLv}
                          type="button"
                          onClick={() => {
                            clickSound();
                            onUpdateSkirmish({ ...skirmish, startingAge: ageLv });
                          }}
                          title={`${AGE_NAMES[ageLv]} — ${getEraSubtitle(
                            ageLv,
                            activePlayableGod.pantheon
                          )}`}
                          className={`flex items-center gap-1 rounded border px-1.5 py-1 text-[10px] font-semibold cursor-pointer truncate ${
                            skirmish.startingAge === ageLv
                              ? 'border-[#d4af37] bg-[#1f2838] text-[#f3d27a]'
                              : 'border-white/8 bg-[#161c28] text-[#cbd5e1]'
                          }`}
                        >
                          <EraIcon
                            age={ageLv}
                            pantheon={activePlayableGod.pantheon}
                            size={15}
                            active={skirmish.startingAge === ageLv}
                          />
                          <span className="truncate">{AGE_NAMES[ageLv].replace('Era ', '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 text-[11px] font-semibold text-[#cbd5e1]">
                      Visibilidade
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(
                        [
                          { id: 'normal', label: 'Normal' },
                          { id: 'explored', label: 'Explor.' },
                          { id: 'revealed', label: 'Revel.' },
                        ] as { id: VisibilityMode; label: string }[]
                      ).map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            clickSound();
                            onUpdateSkirmish({
                              ...skirmish,
                              visibilityMode: v.id,
                              revealedMap: v.id === 'revealed',
                            });
                          }}
                          className={`rounded border px-1 py-1.5 text-[10px] font-semibold cursor-pointer ${
                            skirmish.visibilityMode === v.id
                              ? 'border-[#d4af37] bg-[#1f2838] text-[#f3d27a]'
                              : 'border-white/8 bg-[#161c28] text-[#cbd5e1]'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Collapsible Advanced Rules */}
                <div className="border-t border-white/8 pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      clickSound();
                      setShowAdvancedRules((prev) => !prev);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded border border-white/8 bg-[#101520] px-3 py-2 text-left text-xs cursor-pointer hover:border-[#d4af37]/40"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#e6dfd1]">Regras Avançadas</div>
                      {!showAdvancedRules && (
                        <div className="text-[10px] text-[#94a3b8] truncate">
                          Mundo {worldSizeLabels[skirmish.worldSize]} · Tratado{' '}
                          {skirmish.treatyMinutes === 0 ? 'Sem' : `${skirmish.treatyMinutes}m`} ·{' '}
                          {skirmish.dayNightCycle ? 'Dia/Noite' : 'Dia Fixo'} ·{' '}
                          {skirmish.titansEnabled ? 'Titãs Ativos' : 'Sem Titãs'}
                        </div>
                      )}
                    </div>
                    {showAdvancedRules ? (
                      <ChevronUp className="h-4 w-4 text-[#d4af37] shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#94a3b8] shrink-0" />
                    )}
                  </button>

                  {showAdvancedRules && (
                    <div className="mt-2.5 flex flex-col gap-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <div className="mb-1 text-[11px] font-semibold text-[#cbd5e1]">
                            Tamanho do Mundo
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {(['normal', 'large', 'giant'] as WorldSizeId[]).map((ws) => (
                              <button
                                key={ws}
                                type="button"
                                onClick={() => {
                                  clickSound();
                                  onUpdateSkirmish({ ...skirmish, worldSize: ws });
                                }}
                                className={`rounded border px-1 py-1 text-[10px] font-semibold cursor-pointer ${
                                  skirmish.worldSize === ws
                                    ? 'border-[#d4af37] bg-[#1f2838] text-[#f3d27a]'
                                    : 'border-white/8 bg-[#161c28] text-[#cbd5e1]'
                                }`}
                              >
                                {worldSizeLabels[ws]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-[11px] font-semibold text-[#cbd5e1]">
                            Tratado de Paz
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {[0, 5, 10].map((mins) => (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => {
                                  clickSound();
                                  onUpdateSkirmish({ ...skirmish, treatyMinutes: mins });
                                }}
                                className={`rounded border px-1 py-1 text-[10px] font-semibold cursor-pointer ${
                                  skirmish.treatyMinutes === mins
                                    ? 'border-[#d4af37] bg-[#1f2838] text-[#f3d27a]'
                                    : 'border-white/8 bg-[#161c28] text-[#cbd5e1]'
                                }`}
                              >
                                {mins === 0 ? 'Sem' : `${mins}m`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            clickSound();
                            onUpdateSkirmish({
                              ...skirmish,
                              dayNightCycle: !skirmish.dayNightCycle,
                            });
                          }}
                          className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer ${
                            skirmish.dayNightCycle
                              ? 'border-[#d4af37] bg-[#1f2838] text-white'
                              : 'border-white/8 bg-[#161c28] text-[#94a3b8]'
                          }`}
                        >
                          <span>Dia / Noite</span>
                          <span className="text-[#f3d27a]">
                            {skirmish.dayNightCycle ? 'SIM' : 'NÃO'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            clickSound();
                            onUpdateSkirmish({
                              ...skirmish,
                              titansEnabled: !skirmish.titansEnabled,
                            });
                          }}
                          className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer ${
                            skirmish.titansEnabled
                              ? 'border-[#d4af37] bg-[#1f2838] text-white'
                              : 'border-white/8 bg-[#161c28] text-[#94a3b8]'
                          }`}
                        >
                          <span>Titãs (Era V)</span>
                          <span className="text-[#f3d27a]">
                            {skirmish.titansEnabled ? 'SIM' : 'NÃO'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-white/8 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    onStartMatch(
                      activePlayableGod.pantheon,
                      skirmish.difficulty,
                      selectedMap.id,
                      skirmish.visibilityMode === 'revealed' || skirmish.revealedMap,
                      {
                        startingAge: skirmish.startingAge,
                        startingResources: skirmish.startingResources,
                        enemyPantheon: safeEnemyPantheon,
                        minorGod: activePlayableGod.name,
                        majorGodName: activePlayableGod.name,
                        aiPersonality: skirmish.aiPersonality ?? 'balanced',
                        gameType: skirmish.gameType,
                        visibilityMode: skirmish.revealedMap ? 'revealed' : skirmish.visibilityMode,
                        worldSize: skirmish.worldSize,
                        dayNightCycle: skirmish.dayNightCycle,
                        titansEnabled: skirmish.titansEnabled,
                        treatyMinutes: skirmish.treatyMinutes,
                        gameSpeed: options.gameSpeed,
                      }
                    )
                  }
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#e5c45e] bg-[#d4af37] px-5 text-sm font-bold text-[#0b0e14] hover:bg-[#e3c252] cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Swords className="h-4 w-4" />
                  <span>Iniciar Batalha</span>
                </button>

                {hasSavedMatch && (
                  <button
                    type="button"
                    onClick={() => {
                      clickSound();
                      onLoadSavedMatch();
                    }}
                    className="flex h-8 w-full items-center justify-center gap-2 rounded border border-white/10 bg-[#171d29] text-xs font-medium text-[#cbd5e1] hover:border-[#d4af37]/50 hover:text-white cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 text-[#d4af37]" />
                    <span>Carregar Partida Salva</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
