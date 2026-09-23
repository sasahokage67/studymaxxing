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
  Download,
  Layers,
  Award,
  Zap,
  TrendingUp,
  Briefcase,
  GitBranch,
  Target,
  FileCheck,
  Cpu,
  Database
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
    // SLIDE 1: ТИТУЛЬНЫЙ / ОБЛОЖКА
    {
      id: 1,
      category: 'ОБЛОЖКА // PITCH DECK',
      tag: 'SLIDE // 01',
      title: 'StudyMaxxing',
      subtitle: 'Платформа автоматизированной устной ИИ-защиты школьного кода и контроля академической честности',
      canvaPrompt: {
        heading: 'StudyMaxxing: Устная ИИ-защита школьного кода',
        subheading: 'Платформа академической честности для школ 5–11 классов в эпоху нейросетей',
        points: [
          'Проблема: 87% школьников сдают сгенерированный ChatGPT код без понимания',
          'Решение: 15-секундный голосовой блиц у микрофона + AST-бенчмарк с эталоном учителя',
          'Стек: React 18, TypeScript, Tailwind CSS, Web Speech API, эвристический AI-движок v2.4',
          'Фокус: НИШ, РФМШ, общеобразовательные лицеи и IT-колледжи'
        ],
        bentoBlocks: [
          { title: 'Формат защиты', desc: '15-секундный голосовой блиц без времени на поиск', metric: '15 сек' },
          { title: 'Ложные штрафы', desc: 'Забытые скобки ")" и двоеточия ":" прощаются', metric: '0%' },
          { title: 'Статус платформы', desc: 'Рабочий веб-прототип с готовым кабинетом учителя и ученика', metric: 'PROD' }
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
              STARTUP PITCH DECK // 2026
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
                Ученик за 15 секунд вслух объясняет работу ключевых строк своего алгоритма. Времени подсмотреть в ChatGPT или чужую тетрадь нет.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">0%</span>
                <ShieldCheck className="w-5 h-5 text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-zinc-100 font-sans">Справедливый скоринг</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Нерабочий код штрафуется строго по доле недописанности, а случайные описки (двоеточия, закрывающие скобки) прощаются без занижений.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">5–11</span>
                <Layers className="w-5 h-5 text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-zinc-100 font-sans">Школьная программа</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Сквозной банк легких калиброванных задач от базового ввода-вывода (5 класс) до функций и частотных словарей (11 класс).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-xs flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Цель проекта: Вернуть смысл домашним заданиям по IT в школах Казахстана</span>
            </span>
            <span className="text-zinc-500">LIVE DEMO READY</span>
          </div>
        </div>
      )
    },

    // SLIDE 2: ПРОБЛЕМА
    {
      id: 2,
      category: 'ПРОБЛЕМА // PAIN POINT',
      tag: 'SLIDE // 02',
      title: 'Код пишут нейросети, а не ученики',
      subtitle: 'ChatGPT и Copilot обесценили традиционные ДЗ по программированию — учителя теряют контроль над знаниями',
      canvaPrompt: {
        heading: 'Проблема: Обесценивание домашних заданий по IT',
        subheading: 'Генеративный ИИ разрушил классическую систему проверки кода',
        points: [
          '87% школьников копируют готовые решения из нейросетей без понимания синтаксиса',
          'Текстовые антиплагиаты бесполезны: ИИ каждый раз переименовывает переменные',
          '40+ часов в месяц учитель тратит на ручной опрос 30 человек у доски',
          'Фиктивные отличники: формально код работает, но на контрольной знаний 0'
        ],
        bentoBlocks: [
          { title: 'Бездумный копипаст', desc: 'Ученики получают рабочий код за 5 секунд из нейросети', metric: '87%' },
          { title: 'Рутина учителя', desc: 'Учитель физически не успевает устно опросить каждого ученика', metric: '40ч/мес' },
          { title: 'Провал тестов', desc: 'Автотесты проверяют только ввод-вывод, не проверяя автора', metric: '0% защиты' }
        ]
      },
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-3">
              <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Тотальный читинг</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-zinc-100">87%</div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Школьников используют языковые модели для генерации решений. За 5 секунд промпта они получают 100% рабочий код без понимания логики.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Перегрузка учителей</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-zinc-100">40+ ч</div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                В месяц преподаватель информатики тратит на попытки индивидуально расспросить каждого ученика у экрана или доски.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Слепота автотестов</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-zinc-100">0% авторства</div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Существующие платформы проверяют только `stdout`. Если ChatGPT выдал верный ответ — система ставит «5», даже если ученик не знает `for`.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 font-bold font-mono text-lg">
              !
            </div>
            <div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Главная боль школы:</h5>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Оценка перестала отражать знания. Учитель не может доказать факт списывания, а ученик теряет мотивацию учиться писать код самостоятельно.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 3: НАШЕ РЕШЕНИЕ
    {
      id: 3,
      category: 'НАШЕ РЕШЕНИЕ // SOLUTION',
      tag: 'SLIDE // 03',
      title: 'StudyMaxxing: Двухконтурная верификация',
      subtitle: 'Мгновенная сверка кода с эталоном учителя + 15-секундный голосовой блиц у микрофона',
      canvaPrompt: {
        heading: 'Наше решение: Двухконтурная устная защита',
        subheading: 'Комплексный анализ кода и моментальная проверка понимания',
        points: [
          'Контур 1: Автоматический анализ кода и сверка с эталонным решением учителя',
          'Контур 2: Генерация 3 адресных вопросов по строкам кода ученика',
          'Контур 3: 15-секундный голосовой блиц с детекцией программных терминов',
          'Автоматический протокол защиты с объективной оценкой авторства'
        ],
        bentoBlocks: [
          { title: 'Контур I: Анализ кода', desc: 'Проверка структуры AST, статус нерабочего кода, прощение опечаток' },
          { title: 'Контур II: Генерация вопросов', desc: 'ИИ формулирует 3 каверзных вопроса именно по коду ученика' },
          { title: 'Контур III: Голосовой блиц', desc: 'Web Speech API распознает термины речи и фиксирует ответ за 15с' }
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
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Сверка с эталоном</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Сверка алгоритма со структурой преподавателя. Выявление нерабочего или недописанного кода, отсечение пустых файлов и аномалий ИИ.
              </p>
              <div className="p-2 rounded bg-zinc-950 font-mono text-[10px] text-zinc-400 border border-zinc-800/80">
                BENCHMARK // VERIFIED
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Adaptive Questions</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">3 прицельных вопроса</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                ИИ задает вопросы строго по сданному тексту: «Зачем в строке 4 условие `% 2 == 0`?», «Что произойдет, если список окажется пустым?».
              </p>
              <div className="p-2 rounded bg-zinc-950 font-mono text-[10px] text-zinc-400 border border-zinc-800/80">
                TARGETED_QUESTIONS // 3x
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>15s Speech Blitz</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Устный блиц-ответ</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Ученик отвечает в микрофон за 15 секунд. Браузер распознает терминологию и оценивает аргументированность в реальном времени.
              </p>
              <div className="p-2 rounded bg-zinc-950 font-mono text-[10px] text-emerald-400 border border-emerald-500/30">
                VOICE_VERDICT // 92% АВТОРСТВО
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Итог: 100% понимание того, сам ли ученик написал код или бездумно скопировал</span>
            </span>
            <span className="font-bold text-zinc-100">АВТОМАТИЗАЦИЯ</span>
          </div>
        </div>
      )
    },

    // SLIDE 4: КАК ЭТО РАБОТАЕТ
    {
      id: 4,
      category: 'КАК ЭТО РАБОТАЕТ // USER FLOW',
      tag: 'SLIDE // 04',
      title: 'Пайплайн защиты за 90 секунд',
      subtitle: 'Бесшовный путь от сдачи файла до итогового протокола с аудио-транскриптом',
      canvaPrompt: {
        heading: 'Пайплайн защиты: 4 шага за 90 секунд',
        subheading: 'Как устроен процесс прохождения устной защиты учеником',
        points: [
          'Шаг 1: Загрузка файла solution.py (или вставка кода в редактор)',
          'Шаг 2: Анализ ИИ за 1.5 секунды: сверка с эталоном учителя',
          'Шаг 3: 15-секундный голосовой блиц: 3 вопроса с микрофоном',
          'Шаг 4: Готовый цифровой протокол с оценкой и транскрипцией'
        ],
        bentoBlocks: [
          { title: '1. Загрузка', desc: 'Ученик выбирает файл с кодом решения', metric: 'Шаг 1' },
          { title: '2. Сверка', desc: 'Проверка кода на работоспособность и эталон', metric: 'Шаг 2' },
          { title: '3. Блиц 15с', desc: 'Ответ на 3 вопроса голосом в микрофон', metric: 'Шаг 3' },
          { title: '4. Протокол', desc: 'Итоговый балл и выгрузка отчета учителю', metric: 'Шаг 4' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-200">
                01
              </div>
              <h5 className="text-xs font-bold text-zinc-100 font-sans">Загрузка кода</h5>
              <p className="text-[11px] text-zinc-400 font-sans">
                Ученик загружает файл `solution.py` своего класса или редактирует прямо в браузере.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-200">
                02
              </div>
              <h5 className="text-xs font-bold text-zinc-100 font-sans">Мгновенный анализ</h5>
              <p className="text-[11px] text-zinc-400 font-sans">
                Система за 1.5 секунды сверяет решение с эталоном учителя и проверяет работоспособность.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono text-xs font-bold text-emerald-400">
                03
              </div>
              <h5 className="text-xs font-bold text-emerald-300 font-sans">15с Голосовой блиц</h5>
              <p className="text-[11px] text-zinc-300 font-sans">
                Ученик нажимает «Ответить» и за 15 секунд в микрофон поясняет свои строки кода.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-200">
                04
              </div>
              <h5 className="text-xs font-bold text-zinc-100 font-sans">Протокол защиты</h5>
              <p className="text-[11px] text-zinc-400 font-sans">
                Формируется отчет: оценка, совпадение токенов, транскрипт и вердикт учителю.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between font-mono text-xs text-zinc-300">
            <span>Общее время на 1 ученика: 90 секунд • Нагрузка на учителя: 0 минут</span>
            <span className="text-emerald-400 font-bold">100% AUTOMATED</span>
          </div>
        </div>
      )
    },

    // SLIDE 5: ТЕХНОЛОГИЧЕСКИЙ СТЕК
    {
      id: 5,
      category: 'ТЕХНОЛОГИЧЕСКИЙ СТЕК // TECH STACK',
      tag: 'SLIDE // 05',
      title: 'Современный клиентский стек без задержек',
      subtitle: 'Высокопроизводительная web-архитектура, работающая в реальном времени прямо в браузере',
      canvaPrompt: {
        heading: 'Технологический стек: Скорость и надежность',
        subheading: 'Легковесная архитектура без серверных задержек',
        points: [
          'Frontend: React 18, TypeScript, Vite — моментальная загрузка за 0.3 секунды',
          'UI & Design System: Tailwind CSS, Lucide Icons, кастомная темная тема (Zero Slop)',
          'Speech Engine: Browser Web Speech API с поддержкой русского и казахского языков',
          'AI Engine: Двухуровневый движок (эвристический локальный v2.4 + облачный Gemini Flash)'
        ],
        bentoBlocks: [
          { title: 'Frontend Core', desc: 'React 18 + TypeScript + Vite бандлер', metric: 'React 18' },
          { title: 'Voice Engine', desc: 'Web Speech API со словарем токенов Python', metric: 'Realtime' },
          { title: 'AI Scoring', desc: 'Локальный нейро-движок v2.4 + Gemini 1.5 Cloud', metric: 'Hybrid AI' },
          { title: 'Design System', desc: 'Tailwind CSS, JetBrains Mono, Dark Mode (#09090b)', metric: 'Zero Slop' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Code2 className="w-4 h-4" />
                <span className="font-bold text-[11px]">FRONTEND CORE</span>
              </div>
              <div className="font-bold text-zinc-100 font-sans text-sm">React 18 & TS</div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Строгая типизация всех сущностей (User, Submission, Class), сборка Vite v5.4.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Mic className="w-4 h-4" />
                <span className="font-bold text-[11px]">VOICE ENGINE</span>
              </div>
              <div className="font-bold text-zinc-100 font-sans text-sm">Web Speech API</div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Прямая работа с аудио-потоком микрофона без отправки тяжелых WAV-файлов на сервер.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Cpu className="w-4 h-4" />
                <span className="font-bold text-[11px]">AI SCORING</span>
              </div>
              <div className="font-bold text-zinc-100 font-sans text-sm">Hybrid Engine v2.4</div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Мгновенный эвристический анализ + глубокая калибровка ответа с отсечением обмана.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Database className="w-4 h-4" />
                <span className="font-bold text-[11px]">PRIVACY & DATA</span>
              </div>
              <div className="font-bold text-zinc-100 font-sans text-sm">Zero Data Leak</div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Абстрактные SVG-аватарки DiceBear, отсутствие фотографий лиц и конфиденциальность.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Production Bundle: 449 kB JS • 35 kB CSS • Скорость загрузки: &lt; 0.3s</span>
            <span className="text-emerald-400 font-bold">OPTIMIZED BUILD</span>
          </div>
        </div>
      )
    },

    // SLIDE 6: НАШИ ПРЕИМУЩЕСТВА / УТП
    {
      id: 6,
      category: 'ПРЕИМУЩЕСТВА // UNIQUE VALUE',
      tag: 'SLIDE // 06',
      title: 'Ключевые преимущества и УТП',
      subtitle: 'Уникальные инженерные механизмы, которые решают проблему списывания на корню',
      canvaPrompt: {
        heading: 'Наши преимущества: Почему StudyMaxxing побеждает',
        subheading: 'Уникальные фичи, которых нет в классических школьных платформах',
        points: [
          '15-секундный таймер: исключает возможность параллельного гугления или чтения шпаргалок',
          'Толерантность к опечаткам: случайные скобки ")" и двоеточия ":" не режут оценку',
          'Статус «КОД НЕРАБОЧИЙ»: моментальный детект недописанного кода со справедливым штрафом',
          'Зачисление по @никам: добавление класса за 30 секунд без рутинных email'
        ],
        bentoBlocks: [
          { title: '15с Анти-чит', desc: 'Невозможно успеть зайти в ChatGPT за 15 секунд ответа', metric: '15 сек' },
          { title: 'Честный скоринг', desc: 'Прощение механических опечаток при защите алгоритма', metric: 'Fair' },
          { title: 'Быстрый старт', desc: 'Учитель добавляет класс по никнеймам за 1 клик', metric: '30 сек' },
          { title: 'Приватность', desc: '0% человеческих лиц на платформе — нейтральные SVG', metric: '100%' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <Zap className="w-4 h-4" />
                <span>15-СЕКУНДНЫЙ АНТИ-ЧИТ</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Лимит времени убивает шпаргалки</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Если ученик не писал код сам, за 15 секунд он не успеет прочитать текст вопроса, вставить его во второй монитор и прочитать ответ.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>ТОЛЕРАНТНОСТЬ К ОПЕЧАТКАМ</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Оцениваем ум, а не случайности</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Случайно забытая скобка `)` или двоеточие `:` в конце `if` прощаются (88–95% зачет). Мы не наказываем детей за мелкие описки.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>ДЕТЕКТ НЕРАБОЧЕГО КОДА</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">Статус «КОД НЕРАБОЧИЙ»</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Если ученик сдал пустой файл или недописанный фрагмент — система снижает процент пропорционально нехватке ключевых конструкций.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <Users className="w-4 h-4" />
                <span>ЗАЧИСЛЕНИЕ ПО @НИКАМ</span>
              </div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">0 рутины для преподавателя</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Учитель просто вставляет `@arman, @dias`. Ученики мгновенно закрепляются за классом и школой без ручной регистрации почт.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 7: РЫНОК И ЦЕЛЕВАЯ АУДИТОРИЯ
    {
      id: 7,
      category: 'РЫНОК & АУДИТОРИЯ // MARKET',
      tag: 'SLIDE // 07',
      title: 'Рынок школ и IT-образования',
      subtitle: 'Огромный спрос со стороны передовых школ Казахстана и СНГ на решения контроля честности',
      canvaPrompt: {
        heading: 'Рынок и аудитория: Казахстан и СНГ',
        subheading: 'Целевые сегменты образовательных учреждений',
        points: [
          'TAM: 7 500+ школ Казахстана и 100 000+ школ СНГ (EdTech объем $1.2B)',
          'SAM: 300+ флагманских лицеев (НИШ, РФМШ, БИЛ) с углубленной информатикой',
          'SOM: 25 пилотных школ в первый учебный год (5 000+ учеников)',
          'Целевая аудитория: Учителя информатики, завучи по цифровизации, директора лицеев'
        ],
        bentoBlocks: [
          { title: 'TAM (Общий рынок)', desc: 'Все общеобразовательные школы Казахстана и СНГ', metric: '7 500+ школ' },
          { title: 'SAM (Целевой рынок)', desc: 'Флагманские лицеи: НИШ, РФМШ, БИЛ, IT-лицеи', metric: '300+ школ' },
          { title: 'SOM (Первый год)', desc: 'Пилотные классы и лицеи Астаны и Алматы', metric: '25 школ' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-500 uppercase">TAM // Весь рынок</span>
              <div className="text-3xl font-extrabold text-zinc-100">7 500+</div>
              <h5 className="text-sm font-bold text-zinc-200 font-sans">Школ Казахстана</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Более 3.8 млн школьников, изучающих базовую и углубленную информатику.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs text-emerald-400 uppercase font-bold">SAM // Наш сегмент</span>
              <div className="text-3xl font-extrabold text-emerald-400">300+</div>
              <h5 className="text-sm font-bold text-zinc-200 font-sans">Флагманские лицеи</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Сеть НИШ, РФМШ, БИЛ, лицеи «Дарын» и гимназии с повышенными требованиями к честности.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-500 uppercase">SOM // Год 1</span>
              <div className="text-3xl font-extrabold text-zinc-100">25 школ</div>
              <h5 className="text-sm font-bold text-zinc-200 font-sans">Пилотный запуск</h5>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                5 000+ учеников, 80 преподавателей в Астане, Алматы и Шымкенте.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-300">
            <span>Пользователи: Учителя информатики (B2B/B2G) • Конечные бенефициары: Школьники 5–11 классов</span>
            <span className="text-emerald-400 font-bold">HIGH DEMAND</span>
          </div>
        </div>
      )
    },

    // SLIDE 8: БИЗНЕС-МОДЕЛЬ И МОНЕТИЗАЦИЯ
    {
      id: 8,
      category: 'БИЗНЕС-МОДЕЛЬ // BUSINESS MODEL',
      tag: 'SLIDE // 08',
      title: 'B2B SaaS-подписка для школ',
      subtitle: 'Прозрачная модель: бесплатный вход для учителей и институциональная школьная лицензия',
      canvaPrompt: {
        heading: 'Бизнес-модель: Монетизация и тарифы',
        subheading: 'Виральный рост снизу вверх (Product-Led Growth)',
        points: [
          'Teacher Free: Бесплатный базовый тариф на 1 класс для любого учителя (виральный старт)',
          'School Pro License: $150–$300 в месяц на всю школу (неограниченные классы и аналитика)',
          'District / Enterprise: Контракты с управлениями образования и интеграция с Kundelik.kz',
          'Экономика: низкий CAC за счет сарафанного радио в учительских чатах'
        ],
        bentoBlocks: [
          { title: 'Free Teacher', desc: '1 класс бесплатно навсегда для тестирования учителем', metric: '$0' },
          { title: 'School License', desc: 'Школьная годовая лицензия с неограниченным доступом', metric: '$150/мес' },
          { title: 'Regional Contract', desc: 'Интеграция на уровне области / города под ключ', metric: 'B2G' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">PLG / ВХОДНОЙ БИЛЕТ</span>
              <div className="text-2xl font-extrabold text-zinc-100">$0</div>
              <h5 className="text-sm font-bold text-zinc-200 font-sans">Teacher Free</h5>
              <p className="text-zinc-400 font-sans leading-relaxed">
                1 класс до 25 учеников бесплатно. Учитель пробует сервис на одном уроке и становится амбассадором в школе.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">ОСНОВНОЙ ДОХОД</span>
              <div className="text-2xl font-extrabold text-emerald-400">$150–300<span className="text-xs text-zinc-400">/мес</span></div>
              <h5 className="text-sm font-bold text-zinc-100 font-sans">School Pro</h5>
              <p className="text-zinc-300 font-sans leading-relaxed">
                Подписка на всё учебное заведение. Все классы 5–11, сводный дашборд завуча, архив аудио-ответов и брендирование.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase">КОРПОРАТИВНЫЙ B2G</span>
              <div className="text-2xl font-extrabold text-zinc-100">Контракт</div>
              <h5 className="text-sm font-bold text-zinc-200 font-sans">District / Regional</h5>
              <p className="text-zinc-400 font-sans leading-relaxed">
                Интеграция с городскими системами, электронными дневниками (Kundelik), выделенный защищенный сервер в РК.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>Модель PLG: Учитель находит платформу сам -&gt; школа покупает лицензию</span>
            <span className="text-emerald-400 font-bold">HIGH LTV / LOW CAC</span>
          </div>
        </div>
      )
    },

    // SLIDE 9: КОНКУРЕНТНЫЙ АНАЛИЗ
    {
      id: 9,
      category: 'КОНКУРЕНТНЫЙ АНАЛИЗ // COMPARISON',
      tag: 'SLIDE // 09',
      title: 'Сравнение с существующими решениями',
      subtitle: 'Ни одна платформа на рынке не решает проблему авторства через голосовую защиту',
      canvaPrompt: {
        heading: 'Конкурентный анализ: Почему мы вне конкуренции',
        subheading: 'Сравнение со стандартными LMS и тестирующими системами',
        points: [
          'Яндекс.Учебник / Stepik: Только автотесты. Решаются копированием промпта в ChatGPT за 5 секунд.',
          'Google Classroom / Moodle: Обычное файлохранилище. Ноль автоматизации устного опроса.',
          'Антиплагиат: Текстовый анализ. Бессилен против уникальных промптов и другого стиля нейросети.',
          'StudyMaxxing: Единственная система, объединяющая автопроверку и устный 15-секундный блиц.'
        ],
        bentoBlocks: [
          { title: 'Stepik / Яндекс', desc: 'Только автотесты. Списывание из ChatGPT 100%', metric: 'Автотесты' },
          { title: 'Moodle / Классрум', desc: 'Хранилище файлов. 0% проверки авторства', metric: 'Хранилище' },
          { title: 'StudyMaxxing', desc: 'Сверка кода + 15с устный блиц + распознавание речи', metric: 'Winner' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border border-zinc-800 rounded-xl overflow-hidden">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Критерий оценки</th>
                  <th className="py-2.5 px-3 text-zinc-400">Stepik / Яндекс</th>
                  <th className="py-2.5 px-3 text-zinc-400">Google Classroom</th>
                  <th className="py-2.5 px-3 text-emerald-400 font-bold">StudyMaxxing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950/60 font-sans text-xs">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-200">Защита от ChatGPT / LLM</td>
                  <td className="py-2.5 px-3 text-red-400">❌ 0% (легко обойти)</td>
                  <td className="py-2.5 px-3 text-red-400">❌ Нет защиты</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">✅ 15с голосовой блиц</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-200">Устное объяснение кода</td>
                  <td className="py-2.5 px-3 text-zinc-500">Отсутствует</td>
                  <td className="py-2.5 px-3 text-zinc-500">Только вручную у доски</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">✅ Web Speech API</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-200">Толерантность к опечаткам</td>
                  <td className="py-2.5 px-3 text-red-400">❌ Ошибка компиляции</td>
                  <td className="py-2.5 px-3 text-zinc-500">На усмотрение</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">✅ Прощение скобок/двоеточий</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-200">Экономия времени учителя</td>
                  <td className="py-2.5 px-3 text-zinc-300">Частичная</td>
                  <td className="py-2.5 px-3 text-red-400">0% (ручная проверка)</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">✅ -90% времени опроса</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>StudyMaxxing создает новую категорию: Oral Code Defense (Устная защита кода)</span>
            <span className="text-emerald-400 font-bold">FIRST IN CLASS</span>
          </div>
        </div>
      )
    },

    // SLIDE 10: БУДУЩЕЕ И ДОРОЖНАЯ КАРТА
    {
      id: 10,
      category: 'БУДУЩЕЕ // ROADMAP & VISION',
      tag: 'SLIDE // 10',
      title: 'Будущее StudyMaxxing: 2026–2027',
      subtitle: 'От пилотов в лицеях к единому республиканскому стандарту сдачи IT-заданий',
      canvaPrompt: {
        heading: 'Дорожная карта: Будущее StudyMaxxing',
        subheading: 'План масштабирования и стратегические вехи',
        points: [
          'Q3 2026: Официальная интеграция с электронными журналами Kundelik.kz и Bilimland',
          'Q4 2026: Поддержка C++, Java, JavaScript и олимпиадной информатики',
          'Q1 2027: Мобильное приложение StudyMaxxing Voice для защиты со смартфона',
          'Команда: Senior Full-Stack инженер и ведущие методисты олимпиадного программирования'
        ],
        bentoBlocks: [
          { title: 'Q3 2026', desc: 'Автовыгрузка оценок в Kundelik.kz', metric: 'Журналы' },
          { title: 'Q4 2026', desc: 'Олимпиадный модуль C++ и алгоритмы', metric: 'C++ / JS' },
          { title: '2027', desc: 'Мобильный клиент экспресс-защиты', metric: 'Mobile' }
        ]
      },
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">ЭТАП I // Q3 2026</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Kundelik.kz & Bilimland</div>
              <p className="text-zinc-400 font-sans leading-relaxed">
                Прямая синхронизация с государственными журналами: оценка за устную защиту сразу попадает в ведомость.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">ЭТАП II // Q4 2026</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">Олимпиадный C++ & JS</div>
              <p className="text-zinc-400 font-sans leading-relaxed">
                Расширение анализатора для олимпиадников и студентов колледжей (поддержка C++, Java, Web-технологий).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">ЭТАП III // 2027</span>
              <div className="font-bold text-zinc-100 font-sans text-sm">StudyMaxxing Voice App</div>
              <p className="text-zinc-400 font-sans leading-relaxed">
                Нативное мобильное приложение: ученик защищает задание прямо с телефона за партой без гарнитуры.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-zinc-100 font-sans">
                Автоматизируйте академическую честность уже сегодня
              </h4>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Платформа развернута и готова к пилотному запуску в вашей школе.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('teacher_dashboard')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition-all cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <span>Открыть платформу</span>
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
            STUDYMAXXING_PITCH_DECK.PPTX
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
            10 SLIDES // CANONICAL PITCH
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

          {/* Download ready PDF */}
          <a
            href="/StudyMaxxing_Pitch_Deck.pdf"
            download="StudyMaxxing_Pitch_Deck.pdf"
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
            title="Скачать готовый PDF файл презентации"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Скачать PDF</span>
          </a>

          {/* Print / PDF Export */}
          <button
            onClick={() => window.print()}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Распечатать или сохранить как PDF"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Печать</span>
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
                <span>STUDYMAXXING // PITCH_DECK</span>
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
              <span>STARTUP PITCH DECK</span>
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
                  <span>{s.category.split('//')[0].trim()}</span>
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
                    Структура Pitch Deck для Canva (10 слайдов)
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    CANVA_PITCH_DECK // ТЕМА, ПРОБЛЕМА, РЕШЕНИЕ, ТЕХСТЕК, БИЗНЕС-МОДЕЛЬ, БУДУЩЕЕ
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
                  Цветовая палитра и шрифты для Canva:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
                  <div>Фон: <strong>#09090b</strong> (Zinc-950)</div>
                  <div>Карточки: <strong>#18181b</strong> (Zinc-900)</div>
                  <div>Акцент: <strong>#10b981</strong> (Emerald)</div>
                  <div>Шрифты: <strong>Inter / Space Grotesk / JetBrains Mono</strong></div>
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
              <span className="text-zinc-500">10 слайдов Pitch Deck подготовлены</span>
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
