#!/usr/bin/env python3
"""
Extrator de Dados Oficiais AoM: The Titans (/sdcard/aom/data/data2.bar & godpowers2.bar)
Decodifica arquivos XMB (l33t + X1/XR/XN) e gera as referências oficiais da skill `mito-rts`.
"""

import json
import os
import struct
import sys
import xml.etree.ElementTree as ET
import zlib
from typing import Dict, List, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aom_titans_extractor import BarArchive

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_BAR = "/sdcard/aom/data/data2.bar"
GP_BAR = "/sdcard/aom/god powers/godpowers2.bar"
MODELS_CIV_DIR = os.path.join(ROOT, "models", "civilizations")
REF_DIR = os.path.join(ROOT, "skill aom", "mito-rts", "references")


def decode_xmb(raw: bytes) -> ET.Element:
    """Decodes AoM l33t-compressed XMB binary XML into an ElementTree Element."""
    if raw[:4] == b"l33t":
        raw = zlib.decompress(raw[8:])
    if raw[:2] != b"X1":
        raise ValueError(f"Unsupported XMB header: {raw[:4]!r}")
    pos = 6  # X1 + u32 size
    if raw[pos : pos + 2] != b"XR":
        raise ValueError(f"Expected XR at {pos}, got {raw[pos:pos+2]!r}")
    pos += 6  # XR + u32(4)
    _ver = struct.unpack_from("<I", raw, pos)[0]
    pos += 4
    n_elems = struct.unpack_from("<I", raw, pos)[0]
    pos += 4
    elem_names: List[str] = []
    for _ in range(n_elems):
        ln = struct.unpack_from("<I", raw, pos)[0]
        pos += 4
        elem_names.append(raw[pos : pos + ln * 2].decode("utf-16-le"))
        pos += ln * 2
    n_attrs = struct.unpack_from("<I", raw, pos)[0]
    pos += 4
    attr_names: List[str] = []
    for _ in range(n_attrs):
        ln = struct.unpack_from("<I", raw, pos)[0]
        pos += 4
        attr_names.append(raw[pos : pos + ln * 2].decode("utf-16-le"))
        pos += ln * 2

    def read_node() -> ET.Element:
        nonlocal pos
        if raw[pos : pos + 2] != b"XN":
            raise ValueError(f"Expected XN at {pos}, got {raw[pos:pos+2]!r}")
        pos += 6  # XN + u32 node_len
        tlen = struct.unpack_from("<I", raw, pos)[0]
        pos += 4
        text = raw[pos : pos + tlen * 2].decode("utf-16-le") if tlen else ""
        pos += tlen * 2
        name_idx = struct.unpack_from("<I", raw, pos)[0]
        pos += 4
        n_a = struct.unpack_from("<I", raw, pos)[0]
        pos += 4
        el = ET.Element(elem_names[name_idx])
        if text:
            el.text = text
        for _ in range(n_a):
            a_idx = struct.unpack_from("<I", raw, pos)[0]
            pos += 4
            vlen = struct.unpack_from("<I", raw, pos)[0]
            pos += 4
            val = raw[pos : pos + vlen * 2].decode("utf-16-le") if vlen else ""
            pos += vlen * 2
            el.set(attr_names[a_idx], val)
        n_c = struct.unpack_from("<I", raw, pos)[0]
        pos += 4
        for _ in range(n_c):
            el.append(read_node())
        return el

    return read_node()


