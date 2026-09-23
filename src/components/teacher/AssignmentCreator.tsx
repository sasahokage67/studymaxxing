import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const AssignmentCreator: React.FC = () => {
  const { createAssignment, setCurrentView } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submissionType, setSubmissionType] = useState<'github' | 'code' | 'pdf'>('github');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [answerMode, setAnswerMode] = useState<'voice_or_text' | 'voice_only' | 'text_only'>('voice_or_text');
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [autoSubmit, setAutoSubmit] = useState<boolean>(true);
  const [allowRetakes, setAllowRetakes] = useState<boolean>(false);
  const [scoreVisibility, setScoreVisibility] = useState<'after_review' | 'immediately' | 'never'>('after_review');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createAssignment({
      title,
      description,
      submissionType,
      questionCount,
      answerMode,
      timerSeconds,
      autoSubmit,
      allowRetakes,
      scoreVisibility
    });

    setCurrentView('teacher_dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4 mb-6">
        <button
          onClick={() => setCurrentView('teacher_dashboard')}
          className="p-1.5 rounded-lg border border-white/10 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-xs font-mono uppercase text-emerald-400 font-medium">New Defense Rule</span>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Create Assignment</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-surface border border-white/[0.08] rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider">
            1. General Assignment Details
          </h2>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              ASSIGNMENT TITLE
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Engine"
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              DESCRIPTION / PROMPT
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students regarding what code/essay to submit..."
              className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              ACCEPTED SUBMISSION FORMAT
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'github', label: 'GitHub URL' },
                { id: 'code', label: 'Direct Code' },
                { id: 'pdf', label: 'PDF Document' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setSubmissionType(fmt.id as any)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    submissionType === fmt.id
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'border-white/10 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Defense Protocol Configuration */}
        <div className="bg-surface border border-white/[0.08] rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. AI Oral Defense Protocol</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Question Count */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                NUMBER OF QUESTIONS
              </label>
              <div className="flex gap-2">
                {[3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                      questionCount === count
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'border-white/10 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Limit */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                TIME LIMIT PER QUESTION
              </label>
              <div className="flex gap-2">
                {[15, 30, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setTimerSeconds(sec)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                      timerSeconds === sec
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'border-white/10 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Answer Mode */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              PERMITTED RESPONSE MODALITY
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'voice_or_text', label: 'Voice OR Text' },
                { id: 'voice_only', label: 'Strict Voice Only' },
                { id: 'text_only', label: 'Text Only' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAnswerMode(m.id as any)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    answerMode === m.id
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'border-white/10 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
              <span>Auto-advance & lock when timer reaches 0s</span>
              <input
                type="checkbox"
                checked={autoSubmit}
                onChange={(e) => setAutoSubmit(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
              <span>Allow students to re-record answers</span>
              <input
                type="checkbox"
                checked={allowRetakes}
                onChange={(e) => setAllowRetakes(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('teacher_dashboard')}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            Create Assignment & Defense Pipeline
          </button>
        </div>
      </form>
    </div>
  );
};
