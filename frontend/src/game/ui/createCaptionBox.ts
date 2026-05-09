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

  const isSystem = caption.type === 'system';
  const isHint = caption.type === 'hint';
  const boxWidth = Math.min(width - 180, 760);
  const boxHeight = 88;
  const boxY = height - boxHeight / 2 - 34;
  const paperColor = isSystem ? 0x2b2417 : isHint ? 0x22251c : 0x211f1a;
  const strokeColor = isSystem ? 0xf4d58d : isHint ? 0xd8e89a : 0xd7c7a4;
  const textColor = isSystem ? '#ffe6a3' : isHint ? '#f1ffd0' : '#fff7e8';

  const shadow = scene.add.rectangle(width / 2 + 4, boxY + 5, boxWidth, boxHeight, 0x000000, 0.34)
    .setOrigin(0.5);
  const paper = scene.add.rectangle(width / 2, boxY, boxWidth, boxHeight, paperColor, 0.9)
    .setOrigin(0.5)
    .setStrokeStyle(2, strokeColor, 0.52);
  const pencilLine = scene.add.line(width / 2, boxY + boxHeight / 2 - 16, -boxWidth / 2 + 34, 0, boxWidth / 2 - 34, 0, strokeColor, 0.18)
    .setOrigin(0.5);
  const text = scene.add.text(width / 2, boxY - 2, caption.text, {
    fontSize: '30px',
    color: textColor,
    align: 'center',
    wordWrap: { width: boxWidth - 92 },
    fontFamily: 'serif',
    lineSpacing: 8,
  }).setOrigin(0.5);

  container.add([shadow, paper, pencilLine, text]);
  return container;
};
