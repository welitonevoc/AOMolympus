import { Shield } from 'lucide-react';
import { getMinorGodChoicesForAge, GOD_POWERS, TECH_SPECS } from '../../game/divineData';
import { getMinorGodPortrait } from '../../game/mediaAssets';
import { AGE_NAMES, GameHudSnapshot, PANTHEONS } from '../../game/types';
import { EraIcon, getEraSubtitle } from '../EraIcon';
import { TechIcon } from '../TechIcon';
import { UnitIcon } from '../UnitIcon';
import { getGodPowerIcon } from './hudTypes';

interface MinorGodAgeUpModalProps {
  hud: GameHudSnapshot;
  failedMinorPortraits: Record<string, boolean>;
  onMinorPortraitError: (minorGodId: string) => void;
  onChooseMinorGod: (minorGodId: string) => void;
  onCancelMinorGod: () => void;
}

export function MinorGodAgeUpModal({
  hud,
  failedMinorPortraits,
  onMinorPortraitError,
  onChooseMinorGod,
  onCancelMinorGod,
}: MinorGodAgeUpModalProps) {
  if (hud.pendingMinorGodAge === null || hud.phase !== 'playing') {
    return null;
  }

  const playerPantheon = PANTHEONS[hud.pantheon];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/82 p-2.5 sm:p-4">
      <div className="w-full max-w-3xl max-h-[calc(100dvh-1.25rem)] flex flex-col overflow-hidden rounded-xl border-2 border-[#c8a962]/70 bg-[#0d111a] p-3.5 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-[#c8a962]/30 pb-2.5 sm:pb-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <EraIcon age={hud.pendingMinorGodAge} pantheon={hud.pantheon} size={34} active />
            <div className="min-w-0">
              <h3 className="font-display text-sm sm:text-lg font-bold text-[#f3d27a] truncate">
                Avançar para a {AGE_NAMES[hud.pendingMinorGodAge]} · {getEraSubtitle(hud.pendingMinorGodAge, hud.pantheon)}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#9ca3af] line-clamp-2">
                Escolha o Deus Menor que concederá Poder Divino, Unidade Mítica e Tecnologias para {playerPantheon.name} (
                {hud.majorGodName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelMinorGod}
            className="shrink-0 rounded border border-[#c8a962]/35 bg-[#151b28] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] cursor-pointer"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 flex-1 min-h-0 overflow-y-auto pr-0.5">
          {getMinorGodChoicesForAge(hud.majorGodName, hud.pantheon, hud.pendingMinorGodAge).map((mg) => {
            const gp = GOD_POWERS[mg.godPower];
            const PowerIcon = getGodPowerIcon(mg.godPower);
            const portraitSrc = getMinorGodPortrait(mg.id, hud.pantheon);
            const portraitFailed = Boolean(failedMinorPortraits[mg.id]);
            const exclusiveTechs = Object.values(TECH_SPECS).filter((t) => t.requiresMinorGod?.includes(mg.id));

            return (
              <button
                key={mg.id}
                type="button"
                onClick={() => onChooseMinorGod(mg.id)}
                className="group flex flex-col justify-between gap-3 rounded-lg border-2 border-[#c8a962]/45 bg-[#131926] p-3.5 text-left transition-all hover:border-[#fde047] hover:bg-[#192235] cursor-pointer"
              >
                <div className="space-y-2.5">
                  {/* Divine Portrait & Title Banner */}
                  <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 border-[#c8a962]/75 bg-[#090d14] shadow-inner">
                      {!portraitFailed ? (
                        <img
                          src={portraitSrc}
                          alt={mg.name}
                          referrerPolicy="no-referrer"
                          onError={() => onMinorPortraitError(mg.id)}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a200d] to-[#111827] font-display text-2xl font-bold text-[#f3d27a]">
                          {mg.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-lg font-bold text-[#f3d27a] truncate">{mg.name}</span>
                        <span className="rounded border border-[#c8a962]/35 bg-[#1b2234] px-2 py-0.5 text-[10px] font-bold text-[#fde68a] shrink-0">
                          Era {mg.age}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-[#cbd5e1]">
                        {playerPantheon.name} · {gp.category}
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-[#0f2419] border border-emerald-400/35 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        <Shield className="h-3 w-3 shrink-0" />
                        <span>{mg.passiveBonusLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* God Power Block */}
                  <div className="flex items-start gap-2.5 rounded border border-[#facc15]/25 bg-[#0e131d] p-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#c8a962]/50 bg-[#1e190b]">
                      <PowerIcon className="h-4 w-4 text-[#facc15]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">Poder: {gp.name}</span>
                        <span className="font-mono-num text-[10px] text-[#7dd3fc] shrink-0">
                          {gp.favorCost}F · {gp.cooldown}s
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#9ca3af]">{gp.description}</p>
                    </div>
                  </div>

                  {/* Mythic Unit Block */}
                  <div className="flex items-center gap-2.5 rounded border border-[#38bdf8]/25 bg-[#0d1824] px-2.5 py-2">
                    <UnitIcon kind={mg.mythUnit} pantheon={hud.pantheon} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-[#7dd3fc] font-semibold">
                        Unidade Mítica
                      </div>
                      <div className="text-xs font-bold text-white truncate">{mg.mythUnitTitle}</div>
                    </div>
                  </div>

                  {/* Exclusive Minor God Technologies */}
                  {exclusiveTechs.length > 0 && (
                    <div className="space-y-1 rounded border border-[#a855f7]/25 bg-[#141022] p-2">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-[#d8b4fe]">
                        Tecnologias Exclusivas
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {exclusiveTechs.map((t) => (
                          <div key={t.id} className="flex items-center gap-2 text-[11px] text-[#e2e8f0]">
                            <TechIcon techId={t.id} size={20} />
                            <div className="min-w-0">
                              <span className="font-semibold text-[#f3e8ff]">{t.name}: </span>
                              <span className="text-[10px] text-[#cbd5e1]">{t.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full rounded bg-gradient-to-r from-[#c8a962] via-[#e5c45e] to-[#c8a962] py-2 text-center text-xs font-bold uppercase tracking-wider text-[#0b0e13] shadow group-hover:brightness-110">
                  Adorar {mg.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
