import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CircularTimer } from '../defense/CircularTimer';
import { AudioRecorder } from '../audio/AudioRecorder';
import { ArrowRight, Check, Code2 } from 'lucide-react';

interface StudentDefenseViewProps {
  sessionId?: string;
}

export const StudentDefenseView: React.FC<StudentDefenseViewProps> = ({ sessionId }) => {
  const { 
    defenseSessions, 
    assignments, 
    submitDefenseAnswer, 
    completeDefenseSession, 
    setCurrentView,
    t 
  } = useApp();

  const targetSessionId = sessionId || Object.keys(defenseSessions).find(
    (k) => defenseSessions[k].status === 'defense_ready' || defenseSessions[k].status === 'pending'
  ) || 'def_arman_1';

  const session = defenseSessions[targetSessionId] || defenseSessions['def_arman_1'];
  const assignment = assignments.find((a) => a.id === session?.assignmentId) || assignments[0];

  const questions = session?.questions || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerMode, setAnswerMode] = useState<'voice' | 'text'>('voice');
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const activeQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length || 3;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswerSubmit = async (audioUrl?: string, transcript?: string, duration?: number) => {
    if (!activeQuestion) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);

    const submittedTranscript = transcript || textAnswer;
    const submittedDuration = duration || 20;

    await submitDefenseAnswer(session.id, activeQuestion.id, {
      mode: answerMode,
      textAnswer: answerMode === 'text' ? textAnswer : undefined,
      audioUrl: answerMode === 'voice' ? audioUrl : undefined,
      transcript: submittedTranscript,
      durationSeconds: submittedDuration
    });

    setIsSubmitting(false);

    if (isLastQuestion) {
      await completeDefenseSession(session.id);
      setIsCompleted(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTextAnswer('');
      setIsTimerRunning(true);
    }
  };

  const handleTimeUp = () => {
    if (answerMode === 'text' && textAnswer.trim()) {
      handleAnswerSubmit(undefined, textAnswer, 20);
    } else {
      handleAnswerSubmit(
        undefined, 
        'Время вышло, но суть ответа заключалась в сохранении состояния словаря.',
        20
      );
    }
  };

  // Completion Screen
  if (isCompleted) {
    const score = session.overallScore || 88;
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center font-mono">
        <div className="w-10 h-10 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <Check className="w-5 h-5" />
        </div>

        <div className="text-xs text-zinc-500 uppercase tracking-widest">{t('completed')}</div>
        <h1 className="text-2xl font-bold font-sans text-zinc-100 tracking-tight mt-1">
          {t('defense_completed')}
        </h1>
        <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto font-sans">
          {t('defense_submitted_desc')}
        </p>

        <div className="mt-8 border border-zinc-800 bg-zinc-950 rounded-lg p-5 text-left text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <span className="text-zinc-500 uppercase">{t('evaluated_understanding')}</span>
            <span className="text-xl font-bold text-zinc-100">{score}%</span>
          </div>

          <div className="space-y-2 text-zinc-400">
            <div className="flex justify-between">
              <span>{t('rubric_concept')}</span>
              <span className="text-zinc-200">{session.overallRubric?.conceptKnowledge || 92}%</span>
            </div>
            <div className="flex justify-between">
              <span>{t('rubric_reasoning')}</span>
              <span className="text-zinc-200">{session.overallRubric?.reasoning || 86}%</span>
            </div>
            <div className="flex justify-between">
              <span>{t('rubric_application')}</span>
              <span className="text-zinc-200">{session.overallRubric?.application || 85}%</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3 text-xs">
          <button
            onClick={() => setCurrentView('student_dashboard')}
            className="px-4 py-2 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-sans"
          >
            {t('back_to_dash')}
          </button>
          <button
            onClick={() => setCurrentView('student_pipeline')}
            className="px-4 py-2 rounded bg-zinc-100 text-zinc-950 font-semibold hover:bg-zinc-300 flex items-center gap-1.5 font-sans cursor-pointer"
          >
            <span>{t('nav_upload')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-mono">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-8 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="text-zinc-200 font-semibold uppercase">{assignment.title}</span>
          <span>//</span>
          <span>{t('defense_room')}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-400">
            {t('question_of')} {currentQuestionIndex + 1} {t('of')} {totalQuestions}
          </span>
          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-1 rounded-sm ${
                  idx === currentQuestionIndex
                    ? 'bg-zinc-100'
                    : idx < currentQuestionIndex
                    ? 'bg-zinc-600'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Interrogation Screen */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Header & Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 font-semibold uppercase">
              {activeQuestion?.skill}
            </span>
            <span className="text-zinc-500">Уровень: {activeQuestion?.difficulty}</span>
          </div>

          <div className="w-full sm:w-48">
            <CircularTimer
              initialSeconds={activeQuestion?.timeLimit || 20}
              isRunning={isTimerRunning}
              onTimeUp={handleTimeUp}
            />
          </div>
        </div>

        {/* The Question */}
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
            {t('question_of')} 0{currentQuestionIndex + 1}:
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight leading-snug">
            {activeQuestion?.questionText}
          </h2>
        </div>

        {/* Code Grounding Context */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded p-3 text-xs text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold">Фрагмент твоего кода:</span>
            <span>quiz_bot.py · Строки 4–15</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-sans">
            "{activeQuestion?.purpose}"
          </p>
        </div>

        {/* Response Controls */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-zinc-900 pb-2">
            <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Формат ответа</span>
            <div className="flex gap-2">
              <button
                onClick={() => setAnswerMode('voice')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  answerMode === 'voice' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Голос (Микрофон)
              </button>
              <button
                onClick={() => setAnswerMode('text')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  answerMode === 'text' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Текст
              </button>
            </div>
          </div>

          {answerMode === 'voice' ? (
            <AudioRecorder
              onRecordingComplete={(audioUrl, transcript, duration) => {
                handleAnswerSubmit(audioUrl, transcript, duration);
              }}
              allowRetakes={assignment.allowRetakes}
            />
          ) : (
            <div className="space-y-3">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                rows={3}
                placeholder="Объясни своими словами..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 resize-none font-sans"
              />
              <div className="flex justify-end">
                <button
                  disabled={!textAnswer.trim() || isSubmitting}
                  onClick={() => handleAnswerSubmit(undefined, textAnswer, 20)}
                  className="px-4 py-2 rounded bg-zinc-100 text-zinc-950 font-semibold hover:bg-zinc-300 disabled:opacity-50 text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>{t('confirm_advance')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
