/* AoM Olympus - edifícios procedurais. Requer common.js.
 * Unidades em metros; 1 tile = 4 m (convenção proposta, ver references/convencoes.md).
 * Cada função devolve um THREE.Group com userData { type, id, footprint, tris }. */
const AOMB = (() => {
  const { mat } = AOM;
  const TILE = 4;

  const box = (w, h, d, m, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); return o;
  };
  const cyl = (rt, rb, h, seg, m, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    o.position.set(x, y, z); return o;
  };
  /** Prisma triangular (frontão/telhado de duas águas). Eixo longo em Z. */
  const prism = (w, h, d, m, x = 0, y = 0, z = 0) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    geo.translate(0, 0, -d / 2);
    const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o;
  };

  function finish(group, type, id, w, d) {
    group.name = id;
    group.userData = { type, id, footprint: [Math.ceil(w / TILE), Math.ceil(d / TILE)], tris: AOM.triCount(group) };
    return group;
  }

  /** Coluna dórica: base, fuste levemente cônico, capitel. */
  function createColumn(h = 5, r = 0.45, m = mat.marble, seg = 10) {
    const g = new THREE.Group(); g.name = 'Coluna';
    g.add(cyl(r * 1.25, r * 1.25, 0.25, seg, m, 0, 0.125, 0));
    g.add(cyl(r * 0.82, r, h, seg, m, 0, 0.25 + h / 2, 0));
    g.add(box(r * 2.6, 0.3, r * 2.6, m, 0, 0.25 + h + 0.15, 0));
    return g;
  }

  /** Linha de n colunas ao longo de X, centrada na origem. */
  function createColumnRow(n, spacing, h, r, m) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const c = createColumn(h, r, m); c.position.x = (i - (n - 1) / 2) * spacing; g.add(c);
    }
    return g;
  }

  /** Casa simples: paredes de reboco, telhado de terracota, porta e janela. */
  function createHouse({ w = 6, d = 6, h = 3.2, id = 'casa' } = {}) {
    const g = new THREE.Group();
    g.add(box(w + 0.6, 0.3, d + 0.6, mat.stone, 0, 0.15, 0));                 // fundação
    g.add(box(w, h, d, mat.plaster, 0, 0.3 + h / 2, 0));                      // paredes
    g.add(prism(w + 0.8, h * 0.55, d + 0.8, mat.terracotta, 0, 0.3 + h, 0)); // telhado (cumeeira ao longo de Z)
    g.add(box(1.1, 2.1, 0.15, mat.darkWood, 0, 0.3 + 1.05, d / 2 + 0.05));    // porta
    g.add(box(1, 0.9, 0.12, mat.darkWood, w * 0.28, 0.3 + h * 0.6, d / 2 + 0.05)); // janela
    return finish(g, 'casa', id, w, d);
  }

  /** Templo grego periptero: degraus, colunata, cela, arquitrave, frontão. */
  function createTemple({ cols = 6, sideCols = 10, w = 14, d = 22, h = 6.5, id = 'templo',
                          trimColor = 0x1d4ed8, colSegments = 10 } = {}) {
    const g = new THREE.Group();
    // degraus (stylobate)
    for (let i = 0; i < 3; i++) g.add(box(w + 2 - i * 0.7, 0.3, d + 2 - i * 0.7, mat.stone, 0, 0.15 + i * 0.3, 0));
    const base = 0.9;
    // cela
    g.add(box(w - 3, h, d - 3, mat.marble, 0, base + h / 2, 0));
    // colunata: frente/fundo e laterais
    const r = Math.min(0.55, (w / cols) * 0.18);
    const front = createColumnRow(cols, (w - 1.6) / (cols - 1), h - 0.55, r, mat.marble);
    [d / 2 - 0.8, -(d / 2 - 0.8)].forEach((z) => { const f = front.clone(); f.position.set(0, base, z); g.add(f); });
    for (let i = 1; i < sideCols - 1; i++) {
      const z = (i - (sideCols - 1) / 2) * ((d - 1.6) / (sideCols - 1));
      [w / 2 - 0.8, -(w / 2 - 0.8)].forEach((x) => {
        const c = createColumn(h - 0.55, r, mat.marble, colSegments); c.position.set(x, base, z); g.add(c);
      });
    }
    // arquitrave, faixa colorida, frontão e telhado
    g.add(box(w, 0.6, d, mat.marble, 0, base + h, 0));
    g.add(box(w - 0.4, 0.18, d - 0.4, mat.cloth(trimColor), 0, base + h + 0.69, 0));
    g.add(prism(w, h * 0.32, d, mat.terracotta, 0, base + h + 0.6, 0));
    return finish(g, 'templo', id, w + 2, d + 2);
  }

  /** Fortaleza: muralha quadrada com ameias, 4 torres de canto e portão. */
  function createFortress({ w = 20, d = 20, wallH = 5, towerH = 8, id = 'fortaleza', merlonStep = 1.6 } = {}) {
    const g = new THREE.Group();
    const t = 1.4; // espessura da muralha
    g.add(box(w + 2, 0.4, d + 2, mat.stone, 0, 0.2, 0));
    const walls = [[0, d / 2, w, t], [0, -d / 2, w, t], [w / 2, 0, t, d], [-w / 2, 0, t, d]];
    walls.forEach(([x, z, ww, dd], i) => {
      g.add(box(ww, wallH, dd, mat.stone, x, 0.4 + wallH / 2, z));
      const alongX = i < 2; const len = alongX ? w : d;
      for (let k = -len / 2 + 1; k <= len / 2 - 1; k += merlonStep) {
        g.add(box(alongX ? 0.7 : t, 0.8, alongX ? t : 0.7, mat.stone, alongX ? k : x, 0.4 + wallH + 0.4, alongX ? z : k));
      }
    });
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
      const tx = sx * w / 2, tz = sz * d / 2;
      g.add(cyl(2.4, 2.7, towerH, 12, mat.stone, tx, 0.4 + towerH / 2, tz));
      g.add(new THREE.Mesh(new THREE.ConeGeometry(3.0, 3.2, 12), mat.terracotta).translateX(tx).translateY(0.4 + towerH + 1.6).translateZ(tz));
    });
    g.add(box(3.2, 3.6, t + 0.3, mat.darkWood, 0, 0.4 + 1.8, d / 2 + 0.05));    // portão
    return finish(g, 'fortaleza', id, w + 2, d + 2);
  }

  return { TILE, box, cyl, prism, createColumn, createColumnRow, createHouse, createTemple, createFortress };
})();
