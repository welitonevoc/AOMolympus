#!/usr/bin/env python3
"""
Extrator e Decodificador Universal de Texturas BAR/DDT (Age of Mythology: Olympus)
Decodifica texturas compactadas DXT1, DXT3, DXT5 e RGBA nativas do AoM para PNGs
com renomeação exclusiva do Olympus.
"""

import os
import struct
import numpy as np
from PIL import Image

def unpack_rgb565(c):
    r = (c >> 11) & 0x1f
    g = (c >> 5) & 0x3f
    b = c & 0x1f
    return (r * 255 // 31, g * 255 // 63, b * 255 // 31)

def decode_dxt1_block(block):
    c0, c1, lookup = struct.unpack('<HHI', block)
    rgb0 = unpack_rgb565(c0)
    rgb1 = unpack_rgb565(c1)
    
    if c0 > c1:
        colors = [
            (rgb0[0], rgb0[1], rgb0[2], 255),
            (rgb1[0], rgb1[1], rgb1[2], 255),
            ((2*rgb0[0] + rgb1[0])//3, (2*rgb0[1] + rgb1[1])//3, (2*rgb0[2] + rgb1[2])//3, 255),
            ((rgb0[0] + 2*rgb1[0])//3, (rgb0[1] + 2*rgb1[1])//3, (rgb0[2] + 2*rgb1[2])//3, 255)
        ]
    else:
        colors = [
            (rgb0[0], rgb0[1], rgb0[2], 255),
            (rgb1[0], rgb1[1], rgb1[2], 255),
            ((rgb0[0] + rgb1[0])//2, (rgb0[1] + rgb1[1])//2, (rgb0[2] + rgb1[2])//2, 255),
            (0, 0, 0, 0) # transparente
        ]
        
    pixels = []
    for i in range(16):
        idx = (lookup >> (2*i)) & 0x03
        pixels.append(colors[idx])
    return pixels

def decode_dxt3_block(block):
    alpha_bytes = block[:8]
    color_bytes = block[8:]
    alphas = []
    for byte in alpha_bytes:
        alphas.append((byte & 0x0f) * 17)
        alphas.append(((byte >> 4) & 0x0f) * 17)
        
    c0, c1, lookup = struct.unpack('<HHI', color_bytes)
    rgb0 = unpack_rgb565(c0)
    rgb1 = unpack_rgb565(c1)
    
    colors = [
        rgb0,
        rgb1,
        ((2*rgb0[0] + rgb1[0])//3, (2*rgb0[1] + rgb1[1])//3, (2*rgb0[2] + rgb1[2])//3),
        ((rgb0[0] + 2*rgb1[0])//3, (rgb0[1] + 2*rgb1[1])//3, (rgb0[2] + 2*rgb1[2])//3)
    ]
    
    pixels = []
    for i in range(16):
        idx = (lookup >> (2*i)) & 0x03
        r, g, b = colors[idx]
        a = alphas[i]
        pixels.append((r, g, b, a))
    return pixels

def decode_dxt5_block(block):
    a0 = block[0]
    a1 = block[1]
    a_lookup = int.from_bytes(block[2:8], 'little')
    
    if a0 > a1:
        alphas = [
            a0, a1,
            (6*a0 + 1*a1)//7,
            (5*a0 + 2*a1)//7,
            (4*a0 + 3*a1)//7,
            (3*a0 + 4*a1)//7,
            (2*a0 + 5*a1)//7,
            (1*a0 + 6*a1)//7
        ]
    else:
        alphas = [
            a0, a1,
            (4*a0 + 1*a1)//5,
            (3*a0 + 2*a1)//5,
            (2*a0 + 3*a1)//5,
            (1*a0 + 4*a1)//5,
            0, 255
        ]
        
    color_bytes = block[8:]
    c0, c1, lookup = struct.unpack('<HHI', color_bytes)
    rgb0 = unpack_rgb565(c0)
    rgb1 = unpack_rgb565(c1)
    
    colors = [
        rgb0, rgb1,
        ((2*rgb0[0] + rgb1[0])//3, (2*rgb0[1] + rgb1[1])//3, (2*rgb0[2] + rgb1[2])//3),
        ((rgb0[0] + 2*rgb1[0])//3, (rgb0[1] + 2*rgb1[1])//3, (rgb0[2] + 2*rgb1[2])//3)
    ]
    
    pixels = []
    for i in range(16):
        a_idx = (a_lookup >> (3*i)) & 0x07
        c_idx = (lookup >> (2*i)) & 0x03
        r, g, b = colors[c_idx]
        a = alphas[a_idx]
        pixels.append((r, g, b, a))
    return pixels

def decode_ddt(content):
    if len(content) < 48:
        return None
    if content[:4] != b'RTS3':
        return None
        
    w, h = struct.unpack('<II', content[8:16])
    fmt = struct.unpack('<I', content[16:20])[0]
    data_offset = struct.unpack('<I', content[24:28])[0]
    
    if w == 0 or h == 0 or w > 2048 or h > 2048:
        return None
        
    data = content[data_offset:]
    out_img = np.zeros((h, w, 4), dtype=np.uint8)
    
    # Detecção do formato pelo tamanho dos dados
    # DXT1: (w*h)/2 bytes
    # DXT3/5: w*h bytes
    # RGBA: w*h*4 bytes
    blocks_w = (w + 3) // 4
    blocks_h = (h + 3) // 4
    total_blocks = blocks_w * blocks_h
    
    if len(data) >= total_blocks * 16:
        # DXT3 / DXT5
        block_idx = 0
        for by in range(0, h, 4):
            for bx in range(0, w, 4):
                block = data[block_idx*16:(block_idx+1)*16]
                block_idx += 1
                # Try DXT3 by default, handles crisp icons perfectly
                pixs = decode_dxt3_block(block)
                for py in range(min(4, h - by)):
                    for px in range(min(4, w - bx)):
                        out_img[by+py, bx+px] = pixs[py*4 + px]
        return Image.fromarray(out_img, 'RGBA')
        
    elif len(data) >= total_blocks * 8:
        # DXT1
        block_idx = 0
        for by in range(0, h, 4):
            for bx in range(0, w, 4):
                block = data[block_idx*8:(block_idx+1)*8]
                block_idx += 1
                pixs = decode_dxt1_block(block)
                for py in range(min(4, h - by)):
                    for px in range(min(4, w - bx)):
                        out_img[by+py, bx+px] = pixs[py*4 + px]
        return Image.fromarray(out_img, 'RGBA')
        
    elif len(data) >= w * h * 4:
        # Raw BGRA
        raw_arr = np.frombuffer(data[:w*h*4], dtype=np.uint8).reshape((h, w, 4))
        out_img[:, :, 0] = raw_arr[:, :, 2]
        out_img[:, :, 1] = raw_arr[:, :, 1]
        out_img[:, :, 2] = raw_arr[:, :, 0]
        out_img[:, :, 3] = raw_arr[:, :, 3]
        return Image.fromarray(out_img, 'RGBA')
        
    elif len(data) >= w * h * 3:
        # Raw BGR
        raw_arr = np.frombuffer(data[:w*h*3], dtype=np.uint8).reshape((h, w, 3))
        out_img[:, :, 0] = raw_arr[:, :, 2]
        out_img[:, :, 1] = raw_arr[:, :, 1]
        out_img[:, :, 2] = raw_arr[:, :, 0]
        out_img[:, :, 3] = 255
        return Image.fromarray(out_img, 'RGBA')

    return None

def extract_categories_from_bar(bar_path, target_rules):
    """
    target_rules: list of (pattern, target_dir, name_generator)
    """
    if not os.path.exists(bar_path):
        return 0
        
    with open(bar_path, 'rb') as f:
        f.seek(0x0c)
        n_files = struct.unpack('<I', f.read(4))[0]
        f.seek(0x14)
        fat_offset = struct.unpack('<I', f.read(4))[0]
        f.seek(fat_offset)
        offsets = [struct.unpack('<I', f.read(4))[0] for _ in range(n_files)]
        base_strings = fat_offset + n_files * 4
        
        extracted_count = 0
        for off in offsets:
            f.seek(base_strings + off)
            foff, fsz, fcsz, ftime, namelen = struct.unpack('<IIIIH', f.read(18))
            f.seek(base_strings + off + 20)
            name_raw = f.read(namelen)
            name = name_raw.split(b'\x00')[0].decode('latin1', errors='ignore')
            name_clean = name.replace('\\', '/').lower().strip()
            
            for pattern, target_dir, name_fn in target_rules:
                if pattern in name_clean:
                    out_name = name_fn(name_clean)
                    if not out_name:
                        continue
                    out_path = os.path.join(target_dir, out_name)
                    os.makedirs(target_dir, exist_ok=True)
                    
                    f.seek(foff)
                    content = f.read(fsz)
                    img = decode_ddt(content)
                    if img is not None:
                        img.save(out_path, format='PNG')
                        extracted_count += 1
                        break
                        
        print(f"Extracted {extracted_count} textures from {os.path.basename(bar_path)}")
        return extracted_count

def sanitize_name(original_name, prefix="olympus_"):
    clean = original_name.replace('\x00', '').strip()
    base = os.path.splitext(os.path.basename(clean))[0]
    base = base.replace("icon ", "").replace(" 64", "").replace(" ", "_")
    base = base.replace("-", "_").replace("__", "_")
    base = "".join([c for c in base if c.isalnum() or c == '_'])
    return f"{prefix}{base}.png"

def main():
    print("Iniciando extração e decodificação do acervo de texturas BAR...")
    
    rules = [
        # Recursos
        ("icon resource", "assets/ui/icons/resources", lambda n: sanitize_name(n, "olympus_res_")),
        # Deuses
        ("icons/god", "assets/ui/icons/gods", lambda n: sanitize_name(n, "olympus_deity_")),
        # Edificações
        ("icon building", "assets/ui/icons/buildings", lambda n: sanitize_name(n, "olympus_struct_")),
        # Tecnologias / Melhorias
        ("icons/improvement", "assets/ui/icons/tech", lambda n: sanitize_name(n, "olympus_upgrade_")),
        # Habilidades especiais / Míticas
        ("icons/special", "assets/ui/icons/skills", lambda n: sanitize_name(n, "olympus_ability_")),
        # Classes e estatísticas
        ("icon class", "assets/ui/icons/stats", lambda n: sanitize_name(n, "olympus_class_")),
        ("icon stat", "assets/ui/icons/stats", lambda n: sanitize_name(n, "olympus_stat_")),
    ]
    
    total = 0
    total += extract_categories_from_bar("/sdcard/aom/textures/textures.bar", rules)
    total += extract_categories_from_bar("/sdcard/aom/textures/textures2.bar", rules)
    print(f"Concluída a extração com sucesso! Total de {total} ícones e texturas convertidos para o Olympus.")

if __name__ == "__main__":
    main()
