import { FAUNA_STATS, FaunaKind, FaunaStats } from '../../game/types';
import { FAUNA_TEXTURA_CATALOG, FaunaTextureSpec, getFaunaCoatMaterial } from '../fauna/faunaCatalog';

export interface AnimalTexturaEntry {
  kind: FaunaKind;
  stats: FaunaStats;
  texture: FaunaTextureSpec;
}

export const ANIMAIS_TEXTURA_LIST: AnimalTexturaEntry[] = (Object.keys(FAUNA_STATS) as FaunaKind[]).map(
  (kind) => ({
    kind,
    stats: FAUNA_STATS[kind],
    texture: FAUNA_TEXTURA_CATALOG[kind],
  })
);

export { getFaunaCoatMaterial };
