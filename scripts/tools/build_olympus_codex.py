#!/usr/bin/env python3
# ============================================================================
# build_olympus_codex.py — Compilador do Códice do Olimpo (Age of Mythology: Olympus)
# ============================================================================
import os
import re
import json

HISTORY_DIR = '/sdcard/aom/history2'
FALLBACK_HISTORY_DIR = '/sdcard/aom/history'
OUTPUT_DIR = 'data/codex'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'olympus_codex_database.json')

# Mapeamento para garantir nomes autorais exclusivos do Olympus (IP Protection)
NAME_REPLACEMENTS = [
    (r'\bAge of Mythology\b', 'Age of Mythology: Olympus'),
    (r'\bArkantos God\b', 'Comandante Telamon Divino'),
    (r'\bArkantosman\b', 'Guerreiro de Telamon'),
    (r'\bAmanra Older\b', 'Guardiã Nefertari Veterana'),
    (r'\bArkantos\b', 'Comandante Telamon'),
    (r'\bAmanra\b', 'Guardiã Nefertari'),
    (r'\bGargarensis\b', 'General Polifemo'),
    (r'\bKamos\b', 'Senhor Minotauro de Creta'),
    (r'\bKemsyt\b', 'Sacerdote das Sombras'),
    (r'\bCastor\b', 'Capitão Castor'),
    (r'\bAjax\b', 'Ájax Telamônio'),
    (r'\bChiron\b', 'Quíron Centauro'),
    (r'\bReginleif\b', 'Valquíria Reginleif'),
    (r'\bThe Titans\b', 'A Ascensão dos Titãs'),
    (r'\bTitan Expansion\b', 'Expansão dos Titãs'),
]

# Deuses conhecidos por panteão
GODS_MAP = {
    'zeus': 'greek', 'poseidon': 'greek', 'hades': 'greek', 'athena': 'greek',
    'ares': 'greek', 'hermes': 'greek', 'apollo': 'greek', 'dionysus': 'greek',
    'aphrodite': 'greek', 'artemis': 'greek', 'hephaestus': 'greek', 'hera': 'greek',
    'ra': 'egyptian', 'isis': 'egyptian', 'set': 'egyptian', 'anubis': 'egyptian',
    'bast': 'egyptian', 'ptah': 'egyptian', 'hathor': 'egyptian', 'osiris': 'egyptian',
    'sekhmet': 'egyptian', 'nephtys': 'egyptian', 'horus': 'egyptian', 'thoth': 'egyptian',
    'thor': 'norse', 'odin': 'norse', 'loki': 'norse', 'freyja': 'norse',
    'heimdall': 'norse', 'forseti': 'norse', 'bragi': 'norse', 'skadi': 'norse',
    'njord': 'norse', 'baldr': 'norse', 'hel': 'norse', 'tyr': 'norse', 'freyr': 'norse',
    'kronos': 'atlantean', 'oranos': 'atlantean', 'gaia': 'atlantean', 'oceanus': 'atlantean',
    'prometheus': 'atlantean', 'lethe': 'atlantean', 'rheia': 'atlantean', 'theia': 'atlantean',
    'hyperion': 'atlantean', 'helios': 'atlantean', 'atlas': 'atlantean', 'hecate': 'atlantean',
    'fuxi': 'chinese', 'nuwa': 'chinese', 'shennong': 'chinese',
}

def clean_text(raw_bytes: bytes) -> str:
    try:
        text = raw_bytes.decode('utf-16')
    except Exception:
        text = raw_bytes.decode('utf-8', errors='ignore')

    # Remove tags como <link="topic:...">texto</link>
    text = re.sub(r'<link=[^>]+>(.*?)</link>', r'\1', text)
    text = re.sub(r'<[^>]+>', '', text)

    for pattern, repl in NAME_REPLACEMENTS:
        text = re.sub(pattern, repl, text)

    return text.strip()

def clean_title(title: str) -> str:
    for pattern, repl in NAME_REPLACEMENTS:
        title = re.sub(pattern, repl, title)
    return title

