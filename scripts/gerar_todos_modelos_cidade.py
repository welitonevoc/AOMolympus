#!/usr/bin/env python3
"""
Script completo para gerar modelos 3D de construção usando ComfyUI (porta 8188, instalação oficial).
Gera modelos para todas as 8 categorias de cidade em todos os 5 panteões.
"""

import json
import requests
import time
import shutil
from pathlib import Path
import sys

sys.path.insert(0, '/storage/emulated/0/Documents/age of mythology olympus/scripts')
from converter_workflow import workflow_to_prompt

COMFY_URL = 'http://localhost:8188'
REF_DIR = Path('/storage/emulated/0/Documents/age of mythology olympus/models/referencias_cidade')
OUTPUT_DIR = Path('/storage/emulated/0/Documents/age of mythology olympus/models/civilizations')

PANTHEOES = {
    'greek': ['zeus_major', 'poseidon_major', 'hades_major'],
    'egyptian': ['ra_major', 'isis_major', 'set_major'],
    'norse': ['thor_major', 'odin_major', 'loki_major', 'freyr_major'],
    'atlantean': ['kronos_major', 'oranos_major', 'gaia_major'],
    'chinese': ['fuxi_major', 'nuwa_major', 'shennong_major'],
}

CATEGORIAS = [
    'town_center', 'temples', 'barracks', 'fortresses',
    'towers', 'houses', 'divine_altar', 'geografica'
]

WORKFLOW_PATH = '/storage/emulated/0/Documents/ComfyUI/workflows/3. TripoSR - Fast 3D for Tablet.json'


def upload_image(image_path):
    with open(image_path, 'rb') as f:
        files = {'image': (image_path.name, f, 'image/png')}
        resp = requests.post(COMFY_URL + '/upload/image', files=files, timeout=30)
    if resp.status_code == 200:
        return resp.json().get('name')
    return None


def run_workflow(image_name):
    prompt = workflow_to_prompt(WORKFLOW_PATH, image_name=image_name)
    resp = requests.post(COMFY_URL + '/prompt', json={'prompt': prompt}, timeout=30)
    if resp.status_code == 200:
        return resp.json().get('prompt_id')
    return None


def wait_for_completion(prompt_id, timeout=600):
    start = time.time()
    while time.time() - start < timeout:
        resp = requests.get(COMFY_URL + '/history/' + prompt_id, timeout=10)
        if resp.status_code == 200:
            history = resp.json()
            if prompt_id in history:
                return True
        time.sleep(10)
    return False


def get_gltf_files(prompt_id):
    resp = requests.get(COMFY_URL + '/history/' + prompt_id, timeout=10)
    if resp.status_code != 200:
        return []
    history = resp.json()
    if prompt_id not in history:
        return []
    files = []
    outputs = history[prompt_id].get('outputs', [])
    for output in outputs:
        if isinstance(output, dict):
            for key, value in output.items():
                if isinstance(value, dict) and 'gltf' in value:
                    for gfile in value['gltf']:
                        files.append(gfile)
    return files


def download_gltf(gfile):
    view_url = COMFY_URL + '/view?filename=' + gfile + '&type=output&subfolder='
    resp = requests.get(view_url, timeout=120)
    if resp.status_code == 200:
        local_path = Path('/tmp/comfy_output_' + gfile)
        local_path.write_bytes(resp.content)
        return local_path
    return None


def copiar_para_civilizacoes(glb_path, categoria):
    if not glb_path or not glb_path.exists():
        print('  ERRO: arquivo nao encontrado: ' + str(glb_path))
        return 0
    count = 0
    for panteao, deuses in PANTHEOES.items():
        for deus in deuses:
            destino = OUTPUT_DIR / panteao / deus / 'cidade' / categoria / (categoria + '.glb')
            destino.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(glb_path, destino)
            count += 1
    return count


def main():
    print('=' * 60)
    print('GERACAO DE MODELOS 3D DE CONSTRUCAO - COMFYUI (porta 8188)')
    print('=' * 60)
    print('Panteoes: ' + str(list(PANTHEOES.keys())))
    print('Categorias: ' + str(CATEGORIAS))
    print('Total de modelos a gerar: ' + str(len(CATEGORIAS)))
    print()

    sucesso = 0
    falha = 0

    for categoria in CATEGORIAS:
        imagem_path = REF_DIR / (categoria + '.png')
        if not imagem_path.exists():
            print('[%s] Imagem nao encontrada, pulando.' % categoria)
            falha += 1
            continue

        print('[%s] Fazendo upload...' % categoria)
        image_name = upload_image(imagem_path)
        if not image_name:
            print('  Falha no upload.')
            falha += 1
            continue
        print('  Imagem enviada: ' + image_name)

        print('  Executando TripoSR (pode demorar 2-5 min)...')
        prompt_id = run_workflow(image_name)
        if not prompt_id:
            print('  Falha ao executar workflow.')
            falha += 1
            continue
        print('  Prompt ID: ' + prompt_id)

        print('  Aguardando conclusao...')
        if wait_for_completion(prompt_id, timeout=600):
            print('  Concluido!')
        else:
            print('  Timeout.')
            falha += 1
            continue

        gltf_files = get_gltf_files(prompt_id)
        if not gltf_files:
            print('  Nenhum GLB encontrado na saida.')
            falha += 1
            continue

        gfile = gltf_files[0]
        print('  GLB gerado: ' + gfile)

        local_path = download_gltf(gfile)
        if not local_path:
            print('  Falha ao baixar GLB.')
            falha += 1
            continue

        count = copiar_para_civilizacoes(local_path, categoria)
        print('  Copiado para %d pastas de civilizacoes.' % count)
        sucesso += 1
        print()

    print('=' * 60)
    print('RESULTADO: %d sucessos, %d falhas' % (sucesso, falha))
    print('=' * 60)


if __name__ == '__main__':
    main()