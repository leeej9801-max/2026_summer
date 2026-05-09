import Phaser from 'phaser';
import { SceneFlowManager } from '../systems/SceneFlowManager.ts';
import { ScenarioStep } from '../types/scenario.types.ts';

export class RoadScene extends Phaser.Scene {
  private flowManager: SceneFlowManager;
  
  // Visual Layers (Redrawn every cut)
  private mainLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;

  // Persistence for state
  private isTransitioning: boolean = false;

  constructor() {
    super('RoadScene');
    this.flowManager = SceneFlowManager.getInstance();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Initialize Layers
    this.mainLayer = this.add.container(0, 0);
    this.fxLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    // Initial Render
    this.renderCurrentCut(false);

    // Global Click Handler
    const clickArea = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive();
    clickArea.on('pointerdown', () => this.handleNext());

    // Reset Button (Very Subtle)
    const resetBtn = this.add.text(width - 20, 20, '[ Reset ]', {
      fontSize: '11px',
      color: '#333333',
      fontFamily: 'monospace'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      this.flowManager.resetProgress();
      this.scene.restart();
    });
  }

  private renderCurrentCut(animate: boolean = true) {
    const step = this.flowManager.getCurrentStep();

    // 1. Clear everything for a fresh draw
    this.mainLayer.removeAll(true);
    this.fxLayer.removeAll(true);
    this.uiLayer.removeAll(true);

    // 2. Draw Background & Environment based on Mood
    this.drawEnvironment(step);

    // 3. Draw Static Objects (Doors, Light, Campfire)
    this.drawStaticObjects(step);

    // 4. Draw Character based on Pose
    if (step.characterPose && step.characterPose !== "none") {
      this.drawCharacter(step);
    }

    // 5. Apply Effects (Storm, Shake, etc.)
    this.applyEffects(step);

    // 6. Draw UI (Subtle Text)
    this.drawUI(step);

    // Fade in for each cut to give that "animatic" transition
    if (animate) {
      this.cameras.main.fadeIn(400, 0, 0, 0);
    }
  }

  private drawEnvironment(step: ScenarioStep) {
    const { width, height } = this.cameras.main;
    const g = this.add.graphics();
    
    // Default dark world
    g.fillStyle(0x0a0a0a, 1);
    g.fillRect(0, 0, width, height);

    // Horizon line
    g.lineStyle(1, 0x1a1a1a, 0.5);
    g.lineBetween(0, height * 0.7, width, height * 0.7);

    // Mood specific backgrounds
    if (step.sceneMood === "storm") {
      g.fillStyle(0x050505, 1);
      g.fillRect(0, 0, width, height);
    } else if (step.sceneMood === "campfire-rest") {
      // Small warm glow on ground
      const radial = this.add.graphics();
      radial.fillStyle(0x1a1000, 0.3);
      radial.fillCircle(width / 2, height * 0.75, 200);
      this.mainLayer.add(radial);
    }

    this.mainLayer.add(g);
  }

  private drawStaticObjects(step: ScenarioStep) {
    const { width, height } = this.cameras.main;
    const g = this.add.graphics();

    // 1. Distant Light (ONLY 주황색/흰색 허용)
    if (step.showDistantLight) {
      const lx = width * 0.85;
      const ly = height * 0.55;
      let size = 2;
      let alpha = 0.5;

      switch(step.distantLightStrength) {
        case "tiny": size = 3; alpha = 0.4; break;
        case "faint": size = 5; alpha = 0.6; break;
        case "clear": size = 8; alpha = 0.8; break;
        case "strong": size = 15; alpha = 1.0; break;
      }

      // Bloom effect
      for(let i=0; i<3; i++) {
        g.fillStyle(0xff6600, alpha / (i + 1));
        g.fillCircle(lx, ly, size * (i + 2));
      }
      g.fillStyle(0xffffff, 1);
      g.fillCircle(lx, ly, size * 0.5);
    }

    // 2. Old Door (Cut 4-5)
    if (step.showOldDoor) {
      const dx = width * 0.7;
      const dy = height * 0.7;
      g.lineStyle(1, 0x333333);
      g.strokeRect(dx - 30, dy - 100, 60, 100);
      g.fillStyle(0x000000, 0.8);
      g.fillRect(dx - 30, dy - 100, 60, 100);
      
      if (step.sceneMood === "door1-return") {
        g.setAlpha(0.3); // Fade out the door we just left
      }
    }

    // 3. Glamour Door (Cut 6-8)
    if (step.showGlamourDoor) {
      const dx = width * 0.7;
      const dy = height * 0.7;
      const moodColor = step.sceneMood === "door2-return" ? 0x222222 : 0x5500ff;
      g.lineStyle(2, moodColor, 0.8);
      g.strokeRect(dx - 40, dy - 130, 80, 130);
      g.fillStyle(0x000000, 0.9);
      g.fillRect(dx - 40, dy - 130, 80, 130);
      
      if (step.sceneMood === "door2") {
        // Subtle neon glow
        const glow = this.add.graphics();
        glow.lineStyle(4, 0x5500ff, 0.2);
        glow.strokeRect(dx - 45, dy - 135, 90, 140);
        this.mainLayer.add(glow);
      }
    }

    // 4. Campfire (Cut 16-17)
    if (step.showCampfire) {
      const cx = width / 2;
      const cy = height * 0.78;
      // Flame
      g.fillStyle(0xff4400, 1);
      g.fillTriangle(cx - 10, cy, cx + 10, cy, cx, cy - 25);
      g.fillStyle(0xffaa00, 0.8);
      g.fillTriangle(cx - 6, cy, cx + 6, cy, cx, cy - 15);
      
      // Logs
      g.fillStyle(0x221100, 1);
      g.fillRect(cx - 15, cy - 2, 30, 6);
    }

    // 5. Log Seat
    if (step.showLogSeat) {
      g.fillStyle(0x1a0d00, 1);
      g.fillRect(width / 2 - 100, height * 0.8, 200, 20);
    }

    // 6. Waiting Figure (BACK ONLY)
    if (step.showWaitingFigure) {
      const fx = width * 0.58;
      const fy = height * 0.8;
      g.fillStyle(0x222222, 1);
      // Head
      g.fillCircle(fx, fy - 45, 12);
      // Cape/Body
      g.beginPath();
      g.moveTo(fx - 20, fy - 35);
      g.lineTo(fx + 20, fy - 35);
      g.lineTo(fx + 25, fy);
      g.lineTo(fx - 25, fy);
      g.closePath();
      g.fill();
    }

    this.mainLayer.add(g);
  }

