"""
Pipeline de Texturização HD e Alinhamento do Colosso Neural 3D
Projeto: Age of Mythology: Olympus
Autor: Antigravity AI

Este script transforma a malha neural crua gerada pelo TripoSR em um asset 3D de qualidade AAA:
1. Re-orienta a malha: Ombros no eixo X, altura no eixo Y (pés no chão Y=0), peitoral frontal no eixo +Z.
2. Gera atlas de texturas HD 2048x1024:
   - Difuso (Frontal com a foto original 1024x1024 + Traseira com armadura de bronze grega autêntica)
   - Normal Map (detalhes de alto relevo das placas musculares e arabescos)
   - Emissive Map (olhos flamejantes e veias de magma com brilho intenso)
   - Roughness Map (polimento do bronze vs rugosidade das fendas de pedra vulcânica)
3. Mapeia coordenadas UV por face com divisão limpa (sem costuras/alongamentos).
4. Exporta para GLB PBR e OBJ.
"""

import os
import trimesh
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import sobel, binary_dilation

def build_hd_textured_colossus():
    print("--- [1/5] Carregando malha neural base ---")
    obj_path = 'models/units/colosso_neural_gerado.obj'
    if not os.path.exists(obj_path):
        raise FileNotFoundError(f"Arquivo {obj_path} não encontrado!")

    mesh = trimesh.load(obj_path, process=False)
    v = mesh.vertices.copy()
    faces = mesh.faces.copy()

    # Rotação para sistema padrão (X=largura/ombros, Y=altura, Z=profundidade)
    # Z_old era largura, Y_old era altura, X_old era profundidade (com min(X) sendo a frente)
    v_new = np.zeros_like(v)
    v_new[:, 0] = v[:, 2]        # Ombros no eixo X
    v_new[:, 1] = v[:, 1]        # Altura no eixo Y
    v_new[:, 2] = -v[:, 0]       # Frente do peitoral no eixo +Z (virado para a câmera)

    # Centralizar horizontalmente e colocar os pés no plano Y=0
    x_min, x_max = v_new[:, 0].min(), v_new[:, 0].max()
    y_min, y_max = v_new[:, 1].min(), v_new[:, 1].max()
    z_min, z_max = v_new[:, 2].min(), v_new[:, 2].max()

    v_new[:, 0] -= (x_min + x_max) / 2.0
    v_new[:, 1] -= y_min
    v_new[:, 2] -= (z_min + z_max) / 2.0

    # Desempacotar vértices por face (para garantir UVs limpos e contínuos sem seam artifacts)
    unrolled_v = v_new[faces.flatten()]
    num_faces = len(faces)
    unrolled_faces = np.arange(len(unrolled_v)).reshape(-1, 3)

    model_mesh = trimesh.Trimesh(vertices=unrolled_v, faces=unrolled_faces, process=False)
    print(f"Malha re-orientada: {len(model_mesh.vertices)} vértices, {len(model_mesh.faces)} faces")
    print(f"Dimensões: X={model_mesh.extents[0]:.2f}, Y={model_mesh.extents[1]:.2f}, Z={model_mesh.extents[2]:.2f}")

    print("--- [2/5] Gerando Atlas de Texturas HD (2048x1024) ---")
    os.makedirs('assets/textures', exist_ok=True)
    ref_img_path = 'assets/images/colossus_nobg.png'
    ref_img = Image.open(ref_img_path).convert('RGBA')

    # Dilação de bordas na frente para evitar fringing transparente
    ref_arr = np.array(ref_img)
    alpha = ref_arr[:, :, 3] > 10
    dilated_rgb = ref_arr[:, :, :3].copy()
    
    # Criar fundo de bronze onde alpha é transparente
    mean_bronze = [108, 86, 61]
    for c in range(3):
        channel = dilated_rgb[:, :, c]
        channel[~alpha] = mean_bronze[c]
        dilated_rgb[:, :, c] = channel

    front_img = Image.fromarray(dilated_rgb)

    # Criar textura de costas da armadura (Backplate de bronze com espinha dorsal e magma)
    back_arr = np.zeros((1024, 1024, 3), dtype=np.uint8)
    # Gradiente de bronze e vinheta
    for y in range(1024):
        for x in range(1024):
            dx = abs(x - 512) / 512.0
            dy = y / 1024.0
            base = np.array(mean_bronze, dtype=float)
            # Sombras laterais e volume
            shade = 1.0 - 0.35 * (dx ** 2)
            # Destaque da crista do capacete no topo
            if dy < 0.15 and dx < 0.08:
                base = np.array([75, 20, 15], dtype=float)
            # Placas escapulares
            if 0.2 < dy < 0.45 and 0.15 < dx < 0.4:
                shade += 0.12 * np.sin(dy * 30.0)
            # Crista espinhal central
            if dx < 0.04 and 0.2 < dy < 0.8:
                shade += 0.25
            back_arr[y, x] = np.clip(base * shade, 0, 255).astype(np.uint8)

    # Adicionar veias de magma na coluna dorsal das costas
    for y in range(250, 800):
        # Linha de magma com wobble sutil
        center_x = int(512 + 8 * np.sin(y * 0.05))
        back_arr[y, center_x-2:center_x+3] = [255, 120, 20]
        back_arr[y, center_x-1:center_x+2] = [255, 220, 80]
        # Vents transversais nos discos vertebrais
        if y % 45 < 4:
            back_arr[y, center_x-24:center_x+25] = [240, 100, 10]
            back_arr[y, center_x-16:center_x+17] = [255, 200, 50]

    back_img = Image.fromarray(back_arr).filter(ImageFilter.GaussianBlur(0.8))

    # Montar Atlas Difuso 2048x1024
    atlas_diffuse = Image.new('RGB', (2048, 1024))
    atlas_diffuse.paste(front_img, (0, 0))
    atlas_diffuse.paste(back_img, (1024, 0))
    atlas_diffuse.save('assets/textures/colosso_diffuse_hd.png', quality=95)
    print("Salvo: assets/textures/colosso_diffuse_hd.png (2048x1024)")

    # Atlas Emissivo (fogo e magma nos olhos, peitoral e espinha)
    diffuse_arr = np.array(atlas_diffuse).astype(float)
    r, g, b = diffuse_arr[:, :, 0], diffuse_arr[:, :, 1], diffuse_arr[:, :, 2]
    is_fire = (r > 165) & (g > 65) & (r - b > 40)
    atlas_emissive = np.zeros((1024, 2048, 3), dtype=np.uint8)
    atlas_emissive[is_fire, 0] = np.clip(r[is_fire] * 1.2, 0, 255).astype(np.uint8)
    atlas_emissive[is_fire, 1] = np.clip(g[is_fire] * 1.0, 0, 255).astype(np.uint8)
    atlas_emissive[is_fire, 2] = np.clip(b[is_fire] * 0.4, 0, 255).astype(np.uint8)
    Image.fromarray(atlas_emissive).save('assets/textures/colosso_emissive_hd.png')
    print("Salvo: assets/textures/colosso_emissive_hd.png (2048x1024)")

    # Atlas Normal Map (relevos e entalhes via filtro Sobel)
    gray = diffuse_arr.mean(axis=2) / 255.0
    dx = sobel(gray, axis=1) * 3.5
    dy = -sobel(gray, axis=0) * 3.5
    dz = np.ones_like(dx)
    norm = np.sqrt(dx**2 + dy**2 + dz**2)
    dx /= norm; dy /= norm; dz /= norm
    atlas_normal = np.zeros((1024, 2048, 3), dtype=np.uint8)
    atlas_normal[:, :, 0] = np.clip((dx * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
    atlas_normal[:, :, 1] = np.clip((dy * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
    atlas_normal[:, :, 2] = np.clip((dz * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
    Image.fromarray(atlas_normal).save('assets/textures/colosso_normal_hd.png')
    print("Salvo: assets/textures/colosso_normal_hd.png (2048x1024)")

    # Atlas Roughness (bronze polido ~0.35, relevos e fendas ~0.7)
    atlas_roughness = np.full((1024, 2048), 90, dtype=np.uint8)  # ~0.35 rugosidade base
    dark_crevices = (diffuse_arr.mean(axis=2) < 60)
    atlas_roughness[dark_crevices] = 180  # ~0.70 rugosidade em fissuras
    atlas_roughness[is_fire] = 50        # ~0.20 rugosidade no magma
    Image.fromarray(atlas_roughness).save('assets/textures/colosso_roughness_hd.png')
    print("Salvo: assets/textures/colosso_roughness_hd.png (2048x1024)")

    print("--- [3/5] Calculando coordenadas UV precisas por face ---")
    face_normals = model_mesh.face_normals
    # Cada face tem 3 vértices consecutivos em unrolled_v
    uvs = np.zeros((len(unrolled_v), 2), dtype=float)

    # Parâmetros de calibração do modelo para a foto
    # Largura do modelo em 3D: 0.574 -> 512px
    # Altura do modelo em 3D: 1.023 -> 960px
    x_scale = 512.0 / 0.57377
    y_scale = 960.0 / 1.02308
    center_px = 498.0
    base_py = 970.0

    for f_idx in range(num_faces):
        nz = face_normals[f_idx, 2]
        is_front = (nz >= -0.05)
        v_indices = unrolled_faces[f_idx]

        for vi in v_indices:
            vx = unrolled_v[vi, 0]
            vy = unrolled_v[vi, 1]

            if is_front:
                # Metade esquerda do atlas [0.0 .. 0.5]
                px = np.clip(center_px + vx * x_scale, 0, 1023)
                py = np.clip(base_py - vy * y_scale, 0, 1023)
                u = (px / 1024.0) * 0.5
                v_coord = 1.0 - (py / 1024.0)
            else:
                # Metade direita do atlas [0.5 .. 1.0] (espelhado para casar com os ombros)
                px = np.clip(center_px - vx * x_scale, 0, 1023)
                py = np.clip(base_py - vy * y_scale, 0, 1023)
                u = 0.5 + (px / 1024.0) * 0.5
                v_coord = 1.0 - (py / 1024.0)

            uvs[vi, 0] = u
            uvs[vi, 1] = v_coord

    print("--- [4/5] Vinculando PBR Material e Exportando GLB ---")
    pbr_mat = trimesh.visual.material.PBRMaterial(
        name="ColossusBronzePBR",
        baseColorTexture=atlas_diffuse,
        metallicFactor=0.85,
        roughnessFactor=0.35,
        emissiveTexture=Image.fromarray(atlas_emissive),
        emissiveFactor=[1.0, 1.0, 1.0]
    )

    model_mesh.visual = trimesh.visual.TextureVisuals(
        uv=uvs,
        material=pbr_mat
    )

    # Exportar GLB otimizado
    glb_data = trimesh.exchange.gltf.export_glb(model_mesh)
    glb_out_path = 'models/units/colosso_neural_gerado.glb'
    with open(glb_out_path, 'wb') as f:
        f.write(glb_data)
    print(f"Salvo GLB PBR HD: {glb_out_path} ({len(glb_data) / 1024:.1f} KB)")

    # Exportar também OBJ com MTL para compatibilidade total
    model_mesh.export('models/units/colosso_neural_gerado.obj')
    print("Salvo OBJ HD: models/units/colosso_neural_gerado.obj")

    print("--- [5/5] Concluído com sucesso! ---")

if __name__ == '__main__':
    build_hd_textured_colossus()
