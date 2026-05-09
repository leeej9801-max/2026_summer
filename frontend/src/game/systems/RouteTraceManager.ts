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