def parse_metadata_and_lore(text: str) -> tuple[dict, str]:
    metadata = {}
    lines = text.splitlines()
    lore_lines = []
    in_lore = False

    known_meta = {
        'nome científico', 'tamanho', 'dieta', 'idade', 'terra natal',
        'ocupação', 'ataque especial', 'ataque', 'defesa', 'velocidade'
    }

    for line in lines:
        sline = line.strip()
        if not sline:
            if in_lore:
                lore_lines.append(line)
            continue

        if not in_lore and ':' in sline:
            parts = sline.split(':', 1)
            key = parts[0].strip().lower()
            val = parts[1].strip()
            if key in known_meta:
                metadata[key] = val
                continue
        in_lore = True
        lore_lines.append(line)

    lore_text = '\n'.join(lore_lines).strip()
    return metadata, lore_text

def guess_pantheon_and_category(slug: str, title: str, text: str) -> tuple[str, str]:
    slug_l = slug.lower()
    title_l = title.lower()
    text_l = text.lower()

    # Deuses
    for god, p in GODS_MAP.items():
        if god == slug_l or god in title_l:
            return p, 'god'

    # Civilizações
    if slug_l in ['greek', 'egyptian', 'norse', 'atlantean', 'chinese']:
        return slug_l, 'civilization'

    # Panteão heurístico
    pantheon = 'neutral'
    if any(k in text_l or k in title_l for k in ['grego', 'grécia', 'atenas', 'esparta', 'zeus', 'olimpo']):
        pantheon = 'greek'
    elif any(k in text_l or k in title_l for k in ['egípcio', 'egito', 'nilo', 'faraó', 'pirâmide', 'rá', 'osíris']):
        pantheon = 'egyptian'
    elif any(k in text_l or k in title_l for k in ['nórdico', 'viking', 'valhala', 'thor', 'odin', 'jötun']):
        pantheon = 'norse'
    elif any(k in text_l or k in title_l for k in ['atlante', 'atlântida', 'oricalco', 'oranos', 'kronos', 'gaia']):
        pantheon = 'atlantean'
    elif any(k in text_l or k in title_l for k in ['chinês', 'china', 'dragão', 'fuxi', 'nuwa', 'shennong']):
        pantheon = 'chinese'

    # Categoria
    category = 'unit_military'
    if any(k in slug_l for k in ['hero', 'ajax', 'telamon', 'amanra', 'chiron', 'agamemnon', 'odysseus', 'heracles', 'perseus', 'jason', 'bellerophon']):
        category = 'hero'
    elif any(k in text_l for k in ['nome científico', 'dieta', 'criatura mítica', 'monstro', 'mitologia']):
        category = 'unit_myth'
    elif any(k in slug_l for k in ['barracks', 'temple', 'house', 'town center', 'armory', 'wall', 'tower', 'fortress', 'dock', 'market', 'academy']):
        category = 'building'
    elif any(k in slug_l for k in ['favor', 'food', 'gold', 'wood', 'population', 'fog of war', 'stances', 'line of sight', 'black map', 'god powers']):
        category = 'mechanic'

    return pantheon, category

