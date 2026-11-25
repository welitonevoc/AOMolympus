#!/usr/bin/env python3
"""
Extrator Oficial de Sons do Age of Mythology: The Titans -> Olympus (Godot 4).
Extrai TODOS os arquivos .wav de sounds.bar e sounds2.bar + todas as musicas .mp3
de /sdcard/aom/sound/music/ para audio/aom/<categoria>/, gera audio/aom/sound_catalog.json
e cria audio/aom/.gdignore para carregamento sob demanda em runtime sem travar o Editor Android.
"""

import json
import os
import re
import shutil
import sys
from typing import Dict, List, Tuple

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
sys.path.insert(0, SCRIPT_DIR)

from aom_titans_extractor import BarArchive  # noqa: E402

AOM_SOUND_DIR = "/sdcard/aom/sound"
OUT_ROOT = os.path.join(PROJECT_ROOT, "audio", "aom")


def _safe_name(name: str) -> str:
    stem, ext = os.path.splitext(os.path.basename(name))
    clean = re.sub(r"[^a-z0-9_\-]+", "_", stem.lower()).strip("_")
    if not clean:
        clean = "sound"
    return clean + ext.lower()


def classify_wav(filename: str) -> Tuple[str, str]:
    """Retorna (categoria_pasta, subcategoria_chave) para um .wav do AoM."""
    n = os.path.basename(filename).lower()

    # 1. Poderes Divinos
    gp_kw = (
        "bolt", "lightning", "meteor", "earthquake", "tornado", "frost", "flaming",
        "plague", "locust", "eclipse", "prosperity", "rain", "forestfire", "niddhogg",
        "nidhogg", "ragnarok", "fimbulwinter", "tartarian", "implode", "vortex",
        "shockwave", "deconstruction", "chaos", "traitor", "valor", "carnivora",
        "gaiaforest", "lush", "healing", "ceasefire", "curse", "underworld",
        "pestilence", "bronze", "restoration", "sentinel", "citadel", "ancestors",
        "sonofosiris", "shifting", "vision", "plenty", "godpower", "power",
    )
    if any(k in n for k in gp_kw):
        return "god_powers", "god_power"

    # 2. Criaturas Miticas & Titas
    myth_kw = (
        "cyclops", "minotaur", "centaur", "colossus", "hydra", "medusa", "chimera",
        "manticore", "nemean", "pegasus", "carcinos", "kraken", "scylla", "sphinx",
        "anubite", "wadjet", "petsuchos", "scarab", "scorpion", "mummy", "avenger",
        "phoenix", "leviathan", "roc", "valkyrie", "troll", "einherjar", "frostgiant",
        "firegiant", "mountain", "fenris", "jormund", "behemoth", "caladria", "dryad",
        "lampades", "manowar", "neried", "promethean", "satyr", "servant", "stymphalian",
        "argus", "automaton", "titan", "dragon", "serpent", "shade", "battleboar",
    )
    if any(k in n for k in myth_kw):
        return "myth", "myth"

    # 3. Vozes por Civilizacao (padroes oficiais AoM: g=greek, e=egyptian, n=norse, a/x=atlantean)
    if re.match(r"^(aha|ahm|ahs|ama|amm|ams|ava|avm|avs|atl)", n) or "atlantean" in n:
        return "voice/atlantean", _voice_sub(n)
    if re.match(r"^(g|greek|hoplite|toxotes|hippikon|peltast|myrmidon|gastraphetes|hetairoi)", n) and any(
        v in n for v in ("select", "move", "attack", "ack", "grunt", "die", "death", "build", "gather", "villager")
    ):
        return "voice/greek", _voice_sub(n)
    if re.match(r"^(e|egypt|pharaoh|priest|spearman|axeman|slinger|chariot|camel|migdol)", n) and any(
        v in n for v in ("select", "move", "attack", "ack", "grunt", "die", "death", "build", "gather", "villager")
    ):
        return "voice/egyptian", _voice_sub(n)
    if re.match(r"^(n|norse|ulfsark|hersir|huskarl|jarl|dwarf|throwing|raiding|oxcart)", n) and any(
        v in n for v in ("select", "move", "attack", "ack", "grunt", "die", "death", "build", "gather", "villager")
    ):
        return "voice/norse", _voice_sub(n)
    if any(h in n for h in ("arkantos", "ajax", "agamemnon", "chiron", "odysseus", "amanra", "reginleif", "kastor", "krios", "gargarensis", "folstag", "brokk", "eitri")):
        return "voice/heroes", _voice_sub(n)

    # 4. UI / Interface / Alertas
    ui_kw = (
        "ui", "click", "button", "chat", "tribute", "age", "victory", "defeat",
        "wonder", "relic", "flare", "ping", "alert", "alarm", "horn", "fanfare",
        "herohasfallen", "research", "tech", "advance", "select", "invalid", "error",
        "population", "housing", "farmrebuild", "market", "trade",
    )
    if any(k in n for k in ui_kw):
        return "ui", _ui_sub(n)

    # 5. Construcoes
    bld_kw = (
        "academy", "archery", "armory", "barracks", "dock", "fortress", "granary",
        "guild", "house", "longhouse", "lighthouse", "manor", "migdol", "monument",
        "palace", "pyramid", "settlement", "sky", "stable", "storehouse", "temple",
        "tower", "towncenter", "town_center", "wall", "gate", "building", "collapse",
        "rubble", "construct", "hammer",
    )
    if any(k in n for k in bld_kw):
        return "buildings", "building"

    # 6. Economia & Coleta
    eco_kw = (
        "chop", "wood", "tree", "mine", "gold", "pickaxe", "forage", "berry",
        "farm", "plow", "hunt", "fish", "boat", "caravan", "villager", "gather",
        "build", "repair", "saw",
    )
    if any(k in n for k in eco_kw):
        return "economy", _eco_sub(n)

    # 7. Combate & Armas
    cmb_kw = (
        "sword", "blade", "axe", "spear", "lance", "arrow", "bow", "sling",
        "javelin", "shield", "metal", "flesh", "hit", "impact", "clang", "slash",
        "stab", "crush", "siege", "catapult", "ram", "ballista", "petrobolos",
        "helepolis", "fire", "burn", "explode", "death", "die", "grunt", "scream",
        "horse", "hoof", "gallop", "cavalry", "chariot", "war", "battle", "punch",
    )
    if any(k in n for k in cmb_kw):
        return "combat", _combat_sub(n)

    # 8. Ambiente & Natureza
    return "ambient", "ambient"


