import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.ts';
import { PreloadScene } from '../scenes/PreloadScene.ts';
import { TitleScene } from '../scenes/TitleScene.ts';
import { RoadScene } from '../scenes/RoadScene.ts';
import { InteractionScene } from '../scenes/InteractionScene.ts';
import { FinalQuestionScene } from '../scenes/FinalQuestionScene.ts';
import { VerticalSliceScene } from '../scenes/VerticalSliceScene.ts';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'app',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true
  },
  scene: [BootScene, PreloadScene, TitleScene, RoadScene, InteractionScene, FinalQuestionScene, VerticalSliceScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};
