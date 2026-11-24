#!/usr/bin/env python3
"""Inspeciona um .glb e avisa quando passa do orçamento mobile do projeto.

Uso:
  python inspecionar_glb.py arquivo.glb [--tipo unidade|heroi|edificio|casa|templo|fortaleza|prop]

Só usa a biblioteca padrão (roda no Termux). Lê o JSON do GLB, não carrega a malha.
Obs.: os limites são as propostas de references/convencoes.md.
"""
import argparse, json, struct, sys

LIMITES = {  # (max triangulos, max materiais)
    "unidade": (12000, 4), "heroi": (25000, 6), "colosso": (25000, 4),
    "edificio": (40000, 5), "casa": (6000, 3), "templo": (25000, 5),
    "fortaleza": (40000, 5), "prop": (1500, 2),
}

def ler_glb(caminho):
    with open(caminho, "rb") as f:
        cab = f.read(12)
        if len(cab) < 12 or cab[:4] != b"glTF":
            sys.exit("Arquivo não é um GLB válido (cabeçalho 'glTF' ausente).")
        _, versao, total = struct.unpack("<4sII", cab)
        tam, tipo = struct.unpack("<II", f.read(8))
        if tipo != 0x4E4F534A:
            sys.exit("Primeiro chunk não é JSON.")
        return versao, total, json.loads(f.read(tam))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("arquivo")
    ap.add_argument("--tipo", choices=sorted(LIMITES), default=None)
    a = ap.parse_args()

    versao, total, j = ler_glb(a.arquivo)
    acc = j.get("accessors", [])
    tris = 0
    mn, mx = [1e18] * 3, [-1e18] * 3
    for m in j.get("meshes", []):
        for p in m.get("primitives", []):
            if p.get("mode", 4) != 4:
                continue
            if "indices" in p:
                tris += acc[p["indices"]]["count"] // 3
            elif "POSITION" in p.get("attributes", {}):
                tris += acc[p["attributes"]["POSITION"]]["count"] // 3
            pa = acc[p["attributes"]["POSITION"]] if "POSITION" in p.get("attributes", {}) else None
            if pa and "min" in pa and "max" in pa:
                mn = [min(a_, b_) for a_, b_ in zip(mn, pa["min"])]
                mx = [max(a_, b_) for a_, b_ in zip(mx, pa["max"])]

    nodes = j.get("nodes", [])
    juntas = set()
    for s in j.get("skins", []):
        juntas.update(s.get("joints", []))
    ossos = [nodes[i].get("name", f"#{i}") for i in sorted(juntas)]
    mats = j.get("materials", [])
    anims = []
    for an in j.get("animations", []):
        dur = 0.0
        for s in an.get("samplers", []):
            mxv = acc[s["input"]].get("max")
            if mxv:
                dur = max(dur, mxv[0])
        anims.append((an.get("name", "(sem nome)"), round(dur, 2), len(an.get("channels", []))))

    print(f"Arquivo: {a.arquivo}")
    print(f"Tamanho: {total/1e6:.2f} MB | glTF v{versao} | gerador: {j.get('asset',{}).get('generator','?')}")
    print(f"Malhas: {len(j.get('meshes', []))} | Triângulos: {tris:,} | Materiais: {len(mats)} | Texturas: {len(j.get('textures', []))}")
    if mn[0] < 1e17:
        print("Caixa (sem transformar nós): " + " x ".join(f"{(b-a_):.3f}" for a_, b in zip(mn, mx)))
    print(f"Ossos (joints): {len(ossos)}")
    if ossos:
        print("  " + ", ".join(ossos[:12]) + (" ..." if len(ossos) > 12 else ""))
        sem_prefixo = [o for o in ossos if "mixamorig" not in o]
        if sem_prefixo:
            print(f"  AVISO: {len(sem_prefixo)} osso(s) sem prefixo 'mixamorig' (rig não é Mixamo padrão?)")
    print(f"Animações: {len(anims)}")
    for n, d, c in anims:
        print(f"  - {n} ({d}s, {c} canais)")

    avisos = []
    if a.tipo:
        mt, mm = LIMITES[a.tipo]
        if tris > mt: avisos.append(f"{tris:,} triângulos passa do limite de {mt:,} para '{a.tipo}'")
        if len(mats) > mm: avisos.append(f"{len(mats)} materiais passa do limite de {mm} para '{a.tipo}'")
    if total > 15e6: avisos.append("arquivo acima de 15 MB: pesado para mobile")
    if a.tipo in ("unidade", "heroi", "colosso") and not ossos:
        avisos.append("unidade sem esqueleto (skin): não vai animar")
    print()
    if avisos:
        for x in avisos: print("AVISO:", x)
        sys.exit(2)
    print("OK dentro do orçamento." if a.tipo else "Informe --tipo para checar o orçamento.")

if __name__ == "__main__":
    main()
