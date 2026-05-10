import Phaser from 'phaser';
import { RouteTraceFragment, RouteTraceManager } from '../systems/RouteTraceManager.ts';
import { createAnswerInput } from './createAnswerInput.ts';

type RoutePuzzlePanelOptions = {
  prompt: string;
  description?: string;
  onSubmit: (answer: string) => void;
};

type RoutePuzzlePanel = {
  container: Phaser.GameObjects.Container;
  answerElement: Phaser.GameObjects.DOMElement;
};

type FragmentView = {
  fragment: RouteTraceFragment;
  piece: Phaser.GameObjects.Container;
  paper: Phaser.GameObjects.Graphics;
  routeInk: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  clicks: number;
};

const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

const isFragmentAligned = (view: FragmentView) => (
  normalizeAngle(view.piece.angle) === normalizeAngle(view.fragment.targetRotation)
);

const drawPaperFragment = (
  scene: Phaser.Scene,
  fragment: RouteTraceFragment,
  collected: boolean,
): { paper: Phaser.GameObjects.Graphics; routeInk: Phaser.GameObjects.Graphics } => {
  const paper = scene.add.graphics();
  const routeInk = scene.add.graphics();
  const edgeAlpha = collected ? 0.8 : 0.2;

  // Sketchy box instead of solid paper
  paper.fillStyle(0x000000, collected ? 0.4 : 0.1);
  paper.fillRect(-42, -42, 84, 84);
  
  paper.lineStyle(1, 0x555555, edgeAlpha);
  paper.strokeRect(-42, -42, 84, 84);
  paper.lineStyle(1, 0x777777, edgeAlpha * 0.5);
  paper.strokeRect(-40, -44, 80, 88);

  // Scratch marks
  paper.lineStyle(1, 0x999999, collected ? 0.3 : 0.1);
  paper.lineBetween(-30, -20, 20, -10);
  paper.lineBetween(-20, 10, 30, 20);
  paper.lineBetween(-10, -30, -5, 30);

  // The actual route line (made to look like abstract scratches rather than a clear path)
  routeInk.lineStyle(2, 0xffffff, collected ? 0.7 : 0.1);
  if (fragment.routeLine === 'vertical') {
    routeInk.lineBetween(-2, -38, 2, 38);
    routeInk.lineBetween(1, -36, -1, 36);
  } else {
    routeInk.lineBetween(-38, -2, 38, 2);
    routeInk.lineBetween(-36, 1, 36, -1);
  }

  return { paper, routeInk };
};

const updateRecognitionState = (scene: Phaser.Scene, views: FragmentView[], statusText: Phaser.GameObjects.Text) => {
  const touched = views.filter((view) => view.clicks > 0).length;
  const aligned = views.filter(isFragmentAligned).length;

  views.forEach((view) => {
    const isAligned = isFragmentAligned(view);
    view.paper.setAlpha(view.fragment.collected ? 1 : 0.28);
    view.routeInk.setAlpha(view.fragment.collected ? Math.min(0.28 + view.clicks * 0.22, 1) : 0.12);
    view.label.setText(view.clicks === 0 ? view.fragment.clueLabel : '길의 흔적?');
    view.label.setColor(isAligned ? '#f4d58d' : '#c8b99e');

    if (isAligned) {
      scene.tweens.add({ targets: view.paper, alpha: 1, duration: 380, ease: 'Sine.easeOut' });
      scene.tweens.add({ targets: view.routeInk, alpha: 0.92, duration: 380, ease: 'Sine.easeOut' });
    }
  });

  if (aligned === views.length) {
    statusText.setText('조각의 짧은 선들이 하나의 길로 겹쳐 보입니다.');
    statusText.setColor('#f4d58d');
    return;
  }

  if (touched === 0) {
    statusText.setText('처음에는 낡은 종이 파편과 긁힌 자국처럼만 보입니다.');
    statusText.setColor('#8c8374');
    return;
  }

  statusText.setText('돌릴수록 긁힌 자국 사이에서 길의 흔적이 드러납니다.');
  statusText.setColor('#c8b99e');
};

