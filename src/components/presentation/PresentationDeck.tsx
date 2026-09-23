import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Printer,
  Grid,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Mic,
  Bot,
  Clock,
  Users,
  Code2,
  CheckCircle2,
  X,
  ArrowRight,
  FileCode,
  Flame,
  Layers,
  Award,
  Zap,
  Sliders
} from 'lucide-react';

export interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  category: string;
  content: React.ReactNode;
  canvaPrompt: {
    heading: string;
    subheading: string;
    points: string[];
    bentoBlocks: { title: string; desc: string; metric?: string }[];
  };
}

export const PresentationDeck: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isCanvaModalOpen, setIsCanvaModalOpen] = useState(false);
  const [copiedSlide, setCopiedSlide] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const totalSlides = 10;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlide(totalSlides - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        setIsGridOpen(false);
        setIsCanvaModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, totalSlides]);

  const slides: SlideData[] = [
    // SLIDE 1: Title & Hero
    {
      id: 1,
      category: 'ОБЗОР СИСТЕМЫ',
      tag: 'SLIDE // 01',
      title: 'STUDYMAXXING',
      subtitle: 'Платформа академической честности и интерактивной устной защиты кода для школ (5–11 классы)',
      canvaPrompt: {
        heading: 'STUDYMAXXING: Интеллектуальная устная защита кода',
        subheading: 'Платформа академической честности для общеобразовательных школ, НИШ и РФМШ',
        points: [
          'Автоматическая сверка кода с эталоном учителя',
          '15-секундный блиц-экзамен устной защиты (Oral Defense Engine)',
          'Строгое выявление нерабочего кода («КОД НЕРАБОЧИЙ») при толерантности к опечаткам',
          'Управление классами 5–11 с зачислением по никнеймам без рутинных почт'
        ],
        bentoBlocks: [
          { title: 'Тайминг ответа', desc: 'Строгий 15-секундный блиц без возможности списать', metric: '15 сек' },
          { title: 'Ложные срабатывания', desc: 'Случайные забытые скобки или двоеточия прощаются', metric: '0%' },
          { title: 'Прозрачность', desc: 'Автоматический протокол с записью голоса и сверкой токенов', metric: '100%' }
        ]
      },
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span>ORAL_DEFENSE_ENGINE // v2.4</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs">
              НИШ • РФМШ • ШКОЛЫ КАЗАХСТАНА
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">15с</span>
                <Clock className="w-5 h-5 text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-zinc-100 font-sans">Устный блиц-экзамен</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Ученик отвечает на прицельные вопросы по своему коду за 15 секунд. Времени на ChatGPT или чтение чужих ответов нет.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">0%</span>
                <ShieldCheck className="w-5 h-5 text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-zinc-100 font-sans">Защита от занижений</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Мелкие синтаксические опечатки (скобки `)`, двоеточия `:`) не разрушают оценку. Проверяется понимание алгоритма.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">5–11</span>
                <Layers className="w-5 h-5 text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-zinc-100 font-sans">Сквозная программа</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Легкие калиброванные задания для каждого класса. Ученик видит только задания своего класса, назначенного учителем.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-xs flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Технологический стек: React 18 • TypeScript • Tailwind CSS • Web Speech API • Vite</span>
            </span>
            <span className="text-zinc-500">PROD-READY ARCHITECTURE</span>
          </div>
        </div>
      )
    },

    // SLIDE 2: Problem
    {
      id: 2,
      category: 'АНАЛИЗ РЫНКА & ПРОБЛЕМА',
      tag: 'SLIDE // 02',
      title: 'Эпоха LLM убила традиционные ДЗ',
      subtitle: 'Генеративный ИИ (ChatGPT, DeepSeek, Claude) делает отправку исходного кода бессмысленной без устной верификации',
      canvaPrompt: {
        heading: 'Проблема: Смерть классической проверки кода',
        subheading: 'Ученики получают рабочий код за секунды без понимания архитектуры',
        points: [
          '87% школьников копируют решения из ИИ без понимания базовых конструкций',
          'Традиционные антиплагиаты бессильны против уникального синтаксиса нейросетей',
          'Учителя тратят до 40% рабочего времени на ручной опрос у доски',
          'Отсутствие прозрачного протокола проверки создает конфликты с оценками'
        ],
        bentoBlocks: [
          { title: 'Код без понимания', desc: 'Ученик приносит 100 строк кода, но не может объяснить ни одной строчки', metric: '87%' },
          { title: 'Рутина учителя', desc: 'Учитель тратит 40+ часов в месяц на индивидуальный опрос учеников', metric: '40ч/мес' },
          { title: 'Слепая зона', desc: 'Формально код работает — фактически знания отсутствуют', metric: 'Кризис' }
        ]
      },
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-3">
              <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Массовый читинг</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-zinc-100">87%</div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Школьников используют языковые модели для генерации готового Python-кода без погружения в синтаксис.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Потеря времени</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-zinc-100">40+ ч</div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Каждый месяц преподаватель информатики тратит на ручную сверку и опрос 30 человек у доски по каждому заданию.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4" />
                <span>Бессилие антиплагиата</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-zinc-100">0% защиты</div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Текстовые анализаторы не ловят код, сгенерированный с уникальными переменными и альтернативной структурой.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 font-bold font-mono text-lg">
              !
            </div>
            <div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Ключевой вызов образования:</h5>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Единственный надежный критерий реальных навыков школьника — способность вслух за 15 секунд аргументировать работу своего алгоритма.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 3: Solution & Two-Tier Verification
    {
      id: 3,
      category: 'АРХИТЕКТУРА РЕШЕНИЯ',
      tag: 'SLIDE // 03',
      title: 'Двухконтурная верификация авторства',
      subtitle: 'Синтаксический AST-бенчмарк + интерактивный голосовой блиц-экзамен в браузере',
      canvaPrompt: {
        heading: 'Архитектурное решение: Двухконтурная защита',
        subheading: 'Комплексный анализ кода и моментальная проверка понимания',
        points: [
          'Контур 1: AST-парсинг и сверка с эталонным решением учителя',
          'Контур 2: Генерация прицельных вопросов конкретно по строкам ученика',
          'Контур 3: 15-секундная голосовая защита через Web Speech API',
          'Формирование юридически прозрачного протокола защиты'
        ],
        bentoBlocks: [
          { title: 'Контур I: Анализ кода', desc: 'Проверка структуры AST, детекция синтаксических аномалий и эталона' },
          { title: 'Контур II: Устный блиц', desc: 'Автоматическая формулировка 3 каверзных вопросов по коду' },
          { title: 'Контур III: Протокол', desc: 'Аудио-транскрипт, детекция токенов и итоговый скоринг' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>AST & Benchmark Check</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Сверка с эталоном учителя</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Сравнение ключевых токенов кода (`for`, `while`, `def`, `list`, `return`) с эталонной реализацией преподавателя.
              </p>
              <div className="p-2 rounded bg-zinc-950 font-mono text-[10px] text-zinc-400 border border-zinc-800/80">
                AST_VALIDATE // 88% MATCH
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Question Synthesis</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Прицельные вопросы ИИ</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Формирование 3 индивидуальных вопросов: роль ключевых операторов, логика условий и обоснование выбора структур.
              </p>
              <div className="p-2 rounded bg-zinc-950 font-mono text-[10px] text-zinc-400 border border-zinc-800/80">
                PROMPT_SYNTHESIS // 3 QUESTIONS
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>15s Speech Defense</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Голосовой блиц-ответ</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Распознавание речи ученика в браузере в реальном времени, подсчет попадания в ключевые термины (`цикл`, `счетчик`).
              </p>
              <div className="p-2 rounded bg-zinc-950 font-mono text-[10px] text-emerald-400 border border-emerald-500/30">
                WEB_SPEECH_API // DEFENSE READY
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Результат: объективный цифровой отчет для учителя с аудио-транскриптом и оценкой авторства</span>
            </span>
            <span className="font-bold text-zinc-100">АВТОЗАЧЕТ</span>
          </div>
        </div>
      )
    },

    // SLIDE 4: Code Health & Broken Code Engine
    {
      id: 4,
      category: 'ДЕТЕКЦИЯ КАЧЕСТВА КОДА',
      tag: 'SLIDE // 04',
      title: 'Интеллектуальная калибровка кода',
      subtitle: 'Четкая детекция статуса «КОД НЕРАБОЧИЙ» при лояльности к случайным опечаткам',
      canvaPrompt: {
        heading: 'Интеллектуальный анализ: Нерабочий код vs Опечатки',
        subheading: 'Справедливое дифференцированное оценивание',
        points: [
          'Статус «ФАЙЛ ПУСТ»: Строгие 0% при отсутствии логики',
          'Статус «КОД НЕРАБОЧИЙ»: Снижение процентов пропорционально недописанности',
          'Статус «МЕЛКАЯ ОПЕЧАТКА»: Забытые скобки или двоеточия прощаются (88–95%)',
          'Адресные вопросы: экзаменатор спрашивает, почему алгоритм не завершен'
        ],
        bentoBlocks: [
          { title: 'Пустой файл', desc: '0% балл. Вопросы о том, почему задание даже не начиналось', metric: '0%' },
          { title: 'Нерабочий код', desc: 'Штраф пропорционален пропущенным алгоритмам', metric: 'Штраф' },
          { title: 'Мелкая опечатка', desc: 'Забытая скобка ")" или ":" не снижает оценку за алгоритм', metric: 'Зачет' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Broken Code Card */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                  КОД НЕРАБОЧИЙ
                </span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Недописанный алгоритм</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Если пропущены ключевые условия, циклы или вызовы функций — баллы снижаются строго пропорционально недописанности.
              </p>
              <div className="text-[11px] text-red-300 font-mono bg-zinc-950/80 p-2 rounded border border-red-900/50">
                «На сколько % не завершен код?»
              </div>
            </div>

            {/* Empty File Card */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  ФАЙЛ ПУСТ
                </span>
                <X className="w-4 h-4 text-zinc-500" />
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">0% за пустой шаблон</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Если файл пуст или содержит лишь стандартные комментарии — моментально выставляется 0% и генерируются вопросы о причинах.
              </p>
              <div className="text-[11px] text-zinc-400 font-mono bg-zinc-950/80 p-2 rounded border border-zinc-800">
                SCORE: 0% // EMPTY_SUBMISSION
              </div>
            </div>

            {/* Minor Slip Forgiveness */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ОПЕЧАТКА ПРОЩЕНА
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Толерантность к опискам</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Забытая закрывающая скобка `)` или двоеточие `:` в конце `if/for` не наказываются. Оценка сохраняется на уровне 88–95%.
              </p>
              <div className="text-[11px] text-emerald-300 font-mono bg-zinc-950/80 p-2 rounded border border-emerald-500/20">
                88%–95% // АВТОЗАЧЕТ
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300">Принцип: Оценивать алгоритмическое мышление школьника, а не механические опечатки.</span>
            <span className="text-emerald-400 font-bold">FAIR GRADING</span>
          </div>
        </div>
      )
    },

    // SLIDE 5: 15-Second Oral Blitz Defense Mechanics
    {
      id: 5,
      category: 'МЕХАНИКА УСТНОЙ ЗАЩИТЫ',
      tag: 'SLIDE // 05',
      title: '15-секундный блиц-экзамен',
      subtitle: 'Сверхбыстрый тайминг ответа с автоматическим распознаванием терминов речи',
      canvaPrompt: {
        heading: '15-секундный блиц-экзамен: Анти-шпаргалка',
        subheading: 'Голосовая защита без возможности обратиться к внешним источникам',
        points: [
          '15 секунд на ответ исключают чтение заготовленных чужих конспектов',
          'JSGF-грамматика ищет реальные токены кода в русской и казахской речи',
          'Строгий фильтр признаний: «не знаю / списал / хз» дают строгие 0%',
          'Мгновенный аудио-транскрипт с подсветкой аргументов'
        ],
        bentoBlocks: [
          { title: 'Анти-чит таймер', desc: '15 секунд на вопрос: моментальная проверка понимания', metric: '15 сек' },
          { title: 'Zero Tolerance', desc: '«Не знаю / не помню / списал» приводят к мгновенному 0%', metric: '0%' },
          { title: 'Детектор терминов', desc: 'Учет токенов: цикл, условие, список, переменная', metric: 'JSGF' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase">Алгоритм калибровки:</span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5" />
                  VOICE_STREAM
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800 text-red-400">
                  <span>«Не знаю / забыл / списал»:</span>
                  <span className="font-bold">0% (Отказ)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800 text-amber-400">
                  <span>Оффтоп или случайные слова:</span>
                  <span className="font-bold">1–5% (Штраф)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                  <span>Поверхностное описание:</span>
                  <span className="font-bold">25–40%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800 text-emerald-400">
                  <span>Точный ответ с терминами:</span>
                  <span className="font-bold">85–98% (Зачет)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 font-mono">
              <div className="text-xs text-zinc-500 uppercase">Пример карточки вопроса:</div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Вопрос #2 из 3:</span>
                <p className="text-xs text-zinc-100 font-sans font-semibold">
                  «Какую роль в твоей программе выполняет условие if num % 2 == 0?»
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    токены: остаток, деление, четность
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-sans">
                Ученик отвечает в микрофон: <span className="text-zinc-100 font-mono">«Проверяет остаток от деления на два...»</span> — ИИ фиксирует попадание в токен `четность` и засчитывает ответ.
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 6: Teacher Dashboard & Class Management
    {
      id: 6,
      category: 'ПАНЕЛЬ ПРЕПОДАВАТЕЛЯ',
      tag: 'SLIDE // 06',
      title: 'Командный центр учителя',
      subtitle: 'Быстрое создание классов, зачисление по @никнеймам и контроль школы',
      canvaPrompt: {
        heading: 'Кабинет учителя: Полный контроль академического процесса',
        subheading: 'Управление классами 5–11 и мониторинг сдачи работ',
        points: [
          'Создание класса (буква, предмет, учебный год) за 30 секунд',
          'Зачисление учеников списком по @никнеймам без рутинных email-ов',
          'Автоматическая привязка школы: ученики наследуют школу преподавателя',
          'Сводная таблица успеваемости и просмотр видео/аудио протоколов защит'
        ],
        bentoBlocks: [
          { title: 'Зачисление', desc: 'Добавление учеников по никам за 1 клик', metric: '30 сек' },
          { title: 'Привязка школы', desc: 'Ученики автоматически прикрепляются к учебному заведению учителя', metric: 'Авто' },
          { title: 'Статистика', desc: 'Общий тепловой мониторинг рисков списывания', metric: '100%' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Users className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Зачисление по @никам</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Учитель просто вставляет список никнеймов (`@arman`, `@dias`). Система сама находит или создает профили без возни с почтами.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Автопривязка школы</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Школа учителя (например, НИШ ФМН г. Астана) мгновенно назначается всем зачисленным ученикам. Ученик не может изменить ее сам.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sliders className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Аналитика защит</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Преподаватель видит статус каждого ученика: кто сдал, у кого нерабочий код, кто прошел блиц с подтверждением авторства.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 font-mono text-xs flex items-center justify-between text-zinc-400">
            <span>Классы: 8 «А», 9 «Б», 10 «А» • Предмет: Информатика и Python</span>
            <span className="text-emerald-400 font-bold">TEACHER_HUB // ONLINE</span>
          </div>
        </div>
      )
    },

    // SLIDE 7: Student Space, Privacy & Unassigned Status
    {
      id: 7,
      category: 'ПРОСТРАНСТВО УЧЕНИКА',
      tag: 'SLIDE // 07',
      title: 'Кабинет ученика: фокус и приватность',
      subtitle: 'Статус «(пока не зачислен)», нейтральные безликие аватарки и защита персональных данных',
      canvaPrompt: {
        heading: 'Кабинет ученика: Безопасность и нейтральный интерфейс',
        subheading: 'Отсутствие утечек персональных данных и токсичности',
        points: [
          'Статус «(пока не зачислен)»: статус меняется только при добавлении учителем в класс',
          'Блокировка выбора школы: ученик не может самостоятельно приписывать чужое заведение',
          'Нейтральные безликие аватарки: удалены любые фото людей, используются DiceBear SVG',
          'Персонализированная лента заданий строго для своего класса'
        ],
        bentoBlocks: [
          { title: 'Статус зачисления', desc: '«(пока не зачислен)» защищает от подлога классов', metric: 'Strict' },
          { title: 'Безликие аватарки', desc: 'Векторные геометрические абстракции без реальных лиц', metric: 'Privacy' },
          { title: 'Школьный контур', desc: 'Ученик закреплен строго за школой своего учителя', metric: 'Lock' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase">Статус зачисления:</span>
                <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  (пока не зачислен)
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                До момента, пока преподаватель не зачислит ученика в класс, профиль находится в статусе ожидания. Это предотвращает отправку заданий не в свой класс.
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 font-sans">
                🔒 Выбор школы и смена класса для ученика заблокированы — это прерогатива учителя.
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase">Безопасность аватарок:</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  0% РЕАЛЬНЫХ ЛИЦ
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Платформа использует нейтральные детерминированные SVG-паттерны (DiceBear Shapes и Identicon). Никаких фотографий реальных людей и рисков буллинга.
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 font-sans">
                🛡️ Соответствие стандартам безопасности персональных данных несовершеннолетних.
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 8: Grade-Specific Easy Assignments (5-11)
    {
      id: 8,
      category: 'УЧЕБНАЯ ПРОГРАММА',
      tag: 'SLIDE // 08',
      title: 'Сквозная программа (5–11 классы)',
      subtitle: 'Легкие, калиброванные практические задания для каждого возраста с эталонами решений',
      canvaPrompt: {
        heading: 'Банк заданий: От 5 до 11 класса',
        subheading: 'Плавная кривая обучения от простого ввода к структурам данных',
        points: [
          '5–6 классы: Простой ввод/вывод данных и базовая арифметика',
          '7–8 классы: Ветвления if/else и простые циклы while/for',
          '9–10 классы: Работа со списками, поиск средних значений и палиндромы',
          '11 класс: Словари (dict) и подсчет частотности слов'
        ],
        bentoBlocks: [
          { title: '5–6 класс', desc: 'Приветствие и сумма чисел', metric: 'greeting.py' },
          { title: '7–8 класс', desc: 'Четность чисел и обратный отсчет', metric: 'even_odd.py' },
          { title: '9–10 класс', desc: 'Списки и проверка палиндрома', metric: 'palindrome.py' },
          { title: '11 класс', desc: 'Словари и частотный анализ текста', metric: 'frequency.py' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-bold">5–6 КЛАСС</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Ввод и вывод</div>
              <p className="text-[11px] text-zinc-400 font-sans">`input()`, `print()`, базовое сложение двух чисел.</p>
              <div className="text-[10px] text-zinc-500">greeting.py</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-bold">7–8 КЛАСС</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Условия и циклы</div>
              <p className="text-[11px] text-zinc-400 font-sans">Проверка четности `% 2`, циклы `for` и `while`.</p>
              <div className="text-[10px] text-zinc-500">even_odd.py</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-bold">9–10 КЛАСС</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Списки и функции</div>
              <p className="text-[11px] text-zinc-400 font-sans">Среднее арифметическое, срезы строк, палиндромы.</p>
              <div className="text-[10px] text-zinc-500">palindrome.py</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-bold">11 КЛАСС</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Словари и данные</div>
              <p className="text-[11px] text-zinc-400 font-sans">Частотный словарь слов, работа с парами ключ-значение.</p>
              <div className="text-[10px] text-zinc-500">frequency.py</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 font-sans">
            Ученик никогда не путается в чужих задачах: если он в 8 классе, в его дашборде отображается строго задание за 8 класс с эталоном учителя.
          </div>
        </div>
      )
    },

    // SLIDE 9: Metrics & Time Economy
    {
      id: 9,
      category: 'ЭКОНОМИКА ВРЕМЕНИ ШКОЛЫ',
      tag: 'SLIDE // 09',
      title: 'Метрики эффективности внедрения',
      subtitle: 'Радикальное сокращение рутины учителя и повышение объективности оценивания',
      canvaPrompt: {
        heading: 'Эффективность внедрения: Цифры и результаты',
        subheading: 'Экономия сотен часов преподавательского состава',
        points: [
          'Сокращение времени проверки на 90% (с 40 часов до 4 часов в месяц)',
          '100% охват устной защитой каждого ученика класса',
          'Полная юридическая прозрачность: запись ответов и оценка ИИ',
          'Рост осознанности: ученики перестают бездумно генерировать код в ChatGPT'
        ],
        bentoBlocks: [
          { title: 'Экономия времени', desc: 'Учитель освобождает до 36 часов в месяц от рутинного опроса', metric: '-90%' },
          { title: 'Охват защитами', desc: 'Каждый ученик персонально защищает свою работу', metric: '100%' },
          { title: 'Дисциплина', desc: 'Снижение числа бездумных копипастов из интернета', metric: '3.4x' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-3xl font-extrabold text-emerald-400">-90%</span>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Экономия времени</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                С 40 часов рутинного опроса до нескольких минут просмотра готовых отчетов в дашборде.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-3xl font-extrabold text-emerald-400">100%</span>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Охват защитой</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Каждый школьник обязательно проходит устный блиц. Невозможно «отсидеться» на последней парте.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-3xl font-extrabold text-emerald-400">3.4x</span>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Рост понимания</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Зная о 15-секундном блице, ученики разбираются в логике каждой написанной строки.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
            <span>Стандарт академической честности: NIS • РФМШ • Республиканские лицеи</span>
            <span className="font-bold">VERIFIED_PROTOCOL</span>
          </div>
        </div>
      )
    },

    // SLIDE 10: Vision & Roadmap
    {
      id: 10,
      category: 'ДОРОЖНАЯ КАРТА & ФИНАЛ',
      tag: 'SLIDE // 10',
      title: 'Будущее StudyMaxxing',
      subtitle: 'Масштабирование на всю систему школьного IT-образования Казахстана и СНГ',
      canvaPrompt: {
        heading: 'Будущее StudyMaxxing: Дорожная карта',
        subheading: 'План развития и масштабирования платформы',
        points: [
          'Q3 2026: Интеграция с Kundelik.kz и Bilimland для прямой выгрузки оценок',
          'Q4 2026: Поддержка олимпиадных языков C++ и JavaScript',
          '2027: Мобильное приложение для экспресс-защиты и офлайн-режим',
          'Готовность к пилотному внедрению в ведущих школах'
        ],
        bentoBlocks: [
          { title: 'Интеграция', desc: 'Бесшовная синхронизация с электронными журналами', metric: 'Kundelik' },
          { title: 'Языки', desc: 'Поддержка C++, Java, Web-технологий', metric: 'Multi-lang' },
          { title: 'Пилот', desc: 'Запуск в пилотных классах НИШ и РФМШ', metric: '2026' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold">ЭТАП I // Q3 2026</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Kundelik & Bilimland</div>
              <p className="text-zinc-400 font-sans leading-relaxed">
                Автоматическая выгрузка баллов за устную защиту напрямую в государственные электронные журналы.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold">ЭТАП II // Q4 2026</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Олимпиадный C++ & JS</div>
              <p className="text-zinc-400 font-sans leading-relaxed">
                Расширение анализатора кода для олимпиадников по информатике и веб-разработчиков.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold">ЭТАП III // 2027</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Мобильное приложение</div>
              <p className="text-zinc-400 font-sans leading-relaxed">
                Защита через микрофон смартфона прямо в школьном кабинете без необходимости отдельных гарнитур.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-zinc-100 font-sans">
                Готовы протестировать платформу в вашей школе?
              </h4>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Интерактивная защита уже доступна прямо в текущем интерфейсе StudyMaxxing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('teacher_dashboard')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition-all cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <span>Открыть панель учителя</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentSlideData = slides[currentSlide];

  const handleCopySlideText = (slideIdx: number) => {
    const s = slides[slideIdx];
    const text = `СЛАЙД ${s.id}: ${s.canvaPrompt.heading}\n\nПодзаголовок:\n${s.canvaPrompt.subheading}\n\nКлючевые пункты:\n${s.canvaPrompt.points.map((p) => `• ${p}`).join('\n')}\n\nБлоки (Bento Grid):\n${s.canvaPrompt.bentoBlocks.map((b) => `[${b.metric ? b.metric + ' | ' : ''}${b.title}]: ${b.desc}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedSlide(slideIdx);
    setTimeout(() => setCopiedSlide(null), 2000);
  };

  const handleCopyAllSlidesCanva = () => {
    const fullText = slides
      .map(
        (s) =>
          `========================================\nСЛАЙД ${s.id}: ${s.canvaPrompt.heading}\n========================================\nПодзаголовок:\n${s.canvaPrompt.subheading}\n\nКлючевые тезисы:\n${s.canvaPrompt.points.map((p) => `• ${p}`).join('\n')}\n\nБлоки карточек:\n${s.canvaPrompt.bentoBlocks.map((b) => `• [${b.metric || 'INFO'}] ${b.title}: ${b.desc}`).join('\n')}\n\n`
      )
      .join('\n');

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Slide Header Bar (non-printable in print mode) */}
      <header className="no-print h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between font-mono text-xs z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Вернуться на главную"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Выйти из режима слайдов</span>
          </button>
          <span className="text-zinc-600">|</span>
          <span className="font-bold text-zinc-200 tracking-wider">
            STUDYMAXXING_DECK.PPTX
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
            10 SLIDES // 16:9
          </span>
        </div>

        {/* Slide Controls */}
        <div className="flex items-center gap-2">
          {/* Canva Blueprint button */}
          <button
            onClick={() => setIsCanvaModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 text-purple-300 hover:text-purple-200 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Инструкция и тексты для вставки в Canva"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Тексты для Canva</span>
          </button>

          {/* Print / PDF Export */}
          <button
            onClick={() => window.print()}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Распечатать или сохранить как PDF"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Печать / PDF</span>
          </button>

          {/* Grid Overview button */}
          <button
            onClick={() => setIsGridOpen(!isGridOpen)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isGridOpen
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
            title="Сетка всех слайдов"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title="Полноэкранный режим (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Slide Canvas Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden relative">
        {/* Printable view (all 10 slides for print) */}
        <div className="hidden print:block w-full">
          {slides.map((s, idx) => (
            <div
              key={idx}
              className="p-12 mb-12 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-2xl page-break-after-always"
              style={{ pageBreakAfter: 'always', minHeight: '90vh' }}
            >
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6 font-mono text-xs text-zinc-400">
                <span>STUDYMAXXING // ORAL_DEFENSE_DECK</span>
                <span>СЛАЙД {s.id} / 10</span>
              </div>
              <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight mb-2">{s.title}</h2>
              <p className="text-sm text-zinc-400 mb-8">{s.subtitle}</p>
              {s.content}
            </div>
          ))}
        </div>

        {/* Interactive Single Slide Screen (non-print) */}
        <div className="print:hidden w-full max-w-[1240px] aspect-[16/9] max-h-[82vh] bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-200">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Top Meta */}
          <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-4 font-mono">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                {currentSlideData.category}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <button
                onClick={() => handleCopySlideText(currentSlide)}
                className="hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Скопировать текст этого слайда"
              >
                {copiedSlide === currentSlide ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSlide === currentSlide ? 'Скопировано' : 'Копировать'}</span>
              </button>
              <span>•</span>
              <span className="text-zinc-400 font-bold">{currentSlideData.tag}</span>
            </div>
          </div>

          {/* Slide Header: Title & Subtitle */}
          <div className="relative z-10 my-auto py-2">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-sans text-zinc-100 tracking-tight leading-tight">
                {currentSlideData.title}
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-zinc-400 font-sans max-w-3xl leading-relaxed">
                {currentSlideData.subtitle}
              </p>
            </div>

            {/* Slide Interactive Content */}
            <div className="relative z-10">{currentSlideData.content}</div>
          </div>

          {/* Slide Footer Info */}
          <div className="relative z-10 pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">STUDYMAXXING</span>
              <span>//</span>
              <span>ACADEMIC INTEGRITY ENGINE</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-300 font-bold">{String(currentSlide + 1).padStart(2, '0')}</span>
              <span>/</span>
              <span>{String(totalSlides).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Floating Navigation Bar */}
      <footer className="no-print h-16 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur px-4 sm:px-8 flex items-center justify-between font-mono z-30">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            currentSlide === 0
              ? 'opacity-30 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад (←)</span>
        </button>

        {/* Slide Progress Dots / Timeline */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 transition-all rounded-full cursor-pointer ${
                currentSlide === idx
                  ? 'w-7 sm:w-10 bg-emerald-400'
                  : 'w-2 sm:w-3 bg-zinc-800 hover:bg-zinc-600'
              }`}
              title={`Слайд ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            currentSlide === totalSlides - 1
              ? 'opacity-30 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Далее (→)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Grid Thumbnail Drawer / Modal */}
      {isGridOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-6 sm:p-10 flex flex-col justify-between animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100 font-sans">
                Сетка слайдов (10 слайдов)
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Нажмите на слайд для мгновенного перехода
              </p>
            </div>
            <button
              onClick={() => setIsGridOpen(false)}
              className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-y-auto py-6 my-auto">
            {slides.map((s, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentSlide(idx);
                  setIsGridOpen(false);
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  currentSlide === idx
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1.5">
                  <span className="font-bold text-emerald-400">СЛАЙД {s.id}</span>
                  <span>16:9</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-200 line-clamp-1 mb-1 font-sans">
                  {s.title}
                </h5>
                <p className="text-[10px] text-zinc-400 line-clamp-2 font-sans">
                  {s.subtitle}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center font-mono text-xs text-zinc-500 pt-2 border-t border-zinc-800">
            Нажмите ESC или выберите слайд
          </div>
        </div>
      )}

      {/* Canva Copy-Paste Guide Modal */}
      {isCanvaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Инструкция и готовые тексты для Canva (10 слайдов)
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    CANVA_BLUEPRINT // 100% MATCH DARK THEME (#09090b + emerald #10b981)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCanvaModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto my-4 space-y-4 pr-1 text-xs">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-300 font-mono space-y-1">
                <span className="font-bold block text-zinc-100 text-[11px] uppercase">
                  Цветовая палитра и шрифты для шаблона Canva:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
                  <div>Фон: <strong>#09090b</strong> (Zinc-950)</div>
                  <div>Карточки: <strong>#18181b</strong> (Zinc-900)</div>
                  <div>Акцент: <strong>#10b981</strong> (Emerald)</div>
                  <div>Шрифты: <strong>Inter / Geist / JetBrains Mono</strong></div>
                </div>
              </div>

              <div className="space-y-3 font-mono">
                {slides.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-[11px]">
                        СЛАЙД {s.id}: {s.canvaPrompt.heading}
                      </span>
                      <button
                        onClick={() => handleCopySlideText(s.id - 1)}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] cursor-pointer"
                      >
                        {copiedSlide === s.id - 1 ? 'Скопировано ✓' : 'Копировать'}
                      </button>
                    </div>
                    <div className="text-zinc-400 text-[11px] font-sans">
                      <strong>Подзаголовок:</strong> {s.canvaPrompt.subheading}
                    </div>
                    <div className="text-zinc-400 text-[10px] space-y-0.5">
                      <strong>Тезисы:</strong>
                      {s.canvaPrompt.points.map((p, pIdx) => (
                        <div key={pIdx}>• {p}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500">10 слайдов подготовлены для переноса</span>
              <button
                type="button"
                onClick={handleCopyAllSlidesCanva}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAll ? 'Все 10 слайдов скопированы!' : 'Скопировать все 10 слайдов'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
