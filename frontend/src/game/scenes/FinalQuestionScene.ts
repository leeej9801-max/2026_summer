import Phaser from 'phaser';
import { SketchRenderer } from '../renderers/SketchRenderer.ts';
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

  private drawDimCampfire(width: number, height: number) {
    const g = this.add.graphics();
    const campfireX = width * 0.52;
    const campfireY = height * 0.76;
    const figureX = width * 0.62;
    const figureY = height * 0.75;

    g.fillStyle(0x050403, 1);
    g.fillRect(0, 0, width, height);

    g.fillStyle(0x120b06, 1);
    g.fillRect(0, height * 0.66, width, height * 0.34);
    g.lineStyle(1, 0x2a211c, 0.42);
    g.lineBetween(0, height * 0.66, width, height * 0.66);

    for (let i = 5; i > 0; i -= 1) {
      g.fillStyle(0xff6a00, 0.018 * i);
      g.fillCircle(campfireX, campfireY, 72 * i);
    }

    g.lineStyle(1, 0x574333, 0.5);
    g.strokeEllipse(campfireX, campfireY + 5, 150, 34);
    g.strokeEllipse(figureX, figureY + 6, 72, 22);

    g.fillStyle(0x261407, 0.7);
    g.fillRoundedRect(width * 0.5 - 115, height * 0.8 - 8, 230, 24, 10);

    g.fillStyle(0xff4a00, 0.48);
    g.fillTriangle(campfireX - 18, campfireY, campfireX + 18, campfireY, campfireX, campfireY - 48);
    g.fillStyle(0xffc15a, 0.36);
    g.fillTriangle(campfireX - 9, campfireY, campfireX + 9, campfireY, campfireX, campfireY - 30);
    g.fillStyle(0x2b1507, 0.82);
    g.fillRoundedRect(campfireX - 30, campfireY - 3, 60, 9, 4);

    g.fillStyle(0x242424, 0.72);
    g.fillCircle(figureX, figureY - 48, 14);
    g.beginPath();
    g.moveTo(figureX - 24, figureY - 34);
    g.lineTo(figureX + 24, figureY - 34);
    g.lineTo(figureX + 16, figureY + 18);
    g.lineTo(figureX - 16, figureY + 18);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x6f5f51, 0.16);
    for (let i = 0; i < 15; i += 1) {
      const y = height * (0.12 + i * 0.052);
      g.lineBetween(width * 0.16, y, width * 0.84, y + ((i % 3) - 1) * 3);
    }

    g.fillStyle(0x000000, 0.68);
    g.fillRect(0, 0, width, height);
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8a1e', blur: 13, fill: true },
    }).setOrigin(0.5).setAlpha(0);
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
