/**
 * Specialized Speech-to-Text Enhancement Service for Coding & Oral Defenses.
 * 
 * Provides:
 * 1. Phonetic & Jargon Normalization (maps spoken Russian slang and pronunciation to exact Python syntax).
 * 2. Grammar Biasing via Web Speech API SpeechGrammarList (JSGF).
 * 3. Real-time technical token extraction for UI badges.
 * 4. Backwards-compatible startSpeechRecognition callback.
 */

export interface NormalizedSpeechResult {
  raw: string;
  normalized: string;
  detectedTokens: string[];
}

export class SpeechService {
  /**
   * Multi-word phrases mapped first to avoid nested re-replacements.
   * Note: uses Cyrillic-safe word boundaries instead of ASCII-only `\b`.
   */
  private static readonly PHRASE_MAP: Array<{ pattern: RegExp; replacement: string; token: string }> = [
    // int(input()) / float(input()) / str(input())
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(инт\s+инпут[а-яё]*|инт\s+от\s+инпута|инт\s+скобка\s+инпут|int\s+input|инт\s+импут[а-яё]*)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'int(input())', token: 'int(input())' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(флоат\s+инпут[а-яё]*|флот\s+инпут[а-яё]*|float\s+input|флоут\s+инпут)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'float(input())', token: 'float(input())' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(стр\s+инпут[а-яё]*|стринг\s+инпут[а-яё]*|str\s+input)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'str(input())', token: 'str(input())' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(пользовательский\s+ввод|ввод\s+с\s+клавиатуры|ввод\s+пользователя)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'input() (ввод пользователя)', token: 'input()' },

