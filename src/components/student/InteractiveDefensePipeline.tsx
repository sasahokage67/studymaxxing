import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCode,
  Sparkles,
  Play,
  Mic,
  MicOff,
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
  Layers,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Volume2,
  Bot,
  Settings,
  Key,
  X
} from 'lucide-react';
import { AIService, DefenseSessionVerdict, EvaluatedQuestionResult } from '../../services/aiService';
import { SpeechService } from '../../services/speechService';
import { DefenseQuestion, AIAnalysis } from '../../types';

interface InteractiveDefensePipelineProps {
  initialAssignmentId?: string;
  onClose?: () => void;
}

type PipelineStage = 'code_upload' | 'ai_analyzing' | 'oral_defense' | 'verdict_report';

const CODE_PRESETS = [
  {
    label: 'Python: Игра «Угадай число»',
    assignmentId: 'asg_game',
    fileName: 'guess_game.py',
    code: `secret = 42

print("Компьютер загадал число от 1 до 100!")

while True:
    guess = int(input("Введите число: "))
    if guess == secret:
        print("Поздравляю, вы угадали!")
        break
    elif guess < secret:
        print("Загаданное число больше!")
    else:
        print("Загаданное число меньше!")`
  },
  {
    label: 'Python: Простой калькулятор',
    assignmentId: 'asg_calc',
    fileName: 'calculator.py',
    code: `a = float(input("Введите первое число: "))
op = input("Выберите операцию (+, -, *, /): ")
b = float(input("Введите второе число: "))

if op == "+":
    print("Результат:", a + b)
elif op == "-":
    print("Результат:", a - b)
elif op == "*":
    print("Результат:", a * b)
elif op == "/":
    if b != 0:
        print("Результат:", a / b)
    else:
        print("Ошибка: делить на ноль нельзя!")
else:
    print("Неизвестная операция")`
  },
  {
    label: 'Python: Подсчет четных чисел',
    assignmentId: 'asg_even',
    fileName: 'even_counter.py',
    code: `numbers = [12, 5, 8, 19, 24, 7, 30]
count = 0

for num in numbers:
    if num % 2 == 0:
        print("Четное число:", num)
        count = count + 1

print("Всего четных чисел в списке:", count)`
  }
];

