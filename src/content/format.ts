export type Params = Record<string, number | string>;

/** Slovenian plural form index: 0 = 1, 1 = 2, 2 = 3 or 4, 3 = other (by the last two digits). */
export function pluralIndex(n: number): 0 | 1 | 2 | 3 {
  const r = Math.abs(n) % 100;
  if (r === 1) return 0;
  if (r === 2) return 1;
  if (r === 3 || r === 4) return 2;
  return 3;
}

/**
 * Fills a template. `{name}` inserts a value; `{name:one|two|few|other}` inserts the number
 * followed by the matching noun form. Minus signs are shown as a proper minus.
 */
export function format(template: string, params: Params = {}): string {
  return template.replace(/\{(\w+)(?::([^}]+))?\}/g, (match, key: string, forms?: string) => {
    const value = params[key];
    if (value === undefined) return match;
    const shown = key === 'op' && value === '-' ? '−' : String(value);
    if (!forms || typeof value !== 'number') return shown;
    const noun = forms.split('|')[pluralIndex(value)];
    return noun ? `${shown} ${noun}` : shown;
  });
}

/** Text prepared for speech synthesis: math symbols read as Slovenian words. */
export function toSpeech(text: string): string {
  return text
    .replace(/\s*\+\s*/g, ' plus ')
    .replace(/\s*[−-]\s(?=\d)/g, ' minus ')
    .replace(/\s*×\s*/g, ' krat ')
    .replace(/\s:\s/g, ' deljeno z ')
    .replace(/\s*=\s*\?/g, ' je koliko?')
    .replace(/\s*=\s*/g, ' je ')
    .replace(/\s+/g, ' ')
    .trim();
}
