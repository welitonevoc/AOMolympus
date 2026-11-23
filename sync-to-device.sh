#!/bin/bash
# ============================================================================
# sync-to-device.sh — Sincroniza o projeto interno rápido com o /sdcard para o Godot
# ============================================================================
SRC="/data/user/0/com.agy/files/projects/age_of_mythology_olympus"
DST="/storage/emulated/0/Documents/age of mythology olympus"

mkdir -p "$DST"

# Sincroniza apenas arquivos modificados/mais recentes (-u) de cada pasta essencial
for dir in scripts scenes audio ui themes data assets addons; do
    if [ -d "$SRC/$dir" ]; then
        cp -ru "$SRC/$dir" "$DST/" 2>/dev/null
    fi
done

# Arquivos de configuracao do Godot
cp -u "$SRC/project.godot" "$DST/" 2>/dev/null
cp -u "$SRC/export_presets.cfg" "$DST/" 2>/dev/null
cp -u "$SRC/icon.svg" "$DST/" 2>/dev/null

echo "✅ [Sync Auto] Sincronizado para /sdcard/Documents/age of mythology olympus"
