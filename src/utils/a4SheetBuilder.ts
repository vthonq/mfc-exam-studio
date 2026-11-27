import { ECON_KNOWLEDGE } from '../data/economics';
import { KNOWLEDGE_ITEMS } from '../data/knowledge';
import { PROB_CHAPTER_NOTES } from '../data/probStat';
import { CHAPTER_META, PROB_TOPIC_META, type ProgressState, type SubjectId } from '../types';

export type A4Density = 'compact' | 'standard';

export interface A4CardItem {
  id: string;
  subject: SubjectId;
  topicId: string;
  topicLabel: string;
  title: string;
  titleVi: string;
  summary: string;
  formulas: string[];
  trap?: string;
}

export function getA4Catalog(subject: SubjectId, bilingual: boolean): A4CardItem[] {
  if (subject === 'mfc') {
    return KNOWLEDGE_ITEMS.map((item) => ({
      id: item.id,
      subject: 'mfc',
      topicId: item.chapter,
      topicLabel: CHAPTER_META[item.chapter].code,
      title: item.title,
      titleVi: item.titleVi,
      summary: bilingual ? item.summaryVi : item.summary,
      formulas: item.formulas,
      trap: bilingual ? item.examTrapVi || item.examTrap : item.examTrap,
    }));
  }

  if (subject === 'econ') {
    return ECON_KNOWLEDGE.map((item) => ({
      id: item.id,
      subject: 'econ',
      topicId: item.topic,
      topicLabel: item.chapterLabel,
      title: item.title,
      titleVi: item.titleVi,
      summary: bilingual ? item.summaryVi : item.summary,
      formulas: item.formulas,
      trap: bilingual ? item.examTrapVi || item.examTrap : item.examTrap,
    }));
  }

  const out: A4CardItem[] = [];
  for (const note of PROB_CHAPTER_NOTES) {
    const code = PROB_TOPIC_META[note.topic].code;
    note.keyFormulas.forEach((f, idx) => {
      out.push({
        id: `${note.topic}-f${idx}`,
        subject: 'probstat',
        topicId: note.topic,
        topicLabel: code,
        title: f.name,
        titleVi: f.name,
        summary: f.note,
        formulas: [f.latex],
      });
    });
    if (note.sbTableTip) {
      out.push({
        id: `${note.topic}-sb-tip`,
        subject: 'probstat',
        topicId: note.topic,
        topicLabel: code,
        title: `${code} · SB Table Lookup Tip`,
        titleVi: `${code} · Mẹo tra bảng SB`,
        summary: '',
        formulas: [],
        trap: note.sbTableTip,
      });
    }
  }
  return out;
}

export function getWeakTopicIds(subject: SubjectId, progress: ProgressState): Set<string> {
  const entries =
    subject === 'mfc'
      ? Object.entries(progress.mastery)
      : subject === 'econ'
        ? Object.entries(progress.econMastery)
        : Object.entries(progress.probMastery);

  const weak = entries
    .filter(([, m]) => m.attempts === 0 || (m.correct / m.attempts) * 100 < 75)
    .map(([id]) => id);

  if (weak.length > 0) {
    return new Set(weak);
  }
  return new Set(entries.map(([id]) => id));
}

export function estimateA4Pages(
  items: A4CardItem[],
  density: A4Density,
  includeSummaries: boolean,
  includeTraps: boolean,
): number {
  if (items.length === 0) return 0;
  let weight = 0;
  for (const item of items) {
    weight +=
      1 +
      item.formulas.length * 0.55 +
      (includeSummaries && item.summary ? 0.55 : 0) +
      (includeTraps && item.trap ? 0.45 : 0);
  }
  const capacity = density === 'compact' ? 19 : 13;
  return Math.max(0.2, Math.round((weight / capacity) * 10) / 10);
}
