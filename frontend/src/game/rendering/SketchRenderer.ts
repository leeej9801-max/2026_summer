import Phaser from 'phaser';
import { CharacterPose, CutsceneShot, SceneObject, StoryNode } from '../types/story.types.ts';

type SketchRendererOptions = {
  includeCharacter?: boolean;
  includeFocusOverlay?: boolean;
};

export type SketchLayout = 'campfireRest';

export class SketchRenderer {
  private targetLayer: Phaser.GameObjects.Container;

  constructor(
    private scene: Phaser.Scene,
    targetLayer?: Phaser.GameObjects.Container,
    private fxLayer?: Phaser.GameObjects.Container,
  ) {
    this.targetLayer = targetLayer ?? this.scene.add.container(0, 0);
  }

  public draw(layout: SketchLayout, width: number, height: number) {
    if (layout === 'campfireRest') {
      return this.drawCampfireRestLayout(width, height);
    }
    return { emberGlow: null, successGlow: null };
  }

  private drawCampfireRestLayout(width: number, height: number) {
    const base = this.scene.add.graphics();
    
    // Background
    base.fillGradientStyle(0x050403, 0x050403, 0x140b06, 0x090604, 1);
    base.fillRect(0, 0, width, height);
    base.fillStyle(0x120b06, 1);
    base.fillRect(0, height * 0.66, width, height * 0.34);
    base.lineStyle(1, 0x3b2415, 0.26);
    base.lineBetween(0, height * 0.675, width, height * 0.675);
    base.lineStyle(2, 0x28170d, 0.22);
    for (let i = 0; i < 8; i += 1) {
      const y = height * (0.7 + i * 0.04);
      base.lineBetween(width * (0.08 + i * 0.03), y, width * (0.95 - i * 0.02), y + height * 0.025);
    }

    // Log Seat
    base.fillStyle(0x241307, 1);
    base.fillRoundedRect(width * 0.5 - 122, height * 0.8 - 10, 244, 25, 11);
    base.lineStyle(1, 0x5a3217, 0.42);
    base.lineBetween(width * 0.5 - 106, height * 0.8, width * 0.5 + 106, height * 0.8 + 2);

    // Silhouettes
    const drawSil = (x: number, y: number, scale: number, color: number) => {
      base.fillStyle(color, 0.98);
      base.fillEllipse(x, y - 47 * scale, 28 * scale, 31 * scale);
      base.beginPath();
      base.moveTo(x - 22 * scale, y - 32 * scale);
      base.lineTo(x + 22 * scale, y - 32 * scale);
      base.lineTo(x + 34 * scale, y + 16 * scale);
      base.lineTo(x - 34 * scale, y + 16 * scale);
      base.closePath();
      base.fillPath();
    };
    drawSil(width * 0.43, height * 0.76, 1.06, 0x141312);
    drawSil(width * 0.62, height * 0.75, 1.14, 0x11100f);

    // Blanket
    base.fillStyle(0x3d3934, 0.62);
    base.fillEllipse(width * 0.46, height * 0.705, 82, 25);

    // Campfire Base
    this.drawCampfire(base, width * 0.52, height * 0.76);

    this.targetLayer.add(base);

    // Dim
    const dim = this.scene.add.graphics();
    dim.fillStyle(0x000000, 0.6);
    dim.fillRect(0, 0, width, height);
    this.targetLayer.add(dim);

    // Glows
    const emberGlow = this.scene.add.container(width * 0.52, height * 0.76);
    emberGlow.add(this.createGlow(260, 0.2));
    emberGlow.add(this.createGlow(120, 0.2));
    emberGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.targetLayer.add(emberGlow);

    const successGlow = this.scene.add.container(width * 0.52, height * 0.76);
    successGlow.add(this.createGlow(420, 0.16));
    successGlow.add(this.createGlow(240, 0.18));
    successGlow.setAlpha(0);
    successGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.targetLayer.add(successGlow);

    // Foreground Campfire
    const foreground = this.scene.add.graphics();
    this.drawCampfire(foreground, width * 0.52, height * 0.76, 0.72);
    this.targetLayer.add(foreground);

    return { emberGlow, successGlow };
  }

  private createGlow(radius: number, alpha: number) {
    const glow = this.scene.add.graphics();
    for (let i = 5; i >= 1; i -= 1) {
      glow.fillStyle(0xff7a18, alpha / (i * 1.8));
      glow.fillCircle(0, 0, (radius / 5) * i);
    }
    return glow;
  }


