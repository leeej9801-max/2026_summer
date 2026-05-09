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

    this.add.text(width / 2, 108, this.node.title, {
      fontSize: '28px',
      color: '#d8d8d8',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, 166, 'INTERACTION GATE', {
      fontSize: '18px',
      color: '#f4d58d',
      fontFamily: 'sans-serif',
      letterSpacing: 3,
    }).setOrigin(0.5);

    if (this.node.interaction.type === 'routePuzzle') {
      if (this.node.stageId !== 'stage-4') {
        this.scene.start('RoadScene');
        return;
      }

      const routePuzzlePanel = createRoutePuzzlePanel(this, width / 2, 410, {
        prompt: this.node.interaction.prompt,
        description: this.node.interaction.description,
        onSubmit: (answer) => this.handleSubmit(answer),
      });
      this.answerElement = routePuzzlePanel.answerElement;
    } else {
      this.add.text(width / 2, 230, this.node.interaction.prompt, {
        fontSize: '38px',
        color: '#ffffff',
        align: 'center',
        fontFamily: 'serif',
        wordWrap: { width: 900 },
      }).setOrigin(0.5);

      this.add.text(width / 2, 304, this.node.interaction.description || '', {
        fontSize: '21px',
        color: '#d0d0d0',
        align: 'center',
        fontFamily: 'sans-serif',
        wordWrap: { width: 860 },
        lineSpacing: 10,
      }).setOrigin(0.5);

      this.drawPhysicalCue(width / 2, 430);
      this.answerElement = createAnswerInput(this, width / 2, height - 142, {
        placeholder: this.node.interaction.type === 'physicalAction' ? 'START 또는 시작' : '정답을 입력하세요',
        buttonLabel: this.node.interaction.type === 'messageInput' ? '전달하기' : '정답 확인',
        onSubmit: (answer) => this.handleSubmit(answer),
      });
    }

    const hints = getHintsByIds(this.node.interaction.hintIds);
    createHintPanel(this, width - 260, height - 116, {
      hints,
      usedHintIds: this.interactionManager.getUsedHintIds(),
      onUseHint: (hintId) => this.interactionManager.markHintUsed(hintId),
    });

    this.feedbackText = this.add.text(width / 2, height - 34, '', {
      fontSize: '22px',
      color: '#ff9f9f',
      align: 'center',
      fontFamily: 'sans-serif',
      wordWrap: { width: 900 },
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private drawBackground() {
    const { width, height } = this.cameras.main;
    const g = this.add.graphics();
    const cold = this.node.stageId === 'stage-2' || this.node.stageId === 'stage-4';
    g.fillStyle(cold ? 0x050610 : 0x070707, 1);
    g.fillRect(0, 0, width, height);
    g.fillStyle(0x000000, 0.22);
    g.fillRect(0, 0, width, height);
    g.fillStyle(0x000000, 0.84);
    g.fillRoundedRect(width / 2 - 520, 72, 1040, height - 178, 24);
    g.lineStyle(3, cold ? 0x6d5cff : 0xf4d58d, 0.62);
    g.strokeRoundedRect(width / 2 - 520, 72, 1040, height - 178, 24);
  }

  private drawPhysicalCue(x: number, y: number) {
    const g = this.add.graphics();
    g.fillStyle(0x101010, 0.96);
    g.fillRoundedRect(x - 300, y - 76, 600, 152, 18);
    g.lineStyle(2, 0x777777, 0.9);
    g.strokeRoundedRect(x - 300, y - 76, 600, 152, 18);
    this.add.text(x, y - 24, '현실 퍼즐 구간', {
      fontSize: '30px',
      color: '#dddddd',
      fontFamily: 'serif',
    }).setOrigin(0.5);
    this.add.text(x, y + 30, '소품 · 카드 · 문장 조각을 확인한 뒤\n아래 입력창으로 웹을 반응시키세요.', {
      fontSize: '21px',
      color: '#c6c6c6',
      align: 'center',
      fontFamily: 'sans-serif',
      lineSpacing: 8,
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
