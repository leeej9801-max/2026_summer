export class ProgressManager {
  private static instance: ProgressManager;
  private readonly STORAGE_KEY = 'road_game_current_cut';
  private currentCutIndex: number = 0;

  private constructor() {
    this.load();
  }

  public static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  public getCurrentCutIndex(): number {
    return this.currentCutIndex;
  }

  public setCutIndex(index: number) {
    this.currentCutIndex = index;
    this.save();
  }

  public reset() {
    this.currentCutIndex = 0;
    this.save();
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, this.currentCutIndex.toString());
  }

  private load() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved !== null) {
      this.currentCutIndex = parseInt(saved, 10);
    }
  }
}
