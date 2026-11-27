#!/usr/bin/env python3
import xml.etree.ElementTree as ET
from pathlib import Path

mod_dir = Path(r"D:\Users\Jose Menezes\Downloads\Heroes and Generals")
proto_path = mod_dir / "data" / "proto2.8.xml"

tree = ET.parse(proto_path)
root = tree.getroot()

target_ids = ["DB001", "DB002", "DB003", "DB004", "DB015", "DB018", "DB040"]

for u in root.findall("unit"):
    id_val = u.get("id", "")
    if id_val in target_ids:
        print("-------------------------------------")
        print(f"ID: {id_val} | Name: {u.get('name')}")
        anim_node = u.find("animfile")
        print(f"  animfile: {anim_node.text if anim_node is not None else 'None'}")
        icon_node = u.find("icon")
        print(f"  icon: {icon_node.text if icon_node is not None else 'None'}")
        hp_node = u.find("maxhitpoints")
        print(f"  hp: {hp_node.text if hp_node is not None else 'None'}")
        speed_node = u.find("speed")
        print(f"  speed: {speed_node.text if speed_node is not None else 'None'}")
        costs = [(c.get("resourcetype"), c.text) for c in u.findall("cost")]
        print(f"  costs: {costs}")
        types = [t.text for t in u.findall("unittype") if t.text]
        print(f"  types: {types[:8]}")
