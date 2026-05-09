export type NextTrigger = 'click' | 'answer' | 'timer';

export type SceneMood = 
  | "empty" 
  | "road" 
  | "door1" 
  | "door1-return" 
  | "door2" 
  | "door2-return" 
  | "storm" 
  | "collapse" 
  | "recovery" 
  | "run-to-light" 
  | "campfire-arrival" 
  | "campfire-rest";

export type CharacterPose = 
  | "none" 
  | "stand" 
  | "walk" 
  | "hesitate" 
  | "tired" 
  | "collapsed" 
  | "lookUp" 
  | "rise" 
  | "run" 
  | "sitBack";

export interface ScenarioStep {
  id: string;
  title: string;
  text: string;
  backgroundKey: string; // Keep for asset compatibility
  sceneMood: SceneMood;
  characterPose?: CharacterPose;
  characterX?: number; // 0-1
  characterY?: number; // 0-1
  characterScale?: number;
  
  // Visibility Flags
  showDistantLight?: boolean;
  distantLightStrength?: "tiny" | "faint" | "clear" | "strong";
  showOldDoor?: boolean;
  showGlamourDoor?: boolean;
  showStorm?: boolean;
  showCampfire?: boolean;
  showWaitingFigure?: boolean;
  showLogSeat?: boolean;
  showBlanketGesture?: boolean;
  
  nextTrigger: NextTrigger;
}

export interface GameProgress {
  currentCutIndex: number;
  isComplete: boolean;
}
