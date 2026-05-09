import Phaser from 'phaser';

export class FinalQuestionScene extends Phaser.Scene {
  private inputElement: Phaser.GameObjects.DOMElement | null = null;
  private resultText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('FinalQuestionScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 1. Background Continuity (Dim Campfire)
    this.add.rectangle(width / 2, height / 2, width, height, 0x050505);
    const glow = this.add.graphics();
    glow.fillStyle(0x1a0a00, 0.2);
    glow.fillCircle(width / 2, height / 2, 400);

    // 2. Slow Fade In
    this.cameras.main.fadeIn(2000, 0, 0, 0);

    // 3. Question
    this.add.text(width / 2, height / 2 - 130, 'WHO DO YOU SAY I AM?', {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'serif'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 80, '너는 나를 누구라 하느냐?', {
      fontSize: '18px',
      color: '#666666',
      fontFamily: 'serif'
    }).setOrigin(0.5);

    // 4. Input Form
    const htmlForm = `
      <div style="text-align: center;">
        <input type="text" name="answer" placeholder="..." 
          style="font-size: 22px; padding: 12px; width: 280px; border: none; border-bottom: 1px solid #333; background: transparent; color: #fff; text-align: center; outline: none; font-family: serif;">
        <br><br>
        <button type="button" name="submit" 
          style="font-size: 14px; padding: 10px 20px; cursor: pointer; background: transparent; color: #555; border: 1px solid #222; letter-spacing: 2px;">
          CONFESS
        </button>
      </div>
    `;

    this.inputElement = this.add.dom(width / 2, height / 2 + 60).createFromHTML(htmlForm);
    
    this.inputElement.addListener('click');
    this.inputElement.on('click', (event: any) => {
      if (event.target.name === 'submit') {
        const input = this.inputElement?.getChildByName('answer') as HTMLInputElement;
        if (input) {
          this.handleAnswer(input.value);
        }
      }
    });

    this.resultText = this.add.text(width / 2, height / 2 + 230, '', {
      fontSize: '20px',
      color: '#888888',
      align: 'center',
      wordWrap: { width: 800 },
      fontFamily: 'serif',
      lineSpacing: 10
    }).setOrigin(0.5);
  }

  private handleAnswer(answer: string) {
    const normalized = answer.trim().toLowerCase();
    const correctAnswers = ['그리스도', 'christ'];
    
    if (correctAnswers.includes(normalized)) {
      this.showSuccess();
    } else {
      this.cameras.main.shake(400, 0.003);
      if (this.resultText) {
        this.resultText.setText('...');
      }
    }
  }

  private showSuccess() {
    if (this.inputElement) this.inputElement.setVisible(false);
    
    this.cameras.main.flash(2500, 255, 255, 255);

    if (this.resultText) {
      this.resultText.setText('“주는 그리스도시요 살아 계신 하나님의 아들이시니이다”\n(마태복음 16:16)');
      this.resultText.setColor('#ffffff');
      this.resultText.setFontSize(26);
    }

    this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 80, '그 길은 처음부터 당신을 기다리고 있었습니다.', {
          fontSize: '16px',
          color: '#333333',
          fontStyle: 'italic'
        }).setOrigin(0.5);
      }
    });
  }
}
