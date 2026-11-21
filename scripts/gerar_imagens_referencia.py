#!/usr/bin/env python3
"""Gera imagens de referência para cada categoria de construção da cidade.
Estas imagens são usadas pelo ComfyUI Trellis 2 para gerar modelos 3D."""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "/storage/emulated/0/Documents/age of mythology olympus/models/referencias_cidade"

CATEGORIAS = {
    "town_center": {
        "desc": "Centro da cidade, grande edifício com colunas, telhado dourado, arquitetura clássica",
        "colors": ["#8B4513", "#D4AF37", "#FFFFFF"],
    },
    "temples": {
        "desc": "Templo com colunas altas, frontão triangular, estátuas, arquitetura sagrada",
        "colors": ["#D4AF37", "#FFFFFF", "#8B4513"],
    },
    "barracks": {
        "desc": "Quartel militar, edifício retangular com escudos, armas na parede, portão forte",
        "colors": ["#5C4033", "#8B0000", "#C0C0C0"],
    },
    "fortresses": {
        "desc": "Fortaleza com torres de canto, muros grossos, aparência defensiva imponente",
        "colors": ["#708090", "#2F4F4F", "#808080"],
    },
    "towers": {
        "desc": "Torre de vigia alta, estreita, com observatório no topo, telhado pontiagudo",
        "colors": ["#8B4513", "#D2B48C", "#4A4A4A"],
    },
    "houses": {
        "desc": "Casa residencial simples, telhado inclinado, chaminé, porta e janelas",
        "colors": ["#8B4513", "#D2B48C", "#FFFFFF"],
    },
    "divine_altar": {
        "desc": "Altar divino sagrado, pedestal elevado, colunas douradas, orbe flutuante no topo",
        "colors": ["#D4AF37", "#FFFFFF", "#FFD700"],
    },
    "geografica": {
        "desc": "Elemento geográfico, rocha, formação de terreno, penhasco natural",
        "colors": ["#708090", "#2F4F4F", "#556B2F"],
    },
}

def get_font(size):
    """Tenta carregar uma fonte, com fallback para padrão."""
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except:
        try:
            return ImageFont.truetype("/system/fonts/Roboto-Bold.ttf", size)
        except:
            return ImageFont.load_default()

def gerar_imagem(categoria, info, nome_arquivo):
    """Gera uma imagem de referência para uma categoria de construção."""
    largura, altura = 512, 512
    img = Image.new("RGB", (largura, altura), (240, 240, 240))
    draw = ImageDraw.Draw(img)

    cor_base = info["colors"][0]
    cor_destaque = info["colors"][1] if len(info["colors"]) > 1 else "#FFFFFF"
    cor_acento = info["colors"][2] if len(info["colors"]) > 2 else "#808080"

    # Desenha algo baseado na categoria
    centro_x, centro_y = largura // 2, altura // 2

    if categoria == "town_center":
        # Edifício central com colunas
        draw.rectangle([centro_x - 90, centro_y - 100, centro_x + 90, centro_y + 100], fill=cor_base)
        draw.rectangle([centro_x - 60, centro_y - 140, centro_x + 60, centro_y - 100], fill=cor_destaque)  # Telhado
        for cx in [centro_x - 70, centro_x - 20, centro_x + 20, centro_x + 70]:
            draw.rectangle([cx - 8, centro_y - 50, cx + 8, centro_y + 100], fill=cor_acento)  # Colunas

    elif categoria == "temples":
        # Templo com frontão triangular
        draw.rectangle([centro_x - 80, centro_y - 80, centro_x + 80, centro_y + 80], fill=cor_base)
        draw.polygon([(centro_x, centro_y - 120), (centro_x - 100, centro_y - 60), (centro_x + 100, centro_y - 60)], fill=cor_destaque)
        for cx in [centro_x - 60, centro_x + 60]:
            draw.rectangle([cx - 6, centro_y - 60, cx + 6, centro_y + 80], fill=cor_acento)

    elif categoria == "barracks":
        # Quartel com escudos
        draw.rectangle([centro_x - 80, centro_y - 80, centro_x + 80, centro_y + 80], fill=cor_base)
        draw.rectangle([centro_x - 40, centro_y - 120, centro_x + 40, centro_y - 80], fill=cor_destaque)  # Telhado
        draw.ellipse([centro_x - 30, centro_y - 30, centro_x + 30, centro_y + 30], fill=cor_acento)  # Escudo

    elif categoria == "fortresses":
        # Fortaleza com torres de canto
        draw.rectangle([centro_x - 90, centro_y - 90, centro_x + 90, centro_y + 90], fill=cor_base)
        for dx, dy in [(-70, -70), (70, -70), (-70, 70), (70, 70)]:
            draw.rectangle([centro_x + dx - 15, centro_y + dy - 30, centro_x + dx + 15, centro_y + dy + 30], fill=cor_acento)

    elif categoria == "towers":
        # Torre alta
        draw.rectangle([centro_x - 30, centro_y - 150, centro_x + 30, centro_y + 50], fill=cor_base)
        draw.polygon([(centro_x, centro_y - 180), (centro_x - 40, centro_y - 140), (centro_x + 40, centro_y - 140)], fill=cor_destaque)
        draw.rectangle([centro_x - 45, centro_y - 130, centro_x + 45, centro_y - 110], fill=cor_acento)  # Observatório

    elif categoria == "houses":
        # Casa simples
        draw.rectangle([centro_x - 60, centro_y - 60, centro_x + 60, centro_y + 60], fill=cor_base)
        draw.polygon([(centro_x, centro_y - 100), (centro_x - 80, centro_y - 60), (centro_x + 80, centro_y - 60)], fill=cor_destaque)
        draw.rectangle([centro_x - 15, centro_y + 20, centro_x + 15, centro_y + 60], fill=cor_acento)  # Porta

    elif categoria == "divine_altar":
        # Altar sagrado com pedestal e orbe
        draw.rectangle([centro_x - 100, centro_y - 50, centro_x + 100, centro_y + 20], fill=cor_base)  # Plinto
        draw.rectangle([centro_x - 30, centro_y - 130, centro_x + 30, centro_y - 50], fill=cor_acento)  # Pedestal
        draw.ellipse([centro_x - 40, centro_y - 170, centro_x + 40, centro_y - 130], fill=cor_destaque)  # Orbe

    elif categoria == "geografica":
        # Formação rochosa
        pontos = [(centro_x - 80, centro_y + 40), (centro_x - 40, centro_y - 60), (centro_x, centro_y - 100),
                  (centro_x + 40, centro_y - 60), (centro_x + 80, centro_y + 40)]
        draw.polygon(pontos, fill=cor_base)

    # Texto da categoria
    font = get_font(32)
    texto = categoria.replace("_", " ").title()
    bbox = draw.textbbox((0, 0), texto, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((largura // 2 - tw // 2, altura - 40), texto, fill=(50, 50, 50), font=font)

    img.save(nome_arquivo, "PNG")
    print(f"Gerado: {nome_arquivo}")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for categoria, info in CATEGORIAS.items():
        nome_arquivo = os.path.join(OUTPUT_DIR, f"{categoria}.png")
        gerar_imagem(categoria, info, nome_arquivo)
    print(f"\nImagens geradas em: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()