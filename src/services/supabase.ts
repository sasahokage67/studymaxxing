import { createClient } from '@supabase/supabase-js';
import type { User, Submission, DefenseSession, SchoolClass } from '../types';

const SUPABASE_URL = 'https://sjefmoliejulcxsaeyfx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qnARnaklKKaeJcaQmtUtsA_vt_RuLw0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── lp_users ─────────────────────────────────────────────────────────────
interface SupabaseUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  password: string;
  avatar_url: string | null;
  school: string | null;
  school_website: string | null;
  grade: number | null;
  class_id: string | null;
  class_name: string | null;
}

export const toUserRow = (u: User): SupabaseUser => ({
  id: u.id,
  username: u.username,
  name: u.name,
  email: u.email || '',
  role: u.role,
  password: u.password || '',
  avatar_url: u.avatarUrl || null,
  school: u.school || null,
  school_website: u.schoolWebsite || null,
  grade: u.grade || null,
  class_id: u.classId || null,
  class_name: u.className || null,
});

export const fromUserRow = (r: SupabaseUser): User => ({
  id: r.id,
  username: r.username,
  name: r.name,
  email: r.email || '',
  role: r.role as User['role'],
  password: r.password,
  avatarUrl: r.avatar_url || undefined,
  school: r.school || undefined,
  schoolWebsite: r.school_website || undefined,
  grade: r.grade || undefined,
  classId: r.class_id || undefined,
  className: r.class_name || undefined,
});

export const sbUpsertUser = async (u: User): Promise<boolean> => {
  try {
    const { error } = await supabase.from('lp_users').upsert(toUserRow(u), { onConflict: 'id' });
    if (error) {
      console.warn('[supabase] upsert user failed:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const sbFetchUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase.from('lp_users').select('*');
    if (error || !data) return [];
    return (data as SupabaseUser[]).map(fromUserRow);
  } catch {
    return [];
  }
};

// ─── lp_submissions ───────────────────────────────────────────────────────
export const sbUpsertSubmission = async (sub: Submission): Promise<boolean> => {
  try {
    const row = {
      id: sub.id,
      assignment_id: sub.assignmentId,
      student_id: sub.studentId,
      student_name: sub.studentName,
      student_email: sub.studentEmail || '',
      submitted_at: sub.submittedAt,
      file_name: sub.fileName || '',
      code_snippet: sub.codeSnippet || '',
      status: sub.status,
      defense_session_id: sub.defenseSessionId || null,
      analysis: sub.analysis || null,
    };
    const { error } = await supabase.from('lp_submissions').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[supabase] upsert submission failed:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const sbFetchSubmissions = async (): Promise<Submission[]> => {
  try {
    const { data, error } = await supabase.from('lp_submissions').select('*');
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      assignmentId: r.assignment_id,
      studentId: r.student_id,
      studentName: r.student_name,
      studentEmail: r.student_email || '',
      submittedAt: r.submitted_at,
      fileName: r.file_name,
      codeSnippet: r.code_snippet,
      status: r.status,
      defenseSessionId: r.defense_session_id || undefined,
      analysis: r.analysis || undefined
    }));
  } catch {
    return [];
  }
};

// ─── lp_defense_sessions ──────────────────────────────────────────────────
export const sbUpsertDefenseSession = async (ds: DefenseSession): Promise<boolean> => {
  try {
    const row = {
      id: ds.id,
      submission_id: ds.submissionId,
      student_id: ds.studentId,
      assignment_id: ds.assignmentId,
      overall_score: ds.overallScore ?? null,
      status: ds.status,
      questions: ds.questions || [],
      answers: ds.answers || {},
      overall_rubric: ds.overallRubric || null,
      teacher_review: ds.teacherReview || null,
      completed_at: ds.completedAt || new Date().toISOString()
    };
    const { error } = await supabase.from('lp_defense_sessions').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[supabase] upsert defense session failed:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const sbFetchDefenseSessions = async (): Promise<Record<string, DefenseSession>> => {
  try {
    const { data, error } = await supabase.from('lp_defense_sessions').select('*');
    if (error || !data) return {};
    const map: Record<string, DefenseSession> = {};
    data.forEach((r: any) => {
      map[r.id] = {
        id: r.id,
        submissionId: r.submission_id,
        studentId: r.student_id,
        assignmentId: r.assignment_id,
        overallScore: r.overall_score ?? undefined,
        status: r.status,
        questions: r.questions || [],
        answers: r.answers || {},
        overallRubric: r.overall_rubric || undefined,
        teacherReview: r.teacher_review || undefined,
        completedAt: r.completed_at
      };
    });
    return map;
  } catch {
    return {};
  }
};

// ─── lp_classes ───────────────────────────────────────────────────────────
export const sbUpsertClass = async (cls: SchoolClass): Promise<boolean> => {
  try {
    const row = {
      id: cls.id,
      grade: cls.grade,
      letter: cls.letter,
      name: cls.name,
      subject: cls.subject,
      academic_year: cls.academicYear,
      student_ids: cls.studentIds || [],
      created_at: cls.createdAt
    };
    const { error } = await supabase.from('lp_classes').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[supabase] upsert class failed:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const sbFetchClasses = async (): Promise<SchoolClass[]> => {
  try {
    const { data, error } = await supabase.from('lp_classes').select('*');
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      grade: r.grade,
      letter: r.letter,
      name: r.name,
      subject: r.subject,
      academicYear: r.academic_year,
      studentIds: r.student_ids || [],
      createdAt: r.created_at
    }));
  } catch {
    return [];
  }
};
