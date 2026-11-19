import type { PantheonId } from "../types";

export interface CulturalVoiceEntry {
  phrase: string;
  pt: string;
  spoken: string;
  syllables: number[];
  audioUrl?: string;
}

export interface CultureVoiceProfile {
  cultureLabel: string;
  basePitch: number;
  formantF1: number;
  formantF2: number;
  hornPitch: number;
  select: CulturalVoiceEntry[];
  attack: CulturalVoiceEntry[];
  move: CulturalVoiceEntry[];
  work: CulturalVoiceEntry[];
}

export const CULTURE_VOICE_BANK: Record<PantheonId, CultureVoiceProfile> = {
  greek: {
    cultureLabel: 'Helenos (Grego Antigo)',
    basePitch: 128,
    formantF1: 520,
    formantF2: 1480,
    hornPitch: 293.66,
    select: [
      { phrase: 'Próstagma?', pt: 'Ordens? Qual é o comando?', spoken: 'Próstagma! Qual é o comando?', syllables: [1.04, 1.16, 0.96] },
      { phrase: 'Lege.', pt: 'Fale, comandante.', spoken: 'Fale, comandante. Estou ouvindo.', syllables: [0.98, 1.15] },
      { phrase: 'Étimos.', pt: 'Pronto para servir.', spoken: 'Pronto para servir, senhor!', syllables: [1.12, 1.0, 0.95] },
      { phrase: 'Né.', pt: 'Sim, às suas ordens.', spoken: 'Sim! Às suas ordens.', syllables: [1.14] },
    ],
    attack: [
      { phrase: 'Eis máchin!', pt: 'Para a batalha!', spoken: 'Para a batalha! Avançar!', syllables: [1.06, 1.26, 1.18] },
      { phrase: 'Eisvolí!', pt: 'Invasão! Pela glória do Olimpo!', spoken: 'Pela glória do Olimpo, ataquem!', syllables: [1.05, 1.18, 1.34] },
      { phrase: 'Páme!', pt: 'Vamos! Derrubem os inimigos!', spoken: 'Vamos! Derrubem os inimigos!', syllables: [1.22, 1.08] },
      { phrase: 'Próseche!', pt: 'Formação de combate!', spoken: 'Formação de combate! Sem recuar!', syllables: [1.16, 1.04, 1.14] },
    ],
    move: [
      { phrase: 'Vúlome.', pt: 'Vou fazê-lo agora.', spoken: 'Sim, senhor! Em marcha.', syllables: [1.08, 0.98, 1.05] },
      { phrase: 'Málista.', pt: 'Certamente, avançando.', spoken: 'Certamente! Avançando agora.', syllables: [1.12, 1.02, 0.94] },
      { phrase: 'Orthós.', pt: 'Entendido, a caminho.', spoken: 'Entendido! Seguindo posição.', syllables: [0.98, 1.14] },
      { phrase: 'Kalós.', pt: 'De acordo, partindo.', spoken: 'De acordo! Partindo já.', syllables: [1.0, 1.1] },
      { phrase: 'Páme!', pt: 'Vamos! Em frente!', spoken: 'Em frente! Sem demora.', syllables: [1.16, 1.02] },
    ],
    work: [
      { phrase: 'Vúlome.', pt: 'Ao trabalho imediatamente.', spoken: 'Ao trabalho imediatamente!', syllables: [1.04, 0.98, 1.0] },
      { phrase: 'Málista.', pt: 'Certamente, colhendo recursos.', spoken: 'Certamente! Colhendo recursos.', syllables: [1.08, 1.0, 0.94] },
      { phrase: 'Kalós.', pt: 'Construindo pela cidade.', spoken: 'Construindo pela nossa cidade.', syllables: [0.98, 1.08] },
      { phrase: 'Orthós.', pt: 'Tarefa iniciada.', spoken: 'Tarefa iniciada, senhor.', syllables: [0.96, 1.08] },
    ],
  },
  egyptian: {
    cultureLabel: 'Kemet (Egípcio)',
    basePitch: 124,
    formantF1: 480,
    formantF2: 1350,
    hornPitch: 277.18,
    select: [
      { phrase: 'Iu-airu?', pt: 'O que ordenas, Faraó?', spoken: 'O que ordenas, Faraó?', syllables: [0.96, 1.08, 1.14] },
      { phrase: 'Ha-nefer!', pt: 'Pronto para servir Kemet!', spoken: 'Pronto para servir o Egito!', syllables: [1.04, 0.98, 1.06] },
      { phrase: 'Em-shere?', pt: 'Suas ordens, senhor?', spoken: 'Quais são suas ordens?', syllables: [0.95, 1.1, 1.02] },
    ],
    attack: [
      { phrase: 'Khepresh!', pt: 'Por Rá, ataquem!', spoken: 'Por Rá, ataquem agora!', syllables: [1.12, 1.26] },
      { phrase: 'Sema-tawy!', pt: 'Esmaguem os invasores!', spoken: 'Esmaguem os invasores do Nilo!', syllables: [1.04, 1.15, 1.28] },
      { phrase: 'Ankh-ef-en-Sekhmet!', pt: 'Pela fúria de Sekhmet!', spoken: 'Pela fúria de Sekhmet, avançar!', syllables: [1.08, 1.2, 1.34] },
    ],
    move: [
      { phrase: 'Sechem!', pt: 'Marchando com poder!', spoken: 'Marchando sob o sol!', syllables: [1.02, 1.08] },
      { phrase: 'Djew!', pt: 'Avançando pelo deserto!', spoken: 'Avançando pelo deserto!', syllables: [1.06, 0.96] },
    ],
    work: [
      { phrase: 'Baku!', pt: 'Colhendo para o Nilo!', spoken: 'Colhendo riquezas para o Nilo!', syllables: [0.98, 1.04] },
      { phrase: 'Kheper!', pt: 'Construindo para a eternidade!', spoken: 'Construindo para a eternidade!', syllables: [1.0, 1.08] },
    ],
  },
  norse: {
    cultureLabel: 'Midgard (Nórdico)',
    basePitch: 112,
    formantF1: 430,
    formantF2: 1180,
    hornPitch: 220.0,
    select: [
      { phrase: 'Hvað?', pt: 'O que queres, Jarl?', spoken: 'O que ordena, Jarl?', syllables: [1.08] },
      { phrase: 'Já?', pt: 'Sim, comandante?', spoken: 'Sim! Diga sua ordem.', syllables: [0.96, 1.12] },
      { phrase: 'Tilbúinn!', pt: 'Pronto para a luta!', spoken: 'Pronto para a batalha!', syllables: [1.04, 0.96, 1.08] },
    ],
    attack: [
      { phrase: 'Til bardaga!', pt: 'Para a batalha!', spoken: 'Para a batalha! Sem piedade!', syllables: [1.05, 1.18, 1.3, 1.24] },
      { phrase: 'Drepum þá!', pt: 'Por Odin, abatam todos!', spoken: 'Por Odin, abatam todos eles!', syllables: [1.12, 1.26, 1.36] },
      { phrase: 'Valhalla!', pt: 'Por Valhalla!', spoken: 'Por Valhalla! Ataquem!', syllables: [1.06, 1.22, 1.34] },
    ],
    move: [
      { phrase: 'Sammála!', pt: 'De acordo, em marcha!', spoken: 'De acordo! Em marcha!', syllables: [1.02, 1.08, 0.98] },
      { phrase: 'Fram!', pt: 'Avante guerreiros!', spoken: 'Avante, sem hesitar!', syllables: [1.12] },
    ],
    work: [
      { phrase: 'Skipan!', pt: 'Ao trabalho!', spoken: 'Ao trabalho pelo clã!', syllables: [0.98, 1.06] },
      { phrase: 'Smiður!', pt: 'Forjando e colhendo!', spoken: 'Forjando e colhendo recursos!', syllables: [1.02, 0.94] },
    ],
  },
  atlantean: {
    cultureLabel: 'Atlântida (Atlante)',
    basePitch: 136,
    formantF1: 540,
    formantF2: 1560,
    hornPitch: 329.63,
    select: [
      { phrase: 'Yuji?', pt: 'Ordens, comandante?', spoken: 'Quais são as ordens, comandante?', syllables: [1.04, 1.16] },
      { phrase: 'Volat?', pt: 'Pronto por Atlântida.', spoken: 'Pronto por Atlântida!', syllables: [1.02, 1.14] },
    ],
    attack: [
      { phrase: 'Mache!', pt: 'Para a batalha por Atlântida!', spoken: 'Por Atlântida, para a batalha!', syllables: [1.22, 1.14] },
      { phrase: 'Scopos!', pt: 'Alvo confirmado — atacar!', spoken: 'Alvo confirmado! Atacar agora!', syllables: [1.06, 1.2, 1.12] },
    ],
    move: [
      { phrase: 'Scopos.', pt: 'Confirmado — avançando.', spoken: 'Confirmado! Avançando para o alvo.', syllables: [1.0, 1.1, 1.02] },
      { phrase: 'Echlost.', pt: 'Ordem reconhecida.', spoken: 'Ordem reconhecida. Em deslocamento.', syllables: [1.08, 0.98] },
    ],
    work: [
      { phrase: 'Echlost.', pt: 'Ordem reconhecida — colhendo.', spoken: 'Ordem reconhecida. Iniciando trabalho.', syllables: [1.04, 0.96] },
      { phrase: 'Scopos.', pt: 'Confirmado — construindo.', spoken: 'Confirmado! Erguendo por Atlântida.', syllables: [0.98, 1.08, 1.0] },
    ],
  },
  chinese: {
    cultureLabel: 'Reino do Meio (Chinês)',
    basePitch: 142,
    formantF1: 560,
    formantF2: 1620,
    hornPitch: 349.23,
    select: [
      { phrase: 'Zài!', pt: 'Presente e pronto!', spoken: 'Presente e pronto para servir!', syllables: [1.14, 0.96] },
      { phrase: 'Qǐng fēnfù?', pt: 'Qual é o seu comando?', spoken: 'Qual é o seu comando, mestre?', syllables: [0.98, 1.1, 1.04] },
    ],
    attack: [
      { phrase: 'Chōngfēng!', pt: 'Carreguem contra o inimigo!', spoken: 'Carreguem contra o inimigo!', syllables: [1.1, 1.28] },
      { phrase: 'Shā!', pt: 'Ataquem sem trégua!', spoken: 'Pela dinastia, ataquem sem trégua!', syllables: [1.34] },
    ],
    move: [
      { phrase: 'Zūn mìng!', pt: 'Obedecendo à ordem!', spoken: 'Obedecendo à sua ordem!', syllables: [1.06, 1.12] },
      { phrase: 'Chūfā!', pt: 'Partindo agora!', spoken: 'Partindo imediatamente!', syllables: [1.02, 1.1] },
    ],
    work: [
      { phrase: 'Láodòng!', pt: 'Trabalhando pela dinastia!', spoken: 'Trabalhando pela dinastia!', syllables: [0.98, 1.06] },
      { phrase: 'Jiànzào!', pt: 'Erguendo e colhendo!', spoken: 'Erguendo e colhendo recursos!', syllables: [1.04, 0.98] },
    ],
  },
  aztec: {
    cultureLabel: 'Império Mexica (Asteca)',
    basePitch: 128,
    formantF1: 510,
    formantF2: 1440,
    hornPitch: 311.13,
    select: [
      { phrase: 'Tlahtoani?', pt: 'Ordens, Grande Orador?', spoken: 'Quais são suas ordens, Grande Orador?', syllables: [1.0, 1.08, 1.16] },
      { phrase: 'Nican!', pt: 'Estou pronto!', spoken: 'Estou pronto para a guerra!', syllables: [1.06, 1.0] },
    ],
    attack: [
      { phrase: 'Yaoyotl!', pt: 'Guerra sagrada pelo Sol!', spoken: 'Guerra sagrada pelo Deus Sol!', syllables: [1.08, 1.2, 1.32] },
      { phrase: 'Huitzilopochtli!', pt: 'Glória ao Deus Sol!', spoken: 'Pela glória do Deus Sol, ataquem!', syllables: [1.04, 1.14, 1.24, 1.35] },
    ],
    move: [
      { phrase: 'Ohtli!', pt: 'Seguindo o caminho!', spoken: 'Seguindo o caminho agora!', syllables: [1.04, 1.08] },
      { phrase: 'Nemi!', pt: 'Avançando!', spoken: 'Avançando sem demora!', syllables: [1.02, 0.98] },
    ],
    work: [
      { phrase: 'Tequitl!', pt: 'Trabalhando no tributo!', spoken: 'Trabalhando pelo império!', syllables: [0.98, 1.06] },
      { phrase: 'Calli!', pt: 'Construindo para Tenochtitlán!', spoken: 'Construindo para Tenochtitlán!', syllables: [1.02, 1.0] },
    ],
  },
  roman: {
    cultureLabel: 'Senado e Povo (Romano)',
    basePitch: 122,
    formantF1: 490,
    formantF2: 1410,
    hornPitch: 293.66,
    select: [
      { phrase: 'Imperium?', pt: 'Qual é o comando, Legatus?', spoken: 'Qual é o comando, Legatus?', syllables: [1.0, 1.08, 1.14] },
      { phrase: 'Paratus!', pt: 'Pronto pela Legião!', spoken: 'Pronto pela Legião Romana!', syllables: [1.04, 1.1, 0.98] },
    ],
    attack: [
      { phrase: 'Ad arma!', pt: 'Às armas, legionários!', spoken: 'Às armas, legionários! Avançar!', syllables: [1.06, 1.22, 1.32] },
      { phrase: 'Pro Roma!', pt: 'Pela glória de Roma, ataquem!', spoken: 'Pela glória de Roma, ataquem!', syllables: [1.08, 1.24, 1.3] },
    ],
    move: [
      { phrase: 'Procedite!', pt: 'Marchem em formação!', spoken: 'Marchando em formação!', syllables: [1.02, 1.08, 1.0] },
      { phrase: 'Celeriter!', pt: 'Com rapidez!', spoken: 'Avançando com rapidez!', syllables: [1.06, 1.02, 1.1] },
    ],
    work: [
      { phrase: 'Laboramus!', pt: 'Trabalhando pelo Império!', spoken: 'Trabalhando pelo Império!', syllables: [0.98, 1.04, 1.0] },
      { phrase: 'Aedifica!', pt: 'Construindo obra romana!', spoken: 'Construindo pela glória de Roma!', syllables: [1.02, 1.08, 0.96] },
    ],
  },
  japanese: {
    cultureLabel: 'Takamagahara (Japonês)',
    basePitch: 130,
    formantF1: 500,
    formantF2: 1500,
    hornPitch: 329.63,
    select: [
      { phrase: 'Gomeirei wo?', pt: 'Qual é a sua ordem, Xogum?', spoken: 'Qual é a sua ordem, Xogum?', syllables: [0.98, 1.06, 1.14] },
      { phrase: 'Kakugo!', pt: 'Pronto com honra!', spoken: 'Pronto com honra e disciplina!', syllables: [1.08, 1.02, 0.96] },
    ],
    attack: [
      { phrase: 'Totsugeki!', pt: 'Ataquem com honra!', spoken: 'Ataquem com honra! Em frente!', syllables: [1.06, 1.18, 1.32] },
      { phrase: 'Kirifuse!', pt: 'Derrubem os inimigos!', spoken: 'Derrubem os inimigos sem hesitar!', syllables: [1.1, 1.22, 1.34] },
    ],
    move: [
      { phrase: 'Shōchi!', pt: 'Compreendido, em marcha!', spoken: 'Compreendido! Em marcha.', syllables: [1.04, 1.1] },
      { phrase: 'Susume!', pt: 'Avancem!', spoken: 'Avancem em formação!', syllables: [1.02, 1.08, 1.12] },
    ],
    work: [
      { phrase: 'Fushin!', pt: 'Construindo e colhendo!', spoken: 'Construindo e colhendo recursos!', syllables: [0.98, 1.04] },
      { phrase: 'Tsutome!', pt: 'Cumprindo o dever!', spoken: 'Cumprindo o nosso dever!', syllables: [1.02, 0.98] },
    ],
  },
  eldritch: {
    cultureLabel: 'Abismo Cósmico (Eldritch)',
    basePitch: 92,
    formantF1: 360,
    formantF2: 980,
    hornPitch: 164.81,
    select: [
      { phrase: "Iä! Ph'nglui?", pt: 'O vazio escuta seu chamado.', spoken: 'O vazio escuta o seu chamado.', syllables: [0.92, 1.06, 0.88] },
      { phrase: "R'lyeh!", pt: 'Despertos nas profundezas!', spoken: 'Despertamos das profundezas abissais!', syllables: [1.04, 0.9] },
    ],
    attack: [
      { phrase: 'Fhtagn! Obliterar!', pt: 'Devorar as mentes mortais!', spoken: 'Obliterar e devorar os mortais!', syllables: [1.08, 1.22, 0.94] },
      { phrase: 'Yogg-Sothoth!', pt: 'Pelo caos abissal, destruam!', spoken: 'Pelo caos abissal, destruam tudo!', syllables: [1.02, 1.18, 1.28] },
    ],
    move: [
      { phrase: 'Nyarlath!', pt: 'Deslizando pelas sombras!', spoken: 'Deslizando pelas sombras antigas.', syllables: [0.96, 1.04] },
    ],
    work: [
      { phrase: 'Shoggoth!', pt: 'Canalizando matéria astral!', spoken: 'Canalizando energia astral.', syllables: [0.94, 1.02] },
    ],
  },
  celtic: {
    cultureLabel: 'Tuatha Dé Danann (Celta)',
    basePitch: 126,
    formantF1: 500,
    formantF2: 1460,
    hornPitch: 261.63,
    select: [
      { phrase: 'Cén t-ordú?', pt: 'Qual é o comando dos Druidas?', spoken: 'Qual é o comando dos Druidas?', syllables: [1.0, 1.12, 1.04] },
      { phrase: 'Réidh!', pt: 'Pronto pelo clã!', spoken: 'Pronto para defender o clã!', syllables: [1.1] },
    ],
    attack: [
      { phrase: 'Abú! Chun catha!', pt: 'Vitória! Para a batalha!', spoken: 'Vitória! Para a batalha!', syllables: [1.06, 1.2, 1.32] },
      { phrase: 'Morrígan!', pt: 'Pela fúria de Morrígan!', spoken: 'Pela fúria de Morrígan, ataquem!', syllables: [1.1, 1.24, 1.18] },
    ],
    move: [
      { phrase: 'Ar aghaidh!', pt: 'Avante pelas colinas!', spoken: 'Avante pelas colinas!', syllables: [1.02, 1.1] },
    ],
    work: [
      { phrase: 'Obair!', pt: 'Colhendo nas terras sagradas!', spoken: 'Colhendo nas terras sagradas!', syllables: [0.98, 1.04] },
    ],
  },
  babylonian: {
    cultureLabel: 'Mesopotâmia (Babilônico)',
    basePitch: 120,
    formantF1: 470,
    formantF2: 1320,
    hornPitch: 246.94,
    select: [
      { phrase: 'Amātu?', pt: 'Qual é a palavra real?', spoken: 'Qual é a palavra real?', syllables: [0.98, 1.08, 1.12] },
      { phrase: 'Annû!', pt: 'Pronto na Babilônia!', spoken: 'Pronto pela glória da Babilônia!', syllables: [1.04, 1.0] },
    ],
    attack: [
      { phrase: 'Ina Marduk!', pt: 'Por Marduk, esmaguem-nos!', spoken: 'Por Marduk, esmaguem os inimigos!', syllables: [1.06, 1.18, 1.3] },
      { phrase: 'Qablu!', pt: 'Ao combate!', spoken: 'Ao combate pela Babilônia!', syllables: [1.12, 1.26] },
    ],
    move: [
      { phrase: 'Alāku!', pt: 'Marchando pelo Eufrates!', spoken: 'Marchando pelas margens do Eufrates!', syllables: [1.02, 1.08, 1.0] },
    ],
    work: [
      { phrase: 'Epēšu!', pt: 'Erguendo o zigurate!', spoken: 'Erguendo o grande zigurate!', syllables: [0.98, 1.06, 1.0] },
    ],
  },
  lakota: {
    cultureLabel: 'Grande Planície (Lakota)',
    basePitch: 125,
    formantF1: 495,
    formantF2: 1420,
    hornPitch: 293.66,
    select: [
      { phrase: 'Háu, Itancan?', pt: 'Qual é o caminho, Chefe?', spoken: 'Qual é o caminho, Grande Chefe?', syllables: [1.02, 1.1, 1.06] },
      { phrase: 'Wiyeya!', pt: 'Pronto nas planícies!', spoken: 'Pronto nas grandes planícies!', syllables: [1.06, 1.0, 1.08] },
    ],
    attack: [
      { phrase: 'Hokahey!', pt: 'É um bom dia para lutar!', spoken: 'Hoje é um grande dia para lutar!', syllables: [1.08, 1.2, 1.34] },
      { phrase: 'Wakinyan!', pt: 'Como o Pássaro-Trovão, ataquem!', spoken: 'Como o Pássaro Trovão, ataquem!', syllables: [1.06, 1.18, 1.28] },
    ],
    move: [
      { phrase: 'Iyaya!', pt: 'Cavalgando como o vento!', spoken: 'Cavalgando rápido como o vento!', syllables: [1.04, 1.1, 1.02] },
    ],
    work: [
      { phrase: 'Wóškate!', pt: 'Sustentando a tribo!', spoken: 'Sustentando nossa tribo!', syllables: [0.98, 1.04, 1.0] },
    ],
  },
  jotunn: {
    cultureLabel: 'Jotunheim (Gigantes de Gelo)',
    basePitch: 86,
    formantF1: 340,
    formantF2: 920,
    hornPitch: 146.83,
    select: [
      { phrase: 'Kaldur rymr?', pt: 'A geada aguarda sua ordem.', spoken: 'A geada eterna aguarda sua ordem.', syllables: [0.92, 1.02, 0.96] },
      { phrase: 'Jötunn!', pt: 'Os gigantes despertam!', spoken: 'Os gigantes de gelo despertam!', syllables: [1.04, 0.94] },
    ],
    attack: [
      { phrase: 'Fimbulvetr!', pt: 'Inverno eterno sobre eles!', spoken: 'Inverno eterno sobre nossos inimigos!', syllables: [1.04, 1.16, 1.24] },
      { phrase: 'Brjóta!', pt: 'Estilhacem no gelo!', spoken: 'Estilhacem tudo no gelo!', syllables: [1.12, 1.26] },
    ],
    move: [
      { phrase: 'Ganga!', pt: 'Passos que tremem a terra!', spoken: 'Marchando com passos que tremem a terra.', syllables: [0.98, 0.92] },
    ],
    work: [
      { phrase: 'Hrímpurs!', pt: 'Moldando o gelo primordial!', spoken: 'Moldando o gelo primordial.', syllables: [0.94, 1.0] },
    ],
  },
};
