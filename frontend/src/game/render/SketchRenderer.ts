import Phaser from 'phaser';
import type { CharacterPose } from '../types/story.types.ts';

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

const sketchLineStyle = (graphics: Phaser.GameObjects.Graphics, color = 0xb8b8b8, alpha = 0.75, width = 1) => {
  graphics.lineStyle(width, color, alpha);
};

const drawRoughRect = (
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  alpha: number,
  jitter = 2,
) => {
  sketchLineStyle(graphics, color, alpha, 1);
  drawRoughLine(graphics, x, y, x + width, y, jitter);
  drawRoughLine(graphics, x + width, y, x + width, y + height, jitter);
  drawRoughLine(graphics, x + width, y + height, x, y + height, jitter);
  drawRoughLine(graphics, x, y + height, x, y, jitter);
};

export function drawRoughLine(
  graphics: Phaser.GameObjects.Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  jitter = 1.8,
) {
  const segments = randInt(4, 8);
  graphics.beginPath();
  graphics.moveTo(x1, y1);

  for (let i = 1; i < segments; i += 1) {
    const t = i / segments;
    graphics.lineTo(
      x1 + (x2 - x1) * t + rand(-jitter, jitter),
      y1 + (y2 - y1) * t + rand(-jitter, jitter),
    );
  }

  graphics.lineTo(x2, y2);
  graphics.strokePath();
}

export function drawNotebookTexture(graphics: Phaser.GameObjects.Graphics, width: number, height: number) {
  graphics.lineStyle(1, 0xffffff, 0.018);
  for (let i = 0; i < 145; i += 1) {
    const x = rand(0, width);
    const y = rand(0, height);
    const length = rand(3, 18);
    const angle = rand(-0.8, 0.8);
    graphics.lineBetween(x, y, x + Math.cos(angle) * length, y + Math.sin(angle) * length);
  }

  for (let i = 0; i < 95; i += 1) {
    const x = rand(0, width);
    const y = rand(0, height);
    graphics.fillStyle(i % 3 === 0 ? 0x000000 : 0xd8d8d8, rand(0.012, 0.035));
    graphics.fillCircle(x, y, rand(0.6, 2.2));
  }

  for (let i = 0; i < 18; i += 1) {
    graphics.fillStyle(0x000000, rand(0.018, 0.045));
    graphics.fillEllipse(rand(0, width), rand(0, height), rand(18, 70), rand(5, 22));
  }
}

export function drawSketchRoad(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  tone: 'neutral' | 'cold' | 'campfire' = 'neutral',
) {
  const groundY = height * 0.68;
  const groundColor = tone === 'cold' ? 0x19192e : tone === 'campfire' ? 0x1d1008 : 0x151515;
  const lineColor = tone === 'cold' ? 0x343455 : tone === 'campfire' ? 0x4a2b15 : 0x2e2e2e;

  graphics.fillStyle(groundColor, tone === 'campfire' ? 0.96 : 0.92);
  graphics.fillRect(0, groundY, width, height - groundY);

  sketchLineStyle(graphics, lineColor, 0.86, 1);
  drawRoughLine(graphics, -10, groundY, width + 10, groundY + rand(-2, 2), 2.5);

  for (let i = 0; i < 14; i += 1) {
    const y = groundY + 18 + i * ((height - groundY) / 15);
    const leftDip = rand(-7, 8);
    const rightDip = rand(-7, 8);
    sketchLineStyle(graphics, lineColor, 0.12 + (i % 3) * 0.035, 1);
    drawRoughLine(graphics, rand(-40, 35), y + leftDip, width + rand(-35, 40), y + rightDip, 3.4);
  }

  for (let i = 0; i < 22; i += 1) {
    const x = rand(0, width);
    const y = rand(groundY + 6, height - 12);
    sketchLineStyle(graphics, lineColor, 0.18, 1);
    drawRoughLine(graphics, x, y, x + rand(8, 42), y + rand(-3, 3), 1.6);
  }
}

