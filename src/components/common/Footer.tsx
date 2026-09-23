import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, HelpCircle, FileText, X, CheckCircle2, ChevronRight, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, setCurrentView } = useApp();
  
  const [activeModal, setActiveModal] = useState<'privacy' | 'faq' | 'protocol' | null>(null);

  const faqItems = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
  ];

  return (
    <>
      <footer className="w-full border-t border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-400">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-12">
          {/* Main 4-column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-zinc-800/80">
            {/* Brand Block (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div 
                onClick={() => setCurrentView('landing')} 
                className="flex items-center gap-3 cursor-pointer select-none group w-fit"
              >
                <div className="h-10 w-10 rounded-lg bg-black border border-zinc-700/80 p-0.5 flex items-center justify-center overflow-hidden group-hover:border-zinc-500 transition-colors">
                  <img 
                    src="/logo.jpg" 
                    alt="asianchangs logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="font-mono text-base font-bold tracking-wider text-zinc-100 uppercase">
                    STUDYMAXXING
                  </span>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-tight">
                    {t('brand_sub')}
                  </p>
                </div>
              </div>

              <p className="text-zinc-400 font-sans text-xs leading-relaxed max-w-sm">
                {t('footer_desc')}
              </p>
            </div>

            {/* Column 2: Schools & IT Clubs (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-zinc-200 uppercase font-semibold text-[11px] tracking-wider">
                {t('footer_col_schools')}
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => setActiveModal('faq')}
                    className="hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{t('footer_faq')}</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveModal('protocol')}
                    className="hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{t('footer_protocol')}</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{t('footer_audio_policy')}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Security (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-zinc-200 uppercase font-semibold text-[11px] tracking-wider">
                {t('footer_col_legal')}
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-zinc-300 hover:text-white">{t('footer_privacy')}</span>
                  </button>
                </li>
                <li className="text-zinc-500 text-[11px] leading-relaxed">
                  {t('privacy_badge')}
                </li>
                <li className="text-zinc-500 text-[11px] leading-relaxed">
                  support@studymaxxing.kz
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom sub-bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <div className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} STUDYMAXXING // asianchangs. {t('footer_rights')}</span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveModal('faq')}
                className="hover:text-zinc-300 transition-colors"
              >
                FAQ
              </button>
              <span className="text-zinc-700">·</span>
              <button 
                onClick={() => setActiveModal('privacy')}
                className="hover:text-zinc-300 transition-colors"
              >
                {t('footer_privacy')}
              </button>
              <span className="text-zinc-700">·</span>
              <button 
                onClick={() => setActiveModal('protocol')}
                className="hover:text-zinc-300 transition-colors"
              >
                {t('footer_protocol')}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL: Privacy Policy */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl font-mono">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-zinc-100">{t('privacy_title')}</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-zinc-300 leading-relaxed">
              <div className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
                {t('privacy_badge')}
              </div>

              <p className="text-zinc-200 font-medium">
                {t('privacy_intro')}
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 space-y-1">
                  <div className="font-bold font-mono text-zinc-100 text-xs">{t('privacy_p1_title')}</div>
                  <p className="text-zinc-400 text-xs">{t('privacy_p1_text')}</p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 space-y-1">
                  <div className="font-bold font-mono text-zinc-100 text-xs">{t('privacy_p2_title')}</div>
                  <p className="text-zinc-400 text-xs">{t('privacy_p2_text')}</p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 space-y-1">
                  <div className="font-bold font-mono text-zinc-100 text-xs">{t('privacy_p3_title')}</div>
                  <p className="text-zinc-400 text-xs">{t('privacy_p3_text')}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 flex justify-end bg-zinc-900/40">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-zinc-100 text-zinc-950 font-bold hover:bg-zinc-300 transition-colors text-xs"
              >
                {t('privacy_close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FAQ */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl font-mono">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-zinc-100">{t('faq_title')}</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <p className="text-zinc-400 text-xs mb-2">
                {t('faq_subtitle')}
              </p>

              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 space-y-1.5">
                    <div className="font-bold text-zinc-100 text-xs sm:text-sm flex items-start gap-2">
                      <span className="font-mono text-emerald-400 text-xs">0{idx + 1}.</span>
                      <span>{item.q}</span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed pl-6">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 flex justify-end bg-zinc-900/40">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-zinc-100 text-zinc-950 font-bold hover:bg-zinc-300 transition-colors text-xs"
              >
                {t('privacy_close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Protocol */}
      {activeModal === 'protocol' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl font-mono">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-zinc-100">{t('protocol_title')}</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-zinc-300 leading-relaxed">
              <div className="inline-block px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-200 font-mono text-[11px]">
                {t('protocol_badge')}
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 space-y-1">
                  <div className="font-bold font-mono text-zinc-100 text-xs">{t('protocol_rule1')}</div>
                  <p className="text-zinc-400 text-xs">{t('protocol_rule1_text')}</p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 space-y-1">
                  <div className="font-bold font-mono text-zinc-100 text-xs">{t('protocol_rule2')}</div>
                  <p className="text-zinc-400 text-xs">{t('protocol_rule2_text')}</p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 space-y-1">
                  <div className="font-bold font-mono text-zinc-100 text-xs">{t('protocol_rule3')}</div>
                  <p className="text-zinc-400 text-xs">{t('protocol_rule3_text')}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 flex justify-end bg-zinc-900/40">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded bg-zinc-100 text-zinc-950 font-bold hover:bg-zinc-300 transition-colors text-xs"
              >
                {t('privacy_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
