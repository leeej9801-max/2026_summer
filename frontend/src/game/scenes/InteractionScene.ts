import Phaser from 'phaser';
import { getHintsByIds } from '../data/hints.ts';
import { SketchRenderer } from '../rendering/SketchRenderer.ts';
import { InteractionManager } from '../systems/InteractionManager.ts';
import { StoryFlowManager } from '../systems/StoryFlowManager.ts';
import { Hint, StoryNode } from '../types/story.types.ts';
import { createInteractionGate } from '../ui/createInteractionGate.ts';

export class InteractionScene extends Phaser.Scene {
  private flowManager = StoryFlowManager.getInstance();
  private interactionManager = new InteractionManager();
  private node!: StoryNode;
  private feedbackText?: Phaser.GameObjects.Text;
  private answerElement?: Phaser.GameObjects.DOMElement;
  private hintPanel?: Phaser.GameObjects.Container;
  private hintButton?: Phaser.GameObjects.Text;
  private mainLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;

  constructor() {
    super('InteractionScene');
  }

  create() {
    this.node = this.flowManager.getCurrentNode();
    if (!this.node.interaction) {
      this.scene.start('RoadScene');
      return;
    }

    this.mainLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

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
    const renderer = new SketchRenderer(this, this.mainLayer);
    const gatePosition = renderer.renderInteractionBackdrop(this.node);
    const prompt = this.node.interaction.shortPrompt || this.node.interaction.prompt;

    const gate = createInteractionGate(this, gatePosition.gateX, gatePosition.gateY, {
      shortPrompt: prompt,
      placeholder: this.node.interaction.type === 'physicalAction' ? 'START 또는 시작' : '정답 입력',
      buttonLabel: this.node.interaction.type === 'messageInput' ? '전달하기' : '확인',
      onSubmit: (answer) => this.handleSubmit(answer),
      onToggleHint: () => this.toggleHintPanel(gatePosition.gateX, gatePosition.gateY),
    });
    this.answerElement = gate.answerElement;
    this.hintButton = gate.hintButton;
    this.uiLayer.add(gate.container);

    this.feedbackText = this.add.text(gatePosition.gateX, gatePosition.gateY + 116, '', {
      fontSize: '17px',
      color: '#ffb0b0',
      align: 'center',
      fontFamily: 'sans-serif',
      wordWrap: { width: 480 },
    }).setOrigin(0.5);
    this.uiLayer.add(this.feedbackText);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private toggleHintPanel(x: number, y: number) {
    if (this.hintPanel) {
      const nextVisible = !this.hintPanel.visible;
      this.hintPanel.setVisible(nextVisible);
      this.hintButton?.setText(nextVisible ? '닫기' : '힌트');
      return;
    }

    const hints = getHintsByIds(this.node.interaction?.hintIds);
    this.hintPanel = this.createSmallHintPanel(x + 258, y + 28, hints);
    this.hintButton?.setText('닫기');
  }

  private createSmallHintPanel(x: number, y: number, hints: Hint[]) {
    const width = 300;
    const height = Math.max(92, 46 + hints.length * 58);
    const panel = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0x080808, 0.92);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, 14);
    g.lineStyle(1, 0xf4d58d, 0.5);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, 14);
    panel.add(g);

    const title = this.add.text(-width / 2 + 18, -height / 2 + 14, '힌트', {
      fontSize: '15px',
      color: '#f4d58d',
      fontFamily: 'sans-serif',
    });
    panel.add(title);

    if (hints.length === 0) {
      const empty = this.add.text(0, 10, '열 수 있는 힌트가 없습니다.', {
        fontSize: '14px',
        color: '#d8d8d8',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);
      panel.add(empty);
      this.uiLayer.add(panel);
      return panel;
    }

    const usedHintIds = this.interactionManager.getUsedHintIds();
    hints.forEach((hint, index) => {
      const hintText = this.add.text(-width / 2 + 18, -height / 2 + 44 + index * 58, `${index + 1}. ${hint.text}`, {
        fontSize: '13px',
        color: usedHintIds.includes(hint.id) ? '#a8a8a8' : '#eeeeee',
        fontFamily: 'sans-serif',
        wordWrap: { width: width - 36 },
        lineSpacing: 4,
      }).setInteractive({ useHandCursor: true });
      hintText.on('pointerdown', () => {
        this.interactionManager.markHintUsed(hint.id);
        hintText.setColor('#a8a8a8');
      });
      panel.add(hintText);
    });

    this.uiLayer.add(panel);
    return panel;
  }

  private handleSubmit(answer: string) {
    if (!this.node.interaction) return;

    const finalAnswer = answer || (this.node.interaction.type === 'messageInput' ? '전달하기' : answer);
    if (!this.interactionManager.isCorrect(this.node.interaction, finalAnswer)) {
      this.cameras.main.shake(350, 0.003);
      this.feedbackText?.setColor('#ffb0b0');
      this.feedbackText?.setText(this.node.interaction.failMessage || '아직 맞지 않습니다.');
      return;
    }

    this.feedbackText?.setColor('#d7ffd7');
    this.feedbackText?.setText('문이 열린다.');
    this.answerElement?.setVisible(false);
    this.hintPanel?.setVisible(false);
    this.hintButton?.setVisible(false);
    this.flowManager.solveInteraction(this.node.id, this.node.interaction.successNodeId);

    this.time.delayedCall(850, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('RoadScene');
    this.time.delayedCall(700, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        if (progress === 1) this.scene.start('RoadScene');
      });
    });
  }
}
