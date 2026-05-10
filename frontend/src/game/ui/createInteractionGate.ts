import Phaser from 'phaser';
import { createAnswerInput } from './createAnswerInput.ts';

type InteractionGateOptions = {
  shortPrompt: string;
  placeholder?: string;
  buttonLabel?: string;
  width?: number;
  onSubmit: (answer: string) => void;
  onToggleHint: () => void;
};

type InteractionGateUI = {
  container: Phaser.GameObjects.Container;
  answerElement: Phaser.GameObjects.DOMElement;
  hintButton: Phaser.GameObjects.Text;
};

export const createInteractionGate = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: InteractionGateOptions,
): InteractionGateUI => {
  const width = options.width ?? 460;
  const height = 184;
  const container = scene.add.container(x, y);

  const panel = scene.add.graphics();
  // Sketchy transparent box
  panel.fillStyle(0x000000, 0.2);
  panel.fillRect(-width / 2, -height / 2, width, height);
  
  panel.lineStyle(1, 0xffffff, 0.3);
  panel.strokeRect(-width / 2, -height / 2, width, height);
  panel.lineStyle(1, 0xffffff, 0.15);
  panel.strokeRect(-width / 2 - 2, -height / 2 + 1, width + 1, height - 2);

  const prompt = scene.add.text(0, -58, options.shortPrompt, {
    fontSize: '20px',
    color: '#f5f0df',
    align: 'center',
    fontFamily: 'serif',
    wordWrap: { width: width - 56 },
    lineSpacing: 5,
  }).setOrigin(0.5);

  const answerElement = createAnswerInput(scene, 0, 28, {
    placeholder: options.placeholder,
    buttonLabel: options.buttonLabel,
    panelWidth: width - 40,
    inputWidth: width - 112,
    inputFontSize: 17,
    buttonFontSize: 13,
    inputPadding: '9px 12px',
    compact: true,
    onSubmit: options.onSubmit,
  });

  const hintButton = scene.add.text(width / 2 - 24, height / 2 - 20, '힌트', {
    fontSize: '14px',
    color: '#f4d58d',
    fontFamily: 'sans-serif',
    backgroundColor: 'rgba(17, 17, 17, 0.88)',
    padding: { x: 10, y: 6 },
  }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
  hintButton.on('pointerdown', options.onToggleHint);

  container.add([panel, prompt, answerElement, hintButton]);

  return { container, answerElement, hintButton };
};
