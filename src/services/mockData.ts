import { User, Assignment, Submission, DefenseSession, ClassInsight, SchoolClass } from '../types';

export const SEEDED_USERS: User[] = [
  {
    id: 'user_teacher_sasahokage',
    username: 'sasahokage',
    password: '123456',
    name: 'Учитель (sasahokage)',
    email: '',
    role: 'teacher',
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=sasahokage',
    school: 'НИШ ФМН г. Астана',
    schoolWebsite: 'https://ast.nis.edu.kz',
  },
  {
    id: 'user_student_arman',
    username: 'student',
    password: '12345678',
    name: 'Арман Ж.',
    email: '',
    role: 'student',
    grade: 8,
    classId: undefined,
    className: undefined,
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=arman',
    school: undefined,
    schoolWebsite: undefined,
  }
];

export const SEEDED_CLASSES: SchoolClass[] = [
  {
    id: 'cls_cs_8',
    grade: 8,
    letter: 'А',
    name: '8 «А» класс',
    subject: 'Информатика и основы Python',
    academicYear: '2026–2027',
    studentIds: [],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cls_cs_7',
    grade: 7,
    letter: 'Б',
    name: '7 «Б» класс',
    subject: 'Информатика и ветвления if/else',
    academicYear: '2026–2027',
    studentIds: [],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cls_cs_6',
    grade: 6,
    letter: 'А',
    name: '6 «А» класс',
    subject: 'Основы программирования и числа',
    academicYear: '2026–2027',
    studentIds: [],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cls_cs_9',
    grade: 9,
    letter: 'А',
    name: '9 «А» класс',
    subject: 'Списки, циклы и алгоритмы',
    academicYear: '2026–2027',
    studentIds: [],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cls_cs_10',
    grade: 10,
    letter: 'А',
    name: '10 «А» класс',
    subject: 'Пользовательские функции и модули',
    academicYear: '2026–2027',
    studentIds: [],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cls_cs_11',
    grade: 11,
    letter: 'А',
    name: '11 «А» класс',
    subject: 'Структуры данных и словари',
    academicYear: '2026–2027',
    studentIds: [],
    createdAt: '2026-09-01T08:00:00Z',
  },
];

