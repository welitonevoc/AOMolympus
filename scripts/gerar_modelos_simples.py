#!/usr/bin/env python3
"""
Gera modelos 3D simples (placeholder) GLB sem depender do trimesh.
Escreve arquivos GLB minimos (GLTF + binario) com caixa colorida.
Suporta categorias de cidade, terrenos e fauna.
"""

import json
import struct
import zlib
from pathlib import Path

BASE_DIR = Path('/storage/emulated/0/Documents/age of mythology olympus')
OUTPUT_DIR = BASE_DIR / 'models' / 'civilizations'

PANTHEOES = ['greek', 'egyptian', 'norse', 'atlantean', 'chinese']

ALL_DEUSES = [
    'zeus_major', 'poseidon_major', 'hades_major',
    'ra_major', 'isis_major', 'set_major',
    'thor_major', 'odin_major', 'loki_major', 'freyr_major',
    'kronos_major', 'oranos_major', 'gaia_major',
    'fuxi_major', 'nuwa_major', 'shennong_major'
]

CATEGORIAS_CIDADE = {
    'town_center':    {'size': (12, 10, 8),  'color': (200, 180, 140)},   # Centro da cidade
    'temples':        {'size': (10, 12, 10), 'color': (180, 160, 120)},  # Templos
    'barracks':       {'size': (10, 8, 6),   'color': (160, 140, 100)},  # Quartéis
    'fortresses':     {'size': (14, 12, 10), 'color': (140, 120, 90)},   # Fortalezas
    'towers':         {'size': (6, 14, 6),   'color': (150, 130, 100)},  # Torres
    'houses':         {'size': (8, 7, 5),    'color': (170, 150, 110)},  # Casas
    'divine_altar':   {'size': (8, 6, 4),    'color': (220, 200, 160)},  # Altar Divino
    'geografica':     {'size': (10, 2, 10),  'color': (100, 120, 80)},   # Elementos geograficos
}

CATEGORIAS_MAPAS = {
    'terrenos': {'size': (20, 1, 20), 'color': (80, 100, 60)},   # Terreno base
    'fauna':    {'size': (4, 3, 4),   'color': (120, 80, 60)},   # Animal/fauna simples
}


def make_box_vertices_colors(sx, sy, sz, color):
    """Gera vertices (posicao + cor) e indices de uma caixa centrada na origem."""
    r, g, b = color
    hw, hh, hd = sx / 2, sy / 2, sz / 2

    # 8 vertices da caixa
    positions = [
        (-hw, -hh, -hd), ( hw, -hh, -hd), ( hw,  hh, -hd), (-hw,  hh, -hd),  # face traseira (z=-hd)
        (-hw, -hh,  hd), ( hw, -hh,  hd), ( hw,  hh,  hd), (-hw,  hh,  hd),  # face frontal (z=hd)
    ]

    # Cores por vertex (mesma cor para todos os vertices da caixa)
    colors = [(r, g, b)] * 8

    # 12 triangulos (36 indices), ordem anti-horaria para face externa
    indices = [
        # Face traseira (z=-hd)
        0, 1, 2, 0, 2, 3,
        # Face frontal (z=hd)
        4, 6, 5, 4, 7, 6,
        # Face esquerda (x=-hw)
        4, 5, 1, 4, 1, 0,
        # Face direita (x=hw)
        5, 6, 2, 5, 2, 1,
        # Face inferior (y=-hh)
        4, 0, 1, 4, 1, 5,
        # Face superior (y=hh)
        3, 2, 6, 3, 6, 7,
    ]

    return positions, colors, indices


