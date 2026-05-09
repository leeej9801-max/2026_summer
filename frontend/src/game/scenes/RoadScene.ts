import Phaser from 'phaser';
import { SceneFlowManager } from '../systems/SceneFlowManager.ts';
import { AssetKeys } from '../config/assetKeys.ts';
import { ScenarioStep, SceneObject } from '../types/scenario.types.ts';

export class RoadScene extends Phaser.Scene {
  private flowManager: SceneFlowManager;
  
  // Containers for organized drawing
  private bgLayer!: Phaser.GameObjects.Container;
  private objLayer!: Phaser.GameObjects.Container;
  private charLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;

  // UI Components
  private mainText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private logPrefix!: Phaser.GameObjects.Text;

  constructor() {
    super('RoadScene');
    this.flowManager = SceneFlowManager.getInstance();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Initialize Layers
    this.bgLayer = this.add.container(0, 0);
    this.objLayer = this.add.container(0, 0);
    this.charLayer = this.add.container(0, 0);
    this.fxLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    // Initial Render
    this.renderCurrentCut(false);

    // Global Click Area
    const clickArea = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive();
    clickArea.on('pointerdown', () => this.handleNext());

    // Reset Button (Minimal)
    const resetBtn = this.add.text(width - 20, 20, '[ SYSTEM_RESET ]', {
      fontSize: '12px',
      color: '#444444',
      fontFamily: 'monospace'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      this.flowManager.resetProgress();
      this.scene.restart();
    });
  }

  private renderCurrentCut(animate: boolean = true) {
    const step = this.flowManager.getCurrentStep();
    const { width, height } = this.cameras.main;

    // 1. Clear current scene content
    this.bgLayer.removeAll(true);
    this.objLayer.removeAll(true);
    this.charLayer.removeAll(true);
    this.fxLayer.removeAll(true);
    this.uiLayer.removeAll(true);

    // 2. Render Background
    this.drawBackground(step.backgroundKey);

    // 3. Render Objects
    if (step.objects) {
      step.objects.forEach(obj => this.drawObject(obj));
    }

    // 4. Render Character
    if (step.characterKey) {
      this.drawCharacter(step);
    }

    // 5. Render Effects
    if (step.effects) {
      step.effects.forEach(fx => this.applyEffect(fx));
    }

    // 6. Render UI (Text)
    this.drawUI(step);

    // Transition Animation
    if (animate) {
      this.cameras.main.fadeIn(500, 0, 0, 0);
    }
  }

  // --- Drawing Helpers ---

  private drawBackground(key: string) {
    const { width, height } = this.cameras.main;
    
    // Base Background (Gray/Dark)
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x111111);
    this.bgLayer.add(bg);

    // Road/Horizon Fallback
    const g = this.add.graphics();
    g.lineStyle(1, 0x333333);
    
