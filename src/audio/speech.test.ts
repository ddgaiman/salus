import { afterEach, describe, expect, it, vi } from 'vitest';
import { audioKey, hasSlovenianVoice, initSpeech, speak, stopSpeech } from './speech';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('speech', () => {
  it('uses a stable file name per text', () => {
    expect(audioKey('Gremo')).toBe(audioKey('Gremo'));
    expect(audioKey('Gremo')).not.toBe(audioKey('Začni'));
  });

  it('does not crash when a recording is missing', () => {
    const play = vi.fn(() => Promise.reject(new Error('404')));
    vi.stubGlobal(
      'Audio',
      class {
        play = play;
        pause() {}
        addEventListener() {}
      },
    );
    expect(() => speak('Gremo', 'recorded')).not.toThrow();
    expect(play).toHaveBeenCalled();
    expect(() => stopSpeech()).not.toThrow();
  });

  it('uses the Slovenian system voice when there is one', () => {
    const spoken: string[] = [];
    const synth = {
      getVoices: () => [{ lang: 'en-US' }, { lang: 'sl-SI' }],
      speak: (u: { text: string }) => spoken.push(u.text),
      cancel: () => undefined,
      addEventListener: () => undefined,
    };
    vi.stubGlobal('speechSynthesis', synth);
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        lang = '';
        voice: unknown = null;
        rate = 1;
        constructor(public text: string) {}
      },
    );
    initSpeech();
    expect(hasSlovenianVoice()).toBe(true);
    speak('3 × 4 = ?', 'tts');
    expect(spoken).toEqual(['3 krat 4 je koliko?']);
  });

  it('ignores empty text', () => {
    expect(() => speak('', 'tts')).not.toThrow();
  });
});
