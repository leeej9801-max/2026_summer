import Phaser from 'phaser';
import { getHintsByIds } from '../data/hints.ts';
import { InteractionManager } from '../systems/InteractionManager.ts';
import { StoryFlowManager } from '../systems/StoryFlowManager.ts';
import { StoryNode } from '../types/story.types.ts';
import { createAnswerInput } from '../ui/createAnswerInput.ts';
import { createHintPanel } from '../ui/createHintPanel.ts';
import { createRoutePuzzlePanel } from '../ui/createRoutePuzzlePanel.ts';

export class InteractionScene extends Phaser.Scene {
  private flowManager = StoryFlowManager.getInstance();
  private interactionManager = new InteractionManager();
  private node!: StoryNode;
  private feedbackText?: Phaser.GameObjects.Text;
  private answerElement?: Phaser.GameObjects.DOMElement;

  constructor() {
    super('InteractionScene');
  }

  create() {
    this.node = this.flowManager.getCurrentNode();
    if (!this.node.interaction) {
      this.scene.start('RoadScene');
      return;
    }

    const { width, height } = this.cameras.main;
    this.drawBackground();

    this.add.text(width / 2, 78, this.node.title, {
      fontSize: '30px',
      color: '#f0f0f0',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, 132, '현실 단서를 확인하세요', {
      fontSize: '18px',
      color: '#f4d58d',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, 190, this.node.interaction.prompt, {
      fontSize: this.node.interaction.type === 'routePuzzle' ? '34px' : '28px',
      color: '#ffffff',
      align: 'center',
      fontFamily: 'serif',
      wordWrap: { width: 760 },
    }).setOrigin(0.5);

    this.add.text(width / 2, 246, this.node.interaction.description || '', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center',
      fontFamily: 'sans-serif',
      wordWrap: { width: 780 },
      lineSpacing: 7,
    }).setOrigin(0.5);

    if (this.node.interaction.type === 'routePuzzle') {
      createRoutePuzzlePanel(this, width / 2, 376);
    } else {
      this.drawPhysicalCue(width / 2, 364);
    }

    this.answerElement = createAnswerInput(this, width / 2, height - 180, {
      placeholder: this.node.interaction.type === 'physicalAction' ? 'START 또는 시작' : '정답을 입력하세요',
      buttonLabel: this.node.interaction.type === 'messageInput' ? '전달하기' : '정답 확인',
      onSubmit: (answer) => this.handleSubmit(answer),
    });

    const hints = getHintsByIds(this.node.interaction.hintIds);
    createHintPanel(this, width - 270, height - 130, {
      hints,
      usedHintIds: this.interactionManager.getUsedHintIds(),
      onUseHint: (hintId) => this.interactionManager.markHintUsed(hintId),
    });

    this.feedbackText = this.add.text(width / 2, height - 58, '', {
      fontSize: '16px',
      color: '#ff9f9f',
      align: 'center',
      fontFamily: 'sans-serif',
      wordWrap: { width: 760 },
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private drawBackground() {
    const { width, height } = this.cameras.main;
    const g = this.add.graphics();
    const cold = this.node.stageId === 'stage-2' || this.node.stageId === 'stage-4';
    g.fillStyle(cold ? 0x050610 : 0x070707, 1);
    g.fillRect(0, 0, width, height);
    g.fillStyle(0x000000, 0.58);
    g.fillRoundedRect(width / 2 - 470, 42, 940, height - 84, 18);
    g.lineStyle(1, cold ? 0x4840a8 : 0x333333, 0.8);
    g.strokeRoundedRect(width / 2 - 470, 42, 940, height - 84, 18);
  }

  private drawPhysicalCue(x: number, y: number) {
    const g = this.add.graphics();
    g.fillStyle(0x101010, 0.95);
    g.fillRoundedRect(x - 210, y - 58, 420, 116, 14);
    g.lineStyle(1, 0x555555, 0.8);
    g.strokeRoundedRect(x - 210, y - 58, 420, 116, 14);
    this.add.text(x, y - 16, '현실 퍼즐 구간', {
      fontSize: '20px',
      color: '#dddddd',
      fontFamily: 'serif',
    }).setOrigin(0.5);
    this.add.text(x, y + 24, '소품 · 카드 · 문장 조각을 확인한 뒤\n아래 입력창으로 웹을 반응시키세요.', {
      fontSize: '14px',
      color: '#888888',
      align: 'center',
      fontFamily: 'sans-serif',
      lineSpacing: 5,
    }).setOrigin(0.5);
  }

  private handleSubmit(answer: string) {
    if (!this.node.interaction) return;

    const finalAnswer = answer || (this.node.interaction.type === 'messageInput' ? '전달하기' : answer);
    if (!this.interactionManager.isCorrect(this.node.interaction, finalAnswer)) {
      this.cameras.main.shake(350, 0.003);
      this.feedbackText?.setText(this.node.interaction.failMessage || '아직 맞지 않습니다.');
      return;
    }

    this.feedbackText?.setColor('#d7ffd7');
    this.feedbackText?.setText('성공했습니다. 다음 컷신이 열립니다.');
    this.answerElement?.setVisible(false);
    this.flowManager.solveInteraction(this.node.id, this.node.interaction.successNodeId);

    this.time.delayedCall(850, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        if (progress === 1) this.scene.start('RoadScene');
      });
    });
  }
}
