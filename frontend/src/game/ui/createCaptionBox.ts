import Phaser from 'phaser';
import { CaptionLine } from '../types/story.types.ts';

export const createCaptionBox = (
  scene: Phaser.Scene,
  caption: CaptionLine | undefined,
  width: number,
  height: number,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0);
  if (!caption || caption.type === 'none' || caption.text.trim() === '') return container;

  const color = caption.type === 'system' ? '#f4d58d' : caption.type === 'hint' ? '#b9e6ff' : '#ffffff';
  const boxHeight = caption.type === 'inner' ? 132 : 120;
  const boxY = height - boxHeight / 2 - 28;
  const box = scene.add.rectangle(width / 2, boxY, width - 120, boxHeight, 0x000000, 0.78)
    .setStrokeStyle(3, caption.type === 'system' ? 0xf4d58d : caption.type === 'hint' ? 0xb9e6ff : 0xffffff, 0.42);
  const text = scene.add.text(width / 2, boxY, caption.text, {
    fontSize: caption.type === 'hint' ? '32px' : '34px',
    color,
    align: 'center',
    wordWrap: { width: width - 200 },
    fontFamily: 'serif',
    lineSpacing: 12,
  }).setOrigin(0.5);

  container.add([box, text]);
  return container;
};
