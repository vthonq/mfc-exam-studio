import type { CustomFlashcard, SubjectId } from '../types';

function cleanStr(val: unknown, maxLen: number): string {
  return typeof val === 'string' ? val.trim().slice(0, maxLen) : '';
}

export function parseCustomCardsInput(raw: string, subject: SubjectId): CustomFlashcard[] {
  let trimmed = raw.trim();
  if (!trimmed) return [];

  // Strip optional markdown code fences (e.g. ```json ... ```)
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    trimmed = fenceMatch[1].trim();
  }

  const nowIso = new Date().toISOString();
  const cards: CustomFlashcard[] = [];
  const makeId = (idx: number) =>
    `custom-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`;

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      const arr = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as { cards?: unknown }).cards)
          ? (parsed as { cards: unknown[] }).cards
          : null;

      if (arr) {
        arr.forEach((item, idx) => {
          if (!item || typeof item !== 'object') return;
          const obj = item as Record<string, unknown>;
          const front = cleanStr(obj.front ?? obj.question ?? obj.term, 300);
          const back = cleanStr(obj.back ?? obj.answer ?? obj.definition, 800);
          if (!front || !back) return;
          const badge = cleanStr(obj.badge ?? obj.topic ?? obj.chapter, 40) || 'My Note';
          const trap = cleanStr(obj.trap ?? obj.note ?? obj.examTrap, 240);
          cards.push({
            id: makeId(idx),
            subject,
            badge,
            front,
            back,
            ...(trap ? { trap } : {}),
            createdAtIso: nowIso,
          });
        });
        if (cards.length > 0) return cards.slice(0, 150);
      }
    } catch {
      // Fall through to line-by-line parser
    }
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  lines.forEach((line, idx) => {
    const parts = line.includes('::')
      ? line.split('::').map((p) => p.trim())
      : line.split('|').map((p) => p.trim());
    if (parts.length < 2) return;
    const front = cleanStr(parts[0], 300);
    const back = cleanStr(parts[1], 800);
    if (!front || !back) return;
    const trap = parts[2] ? cleanStr(parts[2], 240) : '';
    cards.push({
      id: makeId(idx),
      subject,
      badge: 'My Note',
      front,
      back,
      ...(trap ? { trap } : {}),
      createdAtIso: nowIso,
    });
  });

  return cards.slice(0, 150);
}

export function buildAiFlashcardImportPrompt(subject: SubjectId, bilingual: boolean): string {
  const courseLabel =
    subject === 'mfc'
      ? 'Mathematics for Computing (MFC)'
      : subject === 'econ'
        ? 'Principles of Macroeconomics (ECO101)'
        : 'Probability & Statistical Methods';

  return [
    `Convert the lecture notes or past exam problems below for ${courseLabel} into flashcards.`,
    'Return ONLY a raw JSON array of objects using this exact schema (use $...$ around LaTeX formulas):',
    '[{"badge":"Topic/Ch.","front":"Question or concept","back":"Clear concise answer or formula","trap":"Optional common exam trap"}]',
    bilingual
      ? 'Keep key English exam terms intact and add brief Vietnamese hints inside "back" where helpful.'
      : 'Write concise, high-yield university exam wording.',
    '',
    '=== PASTE YOUR NOTES OR SCREENSHOT HERE ===',
  ].join('\n');
}
