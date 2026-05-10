import Phaser from 'phaser';

export type StoryStage = 'start' | 'firstDoor' | 'secondDoor' | 'storm' | 'campfire';

export class SketchWorldRenderer {
  public bgLayer!: Phaser.GameObjects.Container;
  public fieldLayer!: Phaser.GameObjects.Container;
  public fgLayer!: Phaser.GameObjects.Container;
  
  private tileW = 140; // Slightly reduced to fit more
  private tileH = 80;
  private originX!: number;
  private originY!: number;

  constructor(private scene: Phaser.Scene, private container: Phaser.GameObjects.Container) {
    const { width, height } = this.scene.cameras.main;
    this.originX = width / 2;
    // Move origin MUCH higher to avoid bottom cutoff
    this.originY = height * 0.35; 

    this.bgLayer = this.scene.add.container(0, 0);
    this.fieldLayer = this.scene.add.container(0, 0);
    this.fgLayer = this.scene.add.container(0, 0);
    
    this.container.add([this.bgLayer, this.fieldLayer, this.fgLayer]);
  }

  private isoToScreen(gridX: number, gridY: number, gridZ: number = 0) {
    const px = this.originX + (gridX - gridY) * (this.tileW / 2);
    const py = this.originY + (gridX + gridY) * (this.tileH / 2) - gridZ * 40;
    return { x: px, y: py };
  }

  private applyFX(image: Phaser.GameObjects.Image, tint = 0x888888, grayscale = 1) {
    image.setTint(tint);
    const anyImg = image as any;
    if (anyImg.preFX) {
      const cm = anyImg.preFX.addColorMatrix();
      if (grayscale > 0) cm.grayscale(grayscale);
      cm.brightness(1.15);
      cm.contrast(1.2);
    }
  }

  public clearWorld() {
    this.bgLayer.removeAll(true);
    this.fieldLayer.removeAll(true);
    this.fgLayer.removeAll(true);
  }

  public drawWorld(stage: StoryStage = 'start') {
    this.clearWorld();
    this.scene.cameras.main.setBackgroundColor('#000000');

    this.drawClouds();

    switch (stage) {
      case 'start':
        this.buildStartRoad();
        break;
      case 'firstDoor':
        this.buildFirstDoor();
        break;
      case 'secondDoor':
        this.buildSecondDoor();
        break;
      case 'storm':
        this.buildStormField();
        break;
      case 'campfire':
        this.buildCampfireField();
        break;
    }

    this.drawForeground();
  }