def build_glb(positions, colors, indices):
    """Constrói um arquivo GLB (binário) com posição + cor por vértice."""
    # ----- Dados binários -----
    # Vertex buffer: posição (3x float32) + cor (3x uint8 normalizado) por vértice
    vertex_data = bytearray()
    for pos, col in zip(positions, colors):
        vertex_data += struct.pack('<fff', *pos)          # posição
        vertex_data += struct.pack('<BBBB', *col, 255)    # cor RGBA

    # Index buffer (uint16)
    index_data = bytearray()
    for idx in indices:
        index_data += struct.pack('<H', idx)

    # Alinhamento para 4 bytes
    def align4(data):
        pad = (4 - len(data) % 4) % 4
        return data + b'\x00' * pad

    vertex_data = align4(vertex_data)
    index_data = align4(index_data)

    bin_chunk = vertex_data + index_data
    bin_byte_offset = 0  # binário começa no início do bin chunk

    # ----- GLTF JSON -----
    num_vertices = len(positions)
    num_indices = len(indices)

    vertex_byte_length = len(vertex_data)
    index_byte_length = len(index_data)
    total_bin_length = len(bin_chunk)

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Age of Mythology Olympus - Simple GLB Generator"
        },
        "scene": 0,
        "scenes": [
            {
                "nodes": [0]
            }
        ],
        "nodes": [
            {
                "mesh": 0,
                "name": "Box"
            }
        ],
        "meshes": [
            {
                "primitives": [
                    {
                        "attributes": {
                            "POSITION": 0,
                            "COLOR_0": 1
                        },
                        "indices": 2,
                        "material": 0,
                        "mode": 4  # TRIANGLES
                    }
                ],
                "name": "BoxMesh"
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5126,  # FLOAT
                "count": num_vertices,
                "type": "VEC3",
                "max": [sx / 2, sy / 2, sz / 2],
                "min": [-sx / 2, -sy / 2, -sz / 2]
            },
            {
                "bufferView": 0,
                "byteOffset": vertex_byte_length,
                "componentType": 5121,  # UNSIGNED_BYTE
                "count": num_vertices,
                "type": "VEC3",
                "normalized": True,
                "max": [255, 255, 255],
                "min": [0, 0, 0]
            },
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5123,  # UNSIGNED_SHORT
                "count": num_indices,
                "type": "SCALAR",
                "max": [num_vertices - 1],
                "min": [0]
            }
        ],
        "bufferViews": [
            {
                "buffer": 0,
                "byteOffset": 0,
                "byteLength": vertex_byte_length,
                "byteStride": 24  # 3*4 + 4 = 16 bytes... actually 12 + 4 = 16
            },
            {
                "buffer": 0,
                "byteOffset": vertex_byte_length,
                "byteLength": index_byte_length
            }
        ],
        "buffers": [
            {
                "byteLength": total_bin_length,
                "uri": ""
            }
        ],
        "materials": [
            {
                "name": "BoxMaterial",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [1.0, 1.0, 1.0, 1.0]
                }
            }
        ]
    }

    # Corrigir byteStride: posicao(12) + cor(4) = 16
    gltf["bufferViews"][0]["byteStride"] = 16

    # Corrigir max/min do primeiro accessor com valores reais
    sx, sy, sz = None, None, None  # placeholder, sera preenchido abaixo
    # Na verdade precisamos passar sx,sy,sz. Vou refatorar: usar fechamento.
    # Por simplicidade, vou retornar o gltf e os dados binarios separadamente.
    return gltf, bin_chunk


def build_glb_with_dims(positions, colors, indices, sx, sy, sz):
    """Constrói GLB com dims corretas nos accessors."""
    vertex_data = bytearray()
    for pos, col in zip(positions, colors):
        vertex_data += struct.pack('<fff', *pos)
        vertex_data += struct.pack('<BBBB', *col, 255)

    index_data = bytearray()
    for idx in indices:
        index_data += struct.pack('<H', idx)

    def align4(data):
        pad = (4 - len(data) % 4) % 4
        return data + b'\x00' * pad

    vertex_data = align4(vertex_data)
    index_data = align4(index_data)
    bin_chunk = vertex_data + index_data

    num_vertices = len(positions)
    num_indices = len(indices)
    vertex_byte_length = len(vertex_data)
    index_byte_length = len(index_data)
    total_bin_length = len(bin_chunk)

    gltf = {
        "asset": {"version": "2.0", "generator": "AoM Olympus Simple GLB"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "Box"}],
        "meshes": [{
            "primitives": [{
                "attributes": {"POSITION": 0, "COLOR_0": 1},
                "indices": 2,
                "material": 0,
                "mode": 4
            }],
            "name": "BoxMesh"
        }],
        "accessors": [
            {
                "bufferView": 0, "byteOffset": 0,
                "componentType": 5126, "count": num_vertices, "type": "VEC3",
                "max": [sx / 2, sy / 2, sz / 2],
                "min": [-sx / 2, -sy / 2, -sz / 2]
            },
            {
                "bufferView": 0, "byteOffset": vertex_byte_length,
                "componentType": 5121, "count": num_vertices, "type": "VEC3",
                "normalized": True, "max": [255, 255, 255], "min": [0, 0, 0]
            },
            {
                "bufferView": 1, "byteOffset": 0,
                "componentType": 5123, "count": num_indices, "type": "SCALAR",
                "max": [num_vertices - 1], "min": [0]
            }
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": vertex_byte_length, "byteStride": 16},
            {"buffer": 0, "byteOffset": vertex_byte_length, "byteLength": index_byte_length}
        ],
        "buffers": [{"byteLength": total_bin_length, "uri": ""}],
        "materials": [{
            "name": "BoxMaterial",
            "pbrMetallicRoughness": {"baseColorFactor": [1.0, 1.0, 1.0, 1.0]}
        }]
    }

    return gltf, bin_chunk


