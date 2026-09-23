import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Volume2,
  Save,
  FileDown,
  Code2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AIService } from '../../services/aiService';

export const DefenseReviewDetail: React.FC = () => {
  const { 
    selectedDefenseSessionId, 
    defenseSessions, 
    assignments, 
    submissions, 
    saveTeacherReview, 
    setCurrentView,
    t 
  } = useApp();

  const session = defenseSessions[selectedDefenseSessionId || 'def_arman_1'] || defenseSessions['def_arman_1'];
  const submission = submissions.find((s) => s.defenseSessionId === session.id) || submissions[0];
  const assignment = assignments.find((a) => a.id === session.assignmentId) || assignments[0];

  const [overrideScore, setOverrideScore] = useState<number>(session?.teacherReview?.overrideScore || session?.overallScore || 85);
  const [studentFeedback, setStudentFeedback] = useState<string>(
    session?.teacherReview?.studentFeedback || ''
  );
  const [privateNote, setPrivateNote] = useState<string>(
    session?.teacherReview?.privateNote || ''
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isCodeDiffOpen, setIsCodeDiffOpen] = useState(true);
  const [codeViewTab, setCodeViewTab] = useState<'both' | 'student' | 'benchmark'>('both');

  const comparison = submission?.analysis?.codeComparison || AIService.compareWithTeacherReference(
    submission?.codeSnippet || '',
    assignment?.referenceCode
  );

  const handleSave = () => {
    saveTeacherReview(session.id, {
      overrideScore,
      studentFeedback,
      privateNote,
      status: 'verified'
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const rubric = session.overallRubric || {
    conceptKnowledge: 92,
    reasoning: 86,
    application: 85,
    technicalDepth: 88,
    independentExplanation: 89
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-8 font-mono">
      {/* Top Breadcrumb & Export Actions */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('teacher_dashboard')}
            className="p-1.5 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
              {t('review_title')} // ID: {session.id}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight">
              {submission?.studentName} — {assignment?.title}
            </h1>
          </div>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-3 py-1.5 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs flex items-center gap-2 transition-all print:hidden"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>{t('export_pdf')}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Evidence & Teacher Benchmark (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Teacher Benchmark vs Student Code Comparison Card */}
          <div className="border border-zinc-800 bg-zinc-950 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-semibold uppercase text-zinc-200 tracking-wider">
                  Сверка решения с эталоном учителя (AI Code Comparator)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  comparison.plagiarismRisk === 'low'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : comparison.plagiarismRisk === 'exact_copy'
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                    : comparison.plagiarismRisk === 'ai_anomaly'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {comparison.plagiarismRisk === 'low'
                    ? 'Низкий риск'
                    : comparison.plagiarismRisk === 'exact_copy'
                    ? '100% эталон'
                    : comparison.plagiarismRisk === 'ai_anomaly'
                    ? 'Аномалия ChatGPT'
                    : 'Отклонение'}
                </span>
                <span className="font-bold text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-[11px]">
                  {comparison.correctnessScore}% совпадение
                </span>
                <button
                  type="button"
                  onClick={() => setIsCodeDiffOpen(!isCodeDiffOpen)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  {isCodeDiffOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {comparison.verdict}
            </p>

            {/* Checklist of matching vs missing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Совпадения с эталоном:
                </span>
                {comparison.matchingElements.length > 0 ? (
                  <ul className="space-y-0.5 text-[11px] text-zinc-300">
                    {comparison.matchingElements.map((el, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-emerald-400">✓</span> {el}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[11px] text-zinc-500">Нет совпадений</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Пропуски / Отклонения:
                </span>
                {comparison.missingElements.length > 0 ? (
                  <ul className="space-y-0.5 text-[11px] text-amber-300">
                    {comparison.missingElements.map((el, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-amber-300">
                        <span className="text-amber-400">⚠</span> {el}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[11px] text-zinc-400">Все контрольные конструкции реализованы</span>
                )}
              </div>
            </div>

            {/* AI Anomalies Warning */}
            {comparison.aiAnomalies.length > 0 && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-xs space-y-1">
                <span className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Обнаружены артефакты генерации нейросетей (ChatGPT):
                </span>
                <ul className="space-y-0.5 text-[11px] text-red-300">
                  {comparison.aiAnomalies.map((anom, i) => (
                    <li key={i}>• {anom}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Collapsible Side-by-side or Tabbed Code Viewer */}
            {isCodeDiffOpen && (
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">Просмотр исходного кода:</span>
                  <div className="flex gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setCodeViewTab('both')}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        codeViewTab === 'both' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Рядом
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeViewTab('student')}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        codeViewTab === 'student' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Код ученика
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeViewTab('benchmark')}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        codeViewTab === 'benchmark' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Эталон учителя
                    </button>
                  </div>
                </div>

                <div className={`grid gap-3 ${codeViewTab === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {(codeViewTab === 'both' || codeViewTab === 'student') && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                      <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                        <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                          <Code2 className="w-3 h-3 text-blue-400" />
                          Сданный код ученика ({submission?.studentName})
                        </span>
                        <span>{submission?.fileName || 'main.py'}</span>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-56 leading-relaxed">
                        {submission?.codeSnippet || '# Код не загружен'}
                      </pre>
                    </div>
                  )}

                  {(codeViewTab === 'both' || codeViewTab === 'benchmark') && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                      <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Эталонное решение учителя (Benchmark)
                        </span>
                        <span>reference.py</span>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-56 leading-relaxed">
                        {assignment?.referenceCode || '# Эталон преподавателя не задан для этого задания'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 pb-1 pt-2">
            <span className="uppercase">{t('oral_answer')} ({session.questions.length} вопроса)</span>
            <span>Запись: 20 сек лимит</span>
          </div>

          {session.questions.map((q, idx) => {
            const ans = session.answers[q.id];
            const evalData = ans?.evaluation;

            return (
              <div
                key={q.id}
                className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 space-y-3 shadow-sm"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase mb-1">
                      ВОПРОС 0{idx + 1} // {q.skill}
                    </div>
                    <h3 className="text-sm font-semibold font-sans text-zinc-100">
                      {q.questionText}
                    </h3>
                  </div>

                  {evalData && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-bold text-zinc-100">{evalData.overallScore}%</span>
                    </div>
                  )}
                </div>

                {/* Intent */}
                <div className="text-[11px] text-zinc-500 flex items-start gap-1.5 border-l-2 border-zinc-700 pl-2">
                  <span>{t('diagnostic_intent')}: {q.purpose}</span>
                </div>

                {/* Audio Recording & Speech Transcript */}
                <div className="pt-2 border-t border-zinc-900 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
                      <span>{t('oral_answer')} ({ans?.durationSeconds || 12} сек)</span>
                    </span>
                    {ans?.audioUrl && (
                      <audio src={ans.audioUrl} controls className="h-6 w-44 scale-90" />
                    )}
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded p-3 text-xs text-zinc-300 font-sans italic">
                    "{ans?.transcript || 'Нет записи.'}"
                  </div>

                  {/* AI Evaluation Comment */}
                  {evalData && (
                    <div className="p-2.5 rounded bg-zinc-900/30 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                      <div className="flex justify-between text-zinc-500 text-[10px]">
                        <span>АВТО-АНАЛИЗ ОТВЕТА</span>
                        <span>УВЕРЕННОСТЬ: ВЫСОКАЯ</span>
                      </div>
                      <p className="font-sans text-zinc-300">{evalData.aiFeedback}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Score Summary & Teacher Override (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Overall Understanding Card */}
          <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 uppercase">
              <span>{t('col_score')}</span>
              <span className="text-emerald-400 font-semibold">[ЗАЧТЕНО]</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-zinc-100">{overrideScore}%</span>
              <span className="text-xs text-zinc-500">Итоговый балл</span>
            </div>

            {/* Rubric Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>{t('rubric_concept')}</span>
                  <span className="text-zinc-200">{rubric.conceptKnowledge}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-300" style={{ width: `${rubric.conceptKnowledge}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>{t('rubric_reasoning')}</span>
                  <span className="text-zinc-200">{rubric.reasoning}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-300" style={{ width: `${rubric.reasoning}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>{t('rubric_application')}</span>
                  <span className="text-zinc-200">{rubric.application}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-300" style={{ width: `${rubric.application}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Override Form */}
          <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 space-y-4 text-xs">
            <div className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
              {t('teacher_override')}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-500">Оценка в журнал:</span>
                <span className="text-zinc-100 font-bold">{overrideScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={overrideScore}
                onChange={(e) => setOverrideScore(Number(e.target.value))}
                className="w-full accent-zinc-200 bg-zinc-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-zinc-500 uppercase text-[10px] mb-1">
                {t('feedback_student')}
              </label>
              <textarea
                rows={3}
                value={studentFeedback}
                onChange={(e) => setStudentFeedback(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-600 resize-none font-sans text-xs"
              />
            </div>

            <div>
              <label className="block text-zinc-500 uppercase text-[10px] mb-1">
                {t('private_note')}
              </label>
              <textarea
                rows={2}
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-zinc-600 resize-none font-sans text-xs"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2 rounded bg-zinc-100 text-zinc-950 font-semibold hover:bg-zinc-300 transition-colors flex items-center justify-center gap-1.5 font-sans"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Сохранено в журнал!' : t('save_grade')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
