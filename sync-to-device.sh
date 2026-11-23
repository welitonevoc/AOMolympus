#!/bin/bash
# ============================================================================
# sync-to-device.sh — Sincroniza o projeto interno rápido com o /sdcard para o Godot
# ============================================================================
SRC="/data/user/0/com.agy/files/projects/age_of_mythology_olympus"
DST="/storage/emulated/0/Documents/age of mythology olympus"

echo "🔄 Sincronizando scripts, cenas e configurações para o /sdcard..."
mkdir -p "$DST"

# Copia scripts, cenas e arquivos de configuração atualizados
cp -ru "$SRC/scripts" "$DST/"
cp -ru "$SRC/scenes" "$DST/"
cp -u "$SRC/project.godot" "$DST/" 2>/dev/null
cp -u "$SRC/export_presets.cfg" "$DST/" 2>/dev/null

echo "✅ Sincronização concluída! Pode abrir o Godot no celular."
