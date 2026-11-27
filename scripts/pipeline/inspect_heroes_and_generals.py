#!/usr/bin/env python3
"""
Mapeamento cirúrgico dos Heróis, Generais e Unidades EXCLUSIVOS do mod Heroes and Generals
(especificamente a linha DB*** e novos heróis de cada Deus Maior)
e comparação direta com o catálogo de unidades existentes em models/civilizations/.
"""

import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path

PROJECT_ROOT = Path(r"E:\AOMolympus-main")
MOD_DIR = Path(r"D:\Users\Jose Menezes\Downloads\Heroes and Generals")
CIV_DIR = PROJECT_ROOT / "models" / "civilizations"


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def main():
    proto_path = MOD_DIR / "data" / "proto2.8.xml"
    if not proto_path.exists():
        print("proto2.8.xml não encontrado")
        return

    tree = ET.parse(proto_path)
    root = tree.getroot()

    # Indexa pastas existentes no Olympus
    existing_slugs = {}
    for d in CIV_DIR.rglob("*"):
        if d.is_dir() and (d / "manifest.json").exists():
            civ = d.relative_to(CIV_DIR).parts[0]
            existing_slugs[d.name.lower()] = {
                "civ": civ,
                "path": str(d.relative_to(PROJECT_ROOT)),
            }

    # Coleta todas as unidades de ID 'DB...' ou que foram adicionadas
    db_units = []
    for u in root.findall("unit"):
        id_val = u.get("id", "")
        name = u.get("name", "")
        if id_val.startswith("DB") or id_val.startswith("HG"):
            anim_node = u.find("animfile")
            anim_val = anim_node.text if anim_node is not None and anim_node.text else ""
            unittypes = {ut.text for ut in u.findall("unittype") if ut.text}

            # Checa colisão
            n_key = norm(name)
            match_path = None
            for cand in [n_key, n_key.replace("hero_", "")]:
                if cand in existing_slugs:
                    match_path = existing_slugs[cand]["path"]
                    break

            db_units.append({
                "id": id_val,
                "name": name,
                "anim": anim_val,
                "is_hero": "Hero" in unittypes,
                "is_ship": "Ship" in unittypes,
                "is_general": "general" in name.lower() or "leader" in name.lower(),
                "match": match_path,
            })

    print("=================================================================")
    print("  RELATÓRIO: UNIDADES E HERÓIS EXCLUSIVOS DO HEROES AND GENERALS ")
    print("=================================================================\n")
    print(f"Total de heróis/generais/unidades customizadas (série DB/HG): {len(db_units)}\n")

    # Mapeamento por panteão/estilo sugerido pelo nome
    greek_heroes = []
    egypt_heroes = []
    norse_heroes = []
    atlantean_heroes = []
    chinese_heroes = []
    ships_and_other = []

    for u in db_units:
        nm = u["name"].lower()
        if any(tok in nm for tok in ("hector", "kos", "phocus", "pollux", "teleon", "idas", "tarkus", "helle", "acheus", "philon", "libon", "zethos", "charon")):
            greek_heroes.append(u)
        elif any(tok in nm for tok in ("imothep", "ahhotep", "neheb", "amnu", "sethos", "tiye", "djoser", "osiris", "khufu", "neferirkare", "amenemhat")):
            egypt_heroes.append(u)
        elif any(tok in nm for tok in ("vibald", "angrim", "niordsir", "ulf", "harald", "skarde", "bjorn", "nalfgar", "hringhorni", "skidblandir")):
            norse_heroes.append(u)
        elif any(tok in nm for tok in ("tambal", "fendrel", "melagius", "qyras", "epibaton", "dekplous", "periplon")):
            atlantean_heroes.append(u)
        elif any(tok in nm for tok in ("han", "zheng", "huang", "chen", "ming", "jin", "wang", "tang", "chuan", "bao")):
            chinese_heroes.append(u)
        else:
            ships_and_other.append(u)

    def print_group(title, group):
        print(f"\n--- {title} ({len(group)} personagens) ---")
        for item in group:
            col_info = f" [COLISÃO: {item['match']}]" if item["match"] else " [NOVO]"
            anim_name = Path(item["anim"]).name if item["anim"] else "padrão"
            role = "General" if item["is_general"] else ("Navio" if item["is_ship"] else "Herói")
            print(f"  • {item['name']:<28} | ID: {item['id']:<6} | Tipo: {role:<7} | Anim: {anim_name:<25}{col_info}")

    print_group("1. PANTEÃO GREGO (Novos Heróis e Generais)", greek_heroes)
    print_group("2. PANTEÃO EGÍPCIO (Novos Heróis e Generais)", egypt_heroes)
    print_group("3. PANTEÃO NÓRDICO (Novos Heróis e Generais)", norse_heroes)
    print_group("4. PANTEÃO ATLANTE (Novos Heróis e Comandantes)", atlantean_heroes)
    print_group("5. PANTEÃO CHINÊS (Novos Generais e Heróis)", chinese_heroes)
    print_group("6. NAVIOS HERÓICOS E UNIDADES ESPECIAIS", ships_and_other)

    # Resumo de Colisões
    collisions = [u for u in db_units if u["match"]]
    print("\n=================================================================")
    print(f"  RESUMO DE COLISÕES DE NOMES COM O PROJETO OLYMPUS: {len(collisions)}")
    print("=================================================================")
    if not collisions:
        print("  ✅ NENHUMA das unidades exclusivas (DB***) colide com as pastas de unidades existentes!")
    else:
        for c in collisions:
            print(f"  ⚠️ '{c['name']}' coincide com: {c['match']}")


if __name__ == "__main__":
    main()
