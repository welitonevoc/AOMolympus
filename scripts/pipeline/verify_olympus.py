#!/usr/bin/env python3
"""
Validador Estático Oficial do Age of Mythology: Olympus (AgEnFK verifyCommand).
Executa em < 1 segundo no Android/PC e bloqueia regressões reais de Godot 4.x ANTES de chegar ao celular:
  1. Integridade de project.godot (Autoloads existentes + zero colisão com class_name)
  2. Guardas de API Godot 4.x em todos os .gd (ex: surface_get_material vs get_surface_material,
     enum chamado como função, preload/load res:// quebrado)
  3. Integridade de cenas .tscn (ext_resource res:// existentes)
  4. Integridade dos pacotes modulares AoM: The Titans (manifest.json + base .glb)
"""

import json
import os
import re
import sys
from typing import List, Set, Tuple

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def check_project_godot() -> Tuple[Set[str], List[str]]:
    errors: List[str] = []
    autoloads: Set[str] = set()
    pg_path = os.path.join(ROOT, "project.godot")
    if not os.path.exists(pg_path):
        return autoloads, ["project.godot nao encontrado na raiz do projeto"]

    in_autoload = False
    with open(pg_path, "r", encoding="utf-8", errors="ignore") as fp:
        for lineno, line in enumerate(fp, 1):
            s = line.strip()
            if s.startswith("["):
                in_autoload = s == "[autoload]"
                continue
            if in_autoload and "=" in s:
                name, val = s.split("=", 1)
                name = name.strip()
                autoloads.add(name)
                m = re.search(r"res://([^\"']+)", val)
                if m:
                    rel = m.group(1)
                    if not os.path.exists(os.path.join(ROOT, rel)):
                        errors.append(f"project.godot:{lineno}: Autoload '{name}' aponta para arquivo inexistente: res://{rel}")
    return autoloads, errors


def check_gdscripts(autoloads: Set[str]) -> Tuple[int, List[str]]:
    errors: List[str] = []
    checked = 0
    scripts_dir = os.path.join(ROOT, "scripts")
    if not os.path.isdir(scripts_dir):
        return 0, ["Diretorio scripts/ nao encontrado"]

    # Collect declared enums across all scripts to catch EnumName(x) misuse
    enum_names: Set[str] = set()
    gd_files: List[str] = []
    for r, _dirs, files in os.walk(scripts_dir):
        for f in sorted(files):
            if f.endswith(".gd"):
                p = os.path.join(r, f)
                gd_files.append(p)
                with open(p, "r", encoding="utf-8", errors="ignore") as fp:
                    for m in re.finditer(r"^\s*enum\s+([A-Z][A-Za-z0-9_]+)\s*\{", fp.read(), re.MULTILINE):
                        enum_names.add(m.group(1))

    for p in gd_files:
        checked += 1
        rel_p = os.path.relpath(p, ROOT)
        with open(p, "r", encoding="utf-8", errors="ignore") as fp:
            lines = fp.readlines()

        for lineno, raw in enumerate(lines, 1):
            # Strip comments outside strings (fast heuristic)
            code = raw.split("#")[0]
            if not code.strip():
                continue

            # 1. Check class_name vs Autoload collision (except if this file IS that autoload? No, in Godot 4 even the autoload script cannot share class_name with its singleton name)
            m_cn = re.match(r"^\s*class_name\s+([A-Za-z0-9_]+)", code)
            if m_cn and m_cn.group(1) in autoloads:
                errors.append(f"{rel_p}:{lineno}: class_name '{m_cn.group(1)}' colide com Autoload singleton do project.godot")

            # 2. Check deprecated/nonexistent Mesh.get_surface_material(
            if ".get_surface_material(" in code:
                errors.append(f"{rel_p}:{lineno}: API invalida no Godot 4 '.get_surface_material(' — use '.surface_get_material(' ou '.get_surface_override_material('")

            # 3. Check calling enum as function: EnumName(
            for ename in enum_names:
                if f"{ename}(" in code and not re.search(rf"\bfunc\s+{ename}\s*\(", code):
                    errors.append(f"{rel_p}:{lineno}: Enum '{ename}' chamado como funcao '{ename}(...)' — use cast 'as {ename}'")

            # 4. Check static res:// paths in preload/load for .gd and .tscn
            for m_res in re.finditer(r'\b(?:preload|load)\(\s*"res://([^"%]+?\.(?:gd|tscn))"\s*\)', code):
                target = os.path.join(ROOT, m_res.group(1))
                if not os.path.exists(target):
                    errors.append(f"{rel_p}:{lineno}: Recurso inexistente em preload/load: res://{m_res.group(1)}")

    return checked, errors


def check_scenes() -> Tuple[int, List[str]]:
    errors: List[str] = []
    checked = 0
    scenes_dir = os.path.join(ROOT, "scenes")
    if not os.path.isdir(scenes_dir):
        return 0, []

    for f in sorted(os.listdir(scenes_dir)):
        if not f.endswith(".tscn"):
            continue
        checked += 1
        p = os.path.join(scenes_dir, f)
        with open(p, "r", encoding="utf-8", errors="ignore") as fp:
            for lineno, line in enumerate(fp, 1):
                if line.startswith("[ext_resource"):
                    m = re.search(r'path="res://([^"]+)"', line)
                    if m and not os.path.exists(os.path.join(ROOT, m.group(1))):
                        errors.append(f"scenes/{f}:{lineno}: ext_resource inexistente: res://{m.group(1)}")
    return checked, errors


def check_aom_bundles() -> Tuple[int, List[str]]:
    errors: List[str] = []
    checked = 0
    civ_dir = os.path.join(ROOT, "models", "civilizations")
    if not os.path.isdir(civ_dir):
        return 0, []

    for r, _dirs, files in os.walk(civ_dir):
        if "manifest.json" not in files:
            continue
        checked += 1
        mpath = os.path.join(r, "manifest.json")
        try:
            with open(mpath, "r", encoding="utf-8") as fp:
                data = json.load(fp)
            base_glb = data.get("base", "")
            if base_glb and not os.path.exists(os.path.join(r, base_glb)):
                errors.append(f"{os.path.relpath(mpath, ROOT)}: base GLB ausente: {base_glb}")
        except Exception as exc:
            errors.append(f"{os.path.relpath(mpath, ROOT)}: JSON invalido ({exc})")
    return checked, errors


def main() -> int:
    autoloads, errs_pg = check_project_godot()
    n_gd, errs_gd = check_gdscripts(autoloads)
    n_scn, errs_scn = check_scenes()
    n_bundles, errs_bun = check_aom_bundles()

    all_errors = errs_pg + errs_gd + errs_scn + errs_bun
    if all_errors:
        print(f"❌ Olympus Verify FALHOU ({len(all_errors)} erros):")
        for e in all_errors[:30]:
            print(f"  - {e}")
        return 1

    print(
        f"✅ Olympus Verify PASSED | Autoloads: {len(autoloads)} | GDScripts: {n_gd} | Cenas: {n_scn} | Pacotes AoM: {n_bundles}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
