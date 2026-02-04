import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ParticipantView } from './views/ParticipantView';
import { AdminView } from './views/AdminView';
import { NoticeboardView } from './views/NoticeboardView';
import { GroupsView } from './views/GroupsView';
import { TodaysPlansView } from './views/TodaysPlansView';
import { PackingListView } from './views/PackingListView';
import { RulesView } from './views/RulesView';
import { FeedbackView } from './views/FeedbackView';
import { PhotoDropView } from './views/PhotoDropView';
import { AdminBudgetsView } from './views/AdminBudgetsView';
import { useStore } from './store';

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}

export default function App() {
  const fetchData = useStore(state => state.fetchData);
  const subscribePhotoFeed = useStore(state => state.subscribePhotoFeed);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = subscribePhotoFeed();
    return () => unsubscribe();
  }, [subscribePhotoFeed]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnimatedPage><ParticipantView /></AnimatedPage>} />
        <Route path="/admin" element={<AnimatedPage><AdminView /></AnimatedPage>} />
        <Route path="/admin/budgets" element={<AnimatedPage><AdminBudgetsView /></AnimatedPage>} />
        <Route path="/noticeboard" element={<AnimatedPage><NoticeboardView /></AnimatedPage>} />
        <Route path="/groups" element={<AnimatedPage><GroupsView /></AnimatedPage>} />
        <Route path="/todays-plans" element={<AnimatedPage><TodaysPlansView /></AnimatedPage>} />
        <Route path="/packing-list" element={<AnimatedPage><PackingListView /></AnimatedPage>} />
        <Route path="/rules" element={<AnimatedPage><RulesView /></AnimatedPage>} />
        <Route path="/feedback" element={<AnimatedPage><FeedbackView /></AnimatedPage>} />
        <Route path="/photodrop" element={<AnimatedPage><PhotoDropView /></AnimatedPage>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
