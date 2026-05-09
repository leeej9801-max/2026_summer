import Phaser from 'phaser';
import { StoryFlowManager } from '../systems/StoryFlowManager.ts';
import { CharacterPose, CutsceneShot, SceneObject, StoryNode } from '../types/story.types.ts';
import { createCaptionBox } from '../ui/createCaptionBox.ts';

const isDevBuild = () => (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;
const STAGE_5_ONLY_OBJECT_KEYS = new Set(['campfire', 'waitingFigureBack']);

export class RoadScene extends Phaser.Scene {
  private flowManager: StoryFlowManager;
  private mainLayer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;
  private currentNode!: StoryNode;
  private shotIndex = 0;
  private isTransitioning = false;
  private autoTimer?: Phaser.Time.TimerEvent;
  private characterContainer?: Phaser.GameObjects.Container;
  private activeShotTweens = new Set<Phaser.Tweens.Tween>();
  private ambientCharacterTweens: Phaser.Tweens.Tween[] = [];

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
    if (
      this.currentNode.nodeType === 'interaction' ||
      this.currentNode.nodeType === 'routePuzzle' ||
      this.currentNode.nodeType === 'puzzle'
    ) {
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
    this.clearShotTweens(false);

    const hasCharacter = this.hasCharacter(shot);
    const previousShot = this.currentNode.shots?.[this.shotIndex - 1];
    const shouldReuseCharacter = Boolean(animate && hasCharacter && previousShot && this.hasCharacter(previousShot) && this.characterContainer);

    if (shouldReuseCharacter && this.characterContainer) {
      this.mainLayer.remove(this.characterContainer, false);
    } else {
      this.destroyCharacterContainer();
    }

    this.mainLayer.removeAll(true);
    this.fxLayer.removeAll(true);
    this.uiLayer.removeAll(true);
    this.cameras.main.setZoom(shot.camera?.zoom || 1);
    this.cameras.main.centerOn(this.cameras.main.width / 2 + (shot.camera?.panX || 0), this.cameras.main.height / 2 + (shot.camera?.panY || 0));

    this.drawEnvironment(shot);
    shot.objects?.forEach((object) => this.drawSceneObject(object));
    if (hasCharacter && shot.characterPose) {
      this.placeCharacter(shot, shouldReuseCharacter);
    }
    this.drawCenterFocusOverlay();
    this.applyCameraCue(shot);
    this.uiLayer.add(createCaptionBox(this, shot.caption, this.cameras.main.width, this.cameras.main.height));
    this.drawShotCounter();

    if (animate || shot.camera?.fade === 'in') {
      this.cameras.main.fadeIn(450, 0, 0, 0);
    }

    if (shot.autoNext) {
      const durationMs = shot.durationMs || 1800;
      this.autoTimer = this.time.delayedCall(durationMs, () => this.handleNextShot(false));
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

    if (!bg.includes('campfire')) {
      g.lineStyle(1, bg.includes('cold') ? 0x282848 : 0x252525, 0.8);
      g.lineBetween(0, height * 0.68, width, height * 0.68);
      g.lineStyle(2, bg.includes('cold') ? 0x1d1d38 : 0x1f1f1f, 0.8);
      g.lineBetween(width * 0.38, height, width * 0.48, height * 0.68);
      g.lineBetween(width * 0.66, height, width * 0.56, height * 0.68);
    }

    this.mainLayer.add(g);
  }

  private drawSceneObject(object: SceneObject) {
    if (!this.shouldRenderSceneObject(object)) {
      return;
    }

    const { width, height } = this.cameras.main;
    const x = object.x * width;
    const y = object.y * height;
    const scale = (object.scale || 1) * this.getPresentationScale(object.key);
    const alpha = object.alpha ?? 1;
    const g = this.add.graphics().setAlpha(alpha);

    switch (object.key) {
      case 'distantLightTiny':
        this.drawLight(g, x, y, 4 * scale, 0.42);
        break;
      case 'distantLightFaint':
        this.drawLight(g, x, y, 7 * scale, 0.6);
        break;
      case 'distantLightClear':
        this.drawLight(g, x, y, 12 * scale, 0.85);
        break;
      case 'distantLightStrong':
        this.drawLight(g, x, y, 18 * scale, 1);
        break;
      case 'oldDoorClosed':
      case 'oldDoorFaded':
      case 'oldDoorOpen':
        this.drawOldDoor(g, x, y, object.key, scale);
        break;
      case 'glamourDoorClosed':
      case 'glamourDoorFaded':
      case 'glamourDoorOpen':
        this.drawGlamourDoor(g, x, y, object.key, scale);
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
        this.drawStormLines(g, width, height);
        break;
      case 'campfire':
        this.drawCampfire(g, x, y);
        break;
      case 'waitingFigureBack':
        this.drawWaitingFigure(g, x, y);
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

  private shouldRenderSceneObject(object: SceneObject) {
    if (!STAGE_5_ONLY_OBJECT_KEYS.has(object.key)) {
      return true;
    }

    return this.currentNode.stageId === 'stage-5';
  }

  private getPresentationScale(key: string) {
    if (key.includes('Door')) return 1.18;
    if (key.includes('Light')) return 1.25;
    if (['campfire', 'waitingFigureBack', 'burningNamesCold'].includes(key)) return 1.16;
    return 1;
  }

  private drawLight(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, alpha: number) {
    for (let i = 4; i >= 1; i -= 1) {
      g.fillStyle(0xff6a00, alpha / (i * 2.2));
      g.fillCircle(x, y, size * i);
    }
    g.fillStyle(0xfff3c4, alpha);
    g.fillCircle(x, y, Math.max(2, size * 0.45));
  }

  private drawOldDoor(g: Phaser.GameObjects.Graphics, x: number, y: number, key: string, scale: number) {
    const a = key === 'oldDoorFaded' ? 0.28 : 1;
    const open = key === 'oldDoorOpen';
    g.lineStyle(2, 0x595959, a);
    g.fillStyle(0x090909, 0.95 * a);
    g.fillRect(x - 38 * scale, y - 120 * scale, 76 * scale, 120 * scale);
    g.strokeRect(x - 38 * scale, y - 120 * scale, 76 * scale, 120 * scale);
    if (open) {
      g.fillStyle(0xffffff, 0.08);
      g.fillRect(x - 22 * scale, y - 110 * scale, 44 * scale, 106 * scale);
    }
  }

  private drawGlamourDoor(g: Phaser.GameObjects.Graphics, x: number, y: number, key: string, scale: number) {
    const a = key === 'glamourDoorFaded' ? 0.24 : 0.95;
    const open = key === 'glamourDoorOpen';
    g.lineStyle(4, 0x6d5cff, a);
    g.fillStyle(0x050611, 0.98);
    g.fillRect(x - 48 * scale, y - 145 * scale, 96 * scale, 145 * scale);
    g.strokeRect(x - 48 * scale, y - 145 * scale, 96 * scale, 145 * scale);
    g.lineStyle(1, 0x73d9ff, a * 0.8);
    g.strokeRect(x - 58 * scale, y - 155 * scale, 116 * scale, 165 * scale);
    if (open) {
      g.fillStyle(0x6d5cff, 0.18);
      g.fillRect(x - 35 * scale, y - 132 * scale, 70 * scale, 128 * scale);
    }
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

  private drawStormLines(g: Phaser.GameObjects.Graphics, width: number, height: number) {
    g.lineStyle(2, 0xddddff, 0.12);
    for (let i = 0; i < 24; i += 1) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      g.lineBetween(x1, y1, x1 + 180, y1 + (Math.random() - 0.5) * 90);
    }
  }

  private drawCampfire(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0xff4a00, 1);
    g.fillTriangle(x - 18, y, x + 18, y, x, y - 48);
    g.fillStyle(0xffc15a, 0.95);
    g.fillTriangle(x - 9, y, x + 9, y, x, y - 30);
    g.fillStyle(0x2b1507, 1);
    g.fillRoundedRect(x - 30, y - 3, 60, 9, 4);
  }

  private drawWaitingFigure(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x242424, 1);
    g.fillCircle(x, y - 48, 14);
    g.beginPath();
    g.moveTo(x - 24, y - 34);
    g.lineTo(x + 24, y - 34);
    g.lineTo(x + 32, y + 12);
    g.lineTo(x - 32, y + 12);
    g.closePath();
    g.fill();
  }

  private hasCharacter(shot?: CutsceneShot) {
    return Boolean(shot?.characterPose && shot.characterPose !== 'none');
  }

  private getCharacterPosition(shot: CutsceneShot) {
    const { width, height } = this.cameras.main;
    return {
      x: (shot.characterX || 0.5) * width,
      y: (shot.characterY || 0.72) * height,
      scale: shot.characterScale || 1,
    };
  }

  private placeCharacter(shot: CutsceneShot, reuseCharacter: boolean) {
    if (!shot.characterPose || shot.characterPose === 'none') return;

    const { x, y, scale } = this.getCharacterPosition(shot);
    const duration = this.getShotMotionDuration(shot);

    if (!this.characterContainer) {
      this.characterContainer = this.add.container(x, y);
    }

    const char = this.characterContainer;
    this.configureCharacterBody(char, shot.characterPose);
    char.setScale(scale);
    char.setAlpha(1);
    this.mainLayer.add(char);

    if (this.hasSpecialPoseMotion(shot)) {
      this.applyPoseEntranceMotion(shot, char, x, y, duration);
      return;
    }

    if (reuseCharacter) {
      this.trackShotTween(this.tweens.add({
        targets: char,
        x,
        y,
        scale,
        duration,
        ease: 'Sine.easeInOut',
      }));
    } else {
      char.setPosition(x, y);
    }
  }

  private getShotMotionDuration(shot: CutsceneShot) {
    if (shot.autoNext && shot.durationMs) return shot.durationMs;
    return 680;
  }

  private configureCharacterBody(char: Phaser.GameObjects.Container, pose: CharacterPose) {
    this.clearAmbientCharacterTweens();
    char.removeAll(true);
    char.setAngle(0);
    char.setAlpha(1);

    const head = this.add.graphics();
    const body = this.add.graphics();
    const legs = this.add.graphics();

    head.fillStyle(0xbdbdbd, 1);
    head.fillCircle(0, -46, 13);

    body.fillStyle(0xbdbdbd, 1);
    body.beginPath();
    body.moveTo(-18, -32);
    body.lineTo(18, -32);

    switch (pose) {
      case 'walk':
      case 'enterDoor':
      case 'exitDoor':
        body.lineTo(23, 6); body.lineTo(-18, 6); char.setAngle(pose === 'exitDoor' ? 7 : -6); break;
      case 'run':
        body.lineTo(28, 4); body.lineTo(-20, 4); char.setAngle(-16); break;
      case 'hesitate':
        body.lineTo(14, 8); body.lineTo(-18, 8); char.setAngle(8); break;
      case 'tired':
        body.lineTo(14, 10); body.lineTo(-16, 10); char.setAngle(18); break;
      case 'collapsed':
        body.lineTo(34, 8); body.lineTo(-34, 8); char.setAngle(86); break;
      case 'lookUp':
        body.lineTo(18, 12); body.lineTo(-16, 12); char.setAngle(-12); break;
      case 'rise':
        body.lineTo(20, 12); body.lineTo(-20, 12); char.setAngle(-4); break;
      case 'sitBack':
        body.lineTo(20, -4); body.lineTo(-20, -4); break;
      default:
        body.lineTo(18, 10); body.lineTo(-18, 10);
    }
    body.closePath();
    body.fill();

    legs.lineStyle(4, 0xbdbdbd, 1);
    if (pose === 'run') {
      legs.lineBetween(-10, 4, -30, 24);
      legs.lineBetween(10, 4, 32, 18);
    } else if (pose === 'walk' || pose === 'enterDoor' || pose === 'exitDoor') {
      legs.lineBetween(-8, 6, -22, 24);
      legs.lineBetween(8, 6, 22, 22);
    } else if (pose === 'collapsed') {
      legs.lineBetween(-28, 8, -52, 12);
      legs.lineBetween(24, 8, 48, 14);
    } else if (pose === 'sitBack') {
      legs.lineBetween(-12, -4, -28, 12);
      legs.lineBetween(12, -4, 30, 10);
    } else {
      legs.lineBetween(-8, 8, -16, 24);
      legs.lineBetween(8, 8, 16, 24);
    }

    char.add([legs, body, head]);

    if (pose === 'walk' || pose === 'run') {
      this.applyWalkCycle(body, legs, pose);
    }
  }

  private applyWalkCycle(body: Phaser.GameObjects.Graphics, legs: Phaser.GameObjects.Graphics, pose: CharacterPose) {
    const duration = pose === 'run' ? 180 : 260;
    this.ambientCharacterTweens.push(
      this.tweens.add({ targets: body, y: -3, duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }),
      this.tweens.add({ targets: legs, y: 3, angle: pose === 'run' ? 5 : 3, duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }),
    );
  }

  private hasSpecialPoseMotion(shot: CutsceneShot) {
    return shot.characterPose === 'enterDoor'
      || shot.characterPose === 'exitDoor'
      || shot.characterPose === 'collapsed'
      || shot.characterPose === 'rise'
      || shot.id.includes('oldDoorReturn')
      || shot.id.includes('glamourDoorReturn');
  }

  private applyPoseEntranceMotion(shot: CutsceneShot, char: Phaser.GameObjects.Container, x: number, y: number, duration: number) {
    switch (shot.characterPose) {
      case 'enterDoor':
        char.setPosition(x - 28, y);
        this.trackShotTween(this.tweens.add({ targets: char, x: x + 24, y: y - 24, alpha: 0.74, duration, ease: 'Sine.easeInOut' }));
        break;
      case 'exitDoor':
        char.setPosition(x + 32, y - 24);
        this.trackShotTween(this.tweens.add({ targets: char, x, y, alpha: 1, duration, ease: 'Sine.easeOut' }));
        break;
      case 'collapsed':
        char.y = y + 28;
        this.trackShotTween(this.tweens.add({ targets: char, y: y + 34, angle: 90, alpha: 0.86, duration: 140, yoyo: true, repeat: 1, ease: 'Quad.easeInOut' }));
        break;
      case 'rise':
        char.setPosition(x, y + 34);
        this.trackShotTween(this.tweens.add({ targets: char, y, duration: shot.autoNext ? duration : Math.max(duration, 1100), ease: 'Sine.easeOut' }));
        break;
      default:
        if (shot.id.includes('oldDoorReturn') || shot.id.includes('glamourDoorReturn')) {
          char.setPosition(x + 32, y - 24);
          this.trackShotTween(this.tweens.add({ targets: char, x, y, alpha: 1, duration, ease: 'Sine.easeOut' }));
        }
    }
  }

  private trackShotTween(tween: Phaser.Tweens.Tween) {
    this.activeShotTweens.add(tween);
    tween.once(Phaser.Tweens.Events.TWEEN_COMPLETE, () => {
      this.activeShotTweens.delete(tween);
    });
  }

  private completeShotTweens() {
    [...this.activeShotTweens].forEach((tween) => tween.complete());
    this.activeShotTweens.clear();
  }

  private clearShotTweens(complete: boolean) {
    if (complete) {
      this.completeShotTweens();
      return;
    }

    [...this.activeShotTweens].forEach((tween) => tween.remove());
    this.activeShotTweens.clear();
    this.clearAmbientCharacterTweens();
  }

  private clearAmbientCharacterTweens() {
    this.ambientCharacterTweens.forEach((tween) => tween.remove());
    this.ambientCharacterTweens = [];
  }

  private destroyCharacterContainer() {
    this.clearAmbientCharacterTweens();
    this.characterContainer?.destroy(true);
    this.characterContainer = undefined;
  }

  private drawCenterFocusOverlay() {
    const { width, height } = this.cameras.main;
    const g = this.add.graphics();
    const focusWidth = width * 0.68;
    const focusHeight = height * 0.58;
    const focusX = (width - focusWidth) / 2;
    const focusY = height * 0.16;

    g.fillStyle(0x000000, 0.2);
    g.fillRect(0, 0, width, focusY);
    g.fillRect(0, focusY + focusHeight, width, height - focusY - focusHeight);
    g.fillRect(0, focusY, focusX, focusHeight);
    g.fillRect(focusX + focusWidth, focusY, focusX, focusHeight);
    g.lineStyle(2, 0xffffff, 0.08);
    g.strokeRoundedRect(focusX, focusY, focusWidth, focusHeight, 28);

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

  private handleNextShot(completeTweens = true) {
    if (this.isTransitioning || this.currentNode.nodeType !== 'cutscene') return;
    if (completeTweens) {
      this.autoTimer?.remove(false);
      this.completeShotTweens();
    }
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
    this.clearShotTweens(false);
    this.destroyCharacterContainer();
    const next = this.flowManager.completeCurrentNode();
    this.cameras.main.fadeOut(450, 0, 0, 0, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress < 1) return;
      if (!next) return;
      if (
        next.nodeType === 'interaction' ||
        next.nodeType === 'routePuzzle' ||
        next.nodeType === 'puzzle'
      ) {
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