  private drawClouds() {
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.FloatBetween(50, this.scene.cameras.main.width - 50);
      const y = Phaser.Math.FloatBetween(20, 150);
      const cloud = this.scene.add.image(x, y, `cloud${Phaser.Math.Between(1, 4)}`);
      cloud.setScale(Phaser.Math.FloatBetween(1.0, 1.5));
      cloud.setAlpha(0.15);
      this.applyFX(cloud, 0x999999, 1);
      this.bgLayer.add(cloud);
    }
  }

  private buildStartRoad() {
    // Longer road centered vertically
    for (let i = 0; i < 12; i++) {
      const pos = this.isoToScreen(i - 5, 0, 0);
      const tile = this.scene.add.image(pos.x, pos.y, 'tile1');
      tile.setScale(0.9);
      this.applyFX(tile, 0x777777);
      this.fieldLayer.add(tile);

      if (Math.random() > 0.4) {
        const sidePos = this.isoToScreen(i - 5, 1, 0);
        const grass = this.scene.add.image(sidePos.x, sidePos.y, 'grass2');
        grass.setScale(0.7);
        this.applyFX(grass, 0x444444);
        this.fieldLayer.add(grass);
      }
    }
    const lightPos = this.isoToScreen(10, 0, 0.5);
    const light = this.scene.add.graphics();
    light.fillStyle(0xffa500, 1);
    light.fillCircle(lightPos.x, lightPos.y, 7);
    this.fieldLayer.add(light);
  }

  private buildFirstDoor() {
    for (let ix = -3; ix <= 3; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        const pos = this.isoToScreen(ix, iy, 0);
        const tile = this.scene.add.image(pos.x, pos.y, 'tile3');
        tile.setScale(0.9);
        this.applyFX(tile, 0x888888);
        this.fieldLayer.add(tile);
      }
    }

    const doorPos = this.isoToScreen(0, 0, 0);
    const door = this.scene.add.image(doorPos.x, doorPos.y - 55, 'door1');
    door.setScale(1.0);
    this.applyFX(door, 0xbbbbbb);
    this.fieldLayer.add(door);
    
    const stair = this.scene.add.image(doorPos.x - 70, doorPos.y + 15, 'stair1');
    stair.setScale(0.75);
    this.applyFX(stair, 0x999999);
    this.fieldLayer.add(stair);
  }

  private buildSecondDoor() {
    for (let ix = -3; ix <= 3; ix++) {
      for (let iy = -3; iy <= 3; iy++) {
        const basePos = this.isoToScreen(ix, iy, 0);
        const tile = this.scene.add.image(basePos.x, basePos.y, 'tile2');
        tile.setScale(0.9);
        this.applyFX(tile, 0x666666);
        this.fieldLayer.add(tile);

        if (Math.abs(ix) > 2 || Math.abs(iy) > 2) {
          const h = Phaser.Math.Between(1, 2);
          for (let z = 1; z <= h; z++) {
            const upPos = this.isoToScreen(ix, iy, z);
            const block = this.scene.add.image(upPos.x, upPos.y, 'tile2');
            block.setScale(0.9);
            this.applyFX(block, 0x555555);
            this.fieldLayer.add(block);
          }
        }
      }
    }
    const towerPos = this.isoToScreen(0, 0, 1.5);
    const tower = this.scene.add.image(towerPos.x, towerPos.y - 70, 'tower1');
    tower.setScale(1.4);
    this.applyFX(tower, 0xcccccc);
    this.fieldLayer.add(tower);
  }

  private buildStormField() {
    for (let i = 0; i < 50; i++) {
      const ix = Phaser.Math.Between(-5, 5);
      const iy = Phaser.Math.Between(-5, 5);
      const pos = this.isoToScreen(ix, iy, 0);
      const tile = this.scene.add.image(pos.x, pos.y, 'tile1');
      tile.setScale(0.9);
      tile.setAngle(Phaser.Math.Between(-20, 20));
      this.applyFX(tile, 0x333333);
      this.fieldLayer.add(tile);
    }
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.FloatBetween(100, 1180);
      const y = Phaser.Math.FloatBetween(300, 600);
      const rubble = this.scene.add.image(x, y, `rubble${Phaser.Math.Between(1, 2)}`);
      rubble.setScale(Phaser.Math.FloatBetween(0.7, 1.1));
      this.applyFX(rubble, 0x222222);
      this.fieldLayer.add(rubble);
    }
  }

  private buildCampfireField() {
    for (let ix = -3; ix <= 3; ix++) {
      for (let iy = -3; iy <= 3; iy++) {
        const pos = this.isoToScreen(ix, iy, 0);
        const tile = this.scene.add.image(pos.x, pos.y, 'tile1');
        tile.setScale(0.9);
        this.applyFX(tile, 0x888888);
        this.fieldLayer.add(tile);
      }
    }
    const firePos = this.isoToScreen(0, 0, 0);
    const fire = this.scene.add.image(firePos.x, firePos.y - 25, 'campfire1');
    fire.setScale(1.4);
    fire.setTint(0xffaa66);
    this.fieldLayer.add(fire);
    
    const tree = this.scene.add.image(firePos.x + 120, firePos.y - 100, 'tree1');
    tree.setScale(1.4);
    this.applyFX(tree, 0x555555);
    this.fieldLayer.add(tree);
  }

  private drawForeground() {
    for (let i = 0; i < 4; i++) {
      const x = (i / 3) * this.scene.cameras.main.width;
      const fg = this.scene.add.image(x, this.scene.cameras.main.height, 'twig1');
      fg.setScale(3.0);
      fg.setOrigin(0.5, 1);
      this.applyFX(fg, 0x030303);
      this.fgLayer.add(fg);
    }
  }

  public createCharacter(stage: StoryStage = 'start') {
    let gx = 0, gy = 0;
    if (stage === 'start') { gx = -4; gy = 0; }
    if (stage === 'campfire') { gx = 1; gy = 2; }
    
    const pos = this.isoToScreen(gx, gy, 0);
    const char = this.scene.add.container(pos.x, pos.y);
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 12, 40, 10);
    g.fillStyle(0xeeeeee, 1);
    g.fillCircle(0, -55, 16);
    g.lineStyle(2, 0x333333, 0.8);
    g.strokeCircle(0, -55, 16);
    g.beginPath();
    g.moveTo(-22, -38); g.lineTo(22, -38); g.lineTo(28, 10); g.lineTo(-28, 10);
    g.closePath(); g.fillPath(); g.strokePath();
    char.add(g);
    char.setScale(0.8);
    this.fieldLayer.add(char);
    return char;
  }

  public updateScroll(scrollX: number) {
    this.fieldLayer.x = -scrollX;
    this.bgLayer.x = -scrollX * 0.2;
    this.fgLayer.x = -scrollX * 1.4;
  }

  public drawCaption(text: string) {
    const { width } = this.scene.cameras.main;
    const label = this.scene.add.text(width / 2, 60, text, {
      fontSize: '28px', color: '#ffffff', fontFamily: 'serif', fontStyle: 'italic',
      stroke: '#000000', strokeThickness: 6, align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    this.container.add(label);
    label.setDepth(5000);
    return label;
  }
}
