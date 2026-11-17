import * as THREE from 'three';
import { MaterialPalette } from '../game/models';
import { PantheonId } from '../game/types';

export interface GalleryUtensilItem {
  id: string;
  name: string;
  category: 'work' | 'domestic' | 'ritual';
  civAffinity: string;
  usage: string;
  materialLabel: string;
  desc: string;
  accentHex: number;
}

export interface GalleryRelicItem {
  id: string;
  name: string;
  pantheon: PantheonId;
  bonusLabel: string;
  origin: string;
  tierLabel: string;
  desc: string;
  auraHex: number;
}

export interface StudioArtifactHandle {
  group: THREE.Group;
  animate?: (simTime: number, dt: number, auraActive: boolean) => void;
  dispose: () => void;
}

export const GALLERY_UTENSIL_ITEMS: GalleryUtensilItem[] = [
  {
    id: 'amphora',
    name: 'Ânfora Olímpica de Terracota',
    category: 'domestic',
    civAffinity: 'Gregos · Cidades & Portos',
    usage: 'Armazenamento de azeite, vinho e grãos',
    materialLabel: 'Argila cozida, verniz negro e friso dourado',
    desc: 'Vaso clássico de duas alças modelado em torno com base cônica e cinta ornamental grega para transporte marítimo e despensas.',
    accentHex: 0xc26a3d,
  },
  {
    id: 'anvil_hammer',
    name: 'Bigorna & Martelo de Forja',
    category: 'work',
    civAffinity: 'Gregos · Nórdicos (Forja Anã)',
    usage: 'Forja de armas, armaduras e aprimoramentos do Arsenal',
    materialLabel: 'Ferro batido, aço temperado e tronco de carvalho',
    desc: 'Bigorna de chifre cônico montada sobre cepo maciço de madeira com lingote incandescente e martelo de ferreiro.',
    accentHex: 0xf97316,
  },
  {
    id: 'harvest_basket',
    name: 'Cesto de Colheita & Foice',
    category: 'work',
    civAffinity: 'Todas as Civilizações',
    usage: 'Coleta de frutas, cereais e entregas no Celeiro',
    materialLabel: 'Vime trançado, bronze polido e madeira',
    desc: 'Cesto rústico de vime repleto de frutos colhidos acompanhado por foice curva de bronze usada pelos aldeões nas lavouras.',
    accentHex: 0xeab308,
  },
  {
    id: 'mining_pick_crate',
    name: 'Picareta & Caixote de Minério',
    category: 'work',
    civAffinity: 'Anões Nórdicos · Mineiros',
    usage: 'Extração e transporte de Ouro das jazidas',
    materialLabel: 'Pinho reforçado, ferro forjado e pepitas de ouro',
    desc: 'Caixa reforçada com cantoneiras metálicas carregada de minério dourado bruto, picareta dupla e lampião de mina.',
    accentHex: 0xfacc15,
  },
  {
    id: 'lumber_axe_block',
    name: 'Machado Lenhador & Cepo',
    category: 'work',
    civAffinity: 'Nórdicos · Coletores Florestais',
    usage: 'Corte de madeira e preparo de toras de construção',
    materialLabel: 'Aço barbado, freixo e toras de pinho',
    desc: 'Toco de corte marcado por lâminas com toras empilhadas e machado de ferro pesado cravado na madeira.',
    accentHex: 0x94a3b8,
  },
  {
    id: 'brazier_tripod',
    name: 'Braseiro de Bronze em Tripé',
    category: 'ritual',
    civAffinity: 'Gregos · Egípcios · Templos',
    usage: 'Iluminação cerimonial e oferendas no Templo',
    materialLabel: 'Bronze fundido, brasa mineral e fogo vivo',
    desc: 'Tripé esculpido com garras leoninas sustentando bacia rasa em chamas constantes à entrada de santuários e fortalezas.',
    accentHex: 0xfb923c,
  },
  {
    id: 'cauldron_hearth',
    name: 'Caldeirão de Hidromel & Fogueira',
    category: 'domestic',
    civAffinity: 'Nórdicos · Salão de Hidromel',
    usage: 'Preparo de banquetes e rações para guerreiros',
    materialLabel: 'Ferro fundido, madeira entalhada e chifre',
    desc: 'Tripé de madeira sustentando caldeirão sobre brasas vivas, acompanhado de concha metálica e corno de bebida.',
    accentHex: 0xef4444,
  },
  {
    id: 'scroll_chest',
    name: 'Arca de Pergaminhos & Astrolábio',
    category: 'domestic',
    civAffinity: 'Egípcios · Atlantes · Mercados',
    usage: 'Arquivo de tecnologias divinas e rotas comerciais',
    materialLabel: 'Cedro, faixas de latão, papiro e lacre',
    desc: 'Baú arqueado com rolos de papiro selados, compasso de latão e instrumentos de medição astral e econômica.',
    accentHex: 0x38bdf8,
  },
  {
    id: 'wooden_barrel_rack',
    name: 'Barril de Suprimentos & Cordame',
    category: 'work',
    civAffinity: 'Docas · Mercados · Caravanas',
    usage: 'Logística naval e abastecimento de tropas em marcha',
    materialLabel: 'Aduelas de carvalho, aros de ferro e cânhamo',
    desc: 'Barril estanque cintado por quatro arcos metálicos sobre cavalete de madeira com torneira e rolo de corda náutica.',
    accentHex: 0xa16207,
  },
  {
    id: 'water_mill_bucket',
    name: 'Mó de Pedra & Balde de Poço',
    category: 'domestic',
    civAffinity: 'Todas as Civilizações',
    usage: 'Moagem de trigo em farinha e coleta de água',
    materialLabel: 'Granito talhado, carvalho e cobre',
    desc: 'Conjunto agrícola composto por pedra de moinho ranhurada com manivela, balde cintado e jarro de cerâmica.',
    accentHex: 0x64748b,
  },
];

