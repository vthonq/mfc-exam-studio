import { ECON_GLOSSARY, ECON_KNOWLEDGE } from '../data/economics';
import { GLOSSARY_TERMS, KNOWLEDGE_ITEMS } from '../data/knowledge';
import { PROB_CHAPTER_NOTES, PROB_GLOSSARY } from '../data/probStat';
import { CHAPTER_META, ECON_TOPIC_META, PROB_TOPIC_META, type SubjectId } from '../types';

export type FlashcardDeckKind = 'formulas' | 'glossary';

export interface FlashcardItem {
  id: string;
  subject: SubjectId;
  deck: FlashcardDeckKind;
  badge: string;
  front: string;
  frontSub?: string;
  backSummary: string;
  formulas?: string[];
  trap?: string;
}

export function buildFlashcardDeck(
  subject: SubjectId,
  deck: FlashcardDeckKind,
  bilingual: boolean,
): FlashcardItem[] {
  if (subject === 'mfc') {
    if (deck === 'glossary') {
      return GLOSSARY_TERMS.map((g, idx) => ({
        id: `mfc-gl-${idx}`,
        subject: 'mfc',
        deck: 'glossary',
        badge: CHAPTER_META[g.chapter].code,
        front: g.en,
        frontSub: bilingual ? g.vi : undefined,
        backSummary: g.note,
      }));
    }
    return KNOWLEDGE_ITEMS.map((item) => ({
      id: item.id,
      subject: 'mfc',
      deck: 'formulas',
      badge: `${CHAPTER_META[item.chapter].code} · ${item.section}`,
      front: item.title,
      frontSub: bilingual ? item.titleVi : undefined,
      backSummary: bilingual && item.summaryVi ? `${item.summary}\n${item.summaryVi}` : item.summary,
      formulas: item.formulas,
      trap: item.examTrap
        ? bilingual && item.examTrapVi
          ? `${item.examTrap} (${item.examTrapVi})`
          : item.examTrap
        : undefined,
    }));
  }

  if (subject === 'econ') {
    if (deck === 'glossary') {
      return ECON_GLOSSARY.map((g, idx) => ({
        id: `econ-gl-${idx}`,
        subject: 'econ',
        deck: 'glossary',
        badge: ECON_TOPIC_META[g.topic].quizTag,
        front: g.en,
        frontSub: bilingual ? g.vi : undefined,
        backSummary: g.note,
      }));
    }
    return ECON_KNOWLEDGE.map((card) => ({
      id: card.id,
      subject: 'econ',
      deck: 'formulas',
      badge: card.chapterLabel,
      front: card.title,
      frontSub: bilingual ? card.titleVi : undefined,
      backSummary: bilingual && card.summaryVi ? `${card.summary}\n${card.summaryVi}` : card.summary,
      formulas: card.formulas,
      trap: card.examTrap
        ? bilingual && card.examTrapVi
          ? `${card.examTrap} (${card.examTrapVi})`
          : card.examTrap
        : undefined,
    }));
  }

  if (deck === 'glossary') {
    return PROB_GLOSSARY.map((g, idx) => ({
      id: `ps-gl-${idx}`,
      subject: 'probstat',
      deck: 'glossary',
      badge: PROB_TOPIC_META[g.chapter].code,
      front: g.term,
      frontSub: bilingual ? g.termVi : undefined,
      backSummary: g.definition,
    }));
  }

  const cards: FlashcardItem[] = [];
  for (const note of PROB_CHAPTER_NOTES) {
    const chCode = PROB_TOPIC_META[note.topic].code;
    for (let i = 0; i < note.keyFormulas.length; i++) {
      const f = note.keyFormulas[i];
      cards.push({
        id: `${note.topic}-f-${i}`,
        subject: 'probstat',
        deck: 'formulas',
        badge: `${chCode} · Key Formula`,
        front: f.name,
        frontSub: bilingual ? note.titleVi : note.title,
        backSummary: f.note,
        formulas: [f.latex],
        trap: note.sbTableTip,
      });
    }
  }
  return cards;
}
