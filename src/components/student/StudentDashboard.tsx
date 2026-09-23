import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, CheckCircle2, Clock, FileCode, Award } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { 
    currentUser, 
    assignments, 
    submissions, 
    defenseSessions, 
    setCurrentView, 
    selectDefenseSession, 
    selectAssignment, 
    t 
  } = useApp();

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-8 font-mono">
      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-8">
        <div>
          <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">
            {t('student_portal')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight mt-0.5">
            {t('student_welcome')}, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            {t('student_desc')}
          </p>
        </div>

        <button
          onClick={() => setCurrentView('student_pipeline')}
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all font-mono shadow-md cursor-pointer"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Сдать код и пройти защиту</span>
        </button>
      </div>

      {/* Active Assignment Cards */}
      <div className="mb-10 space-y-4">
        <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>{t('active_defenses')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((asg) => {
            const userSub = submissions.find(
              (sub) => sub.assignmentId === asg.id && (sub.studentId === currentUser.id || sub.studentName === currentUser.name)
            );
            const session = userSub?.defenseSessionId ? defenseSessions[userSub.defenseSessionId] : undefined;
            const score = session?.overallScore;
            const isCompleted = !!userSub && (session?.status === 'verified' || session?.status === 'teacher_review' || (score !== undefined));
            const isAutoApproved = (score || 0) >= 85;
            const needsTeacher = (score || 0) <= 65 && isCompleted;

            return (
              <div
                key={asg.id}
                className="border border-zinc-800 bg-zinc-950 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-zinc-500 font-mono text-[11px]">{asg.className}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${
                      !isCompleted
                        ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                        : isAutoApproved
                        ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : needsTeacher
                        ? 'border border-red-500/40 bg-red-500/10 text-red-400'
                        : 'border border-blue-500/40 bg-blue-500/10 text-blue-300'
                    }`}>
                      {!isCompleted
                        ? 'Готово к сдаче'
                        : isAutoApproved
                        ? 'ДЗ сдано (85%+)'
                        : needsTeacher
                        ? 'Проверка учителя'
                        : 'На утверждении'}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold font-sans text-zinc-100">{asg.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 font-sans line-clamp-2">{asg.description}</p>

                  <div className="mt-4 flex items-center gap-4 text-[11px] text-zinc-400 font-mono">
                    <div>{t('questions_count')}: <span className="text-zinc-200 font-semibold">{asg.questionCount}</span></div>
                    <div>Блиц-таймер: <span className="text-emerald-400 font-semibold">{asg.timerSeconds || 15} сек</span></div>
                    {asg.referenceCode && (
                      <div className="text-zinc-500 text-[10px]">✓ Эталон учителя задан</div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-zinc-500">{t('col_score')}:</span>
                      <span className={`font-bold ${isAutoApproved ? 'text-emerald-400' : needsTeacher ? 'text-red-400' : 'text-zinc-100'}`}>
                        {score}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-400 font-mono font-medium">Ожидает решения</span>
                  )}

                  <button
                    onClick={() => {
                      selectAssignment(asg.id);
                      if (session?.id) selectDefenseSession(session.id);
                      setCurrentView('student_pipeline');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCompleted
                        ? 'border border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-sm'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isCompleted ? 'Пройти повторно' : 'Сдать и защитить'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div>
        <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
          <span>{t('past_defenses')}</span>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase">
              <tr>
                <th className="py-2.5 px-4">{t('col_assignment')}</th>
                <th className="py-2.5 px-4">{t('col_date')}</th>
                <th className="py-2.5 px-4">{t('col_score')}</th>
                <th className="py-2.5 px-4">{t('col_status')}</th>
                <th className="py-2.5 px-4">{t('col_feedback')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              <tr className="hover:bg-zinc-900/30">
                <td className="py-3 px-4 font-sans font-medium text-zinc-200">
                  Python: Telegram-бот для школьной викторины
                </td>
                <td className="py-3 px-4 text-zinc-400">22 Сен, 2026</td>
                <td className="py-3 px-4 font-bold text-zinc-100">88%</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 text-[10px] uppercase">
                    {t('completed')}
                  </span>
                </td>
                <td className="py-3 px-4 font-sans text-zinc-400 max-w-xs truncate">
                  "Отличная защита, Арман! Ты прекрасно понимаешь, как работает словарь."
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
