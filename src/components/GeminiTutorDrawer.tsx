import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  ImagePlus,
  KeyRound,
  Loader2,
  Maximize2,
  Minimize2,
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
import {
  buildSubjectKnowledgeMarkdown,
  getKnowledgeFileName,
  getMatchedKnowledgeSnippets,
} from '../utils/knowledgeBridge';
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

function copyTextToClipboard(text: string): boolean {
  let ok = false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ok = document.execCommand('copy');
    document.body.removeChild(ta);
  } catch {
    ok = false;
  }
  try {
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).catch(() => {});
      if (!ok) ok = true;
    }
  } catch {
    // ignore async clipboard errors
  }
  return ok;
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

  const [activeTab, setActiveTab] = useState<'api' | 'web'>('api');
  const [expanded, setExpanded] = useState(false);

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

  const [webPrompt, setWebPrompt] = useState('');
  const [webStatus, setWebStatus] = useState<string | null>(null);
  const [includeWebKnowledge, setIncludeWebKnowledge] = useState(true);
  const [previewPromptOpen, setPreviewPromptOpen] = useState(false);

  const matchedWebSnippets = useMemo(
    () => getMatchedKnowledgeSnippets(subject, webPrompt, 3),
    [subject, webPrompt],
  );

  const exactWebPrompt = useMemo(
    () =>
      buildGeminiWebHandoffPrompt(
        subject,
        webPrompt,
        settings.lang === 'bilingual',
        includeWebKnowledge,
      ),
    [subject, webPrompt, settings.lang, includeWebKnowledge],
  );

  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const keyInputRef = useRef<HTMLInputElement | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const webToastTimerRef = useRef<number | null>(null);

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
    if (open && activeTab === 'api') {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, open, streaming, activeTab]);

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

  useEffect(() => {
    return () => {
      if (webToastTimerRef.current) {
        window.clearTimeout(webToastTimerRef.current);
      }
    };
  }, []);

  if (!open) return null;

  const hasKey = Boolean(settings.geminiKey.trim());
  const badge = SUBJECT_BADGES[subject];

  const showWebToast = (msg: string) => {
    setWebStatus(msg);
    if (webToastTimerRef.current) {
      window.clearTimeout(webToastTimerRef.current);
    }
    webToastTimerRef.current = window.setTimeout(() => setWebStatus(null), 4000);
  };

  const openSideOrTabUrl = (url: string, targetName: string, mode: 'side' | 'tab') => {
    if (mode === 'side' && window.innerWidth >= 768) {
      const popupW = 480;
      const popupH = Math.min(840, Math.max(640, (window.screen?.availHeight || 900) - 90));
      const left = Math.max(0, (window.screen?.availWidth || 1280) - popupW - 24);
      window.open(
        url,
        targetName,
        `width=${popupW},height=${popupH},left=${left},top=45,resizable=yes,scrollbars=yes`,
      );
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const openGeminiWebWindow = (
    promptText: string,
    mode: 'side' | 'tab',
    withKnowledge = includeWebKnowledge,
  ) => {
    const payload = buildGeminiWebHandoffPrompt(
      subject,
      promptText,
      settings.lang === 'bilingual',
      withKnowledge,
    );
    const copied = copyTextToClipboard(payload);
    openSideOrTabUrl('https://gemini.google.com/app', 'exam_studio_gemini_web', mode);

    if (copied) {
      showWebToast(
        withKnowledge
          ? "Copied prompt + course notes! Click Gemini's input box and press Ctrl+V → Enter."
          : "Prompt copied! Click Gemini's input box and press Ctrl+V → Enter.",
      );
    } else {
      setPreviewPromptOpen(true);
      showWebToast(
        "Gemini opened! Clipboard was blocked — copy from 'Preview exact prompt' below.",
      );
    }
  };

  const openChatGptAutoFill = (
    promptText: string,
    mode: 'side' | 'tab',
    withKnowledge = includeWebKnowledge,
  ) => {
    const payload = buildGeminiWebHandoffPrompt(
      subject,
      promptText,
      settings.lang === 'bilingual',
      withKnowledge,
    );
    copyTextToClipboard(payload);
    const urlPayload =
      payload.length > 3200
        ? `${payload.slice(0, 3150)}\n...(see full notes in Exam Studio)`
        : payload;
    const url = `https://chatgpt.com/?q=${encodeURIComponent(urlPayload)}`;
    openSideOrTabUrl(url, 'exam_studio_chatgpt_web', mode);
    showWebToast(
      'Opened ChatGPT with prompt & website course notes auto-filled in the box!',
    );
  };

  const copyWebPromptOnly = (promptText: string) => {
    const payload = buildGeminiWebHandoffPrompt(
      subject,
      promptText,
      settings.lang === 'bilingual',
      includeWebKnowledge,
    );
    const copied = copyTextToClipboard(payload);
    if (copied) {
      showWebToast(
        includeWebKnowledge
          ? 'Prompt + matching website course notes copied to clipboard!'
          : 'Prompt copied to clipboard! Paste into any Gemini chat.',
      );
    } else {
      setPreviewPromptOpen(true);
      showWebToast("Could not auto-copy — select & copy from 'Preview exact prompt' below.");
    }
  };

  const downloadKnowledgePack = () => {
    const md = buildSubjectKnowledgeMarkdown(subject, settings.lang === 'bilingual');
    const fileName = getKnowledgeFileName(subject);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showWebToast(
      `Downloaded ${fileName}! Attach it with "+" inside Gemini Web once per study session.`,
    );
  };

  const copyFullKnowledgePack = () => {
    const md = buildSubjectKnowledgeMarkdown(subject, settings.lang === 'bilingual');
    const copied = copyTextToClipboard(md);
    if (copied) {
      showWebToast('Full course notes copied! Paste (Ctrl+V) into your first Gemini message.');
    } else {
      showWebToast('Clipboard blocked — click "Download .md File" instead.');
    }
  };

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
        'Paste your free Google AI Studio key above, or switch to the "Web Gemini (No Key)" tab!',
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
      className="no-print fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex justify-end"
      onClick={onClose}
    >
      <aside
        className={`animate-slide-in-right w-full ${
          expanded ? 'max-w-2xl' : 'max-w-lg'
        } h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-[max-width] duration-200`}
        onClick={(e) => e.stopPropagation()}
        aria-label="My Gemini AI Tutor"
      >
        {/* Uncluttered 2-Row Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0 bg-white/95 dark:bg-slate-900/95">
          {/* Row 1: Identity & Window Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm tracking-tight truncate">My Gemini AI</h2>
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
                onClick={() => setExpanded((v) => !v)}
                className="hidden md:inline-flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                title={expanded ? 'Compact width' : 'Expand width'}
                aria-label={expanded ? 'Compact drawer width' : 'Expand drawer width'}
              >
                {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {activeTab === 'api' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSetupOpen((v) => !v)}
                    className={`relative p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      setupOpen
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                    title={hasKey ? 'API Key Connected — Click to manage' : 'Add your free Gemini API key'}
                    aria-label="Configure Gemini API Key"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span
                      className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                        hasKey ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </button>

                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetChat}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                      title="New Chat"
                      aria-label="New Chat"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors"
                title="Close Tutor"
                aria-label="Close Tutor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: 2-Tab Segmented Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90">
            <button
              type="button"
              onClick={() => setActiveTab('api')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>In-App Chat (API Key)</span>
              {hasKey && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('web')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'web'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>Web Gemini (No Key)</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: IN-APP CHAT (API KEY) ================= */}
        {activeTab === 'api' && (
          <>
            {/* Calm Collapsible BYOK Setup Sheet */}
            {setupOpen && (
              <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 space-y-2.5 text-xs shrink-0 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Connect Your Free Gemini Key
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
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                      className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 cursor-pointer"
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
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-xs inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {testingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Test Key
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium ${
                      testResult.ok
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {testResult.text}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    Stored <strong>only in your browser</strong> — never uploaded to our server.
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('web')}
                    className="font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    No key? Use Web Gemini →
                  </button>
                </div>
              </div>
            )}

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-sky-50/70 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 space-y-1.5">
                    <div className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                      {settings.lang === 'bilingual'
                        ? 'Hỏi đáp & giải đề 3 môn trực tiếp với Gemini'
                        : 'Ask anything or paste an exam screenshot'}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {settings.lang === 'bilingual'
                        ? 'Gõ câu hỏi hoặc dán ảnh (Ctrl+V). Trợ lý tự động bám sát công thức, quy ước & bẫy thi trong Exam Studio:'
                        : 'Type a question or Ctrl+V paste an exam screenshot — automatically grounded in Exam Studio formulas & exam traps:'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Quick Starters ({badge.label})
                    </div>
                    {QUICK_STARTERS[subject].map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        disabled={streaming}
                        onClick={() => void handleSend(starter)}
                        className="group w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:border-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 text-[13px] text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                      >
                        <span>{starter}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) =>
                  msg.role === 'user' ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 text-white px-4 py-2.5 text-[13.5px] leading-relaxed shadow-xs">
                        {msg.imageDataUrl ? (
                          <img
                            src={msg.imageDataUrl}
                            alt={msg.imageName || 'Attached question'}
                            className="max-h-44 rounded-lg mb-2 border border-white/20 object-contain"
                          />
                        ) : msg.imageName ? (
                          <div className="text-[11px] opacity-80 mb-1 font-mono">
                            [Image: {msg.imageName}]
                          </div>
                        ) : null}
                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="rounded-2xl rounded-tl-md bg-slate-50 dark:bg-slate-800/75 border border-slate-200/80 dark:border-slate-700/80 px-4 py-3 text-[13.5px] leading-relaxed text-slate-900 dark:text-slate-100">
                          {msg.text ? (
                            <RichMathText text={msg.text} />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Thinking...
                            </span>
                          )}
                        </div>
                        {msg.text && (
                          <button
                            type="button"
                            onClick={() => void handleCopyMessage(msg)}
                            className="px-2 py-0.5 rounded-md text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
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
                    </div>
                  ),
                )
              )}
              <div ref={feedEndRef} />
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mx-5 mb-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2 shrink-0">
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

            {/* Unified Modern Composer */}
            <div className="px-4 py-3.5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-950/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 p-2.5 space-y-2 transition-all">
                {image && (
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={image.dataUrl}
                        alt={image.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <span className="text-xs font-mono truncate text-slate-600 dark:text-slate-300">
                        {image.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

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
                  className="w-full px-1.5 py-1 bg-transparent border-0 focus:outline-none focus:ring-0 focus:!shadow-none text-sm leading-relaxed resize-none"
                />

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 min-w-0">
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
                      className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 cursor-pointer transition-colors shrink-0"
                      title="Attach screenshot or paste Ctrl+V"
                      aria-label="Attach image"
                    >
                      <ImagePlus className="w-4 h-4" />
                    </button>

                    <select
                      value={settings.geminiModel}
                      onChange={(e) => {
                        setGeminiModel(e.target.value as GeminiModelId);
                        setPreviousInteractionId(undefined);
                      }}
                      aria-label="Select Gemini Model"
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-700 dark:text-slate-200 max-w-[165px] truncate cursor-pointer"
                    >
                      {GEMINI_MODEL_OPTIONS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.shortLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openGeminiWebWindow(input, 'side', true)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy question + matching course notes & open gemini.google.com side-by-side"
                    >
                      <span>Web</span>
                      <ExternalLink className="w-3 h-3 text-sky-500" />
                    </button>

                    {streaming ? (
                      <button
                        type="button"
                        onClick={() => abortRef.current?.abort()}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        Stop
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleSend()}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 2: WEB GEMINI (NO KEY) ================= */}
        {activeTab === 'web' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-indigo-50/50 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-900 border border-sky-200/80 dark:border-sky-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-sky-900 dark:text-sky-200">
                <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>
                  {settings.lang === 'bilingual'
                    ? 'Cách dùng Web Gemini (Không cần API Key)'
                    : 'Use Regular Web Gemini (No API Key · 2 Quick Steps)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {settings.lang === 'bilingual'
                  ? 'Vì bảo mật trình duyệt, gemini.google.com không cho web khác tự điền ô nhập hay tự tải file lên. Nên khi bạn bấm nút bên dưới, hệ thống sẽ tự copy sẵn câu hỏi + công thức môn học -> bạn chỉ cần nhấn Ctrl+V rồi Enter trong cửa sổ Gemini (hoặc dùng "Auto-Fill ChatGPT ↗" để điền tự động).'
                  : 'For browser security, gemini.google.com blocks other sites from auto-filling its box or auto-uploading files. Clicking below copies your question + course notes to clipboard — just press Ctrl+V → Enter in Gemini (or use Auto-Fill ChatGPT ↗ to pre-fill automatically).'}
              </p>
            </div>

            {webStatus && (
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>{webStatus}</span>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Your Question or Problem
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Tagged: {badge.label} · {settings.lang === 'bilingual' ? 'EN+VI' : 'EN'}
                </span>
              </div>
              <textarea
                rows={4}
                value={webPrompt}
                onChange={(e) => setWebPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    openGeminiWebWindow(webPrompt, 'side');
                  }
                }}
                placeholder="Paste or type your question here... (Ctrl+Enter to open side-by-side)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm leading-relaxed resize-y"
              />

              {/* Include Website Knowledge Notes */}
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeWebKnowledge}
                      onChange={(e) => setIncludeWebKnowledge(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Include matching website notes in copied prompt</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewPromptOpen((v) => !v)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {previewPromptOpen ? 'Hide preview' : 'Preview exact prompt'}
                  </button>
                </div>

                {includeWebKnowledge && matchedWebSnippets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {matchedWebSnippets.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 text-[10px] font-medium text-indigo-700 dark:text-indigo-300"
                        title={s.title}
                      >
                        <BookOpen className="w-2.5 h-2.5 shrink-0" />
                        <span className="font-mono font-bold">{s.badge}</span>
                        <span className="truncate max-w-[140px]">{s.title}</span>
                      </span>
                    ))}
                  </div>
                )}

                {previewPromptOpen && (
                  <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 select-all">
                    {exactWebPrompt}
                  </pre>
                )}
              </div>

              <button
                type="button"
                onClick={() => openGeminiWebWindow(webPrompt, 'side')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Copy &amp; Open Gemini Side-by-Side (then Ctrl+V) ↗
              </button>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => openGeminiWebWindow(webPrompt, 'tab')}
                  className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Gemini Tab</span>
                </button>
                <button
                  type="button"
                  onClick={() => openChatGptAutoFill(webPrompt, 'side')}
                  title="ChatGPT supports ?q= URL pre-fill so your prompt & notes appear automatically!"
                  className="py-2 px-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>Auto-Fill GPT ↗</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyWebPromptOnly(webPrompt)}
                  className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Copy Only</span>
                </button>
              </div>
            </div>

            {/* 1-Click Full Course Knowledge Pack (Download or Copy All) */}
            <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-800/70 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 space-y-2.5">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Full {badge.label} Knowledge Pack (All Chapters &amp; Glossary)
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {settings.lang === 'bilingual'
                    ? 'Tải file .md để kéo thả vào "+" trong Gemini Web/Gem, hoặc bấm Copy All Notes rồi dán vào tin nhắn đầu tiên để Gemini nhớ cả môn học.'
                    : 'Download the .md file to drop into "+" inside Gemini Web/Gems, or click Copy All Notes and paste once in your first message.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={downloadKnowledgePack}
                  className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .md File
                </button>
                <button
                  type="button"
                  onClick={copyFullKnowledgePack}
                  className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy All Notes
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                1-Click Quick Starters ({badge.label})
              </div>
              {QUICK_STARTERS[subject].map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => {
                    setWebPrompt(starter);
                    openGeminiWebWindow(starter, 'side');
                  }}
                  className="group w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 text-[13px] text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <span>{starter}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-sky-500 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