export const SEEDED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_grade_5',
    classId: 'cls_cs_5',
    className: 'Информатика 5 «А» класс · Первые программы',
    grade: 5,
    title: 'Python: Знакомство и приветствие',
    description: 'Написать простую программу, которая запрашивает имя пользователя через input() и выводит приветствие через print().',
    submissionType: 'code',
    questionCount: 3,
    answerMode: 'voice_or_text',
    timerSeconds: 15,
    allowRetakes: false,
    autoSubmit: true,
    scoreVisibility: 'after_review',
    referenceCode: `name = input("Как тебя зовут? ")
print("Привет,", name)`,
    starterTemplate: `# 5 класс: Приветствие пользователя
# Запросите имя пользователя и выведите приветствие
name = input("Как тебя зовут? ")
`,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'asg_grade_6',
    classId: 'cls_cs_6',
    className: 'Информатика 6 «А» класс · Числа и переменные',
    grade: 6,
    title: 'Python: Сложение двух чисел',
    description: 'Запросить у пользователя два целых числа через int(input()) и вывести результат их сложения.',
    submissionType: 'code',
    questionCount: 3,
    answerMode: 'voice_or_text',
    timerSeconds: 15,
    allowRetakes: false,
    autoSubmit: true,
    scoreVisibility: 'after_review',
    referenceCode: `a = int(input("Введите первое число: "))
b = int(input("Введите второе число: "))
print("Сумма чисел:", a + b)`,
    starterTemplate: `# 6 класс: Сложение двух чисел
# Запросите два целых числа и выведите их сумму
a = int(input("Введите первое число: "))
b = int(input("Введите второе число: "))
`,
    createdAt: '2026-09-19T11:00:00Z',
  },
  {
    id: 'asg_calc',
    classId: 'cls_cs_7',
    className: 'Информатика 7 «Б» класс · Ветвления if/else',
    grade: 7,
    title: 'Python: Проверка знака числа',
    description: 'Запросить число x и проверить через if/else: если x > 0 — вывести «Положительное», иначе — «Отрицательное или ноль».',
    submissionType: 'code',
    questionCount: 3,
    answerMode: 'voice_or_text',
    timerSeconds: 15,
    allowRetakes: false,
    autoSubmit: true,
    scoreVisibility: 'after_review',
    referenceCode: `x = int(input("Введите число: "))

if x > 0:
    print("Положительное")
else:
    print("Отрицательное или ноль")`,
    starterTemplate: `# 7 класс: Ветвление if/else
# Запросите число x и проверьте, больше ли оно нуля
x = int(input("Введите число: "))
`,
    createdAt: '2026-09-15T14:30:00Z',
  },
  {
    id: 'asg_game',
    classId: 'cls_cs_8',
    className: 'Информатика 8 «А» класс · Основы алгоритмов',
    grade: 8,
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
    starterTemplate: `secret = 42

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
    createdAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'asg_grade_9',
    classId: 'cls_cs_9',
    className: 'Информатика 9 «А» класс · Списки и циклы',
    grade: 9,
    title: 'Python: Подсчет четных чисел',
    description: 'Пройти циклом for по списку чисел numbers, проверить условие четности num % 2 == 0 и сосчитать общее количество.',
    submissionType: 'code',
    questionCount: 3,
    answerMode: 'voice_or_text',
    timerSeconds: 15,
    allowRetakes: false,
    autoSubmit: true,
    scoreVisibility: 'after_review',
    referenceCode: `numbers = [12, 5, 8, 19, 24, 7, 30]
count = 0

for num in numbers:
    if num % 2 == 0:
        count = count + 1

print("Количество четных чисел:", count)`,
    starterTemplate: `# 9 класс: Подсчет четных чисел
numbers = [12, 5, 8, 19, 24, 7, 30]
count = 0
`,
    createdAt: '2026-09-17T09:00:00Z',
  },
  {
    id: 'asg_grade_10',
    classId: 'cls_cs_10',
    className: 'Информатика 10 «А» класс · Функции def',
    grade: 10,
    title: 'Python: Функция площади прямоугольника',
    description: 'Создать функцию def rectangle_area(w, h), которая возвращает ширину умноженную на высоту.',
    submissionType: 'code',
    questionCount: 3,
    answerMode: 'voice_or_text',
    timerSeconds: 15,
    allowRetakes: false,
    autoSubmit: true,
    scoreVisibility: 'after_review',
    referenceCode: `def rectangle_area(w, h):
    return w * h

w = float(input("Ширина: "))
h = float(input("Высота: "))
print("Площадь:", rectangle_area(w, h))`,
    starterTemplate: `# 10 класс: Функция площади прямоугольника
def rectangle_area(w, h):
    return w * h
`,
    createdAt: '2026-09-16T12:00:00Z',
  },
  {
    id: 'asg_grade_11',
    classId: 'cls_cs_11',
    className: 'Информатика 11 «А» класс · Структуры данных',
    grade: 11,
    title: 'Python: Телефонный справочник (словари)',
    description: 'Создать словарь contacts с именами и номерами, запросить имя через input() и вывести телефон контакта.',
    submissionType: 'code',
    questionCount: 3,
    answerMode: 'voice_or_text',
    timerSeconds: 15,
    allowRetakes: false,
    autoSubmit: true,
    scoreVisibility: 'after_review',
    referenceCode: `contacts = {"Алихан": "+77011112233", "Динара": "+77025556677"}
name = input("Введите имя: ")

if name in contacts:
    print("Номер телефона:", contacts[name])
else:
    print("Контакт не найден")`,
    starterTemplate: `# 11 класс: Телефонный справочник (словари)
contacts = {"Алихан": "+77011112233", "Динара": "+77025556677"}
name = input("Введите имя: ")
`,
    createdAt: '2026-09-14T15:00:00Z',
  }
];

export const SEEDED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_arman_1',
    assignmentId: 'asg_game',
    studentId: 'user_student_arman',
    studentName: 'Арман Ж.',
    studentEmail: '',
    submittedAt: '2026-09-22T14:20:00Z',
    fileName: 'guess_game.py',
    githubUrl: 'https://github.com/arman-dev/guess-game',
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
  }
];

export const SEEDED_DEFENSE_SESSIONS: Record<string, DefenseSession> = {
  'def_arman_1': {
    id: 'def_arman_1',
    submissionId: 'sub_arman_1',
    studentId: 'user_student_arman',
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
      teacherId: 'user_teacher_sasahokage',
      overrideScore: 92,
      studentFeedback: 'Отличная защита, Арман! Ты прекрасно понимаешь, как работает цикл while и почему нужно преобразование int(input()).',
      privateNote: 'Код написал сам. Отвечал уверенно, без пауз. Твердая пятерка за проект.',
      reviewedAt: '2026-09-22T15:10:00Z',
      status: 'verified'
    }
  }
};

export const SEEDED_CLASS_INSIGHTS: ClassInsight = {
  weakSkills: [
    { skill: 'Ветвление логики', score: 89 },
    { skill: 'Управление циклом', score: 92 },
    { skill: 'Типы данных', score: 95 }
  ],
  conceptHeatmap: [
    {
      studentId: 'user_student_arman',
      studentName: 'Арман Ж. (@student)',
      scores: {
        'Типы данных': 95,
        'Управление циклом': 92,
        'Ветвление логики': 89
      },
      overall: 92
    }
  ]
};

