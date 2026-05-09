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
  }
}
