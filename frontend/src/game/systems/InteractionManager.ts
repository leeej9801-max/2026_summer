import { InteractionGate } from '../types/story.types.ts';
import { ProgressManager } from './ProgressManager.ts';

const normalizeAnswer = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

export class InteractionManager {
  private progress = ProgressManager.getInstance();

  public isCorrect(gate: InteractionGate, answer: string): boolean {
    if (gate.type === 'physicalAction' && answer.trim() === '') return true;
    if (gate.type === 'messageInput' && answer.trim() === '') return true;

    const normalized = normalizeAnswer(answer);
    return (gate.answerKeys || []).some((key) => normalizeAnswer(key) === normalized);
  }

  public markHintUsed(hintId: string) {
    this.progress.markHintUsed(hintId);
  }

  public getUsedHintIds(): string[] {
    return this.progress.getUsedHintIds();
  }
}
