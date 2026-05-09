export type NextTrigger = 'click' | 'answer' | 'timer';

export type SceneObject = {
  key: string;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  scale?: number;
  alpha?: number;
  tint?: number;
  flipX?: boolean;
};

export type SceneEffect = {
  type: 'fade' | 'shake' | 'glow' | 'storm' | 'dim' | 'warmLight';
  target?: string;
  duration?: number;
};

export interface ScenarioStep {
  id: string;
  title: string;
  text: string;
  backgroundKey: string;
  characterKey: string | null;
  characterPose?: string;
  characterX?: number; // 0-1 normalized
  characterY?: number; // 0-1 normalized
  characterScale?: number;
  characterFlipX?: boolean;
  objects?: SceneObject[];
  effects?: SceneEffect[];
  nextTrigger: NextTrigger;
  nextScene?: string;
}

export interface GameProgress {
  currentCutIndex: number;
  isComplete: boolean;
}
