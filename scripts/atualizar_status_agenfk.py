#!/usr/bin/env python3
"""
Atualiza o status das tarefas criadas no AgEnFK baseado no trabalho realizado.
"""

import requests
import json

API_BASE = "http://localhost:3000"

# IDs das tarefas criadas
TASKS = {
    # EPIC - Era T5 (já concluída)
    "7bfa7360-e256-4aca-8c3d-c4b090743f64": "DONE",
    
    # Tarefas da Era T5 - todas concluídas
    "0cd2d736-5722-4a22-ab8b-e76a5e3f54de": "DONE",  # Código Era T5
    "0141cdcb-3b45-4af6-b5e3-41fe3163acbb": "DONE",   # UI invocação divina
    "c1e250ee-ba3e-4958-8ad0-6e968ad55573": "DONE",    # Estrutura de pastas e GLBs
    "6ca1cb40-0da8-41bc-8ebd-e457d7a3e97b": "DONE",    # ComfyUI instalado
    
    # EPIC - Modelos de construção (em andamento)
    "83646f5b-8fd0-4f8d-bb07-0dc6eda467f5": "IN_PROGRESS",
    
    # Tarefas de modelos de construção (em andamento - script rodando em background)
    "c013cd20-477e-4bb9-8371-ce65a1642540": "IN_PROGRESS",  # town_center
    "58ccd0c1-dd7a-4afe-a5b2-84f708e55e48": "IN_PROGRESS",  # temples
    "e427c5c2-c25e-4140-80ad-1d73415e8905": "IN_PROGRESS",  # barracks
    "d714c335-7dae-451b-9ede-d4782edccb70": "IN_PROGRESS",  # fortresses
    "a2eb0bcc-3e09-4b31-a156-dfc87c5aa22a": "IN_PROGRESS",  # towers
    "997bf74b-2242-4d72-934e-098a6f619ef3": "IN_PROGRESS",  # houses
    "51b0f912-3144-4760-ae38-af6bf084de6d": "IN_PROGRESS",  # divine_altar
    "a8c3f482-6837-48bf-a539-48e349530d14": "IN_PROGRESS",  # geografica
}

EVIDENCIAS = {
    "7bfa7360-e256-4aca-8c3d-c4b090743f64": "Era T5 completa: 23 deuses maiores + 46 menores invocaveis como unidades epicas com custos balanceados, poderes ativos/passivos, integracao tecnica completa.",
    "0cd2d736-5722-4a22-ab8b-e76a5e3f54de": "DIVINE_PROFILES (62 entradas) em model_library.gd, create_divine_unit_visual(), unit_actor.gd modificado para DIVINE_PROFILES, battle_world.gd com divine_summoned_signal.",
    "0141cdcb-3b45-4af6-b5e3-41fe3163acbb": "Painel de invocacao em mobile_hud.gd (_build_divine_invocation_ui, _on_attempt_summon, _on_divine_summoned), botao 'Deuses (T5)' na idade 5.",
    "c1e250ee-ba3e-4958-8ad0-6e968ad55573": "240 pastas (16 deuses x 15 categorias), 336 GLBs copiados para unidade_militar, unidade_mitica, aldeao, deuses, mapas/flora.",
    "6ca1cb40-0da8-41bc-8ebd-e457d7a3e97b": "PyTorch 2.15.0+CPU no Debian proot-distro (Python 3.13.5), ComfyUI 0.46.0 na porta 8188, custom nodes ComfyUI-Pixaroma e ComfyUI-Flowty-TripoSR instalados.",
    "83646f5b-8fd0-4f8d-bb07-0dc6eda467f5": "Script gerando modelos 3D para 8 categorias de cidade via ComfyUI TripoSR em background.",
}

def update_status(item_id, new_status, evidence=""):
    """Atualiza o status de um item."""
    # Tentar diferentes endpoints
    endpoints = [
        f"/items/{item_id}",
        f"/items/{item_id}/status",
    ]
    
    for endpoint in endpoints:
        data = {"id": item_id, "status": new_status}
        if evidence:
            data["evidence"] = evidence
        
        try:
            resp = requests.put(f"{API_BASE}{endpoint}", json=data, timeout=30)
            if resp.status_code in (200, 204):
                try:
                    result = resp.json()
                    print(f"  ✓ {item_id[:8]}... -> {new_status}")
                except:
                    print(f"  ✓ {item_id[:8]}... -> {new_status} (sem corpo de resposta)")
                return True
            else:
                print(f"  ? {endpoint} retornou {resp.status_code}: {resp.text[:100]}")
        except Exception as e:
            print(f"  ? Erro em {endpoint}: {e}")
    
    print(f"  ✗ Falha ao atualizar {item_id[:8]}...")
    return False


def main():
    print("=" * 60)
    print("ATUALIZANDO STATUS DAS TAREFAS NO AgEnFK")
    print("=" * 60)
    
    sucesso = 0
    falha = 0
    
    for item_id, status in TASKS.items():
        evidence = EVIDENCIAS.get(item_id, "")
        if update_status(item_id, status, evidence):
            sucesso += 1
        else:
            falha += 1
    
    print("\n" + "=" * 60)
    print(f"RESULTADO: {sucesso} atualizados, {falha} falhas")
    print("=" * 60)


if __name__ == "__main__":
    main()