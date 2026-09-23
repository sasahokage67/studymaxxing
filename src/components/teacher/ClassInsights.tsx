import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  TrendingDown,
  Users,
  GraduationCap,
  Filter,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';

export const ClassInsights: React.FC = () => {
  const { users, classes, computeFilteredInsights, setCurrentView, t } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-zinc-100 bg-zinc-800 border-zinc-700';
    if (score >= 70) return 'text-zinc-300 bg-zinc-900 border-zinc-800';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  // Dynamic insights for selected scope
  const insights = useMemo(() => {
    return computeFilteredInsights(selectedClassId);
  }, [computeFilteredInsights, selectedClassId]);

  // Enrolled students in current scope
  const scopeStudents = useMemo(() => {
    return users.filter(
      (u) => u.role === 'student' && (selectedClassId === 'all' || u.classId === selectedClassId)
    );
  }, [users, selectedClassId]);

  const testedStudentIds = new Set(insights.conceptHeatmap.map((r) => r.studentId));
  const untestedStudents = scopeStudents.filter((st) => !testedStudentIds.has(st.id));

  // Dynamic skills list extracted strictly from real tests taken
  const skillsList = useMemo(() => {
    return insights.weakSkills.map((w) => w.skill);
  }, [insights.weakSkills]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-8 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('teacher_dashboard')}
            className="p-1.5 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">
                АНАЛИТИКА КЛАССА
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                Реальные данные
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight mt-0.5">
              {t('heatmap_title')}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Усвоение тем по итогам реальных устных защит и ответов учеников
            </p>
          </div>
        </div>

        {/* Scope stats */}
        <div className="flex items-center gap-3 text-xs bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2">
          <div className="text-zinc-400">
            Зачислено: <strong className="text-zinc-200">{scopeStudents.length}</strong>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="text-emerald-400">
            Сдали защиту: <strong className="text-emerald-300">{insights.conceptHeatmap.length}</strong>
          </div>
        </div>
      </div>

      {/* Class Filter Tabs */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 text-xs text-zinc-400 font-sans">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span>Выберите класс для просмотра аналитики:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <button
            type="button"
            onClick={() => setSelectedClassId('all')}
            className={`px-3.5 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedClassId === 'all'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Все классы ({users.filter((u) => u.role === 'student').length})</span>
          </button>

          {classes.map((cls) => {
            const count = users.filter((u) => u.classId === cls.id).length;
            const isSelected = selectedClassId === cls.id;

            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span>{cls.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-zinc-800 text-zinc-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cohort Weakest Topics */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-xl p-5 mb-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase text-zinc-300 font-semibold tracking-wider">
              {t('weakest_topics')}
            </span>
            {selectedClass && (
              <span className="text-xs text-zinc-500 font-normal">
                ({selectedClass.name})
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-500">По итогам проверенных устных защит</span>
        </div>

        {insights.weakSkills.length === 0 ? (
          <div className="py-6 px-4 rounded-lg bg-zinc-900/30 border border-zinc-800/80 text-center">
            <p className="text-zinc-500 text-xs font-sans">
              В выбранной категории еще нет завершенных устных защит для выявления слабых тем.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {insights.weakSkills.slice(0, 5).map((item) => (
              <div
                key={item.skill}
                className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 flex flex-col justify-between"
              >
                <div className="text-[11px] text-zinc-200 font-sans font-medium line-clamp-2">
                  {item.skill}
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`text-xl font-bold ${
                        item.score < 65
                          ? 'text-amber-400'
                          : item.score >= 85
                          ? 'text-emerald-400'
                          : 'text-zinc-100'
                      }`}
                    >
                      {item.score}%
                    </span>
                    <span className="text-[10px] text-zinc-500">усвоение</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.score < 65
                          ? 'bg-amber-400'
                          : item.score >= 85
                          ? 'bg-emerald-400'
                          : 'bg-zinc-300'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student vs Skill Heatmap */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">
              Таблица успеваемости учеников
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              Сдали тесты: {insights.conceptHeatmap.length}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
            <span className="text-emerald-400">■ 85%+ Освоено</span>
            <span className="text-amber-400">■ &lt;65% Требует разбора</span>
          </div>
        </div>

        {insights.conceptHeatmap.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-zinc-200 font-sans">
              Нет завершенных тестов
            </div>
            <p className="text-xs text-zinc-500 font-sans max-w-md mx-auto">
              {selectedClass
                ? `Ученики класса «${selectedClass.name}» еще не завершили устную защиту заданий.`
                : 'Пока ни один ученик не прошел устную защиту заданий.'}
              {' '}Матрица усвоения тем сформируется автоматически после первых ответов.
            </p>

            {untestedStudents.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-900 max-w-lg mx-auto text-left">
                <div className="text-[11px] text-zinc-400 mb-2 uppercase tracking-wider font-semibold">
                  Зачисленные ученики ({untestedStudents.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {untestedStudents.map((st) => (
                    <span
                      key={st.id}
                      className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-1.5"
                    >
                      <span className="text-emerald-400 font-bold">@{st.username}</span>
                      {st.name && st.name !== '@' + st.username && (
                        <span className="text-zinc-500 text-[11px]">({st.name})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950 text-zinc-500 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Ученик (@username)</th>
                  {skillsList.map((skill) => (
                    <th key={skill} className="py-2.5 px-4 text-center">
                      {skill}
                    </th>
                  ))}
                  <th className="py-2.5 px-4 text-right">Средний балл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {insights.conceptHeatmap.map((row) => (
                  <tr key={row.studentId} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-zinc-200">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{row.studentName}</span>
                      </div>
                    </td>
                    {skillsList.map((skill) => {
                      const score = row.scores[skill];
                      return (
                        <td key={skill} className="py-3 px-4 text-center font-mono">
                          {score !== undefined ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getScoreColor(
                                score
                              )}`}
                            >
                              {score}%
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-100">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs border ${getScoreColor(
                          row.overall
                        )}`}
                      >
                        {row.overall}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Untested students roster note */}
        {insights.conceptHeatmap.length > 0 && untestedStudents.length > 0 && (
          <div className="p-4 bg-zinc-900/30 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-zinc-400">
                Ожидают сдачи заданий ({untestedStudents.length} уч.):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {untestedStudents.map((st) => (
                  <span
                    key={st.id}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400"
                  >
                    @{st.username}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
