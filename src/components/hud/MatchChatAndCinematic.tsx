import { useState } from 'react';
import type { RefObject } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { ChatMessage, getMpColorById } from '../../game/multiplayerTypes';
import type { GameHudSnapshot } from '../../game/types';

interface MatchChatAndCinematicProps {
  hud: GameHudSnapshot;
  showMatchChat: boolean;
  onCloseMatchChat: () => void;
  chatInputRef: RefObject<HTMLInputElement | null>;
  inMatchMessages: ChatMessage[];
  onSendMatchChat?: (channel: 'all' | 'team', text: string) => void;
  onSkipCinematic?: () => void;
}

export function MatchChatAndCinematic({
  hud,
  showMatchChat,
  onCloseMatchChat,
  chatInputRef,
  inMatchMessages,
  onSendMatchChat,
  onSkipCinematic,
}: MatchChatAndCinematicProps) {
  const [chatChannel, setChatChannel] = useState<'all' | 'team'>('all');
  const [chatInput, setChatInput] = useState('');

  return (
    <>
      {/* IN-MATCH MULTIPLAYER CHAT DRAWER */}
      {showMatchChat && hud.phase === 'playing' && onSendMatchChat && (
        <div className="fixed bottom-[198px] sm:bottom-[224px] left-2 z-30 w-[min(340px,92vw)] rounded-lg border border-[#d4af37]/55 bg-[#0d121d]/96 p-2.5 shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#f3d27a]">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat da Partida</span>
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'team'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChatChannel(ch)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                    chatChannel === ch ? 'bg-[#d4af37] text-[#0b0e14]' : 'bg-[#171e2d] text-[#cbd5e1] hover:text-white'
                  }`}
                >
                  {ch === 'all' ? 'Todos' : 'Equipe'}
                </button>
              ))}
              <button
                type="button"
                onClick={onCloseMatchChat}
                aria-label="Fechar chat"
                className="ml-1 rounded p-0.5 text-[#94a3b8] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2 h-36 overflow-y-auto rounded border border-white/10 bg-[#080c14] p-2 space-y-1 text-[11px]">
            {inMatchMessages.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-[#64748b]">
                Envie mensagens para Todos ou apenas sua Equipe.
              </div>
            ) : (
              inMatchMessages.map((m) => {
                const col = getMpColorById(m.colorId);
                return (
                  <div key={m.id} className="leading-snug">
                    <span className="mr-1 rounded bg-[#141c2c] px-1 py-0.5 text-[9px] font-semibold text-[#94a3b8]">
                      {m.channel === 'team' ? 'EQUIPE' : 'TODOS'}
                    </span>
                    <span className="font-bold mr-1" style={{ color: col.css }}>
                      {m.senderName}:
                    </span>
                    <span className="text-[#e2e8f0] break-words">{m.text}</span>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = chatInput.trim();
              if (!text) return;
              onSendMatchChat(chatChannel, text);
              setChatInput('');
            }}
            className="mt-2 flex gap-1.5"
          >
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              maxLength={240}
              placeholder="Mensagem ou cheat (RED TIDE, IN DARKEST NIGHT, CLEAR SKIES, WRATH OF THE GODS)..."
              className="flex-1 rounded border border-white/15 bg-[#0a0f1a] px-2 py-1 text-xs text-white focus:border-[#f3d27a] focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded border border-[#d4af37]/60 bg-[#1b2438] px-2.5 py-1 text-xs font-semibold text-[#f3d27a] hover:bg-[#25314d] cursor-pointer"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}

      {/* Scenario Playtest Cinematic Letterbox Overlay */}
      {hud.cinematic?.active && (
        <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between">
          <div className="flex items-center justify-between bg-black/88 px-5 py-3 border-b border-[#d4af37]/35">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d4af37]">
                Cinemática de Cenário
              </div>
              <div className="font-display text-sm font-bold text-[#f7e9c3]">{hud.cinematic.title}</div>
            </div>
            {onSkipCinematic && (
              <button
                type="button"
                onClick={onSkipCinematic}
                className="pointer-events-auto rounded border border-[#d4af37]/50 bg-[#1a2236] px-3 py-1 text-xs font-semibold text-[#f3d27a] hover:bg-[#25314d] cursor-pointer"
              >
                Pular Cinemática
              </button>
            )}
          </div>
          <div className="bg-black/88 px-6 py-4 border-t border-[#d4af37]/35 text-center">
            <p className="mx-auto max-w-2xl text-sm font-medium text-[#f5efe0] leading-relaxed">
              {hud.cinematic.subtitle}
            </p>
            <div className="mx-auto mt-2.5 h-1 max-w-md overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full bg-[#d4af37] transition-all duration-150"
                style={{ width: `${Math.round(hud.cinematic.progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