def scan_model_bundles() -> Dict[str, Dict[str, str]]:
    """Maps 'civ:slug' (and fallback 'slug') -> {civ, path, category} from models/civilizations."""
    bundles: Dict[str, Dict[str, str]] = {}
    if not os.path.isdir(MODELS_CIV_DIR):
        return bundles
    for civ in sorted(os.listdir(MODELS_CIV_DIR)):
        civ_dir = os.path.join(MODELS_CIV_DIR, civ)
        if not os.path.isdir(civ_dir):
            continue
        for entry in sorted(os.listdir(civ_dir)):
            ep = os.path.join(civ_dir, entry)
            if entry == "cidade" and os.path.isdir(ep):
                for b in sorted(os.listdir(ep)):
                    mpath = os.path.join(ep, b, "manifest.json")
                    if os.path.isfile(mpath):
                        info = {"civ": civ, "path": f"models/civilizations/{civ}/cidade/{b}", "cat": "building"}
                        bundles[f"{civ.lower()}:{b}"] = info
                        bundles.setdefault(b, info)
            elif os.path.isfile(os.path.join(ep, "manifest.json")):
                info = {"civ": civ, "path": f"models/civilizations/{civ}/{entry}", "cat": "unit"}
                bundles[f"{civ.lower()}:{entry}"] = info
                bundles.setdefault(entry, info)
    return bundles


def fmt_cost(unit_el: ET.Element) -> str:
    parts = []
    abbr = {"Food": "F", "Wood": "W", "Gold": "G", "Favor": "Fv"}
    for c in unit_el.findall("cost"):
        rt = c.attrib.get("resourcetype", "")
        val = int(float(c.text or 0))
        if val > 0:
            parts.append(f"{val}{abbr.get(rt, rt)}")
    return " ".join(parts) if parts else "—"


def fmt_armor(unit_el: ET.Element) -> str:
    arm = {}
    for a in unit_el.findall("armor"):
        dt = a.attrib.get("damagetype", "")
        val = int(round(float(a.text or 0) * 100))
        arm[dt] = f"{val}%"
    if not arm:
        return "—"
    return f"H:{arm.get('Hack','0%')} P:{arm.get('Pierce','0%')} C:{arm.get('Crush','0%')}"


def fmt_attack(unit_el: ET.Element) -> str:
    attacks = []
    for act in unit_el.findall("action"):
        aname = act.attrib.get("name", "")
        if "Attack" not in aname and aname not in ("Throw", "AreaAttack", "LightningAttack", "BreathAttack"):
            continue
        dmgs = []
        rng = ""
        bonuses = []
        for p in act.findall("param"):
            pname = p.attrib.get("name", "")
            if pname == "Damage":
                dt = p.attrib.get("type", "")
                v = p.attrib.get("value1", "0")
                dmgs.append(f"{v} {dt}")
            elif pname == "MaximumRange":
                rng = p.attrib.get("value1", "")
            elif pname == "DamageBonus":
                bonuses.append(f"×{p.attrib.get('value1','1')} vs {p.attrib.get('type','')}")
        if dmgs:
            s = f"{aname}: {'+'.join(dmgs)}"
            if rng and float(rng) > 1.5:
                s += f" (rng {rng})"
            if bonuses:
                s += " [" + ", ".join(bonuses[:2]) + "]"
            attacks.append(s)
    return " / ".join(attacks[:2]) if attacks else "—"


