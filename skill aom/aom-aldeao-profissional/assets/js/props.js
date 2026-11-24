/* AoM Olympus - props de combate/divindade. Requer common.js.
 * Convenção do aldeão: grupo "Tool_<Nome>", origem na empunhadura,
 * cabo atravessa a mão, cabeça/ponta em Y positivo, medidas em cm. */
const AOMP = (() => {
  const { mat } = AOM;
  const mesh = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o; };

  /** Lança hoplita (dory), ~2,4 m. Ponta em Y+. */
  function createDory() {
    const g = new THREE.Group(); g.name = 'Tool_Dory';
    g.add(mesh(new THREE.CylinderGeometry(1.4, 1.6, 210, 8), mat.wood, 0, 65, 0));      // haste
    g.add(mesh(new THREE.CylinderGeometry(1.8, 1.8, 14, 8), mat.leather, 0, 0, 0));      // empunhadura
    g.add(mesh(new THREE.ConeGeometry(3.2, 26, 4), mat.steel, 0, 183, 0));               // ponta
    g.add(mesh(new THREE.ConeGeometry(1.8, 14, 6), mat.bronze, 0, -47, 0).rotateX(Math.PI)); // sauroter
    return g;
  }

  /** Escudo redondo (aspis), diâmetro ~90 cm. Face voltada para +Z. */
  function createAspis(faceColor = 0x9b1c1c) {
    const g = new THREE.Group(); g.name = 'Tool_Aspis';
    const disc = mesh(new THREE.CylinderGeometry(45, 45, 4, 24), mat.bronze);
    disc.rotation.x = Math.PI / 2; g.add(disc);
    const face = mesh(new THREE.CylinderGeometry(38, 38, 4.4, 24), mat.cloth(faceColor));
    face.rotation.x = Math.PI / 2; g.add(face);
    const boss = mesh(new THREE.SphereGeometry(8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat.bronze, 0, 0, 2.4);
    boss.rotation.x = Math.PI / 2; g.add(boss);
    g.add(mesh(new THREE.BoxGeometry(4, 22, 3), mat.leather, 0, 0, -4));                 // alça
    return g;
  }

  /** Capacete coríntio com penacho. Origem no topo do crânio, ~cm do osso Head. */
  function createCorinthianHelmet(crestColor = 0x9b1c1c) {
    const g = new THREE.Group(); g.name = 'Tool_Helmet';
    g.add(mesh(new THREE.SphereGeometry(11.5, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.68), mat.bronze, 0, 0, 0));
    g.add(mesh(new THREE.BoxGeometry(6.5, 9, 3), mat.bronze, 0, -8, 9.5));               // protetor de nariz
    const crest = mesh(new THREE.BoxGeometry(2.4, 7, 22), mat.cloth(crestColor), 0, 12, -1);
    g.add(crest);
    return g;
  }

  /** Espada curta (xiphos), ~60 cm. */
  function createXiphos() {
    const g = new THREE.Group(); g.name = 'Tool_Xiphos';
    g.add(mesh(new THREE.CylinderGeometry(1.2, 1.4, 11, 8), mat.leather, 0, 0, 0));
    g.add(mesh(new THREE.SphereGeometry(1.9, 8, 8), mat.bronze, 0, -6.5, 0));
    g.add(mesh(new THREE.BoxGeometry(7, 1.4, 2.4), mat.bronze, 0, 5.8, 0));
    const shape = new THREE.Shape();
    shape.moveTo(-2.4, 0); shape.lineTo(2.4, 0); shape.lineTo(2.9, 22); shape.lineTo(0, 46); shape.lineTo(-2.9, 22); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
    geo.center();
    g.add(mesh(geo, mat.steel, 0, 29, 0));
    return g;
  }

  /** Raio de Zeus (keraunos), ~90 cm, brilho azul. */
  function createKeraunos() {
    const g = new THREE.Group(); g.name = 'Tool_Keraunos';
    g.add(mesh(new THREE.CylinderGeometry(1.6, 1.8, 16, 8), mat.gold, 0, 0, 0));        // cabo
    const pts = [[0,0],[5,12],[-1,20],[7,34],[-3,44],[3,46],[-7,62],[2,48],[-4,46],[4,34],[-5,22],[3,12]];
    const shape = new THREE.Shape();
    shape.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: false });
    geo.center();
    g.add(mesh(geo, mat.glow(0x60a5fa), 0, 38, 0));
    return g;
  }

  return { createDory, createAspis, createCorinthianHelmet, createXiphos, createKeraunos };
})();
