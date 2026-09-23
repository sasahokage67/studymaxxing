import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, GraduationCap, Code2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, currentRole, setCurrentView, openAuthModal, t } = useApp();

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-8 pt-10 pb-20 font-mono">
      {/* Main Title & Description */}
      <div className="space-y-4 max-w-4xl">
        <h1 className="text-4xl sm:text-6xl font-bold font-sans tracking-tight leading-[1.12]">
          <span className="text-emerald-400">{t('landing_title')}</span><br />
          <span className="text-zinc-400 font-normal">{t('landing_title_sub')}</span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 font-sans font-normal leading-relaxed max-w-3xl">
          {t('landing_desc')}
        </p>

        {/* Action Buttons - Strictly Role-Aware */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-sm">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="px-6 py-3 rounded bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{t('btn_start_login')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => openAuthModal('register')}
                className="px-6 py-3 rounded border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-all font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-zinc-400" />
                <span>{t('btn_register_student')}</span>
              </button>
            </>
          ) : currentRole === 'student' ? (
            <>
              <button
                onClick={() => setCurrentView('student_pipeline')}
                className="px-6 py-3 rounded bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
              >
                <Code2 className="w-4 h-4 text-zinc-950" />
                <span>{t('btn_submit_defense')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentView('student_dashboard')}
                className="px-6 py-3 rounded border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-all font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-zinc-400" />
                <span>{t('btn_my_assignments')}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('teacher_dashboard')}
                className="px-6 py-3 rounded bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{t('btn_teacher_demo')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentView('teacher_insights')}
                className="px-6 py-3 rounded border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-all font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('nav_heatmap')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Flagship Split Showcase Window - Exact Layout from Screenshot */}
      <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
        {/* Window Titlebar */}
        <div className="px-5 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-zinc-500 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="ml-2 font-mono text-zinc-400">studymaxxing-defense // session_084</span>
          </div>
        </div>

        {/* Real Photo + Code Inspection Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          {/* Left Column: Real Photo of Developer at Work */}
          <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-black flex items-center">
            <img
              src="/hero-code.jpg"
              alt="Student coding at laptop"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Column: Code Inspection & Oral Defense Log */}
          <div className="lg:col-span-6 p-6 sm:p-8 space-y-5 bg-zinc-950 text-xs sm:text-sm font-mono">
            {/* File Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold text-sm">
                <Code2 className="w-4 h-4 text-zinc-400" />
                <span>{t('showcase_file')}</span>
              </div>
              <span className="text-xs text-zinc-500 uppercase">{t('showcase_grade')}</span>
            </div>

            {/* Code Snippet Box */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-4 text-xs sm:text-sm text-zinc-300 space-y-1.5 overflow-x-auto font-mono">
              <div className="text-zinc-500">1  secret = 42  {t('showcase_code_comment')}</div>
              <div className="text-zinc-400">2  while True:</div>
              <div className="text-zinc-100 font-bold bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                3      guess = int(input("Число: "))
              </div>
              <div className="text-zinc-400">4      if guess == secret:</div>
              <div className="text-zinc-400">5          print("Угадал!")</div>
              <div className="text-zinc-100 font-bold bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                6          break
              </div>
            </div>

            {/* Oral Question Formulated */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                {t('showcase_q_label')}
              </div>
              <p className="text-zinc-100 font-sans text-sm sm:text-base font-bold leading-snug">
                {t('showcase_q_text')}
              </p>
            </div>

            {/* Student Oral Answer */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                {t('showcase_a_label')}
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3.5 sm:p-4 text-zinc-300 font-sans text-xs sm:text-sm italic leading-relaxed">
                {t('showcase_a_text')}
              </div>
            </div>

            {/* Verdict */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 pt-3 border-t border-zinc-900">
              <div>
                {t('showcase_verdict_label')} <span className="text-zinc-100 font-bold">{t('showcase_verdict_status')}</span>
              </div>
              <span className="text-emerald-400 font-bold tracking-wider">{t('showcase_verdict_pill')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-zinc-800 bg-zinc-950 p-6 sm:p-7 rounded-xl space-y-2.5">
          <div className="text-zinc-200 font-semibold text-base font-sans">{t('feature_1_title')}</div>
          <p className="text-zinc-400 font-sans leading-relaxed text-xs sm:text-sm">
            {t('feature_1_desc')}
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-6 sm:p-7 rounded-xl space-y-2.5">
          <div className="text-zinc-200 font-semibold text-base font-sans">{t('feature_2_title')}</div>
          <p className="text-zinc-400 font-sans leading-relaxed text-xs sm:text-sm">
            {t('feature_2_desc')}
          </p>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-6 sm:p-7 rounded-xl space-y-2.5">
          <div className="text-zinc-200 font-semibold text-base font-sans">{t('feature_3_title')}</div>
          <p className="text-zinc-400 font-sans leading-relaxed text-xs sm:text-sm">
            {t('feature_3_desc')}
          </p>
        </div>
      </div>

    </div>
  );
};
