#!/usr/bin/env python3
"""
setup_olympus_menu_assets.py
Copia e padroniza os retratos dos Deuses e vinhetas dos Mapas em assets/ui/
com nomes canônicos do Age of Mythology: Olympus.
"""

import os
import shutil

SRC_DIR = "godot_src/ui/portraits"
DEST_PORTRAITS = "assets/ui/portraits"
DEST_MAPS = "assets/ui/maps"
DEST_BG = "assets/ui/backgrounds"

os.makedirs(DEST_PORTRAITS, exist_ok=True)
os.makedirs(DEST_MAPS, exist_ok=True)
os.makedirs(DEST_BG, exist_ok=True)

GOD_MAPPINGS = {
    "zeus_major.jpg": "god_zeus_1795121378343.jpg",
    "poseidon_major.jpg": "god_poseidon_1795121381693.jpg",
    "hades_major.jpg": "god_hades_1795121382402.jpg",
    "demeter_major.jpg": "god_demeter_1795121446731.jpg",
    "ra_major.jpg": "god_ra_1795121377571.jpg",
    "isis_major.jpg": "god_isis_1795121377823.jpg",
    "set_major.jpg": "god_set_1795121442507.jpg",
    "thor_major.jpg": "god_thor_1795121380520.jpg",
    "odin_major.jpg": "god_odin_1795121378948.jpg",
    "loki_major.jpg": "god_loki_1795121492099.jpg",
    "freyr_major.jpg": "god_freyr_1795121379821.jpg",
    "cronos_major.jpg": "god_cronos_1795121376307.jpg",
    "oranos_major.jpg": "god_urano_1795121379668.jpg",
    "gaia_major.jpg": "god_gaia_1795121443392.jpg",
    "fuxi_major.jpg": "god_fuxi_1795121379264.jpg",
    "nuwa_major.jpg": "god_nuwa_1795121442653.jpg",
    "shennong_major.jpg": "god_shennong_1795121385670.jpg",
    # Menores
    "minor_anubis.jpg": "minor_anubis_1795121379262.jpg",
    "minor_apollo.jpg": "minor_apollo_1795121444032.jpg",
    "minor_ares.jpg": "minor_ares_1795121389862.jpg",
    "minor_athena.jpg": "minor_athena_1795121377095.jpg",
    "minor_freyja.jpg": "minor_freyja_1795121441841.jpg",
    "minor_hel.jpg": "minor_hel_1795121380282.jpg",
    "minor_horus.jpg": "minor_horus_1794937407134.jpg",
    "minor_prometheus.jpg": "minor_prometheus_1794937410006.jpg",
    "minor_skadi.jpg": "minor_skadi_1794937409845.jpg",
}

MAP_MAPPINGS = {
    "mediterranean.jpg": "map_aegean_islands_1795121379463.jpg",
    "nile_desert.jpg": "map_nile_desert_1795121378637.jpg",
    "nordic_tundra.jpg": "map_nordic_fjords_1795121376458.jpg",
    "erebus_volcanic.jpg": "map_erebus_lava_1795121380261.jpg",
    "savannah_jungle.jpg": "map_savannah_jungle_1795121381811.jpg",
}

BG_MAPPINGS = {
    "olympus_citadel_hero.jpg": "olympus_citadel_hero_1794768157018.jpg"
}

def process():
    print("Iniciando cópia e padronização dos assets do Menu...")
    for target_name, src_name in GOD_MAPPINGS.items():
        src_path = os.path.join(SRC_DIR, src_name)
        dest_path = os.path.join(DEST_PORTRAITS, target_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            print(f"  [Deus] {src_name} -> {target_name}")

    for target_name, src_name in MAP_MAPPINGS.items():
        src_path = os.path.join(SRC_DIR, src_name)
        dest_path = os.path.join(DEST_MAPS, target_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            print(f"  [Mapa] {src_name} -> {target_name}")

    for target_name, src_name in BG_MAPPINGS.items():
        src_path = os.path.join(SRC_DIR, src_name)
        dest_path = os.path.join(DEST_BG, target_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            print(f"  [Fundo] {src_name} -> {target_name}")

    # Remove godot_src/ui/portraits para manter o repo limpo
    shutil.rmtree("godot_src", ignore_errors=True)
    print("Processamento concluído com sucesso!")

if __name__ == "__main__":
    process()
