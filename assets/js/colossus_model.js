// assets/js/colossus_model.js
// MODELO HD ULTRA-DETALHADO: Colosso Grego de Bronze (Autômato Divino de Hefesto)
// Esculpido com alta contagem poligonal, PBR de bronze forjado, pátina verdigris e magma vivo

(function(global) {
  'use strict';

  // 1. GERADOR DE TEXTURA PBR: Bronze Forjado com Pátina Verdigris & Meandro Dourado
  function createHDBronzeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Gradiente base de bronze antigo forjado
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0.0, '#9c6838');
    grad.addColorStop(0.3, '#784d25');
    grad.addColorStop(0.6, '#5e3a1a');
    grad.addColorStop(1.0, '#85552b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Textura de martelado metálico e ruído
    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 1 + Math.random() * 3;
      const alpha = 0.04 + Math.random() * 0.08;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(220, 160, 90, ${alpha})` : `rgba(40, 20, 10, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pátina Verdigris (oxidação esverdeada nas fendas e ranhuras)
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const w = 15 + Math.random() * 60;
      const h = 5 + Math.random() * 20;
      ctx.fillStyle = `rgba(62, 138, 110, ${0.08 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Faixa Dourada com Meandro Grego (Greek Key) nos frisos
    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.strokeStyle = '#38220f';
    ctx.lineWidth = 4;

    const meanderY = [64, 256, 512, 768, 960];
    meanderY.forEach(baseY => {
      ctx.fillRect(0, baseY - 8, 1024, 48);

      ctx.strokeStyle = '#422812';
      ctx.lineWidth = 5;
      const step = 48;
      for (let x = 0; x < 1024; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, baseY + 32);
        ctx.lineTo(x + 30, baseY + 32);
        ctx.lineTo(x + 30, baseY);
        ctx.lineTo(x + 12, baseY);
        ctx.lineTo(x + 12, baseY + 20);
        ctx.lineTo(x + 20, baseY + 20);
        ctx.stroke();

        // Rebites dourados ao longo da borda
        ctx.fillStyle = '#fce588';
        ctx.beginPath();
        ctx.arc(x + 6, baseY - 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // 2. TEXTURA DE BRILHO DE MAGMA (Emissive Map)
  function createHDMagmaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 512);

    // Fendas incandescentes
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = '#ff5500';
      ctx.lineWidth = 6 + Math.random() * 8;
      ctx.beginPath();
      let cx = Math.random() * 512, cy = Math.random() * 512;
      ctx.moveTo(cx, cy);
      for (let j = 0; j < 5; j++) {
        cx += (Math.random() - 0.5) * 100;
        cy += (Math.random() - 0.5) * 100;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Centro amarelo quente
      ctx.strokeStyle = '#ffea75';
      ctx.lineWidth = 2 + Math.random() * 3;
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  // 3. CONSTRUTOR DO COLOSSO HD
  function createColossus() {
    const root = new THREE.Group();
    root.name = 'Colossus_Greek_Automaton_HD';

    const bronzeTex = createHDBronzeTexture();
    const magmaTex = createHDMagmaTexture();

    // Materiais PBR de Alta Fidelidade
    const matBronze = new THREE.MeshStandardMaterial({
      map: bronzeTex,
      color: 0xc4935a,
      roughness: 0.38,
      metalness: 0.88,
      bumpScale: 0.05
    });

    const matDarkBronze = new THREE.MeshStandardMaterial({
      color: 0x4a321c,
      roughness: 0.45,
      metalness: 0.92
    });

    const matGoldTrim = new THREE.MeshStandardMaterial({
      map: bronzeTex,
      color: 0xf3c959,
      roughness: 0.28,
      metalness: 0.95
    });

    const matJoint = new THREE.MeshStandardMaterial({
      color: 0x241d17,
      roughness: 0.22,
      metalness: 0.96
    });

    const matMagma = new THREE.MeshStandardMaterial({
      map: magmaTex,
      color: 0xff8c00,
      emissive: 0xff4800,
      emissiveIntensity: 2.2,
      roughness: 0.15,
      metalness: 0.1
    });

    // ─────────────────────────────────────────────────────────────
    // 1. TRONCO ESCULPIDO HD (Lorica Musculata com Anatomia Heroica)
    // ─────────────────────────────────────────────────────────────
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.35;
    root.add(torsoGroup);

    // Carcaça interna de magma incandescente (núcleo da forja de Hefesto)
    const coreMagma = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.72, 16), matMagma);
    torsoGroup.add(coreMagma);

    // Placa do Peitoral Principal
    const mainChest = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.43, 0.70, 16), matBronze);
    mainChest.castShadow = true;
    torsoGroup.add(mainChest);

    // Músculos Peitorais Esquerdo e Direito (Esculpidos em relevo curvo)
    [-1, 1].forEach(side => {
      const pecGroup = new THREE.Group();
      pecGroup.position.set(side * 0.18, 0.16, 0.46);
      pecGroup.rotation.y = side * 0.2;
      torsoGroup.add(pecGroup);

      // Placa superior do peitoral
      const pecTop = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.20, 0.14), matBronze);
      pecTop.castShadow = true;
      pecGroup.add(pecTop);

      // Friso superior da clavícula
      const clav = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8), matGoldTrim);
      clav.rotation.z = Math.PI / 2;
      clav.position.set(0, 0.12, 0.06);
      pecGroup.add(clav);

      // Músculos Serráteis Laterais (Costelas anatômicas)
      for (let r = 0; r < 3; r++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.10), matBronze);
        rib.position.set(side * 0.22, -0.06 - r * 0.08, -0.05);
        rib.rotation.z = side * -0.25;
        torsoGroup.add(rib);
      }
    });

    // Gomos Abdominais Esculpidos em 3 Camadas
    for (let row = 0; row < 3; row++) {
      const y = 0.0 - row * 0.12;
      [-1, 1].forEach(side => {
        const ab = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.10, 0.12), matBronze);
        ab.position.set(side * 0.11, y, 0.44 - row * 0.02);
        ab.rotation.y = side * 0.1;
        ab.castShadow = true;
        torsoGroup.add(ab);
      });
    }

    // Fenda Central do Esterno com Magma Intenso e Fagulhas
    const sternumGlow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.62, 0.10), matMagma);
    sternumGlow.position.set(0, 0.06, 0.48);
    torsoGroup.add(sternumGlow);

    // Fendas de Magma Horizontais entre os Músculos
    [0.06, -0.06, -0.18].forEach(y => {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.025, 0.08), matMagma);
      seam.position.set(0, y, 0.46);
      torsoGroup.add(seam);
    });

    // Costas / Dorsais Blindados
    const backPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.58, 0.14), matBronze);
    backPlate.position.set(0, 0.06, -0.42);
    torsoGroup.add(backPlate);

    // Espinha Dorsal Articulada em Placas
    for (let s = 0; s < 5; s++) {
      const spinePiece = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.08), matDarkBronze);
      spinePiece.position.set(0, 0.24 - s * 0.11, -0.48);
      torsoGroup.add(spinePiece);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CABEÇA, ELMO CORÍNTIO & MÁSCARA BARBADA DE BRONZE
    // ─────────────────────────────────────────────────────────────
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.88, 0);
    root.add(headGroup);

    // Pescoço com Anéis Mecânicos de Autômato
    const neckBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.18, 12), matJoint);
    neckBase.position.y = -0.12;
    headGroup.add(neckBase);

    // Gola / Gorgjal de Bronze reforçado com rebites
    const gorget = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), matGoldTrim);
    gorget.rotation.x = Math.PI / 2;
    gorget.position.y = -0.08;
    headGroup.add(gorget);

    // Elmo Coríntio Cúpula Principal
    const helmDome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), matBronze);
    helmDome.position.y = 0.08;
    headGroup.add(helmDome);

    // Laterais e Protetores de Bochecha
    const cheekGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.23, 0.32, 12, 1, false, 0, Math.PI), matBronze);
    cheekGuard.rotation.y = -Math.PI / 2;
    cheekGuard.position.set(0, 0.02, 0);
    headGroup.add(cheekGuard);

    // Protetor Nasal em T
    const nasalGuard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.08), matGoldTrim);
    nasalGuard.position.set(0, 0.04, 0.24);
    headGroup.add(nasalGuard);

    // Crista Metálica Superior de Oficial
    const crestHolder = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.42), matGoldTrim);
    crestHolder.position.set(0, 0.32, -0.02);
    headGroup.add(crestHolder);

    const crestHair = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.48), matDarkBronze);
    crestHair.position.set(0, 0.44, -0.02);
    headGroup.add(crestHair);

    // Olhos Flamejantes de Magma Incandescente
    [-0.08, 0.08].forEach(x => {
      const eyeSlot = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.035, 0.08), matMagma);
      eyeSlot.position.set(x, 0.06, 0.22);
      headGroup.add(eyeSlot);
    });

    // Máscara Facial com Barba de Bronze Esculpida em Lâminas
    const beardGroup = new THREE.Group();
    beardGroup.position.set(0, -0.12, 0.21);
    headGroup.add(beardGroup);

    for (let b = 0; b < 5; b++) {
      const bWidth = 0.18 - b * 0.03;
      const bTier = new THREE.Mesh(new THREE.BoxGeometry(bWidth, 0.07, 0.12), matBronze);
      bTier.position.set(0, -b * 0.06, b * 0.015);
      bTier.rotation.x = 0.2;
      beardGroup.add(bTier);
    }

    // ─────────────────────────────────────────────────────────────
    // 3. BRAÇOS MECÂNICOS, OMBREIRAS TRIPLAS & MANOPLAS COM REBITES
    // ─────────────────────────────────────────────────────────────
    [-1, 1].forEach(side => {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.58, 1.50, 0);
      root.add(armGroup);

      // Junta Esférica do Ombro com Eixo Mecânico
      const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), matJoint);
      armGroup.add(shoulderJoint);

      const jointBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.42, 8), matDarkBronze);
      jointBolt.rotation.z = Math.PI / 2;
      armGroup.add(jointBolt);

      // Ombreiras Triplas em Camadas Sobrepostas (Spaulders Arqueadas)
      for (let layer = 0; layer < 3; layer++) {
        const pSize = 0.36 - layer * 0.04;
        const pRadius = 0.32 - layer * 0.03;
        const pauldron = new THREE.Mesh(
          new THREE.CylinderGeometry(pRadius, pRadius * 1.15, pSize, 12, 1, false, 0, Math.PI),
          matGoldTrim
        );
        pauldron.rotation.z = side * -0.35;
        pauldron.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        pauldron.position.set(side * (0.08 + layer * 0.04), 0.22 - layer * 0.14, 0);
        pauldron.scale.set(1.15, 1, 1.35);
        pauldron.castShadow = true;
        armGroup.add(pauldron);
      }

      // Braço Superior / Bíceps Articulado em Placas
      const bicepGroup = new THREE.Group();
      bicepGroup.position.set(0, -0.28, 0);
      armGroup.add(bicepGroup);

      const bicepPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.38, 12), matBronze);
      bicepPlate.castShadow = true;
      bicepGroup.add(bicepPlate);

      // Fenda de Magma no Braço
      const bicepMagma = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, 0.05), matMagma);
      bicepMagma.position.set(side * 0.14, 0, 0);
      bicepGroup.add(bicepMagma);

      // Cotovelo Esférico de Autômato com Dobradiça
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), matJoint);
      elbow.position.set(0, -0.52, 0);
      armGroup.add(elbow);

      // Antebraço / Manopla de Bronze com Meandros
      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -0.78, 0);
      armGroup.add(forearmGroup);

      const gauntlet = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.44, 12), matGoldTrim);
      gauntlet.castShadow = true;
      forearmGroup.add(gauntlet);

      // Braçadeira com relevo e fivela
      const cuffRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 16), matDarkBronze);
      cuffRing.rotation.x = Math.PI / 2;
      cuffRing.position.y = 0.16;
      forearmGroup.add(cuffRing);

      // Punho Fechado Maciço com Dedos Esculpidos
      const handGroup = new THREE.Group();
      handGroup.position.set(0, -1.04, 0);
      armGroup.add(handGroup);

      const fistPalm = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.18, 0.18), matBronze);
      fistPalm.castShadow = true;
      handGroup.add(fistPalm);

      // 4 Dedos Segmentados Fechados
      for (let d = 0; d < 4; d++) {
        const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.16, 6), matDarkBronze);
        finger.position.set(-0.06 + d * 0.04, -0.09, 0.08);
        finger.rotation.x = Math.PI / 2;
        handGroup.add(finger);
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 4. CINTURÃO DO LEÃO & PTERUGES DUPLO (Saia Militar com Placas)
    // ─────────────────────────────────────────────────────────────
    const waistGroup = new THREE.Group();
    waistGroup.position.y = 0.98;
    root.add(waistGroup);

    // Cinto de Bronze com Gravação
    const heavyBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.16, 16), matGoldTrim);
    waistGroup.add(heavyBelt);

    // Medalhão Central de Cabeça de Leão / Górgona Dourada
    const medallionRing = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 16), matGoldTrim);
    medallionRing.position.set(0, 0, 0.46);
    waistGroup.add(medallionRing);

    const lionFace = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), matBronze);
    lionFace.position.set(0, 0, 0.46);
    lionFace.scale.set(1, 1, 0.5);
    waistGroup.add(lionFace);

    // Camada Dupla de Tiras Pteruges (14 lâminas externas + 14 internas)
    const pterugeCount = 14;
    for (let i = 0; i < pterugeCount; i++) {
      const angle = (i / pterugeCount) * Math.PI * 2;
      const rad = 0.46;

      // Tira Externa Longa
      const pGroup = new THREE.Group();
      pGroup.position.set(Math.sin(angle) * rad, -0.28, Math.cos(angle) * rad);
      pGroup.rotation.y = angle;
      pGroup.rotation.x = 0.12;
      waistGroup.add(pGroup);

      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.48, 0.03), matGoldTrim);
      strip.castShadow = true;
      pGroup.add(strip);

      // Ponteira Metálica Pesada no Fim da Tira
      const stripTip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.05), matDarkBronze);
      stripTip.position.y = -0.22;
      pGroup.add(stripTip);

      // Rebites da tira
      const stud = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), matGoldTrim);
      stud.position.set(0, -0.12, 0.025);
      pGroup.add(stud);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. PERNAS HEROICAS, GREVAS COM FOGO & SABBATONS DE GUERRA
    // ─────────────────────────────────────────────────────────────
    [-1, 1].forEach(side => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.28, 0.88, 0);
      root.add(legGroup);

      // Junta Mecânica do Quadril
      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), matJoint);
      legGroup.add(hipJoint);

      // Coxa Blindada com Placas Frontais Musculares
      const thighGroup = new THREE.Group();
      thighGroup.position.y = -0.24;
      legGroup.add(thighGroup);

      const thighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.44, 12), matBronze);
      thighMesh.castShadow = true;
      thighGroup.add(thighMesh);

      // Placa frontal da coxa
      const thighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.38, 0.08), matGoldTrim);
      thighPlate.position.set(0, 0, 0.14);
      thighGroup.add(thighPlate);

      // Joelheira Esférica de Autômato com Disco Central
      const kneeGroup = new THREE.Group();
      kneeGroup.position.y = -0.52;
      legGroup.add(kneeGroup);

      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), matJoint);
      kneeGroup.add(knee);

      const kneeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 12), matGoldTrim);
      kneeCap.rotation.x = Math.PI / 2;
      kneeCap.position.set(0, 0, 0.14);
      kneeGroup.add(kneeCap);

      // Greva Anatômica (Caneleira Grega Pesada)
      const shinGroup = new THREE.Group();
      shinGroup.position.y = -0.84;
      legGroup.add(shinGroup);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.17, 0.58, 12), matBronze);
      shin.castShadow = true;
      shinGroup.add(shin);

      // Crista / Aresta Central da Greva (Carina)
      const shinRidge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.54, 0.10), matGoldTrim);
      shinRidge.position.set(0, 0, 0.17);
      shinGroup.add(shinRidge);

      // Fenda de Magma Vertical Ardente na Perna
      const legMagma = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.50, 0.08), matMagma);
      legMagma.position.set(0, 0, 0.18);
      shinGroup.add(legMagma);

      // Bota Sabbatons Articulada em Placas Sobrepostas
      const footGroup = new THREE.Group();
      footGroup.position.set(0, -1.16, 0.10);
      legGroup.add(footGroup);

      // Calcanhar e tornozelo
      const ankle = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.28), matDarkBronze);
      footGroup.add(ankle);

      // Peito do pé e dedos articulados
      const toePlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.26), matBronze);
      toePlate.position.set(0, -0.02, 0.20);
      footGroup.add(toePlate);

      // Ranhuras de articulação nos pés
      for (let f = 0; f < 3; f++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.03, 0.04), matGoldTrim);
        rib.position.set(0, 0.04, 0.12 + f * 0.07);
        footGroup.add(rib);
      }
    });

    // Escala Monumental do Colosso (2.2x da unidade básica de infantaria)
    root.scale.set(1.65, 1.65, 1.65);

    return {
      object: root,
      magmaMaterial: matMagma,
      bronzeMaterial: matBronze,
      goldMaterial: matGoldTrim
    };
  }

  global.ColossusFactory = {
    createColossus: createColossus
  };

})(window);
