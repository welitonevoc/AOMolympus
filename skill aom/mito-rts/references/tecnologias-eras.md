# Tecnologias, Eras e Relíquias — AoM: The Titans

> Extraído diretamente de `techtreex.xmb` (507 tecnologias) e `relics2.xmb` (55 relíquias).

## Tecnologias e Efeitos (`techtreex.xmb`)

| Tecnologia | Custo | Tempo | Efeitos Principais |
|---|---|---|---|
| **Age 1** | — | 0.0000s | Data(MinimumResourceTrickleRate) 0.00 [Absolute] -> ; Data(MaximumResourceTrickleRate) 100.00 [Absolute] -> ; Data(ResourceTrickleRate) 0.00 [Absolute] ->  |
| **Age 2** | — | 0s | SetAge()  [] -> ; Sound()  [] -> ; Data(MaximumRange) 9.00 [Absolute] -> Priest |
| **Age 3** | — | 0s | SetAge()  [] -> ; Sound()  [] -> ; Data(MaximumRange) 7.00 [Absolute] -> Priest |
| **Medium Archers** | 150W 150G | 20.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> AbstractArcher; Data(Damage) 1.10 [BasePercent] -> AbstractArcher |
| **Heavy Archers** | 300W 300G | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> AbstractArcher; SetName()  [] ->  |
| **Champion Archers** | 500W 400G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> AbstractArcher; SetName()  [] ->  |
| **Medium Infantry** | 150F 150G | 20.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> AbstractInfantry; SetName()  [] ->  |
| **Heavy Infantry** | 300F 300G | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> AbstractInfantry; SetName()  [] ->  |
| **Champion Infantry** | 500F 400G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> AbstractInfantry; SetName()  [] ->  |
| **Husbandry** | 100W 50G | 30.0000s | TextOutput()  [] -> ; Data(CarryCapacity) 2.00 [BasePercent] -> AbstractVillager; Data(WorkRate) 1.30 [BasePercent] -> Herdable |
| **Plow** | 50W 100G | 40.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(WorkRate) 1.12 [BasePercent] -> Villager Egyptian |
| **Irrigation** | 150W 250G | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(WorkRate) 1.01 [BasePercent] -> Villager Egyptian |
| **Copper Weapons** | 200F 200G | 30.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> AbstractArcher; Data(Damage) 1.10 [BasePercent] -> AbstractInfantry |
| **Bronze Weapons** | 300F 300G | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> AbstractArcher; Data(Damage) 1.10 [BasePercent] -> AbstractInfantry |
| **Iron Weapons** | 600F 600G | 50.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> AbstractArcher; Data(Damage) 1.10 [BasePercent] -> AbstractInfantry |
| **Copper Mail** | 150F 150G | 30.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> HumanSoldier; Data(ArmorVulnerability) -0.15 [Percent] -> Hero |
| **Bronze Mail** | 300F 200G | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> HumanSoldier; Data(ArmorVulnerability) -0.15 [Percent] -> Hero |
| **Iron Mail** | 500F 500G | 50.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> HumanSoldier; Data(ArmorVulnerability) -0.15 [Percent] -> Hero |
| **Copper Shields** | 150W 150G | 30.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> HumanSoldier; Data(ArmorVulnerability) -0.15 [Percent] -> Hero |
| **Bronze Shields** | 300W 200G | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> HumanSoldier; Data(ArmorVulnerability) -0.15 [Percent] -> Hero |
| **Iron Shields** | 500W 400G | 50.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> HumanSoldier; Data(ArmorVulnerability) -0.15 [Percent] -> Hero |
| **Ambassadors** | 250G | 30.0000s | TextOutput()  [] -> ; Data(TributePenalty) 0.00 [Assign] ->  |
| **Tax Collectors** | 200F 200G | 35.0000s | TextOutput()  [] -> ; Data(Market) 0.85 [Percent] -> ; Data(Market) 1.15 [Percent] ->  |
| **Coinage** | 200G | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.20 [BasePercent] -> Caravan Norse; Data(MaximumVelocity) 1.20 [BasePercent] -> Caravan Greek |
| **Medium Cavalry** | 200F 100G | 20.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> AbstractCavalry; SetName()  [] ->  |
| **Heavy Cavalry** | 400F 200G | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> AbstractCavalry; SetName()  [] ->  |
| **Champion Cavalry** | 700F 200G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> AbstractCavalry; SetName()  [] ->  |
| **Watch Tower** | 200W 100G | 20.0000s | Data(ActionEnable) 1.00 [Absolute] -> Tower; SetName()  [] -> ; Data(LOS) 6.00 [Absolute] ->  |
| **Guard Tower** | 300W 300G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 300.00 [Absolute] -> Tower; Data(Damage) 1.70 [BasePercent] -> Tower |
| **Ballista Tower** | 500F 800W | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.50 [BasePercent] -> Tower; SetName()  [] ->  |
| **Boiling Oil** | 100F 300W | 40.0000s | TextOutput()  [] -> ; Data(ActionEnable) 1.00 [Absolute] -> Tower; Data(ActionEnable) 1.00 [Absolute] -> Fortress |
| **Levy Infantry** | 300F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> AbstractInfantry |
| **Burning Pitch** | 500W 300G | 40.0000s | TextOutput()  [] -> ; Data(DamageBonus) 6.00 [Absolute] -> AbstractArcher; Data(Damage) 1.20 [BasePercent] -> Ballista |
| **Masons** | 200F 300W | 20.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> LogicalTypeBuildingNotTitanGate; Data(ArmorVulnerability) -0.05 [Percent] -> LogicalTypeBuildingNotTitanGate |
| **Pickaxe** | 50F 120W | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(CarryCapacity) 1.50 [BasePercent] -> AbstractVillager |
| **Hand Axe** | 120F 50G | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(CarryCapacity) 1.50 [BasePercent] -> AbstractVillager |
| **Shaft Mine** | 150F 250W | 40.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(CarryCapacity) 1.50 [BasePercent] -> AbstractVillager |
| **Bow Saw** | 250F 150G | 45.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(CarryCapacity) 1.50 [BasePercent] -> AbstractVillager |
| **Quarry** | 200F 300W | 50.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(CarryCapacity) 1.50 [BasePercent] -> AbstractVillager |
| **Carpenters** | 300F 200G | 55.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(CarryCapacity) 1.50 [BasePercent] -> AbstractVillager |
| **Bravery** | 400F 30Fv | 40.0000s | TextOutput()  [] -> ; Data(DamageBonus) 1.00 [Absolute] -> Huskarl; Data(Damage) 1.20 [BasePercent] -> Huskarl |
| **Valley of the Kings** | 500G 40Fv | 40.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.33 [Percent] -> Camelry; Data(TrainPoints) 0.33 [Percent] -> Chariot Archer |
| **Winter Harvest** | 200F 20Fv | 40.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.20 [BasePercent] -> AbstractVillager |
| **Safeguard** | 200W 10Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 2.00 [BasePercent] -> AbstractWall; Data(Hitpoints) 2.00 [BasePercent] -> Tower |
| **Rampage** | 300G 20Fv | 40.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.05 [Percent] -> MythUnit |
| **Mithril Breastplate** | 150G 10Fv | 30.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> Ulfsark |
| **Call Of Valhalla** | 200W 20Fv | 50.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> Ulfsark |
| **Arctic Winds** | 200W 10Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [BasePercent] -> Longboat; Data(Hitpoints) 1.10 [BasePercent] -> Longboat |
| **Arctic Gale** | 250W 20Fv | 50.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.20 [BasePercent] -> Siege Ship Norse; Data(ArmorVulnerability) -0.30 [Percent] -> Siege Ship Norse |
| **Wrath Of The Deep** | 200G 15Fv | 50.0000s | TextOutput()  [] -> ; Data(Hitpoints) 200.00 [Absolute] -> Kraken; SetName()  [] ->  |
| **Spirited Charge** | 250F 25Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [BasePercent] -> AbstractCavalry; Data(Damage) 1.10 [BasePercent] -> AbstractCavalry |
| **Thundering Hooves** | 300F 20Fv | 30.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [BasePercent] -> AbstractCavalry; Data(Hitpoints) 1.10 [BasePercent] -> AbstractCavalry |
| **Berserkergang** | 300G 45Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> Ulfsark; Data(Damage) 1.10 [BasePercent] -> Ulfsark |
| **Rime** | 200F 20Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.33 [BasePercent] -> Frost Giant; SetName()  [] ->  |
| **Draft Horses** | 300F 200G | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.20 [BasePercent] -> AbstractSiegeWeapon |
| **Engineers** | 300F 500G | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.25 [BasePercent] -> AbstractSiegeWeapon; Data(Damage) 1.25 [BasePercent] -> AbstractSiegeWeapon |
| **Architects** | 400F 500W | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> LogicalTypeBuildingNotTitanGate; Data(ArmorVulnerability) -0.05 [Percent] -> LogicalTypeBuildingNotTitanGate |
| **Bone Bow** | 250W 20Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumRange) 4.00 [Absolute] -> Chariot Archer |
| **Axe of Vengeance** | 300W 25Fv | 40.0000s | TextOutput()  [] -> ; Data(DamageBonus) 2.00 [Absolute] -> Axeman |
| **Desert Wind** | 400G 40Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.20 [BasePercent] -> Camelry; Data(Damage) 1.20 [BasePercent] -> Camelry |
| **Enclosed Deck** | 200F 200W | 40.0000s | TextOutput()  [] -> ; Data(MaximumContained) 2.00 [BasePercent] -> Ship |
| **Cladding** | 200W 200G | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> ArcherShip; Data(MaximumRange) 4.00 [Absolute] -> ArcherShip |
| **Fortified Wall** | 500F 400G | 50.0000s | TextOutput()  [] -> ; Data(Hitpoints) 600.00 [Absolute] -> AbstractWall; SetName()  [] ->  |
| **Age 1 Zeus** | — | 0.0000s | TechStatus()  [] -> ; TechStatus()  [] -> ; Data(Enable) 1.00 [Absolute] -> Pegasus |
| **Skin Of The Rhino** | 50F 5Fv | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.30 [Percent] -> AbstractVillager; Data(ArmorVulnerability) -0.30 [Percent] -> AbstractVillager |
| **Age 1_5 Egyptian** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Temple; Data(Enable) 1.00 [Absolute] -> Dock; Data(Enable) 1.00 [Absolute] -> Outpost |
| **Sacred Cats** | 110G 10Fv | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager |
| **Granite Blood** | 600W 30Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 200.00 [Absolute] -> Mountain Giant; Data(Hitpoints) 200.00 [Absolute] -> Fire Giant |
| **Hamarrtroll** | 200W 10Fv | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 50.00 [Absolute] -> Troll; SetName()  [] ->  |
| **Criosphinx** | 150W 5Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 50.00 [Absolute] -> Sphinx; SetName()  [] ->  |
| **Hieracosphinx** | 200W 10Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.20 [BasePercent] -> Sphinx; Data(Damage) 1.20 [BasePercent] -> Sphinx |
| **Monstrous Rage** | 250F 25Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.25 [BasePercent] -> MythUnit; Data(Damage) 1.25 [BasePercent] -> MythUnit |
| **Phobos Spear of Panic** | 200F 15Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> Hoplite |
| **Bacchanalia** | 300W 20Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.05 [BasePercent] -> Unit |
| **Sun Ray** | 200G 30Fv | 30.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> AbstractArcher; Data(Damage) 1.10 [BasePercent] -> Centaur |
| **Sylvan Lore** | 300W 20Fv | 40.0000s | Data(Hitpoints) 1.25 [BasePercent] -> Centaur; SetName()  [] -> ; Data(MaximumVelocity) 1.30 [BasePercent] -> Centaur |
| **Forge of Olympus** | 300G 60Fv | 30.0000s | TextOutput()  [] -> ; Data(Cost) 0.25 [Percent] -> Armory; Data(Cost) 0.25 [Percent] -> Armory |
| **Age 1 Hades** | — | 0.0000s | TechStatus()  [] -> ; TechStatus()  [] -> ; Data(Enable) 1.00 [Absolute] -> Granary |
| **Age 1 Poseidon** | — | 0.0000s | TechStatus()  [] -> ; TechStatus()  [] -> ; Data(Enable) 1.00 [Absolute] -> Granary |
| **Age 1 Ra** | — | 0.0000s | TechStatus()  [] -> ; TechStatus()  [] -> ; Data(Enable) 1.00 [Absolute] -> Granary |
| **Age 1 Isis** | — | 0.0000s | Data(Cost) 0.90 [Percent] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Age 1 Set** | — | 0.0000s | TechStatus()  [] -> ; TechStatus()  [] -> ; Data(Enable) 1.00 [Absolute] -> Granary |
| **Age 1 Odin** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Dwarf; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Age 1 Thor** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Dwarf; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Age 1 Loki** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Dwarf; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Aurora Borealis** | 200G 10Fv | 30.0000s | TextOutput()  [] -> ; Data(Damage) 1.50 [BasePercent] -> Valkyrie; SetName()  [] ->  |
| **Age 2 Athena** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 2 Ares** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 2 Hermes** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Dionysos** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Apollo** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Aphrodite** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Hera** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Artemis** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Hephaestus** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Hunting Dogs** | 100W 100G | 20.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.30 [BasePercent] -> AbstractVillager |
| **Hand of Talos** | 300W 20Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 200.00 [Absolute] -> Colossus; SetName()  [] ->  |
| **Sarissa** | 200W 20Fv | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> Hoplite |
| **Aegis Shield** | 300W 25Fv | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> AbstractInfantry |
| **Winged Messenger** | 50G 10Fv | 30.0000s | TextOutput()  [] -> ; Data(LOS) 6.00 [Absolute] -> Pegasus; Data(TrainPoints) 0.50 [Percent] -> Pegasus |
| **Age 2 Anubis** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 2 Bast** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 2 Ptah** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Hathor** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Nephthys** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Sekhmet** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Thoth** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Osiris** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Horus** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Feet of the Jackal** | 200G 10Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 50.00 [Absolute] -> Anubite; SetName()  [] ->  |
| **Age 4** | — | 0s | SetAge()  [] -> ; Data(Enable) 1.00 [Absolute] -> Wonder; Sound()  [] ->  |
| **Age 2 Forseti** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 2 Heimdall** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 2 Freyja** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Skadi** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Bragi** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Njord** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Hel** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Baldr** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Tyr** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Signal Fires** | 150W | 30.0000s | TextOutput()  [] -> ; Data(LOS) 6.00 [Absolute] -> LogicalTypeBuildingsNotWalls |
| **Stone Wall** | 200F 200G | 40.0000s | TextOutput()  [] -> ; Data(LOS) 7.00 [Absolute] -> AbstractWall; Data(Hitpoints) 600.00 [Absolute] -> AbstractWall |
| **Shoulder of Talos** | 300G 20Fv | 50.0000s | TextOutput()  [] -> ; Data(Hitpoints) 200.00 [Absolute] -> Colossus; SetName()  [] ->  |
| **Book of Thoth** | 400W 30Fv | 40.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> Villager Egyptian; Data(WorkRate) 1.10 [BasePercent] -> Villager Egyptian |
| **Face of the Gorgon** | 400W 30Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.33 [BasePercent] -> Medusa; SetName()  [] ->  |
| **Citadel Wall** | 800F 500G | 50.0000s | TextOutput()  [] -> ; Data(Hitpoints) 600.00 [Absolute] -> AbstractWall; SetName()  [] ->  |
| **Conscript Infantry** | 500F | 30.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> AbstractInfantry |
| **Levy Archers** | 300F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> AbstractArcher |
| **Conscript Archers** | 500W | 30.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> AbstractArcher |
| **Levy Cavalry** | 300F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> AbstractCavalry |
| **Conscript Cavalry** | 500F | 30.0000s | Data(TrainPoints) 0.80 [Percent] -> AbstractCavalry; TextOutput()  [] ->  |
| **Carrier Pigeons** | 400W | 45.0000s | TextOutput()  [] -> ; Data(LOS) 6.00 [Absolute] -> LogicalTypeBuildingsNotWalls |
| **Flood Control** | 250W 350G | 40.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(WorkRate) 1.01 [BasePercent] -> Villager Egyptian |
| **Pharaoh Respawn** | — | 0.0000s | CreateUnit()  [] -> ; TextOutput()  [] ->  |
| **Starting Units Norse** | — | 0.0000s | CreateUnit()  [] -> ; CreateUnit()  [] -> ; CreateUnit()  [] ->  |
| **Starting Units Greek** | — | 0.0000s | CreateUnit()  [] -> ; CreateUnit()  [] -> ; CreateUnit()  [] ->  |
| **Starting Units Egyptian** | — | 0.0000s | CreateUnit()  [] -> ; CreateUnit()  [] ->  |
| **Monument 1** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Monument 2 |
| **Monument 2** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Monument 3 |
| **Monument 3** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Monument 4 |
| **Monument 4** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Monument 5 |
| **Dwarven Mail** | 300G 30Fv | 50.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.20 [Percent] -> Military; Data(ArmorVulnerability) -0.20 [Percent] -> Hero |
| **Dwarven Shields** | 300G 20Fv | 40.0000s | TextOutput()  [] ->  |
| **Dwarven Weapons** | 400G 40Fv | 50.0000s | Data(DamageBonus) 4.00 [Absolute] -> Military; Data(DamageBonus) 4.00 [Absolute] -> Military; TextOutput()  [] ->  |
| **Serpent Spear** | 250F 12Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> Spearman |
| **Flood of the Nile** | 150G 5Fv | 40.0000s | TextOutput()  [] -> ; Data(ResourceTrickleRate) 0.75 [Absolute] -> ; Data(MaximumResourceTrickleRate) 100.00 [Absolute] ->  |
| **Vaults of Erebus** | 150F 5Fv | 40.0000s | TextOutput()  [] -> ; Data(MinimumResourceTrickleRate) 0.10 [Absolute] -> ; Data(MaximumResourceTrickleRate) 100.00 [Absolute] ->  |
| **Lord of Horses** | 150F 10Fv | 40.0000s | TextOutput()  [] -> ; Data(LOS) 4.00 [Absolute] -> AbstractCavalry; Data(LOS) 4.00 [Absolute] -> Scout |
| **Olympic Parentage** | 200F 10Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.25 [BasePercent] -> Hero |
| **Pig Sticker** | 100G 1Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 5.00 [BasePercent] -> AbstractVillager; Data(WorkRate) 1.20 [BasePercent] -> AbstractVillager |
| **Lone Wanderer** | 175W 5Fv | 25.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [BasePercent] -> Ulfsark |
| **Eyes in the Forest** | 50G 2Fv | 25.0000s | TextOutput()  [] -> ; Data(LOS) 3.00 [Absolute] -> AbstractInfantry; Data(LOS) 3.00 [Absolute] -> Hero Norse |
| **Scalloped Axe** | 100F 10Fv | 60.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> Axeman |
| **Ring Giver** | 400G 30Fv | 60.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.25 [BasePercent] -> Jarl |
| **Long Serpent** | 200G 25Fv | 45.0000s | Data(Damage) 1.20 [BasePercent] -> Longboat; TextOutput()  [] -> ; Data(ArmorVulnerability) -0.20 [Percent] -> Longboat |
| **Swine Array** | 200W 20Fv | 50.0000s | TextOutput()  [] -> ; Data(DamageBonus) 1.00 [Absolute] -> Ulfsark; Data(DamageBonus) 1.00 [Absolute] -> Ulfsark |
| **Age 1_5 Norse** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Dock; Data(Enable) 1.00 [Absolute] -> Temple |
| **Age 1_5 Greek** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Dock; Data(Enable) 1.00 [Absolute] -> Temple; Data(Cost) -25.00 [Absolute] -> Dock |
| **Odins Raven Respawn** | — | 0.1000s | TextOutput()  [] -> ; CreateUnit()  [] ->  |
| **Heavy Camelry** | 300F 300G | 15.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> Camelry; Data(Damage) 1.10 [BasePercent] -> Camelry |
| **Champion Camelry** | 400F 200G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> Camelry; Data(Damage) 1.10 [BasePercent] -> Camelry |
| **Pharaoh Respawn Osiris** | — | 0.0000s | TextOutput()  [] -> ; CreateUnit()  [] ->  |
| **New Kingdom** | 300G 25Fv | 40.0000s | TextOutput()  [] -> ; CreateUnit()  [] ->  |
| **Medjay** | 250F 25Fv | 30.0000s | TextOutput()  [] -> ; Data(Lifespan) 30.00 [Absolute] -> Mercenary; Data(Lifespan) 30.00 [Absolute] -> Mercenary Cavalry |
| **Funeral Rites** | 200G 15Fv | 30.0000s | TextOutput()  [] -> ; Data(DamageBonus) 4.00 [Absolute] -> Pharaoh; Data(DamageBonus) 4.00 [Absolute] -> Priest |
| **Spirit of Maat** | 200G 25Fv | 40.0000s | TextOutput()  [] -> ; Data(WorkRate) 2.00 [BasePercent] -> Pharaoh; Data(WorkRate) 2.00 [BasePercent] -> Priest |
| **City of the Dead** | 200W 15Fv | 40.0000s | TextOutput()  [] -> ; TechStatus()  [] -> ; Data(Hitpoints) 1.30 [BasePercent] -> AbstractPharaoh |
| **Fortify Town Center** | 400W 400G | 60.0000s | TextOutput()  [] -> ; Data(PopulationCapAddition) 5.00 [Absolute] -> SettlementsThatTrainVillagers; SetName()  [] ->  |
| **Heroes Zeus Age 2** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Odysseus |
| **Heroes Zeus Age 3** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Heracles |
| **Heroes Zeus Age 4** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Bellerophon; Data(Enable) 1.00 [Absolute] -> Myrmidon |
| **Heroes Poseidon Age 2** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Hippolyta |
| **Heroes Poseidon Age 3** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Atalanta |
| **Heroes Poseidon Age 4** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Polyphemus; Data(Enable) 1.00 [Absolute] -> Hero Greek Argo; Data(Enable) 1.00 [Absolute] -> Hetairoi |
| **Heroes Hades Age 2** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Chiron |
| **Heroes Hades Age 3** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Achilles |
| **Heroes Hades Age 4** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Perseus; Data(Enable) 1.00 [Absolute] -> Crossbowman |
| **Shaduf** | 150W 10Fv | 30.0000s | TextOutput()  [] -> ; Data(Cost) 0.66 [Percent] -> Farm; Data(WorkRate) 2.00 [BasePercent] -> Villager Egyptian |
| **Monument 0** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Monument |
| **Golden Apples** | 200F 150G | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.15 [BasePercent] -> AbstractVillager |
| **Eldhrimnir Kettle** | 250F 10Fv | 30.0000s | TextOutput()  [] -> ; SetName()  [] -> ; Data(Damage) 6.00 [Absolute] -> Einheriar |
| **Pegasus Relic Respawn** | — | 0.0000s | CreateUnit()  [] -> ; TextOutput()  [] ->  |
| **Will of Kronos** | 200F 25Fv | 30.0000s | Data(Damage) 1.50 [BasePercent] -> Cyclops; Data(TrainPoints) 0.75 [Percent] -> Cyclops; TextOutput()  [] ->  |
| **Labyrinth of Minos** | 250W 20Fv | 30.0000s | Data(Cost) 0.75 [Percent] -> Minotaur; Data(Hitpoints) 1.40 [BasePercent] -> Minotaur; SetName()  [] ->  |
| **Flames of Typhon** | 400F 20Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.30 [BasePercent] -> Chimera; Data(Hitpoints) 1.20 [BasePercent] -> Chimera |
| **Divine Blood** | 200F 35Fv | 30.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.20 [BasePercent] -> Villager Greek; Data(WorkRate) 1.20 [BasePercent] -> Villager Greek |
| **Shafts of Plague** | 300G 40Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.15 [BasePercent] -> Toxotes; Data(Damage) 1.15 [BasePercent] -> Peltast |
| **Flaming Weapons Active** | — | 0.1000s | Data(Damage) 2.00 [BasePercent] -> HumanSoldier; Data(Damage) 2.00 [BasePercent] -> HumanSoldier; Data(Damage) 2.00 [BasePercent] -> Hero |
| **Loss of LOS** | — | 0.0000s | Data(LOS) 0.25 [Percent] -> Hero; Data(LOS) 0.20 [Percent] -> HumanSoldier; Data(LOS) 0.20 [BasePercent] -> Centaur |
| **Pharaoh Respawn City of the Dead** | — | 0.0000s | CreateUnit()  [] -> ; TextOutput()  [] ->  |
| **Athenian Wall** | 400W 30Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> LogicalTypeBuildingNotTitanGate; Data(Hitpoints) 1.10 [BasePercent] -> AbstractWall |
| **Heroes Hades Age 1** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Ajax |
| **Heroes Poseidon Age 1** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Theseus |
| **Heroes Zeus Age 1** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hero Greek Jason |
| **Dwarven Auger** | 300G 35Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.20 [BasePercent] -> Portable Ram; Data(TrainPoints) 0.50 [Percent] -> Portable Ram |
| **Purse Seine** | 150W 150G | 20.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.30 [BasePercent] -> UtilityShip |
| **Reinforced Hull** | 300W 200G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> HammerShip; Data(Damage) 1.10 [BasePercent] -> HammerShip |
| **Huntress Axe** | 300G 20Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.20 [BasePercent] -> Throwing Axeman |
| **Crocodopolis** | 400W 20Fv | 40.0000s | TextOutput()  [] -> ; SetName()  [] -> ; Data(MaximumRange) 6.00 [Absolute] -> Petsuchos |
| **Leather Frame Shield** | 200W 20Fv | 60.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> Spearman |
| **Electrum Bullets** | 200G 10Fv | 60.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> Slinger |
| **Stones of Red Linen** | 300W 25Fv | 60.0000s | TextOutput()  [] -> ; Data(Damage) 1.20 [BasePercent] -> Catapult; Data(Damage) 1.20 [BasePercent] -> Siege Ship Egyptian |
| **Spear on the Horizon** | 300G 30Fv | 50.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> Spearman; Data(Hitpoints) 1.30 [BasePercent] -> Spearman |
| **Feral** | 100G 10Fv | 50.0000s | TextOutput()  [] -> ; Data(Damage) 1.25 [BasePercent] -> Huntable; Data(Hitpoints) 1.10 [BasePercent] -> Huntable |
| **Anastrophe** | 300F 20Fv | 40.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.75 [Percent] -> Ramming Ship Greek; Data(Damage) 1.20 [BasePercent] -> Ramming Ship Greek |
| **Trierarch** | 300G 40Fv | 50.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.20 [Percent] -> Trireme |
| **Thracian Horses** | 400F 30Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> AbstractCavalry |
| **Assign LOS** | — | 0s | Data(LOS) 12.00 [Assign] -> Unit |
| **Roar of Orthus** | 300F 20Fv | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.50 [Percent] -> Nemean Lion; Data(ArmorVulnerability) -0.20 [Percent] -> Nemean Lion |
| **Atef Crown** | 300G 25Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.40 [BasePercent] -> Mummy; Data(Lifespan) 2.00 [BasePercent] -> Minion |
| **Conscript Sailors** | 500W | 30.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Ship |
| **Naval Oxybeles** | 500W 200G | 40.0000s | TextOutput()  [] -> ; Data(MaximumRange) 12.00 [Absolute] -> SiegeShip; SetName()  [] ->  |
| **Enyos Bow of Horror** | 200G 20Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> Toxotes |
| **Deimos Sword of Dread** | 200F 15Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.15 [BasePercent] -> Hypaspist |
| **Champion Elephants** | 500F 400G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> War Elephant; Data(Damage) 1.10 [BasePercent] -> War Elephant |
| **Hall of Thanes** | 300W 10Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [Absolute] -> Hero Norse; Data(Hitpoints) 1.10 [BasePercent] -> Hero Norse |
| **Adze of Wepwawet** | 100G 10Fv | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager; Data(DamageBonus) 5.00 [Absolute] -> AbstractVillager |
| **Slings of the Sun** | 200G 20Fv | 40.0000s | TextOutput()  [] -> ; Data(DamageBonus) 0.30 [Absolute] -> Slinger; Data(DamageBonus) 0.30 [Absolute] -> Slinger |
| **Ram of the West Wind** | 250G 20Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> Siege Tower; Data(Damage) 1.20 [BasePercent] -> Siege Tower |
| **Sundried Mud Brick** | 300W 20Fv | 50.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> LogicalTypeBuildingNotTitanGate; Data(Cost) 0.85 [Percent] -> LogicalTypeBuildingNotTitanGate |
| **Funeral Barge** | 500W 30Fv | 50.0000s | TextOutput()  [] -> ; Data(DamageBonus) 2.00 [Absolute] -> Kebenit; Data(DamageBonus) 2.00 [Absolute] -> Kebenit |
| **Necropolis** | 180G 5Fv | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractMonument |
| **Disable Armory for Thor** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Dwarf Foundry; Data(Enable) 1.00 [Absolute] -> Tower; Data(Enable) 1.00 [Absolute] -> Longhouse |
| **Iron Mail Thor** | 400F 400G | 50.0000s | TechStatus()  [] ->  |
| **Bronze Mail Thor** | 200F 100G | 40.0000s | TechStatus()  [] ->  |
| **Bronze Shields Thor** | 200W 100G | 40.0000s | TechStatus()  [] ->  |
| **Bronze Weapons Thor** | 200F 200G | 40.0000s | TechStatus()  [] ->  |
| **Iron Shields Thor** | 400W 300G | 50.0000s | TechStatus()  [] ->  |
| **Iron Weapons Thor** | 500F 500G | 50.0000s | TechStatus()  [] ->  |
| **Burning Pitch Thor** | 400W 200G | 40.0000s | TechStatus()  [] ->  |
| **Hammer of the Gods** | 500F 500G | 60.0000s | TextOutput()  [] -> ; Data(Damage) 1.10 [BasePercent] -> AbstractInfantry; Data(Damage) 1.10 [BasePercent] -> AbstractArcher |
| **Meteoric Iron Mail** | 500F 500G | 60.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> HumanSoldier; Data(ArmorVulnerability) -0.10 [Percent] -> Hero |
| **Dragonscale Shields** | 500W 500G | 60.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> HumanSoldier; Data(ArmorVulnerability) -0.10 [Percent] -> Hero |
| **Tusks of Apedemak** | 300G 30Fv | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> War Elephant; Data(Damage) 1.10 [BasePercent] -> War Elephant |
| **Oracle** | 150W 10Fv | 30.0000s | TextOutput()  [] -> ; Data(LOS) 6.00 [Absolute] -> Unit; Data(LOS) 8.00 [Absolute] -> Building |
| **Sons of Sleipnir** | 400F 30Fv | 40.0000s | TextOutput()  [] -> ; Data(DamageBonus) 2.00 [Absolute] -> Raiding Cavalry; Data(DamageBonus) 2.00 [Absolute] -> Raiding Cavalry |
| **Set Age 2 Critter** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Gazelle of Set; Data(Enable) 1.00 [Absolute] -> Hyena of Set; CreateUnit()  [] ->  |
| **Set Age 3 Critter** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Giraffe of Set; Data(Enable) 1.00 [Absolute] -> Crocodile of Set; Data(Damage) 1.20 [BasePercent] -> Huntable |
| **Set Age 4 Critter** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Hippo of Set; Data(Enable) 1.00 [Absolute] -> Rhinoceros of Set; Data(Damage) 1.20 [BasePercent] -> Huntable |
| **Poseidon Hippocampus Respawn** | — | 0.1000s | CreateUnit()  [] -> ; TextOutput()  [] ->  |
| **Egyptian building bonus** | — | 0.0000s | Data(Cost) 0.00 [Assign] -> Building; Data(Cost) 100.00 [Absolute] -> Settlement Level 1; Data(Cost) 2.00 [Percent] -> Tower |
| **Omniscience** | 100G | 4.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; SharedLOS()  [] ->  |
| **Medium Axemen** | 100F 100G | 20.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Axeman; Data(Damage) 1.10 [BasePercent] -> Axeman |
| **Heavy Axemen** | 300F 200G | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> Axeman; Data(Damage) 1.10 [BasePercent] -> Axeman |
| **Champion Axemen** | 400F 300G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> Axeman; Data(Damage) 1.10 [BasePercent] -> Axeman |
| **Medium Spearmen** | 100F 100G | 20.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Spearman; Data(Damage) 1.10 [BasePercent] -> Spearman |
| **Heavy Spearmen** | 300F 200G | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> Spearman; Data(Damage) 1.10 [BasePercent] -> Spearman |
| **Champion Spearmen** | 400F 300G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> Spearman; Data(Damage) 1.10 [BasePercent] -> Spearman |
| **Heavy Chariots** | 300W 300G | 15.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Chariot Archer; Data(Damage) 1.10 [BasePercent] -> Chariot Archer |
| **Champion Chariots** | 400W 200G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Chariot Archer; Data(Damage) 1.10 [BasePercent] -> Chariot Archer |
| **Heavy Elephants** | 400F 300G | 15.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> War Elephant; Data(Damage) 1.10 [BasePercent] -> War Elephant |
| **Levy Barracks Soldiers** | 300F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Spearman; Data(TrainPoints) 0.80 [Percent] -> Axeman |
| **Conscript Barracks Soldiers** | 800F | 30.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Spearman; Data(TrainPoints) 0.80 [Percent] -> Axeman |
| **Levy Migdol Soldiers** | 600F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Chariot Archer; Data(TrainPoints) 0.80 [Percent] -> Camelry |
| **Conscript Migdol Soldiers** | 800F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Chariot Archer; Data(TrainPoints) 0.80 [Percent] -> Camelry |
| **Medium Slingers** | 100W 100G | 20.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Slinger; Data(Damage) 1.10 [BasePercent] -> Slinger |
| **Heavy Slingers** | 300W 200G | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Slinger; Data(Damage) 1.10 [BasePercent] -> Slinger |
| **Champion Slingers** | 400W 300G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Slinger; Data(Damage) 1.10 [BasePercent] -> Slinger |
| **Levy Longhouse Soldiers** | 600F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Ulfsark; Data(TrainPoints) 0.80 [Percent] -> Throwing Axeman |
| **Conscript Longhouse Soldiers** | 500F | 30.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Ulfsark; Data(TrainPoints) 0.80 [Percent] -> Throwing Axeman |
| **Conscript Hill Fort Soldiers** | 800F | 30.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Huskarl; Data(TrainPoints) 0.80 [Percent] -> Jarl |
| **Levy Hill Fort Soldiers** | 300F | 20.0000s | Data(TrainPoints) 0.80 [Percent] -> Huskarl; Data(TrainPoints) 0.80 [Percent] -> Jarl; TextOutput()  [] ->  |
| **Thurisaz Rune** | 200W 20Fv | 30.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.12 [BasePercent] -> MythUnit |
| **Golden Lions Relic Respawn** | — | 0.0000s | CreateUnit()  [] -> ; TextOutput()  [] ->  |
| **Monkey Head Relic Respawn** | — | 0.0000s | CreateUnit()  [] -> ; TextOutput()  [] ->  |
| **Odins First Ravens** | — | 0.0000s | CreateUnit()  [] -> ; TextOutput()  [] -> ; CreateUnit()  [] ->  |
| **Heroes Egyptian Age 1** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Priest |
| **Weaken Age 1 Units** | — | 0.0000s | Data(Damage) 0.30 [BasePercent] -> Ulfsark; Data(Damage) 0.50 [BasePercent] -> Priest; Data(Damage) 0.30 [BasePercent] -> Pharaoh |
| **Salt Amphora** | 150W 250G | 30.0000s | TextOutput()  [] -> ; Data(CarryCapacity) 2.00 [BasePercent] -> UtilityShip; Data(WorkRate) 1.40 [BasePercent] -> UtilityShip |
| **Medium Migdol Shadow** | — | 0.0000s | Data(Hitpoints) 1.10 [BasePercent] -> Camelry; Data(Hitpoints) 1.10 [BasePercent] -> Chariot Archer; Data(Hitpoints) 1.10 [BasePercent] -> War Elephant |
| **Poseidon First Hippocampus** | — | 0.0000s | TextOutput()  [] -> ; CreateUnit()  [] ->  |
| **Temple of Healing** | 150G 20Fv | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 2.00 [Absolute] -> Temple |
| **Greatest of Fifty** | 300F 40Fv | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.15 [Percent] -> Spearman; Data(DamageBonus) 1.00 [Absolute] -> Spearman |
| **Copper Mail Thor** | 100F 100G | 30.0000s | TechStatus()  [] ->  |
| **Copper Shields Thor** | 100W 100G | 30.0000s | TechStatus()  [] ->  |
| **Copper Weapons Thor** | 150F 150G | 30.0000s | TechStatus()  [] ->  |
| **Weapon of the Titans** | 400G 20Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.20 [BasePercent] -> Crossbowman; Data(Damage) 1.20 [BasePercent] -> Myrmidon |
| **Crenellations** | 150F 150W | 20.0000s | TextOutput()  [] -> ; Data(TrackRating) 10.00 [Assign] -> Tower; Data(DamageBonus) 2.00 [Assign] -> Tower |
| **Shared LOS** | — | 0.0000s | SharedLOS()  [] ->  |
| **Deathmatch Greek** | — | 0.0000s | CreateUnit()  [] -> ; TechStatus()  [] -> ; Data(WorkRate) 1.20 [BasePercent] -> Villager Greek |
| **Deathmatch Egyptian** | — | 0.0000s | CreateUnit()  [] -> ; TechStatus()  [] -> ; Data(WorkRate) 1.50 [BasePercent] -> AbstractMonument |
| **Deathmatch Norse** | — | 0.0000s | CreateUnit()  [] -> ; TechStatus()  [] -> ; Data(WorkRate) 1.50 [BasePercent] -> Hero Norse |
| **Norse building bonus** | — | 0.0000s | Data(Cost) 0.80 [Percent] -> SharedBuilding; Data(Hitpoints) 0.80 [BasePercent] -> SharedBuilding; Data(Cost) 20.00 [Absolute] -> Dock |
| **Lightning Mode** | — | 0.0100s | Data(TrainPoints) 2.00 [BasePercent] -> AbstractVillager; Data(TrainPoints) 2.00 [BasePercent] -> Tower; Data(TrainPoints) 2.00 [BasePercent] -> AbstractFortress |
| **Fortified Tents** | — | 0.0000s | Data(Hitpoints) 3.00 [BasePercent] -> Tent; Data(ArmorVulnerability) -0.50 [Percent] -> Tent; Data(ArmorVulnerability) -0.50 [Percent] -> Tent |
| **Dwarven Shields Effect** | — | 0.0000s | Data(Damage) 0.20 [BasePercent] -> Fire Giant; Data(Damage) 0.20 [BasePercent] -> Fire Giant |
| **Eclipse Active** | — | 0.1000s | Data(Damage) 1.50 [BasePercent] -> MythUnit; Data(Damage) 1.50 [BasePercent] -> MythUnit; Data(Damage) 1.50 [BasePercent] -> MythUnit |
| **Plenty KOTH enable** | — | 0.1000s | TextOutput()  [] -> ; Data(WorkRate) 0.60 [Absolute] -> Plenty Vault KOTH; Data(WorkRate) 0.60 [Absolute] -> Plenty Vault KOTH |
| **Starting Units Thor** | — | 0.0000s | CreateUnit()  [] -> ; CreateUnit()  [] -> ; CreateUnit()  [] ->  |
| **Set Age 1 Critter** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Ape of Set; CreateUnit()  [] ->  |
| **Starting Resources Egyptian** | — | 0.0000s | Data(Resource) -200.00 [Absolute] ->  |
| **Starting Resources Greek** | — | 0.0000s | Data(Resource) -45.00 [Absolute] ->  |
| **Starting Resources Norse** | — | 0.0000s | Data(Resource) 50.00 [Absolute] -> ; Data(Resource) -100.00 [Absolute] ->  |
| **Weaken Trojan Gate** | — | 0.0000s | Data(Hitpoints) 0.60 [BasePercent] -> Troy Gate |
| **Build TC faster** | — | 0.0000s | Data(WorkRate) 4.00 [BasePercent] -> Villager Greek; Data(WorkRate) 4.00 [BasePercent] -> Villager Egyptian; Data(WorkRate) 4.00 [BasePercent] -> AbstractInfantry |
| **Increase Regeneration** | — | 0.0000s | Data(WorkRate) 10.00 [Absolute] -> Hero |
| **Elite Hersir** | — | 0.0000s | Data(Hitpoints) 2.00 [BasePercent] -> Hero Norse; Data(ArmorVulnerability) -0.20 [Percent] -> Hero Norse; Data(ArmorVulnerability) -0.20 [BasePercent] -> Hero Norse |
| **Age 1 Kronos** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Villager Atlantean; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Age 1 Gaia** | — | 0.0000s | TechStatus()  [] -> ; TechStatus()  [] -> ; Data(Enable) 1.00 [Absolute] -> Villager Atlantean |
| **Starting Units Atlantean** | — | 0.0000s | CreateUnit()  [] -> ; CreateUnit()  [] -> ; CreateUnit()  [] ->  |
| **Age 1 Ouranos** | — | 0.0000s | TechStatus()  [] -> ; TechStatus()  [] -> ; Data(Enable) 1.00 [Absolute] -> Villager Atlantean |
| **Starting Resources Atlantean** | — | 0.0000s | Data(Resource) 75.00 [Absolute] -> ; Data(Resource) 25.00 [Absolute] ->  |
| **Age 2 Okeanus** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 2 Prometheus** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 2 Leto** | 400F | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; TechStatus()  [] ->  |
| **Age 3 Hyperion** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Rheia** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 3 Theia** | 800F 500G | 60.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Helios** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Hekate** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Age 4 Atlas** | 1000F 1000G | 90.0000s | TextOutput()  [] -> ; TextOutput()  [] -> ; Sound()  [] ->  |
| **Bronze Wall** | 400F 300G | 50.0000s | TextOutput()  [] -> ; SetName()  [] -> ; SetName()  [] ->  |
| **Iron Wall** | 600F 450G | 50.0000s | TextOutput()  [] -> ; SetName()  [] -> ; SetName()  [] ->  |
| **Oreichalkos Wall** | 850F 600G | 60.0000s | TextOutput()  [] -> ; SetName()  [] -> ; SetName()  [] ->  |
| **Heavy Fireship** | 300W 200G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.15 [BasePercent] -> Fire Ship Atlantean; SetName()  [] ->  |
| **Heart of the Titans** | 200G 20Fv | 30.0000s | TextOutput()  [] -> ; Data(Cost) 0.80 [BasePercent] -> Hero; Data(Cost) 0.80 [BasePercent] -> Hero |
| **Hephaestus Revenge** | 200G 15Fv | 30.0000s | Data(Hitpoints) 1.30 [BasePercent] -> Automaton; SetName()  [] -> ; TextOutput()  [] ->  |
| **Levy Mainline Units** | 300F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Swordsman; Data(TrainPoints) 0.80 [Percent] -> Lancer |
| **Levy Specialty Units** | 300F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Maceman; Data(TrainPoints) 0.80 [Percent] -> Javelin Cavalry |
| **Levy Palace Units** | 600F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Trident Soldier; Data(TrainPoints) 0.80 [Percent] -> Royal Guard |
| **Conscript Mainline Units** | 800F | 30.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Swordsman; Data(TrainPoints) 0.80 [Percent] -> Lancer |
| **Conscript Specialty Units** | 500F | 20.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Maceman; Data(TrainPoints) 0.80 [Percent] -> Javelin Cavalry |
| **Conscript Palace Units** | 800F | 30.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.80 [Percent] -> Trident Soldier; Data(TrainPoints) 0.80 [Percent] -> Royal Guard |
| **Halo of the Sun** | 350G 20Fv | 50.0000s | TextOutput()  [] -> ; Data(Damage) 1.25 [BasePercent] -> Fire Siphon; Data(Damage) 1.20 [BasePercent] -> Fire Ship Atlantean |
| **Horns of Consecration** | 200G | 30.0000s | TextOutput()  [] -> ; Data(WorkRate) 0.01 [Absolute] -> SettlementsThatTrainVillagers |
| **Lemurian Descendants** | 50F 75G 8Fv | 25.0000s | TextOutput()  [] -> ; Data(LOS) 9.00 [Absolute] -> HumanSoldier |
| **Channels** | 25F 100G 10Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.20 [BasePercent] -> Villager Atlantean; Data(MaximumVelocity) 1.20 [BasePercent] -> Villager Atlantean Hero |
| **Alluvial Clay** | 150G 12Fv | 30.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.30 [BasePercent] -> Promethean; Data(Hitpoints) 1.30 [BasePercent] -> Promethean Small |
| **Mythic Rejuvenation** | 300G 30Fv | 40.0000s | TextOutput()  [] -> ; Data(WorkRate) 2.00 [Absolute] -> MythUnit |
| **Heroic Renewal** | 150F 150G 20Fv | 40.0000s | TextOutput()  [] -> ; Data(WorkRate) 1.50 [Absolute] -> Hero |
| **Bite of the Shark** | 200F 15Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 1.15 [BasePercent] -> Swordsman; Data(Damage) 1.15 [BasePercent] -> Swordsman Hero |
| **Heavy Chieroballista** | 300W 200G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Chieroballista; Data(Damage) 1.25 [BasePercent] -> Chieroballista |
| **Gemino** | 350W 150G 25Fv | 50.0000s | TextOutput()  [] -> ; Data(NumberProjectiles) 3.00 [Absolute] -> Satyr |
| **Norse Armory** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Armory; Data(Enable) 1.00 [Absolute] -> Tower; Data(Enable) 1.00 [Absolute] -> Longhouse |
| **Secrets of the Titans** | 800F 800W 800G 50Fv | 60.0000s | Data(GrantedTech) 1.00 [Absolute] -> ; Data(Enable) 1.00 [Absolute] -> Titan Atlantean; TextOutput()  [] ->  |
| **Disable Titan** | — | 0.0000s | Data(Enable) -1.00 [Absolute] -> Titan Atlantean; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Focus** | 50W 2Fv | 10.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [BasePercent] -> Oracle Scout; Data(MaximumVelocity) 1.20 [BasePercent] -> Oracle Hero |
| **Safe Passage** | 200W 10Fv | 40.0000s | TextOutput()  [] -> ; Data(Cost) 0.75 [Percent] -> Sky Passage; Data(Cost) 0.80 [Percent] -> Sky Passage |
| **Heroic Fleet** | 200F 200W 15Fv | 40.0000s | TextOutput()  [] -> ; Data(DamageBonus) 1.50 [Absolute] -> Ship; Data(DamageBonus) 1.50 [Absolute] -> Ship |
| **Weightless Mace** | 200F 25Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [BasePercent] -> Maceman; Data(Damage) 1.15 [BasePercent] -> Maceman |
| **Eyes of Atlas** | 50F 100G 5Fv | 30.0000s | TextOutput()  [] -> ; Data(LOS) 9.00 [Absolute] -> MythUnit |
| **Asper Blood** | 200W 250G 25Fv | 40.0000s | TextOutput()  [] -> ; Data(Damage) 25.00 [Absolute] -> Lampades Blood |
| **Titan Shield** | 350W 200G 15Fv | 30.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.15 [Percent] -> Building; Data(ArmorVulnerability) -0.15 [Percent] -> Building |
| **Poseidons Secret** | 300F 35Fv | 40.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [BasePercent] -> AbstractCavalry; Data(Damage) 1.15 [BasePercent] -> AbstractCavalry |
| **Volcanic Forge** | 200F 50G 18Fv | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.20 [Percent] -> Automaton |
| **Deathmatch Atlantean** | — | 0.0000s | CreateUnit()  [] -> ; TechStatus()  [] -> ; Data(WorkRate) 1.30 [BasePercent] -> SettlementsThatTrainVillagers |
| **Mail of Orichalkos** | 250G 15Fv | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.10 [Percent] -> AbstractArcher; Data(ArmorVulnerability) -0.10 [Percent] -> Archer Atlantean Hero |
| **Hands of the Pharaoh** | 75G | 20.0000s | TextOutput()  [] -> ; Data(MaximumContained) 1.00 [Absolute] -> Priest; Data(MaximumRange) 2.00 [Absolute] -> Priest |
| **Bronze All** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Bronze All Thor** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Copper All** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Copper All Thor** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Iron All** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Iron All Thor** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Medium All** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Heavy All** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Champion All** | — | 0s | TechStatus()  [] -> ; TechStatus()  [] -> ; TechStatus()  [] ->  |
| **Rheias Gift** | 175F 175G | 30.0000s | TextOutput()  [] -> ; Data(Cost) 0.75 [BasePercent] ->  |
| **FocusTurbo** | 150W 5Fv | 20.0000s | TextOutput()  [] -> ; Data(WorkRate) -3.50 [Absolute] -> Oracle Scout; Data(WorkRate) -1.50 [Absolute] -> Oracle Hero |
| **Celerity** | 200G 10Fv | 40.0000s | TextOutput()  [] -> ; Data(TrainPoints) 0.60 [BasePercent] -> MythUnit |
| **Grant Phoenix Egg** | — | 0s | TextOutput()  [] -> ; Data(Enable) 1.00 [Absolute] -> Phoenix From Egg |
| **Io Guardian** | 50F 300G 25Fv | 40.0000s | TextOutput()  [] -> ; Data(RechargeTime) 0.80 [BasePercent] -> Argus; Data(LOS) 5.00 [Absolute] -> Argus |
| **Disable Atlantean Favor** | — | 0s | Data(WorkRate) 0.00 [Assign] -> SettlementsThatTrainVillagers; TextOutput()  [] ->  |
| **Axe of Muspell** | 100W 250G 10Fv | 40.0000s | TextOutput()  [] -> ; Data(DamageBonus) 2.00 [Absolute] -> Throwing Axeman |
| **Champion Chieroballista** | 300W 300G | 40.0000s | TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> Chieroballista; Data(Damage) 1.25 [BasePercent] -> Chieroballista |
| **SuperRocs** | — | 0.0000s | TextOutput()  [] -> ; Data(MaximumVelocity) 1.50 [BasePercent] -> Roc |
| **Beast Slayer** | 250F 300G 15Fv | 45.0000s | TextOutput()  [] -> ; Data(DamageBonus) 0.50 [Absolute] -> Crossbowman; Data(DamageBonus) 0.50 [Absolute] -> Hetairoi |
| **Lance of Stone** | 300G 12Fv | 40.0000s | TextOutput()  [] -> ; Data(DamageBonus) 2.00 [Absolute] -> Lancer Hero; Data(Damage) 1.15 [BasePercent] -> Lancer Hero |
| **Sudden Death Atlantean** | 100W 250G 10Fv | 40.0000s | TextOutput()  [] -> ; Data(ResourceTrickleRate) 0.09 [Absolute] ->  |
| **SuperTitanSPC** | — | 0s | TextOutput()  [] -> ; Data(DamageBonus) 4.00 [Absolute] -> Titan Atlantean; Data(DamageBonus) 4.00 [Absolute] -> Titan Atlantean |
| **SuperNidhoggSPC** | — | 0s | TextOutput()  [] -> ; Data(DamageBonus) 70.00 [Absolute] -> Nidhogg |
| **Petrified** | 250W 100G 15Fv | 40.0000s | TextOutput()  [] -> ; Data(ArmorVulnerability) -0.15 [Percent] -> Fire Siphon; Data(ArmorVulnerability) -0.15 [Percent] -> Chieroballista |
| **PrometheusWeak** | — | 0s | TextOutput()  [] -> ; Data(NumberProjectiles) 2.00 [Assign] -> Titan Prometheus; Data(Hitpoints) 0.20 [Percent] -> Titan Prometheus |
| **PrometheusWeakest** | — | 0s | TextOutput()  [] -> ; Data(NumberProjectiles) 1.00 [Assign] -> Titan Prometheus; Data(Hitpoints) 0.40 [Percent] -> Titan Prometheus |
| **Age 2 Atlantean Heroes** | — | 0s | Data(Hitpoints) 1.10 [BasePercent] -> Hero; Data(Damage) 1.10 [BasePercent] -> Hero; Data(Damage) 1.10 [BasePercent] -> Hero |
| **Age 4 Atlantean Heroes** | — | 0s | Data(Hitpoints) 0.95 [BasePercent] -> Hero; Data(Damage) 0.95 [BasePercent] -> Hero; Data(Damage) 0.95 [BasePercent] -> Hero |
| **Age 1_5 Atlantean** | — | 0.0000s | Data(Enable) 1.00 [Absolute] -> Dock; Data(Enable) 1.00 [Absolute] -> Temple |

