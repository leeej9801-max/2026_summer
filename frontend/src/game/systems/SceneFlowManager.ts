import { scenarioSteps } from '../data/scenario.ts';
import { ProgressManager } from './ProgressManager.ts';

export class SceneFlowManager {
  private static instance: SceneFlowManager;
  private progress: ProgressManager;

  private constructor() {
    this.progress = ProgressManager.getInstance();
  }

  public static getInstance(): SceneFlowManager {
    if (!SceneFlowManager.instance) {
      SceneFlowManager.instance = new SceneFlowManager();
    }
    return SceneFlowManager.instance;
  }

  public getCurrentStep() {
    const index = this.progress.getCurrentCutIndex();
    return scenarioSteps[index] || scenarioSteps[0];
  }

  public nextStep(): boolean {
    const currentIndex = this.progress.getCurrentCutIndex();
    if (currentIndex < scenarioSteps.length - 1) {
      this.progress.setCutIndex(currentIndex + 1);
      return true;
    }
    return false;
  }

  public resetProgress() {
    this.progress.reset();
  }

  public isLastStep(): boolean {
    return this.progress.getCurrentCutIndex() === scenarioSteps.length - 1;
  }
}
