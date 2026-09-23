export type UserRole = 'teacher' | 'student';

export interface School {
  id: string;
  name: string;
  city: string;
  website: string;
  isCustom?: boolean;
}

export interface SchoolClass {
  id: string;
  grade: number; // 5 - 11
  letter: string; // e.g. "А", "Б", "В"
  name: string; // e.g. "8 «А» класс"
  subject: string; // e.g. "Информатика & Python"
  academicYear: string; // e.g. "2026–2027"
  studentIds: string[]; // List of user IDs in this class
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
  school?: string;
  schoolWebsite?: string;
  grade?: number; // 5, 6, 7, 8, 9, 10, 11
  classId?: string;
  className?: string;
}

export type SubmissionStatus = 
  | 'pending'
  | 'analyzed'
  | 'defense_ready'
  | 'defense_completed'
  | 'ai_evaluated'
  | 'teacher_review'
  | 'verified'
  | 'needs_followup';

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  grade?: number; // 5, 6, 7, 8, 9, 10, 11
  title: string;
  description: string;
  submissionType: 'pdf' | 'docx' | 'zip' | 'github' | 'code' | 'text';
  questionCount: number;
  answerMode: 'voice_only' | 'text_only' | 'voice_or_text';
  timerSeconds: number; // e.g. 15, 30, 60, 90, 120
  allowRetakes: boolean;
  autoSubmit: boolean;
  scoreVisibility: 'immediately' | 'after_review' | 'never';
  referenceCode?: string;       // Правильный эталонный код учителя
  starterTemplate?: string;     // Заготовка / шаблон для ученика
  createdAt: string;
}

export interface CodeComparisonResult {
  correctnessScore: number;     // 0-100%
  similarityScore: number;      // 0-100%
  plagiarismRisk: 'low' | 'moderate' | 'exact_copy' | 'ai_anomaly';
  verdict: string;
  matchingElements: string[];
  missingElements: string[];
  aiAnomalies: string[];
  isCodeWorking?: boolean;
  codeHealth?: 'working' | 'working_minor_slip' | 'broken' | 'empty';
  brokenReason?: string;
}

export interface TechnicalDecision {
  decision: string;
  importance: 'low' | 'medium' | 'high';
  verificationNeeded: boolean;
  contextSnippet?: string;
}

export interface AIAnalysis {
  id: string;
  submissionId: string;
  projectSummary: string;
  coreConcepts: string[];
  technicalDecisions: TechnicalDecision[];
  potentialGaps: string[];
  codeComparison?: CodeComparisonResult;
  isCodeWorking?: boolean;
  codeHealth?: 'working' | 'working_minor_slip' | 'broken' | 'empty';
  generatedAt: string;
}

export type SkillDimension = 
  | 'Concept Knowledge'
  | 'Algorithmic Reasoning'
  | 'Trade-off Reasoning'
  | 'System Architecture'
  | 'Application Depth'
  | 'Independent Explanation'
  | 'Edge Cases & Scale'
  | string;

export interface DefenseQuestion {
  id: string;
  defenseSessionId: string;
  questionText: string;
  skill: SkillDimension;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  orderIndex: number;
  purpose: string; // "Why this question matters"
  mustMention?: string[];
  redFlags?: string[];
  isRequired: boolean;
}

export interface RubricEvaluation {
  id: string;
  conceptScore: number;     // 0-5
  reasoningScore: number;   // 0-5
  applicationScore: number; // 0-5
  technicalScore: number;   // 0-5
  independenceScore: number;// 0-5
  overallScore: number;     // 0-100%
  aiFeedback: string;
  keyPunchlineDetected: boolean;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface DefenseAnswer {
  id: string;
  questionId: string;
  mode: 'voice' | 'text';
  textAnswer?: string;
  audioUrl?: string;
  transcript: string;
  durationSeconds: number;
  submittedAt: string;
  evaluation?: RubricEvaluation;
  speechMetrics?: {
    timeToFirstWord: number; // seconds
    wordsPerMinute: number;
    pauseCount: number;
  };
}

export interface TeacherReview {
  id: string;
  defenseSessionId: string;
  teacherId: string;
  overrideScore?: number; // 0-100%
  studentFeedback: string;
  privateNote: string;
  reviewedAt: string;
  status: 'verified' | 'needs_followup';
}

export interface DefenseSession {
  id: string;
  submissionId: string;
  studentId: string;
  assignmentId: string;
  startedAt?: string;
  completedAt?: string;
  status: SubmissionStatus;
  questions: DefenseQuestion[];
  answers: Record<string, DefenseAnswer>; // questionId -> Answer
  overallScore?: number;
  overallRubric?: {
    conceptKnowledge: number;
    reasoning: number;
    application: number;
    technicalDepth: number;
    independentExplanation: number;
  };
  teacherReview?: TeacherReview;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  fileUrl?: string;
  fileName?: string;
  githubUrl?: string;
  codeSnippet?: string;
  status: SubmissionStatus;
  analysis?: AIAnalysis;
  defenseSessionId?: string;
  referenceCode?: string;
}

export interface ClassInsight {
  weakSkills: { skill: string; score: number }[];
  conceptHeatmap: {
    studentId: string;
    studentName: string;
    scores: Record<string, number>;
    overall: number;
  }[];
}
