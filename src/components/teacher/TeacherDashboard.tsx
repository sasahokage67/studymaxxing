import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  Plus,
  Users,
  GraduationCap,
  BookOpen,
  FileCode,
  Sparkles,
  ExternalLink,
  ChevronRight,
  School as SchoolIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CreateClassModal } from './CreateClassModal';
import { ClassDetailModal } from './ClassDetailModal';
import { SchoolClass } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const { 
    submissions, 
    assignments, 
    classes,
    users,
    defenseSessions,
    setCurrentView, 
    selectDefenseSession, 
    selectSubmission,
    runAIAnalysis,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'submissions' | 'classes'>('submissions');
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<SchoolClass | null>(null);

  const handleOpenReview = (submissionId: string, defenseSessionId?: string) => {
    selectSubmission(submissionId);
    if (defenseSessionId) {
      selectDefenseSession(defenseSessionId);
      setCurrentView('teacher_submission_detail');
    }
  };

  const handleRunAnalysis = async (submissionId: string) => {
    await runAIAnalysis(submissionId);
  };

  // Enrolled students total count
  const allStudents = users.filter((u) => u.role === 'student');

  // Real dynamic metrics
  const pendingReviewCount = submissions.filter((s) => s.status === 'teacher_review').length;

  const verifiedSessions = Object.values(defenseSessions).filter(
    (s) => typeof s.overallScore === 'number' && (s.status === 'verified' || s.status === 'teacher_review')
  );
  const avgMasteryScore = verifiedSessions.length > 0
    ? Math.round(verifiedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / verifiedSessions.length)
    : null;

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-8 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-8">
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            {t('instructor_console')}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight mt-0.5">
            {t('teacher_title')}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          <button
            onClick={() => setIsCreateClassOpen(true)}
            className="px-3.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Создать класс</span>
          </button>

          <button
            onClick={() => setCurrentView('teacher_assignment_create')}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold hover:bg-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('create_assignment')}</span>
          </button>

          <button
            onClick={() => setCurrentView('teacher_insights')}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {t('cohort_heatmap')}
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-xs">
        <div 
          onClick={() => setActiveTab('classes')}
          className="border border-zinc-800 bg-zinc-950 p-3.5 rounded-xl hover:border-zinc-700 transition-colors cursor-pointer group"
        >
          <div className="text-zinc-500 text-[10px] uppercase flex items-center justify-between">
            <span>{t('students_enrolled')}</span>
            <Users className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{allStudents.length}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">В {classes.length} классах школы</div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-3.5 rounded-xl">
          <div className="text-zinc-500 text-[10px] uppercase">{t('active_assignments')}</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{assignments.length}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Python & Алгоритмы</div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-3.5 rounded-xl">
          <div className="text-zinc-500 text-[10px] uppercase">{t('pending_review')}</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{pendingReviewCount}</div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">
            {pendingReviewCount > 0 ? 'Ждет проверки учителя' : 'Все работы проверены'}
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-3.5 rounded-xl">
          <div className="text-zinc-500 text-[10px] uppercase">{t('avg_mastery')}</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">
            {avgMasteryScore !== null ? `${avgMasteryScore}%` : '—'}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {avgMasteryScore !== null ? 'По реальным устным ответам' : 'Пока нет сданных защит'}
          </div>
        </div>
      </div>

      {/* Primary Section Tabs: Submissions vs Classes */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/30 mb-6 rounded-t-lg overflow-hidden text-xs">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`py-3 px-5 text-center transition-colors border-b-2 font-medium cursor-pointer flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'border-emerald-500 text-zinc-100 bg-zinc-900/60 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>{t('all_submissions')} ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`py-3 px-5 text-center transition-colors border-b-2 font-medium cursor-pointer flex items-center gap-2 ${
            activeTab === 'classes'
              ? 'border-emerald-500 text-zinc-100 bg-zinc-900/60 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Мои классы ({classes.length})</span>
        </button>
      </div>

      {/* Tab 1: Submissions Data Grid */}
      {activeTab === 'submissions' && (
        <div className="border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
              Список отправленных решений и защит
            </span>
            <span className="text-zinc-500 text-[11px]">{submissions.length} Работ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950 text-zinc-500 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">{t('col_student')}</th>
                  <th className="py-2.5 px-4">{t('col_project')}</th>
                  <th className="py-2.5 px-4">{t('col_date')}</th>
                  <th className="py-2.5 px-4">{t('col_score')}</th>
                  <th className="py-2.5 px-4">{t('col_status')}</th>
                  <th className="py-2.5 px-4 text-right">{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-sans text-xs">
                      Пока нет отправленных решений. Ученики увидят свои задания в кабинете.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const asg = assignments.find((a) => a.id === sub.assignmentId);
                    const session = sub.defenseSessionId ? defenseSessions[sub.defenseSessionId] : undefined;
                    const score = session?.teacherReview?.overrideScore ?? session?.overallScore ?? null;
                    const studentUser = users.find(
                      (u) => u.id === sub.studentId || u.username.toLowerCase() === sub.studentName.toLowerCase().replace(/^@/, '')
                    );
                    const displayNick = studentUser ? `@${studentUser.username}` : sub.studentName;

                    return (
                      <tr key={sub.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4 font-sans font-medium text-zinc-200">
                          <div className="flex items-center gap-2">
                            {asg?.grade && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-emerald-400 border border-emerald-500/20">
                                {asg.grade} кл.
                              </span>
                            )}
                            <span className="text-emerald-400 font-mono font-bold">{displayNick}</span>
                            {studentUser?.name && studentUser.name !== displayNick && (
                              <span className="text-zinc-400 font-sans text-xs font-normal">({studentUser.name})</span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{sub.studentEmail}</div>
                        </td>

                        <td className="py-3 px-4 text-zinc-400 font-sans">
                          {asg?.title || 'Python: Задание'}
                        </td>

                        <td className="py-3 px-4 text-zinc-500 font-mono">
                          {new Date(sub.submittedAt).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {score !== null ? (
                            <span className={`font-bold ${score >= 80 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                              {score}%
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${
                          sub.status === 'verified'
                            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : sub.status === 'teacher_review'
                            ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                            : 'border border-zinc-800 text-zinc-500'
                        }`}>
                          {sub.status === 'verified'
                            ? t('completed')
                            : sub.status === 'teacher_review'
                            ? 'Требует проверки'
                            : t('defense_ready')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {sub.defenseSessionId ? (
                          <button
                            onClick={() => handleOpenReview(sub.id, sub.defenseSessionId)}
                            className="px-2.5 py-1 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{t('btn_review')}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRunAnalysis(sub.id)}
                            className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-medium text-xs transition-colors cursor-pointer"
                          >
                            {t('btn_analyze')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Class Management Grid */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">
              Список сформированных классов с полными составами учеников:
            </span>
            <button
              onClick={() => setIsCreateClassOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать новый класс</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const classStudents = users.filter((u) => cls.studentIds.includes(u.id));
              const classAsgs = assignments.filter((a) => a.grade === cls.grade);

              return (
                <div
                  key={cls.id}
                  className="border border-zinc-800 bg-zinc-950 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors shadow-sm group"
                >
                  <div>
                    {/* Top Row: Class grade badge and academic year */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                        {cls.grade} класс
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">{cls.academicYear}</span>
                    </div>

                    <h3 className="text-base font-bold font-sans text-zinc-100">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5">{cls.subject}</p>

                    {/* Stats pill */}
                    <div className="mt-4 pt-3 border-t border-zinc-900 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
                        <div className="text-[10px] text-zinc-500 uppercase">Учеников</div>
                        <div className="text-sm font-bold text-zinc-200 mt-0.5">
                          {classStudents.length}
                        </div>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
                        <div className="text-[10px] text-zinc-500 uppercase">Заданий</div>
                        <div className="text-sm font-bold text-zinc-200 mt-0.5">
                          {classAsgs.length}
                        </div>
                      </div>
                    </div>

                    {/* Avatars Preview */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {classStudents.slice(0, 5).map((st) => (
                          <img
                            key={st.id}
                            src={
                              st.avatarUrl ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'
                            }
                            alt={st.name}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-950 object-cover"
                            title={st.name}
                          />
                        ))}
                        {classStudents.length > 5 && (
                          <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-300 font-bold">
                            +{classStudents.length - 5}
                          </div>
                        )}
                        {classStudents.length === 0 && (
                          <span className="text-[11px] text-zinc-600 font-sans">Состав пуст</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedClassForDetail(cls)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>Ученики ({classStudents.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentView('teacher_assignment_create')}
                      className="py-1.5 px-2.5 rounded-lg border border-zinc-800 hover:border-emerald-500/40 text-zinc-400 hover:text-emerald-300 text-xs transition-colors cursor-pointer"
                      title="Создать задание для этого класса"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Create Card */}
            <button
              type="button"
              onClick={() => setIsCreateClassOpen(true)}
              className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/40 hover:bg-zinc-900/20 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group min-h-[190px]"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/40 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-300 group-hover:text-zinc-100 font-sans">
                Сформировать новый класс
              </span>
              <span className="text-[11px] text-zinc-500 text-center font-sans">
                Быстрое добавление фулл класса по списку учеников
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
        onClassCreated={(newClass) => {
          setSelectedClassForDetail(newClass);
        }}
      />

      {/* Class Detail Modal */}
      <ClassDetailModal
        schoolClass={selectedClassForDetail}
        onClose={() => setSelectedClassForDetail(null)}
        onCreateAssignmentForClass={() => {
          setCurrentView('teacher_assignment_create');
        }}
      />
    </div>
  );
};
