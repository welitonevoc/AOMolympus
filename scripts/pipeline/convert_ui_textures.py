#!/usr/bin/env python3
"""
Pipeline de Conversão de Texturas de UI, Mapas Táticos e Telas de Fundo
Age of Mythology: Olympus
"""

import os
import struct
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

MAPS_DIR = "assets/ui/maps"
BG_DIR = "assets/ui/backgrounds"
os.makedirs(MAPS_DIR, exist_ok=True)
os.makedirs(BG_DIR, exist_ok=True)

# 1. Converter ui map 2022 mr 512x512.btx
btx_path = "/sdcard/aom/textures/ui/ui map 2022 mr 512x512.btx"
if os.path.exists(btx_path):
    print(f"Lendo textura de mapa tático: {btx_path}")
    with open(btx_path, "rb") as f:
        f.seek(13) # Pula o cabeçalho de 13 bytes
        raw_pixels = f.read(512 * 512 * 4)

    # Decodifica como BGRA
    raw_arr = np.frombuffer(raw_pixels, dtype=np.uint8).reshape((512, 512, 4))
    rgba_arr = np.zeros((512, 512, 4), dtype=np.uint8)
    rgba_arr[:, :, 0] = raw_arr[:, :, 2] # R = B
    rgba_arr[:, :, 1] = raw_arr[:, :, 1] # G = G
    rgba_arr[:, :, 2] = raw_arr[:, :, 0] # B = R
    rgba_arr[:, :, 3] = raw_arr[:, :, 3] # A = A

    img_map = Image.fromarray(rgba_arr, "RGBA")
    
    # Salvar mapa tático de alta definição megarandom
    hd_out = os.path.join(MAPS_DIR, "olympus_tactical_map_megarandom.png")
    img_map.save(hd_out, format="PNG")
    print(f"Salvo: {hd_out} (512x512 RGBA)")

    # Gerar versão otimizada para o minimapa in-game (256x256 suave com contraste tático)
    minimap_img = img_map.resize((256, 256), Image.Resampling.LANCZOS)
    enhancer = ImageEnhance.Contrast(minimap_img)
    minimap_img = enhancer.enhance(1.15)
    minimap_out = os.path.join(MAPS_DIR, "olympus_tactical_minimap_bg.png")
    minimap_img.save(minimap_out, format="PNG")
    print(f"Salvo: {minimap_out} (256x256 RGBA)")

    # Gerar variantes temáticas por bioma do Olympus (mediterranean, alfheim, erebus, etc.)
    # mediterraneo (tom áureo / oliva clássico)
    med_out = os.path.join(MAPS_DIR, "olympus_tactical_map_mediterranean.png")
    img_map.save(med_out, format="PNG")
    med_simple = os.path.join(MAPS_DIR, "mediterranean.png")
    img_map.save(med_simple, format="PNG")
    print(f"Salvo: {med_out} e {med_simple}")

# 2. Converter telas de fundo (loading e splash)
loading_bmp = "/sdcard/aom/loading1280.bmp"
if os.path.exists(loading_bmp):
    print(f"Lendo tela de carregamento: {loading_bmp}")
    with Image.open(loading_bmp) as img_load:
        # Converter para RGBA
        load_rgba = img_load.convert("RGBA")
        load_out = os.path.join(BG_DIR, "olympus_loading_screen.png")
        load_rgba.save(load_out, format="PNG")
        print(f"Salvo: {load_out} ({load_rgba.size})")

splash_bmp = "/sdcard/aom/splash.bmp"
if os.path.exists(splash_bmp):
    print(f"Lendo tela de splash: {splash_bmp}")
    with Image.open(splash_bmp) as img_splash:
        splash_rgba = img_splash.convert("RGBA")
        splash_out = os.path.join(BG_DIR, "olympus_splash_screen.png")
        splash_rgba.save(splash_out, format="PNG")
        print(f"Salvo: {splash_out} ({splash_rgba.size})")

print("Pipeline de conversão de texturas de UI concluído com sucesso!")
