#!/usr/bin/env python3
"""
Extrator & Conversor Oficial Age of Mythology: The Titans (.bar/.brg/.ddt/*_anim.txt -> .glb Modular)
Gera pacotes autocontidos por civilizacao em models/civilizations/<panteao>/<unidade>/:
  - <unidade>_base.glb        (malha + sockets/attachpoints + textura embutida, doubleSided opaco)
  - textures/*.png            (texturas PNG decodificadas de textures.bar / textures2.bar)
  - animations/<acao>.glb     (clipes animados separados: idle, walk, attack, death, gather, etc.)
  - accessories/<item>.glb    (armas, escudos, capacetes extraidos dos 'connect' do anim.txt)
  - effects/<efeito>.glb      (efeitos/poderes visuais quando presentes)
  - manifest.json             (receita completa para o ModelLibrary no Godot 4)
"""

import argparse
import io
import json
import math
import os
import re
import struct
import sys
from collections import OrderedDict
from typing import Dict, List, Optional, Tuple

import numpy as np
from PIL import Image


def _find_aom_root() -> str:
    """Auto-detect AoM: The Titans installation on Windows."""
    candidates = [
        os.environ.get("AOM_ROOT", ""),
        "/sdcard/aom",
        "/storage/emulated/0/aom",
        r"E:\Age of Mythology\Age of Mythology",
        r"C:\Age of Mythology\Age of Mythology",
        r"D:\Age of Mythology\Age of Mythology",
        os.path.expandvars(r"%PROGRAMFILES%\Age of Mythology"),
        os.path.expandvars(r"%PROGRAMFILES(X86)%\Age of Mythology"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Age of Mythology"),
    ]
    for c in candidates:
        if not c:
            continue
        models_bar = os.path.join(c, "models", "models.bar")
        if os.path.exists(models_bar):
            return c
    raise FileNotFoundError(
        "AoM: The Titans não encontrado. Instale o jogo ou defina AOM_ROOT manualmente."
    )


AOM_ROOT = _find_aom_root()
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_CIV_ROOT = os.path.join(PROJECT_ROOT, "models", "civilizations")

print(f"[Extractor] AOM_ROOT: {AOM_ROOT}")
print(f"[Extractor] OUT_CIV_ROOT: {OUT_CIV_ROOT}")

# Attachpoint names table from AoM BRG specification (54 entries)
NODE_NAMES = (
    "TARGETPOINT LAUNCHPOINT CORPSE DECAL FIRE GATHERPOINT "
    "RESERVED9 RESERVED8 RESERVED7 RESERVED6 RESERVED5 RESERVED4 RESERVED3 RESERVED2 RESERVED1 RESERVED0 "
    "SMOKE9 SMOKE8 SMOKE7 SMOKE6 SMOKE5 SMOKE4 SMOKE3 SMOKE2 SMOKE1 SMOKE0 "
    "GARRISONFLAG HITPOINTBAR RIGHTFOREARM LEFTFOREARM RIGHTFOOT LEFTFOOT "
    "RIGHTLEG LEFTLEG RIGHTTHIGH LEFTTHIGH PELVIS BACKABDOMEN FRONTABDOMEN "
    "BACKCHEST FRONTCHEST RIGHTSHOULDER LEFTSHOULDER NECK RIGHTEAR LEFTEAR "
    "CHIN FACE FOREHEAD TOPOFHEAD RIGHTHAND LEFTHAND RESERVED SMOKEPOINT ATTACHPOINT"
).split()

# BRG Mesh Flags
MESH_TRANSPCOLOR = 0x40000028
MESH_NOTFIRST = 0x04000028
MESH_ATTACHPOINTS = 0x01000028
MESH_MATERIALS = 0x00400028
MESH_CHANGINGCOL = 0x00200028
MESH_VERTCOLOR = 0x00010028

# BRG Material Flags
MATR_SFX = 0x1C000000


def _has_flag(val: int, flag: int) -> bool:
    return (val & flag) == flag


# ==============================================================================
# 1. BAR Archive Reader (O(1) lookup)
# ==============================================================================
class BarArchive:
    def __init__(self, paths: List[str]):
        """Loads BAR archives in priority order (first match wins)."""
        self.files: Dict[str, Tuple[str, int, int]] = {}
        self.handles: Dict[str, io.BufferedReader] = {}
        for bar_path in paths:
            if not os.path.exists(bar_path):
                continue
            f = open(bar_path, "rb")
            self.handles[bar_path] = f
            f.seek(0x0C)
            n_files = struct.unpack("<I", f.read(4))[0]
            f.seek(0x14)
            fat_offset = struct.unpack("<I", f.read(4))[0]
            f.seek(fat_offset)
            offsets = struct.unpack(f"<{n_files}I", f.read(n_files * 4))
            base_strings = fat_offset + n_files * 4
            for off in offsets:
                f.seek(base_strings + off)
                foff, fsz, _fcsz, _ftime, namelen = struct.unpack("<IIIIH", f.read(18))
                f.seek(base_strings + off + 20)
                name = (
                    f.read(namelen)
                    .split(b"\x00")[0]
                    .decode("latin1", errors="ignore")
                    .replace("\\", "/")
                    .lower()
                    .strip()
                )
                if name and name not in self.files:
                    self.files[name] = (bar_path, foff, fsz)

    def read(self, name: str) -> Optional[bytes]:
        key = name.replace("\\", "/").lower().strip()
        entry = self.files.get(key)
        if entry is None:
            return None
        bar_path, foff, fsz = entry
        f = self.handles[bar_path]
        f.seek(foff)
        return f.read(fsz)

    def find_by_stem(self, stem: str, ext: str) -> Optional[str]:
        s = stem.replace("\\", "/").lower().strip()
        if not s.endswith(ext):
            cand = s + ext
        else:
            cand = s
        if cand in self.files:
            return cand
        # Try basename match
        base = os.path.basename(cand)
        if base in self.files:
            return base
        return None

    def close(self) -> None:
        for f in self.handles.values():
            f.close()
        self.handles.clear()


# ==============================================================================
# 2. DDT Texture Decoder (DXT1 / DXT3 / DXT5 / Raw BGRA -> PNG)
# ==============================================================================
def _unpack_rgb565_arr(c: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    r = ((c >> 11) & 0x1F).astype(np.uint16) * 255 // 31
    g = ((c >> 5) & 0x3F).astype(np.uint16) * 255 // 63
    b = (c & 0x1F).astype(np.uint16) * 255 // 31
    return r.astype(np.uint8), g.astype(np.uint8), b.astype(np.uint8)


def decode_ddt_bytes(raw: bytes) -> Optional[Image.Image]:
    if not raw or len(raw) < 24 or raw[:4] != b"RTS3":
        return None
    _usage, _alpha_bits, fmt, mip_levels, width, height = struct.unpack("<BBBBII", raw[4:16])
    if width == 0 or height == 0 or width > 4096 or height > 4096:
        return None
    # Mipmap 0 offset & length at offset 16
    mip0_off, mip0_len = struct.unpack("<II", raw[16:24])
    if mip0_off + mip0_len > len(raw):
        return None
    data = raw[mip0_off : mip0_off + mip0_len]

    bw = max(1, (width + 3) // 4)
    bh = max(1, (height + 3) // 4)
    total_blocks = bw * bh

    # DXT1+1bit (fmt == 5, 10 bytes/bloco: 8B DXT1 + 2B mascara) vs DXT1 (fmt == 4, 8B) vs DXT3 (fmt == 8, 16B) vs DXT5 (fmt == 9, 16B)
    if (fmt == 5 and len(data) >= total_blocks * 10) or len(data) == total_blocks * 10:
        return _decode_dxt_fast(data, width, height, mode="dxt1_10")
    elif fmt in (4, 5) or (fmt not in (1, 8, 9) and len(data) == total_blocks * 8):
        return _decode_dxt_fast(data, width, height, mode="dxt1")
    elif fmt == 8:
        return _decode_dxt_fast(data, width, height, mode="dxt3")
    elif fmt == 9 or len(data) == total_blocks * 16:
        return _decode_dxt_fast(data, width, height, mode="dxt5")
    elif len(data) >= width * height * 4:
        arr = np.frombuffer(data[: width * height * 4], dtype=np.uint8).reshape((height, width, 4))
        rgba = np.empty_like(arr)
        rgba[:, :, 0] = arr[:, :, 2]
        rgba[:, :, 1] = arr[:, :, 1]
        rgba[:, :, 2] = arr[:, :, 0]
        rgba[:, :, 3] = arr[:, :, 3]
        return Image.fromarray(rgba, "RGBA")
    elif len(data) >= width * height * 3:
        arr = np.frombuffer(data[: width * height * 3], dtype=np.uint8).reshape((height, width, 3))
        rgb = arr[:, :, ::-1].copy()
        return Image.fromarray(rgb, "RGB")
    return None


def _decode_dxt_fast(data: bytes, w: int, h: int, mode: str) -> Image.Image:
    bw = max(1, (w + 3) // 4)
    bh = max(1, (h + 3) // 4)
    n_blocks = bw * bh
    stride = 8 if mode == "dxt1" else (10 if mode == "dxt1_10" else 16)
    buf = np.frombuffer(data[: n_blocks * stride], dtype=np.uint8).reshape((n_blocks, stride))

    color_off = 0 if mode in ("dxt1", "dxt1_10") else 8
    lookup_off = 6 if mode == "dxt1_10" else (color_off + 4)
    c0 = buf[:, color_off].astype(np.uint16) | (buf[:, color_off + 1].astype(np.uint16) << 8)
    c1 = buf[:, color_off + 2].astype(np.uint16) | (buf[:, color_off + 3].astype(np.uint16) << 8)
    lookup = (
        buf[:, lookup_off].astype(np.uint32)
        | (buf[:, lookup_off + 1].astype(np.uint32) << 8)
        | (buf[:, lookup_off + 2].astype(np.uint32) << 16)
        | (buf[:, lookup_off + 3].astype(np.uint32) << 24)
    )

    if mode == "dxt1_10":
        r0 = (((c0 >> 10) & 0x1F).astype(np.uint16) * 255 // 31).astype(np.uint8)
        g0 = (((c0 >> 5) & 0x1F).astype(np.uint16) * 255 // 31).astype(np.uint8)
        b0 = ((c0 & 0x1F).astype(np.uint16) * 255 // 31).astype(np.uint8)
        r1 = (((c1 >> 10) & 0x1F).astype(np.uint16) * 255 // 31).astype(np.uint8)
        g1 = (((c1 >> 5) & 0x1F).astype(np.uint16) * 255 // 31).astype(np.uint8)
        b1 = ((c1 & 0x1F).astype(np.uint16) * 255 // 31).astype(np.uint8)
    else:
        r0, g0, b0 = _unpack_rgb565_arr(c0)
        r1, g1, b1 = _unpack_rgb565_arr(c1)

    palette = np.zeros((n_blocks, 4, 4), dtype=np.uint8)
    palette[:, 0, 0], palette[:, 0, 1], palette[:, 0, 2], palette[:, 0, 3] = r0, g0, b0, 255
    palette[:, 1, 0], palette[:, 1, 1], palette[:, 1, 2], palette[:, 1, 3] = r1, g1, b1, 255

    gt = (c0 > c1) if mode == "dxt1" else np.ones(n_blocks, dtype=bool)
    # Index 2
    palette[gt, 2, 0] = (2 * r0[gt].astype(np.uint16) + r1[gt].astype(np.uint16)) // 3
    palette[gt, 2, 1] = (2 * g0[gt].astype(np.uint16) + g1[gt].astype(np.uint16)) // 3
    palette[gt, 2, 2] = (2 * b0[gt].astype(np.uint16) + b1[gt].astype(np.uint16)) // 3
    palette[gt, 2, 3] = 255
    palette[~gt, 2, 0] = (r0[~gt].astype(np.uint16) + r1[~gt].astype(np.uint16)) // 2
    palette[~gt, 2, 1] = (g0[~gt].astype(np.uint16) + g1[~gt].astype(np.uint16)) // 2
    palette[~gt, 2, 2] = (b0[~gt].astype(np.uint16) + b1[~gt].astype(np.uint16)) // 2
    palette[~gt, 2, 3] = 255

    # Index 3
    palette[gt, 3, 0] = (r0[gt].astype(np.uint16) + 2 * r1[gt].astype(np.uint16)) // 3
    palette[gt, 3, 1] = (g0[gt].astype(np.uint16) + 2 * g1[gt].astype(np.uint16)) // 3
    palette[gt, 3, 2] = (b0[gt].astype(np.uint16) + 2 * b1[gt].astype(np.uint16)) // 3
    palette[gt, 3, 3] = 255
    palette[~gt, 3, :] = 0

    # Decode 16 pixels per block
    shifts = np.arange(0, 32, 2, dtype=np.uint32)
    idxs = ((lookup[:, None] >> shifts[None, :]) & 3).astype(np.int32)
    blk_idx = np.arange(n_blocks)[:, None]
    pixels = palette[blk_idx, idxs]  # (n_blocks, 16, 4)

    # Always keep opaque alpha=255 for AoM unit/building base textures (alpha in AoM DDT is player-color mask!)
    pixels[:, :, 3] = 255

    pixels = pixels.reshape((bh, bw, 4, 4, 4)).transpose(0, 2, 1, 3, 4).reshape((bh * 4, bw * 4, 4))
    return Image.fromarray(pixels[:h, :w, :3], "RGB")


# ==============================================================================
# 3. BRG Binary Parser (BANG + ASET + MESI + ATTACHPOINTS + MTRL)
# ==============================================================================
class _BinReader:
    def __init__(self, data: bytes):
        self.data = data
        self.pos = 0
        self.length = len(data)

    def remaining(self) -> int:
        return self.length - self.pos

    def read_bytes(self, n: int) -> bytes:
        b = self.data[self.pos : self.pos + n]
        self.pos += n
        return b

    def skip(self, n: int) -> None:
        self.pos += n

    def read_str(self, n: int) -> str:
        return self.read_bytes(n).decode("latin1", errors="ignore")

    def read_u8(self) -> int:
        v = self.data[self.pos]
        self.pos += 1
        return v

    def read_u16(self) -> int:
        v = struct.unpack_from("<H", self.data, self.pos)[0]
        self.pos += 2
        return v

    def read_u32(self) -> int:
        v = struct.unpack_from("<I", self.data, self.pos)[0]
        self.pos += 4
        return v

    def read_i32(self) -> int:
        v = struct.unpack_from("<i", self.data, self.pos)[0]
        self.pos += 4
        return v

    def read_f32(self) -> float:
        v = struct.unpack_from("<f", self.data, self.pos)[0]
        self.pos += 4
        return v

    def read_bf16_array(self, count: int) -> np.ndarray:
        """AoM BRG stores half-floats as bfloat16 (upper 16 bits of IEEE float32)."""
        raw = np.frombuffer(self.data, dtype=np.uint16, count=count, offset=self.pos)
        self.pos += count * 2
        u32 = raw.astype(np.uint32) << 16
        return u32.view(np.float32)

    def read_u16_array(self, count: int) -> np.ndarray:
        arr = np.frombuffer(self.data, dtype=np.uint16, count=count, offset=self.pos).copy()
        self.pos += count * 2
        return arr


class BrgModel:
    def __init__(self):
        self.num_frames: int = 1
        self.anim_time: float = 1.0
        self.fps: float = 30.0
        self.frame_positions: List[np.ndarray] = []  # List[(N, 3) float32]
        self.frame_normals: List[np.ndarray] = []    # List[(N, 3) float32]
        self.uvs: Optional[np.ndarray] = None        # (N, 2) float32
        self.faces: Optional[np.ndarray] = None      # (F, 3) uint16
        self.face_mat_ids: Optional[np.ndarray] = None
        self.materials: List[dict] = []
        self.attachpoints: Dict[str, List[Tuple[np.ndarray, np.ndarray]]] = {}  # name -> [(pos, rot_mat3x3), ...]


def parse_brg(data: bytes) -> Optional[BrgModel]:
    if not data or len(data) < 28 or data[:4] != b"BANG":
        return None
    r = _BinReader(data)
    model = BrgModel()
    frame_idx = 0

    try:
        while r.remaining() >= 4:
            tag = r.read_str(4)
            if tag == "BANG":
                r.skip(4)
                _num_materials = r.read_u32()
                r.skip(4)
                _num_meshes = r.read_u32()
                r.skip(8)
            elif tag == "ASET":
                model.num_frames = max(1, r.read_u32())
                r.skip(4)
                model.anim_time = max(0.05, r.read_f32())
                r.skip(4)
                _spf = r.read_f32()
                model.fps = max(1.0, r.read_f32())
                r.skip(4)
            elif tag == "MESI":
                _ver = r.read_u16()
                _fmt = r.read_u16()
                num_verts = r.read_u16()
                num_faces = r.read_u16()
                _state = r.read_i32()
                r.skip(40)
                props = r.read_i32()
                first_frame = not _has_flag(props, MESH_NOTFIRST)
                r.skip(24)

                verts = r.read_bf16_array(num_verts * 3).reshape((num_verts, 3)).copy()
                norms = r.read_bf16_array(num_verts * 3).reshape((num_verts, 3)).copy()

                verts[:, 0] = -verts[:, 0]
                norms[:, 0] = -norms[:, 0]

                model.frame_positions.append(verts)
                model.frame_normals.append(norms)

                if first_frame:
                    uvs = r.read_bf16_array(num_verts * 2).reshape((num_verts, 2)).copy()
                    model.uvs = uvs
                    model.face_mat_ids = r.read_u16_array(num_faces)
                    faces = r.read_u16_array(num_faces * 3).reshape((num_faces, 3))
                    model.faces = faces[:, [0, 2, 1]].copy()
                    if _has_flag(props, MESH_MATERIALS):
                        r.skip(num_verts * 2)

                r.skip(24)
                check_space = r.read_u32()
                len_space = 0
                if not check_space:
                    _anim_time_mult = r.read_f32()
                    len_space = r.read_u32()
                    _num_mats_used = r.read_u32()

                if (
                    ((_has_flag(props, MESH_TRANSPCOLOR) or _has_flag(props, MESH_CHANGINGCOL)) and first_frame)
                    or _has_flag(props, MESH_VERTCOLOR)
                ):
                    r.skip(num_verts * 4)

                if _has_flag(props, MESH_ATTACHPOINTS):
                    num_matrix = r.read_u16()
                    num_index = r.read_u16()
                    r.skip(2)
                    xs = r.read_bf16_array(num_matrix * 3).reshape((num_matrix, 3))
                    ys = r.read_bf16_array(num_matrix * 3).reshape((num_matrix, 3))
                    zs = r.read_bf16_array(num_matrix * 3).reshape((num_matrix, 3))
                    ts = r.read_bf16_array(num_matrix * 3).reshape((num_matrix, 3))
                    r.skip(num_matrix * 2 * 6)

                    num_points = 0
                    index_duplis = []
                    for _ in range(num_index):
                        dupli = r.read_i32()
                        _idx_off = r.read_i32()
                        index_duplis.append(dupli)
                        num_points += dupli

                    point_ids = [r.read_u8() for _ in range(num_points)]
                    rev_names = NODE_NAMES[::-1]
                    pt_cursor = 0
                    for idx_i, dupli in enumerate(index_duplis):
                        base_aname = rev_names[idx_i] if idx_i < len(rev_names) else f"ATTACH_{idx_i}"
                        for d_i in range(dupli):
                            if pt_cursor < len(point_ids):
                                mat_idx = point_ids[pt_cursor]
                                if mat_idx < num_matrix:
                                    aname = base_aname if dupli == 1 else f"{base_aname}_{d_i}"
                                    pos = ts[mat_idx].copy()
                                    pos[0] = -pos[0]
                                    rot = np.column_stack([xs[mat_idx], ys[mat_idx], zs[mat_idx]]).astype(np.float32)
                                    model.attachpoints.setdefault(aname, []).append((pos, rot))
                            pt_cursor += 1

                if not check_space and len_space > 0:
                    r.skip(len_space * 4)

                frame_idx += 1

            elif tag == "MTRL":
                mat_id = r.read_u32()
                mat_props = r.read_i32()
                r.skip(4)
                name_len = r.read_u32()
                r.skip(48)
                tex_name = r.read_str(name_len).strip("\x00").strip()
                r.skip(4)
                if _has_flag(mat_props, MATR_SFX):
                    r.skip(2)
                    sfx_len = r.read_u16()
                    r.skip(sfx_len)
                model.materials.append({"id": mat_id, "props": mat_props, "texture": tex_name})
            else:
                break
    except (ValueError, struct.error, IndexError):
        pass

    if not model.frame_positions or model.faces is None or len(model.faces) == 0:
        return None
    return model


# ==============================================================================
# 4. Direct glTF 2.0 (.glb) Exporter (Opaque doubleSided + Morph Anim + Sockets)
# ==============================================================================
def _pad4(b: bytes, fill: bytes = b"\x00") -> bytes:
    rem = len(b) % 4
    return b if rem == 0 else b + fill * (4 - rem)


def export_brg_to_glb(
    brg: BrgModel,
    out_glb_path: str,
    tex_archive: BarArchive,
    textures_out_dir: Optional[str] = None,
    include_animation: bool = True,
    anim_name: str = "anim",
    override_texture: Optional[str] = None,
    scale_factor: float = 1.0,
    align_ground: bool = True,
) -> List[str]:
    """
    Exports a parsed BrgModel directly to glTF 2.0 .glb:
    - Opaque PBR materials (doubleSided=True, metallicFactor=0.0, roughnessFactor=0.85)
    - Embedded PNG textures + optional copy to textures_out_dir
    - Morph Target (BlendShape) keyframe animation when include_animation=True and frames > 1
    - Named Socket nodes (<Attachpoint>_Socket) for Bone/Socket accessory attachment
    Returns list of exported texture filenames.
    """
    pos0 = (brg.frame_positions[0] * scale_factor).astype(np.float32)
    norm0 = brg.frame_normals[0].astype(np.float32)
    # Normalize normals safely
    nlen = np.linalg.norm(norm0, axis=1, keepdims=True)
    nlen[nlen < 1e-6] = 1.0
    norm0 = (norm0 / nlen).astype(np.float32)
    uvs = brg.uvs.astype(np.float32) if brg.uvs is not None else np.zeros((len(pos0), 2), dtype=np.float32)
    faces = brg.faces.astype(np.uint16)

    # Align ground (min Y = 0) on static/base frame 0 if model is near ground (never on accessories)
    y_min = float(pos0[:, 1].min())
    y_shift = (-y_min if abs(y_min) < 0.8 else 0.0) if align_ground else 0.0
    pos0[:, 1] += y_shift

    bin_chunks: List[bytes] = []
    bin_offset = 0
    buffer_views: List[dict] = []
    accessors: List[dict] = []

    def add_buffer_view(raw: bytes, target: Optional[int] = None) -> int:
        nonlocal bin_offset
        padded = _pad4(raw, b"\x00")
        bv = {"buffer": 0, "byteOffset": bin_offset, "byteLength": len(raw)}
        if target is not None:
            bv["target"] = target
        idx = len(buffer_views)
        buffer_views.append(bv)
        bin_chunks.append(padded)
        bin_offset += len(padded)
        return idx

    def add_accessor(arr: np.ndarray, comp_type: int, acc_type: str, target: Optional[int] = None, calc_minmax: bool = False) -> int:
        arr_c = np.ascontiguousarray(arr)
        bv_idx = add_buffer_view(arr_c.tobytes(), target=target)
        acc = {
            "bufferView": bv_idx,
            "componentType": comp_type,
            "count": int(arr_c.shape[0]),
            "type": acc_type,
        }
        if calc_minmax:
            if arr_c.ndim == 1:
                acc["min"] = [float(arr_c.min())]
                acc["max"] = [float(arr_c.max())]
            else:
                acc["min"] = [float(x) for x in arr_c.min(axis=0)]
                acc["max"] = [float(x) for x in arr_c.max(axis=0)]
        idx = len(accessors)
        accessors.append(acc)
        return idx

    # Base geometry accessors
    pos_acc = add_accessor(pos0, 5126, "VEC3", target=34962, calc_minmax=True)
    norm_acc = add_accessor(norm0, 5126, "VEC3", target=34962)
    uv_acc = add_accessor(uvs, 5126, "VEC2", target=34962)

    # Morph targets (keyframe deltas) if animated
    targets = []
    use_morph = include_animation and len(brg.frame_positions) > 1
    if use_morph:
        # Cap morph targets to 16 frames max for mobile GPU compatibility
        n_frames = len(brg.frame_positions)
        step = max(1, math.ceil((n_frames - 1) / 16))
        target_frame_indices = list(range(1, n_frames, step))
        for fi in target_frame_indices:
            p_f = (brg.frame_positions[fi] * scale_factor).astype(np.float32)
            p_f[:, 1] += y_shift
            delta = (p_f - pos0).astype(np.float32)
            d_acc = add_accessor(delta, 5126, "VEC3", target=34962, calc_minmax=True)
            targets.append({"POSITION": d_acc})
    else:
        target_frame_indices = []

    # Materials & Textures
    gltf_images: List[dict] = []
    gltf_textures: List[dict] = []
    gltf_materials: List[dict] = []
    exported_tex_names: List[str] = []
    tex_cache: Dict[str, int] = {}

    mat_list = brg.materials if brg.materials else [{"id": 0, "texture": ""}]
    mat_id_to_gltf_idx: Dict[int, int] = {}

    for m_idx, m in enumerate(mat_list):
        tname = override_texture or m.get("texture", "")
        tex_idx = None
        if tname:
            tkey = tname.lower()
            if tkey in tex_cache:
                tex_idx = tex_cache[tkey]
            else:
                ddt_key = tex_archive.find_by_stem(tname, ".ddt")
                if ddt_key:
                    ddt_raw = tex_archive.read(ddt_key)
                    img = decode_ddt_bytes(ddt_raw) if ddt_raw else None
                    if img is not None:
                        bio = io.BytesIO()
                        img.save(bio, format="PNG")
                        png_bytes = bio.getvalue()
                        if textures_out_dir:
                            os.makedirs(textures_out_dir, exist_ok=True)
                            safe_png = re.sub(r"[^a-z0-9_\-]+", "_", tkey).strip("_") + ".png"
                            png_out = os.path.join(textures_out_dir, safe_png)
                            if not os.path.exists(png_out):
                                with open(png_out, "wb") as fp:
                                    fp.write(png_bytes)
                            exported_tex_names.append(safe_png)
                        img_bv = add_buffer_view(png_bytes)
                        img_idx = len(gltf_images)
                        gltf_images.append({"bufferView": img_bv, "mimeType": "image/png", "name": tname})
                        tex_idx = len(gltf_textures)
                        gltf_textures.append({"source": img_idx})
                        tex_cache[tkey] = tex_idx

        pbr: dict = {"metallicFactor": 0.0, "roughnessFactor": 0.85}
        if tex_idx is not None:
            pbr["baseColorTexture"] = {"index": tex_idx}
        else:
            pbr["baseColorFactor"] = [0.75, 0.72, 0.68, 1.0]

        gltf_materials.append({
            "name": tname or f"mat_{m_idx}",
            "pbrMetallicRoughness": pbr,
            "doubleSided": True,
            "alphaMode": "OPAQUE",
        })
        mat_id_to_gltf_idx[m["id"]] = m_idx

    # Build primitives grouped by material
    primitives = []
    if brg.face_mat_ids is not None and len(mat_list) > 1:
        unique_mids = np.unique(brg.face_mat_ids)
        for mid in unique_mids:
            mask = brg.face_mat_ids == mid
            sub_faces = faces[mask].reshape(-1)
            if len(sub_faces) == 0:
                continue
            idx_acc = add_accessor(sub_faces, 5123, "SCALAR", target=34963)
            prim = {
                "attributes": {"POSITION": pos_acc, "NORMAL": norm_acc, "TEXCOORD_0": uv_acc},
                "indices": idx_acc,
                "material": mat_id_to_gltf_idx.get(int(mid), 0),
            }
            if targets:
                prim["targets"] = targets
            primitives.append(prim)
    else:
        idx_acc = add_accessor(faces.reshape(-1), 5123, "SCALAR", target=34963)
        prim = {
            "attributes": {"POSITION": pos_acc, "NORMAL": norm_acc, "TEXCOORD_0": uv_acc},
            "indices": idx_acc,
            "material": 0,
        }
        if targets:
            prim["targets"] = targets
        primitives.append(prim)

    def _mat3_to_quat(m: np.ndarray) -> List[float]:
        r = m.copy()
        r[0, 1] = -r[0, 1]
        r[0, 2] = -r[0, 2]
        r[1, 0] = -r[1, 0]
        r[2, 0] = -r[2, 0]
        u, _, vt = np.linalg.svd(r)
        r = u @ vt
        if np.linalg.det(r) < 0:
            u[:, -1] *= -1
            r = u @ vt
        tr = float(r[0, 0] + r[1, 1] + r[2, 2])
        if tr > 0.0:
            s = np.sqrt(tr + 1.0) * 2.0
            qw = 0.25 * s
            qx = (r[2, 1] - r[1, 2]) / s
            qy = (r[0, 2] - r[2, 0]) / s
            qz = (r[1, 0] - r[0, 1]) / s
        elif r[0, 0] > r[1, 1] and r[0, 0] > r[2, 2]:
            s = np.sqrt(1.0 + r[0, 0] - r[1, 1] - r[2, 2]) * 2.0
            qw = (r[2, 1] - r[1, 2]) / s
            qx = 0.25 * s
            qy = (r[0, 1] + r[1, 0]) / s
            qz = (r[0, 2] + r[2, 0]) / s
        elif r[1, 1] > r[2, 2]:
            s = np.sqrt(1.0 + r[1, 1] - r[0, 0] - r[2, 2]) * 2.0
            qw = (r[0, 2] - r[2, 0]) / s
            qx = (r[0, 1] + r[1, 0]) / s
            qy = 0.25 * s
            qz = (r[1, 2] + r[2, 1]) / s
        else:
            s = np.sqrt(1.0 + r[2, 2] - r[0, 0] - r[1, 1]) * 2.0
            qw = (r[1, 0] - r[0, 1]) / s
            qx = (r[0, 2] + r[2, 0]) / s
            qy = (r[1, 2] + r[2, 1]) / s
            qz = 0.25 * s
        q = np.array([qx, qy, qz, qw], dtype=np.float32)
        n = np.linalg.norm(q)
        if n > 1e-6:
            q /= n
        return [float(q[0]), float(q[1]), float(q[2]), float(q[3])]

    nodes = [{"name": "MeshRoot", "mesh": 0, "children": []}]
    socket_node_map: Dict[str, int] = {}
    for aname, frame_list in brg.attachpoints.items():
        if not frame_list:
            continue
        p0 = (frame_list[0][0] * scale_factor).astype(np.float32)
        p0[1] += y_shift
        n_idx = len(nodes)
        nodes.append({
            "name": f"{aname}_Socket",
            "translation": [float(p0[0]), float(p0[1]), float(p0[2])],
        })
        nodes[0]["children"].append(n_idx)
        socket_node_map[aname] = n_idx

    if not nodes[0]["children"]:
        del nodes[0]["children"]

    mesh_obj: dict = {"name": "AoMMesh", "primitives": primitives}
    if targets:
        mesh_obj["weights"] = [0.0] * len(targets)

    # Build glTF animation (morph weights + socket translations)
    animations = []
    if use_morph and targets:
        n_t = len(targets)
        n_keys = n_t + 1  # frame 0 + each target frame
        duration = max(0.25, brg.anim_time)
        times = np.linspace(0.0, duration, n_keys, dtype=np.float32)
        time_acc = add_accessor(times, 5126, "SCALAR", calc_minmax=True)

        weights = np.zeros((n_keys, n_t), dtype=np.float32)
        for k in range(1, n_keys):
            weights[k, k - 1] = 1.0
        w_acc = add_accessor(weights.reshape(-1), 5126, "SCALAR")

        samplers = [{"input": time_acc, "output": w_acc, "interpolation": "LINEAR"}]
        channels = [{"sampler": 0, "target": {"node": 0, "path": "weights"}}]

        # Also animate socket translations across frames
        for aname, s_node_idx in socket_node_map.items():
            flist = brg.attachpoints.get(aname, [])
            if len(flist) >= len(target_frame_indices) + 1:
                pts = []
                p0 = (flist[0][0] * scale_factor).astype(np.float32)
                p0[1] += y_shift
                pts.append(p0)
                for fi in target_frame_indices:
                    fr = flist[min(fi, len(flist) - 1)]
                    pf = (fr[0] * scale_factor).astype(np.float32)
                    pf[1] += y_shift
                    pts.append(pf)
                pts_arr = np.array(pts, dtype=np.float32)
                p_acc = add_accessor(pts_arr, 5126, "VEC3")
                s_idx = len(samplers)
                samplers.append({"input": time_acc, "output": p_acc, "interpolation": "LINEAR"})
                channels.append({"sampler": s_idx, "target": {"node": s_node_idx, "path": "translation"}})

        animations.append({"name": anim_name, "channels": channels, "samplers": samplers})

    bin_blob = b"".join(bin_chunks)
    gltf: dict = {
        "asset": {"version": "2.0", "generator": "AoM Olympus Titans Extractor"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": nodes,
        "meshes": [mesh_obj],
        "materials": gltf_materials,
        "buffers": [{"byteLength": len(bin_blob)}],
        "bufferViews": buffer_views,
        "accessors": accessors,
    }
    if gltf_images:
        gltf["images"] = gltf_images
    if gltf_textures:
        gltf["textures"] = gltf_textures
    if animations:
        gltf["animations"] = animations

    json_bytes = _pad4(json.dumps(gltf, separators=(",", ":")).encode("utf-8"), b" ")
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_blob)

    os.makedirs(os.path.dirname(out_glb_path), exist_ok=True)
    with open(out_glb_path, "wb") as fp:
        fp.write(struct.pack("<III", 0x46546C67, 2, total_len))
        fp.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        fp.write(json_bytes)
        fp.write(struct.pack("<II", len(bin_blob), 0x004E4942))
        fp.write(bin_blob)

    return exported_tex_names


# ==============================================================================
# 5. Anim.txt Recipe Parser (resolves imports, defines, animations, connects)
# ==============================================================================
ACTION_MAP = {
    "idle": "idle",
    "bored": "idle",
    "walk": "walk",
    "run": "walk",
    "move": "walk",
    "attack": "attack",
    "handattack": "attack",
    "rangedattack": "attack",
    "attacka": "attack",
    "death": "death",
    "die": "death",
    "gather": "gather",
    "gatherberry": "gather",
    "gatherwood": "gather",
    "gathermine": "gather",
    "gatherfarm": "gather",
    "build": "gather",
    "work": "gather",
    "special": "special",
    "cast": "special",
}


class AnimRecipe:
    def __init__(self, anim_file: str):
        self.anim_file = anim_file
        self.defines: Dict[str, str] = {}          # define_name_lower -> first visual brg
        self.animations: Dict[str, str] = {}       # canonical action -> visual brg
        self.connections: Dict[str, str] = {}      # socket_name -> visual brg (resolved)
        self.effects: List[str] = []


def _parse_anim_text(text: str, anim_archive: BarArchive, visited: set) -> Tuple[Dict[str, str], Dict[str, str], Dict[str, str]]:
    defines: Dict[str, str] = {}
    anims: Dict[str, str] = {}
    connects_raw: Dict[str, str] = {}

    # 1. Process imports first
    for m in re.finditer(r"(?i)^\s*import\s+([^\r\n]+)", text, re.MULTILINE):
        imp_name = m.group(1).strip().strip('"').lower()
        if imp_name in visited:
            continue
        visited.add(imp_name)
        imp_raw = anim_archive.read(imp_name)
        if imp_raw:
            d2, _, _ = _parse_anim_text(imp_raw.decode("latin1", errors="ignore"), anim_archive, visited)
            defines.update(d2)

    # 2. Extract define blocks
    lines = text.splitlines()
    mode = None  # ('define', name) or ('anim', name)
    brace_depth = 0
    block_lines: List[str] = []

    for line in lines:
        clean = line.split("//")[0].strip()
        if not clean:
            continue
        if mode is None:
            m_def = re.match(r"(?i)^define\s+([A-Za-z0-9_\-]+)", clean)
            m_ani = re.match(r"(?i)^anim\s+([A-Za-z0-9_\-]+)", clean)
            if m_def:
                mode = ("define", m_def.group(1).lower())
                brace_depth = clean.count("{") - clean.count("}")
                block_lines = [clean]
                continue
            elif m_ani:
                mode = ("anim", m_ani.group(1).lower())
                brace_depth = clean.count("{") - clean.count("}")
                block_lines = [clean]
                continue
        else:
            brace_depth += clean.count("{") - clean.count("}")
            block_lines.append(clean)
            if brace_depth <= 0:
                kind, bname = mode
                body = "\n".join(block_lines)
                vis_m = re.search(r"(?i)\bVisual\s+([^\r\n\{\}]+)", body)
                if kind == "define" and vis_m and bname not in defines:
                    defines[bname] = vis_m.group(1).strip().strip('"')
                elif kind == "anim" and vis_m:
                    canon = ACTION_MAP.get(bname)
                    if canon and canon not in anims:
                        anims[canon] = vis_m.group(1).strip().strip('"')
                    elif not anims and bname in ("none", "alive", "default", "stand"):
                        anims["idle"] = vis_m.group(1).strip().strip('"')
                    # Capture connect lines (socket -> define)
                    for cm in re.finditer(r"(?i)\bconnect\s+([A-Za-z0-9_]+)\s+([A-Za-z0-9_\-]+)", body):
                        sock, target_def = cm.group(1), cm.group(2).lower()
                        if sock not in connects_raw:
                            connects_raw[sock] = target_def
                mode = None
                block_lines = []

    return defines, anims, connects_raw


def parse_anim_recipe(anim_filename: str, anim_archive: BarArchive) -> Optional[AnimRecipe]:
    raw = anim_archive.read(anim_filename)
    if not raw:
        return None
    text = raw.decode("latin1", errors="ignore")
    visited = {anim_filename.lower()}
    defines, anims, connects_raw = _parse_anim_text(text, anim_archive, visited)

    recipe = AnimRecipe(anim_filename)
    recipe.defines = defines
    recipe.animations = anims
    for sock, target_def in connects_raw.items():
        if target_def in defines:
            recipe.connections[sock] = defines[target_def]
    return recipe


# ==============================================================================
# 6. Civilization Classifier (100% of AoM: Titans anim files)
# ==============================================================================
def classify_anim_entry(anim_name: str, recipe: AnimRecipe) -> Tuple[Optional[str], str, str]:
    """
    Returns (civ, category, unit_slug).
    civ in {'greek', 'egyptian', 'norse', 'atlantean', 'shared'} or None if skip.
    category in {'units', 'buildings', 'heroes', 'myth', 'gods', 'nature'}.
    """
    base = anim_name.replace("_anim.txt", "").strip().lower()
    if base.startswith("!") and "house" not in base and "wall" not in base:
        return None, "", ""
    base_clean = base.lstrip("!")

    # Inspect visual BRG prefix (AoM uses ' G ', ' E ', ' N ', ' X ' in BRG filenames!)
    first_vis = next(iter(recipe.animations.values()), "").lower()

    civ = None
    if " g " in first_vis or first_vis.startswith("g ") or "greek" in base_clean or base_clean in (
        "hoplite", "toxotes", "hippikon", "peltast", "hypaspist", "myrmidon", "hetairoi",
        "gastraphetes", "prodromos", "petrobolos", "helepolis", "trireme", "pentekonter",
        "juggernaut", "minotaur", "centaur", "cyclops", "hydra", "scylla", "manticore",
        "medusa", "colossus", "chimera", "nemean lion", "pegasus", "carcinos",
        "ajax", "achilles", "odysseus", "heracles", "jason", "theseus", "hippolyta",
        "atalanta", "bellerophon", "chiron", "perseus", "polyphemus", "arkantos", "agamemnon",
        "academy", "archery range", "stable", "fortress", "granary", "storehouse",
    ):
        civ = "greek"
    elif " e " in first_vis or first_vis.startswith("e ") or "egypt" in base_clean or base_clean in (
        "spearman", "axeman", "slinger", "chariot archer", "camelry", "war elephant",
        "pharaoh", "priest", "mercenary", "mercenary cavalry", "siege tower", "catapult",
        "anubite", "sphinx", "wadjet", "petsuchos", "scorpion man", "scarab", "mummy",
        "avenger", "phoenix", "roc", "leviathan", "war turtle", "son of osiris",
        "migdol stronghold", "monument", "obelisk", "barracks egyptian",
    ):
        civ = "egyptian"
    elif " n " in first_vis or first_vis.startswith("n ") or "norse" in base_clean or base_clean in (
        "ulfsark", "throwing axeman", "raiding cavalry", "huskarl", "jarl", "hersir",
        "ox cart", "dwarf", "portable ram", "ballista", "longboat", "drakkar", "dragon ship",
        "valkyrie", "troll", "einherjar", "frost giant", "fire giant", "mountain giant",
        "battle boar", "fenris wolf", "kraken", "jormund elver", "nidhogg", "raven",
        "longhouse", "hill fort", "healing spring",
    ):
        civ = "norse"
    elif " x " in first_vis or first_vis.startswith("x ") or "atlantean" in base_clean or base_clean in (
        "murmillo", "arcus", "turma", "katapeltes", "contarius", "destroyer", "fanatic",
        "cheiroballista", "fire siphon", "citizen", "bireme", "fireship", "siege bireme",
        "promethean", "automatons", "automaton", "caladria", "behemoth", "stymphalian bird",
        "satyr", "dryad", "argus", "lampades", "servant", "neried", "man o war", "tartarian",
        "palace", "counter barracks", "barracks atlantean", "manor", "sky passage", "mirror tower",
    ):
        civ = "atlantean"
    elif any(k in base_clean for k in ("town center", "house", "temple", "tower", "market", "armory", "dock", "wall", "gate", "wonder", "titan")):
        civ = "shared"

    if civ is None:
        return None, "", ""

    # Determine category
    if any(k in first_vis for k in ("building", "house", "temple", "tower", "barracks", "academy", "fortress", "palace", "wonder", "wall", "dock", "market", "armory", "granary", "storehouse", "monument")) or base_clean in (
        "house", "town center", "temple", "tower", "academy", "archery range", "stable",
        "fortress", "granary", "storehouse", "market", "armory", "dock", "wonder",
        "migdol stronghold", "monument", "obelisk", "longhouse", "hill fort", "palace", "manor",
    ):
        cat = "cidade"
    else:
        cat = "unidades"

    slug = re.sub(r"[^a-z0-9]+", "_", base_clean).strip("_")
    return civ, cat, slug


# ==============================================================================
# 7. Bundle Extractor (Self-Contained Folder per Unit / Building)
# ==============================================================================
def extract_unit_bundle(
    anim_file: str,
    civ: str,
    cat: str,
    slug: str,
    anim_bar: BarArchive,
    model_bar: BarArchive,
    tex_bar: BarArchive,
    out_root: str,
) -> Optional[dict]:
    recipe = parse_anim_recipe(anim_file, anim_bar)
    if not recipe or not recipe.animations:
        return None

    # Choose base visual (prefer idle, else walk, else first available)
    base_vis = recipe.animations.get("idle") or recipe.animations.get("walk") or next(iter(recipe.animations.values()))
    base_brg_key = model_bar.find_by_stem(base_vis, ".brg")
    if not base_brg_key:
        return None
    base_raw = model_bar.read(base_brg_key)
    base_brg = parse_brg(base_raw) if base_raw else None
    if not base_brg:
        return None

    unit_dir = os.path.join(out_root, civ, cat, slug) if cat == "cidade" else os.path.join(out_root, civ, slug)
    tex_dir = os.path.join(unit_dir, "textures")
    anim_dir = os.path.join(unit_dir, "animations")
    acc_dir = os.path.join(unit_dir, "accessories")

    # 1. Export base.glb (frame 0 + sockets + embedded textures)
    base_glb = os.path.join(unit_dir, f"{slug}_base.glb")
    exported_tex = export_brg_to_glb(
        base_brg, base_glb, tex_bar, textures_out_dir=tex_dir, include_animation=False, anim_name="base"
    )

    # 2. Export separated animation clips (animations/<action>.glb)
    exported_anims: Dict[str, str] = {}
    for action, vis_name in recipe.animations.items():
        brg_key = model_bar.find_by_stem(vis_name, ".brg")
        if not brg_key:
            continue
        raw = model_bar.read(brg_key)
        b = parse_brg(raw) if raw else None
        if not b:
            continue
        clip_glb = os.path.join(anim_dir, f"{action}.glb")
        export_brg_to_glb(
            b, clip_glb, tex_bar, textures_out_dir=tex_dir, include_animation=True, anim_name=action
        )
        exported_anims[action] = f"animations/{action}.glb"

    # 3. Export separated accessories (accessories/<socket>_<name>.glb)
    exported_accs: Dict[str, str] = {}
    for sock, acc_vis in recipe.connections.items():
        acc_key = model_bar.find_by_stem(acc_vis, ".brg")
        if not acc_key:
            continue
        raw = model_bar.read(acc_key)
        b = parse_brg(raw) if raw else None
        if not b:
            continue
        acc_slug = re.sub(r"[^a-z0-9]+", "_", acc_vis.lower()).strip("_")
        acc_glb = os.path.join(acc_dir, f"{acc_slug}.glb")
        export_brg_to_glb(
            b, acc_glb, tex_bar, textures_out_dir=tex_dir, include_animation=False, anim_name=acc_slug, align_ground=False
        )
        exported_accs[sock] = f"accessories/{acc_slug}.glb"

    # 4. Write manifest.json (recipe for Godot ModelLibrary)
    manifest = {
        "unit": slug,
        "civ": civ,
        "category": cat,
        "source_anim_txt": anim_file,
        "base": f"{slug}_base.glb",
        "sockets": list(base_brg.attachpoints.keys()),
        "animations": exported_anims,
        "accessories": exported_accs,
        "textures": sorted(set(exported_tex)),
    }
    with open(os.path.join(unit_dir, "manifest.json"), "w", encoding="utf-8") as fp:
        json.dump(manifest, fp, indent=2, ensure_ascii=False)

    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="AoM: The Titans Official Modular Extractor (.bar -> .glb)")
    parser.add_argument("--civ", default="all", help="Civilization filter: greek, egyptian, norse, atlantean, shared, or all")
    parser.add_argument("--filter", default="", help="Optional substring filter on anim filename (e.g. hoplite)")
    parser.add_argument("--limit", type=int, default=0, help="Max bundles to extract (0 = unlimited)")
    parser.add_argument("--out", default=OUT_CIV_ROOT, help="Output root directory")
    args = parser.parse_args()

    print("[BOX] Abrindo arquivos .bar do AoM: The Titans (AOM_ROOT)...")
    model_bar = BarArchive([
        os.path.join(AOM_ROOT, "models", "models2.bar"),
        os.path.join(AOM_ROOT, "models", "models.bar"),
    ])
    anim_bar = BarArchive([
        os.path.join(AOM_ROOT, "anim", "anim2.bar"),
        os.path.join(AOM_ROOT, "anim", "anim.bar"),
    ])
    tex_bar = BarArchive([
        os.path.join(AOM_ROOT, "textures", "textures2.bar"),
        os.path.join(AOM_ROOT, "textures", "textures.bar"),
    ])
    print(f"   Modelos indexados: {len(model_bar.files)} | Anims: {len(anim_bar.files)} | Texturas: {len(tex_bar.files)}")

    extracted = 0
    by_civ: Dict[str, int] = {}

    for anim_name in sorted(anim_bar.files.keys()):
        if not anim_name.endswith("_anim.txt"):
            continue
        if args.filter and args.filter.lower() not in anim_name:
            continue
        recipe = parse_anim_recipe(anim_name, anim_bar)
        if not recipe or not recipe.animations:
            continue
        civ, cat, slug = classify_anim_entry(anim_name, recipe)
        if not civ:
            continue
        if args.civ != "all" and civ != args.civ:
            continue

        res = extract_unit_bundle(anim_name, civ, cat, slug, anim_bar, model_bar, tex_bar, args.out)
        if res:
            extracted += 1
            by_civ[civ] = by_civ.get(civ, 0) + 1
            if extracted <= 25 or extracted % 25 == 0:
                print(
                    f"  [OK] [{civ:9}] {cat:8} / {slug:24} | anims={list(res['animations'].keys())} | accs={list(res['accessories'].keys())}"
                )
            if args.limit > 0 and extracted >= args.limit:
                break

    model_bar.close()
    anim_bar.close()
    tex_bar.close()
    print(f"\n[TROPHY2] Extracao concluida! Total de pacotes autocontidos gerados: {extracted} | Por civ: {by_civ}")


if __name__ == "__main__":
    main()
