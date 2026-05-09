import { FIRST_NODE_ID } from '../data/storyNodes.ts';
import { GameProgress } from '../types/story.types.ts';

const STORAGE_KEY = 'road_game_progress_v2';

const emptyProgress = (): GameProgress => ({
  currentNodeId: FIRST_NODE_ID,
  completedNodeIds: [],
  usedHintIds: [],
  solvedGateIds: [],
  routeFragmentIds: [],
});

export class ProgressManager {
  private static instance: ProgressManager;
  private progress: GameProgress = emptyProgress();

  private constructor() {
    this.load();
  }

  public static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  public getCurrentNodeId(): string {
    return this.progress.currentNodeId;
  }

  public setCurrentNodeId(nodeId: string) {
    this.progress.currentNodeId = nodeId;
    this.save();
  }

  public markNodeComplete(nodeId: string) {
    if (!this.progress.completedNodeIds.includes(nodeId)) {
      this.progress.completedNodeIds.push(nodeId);
      this.save();
    }
  }

  public markGateSolved(nodeId: string) {
    if (!this.progress.solvedGateIds.includes(nodeId)) {
      this.progress.solvedGateIds.push(nodeId);
      this.save();
    }
  }

  public isGateSolved(nodeId: string): boolean {
    return this.progress.solvedGateIds.includes(nodeId);
  }

  public collectRouteFragment(fragmentId: string) {
    if (!this.progress.routeFragmentIds.includes(fragmentId)) {
      this.progress.routeFragmentIds.push(fragmentId);
      this.save();
    }
  }

  public getRouteFragmentIds(): string[] {
    return [...this.progress.routeFragmentIds];
  }

  public markHintUsed(hintId: string) {
    if (!this.progress.usedHintIds.includes(hintId)) {
      this.progress.usedHintIds.push(hintId);
      this.save();
    }
  }

  public getUsedHintIds(): string[] {
    return [...this.progress.usedHintIds];
  }

  public getCompletedNodeIds(): string[] {
    return [...this.progress.completedNodeIds];
  }

  public reset() {
    this.progress = emptyProgress();
    this.save();
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
  }

  private load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const legacyCut = localStorage.getItem('road_game_current_cut');

    if (!saved) {
      if (legacyCut !== null) {
        localStorage.removeItem('road_game_current_cut');
      }
      this.progress = emptyProgress();
      this.save();
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<GameProgress>;
      this.progress = {
        currentNodeId: parsed.currentNodeId || FIRST_NODE_ID,
        completedNodeIds: parsed.completedNodeIds || [],
        usedHintIds: parsed.usedHintIds || [],
        solvedGateIds: parsed.solvedGateIds || [],
        routeFragmentIds: parsed.routeFragmentIds || [],
      };
    } catch {
      this.progress = emptyProgress();
      this.save();
    }
  }
}
