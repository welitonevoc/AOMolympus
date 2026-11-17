import { useEffect, useRef } from 'react';
import { PantheonId, SelectionSummary } from '../game/types';

interface AnimatedPortraitProps {
  selection: SelectionSummary;
  pantheon: PantheonId;
  primaryColor: string;
}

export function AnimatedPortrait({ selection, pantheon, primaryColor }: AnimatedPortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let lastDraw = 0;
    const size = 144;

    const drawPortrait = (t: number) => {
      const bob = Math.sin(t * 2.4) * 2.2;
      const sway = Math.sin(t * 1.9) * 0.06;
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.1);

      ctx.clearRect(0, 0, size, size);

      // Rich AoM-inspired radial medallion backdrop
      const bg = ctx.createRadialGradient(size * 0.5, size * 0.35, 10, size * 0.5, size * 0.5, 82);
      if (selection.primaryType === 'none') {
        bg.addColorStop(0, '#2a2212');
        bg.addColorStop(1, '#0b0e15');
      } else if (selection.isMajorGod || selection.isGod) {
        bg.addColorStop(0, '#4c3810');
        bg.addColorStop(0.55, '#221734');
        bg.addColorStop(1, '#0b0d14');
      } else if (selection.isHero) {
        bg.addColorStop(0, '#4a3512');
        bg.addColorStop(1, '#12151e');
      } else if (selection.isMythic) {
        bg.addColorStop(0, '#133548');
        bg.addColorStop(1, '#0a0f18');
      } else if (selection.team === 'enemy') {
        bg.addColorStop(0, '#4a151b');
        bg.addColorStop(1, '#100b10');
      } else if (selection.team === 'neutral') {
        bg.addColorStop(0, '#1f2d21');
        bg.addColorStop(1, '#0b1014');
      } else {
        bg.addColorStop(0, '#1e304c');
        bg.addColorStop(1, '#0b0f18');
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);

      // Subtle atmospheric rays / divine aura
      if (selection.isHero || selection.isGod || selection.isMajorGod || selection.primaryType === 'relic') {
        ctx.save();
        ctx.translate(size / 2, size * 0.48);
        ctx.rotate(t * 0.25);
        ctx.strokeStyle = selection.isGod || selection.isMajorGod
          ? `rgba(250, 204, 21, ${0.18 + pulse * 0.16})`
          : `rgba(212, 175, 55, ${0.14 + pulse * 0.1})`;
        ctx.lineWidth = 5;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
          ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62);
          ctx.stroke();
        }
        ctx.restore();
      }

      const teamHex =
        selection.team === 'enemy'
          ? '#dc2626'
          : selection.team === 'neutral'
          ? '#84cc16'
          : primaryColor || '#3b82f6';

      ctx.save();
      ctx.translate(size / 2, size * 0.56);

      if (selection.primaryType === 'unit') {
        const uk = selection.unitKind ?? 'hoplite';
        ctx.translate(0, bob);

        // Shoulders & cape/cloak swaying
        ctx.save();
        ctx.rotate(sway * 0.6);
        ctx.fillStyle = teamHex;
        ctx.strokeStyle = '#090b10';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-36, 48);
        ctx.quadraticCurveTo(-30, 8, 0, 4);
        ctx.quadraticCurveTo(30, 8, 36, 48);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Torso armor / cuirass
        ctx.fillStyle =
          selection.isMajorGod || selection.isHero
            ? '#d4af37'
            : selection.isMythic
            ? '#334155'
            : uk === 'villager'
            ? '#b58d63'
            : '#94a3b8';
        ctx.beginPath();
        ctx.roundRect(-22, 8, 44, 40, 10);
        ctx.fill();
        ctx.strokeStyle = '#0a0c12';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Specific unit silhouette details
        if (uk === 'villager') {
          // Head + warm straw/cloth hood + pickaxe bobbing
          ctx.fillStyle = '#e4b88d';
          ctx.beginPath();
          ctx.arc(0, -14, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = pantheon === 'egyptian' ? '#f5efe0' : '#7c5a38';
          ctx.beginPath();
          ctx.arc(0, -18, 16, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Pickaxe / tool
          ctx.save();
          ctx.translate(24, 16);
          ctx.rotate(-0.35 + sway * 1.4);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-3, -34, 6, 44);
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(-14, -34);
          ctx.quadraticCurveTo(0, -40, 14, -30);
          ctx.lineTo(10, -24);
          ctx.quadraticCurveTo(0, -32, -12, -28);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (uk === 'pharaoh' || uk === 'son_of_osiris' || uk === 'priest' || uk === 'ra' || uk === 'isis' || uk === 'set') {
          // Royal Egyptian Nemes / Falcon / Ankh Portrait
          const isFalcon = uk === 'son_of_osiris' || uk === 'ra';
          // Striped Nemes Headdress lappets
          ctx.fillStyle = '#1e3a8a';
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-24, -22);
          ctx.lineTo(0, -38);
          ctx.lineTo(24, -22);
          ctx.lineTo(20, 12);
          ctx.lineTo(-20, 12);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Gold solar disk overhead for Ra / Son of Osiris / Pharaoh
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, -38, isFalcon ? 11 : 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Head / Falcon visage
          ctx.fillStyle = isFalcon ? '#d4af37' : '#c68652';
          ctx.beginPath();
          ctx.arc(0, -14, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          if (isFalcon) {
            // Curved Horus beak & glowing eyes
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(-3, -14);
            ctx.lineTo(8, -10);
            ctx.lineTo(0, -6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-7, -18, 4, 3);
            ctx.fillRect(3, -18, 4, 3);
          } else {
            // Ceremonial braided gold beard
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(-3, -2, 6, 14);
          }

          // Glowing Ankh / Was Scepter on right
          ctx.save();
          ctx.translate(25, 10);
          ctx.rotate(sway * 1.1);
          ctx.strokeStyle = uk === 'son_of_osiris' ? '#38bdf8' : '#facc15';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(0, -22, 7, 0, Math.PI * 2);
          ctx.moveTo(0, -15);
          ctx.lineTo(0, 14);
          ctx.moveTo(-9, -8);
          ctx.lineTo(9, -8);
          ctx.stroke();
          ctx.restore();
        } else if (uk === 'sphinx' || uk === 'wadjet' || uk === 'roc' || uk === 'petsuchos' || uk === 'scarab' || uk === 'avenger' || uk === 'mummy') {
          // Egyptian Myth Creature Portraits
          ctx.fillStyle =
            uk === 'scarab'
              ? '#0f172a'
              : uk === 'petsuchos' || uk === 'wadjet'
              ? '#15803d'
              : uk === 'mummy'
              ? '#e5dcc5'
              : '#d4af37';
          ctx.beginPath();
          ctx.arc(0, -14, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Glowing mythic eyes + solar crest
          ctx.fillStyle = uk === 'mummy' || uk === 'avenger' ? '#38bdf8' : '#facc15';
          ctx.fillRect(-8, -18, 5, 4);
          ctx.fillRect(3, -18, 5, 4);

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, -34, 7, 0, Math.PI * 2);
          ctx.fill();
        } else if (uk === 'war_elephant' || uk === 'camel_rider' || uk === 'chariot_archer') {
          // Egyptian Migdol Stronghold Mounts
          ctx.fillStyle = uk === 'war_elephant' ? '#64748b' : '#d97706';
          ctx.beginPath();
          ctx.arc(0, -10, 19, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Ivory tusks / gold frontlet
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.moveTo(-12, -2);
          ctx.quadraticCurveTo(-24, 10, -18, 22);
          ctx.lineTo(-12, 16);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(12, -2);
          ctx.quadraticCurveTo(24, 10, 18, 22);
          ctx.lineTo(12, 16);
          ctx.fill();
        } else if (uk === 'cyclops' || uk === 'minotaur' || uk === 'titan') {
          // Monstrous horned or single-eyed head
          ctx.fillStyle = uk === 'titan' ? '#475569' : uk === 'cyclops' ? '#c28b5a' : '#78350f';
          ctx.beginPath();
          ctx.arc(0, -16, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          if (uk === 'minotaur' || uk === 'titan') {
            // Curved horns
            ctx.fillStyle = uk === 'titan' ? '#f59e0b' : '#fef3c7';
            for (const dir of [-1, 1]) {
              ctx.beginPath();
              ctx.moveTo(dir * 14, -22);
              ctx.quadraticCurveTo(dir * 34, -34, dir * 24, -48);
              ctx.quadraticCurveTo(dir * 20, -32, dir * 10, -28);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
          }
          if (uk === 'cyclops') {
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath();
            ctx.arc(0, -18, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -18, 3.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#facc15';
            ctx.fillRect(-9, -20, 5, 4);
            ctx.fillRect(4, -20, 5, 4);
          }
        } else if (uk === 'archer' || uk === 'peltast' || uk === 'slinger' || uk === 'gastraphetes' || uk === 'hippolyta' || uk === 'odysseus') {
          // Archer head + hood + curved bow
          ctx.fillStyle = '#e4b88d';
          ctx.beginPath();
          ctx.arc(0, -15, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = teamHex;
          ctx.beginPath();
          ctx.arc(0, -17, 15.5, Math.PI * 0.9, Math.PI * 2.1);
          ctx.fill();
          ctx.stroke();

          // Bow arc
          ctx.save();
          ctx.translate(22, 4);
          ctx.rotate(sway);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(-8, 0, 26, -Math.PI * 0.42, Math.PI * 0.42);
          ctx.stroke();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -24);
          ctx.lineTo(0, 24);
          ctx.stroke();
          ctx.restore();
        } else if (uk === 'ram' || uk === 'siege' || uk === 'siege_tower' || uk === 'egypt_catapult') {
          // Timber siege machine silhouette
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-34, -6, 68, 34);
          ctx.strokeRect(-34, -6, 68, 34);
          ctx.fillStyle = '#d4af37';
          ctx.beginPath();
          ctx.moveTo(22, 4);
          ctx.lineTo(44, 11);
          ctx.lineTo(22, 18);
          ctx.closePath();
          ctx.fill();
          for (const wx of [-20, 20]) {
            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.arc(wx, 30, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        } else {
          // Classic Greek/Hero/God Helmet & Shield Portrait
          // Flowing Plume Crest
          ctx.save();
          ctx.rotate(sway * 1.2);
          ctx.fillStyle = selection.isMajorGod || selection.isGod ? '#facc15' : teamHex;
          ctx.beginPath();
          ctx.ellipse(0, -38, 16, 8, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Helmet bowl & cheek guards
          ctx.fillStyle = selection.isHero || selection.isMajorGod ? '#eab308' : '#cbd5e1';
          ctx.beginPath();
          ctx.arc(0, -16, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Dark visor T-slit
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-7, -18, 14, 4);
          ctx.fillRect(-2, -16, 4, 10);

          // Round Aspis Shield on left
          ctx.fillStyle = selection.isHero || selection.isMajorGod ? '#facc15' : '#b48a3e';
          ctx.beginPath();
          ctx.arc(-22, 22, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = teamHex;
          ctx.beginPath();
          ctx.arc(-22, 22, 12, 0, Math.PI * 2);
          ctx.fill();

          // Spear / Lightning glint on right
          ctx.save();
          ctx.translate(24, 12);
          ctx.rotate(0.18 + sway * 0.7);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-2.5, -36, 5, 58);
          ctx.fillStyle = selection.isMajorGod || selection.isGod ? '#fde047' : '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(0, -48);
          ctx.lineTo(6, -34);
          ctx.lineTo(-6, -34);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      } else if (selection.primaryType === 'building') {
        const bk = selection.buildingKind ?? 'town_center';
        // Stone platform
        ctx.fillStyle = '#475569';
        ctx.fillRect(-42, 24, 84, 14);

        // Building facade
        ctx.fillStyle = bk === 'temple' ? '#e2e8f0' : bk === 'armory' ? '#64748b' : '#cbd5e1';
        ctx.strokeStyle = '#0a0c12';
        ctx.lineWidth = 2.5;
        ctx.fillRect(-32, -8, 64, 34);
        ctx.strokeRect(-32, -8, 64, 34);

        // Columns or battlements
        ctx.fillStyle = '#f8fafc';
        for (const cx of [-24, -8, 8, 24]) {
          ctx.fillRect(cx - 3, -6, 6, 30);
        }

        // Classical pediment / roof
        ctx.fillStyle = bk === 'armory' ? '#991b1b' : teamHex;
        ctx.beginPath();
        ctx.moveTo(-38, -8);
        ctx.lineTo(0, -34);
        ctx.lineTo(38, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Flickering hearth / forge ember glow
        ctx.fillStyle = `rgba(251, 146, 60, ${0.6 + pulse * 0.35})`;
        ctx.beginPath();
        ctx.arc(0, 16, 7 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (selection.primaryType === 'resource' || selection.primaryType === 'fauna' || selection.primaryType === 'relic' || selection.primaryType === 'settlement') {
        ctx.translate(0, bob * 0.7);
        if (selection.primaryType === 'resource') {
          if (selection.resourceType === 'wood') {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(-5, 8, 10, 26);
            ctx.fillStyle = '#15803d';
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.moveTo(-26 + i * 4, 14 - i * 14);
              ctx.lineTo(0, -18 - i * 14);
              ctx.lineTo(26 - i * 4, 14 - i * 14);
              ctx.closePath();
              ctx.fill();
            }
          } else if (selection.resourceType === 'gold') {
            ctx.fillStyle = '#ca8a04';
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-28, 24);
            ctx.lineTo(-18, -14);
            ctx.lineTo(4, -26);
            ctx.lineTo(28, 6);
            ctx.lineTo(22, 24);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = `rgba(254, 240, 138, ${0.45 + pulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(-4, -8, 5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#166534';
            ctx.beginPath();
            ctx.arc(0, 4, 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e11d48';
            for (const [bx, by] of [[-10, -4], [8, -8], [-4, 10], [12, 8], [0, 0]]) {
              ctx.beginPath();
              ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else if (selection.primaryType === 'relic') {
          ctx.fillStyle = '#22d3ee';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -32);
          ctx.lineTo(22, 0);
          ctx.lineTo(0, 32);
          ctx.lineTo(-22, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (selection.primaryType === 'settlement') {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.fillStyle = '#334155';
          ctx.fillRect(-28, 6, 56, 18);
          ctx.strokeRect(-28, 6, 56, 18);
          ctx.fillStyle = '#475569';
          ctx.fillRect(-20, -14, 10, 20);
          ctx.fillRect(10, -10, 10, 16);
        } else {
          // Fauna silhouette
          ctx.fillStyle = '#92400e';
          ctx.beginPath();
          ctx.ellipse(0, 4, 26, 18, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(18, -8, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.arc(22, -10, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Default Pantheon / Major God Emblem
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.55 + pulse * 0.35})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -6, 30, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(4, -30);
        ctx.lineTo(-10, -4);
        ctx.lineTo(0, -4);
        ctx.lineTo(-6, 22);
        ctx.lineTo(14, -8);
        ctx.lineTo(2, -8);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Subtle animated glint sweep across medallion edge
      ctx.strokeStyle = `rgba(243, 210, 122, ${0.22 + pulse * 0.18})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, size - 4, size - 4);
    };

    drawPortrait(0);
    if (prefersReduced) return;

    const tick = (now: number) => {
      if (now - lastDraw >= 42) {
        lastDraw = now;
        drawPortrait(now * 0.001);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    selection.primaryType,
    selection.unitKind,
    selection.buildingKind,
    selection.resourceType,
    selection.faunaKind,
    selection.team,
    selection.isHero,
    selection.isMythic,
    selection.isGod,
    selection.isMajorGod,
    pantheon,
    primaryColor,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={144}
      height={144}
      className="h-[68px] w-[68px] shrink-0 rounded border-2 border-[#c8a962]/75 bg-[#0b0e15] shadow-inner"
    />
  );
}
