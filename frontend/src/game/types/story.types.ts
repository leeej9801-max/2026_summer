export type StoryNodeType = 'cutscene' | 'interaction' | 'puzzle' | 'routePuzzle' | 'transition' | 'final';

export type InteractionType = 'answer' | 'physicalAction' | 'choice' | 'routePuzzle' | 'messageInput';

export type CaptionType = 'inner' | 'system' | 'hint' | 'none';
export type StoryNodeType =
  | 'cutscene'
  | 'interaction'
  | 'routePuzzle'
  | 'puzzle'
  | 'transition'
  | 'final';

export type InteractionType = 'answer' | 'physicalAction' | 'choice' | 'routePuzzle' | 'messageInput';

export type CaptionType = 'system' | 'inner' | 'hint' | 'none';

export type PromptPlacement = 'bottom' | 'object' | 'panel';

export type WorldLayout =
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
  | 'campfireRest'
  | 'campfire';

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

export type PromptLine = {
  text: string;
  placement: PromptPlacement;
  targetX?: number;
  targetY?: number;
};

export type CutsceneShot = {
  id: string;
  worldLayout: WorldLayoutKey;
  backgroundKey?: string;
  worldLayout: WorldLayout;
  backgroundKey: string;
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

export type RouteFragmentReward = {
  fragmentKey: string;
};

export type InteractionGate = {
  type: InteractionType;
  prompt: string;
  shortPrompt?: string;
  description?: string;
  shortPrompt?: string;
  routeFragmentReward?: string;
  answerKeys?: string[];
  hintIds?: string[];
  successNodeId: string;
  routeFragmentReward?: RouteFragmentReward;
  routeFragmentReward?: string;
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
  routeFragmentIds: string[];
};