export function drawSketchCharacter(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  pose: CharacterPose,
  x: number,
  y: number,
  scale = 1,
) {
  const char = scene.add.container(x, y).setScale(scale);
  const graphics = scene.add.graphics();
  const bodyColor = pose === 'collapsed' ? 0x8f8f8f : 0xb9b9b9;
  const lineColor = 0xe2e2e2;

  graphics.fillStyle(bodyColor, pose === 'sitBack' ? 0.82 : 0.96);
  graphics.fillCircle(0, -46, pose === 'run' ? 12 : 13);
  sketchLineStyle(graphics, lineColor, 0.44, 1);
  graphics.strokeCircle(0, -46, pose === 'run' ? 12 : 13);

  graphics.fillStyle(bodyColor, 0.88);
  graphics.beginPath();
  graphics.moveTo(-18, -32);
  graphics.lineTo(18, -32);

  switch (pose) {
    case 'run':
      graphics.lineTo(30, 12);
      graphics.lineTo(-22, 11);
      char.setAngle(-16);
      break;
    case 'walk':
    case 'enterDoor':
    case 'exitDoor':
      graphics.lineTo(pose === 'exitDoor' ? 22 : 24, 12);
      graphics.lineTo(-19, 12);
      char.setAngle(pose === 'exitDoor' ? 7 : -6);
      break;
    case 'hesitate':
      graphics.lineTo(14, 11);
      graphics.lineTo(-19, 13);
      char.setAngle(8);
      break;
    case 'tired':
      graphics.lineTo(14, 14);
      graphics.lineTo(-16, 14);
      char.setAngle(18);
      break;
    case 'collapsed':
      graphics.lineTo(34, 16);
      graphics.lineTo(-34, 16);
      char.setAngle(86);
      char.y += 28;
      break;
    case 'lookUp':
      graphics.lineTo(18, 18);
      graphics.lineTo(-16, 18);
      char.setAngle(-12);
      break;
    case 'rise':
      graphics.lineTo(20, 18);
      graphics.lineTo(-20, 18);
      char.setAngle(-4);
      break;
    case 'sitBack':
      graphics.lineTo(20, 2);
      graphics.lineTo(-20, 2);
      char.y += 14;
      break;
    default:
      graphics.lineTo(18, 16);
      graphics.lineTo(-18, 16);
  }
  graphics.closePath();
  graphics.fill();

  sketchLineStyle(graphics, 0x171717, 0.48, 1);
  drawRoughLine(graphics, -12, -22, -24, pose === 'run' ? -4 : -2, 1.6);
  drawRoughLine(graphics, 12, -22, 24, pose === 'hesitate' ? -18 : 0, 1.6);
  drawRoughLine(graphics, -8, 10, pose === 'sitBack' ? -24 : -12, 27, 1.5);
  drawRoughLine(graphics, 8, 10, pose === 'run' ? 28 : 13, pose === 'collapsed' ? 9 : 27, 1.5);

  char.add(graphics);
  layer.add(char);
  return char;
}

export function drawOldDoor(graphics: Phaser.GameObjects.Graphics, x: number, y: number, key: string, scale = 1) {
  const alpha = key === 'oldDoorFaded' ? 0.28 : 1;
  const open = key === 'oldDoorOpen';
  graphics.fillStyle(0x070707, 0.88 * alpha);
  graphics.fillRect(x - 38 * scale, y - 120 * scale, 76 * scale, 120 * scale);

  drawRoughRect(graphics, x - 38 * scale, y - 120 * scale, 76 * scale, 120 * scale, 0x777777, alpha * 0.72, 2.4 * scale);
  drawRoughRect(graphics, x - 28 * scale, y - 108 * scale, 56 * scale, 46 * scale, 0x4f4f4f, alpha * 0.4, 1.8 * scale);
  drawRoughRect(graphics, x - 28 * scale, y - 54 * scale, 56 * scale, 44 * scale, 0x4f4f4f, alpha * 0.4, 1.8 * scale);

  graphics.fillStyle(0x9a9a9a, alpha * 0.62);
  graphics.fillCircle(x + 23 * scale, y - 58 * scale, 2.4 * scale);

  if (open) {
    graphics.fillStyle(0xffffff, 0.075);
    graphics.fillRect(x - 22 * scale, y - 110 * scale, 44 * scale, 106 * scale);
    sketchLineStyle(graphics, 0xffffff, 0.14, 1);
    drawRoughLine(graphics, x - 20 * scale, y - 112 * scale, x + 18 * scale, y - 6 * scale, 2 * scale);
  }
}

