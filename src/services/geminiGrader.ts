import { GoogleGenAI } from '@google/genai';
import type { GeminiModelId } from '../types';

export interface ProofGradeInput {
  apiKey: string;
  model: GeminiModelId;
  prompt: string;
  studentProof: string;
  modelSolution: string;
  rubric: Array<{ label: string; points: number }>;
  bilingual: boolean;
}

export interface ProofGradeResult {
  score: number;
  maxScore: number;
  verdict: 'Full Credit' | 'Partial Credit' | 'Needs Revision';
  strengths: string[];
  issues: string[];
  missingJustifications: string[];
  improvedHint: string;
  feedbackVi?: string;
}

export async function gradeProofWithGemini(
  req: ProofGradeInput,
): Promise<ProofGradeResult> {
  const apiKey = req.apiKey.trim();
  if (!apiKey) {
    throw new Error('Please add your Gemini API key in Settings first.');
  }
  if (!req.studentProof.trim()) {
    throw new Error('Write your proof attempt before requesting AI grading.');
  }

  const maxScore = req.rubric.reduce((s, r) => s + r.points, 0);
  const rubricText = req.rubric
    .map((r, i) => `${i + 1}. (${r.points} pts) ${r.label}`)
    .join('\n');

  const client = new GoogleGenAI({ apiKey });

  const instruction = `You are a strict, encouraging Discrete Mathematics / Mathematics for Computing university grader.
Grade the student's proof against the problem, rubric, and reference solution.
Check for: logical validity, explicit hypotheses/assumptions, named rules of inference or theorems, quantifier scope, edge cases, and absence of circular reasoning or "proof by example" for universal claims.
Respond ONLY with valid JSON matching this exact shape (no markdown code fences if possible, just JSON):
{
  "score": number (between 0 and ${maxScore}),
  "maxScore": ${maxScore},
  "verdict": "Full Credit" | "Partial Credit" | "Needs Revision",
  "strengths": string[],
  "issues": string[],
  "missingJustifications": string[],
  "improvedHint": string${req.bilingual ? ',\n  "feedbackVi": string (concise Vietnamese summary of what was right and what to fix)' : ''}
}`;

  const userPrompt = `PROBLEM:
${req.prompt}

RUBRIC (Total ${maxScore} pts):
${rubricText}

REFERENCE SOLUTION:
${req.modelSolution}

STUDENT PROOF:
${req.studentProof}`;

  try {
    const interaction = await client.interactions.create({
      model: req.model,
      system_instruction: instruction,
      input: userPrompt,
      store: false,
      response_format: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          maxScore: { type: 'number' },
          verdict: { type: 'string', enum: ['Full Credit', 'Partial Credit', 'Needs Revision'] },
          strengths: { type: 'array', items: { type: 'string' } },
          issues: { type: 'array', items: { type: 'string' } },
          missingJustifications: { type: 'array', items: { type: 'string' } },
          improvedHint: { type: 'string' },
          ...(req.bilingual ? { feedbackVi: { type: 'string' } } : {}),
        },
        required: ['score', 'maxScore', 'verdict', 'strengths', 'issues', 'missingJustifications', 'improvedHint'],
      },
    });

    const rawText = (interaction.output_text ?? '').trim();
    if (!rawText) {
      throw new Error('Gemini returned an empty response. Try again or switch model in Settings.');
    }
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned) as ProofGradeResult;
    return {
      score: Math.min(maxScore, Math.max(0, Number(parsed.score) || 0)),
      maxScore,
      verdict: parsed.verdict || 'Partial Credit',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      missingJustifications: Array.isArray(parsed.missingJustifications)
        ? parsed.missingJustifications
        : [],
      improvedHint: parsed.improvedHint || '',
      feedbackVi: parsed.feedbackVi,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('401') || msg.includes('403') || /api key/i.test(msg)) {
      throw new Error('Invalid or unauthorized Gemini API key. Check your key in Settings.');
    }
    if (msg.includes('429') || /quota|rate/i.test(msg)) {
      throw new Error('Gemini API quota/rate limit reached. Wait a moment or try Gemini 4 Hydrogen in Settings.');
    }
    throw new Error(`AI grading failed: ${msg}`);
  }
}
