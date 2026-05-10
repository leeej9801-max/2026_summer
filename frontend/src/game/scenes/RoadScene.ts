import Phaser from 'phaser';
import { SketchRenderer } from '../rendering/SketchRenderer.ts';
import { StoryFlowManager } from '../systems/StoryFlowManager.ts';
import { CharacterPose, CutsceneShot, PromptLine, SceneObject, StoryNode } from '../types/story.types.ts';
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
  private sketchRenderer!: SketchRenderer;

  constructor() {
    super('RoadScene');
    this.flowManager = StoryFlowManager.getInstance();
  }

  create() {
    this.isTransitioning = false;
    this.shotIndex = 0;
    this.autoTimer?.remove(false);

    const { width, height } = this.cameras.main;
    this.mainLayer = this.add.container(0, 0);
    this.fxLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    this.sketchRenderer = new SketchRenderer(this, this.mainLayer, this.fxLayer);

    this.currentNode = this.flowManager.getCurrentNode();
    this.routeByNodeType();

    const clickArea = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive()
      .setScrollFactor(0);
    clickArea.on('pointerdown', () => {
      console.log(`[RoadScene] Clicked. Current shot: ${this.shotIndex}, NodeType: ${this.currentNode.nodeType}, transitioning: ${this.isTransitioning}`);
      this.handleNextShot();
    });

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

    this.sketchRenderer.drawEnvironment(shot.backgroundKey);
    shot.objects?.forEach((object) => {
      if (this.shouldRenderSceneObject(object)) {
        this.sketchRenderer.drawSceneObject(object);
      }
    });
    if (hasCharacter && shot.characterPose) {
      this.placeCharacter(shot, shouldReuseCharacter);
    }
    // Overlay drawn by RoadScene to match fxLayer
    this.drawCenterFocusOverlay();
    this.applyCameraCue(shot);
    this.uiLayer.add(createCaptionBox(this, shot.caption, this.cameras.main.width, this.cameras.main.height));
    this.drawPromptLine(shot.prompt);
    this.drawShotCounter();

    if (animate || shot.camera?.fade === 'in') {
      this.cameras.main.fadeIn(450, 0, 0, 0);
    }

    if (shot.autoNext) {
      const durationMs = shot.durationMs || 1800;
      this.autoTimer = this.time.delayedCall(durationMs, () => this.handleNextShot(false));
    }
  }

  private drawPromptLine(prompt: PromptLine | undefined) {
    if (!prompt || prompt.text.trim() === '') return;

    const { width, height } = this.cameras.main;
    const container = this.add.container(0, 0);
    const isPanel = prompt.placement === 'panel';
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: isPanel ? '21px' : '24px',
      color: '#fff3d0',
      align: 'center',
      fontFamily: 'sans-serif',
      lineSpacing: 4,
      wordWrap: { width: isPanel ? 230 : 320 },
    };
    const label = this.add.text(0, 0, prompt.text, textStyle).setOrigin(0.5);
    const bounds = label.getBounds();
    const paddingX = isPanel ? 18 : 24;
    const paddingY = isPanel ? 12 : 14;
    const boxWidth = Math.max(bounds.width + paddingX * 2, isPanel ? 180 : 240);
    const boxHeight = Math.max(bounds.height + paddingY * 2, isPanel ? 48 : 54);
    const background = this.add.rectangle(0, 0, boxWidth, boxHeight, 0x17120a, isPanel ? 0.88 : 0.78)
      .setStrokeStyle(1, 0xf0d89a, isPanel ? 0.52 : 0.38);

    container.add([background, label]);

    if (prompt.placement === 'object') {
      container.setPosition((prompt.targetX ?? 0.66) * width, (prompt.targetY ?? 0.54) * height);
      const pointer = this.add.triangle(0, boxHeight / 2 + 9, -9, 0, 9, 0, 0, 14, 0xf0d89a, 0.46);
      container.add(pointer);
    } else if (prompt.placement === 'panel') {
      container.setPosition(width - boxWidth / 2 - 42, height * 0.28);
    } else {
      container.setPosition(width / 2, height - 156);
    }

    this.uiLayer.add(container);
  }

  private shouldRenderSceneObject(object: SceneObject) {
    if (!STAGE_5_ONLY_OBJECT_KEYS.has(object.key)) {
      return true;
    }

    return this.currentNode.stageId === 'stage-5';
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

    // Add Ground Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillEllipse(0, 18, 32, 8);
    char.add(shadow);

    const head = this.add.graphics();
    const body = this.add.graphics();
    const legs = this.add.graphics();

    head.fillStyle(0xbdbdbd, 1);
    head.fillCircle(0, -46, 13);
    head.lineStyle(1, 0x888888, 0.8);
    head.strokeCircle(0.5, -45.5, 13);

    body.fillStyle(0xbdbdbd, 1);
    body.beginPath();
    body.moveTo(-18, -32);
    body.lineTo(18, -32);

    switch (pose) {
      case 'walk':
      case 'enterDoor':
      case 'exitDoor':
        body.lineTo(23, 12); body.lineTo(-18, 12); char.setAngle(pose === 'exitDoor' ? 7 : -6); break;
      case 'run':
        body.lineTo(28, 12); body.lineTo(-20, 12); char.setAngle(-16); break;
      case 'hesitate':
        body.lineTo(14, 12); body.lineTo(-18, 12); char.setAngle(8); break;
      case 'tired':
        body.lineTo(14, 14); body.lineTo(-16, 14); char.setAngle(18); break;
      case 'collapsed':
        body.lineTo(34, 16); body.lineTo(-34, 16); char.setAngle(86); char.y += 28; break;
      case 'lookUp':
        body.lineTo(18, 18); body.lineTo(-16, 18); char.setAngle(-12); break;
      case 'rise':
        body.lineTo(20, 18); body.lineTo(-20, 18); char.setAngle(-4); break;
      case 'sitBack':
        body.lineTo(20, 2); body.lineTo(-20, 2); char.y += 14; break;
      default:
        body.lineTo(18, 16); body.lineTo(-18, 16);
    }
    body.closePath();
    body.fill();

    // Sketchy body outlines
    body.lineStyle(2, 0x555555, 0.9);
    body.strokePath();
    body.lineStyle(1, 0x777777, 0.5);
    body.strokePath();

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
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (!next) {
        this.isTransitioning = false;
        return;
      }

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
