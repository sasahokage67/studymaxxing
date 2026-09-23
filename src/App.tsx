import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { InteractiveDefensePipeline } from './components/student/InteractiveDefensePipeline';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AssignmentCreator } from './components/teacher/AssignmentCreator';
import { DefenseReviewDetail } from './components/teacher/DefenseReviewDetail';
import { ClassInsights } from './components/teacher/ClassInsights';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/profile/ProfileModal';

import { ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const { currentView, currentRole, isAuthenticated, setCurrentView, selectedAssignmentId } = useApp();

  const isTeacherView = [
    'teacher_dashboard',
    'teacher_assignment_create',
    'teacher_submission_detail',
    'teacher_insights'
  ].includes(currentView);

  const renderContent = () => {
    // RBAC Guard: Protect teacher views from student or unauthenticated access
    if (isTeacherView && (!isAuthenticated || currentRole !== 'teacher')) {
      return (
        <div className="max-w-md mx-auto my-24 p-8 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-zinc-100">Доступ ограничен</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Этот раздел предназначен исключительно для учителей. Вход под учетной записью ученика заблокирован.
          </p>
          <button
            onClick={() => setCurrentView(isAuthenticated ? 'student_dashboard' : 'landing')}
            className="px-4 py-2 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-medium cursor-pointer transition-colors"
          >
            {isAuthenticated ? 'Вернуться к моим заданиям' : 'На главную'}
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'student_dashboard':
        return <StudentDashboard />;
      case 'student_defense':
      case 'student_submit':
      case 'student_pipeline':
        return <InteractiveDefensePipeline initialAssignmentId={selectedAssignmentId || undefined} />;
      case 'teacher_dashboard':
        return <TeacherDashboard />;
      case 'teacher_assignment_create':
        return <AssignmentCreator />;
      case 'teacher_submission_detail':
        return <DefenseReviewDetail />;
      case 'teacher_insights':
        return <ClassInsights />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
      <AuthModal />
      <ProfileModal />
    </div>
  );
};
