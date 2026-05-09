import Phaser from 'phaser';
import { Hint } from '../types/story.types.ts';

type HintPanelOptions = {
  hints: Hint[];
  usedHintIds: string[];
  onUseHint: (hintId: string) => void;
};

export const createHintPanel = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: HintPanelOptions,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(x, y);
  const panel = scene.add.rectangle(0, 0, 440, 150, 0x080808, 0.82).setStrokeStyle(1, 0x333333);
  const title = scene.add.text(-200, -58, '힌트 보기', { fontSize: '16px', color: '#cccccc', fontFamily: 'sans-serif' });
  container.add([panel, title]);

  options.hints.forEach((hint, index) => {
    const yOffset = -22 + index * 38;
    const used = options.usedHintIds.includes(hint.id);
    const label = used ? `힌트 ${hint.order}: ${hint.text}` : `힌트 ${hint.order} 열기`;
    const text = scene.add.text(-200, yOffset, label, {
      fontSize: '14px',
      color: used ? '#aaaaaa' : '#f4d58d',
      wordWrap: { width: 390 },
      fontFamily: 'sans-serif',
    }).setInteractive({ useHandCursor: true });

    text.on('pointerdown', () => {
      options.onUseHint(hint.id);
      text.setText(`힌트 ${hint.order}: ${hint.text}`);
      text.setColor('#aaaaaa');
    });
    container.add(text);
  });

  return container;
};
