import { toSpeech } from '../content/format';
import { hashSeed } from '../engine/rng';

export type VoiceMode = 'tts' | 'recorded';

/** File name (without extension) of the recording for a text in public/assets/audio. */
export function audioKey(text: string): string {
  return hashSeed(text).toString(36);
}

let slovenianVoice: SpeechSynthesisVoice | null = null;
let current: HTMLAudioElement | null = null;

function synth(): SpeechSynthesis | null {
  try {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
  } catch {
    return null;
  }
}

function pickVoice() {
  const s = synth();
  if (!s) return;
  slovenianVoice = s.getVoices().find((v) => v.lang.toLowerCase().startsWith('sl')) ?? null;
}

/** Voices load asynchronously on iOS; pick again whenever the list changes. */
export function initSpeech() {
  const s = synth();
  if (!s) return;
  pickVoice();
  s.addEventListener?.('voiceschanged', pickVoice);
}

export function hasSlovenianVoice(): boolean {
  return slovenianVoice !== null;
}

export function stopSpeech() {
  try {
    synth()?.cancel();
    current?.pause();
  } catch {
    // Nothing is playing.
  }
  current = null;
}

/**
 * Reads a text aloud. Uses the Slovenian system voice when available and allowed,
 * otherwise a recording from public/assets/audio. A missing recording is ignored.
 */
export function speak(text: string, mode: VoiceMode): void {
  if (!text) return;
  stopSpeech();
  try {
    const s = synth();
    if (mode === 'tts' && s && slovenianVoice) {
      const u = new SpeechSynthesisUtterance(toSpeech(text));
      u.lang = 'sl-SI';
      u.voice = slovenianVoice;
      u.rate = 0.95;
      s.speak(u);
      return;
    }
    if (typeof Audio === 'undefined') return;
    const audio = new Audio(`${import.meta.env.BASE_URL}assets/audio/${audioKey(text)}.mp3`);
    current = audio;
    audio.addEventListener('error', () => undefined);
    void audio.play().catch(() => undefined);
  } catch {
    // Speech is a help, never a requirement: the text stays on screen.
  }
}
