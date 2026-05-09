import Phaser from 'phaser';
import { AssetKeys } from '../config/assetKeys.ts';

export class FinalQuestionScene extends Phaser.Scene {
  private inputElement: Phaser.GameObjects.DOMElement | null = null;
  private resultText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('FinalQuestionScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 1. Background (Campfire) - Continuity from Cut 17
    // Using a simple fallback for the campfire background
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x050505);
    const g = this.add.graphics();
    g.fillStyle(0xffaa00, 0.1);
    g.fillCircle(width / 2, height / 2, 300);
    
    // 2. Fade In
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // 3. Question Text
    this.add.text(width / 2, height / 2 - 120, 'WHO DO YOU SAY I AM?', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'serif'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 70, '너는 나를 누구라 하느냐?', {
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5);

    // 4. HTML Input
    const htmlForm = `
      <div style="text-align: center;">
        <input type="text" name="answer" placeholder="..." 
          style="font-size: 20px; padding: 10px; width: 250px; border: none; border-bottom: 2px solid #555; background: transparent; color: #fff; text-align: center; outline: none; font-family: serif;">
        <br><br>
        <button type="button" name="submit" 
          style="font-size: 16px; padding: 8px 16px; cursor: pointer; background: transparent; color: #888; border: 1px solid #444; transition: 0.3s;">
          ENTER
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

    this.resultText = this.add.text(width / 2, height / 2 + 220, '', {
      fontSize: '22px',
      color: '#aaaaaa',
      align: 'center',
      wordWrap: { width: 800 },
      fontFamily: 'serif'
    }).setOrigin(0.5);
  }

  private handleAnswer(answer: string) {
    const normalized = answer.trim().toLowerCase();
    const correctAnswers = ['그리스도', 'christ'];
    
    if (correctAnswers.includes(normalized)) {
      this.showSuccess();
    } else {
      this.cameras.main.shake(300, 0.005);
      if (this.resultText) {
        this.resultText.setText('...');
      }
    }
  }

  private showSuccess() {
    if (this.inputElement) this.inputElement.setVisible(false);
    
    this.cameras.main.flash(2000, 255, 255, 255);

    if (this.resultText) {
      this.resultText.setText('“주는 그리스도시요 살아 계신 하나님의 아들이시니이다”\n(마태복음 16:16)');
      this.resultText.setColor('#ffffff');
      this.resultText.setFontSize(28);
    }

    this.time.addEvent({
      delay: 4000,
      callback: () => {
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 100, '그 길은 처음부터 당신을 기다리고 있었습니다.', {
          fontSize: '18px',
          color: '#444444',
          fontStyle: 'italic'
        }).setOrigin(0.5);
      }
    });
  }
}
