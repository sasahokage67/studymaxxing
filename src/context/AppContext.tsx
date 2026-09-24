import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  Assignment,
  Submission,
  DefenseSession,
  ClassInsight,
  DefenseAnswer,
  TeacherReview,
  SchoolClass,
  DefenseQuestion,
  AIAnalysis
} from '../types';
import {
  SEEDED_USERS,
  SEEDED_ASSIGNMENTS,
  SEEDED_SUBMISSIONS,
  SEEDED_DEFENSE_SESSIONS,
  SEEDED_CLASS_INSIGHTS,
  SEEDED_CLASSES
} from '../services/mockData';
import { AIService, DefenseSessionVerdict, EvaluatedQuestionResult } from '../services/aiService';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { getNeutralAvatarUrl, sanitizeAvatarUrl } from '../utils/avatar';
import { sbUpsertUser, sbUpdateUser, sbFetchUsers } from '../services/supabase';

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  currentView: string;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authModalRole?: UserRole;
  users: User[];
  classes: SchoolClass[];
  selectedAssignmentId: string | null;
  selectedSubmissionId: string | null;
  selectedDefenseSessionId: string | null;
  assignments: Assignment[];
  submissions: Submission[];
  defenseSessions: Record<string, DefenseSession>;
  classInsights: ClassInsight;
  computeFilteredInsights: (classId?: string) => ClassInsight;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS['ru']) => string;
  setCurrentView: (view: string) => void;
  switchRole: (role: UserRole) => void;
  openAuthModal: (tab?: 'login' | 'register', defaultRole?: UserRole) => void;
  closeAuthModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  updateUserPassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  updateUserAvatar: (avatarUrl: string) => void;
  updateUserSchool: (school: string, schoolWebsite?: string) => void;
  updateUserGrade: (grade: number) => void;
  createClass: (
    classData: { grade: number; letter: string; name?: string; subject?: string; academicYear?: string },
    students?: { username?: string; name?: string; password?: string }[]
  ) => SchoolClass;
  addStudentsToClass: (classId: string, students: { username?: string; name?: string; password?: string }[]) => User[];
  removeStudentFromClass: (classId: string, studentId: string) => void;
  deleteClass: (classId: string) => void;
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (data: { username: string; password: string; name: string; role: UserRole; grade?: number }) => { success: boolean; error?: string };
  logout: () => void;
  selectAssignment: (id: string | null) => void;
  selectSubmission: (id: string | null) => void;
  selectDefenseSession: (id: string | null) => void;
  createAssignment: (data: Partial<Assignment>) => Assignment;
  createSubmission: (data: {
    studentName: string;
    assignmentId: string;
    fileName: string;
    codeSnippet?: string;
    githubUrl?: string;
    analysis?: AIAnalysis;
    questions?: DefenseQuestion[];
    results?: EvaluatedQuestionResult[];
    verdict?: DefenseSessionVerdict;
  }) => Promise<Submission>;
  runAIAnalysis: (submissionId: string) => Promise<void>;
  submitDefenseAnswer: (sessionId: string, questionId: string, answer: Partial<DefenseAnswer>) => Promise<void>;
  completeDefenseSession: (sessionId: string) => Promise<void>;
  saveTeacherReview: (sessionId: string, review: Partial<TeacherReview>) => void;
  resetDemoData: () => void;
}

const STORAGE_DB_VERSION = 'lp_v6_real_data_only';

// Automatic migration & reset on version change
if (typeof window !== 'undefined') {
  try {
    const currentVersion = localStorage.getItem('lp_storage_version');
    if (currentVersion !== STORAGE_DB_VERSION) {
      localStorage.removeItem('lp_users');
      localStorage.removeItem('lp_current_user');
      localStorage.removeItem('lp_auth');
      localStorage.removeItem('lp_submissions');
      localStorage.removeItem('lp_defense_sessions');
      localStorage.setItem('lp_storage_version', STORAGE_DB_VERSION);
    }
  } catch (e) {
    console.error('Storage reset error:', e);
  }
}

/**
 * Dynamically compute ClassInsight (weak skills and student concept heatmap)
 * strictly from REAL student accounts and their actual completed defense sessions.
 */