export const GALLERY_RELIC_ITEMS: GalleryRelicItem[] = [
  {
    id: 'chalice_athena',
    name: 'Cálice de Atena',
    pantheon: 'greek',
    bonusLabel: '+15 Ouro & +2 Favor a cada 5s no Templo',
    origin: 'Acrópole de Atenas',
    tierLabel: 'Relíquia Olímpica',
    desc: 'Taça cerimonial de ouro lavrado consagrada à deusa da sabedoria; guarda um orbe etéreo que irradia prosperidade contínua.',
    auraHex: 0x38bdf8,
  },
  {
    id: 'helm_achilles',
    name: 'Elmo de Aquiles',
    pantheon: 'greek',
    bonusLabel: '+15 Alimento & +2 Favor a cada 5s no Templo',
    origin: 'Forja de Hefesto · Tróia',
    tierLabel: 'Relíquia Heroica',
    desc: 'Elmo coríntio invicto com crista escarlate de crina e protetores faciais dourados, símbolo da bravura imortal dos Mirmidões.',
    auraHex: 0xf59e0b,
  },
  {
    id: 'lyre_apollo',
    name: 'Lira de Apolo',
    pantheon: 'greek',
    bonusLabel: '+15 Madeira & +2 Favor a cada 5s no Templo',
    origin: 'Oráculo de Delfos',
    tierLabel: 'Relíquia Solar',
    desc: 'Instrumento sagrado de caixa solar, braços curvos de marfim e sete cordas áureas cuja harmonia abençoa colheitas e bosques.',
    auraHex: 0xfacc15,
  },
  {
    id: 'shield_ajax',
    name: 'Escudo de Ájax',
    pantheon: 'greek',
    bonusLabel: '+20 Ouro & +3 Favor a cada 5s no Templo',
    origin: 'Salamina',
    tierLabel: 'Relíquia Lendária',
    desc: 'Escudo torre de sete camadas revestido em bronze olímpico com umbo de Górgona e lança Dory inclinada ao altar.',
    auraHex: 0x60a5fa,
  },
  {
    id: 'ankh_ra',
    name: 'Chave Ankh de Rá',
    pantheon: 'egyptian',
    bonusLabel: '+20% Geração de Favor & Vigor nos Monumentos',
    origin: 'Templo Solar de Heliópolis',
    tierLabel: 'Relíquia Faraônica',
    desc: 'Emblema eterno da vida forjado em eletro solar que flutua sobre um pedestal de lápis-lazúli e flores de lótus.',
    auraHex: 0xfbbf24,
  },
  {
    id: 'eye_horus',
    name: 'Olho Místico de Hórus (Wedjat)',
    pantheon: 'egyptian',
    bonusLabel: '+25% Linha de Visão & Alcance de Obeliscos',
    origin: 'Alto Egito',
    tierLabel: 'Relíquia Arcana',
    desc: 'Amuleto real de turquesa e ouro incrustado entre pilares de basalto, concedendo vigilância celeste às fronteiras.',
    auraHex: 0x06b6d4,
  },
  {
    id: 'scarab_khepri',
    name: 'Escaravelho Solar de Quépri',
    pantheon: 'egyptian',
    bonusLabel: '-15% Custo em Ouro de Unidades Míticas',
    origin: 'Vale dos Reis',
    tierLabel: 'Relíquia Real',
    desc: 'Joia alada esculpida em jade e cornalina sobre cartucho de arenito, emblema do renascimento diário do Sol.',
    auraHex: 0x10b981,
  },
  {
    id: 'mjolnir_shard',
    name: 'Fragmento de Mjölnir',
    pantheon: 'norse',
    bonusLabel: '+15% Dano de Heróis & Cerco vs Construções',
    origin: 'Forjas de Nidavellir',
    tierLabel: 'Relíquia Rúnica',
    desc: 'Martelo de guerra anão com cabo curto envolto em couro e runas de relâmpago brilhando sobre granito ancestral.',
    auraHex: 0x38bdf8,
  },
  {
    id: 'horn_gjallar',
    name: 'Trompa de Gjallarhorn',
    pantheon: 'norse',
    bonusLabel: '+12% Ataque da Infantaria Nórdica',
    origin: 'Ponte Bifröst · Asgard',
    tierLabel: 'Relíquia de Valhalla',
    desc: 'Chifre colossal de marfim com cintas de bronze entalhadas em dragões; seu eco anuncia a marcha dos Einherjar.',
    auraHex: 0xa855f7,
  },
  {
    id: 'orichalcum_astrolabe',
    name: 'Astrolábio de Oricalco',
    pantheon: 'atlantean',
    bonusLabel: '+20% Velocidade de Pesquisa & Recarga Divina',
    origin: 'Cidadela Submersa de Atlântida',
    tierLabel: 'Relíquia Titânica',
    desc: 'Anéis giroscópicos de oricalco polido em rotação contínua em torno de um núcleo cristalino do tempo primordial.',
    auraHex: 0xc084fc,
  },
];

