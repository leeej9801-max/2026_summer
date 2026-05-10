import Phaser from 'phaser';
import { SketchWorldRenderer } from '../render/SketchWorldRenderer.ts';
import { VerticalSliceFlow } from '../systems/VerticalSliceFlow.ts';

export class VerticalSliceScene extends Phaser.Scene {
  private flowStarted = false;

  constructor() {
    super('VerticalSliceScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    
    const container = this.add.container(0, 0);
    const renderer = new SketchWorldRenderer(this, container);
    const flow = new VerticalSliceFlow(this, renderer);
    
    // Initial Overlay to request Fullscreen (Browser requires user gesture)
    this.createStartOverlay(() => {
      if (!this.flowStarted) {
        this.flowStarted = true;
        flow.start();
        this.createFullScreenButton();
      }
    });
  }

  private createStartOverlay(onStart: () => void) {
    const { width, height } = this.scale;
    const overlay = this.add.container(0, 0);
    
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0);
    const text = this.add.text(width / 2, height / 2, 'THE ROAD : 길 위의 질문\n\n[ 화면을 클릭하여 시작 ]', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'serif',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    overlay.add([bg, text]);
    overlay.setDepth(20000);

    bg.setInteractive();
    bg.on('pointerdown', () => {
      // Trigger Fullscreen
      if (!this.scale.isFullscreen) {
        this.scale.startFullscreen();
      }
      
      this.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: 800,
        onComplete: () => {
          overlay.destroy();
          onStart();
        }
      });
    });
  }

  private createFullScreenButton() {
    const { width } = this.scale;
    const btn = this.add.container(width - 50, 40);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.2);
    bg.fillRoundedRect(-20, -20, 40, 40, 8);
    bg.lineStyle(2, 0xffffff, 0.5);
    bg.strokeRoundedRect(-20, -20, 40, 40, 8);

    const icon = this.add.graphics();
    icon.lineStyle(2, 0xffffff, 1);
    // Fullscreen icon bracket style
    icon.lineBetween(-12, -6, -12, -12);
    icon.lineBetween(-12, -12, -6, -12);
    icon.lineBetween(12, -6, 12, -12);
    icon.lineBetween(12, -12, 6, -12);
    icon.lineBetween(-12, 6, -12, 12);
    icon.lineBetween(-12, 12, -6, 12);
    icon.lineBetween(12, 6, 12, 12);
    icon.lineBetween(12, 12, 6, 12);

    btn.add([bg, icon]);
    btn.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });
    btn.on('pointerover', () => bg.alpha = 0.5);
    btn.on('pointerout', () => bg.alpha = 0.2);
    
    btn.setScrollFactor(0);
    btn.setDepth(10000);
  }
}
