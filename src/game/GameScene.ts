import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private hoplita!: Phaser.Physics.Arcade.Sprite;
  private alvo: Phaser.Math.Vector2 | null = null;
  private atacando = false;

  constructor() { super('GameScene'); }

  preload() {
    // 1920 x 1280 image split into 6 columns x 3 rows -> 320 x 426.67 per frame
    this.load.spritesheet('hoplita-iso', 'assets/hoplita-iso.png', {
      frameWidth: 320,
      frameHeight: 426,
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#3a7d2e');

    this.anims.create({
      key: 'iso-idle',
      frames: [{ key: 'hoplita-iso', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'iso-walk',
      frames: this.anims.generateFrameNumbers('hoplita-iso', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'iso-attack',
      frames: this.anims.generateFrameNumbers('hoplita-iso', { start: 12, end: 17 }),
      frameRate: 12,
      repeat: 0,
    });

    this.hoplita = this.physics.add.sprite(400, 300, 'hoplita-iso');
    this.hoplita.setScale(0.55);
    this.hoplita.play('iso-idle');

    const cam = this.cameras.main;
    cam.setBounds(0, 0, 2000, 2000);
    cam.setZoom(1.1);
    cam.startFollow(this.hoplita);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0) return;
      if (this.atacando) return;

      const mundo = cam.getWorldPoint(pointer.x, pointer.y);
      this.alvo = new Phaser.Math.Vector2(mundo.x, mundo.y);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 2) this.atacar();
    });
    this.input.keyboard!.on('keydown-SPACE', () => this.atacar());

    this.hoplita.on('animationcomplete-iso-attack', () => {
      this.atacando = false;
      this.hoplita.play('iso-idle');
    });

    this.input.mouse!.disableContextMenu();
  }

  update() {
    if (this.atacando) return;
    const body = this.hoplita.body as Phaser.Physics.Arcade.Body;
    if (!this.alvo) {
      body.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(
      this.hoplita.x, this.hoplita.y,
      this.alvo.x, this.alvo.y
    );

    if (dist < 10) {
      body.setVelocity(0, 0);
      this.alvo = null;
      this.hoplita.play('iso-idle', true);
      return;
    }

    const angulo = Math.atan2(this.alvo.y - this.hoplita.y, this.alvo.x - this.hoplita.x);
    const correndo = dist > 250;
    const velocidade = correndo ? 280 : 140;

    body.setVelocity(Math.cos(angulo) * velocidade, Math.sin(angulo) * velocidade);
    this.hoplita.play('iso-walk', true);
    this.hoplita.anims.timeScale = correndo ? 1.6 : 1.0;

    this.hoplita.setDepth(this.hoplita.y);
  }

  atacar() {
    if (this.atacando) return;
    this.atacando = true;
    (this.hoplita.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.alvo = null;

    this.hoplita.play('iso-attack');

    this.time.delayedCall(300, () => {
      this.cameras.main.shake(80, 0.004);
    });
  }
}
