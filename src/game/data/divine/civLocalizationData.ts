import type { PantheonId, UnitKind } from "../../types";

export interface WonderSpec {
  name: string;
  subtitle: string;
  bonusLabel: string;
}

export const CIV_UNIT_NAMES: Partial<Record<PantheonId, Partial<Record<UnitKind, { name: string; role?: string }>>>> = {
  greek: {
    villager: { name: 'Aldeão Grego' },
    hoplite: {
      name: 'Hoplita',
      role: 'Espinha dorsal do exército grego (T1–T4) — excelente contra cavalaria e fortalecido por Zeus.',
    },
    hipaspist: {
      name: 'Hipaspista',
      role: 'Infantaria leve anti-infantaria (T1–T4) — espada curva Kopis e bônus contra infantaria inimiga.',
    },
    myrmidon: {
      name: 'Mirmidão',
      role: 'Infantaria de elite exclusiva de Zeus (Era Mítica, T1–T4) — ganha velocidade e dano crescentes em combate.',
    },
    peltast: {
      name: 'Peltasta',
      role: 'Atirador leve ágil (T1–T4) — lança dardos e porta escudo Pelta em meia-lua; letal contra infantaria rápida e outros arqueiros.',
    },
    archer: {
      name: 'Toxota (Toxotes)',
      role: 'Arqueiro grego de longo alcance (T1–T4) — arco composto recurvo; forte contra infantaria e unidades míticas fracas.',
    },
    gastraphetes: {
      name: 'Fundibulário (Gastraphetes)',
      role: 'Atirador com besta abdominal grega (T1–T4) — liberado via Deus Menor (Apolo/Ártemis); alto alcance e impacto perfurante.',
    },
    cavalry: {
      name: 'Hippo (Hippikon)',
      role: 'Cavalaria pesada rápida (T1–T4) — excelente contra arqueiros e cerco; realiza ataques de atropelamento (hit-and-run).',
    },
    prodromos: {
      name: 'Pródromo (Prodromos)',
      role: 'Cavalaria leve de lança Kontos (T1–T4) — especialista veloz no combate contra outras unidades de cavalaria.',
    },
    jason: {
      name: 'Jasão',
      role: 'Herói Padrão de Zeus (Era I) — Líder dos Argonautas com Velocino de Ouro; 3.5x vs Míticas e coleta Relíquias.',
    },
    odysseus: {
      name: 'Ulisses (Odysseus)',
      role: 'Herói Arqueiro Grego (Era II) — Arco Ítaco letal à distância contra Unidades Míticas (3.6x vs Míticas).',
    },
    perseus: {
      name: 'Perseu',
      role: 'Herói Grego de Combate (Era III) — Espada curva Harpê e Escudo Espelho da Égide; devastador corpo a corpo (3.8x vs Míticas).',
    },
    bellerophon: {
      name: 'Belerofonte',
      role: 'Herói Montado em Pégaso (Era IV) — Voo veloz de longo alcance de investida aérea contra Míticas (3.6x vs Míticas).',
    },
    hippolyta: {
      name: 'Hipólita',
      role: 'Heroína Amazona Ágil (Era II) — Ataques rápidos à distância com Arco Dourado de Ártemis (3.4x vs Míticas).',
    },
    ajax: {
      name: 'Ajax',
      role: 'Herói Bruto de Salamina — Escudo Torre de 7 Camadas e alta resistência frontal (3.5x vs Míticas).',
    },
    theseus: {
      name: 'Teseu',
      role: 'Herói Tático de Atenas (Era II) — Lança Dory equilibrada e Escudo Hoplon contra monstros míticos (3.4x vs Míticas).',
    },
    hero: {
      name: 'Herói Héracles',
      role: 'Campeão Olímpico que causa 3x de dano contra Unidades Míticas.',
    },
    ram: {
      name: 'Aríete (Kriós)',
      role: 'Unidade mecânica de cerco blindada — teto reforçado e cabeça de aríete em bronze para derrubar muralhas e edifícios.',
    },
    siege: {
      name: 'Catapulta (Helepolis)',
      role: 'Máquina de cerco à distância de alta potência contra construções e exércitos agrupados (impacto em área).',
    },
    minotaur: {
      name: 'Minotauro',
      role: 'Monstro de Creta (Atena/Ares) — Chifradas brutais e machado Labrys com impacto em área.',
    },
    centaur: {
      name: 'Centauro',
      role: 'Arqueiro Mítico Veloz (Hermes) — Dispara flechas precisas em movimento.',
    },
    cyclops: {
      name: 'Ciclope',
      role: 'Unidade Mítica Exclusiva de Zeus (Templo) — Dano massivo em área; agarra humanos e os arremessa longe!',
    },
    manticore: {
      name: 'Mantícora',
      role: 'Fera Alada (Apolo/Ártemis) — Lança rajadas de espinhos venenosos em área.',
    },
    medusa: {
      name: 'Medusa',
      role: 'Górgona (Hera/Ártemis) — Flechas petrificantes que congelam inimigos temporariamente.',
    },
    hydra: {
      name: 'Hidra',
      role: 'Serpente Policéfala (Dionísio) — Regeneração contínua e fúria crescente em combate.',
    },
    colossus: {
      name: 'Colosso',
      role: 'Gigante de Bronze (Hefesto) — Armadura titânica, autorreparo e esmagamento de edifícios.',
    },
    nymph: {
      name: 'Ninfa (Dríade)',
      role: 'Espírito da Natureza (Atena/Afrodite) — Ágil com ataque mágico à média distância.',
    },
    pegasus: {
      name: 'Pégaso',
      role: 'Corcel Alado (Hermes) — Batedor voador extremamente veloz com campo de visão ampliado.',
    },
    satyr: {
      name: 'Sátiro',
      role: 'Escaramuçador Silvestre (Dionísio) — Arremessa dardos rápidos com bônus anti-infantaria.',
    },
    automaton: {
      name: 'Autômato',
      role: 'Constructo Mecânico (Hefesto) — Guerreiro de bronze articulado com autorreparo contínuo.',
    },
    iron_dwarf: {
      name: 'Anão de Ferro',
      role: 'Ferreiro Blindado (Hefesto) — Martelo pesado letal contra construções inimigas.',
    },
    phoenix: {
      name: 'Fênix',
      role: 'Ave Imortal de Fogo (Apolo) — Orbes flamejantes com dano em área sobre tropas e estruturas.',
    },
    titan: { name: 'Titã Olímpico' },
    zeus: {
      name: 'Zeus — Rei do Olimpo',
      role: 'Deus Maior (Era V) — Maior entidade do campo de batalha; tempestades de raios supremos em área.',
    },
    poseidon: {
      name: 'Poseidon — Senhor dos Mares',
      role: 'Deus Maior (Era V) — Maior entidade dos oceanos; maremotos e ondas sísmicas com tridente.',
    },
    hades: {
      name: 'Hades — Soberano do Submundo',
      role: 'Deus Maior (Era V) — Maior entidade do Tártaro; chamas espectrais e vórtices necróticos.',
    },
    atena: {
      name: 'Atena — Deusa da Sabedoria',
      role: 'Deusa Menor (Era V) — Maior que os Titãs; lança e Égide sagrada devastadora.',
    },
    ares: {
      name: 'Ares — Deus da Guerra',
      role: 'Deus Menor (Era V) — Maior que os Titãs; golpes sísmicos de guerra total.',
    },
    hermes: {
      name: 'Hermes — Mensageiro Alado',
      role: 'Deus Menor (Era V) — Maior que os Titãs; velocidade divina e relâmpagos em área.',
    },
    apolo: {
      name: 'Apolo — Deus do Sol',
      role: 'Deus Menor (Era V) — Maior que os Titãs; chuva solar de longo alcance.',
    },
    dionisio: {
      name: 'Dionísio — Senhor das Vinhas',
      role: 'Deus Menor (Era V) — Maior que os Titãs; tirso arcano e frenesi mítico.',
    },
    afrodite: {
      name: 'Afrodite — Deusa da Beleza',
      role: 'Deus Menor (Era V) — Maior que os Titãs; magia encantadora em área.',
    },
    hefesto: {
      name: 'Hefesto — Deus da Forja',
      role: 'Deus Menor (Era V) — Maior que os Titãs; martelo vulcânico contra cidades e exércitos.',
    },
    artemis: {
      name: 'Ártemis — Deusa da Caça',
      role: 'Deus Menor (Era V) — Maior que os Titãs; flechas lunares sísmicas de longo alcance.',
    },
    fishing_ship: { name: 'Barco Pesqueiro Grego' },
    war_trireme: { name: 'Trirreme Helênico' },
  },
  egyptian: {
    villager: {
      name: 'Trabalhador',
      role: 'Unidade civil do Egito — coleta alimentos, madeira e ouro e ergue construções do império.',
    },
    priest: {
      name: 'Sacerdote',
      role: 'Herói do Templo/Centro — cura tropas aliadas próximas, coleta relíquias e causa 3.2x contra Míticas.',
    },
    pharaoh: {
      name: 'Faraó',
      role: 'Herói Único Gratuito — empodera construções (+35% velocidade de produção), coleta relíquias e destrói Míticas (3.6x).',
    },
    son_of_osiris: {
      name: 'Filho de Osíris',
      role: 'Semideus de Osíris (Era IV) — dispara relâmpagos sagrados que saltam em cadeia entre múltiplos inimigos!',
    },
    egypt_spearman: {
      name: 'Lanceiro',
      role: 'Infantaria rápida e econômica do Quartel — especialista letal contra cavalaria inimiga.',
    },
    slinger: {
      name: 'Fundeiro',
      role: 'Atirador ágil de baixo custo do Quartel — excelente para eliminar arqueiros à distância.',
    },
    axeman: {
      name: 'Homem-Machado',
      role: 'Infantaria pesada do Quartel com machado épsilon — devastador contra outras tropas de infantaria.',
    },
    chariot_archer: {
      name: 'Arqueiro de Biga',
      role: 'Fortaleza Migdol (Era III) — arqueiro montado muito veloz contra infantaria (Bônus Rá: +15% HP e +12% Velocidade).',
    },
    camel_rider: {
      name: 'Cavaleiro de Camelo',
      role: 'Fortaleza Migdol (Era III) — cavalaria ágil contra arqueiros e montarias (Bônus Rá: +15% HP e +12% Velocidade).',
    },
    war_elephant: {
      name: 'Elefante de Guerra',
      role: 'Fortaleza Migdol (Era III) — colosso blindado de altíssima resistência, esmaga tropas em área e derruba edifícios.',
    },
    siege_tower: {
      name: 'Torre de Cerco',
      role: 'Oficina de Cerco (Era III) — torre blindada demolidora de muralhas e fortalezas inimigas.',
    },
    egypt_catapult: {
      name: 'Catapulta',
      role: 'Oficina de Cerco (Era III) — artilharia solar de longo alcance devastadora contra construções e grupos lentos.',
    },
    sphinx: {
      name: 'Esfinge (Bast)',
      role: 'Templo (Era II) — criatura terrestre veloz com ataque giratório em área letal contra arqueiros e coletores.',
    },
    wadjet: {
      name: 'Wadjet (Ptá)',
      role: 'Templo (Era II) — serpente sagrada gigante que cospe veneno à distância.',
    },
    roc: {
      name: 'Roca (Hator)',
      role: 'Templo (Era III) — pássaro gigante dos desertos capaz de sobrevoar linhas com alta visão e ataque mergulhante.',
    },
    petsuchos: {
      name: 'Petsuchos (Hator)',
      role: 'Templo (Era III) — crocodilo sagrado que dispara um raio solar concentrado de longo alcance.',
    },
    scarab: {
      name: 'Escaravelho (Sekhmet)',
      role: 'Templo (Era III) — besouro gigante blindado demolidor de edifícios que explode em área ao morrer!',
    },
    avenger: {
      name: 'Vingador (Hórus)',
      role: 'Templo (Era IV) — guerreiro de elite com cabeça de falcão e giro duplo de khopeshes em área.',
    },
    mummy: {
      name: 'Múmia (Osíris)',
      role: 'Templo (Era IV) — conjurador amaldiçoado à distância que abate inimigos com maldições do Duat.',
    },
    ra: {
      name: 'Rá — Avatar Solar Supremo',
      role: 'Deus Maior do Egito (Era V) — Rei do Sol; lança raios solares devastadores em área.',
    },
    isis: {
      name: 'Ísis — Soberana do Nilo',
      role: 'Deusa Maior do Egito (Era V) — Senhora da Magia e da Vida.',
    },
    set: {
      name: 'Set — Senhor das Tempestades',
      role: 'Deus Maior do Egito (Era V) — Deus do Caos e das Tempestades de Areia.',
    },
    titan: {
      name: 'Titã Solar de Hórus',
      role: 'Colosso de ouro e granito de Hórus-Rá invocado pelo Portão do Titã (Era V).',
    },
    fishing_ship: { name: 'Barco Pesqueiro do Nilo' },
    war_trireme: { name: 'Barco de Guerra Kebent' },
  },
  norse: {
    villager: {
      name: 'Coletor Nórdico',
      role: 'Coleta alimento, madeira e ouro e cultiva fazendas. Nos Nórdicos, a infantaria constrói os edifícios.',
    },
    norse_dwarf: {
      name: 'Anão Minerador',
      role: 'Forjador anão de Nidavellir treinado no Centro da Cidade. Coleta Ouro muito mais rápido que coletores comuns.',
    },
    ox_cart: {
      name: 'Carro de Bois',
      role: 'Depósito móvel de recursos dos Nórdicos. Acompanha coletores e anões até florestas, caças e minas de ouro.',
    },
    hersir: {
      name: 'Hersir',
      role: 'Herói guerreiro nórdico que gera Favor em combate e derrota criaturas míticas.',
    },
    godi: {
      name: 'Godi',
      role: 'Sacerdote-herói nórdico de longo alcance (Retold). Arremessa lanças rúnicas contra unidades míticas terrestres e voadoras.',
    },
    ulfsark: {
      name: 'Ulfsark (Berserk)',
      role: 'Infantaria rápida de dupla lâmina que constrói todos os edifícios militares e econômicos nórdicos.',
    },
    throwing_axeman: {
      name: 'Lançador de Machado',
      role: 'Infantaria viking que arremessa machados à distância causando dano cortante, letal contra infantaria inimiga.',
    },
    raiding_cavalry: {
      name: 'Cavaleiro de Incursão',
      role: 'Cavalaria rápida nórdica excelente para flanquear arqueiros, trabalhadores e armas de cerco.',
    },
    huskarl: {
      name: 'Huskarl',
      role: 'Infantaria de elite do Forte da Colina com escudo pesado e altíssima armadura contra flechas.',
    },
    jarl: {
      name: 'Jarl',
      role: 'Cavalaria pesada nobre do Forte da Colina com grande vida e bônus de ataque contra unidades míticas.',
    },
    portable_ram: {
      name: 'Aríete Portátil',
      role: 'Aríete viking carregado por guerreiros para demolir muralhas, torres e fortalezas rapidamente.',
    },
    norse_ballista: {
      name: 'Balista Nórdica',
      role: 'Artilharia pesada de longo alcance que dispara virotes gigantes contra tropas e edificações.',
    },
    troll: {
      name: 'Troll (Forseti)',
      role: 'Criatura mítica das cavernas que arremessa pedregulhos à distância e regenera ferimentos.',
    },
    valkyrie: {
      name: 'Valquíria (Freyja)',
      role: 'Guerreira celestial montada em corcel branco que luta na linha de frente e cura tropas aliadas.',
    },
    einherjar: {
      name: 'Einherjar (Heimdall)',
      role: 'Guerreiro imortal de Valhalla com machado colossal que sopra sua trompa para inspirar o exército.',
    },
    frost_giant: {
      name: 'Gigante de Gelo (Skadi / Hel)',
      role: 'Colosso de Niflheim que congela inimigos com seu sopro glacial e esmaga tropas.',
    },
    mountain_giant: {
      name: 'Gigante da Montanha (Njord / Hel)',
      role: 'Gigante de pedra viva armado com um tronco de pinheiro colossal para pulverizar construções.',
    },
    battle_boar: {
      name: 'Javali de Batalha (Bragi)',
      role: 'Gullinbursti — javali mecânico forjado em ouro e bronze que arremessa soldados pelos ares.',
    },
    kraken: {
      name: 'Kraken (Njord)',
      role: 'Monstro abissal tentacular que afunda navios instantaneamente e esmaga tropas costeiras.',
    },
    rock_troll: {
      name: 'Troll da Rocha (Aegir - Freyr)',
      role: 'Criatura blindada de granito e cristais rúnicos que bloqueia ataques e resiste muito bem a projéteis.',
    },
    fire_giant: {
      name: 'Gigante de Fogo (Baldr / Hel)',
      role: 'Gigante de Muspelheim armado com espada flamejante que dispara bolas de fogo devastadoras em área.',
    },
    fenris_wolf: {
      name: 'Cria de Fenris (Tyr)',
      role: 'Lobo monstruoso acorrentado com Gleipnir que ganha ataque e velocidade em matilha.',
    },
    nidhogg: {
      name: 'Nidhogg (Hel)',
      role: 'Dragão alado primordial que cospe fogo devastador sobre exércitos e bases.',
    },
    jormungand: {
      name: 'Prole de Jormungand (Njord / Hel)',
      role: 'Serpente marinha colosal que dispara jatos de ácido corrosivo contra navios e unidades costeiras.',
    },
    fafnir: {
      name: 'Fafnir (Vidar - Freyr)',
      role: 'Dragão terrestre encouraçado em ouro amaldiçoado que cospe fogo e emana névoa tóxica venenosa.',
    },
    hoplite: { name: 'Ulfsark' },
    archer: { name: 'Lançador de Machado' },
    cavalry: { name: 'Cavaleiro de Incursão' },
    hero: { name: 'Hersir' },
    siege: { name: 'Balista Nórdica' },
    minotaur: { name: 'Troll' },
    centaur: { name: 'Valquíria' },
    cyclops: { name: 'Gigante de Gelo' },
    titan: {
      name: 'Titã Ymir — Gigante de Gelo Primordial',
      role: 'O colossal Ymir, o gigante de gelo primordial armado com um machado de gelo colossal, invocado após pesquisar o Segredo dos Titãs.',
    },
    fishing_ship: { name: 'Barco Pesqueiro Nórdico' },
    war_trireme: { name: 'Dracar (Longboat)' },
  },
  atlantean: {
    citizen: {
      name: 'Cidadão Atlante',
      role: 'Aldeão atlante de elite — coleta muito mais rápido e deposita recursos automaticamente sem precisar voltar a depósitos. Pode ser promovido a Herói.',
    },
    oracle: {
      name: 'Oráculo',
      role: 'Batedor atlante — ganha grande linha de visão (+10) e gera Favor passivamente quando parado. Pode ser promovido a Herói para lutar contra míticas.',
    },
    llama_caravan: {
      name: 'Caravana de Lhama',
      role: 'Unidade comercial do Mercado — percorre rotas automáticas entre seu Mercado e a Cidadela gerando Ouro contínuo.',
    },
    murmillo: {
      name: 'Murmillo',
      role: 'Quartel Militar (Clássica) — infantaria padrão corpo a corpo resistente e versátil. Pode ser promovido a Herói.',
    },
    katapeltes: {
      name: 'Katapeltes',
      role: 'Contra-Quartel (Clássica) — lanceiro especializado em destruir cavalaria inimiga (2.25x). Pode ser promovido a Herói.',
    },
    turma: {
      name: 'Turma',
      role: 'Contra-Quartel (Clássica) — cavalaria à distância veloz que arremessa dardos letais contra arqueiros (1.8x). Pode ser promovido a Herói.',
    },
    cheiroballista: {
      name: 'Cheiroballista',
      role: 'Contra-Quartel (Clássica) — arma de cerco leve portátil que dispara virotes precisos letais contra infantaria (2.0x).',
    },
    arcus: {
      name: 'Arcus',
      role: 'Quartel Militar (Heroica) — arqueiro de longo alcance devastador contra infantaria. Pode ser promovido a Herói.',
    },
    contarius: {
      name: 'Contarius',
      role: 'Quartel Militar (Heroica) — cavalaria pesada de lança longa, eficaz contra arqueiros e cerco. Pode ser promovido a Herói.',
    },
    destroyer: {
      name: 'Destruidor',
      role: 'Palácio (Heroica) — infantaria pesadamente blindada com tridente e escudão especializada em derrubar edifícios (2.7x). Pode ser promovido a Herói.',
    },
    fanatic: {
      name: 'Fanático',
      role: 'Palácio (Mítica) — infantaria de elite com espadas duplas letais contra infantaria e cavalaria humanas. Pode ser promovido a Herói.',
    },
    fire_siphon: {
      name: 'Sifão de Fogo',
      role: 'Palácio (Mítica) — arma de cerco de bronze que dispara jatos de fogo líquido devastadores contra edifícios em área.',
    },
    onager: {
      name: 'Onagro',
      role: 'Palácio (Mítica · Retold) — catapulta pesada de longo alcance que arremessa rochas em área contra muralhas e exércitos.',
    },
    promethean: {
      name: 'Prometeico (Prometeu)',
      role: 'Templo (Clássica) — criatura de barro primordial que se divide em duas Proles Prometeicas ao morrer.',
    },
    promethean_offspring: {
      name: 'Prole Prometeica',
      role: 'Fragmento ágil de barro gerado quando um Prometeico é destruído em combate.',
    },
    automaton: {
      name: 'Autômato (Leto)',
      role: 'Templo (Clássica) — guerreiro mecânico de oricalco que se auto-repara continuamente e conserta outros Autômatos próximos.',
    },
    caladria: {
      name: 'Caládria (Oceano)',
      role: 'Templo (Clássica) — ave sagrada voadora que não ataca, mas cura continuamente tropas aliadas próximas.',
    },
    behemoth: {
      name: 'Beemote (Réia)',
      role: 'Templo (Heroica) — fera quadrúpede colossal especializada em demolir construções (3.1x) com regeneração constante.',
    },
    satyr: {
      name: 'Sátiro (Hipérion)',
      role: 'Templo (Heroica) — atirador ágil que dispara rajadas de lanças letais contra infantaria inimiga.',
    },
    stymphalian_bird: {
      name: 'Ave do Estínfalo (Teia)',
      role: 'Templo (Heroica) — ave metálica voadora que dispara penas de bronze afiadas à longa distância.',
    },
    dryad: {
      name: 'Dríade (Teia)',
      role: 'Infantaria mítica ágil invocada a partir da Árvore das Hespérides (Bosques Vivos de Teia/Gaia).',
    },
    hekagigantes: {
      name: 'Hecatônquiro / Centimano (Hélios)',
      role: 'Templo (Mítica) — gigante de múltiplos braços que esmaga exércitos com golpes sísmicos em área.',
    },
    argus: {
      name: 'Argos (Atlas)',
      role: 'Templo (Mítica) — criatura flutuante de múltiplos olhos que dispara rajadas de ácido corrosivo em área letal.',
    },
    lampades: {
      name: 'Lâmpade (Hécate)',
      role: 'Templo (Mítica) — ninfa do submundo que dispara orbes de fogo do caos capazes de atordoar e confundir inimigos.',
    },
    carnivora: {
      name: 'Carnívora (Oceano)',
      role: 'Templo / Poder Divino — planta carnívora monstruosa que devora soldados próximos com suas mandíbulas.',
    },
    tartarian_spawn: {
      name: 'Cria do Tártaro (Hécate)',
      role: 'Templo / Portal do Tártaro — demônio alado infernal com ataques flamejantes ferozes.',
    },
    villager: { name: 'Cidadão Atlante' },
    hoplite: { name: 'Murmillo' },
    archer: { name: 'Arcus' },
    cavalry: { name: 'Contarius' },
    hero: { name: 'Oráculo Herói' },
    siege: { name: 'Sifão de Fogo' },
    minotaur: { name: 'Autômato' },
    centaur: { name: 'Sátiro' },
    cyclops: { name: 'Beemote' },
    titan: {
      name: 'Titã Atlante',
      role: 'Unidade colossal invocada pelo Portão do Titã na Idade Mítica (Cronos, Urano ou Gaia).',
    },
    fishing_ship: { name: 'Barco Pesqueiro de Oricalco' },
    war_trireme: { name: 'Birreme Atlante' },
  },
  chinese: {
    chinese_peasant: { name: 'Camponês Chinês' },
    kuafu: { name: 'Kuafu Gigante' },
    halberdier: { name: 'Alabardeiro Imperial' },
    chu_ko_nu: { name: 'Bestadeiro Chu-Ko-Nu' },
    tiger_cavalry: { name: 'Cavalaria Tigre' },
    fire_lance: { name: 'Lança-Fogo Imperial' },
    nezha: { name: 'Nezha — Príncipe do Lótus' },
    jiang_ziya: { name: 'Jiang Ziya — Sábio Imortal' },
    qilin: { name: 'Qilin Sagrado' },
    taotie: { name: 'Taotie Devorador' },
    yazi: { name: 'Yazi — Filho do Dragão' },
    azure_dragon: { name: 'Dragão Azul (Qinglong)' },
    villager: { name: 'Camponês Chinês' },
    hoplite: { name: 'Alabardeiro Imperial' },
    archer: { name: 'Bestadeiro Chu-Ko-Nu' },
    cavalry: { name: 'Cavalaria Tigre' },
    hero: { name: 'Jiang Ziya' },
    siege: { name: 'Lança-Fogo Imperial' },
    minotaur: { name: 'Qilin Sagrado' },
    centaur: { name: 'Yazi' },
    cyclops: { name: 'Taotie Devorador' },
    titan: { name: 'Dragão Titã Imperial' },
    fishing_ship: { name: 'Junco Pesqueiro Chinês' },
    war_trireme: { name: 'Junco de Guerra Imperial' },
    transport_ship: { name: 'Junco de Transporte' },
  },
  aztec: {
    villager: { name: 'Macehualtin' },
    hoplite: { name: 'Guerreiro Jaguar' },
    archer: { name: 'Atirador Atl-Atl' },
    cavalry: { name: 'Corredor Coiote' },
    hero: { name: 'Sacerdote Solar' },
    siege: { name: 'Catapulta de Obsidiana' },
    minotaur: { name: 'Ahuizotl' },
    centaur: { name: 'Camazotz' },
    cyclops: { name: 'Cipactli' },
    titan: { name: 'Quetzal Titã' },
  },
  roman: {
    villager: { name: 'Plebeu Romano' },
    hoplite: { name: 'Legionário' },
    archer: { name: 'Sagitário' },
    cavalry: { name: 'Eques Romano' },
    hero: { name: 'Centurião' },
    siege: { name: 'Onagro Romano' },
    minotaur: { name: 'Fauno' },
    centaur: { name: 'Águia Solar' },
    cyclops: { name: 'Golem de Mármore' },
    titan: { name: 'Titã Imperial' },
  },
  japanese: {
    villager: { name: 'Aldeão Nipônico' },
    hoplite: { name: 'Samurai Ashigaru' },
    archer: { name: 'Arqueiro Yumi' },
    cavalry: { name: 'Cavaleiro Samurai' },
    hero: { name: 'Mestre Onmyoji' },
    siege: { name: 'Trabuco Oni' },
    minotaur: { name: 'Oni' },
    centaur: { name: 'Tengu' },
    cyclops: { name: 'Gashadokuro' },
    titan: { name: 'Yamata Titã' },
  },
  eldritch: {
    villager: { name: 'Cultista' },
    hoplite: { name: 'Guardião Abissal' },
    archer: { name: 'Lançador do Vazio' },
    cavalry: { name: 'Caçador Dimensional' },
    hero: { name: 'Profeta Cósmico' },
    siege: { name: 'Monólito Bélico' },
    minotaur: { name: 'Deep One' },
    centaur: { name: 'Mi-Go' },
    cyclops: { name: 'Shoggoth' },
    titan: { name: 'Avatar de Cthulhu' },
  },
  celtic: {
    villager: { name: 'Camponês Celta' },
    hoplite: { name: 'Espadachim Gaélico' },
    archer: { name: 'Arqueiro dos Bosques' },
    cavalry: { name: 'Biga Celta' },
    hero: { name: 'Druida Campeão' },
    siege: { name: 'Aríete de Carvalho' },
    minotaur: { name: 'Pooka' },
    centaur: { name: 'Fomori' },
    cyclops: { name: 'Colosso de Pedra' },
    titan: { name: 'Titã de Cernunnos' },
  },
  babylonian: {
    villager: { name: 'Súdito da Babilônia' },
    hoplite: { name: 'Guarda Real' },
    archer: { name: 'Arqueiro Assírio' },
    cavalry: { name: 'Biga de Bronze' },
    hero: { name: 'Herói Gilgamesh' },
    siege: { name: 'Torre de Assalto' },
    minotaur: { name: 'Lamassu' },
    centaur: { name: 'Mushussu' },
    cyclops: { name: 'Colosso de Lápis' },
    titan: { name: 'Titã de Tiamat' },
  },
  lakota: {
    villager: { name: 'Coletor Lakota' },
    hoplite: { name: 'Lanceiro Tokala' },
    archer: { name: 'Arqueiro das Planícies' },
    cavalry: { name: 'Cavaleiro Mustang' },
    hero: { name: 'Chefe Guerreiro' },
    siege: { name: 'Quebra-Forte' },
    minotaur: { name: 'Unktehila' },
    centaur: { name: 'Pássaro Trovão' },
    cyclops: { name: 'Espírito Bisão' },
    titan: { name: 'Titã Wakinyan' },
  },
  jotunn: {
    villager: { name: 'Servo de Jotunheim' },
    hoplite: { name: 'Guerreiro Glacial' },
    archer: { name: 'Atirador de Gelo' },
    cavalry: { name: 'Montador de Lobo' },
    hero: { name: 'Campeão Rúnico' },
    siege: { name: 'Arremessador Glacial' },
    minotaur: { name: 'Troll das Neves' },
    centaur: { name: 'Hrimthurs' },
    cyclops: { name: 'Gigante de Muspel' },
    titan: { name: 'Titã Surtr' },
  },
};


