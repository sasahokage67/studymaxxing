import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCode,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Check,
  Clock,
  Code2,
  Upload,
  Cpu,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Volume2,
  Bot,
  Mic,
  MicOff,
  Loader2
} from 'lucide-react';
import { AIService, DefenseSessionVerdict, EvaluatedQuestionResult } from '../../services/aiService';
import { SpeechService } from '../../services/speechService';
import { DefenseQuestion, AIAnalysis, Assignment } from '../../types';

interface InteractiveDefensePipelineProps {
  initialAssignmentId?: string;
  onClose?: () => void;
}

type PipelineStage = 'code_upload' | 'ai_analyzing' | 'oral_defense' | 'verdict_report';

const GRADE_WORKING_SOLUTIONS: Record<number, { fileName: string; code: string }> = {
  5: {
    fileName: 'greeting.py',
    code: `name = input("Как тебя зовут? ")\nprint("Привет,", name)\n`,
  },
  6: {
    fileName: 'sum_numbers.py',
    code: `a = int(input("Введите первое число: "))\nb = int(input("Введите второе число: "))\nprint("Сумма чисел:", a + b)\n`,
  },
  7: {
    fileName: 'sign_check.py',
    code: `x = int(input("Введите число: "))\n\nif x > 0:\n    print("Положительное")\nelse:\n    print("Отрицательное или ноль")\n`,
  },
  8: {
    fileName: 'guess_game.py',
    code: `secret = 42\n\nprint("Компьютер загадал число от 1 до 100!")\n\nwhile True:\n    guess = int(input("Введите число: "))\n    if guess == secret:\n        print("Поздравляю, вы угадали!")\n        break\n    elif guess < secret:\n        print("Загаданное число больше!")\n    else:\n        print("Загаданное число меньше!")\n`,
  },
  9: {
    fileName: 'even_counter.py',
    code: `numbers = [12, 5, 8, 19, 24, 7, 30]\ncount = 0\n\nfor num in numbers:\n    if num % 2 == 0:\n        count = count + 1\n\nprint("Количество четных чисел:", count)\n`,
  },
  10: {
    fileName: 'rectangle_area.py',
    code: `def rectangle_area(w, h):\n    return w * h\n\nw = float(input("Ширина: "))\nh = float(input("Высота: "))\nprint("Площадь:", rectangle_area(w, h))\n`,
  },
  11: {
    fileName: 'phone_book.py',
    code: `contacts = {"Алихан": "+77011112233", "Динара": "+77025556677"}\nname = input("Введите имя: ")\n\nif name in contacts:\n    print("Номер телефона:", contacts[name])\nelse:\n    print("Контакт не найден")\n`,
  },
};

export const getAssignmentMeta = (asg?: Assignment) => {
  if (!asg) {
    return {
      fileName: 'main.py',
      starterCode: '# Напишите код программы на Python\n',
      benchmarkCode: '# Решение задания\n'
    };
  }

  const gradeMeta = asg.grade ? GRADE_WORKING_SOLUTIONS[asg.grade] : undefined;
  let fileName = gradeMeta?.fileName || 'solution.py';
  if (asg.title.toLowerCase().includes('калькулятор')) fileName = 'calculator.py';

  // Reliable working code: prioritize referenceCode, then gradeMeta fallback, then starterTemplate
  const starterCode = asg.referenceCode || gradeMeta?.code || asg.starterTemplate || `# ${asg.grade || ''} класс: ${asg.title}\n`;
  const benchmarkCode = asg.referenceCode || gradeMeta?.code || starterCode;

  return {
    fileName,
    starterCode,
    benchmarkCode
  };
};

