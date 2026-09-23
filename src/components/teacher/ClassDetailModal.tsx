import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Users,
  Plus,
  Trash2,
  Copy,
  Check,
  FileCode,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { SchoolClass, User } from '../../types';
import { sanitizeAvatarUrl, FALLBACK_AVATAR_SVG } from '../../utils/avatar';

interface ClassDetailModalProps {
  schoolClass: SchoolClass | null;
  onClose: () => void;
  onCreateAssignmentForClass?: (classId: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  schoolClass,
  onClose,
  onCreateAssignmentForClass
}) => {
  const {
    users,
    submissions,
    addStudentsToClass,
    removeStudentFromClass,
    deleteClass,
    selectAssignment,
    setCurrentView,
    t
  } = useApp();

  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [newNicknamesText, setNewNicknamesText] = useState('');
  const [singleNickInput, setSingleNickInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!schoolClass) return null;

  // Enrolled students in this class
  const classStudents = users.filter((u) => schoolClass.studentIds.includes(u.id));

  const handleAddSingleNick = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = singleNickInput.trim().replace(/^@/, '');
    if (!cleanNick) return;
    addStudentsToClass(schoolClass.id, [{ username: cleanNick, password: '12345678' }]);
    setSingleNickInput('');
  };

  const handleAddMoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nicks = newNicknamesText
      .split(/[\n, ]+/)
      .map((l) => l.trim().replace(/^@/, ''))
      .filter((l) => l.length > 0 && /^[a-zA-Z0-9_.-]+$/.test(l));

    if (nicks.length === 0) return;

    addStudentsToClass(
      schoolClass.id,
      nicks.map((username) => ({ username, password: '12345678' }))
    );

    setNewNicknamesText('');
    setIsAddingStudents(false);
  };

  const handleCopyCredentials = () => {
    const lines = [
      `=== Список доступов: ${schoolClass.name} (${schoolClass.subject}) ===`,
      `Учебный год: ${schoolClass.academicYear}`,
      `Количество учеников: ${classStudents.length}`,
      '--------------------------------------------------',
      ...classStudents.map(
        (st, idx) =>
          `${idx + 1}. @${st.username}${st.name && st.name !== '@' + st.username ? ` (${st.name})` : ''} — Логин: ${st.username} | Пароль: ${st.password || '12345678'}`
      ),
      '--------------------------------------------------',
      'Вход на платформу: https://studymaxxing.kz'
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteClass = () => {
    deleteClass(schoolClass.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {schoolClass.grade}
              <span className="text-[10px]">{schoolClass.letter}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-base font-bold text-zinc-100">
                  {schoolClass.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  {schoolClass.grade} класс
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {schoolClass.academicYear}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                {schoolClass.subject} • {classStudents.length} учеников в составе
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between gap-2 flex-wrap text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAddingStudents(!isAddingStudents)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Добавить учеников</span>
            </button>

            {onCreateAssignmentForClass && (
              <button
                type="button"
                onClick={() => {
                  onCreateAssignmentForClass(schoolClass.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Создать задание для класса</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyCredentials}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Скопировать доступы'}</span>
            </button>
          </div>

          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-[11px] text-zinc-500 hover:text-red-400 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Удалить класс
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-400">Удалить этот класс?</span>
                <button
                  type="button"
                  onClick={handleDeleteClass}
                  className="px-2 py-1 rounded bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-bold"
                >
                  Да, удалить
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px]"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick add single student by nickname + toggle bulk drawer */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Зачислить ученика по никнейму</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingStudents(!isAddingStudents)}
                className="text-emerald-400 hover:text-emerald-300 text-xs font-mono cursor-pointer transition-colors"
              >
                {isAddingStudents ? 'Скрыть массовый ввод' : '+ Зачислить списком (Bulk)'}
              </button>
            </div>

            <form onSubmit={handleAddSingleNick} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={singleNickInput}
                  onChange={(e) => setSingleNickInput(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                  placeholder="Введите никнейм (например, arman_8a или student)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!singleNickInput.trim()}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Зачислить</span>
              </button>
            </form>

            <p className="text-[11px] text-zinc-500 font-sans">
              Если ученик с таким ником уже зарегистрирован, он будет прикреплен к классу. Если нет — для него создастся аккаунт с паролем 12345678.
            </p>

            {/* Bulk textarea drawer */}
            {isAddingStudents && (
              <form
                onSubmit={handleAddMoreSubmit}
                className="pt-3 border-t border-zinc-800/80 space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Вставьте никнеймы учеников (по одному в строке или через пробел):</span>
                </div>

                <textarea
                  rows={3}
                  value={newNicknamesText}
                  onChange={(e) => setNewNicknamesText(e.target.value)}
                  placeholder="@arman_8a&#10;@kairat_code&#10;daniyar.kz&#10;student"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    Пароль по умолчанию: <strong className="text-zinc-300 font-mono">12345678</strong>
                  </span>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Зачислить всех по списку
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Enrolled Students Roster */}
          <div className="border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Список учеников класса ({classStudents.length})</span>
              </span>
              <span className="text-[11px] text-zinc-500">Пароль по умолчанию: 12345678</span>
            </div>

            {classStudents.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-sans">
                В этом классе пока нет зачисленных учеников.{' '}
                <button
                  onClick={() => setIsAddingStudents(true)}
                  className="text-emerald-400 hover:underline cursor-pointer ml-1"
                >
                  Зачислить учеников по никнеймам
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/30 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-4">№</th>
                      <th className="py-2.5 px-4">Никнейм (@username)</th>
                      <th className="py-2.5 px-4">Имя / Профиль</th>
                      <th className="py-2.5 px-4">Пароль</th>
                      <th className="py-2.5 px-4">Сдано ДЗ</th>
                      <th className="py-2.5 px-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                    {classStudents.map((st, idx) => {
                      const userSubs = submissions.filter(
                        (sub) => sub.studentId === st.id || sub.studentName === st.name
                      );

                      return (
                        <tr key={st.id} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3 px-4 text-zinc-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={sanitizeAvatarUrl(st.avatarUrl, st.username, 'identicon')}
                                alt={st.username}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR_SVG;
                                }}
                                className="w-7 h-7 rounded-full object-contain p-0.5 bg-zinc-900 border border-zinc-700 shrink-0"
                              />
                              <span className="text-emerald-300">@{st.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-sans text-zinc-300">
                            <div className="font-medium text-zinc-200">{st.name || `@${st.username}`}</div>
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{st.password || '12345678'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-[10px]">
                              {userSubs.length} работ
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => removeStudentFromClass(schoolClass.id, st.id)}
                              className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Исключить из класса"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