def write_glb(gltf, bin_chunk, path):
    """Escreve arquivo GLB (GLTF Embedded)."""
    gltf_json = json.dumps(gltf).encode('utf-8')

    # Alinhamento JSON para 4 bytes
    json_pad = (4 - len(gltf_json) % 4) % 4
    json_padded = gltf_json + b'\x20' * json_pad  # espaço = padding

    bin_pad = (4 - len(bin_chunk) % 4) % 4
    bin_padded = bin_chunk + b'\x00' * bin_pad

    # Cabecalho GLB
    magic = b'glTF'
    version = struct.pack('<I', 2)
    total_length = struct.pack('<I', 12 + 8 + len(json_padded) + 8 + len(bin_padded))

    # Chunk JSON
    json_chunk_type = struct.pack('<I', 0x4E4F534A)  # 'JSON'
    json_chunk_length = struct.pack('<I', len(json_padded))

    # Chunk BIN
    bin_chunk_type = struct.pack('<I', 0x004E4942)  # 'BIN\0'
    bin_chunk_length = struct.pack('<I', len(bin_padded))

    data = b''.join([
        magic, version, total_length,
        json_chunk_length, json_chunk_type, json_padded,
        bin_chunk_length, bin_chunk_type, bin_padded,
    ])

    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'wb') as f:
        f.write(data)


def main():
    print('=' * 60)
    print('GERACAO DE MODELOS 3D SIMPLES (PLACEHOLDER) - GLB NATIVO')
    print('=' * 60)
    print(f'Panteoes: {PANTHEOES}')
    print(f'Deuses por panteao: {len(ALL_DEUSES)}')
    print(f'Categorias cidade: {list(CATEGORIAS_CIDADE.keys())}')
    print(f'Categorias mapas: {list(CATEGORIAS_MAPAS.keys())}')
    print()

    sucesso = 0
    falha = 0

    # --- CIDADE ---
    for categoria, specs in CATEGORIAS_CIDADE.items():
        print(f'[cidade/{categoria}] Gerando modelos...')
        sx, sy, sz = specs['size']
        color = specs['color']
        positions, colors, indices = make_box_vertices_colors(sx, sy, sz, color)

        for panteao in PANTHEOES:
            for deus in ALL_DEUSES:
                destino = OUTPUT_DIR / panteao / deus / 'cidade' / categoria / f'{categoria}.glb'
                if destino.exists():
                    sucesso += 1
                    continue
                try:
                    gltf, bin_chunk = build_glb_with_dims(positions, colors, indices, sx, sy, sz)
                    write_glb(gltf, bin_chunk, destino)
                    sucesso += 1
                except Exception as e:
                    print(f'  ERRO: {destino} - {e}')
                    falha += 1

    # --- MAPAS ---
    for categoria, specs in CATEGORIAS_MAPAS.items():
        print(f'[mapas/{categoria}] Gerando modelos...')
        sx, sy, sz = specs['size']
        color = specs['color']
        positions, colors, indices = make_box_vertices_colors(sx, sy, sz, color)

        for panteao in PANTHEOES:
            for deus in ALL_DEUSES:
                destino = OUTPUT_DIR / panteao / deus / 'mapas' / categoria / f'{categoria}.glb'
                if destino.exists():
                    sucesso += 1
                    continue
                try:
                    gltf, bin_chunk = build_glb_with_dims(positions, colors, indices, sx, sy, sz)
                    write_glb(gltf, bin_chunk, destino)
                    sucesso += 1
                except Exception as e:
                    print(f'  ERRO: {destino} - {e}')
                    falha += 1

    print()
    print('=' * 60)
    print(f'RESULTADO: {sucesso} sucessos, {falha} falhas')
    print('=' * 60)


if __name__ == '__main__':
    main()