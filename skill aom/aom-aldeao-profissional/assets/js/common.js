/* AoM Olympus - helpers comuns. Requer Three.js global (THREE).
 * Uso: <script src="common.js"></script> depois do Three.js. */
const AOM = (() => {
  // ---------- Materiais PBR (mesma paleta do aldeão) ----------
  const std = (color, metalness = 0, roughness = 0.7, extra = {}) =>
    new THREE.MeshStandardMaterial(Object.assign({ color, metalness, roughness }, extra));

  const mat = {
    bronze:     std(0xd4af37, 0.85, 0.3),
    steel:      std(0xe2e8f0, 0.9, 0.2),
    iron:       std(0x475569, 0.85, 0.35),
    wood:       std(0x78350f, 0, 0.75),
    darkWood:   std(0x451a03, 0, 0.8),
    leather:    std(0x3e2723, 0, 0.7),
    stone:      std(0x9ca3af, 0, 0.95),
    marble:     std(0xf1f5f9, 0.05, 0.5),
    plaster:    std(0xe7dcc3, 0, 0.9),
    terracotta: std(0xb45309, 0, 0.85),
    gold:       std(0xfacc15, 0.9, 0.25),
    cloth(color) { return std(color, 0, 0.9); },
    glow(color)  { return std(color, 0, 0.3, { emissive: color, emissiveIntensity: 1.2 }); },
  };

  // ---------- Nomes de ossos ----------
  // "mixamorigRightArm_013" -> "RightArm"; "mixamorig:Spine1" -> "Spine1"
  const boneKey = (name) => name.replace(/^mixamorig:?/, '').replace(/_\d+$/, '');
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  /** Guarda o quaternion de repouso de cada osso. Chame ANTES de tocar animações. */
  function collectRest(root) {
    const rest = {};
    root.traverse((o) => {
      if (o.isBone) rest[o.name] = [o.quaternion.x, o.quaternion.y, o.quaternion.z, o.quaternion.w];
    });
    return rest;
  }

  function findBone(root, key) {
    let found = null;
    root.traverse((o) => { if (!found && o.isBone && boneKey(o.name) === key) found = o; });
    return found;
  }

  // ---------- Animação ----------
  /** repouso * delta Euler -> [x,y,z,w] */
  function makeQuat(baseQ, ex, ey, ez) {
    const q = new THREE.Quaternion(baseQ[0], baseQ[1], baseQ[2], baseQ[3]);
    q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(ex, ey, ez)));
    return [q.x, q.y, q.z, q.w];
  }

  /** poses: { RightArm: [[ex,ey,ez], ...], ... }  (um item por tempo em `times`) */
  function createClipFromPoses({ name, duration, times, poses, rest }) {
    const index = {};
    Object.keys(rest).forEach((n) => { index[boneKey(n)] = n; });
    const tracks = [];
    for (const key of Object.keys(poses)) {
      const node = index[key];
      if (!node) { console.warn(`[AOM] osso "${key}" não encontrado; trilha ignorada`); continue; }
      if (poses[key].length !== times.length) {
        throw new Error(`[AOM] "${key}" tem ${poses[key].length} poses, mas "times" tem ${times.length}`);
      }
      const values = [];
      poses[key].forEach(([ex, ey, ez]) => values.push(...makeQuat(rest[node], ex, ey, ez)));
      tracks.push(new THREE.QuaternionKeyframeTrack(`${node}.quaternion`, times, values));
    }
    return new THREE.AnimationClip(name, duration, tracks);
  }

  // ---------- Sockets e props ----------
  /** Cria <Osso>_Socket como filho do osso e devolve o Group. */
  function attachSocket(root, key, pos = [0, 0, 0], rot = [0, 0, 0]) {
    const bone = findBone(root, key);
    if (!bone) { console.warn(`[AOM] osso "${key}" não encontrado`); return null; }
    const socket = new THREE.Group();
    socket.name = `${key}_Socket`;
    socket.position.set(...pos);
    socket.rotation.set(...rot);
    bone.add(socket);
    return socket;
  }

  const DEFAULT_TOOL_RULES = [
    { tool: 'knife',   words: ['faquinha', 'atacar', 'slash', 'punhalada'] },
    { tool: 'axe',     words: ['madeira', 'machadinha'] },
    { tool: 'pickaxe', words: ['ouro', 'picareta'] },
    { tool: 'fishing', words: ['pesca', 'pescar'] },
  ];

  /** Liga/desliga props pelo nome do clipe. Regra: {tool, words:[...]} ou {tool, always:true}. */
  function applyToolVisibility(tools, clipName, rules = DEFAULT_TOOL_RULES) {
    const n = norm(clipName);
    for (const r of rules) {
      if (!tools[r.tool]) continue;
      tools[r.tool].visible = r.always ? true : r.words.some((w) => n.includes(norm(w)));
    }
  }

  // ---------- Medição e exportação ----------
  function triCount(object) {
    let t = 0;
    object.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry;
      t += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    });
    return Math.round(t);
  }

  function materialCount(object) {
    const s = new Set();
    object.traverse((o) => { if (o.isMesh) [].concat(o.material).forEach((m) => s.add(m)); });
    return s.size;
  }

  /** Baixa um .glb. Precisa do GLTFExporter carregado (THREE.GLTFExporter ou window.GLTFExporter). */
  function exportGLB(object, clips = [], filename = 'asset.glb') {
    const Exporter = THREE.GLTFExporter || (typeof window !== 'undefined' && window.GLTFExporter);
    if (!Exporter) { console.error('[AOM] GLTFExporter não carregado'); return; }
    new Exporter().parse(
      object,
      (buf) => {
        const blob = new Blob([buf], { type: 'model/gltf-binary' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      },
      (err) => console.error('[AOM] erro ao exportar', err),
      { binary: true, animations: clips }
    );
  }

  return { mat, std, boneKey, norm, collectRest, findBone, makeQuat, createClipFromPoses,
           attachSocket, DEFAULT_TOOL_RULES, applyToolVisibility, triCount, materialCount, exportGLB };
})();