export const createRoutePuzzlePanel = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: RoutePuzzlePanelOptions,
): RoutePuzzlePanel => {
  const routeTraceManager = RouteTraceManager.getInstance();
  if (!routeTraceManager.isRoutePuzzleUnlocked()) {
    throw new Error('Route puzzle panel can only be opened at stage4-route-gate.');
  }

  const fragments = routeTraceManager.getCollectedFragments();
  const collectedFragments = Object.values(fragments);
  const container = scene.add.container(x, y);
  const panel = scene.add.rectangle(0, 0, 610, 480, 0x000000, 0.4).setStrokeStyle(1, 0x555555);
  const title = scene.add.text(0, -186, '조각난 흔적', {
    fontSize: '17px',
    color: '#d8d8d8',
    fontFamily: 'serif',
    letterSpacing: 2,
  }).setOrigin(0.5);
  const question = scene.add.text(0, -154, options.prompt, {
    fontSize: '27px',
    color: '#ffffff',
    fontFamily: 'serif',
  }).setOrigin(0.5);
  const description = scene.add.text(0, -120, options.description || '클릭으로 조각을 회전하여 긁힌 선들을 맞춰보세요.', {
    fontSize: '15px',
    color: '#a9a9a9',
    align: 'center',
    fontFamily: 'sans-serif',
    wordWrap: { width: 540 },
  }).setOrigin(0.5);
  const board = scene.add.rectangle(0, -8, 286, 246, 0x000000, 0.2).setStrokeStyle(1, 0x444444);
  const statusText = scene.add.text(0, 132, '', {
    fontSize: '14px',
    color: '#8c8374',
    align: 'center',
    fontFamily: 'sans-serif',
  }).setOrigin(0.5);

  container.add([panel, title, question, description, board, statusText]);

  const fragmentViews = collectedFragments.map((fragment) => {
    const piece = scene.add.container(fragment.position.x, fragment.position.y);
    piece.setAngle(fragment.initialRotation);
    const { paper, routeInk } = drawPaperFragment(scene, fragment, fragment.collected);
    const label = scene.add.text(0, 52, fragment.clueLabel, {
      fontSize: '10px',
      color: '#aaaaaa',
      align: 'center',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    piece.add([paper, routeInk, label]);
    piece.setSize(92, 92);
    piece.setInteractive(new Phaser.Geom.Rectangle(-46, -46, 92, 92), Phaser.Geom.Rectangle.Contains);
    container.add(piece);

    const view: FragmentView = { fragment, piece, paper, routeInk, label, clicks: 0 };
    piece.on('pointerdown', () => {
      if (!fragment.collected) return;
      view.clicks += 1;
      scene.tweens.add({ targets: piece, angle: piece.angle + 90, duration: 180, ease: 'Cubic.easeOut' });
      scene.tweens.add({ targets: piece, scale: 1.08, yoyo: true, duration: 120, ease: 'Sine.easeInOut' });
      scene.time.delayedCall(190, () => updateRecognitionState(scene, fragmentViews, statusText));
    });

    return view;
  });

  const missingCount = fragmentViews.filter((view) => !view.fragment.collected).length;
  if (missingCount > 0) {
    statusText.setText(`아직 회수되지 않은 조각이 ${missingCount}개 있습니다.`);
    statusText.setColor('#ff9f9f');
  } else {
    updateRecognitionState(scene, fragmentViews, statusText);
  }

  const answerElement = createAnswerInput(scene, x, y + 188, {
    placeholder: '예: 십자가 / CROSS / THE CROSS',
    buttonLabel: '정답 확인',
    onSubmit: options.onSubmit,
  });

  const note = scene.add.text(0, 174, 'MVP: 드래그 없이 클릭 회전과 정답 입력만 사용합니다.', {
    fontSize: '12px',
    color: '#6f675f',
    fontFamily: 'sans-serif',
  }).setOrigin(0.5);
  container.add(note);

  return { container, answerElement };
};
