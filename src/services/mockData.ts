import { User, Assignment, Submission, DefenseSession, ClassInsight } from '../types';

export const SEEDED_USERS: User[] = [
  {
    id: 'user_teacher_1',
    username: 'teacher',
    password: '12345678',
    name: 'Амина Сериковна (Учитель)',
    email: 'teacher@studymaxxing.kz',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    school: 'НИШ ФМН г. Астана',
    schoolWebsite: 'https://ast.nis.edu.kz',
  },
  {
    id: 'user_student_nuradil',
    username: 'Nuradil M.',
    password: '12345678',
    name: 'Nuradil M.',
    email: 'nuradil@studymaxxing.kz',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    school: 'РФМШ г. Алматы',
    schoolWebsite: 'https://almaty.fizmat.kz',
  },
  {
    id: 'user_student_2',
    username: 'aliya',
    password: '12345678',
    name: 'Алия С.',
    email: 'aliya.student@school.kz',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_student_3',
    username: 'daniel',
    password: '12345678',
    name: 'Даниэль К.',
    email: 'daniel.student@school.kz',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_student_4',
    username: 'madina',
    password: '12345678',
    name: 'Мадина А.',
    email: 'madina.student@school.kz',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  },
];

export const SEEDED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_game',
    classId: 'cls_cs_8',
    className: 'Информатика 8 «А» класс · Основы алгоритмов',
    title: 'Python: Игра «Угадай число»',
    description: 'Написать программу с бесконечным циклом while True, вводом чисел int(input()), подсказками больше/меньше и выходом по break.',
    submissionType: 'code',
    questionCount: 3,
    answerMode: 'voice_or_text',
    timerSeconds: 15,
    allowRetakes: false,
    autoSubmit: true,
    scoreVisibility: 'after_review',
    referenceCode: `secret = 42

print("Компьютер загадал число от 1 до 100!")

while True:
    guess = int(input("Введите число: "))
    if guess == secret:
        print("Поздравляю, вы угадали!")
        break
    elif guess < secret:
        print("Загаданное число больше!")
    else:
        print("Загаданное число меньше!")`,
    starterTemplate: `# Задание 1: Игра «Угадай число»
# Задайте число secret = 42, организуйте цикл while True с int(input()) и break
secret = 42
`,
    createdAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'asg_calc',
    classId: 'cls_cs_7',
    className: 'Информатика 7 «Б» класс · Ветвления if/else',
    title: 'Python: Простой калькулятор двух чисел',
    description: 'Создать консольный калькулятор для 4 арифметических действий (+, -, *, /) с обязательной проверкой деления на ноль (b != 0).',
    submissionType: 'code',
    questionCount: 3,
    answerMode: 'voice_or_text',
    timerSeconds: 15,
    allowRetakes: false,
    autoSubmit: true,
    scoreVisibility: 'after_review',
    referenceCode: `a = float(input("Введите первое число: "))
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
    print("Неизвестная операция")`,
    starterTemplate: `# Задание 2: Калькулятор двух чисел
# Запросите числа a и b, операцию op и вычислите результат с проверкой деления на ноль (b != 0)
a = float(input("Введите первое число: "))
op = input("Выберите операцию (+, -, *, /): ")
b = float(input("Введите второе число: "))
`,
    createdAt: '2026-09-15T14:30:00Z',
  }
];

export const SEEDED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_arman_1',
    assignmentId: 'asg_game',
    studentId: 'user_student_nuradil',
    studentName: 'Nuradil M.',
    studentEmail: 'nuradil@studymaxxing.kz',
    submittedAt: '2026-09-22T14:20:00Z',
    fileName: 'guess_game.py',
    githubUrl: 'https://github.com/nuradil-dev/guess-game',
    codeSnippet: `secret = 42

print("Компьютер загадал число от 1 до 100!")

while True:
    guess = int(input("Введите число: "))
    if guess == secret:
        print("Поздравляю, вы угадали!")
        break
    elif guess < secret:
        print("Загаданное число больше!")
    else:
        print("Загаданное число меньше!")`,
    status: 'verified',
    analysis: {
      id: 'anl_arman_1',
      submissionId: 'sub_arman_1',
      projectSummary: 'Школьная игра «Угадай число» с циклом while True, преобразованием int(input()) и выходом по break.',
      coreConcepts: [
        'Бесконечный цикл while True',
        'Преобразование типов int(input())',
        'Ветвление if / elif / else',
        'Прерывание цикла командой break'
      ],
      technicalDecisions: [
        {
          decision: 'Использование int(input()) для корректного числового сравнения',
          importance: 'high',
          verificationNeeded: true,
          contextSnippet: 'guess = int(input("Введите число: "))'
        },
        {
          decision: 'Остановка цикла командой break при верном угадывании',
          importance: 'medium',
          verificationNeeded: true,
          contextSnippet: 'break'
        }
      ],
      potentialGaps: [
        'Возможный сбой программы, если пользователь введет буквы вместо цифр (ValueError)'
      ],
      generatedAt: '2026-09-22T14:22:00Z',
    },
    defenseSessionId: 'def_arman_1'
  },
  {
    id: 'sub_aliya_1',
    assignmentId: 'asg_calc',
    studentId: 'user_student_2',
    studentName: 'Алия С.',
    studentEmail: 'aliya.student@school.kz',
    submittedAt: '2026-09-21T18:10:00Z',
    fileName: 'calculator.py',
    status: 'teacher_review',
    defenseSessionId: 'def_aliya_1',
  },
  {
    id: 'sub_daniel_1',
    assignmentId: 'asg_even',
    studentId: 'user_student_3',
    studentName: 'Даниэль К.',
    studentEmail: 'daniel.student@school.kz',
    submittedAt: '2026-09-20T11:00:00Z',
    fileName: 'even_counter.py',
    status: 'verified',
    defenseSessionId: 'def_daniel_1'
  },
  {
    id: 'sub_madina_1',
    assignmentId: 'asg_game',
    studentId: 'user_student_4',
    studentName: 'Мадина А.',
    studentEmail: 'madina.student@school.kz',
    submittedAt: '2026-09-22T19:40:00Z',
    fileName: 'guess_game.py',
    status: 'defense_ready',
    defenseSessionId: 'def_madina_1'
  }
];

