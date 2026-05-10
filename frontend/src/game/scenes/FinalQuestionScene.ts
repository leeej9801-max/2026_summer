import Phaser from 'phaser';
import { SketchRenderer } from '../rendering/SketchRenderer.ts';
import { ProgressManager } from '../systems/ProgressManager.ts';
import { createAnswerInput } from '../ui/createAnswerInput.ts';

export class FinalQuestionScene extends Phaser.Scene {
  private inputElement: Phaser.GameObjects.DOMElement | null = null;
  private resultText: Phaser.GameObjects.Text | null = null;
  private successGlow: Phaser.GameObjects.Container | null = null;
  private progress = ProgressManager.getInstance();

  constructor() {
    super('FinalQuestionScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const sketch = new SketchRenderer(this);
    const campfireRest = sketch.draw('campfireRest', width, height);
    this.successGlow = campfireRest.successGlow;

    this.cameras.main.fadeIn(2200, 0, 0, 0);

    this.add.text(width / 2, height * 0.255, 'WHO DO YOU SAY I AM?', {
      fontSize: '34px',
      color: '#f6efe8',
      fontFamily: 'serif',
      fontStyle: 'normal',
      letterSpacing: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff7a18', blur: 9, fill: true },
    }).setOrigin(0.5).setAlpha(0.86);

    this.add.text(width / 2, height * 0.315, '너는 나를 누구라 하느냐?', {
      fontSize: '18px',
      color: '#c7b6a4',
      fontFamily: 'serif',
      fontStyle: 'normal',
      letterSpacing: 1.4,
    }).setOrigin(0.5).setAlpha(0.78);

    this.inputElement = createAnswerInput(this, width / 2, height - 94, {
      placeholder: '고백을 입력하세요',
      buttonLabel: 'CONFESS',
      panelWidth: 356,
      inputWidth: 292,
      inputFontSize: 16,
      inputPadding: '10px 12px',
      buttonFontSize: 12,
      compact: true,
      onSubmit: (answer) => this.handleAnswer(answer),
    });

    this.resultText = this.add.text(width / 2, height * 0.48, '', {
      fontSize: '25px',
      color: '#fff3df',
      align: 'center',
      wordWrap: { width: 860 },
      fontFamily: 'serif',
      lineSpacing: 12,
    }).setOrigin(0.5);
  }

  private handleAnswer(answer: string) {
    const normalized = answer.trim().replace(/\s+/g, ' ').toLowerCase();
    const correctAnswers = ['그리스도', 'christ'];

    if (correctAnswers.includes(normalized)) {
      this.showSuccess();
    } else {
      this.cameras.main.shake(400, 0.003);
      this.resultText?.setText('불 앞의 정적이 다시 깊어집니다.').setColor('#8f8379').setFontSize(18).setAlpha(0.86);
    }
  }

  private showSuccess() {
    this.inputElement?.setVisible(false);
    this.progress.markGateSolved('final-confession');
    this.progress.markNodeComplete('final-confession');

    if (this.successGlow) {
      this.tweens.add({
        targets: this.successGlow,
        alpha: 0.88,
        scale: 1.16,
        duration: 2600,
        ease: 'Sine.easeOut',
      });
    }

    if (this.resultText) {
      this.resultText.setText('“주는 그리스도시요 살아 계신 하나님의 아들이시니이다”\n(마태복음 16:16)');
      this.resultText.setColor('#fff7e8');
      this.resultText.setFontSize(26);
      this.resultText.setScale(0.96);
      this.tweens.add({
        targets: this.resultText,
        alpha: 1,
        scale: 1,
        duration: 2400,
        ease: 'Sine.easeOut',
      });
    }
  }
}