def infer_civ_from_unit(name: str, icon: str, unittypes: set) -> str:
    n = name.lower()
    ic = icon.lower()
    if "greek" in n or " g " in f" {ic} " or n in (
        "hoplite", "toxotes", "hippikon", "peltast", "hypaspist", "prodromos", "myrmidon",
        "hetairoi", "gastraphetes", "petrobolos", "helepolis", "cyclops", "minotaur", "centaur",
        "hydrae", "hydra", "manticore", "nemean lion", "colossus", "medusa", "chimera",
        "scylla", "carcinos", "pegasus", "theseus", "jason", "odysseus", "hippolyta",
        "heracles", "achilles", "atalanta", "bellerophon", "ajax", "arkantos", "chiron",
        "agamemnon", "perseus", "polyphemus", "sentinel", "plenty vault", "underworld passage",
    ):
        return "Greek"
    if "egyptian" in n or " e " in f" {ic} " or n in (
        "spearman", "axeman", "slinger", "chariot archer", "camelry", "war elephant",
        "mercenary", "mercenary cavalry", "pharaoh", "priest", "son of osiris",
        "anubite", "sphinx", "wadjet", "petsuchos", "scorpion man", "scarab",
        "mummy", "avenger", "phoenix", "leviathan", "roc", "sea turtle",
        "obelisk", "monument", "monument 2", "monument 3", "monument 4", "monument 5",
        "migdol stronghold", "siege tower", "catapult",
    ):
        return "Egyptian"
    if "norse" in n or "dwarf" in n or " n " in f" {ic} " or n in (
        "ulfsark", "throwing axeman", "raiding cavalry", "huskarl", "jarl", "hersir",
        "ox cart", "portable ram", "ballista", "troll", "valkyrie", "einherjar",
        "battle boar", "mountain giant", "frost giant", "fire giant", "fenris wolf brood",
        "jormund elver", "nidhogg", "walking woods", "hill fort", "longhouse", "kraken",
    ):
        return "Norse"
    if "atlantean" in n or " x " in f" {ic} " or "hero" in n and any(
        k in n for k in ("murmillo", "arcus", "turma", "katapeltes", "contarius", "destroyer", "fanatic", "oracle", "citizen")
    ) or n in (
        "murmillo", "arcus", "turma", "katapeltes", "contarius", "destroyer", "fanatic",
        "oracle", "cheiroballista", "fire siphon", "behemoth", "promethean", "automatons",
        "automaton", "caladria", "satyr", "stymphalian bird", "dryad", "argus", "lampades",
        "heka gigantes", "man o war", "servant", "carnivora", "mirror tower", "sky passage",
        "palace", "manor",
    ):
        return "Atlantean"
    return "Shared/Other"


def generate_units_and_buildings(proto: ET.Element, bundles: Dict[str, dict]) -> None:
    units_by_civ: Dict[str, List[str]] = {"Greek": [], "Egyptian": [], "Norse": [], "Atlantean": [], "Shared/Other": []}
    bldgs_by_civ: Dict[str, List[str]] = {"Greek": [], "Egyptian": [], "Norse": [], "Atlantean": [], "Shared/Other": []}

    for u in proto.findall("unit"):
        name = u.attrib.get("name", "")
        utypes = {ut.text for ut in u.findall("unittype") if ut.text}
        if "UnitClass" not in utypes and "BuildingClass" not in utypes:
            continue
        hp = int(float((u.findtext("maxhitpoints") or "0")))
        if hp <= 0:
            continue
        cost = fmt_cost(u)
        if cost == "—" and "Titan" not in name and "Town Center" not in name and "Son of Osiris" not in name:
            # Skip campaign/cinematic-only variants without cost unless iconic
            if not any(k in utypes for k in ("Hero", "Titan", "AbstractTownCenter")):
                continue
        pop = u.findtext("populationcount") or "0"
        vel = u.findtext("maxvelocity") or "0"
        age = u.findtext("allowedage") or "1"
        icon = u.findtext("icon") or ""
        arm = fmt_armor(u)
        atk = fmt_attack(u)
        civ = infer_civ_from_unit(name, icon, utypes)

        slug = name.lower().replace(" ", "_")
        bundle_info = bundles.get(f"{civ.lower()}:{slug}") or bundles.get(slug)
        bundle_str = f"`{bundle_info['path']}`" if bundle_info else "—"

        role = "Mítica" if "MythUnit" in utypes else ("Herói" if "Hero" in utypes else ("Aldeão/Eco" if "AbstractVillager" in utypes else ("Cerco" if "AbstractSiegeWeapon" in utypes else "Militar")))

        if "Building" in utypes or "BuildingClass" in utypes:
            bldgs_by_civ[civ].append(f"| **{name}** | Era {age} | {hp} | {cost} | {arm} | {atk} | {bundle_str} |")
        else:
            units_by_civ[civ].append(f"| **{name}** | {role} | Era {age} | {hp} | {cost} | {pop} | {vel} | {arm} | {atk} | {bundle_str} |")

    with open(os.path.join(REF_DIR, "unidades-oficiais.md"), "w", encoding="utf-8") as fp:
        fp.write("# Unidades Oficiais — Age of Mythology: The Titans (`protox.xmb`)\n\n")
        fp.write("> Extraído diretamente de `/sdcard/aom/data/data2.bar` (`protox.xmb`) e mapeado com `models/civilizations/`.\n")
        fp.write("> Legenda Armadura: `H`=Hack (Corte), `P`=Pierce (Perfuração), `C`=Crush (Esmagamento).\n\n")
        for civ in ["Greek", "Egyptian", "Norse", "Atlantean", "Shared/Other"]:
            rows = units_by_civ[civ]
            if not rows:
                continue
            fp.write(f"## {civ} ({len(rows)} unidades)\n\n")
            fp.write("| Unidade | Papel | Era | HP | Custo | Pop | Vel | Armadura | Ataque & Bônus | Pacote 3D |\n")
            fp.write("|---|---|---|---|---|---|---|---|---|---|\n")
            fp.write("\n".join(rows) + "\n\n")

    with open(os.path.join(REF_DIR, "construcoes-oficiais.md"), "w", encoding="utf-8") as fp:
        fp.write("# Construções Oficiais — Age of Mythology: The Titans (`protox.xmb`)\n\n")
        fp.write("> Extraído diretamente de `/sdcard/aom/data/data2.bar` (`protox.xmb`) e mapeado com `models/civilizations/*/cidade/`.\n\n")
        for civ in ["Greek", "Egyptian", "Norse", "Atlantean", "Shared/Other"]:
            rows = bldgs_by_civ[civ]
            if not rows:
                continue
            fp.write(f"## {civ} ({len(rows)} construções)\n\n")
            fp.write("| Construção | Era | HP | Custo | Armadura | Ataque | Pacote 3D |\n")
            fp.write("|---|---|---|---|---|---|---|\n")
            fp.write("\n".join(rows) + "\n\n")


