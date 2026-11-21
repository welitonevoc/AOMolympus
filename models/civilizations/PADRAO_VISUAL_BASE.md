# 🎨 Padrão Visual Base — aldeao.glb (Referência para todos os modelos)

## Especificações Técnicas Obrigatórias

| Especificação | Valor |
|--------------|-------|
| Formato | .glb (GLTF 2.0) |
| Pose | T-pose ou A-pose limpa |
| Ossos | Prefixo `mixamorig:` ou BoneMap |
| Pesos por vértice | Máximo 4 |
| Texturas PBR | Albedo, Normal, Roughness, Metallic |
| Cores de facção | Via `material_override` (não baked na textura) |
| Skeleton | Retargeting Godot 4 `SkeletonProfileHumanoid` |
| Escala base (vilão) | 0.95 |
| Escala base (infantaria) | 1.0 |
| Escala base (arqueiro) | 1.0 |
| Escala base (cavalaria) | 1.1 |
| Escala base (herói) | 1.15 |
| Escala base (mito) | 1.3 |
| Escala base (siege) | 1.4 |
| Escala base (divino) | 1.4 – 2.7 |

## Checklist Visual por Modelo

- [ ] Modelo exportado em pose T ou A limpa
- [ ] Nomes de ossos respeitam prefixo `mixamorig:` ou mapeamento no BoneMap
- [ ] Pesos de vértice preservados (não recalculados proceduralmente)
- [ ] Máximo 4 pesos por vértice
- [ ] Texturas PBR completas: albedo, normal, roughness, metallic
- [ ] Testado no visualizador Kimodo 3D Studio com animação de marcha mocap
- [ ] Retargeting configurado no Godot 4 com `SkeletonProfileHumanoid`
- [ ] Cores de facção aplicadas via `material_override`
- [ ] Aura do herói (`#38bdf8`) via `_attach_hero_aura()` no `model_library.gd`
- [ ] Escala base correta por tipo de unidade

---
