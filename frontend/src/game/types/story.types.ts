export type StoryNodeType = 'cutscene' | 'interaction' | 'puzzle' | 'routePuzzle' | 'transition' | 'final';

export type InteractionType = 'answer' | 'physicalAction' | 'choice' | 'routePuzzle' | 'messageInput';

export type CaptionType = 'inner' | 'system' | 'hint' | 'none';

export type CharacterPose =
  | 'none'
  | 'stand'
  | 'walk'
  | 'hesitate'
  | 'enterDoor'
  | 'exitDoor'
  | 'tired'
  | 'collapsed'
  | 'lookUp'
  | 'rise'
  | 'run'
  | 'sitBack';

export type SceneObject = {
  key: string;
  x: number;
  y: number;
  scale?: number;
  alpha?: number;
  tint?: number;
};

export type PromptLine = {
  text: string;
  placement: 'bottom' | 'nearObject' | 'smallPanel';
};

export type RouteDirection =
  | 'FORWARD'
  | 'LEFT_BRANCH'
  | 'RETURN_MAIN'
  | 'RIGHT_BRANCH'
  | 'RETURN_SECOND'
  | 'TOWARD_LIGHT';

export type WorldLayoutKey =
  | 'emptyRoad'
  | 'roadWithDistantLight'
  | 'oldDoorApproach'
  | 'oldDoorInterior'
  | 'oldDoorReturn'
  | 'glamourDoorApproach'
  | 'glamourDoorInterior'
  | 'glamourDoorReturn'
  | 'stormRoad'
  | 'collapsedRoad'
  | 'lightRecovery'
  | 'runToLight'
  | 'campfireArrival'
  | 'campfireRest';

export type CameraCue = {
  zoom?: number;
  panX?: number;
  panY?: number;
  shake?: boolean;
  fade?: 'in' | 'out' | 'none';
};

export type CaptionLine = {
  type: CaptionType;
  text: string;
  maxVisibleMs?: number;
};

export type CutsceneShot = {
  id: string;
  worldLayout: WorldLayoutKey;
  backgroundKey?: string;
  characterPose?: CharacterPose;
  characterX?: number;
  characterY?: number;
  characterScale?: number;
  objects?: SceneObject[];
  camera?: CameraCue;
  durationMs?: number;
  caption?: CaptionLine;
  prompt?: PromptLine;
  routeCue?: RouteDirection;
  soundCue?: string;
  autoNext?: boolean;
};

export type InteractionGate = {
  type: InteractionType;
  prompt: string;
  description?: string;
  shortPrompt?: string;
  routeFragmentReward?: string;
  answerKeys?: string[];
  hintIds?: string[];
  successNodeId: string;
  failMessage?: string;
};

export type StoryNode = {
  id: string;
  actId: string;
  stageId: string;
  nodeType: StoryNodeType;
  title: string;
  shots?: CutsceneShot[];
  interaction?: InteractionGate;
  nextNodeId?: string;
};

export type Hint = {
  id: string;
  stageId: string;
  order: number;
  text: string;
};

export type GameProgress = {
  currentNodeId: string;
  completedNodeIds: string[];
  usedHintIds: string[];
  solvedGateIds: string[];
};