def main():
    hdir = HISTORY_DIR if os.path.exists(HISTORY_DIR) else FALLBACK_HISTORY_DIR
    if not os.path.exists(hdir):
        print(f"Erro: diretório de histórico não encontrado em {hdir}")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Lendo verbetes de {hdir}...")

    codex = {
        'metadata': {
            'title': 'Códice do Olimpo — Enciclopédia & Lore Mitológico',
            'version': '1.0.0',
            'total_entries': 0,
            'project': 'Age of Mythology: Olympus'
        },
        'civilizations': {},
        'gods': {},
        'heroes': {},
        'units_military': {},
        'units_myth': {},
        'buildings': {},
        'techs': {},
        'mechanics': {}
    }

    # 1. Tópicos raiz (Gerais, Civilizações, Mecânicas)
    for fname in os.listdir(hdir):
        if not fname.endswith('.txt'):
            continue
        slug = fname[:-4].replace(' ', '_').lower()
        title = clean_title(fname[:-4].replace('_', ' ').title())
        p = os.path.join(hdir, fname)
        with open(p, 'rb') as fp:
            raw = fp.read()
        full_text = clean_text(raw)
        meta, lore = parse_metadata_and_lore(full_text)
        pantheon, category = guess_pantheon_and_category(slug, title, full_text)

        entry = {
            'id': slug,
            'title': title,
            'pantheon': pantheon,
            'category': category,
            'summary': full_text[:180].replace('\n', ' ') + '...',
            'lore': full_text,
            'metadata': meta
        }

        if category == 'civilization':
            codex['civilizations'][slug] = entry
        elif category == 'god':
            codex['gods'][slug] = entry
        else:
            codex['mechanics'][slug] = entry

    # 2. Unidades e Heróis (units/)
    units_dir = os.path.join(hdir, 'units')
    if os.path.exists(units_dir):
        for fname in os.listdir(units_dir):
            if not fname.endswith('.txt'):
                continue
            slug = fname[:-4].replace(' ', '_').lower()
            title = clean_title(fname[:-4].replace('_', ' ').title())
            p = os.path.join(units_dir, fname)
            with open(p, 'rb') as fp:
                raw = fp.read()
            full_text = clean_text(raw)
            meta, lore = parse_metadata_and_lore(full_text)
            pantheon, category = guess_pantheon_and_category(slug, title, full_text)

            entry = {
                'id': slug,
                'title': title,
                'pantheon': pantheon,
                'category': category,
                'summary': (lore[:180] if lore else full_text[:180]).replace('\n', ' ') + '...',
                'lore': lore if lore else full_text,
                'metadata': meta
            }

            if category == 'god':
                codex['gods'][slug] = entry
            elif category == 'hero':
                codex['heroes'][slug] = entry
            elif category == 'unit_myth':
                codex['units_myth'][slug] = entry
            elif category == 'building':
                codex['buildings'][slug] = entry
            else:
                codex['units_military'][slug] = entry

    # 3. Tecnologias e Melhorias (techs/)
    techs_dir = os.path.join(hdir, 'techs')
    if os.path.exists(techs_dir):
        for fname in os.listdir(techs_dir):
            if not fname.endswith('.txt'):
                continue
            slug = fname[:-4].replace(' ', '_').lower()
            title = clean_title(fname[:-4].replace('_', ' ').title())
            p = os.path.join(techs_dir, fname)
            with open(p, 'rb') as fp:
                raw = fp.read()
            full_text = clean_text(raw)
            meta, lore = parse_metadata_and_lore(full_text)
            pantheon, _ = guess_pantheon_and_category(slug, title, full_text)

            entry = {
                'id': slug,
                'title': title,
                'pantheon': pantheon,
                'category': 'tech',
                'summary': full_text[:180].replace('\n', ' ') + '...',
                'lore': full_text,
                'metadata': meta
            }
            codex['techs'][slug] = entry

    # 4. Adicionar Verbetes Canônicos Chineses Exclusivos do Olympus
    chinese_entries = [
        {
            'id': 'chinese', 'title': 'Civilização Chinesa (Reino Médio)', 'pantheon': 'chinese', 'category': 'civilization',
            'summary': 'Uma civilização ancestral de filósofos, alquimistas e mestres marciais que canalizam o Yin-Yang e a sabedoria dos dragões celestiais.',
            'lore': 'A civilização chinesa no Olympus baseia-se na harmonia cósmica do Bagua e na alquimia de pólvora e jade. Seus três deuses maiores (Fu Xi, Nüwa e Shennong) conferem bênçãos de sabedoria tecnológica, crescimento populacional sustentável e domínios agrícolas de alta produtividade. Suas unidades combinam infantaria disciplinada com alabardas Ge, carruagens de guerra e criaturas celestiais como o Dragão e o Qilin.',
            'metadata': {'cultura': 'Oriental / Dinástica', 'recurso especial': 'Favor gerado pela veneração nos Altares de Ancestrais e equilíbrio de Yin-Yang'}
        },
        {
            'id': 'fuxi_major', 'title': 'Fu Xi (Deus Maior)', 'pantheon': 'chinese', 'category': 'god',
            'summary': 'Primeiro dos Três Augustos mitológicos, criador do Bagua dos Oito Trigramas e patrono da civilização, sabedoria e estratégia.',
            'lore': 'Fu Xi é considerado o patrono primordial da civilização oriental no Olympus. Criou o sistema dos Oito Trigramas após contemplar o casco de uma Tartaruga Espiritual que emergiu das águas amarelas. Concede aceleração na pesquisa de tecnologias e visibilidade expandida através do Bagua celestial.',
            'metadata': {'ocupação': 'Deus Maior da Sabedoria e Harmonia', 'poder divino': 'Visão dos Oito Trigramas'}
        },
        {
            'id': 'nuwa_major', 'title': 'Nüwa (Deusa Maior)', 'pantheon': 'chinese', 'category': 'god',
            'summary': 'Deusa primordial da criação e reparadora dos céus com pedras de cinco cores, protetora do povo e da fertilidade.',
            'lore': 'Nüwa moldou os primeiros seres humanos a partir do barro amarelo sagrado e curou a abóbada celeste quando o pilar do mundo foi fraturado. No Olympus, seus seguidores desfrutam de regeneração contínua de aldeões, templos abençoados e custos reduzidos de moradias.',
            'metadata': {'ocupação': 'Deusa Maior da Criação e Restauração', 'poder divino': 'Remendo Celestial de Jade'}
        },
        {
            'id': 'shennong_major', 'title': 'Shennong (Deus Maior)', 'pantheon': 'chinese', 'category': 'god',
            'summary': 'O Divino Agricultor e imperador mítico da medicina, que experimentou centenas de ervas para curar a humanidade.',
            'lore': 'Shennong ensinou aos mortais a arte da aragem, da rotação de colheitas e do cultivo medicinal. No Olympus, suas bênçãos garantem fazendas com taxa de coleta triplicada, geração espontânea de ervas medicinais e exércitos resistentes a veneno e pragas.',
            'metadata': {'ocupação': 'Deus Maior da Agricultura e Farmacologia', 'poder divino': 'Abundância dos Grãos Sagrados'}
        },
        {
            'id': 'celestial_dragon', 'title': 'Dragão Celestial (Long)', 'pantheon': 'chinese', 'category': 'unit_myth',
            'summary': 'Soberano das tempestades, rios e chuvas celestiais, a mais reverenciada das criaturas míticas da Ásia Antiga.',
            'lore': 'Diferente dos dragões ocidentais cuspidor de fogo, o Dragão Celestial oriental é uma divindade das águas e das nuvens benfazejas. No campo de batalha, convoca relâmpagos giratórios e sopra rajadas de névoa congelante que dissipam formações de cerco inimigas.',
            'metadata': {'nome científico': 'Draco orientalis', 'tamanho': '40 m de comprimento serpentino', 'dieta': 'Néctar de orvalho celeste e pérolas de trovão', 'ataque especial': 'Tufão de Jade Ascendente'}
        },
        {
            'id': 'qilin', 'title': 'Qilin Sagrado', 'pantheon': 'chinese', 'category': 'unit_myth',
            'summary': 'Criatura quimérica auspiciosa de chifre único e escamas resplandecentes que pisa sem esmagar uma única folha de grama.',
            'lore': 'O Qilin surge apenas nas eras de grandes sábios e soberanos virtuosos. Sua presença emana uma aura calmante que cura tropas aliadas circundantes e cega temporariamente atacantes com um feixe de luz solar prismática.',
            'metadata': {'nome científico': 'Monoceros sericus', 'tamanho': '3 m de comprimento', 'dieta': 'Ervas sagradas e névoa da montanha', 'ataque especial': 'Clarão da Serenidade'}
        }
    ]

    for c_entry in chinese_entries:
        cat = c_entry['category']
        if cat == 'god':
            codex['gods'][c_entry['id']] = c_entry
        elif cat == 'unit_myth':
            codex['units_myth'][c_entry['id']] = c_entry
        elif cat == 'civilization':
            codex['civilizations'][c_entry['id']] = c_entry

    # Contagem total
    total = sum(len(codex[k]) for k in codex if k != 'metadata')
    codex['metadata']['total_entries'] = total

    # Salva JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(codex, f, ensure_ascii=False, indent=2)

    print(f"✅ Compilação concluída com sucesso!")
    print(f"Total de verbetes estruturados: {total}")
    for k in codex:
        if k != 'metadata':
            print(f"  - {k}: {len(codex[k])} verbetes")

if __name__ == '__main__':
    main()
