import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, TrendingDown, Users } from 'lucide-react';

export const ClassInsights: React.FC = () => {
  const { classInsights, setCurrentView, t } = useApp();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-zinc-100 bg-zinc-800 border-zinc-700';
    if (score >= 70) return 'text-zinc-300 bg-zinc-900 border-zinc-800';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const skillsList = [
    'Базовый синтаксис',
    'Словари и списки',
    'Базы данных',
    'Обработка ошибок',
    'Игровые циклы'
  ];

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-8 font-mono">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-5 mb-8">
        <button
          onClick={() => setCurrentView('teacher_dashboard')}
          className="p-1.5 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">
            АНАЛИТИКА КЛАССА
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight mt-0.5">
            {t('heatmap_title')}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            {t('heatmap_desc')}
          </p>
        </div>
      </div>

      {/* Cohort Weakest Topics */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase text-zinc-300 font-semibold tracking-wider">
              {t('weakest_topics')}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">По итогам устных защит</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {classInsights.weakSkills.map((item) => (
            <div
              key={item.skill}
              className="bg-zinc-900/60 border border-zinc-800 rounded p-3 flex flex-col justify-between"
            >
              <div className="text-[11px] text-zinc-300 font-sans font-medium">{item.skill}</div>
              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className={`text-xl font-bold ${item.score < 65 ? 'text-amber-400' : 'text-zinc-100'}`}>
                    {item.score}%
                  </span>
                  <span className="text-[10px] text-zinc-500">усвоение</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.score < 65 ? 'bg-amber-400' : 'bg-zinc-300'}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student vs Skill Heatmap */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">
              Таблица успеваемости учеников
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-400">
            <span className="text-zinc-300">■ 85%+ Освоено</span>
            <span className="text-amber-400">■ &lt;65% Требует разбора</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-zinc-500 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Ученик</th>
                {skillsList.map((skill) => (
                  <th key={skill} className="py-2.5 px-4 text-center">
                    {skill}
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right">Средний</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {classInsights.conceptHeatmap.map((row) => (
                <tr key={row.studentId} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-zinc-200">
                    {row.studentName}
                  </td>
                  {skillsList.map((skill) => {
                    const score = row.scores[skill] || 70;
                    return (
                      <td key={skill} className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getScoreColor(
                            score
                          )}`}
                        >
                          {score}%
                        </span>
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right font-bold text-zinc-100">
                    <span>{row.overall}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
