import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import type {
  ChapterId,
  EconLabTab,
  EconPageRoute,
  EconTopicId,
  LabTab,
  PageRoute,
  SubjectId,
} from './types';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const LabsPage = lazy(() =>
  import('./pages/LabsPage').then((m) => ({ default: m.LabsPage })),
);
const ProofsPage = lazy(() =>
  import('./pages/ProofsPage').then((m) => ({ default: m.ProofsPage })),
);
const AssignmentsPage = lazy(() =>
  import('./pages/AssignmentsPage').then((m) => ({ default: m.AssignmentsPage })),
);
const KnowledgePage = lazy(() =>
  import('./pages/KnowledgePage').then((m) => ({ default: m.KnowledgePage })),
);
const ExamPage = lazy(() =>
  import('./pages/ExamPage').then((m) => ({ default: m.ExamPage })),
);

const EconDashboardPage = lazy(() =>
  import('./pages/econ/EconDashboardPage').then((m) => ({ default: m.EconDashboardPage })),
);
const EconLabsPage = lazy(() =>
  import('./pages/econ/EconLabsPage').then((m) => ({ default: m.EconLabsPage })),
);
const EconDrillPage = lazy(() =>
  import('./pages/econ/EconDrillPage').then((m) => ({ default: m.EconDrillPage })),
);
const EconKnowledgePage = lazy(() =>
  import('./pages/econ/EconKnowledgePage').then((m) => ({ default: m.EconKnowledgePage })),
);
const EconExamPage = lazy(() =>
  import('./pages/econ/EconExamPage').then((m) => ({ default: m.EconExamPage })),
);

interface ParsedRoute {
  subject: SubjectId;
  mfcRoute: PageRoute;
  econRoute: EconPageRoute;
  params: URLSearchParams;
}

function parseHash(): ParsedRoute {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const params = new URLSearchParams(queryPart ?? '');

  if (pathPart.startsWith('econ')) {
    const sub = pathPart.replace(/^econ\/?/, '') || 'dashboard';
    const validEcon: EconPageRoute[] = ['dashboard', 'labs', 'drill', 'knowledge', 'exam'];
    const econRoute = validEcon.includes(sub as EconPageRoute)
      ? (sub as EconPageRoute)
      : 'dashboard';
    return { subject: 'econ', mfcRoute: 'dashboard', econRoute, params };
  }

  if (pathPart.startsWith('probstat')) {
    return { subject: 'probstat', mfcRoute: 'dashboard', econRoute: 'dashboard', params };
  }

  const validMfc: PageRoute[] = [
    'dashboard',
    'labs',
    'proofs',
    'assignments',
    'knowledge',
    'exam',
  ];
  const mfcRoute = validMfc.includes(pathPart as PageRoute)
    ? (pathPart as PageRoute)
    : 'dashboard';
  return { subject: 'mfc', mfcRoute, econRoute: 'dashboard', params };
}

function AppShell() {
  const [nav, setNav] = useState(parseHash);

  useEffect(() => {
    const onHash = () => setNav(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigateMfc = (route: PageRoute, query?: string) => {
    window.location.hash = query ? `#/${route}?${query}` : `#/${route}`;
    setNav(parseHash());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateEcon = (route: EconPageRoute, query?: string) => {
    window.location.hash = query ? `#/econ/${route}?${query}` : `#/econ/${route}`;
    setNav(parseHash());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectSubject = (s: SubjectId) => {
    if (s === 'mfc') navigateMfc('dashboard');
    else if (s === 'econ') navigateEcon('dashboard');
    else {
      window.location.hash = '#/probstat';
      setNav(parseHash());
    }
  };

  const activeLab = (nav.params.get('tab') as LabTab) || 'logic';
  const proofId = nav.params.get('id') ?? undefined;
  const knowledgeChap = (nav.params.get('chapter') as ChapterId) || undefined;
  const examSeed = nav.params.get('seed') ?? undefined;

  const econLabTab = (nav.params.get('tab') as EconLabTab) || 'part6';
  const econTopic = (nav.params.get('topic') as EconTopicId) || undefined;
  const econExamMode = (nav.params.get('mode') as 'final' | 'quiz3' | 'quiz4' | 'quiz5') || 'final';

  return (
    <Layout
      subject={nav.subject}
      onSelectSubject={selectSubject}
      mfcRoute={nav.mfcRoute}
      econRoute={nav.econRoute}
      onNavigateMfc={(r) => navigateMfc(r)}
      onNavigateEcon={(r) => navigateEcon(r)}
    >
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-slate-500">Loading studio module...</div>
        }
      >
        {nav.subject === 'mfc' && (
          <>
            {nav.mfcRoute === 'dashboard' && <DashboardPage onNavigate={navigateMfc} />}
            {nav.mfcRoute === 'labs' && (
              <LabsPage
                activeTab={activeLab}
                onSelectTab={(tab) => navigateMfc('labs', `tab=${tab}`)}
              />
            )}
            {nav.mfcRoute === 'proofs' && <ProofsPage initialProofId={proofId} />}
            {nav.mfcRoute === 'assignments' && <AssignmentsPage onNavigate={navigateMfc} />}
            {nav.mfcRoute === 'knowledge' && (
              <KnowledgePage initialChapter={knowledgeChap} onNavigate={navigateMfc} />
            )}
            {nav.mfcRoute === 'exam' && (
              <ExamPage
                initialSeed={examSeed}
                onSeedChange={(s) => navigateMfc('exam', `seed=${encodeURIComponent(s)}`)}
              />
            )}
          </>
        )}

        {nav.subject === 'econ' && (
          <>
            {nav.econRoute === 'dashboard' && <EconDashboardPage onNavigate={navigateEcon} />}
            {nav.econRoute === 'labs' && (
              <EconLabsPage
                activeTab={econLabTab}
                onSelectTab={(tab) => navigateEcon('labs', `tab=${tab}`)}
              />
            )}
            {nav.econRoute === 'drill' && <EconDrillPage />}
            {nav.econRoute === 'knowledge' && (
              <EconKnowledgePage initialTopic={econTopic} onNavigate={navigateEcon} />
            )}
            {nav.econRoute === 'exam' && (
              <EconExamPage
                initialSeed={examSeed}
                initialMode={econExamMode}
                onSeedChange={(s, m) =>
                  navigateEcon('exam', `seed=${encodeURIComponent(s)}&mode=${m}`)
                }
              />
            )}
          </>
        )}

        {nav.subject === 'probstat' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <BarChart3 className="w-10 h-10 text-sky-600 mx-auto" />
            <h1 className="text-xl font-extrabold">Probability &amp; Statistics — Ready to Add!</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Upload or point to your Probability &amp; Statistics slides/assignments folder to add
              Bayes trees, distributions, confidence intervals, hypothesis tests, and regression labs right here.
            </p>
          </div>
        )}
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
