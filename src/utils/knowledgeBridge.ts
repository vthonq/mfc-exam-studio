import { GLOSSARY_TERMS, KNOWLEDGE_ITEMS } from '../data/knowledge';
import { ECON_GLOSSARY, ECON_KNOWLEDGE } from '../data/economics';
import { PROB_CHAPTER_NOTES, PROB_GLOSSARY } from '../data/probStat';
import type { SubjectId } from '../types';

export interface MatchedKnowledgeSnippet {
  id: string;
  badge: string;
  title: string;
  block: string;
}

interface SearchableEntry extends MatchedKnowledgeSnippet {
  searchableTitle: string;
  searchableBody: string;
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'what',
  'when',
  'how',
  'why',
  'which',
  'into',
  'are',
  'was',
  'were',
  'have',
  'has',
  'can',
  'does',
  'not',
  'all',
  'use',
  'using',
  'explain',
  'step',
  'steps',
  'help',
  'review',
  'cua',
  'nhu',
  'khi',
  'cho',
  'voi',
  'trong',
  'la',
  'va',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_]+/gu, ' ')
    .split(/\s+/)
    .filter((tok) => tok.length >= 2 && !STOP_WORDS.has(tok));
}

function getEntriesForSubject(subject: SubjectId): SearchableEntry[] {
  if (subject === 'mfc') {
    return KNOWLEDGE_ITEMS.map((item) => {
      const badge = `${item.chapter.toUpperCase()} · ${item.section}`;
      const formulasLine =
        item.formulas.length > 0 ? `Formulas: ${item.formulas.join(' ; ')}` : '';
      const trapLine = item.examTrap ? `Exam Trap: ${item.examTrap}` : '';
      const block = [`[${badge}] ${item.title}`, item.summary, formulasLine, trapLine]
        .filter(Boolean)
        .join('\n');
      return {
        id: item.id,
        badge,
        title: item.title,
        block,
        searchableTitle: `${badge} ${item.title} ${item.titleVi}`.toLowerCase(),
        searchableBody: `${item.summary} ${item.summaryVi} ${item.formulas.join(' ')} ${item.examTrap ?? ''} ${item.examTrapVi ?? ''}`.toLowerCase(),
      };
    });
  }

  if (subject === 'econ') {
    return ECON_KNOWLEDGE.map((card) => {
      const badge = `${card.chapterLabel}`;
      const formulasLine =
        card.formulas.length > 0 ? `Formulas: ${card.formulas.join(' ; ')}` : '';
      const trapLine = card.examTrap ? `Exam Trap: ${card.examTrap}` : '';
      const block = [`[${badge}] ${card.title}`, card.summary, formulasLine, trapLine]
        .filter(Boolean)
        .join('\n');
      return {
        id: card.id,
        badge,
        title: card.title,
        block,
        searchableTitle: `${card.topic} ${badge} ${card.title} ${card.titleVi}`.toLowerCase(),
        searchableBody: `${card.summary} ${card.summaryVi} ${card.formulas.join(' ')} ${card.examTrap ?? ''} ${card.examTrapVi ?? ''}`.toLowerCase(),
      };
    });
  }

  return PROB_CHAPTER_NOTES.map((note, idx) => {
    const badge = `Ch. ${idx + 1}`;
    const formulasLine =
      note.keyFormulas.length > 0
        ? `Key Formulas:\n${note.keyFormulas
            .map((f) => `- ${f.name}: $${f.latex}$ (${f.note})`)
            .join('\n')}`
        : '';
    const block = [
      `[${badge}] ${note.title}`,
      note.summary,
      formulasLine,
      `SB Table Tip: ${note.sbTableTip}`,
    ]
      .filter(Boolean)
      .join('\n');
    return {
      id: note.topic,
      badge,
      title: note.title,
      block,
      searchableTitle: `${note.topic} ${badge} ${note.title} ${note.titleVi}`.toLowerCase(),
      searchableBody: `${note.summary} ${note.sbTableTip} ${note.keyFormulas
        .map((f) => `${f.name} ${f.latex} ${f.note}`)
        .join(' ')}`.toLowerCase(),
    };
  });
}

export function getMatchedKnowledgeSnippets(
  subject: SubjectId,
  query: string,
  maxItems = 3,
): MatchedKnowledgeSnippet[] {
  const entries = getEntriesForSubject(subject);
  const tokens = tokenize(query);

  if (tokens.length === 0) {
    return entries.slice(0, Math.min(2, entries.length)).map(({ id, badge, title, block }) => ({
      id,
      badge,
      title,
      block,
    }));
  }

  const scored = entries.map((entry) => {
    let score = 0;
    for (const tok of tokens) {
      if (entry.searchableTitle.includes(tok)) {
        score += 4;
      } else if (entry.searchableBody.includes(tok)) {
        score += 1;
      }
    }
    return { entry, score };
  });

  const hits = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map((s) => s.entry);

  const selected = hits.length > 0 ? hits : entries.slice(0, Math.min(2, entries.length));
  return selected.map(({ id, badge, title, block }) => ({ id, badge, title, block }));
}

