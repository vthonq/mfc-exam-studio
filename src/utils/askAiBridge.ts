import type { SubjectId } from '../types';

export const ASK_AI_EVENT = 'exam-studio:ask-ai';

export interface AskAiPayload {
  subject?: SubjectId;
  prompt: string;
}

export function dispatchAskAi(payload: AskAiPayload): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AskAiPayload>(ASK_AI_EVENT, { detail: payload }));
}

export interface ExplainQuestionInput {
  topicLabel?: string;
  question: string;
  userAnswer?: string;
  expectedAnswer?: string;
  explanation?: string;
}

export function buildExplainQuestionPrompt(opts: ExplainQuestionInput): string {
  const lines: string[] = [];
  lines.push(
    opts.topicLabel
      ? `Please explain this ${opts.topicLabel} question step-by-step:`
      : 'Please explain this exam question step-by-step:',
  );
  lines.push('');
  lines.push(`Question: ${opts.question}`);

  const trimmedUser = opts.userAnswer?.trim();
  if (trimmedUser) {
    lines.push(`My answer: ${trimmedUser}`);
  }
  const trimmedExpected = opts.expectedAnswer?.trim();
  if (trimmedExpected) {
    lines.push(`Expected answer: ${trimmedExpected}`);
  }
  const trimmedExpl = opts.explanation?.trim();
  if (trimmedExpl) {
    lines.push(`Reference note: ${trimmedExpl}`);
  }

  lines.push('');
  lines.push(
    trimmedUser
      ? 'Walk through why the expected answer is right, point out where my answer went wrong, and highlight the key formula or exam trap to remember.'
      : 'Walk through the exact reasoning/formulas step-by-step and highlight the key exam trap to watch out for.',
  );
  return lines.join('\n');
}
