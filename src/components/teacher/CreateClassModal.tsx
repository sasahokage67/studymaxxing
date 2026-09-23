import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Users,
  Plus,
  CheckCircle2,
  Copy,
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SchoolClass, User } from '../../types';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated?: (newClass: SchoolClass) => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onClassCreated
}) => {
  const { createClass, users, t } = useApp();

  const [grade, setGrade] = useState<number>(8);
  const [letter, setLetter] = useState<string>('А');
  const [subject, setSubject] = useState<string>('Информатика & Python');
  const [academicYear, setAcademicYear] = useState<string>('2026–2027');

  // Mode: 'bulk_text' or 'select_existing'
  const [addMode, setAddMode] = useState<'bulk_text' | 'select_existing'>('bulk_text');
  
  // Bulk names input
  const [bulkNamesText, setBulkNamesText] = useState<string>(
    'Алихан Сейдалиев\nДиана Рахимова\nНурлан Жусупов\nАйгерим Касымова\nТимур Ким'
  );

  // Selected existing student IDs
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Created class state for success view
  const [createdClassData, setCreatedClassData] = useState<{
    newClass: SchoolClass;
    roster: { name: string; username: string; password: string }[];
  } | null>(null);

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Parse bulk names
  const parsedNames = bulkNamesText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Existing students
  const existingStudents = users.filter((u) => u.role === 'student');

  const handleFillDemo = () => {
    setBulkNamesText(
      'Алихан Сейдалиев\nДиана Рахимова\nНурлан Жусупов\nАйгерим Касымова\nТимур Ким\nДамир Омаров\nКамила Исмаилова'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const studentsToCreate: { name: string; username?: string; password?: string }[] = [];

    if (addMode === 'bulk_text') {
      parsedNames.forEach((fullName) => {
        studentsToCreate.push({
          name: fullName,
          password: '12345678'
        });
      });
    } else {
      // From existing students
      const selectedUsers = existingStudents.filter((u) => selectedUserIds.includes(u.id));
      selectedUsers.forEach((u) => {
        studentsToCreate.push({
          name: u.name,
          username: u.username,
          password: u.password || '12345678'
        });
      });
    }

    const cleanLetter = letter.trim().toUpperCase() || 'А';
    const newClass = createClass(
      {
        grade,
        letter: cleanLetter,
        name: `${grade} «${cleanLetter}» класс`,
        subject: subject.trim() || 'Информатика & Python',
        academicYear: academicYear.trim() || '2026–2027'
      },
      studentsToCreate
    );

    // Prepare roster for teacher export
    const rosterList = studentsToCreate.map((s, idx) => {
      const transliterated = s.name
        .toLowerCase()
        .replace(/[^a-zа-я0-9]/g, '_')
        .slice(0, 12);
      return {
        name: s.name,
        username: s.username || `${transliterated || 'student'}_${grade}`,
        password: s.password || '12345678'
      };
    });

    setCreatedClassData({
      newClass,
      roster: rosterList
    });

    if (onClassCreated) {
      onClassCreated(newClass);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdClassData) return;
    const lines = [
      `=== Список доступов: ${createdClassData.newClass.name} (${createdClassData.newClass.subject}) ===`,
      `Учебный год: ${createdClassData.newClass.academicYear}`,
      `Всего учеников: ${createdClassData.roster.length}`,
      '--------------------------------------------------',
      ...createdClassData.roster.map(
        (st, i) => `${i + 1}. ${st.name} — Логин: ${st.username} | Пароль: ${st.password}`
      ),
      '--------------------------------------------------',
      'Вход на платформу: https://studymaxxing.kz'
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAndClose = () => {
    setCreatedClassData(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-zinc-100 tracking-wide uppercase">
                {createdClassData ? 'Класс успешно сформирован' : 'Создание нового класса'}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                УЧИТЕЛЬСКАЯ // КЛАССЫ И УЧЕНИКИ
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {createdClassData ? (
            /* Success & Roster Export View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-zinc-100 font-sans">
                    {createdClassData.newClass.name} успешно создан!
                  </div>
                  <div className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    В систему добавлено <span className="text-emerald-400 font-bold">{createdClassData.roster.length} учеников</span>.
                    Учетные записи активны, пароль по умолчанию: <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-emerald-300">12345678</code>.
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/40">
                <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
                    Сформированные доступы для учеников ({createdClassData.roster.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Скопировано!' : 'Скопировать весь список'}</span>
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/40 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase sticky top-0">
                      <tr>
                        <th className="py-2 px-3">№</th>
                        <th className="py-2 px-3">Ученик (ФИО)</th>
                        <th className="py-2 px-3">Логин</th>
                        <th className="py-2 px-3">Пароль</th>
                        <th className="py-2 px-3">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                      {createdClassData.roster.map((st, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/30">
                          <td className="py-2 px-3 text-zinc-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-sans font-medium text-zinc-200">{st.name}</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">{st.username}</td>
                          <td className="py-2 px-3 text-zinc-400">{st.password}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                              Готов к входу
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Закрыть и перейти к классам
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Grade Selection */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center justify-between">
                  <span>1. Выберите класс (параллель 5–11):</span>
                  <span className="text-emerald-400 font-bold">{grade} класс</span>
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {[5, 6, 7, 8, 9, 10, 11].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-2 text-center rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        grade === g
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                          : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {g} кл.
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Letter & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Литера / буква класса
                  </label>
                  <div className="flex gap-1.5">
                    {['А', 'Б', 'В', 'Г'].map((letOption) => (
                      <button
                        key={letOption}
                        type="button"
                        onClick={() => setLetter(letOption)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                          letter === letOption
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                            : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        «{letOption}»
                      </button>
                    ))}
                    <input
                      type="text"
                      maxLength={3}
                      value={letter}
                      onChange={(e) => setLetter(e.target.value.toUpperCase())}
                      placeholder="Другая"
                      className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 text-center text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Учебный год
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Название предмета / дисциплины
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Информатика & Python"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {['Информатика & Python', 'IT-Кружок', 'Основы алгоритмов', 'Подготовка к олимпиадам'].map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSubject(p)}
                        className="text-[10px] px-2 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Add Students Section */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>2. Добавление учеников (Фулл класс)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAddMode('bulk_text')}
                      className={`px-2.5 py-1 rounded font-medium transition-all ${
                        addMode === 'bulk_text'
                          ? 'bg-zinc-800 text-zinc-100 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Списком (Текст)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMode('select_existing')}
                      className={`px-2.5 py-1 rounded font-medium transition-all ${
                        addMode === 'select_existing'
                          ? 'bg-zinc-800 text-zinc-100 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Из зарегистрированных ({existingStudents.length})
                    </button>
                  </div>
                </div>

                {addMode === 'bulk_text' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Вставьте ФИО учеников (по одному в строке):</span>
                      <button
                        type="button"
                        onClick={handleFillDemo}
                        className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Пример для 8 «А»</span>
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={bulkNamesText}
                      onChange={(e) => setBulkNamesText(e.target.value)}
                      placeholder="Иванов Иван&#10;Петров Петр&#10;Сидоров Сидор"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
                    />

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/80">
                      <span>
                        Будет зарегистрировано:{' '}
                        <strong className="text-emerald-400 font-mono">{parsedNames.length} учеников</strong>
                      </span>
                      <span className="text-zinc-500">
                        Пароль по умолчанию: <strong className="text-zinc-300 font-mono">12345678</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] text-zinc-500">
                      Отметьте учеников, которых необходимо зачислить в этот класс:
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-zinc-800 rounded-lg bg-zinc-900/40 divide-y divide-zinc-800/60">
                      {existingStudents.length === 0 ? (
                        <div className="p-4 text-center text-xs text-zinc-500">
                          Нет зарегистрированных учеников
                        </div>
                      ) : (
                        existingStudents.map((st) => (
                          <label
                            key={st.id}
                            className="flex items-center justify-between p-2.5 hover:bg-zinc-900/70 cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedUserIds.includes(st.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUserIds([...selectedUserIds, st.id]);
                                  } else {
                                    setSelectedUserIds(selectedUserIds.filter((id) => id !== st.id));
                                  }
                                }}
                                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                              />
                              <span className="font-sans font-medium text-zinc-200">{st.name}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">@{st.username}</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {st.grade ? `${st.grade} кл.` : 'Без класса'}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    Создать {grade} «{letter.toUpperCase()}» и добавить{' '}
                    {addMode === 'bulk_text' ? parsedNames.length : selectedUserIds.length} учеников
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
