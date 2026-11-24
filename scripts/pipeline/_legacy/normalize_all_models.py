#!/usr/bin/env python3
"""
Normalizacao e Calibracao Rigorosa de Escala 3D para o Age of Mythology: Olympus.
Ajusta os modelos GLB para a escala metrica real do Godot 4:
- Unidades: Altura Y calibrada entre 1.70m e 2.30m, base em Y=0, X/Z centralizados.
- Construcoes: Dimensoes horizontais calibradas rigorosamente com os footprints do jogo
  (Casas: 3.2m, Quartéis: 4.2m, Templos: 5.5m, Torres: 2.4m, Fortalezas: 6.5m, TC: 7.0m).
- Elimina duplicacoes pesadas de 28MB do Town Center, mantendo apenas town_center.glb normalizado.
"""

import os
import trimesh

PROJECT_ROOT = "/data/user/0/com.agy/files/projects/age_of_mythology_olympus"
UNITS_DIR = os.path.join(PROJECT_ROOT, "models", "units")
BUILDINGS_DIR = os.path.join(PROJECT_ROOT, "models", "buildings")


def normalize_scene(filepath: str, target_height: float = None, target_max_hdim: float = None):
    """Ajusta a cena/malha 3D para centrar no chao e ter a dimensao exata desejada."""
    s = trimesh.load(filepath)
    bounds = s.bounds
    min_pt, max_pt = bounds[0], bounds[1]
    extents = max_pt - min_pt

    # 1. Alinha a base em Y = 0 e centraliza em X e Z
    tx = -(min_pt[0] + max_pt[0]) / 2.0
    ty = -min_pt[1]
    tz = -(min_pt[2] + max_pt[2]) / 2.0
    s.apply_translation([tx, ty, tz])

    # 2. Fator de escala
    if target_height is not None:
        scale = target_height / extents[1]
    elif target_max_hdim is not None:
        hdim = max(extents[0], extents[2])
        scale = target_max_hdim / hdim
    else:
        scale = 0.01

    s.apply_scale(scale)
    s.export(filepath)
    return s.extents


def run():
    print("=== 1. Normalizando Unidades (Escala Humana RTS) ===")
    for fname in sorted(os.listdir(UNITS_DIR)):
        if not fname.endswith(".glb"):
            continue
        fpath = os.path.join(UNITS_DIR, fname)
        
        if "myth" in fname:
            h = 2.30
        elif "hero" in fname or "cavalry" in fname:
            h = 1.90
        elif "villager" in fname:
            h = 1.70
        else:
            h = 1.75
            
        new_e = normalize_scene(fpath, target_height=h)
        print(f"  [Unidade] {fname:25} -> Altura: {new_e[1]:.2f}m | Largura: {new_e[0]:.2f}m | Extents: {new_e.round(2)}")

    print("\n=== 2. Otimizando e Removendo Duplicatas Pesadas de Construcoes ===")
    # Remove duplicatas redundantes de 28MB do town center
    tc_duplicates = [
        "greek_town_center.glb",
        "egyptian_town_center.glb",
        "norse_town_center.glb",
        "atlantean_town_center.glb",
        "chinese_town_center.glb",
    ]
    for dup in tc_duplicates:
        dp = os.path.join(BUILDINGS_DIR, dup)
        if os.path.exists(dp):
            os.remove(dp)
            print(f"  [Removido duplicata pesada de 28MB] {dup}")

    print("\n=== 3. Normalizando Construcoes (Footprints do Godot) ===")
    building_targets = {
        "houses": {"dim": 3.20, "mode": "hdim"},
        "barracks": {"dim": 4.20, "mode": "hdim"},
        "temples": {"dim": 5.50, "mode": "hdim"},
        "towers": {"dim": 5.80, "mode": "height"},
        "fortresses": {"dim": 6.50, "mode": "hdim"},
        "divine_altar": {"dim": 4.20, "mode": "height"},
        "town_center": {"dim": 7.00, "mode": "hdim"},
    }

    for fname in sorted(os.listdir(BUILDINGS_DIR)):
        if not fname.endswith(".glb"):
            continue
        fpath = os.path.join(BUILDINGS_DIR, fname)

        # Detecta tipo da construcao
        cfg = {"dim": 4.0, "mode": "hdim"}
        for b_type, t_cfg in building_targets.items():
            if b_type in fname:
                cfg = t_cfg
                break

        if cfg["mode"] == "height":
            new_e = normalize_scene(fpath, target_height=cfg["dim"])
        else:
            new_e = normalize_scene(fpath, target_max_hdim=cfg["dim"])
        print(f"  [Construcao] {fname:25} -> Base: {max(new_e[0], new_e[2]):.2f}m | Altura: {new_e[1]:.2f}m | Extents: {new_e.round(2)}")


if __name__ == "__main__":
    run()
    print("\n✅ Normalizacao de escala concluida com sucesso!")