export const WONDER_BY_GOD: Record<string, WonderSpec> = {
  zeus: { name: 'Estátua de Zeus no Olimpo', subtitle: 'Colosso de ouro e marfim consagrado ao Rei dos Deuses', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  poseidon: { name: 'Templo de Poseidon em Súnion', subtitle: 'Santuário marítimo de colunas dóricas sobre o mar', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  hades: { name: 'Necromanteion de Hades', subtitle: 'Mausoléu sombrio de obsidiana e mármore do submundo', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  deméter: { name: 'Santuário de Elêusis (Deméter)', subtitle: 'Grande salão misterioso cercado por colheitas sagradas', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  rá: { name: 'Grande Pirâmide de Gizé (Rá)', subtitle: 'Pirâmide solar de pedra calcária com cume em ouro puro', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  ísis: { name: 'Templo de Filas (Ísis)', subtitle: 'Complexo sagrado de obeliscos e pilares de lótus de Ísis', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  set: { name: 'Monumento da Tempestade (Set)', subtitle: 'Pirâmide negra de Set entre areias e relâmpagos', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  odin: { name: 'Salão Dourado de Valhalla (Odin)', subtitle: 'Templo monumental de escudos dourados e troncos de Yggdrasil', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  thor: { name: 'Grande Forja de Mjölnir (Thor)', subtitle: 'Pedestal titânico com o martelo de Thor incandescente', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  loki: { name: 'Árvore de Yggdrasil Sombria (Loki)', subtitle: 'Monólito rúnico envolto em runas ardentes de ilusão', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  freyr: { name: 'Grande Bosque de Alfheim (Freyr)', subtitle: 'Santuário de luz dourada e runas de prosperidade', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  cronos: { name: 'Torre do Tempo de Cronos', subtitle: 'Zigurates concêntricos de oricalco com anel temporal suspenso', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  urano: { name: 'Observatório Celestial de Urano', subtitle: 'Cúpula estelar flutuante com prismas de energia cósmica', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  gaia: { name: 'Árvore-Mãe de Atlântida (Gaia)', subtitle: 'Palácio cristalino entrelaçado com raízes vivas sagradas', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  'fu xi': { name: 'Grande Pagode Imperial (Fu Xi)', subtitle: 'Torre sagrada de nove níveis em jade, laca escarlate e ouro imperial', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  'nü wa': { name: 'Pilar Celestial de Nü Wa', subtitle: 'Pagode monumental de jade vivo que sustenta o firmamento', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
  shennong: { name: 'Pavilhão da Colheita Eterna (Shennong)', subtitle: 'Santuário imperial dourado cercado por jardins medicinais', bonusLabel: '+3.5 Favor/s · Recarga Divina -20% · +20% Míticos' },
};

