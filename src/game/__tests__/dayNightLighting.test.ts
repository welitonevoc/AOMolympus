import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { DAY_NIGHT_KEYFRAMES } from '../engine/engineTypes';
import { DARKEST_NIGHT_CYCLES } from '../../textura/terreno/environmentCheats';
import { SCENARIO_LIGHTING_PRESETS } from '../../maps/scenarioEditorTypes';
import { LIGHTING_PRESETS } from '../../components/gallery3d/studioTypes';

function srgbLuminance(hex: number): number {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

describe('Night Mode & Day/Night Lighting Readability', () => {
  it('keeps every DAY_NIGHT_KEYFRAME clearly visible without crushing night into black', () => {
    for (const kf of DAY_NIGHT_KEYFRAMES) {
      const hemiSkyHex = kf.hemiSkyColor ?? kf.skyColor;
      const skyLum = srgbLuminance(hemiSkyHex);
      const groundLum = srgbLuminance(kf.groundColor);

      expect(kf.sunIntensity, `${kf.label} sun/moon intensity`).toBeGreaterThanOrEqual(0.95);
      expect(kf.hemiIntensity, `${kf.label} hemi intensity`).toBeGreaterThanOrEqual(0.44);
      expect(skyLum, `${kf.label} hemiSky luminance`).toBeGreaterThanOrEqual(0.32);
      expect(groundLum, `${kf.label} ground bounce luminance`).toBeGreaterThanOrEqual(0.04);
      expect(kf.rimIntensity, `${kf.label} rim silhouette intensity`).toBeGreaterThanOrEqual(0.24);
    }

    const nightKf = DAY_NIGHT_KEYFRAMES.find((k) => k.label === 'Noite');
    expect(nightKf).toBeDefined();
    expect(nightKf!.hemiSkyColor).toBeDefined();
    // Backdrop stays nocturnal while HemisphereLight fill stays luminous
    expect(srgbLuminance(nightKf!.hemiSkyColor!)).toBeGreaterThan(srgbLuminance(nightKf!.skyColor) * 3);
    expect(nightKf!.exposure ?? 0.88).toBeGreaterThanOrEqual(0.95);
  });

  it('keeps DARKEST_NIGHT_CYCLES readable in Night and Underworld modes', () => {
    for (const cycle of DARKEST_NIGHT_CYCLES) {
      expect(cycle.sunIntensity, `${cycle.label} key light`).toBeGreaterThanOrEqual(1.05);
      expect(cycle.hemiIntensity, `${cycle.label} hemi fill`).toBeGreaterThanOrEqual(0.65);
      expect(srgbLuminance(cycle.hemiSky), `${cycle.label} hemiSky luminance`).toBeGreaterThanOrEqual(0.12);
    }
  });

  it('keeps Scenario Editor night/eclipse presets and 3D Gallery Noturno preset well-lit', () => {
    for (const id of ['Night', 'Night2', 'Eclipse', 'td6']) {
      const preset = SCENARIO_LIGHTING_PRESETS.find((p) => p.id === id);
      expect(preset, `preset ${id}`).toBeDefined();
      expect(preset!.sunIntensity, `${id} sunIntensity`).toBeGreaterThanOrEqual(1.05);
      expect(preset!.hemiIntensity, `${id} hemiIntensity`).toBeGreaterThanOrEqual(0.64);
      expect(preset!.exposure, `${id} exposure`).toBeGreaterThanOrEqual(0.92);
      expect(srgbLuminance(preset!.hemiSkyHex), `${id} hemiSky luminance`).toBeGreaterThanOrEqual(0.18);
    }

    const galleryNight = LIGHTING_PRESETS.night;
    expect(galleryNight.keyIntensity).toBeGreaterThanOrEqual(1.5);
    expect(galleryNight.hemiIntensity).toBeGreaterThanOrEqual(0.95);
    expect(srgbLuminance(galleryNight.hemiGround)).toBeGreaterThanOrEqual(0.04);
  });
});