    if (key === AssetKeys.Backgrounds.CampfireEmpty || key === AssetKeys.Backgrounds.CampfireFinal) {
      // Small clearing instead of road
      g.strokeCircle(width / 2, height * 0.75, width / 4);
    } else {
      // Perspective Road
      g.lineBetween(0, height * 0.7, width, height * 0.7); // Horizon
      g.lineBetween(width * 0.4, height * 0.7, 0, height); // Left edge
      g.lineBetween(width * 0.6, height * 0.7, width, height); // Right edge
    }
    this.bgLayer.add(g);
  }

  private drawObject(obj: SceneObject) {
    const { width, height } = this.cameras.main;
    const x = obj.x * width;
    const y = obj.y * height;
    const scale = obj.scale || 1.0;
    const alpha = obj.alpha !== undefined ? obj.alpha : 1.0;

    const container = this.add.container(x, y);
    container.setAlpha(alpha);

    // Fallback logic for objects
    const g = this.add.graphics();
    
    switch (obj.key) {
      case AssetKeys.Objects.DistantLight:
        // Glowing point
        for (let i = 0; i < 5; i++) {
          g.fillStyle(0xffaa44, 0.2 / (i + 1));
          g.fillCircle(0, 0, (10 + i * 10) * scale);
        }
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(0, 0, 5 * scale);
        break;

      case AssetKeys.Objects.OldDoor:
        g.lineStyle(2, 0x555555);
        g.strokeRect(-30 * scale, -60 * scale, 60 * scale, 120 * scale);
        g.fillStyle(0x222222, 0.8);
        g.fillRect(-30 * scale, -60 * scale, 60 * scale, 120 * scale);
        break;

      case AssetKeys.Objects.GlamourDoor:
        g.lineStyle(3, 0x9944ff); // Purplish outline
        g.strokeRect(-40 * scale, -80 * scale, 80 * scale, 160 * scale);
        g.fillStyle(0x000000, 0.6);
        g.fillRect(-40 * scale, -80 * scale, 80 * scale, 160 * scale);
        // Neon pulse effect (internal)
        this.tweens.add({
          targets: g,
          alpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
        break;

      case AssetKeys.Objects.Campfire:
        // Log
        g.fillStyle(0x442211, 1);
        g.fillRect(-20 * scale, 5 * scale, 40 * scale, 10 * scale);
        // Flame
        g.fillStyle(0xff6600, 0.8);
        g.beginPath();
        g.moveTo(-10 * scale, 0);
        g.lineTo(0, -30 * scale);
        g.lineTo(10 * scale, 0);
        g.closePath();
        g.fill();
        break;

      case AssetKeys.Objects.WaitingFigureBack:
        g.fillStyle(0x333333, 1);
        g.fillCircle(0, -40 * scale, 15 * scale); // Head
        g.beginPath();
        g.moveTo(-20 * scale, -25 * scale);
        g.lineTo(20 * scale, -25 * scale);
        g.lineTo(25 * scale, 20 * scale);
        g.lineTo(-25 * scale, 20 * scale);
        g.closePath();
        g.fill();
        break;

      case AssetKeys.Objects.Log:
        g.fillStyle(0x221100, 1);
        g.fillRect(-50 * scale, -10 * scale, 100 * scale, 20 * scale);
        break;

      case AssetKeys.Objects.Blanket:
        g.fillStyle(0x444444, 0.7);
        g.fillEllipse(0, 0, 40 * scale, 20 * scale);
        break;

      case AssetKeys.Objects.StormOverlay:
        g.lineStyle(1, 0xffffff, 0.2);
        for(let i=0; i<10; i++) {
          g.beginPath();
          g.moveTo(Math.random()*200 - 100, Math.random()*200 - 100);
          g.lineTo(Math.random()*200 - 100, Math.random()*200 - 100);
          g.strokePath();
        }
        break;
    }

    container.add(g);
    this.objLayer.add(container);
  }

  private drawCharacter(step: ScenarioStep) {
    const { width, height } = this.cameras.main;
    const x = (step.characterX || 0.5) * width;
    const y = (step.characterY || 0.7) * height;
    const scale = step.characterScale || 1.0;

    const char = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0xcccccc, 1);

    // Minimalist Character: Head + Cape/Body
    // Head
    g.fillCircle(0, -50 * scale, 18 * scale);
    
    // Body (Cape shape)
    g.beginPath();
    g.moveTo(-20 * scale, -35 * scale);
    g.lineTo(20 * scale, -35 * scale);
    
    switch (step.characterKey) {
      case AssetKeys.Characters.Tired:
        g.lineTo(15 * scale, 10 * scale);
        g.lineTo(-15 * scale, 10 * scale);
        char.setAngle(10); // Slouch
        break;
      case AssetKeys.Characters.Collapsed:
        g.lineTo(30 * scale, 15 * scale);
        g.lineTo(-30 * scale, 15 * scale);
        char.setAngle(80); // Lying down
        char.y += 30 * scale;
        break;
      case AssetKeys.Characters.SitBack:
        g.lineTo(20 * scale, 0);
        g.lineTo(-20 * scale, 0);
        break;
      case AssetKeys.Characters.Run:
        g.lineTo(25 * scale, 0);
        g.lineTo(-25 * scale, 0);
        char.setAngle(-15); // Leaning forward
        break;
      default: // Stand/Walk
        g.lineTo(22 * scale, 15 * scale);
        g.lineTo(-22 * scale, 15 * scale);
        break;
    }
    g.closePath();
    g.fill();

    if (step.characterFlipX) g.setScale(-1, 1);

    char.add(g);
    this.charLayer.add(char);
  }

  private applyEffect(fx: any) {
    switch (fx.type) {
      case 'shake':
        this.cameras.main.shake(1000, 0.005);
        break;
      case 'storm':
        // Custom noise logic could go here
        break;
      case 'warmLight':
        const rect = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 
          this.cameras.main.width, this.cameras.main.height, 0xffaa00, 0.05);
        this.fxLayer.add(rect);
        break;
    }
  }

  private drawUI(step: ScenarioStep) {
    const { width, height } = this.cameras.main;

    // Text Box (Subtle)
    const box = this.add.rectangle(width / 2, height - 60, width - 200, 80, 0x000000, 0.6);
    this.uiLayer.add(box);

    this.titleText = this.add.text(width / 2, height - 85, step.title, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'sans-serif'
    }).setOrigin(0.5);
    this.uiLayer.add(this.titleText);

    this.mainText = this.add.text(width / 2, height - 55, '', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 250 }
    }).setOrigin(0.5);
    this.uiLayer.add(this.mainText);

    // Typewriter
    let i = 0;
    this.time.addEvent({
      callback: () => {
        if (this.mainText) this.mainText.text += step.text[i++];
      },
      repeat: step.text.length - 1,
      delay: 20
    });
  }

  private handleNext() {
    if (this.flowManager.nextStep()) {
      this.renderCurrentCut(true);
    } else {
      // Transitions to Final Question after 2 seconds as requested
      this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0, (_camera: any, progress: number) => {
          if (progress === 1) {
            this.scene.start('FinalQuestionScene');
          }
        });
      });
    }
  }
}
