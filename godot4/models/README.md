# Modelos `.glb` Exportados da Galeria 3D

O autoload `ModelLibrary` (`res://scripts/autoload/model_library.gd`) carrega automaticamente modelos `.glb` colocados nesta pasta antes de usar as malhas procedurais nativas em GDScript.

## Convenção de nomes (gerada automaticamente pelo botão "Exportar GLB (Godot 4)")

### Construções (`res://models/buildings/`)
Ordem de prioridade procurada pelo jogo:
1. `<panteao>_<deus>_<tipo>_t<era>.glb` (ex.: `greek_zeus_town_center_t5.glb`)
2. `<panteao>_<tipo>_t<era>.glb` (ex.: `atlantean_temple_t3.glb`)
3. `<panteao>_<tipo>.glb` (ex.: `egyptian_fortress.glb`)

Tipos suportados (Fases 1, 2 e 3): `town_center`, `house`, `temple`, `barracks`, `archery`, `stable`, `tower`, `fortress`.
Panteões: `greek`, `egyptian`, `norse`, `atlantean`, `chinese`.
Eras: `t1` a `t5`.

### Unidades (`res://models/units/`)
Ordem de prioridade procurada pelo jogo:
1. `<panteao>_<deus>_<unidade>.glb` (ex.: `greek_zeus_infantry.glb`)
2. `<panteao>_<unidade>.glb` (ex.: `atlantean_myth.glb`)
3. `<unidade>.glb` (ex.: `villager.glb`)

Classes de unidade suportadas: `villager`, `infantry`, `archer`, `cavalry`, `hero`, `myth`, `siege`.
