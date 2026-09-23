import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, User as UserIcon, ShieldAlert, GraduationCap, School, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    authModalRole,
    login,
    register,
    t
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab || 'login');
      setError(null);
      setSuccessMsg(null);
    }
  }, [isAuthModalOpen, authModalTab, authModalRole]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleFillCredentials = (presetUser: string, presetPass: string) => {
    setUsername(presetUser);
    setPassword(presetPass);
    setError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError(t('auth_err_fill_all'));
      return;
    }
    const res = login(username, password);
    if (!res.success) {
      setError(res.error || t('auth_err_invalid'));
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError(t('auth_err_fill_all'));
      return;
    }
    const res = register({
      username: username.trim(),
      password: password.trim(),
      name: name.trim() || username.trim(),
      role: 'student'
    });
    if (!res.success) {
      setError(res.error || t('auth_err_invalid'));
    } else {
      setSuccessMsg('Аккаунт успешно создан!');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
              SM
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-zinc-100 tracking-wide uppercase">
                {tab === 'login' ? t('auth_login_title') : t('auth_register_title')}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                STUDYMAXXING // AUTH_GATE
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 text-xs font-mono">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-medium ${
              tab === 'login'
                ? 'border-emerald-500 text-zinc-100 bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t('auth_login_tab')}
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-medium ${
              tab === 'register'
                ? 'border-emerald-500 text-zinc-100 bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t('auth_register_tab')}
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          {/* Quick preset credentials chips (highlighted for fast testing) */}
          <div className="p-3 bg-zinc-900/70 border border-zinc-800/80 rounded-lg">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('auth_quick_accounts')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleFillCredentials('teacher', '12345678')}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 hover:border-emerald-500/60 rounded text-left transition-colors group"
              >
                <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="text-zinc-200 font-semibold group-hover:text-emerald-400">teacher</span>
                  <span className="text-[10px] text-zinc-500 ml-1.5">/ 12345678</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('Nuradil M.', '12345678')}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 hover:border-emerald-500/60 rounded text-left transition-colors group"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="text-zinc-200 font-semibold group-hover:text-emerald-400">Nuradil M.</span>
                  <span className="text-[10px] text-zinc-500 ml-1.5">/ 12345678</span>
                </div>
              </button>
            </div>
          </div>

          {/* Error & Success alerts */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-mono">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  {t('auth_username')}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth_username_placeholder')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  {t('auth_password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth_password_placeholder')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-10 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <span>{t('auth_btn_login')}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Student Role Notice */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs font-mono">
                  <div className="text-zinc-200 font-semibold">{t('auth_student_reg_title')}</div>
                  <div className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    {t('auth_teacher_admin_notice')}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  {t('auth_fullname')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth_fullname_placeholder')}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  {t('auth_username')}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth_username_placeholder')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  {t('auth_password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth_password_placeholder')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-10 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <span>{t('auth_btn_register')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
