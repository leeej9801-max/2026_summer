import { FIRST_NODE_ID, storyNodeById } from '../data/storyNodes.ts';
import { StoryNode } from '../types/story.types.ts';
import { ProgressManager } from './ProgressManager.ts';
import { RouteTraceManager } from './RouteTraceManager.ts';

export class StoryFlowManager {
  private static instance: StoryFlowManager;
  private progress: ProgressManager;
  private routeTrace: RouteTraceManager;

  private constructor() {
    this.progress = ProgressManager.getInstance();
    this.routeTrace = RouteTraceManager.getInstance();
  }

  public static getInstance(): StoryFlowManager {
    if (!StoryFlowManager.instance) {
      StoryFlowManager.instance = new StoryFlowManager();
    }
    return StoryFlowManager.instance;
  }

  public getCurrentNode(): StoryNode {
    return storyNodeById.get(this.progress.getCurrentNodeId()) || storyNodeById.get(FIRST_NODE_ID)!;
  }

  public goToNode(nodeId: string) {
    if (!storyNodeById.has(nodeId)) {
      throw new Error(`Unknown story node: ${nodeId}`);
    }
    this.progress.setCurrentNodeId(nodeId);
  }

  public completeCurrentNode(): StoryNode | null {
    const current = this.getCurrentNode();
    this.progress.markNodeComplete(current.id);

    if (!current.nextNodeId) return null;
    this.goToNode(current.nextNodeId);
    return this.getCurrentNode();
  }

  public solveInteraction(nodeId: string, successNodeId: string) {
    const current = storyNodeById.get(nodeId);
    const fragmentKey = current?.interaction?.routeFragmentReward?.fragmentKey;

    if (fragmentKey) {
      this.routeTrace.collectFragment(current.stageId, fragmentKey);
    }

  public solveInteraction(nodeId: string, successNodeId: string, routeFragmentReward?: string) {
    this.progress.markGateSolved(nodeId);
    if (routeFragmentReward) {
      this.progress.collectRouteFragment(routeFragmentReward);
    }
    this.progress.markNodeComplete(nodeId);
    this.goToNode(successNodeId);
  }

  public resetProgress() {
    this.progress.reset();
  }
}
