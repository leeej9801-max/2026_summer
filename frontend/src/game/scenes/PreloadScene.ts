import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const { width, height } = this.cameras.main;

    // Progress Bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading Assets...',
      style: { font: '20px monospace', color: '#ffffff' }
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load environment assets for Isometric Field
    this.load.image('tile1', 'assets/dote/tile1.png');
    this.load.image('tile2', 'assets/dote/tile2.png');
    this.load.image('tile3', 'assets/dote/tile3.png');
    this.load.image('stair1', 'assets/dote/stair1.png');
    this.load.image('stair2', 'assets/dote/stair2.png');
    this.load.image('stair3', 'assets/dote/stair3.png');
    this.load.image('stair4', 'assets/dote/stair4.png');
    this.load.image('tower1', 'assets/dote/tower1.png');
    this.load.image('clock1', 'assets/dote/clock1.png');
    this.load.image('grave1', 'assets/dote/grave1.png');
    this.load.image('grave2', 'assets/dote/grave2.png');
    this.load.image('tomb1', 'assets/dote/tomb1.png');
    this.load.image('tree1', 'assets/dote/tree1.png');
    this.load.image('tree2', 'assets/dote/tree2.png');
    this.load.image('tree3', 'assets/dote/tree3.png');
    this.load.image('tree4', 'assets/dote/tree4.png');
    this.load.image('tree5', 'assets/dote/tree5.png');
    this.load.image('cloud1', 'assets/dote/cloud1.png');
    this.load.image('cloud2', 'assets/dote/cloud2.png');
    this.load.image('cloud3', 'assets/dote/cloud3.png');
    this.load.image('cloud4', 'assets/dote/cloud4.png');
    this.load.image('bush1', 'assets/dote/bush1.png');
    this.load.image('bush2', 'assets/dote/bush2.png');
    this.load.image('bush3', 'assets/dote/bush3.png');
    this.load.image('bush4', 'assets/dote/bush4.png');
    this.load.image('twig1', 'assets/dote/twig1.png');
    this.load.image('twig2', 'assets/dote/twig2.png');
    this.load.image('vine1', 'assets/dote/vine1.png');
    this.load.image('rubble1', 'assets/dote/rubble1.png');
    this.load.image('rubble2', 'assets/dote/rubble2.png');
    this.load.image('rock1', 'assets/dote/rock1.png');
    this.load.image('door1', 'assets/dote/door1.png');
    this.load.image('campfire1', 'assets/dote/campfire1.png');
    this.load.image('stump1', 'assets/dote/stump1.png');
    this.load.image('house1', 'assets/dote/house1.png');
    this.load.image('house2', 'assets/dote/house2.png');
    this.load.image('grass1', 'assets/dote/grass1.png');
    this.load.image('grass2', 'assets/dote/grass2.png');
    this.load.image('grass3', 'assets/dote/grass3.png');
    this.load.image('puddle1', 'assets/dote/puddle1.png');
    this.load.image('puddle2', 'assets/dote/puddle2.png');
  }

  create() {
    this.scene.start('VerticalSliceScene');
  }
}
