import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User as UserIcon,
  Shield,
  Key,
  GraduationCap,
  School as SchoolIcon,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  Camera,
  Plus,
  Search,
  Sparkles,
  Building2,
  Globe,
  MapPin,
  Check
} from 'lucide-react';
import { School } from '../../types';
import { getSavedSchools, saveCustomSchool } from '../../services/schoolData';

const AVATAR_PRESETS = [
  { label: 'Преподаватель', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80' },
  { label: 'Ученик 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' },
  { label: 'Ученик 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
  { label: 'Ученица', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80' },
  { label: 'IT-Разработчик', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80' },
];

export const ProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    closeProfileModal,
    currentUser,
    currentRole,
    setCurrentView,
    logout,
    updateUserPassword,
    updateUserAvatar,
    updateUserSchool,
    updateUserGrade,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'school' | 'security'>('overview');
  
  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // School selector state
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newSchoolWebsite, setNewSchoolWebsite] = useState('');
  const [schoolSuccessMsg, setSchoolSuccessMsg] = useState<string | null>(null);

  // Avatar presets popover
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isProfileModalOpen) {
      setSchools(getSavedSchools());
      setSecurityMsg(null);
      setSchoolSuccessMsg(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsAddingSchool(false);
    }
  }, [isProfileModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileModalOpen) {
        closeProfileModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, closeProfileModal]);

  if (!isProfileModalOpen) return null;

  // Avatar file upload handler
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Размер файла не должен превышать 3 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateUserAvatar(reader.result);
        setShowAvatarPresets(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Password change handler with old password verification
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);

    if (!oldPassword.trim()) {
      setSecurityMsg({ type: 'error', text: 'Введите текущий пароль.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setSecurityMsg({ type: 'error', text: 'Новый пароль должен содержать минимум 6 символов.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'Новые пароли не совпадают.' });
      return;
    }

    const res = updateUserPassword(oldPassword, newPassword);
    if (res.success) {
      setSecurityMsg({ type: 'success', text: 'Пароль успешно обновлен!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setSecurityMsg({ type: 'error', text: res.error || 'Ошибка при обновлении пароля.' });
    }
  };

  // Select school from list
  const handleSelectSchool = (school: School) => {
    updateUserSchool(school.name, school.website);
    setSchoolSuccessMsg(`Школа установлена: ${school.name}`);
    setTimeout(() => {
      setSchoolSuccessMsg(null);
      setActiveTab('overview');
    }, 900);
  };

  // Add custom school
  const handleAddCustomSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    let formattedWebsite = newSchoolWebsite.trim();
    if (formattedWebsite && !formattedWebsite.startsWith('http://') && !formattedWebsite.startsWith('https://')) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    const created = saveCustomSchool({
      name: newSchoolName.trim(),
      city: newSchoolCity.trim() || 'Казахстан',
      website: formattedWebsite
    });

    setSchools(getSavedSchools());
    updateUserSchool(created.name, created.website);
    setIsAddingSchool(false);
    setNewSchoolName('');
    setNewSchoolCity('');
    setNewSchoolWebsite('');
    setSchoolSuccessMsg(`Школа успешно сохранена: ${created.name}`);
    setTimeout(() => {
      setSchoolSuccessMsg(null);
      setActiveTab('overview');
    }, 1000);
  };

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    s.city.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeProfileModal}
    >
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {currentRole === 'teacher' ? (
                <SchoolIcon className="w-4 h-4" />
              ) : (
                <GraduationCap className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-zinc-100 tracking-wide uppercase">
                {t('profile_title')}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                STUDYMAXXING // ACCOUNT_PROFILE
              </p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Card with Avatar changer */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/20">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Avatar with Camera upload button */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-800 border-2 border-zinc-700 shadow-md flex items-center justify-center relative">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-zinc-400" />
                )}

                {/* Hover overlay to change avatar */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono cursor-pointer"
                  title="Загрузить фото"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Фото</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />

              {/* Online indicator */}
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950" 
                title="Онлайн"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold font-sans text-zinc-100 truncate">
                  {currentUser.name}
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                  currentRole === 'teacher'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}>
                  {currentRole === 'teacher' ? t('teacher') : t('student')}
                </span>
              </div>

              <div className="flex items-center gap-2.5 mt-1.5 text-xs font-mono text-zinc-400 flex-wrap">
                <span className="text-zinc-300 font-semibold">@{currentUser.username}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{currentUser.email}</span>
              </div>

              {/* Quick Avatar Presets Row */}
              <div className="mt-2.5 flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3 h-3 text-emerald-400" />
                  <span>Загрузить аватар</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                  className="px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[11px] transition-colors cursor-pointer"
                >
                  Пресеты
                </button>
              </div>

              {/* Avatar presets gallery popdown */}
              {showAvatarPresets && (
                <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2 overflow-x-auto">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        updateUserAvatar(preset.url);
                        setShowAvatarPresets(false);
                      }}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 hover:border-emerald-500 hover:scale-105 transition-all shrink-0 cursor-pointer"
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-center border-b-2 font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-zinc-100 bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span>Обзор</span>
          </button>

          <button
            onClick={() => setActiveTab('school')}
            className={`flex-1 py-3 text-center border-b-2 font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'school'
                ? 'border-emerald-500 text-zinc-100 bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Школа ({currentUser.school ? 'Указана' : 'Выбрать'})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 text-center border-b-2 font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-emerald-500 text-zinc-100 bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-zinc-400" />
            <span>Безопасность</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* School Banner Card in Overview */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                      Учебное заведение
                    </div>
                    <div className="text-sm font-bold text-zinc-100 mt-0.5">
                      {currentUser.school || 'Школа не выбрана'}
                    </div>
                    {currentUser.schoolWebsite && (
                      <a
                        href={currentUser.schoolWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>{currentUser.schoolWebsite.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('school')}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors shrink-0 cursor-pointer"
                >
                  {currentUser.school ? 'Сменить школу' : 'Выбрать школу'}
                </button>
              </div>

              {/* Role Specific Academic Stats (Defense Score removed as requested) */}
              <div>
                <h4 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  {currentRole === 'teacher' ? 'Метрики классов и защит' : 'Текущий академический статус'}
                </h4>

                {currentRole === 'teacher' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg">
                      <div className="text-[11px] text-zinc-500 uppercase">Учеников</div>
                      <div className="text-xl font-bold text-zinc-100 mt-1">24</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">10 «А», 9 «Б»</div>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg">
                      <div className="text-[11px] text-zinc-500 uppercase">Заданий</div>
                      <div className="text-xl font-bold text-zinc-100 mt-1">3</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Активные курсы</div>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg">
                      <div className="text-[11px] text-zinc-500 uppercase">Проверено</div>
                      <div className="text-xl font-bold text-emerald-400 mt-1">4</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Защиты сданы</div>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg">
                      <div className="text-[11px] text-zinc-500 uppercase">Ср. понимание</div>
                      <div className="text-xl font-bold text-zinc-100 mt-1">84%</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">+4% за неделю</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                    <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] text-zinc-500 uppercase flex items-center justify-between">
                          <span>Класс</span>
                          <span className="text-emerald-400 font-bold">{currentUser.grade || 8} класс</span>
                        </div>
                        <div className="text-base font-bold text-zinc-100 mt-1 truncate">
                          {currentUser.grade || 8} «А» класс
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-zinc-800/80">
                        <div className="text-[9px] text-zinc-500 uppercase mb-1">Сменить класс:</div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {[5, 6, 7, 8, 9, 10, 11].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => updateUserGrade(g)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                (currentUser.grade || 8) === g
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg">
                      <div className="text-[11px] text-zinc-500 uppercase">Сдано работ</div>
                      <div className="text-lg font-bold text-zinc-100 mt-1">1 проект</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">quiz_bot.py</div>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg">
                      <div className="text-[11px] text-zinc-500 uppercase">Статус защиты</div>
                      <div className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Защита принята</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Оценка выставлена</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Navigation Links */}
              <div>
                <h4 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Быстрый переход
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {currentRole === 'teacher' ? (
                    <>
                      <button
                        onClick={() => {
                          setCurrentView('teacher_dashboard');
                          closeProfileModal();
                        }}
                        className="flex items-center justify-between p-3 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-zinc-200 group-hover:text-zinc-100 font-medium">
                          {t('nav_dashboard')} (Журнал работ)
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('teacher_insights');
                          closeProfileModal();
                        }}
                        className="flex items-center justify-between p-3 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-zinc-200 group-hover:text-zinc-100 font-medium">
                          {t('nav_heatmap')} (Аналитика класса)
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setCurrentView('student_dashboard');
                          closeProfileModal();
                        }}
                        className="flex items-center justify-between p-3 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-zinc-200 group-hover:text-zinc-100 font-medium">
                          {t('nav_assignments')} (Мои задания)
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('student_submit');
                          closeProfileModal();
                        }}
                        className="flex items-center justify-between p-3 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-zinc-200 group-hover:text-zinc-100 font-medium">
                          {t('nav_upload')} (Сдать новый код)
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* School Selection Tab */}
          {activeTab === 'school' && (
            <div className="space-y-4 font-mono">
              {schoolSuccessMsg && (
                <div className="p-3 rounded-lg text-xs flex items-center gap-2 border bg-emerald-950/40 border-emerald-800/60 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{schoolSuccessMsg}</span>
                </div>
              )}

              {/* Action Bar: Search & Add School Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    placeholder="Поиск школы (НИШ, РФМШ, БИЛ, город...)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingSchool(!isAddingSchool)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    isAddingSchool
                      ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingSchool ? 'К списку школ' : 'Добавить свою школу'}</span>
                </button>
              </div>

              {/* Add Custom School Form */}
              {isAddingSchool ? (
                <form onSubmit={handleAddCustomSchoolSubmit} className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Добавление нового учебного заведения</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Полное наименование школы *
                    </label>
                    <input
                      type="text"
                      required
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                      placeholder="например, Лицей-интернат БИЛ г. Кокшетау"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Город / Населенный пункт
                      </label>
                      <input
                        type="text"
                        value={newSchoolCity}
                        onChange={(e) => setNewSchoolCity(e.target.value)}
                        placeholder="например, г. Кокшетау"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Официальный сайт школы
                      </label>
                      <input
                        type="text"
                        value={newSchoolWebsite}
                        onChange={(e) => setNewSchoolWebsite(e.target.value)}
                        placeholder="например, https://kokshetau-bil.kz"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingSchool(false)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Сохранить и выбрать
                    </button>
                  </div>
                </form>
              ) : (
                /* Schools List */
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  <div className="text-[11px] text-zinc-500 mb-1">
                    Школ в базе Казахстана: {schools.length} (Найдено: {filteredSchools.length})
                  </div>

                  {filteredSchools.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500 border border-zinc-800/80 rounded-lg">
                      Школа не найдена. Нажмите «Добавить свою школу», чтобы внести ее в систему.
                    </div>
                  ) : (
                    filteredSchools.map((school) => {
                      const isSelected = currentUser.school === school.name;
                      return (
                        <div
                          key={school.id}
                          className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-emerald-500/80 bg-emerald-500/10'
                              : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                                {school.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" />
                                {school.city}
                              </span>
                              {school.isCustom && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-500/20">
                                  Пользовательская
                                </span>
                              )}
                            </div>

                            {school.website && (
                              <a
                                href={school.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 mt-1"
                              >
                                <Globe className="w-3 h-3 text-zinc-500" />
                                <span>{school.website.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectSchool(school)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-emerald-500 text-zinc-950'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Выбрана</span>
                              </>
                            ) : (
                              <span>Выбрать</span>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Security & Password Tab (Requiring Old Password) */}
          {activeTab === 'security' && (
            <div className="space-y-4 font-mono">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                <div className="text-xs text-zinc-300 font-semibold mb-1">
                  Смена пароля аккаунта
                </div>
                <div className="text-[11px] text-zinc-500 leading-relaxed">
                  Для подтверждения безопасности введите текущий пароль от аккаунта <span className="text-zinc-200 font-semibold">{currentUser.username}</span>, затем новый пароль.
                </div>
              </div>

              {securityMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  securityMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/40 border-red-800/60 text-red-300'
                }`}>
                  {securityMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{securityMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3.5">
                {/* Old Password field */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Текущий (старый) пароль *
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Введите текущий пароль"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>

                {/* New Password field */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Новый пароль *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>

                {/* Confirm Password field */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Подтвердите новый пароль *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите новый пароль"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Подтвердить и сменить пароль
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs font-mono">
          <button
            onClick={closeProfileModal}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {t('privacy_close')}
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-900/50 hover:text-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav_logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