  public renderShot(shot: CutsceneShot, options: SketchRendererOptions = {}) {
    const includeCharacter = options.includeCharacter ?? true;
    this.drawEnvironment(shot.backgroundKey);
    shot.objects?.forEach((object) => this.drawSceneObject(object));
    if (includeCharacter && shot.characterPose && shot.characterPose !== 'none') {
      this.drawCharacter(shot.characterPose, shot.characterX || 0.5, shot.characterY || 0.72, shot.characterScale || 1);
    }
    if (options.includeFocusOverlay) this.drawCenterFocusOverlay();
  }

  public renderInteractionBackdrop(node: StoryNode): { gateX: number; gateY: number; inputX: number; inputY: number } {
    const { width, height } = this.scene.cameras.main;
    const cold = node.stageId === 'stage-2' || node.stageId === 'stage-4';
    const backgroundKey = cold ? 'road-cold' : node.stageId === 'stage-3' ? 'collapse' : 'road';

    this.drawEnvironment(backgroundKey);

    if (node.stageId === 'stage-1') {
      this.drawSceneObject({ key: 'oldDoorClosed', x: 0.69, y: 0.67 });
      return { gateX: width * 0.35, gateY: height * 0.42, inputX: width * 0.35, inputY: height * 0.42 };
    }

    if (node.stageId === 'stage-2') {
      this.drawSceneObject({ key: 'glamourDoorClosed', x: 0.7, y: 0.65 });
      this.drawSceneObject({ key: 'coldCards', x: 0.58, y: 0.4 });
      return { gateX: width * 0.35, gateY: height * 0.42, inputX: width * 0.35, inputY: height * 0.42 };
    }

    if (node.stageId === 'stage-3') {
      this.drawSceneObject({ key: 'distantLightClear', x: 0.84, y: 0.48 });
      return { gateX: width * 0.5, gateY: height * 0.42, inputX: width * 0.5, inputY: height * 0.42 };
    }

    if (node.stageId === 'stage-4') {
      this.drawSceneObject({ key: 'distantLightStrong', x: 0.84, y: 0.48 });
      return { gateX: width * 0.5, gateY: height * 0.44, inputX: width * 0.5, inputY: height * 0.44 };
    }

    this.drawSceneObject({ key: 'distantLightTiny', x: 0.84, y: 0.48 });
    return { gateX: width * 0.5, gateY: height * 0.42, inputX: width * 0.5, inputY: height * 0.42 };
  }

  public drawEnvironment(backgroundKey: string) {
    const { width, height } = this.scene.cameras.main;
    const g = this.scene.add.graphics();
    const bg = backgroundKey;

    const base = bg.includes('cold') || bg.includes('proof') ? 0x060711 : bg.includes('campfire') ? 0x090604 : bg.includes('storm') ? 0x030407 : 0x070707;
    g.fillStyle(base, 1);
    g.fillRect(0, 0, width, height);

    if (bg === 'quiet-room') {
      g.fillStyle(0x0f0f0f, 1);
      g.fillRect(width * 0.2, height * 0.22, width * 0.6, height * 0.56);
      g.lineStyle(1, 0x343434, 0.7);
      // Sketchy rect
      g.strokeRect(width * 0.2, height * 0.22, width * 0.6, height * 0.56);
      g.strokeRect(width * 0.2 - 2, height * 0.22 + 1, width * 0.6 + 1, height * 0.56 - 2);
    } else if (bg === 'proof-room') {
      g.lineStyle(2, 0x5b4bff, 0.28);
      for (let i = 0; i < 12; i += 1) {
        const offset = Math.random() * 10 - 5;
        g.lineBetween(width * 0.18 + offset, height * (0.24 + i * 0.05), width * 0.82 - offset, height * (0.18 + i * 0.03));
      }
    } else if (bg === 'storm' || bg === 'collapse') {
      g.fillStyle(0x101010, 0.9);
      g.fillRect(0, height * 0.66, width, height * 0.34);
      // Add heavy chaotic hatching
      g.lineStyle(1, 0x222222, 0.5);
      for(let i=0; i<40; i++) {
        g.lineBetween(Math.random()*width, height*0.66, Math.random()*width, height);
      }
    } else if (bg === 'campfire') {
      g.fillStyle(0x120b06, 1);
      g.fillRect(0, height * 0.66, width, height * 0.34);
      for (let i = 4; i > 0; i -= 1) {
        g.fillStyle(0xff6a00, 0.045 * i);
        g.fillCircle(width * 0.52, height * 0.76, 70 * i);
      }
    } else {
      g.fillStyle(bg.includes('cold') ? 0x0d0d18 : 0x111111, 1);
      g.fillRect(0, height * 0.68, width, height * 0.32);
      // Ground hatching
      g.lineStyle(1, bg.includes('cold') ? 0x1a1a2a : 0x1c1c1c, 0.4);
      for(let i=0; i<30; i++) {
        g.lineBetween(Math.random()*width, height*0.68, Math.random()*width, height);
      }
    }

    if (!bg.includes('campfire')) {
      const roadLineColor = bg.includes('cold') ? 0x282848 : 0x252525;
      g.lineStyle(1, roadLineColor, 0.8);
      // Sketchy horizon line
      g.lineBetween(0, height * 0.68, width, height * 0.68 + 1);
      g.lineBetween(0, height * 0.68 - 1, width, height * 0.68);
      g.lineBetween(0, height * 0.68 + 1, width, height * 0.68 - 1);
      
      g.lineStyle(2, bg.includes('cold') ? 0x1d1d38 : 0x1f1f1f, 0.8);
      g.lineBetween(width * 0.38, height, width * 0.48, height * 0.68);
      g.lineBetween(width * 0.38 - 2, height, width * 0.48 + 1, height * 0.68);
      g.lineBetween(width * 0.66, height, width * 0.56, height * 0.68);
      g.lineBetween(width * 0.66 + 2, height, width * 0.56 - 1, height * 0.68);
    }

    this.drawPaperTexture(g, width, height, 0.04);
    this.targetLayer.add(g);
  }

