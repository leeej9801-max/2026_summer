import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load minimal assets for loading screen if any (e.g. logo)
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
