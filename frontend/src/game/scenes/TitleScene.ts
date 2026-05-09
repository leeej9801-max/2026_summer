import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.text(width / 2, height / 2 - 100, 'THE ROAD', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, 'Who do you say I am?', {
      fontSize: '28px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    const startBtn = this.add.text(width / 2, height / 2 + 100, 'START JOURNEY', {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      this.scene.start('RoadScene');
    });

    startBtn.on('pointerover', () => startBtn.setStyle({ color: '#ffffff' }));
    startBtn.on('pointerout', () => startBtn.setStyle({ color: '#ffff00' }));
  }
}