export const InteractiveDefensePipeline: React.FC<InteractiveDefensePipelineProps> = ({
  initialAssignmentId,
  onClose
}) => {
  const {
    currentUser,
    assignments,
    selectedAssignmentId: contextAssignmentId,
    selectAssignment,
    createSubmission,
    setCurrentView
  } = useApp();

  const userGrade = currentUser.grade || 8;

  // Filter assignments for student's grade/class
  const myClassAssignments = useMemo(() => {
    return assignments.filter(
      (a) => a.grade === userGrade || (currentUser.classId && a.classId === currentUser.classId)
    );
  }, [assignments, userGrade, currentUser.classId]);

  // Initial target assignment ID:
  // Prop -> Context -> First assignment of student's class -> First assignment in list
  const initialTargetId = useMemo(() => {
    if (initialAssignmentId) return initialAssignmentId;
    if (contextAssignmentId) return contextAssignmentId;
    if (myClassAssignments.length > 0) return myClassAssignments[0].id;
    return assignments[0]?.id || 'asg_grade_10';
  }, [initialAssignmentId, contextAssignmentId, myClassAssignments, assignments]);

  const [stage, setStage] = useState<PipelineStage>('code_upload');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(initialTargetId);

  const currentAssignment = useMemo(() => {
    return assignments.find((a) => a.id === selectedAssignmentId) || myClassAssignments[0] || assignments[0];
  }, [assignments, selectedAssignmentId, myClassAssignments]);

  const initialMeta = useMemo(() => getAssignmentMeta(currentAssignment), [currentAssignment]);

  const [fileName, setFileName] = useState(initialMeta.fileName);
  const [codeContent, setCodeContent] = useState(initialMeta.starterCode);
  const [showOtherGrades, setShowOtherGrades] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);

  const handleSelectAssignment = (asgId: string) => {
    setSelectedAssignmentId(asgId);
    selectAssignment(asgId);
    const target = assignments.find((a) => a.id === asgId);
    if (target) {
      const meta = getAssignmentMeta(target);
      setFileName(meta.fileName);
      setCodeContent(meta.starterCode);
    }
  };

  // Sync if context or prop changes externally
  useEffect(() => {
    const nextId = initialAssignmentId || contextAssignmentId;
    if (nextId && nextId !== selectedAssignmentId) {
      handleSelectAssignment(nextId);
    }
  }, [initialAssignmentId, contextAssignmentId]);

  // Analysis telemetry state
  const [analysisStep, setAnalysisStep] = useState(0);

  // Oral defense state
  const [generatedQuestions, setGeneratedQuestions] = useState<DefenseQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isAnswerStarted, setIsAnswerStarted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [rawSpokenTranscript, setRawSpokenTranscript] = useState('');
  const [detectedCodeTokens, setDetectedCodeTokens] = useState<string[]>([]);
  const [evaluatedResults, setEvaluatedResults] = useState<EvaluatedQuestionResult[]>([]);
  const [finalVerdict, setFinalVerdict] = useState<DefenseSessionVerdict | null>(null);
  const [micStatus, setMicStatus] = useState<'listening' | 'denied' | 'unsupported' | 'idle'>('idle');
  const [isFinishing, setIsFinishing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Current active question
  const activeQuestion = generatedQuestions[currentQIndex];

  // Up-to-date refs to prevent stale closures and double execution
  const isFinishingRef = useRef(false);
  const activeQuestionRef = useRef(activeQuestion);
  activeQuestionRef.current = activeQuestion;
  const spokenTranscriptRef = useRef(spokenTranscript);
  spokenTranscriptRef.current = spokenTranscript;
  const secondsRemainingRef = useRef(secondsRemaining);
  secondsRemainingRef.current = secondsRemaining;
  const evaluatedResultsRef = useRef(evaluatedResults);
  evaluatedResultsRef.current = evaluatedResults;
  const currentQIndexRef = useRef(currentQIndex);
  currentQIndexRef.current = currentQIndex;
  const generatedQuestionsRef = useRef(generatedQuestions);
  generatedQuestionsRef.current = generatedQuestions;
  const finishCurrentQuestionRef = useRef<() => void>();

  // Sync assignment when prop changes
  useEffect(() => {
    if (initialAssignmentId) {
      setSelectedAssignmentId(initialAssignmentId);
    }
  }, [initialAssignmentId]);

  // Sync code and filename when selected assignment changes
  useEffect(() => {
    const asg = assignments.find((a) => a.id === selectedAssignmentId);
    if (asg) {
      const meta = getAssignmentMeta(asg);
      setFileName(meta.fileName);
      setCodeContent(meta.starterCode);
    }
  }, [selectedAssignmentId, assignments]);

  // Stop mic & evaluate answer for current question
  const handleFinishQuestionAnswer = async () => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    setIsFinishing(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const currentQ = activeQuestionRef.current;
    const currentIdx = currentQIndexRef.current;
    const allQuestions = generatedQuestionsRef.current;
    const duration = Math.max(2, 15 - secondsRemainingRef.current);
    const finalTranscript = spokenTranscriptRef.current.trim() || 'Ученик не успел дать развернутый ответ в отведенное время.';

    if (!currentQ) {
      isFinishingRef.current = false;
      setIsFinishing(false);
      return;
    }

    const evaluation = await AIService.evaluateAnswer(currentQ, finalTranscript, duration);

    const newResult: EvaluatedQuestionResult = {
      question: currentQ,
      transcript: finalTranscript,
      durationSeconds: duration,
      evaluation
    };

    const updatedResults = [...evaluatedResultsRef.current, newResult];
    setEvaluatedResults(updatedResults);
    evaluatedResultsRef.current = updatedResults;

    // Advance to next question or show verdict
    if (currentIdx < allQuestions.length - 1) {
      setCurrentQIndex(currentIdx + 1);
      setSecondsRemaining(15);
      setSpokenTranscript('');
      setRawSpokenTranscript('');
      setDetectedCodeTokens([]);
      isFinishingRef.current = false;
      setIsFinishing(false);
    } else {
      // All questions answered -> Compute Final Automated Verdict
      const verdict = AIService.calculateSessionVerdict(updatedResults, currentAnalysis?.codeComparison);
      setFinalVerdict(verdict);
      setStage('verdict_report');
      isFinishingRef.current = false;
      setIsFinishing(false);

      // Save to AppContext
      await createSubmission({
        studentName: currentUser.name,
        assignmentId: selectedAssignmentId,
        fileName,
        codeSnippet: codeContent
      });
    }
  };

  finishCurrentQuestionRef.current = handleFinishQuestionAnswer;

  // 15-second Timer countdown effect per question
  useEffect(() => {
    if (stage !== 'oral_defense') return;

    setSecondsRemaining(15);
    isFinishingRef.current = false;
    setIsFinishing(false);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishCurrentQuestionRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, currentQIndex]);

  // Speech recognition & microphone lifecycle per question
  useEffect(() => {
    if (stage !== 'oral_defense') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      setMicStatus('idle');
      return;
    }

    let isEffectCleanedUp = false;
    let recognition: any = null;

    // Request audio permission in browser
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
        console.warn('[Microphone permission error]', err);
        if (!isEffectCleanedUp) {
          setMicStatus('denied');
        }
      });
    }

    try {
      recognition = SpeechService.createRecognition();
      if (!recognition) {
        setMicStatus('unsupported');
        return;
      }

      recognition.onstart = () => {
        if (!isEffectCleanedUp) {
          setMicStatus('listening');
        }
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        const raw = current.trim();
        setRawSpokenTranscript(raw);

        // Real-time phonetic and terminology normalization
        const processed = SpeechService.processSpeech(raw);
        setSpokenTranscript(processed.normalized);
        setDetectedCodeTokens(processed.detectedTokens);
      };

      recognition.onerror = (event: any) => {
        console.warn('[SpeechRecognition error]', event?.error);
        if (!isEffectCleanedUp) {
          if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
            setMicStatus('denied');
          }
        }
      };

      recognition.onend = () => {
        // Continuous mode in Chrome auto-stops on silence.
        // Auto-restart if answer is still active!
        if (!isEffectCleanedUp && stage === 'oral_defense' && !isFinishingRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setMicStatus('listening');
    } catch (e: any) {
      console.warn('[SpeechRecognition exception]', e);
      setMicStatus('unsupported');
    }

    return () => {
      isEffectCleanedUp = true;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
      recognitionRef.current = null;
    };
  }, [stage, currentQIndex]);

  // Manual microphone restart trigger
  const handleRestartMic = () => {
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      const rec = SpeechService.createRecognition();
      if (rec) {
        rec.onstart = () => setMicStatus('listening');
        rec.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + ' ';
          }
          const raw = current.trim();
          setRawSpokenTranscript(raw);
          const processed = SpeechService.processSpeech(raw);
          setSpokenTranscript(processed.normalized);
          setDetectedCodeTokens(processed.detectedTokens);
        };
        rec.onerror = () => setMicStatus('denied');
        rec.start();
        recognitionRef.current = rec;
        setMicStatus('listening');
      }
    } catch (e) {
      console.warn('Manual mic restart failed:', e);
    }
  };

  // Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCodeContent(reader.result);
      }
    };
    reader.readAsText(file);
  };

  // Step 1 -> Step 2: Trigger AI Analysis
  const handleStartAnalysis = async () => {
    if (!codeContent.trim()) return;

    setStage('ai_analyzing');
    setAnalysisStep(1);

    // Step 1: AST parsing
    setTimeout(() => setAnalysisStep(2), 400);
    // Step 2: Model inspection
    setTimeout(() => setAnalysisStep(3), 850);
    // Step 3: Question formulation
    setTimeout(() => setAnalysisStep(4), 1300);

    const currentAsg = assignments.find((a) => a.id === selectedAssignmentId);
    const { analysis, questions } = await AIService.analyzeSubmission({
      codeSnippet: codeContent,
      fileName,
      referenceCode: currentAsg?.referenceCode
    });

    setCurrentAnalysis(analysis);

    setTimeout(() => {
      setGeneratedQuestions(questions);
      setCurrentQIndex(0);
      setEvaluatedResults([]);
      setStage('oral_defense');
      setIsAnswerStarted(true);
      setSecondsRemaining(15);
      setSpokenTranscript('');
      setRawSpokenTranscript('');
      setDetectedCodeTokens([]);
    }, 1700);
  };

  // Instant code token insertion helper for noisy environments or fast speech
  const handleInsertTerm = (token: string) => {
    const updated = spokenTranscript ? `${spokenTranscript} ${token}` : token;
    const processed = SpeechService.processSpeech(updated);
    setSpokenTranscript(processed.normalized);
    setDetectedCodeTokens(processed.detectedTokens);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 font-mono text-zinc-100">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            AI
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold font-sans tracking-tight">
              Интерактивная устная защита проекта
            </h1>
            <p className="text-[11px] text-zinc-500 font-mono">
              STUDYMAXXING // ORAL_DEFENSE_ENGINE (15s BLITZ)
            </p>
          </div>
        </div>

        {/* AI Examiner Static Indicator & Pipeline Stage Indicators */}
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex items-center gap-2 text-zinc-300 shadow-sm font-mono">
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-200 font-semibold text-[11px]">ИИ-Экзаменатор</span>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">АКТИВЕН</span>
          </div>

          {/* Pipeline Stage Indicators */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded border ${
              stage === 'code_upload' ? 'bg-zinc-800 border-emerald-500 text-emerald-400 font-semibold' : 'border-zinc-800 text-zinc-500'
            }`}>
              1. Загрузка кода
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className={`px-2.5 py-1 rounded border ${
              stage === 'ai_analyzing' ? 'bg-zinc-800 border-emerald-500 text-emerald-400 font-semibold' : 'border-zinc-800 text-zinc-500'
            }`}>
              2. Анализ ИИ
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className={`px-2.5 py-1 rounded border ${
              stage === 'oral_defense' ? 'bg-zinc-800 border-emerald-500 text-emerald-400 font-semibold' : 'border-zinc-800 text-zinc-500'
            }`}>
              3. Защита (15с)
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className={`px-2.5 py-1 rounded border ${
              stage === 'verdict_report' ? 'bg-zinc-800 border-emerald-500 text-emerald-400 font-semibold' : 'border-zinc-800 text-zinc-500'
            }`}>
              4. Вердикт ИИ
            </span>
          </div>
        </div>
      </div>

      {/* ================= STAGE 1: CODE UPLOAD & TASK SELECTION ================= */}
      {stage === 'code_upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left: Settings & Presets */}
          <div className="lg:col-span-5 space-y-5">
            <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-xl space-y-4">
              {/* Active Current Assignment Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Текущее задание:
                  </span>
                  {currentAssignment.grade && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {currentAssignment.grade} класс
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-100 font-sans font-bold text-sm line-clamp-1">
                      {currentAssignment.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap ${
                        currentAssignment.referenceCode
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {currentAssignment.referenceCode ? '✓ Эталон задан' : 'Без эталона'}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-500 font-mono">
                    {currentAssignment.className}
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {currentAssignment.description}
                  </p>

                  <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setCodeContent(getAssignmentMeta(currentAssignment).starterCode)}
                      className="flex-1 py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors text-center cursor-pointer"
                      title="Вставить заготовку кода для этого задания"
                    >
                      Заготовка
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeContent('')}
                      className="py-1.5 px-3 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
                      title="Очистить поле для ввода"
                    >
                      Очистить
                    </button>
                  </div>
                </div>
              </div>

              {/* Tasks for Student's Class */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Задания вашего {userGrade} класса:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {myClassAssignments.length} задан.
                  </span>
                </div>

                <div className="space-y-1.5">
                  {myClassAssignments.map((asg) => {
                    const isSelected = selectedAssignmentId === asg.id;
                    return (
                      <button
                        key={asg.id}
                        type="button"
                        onClick={() => handleSelectAssignment(asg.id)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Code2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                          <span className="truncate">{asg.title}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 flex-shrink-0">
                          {asg.grade} кл.
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Other Classes (Collapsible Archive) */}
              {assignments.some((a: Assignment) => a.grade !== userGrade) && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setShowOtherGrades(!showOtherGrades)}
                    className="w-full flex items-center justify-between py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <span>{showOtherGrades ? '▲ Скрыть задания других классов' : '▼ Показать задания других классов (5–11)'}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {assignments.filter((a: Assignment) => a.grade !== userGrade).length} задан.
                    </span>
                  </button>

                  {showOtherGrades && (
                    <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto pr-1">
                      {assignments
                        .filter((a: Assignment) => a.grade !== userGrade)
                        .map((asg: Assignment) => {
                          const isSelected = selectedAssignmentId === asg.id;
                          return (
                            <button
                              key={asg.id}
                              type="button"
                              onClick={() => handleSelectAssignment(asg.id)}
                              className={`w-full text-left p-2 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                                  : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <Code2 className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                                <span className="truncate text-[11px]">{asg.title}</span>
                              </div>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 flex-shrink-0">
                                {asg.grade} кл.
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".py,.js,.cpp,.cs,.java,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-zinc-700 hover:border-emerald-500 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Загрузить свой файл (.py, .cpp, .js)</span>
                </button>
              </div>
            </div>

            {/* Protocol Notice */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl text-xs space-y-1.5 text-zinc-400">
              <div className="text-zinc-200 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Регламент проверки:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                ИИ сформирует ровно 3 вопроса по вашим строчкам кода. На каждый ответ выделяется строго 15 секунд в микрофон. При балле 85%+ домашнее задание засчитывается автоматически.
              </p>
            </div>
          </div>

          {/* Right: Code Viewer & Launch CTA */}
          <div className="lg:col-span-7 border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-zinc-200">{fileName}</span>
                <span className="text-[10px] text-zinc-500">({codeContent.split('\n').length} строк)</span>
              </div>
              <span className="text-[11px] text-zinc-500">Готов к парсингу</span>
            </div>

            <div className="p-4 flex-1 bg-black/40">
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="Вставьте сюда свой код для анализа..."
                rows={16}
                className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-zinc-200 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Лимит защиты: <span className="text-emerald-400 font-semibold">15 сек на вопрос</span>
              </span>

              <button
                type="button"
                onClick={handleStartAnalysis}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Запустить анализ кода ИИ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 2: AI ANALYZING TELEMETRY ================= */}
      {stage === 'ai_analyzing' && (
        <div className="max-w-xl mx-auto py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto relative shadow-xl">
            <Cpu className="w-8 h-8 animate-pulse" />
            <div className="absolute -inset-1 rounded-2xl border border-emerald-500/20 animate-ping" />
          </div>

          <div>
            <h2 className="text-xl font-bold font-sans text-zinc-100">
              Обученный ИИ инспектирует ваш код
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Поиск структурных узлов, выявление признаков ИИ-генераторов и компиляция контрольных вопросов
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-left text-xs font-mono space-y-3">
            <div className={`flex items-center gap-2.5 transition-colors ${
              analysisStep >= 1 ? 'text-emerald-400' : 'text-zinc-600'
            }`}>
              {analysisStep >= 1 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-zinc-700" />}
              <span>Синтаксический AST-разбор файла {fileName}</span>
            </div>

            <div className={`flex items-center gap-2.5 transition-colors ${
              analysisStep >= 2 ? 'text-emerald-400' : 'text-zinc-600'
            }`}>
              {analysisStep >= 2 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-zinc-700" />}
              <span>Проверка на слепые копипасты и шаблонные конструкции</span>
            </div>

            <div className={`flex items-center gap-2.5 transition-colors ${
              analysisStep >= 3 ? 'text-emerald-400' : 'text-zinc-600'
            }`}>
              {analysisStep >= 3 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-zinc-700" />}
              <span>Локализация критических развилок в строках алгоритма</span>
            </div>

            <div className={`flex items-center gap-2.5 transition-colors ${
              analysisStep >= 4 ? 'text-emerald-400' : 'text-zinc-600'
            }`}>
              {analysisStep >= 4 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-zinc-700" />}
              <span>3 точечных вопроса сформированы (15 сек/вопрос)</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 3: 15-SECOND ORAL DEFENSE ================= */}
      {stage === 'oral_defense' && activeQuestion && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
          {/* Question Header & Counter */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold">
                Вопрос {currentQIndex + 1} из {generatedQuestions.length}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {activeQuestion.skill}
              </span>
            </div>

            {/* 15s Countdown Display */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span className={`text-base font-bold font-mono ${
                secondsRemaining <= 4
                  ? 'text-red-400 animate-ping'
                  : secondsRemaining <= 7
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {secondsRemaining} сек
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 rounded-xl border border-emerald-500/30 bg-zinc-950 space-y-3 shadow-xl">
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Контрольный вопрос ИИ к коду:</span>
            </div>

            <p className="text-base sm:text-lg font-bold font-sans text-zinc-100 leading-snug">
              «{activeQuestion.questionText}»
            </p>
          </div>

          {/* Active Answering State — always shown, timer auto-started */}
          <div className="p-5 border border-emerald-500/40 bg-zinc-950 rounded-xl space-y-4 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  secondsRemaining <= 4 ? 'bg-red-500' : secondsRemaining <= 7 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${(secondsRemaining / 15) * 100}%` }}
              />
            </div>

            {/* Status & Waveform */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {micStatus === 'listening' ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" />
                      МИКРОФОН АКТИВЕН — ИДЕТ ЗАПИСЬ
                    </span>
                  </>
                ) : micStatus === 'denied' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                      <MicOff className="w-3.5 h-3.5" />
                      Микрофон заблокирован в браузере
                    </span>
                    <button
                      type="button"
                      onClick={handleRestartMic}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-mono transition-colors"
                    >
                      Повторить
                    </button>
                  </>
                ) : micStatus === 'unsupported' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MicOff className="w-3.5 h-3.5" />
                      Голос не поддерживается — отвечайте текстом
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-zinc-400">
                      Подключение микрофона...
                    </span>
                  </>
                )}
              </div>

              {micStatus === 'listening' && (
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-emerald-400 rounded animate-pulse" />
                  <span className="w-1 h-5 bg-emerald-400 rounded animate-pulse delay-75" />
                  <span className="w-1 h-4 bg-emerald-400 rounded animate-pulse delay-150" />
                  <span className="w-1 h-6 bg-emerald-400 rounded animate-pulse delay-100" />
                  <span className="w-1 h-3 bg-emerald-400 rounded animate-pulse" />
                </div>
              )}
            </div>

            {/* Transcript Box */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg min-h-[90px] text-xs font-sans text-zinc-200 flex flex-col space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    Распознанная речь:
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Phonetic Normalizer v2.6
                  </span>
                </div>
                <textarea
                  value={spokenTranscript}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSpokenTranscript(val);
                    const processed = SpeechService.processSpeech(val);
                    setDetectedCodeTokens(processed.detectedTokens);
                  }}
                  className="w-full bg-zinc-950 text-zinc-100 font-mono text-xs sm:text-sm leading-relaxed p-3 rounded-lg border border-zinc-800 focus:border-emerald-500/60 focus:outline-none resize-none transition-colors shadow-inner"
                  rows={3}
                  placeholder="Говорите в микрофон... Текст появится здесь автоматически"
                />
              </div>

              {/* Quick term chips */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    'input()', 'int()', 'float()', 'while True', 'break',
                    'print()', 'count += 1', '% 2 == 0', 'if / elif', 'return'
                  ].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleInsertTerm(term)}
                      className="px-2 py-0.5 rounded bg-zinc-800/90 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/50 border border-zinc-700/60 text-zinc-300 font-mono text-[10px] font-medium transition-all cursor-pointer active:scale-95"
                    >
                      + {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detected tokens */}
              {detectedCodeTokens.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-800/70">
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">Токены:</span>
                  {detectedCodeTokens.map((token, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Finish button */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                disabled={isFinishing}
                onClick={handleFinishQuestionAnswer}
                className="w-full sm:w-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isFinishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Оценка ИИ...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Завершить ответ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Viewer Panel — student sees their submitted code while answering */}
          <div className="border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-zinc-300">{fileName}</span>
              <span className="text-zinc-600">— ваш код (для справки)</span>
            </div>
            <pre className="p-4 text-[11px] sm:text-xs font-mono text-zinc-300 leading-relaxed max-h-48 overflow-y-auto bg-black/30 whitespace-pre-wrap break-all">
              {codeContent}
            </pre>
          </div>
        </div>
      )}



      {/* ================= STAGE 4: FINAL AI VERDICT REPORT ================= */}
      {stage === 'verdict_report' && finalVerdict && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          {/* Main Verdict Card with Condition Styling */}
          <div className={`p-6 sm:p-8 rounded-2xl border text-center space-y-4 shadow-2xl ${
            finalVerdict.isAutoApproved
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-emerald-950/30'
              : finalVerdict.needsTeacherReview
              ? 'bg-red-950/20 border-red-500/50 shadow-red-950/30'
              : 'bg-blue-950/20 border-blue-500/50 shadow-blue-950/30'
          }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider border">
              {finalVerdict.isAutoApproved ? (
                <span className="text-emerald-400 border-emerald-500/40 bg-emerald-500/10 px-3 py-1 rounded-full">
                  🎉 {finalVerdict.badgeText}
                </span>
              ) : finalVerdict.needsTeacherReview ? (
                <span className="text-red-400 border-red-500/40 bg-red-500/10 px-3 py-1 rounded-full">
                  ⚠️ {finalVerdict.badgeText}
                </span>
              ) : (
                <span className="text-blue-400 border-blue-500/40 bg-blue-500/10 px-3 py-1 rounded-full">
                  📋 {finalVerdict.badgeText}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className={`text-4xl sm:text-5xl font-bold font-sans tracking-tight ${
                finalVerdict.isAutoApproved
                  ? 'text-emerald-400'
                  : finalVerdict.needsTeacherReview
                  ? 'text-red-400'
                  : 'text-blue-400'
              }`}>
                {finalVerdict.overallScore}%
              </div>
              <h2 className="text-xl font-bold font-sans text-zinc-100">
                {finalVerdict.title}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed font-sans">
              {finalVerdict.verdictDescription}
            </p>

            {/* Criteria Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80 max-w-md mx-auto text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase">Концепции</div>
                <div className="text-base font-bold text-zinc-200 mt-0.5">{finalVerdict.conceptScore}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase">Логика кода</div>
                <div className="text-base font-bold text-zinc-200 mt-0.5">{finalVerdict.reasoningScore}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase">Самостоятельность</div>
                <div className="text-base font-bold text-zinc-200 mt-0.5">{finalVerdict.applicationScore}%</div>
              </div>
            </div>
          </div>

          {/* Teacher Benchmark Comparison Card */}
          {currentAnalysis?.codeComparison && (
            <div className="border border-zinc-800 bg-zinc-950 rounded-xl p-5 space-y-4 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-zinc-200 uppercase tracking-wider">
                    Сверка с эталоном учителя (Benchmark AI Check)
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {currentAnalysis.codeComparison.codeHealth === 'broken' && (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                      КОД НЕРАБОЧИЙ
                    </span>
                  )}
                  {currentAnalysis.codeComparison.codeHealth === 'empty' && (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                      ФАЙЛ ПУСТ
                    </span>
                  )}
                  {currentAnalysis.codeComparison.codeHealth === 'working_minor_slip' && (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      МЕЛКАЯ ОПЕЧАТКА (ЗАЧТЕНО)
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    currentAnalysis.codeComparison.plagiarismRisk === 'low'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : currentAnalysis.codeComparison.plagiarismRisk === 'exact_copy'
                      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      : currentAnalysis.codeComparison.plagiarismRisk === 'ai_anomaly'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {currentAnalysis.codeComparison.plagiarismRisk === 'low'
                      ? 'Низкий риск списывания'
                      : currentAnalysis.codeComparison.plagiarismRisk === 'exact_copy'
                      ? '100% совпадение с эталоном'
                      : currentAnalysis.codeComparison.plagiarismRisk === 'ai_anomaly'
                      ? 'Обнаружены аномалии ChatGPT'
                      : 'Отклонение от эталона'}
                  </span>
                  <span className="font-bold text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {currentAnalysis.codeComparison.correctnessScore}% совпадение
                  </span>
                </div>
              </div>

              {currentAnalysis.codeComparison.brokenReason && (
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-red-200">Код нерабочий / не завершен:</span>
                    <span className="text-[11px] text-zinc-300 font-mono">{currentAnalysis.codeComparison.brokenReason}</span>
                  </div>
                </div>
              )}

              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                {currentAnalysis.codeComparison.verdict}
              </p>

              {/* Matching & Missing Elements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Совпадения с эталоном:
                  </span>
                  {currentAnalysis.codeComparison.matchingElements.length > 0 ? (
                    <ul className="space-y-1 text-[11px] text-zinc-300">
                      {currentAnalysis.codeComparison.matchingElements.map((el: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5 text-zinc-300">
                          <span className="text-emerald-400">✓</span> {el}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] text-zinc-500">Нет явных совпадений</span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Расхождения / Пропуски:
                  </span>
                  {currentAnalysis.codeComparison.missingElements.length > 0 ? (
                    <ul className="space-y-1 text-[11px] text-amber-300">
                      {currentAnalysis.codeComparison.missingElements.map((el: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5 text-amber-300">
                          <span className="text-amber-400">⚠</span> {el}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] text-zinc-400">Все ключевые элементы эталона соблюдены</span>
                  )}
                </div>
              </div>

              {/* AI Anomalies warning if detected */}
              {currentAnalysis.codeComparison.aiAnomalies.length > 0 && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 space-y-1">
                  <span className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Аномалии генерации нейросетей (ChatGPT):
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-red-300">
                    {currentAnalysis.codeComparison.aiAnomalies.map((anom: string, i: number) => (
                      <li key={i}>• {anom}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Detailed Question Answers Audit */}
          <div className="border border-zinc-800 bg-zinc-950 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
              Детализация по 3 вопросам устной защиты:
            </h3>

            <div className="space-y-3">
              {evaluatedResults.map((r, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">
                      Вопрос {idx + 1}: {r.question.skill}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      r.evaluation.overallScore >= 85
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : r.evaluation.overallScore <= 65
                        ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                        : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                    }`}>
                      {r.evaluation.overallScore}% понимания
                    </span>
                  </div>

                  <p className="text-zinc-300 font-sans text-xs italic">
                    «{r.question.questionText}»
                  </p>

                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400">
                    <span className="text-zinc-500 font-semibold">Ваш устный ответ ({r.durationSeconds}с): </span>
                    <span className="text-zinc-200">{r.transcript}</span>
                  </div>

                  <div className="text-[11px] text-zinc-500">
                    {r.evaluation.aiFeedback}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStage('code_upload');
                setIsAnswerStarted(false);
                setSpokenTranscript('');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-xs text-zinc-300 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Пройти защиту повторно</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('student_dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Вернуться в кабинет заданий</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

