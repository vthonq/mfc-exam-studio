import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AccessGate } from './components/AccessGate';
import { Layout } from './components/Layout';
import type {
  ChapterId,
  EconLabTab,
  EconPageRoute,
  EconTopicId,
  LabTab,
  PageRoute,
  ProbLabTab,
  ProbPageRoute,
  ProbTopicId,
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

const ProbDashboardPage = lazy(() =>
  import('./pages/probstat/ProbDashboardPage').then((m) => ({ default: m.ProbDashboardPage })),
);
const SbTablesPage = lazy(() =>
  import('./pages/probstat/SbTablesPage').then((m) => ({ default: m.SbTablesPage })),
);
const ProbLabsPage = lazy(() =>
  import('./pages/probstat/ProbLabsPage').then((m) => ({ default: m.ProbLabsPage })),
);
const ProbProblemsPage = lazy(() =>
  import('./pages/probstat/ProbProblemsPage').then((m) => ({ default: m.ProbProblemsPage })),
);
const ProbKnowledgePage = lazy(() =>
  import('./pages/probstat/ProbKnowledgePage').then((m) => ({ default: m.ProbKnowledgePage })),
);
const ProbExamPage = lazy(() =>
  import('./pages/probstat/ProbExamPage').then((m) => ({ default: m.ProbExamPage })),
);
const GuidePage = lazy(() =>
  import('./pages/GuidePage').then((m) => ({ default: m.GuidePage })),
);

interface ParsedRoute {
  subject: SubjectId;
  mfcRoute: PageRoute;
  econRoute: EconPageRoute;
  probRoute: ProbPageRoute;
  isGuide: boolean;
  params: URLSearchParams;
}

function parseHash(): ParsedRoute {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const params = new URLSearchParams(queryPart ?? '');

  if (pathPart === 'guide') {
    return {
      subject: 'mfc',
      mfcRoute: 'dashboard',
      econRoute: 'dashboard',
      probRoute: 'dashboard',
      isGuide: true,
      params,
    };
  }

  if (pathPart.startsWith('econ')) {
    const sub = pathPart.replace(/^econ\/?/, '') || 'dashboard';
    const validEcon: EconPageRoute[] = ['dashboard', 'labs', 'drill', 'knowledge', 'exam'];
    const econRoute = validEcon.includes(sub as EconPageRoute)
      ? (sub as EconPageRoute)
      : 'dashboard';
    return { subject: 'econ', mfcRoute: 'dashboard', econRoute, probRoute: 'dashboard', isGuide: false, params };
  }

  if (pathPart.startsWith('probstat')) {
    const sub = pathPart.replace(/^probstat\/?/, '') || 'dashboard';
    const validProb: ProbPageRoute[] = [
      'dashboard',
      'tables',
      'labs',
      'problems',
      'knowledge',
      'exam',
    ];
    const probRoute = validProb.includes(sub as ProbPageRoute)
      ? (sub as ProbPageRoute)
      : 'dashboard';
    return { subject: 'probstat', mfcRoute: 'dashboard', econRoute: 'dashboard', probRoute, isGuide: false, params };
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
  return { subject: 'mfc', mfcRoute, econRoute: 'dashboard', probRoute: 'dashboard', isGuide: false, params };
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

  const navigateProb = (route: ProbPageRoute, query?: string) => {
    window.location.hash = query ? `#/probstat/${route}?${query}` : `#/probstat/${route}`;
    setNav(parseHash());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectSubject = (s: SubjectId) => {
    if (s === 'mfc') navigateMfc('dashboard');
    else if (s === 'econ') navigateEcon('dashboard');
    else navigateProb('dashboard');
  };

  const navigateGuide = () => {
    window.location.hash = '#/guide';
    setNav(parseHash());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeLab = (nav.params.get('tab') as LabTab) || 'logic';
  const proofId = nav.params.get('id') ?? undefined;
  const knowledgeChap = (nav.params.get('chapter') as 'all' | 'glossary' | ChapterId) || undefined;
  const examSeed = nav.params.get('seed') ?? undefined;

  const econLabTab = (nav.params.get('tab') as EconLabTab) || 'part6';
  const econTopic = (nav.params.get('topic') as 'all' | 'glossary' | EconTopicId) || undefined;
  const econExamMode =
    (nav.params.get('mode') as 'final' | 'quiz3' | 'quiz4' | 'quiz5' | null) ?? undefined;

  const probLabTab = (nav.params.get('tab') as ProbLabTab) || 'discrete';
  const probTopic = (nav.params.get('topic') as 'all' | 'glossary' | ProbTopicId) || undefined;
  const probExamMode = (nav.params.get('mode') as 'final' | 'midterm' | null) ?? undefined;

  return (
    <Layout
      subject={nav.subject}
      onSelectSubject={selectSubject}
      mfcRoute={nav.mfcRoute}
      econRoute={nav.econRoute}
      probRoute={nav.probRoute}
      isGuide={nav.isGuide}
      onNavigateGuide={navigateGuide}
      onNavigateMfc={(r, q) => navigateMfc(r, q)}
      onNavigateEcon={(r, q) => navigateEcon(r, q)}
      onNavigateProb={(r, q) => navigateProb(r, q)}
    >
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-slate-500">Loading studio module...</div>
        }
      >
        {nav.isGuide && (
          <GuidePage
            onNavigateMfc={navigateMfc}
            onNavigateEcon={navigateEcon}
            onNavigateProb={navigateProb}
          />
        )}

        {!nav.isGuide && nav.subject === 'mfc' && (
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

        {!nav.isGuide && nav.subject === 'econ' && (
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

        {!nav.isGuide && nav.subject === 'probstat' && (
          <>
            {nav.probRoute === 'dashboard' && <ProbDashboardPage onNavigate={navigateProb} />}
            {nav.probRoute === 'tables' && <SbTablesPage />}
            {nav.probRoute === 'labs' && (
              <ProbLabsPage
                activeTab={probLabTab}
                onSelectTab={(tab) => navigateProb('labs', `tab=${tab}`)}
              />
            )}
            {nav.probRoute === 'problems' && <ProbProblemsPage />}
            {nav.probRoute === 'knowledge' && (
              <ProbKnowledgePage initialTopic={probTopic} onNavigate={navigateProb} />
            )}
            {nav.probRoute === 'exam' && (
              <ProbExamPage
                initialSeed={examSeed}
                initialMode={probExamMode}
                onSeedChange={(s, m) =>
                  navigateProb('exam', `seed=${encodeURIComponent(s)}&mode=${m}`)
                }
              />
            )}
          </>
        )}
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AccessGate>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </AccessGate>
    </AuthProvider>
  );
}