export function buildUtensilMesh(
  id: string,
  pal: MaterialPalette,
  enableShadows: boolean
): StudioArtifactHandle {
  const root = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    mats.push(m);
    return m;
  };
  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    rx = 0,
    ry = 0,
    rz = 0
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    root.add(m);
    return m;
  };

  let animate: ((simTime: number, dt: number, auraActive: boolean) => void) | undefined;

  if (id === 'amphora') {
    const clayMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xb95c34, roughness: 0.62, metalness: 0.05 })
    );
    const blackGlazeMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x1b1918, roughness: 0.34, metalness: 0.14 })
    );
    const goldBandMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 })
    );

    const profile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.28, 0.0),
      new THREE.Vector2(0.24, 0.12),
      new THREE.Vector2(0.14, 0.22),
      new THREE.Vector2(0.56, 0.72),
      new THREE.Vector2(0.62, 1.15),
      new THREE.Vector2(0.46, 1.52),
      new THREE.Vector2(0.22, 1.72),
      new THREE.Vector2(0.21, 2.02),
      new THREE.Vector2(0.34, 2.16),
      new THREE.Vector2(0.26, 2.2),
      new THREE.Vector2(0.16, 2.02),
    ];
    add(trackGeo(new THREE.LatheGeometry(profile, 32)), clayMat);

    // Decorative glaze belly band & neck band
    add(trackGeo(new THREE.CylinderGeometry(0.625, 0.615, 0.16, 32, 1, true)), blackGlazeMat, 0, 1.12, 0);
    add(trackGeo(new THREE.TorusGeometry(0.628, 0.022, 8, 32)), goldBandMat, 0, 1.2, 0, Math.PI / 2);
    add(trackGeo(new THREE.TorusGeometry(0.62, 0.022, 8, 32)), goldBandMat, 0, 1.04, 0, Math.PI / 2);
    add(trackGeo(new THREE.TorusGeometry(0.29, 0.025, 8, 28)), blackGlazeMat, 0, 2.16, 0, Math.PI / 2);

    // Twin curved handles
    for (const side of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.22, 1.95, 0),
        new THREE.Vector3(side * 0.68, 1.88, 0),
        new THREE.Vector3(side * 0.74, 1.52, 0),
        new THREE.Vector3(side * 0.48, 1.38, 0),
      ]);
      add(trackGeo(new THREE.TubeGeometry(curve, 18, 0.048, 10, false)), clayMat);
    }

    // Companion small terracotta cup
    add(trackGeo(new THREE.CylinderGeometry(0.22, 0.14, 0.34, 20)), clayMat, 0.92, 0.17, 0.36);
    add(trackGeo(new THREE.TorusGeometry(0.21, 0.02, 8, 20)), goldBandMat, 0.92, 0.32, 0.36, Math.PI / 2);
  } else if (id === 'anvil_hammer') {
    const oakMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x5c3c22, roughness: 0.85, metalness: 0.04 }));
    const ironMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.36, metalness: 0.88 }));
    const steelMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.22, metalness: 0.94 }));
    const emberMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0xea580c,
        emissiveIntensity: 1.5,
        roughness: 0.4,
      })
    );

    // Oak stump base + iron binding band
    add(trackGeo(new THREE.CylinderGeometry(0.64, 0.72, 0.86, 18)), oakMat, 0, 0.43, 0);
    add(trackGeo(new THREE.CylinderGeometry(0.66, 0.66, 0.1, 18)), ironMat, 0, 0.72, 0);

    // Anvil foot, waist, face, horn & heel
    add(trackGeo(new THREE.BoxGeometry(0.95, 0.18, 0.56)), ironMat, 0, 0.95, 0);
    add(trackGeo(new THREE.BoxGeometry(0.62, 0.28, 0.34)), ironMat, 0, 1.18, 0);
    add(trackGeo(new THREE.BoxGeometry(1.05, 0.22, 0.44)), steelMat, 0.08, 1.43, 0);
    const horn = add(trackGeo(new THREE.ConeGeometry(0.19, 0.68, 14)), steelMat, -0.68, 1.43, 0, 0, 0, Math.PI / 2);
    horn.scale.set(0.85, 1, 1);
    add(trackGeo(new THREE.BoxGeometry(0.32, 0.16, 0.38)), ironMat, 0.64, 1.4, 0);

    // Glowing heated ingot on anvil face
    const ingot = add(trackGeo(new THREE.BoxGeometry(0.42, 0.08, 0.18)), emberMat, 0.06, 1.58, 0.02, 0, 0.2, 0);

    // Forged blacksmith hammer resting across anvil
    add(trackGeo(new THREE.CylinderGeometry(0.045, 0.055, 0.92, 10)), oakMat, 0.34, 1.62, 0.12, 0.35, 0.1, 1.18);
    add(trackGeo(new THREE.BoxGeometry(0.24, 0.38, 0.22)), steelMat, 0.62, 1.72, -0.02, 0.35, 0.1, 1.18);

    animate = (t, _dt, active) => {
      emberMat.emissiveIntensity = active ? 1.2 + Math.sin(t * 5.0) * 0.45 : 0.7;
      ingot.position.y = 1.58 + (active ? Math.sin(t * 3.0) * 0.004 : 0);
    };
  } else if (id === 'harvest_basket') {
    const wickerMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xb68a4c, roughness: 0.88, metalness: 0.02 }));
    const rimMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x7c5429, roughness: 0.82 }));
    const grainMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.72 }));
    const berryMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.45 }));
    const bronzeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xc89b3c, roughness: 0.28, metalness: 0.88 }));

    const profile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.45, 0.0),
      new THREE.Vector2(0.66, 0.32),
      new THREE.Vector2(0.72, 0.75),
      new THREE.Vector2(0.64, 0.96),
      new THREE.Vector2(0.56, 0.96),
      new THREE.Vector2(0.52, 0.2),
      new THREE.Vector2(0.0, 0.16),
    ];
    add(trackGeo(new THREE.LatheGeometry(profile, 24)), wickerMat);
    add(trackGeo(new THREE.TorusGeometry(0.62, 0.07, 10, 24)), rimMat, 0, 0.96, 0, Math.PI / 2);
    add(trackGeo(new THREE.TorusGeometry(0.69, 0.03, 8, 24)), rimMat, 0, 0.56, 0, Math.PI / 2);

    // Mound of golden harvest & fruits inside
    add(trackGeo(new THREE.SphereGeometry(0.56, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2)), grainMat, 0, 0.76, 0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      add(
        trackGeo(new THREE.SphereGeometry(0.11, 10, 8)),
        i % 2 === 0 ? berryMat : grainMat,
        Math.cos(a) * 0.32,
        0.98 + (i % 3) * 0.06,
        Math.sin(a) * 0.32
      );
    }

    // Bronze sickle leaning beside the basket
    add(trackGeo(new THREE.CylinderGeometry(0.045, 0.055, 0.46, 10)), rimMat, 0.86, 0.22, 0.2, 0.15, 0, -0.3);
    const bladeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.79, 0.42, 0.23),
      new THREE.Vector3(0.92, 0.86, 0.2),
      new THREE.Vector3(0.62, 1.18, 0.12),
      new THREE.Vector3(0.28, 1.24, 0.08),
    ]);
    add(trackGeo(new THREE.TubeGeometry(bladeCurve, 18, 0.04, 8, false)), bronzeMat);
  } else if (id === 'mining_pick_crate') {
    const woodMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x6b4728, roughness: 0.82 }));
    const ironMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.85 }));
    const oreMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.88 }));
    const goldMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xb45309,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.92,
      })
    );

    // Timber crate
    add(trackGeo(new THREE.BoxGeometry(1.36, 0.72, 0.96)), woodMat, 0, 0.36, 0);
    // Corner posts
    for (const cx of [-0.66, 0.66]) {
      for (const cz of [-0.46, 0.46]) {
        add(trackGeo(new THREE.BoxGeometry(0.1, 0.8, 0.1)), ironMat, cx, 0.4, cz);
      }
    }
    // Gold & stone nuggets inside crate
    for (let i = 0; i < 9; i++) {
      const ox = ((i % 3) - 1) * 0.34;
      const oz = (Math.floor(i / 3) - 1) * 0.24;
      add(
        trackGeo(new THREE.DodecahedronGeometry(0.22 + (i % 2) * 0.06, 0)),
        i % 3 === 1 ? oreMat : goldMat,
        ox,
        0.74 + (i % 2) * 0.08,
        oz,
        i * 0.5,
        i * 0.8,
        0
      );
    }

    // Dwarf pickaxe leaning against crate
    add(trackGeo(new THREE.CylinderGeometry(0.045, 0.05, 1.48, 10)), woodMat, 0.88, 0.68, 0.32, 0.24, 0, 0.22);
    const pickCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.4, 1.24, 0.45),
      new THREE.Vector3(0.74, 1.38, 0.48),
      new THREE.Vector3(1.12, 1.26, 0.46),
    ]);
    add(trackGeo(new THREE.TubeGeometry(pickCurve, 14, 0.055, 8, false)), ironMat);
  } else if (id === 'lumber_axe_block') {
    const barkMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x4b3320, roughness: 0.9 }));
    const heartwoodMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xb08253, roughness: 0.78 }));
    const ironMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.28, metalness: 0.9 }));
    const handleMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x7c4d2b, roughness: 0.74 }));

    // Stump & top rings
    add(trackGeo(new THREE.CylinderGeometry(0.62, 0.74, 0.78, 16)), barkMat, 0, 0.39, 0);
    add(trackGeo(new THREE.CylinderGeometry(0.58, 0.58, 0.04, 16)), heartwoodMat, 0, 0.79, 0);

    // Stacked cut logs beside stump
    for (let i = 0; i < 3; i++) {
      const lx = -0.88 + (i % 2) * 0.24;
      const ly = i === 2 ? 0.44 : 0.16;
      add(trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.95, 12)), barkMat, lx, ly, 0.25, Math.PI / 2, 0.25, 0);
    }

    // Embedded bearded Nordic axe
    const axeShape = new THREE.Shape();
    axeShape.moveTo(0, -0.06);
    axeShape.lineTo(0.36, -0.18);
    axeShape.lineTo(0.42, 0.16);
    axeShape.lineTo(0, 0.08);
    axeShape.closePath();
    const bladeGeo = trackGeo(
      new THREE.ExtrudeGeometry(axeShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 })
    );
    const blade = add(bladeGeo, ironMat, 0.05, 0.92, -0.03, 0, 0, -0.45);
    blade.rotation.z = -0.55;
    add(trackGeo(new THREE.CylinderGeometry(0.045, 0.052, 1.35, 10)), handleMat, 0.42, 1.38, 0, 0, 0, -0.55);
  } else if (id === 'brazier_tripod') {
    const bronzeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xb08334, roughness: 0.3, metalness: 0.86 }));
    const darkBronzeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x4b3822, roughness: 0.5, metalness: 0.7 }));
    const flameMatA = trackMat(
      new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.88 })
    );
    const flameMatB = trackMat(
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.92 })
    );

    // 3 tripod legs + central ring
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      add(
        trackGeo(new THREE.CylinderGeometry(0.05, 0.065, 1.35, 10)),
        darkBronzeMat,
        Math.cos(a) * 0.56,
        0.65,
        Math.sin(a) * 0.56,
        -Math.sin(a) * 0.24,
        0,
        Math.cos(a) * 0.24
      );
      add(trackGeo(new THREE.SphereGeometry(0.085, 10, 8)), bronzeMat, Math.cos(a) * 0.72, 0.06, Math.sin(a) * 0.72);
    }
    add(trackGeo(new THREE.TorusGeometry(0.48, 0.04, 10, 24)), bronzeMat, 0, 0.72, 0, Math.PI / 2);

    // Bowl & rim
    const bowlProfile = [
      new THREE.Vector2(0, 1.05),
      new THREE.Vector2(0.54, 1.12),
      new THREE.Vector2(0.76, 1.34),
      new THREE.Vector2(0.84, 1.44),
      new THREE.Vector2(0.72, 1.44),
      new THREE.Vector2(0.42, 1.18),
      new THREE.Vector2(0, 1.16),
    ];
    add(trackGeo(new THREE.LatheGeometry(bowlProfile, 28)), bronzeMat);

    // Animated flames
    const flame1 = add(trackGeo(new THREE.ConeGeometry(0.32, 0.85, 12)), flameMatA, 0, 1.62, 0);
    const flame2 = add(trackGeo(new THREE.ConeGeometry(0.18, 0.68, 10)), flameMatB, 0.08, 1.66, -0.05);
    const flameLight = new THREE.PointLight(0xfb923c, 2.2, 6.5);
    flameLight.position.set(0, 1.85, 0);
    root.add(flameLight);

    animate = (t, _dt, active) => {
      flame1.visible = active;
      flame2.visible = active;
      flameLight.intensity = active ? 2.1 + Math.sin(t * 9.0) * 0.45 : 0;
      if (active) {
        flame1.scale.set(1 + Math.sin(t * 7) * 0.08, 1 + Math.cos(t * 10) * 0.16, 1);
        flame2.scale.set(1, 1 + Math.sin(t * 12) * 0.2, 1);
        flame1.rotation.y = t * 1.2;
      }
    };
  } else if (id === 'cauldron_hearth') {
    const woodMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x5c3c22, roughness: 0.86 }));
    const ironMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.84 }));
    const meadMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.1 }));
    const emberMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xea580c, emissiveIntensity: 1.4 })
    );

    // Firewood & coals
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI;
      add(trackGeo(new THREE.CylinderGeometry(0.08, 0.09, 1.15, 8)), woodMat, 0, 0.09, 0, Math.PI / 2, a, 0);
    }
    const coals = add(trackGeo(new THREE.SphereGeometry(0.32, 12, 8)), emberMat, 0, 0.12, 0);
    coals.scale.set(1.2, 0.4, 1.2);

    // 3 Suspension poles
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      add(
        trackGeo(new THREE.CylinderGeometry(0.04, 0.055, 2.25, 8)),
        woodMat,
        Math.cos(a) * 0.56,
        1.04,
        Math.sin(a) * 0.56,
        -Math.sin(a) * 0.46,
        0,
        Math.cos(a) * 0.46
      );
    }
    // Iron kettle
    add(trackGeo(new THREE.SphereGeometry(0.46, 20, 14)), ironMat, 0, 0.84, 0);
    add(trackGeo(new THREE.TorusGeometry(0.34, 0.045, 8, 22)), ironMat, 0, 1.18, 0, Math.PI / 2);
    add(trackGeo(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 18)), meadMat, 0, 1.16, 0);
    // Suspension chain rod
    add(trackGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8)), ironMat, 0, 1.6, 0);

    // Drinking horn beside hearth
    const hornCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.86, 0.14, 0.3),
      new THREE.Vector3(1.06, 0.2, 0.36),
      new THREE.Vector3(1.22, 0.38, 0.32),
    ]);
    add(trackGeo(new THREE.TubeGeometry(hornCurve, 14, 0.08, 10, false)), pal.ivory);

    animate = (t, _dt, active) => {
      emberMat.emissiveIntensity = active ? 1.3 + Math.sin(t * 7.5) * 0.45 : 0.6;
    };
  } else if (id === 'scroll_chest') {
    const cedarMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x713f22, roughness: 0.62 }));
    const brassMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.24, metalness: 0.9 }));
    const papyrusMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf5e8c7, roughness: 0.82 }));
    const sealMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 }));

    // Chest base + brass straps
    add(trackGeo(new THREE.BoxGeometry(1.36, 0.56, 0.84)), cedarMat, 0, 0.28, 0);
    for (const bx of [-0.52, 0, 0.52]) {
      add(trackGeo(new THREE.BoxGeometry(0.09, 0.59, 0.88)), brassMat, bx, 0.29, 0);
    }

    // Half-cylindrical hinged lid tilted open
    const lid = add(trackGeo(new THREE.CylinderGeometry(0.42, 0.42, 1.36, 16, 1, false, 0, Math.PI)), cedarMat, 0, 0.58, -0.34, -0.45, 0, Math.PI / 2);
    lid.rotation.order = 'YXZ';

    // Papyrus scrolls overflowing
    for (let i = 0; i < 4; i++) {
      add(
        trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.72, 12)),
        papyrusMat,
        -0.32 + i * 0.22,
        0.64 + (i % 2) * 0.07,
        0.08,
        Math.PI / 2,
        0.18 * (i - 1.5),
        0
      );
      add(trackGeo(new THREE.TorusGeometry(0.084, 0.015, 6, 12)), sealMat, -0.32 + i * 0.22, 0.64 + (i % 2) * 0.07, 0.08);
    }

    // Brass dividers / calipers beside chest
    add(trackGeo(new THREE.TorusGeometry(0.24, 0.02, 8, 24)), brassMat, 0.92, 0.34, 0.26, 0.2, 0.4, 0);
    add(trackGeo(new THREE.TorusGeometry(0.18, 0.018, 8, 22)), brassMat, 0.92, 0.34, 0.26, 1.2, 0.4, 0.3);
  } else if (id === 'wooden_barrel_rack') {
    const staveMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x7c4e2a, roughness: 0.78 }));
    const ironMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.42, metalness: 0.84 }));
    const ropeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xc4a46c, roughness: 0.94 }));

    // Cradle base
    add(trackGeo(new THREE.BoxGeometry(1.1, 0.18, 0.16)), staveMat, 0, 0.09, -0.42);
    add(trackGeo(new THREE.BoxGeometry(1.1, 0.18, 0.16)), staveMat, 0, 0.09, 0.42);

    // Barrel body via LatheGeometry
    const profile = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.46, 0),
      new THREE.Vector2(0.58, 0.4),
      new THREE.Vector2(0.62, 0.72),
      new THREE.Vector2(0.58, 1.04),
      new THREE.Vector2(0.46, 1.44),
      new THREE.Vector2(0, 1.44),
    ];
    add(trackGeo(new THREE.LatheGeometry(profile, 24)), staveMat, 0, 0.14, 0);
    for (const hy of [0.24, 0.56, 1.14, 1.46]) {
      const r = hy === 0.56 || hy === 1.14 ? 0.595 : 0.49;
      add(trackGeo(new THREE.TorusGeometry(r, 0.026, 8, 26)), ironMat, 0, hy, 0, Math.PI / 2);
    }

    // Coiled rope beside barrel
    for (let k = 0; k < 3; k++) {
      add(trackGeo(new THREE.TorusGeometry(0.32 - k * 0.04, 0.042, 8, 22)), ropeMat, 0.94, 0.05 + k * 0.07, 0.25, Math.PI / 2);
    }
  } else {
    // water_mill_bucket
    const stoneMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.88 }));
    const oakMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x6b4728, roughness: 0.78 }));
    const copperMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.3, metalness: 0.85 }));
    const waterMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.12, metalness: 0.2 }));

    // Stone quern mill
    add(trackGeo(new THREE.CylinderGeometry(0.76, 0.82, 0.24, 24)), stoneMat, -0.25, 0.12, 0);
    add(trackGeo(new THREE.CylinderGeometry(0.66, 0.68, 0.22, 24)), stoneMat, -0.25, 0.36, 0);
    add(trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 0.56, 10)), oakMat, -0.66, 0.66, 0.18);

    // Water bucket with copper bands & surface
    add(trackGeo(new THREE.CylinderGeometry(0.34, 0.26, 0.56, 16)), oakMat, 0.8, 0.28, 0.25);
    add(trackGeo(new THREE.TorusGeometry(0.32, 0.02, 8, 18)), copperMat, 0.8, 0.46, 0.25, Math.PI / 2);
    add(trackGeo(new THREE.TorusGeometry(0.28, 0.02, 8, 18)), copperMat, 0.8, 0.16, 0.25, Math.PI / 2);
    add(trackGeo(new THREE.CircleGeometry(0.31, 16)), waterMat, 0.8, 0.51, 0.25, -Math.PI / 2);
  }

  return {
    group: root,
    animate,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}