def _voice_sub(n: str) -> str:
    if "attack" in n or n.startswith(("aha", "ama", "ava")):
        return "attack"
    if "move" in n or "ack" in n or n.startswith(("ahm", "amm", "avm")):
        return "move"
    if "die" in n or "death" in n:
        return "death"
    return "select"


def _ui_sub(n: str) -> str:
    if "age" in n or "advance" in n or "fanfare" in n:
        return "age_up"
    if "victory" in n:
        return "victory"
    if "defeat" in n or "fallen" in n:
        return "defeat"
    if "click" in n or "button" in n:
        return "click"
    if "horn" in n or "alarm" in n or "alert" in n or "flare" in n:
        return "alert"
    return "ui"


def _eco_sub(n: str) -> str:
    if "chop" in n or "wood" in n or "tree" in n or "saw" in n:
        return "gather_wood"
    if "mine" in n or "gold" in n or "pick" in n:
        return "gather_gold"
    if "forage" in n or "berry" in n or "farm" in n:
        return "gather_forage"
    if "fish" in n:
        return "gather_fish"
    return "build"


def _combat_sub(n: str) -> str:
    if "arrow" in n or "bow" in n:
        return "arrow"
    if "die" in n or "death" in n or "scream" in n:
        return "unit_death"
    if "flesh" in n or "stab" in n or "slash" in n:
        return "sword_flesh"
    return "combat_hit"