def generate_gods_and_powers(majorgods: ET.Element, minorgods: ET.Element, gp_bar: BarArchive) -> None:
    lines: List[str] = [
        "# Deuses Maiores, Deuses Menores e Poderes Divinos — AoM: The Titans\n",
        "> Extraído diretamente de `majorgods.xmb`, `minorgods.xmb` e `godpowers2.bar`.\n",
        "## Deuses Maiores (12 Oficiais + Heróis de Campanha)\n",
        "| Deus | Tech Principal | Deuses Menores Disponíveis (por Era) |",
        "|---|---|---|",
    ]
    for g in majorgods.findall("god"):
        tech = g.attrib.get("techname", g.findtext("techname") or "")
        name = tech.replace("Age 1 ", "").replace("Archaic Age ", "")
        minors = []
        for mg in g.findall("minorgod"):
            age = mg.attrib.get("age", "?")
            mtech = mg.attrib.get("techname", mg.text or "")
            mname = mtech.split("Age ")[-1].lstrip("0123456789 ") if "Age " in mtech else mtech
            minors.append(f"E{age}: {mname}")
        if minors:
            lines.append(f"| **{name}** | `{tech}` | {', '.join(minors)} |")

    lines.append("\n## Deuses Menores (36 Oficiais)\n")
    lines.append("| Deus Menor | Era | Tech | Retrato Oficial |")
    lines.append("|---|---|---|---|")
    for g in minorgods.findall("god"):
        tech = g.attrib.get("techname", g.findtext("techname") or "")
        age = g.attrib.get("age", "?")
        portrait = g.attrib.get("portrait", "—")
        name = tech.split("Age ")[-1].lstrip("0123456789 ") if "Age " in tech else tech
        lines.append(f"| **{name}** | Era {age} | `{tech}` | `{portrait}` |")

    lines.append("\n## Poderes Divinos (`godpowers2.bar` — 71 definições)\n")
    lines.append("| Arquivo XMB | Tipo / Alvo | Recarga / Duração / Raio | Notas Técnicas |")
    lines.append("|---|---|---|---|")
    for k in sorted(gp_bar.files.keys()):
        if not k.endswith(".xmb"):
            continue
        try:
            root = decode_xmb(gp_bar.read(k))
        except Exception:
            continue
        gtype = root.attrib.get("type", root.tag)
        attrs = []
        for child in root:
            t = (child.text or "").strip()
            if child.tag in ("radius", "duration", "damage", "rechargetime", "numuses", "cost", "placement"):
                attrs.append(f"{child.tag}={t or child.attrib}")
        lines.append(f"| `{k[:-4]}` | {gtype} | {', '.join(attrs[:4]) or '—'} | {len(root)} nós XML |")

    with open(os.path.join(REF_DIR, "deuses-poderes.md"), "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines) + "\n")


def generate_techs_and_relics(techtree: ET.Element, relics: ET.Element) -> None:
    abbr = {"Food": "F", "Wood": "W", "Gold": "G", "Favor": "Fv"}
    tech_effects_map: Dict[str, str] = {}
    lines: List[str] = [
        "# Tecnologias, Eras e Relíquias — AoM: The Titans\n",
        "> Extraído diretamente de `techtreex.xmb` (507 tecnologias) e `relics2.xmb` (55 relíquias).\n",
        "## Tecnologias e Efeitos (`techtreex.xmb`)\n",
        "| Tecnologia | Custo | Tempo | Efeitos Principais |",
        "|---|---|---|---|",
    ]
    for t in techtree.findall("tech"):
        name = t.attrib.get("name", "")
        costs = []
        for c in t.findall("cost"):
            v = int(float(c.text or 0))
            if v > 0:
                rt = c.attrib.get("resourcetype", "")
                costs.append(f"{v}{abbr.get(rt, rt)}")
        rp = t.findtext("researchpoints") or "0"
        effects = []
        eff_el = t.find("effects")
        if eff_el is not None:
            for e in eff_el.findall("effect")[:3]:
                et = e.attrib.get("type", "")
                sub = e.attrib.get("subtype", "")
                amt = e.attrib.get("amount", "")
                rel = e.attrib.get("relativity", "")
                tgt = e.findtext("target") or ""
                effects.append(f"{et}({sub}) {amt} [{rel}] -> {tgt}")
        eff_str = "; ".join(effects) if effects else "—"
        if name:
            tech_effects_map[name] = eff_str
        if effects and not name.startswith("Relic "):
            cost_str = " ".join(costs) if costs else "—"
            lines.append(f"| **{name}** | {cost_str} | {rp}s | {eff_str} |")

    lines.append("\n## Relíquias Oficiais (`relics2.xmb` — 55 itens)\n")
    lines.append("| Relíquia | Tech Concedida | Efeito Oficial |")
    lines.append("|---|---|---|")
    for r in relics.findall("relic"):
        tech = r.attrib.get("tech", r.findtext("tech") or "")
        name = tech.replace("Relic ", "") if tech else (r.attrib.get("name", r.findtext("name") or ""))
        if name:
            lines.append(f"| **{name}** | `{tech}` | {tech_effects_map.get(tech, '—')} |")

    with open(os.path.join(REF_DIR, "tecnologias-eras.md"), "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines) + "\n")


def main() -> int:
    os.makedirs(REF_DIR, exist_ok=True)
    data_bar = BarArchive([DATA_BAR])
    gp_bar = BarArchive([GP_BAR])

    proto = decode_xmb(data_bar.read("protox.xmb"))
    majorgods = decode_xmb(data_bar.read("majorgods.xmb"))
    minorgods = decode_xmb(data_bar.read("minorgods.xmb"))
    techtree = decode_xmb(data_bar.read("techtreex.xmb"))
    relics = decode_xmb(data_bar.read("relics2.xmb"))
    bundles = scan_model_bundles()

    generate_units_and_buildings(proto, bundles)
    generate_gods_and_powers(majorgods, minorgods, gp_bar)
    generate_techs_and_relics(techtree, relics)

    print(f"✅ Gerado com sucesso em {REF_DIR}:")
    for fn in ("unidades-oficiais.md", "construcoes-oficiais.md", "deuses-poderes.md", "tecnologias-eras.md"):
        p = os.path.join(REF_DIR, fn)
        print(f"   - {fn} ({os.path.getsize(p):,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
