import React, { useMemo, useState } from 'react';
import { BarChart3, Coins, Crown, Sparkles, Swords, Users, X } from 'lucide-react';
import type { MatchTimelineSample } from '../game/matchAnalytics';

type MetricTab = 'economy' | 'military' | 'population' | 'favor';

interface MatchTimelineModalProps {
  timeline: MatchTimelineSample[];
  playerName: string;
  enemyName: string;
  playerScore: number;
  enemyScore: number;
  elapsedSeconds: number;
  inline?: boolean;
  onClose?: () => void;
}

const METRIC_META: Record<
  MetricTab,
  { label: string; icon: React.ReactNode; unit: string; pKey: keyof MatchTimelineSample; eKey: keyof MatchTimelineSample }
> = {
  economy: {
    label: 'Economia',
    icon: <Coins className="h-3.5 w-3.5" />,
    unit: 'pts',
    pKey: 'playerEco',
    eKey: 'enemyEco',
  },
  military: {
    label: 'Exército',
    icon: <Swords className="h-3.5 w-3.5" />,
    unit: 'pts',
    pKey: 'playerArmy',
    eKey: 'enemyArmy',
  },
  population: {
    label: 'População',
    icon: <Users className="h-3.5 w-3.5" />,
    unit: 'unid',
    pKey: 'playerPop',
    eKey: 'enemyPop',
  },
  favor: {
    label: 'Favor Divino',
    icon: <Sparkles className="h-3.5 w-3.5" />,
    unit: 'favor',
    pKey: 'playerFavor',
    eKey: 'enemyFavor',
  },
};

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const MatchTimelineModal: React.FC<MatchTimelineModalProps> = ({
  timeline,
  playerName,
  enemyName,
  playerScore,
  enemyScore,
  elapsedSeconds,
  inline = false,
  onClose,
}) => {
  const [tab, setTab] = useState<MetricTab>('economy');

  const samples = useMemo<MatchTimelineSample[]>(() => {
    if (timeline && timeline.length >= 2) return timeline;
    const endT = Math.max(30, Math.round(elapsedSeconds));
    const single = timeline?.[0];
    return [
      {
        timeSec: 0,
        playerEco: single?.playerEco ?? 120,
        enemyEco: single?.enemyEco ?? 120,
        playerArmy: single?.playerArmy ?? 40,
        enemyArmy: single?.enemyArmy ?? 40,
        playerPop: single?.playerPop ?? 6,
        enemyPop: single?.enemyPop ?? 6,
        playerFavor: single?.playerFavor ?? 15,
        enemyFavor: single?.enemyFavor ?? 15,
        playerAge: 1,
        enemyAge: 1,
      },
      {
        timeSec: endT,
        playerEco: single?.playerEco ?? Math.max(180, Math.round(playerScore * 0.55)),
        enemyEco: single?.enemyEco ?? Math.max(150, Math.round(enemyScore * 0.55)),
        playerArmy: single?.playerArmy ?? Math.max(60, Math.round(playerScore * 0.45)),
        enemyArmy: single?.enemyArmy ?? Math.max(50, Math.round(enemyScore * 0.45)),
        playerPop: single?.playerPop ?? 14,
        enemyPop: single?.enemyPop ?? 12,
        playerFavor: single?.playerFavor ?? 35,
        enemyFavor: single?.enemyFavor ?? 28,
        playerAge: single?.playerAge ?? 2,
        enemyAge: single?.enemyAge ?? 2,
      },
    ];
  }, [timeline, elapsedSeconds, playerScore, enemyScore]);

  const meta = METRIC_META[tab];
  const width = 620;
  const height = 220;
  const padL = 48;
  const padR = 16;
  const padT = 18;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxTime = Math.max(15, samples[samples.length - 1].timeSec);
  const maxVal = useMemo(() => {
    let mv = 10;
    for (const s of samples) {
      mv = Math.max(mv, Number(s[meta.pKey]) || 0, Number(s[meta.eKey]) || 0);
    }
    return Math.ceil(mv * 1.15);
  }, [samples, meta.pKey, meta.eKey]);

  const toX = (t: number) => padL + (t / maxTime) * plotW;
  const toY = (v: number) => padT + plotH - (v / maxVal) * plotH;

  const playerPoints = samples.map((s) => `${toX(s.timeSec).toFixed(1)},${toY(Number(s[meta.pKey]) || 0).toFixed(1)}`).join(' ');
  const enemyPoints = samples.map((s) => `${toX(s.timeSec).toFixed(1)},${toY(Number(s[meta.eKey]) || 0).toFixed(1)}`).join(' ');

  const playerArea = `${padL},${padT + plotH} ${playerPoints} ${toX(samples[samples.length - 1].timeSec).toFixed(1)},${padT + plotH}`;
  const enemyArea = `${padL},${padT + plotH} ${enemyPoints} ${toX(samples[samples.length - 1].timeSec).toFixed(1)},${padT + plotH}`;

  // Detect player era advancement milestones
  const ageMilestones = useMemo(() => {
    const out: { timeSec: number; age: number; roman: string }[] = [];
    const romans: Record<number, string> = { 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    let prevAge = samples[0]?.playerAge ?? 1;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].playerAge > prevAge) {
        out.push({
          timeSec: samples[i].timeSec,
          age: samples[i].playerAge,
          roman: romans[samples[i].playerAge] ?? String(samples[i].playerAge),
        });
        prevAge = samples[i].playerAge;
      }
    }
    return out;
  }, [samples]);

  const latest = samples[samples.length - 1];
  const playerPeak = Math.max(...samples.map((s) => Number(s[meta.pKey]) || 0));
  const enemyPeak = Math.max(...samples.map((s) => Number(s[meta.eKey]) || 0));

  const content = (
    <div className="w-full rounded border border-[#c8a24a]/35 bg-[#0c1018]/95 text-[#f2e8cf] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#c8a24a]/20 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#e2bd5a]" />
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#e8cf86]">
            Linha do Tempo da Partida
          </h3>
          <span className="text-[11px] text-[#9aa5b6] tabular-nums">
            · {fmtTime(maxTime)}
          </span>
        </div>
        {onClose && !inline && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#9aa5b6] transition hover:bg-white/10 hover:text-white"
            title="Fechar gráficos"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Metric Tabs & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-1">
          {(Object.keys(METRIC_META) as MetricTab[]).map((key) => {
            const m = METRIC_META[key];
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                  active
                    ? 'bg-[#c8a24a]/25 text-[#f6dc8d] ring-1 ring-[#c8a24a]/60'
                    : 'bg-white/[0.04] text-[#9aa5b6] hover:bg-white/10 hover:text-white'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#38bdf8]" />
            <span className="font-semibold text-[#e2ecf7]">{playerName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#ef4444]" />
            <span className="font-semibold text-[#f5c7c7]">{enemyName}</span>
          </div>
        </div>
      </div>

      {/* SVG Dual-Series Chart */}
      <div className="px-3 pt-3 pb-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full overflow-visible">
          <defs>
            <linearGradient id="aomPlayerFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="aomEnemyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const y = padT + plotH * (1 - f);
            const val = Math.round(maxVal * f);
            return (
              <g key={f}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padL - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#8a96a8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X Axis Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const t = Math.round(maxTime * f);
            const x = toX(t);
            return (
              <text
                key={f}
                x={x}
                y={height - 6}
                textAnchor="middle"
                fill="#8a96a8"
                fontSize="10"
                fontFamily="monospace"
              >
                {fmtTime(t)}
              </text>
            );
          })}

          {/* Era Milestones */}
          {ageMilestones.map((m, idx) => {
            const mx = toX(m.timeSec);
            return (
              <g key={idx}>
                <line
                  x1={mx}
                  y1={padT}
                  x2={mx}
                  y2={padT + plotH}
                  stroke="#e2bd5a"
                  strokeOpacity="0.45"
                  strokeDasharray="4 3"
                />
                <rect x={mx - 11} y={padT - 13} width={22} height={14} rx={2} fill="#1d2536" stroke="#c8a24a" strokeWidth={0.8} />
                <text x={mx} y={padT - 3} textAnchor="middle" fill="#f6dc8d" fontSize="9" fontWeight="700">
                  {m.roman}
                </text>
              </g>
            );
          })}

          {/* Area fills */}
          <polygon points={enemyArea} fill="url(#aomEnemyFill)" />
          <polygon points={playerArea} fill="url(#aomPlayerFill)" />

          {/* Curves */}
          <polyline
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.1"
            strokeLinejoin="round"
            points={enemyPoints}
          />
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinejoin="round"
            points={playerPoints}
          />
        </svg>
      </div>

      {/* Tabular Summary Footer */}
      <div className="grid grid-cols-4 gap-2 border-t border-white/10 bg-black/25 px-4 py-2.5 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#8a96a8]">Atual ({playerName})</div>
          <div className="text-sm font-bold text-[#7dd3fc] tabular-nums">
            {Number(latest[meta.pKey]) || 0} <span className="text-[10px] font-normal text-[#8a96a8]">{meta.unit}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#8a96a8]">Pico ({playerName})</div>
          <div className="text-sm font-bold text-[#e8cf86] tabular-nums">
            {playerPeak} <span className="text-[10px] font-normal text-[#8a96a8]">{meta.unit}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#8a96a8]">Pico ({enemyName})</div>
          <div className="text-sm font-bold text-[#fca5a5] tabular-nums">
            {enemyPeak} <span className="text-[10px] font-normal text-[#8a96a8]">{meta.unit}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#8a96a8]">Pontuação Total</div>
          <div className="flex items-center justify-center gap-1 text-sm font-bold text-white tabular-nums">
            <Crown className="h-3.5 w-3.5 text-[#e2bd5a]" />
            {playerScore} <span className="text-[#8a96a8]">/</span> {enemyScore}
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl">{content}</div>
    </div>
  );
};
