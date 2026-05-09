import Phaser from 'phaser';
import { ProgressManager } from '../systems/ProgressManager.ts';
import { createAnswerInput } from '../ui/createAnswerInput.ts';

export class FinalQuestionScene extends Phaser.Scene {
  private inputElement: Phaser.GameObjects.DOMElement | null = null;
  private resultText: Phaser.GameObjects.Text | null = null;
  private progress = ProgressManager.getInstance();

  constructor() {
    super('FinalQuestionScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.drawDimCampfire(width, height);
    this.cameras.main.fadeIn(2200, 0, 0, 0);

    this.add.text(width / 2, height / 2 - 142, 'WHO DO YOU SAY I AM?', {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 90, '너는 나를 누구라 하느냐?', {
      fontSize: '19px',
      color: '#b7a99b',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.inputElement = createAnswerInput(this, width / 2, height / 2 + 52, {
      placeholder: '고백을 입력하세요',
      buttonLabel: 'CONFESS',
      onSubmit: (answer) => this.handleAnswer(answer),
    });

    this.resultText = this.add.text(width / 2, height / 2 + 220, '', {
      fontSize: '20px',
      color: '#888888',
      align: 'center',
      wordWrap: { width: 820 },
      fontFamily: 'serif',
      lineSpacing: 12,
    }).setOrigin(0.5);
  }

  private drawDimCampfire(width: number, height: number) {
    const g = this.add.graphics();
    g.fillStyle(0x050403, 1);
    g.fillRect(0, 0, width, height);
    for (let i = 5; i > 0; i -= 1) {
      g.fillStyle(0xff6a00, 0.025 * i);
      g.fillCircle(width / 2, height * 0.76, 90 * i);
    }
    g.fillStyle(0xff4a00, 0.55);
    g.fillTriangle(width / 2 - 14, height * 0.76, width / 2 + 14, height * 0.76, width / 2, height * 0.76 - 38);
    g.fillStyle(0x1b1b1b, 0.9);
    g.fillCircle(width * 0.6, height * 0.72, 13);
    g.fillRoundedRect(width * 0.6 - 24, height * 0.72 + 12, 48, 48, 12);
    g.fillStyle(0x000000, 0.62);
    g.fillRect(0, 0, width, height);
  }

  private handleAnswer(answer: string) {
    const normalized = answer.trim().replace(/\s+/g, ' ').toLowerCase();
    const correctAnswers = ['그리스도', 'christ'];

    if (correctAnswers.includes(normalized)) {
      this.showSuccess();
    } else {
      this.cameras.main.shake(400, 0.003);
      this.resultText?.setText('불 앞의 정적이 다시 깊어집니다.');
    }
  }

  private showSuccess() {
    this.inputElement?.setVisible(false);
    this.progress.markGateSolved('final-confession');
    this.progress.markNodeComplete('final-confession');

    this.cameras.main.flash(2200, 255, 245, 225);

    if (this.resultText) {
      this.resultText.setText('“주는 그리스도시요 살아 계신 하나님의 아들이시니이다”\n(마태복음 16:16)');
      this.resultText.setColor('#ffffff');
      this.resultText.setFontSize(26);
    }

    this.time.delayedCall(5200, () => {
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 82, '그 길은 처음부터 당신을 기다리고 있었습니다.', {
        fontSize: '16px',
        color: '#766b61',
        fontStyle: 'italic',
        fontFamily: 'serif',
      }).setOrigin(0.5);
    });
  }
}
