import Phaser from 'phaser';
import { StoryFlowManager } from '../systems/StoryFlowManager.ts';
import type { CharacterPose, CutsceneShot, SceneObject, StoryNode } from '../types/story.types.ts';
import { createCaptionBox } from '../ui/createCaptionBox.ts';
import {
  drawCampfire,
  drawDistantLight,
  drawGlamourDoor,
  drawNotebookTexture,
  drawOldDoor,
  drawSketchCharacter,
  drawSketchRoad,
  drawStormOverlay,
  drawWaitingFigureBack,
} from '../render/SketchRenderer.ts';

const isDevBuild = () => (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

export class RoadScene extends Phaser.Scene {
  private flowManager: StoryFlowManager;
  private mainLayer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;
  private currentNode!: StoryNode;
  private shotIndex = 0;
  private isTransitioning = false;
  private autoTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('RoadScene');
    this.flowManager = StoryFlowManager.getInstance();
  }

  create() {
    this.mainLayer = this.add.container(0, 0);
    this.fxLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    this.currentNode = this.flowManager.getCurrentNode();
    this.routeByNodeType();

    const { width, height } = this.cameras.main;
    const clickArea = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0).setInteractive();
    clickArea.on('pointerdown', () => this.handleNextShot());

    const resetBtn = this.add.text(width - 10, height - 10, '•', {
      fontSize: '10px',
      color: '#252525',
      fontFamily: 'monospace',
    }).setOrigin(1, 1).setAlpha(0.42).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => this.resetProgressForOperator());
    this.input.keyboard?.on('keydown-R', (event: KeyboardEvent) => {
      if (event.shiftKey) this.resetProgressForOperator();
    });
  }

  private routeByNodeType() {
    if (this.currentNode.nodeType === 'interaction' || this.currentNode.nodeType === 'puzzle') {
      this.scene.start('InteractionScene');
      return;
    }

    if (this.currentNode.nodeType === 'final') {
      this.scene.start('FinalQuestionScene');
      return;
    }

    this.shotIndex = 0;
    this.renderCurrentShot(false);
  }

  private renderCurrentShot(animate = true) {
    const shot = this.currentNode.shots?.[this.shotIndex];
    if (!shot) {
      this.advanceNode();
      return;
    }

    this.autoTimer?.remove(false);
    this.mainLayer.removeAll(true);
    this.fxLayer.removeAll(true);
    this.uiLayer.removeAll(true);
    this.cameras.main.setZoom(shot.camera?.zoom || 1);
    this.cameras.main.centerOn(this.cameras.main.width / 2 + (shot.camera?.panX || 0), this.cameras.main.height / 2 + (shot.camera?.panY || 0));

    this.drawEnvironment(shot);
    shot.objects?.forEach((object) => this.drawSceneObject(object));
    if (shot.characterPose && shot.characterPose !== 'none') {
      this.drawCharacter(shot.characterPose, shot.characterX || 0.5, shot.characterY || 0.72, shot.characterScale || 1);
    }
    this.drawCenterFocusOverlay();
    this.applyCameraCue(shot);
    this.uiLayer.add(createCaptionBox(this, shot.caption, this.cameras.main.width, this.cameras.main.height));
    this.drawShotCounter();

    if (animate || shot.camera?.fade === 'in') {
      this.cameras.main.fadeIn(450, 0, 0, 0);
    }

    if (shot.autoNext) {
      this.autoTimer = this.time.delayedCall(shot.durationMs || 1800, () => this.handleNextShot());
    }
  }

  private drawEnvironment(shot: CutsceneShot) {
    const { width, height } = this.cameras.main;
    const g = this.add.graphics();
    const bg = shot.backgroundKey;

    const base = bg.includes('cold') || bg.includes('proof') ? 0x060711 : bg.includes('campfire') ? 0x090604 : bg.includes('storm') ? 0x030407 : 0x070707;
    g.fillStyle(base, 1);
    g.fillRect(0, 0, width, height);

    if (bg === 'quiet-room') {
      g.fillStyle(0x0f0f0f, 1);
      g.fillRect(width * 0.2, height * 0.22, width * 0.6, height * 0.56);
      g.lineStyle(1, 0x343434, 0.7);
      g.strokeRect(width * 0.2, height * 0.22, width * 0.6, height * 0.56);
    } else if (bg === 'proof-room') {
      g.lineStyle(2, 0x5b4bff, 0.28);
      for (let i = 0; i < 8; i += 1) {
        g.lineBetween(width * 0.18, height * (0.24 + i * 0.07), width * 0.82, height * (0.18 + i * 0.04));
      }
    } else if (bg === 'storm' || bg === 'collapse') {
      g.fillStyle(0x101010, 0.9);
      g.fillRect(0, height * 0.66, width, height * 0.34);
    } else if (bg === 'campfire') {
      g.fillStyle(0x120b06, 1);
      g.fillRect(0, height * 0.66, width, height * 0.34);
      for (let i = 4; i > 0; i -= 1) {
        g.fillStyle(0xff6a00, 0.045 * i);
        g.fillCircle(width * 0.52, height * 0.76, 70 * i);
      }
    } else {
      g.fillStyle(bg.includes('cold') ? 0x0d0d18 : 0x111111, 1);
      g.fillRect(0, height * 0.68, width, height * 0.32);
    }

    drawSketchRoad(g, width, height, bg.includes('campfire') ? 'campfire' : bg.includes('cold') ? 'cold' : 'neutral');
    drawNotebookTexture(g, width, height);

    this.mainLayer.add(g);
  }

  private drawSceneObject(object: SceneObject) {
    const { width, height } = this.cameras.main;
    const x = object.x * width;
    const y = object.y * height;
    const scale = (object.scale || 1) * this.getPresentationScale(object.key);
    const alpha = object.alpha ?? 1;
    const g = this.add.graphics().setAlpha(alpha);

    switch (object.key) {
      case 'distantLightTiny':
        drawDistantLight(g, x, y, 4 * scale, 0.42);
        break;
      case 'distantLightFaint':
        drawDistantLight(g, x, y, 7 * scale, 0.6);
        break;
      case 'distantLightClear':
        drawDistantLight(g, x, y, 12 * scale, 0.85);
        break;
      case 'distantLightStrong':
        drawDistantLight(g, x, y, 18 * scale, 1);
        break;
      case 'oldDoorClosed':
      case 'oldDoorFaded':
      case 'oldDoorOpen':
        drawOldDoor(g, x, y, object.key, scale);
        break;
      case 'glamourDoorClosed':
      case 'glamourDoorFaded':
      case 'glamourDoorOpen':
        drawGlamourDoor(g, x, y, object.key, scale);
        break;
      case 'emptyFrame':
        g.lineStyle(2, 0x3a3a3a, 0.8);
        g.strokeRect(x - 80, y - 45, 160, 90);
        break;
      case 'coldCards':
        this.drawColdCards(g, x, y);
        break;
      case 'floatingPapers':
        this.drawFloatingPapers(g, x, y);
        break;
      case 'burningNamesCold':
        g.fillStyle(0x705cff, 0.35);
        g.fillTriangle(x - 28, y + 20, x + 28, y + 20, x, y - 42);
        g.lineStyle(1, 0xa99cff, 0.8);
        g.strokeTriangle(x - 22, y + 18, x + 22, y + 18, x, y - 26);
        break;
      case 'stormLines':
        drawStormOverlay(g, width, height);
        break;
      case 'campfire':
        drawCampfire(g, x, y);
        break;
      case 'waitingFigureBack':
        drawWaitingFigureBack(g, x, y);
        break;
      case 'logSeat':
        g.fillStyle(0x261407, 1);
        g.fillRoundedRect(x - 115, y - 8, 230, 24, 10);
        break;
      case 'blanketGesture':
        g.fillStyle(0x4a443d, 0.78);
        g.fillEllipse(x, y, 74, 26);
        break;
      default:
        g.fillStyle(object.tint || 0x888888, 0.7);
        g.fillCircle(x, y, 12 * scale);
    }

    this.mainLayer.add(g);
  }

  private getPresentationScale(key: string) {
    if (key.includes('Door')) return 1.18;
    if (key.includes('Light')) return 1.25;
    if (['campfire', 'waitingFigureBack', 'burningNamesCold'].includes(key)) return 1.16;
    return 1;
  }

  private drawColdCards(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    ['성과', '비교', '스펙'].forEach((_, index) => {
      g.lineStyle(1, 0x77ccff, 0.55);
      g.strokeRect(x - 80 + index * 52, y - 22 + index * 8, 44, 28);
    });
  }

  private drawFloatingPapers(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    for (let i = 0; i < 9; i += 1) {
      const px = x - 180 + i * 45;
      const py = y - 70 + (i % 3) * 38;
      g.lineStyle(1, 0x9cc8ff, 0.4);
      g.strokeRect(px, py, 34, 46);
    }
  }

  private drawCharacter(pose: CharacterPose, xRatio: number, yRatio: number, scale: number) {
    const { width, height } = this.cameras.main;
    drawSketchCharacter(this, this.mainLayer, pose, xRatio * width, yRatio * height, scale);
  }

  private drawCenterFocusOverlay() {
    const { width, height } = this.cameras.main;
    const g = this.add.graphics();

    for (let i = 0; i < 5; i += 1) {
      g.lineStyle(18 + i * 10, 0x000000, 0.018);
      g.strokeEllipse(width / 2, height * 0.48, width * (0.96 - i * 0.05), height * (0.92 - i * 0.04));
    }

    g.fillStyle(0x000000, 0.035);
    g.fillRect(0, 0, width, height * 0.08);
    g.fillRect(0, height * 0.9, width, height * 0.1);

    this.fxLayer.add(g);
  }

  private applyCameraCue(shot: CutsceneShot) {
    if (shot.camera?.shake) {
      this.cameras.main.shake(650, 0.0035);
    }
  }

  private drawShotCounter() {
    if (!isDevBuild()) return;
    const total = this.currentNode.shots?.length || 1;
    const text = this.add.text(28, 24, `${this.currentNode.stageId.toUpperCase()}  ${this.shotIndex + 1}/${total}`, {
      fontSize: '12px',
      color: '#555555',
      fontFamily: 'monospace',
    });
    this.uiLayer.add(text);
  }

  private resetProgressForOperator() {
    this.flowManager.resetProgress();
    this.scene.restart();
  }

  private handleNextShot() {
    if (this.isTransitioning || this.currentNode.nodeType !== 'cutscene') return;
    const total = this.currentNode.shots?.length || 0;
    if (this.shotIndex < total - 1) {
      this.shotIndex += 1;
      this.renderCurrentShot(true);
      return;
    }
    this.advanceNode();
  }

  private advanceNode() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.autoTimer?.remove(false);
    const next = this.flowManager.completeCurrentNode();
    this.cameras.main.fadeOut(450, 0, 0, 0, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress < 1) return;
      if (!next) return;
      if (next.nodeType === 'interaction' || next.nodeType === 'puzzle') {
        this.scene.start('InteractionScene');
      } else if (next.nodeType === 'final') {
        this.scene.start('FinalQuestionScene');
      } else {
        this.isTransitioning = false;
        this.currentNode = next;
        this.shotIndex = 0;
        this.renderCurrentShot(false);
      }
    });
  }
}
