import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RichMathText } from './Math';
import {
  GEMINI_MODEL_OPTIONS,
  buildGeminiWebHandoffPrompt,
  streamGeminiTutor,
  testGeminiConnection,
  type TutorImageAttachment,
} from '../services/geminiTutor';
import type { GeminiModelId, SubjectId } from '../types';

interface GeminiTutorDrawerProps {
  open: boolean;
  onClose: () => void;
  subject: SubjectId;
  routeLabel: string;
}

interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageDataUrl?: string;
  imageName?: string;
}

const SUBJECT_BADGES: Record<SubjectId, { label: string; cls: string }> = {
  mfc: {
    label: 'MFC',
    cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  econ: {
    label: 'Economics',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  probstat: {
    label: 'Prob & Stat',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
};

const QUICK_STARTERS: Record<SubjectId, string[]> = {
  mfc: [
    'Explain ¬(∀x P(x)) vs ∃x ¬P(x) with an exam trap example',
    'Walk me through Extended GCD & modular inverse step-by-step',
    "How do I run Warshall's algorithm W_k without mistakes?",
    'Explain Dijkstra vs Prim/Kruskal and when to use each',
  ],
  econ: [
    'Compare GDP Deflator vs CPI substitution bias with an example',
    'Trace a government budget deficit in the Open-Economy Twin Markets',
    'Explain an adverse supply shock (stagflation) in AD–AS & SRPC',
    'Walk through Spending Multiplier vs Tax Multiplier & Crowding Out',
  ],
  probstat: [
    'When do I use Binomial vs Poisson vs Hypergeometric vs Geometric?',
    'How do I look up z, t, and χ² critical values in SB Tables C-2/D/E?',
    'Explain MoM vs MLE estimation steps for Ch. 4',
    'Compare Type I/II error, p-value, and Power in Ch. 5',
  ],
};

function chatStorageKey(subject: SubjectId): string {
  return `exam_studio_gemini_chat_v1:${subject}`;
}

function loadSessionChat(subject: SubjectId): TutorMessage[] {
  try {
    const raw = sessionStorage.getItem(chatStorageKey(subject));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is TutorMessage =>
        Boolean(m) &&
        typeof m.id === 'string' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.text === 'string',
    );
  } catch {
    return [];
  }
}

function saveSessionChat(subject: SubjectId, messages: TutorMessage[]): void {
  try {
    const compact = messages.slice(-20).map((m) => ({
      id: m.id,
      role: m.role,
      text: m.text,
      ...(m.imageName ? { imageName: m.imageName } : {}),
    }));
    sessionStorage.setItem(chatStorageKey(subject), JSON.stringify(compact));
  } catch {
    // ignore storage quota errors
  }
}

export const GeminiTutorDrawer: React.FC<GeminiTutorDrawerProps> = ({
  open,
  onClose,
  subject,
  routeLabel,
}) => {
  const { settings, setGeminiKey, setGeminiModel } = useApp();

  const [messages, setMessages] = useState<TutorMessage[]>(() => loadSessionChat(subject));
  const [previousInteractionId, setPreviousInteractionId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<TutorImageAttachment | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [setupOpen, setSetupOpen] = useState<boolean>(() => !settings.geminiKey.trim());
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [webCopiedNotice, setWebCopiedNotice] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const keyInputRef = useRef<HTMLInputElement | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  // Switch chat history cleanly when active subject changes
  useEffect(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages(loadSessionChat(subject));
    setPreviousInteractionId(undefined);
    setErrorMsg(null);
  }, [subject]);

  // Persist messages per subject in sessionStorage
  useEffect(() => {
    saveSessionChat(subject, messages);
  }, [messages, subject]);

  // Keep latest message scrolled into view while chatting/streaming
  useEffect(() => {
    if (open) {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, open, streaming]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const hasKey = Boolean(settings.geminiKey.trim());
  const badge = SUBJECT_BADGES[subject];

  const handleImageFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please attach an image file (PNG, JPEG, WebP, etc.).');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Image is larger than 4 MB. Please use a smaller screenshot.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = dataUrl.indexOf(',');
      if (!dataUrl || commaIdx === -1) return;
      const base64 = dataUrl.slice(commaIdx + 1);
      setImage({
        dataUrl,
        base64,
        mimeType: file.type || 'image/png',
        name: file.name || 'screenshot.png',
      });
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleImageFile(file);
          return;
        }
      }
    }
  };

  const handleResetChat = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages([]);
    setPreviousInteractionId(undefined);
    setErrorMsg(null);
    saveSessionChat(subject, []);
  };

  const handleTestKey = async () => {
    setTestingKey(true);
    setTestResult(null);
    const res = await testGeminiConnection(settings.geminiKey, settings.geminiModel);
    setTestResult({ ok: res.ok, text: res.message });
    setTestingKey(false);
  };

  const handleSend = async (overridePrompt?: string) => {
    const promptText = (overridePrompt ?? input).trim();
    if (!promptText && !image) return;

    if (!settings.geminiKey.trim()) {
      setSetupOpen(true);
      setErrorMsg(
        'Paste your free Google AI Studio key above to chat inside the app — or click "Gemini Web ↗" below to open your regular Gemini with this prompt!',
      );
      window.setTimeout(() => keyInputRef.current?.focus(), 60);
      return;
    }

    const userMsg: TutorMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: promptText || 'Please solve/explain the attached screenshot.',
      imageDataUrl: image?.dataUrl,
      imageName: image?.name,
    };
    const assistantId = `a-${Date.now()}`;
    const pendingImg = image;

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '' }]);
    if (!overridePrompt) setInput('');
    setImage(null);
    setErrorMsg(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await streamGeminiTutor({
        apiKey: settings.geminiKey,
        model: settings.geminiModel,
        subject,
        routeLabel,
        bilingual: settings.lang === 'bilingual',
        prompt: promptText,
        image: pendingImg,
        previousInteractionId,
        signal: controller.signal,
        onChunk: (accumulated) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: accumulated } : m)),
          );
        },
      });
      if (result.interactionId) {
        setPreviousInteractionId(result.interactionId);
      }
      if (!result.text) {
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setMessages((prev) =>
        prev.filter((m) => !(m.id === assistantId && !m.text.trim())),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleOpenGeminiWeb = async () => {
    const payload = buildGeminiWebHandoffPrompt(
      subject,
      input,
      settings.lang === 'bilingual',
    );
    try {
      await navigator.clipboard.writeText(payload);
      setWebCopiedNotice(true);
      window.setTimeout(() => setWebCopiedNotice(false), 2600);
    } catch {
      // ignore clipboard restrictions
    }
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = async (msg: TutorMessage) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedMsgId(msg.id);
      window.setTimeout(() => setCopiedMsgId(null), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex justify-end"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        aria-label="My Gemini AI Tutor"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm truncate">My Gemini AI Tutor</h2>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {routeLabel}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSetupOpen((v) => !v)}
                className={`relative p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  setupOpen
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Configure your Gemini API Key"
                aria-label="Configure Gemini API Key"
              >
                <KeyRound className="w-4 h-4" />
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                    hasKey ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="New Chat"
                aria-label="New Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Close Tutor"
                aria-label="Close Tutor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <select
              value={settings.geminiModel}
              onChange={(e) => {
                setGeminiModel(e.target.value as GeminiModelId);
                setPreviousInteractionId(undefined);
              }}
              aria-label="Select Gemini Model"
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
            >
              {GEMINI_MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSetupOpen((v) => !v)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border shrink-0 cursor-pointer ${
                hasKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {hasKey ? '● Connected' : '○ No Key'}
            </button>
          </div>
        </div>

        {/* Collapsible Connect Your Own Gemini Panel */}
        {setupOpen && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs shrink-0 animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Use Your Own Gemini (BYOK)
              </span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Get Free Key at Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  ref={keyInputRef}
                  type={showKey ? 'text' : 'password'}
                  value={settings.geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="Paste AIza... key here"
                  className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showKey ? 'Hide API Key' : 'Show API Key'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {hasKey && (
                <button
                  type="button"
                  onClick={() => {
                    setGeminiKey('');
                    setTestResult(null);
                  }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="Clear API Key"
                  aria-label="Clear API Key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                disabled={testingKey}
                onClick={() => void handleTestKey()}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-xs inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                {testingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Test Key
              </button>
            </div>

            {testResult && (
              <div
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                  testResult.ok
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {testResult.text}
              </div>
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Stored <strong>strictly in your browser</strong> (never sent to our server). Unlocks live AI chat + in-app proof/essay grading. No API key? Type below &amp; click{' '}
              <strong>Gemini Web ↗</strong>!
            </p>
          </div>
        )}

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 via-sky-50 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 space-y-1.5">
                <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
                  {settings.lang === 'bilingual'
                    ? 'Hỏi đáp & giải đề 3 môn trực tiếp với Gemini của bạn'
                    : 'Ask questions or paste exam screenshots directly'}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {settings.lang === 'bilingual'
                    ? 'Hỗ trợ gõ câu hỏi, dán ảnh chụp đề bài (Ctrl+V) và hiển thị công thức toán KaTeX. Nhấn thử một gợi ý bên dưới:'
                    : 'Type a question or Ctrl+V paste a screenshot of any problem. Try a quick starter below:'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Quick Starters ({badge.label})
                </div>
                {QUICK_STARTERS[subject].map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    disabled={streaming}
                    onClick={() => void handleSend(starter)}
                    className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 text-xs text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-sm'
                  }`}
                >
                  {msg.imageDataUrl ? (
                    <img
                      src={msg.imageDataUrl}
                      alt={msg.imageName || 'Attached question'}
                      className="max-h-40 rounded-lg mb-2 border border-white/20 object-contain"
                    />
                  ) : msg.imageName ? (
                    <div className="text-[10px] opacity-80 mb-1 font-mono">
                      [Image: {msg.imageName}]
                    </div>
                  ) : null}

                  {msg.role === 'assistant' ? (
                    msg.text ? (
                      <RichMathText text={msg.text} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Thinking...
                      </span>
                    )
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                  )}
                </div>

                {msg.role === 'assistant' && msg.text && (
                  <button
                    type="button"
                    onClick={() => void handleCopyMessage(msg)}
                    className="mt-1 px-2 py-0.5 rounded-md text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMsgId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          )}
          <div ref={feedEndRef} />
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2 shrink-0">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-700 shrink-0 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Composer Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0 bg-white dark:bg-slate-900">
          {image && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <span className="text-[11px] font-mono truncate text-slate-600 dark:text-slate-300">
                  {image.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setImage(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                title="Remove image"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleImageFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={streaming}
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 cursor-pointer shrink-0"
              title="Attach screenshot or paste Ctrl+V"
              aria-label="Attach image"
            >
              <ImagePlus className="w-4 h-4" />
            </button>

            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!streaming) void handleSend();
                }
              }}
              placeholder="Ask Gemini or paste screenshot (Ctrl+V)... Enter to send"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => void handleOpenGeminiWeb()}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
              title="Copy question & open gemini.google.com in a new tab (works without an API key)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              {webCopiedNotice ? 'Copied! Opening...' : 'Gemini Web ↗'}
            </button>

            {streaming ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSend()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
