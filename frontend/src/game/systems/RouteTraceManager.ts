export type RouteDirection = 'north' | 'east' | 'south' | 'west' | 'center' | 'unknown';

export type RouteTrace = {
  id: string;
  stageId: string;
  direction: RouteDirection;
  hiddenSymbol: string;
  fragmentKey: string;
  collected: boolean;
};

type RouteTraceMetadata = Pick<RouteTrace, 'direction' | 'hiddenSymbol'>;

const STORAGE_KEY = 'road_game_route_trace_v1';

const routeTraceMetadataByFragmentKey: Record<string, RouteTraceMetadata> = {
  'stage0-origin-fragment': { direction: 'east', hiddenSymbol: '시작' },
  'stage1-faith-fragment': { direction: 'north', hiddenSymbol: '확신' },
  'stage2-name-fragment': { direction: 'south', hiddenSymbol: '이름' },
  'stage3-light-fragment': { direction: 'west', hiddenSymbol: '빛' },
};

const createTraceId = (stageId: string, fragmentKey: string) => `${stageId}:${fragmentKey}`;

const isRouteTrace = (value: unknown): value is RouteTrace => {
  if (!value || typeof value !== 'object') return false;

  const trace = value as Partial<RouteTrace>;
  return (
    typeof trace.id === 'string' &&
    typeof trace.stageId === 'string' &&
    typeof trace.direction === 'string' &&
    typeof trace.hiddenSymbol === 'string' &&
    typeof trace.fragmentKey === 'string' &&
    typeof trace.collected === 'boolean'
  );
};

export class RouteTraceManager {
  private static instance: RouteTraceManager;
  private traces: RouteTrace[] = [];

  private constructor() {
    this.load();
  }
import { ProgressManager } from './ProgressManager.ts';

export type RouteFragmentId = 'fragment_01' | 'fragment_02' | 'fragment_03' | 'fragment_04';

export type RouteTraceFragment = {
  id: RouteFragmentId;
  collected: boolean;
  sourceNodeId: string;
  clueLabel: string;
  initialRotation: number;
  targetRotation: number;
  position: { x: number; y: number };
  routeLine: 'vertical' | 'horizontal';
};

export type CollectedRouteFragments = Record<RouteFragmentId, RouteTraceFragment>;

const FRAGMENT_DEFINITIONS: RouteTraceFragment[] = [
  {
    id: 'fragment_01',
    collected: false,
    sourceNodeId: 'stage1-inside-door',
    clueLabel: '낡은 종이 파편 I',
    initialRotation: 90,
    targetRotation: 0,
    position: { x: 0, y: -76 },
    routeLine: 'vertical',
  },
  {
    id: 'fragment_02',
    collected: false,
    sourceNodeId: 'stage2-inside-room',
    clueLabel: '긁힌 자국 II',
    initialRotation: 90,
    targetRotation: 0,
    position: { x: -78, y: 0 },
    routeLine: 'horizontal',
  },
  {
    id: 'fragment_03',
    collected: false,
    sourceNodeId: 'stage3-light-again',
    clueLabel: '짧은 선 조각 III',
    initialRotation: 270,
    targetRotation: 0,
    position: { x: 78, y: 0 },
    routeLine: 'horizontal',
  },
  {
    id: 'fragment_04',
    collected: false,
    sourceNodeId: 'stage4-return-road',
    clueLabel: '되짚은 흔적 IV',
    initialRotation: 180,
    targetRotation: 0,
    position: { x: 0, y: 76 },
    routeLine: 'vertical',
  },
];

export class RouteTraceManager {
  private static instance: RouteTraceManager;
  private progress = ProgressManager.getInstance();

  public static getInstance(): RouteTraceManager {
    if (!RouteTraceManager.instance) {
      RouteTraceManager.instance = new RouteTraceManager();
    }
    return RouteTraceManager.instance;
  }

  public collectFragment(stageId: string, fragmentKey: string): RouteTrace {
    const existingStageTrace = this.traces.find((trace) => trace.stageId === stageId);

    if (existingStageTrace) {
      return existingStageTrace;
    }

    const metadata = routeTraceMetadataByFragmentKey[fragmentKey] || {
      direction: 'unknown' satisfies RouteDirection,
      hiddenSymbol: '',
    };
    const trace: RouteTrace = {
      id: createTraceId(stageId, fragmentKey),
      stageId,
      direction: metadata.direction,
      hiddenSymbol: metadata.hiddenSymbol,
      fragmentKey,
      collected: true,
    };

    this.traces.push(trace);
    this.save();
    return trace;
  }

  public getCollectedFragments(): RouteTrace[] {
    return this.traces.filter((trace) => trace.collected).map((trace) => ({ ...trace }));
  }

  public reset() {
    this.traces = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.traces));
  }

  private load() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      this.traces = [];
      return;
    }

    try {
      const parsed = JSON.parse(saved) as unknown;
      this.traces = Array.isArray(parsed) ? parsed.filter(isRouteTrace) : [];
    } catch {
      this.reset();
    }
  public getCollectedFragments(): CollectedRouteFragments {
    const completedNodeIds = this.progress.getCompletedNodeIds();

    return FRAGMENT_DEFINITIONS.reduce<CollectedRouteFragments>((fragments, fragment) => {
      fragments[fragment.id] = {
        ...fragment,
        position: { ...fragment.position },
        collected: completedNodeIds.includes(fragment.sourceNodeId),
      };
      return fragments;
    }, {} as CollectedRouteFragments);
  }

  public isRoutePuzzleUnlocked(): boolean {
    return this.progress.getCurrentNodeId() === 'stage4-route-gate'
      && this.progress.getCompletedNodeIds().includes('stage4-return-road');
  }
}
