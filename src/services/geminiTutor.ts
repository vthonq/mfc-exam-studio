import { GoogleGenAI } from '@google/genai';
import {
  formatKnowledgeContextBlock,
  getMatchedKnowledgeSnippets,
} from '../utils/knowledgeBridge';
import type { GeminiModelId, SubjectId } from '../types';

export interface GeminiModelOption {
  id: GeminiModelId;
  label: string;
  shortLabel: string;
  hint: string;
}

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: 'gemini-4-hydrogen',
    label: 'Gemini 4 Hydrogen (Fast & Balanced — Default)',
    shortLabel: 'Gemini 4 Hydrogen',
    hint: 'Best everyday balance of speed, math accuracy, and free-tier quota.',
  },
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite (Ultra-Fast / High Free Quota)',
    shortLabel: '3.5 Flash-Lite',
    hint: 'Lowest latency and highest throughput for rapid Q&A drills.',
  },
  {
    id: 'gemini-4-argon',
    label: 'Gemini 4 Argon (Deeper Reasoning)',
    shortLabel: 'Gemini 4 Argon',
    hint: 'Stronger multi-step reasoning for tricky proofs & derivations.',
  },
  {
    id: 'gemini-4-carbon',
    label: 'Gemini 4 Carbon (Strictest Proof & Exam Verification)',
    shortLabel: 'Gemini 4 Carbon',
    hint: 'Frontier depth for formal proofs, statistics pivots & policy checks.',
  },
];

export interface TutorImageAttachment {
  dataUrl: string;
  base64: string;
  mimeType: string;
  name: string;
}

const SUBJECT_SYLLABUS_CONTEXT: Record<SubjectId, string> = {
  mfc:
    'Discrete Mathematics / Mathematics for Computing (Ch. 1 Logic, quantifiers & proofs; Ch. 4 Number Theory, Euclidean/Extended GCD, binary modular exponentiation, CRT & cryptography; Ch. 9 Relations, Warshall transitive closure & posets/lattices; Ch. 10–11 Graphs, Dijkstra, Euler/Hamilton, trees & Prim/Kruskal MST; Ch. 12 Boolean Algebra & Karnaugh Maps).',
  econ:
    'UEH ECO101 Principles of Macroeconomics (Mankiw Parts 6–9, Ch. 23–26 & 28–35: GDP Deflator vs CPI, real vs nominal interest rates, National Saving & Loanable Funds, unemployment & labor force, fractional-reserve money multiplier & MV = PY, Open-Economy Twin Markets NCO = NX & PPP, AD–SRAS–LRAS shocks, fiscal multipliers, Liquidity Preference / Money Market & Phillips Curve / Sacrifice Ratio).',
  probstat:
    'Probability & Statistical Methods (UEH-ISB Ch. 1–5 & SB Statistical Tables Appendices C-1 to F: Discrete RVs [Binomial, Poisson, Geometric, Negative Binomial, Hypergeometric], Continuous RVs [Uniform, Normal, Exponential, Gamma, Chi-Square], Bivariate marginal/conditional distributions & covariance/correlation, Method of Moments & MLE, LLN/CLT & sampling distributions, Confidence Intervals & Hypothesis Testing with Z/t/χ² pivots and p-values).',
};

const SUBJECT_LABELS: Record<SubjectId, string> = {
  mfc: 'Math for Computing (MFC)',
  econ: 'Principles of Macroeconomics (ECO101)',
  probstat: 'Probability & Statistics (Ch. 1–5 · SB)',
};

