import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Plus } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { 
    submissions, 
    assignments, 
    setCurrentView, 
    selectDefenseSession, 
    selectSubmission,
    runAIAnalysis,
    t 
  } = useApp();

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

        <div className="flex items-center gap-2.5 text-xs">
          <button
            onClick={() => setCurrentView('teacher_insights')}
            className="px-3 py-1.5 rounded border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            {t('cohort_heatmap')}
          </button>
          <button
            onClick={() => setCurrentView('teacher_assignment_create')}
            className="px-3.5 py-1.5 rounded bg-zinc-100 text-zinc-950 font-semibold hover:bg-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('create_assignment')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-xs">
        <div className="border border-zinc-800 bg-zinc-950 p-3.5 rounded">
          <div className="text-zinc-500 text-[10px] uppercase">{t('students_enrolled')}</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">28</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">10 «А» и 10 «Б» классы</div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-3.5 rounded">
          <div className="text-zinc-500 text-[10px] uppercase">{t('active_assignments')}</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">3</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Python & Алгоритмы</div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-3.5 rounded">
          <div className="text-zinc-500 text-[10px] uppercase">{t('pending_review')}</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">1</div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">Ждет проверки учителя</div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-3.5 rounded">
          <div className="text-zinc-500 text-[10px] uppercase">{t('avg_mastery')}</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">84%</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">По устным ответам</div>
        </div>
      </div>

      {/* Submissions Data Grid */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
            {t('all_submissions')}
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
              {submissions.map((sub) => {
                const asg = assignments.find((a) => a.id === sub.assignmentId);
                const score = sub.id === 'sub_arman_1' ? 88 : sub.id === 'sub_aliya_1' ? 62 : sub.id === 'sub_daniel_1' ? 93 : null;

                return (
                  <tr key={sub.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-zinc-200">
                      <div>{sub.studentName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{sub.studentEmail}</div>
                    </td>

                    <td className="py-3 px-4 text-zinc-400 font-sans">
                      {asg?.title || 'Python: Telegram-бот'}
                    </td>

                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(sub.submittedAt).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
                    </td>

                    <td className="py-3 px-4">
                      {score !== null ? (
                        <span className={`font-bold ${score >= 80 ? 'text-zinc-100' : 'text-zinc-400'}`}>
                          {score}%
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        sub.status === 'verified'
                          ? 'border border-zinc-700 bg-zinc-900 text-zinc-200'
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
                          className="px-2.5 py-1 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <span>{t('btn_review')}</span>
                          <ArrowRight className="w-3 h-3 text-zinc-500" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRunAnalysis(sub.id)}
                          className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-medium text-xs transition-colors"
                        >
                          {t('btn_analyze')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