export function buildRelicArtifactMesh(
  id: string,
  pal: MaterialPalette,
  enableShadows: boolean
): StudioArtifactHandle {
  const root = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    mats.push(m);
    return m;
  };

  const relicSpec = GALLERY_RELIC_ITEMS.find((r) => r.id === id) || GALLERY_RELIC_ITEMS[0];
  const auraColor = relicSpec.auraHex;

  // Ornate Sacred Altar Plinth
  const basaltMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1a1e29, roughness: 0.72, metalness: 0.22 }));
  const trimGoldMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.24, metalness: 0.9 }));
  const runeRingMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: auraColor,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    })
  );

  const addTo = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    rx = 0,
    ry = 0,
    rz = 0
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    parent.add(m);
    return m;
  };

  // Stepped temple plinth
  addTo(root, trackGeo(new THREE.CylinderGeometry(1.05, 1.22, 0.2, 8)), basaltMat, 0, 0.1, 0);
  addTo(root, trackGeo(new THREE.CylinderGeometry(0.76, 0.88, 0.34, 8)), pal.marble, 0, 0.37, 0);
  addTo(root, trackGeo(new THREE.TorusGeometry(0.79, 0.032, 8, 24)), trimGoldMat, 0, 0.54, 0, Math.PI / 2);

  // Orbiting sacred aura rings + soft light
  const auraGroup = new THREE.Group();
  auraGroup.position.y = 1.25;
  root.add(auraGroup);

  const haloRing = addTo(
    auraGroup,
    trackGeo(new THREE.RingGeometry(0.86, 0.98, 40)),
    runeRingMat,
    0,
    -1.22,
    0,
    -Math.PI / 2
  );
  const orbitRing = addTo(
    auraGroup,
    trackGeo(new THREE.TorusGeometry(0.82, 0.018, 8, 40)),
    runeRingMat,
    0,
    0.05,
    0,
    0.45,
    0,
    0.25
  );
  const auraLight = new THREE.PointLight(auraColor, 1.8, 6);
  auraLight.position.set(0, 1.35, 0);
  root.add(auraLight);

  // Levitating Relic Subject Group
  const relicBody = new THREE.Group();
  relicBody.position.y = 0.62;
  root.add(relicBody);

  const extraSpinTargets: THREE.Object3D[] = [];

  if (id === 'chalice_athena') {
    const cupProfile = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.32, 0),
      new THREE.Vector2(0.1, 0.14),
      new THREE.Vector2(0.08, 0.36),
      new THREE.Vector2(0.42, 0.56),
      new THREE.Vector2(0.48, 0.92),
      new THREE.Vector2(0.42, 0.94),
      new THREE.Vector2(0.34, 0.58),
      new THREE.Vector2(0, 0.52),
    ];
    addTo(relicBody, trackGeo(new THREE.LatheGeometry(cupProfile, 28)), trimGoldMat);
    for (const s of [-1, 1]) {
      const hCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.44, 0.85, 0),
        new THREE.Vector3(s * 0.68, 0.98, 0),
        new THREE.Vector3(s * 0.62, 0.65, 0),
        new THREE.Vector3(s * 0.34, 0.54, 0),
      ]);
      addTo(relicBody, trackGeo(new THREE.TubeGeometry(hCurve, 14, 0.036, 8, false)), trimGoldMat);
    }
    const orb = addTo(relicBody, trackGeo(new THREE.OctahedronGeometry(0.22, 1)), pal.crystalGlow, 0, 1.15, 0);
    extraSpinTargets.push(orb);
  } else if (id === 'helm_achilles') {
    const bronzeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.2, metalness: 0.92 }));
    const crestMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.62 }));
    addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.42, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.68)), bronzeMat, 0, 0.58, 0);
    // Cheek guards & nasal bar
    addTo(relicBody, trackGeo(new THREE.BoxGeometry(0.14, 0.44, 0.32)), bronzeMat, -0.34, 0.38, 0.14, 0, 0, 0.14);
    addTo(relicBody, trackGeo(new THREE.BoxGeometry(0.14, 0.44, 0.32)), bronzeMat, 0.34, 0.38, 0.14, 0, 0, -0.14);
    addTo(relicBody, trackGeo(new THREE.BoxGeometry(0.07, 0.32, 0.08)), bronzeMat, 0, 0.45, 0.41);
    // Dramatic crest arch
    const crestArch = addTo(
      relicBody,
      trackGeo(new THREE.TorusGeometry(0.48, 0.11, 10, 24, Math.PI * 1.15)),
      crestMat,
      0,
      0.72,
      -0.02,
      0,
      Math.PI / 2,
      -0.22
    );
    crestArch.scale.set(1.0, 1.25, 0.6);
  } else if (id === 'lyre_apollo') {
    const shellMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x7c3e1d, roughness: 0.45, metalness: 0.15 }));
    const body = addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.36, 18, 14)), shellMat, 0, 0.36, 0);
    body.scale.set(1.05, 0.85, 0.46);
    for (const s of [-1, 1]) {
      const armCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.24, 0.56, 0),
        new THREE.Vector3(s * 0.44, 0.92, 0),
        new THREE.Vector3(s * 0.34, 1.26, 0),
      ]);
      addTo(relicBody, trackGeo(new THREE.TubeGeometry(armCurve, 14, 0.05, 10, false)), pal.ivory);
    }
    addTo(relicBody, trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 0.86, 10)), trimGoldMat, 0, 1.18, 0, 0, 0, Math.PI / 2);
    for (let i = -3; i <= 3; i++) {
      addTo(relicBody, trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 0.72, 6)), trimGoldMat, i * 0.075, 0.84, 0);
    }
    const sunOrb = addTo(relicBody, trackGeo(new THREE.OctahedronGeometry(0.12, 0)), pal.crystalGlow, 0, 1.38, 0);
    extraSpinTargets.push(sunOrb);
  } else if (id === 'shield_ajax') {
    const bronzeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xc9963b, roughness: 0.25, metalness: 0.9 }));
    const rimMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, metalness: 0.35 }));
    const shieldDish = addTo(
      relicBody,
      trackGeo(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 32)),
      bronzeMat,
      0,
      0.72,
      0.08,
      Math.PI / 2 - 0.16,
      0,
      0
    );
    shieldDish.scale.set(0.84, 1, 1.18);
    const rim = addTo(
      relicBody,
      trackGeo(new THREE.TorusGeometry(0.68, 0.055, 10, 32)),
      rimMat,
      0,
      0.72,
      0.13,
      -0.16,
      0,
      0
    );
    rim.scale.set(0.86, 1.18, 1);
    addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.18, 16, 12)), trimGoldMat, 0, 0.72, 0.18);
    // Dory spear behind shield
    addTo(relicBody, trackGeo(new THREE.CylinderGeometry(0.032, 0.036, 1.85, 10)), pal.timber, -0.32, 0.82, -0.14, 0, 0, -0.22);
    addTo(relicBody, trackGeo(new THREE.ConeGeometry(0.07, 0.28, 6)), trimGoldMat, -0.11, 1.76, -0.14, 0, 0, -0.22);
  } else if (id === 'ankh_ra') {
    const sunGold = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xd97706,
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.94,
      })
    );
    const lapisMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3, metalness: 0.5 }));
    addTo(relicBody, trackGeo(new THREE.CylinderGeometry(0.08, 0.11, 0.78, 12)), sunGold, 0, 0.56, 0);
    addTo(relicBody, trackGeo(new THREE.BoxGeometry(0.78, 0.12, 0.12)), sunGold, 0, 0.82, 0);
    const loop = addTo(relicBody, trackGeo(new THREE.TorusGeometry(0.24, 0.065, 12, 28)), sunGold, 0, 1.14, 0);
    loop.scale.set(0.88, 1.18, 1);
    addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.14, 14, 12)), lapisMat, 0, 0.82, 0.08);
    const disk = addTo(relicBody, trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 18)), sunGold, 0, 1.54, 0, Math.PI / 2);
    extraSpinTargets.push(disk);
  } else if (id === 'eye_horus') {
    const turqMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25, metalness: 0.4 }));
    const lapisMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35, metalness: 0.5 }));
    addTo(relicBody, trackGeo(new THREE.BoxGeometry(1.06, 0.64, 0.14)), trimGoldMat, 0, 0.76, 0);
    const sclera = addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.26, 16, 12)), pal.ivory, 0, 0.78, 0.08);
    sclera.scale.set(1.45, 0.82, 0.45);
    addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.12, 14, 12)), turqMat, 0, 0.78, 0.16);
    addTo(relicBody, trackGeo(new THREE.BoxGeometry(0.1, 0.34, 0.1)), lapisMat, -0.06, 0.46, 0.09, 0, 0, 0.15);
    const spiral = addTo(relicBody, trackGeo(new THREE.TorusGeometry(0.16, 0.035, 8, 20, Math.PI * 1.4)), lapisMat, 0.18, 0.44, 0.09);
    spiral.rotation.z = -0.4;
  } else if (id === 'scarab_khepri') {
    const jadeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.22, metalness: 0.35 }));
    const shell = addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.36, 18, 14)), jadeMat, 0, 0.58, 0);
    shell.scale.set(0.88, 0.58, 1.25);
    addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.18, 14, 10)), trimGoldMat, 0, 0.58, 0.44);
    for (const s of [-1, 1]) {
      const wing = addTo(
        relicBody,
        trackGeo(new THREE.BoxGeometry(0.68, 0.04, 0.34)),
        trimGoldMat,
        s * 0.58,
        0.68,
        -0.04,
        0,
        -s * 0.22,
        s * 0.26
      );
      wing.scale.set(1, 1, 0.9);
    }
    const sunBall = addTo(relicBody, trackGeo(new THREE.SphereGeometry(0.2, 16, 12)), pal.crystalGlow, 0, 0.98, 0.48);
    extraSpinTargets.push(sunBall);
  } else if (id === 'mjolnir_shard') {
    const runicSteel = trackMat(new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.28, metalness: 0.92 }));
    const leatherMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x5c3c22, roughness: 0.85 }));
    const runeGlow = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.5 })
    );
    addTo(relicBody, trackGeo(new THREE.CylinderGeometry(0.06, 0.075, 0.82, 10)), leatherMat, 0, 0.42, 0);
    addTo(relicBody, trackGeo(new THREE.TorusGeometry(0.08, 0.022, 8, 14)), trimGoldMat, 0, 0.04, 0);
    addTo(relicBody, trackGeo(new THREE.BoxGeometry(0.86, 0.46, 0.48)), runicSteel, 0, 0.94, 0);
    addTo(relicBody, trackGeo(new THREE.BoxGeometry(0.92, 0.14, 0.52)), runeGlow, 0, 0.94, 0);
  } else if (id === 'horn_gjallar') {
    const bronzeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xb08334, roughness: 0.28, metalness: 0.88 }));
    const hornCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.56, 0.24, 0.1),
      new THREE.Vector3(-0.18, 0.22, 0.16),
      new THREE.Vector3(0.28, 0.46, 0),
      new THREE.Vector3(0.56, 0.94, -0.06),
    ]);
    addTo(relicBody, trackGeo(new THREE.TubeGeometry(hornCurve, 22, 0.14, 12, false)), pal.ivory);
    addTo(relicBody, trackGeo(new THREE.ConeGeometry(0.28, 0.34, 14, 1, true)), bronzeMat, 0.58, 0.98, -0.06, 0.2, 0, -0.5);
    addTo(relicBody, trackGeo(new THREE.TorusGeometry(0.16, 0.032, 8, 18)), bronzeMat, 0.24, 0.44, 0.02, 0.6, 0.8, 0);
  } else {
    // orichalcum_astrolabe
    const orichalcumMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xe69f3a, roughness: 0.2, metalness: 0.94 }));
    const ringA = addTo(relicBody, trackGeo(new THREE.TorusGeometry(0.68, 0.045, 10, 36)), orichalcumMat, 0, 0.76, 0, 0.5, 0, 0);
    const ringB = addTo(relicBody, trackGeo(new THREE.TorusGeometry(0.52, 0.04, 10, 32)), orichalcumMat, 0, 0.76, 0, 0, 0.7, 0.4);
    const ringC = addTo(relicBody, trackGeo(new THREE.TorusGeometry(0.36, 0.035, 10, 28)), trimGoldMat, 0, 0.76, 0, 0.9, 0.2, 0.8);
    const core = addTo(relicBody, trackGeo(new THREE.OctahedronGeometry(0.2, 0)), pal.crystalGlow, 0, 0.76, 0);
    extraSpinTargets.push(ringA, ringB, ringC, core);
  }

  const animate = (t: number, dt: number, auraActive: boolean) => {
    auraGroup.visible = auraActive;
    auraLight.intensity = auraActive ? 1.8 + Math.sin(t * 3.4) * 0.45 : 0;

    if (auraActive) {
      relicBody.position.y = 0.62 + Math.sin(t * 2.1) * 0.065;
      orbitRing.rotation.y += dt * 0.9;
      orbitRing.rotation.x = 0.45 + Math.sin(t * 1.3) * 0.15;
      haloRing.rotation.z -= dt * 0.5;
      for (let i = 0; i < extraSpinTargets.length; i++) {
        extraSpinTargets[i].rotation.y += dt * (1.2 + i * 0.35);
        extraSpinTargets[i].rotation.x += dt * (i % 2 === 0 ? 0.5 : -0.4);
      }
    } else {
      relicBody.position.y = 0.58;
    }
  };

  return {
    group: root,
    animate,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}
