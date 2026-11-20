export type EnvironmentalCheatId =
  | 'IN_DARKEST_NIGHT'
  | 'RED_TIDE'
  | 'CLEAR_SKIES'
  | 'WRATH_OF_THE_GODS';

export interface EnvironmentalCheatSpec {
  id: EnvironmentalCheatId;
  codes: string[];
  label: string;
  desc: string;
}

export const ENVIRONMENTAL_CHEAT_SPECS: EnvironmentalCheatSpec[] = [
  {
    id: 'IN_DARKEST_NIGHT',
    codes: ['IN DARKEST NIGHT'],
    label: 'Ciclo de Iluminação Noturno / Submundo',
    desc: 'Alterna a iluminação do mapa entre Dia, Entardecer, Noite Escura e Luz do Submundo.',
  },
  {
    id: 'RED_TIDE',
    codes: ['RED TIDE'],
    label: 'Maré Vermelha',
    desc: 'Transforma a água do mapa em vermelho-sangue e elimina todos os cardumes de peixes.',
  },
  {
    id: 'CLEAR_SKIES',
    codes: ['CLEAR SKIES', 'LAY OF THE LAND'],
    label: 'Céus Limpos / Mapa Revelado',
    desc: 'Remove a neblina e revela toda a geografia do terreno.',
  },
  {
    id: 'WRATH_OF_THE_GODS',
    codes: ['WRATH OF THE GODS'],
    label: 'Ira dos Deuses',
    desc: 'Libera poderes divinos ilimitados (incluindo Terremoto e Vulcão sem recarga/custo).',
  },
];

export const DARKEST_NIGHT_CYCLES: {
  label: string;
  sunColor: number;
  sunIntensity: number;
  sunPos: [number, number, number];
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  fogHex: number;
}[] = [
  {
    label: 'Entardecer Dourado (Dusk)',
    sunColor: 0xff9457,
    sunIntensity: 1.45,
    sunPos: [-52, 26, 30],
    hemiSky: 0xd98c7a,
    hemiGround: 0x453438,
    hemiIntensity: 0.72,
    fogHex: 0x6b4245,
  },
  {
    label: 'Noite Lunar (Night)',
    sunColor: 0xc8e1ff,
    sunIntensity: 1.12,
    sunPos: [44, 68, -32],
    hemiSky: 0x7ea8de,
    hemiGround: 0x384e70,
    hemiIntensity: 0.72,
    fogHex: 0x1e3052,
  },
  {
    label: 'Luz do Submundo (Hades / Erebus)',
    sunColor: 0xff7a4d,
    sunIntensity: 1.25,
    sunPos: [45, 34, 42],
    hemiSky: 0x994a42,
    hemiGround: 0x3d1e1a,
    hemiIntensity: 0.66,
    fogHex: 0x4a1d1c,
  },
  {
    label: 'Dia Clássico (Default)',
    sunColor: 0xfff5dc,
    sunIntensity: 2.25,
    sunPos: [55, 82, 42],
    hemiSky: 0x9bd2ff,
    hemiGround: 0x4b5c3e,
    hemiIntensity: 0.92,
    fogHex: 0x6b8eb2,
  },
];

export function matchEnvironmentalCheat(rawInput: string): EnvironmentalCheatId | null {
  const normalized = rawInput.trim().toUpperCase().replace(/\s+/g, ' ');
  for (const spec of ENVIRONMENTAL_CHEAT_SPECS) {
    if (spec.codes.includes(normalized)) {
      return spec.id;
    }
  }
  return null;
}
