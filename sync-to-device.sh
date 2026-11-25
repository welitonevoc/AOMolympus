#!/bin/bash
# ============================================================================
# sync-to-device.sh — Sincronização TOTAL (/sdcard Godot -> interno com.agy)
# ============================================================================
# Copia TUDO do /sdcard para a pasta privada do app com.agy (u0_a290),
# exceto o .git (repositorio separado).
# Use quando modifica algo no /sdcard e quer espelhar para o com.agy.
# ============================================================================
SRC="/storage/emulated/0/Documents/age of mythology olympus"
DST="/data/user/0/com.agy/files/projects/age_of_mythology_olympus"

mkdir -p "$DST"

# Copia TUDO (arquivos e diretorios) exceto .git
for item in "$SRC"/* "$SRC"/.*; do
    nome=$(basename "$item")
    [ "$nome" = "." ]  && continue
    [ "$nome" = ".." ] && continue
    [ "$nome" = ".git" ] && continue

    if [ -d "$item" ]; then
        cp -rf "$item" "$DST/" 2>/dev/null
    elif [ -f "$item" ]; then
        cp -f "$item" "$DST/" 2>/dev/null
    fi
done

echo "✅ [Sync Total] Sincronizado de /sdcard/Documents para /data/user/0/com.agy/files/projects/age_of_mythology_olympus (exceto .git)"
