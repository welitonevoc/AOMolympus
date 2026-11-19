# Roteiro de Refatoração em Etapas — Age of Mythology: Olympus

Documento vivo de acompanhamento do refatoramento estrutural do projeto.

---

## Etapa 0 — Estabilização Pós-Restauração (Concluída)
- [x] Reconectar os 4 modelos detalhados de aldeões (Gregos, Nórdicos + Anão, Egípcios e Cidadãos Atlantes + Lhama + estado Herói) em `src/game/models/unitFactory.ts`, com pés apoiados no terreno (`y = 0`).
- [x] Remover emissão de esferas de poeira ao caminhar para unidades trabalhadoras em `src/game/engine/movementAndFormationsSystem.ts`.
- [x] Passar `teamMajorGod` na criação de unidades em replay (`src/game/engine/replayAndHudSystem.ts`).
- [x] Calibrar `toneMappingExposure` do renderer principal (`0.94`) para evitar estouro branco de iluminação.

## Etapa 1 — Conclusão da Modularização do Núcleo da Engine (Concluída)
- [x] **1A — Poderes Divinos:** extraído `executeGodPower` e efeitos divinos para `src/game/engine/godPowersSystem.ts`.
- [x] **1B — Construções, Produção, Eras e Pesquisas:** extraídos `trainUnit`, `cancelTrainingItem`, `advanceAge`, `chooseMinorGod`, `researchTech`, `toggleRepeatTraining`, `matchesUnitProducer` e `updateBuildings` para `src/game/engine/buildingsAndProductionSystem.ts`.
- [x] **1C — Favor e Economia Divina:** extraídos cálculos de favor por panteão, combate nórdico e visão de oráculos para `src/game/engine/favorAndEconomySystem.ts`.
- [x] **1D — Fog of War e Sistema Climático:** extraídos névoa de guerra, cache do minimapa e partículas climáticas para `src/game/engine/weatherAndFogSystem.ts`.
- [x] **1E — Entrada, Câmera e Grupos de Controle:** extraídos `assignControlGroup`, `selectControlGroup`, `handleWheelZoom`, `handleKeyDownShortcut` e `updateCameraTransform` para `src/game/engine/cameraAndInputSystem.ts`.
- [x] **1F — Persistência (Save/Load):** extraídos `buildSerializedMatch`, `saveMatchToStorage` e `loadMatchFromStorage` para `src/game/engine/matchPersistenceSystem.ts`.

## Etapa 2 — Modularização de Dados, Áudio e Editores Secundários (Concluída)
- [x] Dividir `src/game/data/unitRostersData.ts` por civilização em `src/game/data/rosters/` (`egyptianRoster.ts`, `norseRoster.ts`, `atlanteanRoster.ts`, `chineseRoster.ts`, `navalRoster.ts`) mantendo fachada única.
- [x] Dividir `src/game/divineData.ts` em `src/game/data/divine/` (`godPowersData.ts`, `techSpecsData.ts`, `godsPantheonData.ts`, `civLocalizationData.ts`) mantendo fachada única.
- [x] Extrair catálogos de música e vozes culturais de `src/game/audio.ts` para `src/game/audio/musicCatalog.ts` e `src/game/audio/cultureVoiceBank.ts`.
- [x] Extrair utilitários e definições estruturais dos editores para `src/components/scenarioEditor/editorHelpers.ts` e `src/components/multiplayer/mpHubHelpers.ts`.

## Etapa 3 — HUD Responsiva e Controles Táteis para Celular (Concluída)
- [x] Adicionar barra tátil ergonômica para celular (`src/components/hud/MobileTouchActionBar.tsx`) na zona do polegar (alvos `≥ 44×44px`) com atalhos rápidos: Câmera/Seleção, Aldeão Ocioso, Base, Tropas, Comandos e Cancelar modo ativo.
- [x] Criar barra superior compacta mobile (`src/components/hud/MobileCompactTopBar.tsx`, `48px` de altura) preservando ≥85% do campo de batalha livre em telas estreitas.
- [x] Criar gaveta inferior tátil (`src/components/hud/MobileCommandSheet.tsx`) em formato *bottom sheet* com abas (`Construir`, `Treinar`, `Poderes`, `Pesquisas`), barra rápida de avanço de Era e fechamento automático ao iniciar posicionamento.
- [x] Manter 100% da interface clássica AoM Retold intacta em telas desktop (`md:`+).

## Etapa 4 — PWA Instalável e Modo Offline (Concluída)
- [x] Configurar `vite-plugin-pwa` em `vite.config.ts` com manifesto completo, service worker `autoUpdate` e cache offline.
- [x] Gerar ícones PNG nativos (`pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon.png`) + `public/icon.svg` e meta tags iOS/Android em `index.html`.
- [x] Implementar `usePWAInstall`, `useOnlineStatus`, `PWAInstallButton` e `OfflineIndicator`.

## Etapa 5 — Suíte de Testes Automatizados (Concluída — Base Expandida)
- [x] Configurar `vitest` e script `"test": "vitest run"` em `package.json`.
- [x] Criar testes automatizados de regressão em `src/game/__tests__/` cobrindo combate, catálogos divinos, navegação A*, adaptador de aldeões 3D, névoa/clima e sistemas extraídos da Etapa 1 (persistência, grupos de controle e produtores).

## Etapa 6 — Expansão de Novo Panteão na Arquitetura Modular (Próxima)
- [ ] Definir e implementar o próximo panteão completo utilizando os módulos desacoplados e validando com a suíte Vitest.
