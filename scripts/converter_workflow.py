#!/usr/bin/env python3
"""
Converte um workflow salvo do ComfyUI para o formato de prompt da API,
incluindo corretamente as conexões de links e os valores nomeados de widgets.
"""

import json


def workflow_to_prompt(workflow_path: str, image_name: str = None) -> dict:
    """Converte workflow salvo para formato de prompt da API ComfyUI."""
    with open(workflow_path) as f:
        wf = json.load(f)

    prompt = {}

    # Construir mapa de conexões de links de entrada
    links = wf.get("links", [])
    input_connections = {}  # (input_node_id, input_slot_index) -> [output_node_id_str, output_slot]
    for link in links:
        output_node_id = link[1]
        output_slot = link[2]
        input_node_id = link[3]
        input_slot = link[4]
        input_connections[(input_node_id, input_slot)] = [str(output_node_id), output_slot]

    for node in wf["nodes"]:
        node_id = str(node["id"])
        class_type = node["type"]

        # Construir inputs
        inputs = {}
        node_inputs = node.get("inputs", [])
        widgets_names = node.get("widgets_values_named", {})

        for i, inp in enumerate(node_inputs):
            slot_name = inp.get("name", f"input_{i}")
            if (node["id"], i) in input_connections:
                inputs[slot_name] = input_connections[(node["id"], i)]
            else:
                # Se não há link, usar valor nomeado do widget
                if slot_name in widgets_names:
                    inputs[slot_name] = widgets_names[slot_name]

        # Adicionar todos os parâmetros nomeados que ainda não estão em inputs
        for param_name, param_value in widgets_names.items():
            if param_name not in inputs:
                inputs[param_name] = param_value

        node_entry = {
            "class_type": class_type,
            "inputs": inputs,
        }

        # Manter widgets_values para compatibilidade
        wv = list(node.get("widgets_values", []))
        if wv:
            node_entry["widgets_values"] = wv

        prompt[node_id] = node_entry

    # Substituir imagem no nó de carga
    if image_name:
        for node_id, node_data in prompt.items():
            if node_data["class_type"] == "LoadImage":
                node_data["inputs"]["image"] = image_name
                if "widgets_values" in node_data and len(node_data["widgets_values"]) > 0:
                    node_data["widgets_values"][0] = image_name
                break

    return prompt


if __name__ == "__main__":
    prompt = workflow_to_prompt(
        "/storage/emulated/0/Documents/ComfyUI/workflows/3. TripoSR - Fast 3D for Tablet.json",
        image_name="divine_altar.png"
    )
    for nid, nd in prompt.items():
        print(f"Nó {nid}: {nd['class_type']}")
        if nd.get('inputs'):
            print(f"  inputs: {nd['inputs']}")
    print(f"Total: {len(prompt)} nós")