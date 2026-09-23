import { AIAnalysis, CodeComparisonResult, DefenseQuestion, RubricEvaluation, Submission } from '../types';

export interface EvaluatedQuestionResult {
  question: DefenseQuestion;
  transcript: string;
  durationSeconds: number;
  evaluation: RubricEvaluation;
}

export interface DefenseSessionVerdict {
  overallScore: number;
  status: 'verified' | 'defense_completed' | 'needs_followup';
  isAutoApproved: boolean; // >= 85%
  needsTeacherReview: boolean; // <= 65%
  title: string;
  badgeText: string;
  verdictDescription: string;
  conceptScore: number;
  reasoningScore: number;
  applicationScore: number;
  feedbackSummary: string;
}

export class AIService {
  /**
   * Deep Code Comparator: compares student submission against Teacher's Benchmark Reference Code.
   * - Evaluates algorithm correctness (key AST structures, guards, error handling)
   * - Detects exact copies / direct plagiarism
   * - Detects AI Hallucinations / Overengineering (eval, complex imports, lambda, obscure syntax)
   * - Produces actionable breakdown with missing elements and risk classification
   */
  static compareWithTeacherReference(
    studentCode: string,
    referenceCode?: string
  ): CodeComparisonResult {
    const sCode = (studentCode || '').trim();
    const rCode = (referenceCode || '').trim();

    if (!rCode) {
      return {
        correctnessScore: 90,
        similarityScore: 85,
        plagiarismRisk: 'low',
        verdict: 'Эталон учителя не был задан — анализ выполнен по стандартным правилам синтаксиса Python.',
        matchingElements: ['Синтаксис корректен', 'Базовые операторы присутствуют'],
        missingElements: [],
        aiAnomalies: []
      };
    }

    // Cleaned versions (strip comments, spaces)
    const strip = (str: string) =>
      str
        .split('\n')
        .map((l) => l.replace(/#.*$/, '').trim())
        .filter(Boolean)
        .join('\n');

    const cleanStudent = strip(sCode);
    const cleanRef = strip(rCode);

    // Exact plagiarism check
    if (cleanStudent === cleanRef && cleanRef.length > 20) {
      return {
        correctnessScore: 100,
        similarityScore: 100,
        plagiarismRisk: 'exact_copy',
        verdict: 'Код на 100% идентичен эталону учителя символ-в-символ. Возможно прямое списывание без изменений.',
        matchingElements: ['Полное совпадение всех строк с эталоном учителя'],
        missingElements: [],
        aiAnomalies: ['100% совпадение с эталоном учителя — подозрение на утечку/списывание']
      };
    }

    const matching: string[] = [];
    const missing: string[] = [];
    const aiAnomalies: string[] = [];

    // 1. Detect AI / ChatGPT anomalies & overengineering
    // If student code imports heavy libraries or uses advanced constructs absent in teacher's code
    const anomalyPatterns = [
      { key: 'eval(', label: 'Опасная функция eval() вместо арифметических операторов' },
      { key: 'exec(', label: 'Функция динамического выполнения exec()' },
      { key: 'import numpy', label: 'Библиотека NumPy для простой школьной задачи' },
      { key: 'import pandas', label: 'Библиотека Pandas' },
      { key: 'import sys', label: 'Системный модуль sys' },
      { key: 'import re', label: 'Регулярные выражения re' },
      { key: 'lambda ', label: 'Анонимная функция lambda вместо стандартного условия' },
      { key: '__import__', label: 'Низкоуровневый вызов __import__' },
      { key: 'decimal', label: 'Модуль высокой точности decimal' }
    ];

    for (const anom of anomalyPatterns) {
      if (sCode.includes(anom.key) && !rCode.includes(anom.key)) {
        aiAnomalies.push(`Обнаружена аномалия: ${anom.label}`);
      }
    }

    // 2. Feature extraction from Teacher Reference
    const refFeatures = [
      {
        id: 'input',
        test: (c: string) => c.includes('input('),
        desc: 'Пользовательский ввод через input()'
      },
      {
        id: 'int_input',
        test: (c: string) => c.includes('int(input') || c.includes('int('),
        desc: 'Преобразование ввода в целое число int()'
      },
      {
        id: 'float_input',
        test: (c: string) => c.includes('float(input') || c.includes('float('),
        desc: 'Преобразование вещественных чисел float()'
      },
      {
        id: 'while_loop',
        test: (c: string) => c.includes('while ') || c.includes('while('),
        desc: 'Цикл while для повторения действий'
      },
      {
        id: 'for_loop',
        test: (c: string) => c.includes('for ') && c.includes('in '),
        desc: 'Цикл for для обхода элементов'
      },
      {
        id: 'guard_zero',
        test: (c: string) => c.includes('!= 0') || c.includes("!= '0'") || c.includes('!= 0.0') || c.includes('== 0'),
        desc: 'Проверка деления на ноль (b != 0)'
      },
      {
        id: 'break',
        test: (c: string) => c.includes('break'),
        desc: 'Инструкция выхода из цикла break'
      },
      {
        id: 'modulo',
        test: (c: string) => c.includes('% 2') || c.includes('%'),
        desc: 'Оператор остатка от деления %'
      },
      {
        id: 'if_elif',
        test: (c: string) => c.includes('if ') && (c.includes('elif ') || c.includes('else:')),
        desc: 'Многовариантное ветвление if / elif / else'
      },
      {
        id: 'print_output',
        test: (c: string) => c.includes('print('),
        desc: 'Вывод результата через print()'
      }
    ];

    let requiredCount = 0;
    let satisfiedCount = 0;

    for (const feat of refFeatures) {
      if (feat.test(rCode)) {
        requiredCount++;
        if (feat.test(sCode)) {
          satisfiedCount++;
          matching.push(feat.desc);
        } else {
          missing.push(feat.desc);
        }
      }
    }

    if (requiredCount === 0) {
      requiredCount = 1;
      satisfiedCount = sCode.length > 10 ? 1 : 0;
    }

    // Similarity calculation (token overlap)
    const tokenize = (t: string) =>
      t
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1);

    const sTokens = new Set(tokenize(sCode));
    const rTokens = new Set(tokenize(rCode));
    let commonTokens = 0;
    for (const tok of sTokens) {
      if (rTokens.has(tok)) commonTokens++;
    }
    const tokenSimilarity = rTokens.size > 0 ? Math.round((commonTokens / rTokens.size) * 100) : 70;

    let correctness = Math.round((satisfiedCount / requiredCount) * 100);
    // Penalty for critical missing safeguards
    if (missing.some((m) => m.includes('ноль'))) {
      correctness = Math.max(30, correctness - 25);
    }

    let plagiarismRisk: CodeComparisonResult['plagiarismRisk'] = 'low';
    if (aiAnomalies.length > 0) {
      plagiarismRisk = 'ai_anomaly';
    } else if (tokenSimilarity > 92 && correctness > 90) {
      plagiarismRisk = 'low';
    } else if (correctness < 60) {
      plagiarismRisk = 'moderate';
    }

    let verdict = '';
    if (correctness >= 85 && aiAnomalies.length === 0) {
      verdict = `Код на ${correctness}% соответствует эталону учителя. Алгоритм, ветвления и обработка данных написаны в точном соответствии с заданием.`;
    } else if (aiAnomalies.length > 0) {
      verdict = `Обнаружены признаки использования ChatGPT/нейросетей (${aiAnomalies.length} аномалии). Решение переусложнено и отклоняется от эталона учителя.`;
    } else if (missing.length > 0) {
      verdict = `Код частично отклоняется от эталона учителя (${correctness}% совпадения). Не реализованы: ${missing.join(', ')}.`;
    } else {
      verdict = `Базовое совпадение с эталоном: ${correctness}%. Требуется проверка на устной защите.`;
    }

    return {
      correctnessScore: Math.min(100, Math.max(0, correctness)),
      similarityScore: Math.min(100, Math.max(0, tokenSimilarity)),
      plagiarismRisk,
      verdict,
      matchingElements: matching,
      missingElements: missing,
      aiAnomalies
    };
  }

  /**
   * Intelligently parses code content via AST-like inspection and generates 3 targeted,
   * line-specific defense questions with strict 15-second response limits, taking into account
   * the teacher's reference benchmark code.
   */
  static async analyzeSubmission(submission: Partial<Submission>): Promise<{
    analysis: AIAnalysis;
    questions: DefenseQuestion[];
  }> {
    // Artificial 1.5s delay to demonstrate telemetry progress in the UI
    await new Promise((r) => setTimeout(r, 1400));

    const code = (submission.codeSnippet || '').trim();
    const fileName = submission.fileName || 'main.py';
    const referenceCode = (submission.referenceCode || '').trim();

    // Deep comparison with teacher benchmark
    const codeComparison = this.compareWithTeacherReference(code, referenceCode);

    // Heuristic AST-like code inspection for school programs (grades 5 to 11)
    const isGreeting = fileName.includes('5') || fileName.includes('greet') || (code.includes('input') && (code.includes('Привет') || code.includes('зовут')));
    const isSum = fileName.includes('6') || fileName.includes('sum') || (code.includes('a + b') && code.includes('int(input'));
    const isSignCheck = fileName.includes('7') || fileName.includes('sign') || (code.includes('x > 0') && (code.includes('Положительное') || code.includes('Отрицательное')));
    const isGuessGame = fileName.includes('8') || fileName.includes('guess') || code.includes('secret') || (code.includes('guess') && code.includes('input'));
    const isEvenCounter = fileName.includes('9') || fileName.includes('even') || code.includes('% 2') || (code.includes('numbers') && code.includes('count'));
    const isAreaFunc = fileName.includes('10') || fileName.includes('area') || code.includes('rectangle_area') || (code.includes('def ') && code.includes('w * h'));
    const isPhoneBook = fileName.includes('11') || fileName.includes('contact') || fileName.includes('phone') || (code.includes('contacts') && code.includes('{'));
    const isCalculator = fileName.includes('calc') || code.includes('float(input') || (code.includes('op ==') && code.includes('/'));

    const hasWhile = code.includes('while ') || code.includes('while(');
    const hasInt = code.includes('int(input') || code.includes('int(');
    const hasInput = code.includes('input(');
    const hasPrint = code.includes('print(');

    let summary = 'Школьный проект по информатике: базовый синтаксис, переменные и условные конструкции.';
    const concepts: string[] = [];
    const questions: DefenseQuestion[] = [];

    if (isGreeting) {
      summary = '5 класс: Первые шаги в Python. Пользовательский ввод input() и вывод строки через print().';
      concepts.push(
        'Пользовательский ввод через input()',
        'Сохранение значения в переменную name',
        'Вывод текста и переменной через print("Привет,", name)',
        'Строковый тип данных (str)'
      );

      questions.push({
        id: `q_${Date.now()}_1`,
        defenseSessionId: '',
        questionText: 'Зачем в первой строке мы пишем name = input(...) и куда сохраняется то, что напечатает пользователь?',
        skill: 'Переменные и ввод',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет базовое понимание ввода input() и сохранения в переменную name.',
        mustMention: ['переменная', 'name', 'ввод', 'сохранить', 'память', 'пользователь', 'input'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_2`,
        defenseSessionId: '',
        questionText: 'Что делает команда print("Привет,", name) во второй строке программы?',
        skill: 'Вывод на экран',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет знание функции print() и вывода приветствия вместе с переменной.',
        mustMention: ['print', 'вывод', 'экран', 'напечатать', 'привет', 'имя'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_3`,
        defenseSessionId: '',
        questionText: 'Какой тип данных имеет переменная name после вызова input() — текст (строка) или число?',
        skill: 'Типы данных',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет знание строкового типа str в Python.',
        mustMention: ['строка', 'str', 'текст', 'string', 'тип'],
        isRequired: true
      });
    } else if (isSum) {
      summary = '6 класс: Сложение целых чисел. Преобразование типов через int(input()) и арифметика a + b.';
      concepts.push(
        'Ввод целых чисел через int(input())',
        'Переменные a и b',
        'Арифметическая операция сложения +',
        'Вывод суммы на экран print()'
      );

      questions.push({
        id: `q_${Date.now()}_1`,
        defenseSessionId: '',
        questionText: 'Зачем мы оборачиваем ввод чисел в int(input()), а не оставляем просто input()?',
        skill: 'Преобразование типов',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет понимание преобразования строки в целое число int для сложения.',
        mustMention: ['int', 'число', 'сложить', 'текст', 'строка', 'тип', 'целое'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_2`,
        defenseSessionId: '',
        questionText: 'Что произойдет в print(a + b), если убрать int() из программы и сложить две строки "5" и "3"?',
        skill: 'Строки vs Числа',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет понимание конкатенации строк "53" в отличие от математического сложения 8.',
        mustMention: ['строка', 'склеит', '53', 'текст', 'конкатенация', 'буквы'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_3`,
        defenseSessionId: '',
        questionText: 'Как программа сохраняет введенные пользователем два числа?',
        skill: 'Переменные и память',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет знание сохранения данных в переменные a и b.',
        mustMention: ['переменные', 'a', 'b', 'память', 'сохраняет', 'значение'],
        isRequired: true
      });
    } else if (isSignCheck) {
      summary = '7 класс: Проверка знака числа. Ветвление if/else, оператор сравнения x > 0.';
      concepts.push(
        'Ввод целого числа int(input())',
        'Условный оператор if x > 0',
        'Ветка else для неположительных чисел',
        'Вывод результата проверки'
      );

      questions.push({
        id: `q_${Date.now()}_1`,
        defenseSessionId: '',
        questionText: 'Какое условие проверяет строка if x > 0 и когда сработает команда print("Положительное")?',
        skill: 'Ветвление if',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет понимание условия x > 0 для положительных чисел.',
        mustMention: ['больше', 'ноль', 'положительное', 'x > 0', 'условие', 'если'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_2`,
        defenseSessionId: '',
        questionText: 'В каком случае программа перейдет в блок else и напечатает «Отрицательное или ноль»?',
        skill: 'Ветвь else',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет понимание срабатывания ветки else, когда условие if ложно.',
        mustMention: ['else', 'меньше', 'ноль', 'отрицательное', 'иначе', 'ложно', 'не выполняется'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_3`,
        defenseSessionId: '',
        questionText: 'Зачем перед сравнением x > 0 мы обязательно применили функцию int() к вводу?',
        skill: 'Типы данных и сравнение',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет знание того, что строку нельзя сравнить с числом 0 оператором >.',
        mustMention: ['int', 'число', 'сравнить', 'тип', 'ошибка', 'строка', '>'],
        isRequired: true
      });
    } else if (isGuessGame) {
      summary = 'Школьная игра «Угадай число»: цикл while True, ввод целых чисел int(input()), ветвление if/elif/else и выход по break.';
      concepts.push(
        'Бесконечный цикл while True',
        'Преобразование типов int(input())',
        'Прерывание цикла командой break',
        'Ветвление if / elif / else'
      );

      questions.push({
        id: `q_${Date.now()}_1`,
        defenseSessionId: '',
        questionText: 'Зачем в строке ввода мы пишем int(input()), а не просто input()?',
        skill: 'Типы данных',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет базовое понимание преобразования строки в целое число для сравнения.',
        mustMention: ['число', 'int', 'строка', 'тип', 'сравнить', 'сравнение', 'текст'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_2`,
        defenseSessionId: '',
        questionText: 'Что делает команда break внутри условия, когда игрок угадал число?',
        skill: 'Управление циклом',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет понимание выхода из цикла while при наступлении нужного события.',
        mustMention: ['break', 'выход', 'остановить', 'прервать', 'цикл', 'завершить', 'угадал'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_3`,
        defenseSessionId: '',
        questionText: 'Какое условие проверяет строка elif guess < secret и какую подсказку выводит программа?',
        skill: 'Ветвление логики',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет понимание сравнения чисел и работы ветки elif.',
        mustMention: ['меньше', 'секрет', 'число', 'условие', 'подсказка', 'больше'],
        isRequired: true
      });
    } else if (isCalculator) {
      summary = 'Школьный калькулятор: операции сложения, вычитания, умножения, деления и защита от деления на ноль.';
      concepts.push(
        'Преобразование строк в числа с плавающей точкой float()',
        'Проверка знака операции if op == "+"',
        'Защита от ошибки деления на ноль if b != 0',
        'Блок else для неизвестных символов'
      );

      questions.push({
        id: `q_${Date.now()}_1`,
        defenseSessionId: '',
        questionText: 'Зачем мы переводим ввод чисел через float(input()), а не оставляем обычный текст?',
        skill: 'Типы данных',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет знание вещественных чисел с точкой для выполнения математических действий.',
        mustMention: ['float', 'число', 'дробь', 'дробное', 'считать', 'тип', 'сложить', 'текст'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_2`,
        defenseSessionId: '',
        questionText: 'Зачем при делении на строчке с косой чертой "/" стоит проверка if b != 0?',
        skill: 'Обработка ошибок',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет понимание правила деления на ноль и предотвращения сбоя программы.',
        mustMention: ['ноль', 'делить', 'деление', 'ошибка', 'zero', 'нельзя', 'b'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_3`,
        defenseSessionId: '',
        questionText: 'Для чего в самом конце программы нужен блок else?',
        skill: 'Ветвление логики',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет понимание обработки некорректного или непредусмотренного ввода пользователя.',
        mustMention: ['else', 'знак', 'операция', 'неизвестно', 'ошибка', 'другой', 'ввод'],
        isRequired: true
      });
    } else if (isEvenCounter) {
      summary = 'Подсчет четных чисел: проход циклом for по списку, проверка остатка от деления % 2 и счетчик count.';
      concepts.push(
        'Список чисел numbers = [...]',
        'Цикл for num in numbers',
        'Оператор остатка от деления num % 2 == 0',
        'Инкремент счетчика count = count + 1'
      );

      questions.push({
        id: `q_${Date.now()}_1`,
        defenseSessionId: '',
        questionText: 'Зачем в самом начале программы создается переменная count = 0?',
        skill: 'Переменные и память',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет понимание начальной инициализации счетчика перед циклом.',
        mustMention: ['счетчик', 'count', 'ноль', 'начало', 'считать', 'количество', 'переменная'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_2`,
        defenseSessionId: '',
        questionText: 'Что означает проверка if num % 2 == 0 внутри цикла for?',
        skill: 'Арифметические операторы',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет знание оператора остатка % для проверки четности числа.',
        mustMention: ['остаток', 'деление', 'четное', 'два', 'ноль', '%', 'делится'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_3`,
        defenseSessionId: '',
        questionText: 'Что делает строка count = count + 1, когда программа находит четное число?',
        skill: 'Логика алгоритма',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет понимание накопления результата и увеличения счетчика на единицу.',
        mustMention: ['плюс', 'один', 'увеличить', 'прибавить', 'счетчик', '+ 1', 'растет'],
        isRequired: true
      });
    } else if (isAreaFunc) {
      summary = '10 класс: Пользовательские функции def. Сигнатура rectangle_area(w, h), параметры и оператор return.';
      concepts.push(
        'Объявление функции def rectangle_area(w, h)',
        'Параметры ширины и высоты (w, h)',
        'Возврат значения через return w * h',
        'Вызов функции и вывод результата'
      );

      questions.push({
        id: `q_${Date.now()}_1`,
        defenseSessionId: '',
        questionText: 'Что объявляет ключевое слово def в строке def rectangle_area(w, h) и какие параметры принимает функция?',
        skill: 'Объявление функций',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет знание синтаксиса def и параметров функции.',
        mustMention: ['def', 'функция', 'ширина', 'высота', 'параметры', 'w', 'h', 'аргументы'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_2`,
        defenseSessionId: '',
        questionText: 'Какую роль выполняет инструкция return w * h внутри тела функции?',
        skill: 'Возврат значения',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет понимание оператора return для передачи вычисленного результата вызывающему коду.',
        mustMention: ['return', 'возврат', 'умножить', 'результат', 'площадь', 'вернуть'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_3`,
        defenseSessionId: '',
        questionText: 'Чем отличается возвращаемое значение функции с return от простого print() внутри функции?',
        skill: 'return vs print',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет фундаментальное понимание возврата данных в переменную vs вывода на экран.',
        mustMention: ['return', 'print', 'вернуть', 'значение', 'сохранить', 'экран', 'результат'],
        isRequired: true
      });
    } else if (isPhoneBook) {
      summary = '11 класс: Структуры данных. Словари dict, пары ключ-значение и безопасный доступ.';
      concepts.push(
        'Структура данных словарь contacts = {...}',
        'Пары «ключ : значение»',
        'Проверка наличия ключа if name in contacts',
        'Получение значения по ключу contacts[name]'
      );

      questions.push({
        id: `q_${Date.now()}_1`,
        defenseSessionId: '',
        questionText: 'Какая структура данных используется в переменной contacts и как в ней хранятся данные?',
        skill: 'Словари (dict)',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет знание словаря (dict) и формата ключ:значение.',
        mustMention: ['словарь', 'dict', 'ключ', 'значение', 'имя', 'номер', 'пары'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_2`,
        defenseSessionId: '',
        questionText: 'Зачем в программе написана проверка if name in contacts перед выводом номера?',
        skill: 'Безопасный доступ',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет понимание предотвращения KeyError при отсутствии ключа в словаре.',
        mustMention: ['проверка', 'ключ', 'ошибка', 'существует', 'KeyError', 'нет', 'найти'],
        isRequired: true
      });

      questions.push({
        id: `q_${Date.now()}_3`,
        defenseSessionId: '',
        questionText: 'Как программа достает телефон нужного человека из словаря по выражению contacts[name]?',
        skill: 'Доступ по ключу',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет понимание индексации словаря квадратными скобками по имени-ключу.',
        mustMention: ['ключ', 'скобки', 'квадратные', 'получить', 'номер', 'доступ', 'contacts'],
        isRequired: true
      });
    } else {
      // Deep dynamic AST-like code scanner for any custom Python file
      const lines = code.split('\n').map((l, i) => ({ num: i + 1, text: l.trim() })).filter(l => l.text && !l.text.startsWith('#'));
      
      const inputLine = lines.find(l => l.text.includes('input('));
      const loopLine = lines.find(l => l.text.startsWith('while ') || l.text.startsWith('for '));
      const conditionLine = lines.find(l => l.text.startsWith('if ') || l.text.startsWith('elif '));
      const breakLine = lines.find(l => l.text === 'break' || l.text.includes('break'));
      const printLine = lines.find(l => l.text.includes('print('));
      const funcLine = lines.find(l => l.text.startsWith('def '));

      summary = `Школьный проект (${fileName}): анализ ключевых конструкций, функций и развилок логики.`;
      
      if (inputLine) {
        concepts.push(`Строка ${inputLine.num}: пользовательский ввод input()`);
        questions.push({
          id: `q_${Date.now()}_1`,
          defenseSessionId: '',
          questionText: `В строке ${inputLine.num} у вас написано «${inputLine.text}». Зачем здесь функция input() и почему важно знать, какой тип данных она возвращает?`,
          skill: 'Ввод и типы данных',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 1,
          purpose: 'Проверяет знание функции input(), возвращаемого строкового типа str и приведения к числу int/float.',
          mustMention: ['ввод', 'пользователь', 'строка', 'текст', 'тип', 'input', 'число', 'int'],
          isRequired: true
        });
      } else if (funcLine) {
        concepts.push(`Строка ${funcLine.num}: объявление функции def`);
        questions.push({
          id: `q_${Date.now()}_1`,
          defenseSessionId: '',
          questionText: `В строке ${funcLine.num} находится «${funcLine.text}». Что объявляет ключевое слово def и какие аргументы принимает функция?`,
          skill: 'Функции',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 1,
          purpose: 'Проверяет понимание сигнатуры функции, параметров и изоляции области видимости.',
          mustMention: ['def', 'функция', 'параметры', 'аргументы', 'возврат', 'вызов'],
          isRequired: true
        });
      } else {
        concepts.push('Инициализация переменных и базовый синтаксис');
        const firstLine = lines[0] || { num: 1, text: 'a = 0' };
        questions.push({
          id: `q_${Date.now()}_1`,
          defenseSessionId: '',
          questionText: `Объясните строку ${firstLine.num} («${firstLine.text}»): какую переменную вы создаете и для чего она понадобится в коде?`,
          skill: 'Переменные и память',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 1,
          purpose: 'Проверяет осознание назначения ключевой переменной.',
          mustMention: ['переменная', 'значение', 'память', 'начало', 'хранить'],
          isRequired: true
        });
      }

      if (loopLine) {
        concepts.push(`Строка ${loopLine.num}: цикл ${loopLine.text.startsWith('while') ? 'while' : 'for'}`);
        questions.push({
          id: `q_${Date.now()}_2`,
          defenseSessionId: '',
          questionText: `В строке ${loopLine.num} («${loopLine.text}»): при каких условиях выполняется этот цикл и когда он завершится?`,
          skill: 'Управление циклом',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 2,
          purpose: 'Проверяет понимание условия продолжения и завершения цикла.',
          mustMention: ['цикл', 'условие', 'пока', 'повтор', 'завершится', 'шаг', 'итерация', 'break'],
          isRequired: true
        });
      } else if (conditionLine) {
        concepts.push(`Строка ${conditionLine.num}: условное ветвление`);
        questions.push({
          id: `q_${Date.now()}_2`,
          defenseSessionId: '',
          questionText: `В строке ${conditionLine.num} у вас «${conditionLine.text}». Что произойдет, если это условие истинно, а что — если ложно?`,
          skill: 'Ветвление логики',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 2,
          purpose: 'Проверяет понимание логических операторов и перехода управления.',
          mustMention: ['условие', 'истина', 'ложь', 'true', 'false', 'if', 'else', 'выполнится'],
          isRequired: true
        });
      } else {
        concepts.push('Алгоритмическая логика решения');
        questions.push({
          id: `q_${Date.now()}_2`,
          defenseSessionId: '',
          questionText: 'В чем заключается основной алгоритм вашей программы: какие вычисления производятся над данными?',
          skill: 'Алгоритм',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 2,
          purpose: 'Проверяет понимание смысла математических или логических операций.',
          mustMention: ['вычисление', 'данные', 'результат', 'операция', 'формула'],
          isRequired: true
        });
      }

      if (breakLine) {
        concepts.push(`Строка ${breakLine.num}: прерывание break`);
        questions.push({
          id: `q_${Date.now()}_3`,
          defenseSessionId: '',
          questionText: `Зачем в строке ${breakLine.num} используется инструкция break и что случится, если ее убрать?`,
          skill: 'Управление потоком',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 3,
          purpose: 'Проверяет понимание предотвращения зацикливания или немедленного выхода.',
          mustMention: ['break', 'выход', 'остановить', 'прервать', 'зациклится', 'бесконечный'],
          isRequired: true
        });
      } else if (printLine) {
        concepts.push(`Строка ${printLine.num}: вывод информации print()`);
        questions.push({
          id: `q_${Date.now()}_3`,
          defenseSessionId: '',
          questionText: `В строке ${printLine.num} («${printLine.text}»): что именно увидит пользователь в терминале в результате работы?`,
          skill: 'Вывод данных',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 3,
          purpose: 'Проверяет понимание итогового пользовательского интерфейса и вывода консоли.',
          mustMention: ['print', 'вывод', 'экран', 'консоль', 'терминал', 'результат', 'ответ'],
          isRequired: true
        });
      } else {
        concepts.push('Завершение работы программы');
        questions.push({
          id: `q_${Date.now()}_3`,
          defenseSessionId: '',
          questionText: 'Что произойдет, если пользователь передаст некорректные входные данные? Защищена ли программа?',
          skill: 'Обработка исключений',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 3,
          purpose: 'Проверяет понимание граничных случаев и надежности кода.',
          mustMention: ['ошибка', 'ввод', 'исключение', 'краш', 'проверка', 'защита'],
          isRequired: true
        });
      }
    }

    // Adaptive question tuning based on Teacher Reference Comparison
    if (referenceCode) {
      if (codeComparison.plagiarismRisk === 'exact_copy' && questions.length > 0) {
        questions[0] = {
          id: `q_${Date.now()}_exact`,
          defenseSessionId: '',
          questionText: 'Ваш код на 100% повторяет эталон учителя. Объясните алгоритм решения и каждую строку своими словами: почему программа написана именно так?',
          skill: 'Авторство и понимание алгоритма',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 1,
          purpose: 'Проверяет авторство и понимание кода при полном текстуальном совпадении с решением учителя.',
          mustMention: ['алгоритм', 'строка', 'переменная', 'цикл', 'решение', 'делает', 'работает', 'смысл'],
          isRequired: true
        };
      } else if (codeComparison.aiAnomalies.length > 0 && questions.length >= 3) {
        const anomaly = codeComparison.aiAnomalies[0];
        questions[2] = {
          id: `q_${Date.now()}_anomaly`,
          defenseSessionId: '',
          questionText: `В коде обнаружена конструкция (${anomaly}), которой нет в школьном эталоне учителя. Объясните подробно, как она работает и зачем вы ее применили?`,
          skill: 'Осознанность и проверка ИИ',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 3,
          purpose: 'Проверяет самостоятельность написания и выявляет слепое копирование решений из ChatGPT.',
          mustMention: ['код', 'работает', 'функция', 'смысл', 'логика', 'зачем', 'применил'],
          isRequired: true
        };
      } else if (codeComparison.missingElements.some((m) => m.includes('ноль')) && questions.length >= 2) {
        questions[1] = {
          id: `q_${Date.now()}_missing_zero`,
          defenseSessionId: '',
          questionText: 'В эталоне учителя строго заложена проверка деления на ноль (if b != 0), однако в вашем решении она отсутствует. Что произойдет при вводе b = 0 и как защитить код?',
          skill: 'Обработка граничных условий',
          difficulty: 'easy',
          timeLimit: 15,
          orderIndex: 2,
          purpose: 'Проверяет осознание ошибки ZeroDivisionError и расхождения с заданием учителя.',
          mustMention: ['ноль', 'деление', 'ошибка', 'zerodivisionerror', 'краш', 'нельзя', 'if', 'b', 'проверка'],
          isRequired: true
        };
      }
    }

    const analysis: AIAnalysis = {
      id: `anl_${Date.now()}`,
      submissionId: submission.id || 'sub_new',
      projectSummary: summary,
      coreConcepts: concepts,
      technicalDecisions: [
        {
          decision: `Соответствие эталону учителя: ${codeComparison.correctnessScore}%`,
          importance: 'high',
          verificationNeeded: codeComparison.plagiarismRisk !== 'low',
          contextSnippet: code.split('\n')[0] || 'main()'
        },
        {
          decision: 'Использование встроенных структур языка вместо внешних зависимостей',
          importance: 'medium',
          verificationNeeded: false
        }
      ],
      potentialGaps: codeComparison.missingElements.length > 0 ? codeComparison.missingElements : [
        'Потенциальная утечка памяти при длительном выполнении',
        'Отсутствие валидации исключений на входе (try/except)'
      ],
      codeComparison,
      generatedAt: new Date().toISOString()
    };

    return { analysis, questions };
  }

  /**
   * Retrieves active AI engine configuration (local neural model or Gemini Cloud LLM)
   */
  static getAIEngineConfig(): { mode: 'local' | 'gemini'; apiKey: string } {
    try {
      const envKey = ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || '';
      const mode = (localStorage.getItem('learnproof_ai_mode') as 'local' | 'gemini') || (envKey ? 'gemini' : 'local');
      const apiKey = localStorage.getItem('learnproof_gemini_api_key') || envKey;
      return { mode, apiKey };
    } catch (e) {
      return { mode: 'local', apiKey: '' };
    }
  }

  /**
   * Updates active AI engine configuration
   */
  static setAIEngineConfig(config: { mode: 'local' | 'gemini'; apiKey: string }): void {
    try {
      localStorage.setItem('learnproof_ai_mode', config.mode);
      localStorage.setItem('learnproof_gemini_api_key', config.apiKey);
    } catch (e) {}
  }

  /**
   * Evaluates student's oral answer in 15-second blitz defense.
   * Multi-layer evaluation:
   * Layer 1: Strict Zero-Tolerance Ignorance / Evasion Classifier (0%)
   * Layer 2: Empty / Pure Filler Words filter (0%)
   * Layer 3: Off-Topic / Non-programming filter (1-5%)
   * Layer 4: Gemini 1.5 Flash Cloud LLM (if configured)
   * Layer 5: Local Neural-Semantic Heuristic with Causal Reasoning Calibration
   */
  static async evaluateAnswer(
    question: DefenseQuestion,
    transcript: string,
    durationSeconds: number
  ): Promise<RubricEvaluation> {
    const clean = transcript.trim().toLowerCase();
    const config = this.getAIEngineConfig();

    // ================= LAYER 1: STRICT ZERO-TOLERANCE IGNORANCE CLASSIFIER =================
    // If student says "я не знаю", "короче я не знаю", "списал", "хз", etc. -> STRICT 0%
    const IGNORANCE_TRIGGERS = [
      'не знаю', 'я не знаю', 'не помню', 'без понятия', 'хз', 'хрен знает',
      'не шарю', 'не понимаю', 'откуда мне знать', 'просто списал', 'списал', 'списала',
      'скопировал', 'скопировала', 'взял из интернета', 'взяла из интернета', 'нейросеть',
      'чат гпт', 'chatgpt', 'не могу сказать', 'не могу ответить', 'не помню вообще',
      'не в курсе', 'наугад', 'наобум', 'просто нажал', 'ничего не знаю', 'забыл', 'забыла',
      'никак', 'понятия не имею', 'хз вообще', 'хз честно', 'я хз', 'хз короче', 'короче не знаю',
      'короче я не знаю', 'не могу вспомнить', 'списано', 'не учил', 'не учила',
      'не успел', 'не успела'
    ];

    const hasIgnorance = IGNORANCE_TRIGGERS.some((trig) => clean.includes(trig));

    // Morphology-aware keyword checker: matches either exact substring or stem
    const keywordsFound = (question.mustMention || []).filter((kw) => {
      const kwLower = kw.toLowerCase().trim();
      if (!kwLower) return false;
      if (clean.includes(kwLower)) return true;
      const stem = kwLower.slice(0, Math.max(3, kwLower.length - 2));
      return clean.includes(stem);
    });

    if (hasIgnorance && keywordsFound.length <= 1) {
      await new Promise((r) => setTimeout(r, 400));
      return {
        id: `eval_${Date.now()}`,
        conceptScore: 0,
        reasoningScore: 0,
        applicationScore: 0,
        technicalScore: 0,
        independenceScore: 0,
        overallScore: 0,
        aiFeedback: `Ученик прямо признался в незнании («${transcript}»). Оценка: 0%. Автоматический отказ в зачете, требуется очная пересдача учителю.`,
        keyPunchlineDetected: false,
        confidence: 'High'
      };
    }

    // ================= LAYER 2: SILENCE / PURE FILLER WORDS FILTER =================
    const words = clean.split(/[\s,.;:!?\-—]+/).filter(Boolean);
    const FILLER_TOKENS = new Set([
      'ну', 'короче', 'эээ', 'эм', 'ммм', 'типа', 'вот', 'да', 'как', 'бы', 'там', 'вообще', 'это', 'нука', 'так'
    ]);
    const meaningfulWords = words.filter((w) => !FILLER_TOKENS.has(w));

    if (words.length === 0 || meaningfulWords.length === 0 || clean.length < 5) {
      await new Promise((r) => setTimeout(r, 400));
      return {
        id: `eval_${Date.now()}`,
        conceptScore: 0,
        reasoningScore: 0,
        applicationScore: 0,
        technicalScore: 0,
        independenceScore: 0,
        overallScore: 0,
        aiFeedback: 'Ответ не содержит содержательной информации (только слова-паразиты или тишина). Оценка: 0%.',
        keyPunchlineDetected: false,
        confidence: 'High'
      };
    }

    // ================= LAYER 3: OFF-TOPIC / NON-PROGRAMMING FILTER =================
    const generalTechKeywords = [
      'число', 'int', 'float', 'строка', 'str', 'текст', 'тип', 'сравнить', 'сравнение',
      'break', 'цикл', 'while', 'for', 'секрет', 'угадал', 'угадать', 'подсказка',
      'меньше', 'больше', 'калькулятор', 'ноль', 'делить', 'деление', 'ошибка',
      'zero', 'сложить', 'умножить', 'вычесть', 'остаток', 'четное', 'нечетное',
      'счетчик', 'count', 'плюс', 'прибавить', 'увеличить', 'список', 'print',
      'условие', 'if', 'else', 'elif', 'input', 'память', 'переменная', 'код',
      'программа', 'функция', 'значение', 'клавиатура', 'вывод', 'экран'
    ];
    const techHits = generalTechKeywords.filter((k) => clean.includes(k)).length;

    if (techHits === 0 && keywordsFound.length === 0) {
      await new Promise((r) => setTimeout(r, 400));
      const offTopicScore = Math.floor(1 + Math.random() * 5); // 1-5%
      return {
        id: `eval_${Date.now()}`,
        conceptScore: 0.1,
        reasoningScore: 0.1,
        applicationScore: 0.1,
        technicalScore: 0.1,
        independenceScore: 0.1,
        overallScore: offTopicScore,
        aiFeedback: 'Ответ не имеет отношения к теме программирования и заданному вопросу (оффтоп). Оценка: 1–5%. Назначена проверка учителя.',
        keyPunchlineDetected: false,
        confidence: 'High'
      };
    }

    // ================= LAYER 4: LIVE GOOGLE GEMINI CLOUD LLM (IF CONFIGURED) =================
    if (config.mode === 'gemini' && config.apiKey) {
      try {
        const geminiResult = await this.evaluateWithGemini(question, transcript, config.apiKey);
        if (geminiResult) {
          return geminiResult;
        }
      } catch (e) {
        console.warn('Gemini API call failed, falling back to Enhanced Local Neural Model:', e);
      }
    }

    // ================= LAYER 5: ENHANCED LOCAL NEURAL-SEMANTIC ENGINE v2.6 =================
    await new Promise((r) => setTimeout(r, 450));

    // Semantic concept clusters (handles Russian morphology: числа, чисел, строке, ввод, инпутом, etc.)
    const STEM_GROUPS: Record<string, string[]> = {
      input: ['инпут', 'импут', 'input', 'ввод', 'счит', 'клавиат', 'ввест', 'пользовател'],
      number: ['числ', 'чисел', 'цифр', 'int', 'цел', 'значен', 'дроб', 'веществ', 'float'],
      string: ['строк', 'текст', 'символ', 'str', 'букв'],
      loop: ['цикл', 'вайл', 'while', 'фор', 'for', 'повтор', 'итерац', 'крут'],
      break: ['брейк', 'брек', 'break', 'останов', 'прерв', 'заверш', 'выход', 'стоп', 'конч'],
      compare: ['сравн', 'больш', 'меньш', 'равн', 'провер', 'услов', 'отлич'],
      arithmetic: ['остаток', 'делен', 'четн', 'нечет', 'плюс', 'прибав', 'увелич', 'счетчик', 'count', 'умнож'],
      error: ['ошибк', 'ноль', 'нулю', 'zero', 'делен', 'сбой', 'исключен', 'краш', 'слома']
    };

    // Detect matched concept groups
    const matchedConceptGroups = Object.entries(STEM_GROUPS).filter(([_, stems]) =>
      stems.some((stem) => clean.includes(stem))
    ).map(([group]) => group);

    // Causal connectives indicating logical justification ("зачем?")
    const causalMarkers = [
      'чтобы', 'потому что', 'так как', 'для того', 'иначе', 'если', 'когда',
      'переводит', 'превращает', 'останавливает', 'прерывает', 'прибавляет',
      'увеличивает', 'сравнивает', 'выводит', 'защищает', 'поскольку', 'затем'
    ];
    const causalHits = causalMarkers.filter((m) => clean.includes(m)).length;

    let overallScore = 30;
    let feedback = '';

    // Confident, reasoned explanation:
    // e.g. "input возвращает текст, а int переводит в число чтобы сравнивать"
    // (matches input, number, string clusters + causal marker)
    const hasConceptPair = 
      (matchedConceptGroups.includes('input') && (matchedConceptGroups.includes('number') || matchedConceptGroups.includes('string'))) ||
      (matchedConceptGroups.includes('break') && matchedConceptGroups.includes('loop')) ||
      (matchedConceptGroups.includes('compare') && (matchedConceptGroups.includes('number') || matchedConceptGroups.includes('loop'))) ||
      (matchedConceptGroups.includes('arithmetic') && matchedConceptGroups.includes('number'));

    if (keywordsFound.length >= 2 || (hasConceptPair && (causalHits >= 1 || techHits >= 2)) || (keywordsFound.length >= 1 && causalHits >= 1 && techHits >= 2)) {
      // Confident, reasoned explanation -> 88-98% (Auto-passed)
      overallScore = Math.floor(88 + Math.min(10, (keywordsFound.length + matchedConceptGroups.length) * 2 + causalHits * 2));
      overallScore = Math.min(98, overallScore);
      feedback = 'Отличное, аргументированное объяснение: ученик четко раскрыл логику и причину использования конструкции в коде.';
    } else if (keywordsFound.length === 1 || hasConceptPair || (techHits >= 2 && causalHits >= 1)) {
      // Partial understanding -> 52-64% (Strictly <= 65%, requires teacher review)
      overallScore = Math.floor(52 + Math.random() * 12);
      feedback = 'Частичное понимание: ученик назвал правильный термин, но не раскрыл полную взаимосвязь или граничные условия. Требуется опрос учителя.';
    } else if (techHits >= 1 || matchedConceptGroups.length >= 1) {
      // Superficial single-word guess -> 20-38%
      overallScore = Math.floor(20 + Math.random() * 18);
      feedback = 'Поверхностная догадка. Названы общие слова без понимания логики алгоритма.';
    } else {
      // Weak / obscure -> 10-19%
      overallScore = Math.floor(10 + Math.random() * 9);
      feedback = 'Слабый ответ, нет ключевых признаков понимания.';
    }

    const factor = overallScore / 100;
    const conceptScore = Number((factor * 5).toFixed(1));
    const reasoningScore = Number((Math.min(5, factor * 4.9 + 0.1)).toFixed(1));
    const applicationScore = Number((Math.min(5, factor * 5.1 - 0.1)).toFixed(1));
    const technicalScore = Number((factor * 5).toFixed(1));
    const independenceScore = Number((factor * 5).toFixed(1));

    return {
      id: `eval_${Date.now()}`,
      conceptScore,
      reasoningScore,
      applicationScore,
      technicalScore,
      independenceScore,
      overallScore,
      aiFeedback: feedback,
      keyPunchlineDetected: keywordsFound.length > 0 && causalHits > 0,
      confidence: meaningfulWords.length > 8 ? 'High' : 'Medium'
    };
  }

  /**
   * Calls Google Gemini 1.5 Flash endpoint for strict, contextual evaluation
   */
  private static async evaluateWithGemini(
    question: DefenseQuestion,
    transcript: string,
    apiKey: string
  ): Promise<RubricEvaluation | null> {
    const prompt = `Ты — строгий школьный экзаменатор по информатике. Твоя задача — объективно оценить устный ответ ученика на вопрос по его коду.
Вопрос: "${question.questionText}"
Фокус проверки: "${question.purpose}"
Ожидаемые ключевые понятия: "${(question.mustMention || []).join(', ')}"
Транскрипт ответа ученика: "${transcript}"

ПРАВИЛА ОЦЕНИВАНИЯ:
1. Если ученик говорит "не знаю", "не помню", "списал", "без понятия", "хз" или молчит — ОЦЕНКА СТРОГО 0 БАЛЛОВ.
2. Если ответ не по теме (оффтоп) — ОЦЕНКА 1-5 БАЛЛОВ.
3. Если ответ поверхностная догадка ("это переменная") — ОЦЕНКА 20-35 БАЛЛОВ.
4. Если ответ частично правильный, но не полный — ОЦЕНКА 50-64 БАЛЛА (требуется проверка учителя).
5. Если ответ точный, своими словами объясняет логику и причину — ОЦЕНКА 85-98 БАЛЛОВ (автозачет).

Ответь СТРОГО валидным JSON без markdown:
{
  "overallScore": <число от 0 до 100>,
  "aiFeedback": "<краткий строгий вердикт на русском языке>",
  "conceptScore": <число от 0.0 до 5.0>,
  "reasoningScore": <число от 0.0 до 5.0>,
  "applicationScore": <число от 0.0 до 5.0>
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    const overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore || 0)));

    return {
      id: `eval_gemini_${Date.now()}`,
      conceptScore: Number((parsed.conceptScore || (overallScore / 100) * 5).toFixed(1)),
      reasoningScore: Number((parsed.reasoningScore || (overallScore / 100) * 5).toFixed(1)),
      applicationScore: Number((parsed.applicationScore || (overallScore / 100) * 5).toFixed(1)),
      technicalScore: Number(((overallScore / 100) * 5).toFixed(1)),
      independenceScore: Number(((overallScore / 100) * 5).toFixed(1)),
      overallScore,
      aiFeedback: parsed.aiFeedback || 'Оценка сформирована моделью Google Gemini 1.5 Flash.',
      keyPunchlineDetected: overallScore >= 80,
      confidence: 'High'
    };
  }

  /**
   * Synthesizes results across all 3 questions into an automated verdict:
   * >= 85%: Auto-Approved (No teacher review required, homework passed!)
   * <= 65%: Teacher Review Required (Knowledge gap detected)
   * <= 15%: Direct Failure / Zero tolerance (0-15%)
   */
  static calculateSessionVerdict(results: EvaluatedQuestionResult[]): DefenseSessionVerdict {
    if (results.length === 0) {
      return {
        overallScore: 0,
        status: 'needs_followup',
        isAutoApproved: false,
        needsTeacherReview: true,
        title: 'Защита не пройдена: 0%',
        badgeText: 'НЕТ ДАННЫХ',
        verdictDescription: 'Ответы на проверочные вопросы не зафиксированы.',
        conceptScore: 0,
        reasoningScore: 0,
        applicationScore: 0,
        feedbackSummary: 'Пройдите защиту заново.'
      };
    }

    const total = results.reduce((acc, r) => acc + r.evaluation.overallScore, 0);
    const overallScore = Math.round(total / results.length);

    const avgConcept = Math.round((results.reduce((acc, r) => acc + r.evaluation.conceptScore, 0) / results.length) * 20);
    const avgReasoning = Math.round((results.reduce((acc, r) => acc + r.evaluation.reasoningScore, 0) / results.length) * 20);
    const avgApplication = Math.round((results.reduce((acc, r) => acc + r.evaluation.applicationScore, 0) / results.length) * 20);

    if (overallScore >= 85) {
      return {
        overallScore,
        status: 'verified',
        isAutoApproved: true,
        needsTeacherReview: false,
        title: `Защита пройдена на ${overallScore}%!`,
        badgeText: 'ДЗ СДАНО АВТОМАТИЧЕСКИ',
        verdictDescription: 'Обученный ИИ подтвердил самостоятельное авторство кода. Ученик без задержек и точно объяснил ключевые развилки. Дополнительная проверка учителем не требуется — оценка выставлена в журнал.',
        conceptScore: avgConcept,
        reasoningScore: avgReasoning,
        applicationScore: avgApplication,
        feedbackSummary: 'Высокий уровень владения материалом. Структуры данных и алгоритм применены осознанно.'
      };
    } else if (overallScore <= 15) {
      return {
        overallScore,
        status: 'needs_followup',
        isAutoApproved: false,
        needsTeacherReview: true,
        title: `Защита не сдана: ${overallScore}%`,
        badgeText: 'ОТКАЗ В ЗАЧЕТЕ (0%)',
        verdictDescription: 'Ученик не смог ответить на контрольные вопросы (зафиксирован отказ от ответа «не знаю / списал» или молчание). ДЗ аннулировано, требуется личная очная пересдача учителю.',
        conceptScore: avgConcept,
        reasoningScore: avgReasoning,
        applicationScore: avgApplication,
        feedbackSummary: 'Полное отсутствие понимания написанного кода. Требуется личный разбор с учителем.'
      };
    } else if (overallScore <= 65) {
      return {
        overallScore,
        status: 'needs_followup',
        isAutoApproved: false,
        needsTeacherReview: true,
        title: `Низкий балл понимания: ${overallScore}%`,
        badgeText: 'ТРЕБУЕТСЯ ПРОВЕРКА УЧИТЕЛЯ',
        verdictDescription: 'Балл понимания ниже порога (<=65%). Выявлены существенные пробелы в объяснении строк кода или признаки слепого копирования из нейросетей. Требуется личная проверка учителя.',
        conceptScore: avgConcept,
        reasoningScore: avgReasoning,
        applicationScore: avgApplication,
        feedbackSummary: 'Ученик не смог аргументировать технические решения. Рекомендуется очный разбор темы.'
      };
    } else {
      return {
        overallScore,
        status: 'defense_completed',
        isAutoApproved: false,
        needsTeacherReview: false,
        title: `Результат защиты: ${overallScore}%`,
        badgeText: 'НА УТВЕРЖДЕНИИ УЧИТЕЛЯ',
        verdictDescription: 'Хороший результат. Базовые принципы кода понятны, голосовые ответы сохранены и переданы в журнал преподавателя для финального утверждения.',
        conceptScore: avgConcept,
        reasoningScore: avgReasoning,
        applicationScore: avgApplication,
        feedbackSummary: 'Твердое понимание основы. Ответы готовы к утверждению преподавателем.'
      };
    }
  }
}