export function drawGlamourDoor(graphics: Phaser.GameObjects.Graphics, x: number, y: number, key: string, scale = 1) {
  const alpha = key === 'glamourDoorFaded' ? 0.24 : 0.95;
  const open = key === 'glamourDoorOpen';
  graphics.fillStyle(0x040511, 0.96);
  graphics.fillRect(x - 48 * scale, y - 145 * scale, 96 * scale, 145 * scale);
  drawRoughRect(graphics, x - 48 * scale, y - 145 * scale, 96 * scale, 145 * scale, 0x6d5cff, alpha, 2.2 * scale);
  drawRoughRect(graphics, x - 58 * scale, y - 155 * scale, 116 * scale, 165 * scale, 0x73d9ff, alpha * 0.58, 2.8 * scale);

  for (let i = 0; i < 4; i += 1) {
    sketchLineStyle(graphics, i % 2 === 0 ? 0x6d5cff : 0x73d9ff, alpha * 0.18, 1);
    drawRoughLine(graphics, x - 44 * scale, y - (122 - i * 25) * scale, x + 44 * scale, y - (128 - i * 20) * scale, 1.5 * scale);
  }

  if (open) {
    graphics.fillStyle(0x6d5cff, 0.18);
    graphics.fillRect(x - 35 * scale, y - 132 * scale, 70 * scale, 128 * scale);
  }
}

export function drawDistantLight(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number, alpha = 1) {
  for (let i = 4; i >= 1; i -= 1) {
    graphics.fillStyle(0xff6a00, alpha / (i * 2.35));
    graphics.fillCircle(x + rand(-1, 1), y + rand(-1, 1), size * i);
  }
  graphics.fillStyle(0xfff3c4, alpha);
  graphics.fillCircle(x, y, Math.max(2, size * 0.45));
  sketchLineStyle(graphics, 0xffc36a, alpha * 0.42, 1);
  drawRoughLine(graphics, x - size * 1.2, y, x + size * 1.2, y + rand(-1.2, 1.2), 1.2);
}

export function drawStormOverlay(graphics: Phaser.GameObjects.Graphics, width: number, height: number) {
  for (let i = 0; i < 26; i += 1) {
    const x = rand(-40, width);
    const y = rand(0, height);
    sketchLineStyle(graphics, 0xddddff, rand(0.06, 0.14), i % 5 === 0 ? 2 : 1);
    drawRoughLine(graphics, x, y, x + rand(95, 210), y + rand(-45, 42), 4.5);
  }
}

export function drawCampfire(graphics: Phaser.GameObjects.Graphics, x: number, y: number) {
  for (let i = 3; i > 0; i -= 1) {
    graphics.fillStyle(0xff6a00, 0.045 * i);
    graphics.fillCircle(x, y - 12, 28 * i);
  }
  graphics.fillStyle(0xff4a00, 0.96);
  graphics.fillTriangle(x - 18, y, x + 18, y, x, y - 48);
  graphics.fillStyle(0xffc15a, 0.9);
  graphics.fillTriangle(x - 9, y, x + 9, y, x + 2, y - 31);
  sketchLineStyle(graphics, 0xffd09a, 0.38, 1);
  drawRoughLine(graphics, x - 14, y - 6, x, y - 45, 2.2);
  drawRoughLine(graphics, x + 14, y - 5, x - 1, y - 34, 2.2);
  graphics.fillStyle(0x2b1507, 1);
  graphics.fillRoundedRect(x - 30, y - 3, 60, 9, 4);
}

export function drawWaitingFigureBack(graphics: Phaser.GameObjects.Graphics, x: number, y: number) {
  graphics.fillStyle(0x242424, 0.98);
  graphics.fillCircle(x, y - 48, 14);
  graphics.beginPath();
  graphics.moveTo(x - 24, y - 34);
  graphics.lineTo(x + 24, y - 34);
  graphics.lineTo(x + 32, y + 12);
  graphics.lineTo(x - 32, y + 12);
  graphics.closePath();
  graphics.fill();
  sketchLineStyle(graphics, 0x7a7a7a, 0.3, 1);
  drawRoughLine(graphics, x - 20, y - 31, x + 19, y - 31, 1.5);
  drawRoughLine(graphics, x - 14, y - 18, x - 25, y + 8, 1.4);
  drawRoughLine(graphics, x + 14, y - 18, x + 25, y + 8, 1.4);
}
