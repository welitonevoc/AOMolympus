# 🏛️ Fase 3 — Modelos Definitivos por Deus (Guia de Integração)

## Como funciona

O sistema de carregamento já implementado (Fases 1 e 2) usa fallback de 3 níveis:

1. **Nível 1 (prioridade máxima):** `models/civilizations/<panteao>/<deus>/<categoria>/<unidade>/<unidade>_base.glb`
   → Modelo definitivo específico do deus (Fase 3 — artista entrega)
2. **Nível 2:** `models/civilizations/_shared/<panteao>/<unidade>_base.glb` ou `.fbx`
   → Modelo compartilhado do panteão (Fase 2 — Synty)
3. **Nível 3:** `models/civilizations/_shared/<unidade>_base.glb`
   → Modelo genérico compartilhado (Fase 1 — agora)
4. **Nível 4:** Fallback procedural (já existia)

Quando o artista entrega um modelo definitivo para um deus específico, basta colocá-lo no caminho do Nível 1 e o sistema automaticamente o usa em vez do `_shared/`.

---

## Estrutura esperada por unidade (padrão AoM)

Cada unidade definitiva deve ter exatamente estes arquivos na sua pasta:

```
<unidade>/
├── <unidade>_base.glb       ← esqueleto + malha em bind pose (SEM animação)
├── <unidade>_idle.glb       ← clipe de idle
├── <unidade>_walk.glb       ← clipe de andar
├── <unidade>_attack.glb     ← clipe de atacar
├── <unidade>_death.glb      ← clipe de morte
├── <unidade>_gather.glb     ← clipe de coleta (aldeões apenas)
└── accessories/
    ├── <arma>.glb           ← arma (lança, espada, arco...)
    └── <escudo>.glb         ← escudo ou item secundário
```

> **Regra do `_base.glb`:** Contém `Skeleton3D` + `MeshInstance3D` + `Skin` em bind pose. Não contém `AnimationPlayer`.
> **Regra dos ossos:** Os clipes de animação DEVEM ter os mesmos nomes de osso que o `_base.glb`. Se usar Mixamo, exporte "Without Skin" para os clipes.

---

## Pastas piloto criadas (exemplo: greek/zeus_major/)

```
models/civilizations/greek/zeus_major/
├── aldeao/
│   └── (colocar aldeao_base.glb + clipes + accessories/axe.glb, pickaxe.glb)
├── unidade_militar/
│   ├── hoplita/
│   │   └── accessories/   ← spear.glb, aspis_shield.glb
│   ├── toxotes/
│   │   └── accessories/   ← bow.glb
│   ├── hippikon/
│   │   └── accessories/   ← lance.glb, horse.glb
│   ├── catapult/
│   ├── hero_ajax/
│   │   └── accessories/   ← sword.glb, hero_shield.glb
│   └── ...
├── unidade_mitica/
│   ├── manticore/
│   └── colossus/
├── deuses/                ← zeus_portrait.glb, apollo_portrait.glb, etc.
└── cidade/                ← (já existe — manter estrutura atual)
```

---

## Checklist para o artista (por unidade)

- [ ] Modelo exportado em `.glb` (GLTF 2.0)
- [ ] Pose T ou A limpa
- [ ] Ossos com prefixo `mixamorig:` ou mapeamento no BoneMap
- [ ] Máximo 4 pesos por vértice
- [ ] Texturas PBR: albedo, normal, roughness, metallic
- [ ] Cores de facção via `material_override` (não baked na textura)
- [ ] Retargeting Godot 4 `SkeletonProfileHumanoid`
- [ ] Escala base correta por tipo (villager 0.95, infantry 1.0, hero 1.15, myth 1.3, divine 1.4–2.7)
- [ ] Clipes de animação com mesmos nomes de osso que o `_base.glb`

---

## Fluxo de integração (quando o artista entregar)

1. Artista entrega `hoplita_base.glb`, `hoplita_idle.glb`, `hoplita_walk.glb`, `hoplita_attack.glb`
2. Colocar em: `models/civilizations/greek/zeus_major/unidade_militar/hoplita/`
3. Colocar acessórios em: `models/civilizations/greek/zeus_major/unidade_militar/hoplita/accessories/`
4. O sistema de fallback (model_library.gd) detecta automaticamente o Nível 1 e usa o modelo definitivo
5. Sem alterar código — apenas adicionar arquivos

---

## Pronto para receber modelos

A infraestrutura de fallback já está implementada e validada (Fases 1 e 2). As pastas acima estão criadas como ponto de partida. Quando artistas entregarem modelos definitivos, basta colocar nos caminhos indicados — sem nenhuma alteração de código necessária.