export const computeClassInsights = (
  users: User[],
  defenseSessions: Record<string, DefenseSession>,
  selectedClassId?: string
): ClassInsight => {
  const students = users.filter(
    (u) =>
      u.role === 'student' &&
      (!selectedClassId || selectedClassId === 'all' || u.classId === selectedClassId)
  );

  const studentIdSet = new Set(students.map((s) => s.id));

  const sessions = Object.values(defenseSessions).filter(
    (ds) =>
      studentIdSet.has(ds.studentId) &&
      (ds.status === 'verified' || ds.status === 'teacher_review' || typeof ds.overallScore === 'number')
  );

  const skillScoresMap: Record<string, { total: number; count: number }> = {};
  const heatmapRows: ClassInsight['conceptHeatmap'] = [];

  students.forEach((st) => {
    const stSessions = sessions.filter((s) => s.studentId === st.id);
    if (stSessions.length === 0) return; // Only include students with real completed tests

    const studentSkillTotals: Record<string, { total: number; count: number }> = {};

    stSessions.forEach((ds) => {
      ds.questions.forEach((q) => {
        if (!q.skill) return;
        const ans = ds.answers[q.id];
        const score = ans?.evaluation?.overallScore ?? ds.overallScore;
        if (typeof score === 'number') {
          if (!studentSkillTotals[q.skill]) {
            studentSkillTotals[q.skill] = { total: 0, count: 0 };
          }
          studentSkillTotals[q.skill].total += score;
          studentSkillTotals[q.skill].count += 1;

          if (!skillScoresMap[q.skill]) {
            skillScoresMap[q.skill] = { total: 0, count: 0 };
          }
          skillScoresMap[q.skill].total += score;
          skillScoresMap[q.skill].count += 1;
        }
      });
    });

    const studentScores: Record<string, number> = {};
    Object.entries(studentSkillTotals).forEach(([skill, data]) => {
      studentScores[skill] = Math.round(data.total / data.count);
    });

    const overallScore = Math.round(
      stSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / stSessions.length
    );

    heatmapRows.push({
      studentId: st.id,
      studentName: `${st.name} (@${st.username})`,
      scores: studentScores,
      overall: overallScore
    });
  });

  const weakSkills = Object.entries(skillScoresMap)
    .map(([skill, data]) => ({
      skill,
      score: Math.round(data.total / data.count)
    }))
    .sort((a, b) => a.score - b.score);

  return {
    weakSkills,
    conceptHeatmap: heatmapRows
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('lp_language') as Language) || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lp_language', lang);
  };

  const t = (key: keyof typeof TRANSLATIONS['ru']): string => {
    return (TRANSLATIONS[language] && TRANSLATIONS[language][key]) || TRANSLATIONS['ru'][key] || key;
  };

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lp_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasSasahokage = parsed.some(
            (u: User) => u.username.toLowerCase() === 'sasahokage'
          );
          if (hasSasahokage) {
            return parsed.map((u: User) => ({
              ...u,
              email: '',
              avatarUrl: sanitizeAvatarUrl(
                u.avatarUrl,
                u.username,
                u.role === 'teacher' ? 'shapes' : 'identicon'
              ),
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('lp_users', JSON.stringify(SEEDED_USERS));
    return SEEDED_USERS;
  });

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem('lp_classes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, SchoolClass>();
          parsed.forEach((c: SchoolClass) => map.set(c.id, c));
          SEEDED_CLASSES.forEach((sc) => {
            if (!map.has(sc.id)) map.set(sc.id, sc);
          });
          return Array.from(map.values());
        }
      } catch (e) {
        console.error(e);
      }
    }
    return SEEDED_CLASSES;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lp_auth') === 'true';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole | undefined>('teacher');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('lp_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.email === 'nuradil@studymaxxing.kz' ||
          parsed.username === 'Nuradil M.' ||
          parsed.username === 'teacher'
        ) {
          return SEEDED_USERS[0];
        }
        return {
          ...parsed,
          email: '',
          avatarUrl: sanitizeAvatarUrl(
            parsed.avatarUrl,
            parsed.username,
            parsed.role === 'teacher' ? 'shapes' : 'identicon'
          ),
        };
      } catch (e) {
        console.error(e);
      }
    }
    return SEEDED_USERS[0];
  });

  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>('asg_game');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>('sub_arman_1');
  const [selectedDefenseSessionId, setSelectedDefenseSessionId] = useState<string | null>('def_arman_1');

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('lp_assignments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Assignment>();
          // Load parsed assignments first
          parsed.forEach((a: Assignment) => {
            const seed = SEEDED_ASSIGNMENTS.find((s) => s.id === a.id);
            if (seed) {
              map.set(a.id, {
                ...a,
                grade: a.grade || seed.grade,
                className: a.className || seed.className,
                title: a.title || seed.title,
                referenceCode: a.referenceCode || seed.referenceCode,
                starterTemplate: a.id === 'asg_game' ? seed.starterTemplate : (a.starterTemplate || seed.starterTemplate)
              });
            } else {
              map.set(a.id, a);
            }
          });
          // Ensure all SEEDED_ASSIGNMENTS for grades 5-11 exist
          SEEDED_ASSIGNMENTS.forEach((s) => {
            if (!map.has(s.id)) {
              map.set(s.id, s);
            }
          });
          return Array.from(map.values());
        }
      } catch (e) {}
    }
    return SEEDED_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('lp_submissions');
    return saved ? JSON.parse(saved) : SEEDED_SUBMISSIONS;
  });

  const [defenseSessions, setDefenseSessions] = useState<Record<string, DefenseSession>>(() => {
    const saved = localStorage.getItem('lp_defense_sessions');
    return saved ? JSON.parse(saved) : SEEDED_DEFENSE_SESSIONS;
  });

  const classInsights = useMemo<ClassInsight>(() => {
    return computeClassInsights(users, defenseSessions);
  }, [users, defenseSessions]);

  const computeFilteredInsights = (classId?: string): ClassInsight => {
    return computeClassInsights(users, defenseSessions, classId);
  };

  useEffect(() => {
    localStorage.setItem('lp_users', JSON.stringify(users));
  }, [users]);

  // ─── Sync users from Supabase on mount ───────────────────────────────────
  // Merges cloud users into local state so any device sees all registered accounts
  useEffect(() => {
    sbFetchUsers().then((remoteUsers) => {
      if (remoteUsers.length === 0) return;
      setUsers((prev) => {
        const map = new Map<string, User>();
        // Seed first, then local (localStorage overrides seed), then remote (Supabase is authoritative)
        SEEDED_USERS.forEach((u) => map.set(u.id, u));
        prev.forEach((u) => map.set(u.id, u));
        remoteUsers.forEach((u) => map.set(u.id, { ...u,
          // sanitize avatar from remote
          avatarUrl: sanitizeAvatarUrl(u.avatarUrl, u.username, u.role === 'teacher' ? 'shapes' : 'identicon')
        }));
        const merged = Array.from(map.values());
        localStorage.setItem('lp_users', JSON.stringify(merged));
        return merged;
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem('lp_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lp_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('lp_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('lp_defense_sessions', JSON.stringify(defenseSessions));
  }, [defenseSessions]);

  useEffect(() => {
    localStorage.setItem('lp_classes', JSON.stringify(classes));
  }, [classes]);

  const openAuthModal = (tab: 'login' | 'register' = 'login', defaultRole?: UserRole) => {
    setAuthModalTab(tab);
    if (defaultRole) setAuthModalRole(defaultRole);
    setIsAuthModalOpen(true);
    // Refresh cloud users so accounts registered on other machines are available
    sbFetchUsers().then((remoteUsers) => {
      if (!remoteUsers || remoteUsers.length === 0) return;
      setUsers((prev) => {
        const map = new Map<string, User>();
        SEEDED_USERS.forEach((u) => map.set(u.id, u));
        prev.forEach((u) => map.set(u.id, u));
        remoteUsers.forEach((u) => map.set(u.id, {
          ...u,
          avatarUrl: sanitizeAvatarUrl(u.avatarUrl, u.username, u.role === 'teacher' ? 'shapes' : 'identicon')
        }));
        const merged = Array.from(map.values());
        localStorage.setItem('lp_users', JSON.stringify(merged));
        return merged;
      });
    });
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    // Strip leading @, lowercase and trim for comparison
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    const cleanPass = password.trim();

    const found = users.find((u) => {
      const uUsername = u.username.toLowerCase().replace(/^@/, '');
      const match =
        uUsername === cleanUser ||
        u.username.toLowerCase() === cleanUser ||
        u.name.toLowerCase() === cleanUser ||
        u.email.toLowerCase() === cleanUser;
      return match && u.password === cleanPass;
    });

    if (!found) {
      return { success: false, error: t('auth_err_invalid') };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    localStorage.setItem('lp_current_user', JSON.stringify(found));
    localStorage.setItem('lp_auth', 'true');

    if (found.role === 'teacher') {
      setCurrentView('teacher_dashboard');
    } else {
      setCurrentView('student_dashboard');
    }

    return { success: true };
  };

  const register = (data: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    grade?: number;
  }): { success: boolean; error?: string } => {
    const cleanUser = data.username.trim().replace(/^@/, '');
    const cleanPass = data.password.trim();
    const cleanName = data.name.trim() || cleanUser;

    if (!cleanUser || !cleanPass) {
      return { success: false, error: t('auth_err_fill_all') };
    }

    // Only English characters, numbers, and _, ., - (no spaces, no cyrillic, 3-30 chars)
    const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
    if (!USERNAME_REGEX.test(cleanUser)) {
      return {
        success: false,
        error:
          (t as (k: string) => string)('auth_username_invalid') ||
          'Никнейм должен содержать от 3 символов: только английские буквы, цифры, _, . и - без пробелов'
      };
    }

    const exists = users.some(
      (u) => u.username.toLowerCase().replace(/^@/, '') === cleanUser.toLowerCase()
    );

    if (exists) {
      return { success: false, error: t('auth_err_exists') };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: cleanUser,
      password: cleanPass,
      name: cleanName,
      role: data.role,
      grade: data.role === 'student' ? (data.grade || 8) : undefined,
      classId: undefined,
      className: undefined,
      school: data.role === 'teacher' ? 'НИШ ФМН г. Астана' : undefined,
      schoolWebsite: data.role === 'teacher' ? 'https://ast.nis.edu.kz' : undefined,
      email: '',
      avatarUrl: getNeutralAvatarUrl(
        cleanUser,
        data.role === 'teacher' ? 'shapes' : 'identicon'
      ),
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem('lp_users', JSON.stringify(updated));

    // Persist to Supabase cloud database
    sbUpsertUser(newUser);

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    localStorage.setItem('lp_current_user', JSON.stringify(newUser));
    localStorage.setItem('lp_auth', 'true');

    if (newUser.role === 'teacher') {
      setCurrentView('teacher_dashboard');
    } else {
      setCurrentView('student_dashboard');
    }

    return { success: true };
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const updateUserPassword = (oldPassword: string, newPassword: string): { success: boolean; error?: string } => {
    if (!oldPassword || oldPassword.trim() !== currentUser.password) {
      return { success: false, error: 'Текущий пароль введен неверно' };
    }
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'Новый пароль должен содержать не менее 6 символов' };
    }
    const cleanPass = newPassword.trim();
    const updatedUser = { ...currentUser, password: cleanPass };
    setCurrentUser(updatedUser);
    localStorage.setItem('lp_current_user', JSON.stringify(updatedUser));

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, password: cleanPass } : u));
    setUsers(updatedUsers);
    localStorage.setItem('lp_users', JSON.stringify(updatedUsers));
    sbUpsertUser(updatedUser);
    return { success: true };
  };

  const updateUserAvatar = (avatarUrl: string) => {
    const safeAvatar = sanitizeAvatarUrl(
      avatarUrl || '',
      currentUser.username,
      currentUser.role === 'teacher' ? 'shapes' : 'identicon'
    );
    const updatedUser = { ...currentUser, avatarUrl: safeAvatar };
    setCurrentUser(updatedUser);
    localStorage.setItem('lp_current_user', JSON.stringify(updatedUser));

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, avatarUrl: safeAvatar } : u));
    setUsers(updatedUsers);
    localStorage.setItem('lp_users', JSON.stringify(updatedUsers));
    sbUpsertUser(updatedUser);
  };

  const updateUserSchool = (school: string, schoolWebsite?: string) => {
    if (currentUser.role === 'student') return; // Students cannot change school
    const updatedUser = { ...currentUser, school, schoolWebsite };
    setCurrentUser(updatedUser);
    localStorage.setItem('lp_current_user', JSON.stringify(updatedUser));

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, school, schoolWebsite } : u));
    setUsers(updatedUsers);
    localStorage.setItem('lp_users', JSON.stringify(updatedUsers));
    sbUpsertUser(updatedUser);
  };

  const updateUserGrade = (grade: number) => {
    if (currentUser.role === 'student') return; // Students cannot manually change grade
    const updatedUser = { ...currentUser, grade };
    setCurrentUser(updatedUser);
    localStorage.setItem('lp_current_user', JSON.stringify(updatedUser));

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, grade } : u));
    setUsers(updatedUsers);
    localStorage.setItem('lp_users', JSON.stringify(updatedUsers));
    sbUpsertUser(updatedUser);
  };

  const transliterate = (str: string): string => {
    const ruToEn: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
      з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
      п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
      ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
      ә: 'a', ғ: 'g', қ: 'q', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i'
    };
    return str
      .toLowerCase()
      .split('')
      .map((char) => ruToEn[char] ?? char)
      .join('')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const createClass = (
    classData: { grade: number; letter: string; name?: string; subject?: string; academicYear?: string },
    students?: { username?: string; name?: string; password?: string }[]
  ): SchoolClass => {
    const classGrade = classData.grade || 8;
    const classLetter = (classData.letter || 'А').toUpperCase().trim();
    const className = classData.name || `${classGrade} «${classLetter}» класс`;
    const classId = `cls_${Date.now()}`;

    const createdStudentIds: string[] = [];
    const newUsersList: User[] = [];
    const existingUsersToUpdate: User[] = [];

    if (students && students.length > 0) {
      students.forEach((s, idx) => {
        const raw = (s.username || s.name || '').trim().replace(/^@/, '');
        const cleanUser = raw.replace(/[^a-zA-Z0-9_.-]/g, '');
        if (!cleanUser) return;

        // Check if user already exists
        const existing = users.find(
          (u) => u.username.toLowerCase().replace(/^@/, '') === cleanUser.toLowerCase()
        ) || newUsersList.find(
          (u) => u.username.toLowerCase().replace(/^@/, '') === cleanUser.toLowerCase()
        );

        if (existing) {
          createdStudentIds.push(existing.id);
          existingUsersToUpdate.push({
            ...existing,
            classId,
            className,
            grade: classGrade,
            school: currentUser.school || 'НИШ ФМН г. Астана',
            schoolWebsite: currentUser.schoolWebsite || 'https://ast.nis.edu.kz'
          });
        } else {
          const studentId = `user_student_${Date.now()}_${idx + 1}`;
          const displayName = s.name && s.name !== cleanUser && !s.name.startsWith('@') ? s.name : `@${cleanUser}`;
          const newUser: User = {
            id: studentId,
            name: displayName,
            username: cleanUser,
            password: s.password || '12345678',
            role: 'student',
            grade: classGrade,
            classId,
            className,
            email: '',
            avatarUrl: getNeutralAvatarUrl(cleanUser, 'identicon'),
            school: currentUser.school || 'НИШ ФМН г. Астана',
            schoolWebsite: currentUser.schoolWebsite || 'https://ast.nis.edu.kz'
          };
          createdStudentIds.push(studentId);
          newUsersList.push(newUser);
        }
      });
    }

    let updatedUsers = [...users];
    if (existingUsersToUpdate.length > 0) {
      const updateMap = new Map<string, User>(existingUsersToUpdate.map((u) => [u.id, u]));
      updatedUsers = updatedUsers.map((u) => updateMap.get(u.id) || u);
    }
    if (newUsersList.length > 0) {
      updatedUsers = [...newUsersList, ...updatedUsers];
    }
    setUsers(updatedUsers);
    localStorage.setItem('lp_users', JSON.stringify(updatedUsers));

    // Sync to Supabase
    newUsersList.forEach(sbUpsertUser);
    existingUsersToUpdate.forEach(sbUpsertUser);

    const myCurrentUpdated = updatedUsers.find((u) => u.id === currentUser.id);
    if (myCurrentUpdated) {
      setCurrentUser(myCurrentUpdated);
      localStorage.setItem('lp_current_user', JSON.stringify(myCurrentUpdated));
    }

    const newClass: SchoolClass = {
      id: classId,
      grade: classGrade,
      letter: classLetter,
      name: className,
      subject: classData.subject || 'Информатика & Python',
      academicYear: classData.academicYear || '2026–2027',
      studentIds: Array.from(new Set(createdStudentIds)),
      createdAt: new Date().toISOString()
    };

    setClasses((prev) => [newClass, ...prev]);
    return newClass;
  };

  const addStudentsToClass = (
    classId: string,
    students: { username?: string; name?: string; password?: string }[]
  ): User[] => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return [];

    const newUsersList: User[] = [];
    const addedIds: string[] = [];
    const existingUsersToUpdate: User[] = [];

    students.forEach((s, idx) => {
      const raw = (s.username || s.name || '').trim().replace(/^@/, '');
      const cleanUser = raw.replace(/[^a-zA-Z0-9_.-]/g, '');
      if (!cleanUser) return;

      const existing = users.find(
        (u) => u.username.toLowerCase().replace(/^@/, '') === cleanUser.toLowerCase()
      ) || newUsersList.find(
        (u) => u.username.toLowerCase().replace(/^@/, '') === cleanUser.toLowerCase()
      );

      if (existing) {
        if (!targetClass.studentIds.includes(existing.id) && !addedIds.includes(existing.id)) {
          addedIds.push(existing.id);
        }
        existingUsersToUpdate.push({
          ...existing,
          classId: targetClass.id,
          className: targetClass.name,
          grade: targetClass.grade,
          school: currentUser.school || 'НИШ ФМН г. Астана',
          schoolWebsite: currentUser.schoolWebsite || 'https://ast.nis.edu.kz'
        });
      } else {
        const studentId = `user_student_${Date.now()}_${idx + 1}`;
        const displayName = s.name && s.name !== cleanUser && !s.name.startsWith('@') ? s.name : `@${cleanUser}`;
        const newUser: User = {
          id: studentId,
          name: displayName,
          username: cleanUser,
          password: s.password || '12345678',
          role: 'student',
          grade: targetClass.grade,
          classId: targetClass.id,
          className: targetClass.name,
          email: '',
          avatarUrl: getNeutralAvatarUrl(cleanUser, 'identicon'),
          school: currentUser.school || 'НИШ ФМН г. Астана',
          schoolWebsite: currentUser.schoolWebsite || 'https://ast.nis.edu.kz'
        };
        addedIds.push(studentId);
        newUsersList.push(newUser);
      }
    });

    let updatedUsers = [...users];
    if (existingUsersToUpdate.length > 0) {
      const updateMap = new Map<string, User>(existingUsersToUpdate.map((u) => [u.id, u]));
      updatedUsers = updatedUsers.map((u) => updateMap.get(u.id) || u);
    }
    if (newUsersList.length > 0) {
      updatedUsers = [...newUsersList, ...updatedUsers];
    }
    setUsers(updatedUsers);
    localStorage.setItem('lp_users', JSON.stringify(updatedUsers));

    // Sync to Supabase
    newUsersList.forEach(sbUpsertUser);
    existingUsersToUpdate.forEach(sbUpsertUser);

    const myCurrentUpdated = updatedUsers.find((u) => u.id === currentUser.id);
    if (myCurrentUpdated) {
      setCurrentUser(myCurrentUpdated);
      localStorage.setItem('lp_current_user', JSON.stringify(myCurrentUpdated));
    }

    if (addedIds.length > 0) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? { ...c, studentIds: Array.from(new Set([...c.studentIds, ...addedIds])) }
            : c
        )
      );
    }

    return [...newUsersList, ...existingUsersToUpdate];
  };

  const removeStudentFromClass = (classId: string, studentId: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId
          ? { ...c, studentIds: c.studentIds.filter((id) => id !== studentId) }
          : c
      )
    );
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsProfileModalOpen(false);
    localStorage.removeItem('lp_auth');
    setCurrentView('landing');
  };

  const switchRole = (role: UserRole) => {
    if (isAuthenticated && currentUser.role === 'student' && role === 'teacher') {
      console.warn('Unauthorized role switch attempt blocked: students cannot switch to teacher without authentication.');
      return;
    }
    const targetUser = users.find((u) => u.role === role) || SEEDED_USERS.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    localStorage.setItem('lp_current_user', JSON.stringify(targetUser));
    localStorage.setItem('lp_auth', 'true');
    if (role === 'teacher') {
      setCurrentView('teacher_dashboard');
    } else {
      setCurrentView('student_dashboard');
    }
  };

  const selectAssignment = (id: string | null) => {
    setSelectedAssignmentId(id);
  };

  const createAssignment = (data: Partial<Assignment>): Assignment => {
    const asgGrade = data.grade || 8;
    const newAssignment: Assignment = {
      id: `asg_${Date.now()}`,
      classId: data.classId || `cls_cs_${asgGrade}`,
      className: data.className || `Информатика ${asgGrade} «А» класс`,
      grade: asgGrade,
      title: data.title || 'Новое задание по Python',
      description: data.description || '',
      submissionType: data.submissionType || 'code',
      questionCount: data.questionCount || 3,
      answerMode: data.answerMode || 'voice_or_text',
      timerSeconds: data.timerSeconds || 15,
      allowRetakes: data.allowRetakes || false,
      autoSubmit: data.autoSubmit ?? true,
      scoreVisibility: data.scoreVisibility || 'after_review',
      referenceCode: data.referenceCode || '',
      starterTemplate: data.starterTemplate || '',
      createdAt: new Date().toISOString()
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    setSelectedAssignmentId(newAssignment.id);
    return newAssignment;
  };

  const createSubmission = async (data: {
    studentName: string;
    assignmentId: string;
    fileName: string;
    codeSnippet?: string;
    githubUrl?: string;
    analysis?: AIAnalysis;
    questions?: DefenseQuestion[];
    results?: EvaluatedQuestionResult[];
    verdict?: DefenseSessionVerdict;
  }): Promise<Submission> => {
    const asg = assignments.find((a) => a.id === data.assignmentId);
    const subId = `sub_${Date.now()}`;
    let sessionId: string | undefined = undefined;

    if (data.verdict) {
      sessionId = `def_${Date.now()}`;
      const answers: Record<string, DefenseAnswer> = {};
      if (data.results && data.results.length > 0) {
        data.results.forEach((r, idx) => {
          const qId = r.question.id || `q_${idx}`;
          answers[qId] = {
            id: `ans_${Date.now()}_${idx}`,
            questionId: qId,
            mode: 'voice',
            transcript: r.transcript,
            durationSeconds: r.durationSeconds,
            submittedAt: new Date().toISOString(),
            evaluation: r.evaluation,
            speechMetrics: {
              timeToFirstWord: 1.2,
              wordsPerMinute: Math.round((r.transcript.split(' ').length / Math.max(1, r.durationSeconds)) * 60),
              pauseCount: 1
            }
          };
        });
      }

      const overallScore = data.verdict.overallScore;
      const feedbackText = data.verdict.feedbackSummary || data.verdict.verdictDescription || 'Устная защита успешно завершена.';

      const newSession: DefenseSession = {
        id: sessionId,
        submissionId: subId,
        studentId: currentUser.id,
        assignmentId: data.assignmentId,
        startedAt: new Date(Date.now() - 60000).toISOString(),
        completedAt: new Date().toISOString(),
        status: data.verdict.isAutoApproved ? 'verified' : data.verdict.needsTeacherReview ? 'needs_followup' : 'verified',
        questions: (data.questions || []).map((q) => ({ ...q, defenseSessionId: sessionId! })),
        answers,
        overallScore,
        overallRubric: {
          conceptKnowledge: data.verdict.conceptScore,
          reasoning: data.verdict.reasoningScore,
          application: data.verdict.applicationScore,
          technicalDepth: Math.round(overallScore * 0.9),
          independentExplanation: Math.round(overallScore * 0.95)
        },
        teacherReview: {
          id: `rev_${Date.now()}`,
          defenseSessionId: sessionId,
          teacherId: 'ai_evaluator',
          overrideScore: overallScore,
          studentFeedback: feedbackText,
          privateNote: data.verdict.title,
          reviewedAt: new Date().toISOString(),
          status: data.verdict.isAutoApproved ? 'verified' : 'needs_followup'
        }
      };

      setDefenseSessions((prev) => {
        const next = { ...prev, [sessionId!]: newSession };
        localStorage.setItem('lp_defense_sessions', JSON.stringify(next));
        return next;
      });
    }

    const newSub: Submission = {
      id: subId,
      assignmentId: data.assignmentId,
      studentId: currentUser.id,
      studentName: data.studentName || currentUser.name,
      studentEmail: currentUser.email,
      submittedAt: new Date().toISOString(),
      fileName: data.fileName,
      githubUrl: data.githubUrl,
      codeSnippet: data.codeSnippet,
      referenceCode: asg?.referenceCode,
      status: data.verdict ? (data.verdict.isAutoApproved ? 'verified' : data.verdict.needsTeacherReview ? 'needs_followup' : 'verified') : 'pending',
      analysis: data.analysis,
      defenseSessionId: sessionId
    };

    setSubmissions((prev) => {
      const next = [newSub, ...prev];
      localStorage.setItem('lp_submissions', JSON.stringify(next));
      return next;
    });

    return newSub;
  };

  const runAIAnalysis = async (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    const asg = assignments.find((a) => a.id === sub.assignmentId);
    const { analysis, questions } = await AIService.analyzeSubmission({
      ...sub,
      referenceCode: asg?.referenceCode || sub.referenceCode
    });

    const sessionId = `def_${Date.now()}`;
    const newSession: DefenseSession = {
      id: sessionId,
      submissionId,
      studentId: sub.studentId,
      assignmentId: sub.assignmentId,
      status: 'defense_ready',
      questions: questions.map((q) => ({ ...q, defenseSessionId: sessionId })),
      answers: {}
    };

    setDefenseSessions((prev) => ({
      ...prev,
      [sessionId]: newSession
    }));

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'defense_ready',
              analysis,
              defenseSessionId: sessionId
            }
          : s
      )
    );
  };

  const submitDefenseAnswer = async (
    sessionId: string,
    questionId: string,
    answerData: Partial<DefenseAnswer>
  ) => {
    const session = defenseSessions[sessionId];
    if (!session) return;

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) return;

    const transcript = answerData.transcript || answerData.textAnswer || '';
    const duration = answerData.durationSeconds || 15;

    const evaluation = await AIService.evaluateAnswer(question, transcript, duration);

    const fullAnswer: DefenseAnswer = {
      id: `ans_${Date.now()}`,
      questionId,
      mode: answerData.mode || 'voice',
      textAnswer: answerData.textAnswer,
      audioUrl: answerData.audioUrl,
      transcript,
      durationSeconds: duration,
      submittedAt: new Date().toISOString(),
      evaluation,
      speechMetrics: {
        timeToFirstWord: 1.5,
        wordsPerMinute: Math.round((transcript.split(' ').length / Math.max(1, duration)) * 60),
        pauseCount: 1
      }
    };

    const updatedAnswers = {
      ...session.answers,
      [questionId]: fullAnswer
    };

    const evalList = Object.values(updatedAnswers)
      .map((a) => a.evaluation)
      .filter(Boolean);

    let overallScore = session.overallScore;
    let overallRubric = session.overallRubric;

    if (evalList.length > 0) {
      const avg = evalList.reduce((acc, e) => acc + (e?.overallScore || 0), 0) / evalList.length;
      overallScore = Math.round(avg);

      overallRubric = {
        conceptKnowledge: Math.round((evalList.reduce((acc, e) => acc + (e?.conceptScore || 0), 0) / evalList.length / 5) * 100),
        reasoning: Math.round((evalList.reduce((acc, e) => acc + (e?.reasoningScore || 0), 0) / evalList.length / 5) * 100),
        application: Math.round((evalList.reduce((acc, e) => acc + (e?.applicationScore || 0), 0) / evalList.length / 5) * 100),
        technicalDepth: Math.round((evalList.reduce((acc, e) => acc + (e?.technicalScore || 0), 0) / evalList.length / 5) * 100),
        independentExplanation: Math.round((evalList.reduce((acc, e) => acc + (e?.independenceScore || 0), 0) / evalList.length / 5) * 100)
      };
    }

    setDefenseSessions((prev) => ({
      ...prev,
      [sessionId]: {
        ...session,
        answers: updatedAnswers,
        overallScore,
        overallRubric
      }
    }));
  };

  const completeDefenseSession = async (sessionId: string) => {
    const session = defenseSessions[sessionId];
    if (!session) return;

    setDefenseSessions((prev) => ({
      ...prev,
      [sessionId]: {
        ...session,
        status: 'teacher_review',
        completedAt: new Date().toISOString()
      }
    }));

    setSubmissions((prev) =>
      prev.map((s) =>
        s.defenseSessionId === sessionId
          ? { ...s, status: 'teacher_review' }
          : s
      )
    );
  };

  const saveTeacherReview = (sessionId: string, review: Partial<TeacherReview>) => {
    const session = defenseSessions[sessionId];
    if (!session) return;

    const teacherReview: TeacherReview = {
      id: `rev_${Date.now()}`,
      defenseSessionId: sessionId,
      teacherId: currentUser.id,
      overrideScore: review.overrideScore ?? session.overallScore,
      studentFeedback: review.studentFeedback || '',
      privateNote: review.privateNote || '',
      reviewedAt: new Date().toISOString(),
      status: review.status || 'verified'
    };

    setDefenseSessions((prev) => ({
      ...prev,
      [sessionId]: {
        ...session,
        status: teacherReview.status,
        overallScore: teacherReview.overrideScore ?? session.overallScore,
        teacherReview
      }
    }));

    setSubmissions((prev) =>
      prev.map((s) =>
        s.defenseSessionId === sessionId
          ? { ...s, status: teacherReview.status }
          : s
      )
    );
  };

  const resetDemoData = () => {
    localStorage.removeItem('lp_assignments');
    localStorage.removeItem('lp_submissions');
    localStorage.removeItem('lp_defense_sessions');
    localStorage.removeItem('lp_current_user');
    localStorage.removeItem('lp_users');
    localStorage.removeItem('lp_auth');
    localStorage.removeItem('lp_classes');
    setUsers(SEEDED_USERS);
    setClasses(SEEDED_CLASSES);
    setAssignments(SEEDED_ASSIGNMENTS);
    setSubmissions(SEEDED_SUBMISSIONS);
    setDefenseSessions(SEEDED_DEFENSE_SESSIONS);
    setCurrentUser(SEEDED_USERS[0]);
    setIsAuthenticated(false);
    setIsAuthModalOpen(false);
    setIsProfileModalOpen(false);
    setCurrentView('landing');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        currentView,
        isAuthenticated,
        isAuthModalOpen,
        authModalTab,
        authModalRole,
        users,
        classes,
        selectedSubmissionId,
        selectedDefenseSessionId,
        assignments,
        submissions,
        defenseSessions,
        classInsights,
        computeFilteredInsights,
        language,
        setLanguage,
        t,
        setCurrentView,
        switchRole,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        updateUserPassword,
        updateUserAvatar,
        updateUserSchool,
        updateUserGrade,
        createClass,
        addStudentsToClass,
        removeStudentFromClass,
        deleteClass,
        login,
        register,
        logout,
        selectedAssignmentId,
        selectAssignment,
        selectSubmission: setSelectedSubmissionId,
        selectDefenseSession: setSelectedDefenseSessionId,
        createAssignment,
        createSubmission,
        runAIAnalysis,
        submitDefenseAnswer,
        completeDefenseSession,
        saveTeacherReview,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
