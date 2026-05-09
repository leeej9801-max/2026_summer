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

  const color = caption.type === 'prompt' ? '#d8d8d8' : caption.type === 'system' ? '#b8b8b8' : '#eeeeee';
  const box = scene.add.rectangle(width / 2, height - 72, width - 300, 86, 0x000000, 0.48)
    .setStrokeStyle(1, 0x333333, 0.7);
  const text = scene.add.text(width / 2, height - 72, caption.text, {
    fontSize: caption.type === 'prompt' ? '20px' : '19px',
    color,
    align: 'center',
    wordWrap: { width: width - 360 },
    fontFamily: 'serif',
    lineSpacing: 8,
  }).setOrigin(0.5);

  container.add([box, text]);
  return container;
};
