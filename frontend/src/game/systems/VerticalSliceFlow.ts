import Phaser from 'phaser';
import { SketchWorldRenderer, StoryStage } from '../render/SketchWorldRenderer.ts';
import { createSmallInteractionPrompt } from '../ui/SmallInteractionPrompt.ts';

export class VerticalSliceFlow {
  private charObj!: Phaser.GameObjects.Container;
  private caption!: Phaser.GameObjects.Text;
  private isWalking = false;

  constructor(private scene: Phaser.Scene, private renderer: SketchWorldRenderer) {}

  public async start() {
    // --- Phase 1: The Start ---
    await this.runStage('start', "길 위에 서 있다.", 3000);
    await this.showCaption("멀리 희미한 불빛이 보였다.");
    await this.delay(2000);
    this.hideCaption();

    // --- Phase 2: The First Door ---
    await this.runStage('firstDoor', "익숙한 문 앞에 멈췄다.", 4000);
    await this.showCaption("익숙했지만, 낯선 문이었다.");
    await this.delay(2000);
    this.hideCaption();

    const { container: promptContainer } = createSmallInteractionPrompt(
      this.scene,
      this.scene.cameras.main.width / 2 + 100,
      this.scene.cameras.main.height / 2 - 50,
      "첫 번째 질문에 답하세요.",
      (answer) => this.handleFirstAnswer(answer, promptContainer)
    );
  }

  private async runStage(stage: StoryStage, debugMsg: string, duration: number) {
    console.log(`[Flow] Entering stage: ${stage} - ${debugMsg}`);
    this.renderer.drawWorld(stage);
    this.charObj = this.renderer.createCharacter(stage);
    this.caption = this.renderer.drawCaption('');
    
    this.scene.cameras.main.fadeIn(1000, 0, 0, 0);
    await this.delay(1000);

    this.isWalking = true;
    const walkState = { x: 0 };
    this.scene.tweens.add({
      targets: walkState,
      x: 100,
      duration: duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.renderer.updateScroll(walkState.x);
        this.updateWalkJitter();
      },
      onComplete: () => {
        this.isWalking = false;
      }
    });
    await this.delay(duration);
  }

  private updateWalkJitter() {
    if (!this.isWalking) return;
    const jitter = Math.sin(this.scene.time.now / 120) * 2.5;
    this.charObj.y += jitter;
  }

  private async handleFirstAnswer(answer: string, promptContainer: Phaser.GameObjects.Container) {
    const valid = ['FAITH', 'faith', '확신'].includes(answer);
    if (!valid) {
      this.scene.cameras.main.shake(200, 0.005);
      return;
    }
    promptContainer.destroy();

    // --- Phase 3: The Storm ---
    this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
    await this.delay(1200);
    
    await this.runStage('storm', "폭풍 속에서 무너진다.", 5000);
    await this.showCaption("더는 걸을 수 없었다.");
    await this.delay(2500);
    this.hideCaption();

    // --- Phase 4: The Campfire (Ending) ---
    this.scene.cameras.main.fadeOut(1500, 0, 0, 0);
    await this.delay(1800);

    await this.runStage('campfire', "기다리는 분 앞에 도착했다.", 4000);
    await this.showCaption("처음부터 그분이 기다리고 계셨다.");
    await this.delay(3000);
    
    this.showEndScreen();
  }

  private showEndScreen() {
    const { width, height } = this.scene.cameras.main;
    const endText = this.scene.add.text(width / 2, height / 2, 'To be continued...', {
      fontSize: '36px', color: '#ffffff', fontFamily: 'serif', fontStyle: 'italic',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    const restartText = this.scene.add.text(width / 2, height / 2 + 80, 'Click to restart', {
      fontSize: '20px', color: '#aaaaaa', fontFamily: 'serif'
    }).setOrigin(0.5);

    this.scene.input.once('pointerdown', () => {
      this.scene.scene.restart();
    });
  }

  private async showCaption(text: string) {
    this.caption.setText(text);
    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this.caption,
        alpha: 1,
        y: this.caption.y - 10,
        duration: 800,
        onComplete: () => resolve()
      });
    });
  }

  private hideCaption() {
    this.scene.tweens.add({ targets: this.caption, alpha: 0, duration: 500 });
  }

  private delay(ms: number) {
    return new Promise<void>((resolve) => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
}
