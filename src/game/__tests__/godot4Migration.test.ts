import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { AGE_COSTS, PANTHEONS } from '../data/pantheonAndAgeData';
import { GOD_POWERS } from '../data/divine/godPowersData';
import {
  buildGodotGlbFilename,
  prepareObjectForGodotExport,
  slugifyGodotToken,
} from '../../components/gallery3d/exportGlbForGodot';

const ROOT = process.cwd();
const GODOT_DIR = path.join(ROOT, 'godot4');

describe('Godot 4 Android Migration (Phases 1 to 4) & GLB Exporter Bridge', () => {
  it('configures an isolated Godot 4.3+ Android Mobile project inside godot4/', () => {
    const projectGodotPath = path.join(GODOT_DIR, 'project.godot');
    expect(fs.existsSync(projectGodotPath)).toBe(true);

    const cfg = fs.readFileSync(projectGodotPath, 'utf8');
    expect(cfg).toContain('config_version=5');
    expect(cfg).toContain('renderer/rendering_method="mobile"');
    expect(cfg).toContain('window/handheld/orientation=6');
    expect(cfg).toContain('run/main_scene="res://scenes/main.tscn"');
    expect(cfg).toContain('PantheonCatalog="*res://scripts/autoload/pantheon_catalog.gd"');
    expect(cfg).toContain('GameState="*res://scripts/autoload/game_state.gd"');
    expect(cfg).toContain('ModelLibrary="*res://scripts/autoload/model_library.gd"');
    expect(cfg).toContain('AudioDirector="*res://scripts/audio/audio_director.gd"');
  });

  it('verifies every Phase 1-4 script and scene exists and is non-empty on disk', () => {
    const requiredRelPaths = [
      'icon.svg',
      'export_presets.cfg',
      'project.godot',
      'README.md',
      'models/README.md',
      'scenes/main.tscn',
      'scripts/autoload/pantheon_catalog.gd',
      'scripts/autoload/game_state.gd',
      'scripts/autoload/model_library.gd',
      'scripts/audio/audio_director.gd',
      'scripts/combat/combat_resolver.gd',
      'scripts/divine/divine_power_catalog.gd',
      'scripts/divine/divine_power_system.gd',
      'scripts/campaign/campaign_manager.gd',
      'scripts/entities/resource_node.gd',
      'scripts/entities/building_actor.gd',
      'scripts/entities/unit_actor.gd',
      'scripts/entities/projectile_actor.gd',
      'scripts/world/biome_map_generator.gd',
      'scripts/world/fog_of_war.gd',
      'scripts/world/touch_rts_camera.gd',
      'scripts/world/selection_controller.gd',
      'scripts/world/battle_world.gd',
      'scripts/ai/enemy_ai_controller.gd',
      'scripts/ui/tactical_minimap.gd',
      'scripts/ui/mobile_hud.gd',
    ];

    for (const rel of requiredRelPaths) {
      const abs = path.join(GODOT_DIR, rel);
      expect(fs.existsSync(abs), `Missing Godot 4 file: godot4/${rel}`).toBe(true);
      expect(fs.statSync(abs).size, `Empty Godot 4 file: godot4/${rel}`).toBeGreaterThan(0);
    }

    const mainTscn = fs.readFileSync(path.join(GODOT_DIR, 'scenes/main.tscn'), 'utf8');
    const scriptMatches = Array.from(mainTscn.matchAll(/path="res:\/\/([^"]+)"/g)).map((m) => m[1]);
    expect(scriptMatches.length).toBeGreaterThanOrEqual(8);
    for (const rel of scriptMatches) {
      expect(fs.existsSync(path.join(GODOT_DIR, rel)), `main.tscn broken ref: ${rel}`).toBe(true);
    }
  });

  it('keeps PantheonCatalog aligned with 5 pantheons, 4 biomes, 3 AI difficulties, Era I-V costs, 8 buildings, 7 units, 5 formations and 3 stances', () => {
    const catalog = fs.readFileSync(
      path.join(GODOT_DIR, 'scripts/autoload/pantheon_catalog.gd'),
      'utf8'
    );

    const corePantheons = ['greek', 'egyptian', 'norse', 'atlantean', 'chinese'] as const;
    for (const id of corePantheons) {
      expect(PANTHEONS[id]).toBeDefined();
      expect(catalog).toContain(`"${id}":`);
    }

    for (const biome of ['mediterranean', 'nile_desert', 'nordic_tundra', 'erebus_volcanic']) {
      expect(catalog, `Missing biome: ${biome}`).toContain(`"${biome}":`);
    }

    for (const diff of ['easy', 'normal', 'hard']) {
      expect(catalog, `Missing AI difficulty: ${diff}`).toContain(`"${diff}":`);
    }

    expect(catalog).toContain(`"food": ${AGE_COSTS[2].food}`);
    expect(catalog).toContain(`"gold": ${AGE_COSTS[3].gold}`);
    expect(catalog).toContain(`"favor": ${AGE_COSTS[4].favor}`);
    expect(catalog).toContain(`"wood": ${AGE_COSTS[5].wood}`);

    for (const b of ['town_center', 'house', 'temple', 'barracks', 'archery', 'stable', 'tower', 'fortress']) {
      expect(catalog, `Missing building spec: ${b}`).toContain(`"${b}":`);
    }

    for (const u of ['villager', 'infantry', 'archer', 'cavalry', 'hero', 'myth', 'siege']) {
      expect(catalog, `Missing unit spec: ${u}`).toContain(`"${u}":`);
    }

    for (const f of ['box', 'line', 'staggered', 'phalanx', 'wedge']) {
      expect(catalog, `Missing formation: ${f}`).toContain(`"${f}":`);
    }

    for (const s of ['aggressive', 'defensive', 'stand_ground']) {
      expect(catalog, `Missing stance: ${s}`).toContain(`"${s}":`);
    }
  });

  it('includes all 30 official God Powers, 5-chapter Campaign Mode and Adaptive 3D AudioDirector in Phase 4', () => {
    const powerCatalog = fs.readFileSync(
      path.join(GODOT_DIR, 'scripts/divine/divine_power_catalog.gd'),
      'utf8'
    );
    const officialPowerIds = Object.keys(GOD_POWERS);
    expect(officialPowerIds.length).toBe(30);
    for (const pid of officialPowerIds) {
      expect(powerCatalog, `Missing God Power in Godot 4: ${pid}`).toContain(`"${pid}":`);
    }

    const powerSystem = fs.readFileSync(
      path.join(GODOT_DIR, 'scripts/divine/divine_power_system.gd'),
      'utf8'
    );
    expect(powerSystem).toContain('class_name DivinePowerSystem');
    expect(powerSystem).toContain('CPUParticles3D');
    expect(powerSystem).toContain('AudioDirector.play_sfx_3d');

    const campaign = fs.readFileSync(
      path.join(GODOT_DIR, 'scripts/campaign/campaign_manager.gd'),
      'utf8'
    );
    expect(campaign).toContain('class_name CampaignManager');
    for (const ch of ['olympus_dawn', 'nile_eclipse', 'midgard_frost', 'atlantis_rise', 'erebus_reckoning']) {
      expect(campaign, `Missing campaign chapter: ${ch}`).toContain(`"${ch}":`);
    }

    const audio = fs.readFileSync(
      path.join(GODOT_DIR, 'scripts/audio/audio_director.gd'),
      'utf8'
    );
    expect(audio).toContain('AudioStreamPlayer3D');
    expect(audio).toContain('AudioStreamGenerator');
    expect(audio).toContain('_update_adaptive_music_state');

    const hud = fs.readFileSync(path.join(GODOT_DIR, 'scripts/ui/mobile_hud.gd'), 'utf8');
    expect(hud).toContain('DivinePowerCatalog.get_pantheon_power_ids');
    expect(hud).toContain('CampaignManager.CHAPTER_ORDER');
    expect(hud).toContain('toggle_audio_muted');
  });

  it('generates Godot ModelLibrary-compatible .glb filenames for buildings and units', () => {
    expect(slugifyGodotToken('Rá')).toBe('ra');
    expect(slugifyGodotToken('Ísis')).toBe('isis');
    expect(slugifyGodotToken('Fu Xi')).toBe('fu_xi');

    expect(
      buildGodotGlbFilename({
        galleryCategory: 'building',
        pantheon: 'greek',
        majorGod: 'Zeus',
        unitId: 'hoplite',
        buildingKind: 'town_center',
        buildingAge: 5,
      })
    ).toBe('greek_zeus_town_center_t5.glb');

    expect(
      buildGodotGlbFilename({
        galleryCategory: 'unit',
        pantheon: 'atlantean',
        majorGod: 'Cronos',
        unitId: 'villager',
        buildingKind: 'town_center',
        buildingAge: 1,
      })
    ).toBe('atlantean_cronos_villager.glb');
  });

  it('grounds bottom-center pivot and strips non-exportable lights without mutating live mesh', () => {
    const original = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 4, 2),
      new THREE.MeshStandardMaterial({ color: 0xd4af37 })
    );
    box.position.set(3, 5, -2);
    const light = new THREE.PointLight(0xffffff, 2);
    original.add(box, light);

    const prepared = prepareObjectForGodotExport(original);

    expect(original.children.length).toBe(2);
    expect(box.position.y).toBe(5);

    let lightCount = 0;
    prepared.traverse((n) => {
      if ((n as THREE.Light).isLight) lightCount++;
    });
    expect(lightCount).toBe(0);

    const bounds = new THREE.Box3().setFromObject(prepared);
    expect(bounds.min.y).toBeCloseTo(0, 3);
    const center = new THREE.Vector3();
    bounds.getCenter(center);
    expect(center.x).toBeCloseTo(0, 3);
    expect(center.z).toBeCloseTo(0, 3);
  });
});
