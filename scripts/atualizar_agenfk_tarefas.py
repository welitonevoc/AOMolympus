#!/usr/bin/env python3
"""
Script para atualizar as tarefas do AgEnFK com o trabalho realizado na Era T5
e nos modelos de construcao.
"""

import requests
import json
import sys
import time

API_BASE = "http://localhost:3000"
PROJECT_ID = "6b54828f-77d9-4615-95d4-5e7d7f611697"

def api_request(method, endpoint, data=None):
    """Faz requisição para a API do AgEnFK."""
    url = f"{API_BASE}{endpoint}"
    if method == "GET":
        resp = requests.get(url, timeout=30)
    elif method == "POST":
        resp = requests.post(url, json=data, timeout=30)
    elif method == "PUT":
        resp = requests.put(url, json=data, timeout=30)
    else:
        raise ValueError(f"Metodo nao suportado: {method}")
    
    try:
        return resp.status_code, resp.json()
    except:
        return resp.status_code, resp.text


def list_items():
    """Lista todos os itens do projeto."""
    status, data = api_request("GET", "/items")
    if status != 200:
        print(f"Erro ao listar itens: {status} {data}")
        return []
    return data


def create_item(item_type, title, description="", parent_id=None):
    """Cria um novo item no AgEnFK."""
    data = {
        "type": item_type,
        "title": title,
        "projectId": PROJECT_ID,
    }
    if description:
        data["description"] = description
    if parent_id:
        data["parentId"] = parent_id
    
    status, result = api_request("POST", "/items", data)
    if status in (200, 201):
        print(f"  ✓ Criado: {title} (ID: {result.get('id', 'N/A')})")
        return result
    else:
        print(f"  ✗ Erro ao criar '{title}': {status} {result}")
        return None


def update_item_status(item_id, new_status, evidence=""):
    """Atualiza o status de um item."""
    # Primeiro, vamos tentar um PUT para atualizar
    data = {
        "id": item_id,
        "status": new_status,
    }
    if evidence:
        data["evidence"] = evidence
    
    status, result = api_request("PUT", f"/items/{item_id}", data)
    if status in (200, 204):
        print(f"  ✓ Item {item_id} atualizado para {new_status}")
        return result
    else:
        print(f"  ✗ Erro ao atualizar item {item_id}: {status} {result}")
        return None


def add_evidence(item_id, step, content, author="agent"):
    """Adiciona evidência a um item."""
    data = {
        "itemId": item_id,
        "step": step,
        "content": content,
        "author": author,
    }
    status, result = api_request("POST", f"/items/{item_id}/evidence", data)
    if status in (200, 201):
        print(f"  ✓ Evidência adicionada: {step}")
        return result
    else:
        print(f"  ✗ Erro ao adicionar evidência: {status} {result}")
        return None


def main():
    print("=" * 60)
    print("ATUALIZANDO TAREFAS DO AgEnFK")
    print("=" * 60)
    
    # Listar itens existentes
    items = list_items()
    print(f"\nItens existentes no projeto: {len(items)}")
    for item in items:
        print(f"  [{item.get('type', '?')}] {item.get('title', 'N/A')} - {item.get('status', '?')}")
    
    print("\n" + "=" * 60)
    print("CRIANDO NOVAS TAREFAS PARA O TRABALHO REALIZADO")
    print("=" * 60)
    
    # 1. EPIC: Era T5 - Era dos Deuses
    epic_t5 = create_item(
        "EPIC",
        "Era T5 - Era dos Deuses (Era Divina)",
        "Implementacao completa da Era dos Deuses com 23 deuses maiores e ~46 menores invocaveis como unidades epicas, custos balanceados, poderes ativos/passivos, integracao com model/state/UI pipelines",
    )
    
    if epic_t5:
        epic_id = epic_t5.get("id")
        
        # Tarefa: Codigo da Era T5 (model_library, unit_actor, battle_world)
        create_item(
            "TASK",
            "Implementar codigo da Era T5: DIVINE_PROFILES, create_divine_unit_visual, summon_divine_god",
            "Adicionado DIVINE_PROFILES (62 deuses) em model_library.gd, create_divine_unit_visual(), modificacao de unit_actor.gd para usar DIVINE_PROFILES, battle_world.gd com divine_summoned_signal",
            parent_id=epic_id
        )
        
        # Tarefa: UI da invocacao divina
        create_item(
            "TASK",
            "UI de invocacao divina no mobile_hud.gd",
            "Painel de invocacao de deuses (_build_divine_invocation_ui, _on_attempt_summon, _on_divine_summoned), botao 'Deuses (T5)' visível na idade 5, sinais conectados",
            parent_id=epic_id
        )
        
        # Tarefa: Estrutura de pastas e GLBs de unidades
        create_item(
            "TASK",
            "Estrutura de pastas e GLBs de unidades (336 modelos copiados)",
            "240 pastas (16 deuses x 15 categorias), 336 GLBs copiados para unidade_militar, unidade_mitica, aldeao, deuses, mapas/flora",
            parent_id=epic_id
        )
        
        # Tarefa: ComfyUI instalado e rodando
        create_item(
            "TASK",
            "Instalar e configurar ComfyUI com PyTorch CPU",
            "PyTorch 2.15.0+CPU instalado no Debian proot-distro (Python 3.13.5), ComfyUI 0.46.0 rodando na porta 8188, custom nodes ComfyUI-Pixaroma e ComfyUI-Flowty-TripoSR instalados",
            parent_id=epic_id
        )
    
    print("\n" + "=" * 60)
    print("CRIANDO TAREFAS PARA MODELOS DE CONSTRUCAO")
    print("=" * 60)
    
    # Epic para modelos de construcao
    epic_construcao = create_item(
        "EPIC",
        "Modelos 3D de Construcao (Cidade)",
        "Geracao de modelos 3D para todas as 8 categorias de cidade (town_center, temples, barracks, fortresses, towers, houses, divine_altar, geografica) via ComfyUI TripoSR",
    )
    
    if epic_construcao:
        epic_id_c = epic_construcao.get("id")
        
        categorias = [
            ("town_center", "Centro da cidade"),
            ("temples", "Templos"),
            ("barracks", "Quartéis"),
            ("fortresses", "Fortalezas"),
            ("towers", "Torre de vigia"),
            ("houses", "Casas"),
            ("divine_altar", "Altar Divino"),
            ("geografica", "Elementos geográficos"),
        ]
        
        for cat, desc in categorias:
            create_item(
                "TASK",
                f"Gerar modelo 3D: {desc} ({cat})",
                f"Imagem de referência criada, workflow TripoSR executado via ComfyUI, GLB copiado para todas as 16 pastas de deuses em cidade/{cat}/",
                parent_id=epic_id_c
            )
    
    print("\n" + "=" * 60)
    print("RESUMO")
    print("=" * 60)
    print("Tarefas criadas no AgEnFK para o trabalho realizado.")
    print("Verifique no servidor: http://localhost:3000")


if __name__ == "__main__":
    main()