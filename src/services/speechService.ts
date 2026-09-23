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
    // while True / while
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(вайл\s+тру|вайл\s+true|while\s+true|вайл\s+трю)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'while True', token: 'while True' },

    // int(input()) / float(input())
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(инт\s+инпут|инт\s+от\s+инпута|int\s+input)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'int(input())', token: 'int(input())' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(флоат\s+инпут|флот\s+инпут|float\s+input)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'float(input())', token: 'float(input())' },

    // count = count + 1 / count += 1
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(каунт\s+плюс\s+один|каунт\s+плюс\s+1|count\s+плюс\s+1|count\s*\+=\s*1)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'count = count + 1', token: 'count = count + 1' },

    // b != 0 / comparisons
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(b\s+не\s+равно\s+0|б\s+не\s+равно\s+0|не\s+равно\s+нулю|не\s+равно\s+0|восклицательный\s+знак\s+равно\s+ноль)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'b != 0', token: 'b != 0' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(два\s+знака\s+равно|равно\s+равно)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: '==', token: '==' },

    // num % 2 == 0
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(процент\s+два|процент\s+2|остаток\s+на\s+два|остаток\s+от\s+деления\s+на\s+два)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: '% 2 (остаток)', token: '% 2' },

    // Errors
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(зеро\s+дивижн|зеро\s+дивижен|деление\s+на\s+ноль)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'ZeroDivisionError', token: 'ZeroDivisionError' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(валью\s+эррор|валуе\s+эррор)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'ValueError', token: 'ValueError' },

    // Loops
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(цикл\s+фор|цикл\s+for|цикл\s+фо)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'цикл for', token: 'for' }
  ];

  /**
   * Single-word terms mapped in stage 2.
   */
  private static readonly WORD_MAP: Array<{ pattern: RegExp; replacement: string; token: string }> = [
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(инт|инта|инту|интом)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'int()', token: 'int()' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(инпут|инпута|инпутом|импут)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'input()', token: 'input()' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(флоат|флот|флоата|флоут)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'float()', token: 'float()' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(брейк|брек|брэйк|брейка|brake)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'break', token: 'break' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(элиф|элифа|эл\s+иф|эль\s+иф)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'elif', token: 'elif' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(элс|элзе)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'else', token: 'else' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(иф)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'if', token: 'if' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(принт|принта|принтом)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'print()', token: 'print()' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(каунт|каут|коунт)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'count', token: 'count' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(вайл|вайлд)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'while', token: 'while' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(секрет|сикрет)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'secret', token: 'secret' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(гесс|гуесс)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'guess', token: 'guess' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(намберс|намберз)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'numbers', token: 'numbers' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(булеан|булиан|булево)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'bool', token: 'bool' },
    { pattern: /(?<=^|[^a-zA-Zа-яА-ЯёЁ0-9_])(стринг|стринга)(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_])/gi, replacement: 'str (строка)', token: 'str' }
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
      'int', 'input', 'float', 'while', 'True', 'break', 'elif', 'else', 'if',
      'count', 'print', 'secret', 'guess', 'numbers', 'ZeroDivisionError',
      'str', 'bool', 'for', 'in', 'число', 'строка', 'остаток', 'счетчик',
      'деление', 'ноль', 'переменная', 'цикл', 'условие'
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

      // Grammar biasing (Chrome/WebKit Web Speech API)
      const SpeechGrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
      if (SpeechGrammarList) {
        const speechList = new SpeechGrammarList();
        speechList.addFromString(this.getProgrammingGrammar(), 1.0);
        recognition.grammars = speechList;
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