## Relíquias Oficiais (`relics2.xmb` — 55 itens)

| Relíquia | Tech Concedida | Efeito Oficial |
|---|---|---|
| **Ankh of Ra** | `Relic Ankh of Ra` | Data(ResourceTrickleRate) 0.04 [Absolute] -> ; Data(MaximumResourceTrickleRate) 0.04 [Absolute] -> ; TextOutput()  [] ->  |
| **Anvil of Hephaestus** | `Relic Anvil of Hephaestus` | Data(Cost) 0.90 [BasePercent] -> Armory; Data(Cost) 0.90 [BasePercent] -> Armory; Data(Cost) 0.90 [BasePercent] -> Armory |
| **Armor of Achilles** | `Relic Armor of Achilles` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(ArmorVulnerability) -0.05 [Percent] -> AbstractInfantry |
| **Arrows of Alfar** | `Relic Arrows of Alfar` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Damage) 1.20 [BasePercent] -> Building |
| **Black Lotus** | `Relic Black Lotus` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager |
| **Blanket of Empress Zoe** | `Relic Blanket of Empress Zoe` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(ArmorVulnerability) -0.05 [Percent] -> Building |
| **Boots of Kick Everything** | `Relic Boots of Kick Everything` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(MaximumVelocity) 1.10 [BasePercent] -> Hero |
| **Bow of Artemis** | `Relic Bow of Artemis` | Data(Cost) 0.85 [Percent] -> AbstractArcher; Data(Cost) 0.85 [Percent] -> AbstractArcher; TextOutput()  [] ->  |
| **Buhen Flagstone** | `Relic Buhen Flagstone` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Cost) 0.75 [BasePercent] -> AbstractWall |
| **Canopic Jar of Imsety** | `Relic Canopic Jar of Imsety` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(TrainPoints) 0.85 [Percent] -> AbstractInfantry |
| **Catoblepas Scales** | `Relic Catoblepas Scales` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(ArmorVulnerability) -0.20 [Percent] -> MythUnit |
| **Dwarfen Calipers** | `Relic Dwarfen Calipers` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Cost) 0.80 [Percent] -> AbstractSiegeWeapon |
| **Eye of Horus** | `Relic Eye of Horus` | Data(PopulationCapAddition) 2.00 [Absolute] -> SettlementsThatTrainVillagers; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Eye of Ornlu** | `Relic Eye of Ornlu` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Damage) 1.05 [BasePercent] -> Throwing Axeman |
| **Fetters of Fenrir** | `Relic Fetters of Fenrir` | Data(Damage) 250.00 [Absolute] -> AbstractVillager; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Girdle of Hippolyta** | `Relic Girdle of Hippolyta` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Hitpoints) 1.05 [BasePercent] -> Toxotes |
| **Golden Bridle of Pegasus** | `Relic Golden Bridle of Pegasus` | TechStatus()  [] -> ; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Golden Lions** | `Relic Golden Lions` | TechStatus()  [] -> ; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Harmonias Necklace** | `Relic Harmonias Necklace` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(WorkRate) 1.10 [BasePercent] -> AbstractVillager |
| **Harters Folly** | `Relic Harters Folly` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(LOS) 2.00 [Absolute] -> AbstractScout |
| **Head of Orpheus** | `Relic Head of Orpheus` | Data(LOS) 8.00 [Absolute] -> Building; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Heras Thundercloud Shawl** | `Relic Heras Thundercloud Shawl` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(ArmorVulnerability) -0.05 [Percent] -> HumanSoldier |
| **Khopesh of Horus** | `Relic Khopesh of Horus` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(DamageBonus) 1.00 [Absolute] -> Hero |
| **Kithara of Apollo** | `Relic Kithara of Apollo` | Data(MaximumVelocity) 1.10 [BasePercent] -> AbstractVillager; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Mithril Horseshoes** | `Relic Mithril Horseshoes` | Data(MaximumVelocity) 1.10 [BasePercent] -> AbstractCavalry; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Monkey Head** | `Relic Monkey Head` | TechStatus()  [] -> ; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Nose of the Sphinx** | `Relic Nose of the Sphinx` | Data(Hitpoints) 1.15 [BasePercent] -> Building; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Odins Spear** | `Relic Odins Spear` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Damage) 1.05 [BasePercent] -> Hoplite |
| **Oseberg Wagon** | `Relic Oseberg Wagon` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Cost) 0.75 [BasePercent] -> AbstractTradeUnit |
| **Pandoras Box** | `Relic Pandoras Box` | TextOutput()  [] -> ; Data(TrainPoints) 0.75 [Percent] -> MythUnit; TextOutput()  [] ->  |
| **Pelt of Argus** | `Relic Pelt of Argus` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(LOS) 6.00 [Absolute] -> Unit |
| **Pygmalions Statue** | `Relic Pygmalions Statue` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Hitpoints) 1.40 [BasePercent] -> AbstractVillager |
| **Ring of the Nibelung** | `Relic Ring of the Nibelung` | Data(ResourceTrickleRate) 0.30 [Absolute] -> ; Data(MaximumResourceTrickleRate) 0.50 [Assign] -> ; TextOutput()  [] ->  |
| **Scarab Pendant** | `Relic Scarab Pendant` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(DamageBonus) 1.00 [Absolute] -> Portable Ram |
| **Shard of Blue Crystal** | `Relic Shard of Blue Crystal` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(WorkRate) 1.05 [BasePercent] -> AbstractVillager |
| **Shingles of Steel** | `Relic Shingles of Steel` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Hitpoints) 3.00 [BasePercent] -> House |
| **Ship of Fingernails** | `Relic Ship of Fingernails` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(ResourceTrickleRate) 0.40 [Absolute] ->  |
| **Sistrum of Bast** | `Relic Sistrum of Bast` | Data(Cost) 0.90 [Percent] -> AbstractVillager; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Staff of Dionysus** | `Relic Staff of Dionysus` | Data(CarryCapacity) 20.00 [Absolute] -> AbstractVillager; TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Tail of Cerberus** | `Relic Tail of Cerberus` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(RechargeTime) 0.75 [BasePercent] -> MythUnit |
| **Toothed Arrows** | `Relic Toothed Arrows` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Damage) 1.05 [BasePercent] -> AbstractArcher |
| **Tower of Sestus** | `Relic Tower of Sestus` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Damage) 1.30 [BasePercent] -> Tower |
| **Trios Bow** | `Relic Trios Bow` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(MaximumRange) 2.00 [Absolute] -> AbstractArcher |
| **Trojan Gate Hinge** | `Relic Trojan Gate Hinge` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Hitpoints) 1.20 [BasePercent] -> AbstractWall |
| **Tusk of the Iron Boar** | `Relic Tusk of the Iron Boar` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Hitpoints) 1.10 [BasePercent] -> AbstractCavalry |
| **Wand of Gambantein** | `Relic Wand of Gambantein` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Cost) 0.80 [Percent] -> Temple |
| **Wedjat Eye** | `Relic Wedjat Eye` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Cost) 0.90 [Percent] -> MythUnit |
| **Reed of Nekhebet** | `Relic Reed of Nekhebet` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(Damage) 2.00 [BasePercent] -> Sea Turtle |
| **of the Scorpion SPC** | `Relic of the Scorpion SPC` | — |
| **of Bronze SPC** | `Relic of Bronze SPC` | TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Whirlwind SPC** | `Relic Whirlwind SPC` | TextOutput()  [] -> ; TextOutput()  [] ->  |
| **Titans Treasure** | `Relic Titans Treasure` | TextOutput()  [] -> ; Data(Cost) 0.75 [BasePercent] -> Secrets of the Titans; Data(Cost) 0.75 [BasePercent] -> Secrets of the Titans |
| **Gaias Book of Knowledge** | `Relic Gaias Book of Knowledge` | TextOutput()  [] -> ; TextOutput()  [] -> ; Data(DamageBonus) 3.00 [Absolute] -> AbstractInfantry |
| **of Ancestors SPC** | `Relic of Ancestors SPC` | TextOutput()  [] -> ; TextOutput()  [] ->  |
| **of Earthquake SPC** | `Relic of Earthquake SPC` | TextOutput()  [] -> ; TextOutput()  [] ->  |