export function buildTutorSystemPrompt(
  subject: SubjectId,
  routeLabel: string,
  bilingual: boolean,
  queryHint?: string,
): string {
  const syllabus = SUBJECT_SYLLABUS_CONTEXT[subject];
  const langRule = bilingual
    ? 'Respond clearly in structured English AND include concise Vietnamese exam tips / key technical terms in parentheses or a short "Tóm tắt tiếng Việt" takeaway when helpful.'
    : 'Respond clearly and concisely in structured English tailored for university exam prep.';

  const matched = getMatchedKnowledgeSnippets(subject, queryHint ?? '', 3);
  const notesBlock = formatKnowledgeContextBlock(matched);

  return [
    `You are "My Gemini AI Tutor", an expert, encouraging university exam study assistant embedded inside Exam Studio Hub.`,
    `Active Subject: ${SUBJECT_LABELS[subject]}. Current Section: ${routeLabel || 'Dashboard'}.`,
    `Syllabus Coverage: ${syllabus}`,
    `Formatting Rules:`,
    `1. Write mathematical expressions cleanly using LaTeX wrapped in single $...$ for inline formulas and $$...$$ on its own line for key display equations so the UI KaTeX renderer formats them crisply.`,
    `2. Show numbered step-by-step reasoning, name theorems/rules/table lookups explicitly, and highlight common exam traps.`,
    `3. ${langRule}`,
    notesBlock ? `\n${notesBlock}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildGeminiWebHandoffPrompt(
  subject: SubjectId,
  question: string,
  bilingual: boolean,
  includeKnowledge = true,
): string {
  const cleanQ = question.trim() || 'Help me review the key exam traps and formulas for this course.';
  const langLine = bilingual
    ? 'Please explain step by step in English and summarize key exam terms in Vietnamese.'
    : 'Please explain clearly step by step.';

  const notesBlock = includeKnowledge
    ? formatKnowledgeContextBlock(getMatchedKnowledgeSnippets(subject, cleanQ, 3))
    : '';

  return [
    `[Exam Studio Hub · ${SUBJECT_LABELS[subject]}]`,
    langLine,
    `Use LaTeX ($...$ / $$...$$) for formulas when needed.`,
    notesBlock ? `\n${notesBlock}` : '',
    '',
    `Question:`,
    cleanQ,
  ]
    .filter((line) => line !== undefined)
    .join('\n');
}

function formatGeminiError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('401') || msg.includes('403') || /api.?key|permission|unauthorized/i.test(msg)) {
    return new Error('Invalid or unauthorized Gemini API key. Check your key from Google AI Studio.');
  }
  if (msg.includes('429') || /quota|rate|resource_exhausted/i.test(msg)) {
    return new Error(
      'Gemini API rate/quota limit reached. Wait a moment or switch to Gemini 3.5 Flash-Lite / Gemini 4 Hydrogen.',
    );
  }
  return new Error(`Gemini request failed: ${msg}`);
}

export async function testGeminiConnection(
  apiKey: string,
  model: GeminiModelId,
): Promise<{ ok: boolean; latencyMs: number; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return {
      ok: false,
      latencyMs: 0,
      message: 'Please paste your Gemini API key from aistudio.google.com first.',
    };
  }

  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  try {
    const client = new GoogleGenAI({ apiKey: cleanKey });
    const interaction = await client.interactions.create({
      model,
      input: 'Reply with OK.',
      store: false,
    });
    const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const latencyMs = Math.max(1, Math.round(endedAt - startedAt));
    const reply = (interaction.output_text ?? '').trim();
    return {
      ok: true,
      latencyMs,
      message: reply
        ? `Connected to ${model} (${latencyMs} ms).`
        : `Connected to ${model} (${latencyMs} ms).`,
    };
  } catch (err) {
    const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const latencyMs = Math.max(0, Math.round(endedAt - startedAt));
    return {
      ok: false,
      latencyMs,
      message: formatGeminiError(err).message,
    };
  }
}

export interface StreamGeminiTutorParams {
  apiKey: string;
  model: GeminiModelId;
  subject: SubjectId;
  routeLabel: string;
  bilingual: boolean;
  prompt: string;
  image?: TutorImageAttachment | null;
  previousInteractionId?: string;
  onChunk: (accumulatedText: string) => void;
  signal?: AbortSignal;
}

export async function streamGeminiTutor(
  params: StreamGeminiTutorParams,
): Promise<{ text: string; interactionId?: string }> {
  const apiKey = params.apiKey.trim();
  if (!apiKey) {
    throw new Error('Please add your free Google AI Studio API key first.');
  }
  const cleanPrompt = params.prompt.trim();
  if (!cleanPrompt && !params.image) {
    throw new Error('Enter a question or paste a screenshot before sending.');
  }

  const client = new GoogleGenAI({ apiKey });
  const systemInstruction = buildTutorSystemPrompt(
    params.subject,
    params.routeLabel,
    params.bilingual,
    cleanPrompt,
  );

  const inputPayload = params.image
    ? [
        {
          type: 'text' as const,
          text: cleanPrompt || 'Please analyze this study problem step by step.',
        },
        {
          type: 'image' as const,
          data: params.image.base64,
          mime_type: params.image.mimeType,
        },
      ]
    : cleanPrompt;

  let fullText = '';
  let interactionId = params.previousInteractionId;

  try {
    const stream = await client.interactions.create({
      model: params.model,
      system_instruction: systemInstruction,
      input: inputPayload,
      ...(params.previousInteractionId
        ? { previous_interaction_id: params.previousInteractionId }
        : {}),
      store: true,
      stream: true,
    });

    for await (const event of stream) {
      if (params.signal?.aborted) {
        break;
      }
      if (event.event_type === 'interaction.created' || event.event_type === 'interaction.completed') {
        const maybeId = (event as { interaction?: { id?: string } }).interaction?.id;
        if (maybeId) {
          interactionId = maybeId;
        }
      } else if (event.event_type === 'step.delta') {
        if (event.delta?.type === 'text' && event.delta.text) {
          fullText += event.delta.text;
          params.onChunk(fullText);
        }
      }
    }

    if (!fullText && !params.signal?.aborted) {
      throw new Error('Gemini returned an empty response. Try again or switch model.');
    }

    return { text: fullText, interactionId };
  } catch (err) {
    if (params.signal?.aborted) {
      return { text: fullText, interactionId };
    }
    throw formatGeminiError(err);
  }
}
