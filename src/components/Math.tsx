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
