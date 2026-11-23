// assets/js/colossus_model.js
// Gerador Procedural do Colosso Grego de Bronze (Autômato de Hefesto)
// Baseado na análise de imagem de referência e no padrão Low-Poly Synty

(function(global) {
  'use strict';

  // Gerador de textura procedural do Meandro Grego (Greek Key)
  function createMeanderTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Fundo bronze escurecido
    ctx.fillStyle = '#6b4f2c';
    ctx.fillRect(0, 0, 256, 64);

    // Linha dourada do meandro grego
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';

    const step = 32;
    for (let x = 0; x < 256; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x + 20, 50);
      ctx.lineTo(x + 20, 20);
      ctx.lineTo(x + 8, 20);
      ctx.lineTo(x + 8, 36);
      ctx.lineTo(x + 14, 36);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    return tex;
  }

  function createColossus() {
    const root = new THREE.Group();
    root.name = 'Colossus_Greek_Automaton';

    const meanderTex = createMeanderTexture();

    // Materiais PBR
    const matBronze = new THREE.MeshStandardMaterial({
      color: 0x8a623a,
      roughness: 0.45,
      metalness: 0.85
    });

    const matDarkBronze = new THREE.MeshStandardMaterial({
      color: 0x543c22,
      roughness: 0.55,
      metalness: 0.8
    });

    const matGoldTrim = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.9,
      map: meanderTex
    });

    const matJoint = new THREE.MeshStandardMaterial({
      color: 0x2e251e,
      roughness: 0.25,
      metalness: 0.95
    });

    const matMagma = new THREE.MeshStandardMaterial({
      color: 0xff7700,
      emissive: 0xff4400,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.1
    });

    // 1. TRONCO / PEITORAL (Lorica Musculata)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.35;
    root.add(torsoGroup);

    // Placa do Peitoral
    const chestGeo = new THREE.CylinderGeometry(0.52, 0.42, 0.65, 8);
    const chestMesh = new THREE.Mesh(chestGeo, matBronze);
    chestMesh.castShadow = true;
    torsoGroup.add(chestMesh);

    // Músculos Peitorais Esquerdo e Direito (Relevo)
    const pecGeo = new THREE.BoxGeometry(0.24, 0.22, 0.15);
    const pecLeft = new THREE.Mesh(pecGeo, matBronze);
    pecLeft.position.set(-0.16, 0.12, 0.44);
    pecLeft.rotation.y = 0.15;
    torsoGroup.add(pecLeft);

    const pecRight = new THREE.Mesh(pecGeo, matBronze);
    pecRight.position.set(0.16, 0.12, 0.44);
    pecRight.rotation.y = -0.15;
    torsoGroup.add(pecRight);

    // Gomos Abdominais Esculpidos
    for (let row = 0; row < 3; row++) {
      const yPos = -0.04 - row * 0.11;
      const abGeo = new THREE.BoxGeometry(0.18, 0.09, 0.12);
      
      const abL = new THREE.Mesh(abGeo, matBronze);
      abL.position.set(-0.11, yPos, 0.4);
      torsoGroup.add(abL);

      const abR = new THREE.Mesh(abGeo, matBronze);
      abR.position.set(0.11, yPos, 0.4);
      torsoGroup.add(abR);
    }

    // Fenda de Magma Central Vertical (Brilho do Fogo de Hefesto)
    const sternumMagmaGeo = new THREE.BoxGeometry(0.04, 0.55, 0.08);
    const sternumMagma = new THREE.Mesh(sternumMagmaGeo, matMagma);
    sternumMagma.position.set(0, 0.02, 0.45);
    torsoGroup.add(sternumMagma);

    // Fendas de Magma Horizontais dos Músculos
    [-0.04, -0.15].forEach(y => {
      const hMagma = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.05), matMagma);
      hMagma.position.set(0, y, 0.43);
      torsoGroup.add(hMagma);
    });

    // 2. CABEÇA & ELMO CORÍNTIO COM OLHOS INCANDESCENTES
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.85, 0);
    root.add(headGroup);

    // Pescoço de Bronze articulado
    const neckGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.18, 8);
    const neck = new THREE.Mesh(neckGeo, matJoint);
    neck.position.y = -0.12;
    headGroup.add(neck);

    // Elmo Espartano/Coríntio
    const helmGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.38, 8);
    const helm = new THREE.Mesh(helmGeo, matBronze);
    helm.castShadow = true;
    headGroup.add(helm);

    // Crista Metálica Superior
    const crestGeo = new THREE.BoxGeometry(0.06, 0.22, 0.44);
    const crest = new THREE.Mesh(crestGeo, matDarkBronze);
    crest.position.set(0, 0.24, -0.04);
    headGroup.add(crest);

    // Barba Esculpida em Bronze
    const beardGeo = new THREE.ConeGeometry(0.16, 0.26, 6);
    const beard = new THREE.Mesh(beardGeo, matBronze);
    beard.rotation.x = 0.35;
    beard.position.set(0, -0.14, 0.22);
    headGroup.add(beard);

    // Olhos de Magma Flamejante
    const eyeGeo = new THREE.BoxGeometry(0.06, 0.03, 0.06);
    const eyeL = new THREE.Mesh(eyeGeo, matMagma);
    eyeL.position.set(-0.08, 0.04, 0.22);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, matMagma);
    eyeR.position.set(0.08, 0.04, 0.22);
    headGroup.add(eyeR);

    // 3. BRAÇOS & OMBREIRAS COLOSSAIS
    [-1, 1].forEach(side => {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.56, 1.48, 0);
      root.add(armGroup);

      // Articulação Esférica do Ombro (Junta Mecânica)
      const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), matJoint);
      armGroup.add(shoulderJoint);

      // Ombreira Gigantesca Arqueada em Camadas (Spaulder)
      const pauldronGeo = new THREE.CylinderGeometry(0.28, 0.34, 0.32, 8, 1, false, 0, Math.PI);
      const pauldron = new THREE.Mesh(pauldronGeo, matGoldTrim);
      pauldron.rotation.z = side * -0.4;
      pauldron.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      pauldron.position.set(side * 0.06, 0.16, 0);
      pauldron.scale.set(1.1, 1, 1.2);
      armGroup.add(pauldron);

      // Braço Superior
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.38, 8), matBronze);
      upperArm.position.y = -0.25;
      armGroup.add(upperArm);

      // Cotovelo Esférico
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), matJoint);
      elbow.position.y = -0.48;
      armGroup.add(elbow);

      // Antebraço / Manopla de Bronze com Meandro
      const gauntlet = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.4, 8), matGoldTrim);
      gauntlet.position.y = -0.72;
      armGroup.add(gauntlet);

      // Punho Fechado de Bronze Maciço
      const fist = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.18), matBronze);
      fist.position.y = -0.96;
      armGroup.add(fist);
    });

    // 4. CINTURÃO & SAIA MILITAR (Pteruges)
    const waistGroup = new THREE.Group();
    waistGroup.position.y = 0.98;
    root.add(waistGroup);

    // Cinto Dourado de Bronze
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.12, 10), matGoldTrim);
    waistGroup.add(belt);

    // Fivela / Medalhão de Leão Redondo
    const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), matDarkBronze);
    buckle.rotation.x = Math.PI / 2;
    buckle.position.set(0, 0, 0.44);
    waistGroup.add(buckle);

    // Tiras Pteruges da Saia (10 lâminas ao redor da cintura)
    const stripCount = 10;
    for (let i = 0; i < stripCount; i++) {
      const angle = (i / stripCount) * Math.PI * 2;
      const stripGeo = new THREE.BoxGeometry(0.16, 0.42, 0.04);
      const strip = new THREE.Mesh(stripGeo, matGoldTrim);
      strip.position.set(Math.sin(angle) * 0.44, -0.22, Math.cos(angle) * 0.44);
      strip.rotation.y = angle;
      strip.rotation.x = 0.1;
      waistGroup.add(strip);
    }

    // 5. PERNAS, GREVAS & BOTAS MACIÇAS
    [-1, 1].forEach(side => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.28, 0.88, 0);
      root.add(legGroup);

      // Articulação do Quadril
      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), matJoint);
      legGroup.add(hipJoint);

      // Coxa Blindada
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.42, 8), matBronze);
      thigh.position.y = -0.22;
      legGroup.add(thigh);

      // Joelheira Esférica de Autômato
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), matJoint);
      knee.position.y = -0.48;
      legGroup.add(knee);

      // Greva Anatômica (Caneleira)
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.52, 8), matBronze);
      shin.position.y = -0.78;
      legGroup.add(shin);

      // Fenda de Magma Vertical na Perna
      const legMagma = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.46, 0.06), matMagma);
      legMagma.position.set(0, -0.78, 0.17);
      legGroup.add(legMagma);

      // Bota Sabbatons de Placas de Bronze
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.44), matDarkBronze);
      foot.position.set(0, -1.06, 0.08);
      legGroup.add(foot);
    });

    // Escala imponente Colossal (2.2x a escala do soldado comum de 1.45m)
    root.scale.set(1.5, 1.5, 1.5);

    return {
      object: root,
      magmaMaterial: matMagma
    };
  }

  global.ColossusFactory = {
    createColossus: createColossus
  };

})(window);