export const SEEDED_DEFENSE_SESSIONS: Record<string, DefenseSession> = {
  'def_arman_1': {
    id: 'def_arman_1',
    submissionId: 'sub_arman_1',
    studentId: 'user_student_nuradil',
    assignmentId: 'asg_game',
    startedAt: '2026-09-22T14:25:00Z',
    completedAt: '2026-09-22T14:27:00Z',
    status: 'verified',
    overallScore: 92,
    overallRubric: {
      conceptKnowledge: 94,
      reasoning: 90,
      application: 92,
      technicalDepth: 91,
      independentExplanation: 93
    },
    questions: [
      {
        id: 'q_arman_1',
        defenseSessionId: 'def_arman_1',
        questionText: 'Зачем в строке 6 используется int(input()), а не просто input()?',
        skill: 'Типы данных',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет базовое понимание преобразования строки в целое число для сравнения.',
        mustMention: ['число', 'int', 'строка', 'тип', 'сравнить'],
        isRequired: true
      },
      {
        id: 'q_arman_2',
        defenseSessionId: 'def_arman_1',
        questionText: 'Что делает команда break внутри условия, когда игрок угадал число?',
        skill: 'Управление циклом',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Проверяет понимание выхода из цикла while при наступлении нужного события.',
        mustMention: ['break', 'выход', 'остановить', 'прервать', 'цикл'],
        isRequired: true
      },
      {
        id: 'q_arman_3',
        defenseSessionId: 'def_arman_1',
        questionText: 'Какое условие проверяет строка elif guess < secret и какую подсказку выводит программа?',
        skill: 'Ветвление логики',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Проверяет понимание сравнения чисел и работы ветки elif.',
        mustMention: ['меньше', 'секрет', 'число', 'подсказка', 'больше'],
        isRequired: true
      }
    ],
    answers: {
      'q_arman_1': {
        id: 'ans_arman_1',
        questionId: 'q_arman_1',
        mode: 'voice',
        durationSeconds: 11,
        submittedAt: '2026-09-22T14:25:30Z',
        transcript: 'Функция input считывает строку текста, а int переводит ее в целое число, чтобы мы могли сравнивать значение с секретным числом.',
        evaluation: {
          id: 'eval_arman_1',
          conceptScore: 4.8,
          reasoningScore: 4.7,
          applicationScore: 4.8,
          technicalScore: 4.9,
          independenceScore: 4.9,
          overallScore: 95,
          aiFeedback: 'Отличный четкий ответ: ученик понимает разницу между строкой и числом.',
          keyPunchlineDetected: true,
          confidence: 'High'
        }
      },
      'q_arman_2': {
        id: 'ans_arman_2',
        questionId: 'q_arman_2',
        mode: 'voice',
        durationSeconds: 10,
        submittedAt: '2026-09-22T14:26:15Z',
        transcript: 'Команда break сразу останавливает и завершает бесконечный цикл while, когда мы отгадали число.',
        evaluation: {
          id: 'eval_arman_2',
          conceptScore: 4.7,
          reasoningScore: 4.6,
          applicationScore: 4.7,
          technicalScore: 4.6,
          independenceScore: 4.8,
          overallScore: 92,
          aiFeedback: 'Точное понимание оператора break для прерывания цикла.',
          keyPunchlineDetected: true,
          confidence: 'High'
        }
      },
      'q_arman_3': {
        id: 'ans_arman_3',
        questionId: 'q_arman_3',
        mode: 'voice',
        durationSeconds: 9,
        submittedAt: '2026-09-22T14:26:50Z',
        transcript: 'Она проверяет, если введенное число меньше загаданного, и программа выводит подсказку, что загаданное число больше.',
        evaluation: {
          id: 'eval_arman_3',
          conceptScore: 4.5,
          reasoningScore: 4.4,
          applicationScore: 4.5,
          technicalScore: 4.5,
          independenceScore: 4.6,
          overallScore: 89,
          aiFeedback: 'Верное объяснение логики ветвления elif.',
          keyPunchlineDetected: true,
          confidence: 'High'
        }
      }
    },
    teacherReview: {
      id: 'rev_arman_1',
      defenseSessionId: 'def_arman_1',
      teacherId: 'user_teacher_1',
      overrideScore: 92,
      studentFeedback: 'Отличная защита, Нурадил! Ты прекрасно понимаешь, как работает цикл while и почему нужно преобразование int(input()).',
      privateNote: 'Код написал сам. Отвечал уверенно, без пауз. Твердая пятерка за проект.',
      reviewedAt: '2026-09-22T15:10:00Z',
      status: 'verified'
    }
  },
  'def_aliya_1': {
    id: 'def_aliya_1',
    submissionId: 'sub_aliya_1',
    studentId: 'user_student_2',
    assignmentId: 'asg_calc',
    status: 'teacher_review',
    overallScore: 58,
    questions: [
      {
        id: 'q_aliya_1',
        defenseSessionId: 'def_aliya_1',
        questionText: 'Зачем при делении op == "/" добавлена проверка if b != 0?',
        skill: 'Обработка ошибок',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверяет понимание правила деления на ноль.',
        isRequired: true
      }
    ],
    answers: {
      'q_aliya_1': {
        id: 'ans_aliya_1',
        questionId: 'q_aliya_1',
        mode: 'voice',
        durationSeconds: 7,
        submittedAt: '2026-09-21T18:21:00Z',
        transcript: 'Ну... я не знаю точно, учитель сказал написать так, чтобы программа не падала с ошибкой.',
        evaluation: {
          id: 'eval_aliya_1',
          conceptScore: 2.8,
          reasoningScore: 2.5,
          applicationScore: 2.9,
          technicalScore: 2.6,
          independenceScore: 2.8,
          overallScore: 58,
          aiFeedback: 'Ученица не смогла объяснить причину проверки деления на ноль. Требуется повторение темы с учителем.',
          keyPunchlineDetected: false,
          confidence: 'High'
        }
      }
    }
  },
  'def_madina_1': {
    id: 'def_madina_1',
    submissionId: 'sub_madina_1',
    studentId: 'user_student_4',
    assignmentId: 'asg_game',
    status: 'defense_ready',
    questions: [
      {
        id: 'q_madina_1',
        defenseSessionId: 'def_madina_1',
        questionText: 'Зачем в коде используется бесконечный цикл while True?',
        skill: 'Управление циклом',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 1,
        purpose: 'Проверка понимания повторения ввода до угадывания числа.',
        isRequired: true
      },
      {
        id: 'q_madina_2',
        defenseSessionId: 'def_madina_1',
        questionText: 'Что произойдет, если убрать команду break из блока угадывания?',
        skill: 'Управление циклом',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 2,
        purpose: 'Понимание зацикливания программы.',
        isRequired: true
      },
      {
        id: 'q_madina_3',
        defenseSessionId: 'def_madina_1',
        questionText: 'Как программа выводит подсказку пользователю больше или меньше?',
        skill: 'Ветвление логики',
        difficulty: 'easy',
        timeLimit: 15,
        orderIndex: 3,
        purpose: 'Понимание конструкции if/elif/else.',
        isRequired: true
      }
    ],
    answers: {}
  }
};

