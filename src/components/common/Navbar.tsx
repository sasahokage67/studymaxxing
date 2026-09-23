import React from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { Language } from '../../i18n/translations';
import { sanitizeAvatarUrl, FALLBACK_AVATAR_SVG } from '../../utils/avatar';

export const Navbar: React.FC = () => {
  const { 
    currentRole, 
    currentUser, 
    currentView, 
    setCurrentView, 
    language,
    setLanguage,
    isAuthenticated,
    openAuthModal,
    openProfileModal,
    logout,
    t
  } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand with Asianchangs Logo */}
        <div 
          onClick={() => setCurrentView('landing')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="h-12 w-12 rounded-lg bg-black border border-zinc-700/80 p-1 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-zinc-500 transition-colors">
            <img 
              src="/logo.jpg" 
              alt="asianchangs logo" 
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-zinc-100 uppercase">
                STUDYMAXXING
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono tracking-tight">
              {t('brand_sub')}
            </p>
          </div>
        </div>

        {/* View Navigation */}
        <div className="hidden md:flex items-center gap-1.5 font-mono text-sm">
          {isAuthenticated && (
            currentRole === 'teacher' ? (
              <>
                <button
                  onClick={() => setCurrentView('teacher_dashboard')}
                  className={`px-3.5 py-1.5 rounded transition-colors ${
                    currentView === 'teacher_dashboard'
                      ? 'text-zinc-100 bg-zinc-900 border border-zinc-700 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t('nav_dashboard')}
                </button>
                <button
                  onClick={() => setCurrentView('teacher_insights')}
                  className={`px-3.5 py-1.5 rounded transition-colors ${
                    currentView === 'teacher_insights'
                      ? 'text-zinc-100 bg-zinc-900 border border-zinc-700 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t('nav_heatmap')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('student_dashboard')}
                  className={`px-3.5 py-1.5 rounded transition-colors ${
                    currentView === 'student_dashboard'
                      ? 'text-zinc-100 bg-zinc-900 border border-zinc-700 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t('nav_assignments')}
                </button>
                <button
                  onClick={() => setCurrentView('student_pipeline')}
                  className={`px-3.5 py-1.5 rounded transition-colors ${
                    currentView === 'student_pipeline' || currentView === 'student_submit'
                      ? 'text-zinc-100 bg-zinc-900 border border-zinc-700 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t('nav_upload')}
                </button>
              </>
            )
          )}
        </div>

        {/* Right Controls: Languages + Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center border border-zinc-800 rounded bg-zinc-900/80 p-1 text-xs font-mono">
            {(['ru', 'kz', 'en'] as Language[]).map((lng) => (
              <button
                key={lng}
                onClick={() => setLanguage(lng)}
                className={`px-2 sm:px-2.5 py-1 rounded uppercase font-semibold transition-all ${
                  language === lng
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {lng}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <>
              {/* User profile pill - Opens Personal Account Modal */}
              <button 
                onClick={openProfileModal}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all cursor-pointer group"
                title={t('profile_open_tooltip') || 'Личный кабинет'}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0 flex items-center justify-center group-hover:border-emerald-500/60 transition-colors">
                  <img
                    src={sanitizeAvatarUrl(
                      currentUser.avatarUrl,
                      currentUser.username,
                      currentUser.role === 'teacher' ? 'shapes' : 'identicon'
                    )}
                    alt={currentUser.username}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR_SVG;
                    }}
                    className="w-full h-full object-contain p-0.5 bg-zinc-950"
                  />
                </div>
                <span className="font-mono text-xs text-zinc-200 group-hover:text-zinc-100 font-medium max-w-[90px] sm:max-w-[120px] truncate">
                  {currentUser.username || currentUser.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 group-hover:bg-zinc-700/80 text-zinc-400 uppercase transition-colors">
                  {currentUser.role === 'teacher' ? t('teacher') : t('student')}
                </span>
              </button>

              {/* Logout button */}
              <button
                onClick={logout}
                title={t('nav_logout')}
                className="p-2 rounded border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('nav_login')}</span>
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="hidden sm:flex items-center px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <span>{t('nav_register')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