    // while True / while
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(вайл\s+тру|вайл\s+true|while\s+true|вайл\s+трю|вайл\s+правда|бесконечный\s+цикл|вечный\s+цикл)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'while True', token: 'while True' },

    // count += 1 / count = count + 1
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(каунт\s+плюс\s+один|каунт\s+плюс\s+1|count\s+плюс\s+1|count\s*\+=\s*1|увеличить\s+счетчик|плюс\s+равно\s+1|плюс\s+равно\s+один)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'count += 1', token: 'count += 1' },

    // b != 0 / comparisons
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(b\s+не\s+равно\s+0|б\s+не\s+равно\s+0|не\s+равно\s+нулю|не\s+равно\s+0|восклицательный\s+знак\s+равно\s+ноль|проверка\s+на\s+ноль)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'b != 0', token: 'b != 0' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(два\s+знака\s+равно|равно\s+равно|двойное\s+равно)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: '==', token: '==' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(не\s+равно|восклицательный\s+знак\s+равно)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: '!=', token: '!=' },

    // num % 2 == 0
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(процент\s+два|процент\s+2|остаток\s+на\s+два|остаток\s+от\s+деления\s+на\s+два|деление\s+по\s+модулю\s+два|проверка\s+на\s+четность)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'num % 2 == 0', token: '% 2 == 0' },

    // Loops
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(цикл\s+фор|цикл\s+for|цикл\s+фо|проход\s+циклом|итерация\s+по\s+списку)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'цикл for', token: 'for' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(выход\s+из\s+цикла|прервать\s+цикл|остановить\s+цикл)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'break', token: 'break' },

    // Print to console
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(вывод\s+в\s+консоль|печать\s+в\s+консоль|выводит\s+на\s+экран)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'print()', token: 'print()' },

    // Errors
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(зеро\s+дивижн|зеро\s+дивижен|деление\s+на\s+ноль|zero\s+division)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'ZeroDivisionError', token: 'ZeroDivisionError' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(валью\s+эррор|валуе\s+эррор|ошибка\s+значения)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'ValueError', token: 'ValueError' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(тайп\s+эррор|ошибка\s+типа)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'TypeError', token: 'TypeError' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(индекс\s+эррор|выход\s+за\s+границы)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'IndexError', token: 'IndexError' }
  ];

  /**
   * Single-word terms mapped in stage 2.
   */
  private static readonly WORD_MAP: Array<{ pattern: RegExp; replacement: string; token: string }> = [
    // input variants
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(инпут[а-яё]*|импут[а-яё]*|ин\s*пут|им\s*пут|инпат|input)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'input()', token: 'input()' },

    // int variants
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(инт[а-яё]*|int)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'int()', token: 'int()' },

    // float variants
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(флоат[а-яё]*|флот[а-яё]*|флоут|float)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'float()', token: 'float()' },

    // break variants
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(брейк[а-яё]*|брек[а-яё]*|брэйк[а-яё]*|brake|break)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'break', token: 'break' },

    // continue variants
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(континью|континю|континуе|continue)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'continue', token: 'continue' },

    // conditions
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(элиф[а-яё]*|эл\s+иф|эль\s+иф|elif)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'elif', token: 'elif' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(элс|элзе|else)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'else', token: 'else' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(иф|if)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'if', token: 'if' },

    // print variants
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(принт[а-яё]*|print)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'print()', token: 'print()' },

    // variables & loops
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(каунт[а-яё]*|каут|коунт|count)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'count', token: 'count' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(вайл[а-яё]*|вайлд|while)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'while', token: 'while' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(секрет[а-яё]*|сикрет|secret)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'secret', token: 'secret' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(гесс[а-яё]*|гуесс|guess)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'guess', token: 'guess' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(намберс|намберз|numbers)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'numbers', token: 'numbers' },

    // data types & structures
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(булеан|булиан|булево|бул|bool)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'bool', token: 'bool' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(стринг[а-яё]*|стринга|str)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'str', token: 'str' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(лист[а-яё]*|list)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'list', token: 'list' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(аппенд[а-яё]*|append)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'append()', token: 'append()' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(поп|pop)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'pop()', token: 'pop()' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(лен|len)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'len()', token: 'len()' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(дикт[а-яё]*|dict)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'dict', token: 'dict' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(ренж[а-яё]*|рейндж[а-яё]*|range)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'range()', token: 'range()' },

    // functions & keywords
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(деф|def)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'def', token: 'def' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(ретерн|ритерн|ретурн|return)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'return', token: 'return' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(рандом|random)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'random', token: 'random' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(трай|try)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'try', token: 'try' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(эксепт|except)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'except', token: 'except' }
  ];

  /**
   * Intelligently post-processes raw speech recognition transcript:
   * 1. Multi-word phrase mapping (e.g. "вайл тру" -> "while True").
   * 2. Single-word technical term mapping (e.g. "инт" -> "int()").
   * 3. Extracts detected code tokens for real-time visual feedback badges.
   */
  static processSpeech(rawTranscript: string): NormalizedSpeechResult {
    if (!rawTranscript || !rawTranscript.trim()) {
      return { raw: '', normalized: '', detectedTokens: [] };
    }

    let normalized = rawTranscript;
    const detectedTokensSet = new Set<string>();

    // Stage 1: phrases
    for (const item of this.PHRASE_MAP) {
      if (item.pattern.test(normalized)) {
        normalized = normalized.replace(item.pattern, item.replacement);
        detectedTokensSet.add(item.token);
      }
    }

    // Stage 2: individual words
    for (const item of this.WORD_MAP) {
      if (item.pattern.test(normalized)) {
        normalized = normalized.replace(item.pattern, item.replacement);
        detectedTokensSet.add(item.token);
      }
    }

    return {
      raw: rawTranscript,
      normalized,
      detectedTokens: Array.from(detectedTokensSet)
    };
  }

  /**
   * Generates a JSGF (JSpeech Grammar Format) grammar string
   * to bias the Web Speech API acoustic model towards coding vocabulary.
   */
  static getProgrammingGrammar(): string {
    const terms = [
      'int', 'input', 'float', 'while', 'True', 'False', 'break', 'continue', 'return', 'def',
      'elif', 'else', 'if', 'count', 'print', 'secret', 'guess', 'numbers', 'ZeroDivisionError',
      'ValueError', 'TypeError', 'IndexError', 'SyntaxError', 'str', 'bool', 'list', 'dict',
      'range', 'len', 'append', 'pop', 'for', 'in', 'random',
      'инпут', 'импут', 'инт', 'флоат', 'вайл', 'брейк', 'континью', 'ретерн', 'деф', 'принт',
      'элиф', 'элс', 'иф', 'каунт', 'число', 'строка', 'остаток', 'счетчик', 'деление',
      'ноль', 'переменная', 'цикл', 'условие', 'консоль', 'тип', 'сравнение', 'преобразование'
    ];
    return `#JSGF V1.0; grammar python_grammar; public <term> = ${terms.join(' | ')} ;`;
  }

  /**
   * Initializes browser SpeechRecognition instance with grammar weighting if supported.
   */
  static createRecognition(): any | null {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return null;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';

      // Grammar biasing (safe optional progressive enhancement)
      try {
        const SpeechGrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
        if (SpeechGrammarList) {
          const speechList = new SpeechGrammarList();
          if (typeof speechList.addFromString === 'function') {
            speechList.addFromString(this.getProgrammingGrammar(), 1.0);
            recognition.grammars = speechList;
          }
        }
      } catch (grammarErr) {
        // Grammar biasing is optional, do not fail recognition if browser rejects JSGF
      }

      return recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
      return null;
    }
  }

  /**
   * Starts speech recognition with automatic normalization callback (compatible with AudioRecorder).
   */
  static startSpeechRecognition(
    lang: string = 'ru-RU',
    onResult: (text: string) => void,
    onFallback?: () => void
  ): () => void {
    const recognition = this.createRecognition();
    if (!recognition) {
      if (onFallback) onFallback();
      return () => {};
    }

    try {
      recognition.lang = lang;
      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        const processed = this.processSpeech(current.trim());
        onResult(processed.normalized);
      };
      recognition.onerror = () => {
        if (onFallback) onFallback();
      };
      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch (e) {}
      };
    } catch (e) {
      if (onFallback) onFallback();
      return () => {};
    }
  }
}