  private drawCharacter(step: ScenarioStep) {
    const { width, height } = this.cameras.main;
    const x = (step.characterX || 0.5) * width;
    const y = (step.characterY || 0.7) * height;
    
    const char = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0xbbbbbb, 1);

    // Minimalist: Circle Head + Cape Body
    g.fillCircle(0, -45, 14); // Head
    
    g.beginPath();
    g.moveTo(-18, -32);
    g.lineTo(18, -32);

    switch(step.characterPose) {
      case "walk":
      case "run":
        g.lineTo(22, 10);
        g.lineTo(-22, 10);
        char.setAngle(step.characterPose === "run" ? -15 : -5);
        break;
      case "tired":
      case "hesitate":
        g.lineTo(15, 12);
        g.lineTo(-15, 12);
        char.setAngle(15);
        break;
      case "collapsed":
        g.lineTo(30, 20);
        g.lineTo(-30, 20);
        char.setAngle(85);
        char.y += 25;
        break;
      case "lookUp":
        g.lineTo(15, 20);
        g.lineTo(-15, 20);
        char.setAngle(-10);
        break;
      case "sitBack":
        g.lineTo(18, 0);
        g.lineTo(-18, 0);
        char.y += 10;
        break;
      default: // stand
        g.lineTo(18, 15);
        g.lineTo(-18, 15);
        break;
    }
    g.closePath();
    g.fill();

    // Blanket Gesture
    if (step.showBlanketGesture) {
      g.fillStyle(0x333333, 0.6);
      g.fillEllipse(0, -10, 45, 25);
    }

    char.add(g);
    this.mainLayer.add(char);
  }

  private applyEffects(step: ScenarioStep) {
    const { width, height } = this.cameras.main;

    if (step.showStorm) {
      const stormG = this.add.graphics();
      stormG.lineStyle(1, 0xffffff, 0.1);
      for(let i=0; i<15; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        stormG.lineBetween(x1, y1, x1 + 100, y1 + (Math.random() - 0.5) * 50);
      }
      this.fxLayer.add(stormG);
      this.cameras.main.shake(1000, 0.003);
    }

    if (step.sceneMood === "collapse") {
      this.cameras.main.setAlpha(0.8);
    } else {
      this.cameras.main.setAlpha(1.0);
    }
  }

  private drawUI(step: ScenarioStep) {
    const { width, height } = this.cameras.main;

    const box = this.add.rectangle(width / 2, height - 60, width - 240, 70, 0x000000, 0.4);
    this.uiLayer.add(box);

    const txt = this.add.text(width / 2, height - 60, '', {
      fontSize: '17px',
      color: '#eeeeee',
      align: 'center',
      wordWrap: { width: width - 300 },
      fontFamily: 'sans-serif'
    }).setOrigin(0.5);
    this.uiLayer.add(txt);

    // Fast typewriter
    let i = 0;
    this.time.addEvent({
      callback: () => {
        if (txt) txt.text += step.text[i++];
      },
      repeat: step.text.length - 1,
      delay: 15
    });
  }

  private handleNext() {
    if (this.isTransitioning) return;

    if (this.flowManager.nextStep()) {
      this.renderCurrentCut(true);
    } else {
      // Final transition logic for Cut 17
      this.isTransitioning = true;
      this.time.delayedCall(2500, () => {
        this.cameras.main.fadeOut(1500, 0, 0, 0, (_camera: any, progress: number) => {
          if (progress === 1) {
            this.scene.start('FinalQuestionScene');
          }
        });
      });
    }
  }
}