export const SEEDED_CLASS_INSIGHTS: ClassInsight = {
  weakSkills: [
    { skill: 'Базы данных (SQLite)', score: 54 },
    { skill: 'Обработка ошибок (try/except)', score: 62 },
    { skill: 'Словари и списки в памяти', score: 78 },
    { skill: 'Игровые циклы и события', score: 82 },
    { skill: 'Базовый синтаксис Python', score: 91 }
  ],
  conceptHeatmap: [
    {
      studentId: 'user_student_1',
      studentName: 'Арман Т. (10 «А»)',
      scores: {
        'Базовый синтаксис': 94,
        'Словари и списки': 90,
        'Базы данных': 75,
        'Обработка ошибок': 85,
        'Игровые циклы': 88
      },
      overall: 88
    },
    {
      studentId: 'user_student_2',
      studentName: 'Алия С. (10 «Б»)',
      scores: {
        'Базовый синтаксис': 74,
        'Словари и списки': 60,
        'Базы данных': 45,
        'Обработка ошибок': 50,
        'Игровые циклы': 68
      },
      overall: 62
    },
    {
      studentId: 'user_student_3',
      studentName: 'Даниэль К. (11 «А»)',
      scores: {
        'Базовый синтаксис': 98,
        'Словари и списки': 95,
        'Базы данных': 88,
        'Обработка ошибок': 92,
        'Игровые циклы': 90
      },
      overall: 93
    },
    {
      studentId: 'user_student_4',
      studentName: 'Мадина А. (9 «В»)',
      scores: {
        'Базовый синтаксис': 85,
        'Словари и списки': 72,
        'Базы данных': 50,
        'Обработка ошибок': 64,
        'Игровые циклы': 80
      },
      overall: 71
    }
  ]
};