def main() -> int:
    os.makedirs(OUT_ROOT, exist_ok=True)
    catalog: Dict[str, Dict[str, List[str]]] = {}

    def register(cat: str, sub: str, rel_res_path: str) -> None:
        catalog.setdefault(cat, {}).setdefault(sub, []).append(rel_res_path)

    total_wav = 0
    total_mp3 = 0

    # 1. Extrair sounds.bar e sounds2.bar
    for bname in ("sounds.bar", "sounds2.bar"):
        bpath = os.path.join(AOM_SOUND_DIR, bname)
        if not os.path.exists(bpath):
            print(f"[AVISO] Nao encontrado: {bpath}")
            continue
        bar = BarArchive([bpath])
        for entry_name in sorted(bar.files.keys()):
            if not entry_name.lower().endswith(".wav"):
                continue
            raw = bar.read(entry_name)
            if not raw or len(raw) < 64:
                continue
            cat, sub = classify_wav(entry_name)
            out_dir = os.path.join(OUT_ROOT, cat)
            os.makedirs(out_dir, exist_ok=True)
            fname = _safe_name(entry_name)
            out_file = os.path.join(out_dir, fname)
            if not os.path.exists(out_file):
                with open(out_file, "wb") as fp:
                    fp.write(raw)
            rel_res = "res://audio/aom/" + cat.replace("\\", "/") + "/" + fname
            register(cat, sub, rel_res)
            total_wav += 1

    # 2. Copiar aherohasfallen.wav se existir
    hero_fallen = os.path.join(AOM_SOUND_DIR, "aherohasfallen.wav")
    if os.path.exists(hero_fallen):
        out_dir = os.path.join(OUT_ROOT, "ui")
        os.makedirs(out_dir, exist_ok=True)
        dst = os.path.join(out_dir, "aherohasfallen.wav")
        if not os.path.exists(dst):
            shutil.copy2(hero_fallen, dst)
        register("ui", "defeat", "res://audio/aom/ui/aherohasfallen.wav")
        total_wav += 1

    # 3. Copiar musicas oficiais (/sdcard/aom/sound/music/)
    music_src = os.path.join(AOM_SOUND_DIR, "music")
    if os.path.isdir(music_src):
        for root, _dirs, files in os.walk(music_src):
            for f in sorted(files):
                if not f.lower().endswith(".mp3"):
                    continue
                full = os.path.join(root, f)
                rel_dir = os.path.relpath(root, music_src).replace("\\", "/").strip(".")
                sub_cat = rel_dir.lower() if rel_dir else "general"
                cat = f"music/{sub_cat}"
                out_dir = os.path.join(OUT_ROOT, cat)
                os.makedirs(out_dir, exist_ok=True)
                fname = _safe_name(f)
                dst = os.path.join(out_dir, fname)
                if not os.path.exists(dst):
                    shutil.copy2(full, dst)
                rel_res = f"res://audio/aom/{cat}/{fname}"
                register("music", sub_cat, rel_res)
                total_mp3 += 1

    # 4. Gravar sound_catalog.json
    cat_path = os.path.join(OUT_ROOT, "sound_catalog.json")
    with open(cat_path, "w", encoding="utf-8") as fp:
        json.dump(
            {
                "version": 1,
                "source": "/sdcard/aom/sound",
                "stats": {"wav": total_wav, "mp3": total_mp3},
                "categories": catalog,
            },
            fp,
            indent=2,
            ensure_ascii=False,
        )

    # 5. Criar .gdignore para evitar crash OOM no Editor Godot 4.8 Android
    gdignore_path = os.path.join(OUT_ROOT, ".gdignore")
    with open(gdignore_path, "w", encoding="utf-8") as fp:
        fp.write(
            "# Ignorado pelo scanner do Godot Editor para evitar crash OOM ao importar ~1655 sons.\n"
            "# Carregados sob demanda em runtime pelo AudioDirector via sound_catalog.json.\n"
        )

    print(f"✅ Extracao AoM Sound concluida! WAVs: {total_wav} | MP3s: {total_mp3} | Categorias: {len(catalog)}")
    for k, subs in sorted(catalog.items()):
        cnt = sum(len(v) for v in subs.values())
        print(f"   - {k}: {cnt} arquivos ({list(subs.keys())})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