  private drawPaperTexture(g: Phaser.GameObjects.Graphics, width: number, height: number, alpha: number) {
    g.lineStyle(1, 0xffffff, alpha);
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const len = 3 + Math.random() * 6;
      g.lineBetween(x, y, x + len, y + len * (Math.random() - 0.5));
    }
    g.lineStyle(1, 0x000000, alpha * 1.5);
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const len = 3 + Math.random() * 6;
      g.lineBetween(x, y, x + len, y + len * (Math.random() - 0.5));
    }
  }

  public drawSceneObject(object: SceneObject) {
    const { width, height } = this.scene.cameras.main;
    const x = object.x * width;
    const y = object.y * height;
    const scale = (object.scale || 1) * this.getPresentationScale(object.key);
    const alpha = object.alpha ?? 1;
    const g = this.scene.add.graphics().setAlpha(alpha);

    switch (object.key) {
      case 'distantLightTiny':
        this.drawLight(g, x, y, 4 * scale, 0.42);
        break;
      case 'distantLightFaint':
        this.drawLight(g, x, y, 7 * scale, 0.6);
        break;
      case 'distantLightClear':
        this.drawLight(g, x, y, 12 * scale, 0.85);
        break;
      case 'distantLightStrong':
        this.drawLight(g, x, y, 18 * scale, 1);
        break;
      case 'oldDoorClosed':
      case 'oldDoorFaded':
      case 'oldDoorOpen':
        this.drawOldDoor(g, x, y, object.key, scale);
        break;
      case 'glamourDoorClosed':
      case 'glamourDoorFaded':
      case 'glamourDoorOpen':
        this.drawGlamourDoor(g, x, y, object.key, scale);
        break;
      case 'emptyFrame':
        g.lineStyle(2, 0x3a3a3a, 0.8);
        g.strokeRect(x - 80, y - 45, 160, 90);
        break;
      case 'coldCards':
        this.drawColdCards(g, x, y);
        break;
      case 'floatingPapers':
        this.drawFloatingPapers(g, x, y);
        break;
      case 'burningNamesCold':
        g.fillStyle(0x705cff, 0.35);
        g.fillTriangle(x - 28, y + 20, x + 28, y + 20, x, y - 42);
        g.lineStyle(1, 0xa99cff, 0.8);
        g.strokeTriangle(x - 22, y + 18, x + 22, y + 18, x, y - 26);
        break;
      case 'stormLines':
        this.drawStormLines(g, width, height);
        break;
      case 'campfire':
        this.drawCampfire(g, x, y);
        break;
      case 'waitingFigureBack':
        this.drawWaitingFigure(g, x, y);
        break;
      case 'logSeat':
        g.fillStyle(0x261407, 1);
        g.fillRoundedRect(x - 115, y - 8, 230, 24, 10);
        break;
      case 'blanketGesture':
        g.fillStyle(0x4a443d, 0.78);
        g.fillEllipse(x, y, 74, 26);
        break;
      default:
        g.fillStyle(object.tint || 0x888888, 0.7);
        g.fillCircle(x, y, 12 * scale);
    }

    this.targetLayer.add(g);
  }

  private getPresentationScale(key: string) {
    if (key.includes('Door')) return 1.18;
    if (key.includes('Light')) return 1.25;
    if (['campfire', 'waitingFigureBack', 'burningNamesCold'].includes(key)) return 1.16;
    return 1;
  }

  private drawLight(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, alpha: number) {
    for (let i = 4; i >= 1; i -= 1) {
      g.fillStyle(0xff6a00, alpha / (i * 2.2));
      g.fillCircle(x, y, size * i);
    }
    g.fillStyle(0xfff3c4, alpha);
    g.fillCircle(x, y, Math.max(2, size * 0.45));
  }

  private drawOldDoor(g: Phaser.GameObjects.Graphics, x: number, y: number, key: string, scale: number) {
    const a = key === 'oldDoorFaded' ? 0.28 : 1;
    const open = key === 'oldDoorOpen';
    
    // Shadow
    g.fillStyle(0x000000, 0.4 * a);
    g.fillEllipse(x, y + 5 * scale, 86 * scale, 16 * scale);

    g.fillStyle(0x090909, 0.95 * a);
    g.fillRect(x - 38 * scale, y - 120 * scale, 76 * scale, 120 * scale);
    
    // Sketchy strokes for door frame
    g.lineStyle(2, 0x595959, a);
    g.strokeRect(x - 38 * scale, y - 120 * scale, 76 * scale, 120 * scale);
    g.lineStyle(1, 0x666666, a * 0.7);
    g.strokeRect(x - 39 * scale, y - 119 * scale, 77 * scale, 118 * scale);
    g.strokeRect(x - 37 * scale, y - 121 * scale, 75 * scale, 122 * scale);

    // Door details (panels)
    g.lineStyle(1, 0x333333, a);
    g.strokeRect(x - 28 * scale, y - 110 * scale, 56 * scale, 40 * scale);
    g.strokeRect(x - 28 * scale, y - 60 * scale, 56 * scale, 50 * scale);

    if (open) {
      g.fillStyle(0xffffff, 0.08);
      g.fillRect(x - 22 * scale, y - 110 * scale, 44 * scale, 106 * scale);
    }
  }

  private drawGlamourDoor(g: Phaser.GameObjects.Graphics, x: number, y: number, key: string, scale: number) {
    const a = key === 'glamourDoorFaded' ? 0.24 : 0.95;
    const open = key === 'glamourDoorOpen';
    
    // Shadow
    g.fillStyle(0x000000, 0.6 * a);
    g.fillEllipse(x, y + 5 * scale, 110 * scale, 20 * scale);

    g.fillStyle(0x050611, 0.98);
    g.fillRect(x - 48 * scale, y - 145 * scale, 96 * scale, 145 * scale);
    
    // Multiple neon sketchy strokes
    g.lineStyle(4, 0x6d5cff, a);
    g.strokeRect(x - 48 * scale, y - 145 * scale, 96 * scale, 145 * scale);
    g.lineStyle(2, 0x9388ff, a * 0.6);
    g.strokeRect(x - 46 * scale, y - 143 * scale, 92 * scale, 141 * scale);
    
    g.lineStyle(1, 0x73d9ff, a * 0.8);
    g.strokeRect(x - 58 * scale, y - 155 * scale, 116 * scale, 165 * scale);
    g.lineStyle(1, 0x73d9ff, a * 0.4);
    g.strokeRect(x - 59 * scale, y - 154 * scale, 118 * scale, 163 * scale);

    if (open) {
      g.fillStyle(0x6d5cff, 0.18);
      g.fillRect(x - 35 * scale, y - 132 * scale, 70 * scale, 128 * scale);
    }
  }

  private drawColdCards(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    ['성과', '비교', '스펙'].forEach((_, index) => {
      g.lineStyle(1, 0x77ccff, 0.55);
      g.strokeRect(x - 80 + index * 52, y - 22 + index * 8, 44, 28);
    });
  }

  private drawFloatingPapers(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    for (let i = 0; i < 9; i += 1) {
      const px = x - 180 + i * 45;
      const py = y - 70 + (i % 3) * 38;
      g.lineStyle(1, 0x9cc8ff, 0.4);
      g.strokeRect(px, py, 34, 46);
    }
  }

  private drawStormLines(g: Phaser.GameObjects.Graphics, width: number, height: number) {
    g.lineStyle(2, 0xddddff, 0.12);
    for (let i = 0; i < 24; i += 1) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      g.lineBetween(x1, y1, x1 + 180, y1 + (Math.random() - 0.5) * 90);
    }
  }

  private drawCampfire(g: Phaser.GameObjects.Graphics, x: number, y: number, alpha = 1) {
    g.fillStyle(0x2b1507, alpha);
    g.fillRoundedRect(x - 34, y - 4, 68, 10, 5);
    g.fillStyle(0xff4a00, 0.88 * alpha);
    g.fillTriangle(x - 18, y, x + 18, y, x, y - 49);
    g.fillStyle(0xffc15a, 0.84 * alpha);
    g.fillTriangle(x - 9, y, x + 9, y, x, y - 31);
  }

  private drawWaitingFigure(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x242424, 1);
    g.fillCircle(x, y - 48, 14);
    g.beginPath();
    g.moveTo(x - 24, y - 34);
    g.lineTo(x + 24, y - 34);
    g.lineTo(x + 32, y + 12);
    g.lineTo(x - 32, y + 12);
    g.closePath();
    g.fill();
  }

  private drawCharacter(pose: CharacterPose, xRatio: number, yRatio: number, scale: number) {
    const { width, height } = this.scene.cameras.main;
    const char = this.scene.add.container(xRatio * width, yRatio * height);
    char.setScale(scale);
    const g = this.scene.add.graphics();
    
    // Ground Shadow for spatial depth
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 18, 32, 8);

    // Sketchy body
    g.fillStyle(0xbdbdbd, 1);
    g.fillCircle(0, -46, 13);
    // Add sketchy offset to head
    g.lineStyle(1, 0x888888, 0.8);
    g.strokeCircle(0.5, -45.5, 13);

    g.beginPath();
    g.moveTo(-18, -32);
    g.lineTo(18, -32);

    switch (pose) {
      case 'walk':
      case 'enterDoor':
      case 'exitDoor':
        g.lineTo(23, 12); g.lineTo(-18, 12); char.setAngle(pose === 'exitDoor' ? 7 : -6); break;
      case 'run':
        g.lineTo(28, 12); g.lineTo(-20, 12); char.setAngle(-16); break;
      case 'hesitate':
        g.lineTo(14, 12); g.lineTo(-18, 12); char.setAngle(8); break;
      case 'tired':
        g.lineTo(14, 14); g.lineTo(-16, 14); char.setAngle(18); break;
      case 'collapsed':
        g.lineTo(34, 16); g.lineTo(-34, 16); char.setAngle(86); char.y += 28; break;
      case 'lookUp':
        g.lineTo(18, 18); g.lineTo(-16, 18); char.setAngle(-12); break;
      case 'rise':
        g.lineTo(20, 18); g.lineTo(-20, 18); char.setAngle(-4); break;
      case 'sitBack':
        g.lineTo(20, 2); g.lineTo(-20, 2); char.y += 14; break;
      default:
        g.lineTo(18, 16); g.lineTo(-18, 16);
    }
    g.closePath();
    g.fill();
    
    // Sketchy outline for body
    g.lineStyle(2, 0x555555, 0.9);
    g.strokePath();
    g.lineStyle(1, 0x777777, 0.5);
    g.strokePath();

    char.add(g);
    this.targetLayer.add(char);
  }

  private drawCenterFocusOverlay() {
    if (!this.fxLayer) return;
    const { width, height } = this.scene.cameras.main;
    const g = this.scene.add.graphics();
    const focusWidth = width * 0.68;
    const focusHeight = height * 0.58;
    const focusX = (width - focusWidth) / 2;
    const focusY = height * 0.16;

    g.fillStyle(0x000000, 0.2);
    g.fillRect(0, 0, width, focusY);
    g.fillRect(0, focusY + focusHeight, width, height - focusY - focusHeight);
    g.fillRect(0, focusY, focusX, focusHeight);
    g.fillRect(focusX + focusWidth, focusY, focusX, focusHeight);
    g.lineStyle(2, 0xffffff, 0.08);
    g.strokeRoundedRect(focusX, focusY, focusWidth, focusHeight, 28);

    this.fxLayer.add(g);
  }
}