export const InteractiveDefensePipeline: React.FC<InteractiveDefensePipelineProps> = ({
  initialAssignmentId,
  onClose
}) => {
  const {
    currentUser,
    assignments,
    createSubmission,
    setCurrentView
  } = useApp();

  const [stage, setStage] = useState<PipelineStage>('code_upload');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(
    initialAssignmentId || assignments[0]?.id || 'asg_game'
  );
  const [fileName, setFileName] = useState('guess_game.py');
  const [codeContent, setCodeContent] = useState(CODE_PRESETS[0].code);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);

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

  // AI Engine configuration state
  const [aiEngineConfig, setAiEngineConfig] = useState(AIService.getAIEngineConfig());
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(aiEngineConfig.apiKey);
  const [geminiModeInput, setGeminiModeInput] = useState<'local' | 'gemini'>(aiEngineConfig.mode);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleSaveAiSettings = () => {
    AIService.setAIEngineConfig({
      mode: geminiModeInput,
      apiKey: geminiKeyInput.trim()
    });
    setAiEngineConfig({
      mode: geminiModeInput,
      apiKey: geminiKeyInput.trim()
    });
    setSaveSuccessMsg('Настройки ИИ успешно сохранены');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setIsAiSettingsOpen(false);
    }, 900);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Current active question
  const activeQuestion = generatedQuestions[currentQIndex];

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
      if (asg.id === 'asg_game') {
        setFileName('guess_game.py');
        setCodeContent(asg.starterTemplate || CODE_PRESETS[0].code);
      } else if (asg.id === 'asg_calc') {
        setFileName('calculator.py');
        setCodeContent(asg.starterTemplate || '');
      } else {
        const safeName = (asg.title || 'task').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20) || 'solution';
        setFileName(`${safeName}.py`);
        setCodeContent(asg.starterTemplate || `# Решение задания: ${asg.title}\n`);
      }
    }
  }, [selectedAssignmentId, assignments]);

  // 15-second Timer countdown effect
  useEffect(() => {
    let timer: any = null;
    if (stage === 'oral_defense' && isAnswerStarted && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishQuestionAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, isAnswerStarted, secondsRemaining]);

  // Code Preset Selector
  const handleSelectPreset = (preset: typeof CODE_PRESETS[0]) => {
    setSelectedAssignmentId(preset.assignmentId);
    setFileName(preset.fileName);
    setCodeContent(preset.code);
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
      setIsAnswerStarted(false);
      setSecondsRemaining(15);
      setSpokenTranscript('');
    }, 1700);
  };

  // Start 15s timer & mic recognition
  const handleStartQuestionAnswer = () => {
    setIsAnswerStarted(true);
    setSecondsRemaining(15);
    setSpokenTranscript('');
    setRawSpokenTranscript('');
    setDetectedCodeTokens([]);

    // Attempt browser Web Speech API with JSGF programming grammar biasing
    try {
      const recognition = SpeechService.createRecognition();
      if (recognition) {
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

        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (e) {
      console.log('Web Speech API fallback mode');
    }
  };

  // Stop mic & evaluate answer
  const handleFinishQuestionAnswer = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const duration = 15 - secondsRemaining;
    const finalTranscript = spokenTranscript.trim() || 'Ученик не успел дать развернутый ответ в отведенное время.';

    if (!activeQuestion) return;

    // Evaluate answer via AI
    const evaluation = await AIService.evaluateAnswer(activeQuestion, finalTranscript, Math.max(2, duration));

    const newResult: EvaluatedQuestionResult = {
      question: activeQuestion,
      transcript: finalTranscript,
      durationSeconds: Math.max(2, duration),
      evaluation
    };

    const updatedResults = [...evaluatedResults, newResult];
    setEvaluatedResults(updatedResults);

    // If more questions remain, advance to next question
    if (currentQIndex < generatedQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setIsAnswerStarted(false);
      setSecondsRemaining(15);
      setSpokenTranscript('');
      setRawSpokenTranscript('');
      setDetectedCodeTokens([]);
    } else {
      // All 3 questions answered -> Compute Final Automated Verdict
      const verdict = AIService.calculateSessionVerdict(updatedResults);
      setFinalVerdict(verdict);
      setStage('verdict_report');

      // Save to AppContext
      await createSubmission({
        studentName: currentUser.name,
        assignmentId: selectedAssignmentId,
        fileName,
        codeSnippet: codeContent
      });
    }
  };

  // Instant code token insertion helper for noisy environments or fast speech
  const handleInsertTerm = (token: string) => {
    if (!isAnswerStarted) {
      handleStartQuestionAnswer();
    }
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

        {/* AI Model Badge & Pipeline Stage Indicators */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAiSettingsOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-xs flex items-center gap-1.5 text-zinc-300 transition-all cursor-pointer shadow-sm"
            title="Настроить модель ИИ (локальная или Gemini Cloud)"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-zinc-500 text-[10px] uppercase">ИИ:</span>
            <span className="text-emerald-400 font-bold text-[11px]">
              {aiEngineConfig.mode === 'gemini' ? 'Gemini 1.5 Flash' : 'Нейро-Экзаменатор v2.4'}
            </span>
            <span className="text-[9px] text-zinc-500 border border-zinc-700 px-1 rounded font-mono">0% строгий</span>
            <Settings className="w-3 h-3 text-zinc-500" />
          </button>

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
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  1. Текущее задание курса:
                </label>
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-sans"
                >
                  {assignments.map((asg) => (
                    <option key={asg.id} value={asg.id}>
                      {asg.title} ({asg.className})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment details & teacher benchmark badge */}
              {(() => {
                const asg = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];
                return (
                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-sans font-medium line-clamp-1">{asg.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        asg.referenceCode
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {asg.referenceCode ? '✓ Эталон учителя задан' : 'Без эталона'}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                      {asg.description}
                    </p>

                    <div className="flex gap-2 pt-1 border-t border-zinc-800/80">
                      {asg.starterTemplate && (
                        <button
                          type="button"
                          onClick={() => setCodeContent(asg.starterTemplate!)}
                          className="flex-1 py-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono transition-colors text-center"
                          title="Сбросить код до начального шаблона"
                        >
                          Заготовка задания
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setCodeContent('')}
                        className="py-1 px-3 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 text-[10px] font-mono transition-colors"
                        title="Очистить поле для ввода"
                      >
                        Очистить
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  2. Все доступные задания курса (1 клик):
                </label>
                <div className="space-y-1.5">
                  {assignments.map((asg) => (
                    <button
                      key={asg.id}
                      type="button"
                      onClick={() => setSelectedAssignmentId(asg.id)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                        selectedAssignmentId === asg.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Code2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{asg.title}</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono flex-shrink-0 flex items-center gap-1.5">
                        {asg.grade && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-emerald-500/20 font-semibold">
                            {asg.grade} кл.
                          </span>
                        )}
                        {asg.referenceCode && <span className="text-zinc-500">✓ Эталон</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

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
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
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
                !isAnswerStarted
                  ? 'text-zinc-400'
                  : secondsRemaining <= 4
                  ? 'text-red-400 animate-ping'
                  : secondsRemaining <= 7
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {isAnswerStarted ? `${secondsRemaining} сек` : '15 сек лимит'}
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 shadow-xl">
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Контрольный вопрос ИИ к коду:</span>
            </div>

            <p className="text-base sm:text-lg font-bold font-sans text-zinc-100 leading-snug">
              «{activeQuestion.questionText}»
            </p>

            {/* Purpose hint */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-xs text-zinc-400">
              <span className="text-zinc-500 font-semibold">Фокус проверки: </span>
              {activeQuestion.purpose}
            </div>
          </div>

          {/* Answer State Controller */}
          {!isAnswerStarted ? (
            /* Pre-Start State: Student reads question, then clicks Start */
            <div className="p-6 border border-zinc-800 bg-zinc-900/40 rounded-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Готовы ответить?
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                  Нажмите кнопку ниже, когда будете готовы говорить в микрофон. Отсчет 15 секунд начнется сразу.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartQuestionAnswer}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>НАЧАТЬ ОТВЕТ (15 СЕКУНД)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Answering State: Timer is running, speech recognition active */
            <div className="p-6 border border-emerald-500/40 bg-zinc-950 rounded-xl space-y-4 relative overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Progress Bar of 15 seconds */}
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    secondsRemaining <= 4 ? 'bg-red-500' : secondsRemaining <= 7 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(secondsRemaining / 15) * 100}%` }}
                />
              </div>

              {/* Status & Live Waveform Animation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
                    МИКРОФОН АКТИВЕН // ИДЕТ ЗАПИСЬ
                  </span>
                </div>

                {/* Animated Audio Waveform */}
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-emerald-400 rounded animate-pulse" />
                  <span className="w-1 h-5 bg-emerald-400 rounded animate-pulse delay-75" />
                  <span className="w-1 h-4 bg-emerald-400 rounded animate-pulse delay-150" />
                  <span className="w-1 h-6 bg-emerald-400 rounded animate-pulse delay-100" />
                  <span className="w-1 h-3 bg-emerald-400 rounded animate-pulse" />
                </div>
              </div>

              {/* Live Speech Recognition Transcript Box with Real-time Technical Term Extraction */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg min-h-[110px] text-xs font-sans text-zinc-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      Распознанная речь (с автокоррекцией терминов Python):
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Phonetic Normalizer v2.6
                    </span>
                  </div>

                  <div className="space-y-2">
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
                      placeholder="Говорите в микрофон... Текст появится здесь автоматически с нормализацией Python (можно редактировать или вставлять термины по клику)"
                    />
                  </div>
                </div>

                {/* Instant Technical Syntax Chips for Noise-proof Recognition */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-zinc-400 font-mono font-semibold flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-emerald-400" />
                      Быстрая вставка терминов (1 клик):
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      кликните если микрофон не расслышал
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      'input()', 'int()', 'float()', 'while True', 'break',
                      'print()', 'count += 1', 'b != 0', '% 2 == 0', 'if / elif', 'return'
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

                {/* Real-time Code Tokens Detected */}
                {detectedCodeTokens.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-800/70">
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                      <Code2 className="w-3 h-3" />
                      Токены кода в ответе:
                    </span>
                    {detectedCodeTokens.map((token, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold shadow-sm"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-900">
                  <span>Язык: ru-RU (JSGF Grammar Biasing)</span>
                  <span>Слов: {spokenTranscript.split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-zinc-900 flex justify-end">
                <button
                  type="button"
                  onClick={handleFinishQuestionAnswer}
                  className="w-full sm:w-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Завершить ответ</span>
                </button>
              </div>
            </div>
          )}
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
                <div className="flex items-center gap-2">
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

      {/* ================= AI ENGINE CONFIG MODAL ================= */}
      {isAiSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 text-zinc-100 font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Настройки обученного ИИ-Экзаменатора
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    CALIBRATION ENGINE // STRICT 0% ZERO-TOLERANCE
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAiSettingsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Model Engine Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                Выберите активную ИИ-модель:
              </label>

              <div className="space-y-2 font-mono">
                {/* Local Neural Engine v2.4 */}
                <div
                  onClick={() => setGeminiModeInput('local')}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    geminiModeInput === 'local'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-100 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      Нейро-Экзаменатор v2.4 (Локальный)
                    </span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      Рекомендуется
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Строгая калибровка: 0% при признании в незнании («не знаю», «не помню», «списал»). Мгновенный анализ без задержек и внешних ключей.
                  </p>
                </div>

                {/* Google Gemini 1.5 Flash Cloud LLM */}
                <div
                  onClick={() => setGeminiModeInput('gemini')}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    geminiModeInput === 'gemini'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Google Gemini 1.5 Flash (Облачная LLM)
                    </span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      Deep Reasoning
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Прямой запрос к большой языковой модели Google с глубоким семантическим контекстом и строгим промптом экзаменатора.
                  </p>
                </div>
              </div>
            </div>

            {/* Gemini API Key input if Gemini mode is chosen */}
            {geminiModeInput === 'gemini' && (
              <div className="space-y-2 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl animate-in fade-in duration-150 font-mono">
                <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Gemini API Key:</span>
                </label>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-zinc-500 font-sans">
                  Ключ сохраняется локально в вашем браузере. Бесплатный ключ можно получить в <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">Google AI Studio</a>.
                </p>
              </div>
            )}

            {/* Strict Grading Rules Summary */}
            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1.5 text-xs text-zinc-400 font-sans">
              <span className="font-semibold text-zinc-200 block text-[11px] uppercase font-mono">
                Шкала калибровки оценивания:
              </span>
              <ul className="space-y-1 text-[11px] leading-relaxed">
                <li className="flex items-center gap-1.5 text-red-400">
                  <span>🛑</span>
                  <span><strong>«Не знаю / не помню / списал / хз»:</strong> строго 0%</span>
                </li>
                <li className="flex items-center gap-1.5 text-amber-400">
                  <span>⚠️</span>
                  <span><strong>Оффтоп / случайные слова:</strong> 1–5%</span>
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <span>⚠️</span>
                  <span><strong>Поверхностный ответ / догадка:</strong> 20–35%</span>
                </li>
                <li className="flex items-center gap-1.5 text-blue-300">
                  <span>📋</span>
                  <span><strong>Частичное понимание:</strong> 50–65% (Проверка учителя)</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <span>✅</span>
                  <span><strong>Аргументированное понимание кода:</strong> 85–98% (Автозачет)</span>
                </li>
              </ul>
            </div>

            {/* Success message */}
            {saveSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAiSettingsOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveAiSettings}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Применить и сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
