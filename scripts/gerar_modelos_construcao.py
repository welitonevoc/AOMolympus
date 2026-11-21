#!/usr/bin/env python3
"""
Script para gerar modelos 3D de construção usando ComfyUI Trellis 2.
Faz upload das imagens de referência, executa o workflow e baixa os GLBs gerados.
"""

import json
import os
import time
import requests
from pathlib import Path

# Configuração
COMFY_URL = "http://localhost:8189"  # ComfyUI rodando na porta 8189
REF_DIR = Path("/storage/emulated/0/Documents/age of mythology olympus/models/referencias_cidade")
WORKFLOW_PATH = "/storage/emulated/0/Documents/ComfyUI/workflows/1. Trellis 2 - Image to 3D Model - Low VRAM.json"
OUTPUT_DIR = Path("/storage/emulated/0/Documents/age of mythology olympus/models/civilizations")

CATEGORIAS = [
    "town_center", "temples", "barracks", "fortresses",
    "towers", "houses", "divine_altar", "geografica"
]

PANTHEOES = {
    "greek": ["zeus_major", "poseidon_major", "hades_major"],
    "egyptian": ["ra_major", "isis_major", "set_major"],
    "norse": ["thor_major", "odin_major", "loki_major", "freyr_major"],
    "atlantean": ["kronos_major", "oranos_major", "gaia_major"],
    "chinese": ["fuxi_major", "nuwa_major", "shennong_major"],
}


def upload_image(image_path: Path) -> str:
    """Faz upload de uma imagem para o ComfyUI e retorna o nome do arquivo."""
    url = f"{COMFY_URL}/upload/image"
    with open(image_path, "rb") as f:
        files = {"image": (image_path.name, f, "image/png")}
        response = requests.post(url, files=files, timeout=30)
    if response.status_code == 200:
        data = response.json()
        return data.get("name", image_path.name)
    else:
        print(f"Erro no upload: {response.status_code} {response.text}")
        return None


def run_workflow(workflow: dict, image_name: str) -> str:
    """Executa o workflow no ComfyUI e retorna o prompt_id."""
    # Modificar o nó 324 para usar nossa imagem
    for node in workflow["nodes"]:
        if node.get("id") == 324:
            node["widgets_values"][0] = image_name
            node["widgets_values_named"]["image"] = image_name
            break

    url = f"{COMFY_URL}/prompt"
    response = requests.post(url, json={"prompt": workflow}, timeout=30)
    if response.status_code == 200:
        data = response.json()
        return data.get("prompt_id")
    else:
        print(f"Erro ao executar workflow: {response.status_code} {response.text}")
        return None


def wait_for_completion(prompt_id: str, timeout: int = 300) -> bool:
    """Aguarda a conclusão da execução do prompt."""
    start = time.time()
    while time.time() - start < timeout:
        response = requests.get(f"{COMFY_URL}/history/{prompt_id}", timeout=10)
        if response.status_code == 200:
            history = response.json()
            if prompt_id in history:
                return True
        time.sleep(5)
    return False


def download_output(prompt_id: str) -> list:
    """Baixa os arquivos de saída gerados pelo ComfyUI."""
    response = requests.get(f"{COMFY_URL}/history/{prompt_id}", timeout=10)
    if response.status_code != 200:
        return []
    
    history = response.json()
    if prompt_id not in history:
        return []
    
    outputs = history[prompt_id].get("outputs", [])
    files = []
    for output in outputs:
        if isinstance(output, dict):
            for key, value in output.items():
                if isinstance(value, dict) and "gltf" in value:
                    # Modelo 3D gerado
                    for gfile in value["gltf"]:
                        files.append(gfile)
                elif isinstance(value, list):
                    for item in value:
                        if isinstance(item, dict) and "gltf" in item:
                            for gfile in item["gltf"]:
                                files.append(gfile)
    return files


def copiar_para_civilizacoes(glb_path: Path, categoria: str):
    """Copia o GLB gerado para todas as pastas de civilizações."""
    if not glb_path.exists():
        print(f"  Arquivo não encontrado: {glb_path}")
        return
    
    count = 0
    for panteao, deuses in PANTHEOES.items():
        for deus in deuses:
            destino = OUTPUT_DIR / panteao / deus / "cidade" / categoria / f"{categoria}.glb"
            destino.parent.mkdir(parents=True, exist_ok=True)
            import shutil
            shutil.copy2(glb_path, destino)
            count += 1
    
    print(f"  Copiado para {count} pastas de civilizações")


def main():
    # Carregar workflow
    with open(WORKFLOW_PATH) as f:
        workflow_base = json.load(f)
    
    print("=== Gerando modelos 3D de construção com ComfyUI ===\n")
    
    for categoria in CATEGORIAS:
        imagem_path = REF_DIR / f"{categoria}.png"
        if not imagem_path.exists():
            print(f"Imagem não encontrada: {imagem_path}")
            continue
        
        print(f"Processando: {categoria}")
        
        # Upload da imagem
        print(f"  Fazendo upload de {imagem_path.name}...")
        image_name = upload_image(imagem_path)
        if not image_name:
            print(f"  Falha no upload, pulando {categoria}")
            continue
        print(f"  Imagem enviada: {image_name}")
        
        # Executar workflow
        workflow = json.loads(json.dumps(workflow_base))  # deep copy
        prompt_id = run_workflow(workflow, image_name)
        if not prompt_id:
            print(f"  Falha ao executar workflow para {categoria}")
            continue
        print(f"  Workflow executado (prompt_id: {prompt_id})")
        
        # Aguardar conclusão
        print(f"  Aguardando conclusão...")
        if wait_for_completion(prompt_id, timeout=300):
            print(f"  Concluído!")
        else:
            print(f  "  Timeout aguardando conclusão")
            continue
        
        # Baixar saídas
        files = download_output(prompt_id)
        if files:
            for f in files:
                print(f"  Arquivo gerado: {f}")
        else:
            print(f"  Nenhum arquivo de saída encontrado")
        
        print()

    print("=== Concluído ===")


if __name__ == "__main__":
    main()