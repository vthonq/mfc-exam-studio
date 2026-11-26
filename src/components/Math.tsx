import React from 'react';
import katex from 'katex';

interface MathProps {
  tex: string;
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathProps> = ({ tex, block = false, className = '' }) => {
  try {
    const html = katex.renderToString(tex, {
      displayMode: block,
      throwOnError: false,
      strict: false,
    });
    return (
      <span
        className={`${block ? 'block my-2 overflow-x-auto' : 'inline'} ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <code className={`font-mono text-xs ${className}`}>{tex}</code>;
  }
};

export type RichMathToken =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean }
  | { type: 'bold'; children: RichMathToken[] };

function parseInlineMathAndText(input: string): RichMathToken[] {
  const tokens: RichMathToken[] = [];
  let buf = '';
  let i = 0;

  const flushBuf = () => {
    if (buf.length > 0) {
      tokens.push({ type: 'text', value: buf });
      buf = '';
    }
  };

  while (i < input.length) {
    if (input[i] === '\\' && input[i + 1] === '$') {
      buf += '$';
      i += 2;
      continue;
    }

    if (input[i] === '$' && input[i + 1] === '$') {
      let j = i + 2;
      let found = -1;
      while (j < input.length - 1) {
        if (input[j] === '\\' && input[j + 1] === '$') {
          j += 2;
          continue;
        }
        if (input[j] === '$' && input[j + 1] === '$') {
          found = j;
          break;
        }
        j++;
      }
      if (found > i + 2) {
        flushBuf();
        tokens.push({ type: 'math', value: input.slice(i + 2, found).trim(), display: true });
        i = found + 2;
        continue;
      }
    }

    if (input[i] === '$' && input[i + 1] !== '$') {
      let j = i + 1;
      let found = -1;
      while (j < input.length) {
        if (input[j] === '\n') break;
        if (input[j] === '\\') {
          j += 2;
          continue;
        }
        if (input[j] === '$') {
          found = j;
          break;
        }
        j++;
      }
      const candidate = found > i + 1 ? input.slice(i + 1, found) : '';
      const looksLikePlainPrice = /^\d+(?:[.,]\d+)?\s/.test(candidate);
      if (found > i + 1 && !looksLikePlainPrice) {
        flushBuf();
        tokens.push({ type: 'math', value: candidate, display: false });
        i = found + 1;
        continue;
      }
    }

    buf += input[i];
    i++;
  }

  flushBuf();
  return tokens;
}

/** Tokenizes text containing $$...$$, $...$ (preserving escaped \$), and **bold**. */
export function parseRichMathTokens(input: string): RichMathToken[] {
  const out: RichMathToken[] = [];
  let idx = 0;

  while (idx < input.length) {
    const start = input.indexOf('**', idx);
    if (start === -1) {
      out.push(...parseInlineMathAndText(input.slice(idx)));
      break;
    }
    const end = input.indexOf('**', start + 2);
    if (end === -1) {
      out.push(...parseInlineMathAndText(input.slice(idx)));
      break;
    }
    const boldInner = input.slice(start + 2, end);
    if (boldInner.includes('\n')) {
      out.push(...parseInlineMathAndText(input.slice(idx, start + 2)));
      idx = start + 2;
      continue;
    }
    if (start > idx) {
      out.push(...parseInlineMathAndText(input.slice(idx, start)));
    }
    out.push({ type: 'bold', children: parseInlineMathAndText(boldInner) });
    idx = end + 2;
  }

  return out;
}

function renderTokenList(tokens: RichMathToken[], keyPrefix: string): React.ReactNode[] {
  return tokens.map((tok, i) => {
    const key = `${keyPrefix}-${i}`;
    if (tok.type === 'text') {
      return <React.Fragment key={key}>{tok.value}</React.Fragment>;
    }
    if (tok.type === 'math') {
      return <MathFormula key={key} tex={tok.value} block={tok.display} />;
    }
    return <strong key={key}>{renderTokenList(tok.children, key)}</strong>;
  });
}

export const RichMathText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const tokens = React.useMemo(() => parseRichMathTokens(text), [text]);
  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {renderTokenList(tokens, 'rmt')}
    </span>
  );
};
