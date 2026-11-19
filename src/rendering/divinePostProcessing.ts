import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';

export type PostProcessingPreset = 'off' | 'premium_mobile' | 'desktop_high';

export interface DivinePostProcessingOptions {
  preset?: PostProcessingPreset;
  /** Intensidade do glow (recomenda-se 0.8 a 1.4) */
  bloomStrength?: number;
  /** Raio de dispersão do bloom (0.35 a 0.55) */
  bloomRadius?: number;
  /** Limiar de luminância para entrar no bloom (0.75 a 0.95 para isolar magias e emissivos) */
  bloomThreshold?: number;
  /** Adicionar vinheta suave para foco central cinematográfico */
  enableVignette?: boolean;
  vignetteDarkness?: number;
  vignetteOffset?: number;
  /** Anti-aliasing rápido via FXAA */
  enableFxaa?: boolean;
  /** Limite máximo de pixelRatio no mobile para evitar sobrecarga (default: 1.5) */
  dprCap?: number;
}

export interface DivinePostProcessingPipeline {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  vignettePass?: ShaderPass;
  fxaaPass?: ShaderPass;
  outputPass: OutputPass;
  render: () => void;
  setSize: (width: number, height: number) => void;
  setBloom: (strength: number, radius?: number, threshold?: number) => void;
  setPreset: (preset: PostProcessingPreset) => void;
  dispose: () => void;
}

/**
 * Cria a pipeline de pós-processamento Three.js focada nos Deuses Gregos
 * Balanceada para excelente visual cinematográfico com alto rendimento no Android.
 */
export function createDivinePostProcessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: DivinePostProcessingOptions = {}
): DivinePostProcessingPipeline {
  const {
    preset = 'premium_mobile',
    bloomStrength = 0.26,
    bloomRadius = 0.36,
    bloomThreshold = 1.28,
    enableVignette = true,
    vignetteDarkness = 1.05,
    vignetteOffset = 1.15,
    enableFxaa = true,
    dprCap = 1.5,
  } = options;

  // Calibra ToneMapping no Renderer
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;

  // Limita DPR para mobile (máximo 1.5x)
  const currentDpr = Math.min(window.devicePixelRatio || 1, dprCap);
  renderer.setPixelRatio(currentDpr);

  const size = renderer.getSize(new THREE.Vector2());
  const width = Math.max(1, Math.floor(size.x));
  const height = Math.max(1, Math.floor(size.y));

  // Render Target em meia resolução para o Bloom se em preset mobile
  const bloomResolution = preset === 'desktop_high' 
    ? new THREE.Vector2(width, height)
    : new THREE.Vector2(Math.floor(width * 0.75), Math.floor(height * 0.75));

  const composer = new EffectComposer(renderer);

  // 1. RenderPass (Cena base)
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. UnrealBloomPass (Glow seletivo de deuses: olhos, halos, fogo, ouro, magias)
  const bloomPass = new UnrealBloomPass(bloomResolution, bloomStrength, bloomRadius, bloomThreshold);
  composer.addPass(bloomPass);

  // 3. OutputPass (Tone mapping ACESFilmic + conversão de espaço de cores sRGB)
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // 4. VignettePass (Foco cinematográfico nas bordas em sRGB pós-tonemapping)
  let vignettePass: ShaderPass | undefined;
  if (enableVignette) {
    vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms['darkness'].value = vignetteDarkness;
    vignettePass.uniforms['offset'].value = vignetteOffset;
    composer.addPass(vignettePass);
  }

  // 5. FXAAShader (Anti-aliasing leve pós-composer)
  let fxaaPass: ShaderPass | undefined;
  if (enableFxaa) {
    fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
    composer.addPass(fxaaPass);
  }

  let activePreset = preset;

  const setSize = (newWidth: number, newHeight: number) => {
    const w = Math.max(1, Math.floor(newWidth));
    const h = Math.max(1, Math.floor(newHeight));
    composer.setSize(w, h);

    const bW = activePreset === 'desktop_high' ? w : Math.max(1, Math.floor(w * 0.75));
    const bH = activePreset === 'desktop_high' ? h : Math.max(1, Math.floor(h * 0.75));
    bloomPass.setSize(bW, bH);

    if (fxaaPass) {
      const pRatio = renderer.getPixelRatio();
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (w * pRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (h * pRatio);
    }
  };

  const setBloom = (strength: number, radius = 0.36, threshold = 1.28) => {
    bloomPass.strength = strength;
    bloomPass.radius = radius;
    bloomPass.threshold = threshold;
  };

  const setPreset = (p: PostProcessingPreset) => {
    activePreset = p;
    if (p === 'off') {
      bloomPass.enabled = false;
      if (vignettePass) vignettePass.enabled = false;
      if (fxaaPass) fxaaPass.enabled = false;
    } else if (p === 'premium_mobile') {
      bloomPass.enabled = true;
      bloomPass.strength = 0.24;
      bloomPass.radius = 0.34;
      bloomPass.threshold = 1.32;
      if (vignettePass) vignettePass.enabled = true;
      if (fxaaPass) fxaaPass.enabled = true;
    } else if (p === 'desktop_high') {
      bloomPass.enabled = true;
      bloomPass.strength = 0.34;
      bloomPass.radius = 0.38;
      bloomPass.threshold = 1.24;
      if (vignettePass) vignettePass.enabled = true;
      if (fxaaPass) fxaaPass.enabled = true;
    }
  };

  const render = () => {
    if (activePreset === 'off') {
      renderer.render(scene, camera);
    } else {
      composer.render();
    }
  };

  const dispose = () => {
    composer.dispose();
  };

  return {
    composer,
    bloomPass,
    vignettePass,
    fxaaPass,
    outputPass,
    render,
    setSize,
    setBloom,
    setPreset,
    dispose,
  };
}
