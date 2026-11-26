import math
from PIL import Image, ImageDraw, ImageFilter

def create_icons():
    # Helper to create supersampled canvas
    S = 256  # canvas size
    
    # ─── 1. FOOD / CARNE ─────────────────────────────────────────────
    img_food = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img_food)
    
    # Meat shadow
    d.ellipse([70, 70, 225, 205], fill=(0, 0, 0, 80))
    
    # Bone: two white knobs + shaft
    d.ellipse([35, 85, 75, 125], fill=(245, 240, 220, 255), outline=(160, 150, 130, 255), width=4)
    d.ellipse([45, 120, 85, 160], fill=(245, 240, 220, 255), outline=(160, 150, 130, 255), width=4)
    d.polygon([(65, 105), (110, 120), (110, 150), (65, 145)], fill=(245, 240, 220, 255))
    
    # Large roasted meat cut
    # Base dark roasted crust
    meat_pts = [
        (100, 100), (130, 65), (180, 60), (220, 85),
        (235, 130), (225, 180), (175, 210), (125, 195),
        (95, 155), (90, 125)
    ]
    d.polygon(meat_pts, fill=(130, 30, 25, 255), outline=(70, 15, 10, 255))
    
    # Tender meat center (gradient layers)
    inner_meat = [
        (110, 105), (135, 75), (175, 70), (210, 92),
        (220, 130), (212, 170), (170, 195), (130, 182),
        (105, 150), (100, 125)
    ]
    d.polygon(inner_meat, fill=(185, 45, 35, 255))
    
    # Marbling & roasted texture
    d.arc([115, 85, 205, 175], start=30, end=190, fill=(230, 110, 90, 220), width=8)
    d.arc([130, 100, 190, 160], start=45, end=210, fill=(240, 150, 130, 200), width=6)
    
    # Juicy highlight
    d.ellipse([140, 80, 185, 110], fill=(235, 95, 75, 240))
    d.ellipse([150, 86, 175, 98], fill=(255, 170, 150, 220))
    
    # Bone socket inside meat
    d.ellipse([92, 120, 125, 148], fill=(245, 235, 210, 255), outline=(180, 50, 40, 255), width=3)
    d.ellipse([98, 126, 118, 142], fill=(210, 190, 165, 255))
    
    # Fresh green sprig / herb leaves on top
    # Leaf 1
    d.polygon([(85, 70), (100, 40), (125, 45), (115, 70), (95, 75)], fill=(34, 197, 94, 255), outline=(21, 128, 61, 255), width=3)
    d.line([(95, 75), (105, 45)], fill=(134, 239, 172, 255), width=3)
    # Leaf 2
    d.polygon([(110, 68), (140, 42), (160, 55), (145, 75), (120, 75)], fill=(22, 163, 74, 255), outline=(21, 128, 61, 255), width=3)
    d.line([(120, 75), (145, 48)], fill=(134, 239, 172, 255), width=3)
    
    img_food = img_food.resize((64, 64), Image.Resampling.LANCZOS)
    img_food.save("assets/ui/icons/resources/olympus_res_resource_food.png")
    print("Saved olympus_res_resource_food.png")

    # ─── 2. WOOD / MADEIRA ───────────────────────────────────────────
    img_wood = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img_wood)
    
    # Helper to draw a single 3D angled log
    def draw_log(cx, cy, length, angle_deg, radius):
        rad = math.radians(angle_deg)
        dx = math.cos(rad) * length
        dy = math.sin(rad) * length
        
        # Log body rectangle/polygon
        perp_x = -math.sin(rad) * radius
        perp_y = math.cos(rad) * radius
        
        body_pts = [
            (cx - perp_x, cy - perp_y),
            (cx + dx - perp_x, cy + dy - perp_y),
            (cx + dx + perp_x, cy + dy + perp_y),
            (cx + perp_x, cy + perp_y)
        ]
        # Bark with gradient
        d.polygon(body_pts, fill=(120, 53, 15, 255), outline=(69, 26, 3, 255), width=3)
        # Bark ridges
        for f in [0.3, 0.6, 0.8]:
            d.line([
                (cx + dx*f - perp_x*0.9, cy + dy*f - perp_y*0.9),
                (cx + dx*f + perp_x*0.9, cy + dy*f + perp_y*0.9)
            ], fill=(85, 35, 10, 200), width=4)
            
        # Log end cross-section (ellipse)
        d.ellipse([cx - radius, cy - radius*0.8, cx + radius, cy + radius*0.8],
                  fill=(217, 119, 6, 255), outline=(90, 40, 10, 255), width=4)
        # Tree growth rings
        d.ellipse([cx - radius*0.65, cy - radius*0.55, cx + radius*0.65, cy + radius*0.55],
                  outline=(146, 64, 14, 255), width=3)
        d.ellipse([cx - radius*0.35, cy - radius*0.3, cx + radius*0.35, cy + radius*0.3],
                  outline=(146, 64, 14, 255), width=2)
        d.ellipse([cx - radius*0.12, cy - radius*0.1, cx + radius*0.12, cy + radius*0.1],
                  fill=(120, 53, 15, 255))

    # Bottom left log
    draw_log(75, 160, 110, -25, 34)
    # Bottom right log
    draw_log(135, 165, 105, -25, 34)
    # Top center log
    draw_log(105, 105, 115, -25, 36)
    
    # Golden / hemp rope binding around the logs
    rope_pts = [(125, 80), (170, 95), (195, 155), (145, 175), (100, 145), (125, 80)]
    d.line(rope_pts, fill=(245, 158, 11, 255), width=8)
    d.line(rope_pts, fill=(254, 240, 138, 255), width=3)
    
    img_wood = img_wood.resize((64, 64), Image.Resampling.LANCZOS)
    img_wood.save("assets/ui/icons/resources/olympus_res_resource_wood.png")
    print("Saved olympus_res_resource_wood.png")

    # ─── 3. GOLD / OURO ──────────────────────────────────────────────
    img_gold = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img_gold)
    
    # Shadow
    d.ellipse([45, 150, 215, 220], fill=(0, 0, 0, 70))
    
    # Coins at bottom layer
    def draw_coin(cx, cy, rx, ry, col_base, col_top):
        # Rim
        d.ellipse([cx - rx, cy - ry + 8, cx + rx, cy + ry + 8], fill=(161, 98, 7, 255))
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=col_base, outline=(180, 83, 9, 255), width=3)
        d.ellipse([cx - rx*0.75, cy - ry*0.75, cx + rx*0.75, cy + ry*0.75], outline=(254, 240, 138, 200), width=2)
        # Specular shine
        d.arc([cx - rx*0.6, cy - ry*0.6, cx + rx*0.6, cy + ry*0.6], start=180, end=300, fill=(255, 255, 255, 240), width=3)

    draw_coin(80, 175, 32, 18, (234, 179, 8, 255), (253, 224, 71, 255))
    draw_coin(175, 175, 34, 20, (234, 179, 8, 255), (253, 224, 71, 255))
    draw_coin(130, 185, 36, 21, (245, 158, 11, 255), (254, 240, 138, 255))
    
    # Golden ingots / bars in middle
    # Trapezoid 1
    d.polygon([(75, 145), (145, 125), (185, 140), (115, 160)], fill=(250, 204, 21, 255), outline=(161, 98, 7, 255), width=3)
    d.polygon([(75, 145), (115, 160), (115, 178), (75, 163)], fill=(202, 138, 4, 255), outline=(161, 98, 7, 255), width=2)
    d.polygon([(115, 160), (185, 140), (185, 158), (115, 178)], fill=(234, 179, 8, 255), outline=(161, 98, 7, 255), width=2)
    
    # Large upright gleaming gold medal / coin in front
    draw_coin(128, 110, 48, 42, (250, 204, 21, 255), (254, 240, 138, 255))
    # Embossed Greek owl / Omega in center of coin
    d.ellipse([115, 95, 141, 125], outline=(180, 83, 9, 255), width=4)
    d.line([(110, 125), (120, 125)], fill=(180, 83, 9, 255), width=4)
    d.line([(136, 125), (146, 125)], fill=(180, 83, 9, 255), width=4)
    
    # Gleam / 4-point sparkle star
    def draw_sparkle(sx, sy, size):
        d.line([(sx - size, sy), (sx + size, sy)], fill=(255, 255, 255, 255), width=3)
        d.line([(sx, sy - size), (sx, sy + size)], fill=(255, 255, 255, 255), width=3)
        d.ellipse([sx - 2, sy - 2, sx + 2, sy + 2], fill=(255, 255, 255, 255))
        
    draw_sparkle(175, 75, 14)
    draw_sparkle(70, 130, 9)
    draw_sparkle(190, 145, 8)
    
    img_gold = img_gold.resize((64, 64), Image.Resampling.LANCZOS)
    img_gold.save("assets/ui/icons/resources/olympus_res_resource_gold.png")
    print("Saved olympus_res_resource_gold.png")

    # ─── 4. FAVOR / ESCUDO DIVINO ────────────────────────────────────
    img_favor = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img_favor)
    
    # Shadow
    d.ellipse([48, 52, 212, 216], fill=(0, 0, 0, 75))
    
    # Greek hoplite round shield base (outer golden rim)
    cx, cy, r = 128, 124, 76
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(180, 83, 9, 255), outline=(120, 53, 15, 255), width=4)
    
    # Bronze outer bevel
    r2 = 68
    d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=(217, 119, 6, 255), outline=(254, 240, 138, 255), width=3)
    
    # Inner divine bronze/blue field
    r3 = 54
    d.ellipse([cx - r3, cy - r3, cx + r3, cy + r3], fill=(120, 53, 15, 255), outline=(180, 83, 9, 255), width=3)
    
    # Golden rivets around the rim
    for deg in range(0, 360, 30):
        rad = math.radians(deg)
        rx = cx + math.cos(rad) * 61
        ry = cy + math.sin(rad) * 61
        d.ellipse([rx - 4, ry - 4, rx + 4, ry + 4], fill=(254, 240, 138, 255), outline=(120, 53, 15, 255), width=1)
        
    # Central Greek Sunburst / Medusa / Zeus Lightning Emblem
    # Central boss
    d.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], fill=(250, 204, 21, 255), outline=(146, 64, 14, 255), width=3)
    # Divine rays
    for deg in range(0, 360, 45):
        rad = math.radians(deg)
        x1 = cx + math.cos(rad) * 23
        y1 = cy + math.sin(rad) * 23
        x2 = cx + math.cos(rad) * 44
        y2 = cy + math.sin(rad) * 44
        d.line([(x1, y1), (x2, y2)], fill=(254, 240, 138, 255), width=5)
        
    # Divine specular shine
    d.arc([cx - r3 + 4, cy - r3 + 4, cx + r3 - 4, cy + r3 - 4], start=210, end=330, fill=(255, 255, 255, 220), width=4)
    
    img_favor = img_favor.resize((64, 64), Image.Resampling.LANCZOS)
    img_favor.save("assets/ui/icons/resources/olympus_res_resource_favor.png")
    img_favor.save("assets/ui/icons/resources/olympus_res_resource_favor_full.png")
    print("Saved olympus_res_resource_favor.png")

    # ─── 5. POPULATION / POPULAÇÃO ───────────────────────────────────
    img_pop = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img_pop)
    
    # Shadow
    d.ellipse([45, 170, 215, 220], fill=(0, 0, 0, 60))
    
    # Helper for a Spartan/Greek crested warrior bust
    def draw_warrior(bx, by, scale, is_rear):
        alpha = 255
        tone = (148, 163, 184) if is_rear else (226, 232, 240)
        crest_col = (194, 65, 12) if is_rear else (220, 38, 38)
        gold_trim = (202, 138, 4)
        
        # Crest / Plume arc on top of helmet
        d.arc([bx - 36*scale, by - 65*scale, bx + 36*scale, by + 5*scale], start=180, end=360, fill=crest_col, width=int(14*scale))
        # Plume tail
        d.line([(bx + 32*scale, by - 25*scale), (bx + 48*scale, by + 20*scale)], fill=crest_col, width=int(10*scale))
        
        # Helmet dome
        d.ellipse([bx - 28*scale, by - 40*scale, bx + 28*scale, by + 16*scale], fill=tone, outline=gold_trim, width=int(3*scale))
        
        # Face guard / Cheek plates
        d.polygon([
            (bx - 26*scale, by - 10*scale),
            (bx - 16*scale, by + 35*scale),
            (bx - 4*scale, by + 38*scale),
            (bx - 3*scale, by + 5*scale),
            (bx + 3*scale, by + 5*scale),
            (bx + 4*scale, by + 38*scale),
            (bx + 16*scale, by + 35*scale),
            (bx + 26*scale, by - 10*scale)
        ], fill=tone, outline=gold_trim, width=int(2*scale))
        
        # T-slit eye openings (Corinthian visor)
        d.rectangle([bx - 20*scale, by - 6*scale, bx - 5*scale, by + 2*scale], fill=(30, 41, 59, 255))
        d.rectangle([bx + 5*scale, by - 6*scale, bx + 20*scale, by + 2*scale], fill=(30, 41, 59, 255))
        d.rectangle([bx - 3*scale, by - 4*scale, bx + 3*scale, by + 22*scale], fill=(30, 41, 59, 255))
        
        # Shoulders / Cuirass (body)
        d.polygon([
            (bx - 42*scale, by + 68*scale),
            (bx - 22*scale, by + 36*scale),
            (bx + 22*scale, by + 36*scale),
            (bx + 42*scale, by + 68*scale)
        ], fill=tone, outline=gold_trim, width=int(3*scale))

    # Rear warrior
    draw_warrior(160, 120, 1.05, True)
    # Front warrior
    draw_warrior(100, 135, 1.15, False)
    
    img_pop = img_pop.resize((64, 64), Image.Resampling.LANCZOS)
    img_pop.save("assets/ui/icons/resources/olympus_res_resource_population.png")
    print("Saved olympus_res_resource_population.png")

if __name__ == "__main__":
    create_icons()
