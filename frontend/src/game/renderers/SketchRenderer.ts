import Phaser from 'phaser';

export type SketchLayout = 'campfireRest';

type CampfireRestRenderResult = {
  emberGlow: Phaser.GameObjects.Container;
  successGlow: Phaser.GameObjects.Container;
};

export class SketchRenderer {
  constructor(private readonly scene: Phaser.Scene) {}

  draw(layout: SketchLayout, width: number, height: number): CampfireRestRenderResult {
    switch (layout) {
      case 'campfireRest':
        return this.drawCampfireRest(width, height);
    }
  }

  private drawCampfireRest(width: number, height: number): CampfireRestRenderResult {
    const base = this.scene.add.graphics();
    this.drawBackground(base, width, height);
    this.drawLogSeat(base, width * 0.5, height * 0.8);
    this.drawBackSilhouette(base, width * 0.43, height * 0.76, 1.06, 0x141312);
    this.drawBackSilhouette(base, width * 0.62, height * 0.75, 1.14, 0x11100f);
    this.drawBlanket(base, width * 0.46, height * 0.705);
    this.drawCampfire(base, width * 0.52, height * 0.76);

    const dim = this.scene.add.graphics();
    dim.fillStyle(0x000000, 0.6);
    dim.fillRect(0, 0, width, height);

    const emberGlow = this.scene.add.container(width * 0.52, height * 0.76);
    emberGlow.add(this.createGlow(260, 0.2));
    emberGlow.add(this.createGlow(120, 0.2));
    emberGlow.setBlendMode(Phaser.BlendModes.ADD);

    const successGlow = this.scene.add.container(width * 0.52, height * 0.76);
    successGlow.add(this.createGlow(420, 0.16));
    successGlow.add(this.createGlow(240, 0.18));
    successGlow.setAlpha(0);
    successGlow.setBlendMode(Phaser.BlendModes.ADD);

    const foreground = this.scene.add.graphics();
    this.drawCampfire(foreground, width * 0.52, height * 0.76, 0.72);

    return { emberGlow, successGlow };
  }

  private drawBackground(g: Phaser.GameObjects.Graphics, width: number, height: number) {
    g.fillGradientStyle(0x050403, 0x050403, 0x140b06, 0x090604, 1);
    g.fillRect(0, 0, width, height);

    g.fillStyle(0x120b06, 1);
    g.fillRect(0, height * 0.66, width, height * 0.34);

    g.lineStyle(1, 0x3b2415, 0.26);
    g.lineBetween(0, height * 0.675, width, height * 0.675);

    g.lineStyle(2, 0x28170d, 0.22);
    for (let i = 0; i < 8; i += 1) {
      const y = height * (0.7 + i * 0.04);
      g.lineBetween(width * (0.08 + i * 0.03), y, width * (0.95 - i * 0.02), y + height * 0.025);
    }
  }

  private drawLogSeat(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x241307, 1);
    g.fillRoundedRect(x - 122, y - 10, 244, 25, 11);
    g.lineStyle(1, 0x5a3217, 0.42);
    g.lineBetween(x - 106, y, x + 106, y + 2);
  }

  private drawBackSilhouette(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number, color: number) {
    g.fillStyle(color, 0.98);
    g.fillEllipse(x, y - 47 * scale, 28 * scale, 31 * scale);
    g.beginPath();
    g.moveTo(x - 22 * scale, y - 32 * scale);
    g.lineTo(x + 22 * scale, y - 32 * scale);
    g.lineTo(x + 34 * scale, y + 16 * scale);
    g.lineTo(x - 34 * scale, y + 16 * scale);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x6b3a16, 0.16);
    g.lineBetween(x - 17 * scale, y - 28 * scale, x - 25 * scale, y + 8 * scale);
    g.lineBetween(x + 17 * scale, y - 28 * scale, x + 25 * scale, y + 8 * scale);
  }

  private drawBlanket(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x3d3934, 0.62);
    g.fillEllipse(x, y, 82, 25);
  }

  private drawCampfire(g: Phaser.GameObjects.Graphics, x: number, y: number, alpha = 1) {
    g.fillStyle(0x2b1507, alpha);
    g.fillRoundedRect(x - 34, y - 4, 68, 10, 5);
    g.fillStyle(0xff4a00, 0.88 * alpha);
    g.fillTriangle(x - 18, y, x + 18, y, x, y - 49);
    g.fillStyle(0xffc15a, 0.84 * alpha);
    g.fillTriangle(x - 9, y, x + 9, y, x, y - 31);
  }

  private createGlow(radius: number, alpha: number) {
    const glow = this.scene.add.graphics();
    for (let i = 5; i >= 1; i -= 1) {
      glow.fillStyle(0xff7a18, alpha / (i * 1.8));
      glow.fillCircle(0, 0, (radius / 5) * i);
    }
    return glow;
  }
}
