import React from 'react';
import { useApp } from '../context/AppContext';

interface BiTextProps {
  en: string;
  vi?: string;
  className?: string;
  viClassName?: string;
}

export const BiText: React.FC<BiTextProps> = ({
  en,
  vi,
  className = '',
  viClassName = 'text-xs text-slate-500 dark:text-slate-400 mt-0.5',
}) => {
  const { settings } = useApp();
  return (
    <div className={className}>
      <div>{en}</div>
      {settings.lang === 'bilingual' && vi && <div className={viClassName}>{vi}</div>}
    </div>
  );
};
