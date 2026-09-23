import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Assignment,
  Submission,
  DefenseSession,
  ClassInsight,
  DefenseAnswer,
  TeacherReview
} from '../types';
import {
  SEEDED_USERS,
  SEEDED_ASSIGNMENTS,
  SEEDED_SUBMISSIONS,
  SEEDED_DEFENSE_SESSIONS,
  SEEDED_CLASS_INSIGHTS
} from '../services/mockData';
import { AIService } from '../services/aiService';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  currentView: string;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authModalRole?: UserRole;
  users: User[];
  selectedSubmissionId: string | null;
  selectedDefenseSessionId: string | null;
  assignments: Assignment[];
  submissions: Submission[];
  defenseSessions: Record<string, DefenseSession>;
  classInsights: ClassInsight;
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
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (data: { username: string; password: string; name: string; role: UserRole }) => { success: boolean; error?: string };
  logout: () => void;
  selectSubmission: (id: string | null) => void;
  selectDefenseSession: (id: string | null) => void;
  createAssignment: (data: Partial<Assignment>) => Assignment;
  createSubmission: (data: { studentName: string; assignmentId: string; fileName: string; codeSnippet?: string; githubUrl?: string }) => Promise<Submission>;
  runAIAnalysis: (submissionId: string) => Promise<void>;
  submitDefenseAnswer: (sessionId: string, questionId: string, answer: Partial<DefenseAnswer>) => Promise<void>;
  completeDefenseSession: (sessionId: string) => Promise<void>;
  saveTeacherReview: (sessionId: string, review: Partial<TeacherReview>) => void;
  resetDemoData: () => void;
}

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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return SEEDED_USERS;
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
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEEDED_USERS[0];
  });

  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>('sub_arman_1');
  const [selectedDefenseSessionId, setSelectedDefenseSessionId] = useState<string | null>('def_arman_1');

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('lp_assignments');
    return saved ? JSON.parse(saved) : SEEDED_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('lp_submissions');
    return saved ? JSON.parse(saved) : SEEDED_SUBMISSIONS;
  });

  const [defenseSessions, setDefenseSessions] = useState<Record<string, DefenseSession>>(() => {
    const saved = localStorage.getItem('lp_defense_sessions');
    return saved ? JSON.parse(saved) : SEEDED_DEFENSE_SESSIONS;
  });

  const [classInsights] = useState<ClassInsight>(SEEDED_CLASS_INSIGHTS);

  useEffect(() => {
    localStorage.setItem('lp_users', JSON.stringify(users));
  }, [users]);

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

  const openAuthModal = (tab: 'login' | 'register' = 'login', defaultRole?: UserRole) => {
    setAuthModalTab(tab);
    if (defaultRole) setAuthModalRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const found = users.find((u) => {
      const match = u.username.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser;
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
  }): { success: boolean; error?: string } => {
    const cleanUser = data.username.trim();
    const cleanPass = data.password.trim();
    const cleanName = data.name.trim() || cleanUser;

    if (!cleanUser || !cleanPass) {
      return { success: false, error: t('auth_err_fill_all') };
    }

    const exists = users.some(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase()
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
      email: `${cleanUser.toLowerCase().replace(/[^a-z0-9]/g, '_')}@studymaxxing.kz`,
      avatarUrl:
        data.role === 'teacher'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem('lp_users', JSON.stringify(updated));

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
    return { success: true };
  };

  const updateUserAvatar = (avatarUrl: string) => {
    const updatedUser = { ...currentUser, avatarUrl };
    setCurrentUser(updatedUser);
    localStorage.setItem('lp_current_user', JSON.stringify(updatedUser));

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, avatarUrl } : u));
    setUsers(updatedUsers);
    localStorage.setItem('lp_users', JSON.stringify(updatedUsers));
  };

  const updateUserSchool = (school: string, schoolWebsite?: string) => {
    const updatedUser = { ...currentUser, school, schoolWebsite };
    setCurrentUser(updatedUser);
    localStorage.setItem('lp_current_user', JSON.stringify(updatedUser));

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, school, schoolWebsite } : u));
    setUsers(updatedUsers);
    localStorage.setItem('lp_users', JSON.stringify(updatedUsers));
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

  const createAssignment = (data: Partial<Assignment>): Assignment => {
    const newAssignment: Assignment = {
      id: `asg_${Date.now()}`,
      classId: 'cls_it_club',
      className: '10 «А» класс · IT-Кружок программирования',
      title: data.title || 'Новое задание по Python',
      description: data.description || '',
      submissionType: data.submissionType || 'code',
      questionCount: data.questionCount || 3,
      answerMode: data.answerMode || 'voice_or_text',
      timerSeconds: data.timerSeconds || 20,
      allowRetakes: data.allowRetakes || false,
      autoSubmit: data.autoSubmit ?? true,
      scoreVisibility: data.scoreVisibility || 'after_review',
      createdAt: new Date().toISOString()
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    return newAssignment;
  };

  const createSubmission = async (data: {
    studentName: string;
    assignmentId: string;
    fileName: string;
    codeSnippet?: string;
    githubUrl?: string;
  }): Promise<Submission> => {
    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      assignmentId: data.assignmentId,
      studentId: currentUser.id,
      studentName: data.studentName || currentUser.name,
      studentEmail: currentUser.email,
      submittedAt: new Date().toISOString(),
      fileName: data.fileName,
      githubUrl: data.githubUrl,
      codeSnippet: data.codeSnippet,
      status: 'pending'
    };

    setSubmissions((prev) => [newSub, ...prev]);
    return newSub;
  };

  const runAIAnalysis = async (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    const { analysis, questions } = await AIService.analyzeSubmission(sub);

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
    setUsers(SEEDED_USERS);
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
        selectedSubmissionId,
        selectedDefenseSessionId,
        assignments,
        submissions,
        defenseSessions,
        classInsights,
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
        login,
        register,
        logout,
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
