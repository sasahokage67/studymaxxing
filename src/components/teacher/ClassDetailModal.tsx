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
  const [newNamesText, setNewNamesText] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!schoolClass) return null;

  // Enrolled students in this class
  const classStudents = users.filter((u) => schoolClass.studentIds.includes(u.id));

  const handleAddMoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const names = newNamesText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (names.length === 0) return;

    addStudentsToClass(
      schoolClass.id,
      names.map((name) => ({ name, password: '12345678' }))
    );

    setNewNamesText('');
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
          `${idx + 1}. ${st.name} — Логин: ${st.username} | Пароль: ${st.password || '12345678'}`
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
          {/* Add more students drawer/form */}
          {isAddingStudents && (
            <form
              onSubmit={handleAddMoreSubmit}
              className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Добавление новых учеников в {schoolClass.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingStudents(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Скрыть
                </button>
              </div>

              <textarea
                rows={3}
                value={newNamesText}
                onChange={(e) => setNewNamesText(e.target.value)}
                placeholder="Вставьте ФИО учеников по одному в строке, например:&#10;Айбек Сериков&#10;Мадина Смагулова"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-sans focus:outline-none focus:border-emerald-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  Будут сгенерированы учетные записи с паролем 12345678
                </span>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-sm"
                >
                  Зачислить учеников
                </button>
              </div>
            </form>
          )}

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
                  Добавить учеников списком
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/30 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-4">№</th>
                      <th className="py-2.5 px-4">Ученик (ФИО)</th>
                      <th className="py-2.5 px-4">Логин</th>
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
                          <td className="py-3 px-4 font-sans font-medium text-zinc-200">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  st.avatarUrl ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'
                                }
                                alt={st.name}
                                className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0"
                              />
                              <div>
                                <div className="text-zinc-200">{st.name}</div>
                                <div className="text-[10px] text-zinc-500 font-mono">{st.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-emerald-400 font-bold">{st.username}</td>
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
