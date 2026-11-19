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
    sunColor: 0xff8a4c,
    sunIntensity: 1.45,
    sunPos: [-52, 22, 30],
    hemiSky: 0xc26d6a,
    hemiGround: 0x2c2228,
    hemiIntensity: 0.72,
    fogHex: 0x5c3638,
  },
  {
    label: 'Noite Escura (Night)',
    sunColor: 0x8bb6ff,
    sunIntensity: 0.62,
    sunPos: [38, 66, -34],
    hemiSky: 0x1e3a6d,
    hemiGround: 0x0b101d,
    hemiIntensity: 0.42,
    fogHex: 0x0b1224,
  },
  {
    label: 'Luz do Submundo (Hades / Erebus)',
    sunColor: 0xff5a2c,
    sunIntensity: 1.15,
    sunPos: [45, 28, 42],
    hemiSky: 0x6b221e,
    hemiGround: 0x240c0a,
    hemiIntensity: 0.56,
    fogHex: 0x3b1212,
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