export function formatKnowledgeContextBlock(snippets: MatchedKnowledgeSnippet[]): string {
  if (snippets.length === 0) return '';
  return [
    '=== EXAM STUDIO COURSE NOTES (Use these exact course formulas & exam conventions) ===',
    ...snippets.map((s) => `- ${s.block}`),
    '=== END COURSE NOTES ===',
  ].join('\n\n');
}

export function getKnowledgeFileName(subject: SubjectId): string {
  if (subject === 'mfc') return 'ExamStudio-MFC-Knowledge.md';
  if (subject === 'econ') return 'ExamStudio-Economics-Knowledge.md';
  return 'ExamStudio-ProbStat-Knowledge.md';
}

export function buildSubjectKnowledgeMarkdown(subject: SubjectId, bilingual: boolean): string {
  const intro =
    '> Instructions for Gemini: Use this Exam Studio Hub knowledge file as the authoritative syllabus reference for exact formulas, textbook conventions, SB Tables/algorithms, and common exam traps.';

  if (subject === 'mfc') {
    const sections = KNOWLEDGE_ITEMS.map((item) => {
      const lines = [
        `## ${item.chapter.toUpperCase()} (${item.section}) — ${item.title}${
          bilingual ? ` / ${item.titleVi}` : ''
        }`,
        '',
        item.summary,
      ];
      if (bilingual) lines.push('', `*Tiếng Việt:* ${item.summaryVi}`);
      if (item.formulas.length > 0) {
        lines.push('', '**Key Formulas:**', ...item.formulas.map((f) => `- $$${f}$$`));
      }
      if (item.examTrap) {
        lines.push('', `**Exam Trap:** ${item.examTrap}`);
        if (bilingual && item.examTrapVi) {
          lines.push(`*Bẫy đi thi:* ${item.examTrapVi}`);
        }
      }
      return lines.join('\n');
    });

    const glossaryRows = GLOSSARY_TERMS.map(
      (g) => `| ${g.en} | ${g.vi} | ${g.chapter.toUpperCase()} | ${g.note} |`,
    );

    return [
      '# Exam Studio Hub — Mathematics for Computing (MFC) Knowledge Pack',
      '',
      intro,
      '',
      ...sections,
      '',
      '## EN–VI Glossary',
      '| Term (EN) | Thuật ngữ (VI) | Chapter | Note |',
      '|---|---|---|---|',
      ...glossaryRows,
      '',
    ].join('\n');
  }

  if (subject === 'econ') {
    const sections = ECON_KNOWLEDGE.map((card) => {
      const lines = [
        `## ${card.chapterLabel} (${card.topic.toUpperCase()}) — ${card.title}${
          bilingual ? ` / ${card.titleVi}` : ''
        }`,
        '',
        card.summary,
      ];
      if (bilingual) lines.push('', `*Tiếng Việt:* ${card.summaryVi}`);
      if (card.formulas.length > 0) {
        lines.push('', '**Key Formulas:**', ...card.formulas.map((f) => `- $$${f}$$`));
      }
      if (card.examTrap) {
        lines.push('', `**Exam Trap:** ${card.examTrap}`);
        if (bilingual && card.examTrapVi) {
          lines.push(`*Bẫy đi thi:* ${card.examTrapVi}`);
        }
      }
      return lines.join('\n');
    });

    const glossaryRows = ECON_GLOSSARY.map(
      (g) => `| ${g.en} | ${g.vi} | ${g.topic.toUpperCase()} | ${g.note} |`,
    );

    return [
      '# Exam Studio Hub — Principles of Macroeconomics (ECO101) Knowledge Pack',
      '',
      intro,
      '',
      ...sections,
      '',
      '## EN–VI Macroeconomics Glossary',
      '| Term (EN) | Thuật ngữ (VI) | Part | Definition |',
      '|---|---|---|---|',
      ...glossaryRows,
      '',
    ].join('\n');
  }

  const sections = PROB_CHAPTER_NOTES.map((note) => {
    const lines = [
      `## ${note.title}${bilingual ? ` / ${note.titleVi}` : ''}`,
      '',
      note.summary,
      '',
      '**Key Formulas:**',
      ...note.keyFormulas.map((f) => `- **${f.name}:** $${f.latex}$ — ${f.note}`),
      '',
      `**SB Table Tip:** ${note.sbTableTip}`,
    ];
    return lines.join('\n');
  });

  const glossaryRows = PROB_GLOSSARY.map(
    (g) => `| ${g.term} | ${g.termVi} | ${g.chapter} | ${g.definition} |`,
  );

  return [
    '# Exam Studio Hub — Probability & Statistical Methods (Ch. 1–5 · SB) Knowledge Pack',
    '',
    intro,
    '',
    ...sections,
    '',
    '## EN–VI Statistics Glossary',
    '| Term (EN) | Thuật ngữ (VI) | Chapter | Definition |',
    '|---|---|---|---|',
    ...glossaryRows,
    '',
  ].join('\n');
}
