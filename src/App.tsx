import React, { useEffect, useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LabsPage } from './pages/LabsPage';
import { ProofsPage } from './pages/ProofsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { ExamPage } from './pages/ExamPage';
import type { ChapterId, LabTab, PageRoute } from './types';

function parseHash(): { route: PageRoute; params: URLSearchParams } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const validRoutes: PageRoute[] = [
    'dashboard',
    'labs',
    'proofs',
    'assignments',
    'knowledge',
    'exam',
  ];
  const route = validRoutes.includes(pathPart as PageRoute)
    ? (pathPart as PageRoute)
    : 'dashboard';
  return { route, params: new URLSearchParams(queryPart ?? '') };
}

function AppShell() {
  const [{ route, params }, setNav] = useState(parseHash);

  useEffect(() => {
    const onHash = () => setNav(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (nextRoute: PageRoute, query?: string) => {
    const target = query ? `#/${nextRoute}?${query}` : `#/${nextRoute}`;
    window.location.hash = target;
    setNav(parseHash());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeLab = (params.get('tab') as LabTab) || 'logic';
  const proofId = params.get('id') ?? undefined;
  const knowledgeChap = (params.get('chapter') as ChapterId) || undefined;
  const examSeed = params.get('seed') ?? undefined;

  return (
    <Layout route={route} onNavigate={(r) => navigate(r)}>
      {route === 'dashboard' && <DashboardPage onNavigate={navigate} />}
      {route === 'labs' && (
        <LabsPage
          activeTab={activeLab}
          onSelectTab={(tab) => navigate('labs', `tab=${tab}`)}
        />
      )}
      {route === 'proofs' && <ProofsPage initialProofId={proofId} />}
      {route === 'assignments' && <AssignmentsPage onNavigate={navigate} />}
      {route === 'knowledge' && (
        <KnowledgePage initialChapter={knowledgeChap} onNavigate={navigate} />
      )}
      {route === 'exam' && (
        <ExamPage
          initialSeed={examSeed}
          onSeedChange={(s) => navigate('exam', `seed=${encodeURIComponent(s)}`)}
        />
      )}
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
