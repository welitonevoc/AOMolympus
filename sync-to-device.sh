#!/bin/bash
# ============================================================================
# sync-to-device.sh — Sincronização determinística (interno -> /sdcard Godot)
# ============================================================================
SRC="/data/user/0/com.agy/files/projects/age_of_mythology_olympus"
DST="/storage/emulated/0/Documents/age of mythology olympus"

mkdir -p "$DST"

# 1. Código e cenas: cópia forçada (cp -rf) para nunca ser bloqueada por timestamps do /sdcard
for dir in scripts scenes data; do
    if [ -d "$SRC/$dir" ]; then
        cp -rf "$SRC/$dir" "$DST/" 2>/dev/null
    fi
done

# 2. Assets binários pesados: cópia incremental rápida (cp -ru)
for dir in audio ui themes assets addons; do
    if [ -d "$SRC/$dir" ]; then
        cp -ru "$SRC/$dir" "$DST/" 2>/dev/null
    fi
done

# 3. Modelos 3D oficiais AoM: The Titans (incremental)
mkdir -p "$DST/models"
for mdir in civilizations natureza units buildings referencias_cidade; do
    if [ -d "$SRC/models/$mdir" ]; then
        cp -ru "$SRC/models/$mdir" "$DST/models/" 2>/dev/null
    fi
done

# 4. Arquivos de configuração na raiz (forçados)
for f in project.godot export_presets.cfg icon.svg AGENTS.md; do
    if [ -f "$SRC/$f" ]; then
        cp -f "$SRC/$f" "$DST/" 2>/dev/null
    fi
done

echo "✅ [Sync Determinístico] Sincronizado para /sdcard/Documents/age of mythology olympus"
