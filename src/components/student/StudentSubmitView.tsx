import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Upload, 
  FileCode, 
  Github, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export const StudentSubmitView: React.FC = () => {
  const { assignments, createSubmission, runAIAnalysis, setCurrentView, selectDefenseSession } = useApp();

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '');
  const [githubUrl, setGithubUrl] = useState('https://github.com/student/rec-engine-defense');
  const [fileName, setFileName] = useState('recommendation_service.py');
  const [codeSnippet, setCodeSnippet] = useState(`import numpy as np

def cosine_similarity(u, v):
    # Vector orientation measure
    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v) + 1e-9)

class Recommender:
    def __init__(self, ratings):
        self.ratings = ratings
        
    def predict_top_k(self, user_id, k=5):
        # Brute force search over user vectors O(N)
        pass`);

  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'ready'>('idle');
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('uploading');

    // 1. Create submission
    const sub = await createSubmission({
      studentName: 'Arman T.',
      assignmentId: selectedAssignmentId,
      fileName,
      githubUrl,
      codeSnippet
    });

    setStatus('analyzing');

    // 2. Trigger AI Analysis pipeline
    await runAIAnalysis(sub.id);

    setStatus('ready');
  };

  const handleStartDefense = () => {
    selectDefenseSession(createdSessionId || 'def_arman_1');
    setCurrentView('student_defense');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="border-b border-white/[0.08] pb-4 mb-6">
        <span className="text-xs font-mono uppercase text-emerald-400 font-medium">Assignment Upload</span>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight mt-0.5">Submit Your Work</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Upload your code, essay or project link. StudyMaxxing AI will parse your work and prepare 3 oral defense questions.
        </p>
      </div>

      {status === 'ready' ? (
        /* State: Analysis complete & Defense Ready */
        <div className="bg-surface border border-emerald-500/30 rounded-2xl p-8 text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-100">Project Analyzed & Defense Ready</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              AI extracted 5 core concepts and 3 technical trade-offs. You will have 30 seconds per question to explain your decisions.
            </p>
          </div>

          <div className="bg-zinc-950/70 border border-white/5 rounded-xl p-4 max-w-md mx-auto text-left text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>AST Code parsing complete</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Key decisions identified: Cosine vs Euclidean</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>3 Targeted oral questions prepared</span>
            </div>
          </div>

          <button
            onClick={handleStartDefense}
            className="px-6 py-3 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/15"
          >
            <span>Enter Oral Defense Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : status === 'analyzing' ? (
        /* State: AI Analysis in progress */
        <div className="bg-surface border border-white/10 rounded-2xl p-10 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <h2 className="text-base font-semibold text-zinc-100">Analyzing Your Submission...</h2>
          <div className="max-w-sm mx-auto text-xs text-zinc-400 font-mono space-y-1.5 text-left">
            <p className="text-emerald-400">✓ Parsing file structure & syntax...</p>
            <p className="text-emerald-400">✓ Identifying core algorithmic choices...</p>
            <p className="text-zinc-500 animate-pulse">Generating diagnostic defense questions...</p>
          </div>
        </div>
      ) : (
        /* State: Input Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface border border-white/[0.08] rounded-xl p-5 space-y-4">
            {/* Assignment Selection */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Target Assignment
              </label>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
              >
                {assignments.map((asg) => (
                  <option key={asg.id} value={asg.id}>
                    {asg.className} — {asg.title}
                  </option>
                ))}
              </select>
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repository / Link</span>
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            {/* Direct Code Snippet Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Key Implementation File ({fileName})</span>
                </label>
                <span className="text-[10px] text-zinc-500">Python / JavaScript / C++</span>
              </div>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                rows={8}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500/50 resize-y"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('student_dashboard')}
              className="px-4 py-2 rounded-lg border border-white/10 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit & Analyze with StudyMaxxing AI</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
