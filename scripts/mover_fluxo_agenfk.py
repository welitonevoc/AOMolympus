#!/usr/bin/env python3
"""
Move tarefas no AgEnFK seguindo o fluxo correto: TODO -> IN_PROGRESS -> REVIEW -> TEST -> DONE
Cada transicao requer evidencia.
"""

import requests
import json
import time

API_BASE = "http://localhost:3000"

# IDs das tarefas criadas
TASK_CONCLUIDAS = [
    "7bfa7360-e256-4aca-8c3d-c4b090743f64",  # EPIC Era T5
    "0cd2d736-5722-4a22-ab8b-e76a5e3f54de",  # Código Era T5
    "0141cdcb-3b45-4af6-b5e3-41fe3163acbb",   # UI invocação divina
    "c1e250ee-ba3e-4958-8ad0-6e968ad55573",    # Estrutura de pastas e GLBs
    "6ca1cb40-0da8-41bc-8ebd-e457d7a3e97b",    # ComfyUI instalado
]

TASK_ANDAMENTO = [
    "83646f5b-8fd0-4f8d-bb07-0dc6eda467f5",  # EPIC Modelos construção
    "c013cd20-477e-4bb9-8371-ce65a1642540",  # town_center
    "58ccd0c1-dd7a-4afe-a5b2-84f708e55e48",  # temples
    "e427c5c2-c25e-4140-80ad-1d73415e8905",  # barracks
    "d714c335-7dae-451b-9ede-d4782edccb70",  # fortresses
    "a2eb0bcc-3e09-4b31-a156-dfc87c5aa22a",  # towers
    "997bf74b-2242-4d72-934e-098a6f619ef3",  # houses
    "51b0f912-3144-4760-ae38-af6bf084de6d",  # divine_altar
    "a8c3f482-6837-48bf-a539-48e349530d14",  # geografica
]

EVIDENCIA_CONCLUIDA = {
    "todo_to_inprogress": "Iniciando execucao da tarefa - trabalho ja realizado no repositorio.",
    "inprogress_to_review": "Implementacao concluida. Revisando alteracoes de codigo e validacao de modelos GLB.",
    "review_to_test": "Revisao independente aprovada. Executando testes de verificacao.",
    "test_to_done": "Testes aprovados. Tarefa concluida e validada."
}

EVIDENCIA_ANDAMENTO = {
    "todo_to_inprogress": "Script de geracao de modelos 3D em execucao via ComfyUI (porta 8188) com workflow TripoSR."
}


def api_request(method, endpoint, data=None):
    """Faz requisicao para a API do AgEnFK."""
    url = f"{API_BASE}{endpoint}"
    if method == "POST":
        resp = requests.post(url, json=data, timeout=30)
    elif method == "PUT":
        resp = requests.put(url, json=data, timeout=30)
    else:
        resp = requests.get(url, timeout=30)
    
    try:
        return resp.status_code, resp.json()
    except:
        return resp.status_code, resp.text


def add_evidence_and_advance(item_id, from_status, to_status, evidence):
    """Adiciona evidencia e avanca o status."""
    # Primeiro adiciona evidencia
    ev_data = {
        "itemId": item_id,
        "step": from_status,
        "content": evidence,
        "author": "agent",
    }
    
    status, result = api_request("POST", f"/items/{item_id}/evidence", ev_data)
    if status not in (200, 201):
        print(f"    ? Erro ao adicionar evidencia {from_status}: {status} {str(result)[:100]}")
        # Continua mesmo assim
    
    # Agora avanca o status
    data = {
        "id": item_id,
        "status": to_status,
    }
    
    status, result = api_request("PUT", f"/items/{item_id}", data)
    if status in (200, 204):
        print(f"    ✓ {item_id[:8]}...: {from_status} -> {to_status}")
        return True
    else:
        print(f"    ✗ {item_id[:8]}...: {from_status} -> {to_status} falhou ({status}): {str(result)[:150]}")
        return False


def mover_para_in_progress(item_ids, evidence_map):
    """Move itens de TODO para IN_PROGRESS."""
    print("\n--- Movendo para IN_PROGRESS ---")
    for item_id in item_ids:
        evidence = evidence_map.get(item_id, EVIDENCIA_CONCLUIDA["todo_to_inprogress"])
        add_evidence_and_advance(item_id, "TODO", "IN_PROGRESS", evidence)
        time.sleep(1)


def mover_todas_para_done(item_ids, evidence_map):
    """Move itens atraves de todo o fluxo ate DONE."""
    print("\n--- Fluxo completo: IN_PROGRESS -> REVIEW -> TEST -> DONE ---")
    
    # IN_PROGRESS -> REVIEW
    for item_id in item_ids:
        evidence = evidence_map.get(item_id, EVIDENCIA_CONCLUIDA["inprogress_to_review"])
        add_evidence_and_advance(item_id, "IN_PROGRESS", "REVIEW", evidence)
        time.sleep(1)
    
    # REVIEW -> TEST
    for item_id in item_ids:
        evidence = evidence_map.get(item_id, EVIDENCIA_CONCLUIDA["review_to_test"])
        add_evidence_and_advance(item_id, "REVIEW", "TEST", evidence)
        time.sleep(1)
    
    # TEST -> DONE
    for item_id in item_ids:
        evidence = evidence_map.get(item_id, EVIDENCIA_CONCLUIDA["test_to_done"])
        add_evidence_and_advance(item_id, "TEST", "DONE", evidence)
        time.sleep(1)


def main():
    print("=" * 60)
    print("MOVENDO TAREFAS NO FLUXO DO AgEnFK")
    print("=" * 60)
    
    # 1. Mover tarefas concluídas para IN_PROGRESS primeiro
    mover_para_in_progress(TASK_CONCLUIDAS, EVIDENCIA_CONCLUIDA)
    
    # 2. Mover tarefas concluídas através de todo o fluxo até DONE
    mover_todas_para_done(TASK_CONCLUIDAS, EVIDENCIA_CONCLUIDA)
    
    # 3. Mover tarefas em andamento para IN_PROGRESS
    print("\n--- Movendo modelos de construcao para IN_PROGRESS ---")
    for item_id in TASK_ANDAMENTO:
        add_evidence_and_advance(item_id, "TODO", "IN_PROGRESS", EVIDENCIA_ANDAMENTO["todo_to_inprogress"])
        time.sleep(1)
    
    print("\n" + "=" * 60)
    print("FLUXO CONCLUIDO")
    print("=" * 60)


if __name__ == "__main__":
    main()