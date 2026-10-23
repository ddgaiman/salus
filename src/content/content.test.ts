import { describe, expect, it } from 'vitest';
import { explain } from '../engine/explain';
import { generateTask } from '../engine/generators';
import { HERO_IDS, LEVELS, SKILL_IDS } from '../engine/types';
import {
  abilityOf,
  bookText,
  format,
  heroes,
  hintText,
  hints,
  islandOf,
  missionsFor,
  pluralIndex,
  praise,
  promptText,
  stageOf,
  stepText,
  toSpeech,
  ui,
} from './index';

describe('format', () => {
  it('uses Slovenian plural forms', () => {
    expect([1, 2, 3, 4, 5, 11, 101, 102, 103, 0].map(pluralIndex)).toEqual([
      0, 1, 2, 2, 3, 3, 0, 1, 2, 3,
    ]);
    const t = '{n:kovanec|kovanca|kovanci|kovancev}';
    expect([1, 2, 3, 5].map((n) => format(t, { n }))).toEqual([
      '1 kovanec',
      '2 kovanca',
      '3 kovanci',
      '5 kovancev',
    ]);
  });

  it('fills values, shows a real minus and leaves unknown keys', () => {
    expect(format('{a} {op} {b} = ?', { a: 8, op: '-', b: 3 })).toBe('8 − 3 = ?');
    expect(format('{x}', {})).toBe('{x}');
  });

  it('reads math symbols as words', () => {
    expect(toSpeech('8 − 3 = ?')).toBe('8 minus 3 je koliko?');
    expect(toSpeech('3 × 4 = 12')).toBe('3 krat 4 je 12');
    expect(toSpeech('12 : 4 = 3')).toBe('12 deljeno z 4 je 3');
    expect(toSpeech('2 + 2')).toBe('2 plus 2');
  });
});

describe('content completeness', () => {
  it('has all three heroes', () => {
    expect(Object.keys(heroes).sort()).toEqual([...HERO_IDS].sort());
  });

  it('has hints for the 1st and 2nd mistake for every skill, level and hero', () => {
    for (const skill of SKILL_IDS)
      for (const level of LEVELS)
        for (const mistake of [1, 2] as const)
          for (const hero of HERO_IDS) {
            const text = hintText(skill, level, mistake, hero);
            expect(text, `${skill}/${level}/${mistake}/${hero}`).toBeTruthy();
          }
  });

  it('never reveals the answer in a hint', () => {
    const all = JSON.stringify(hints);
    expect(all).not.toMatch(/\{(result|answer)\}/);
    // A 1st-mistake hint never contains the answer of a matching task.
    for (const skill of SKILL_IDS)
      for (const level of LEVELS)
        for (let i = 0; i < 30; i++) {
          const task = generateTask(skill, level, `h${i}`);
          if (task.answer <= 10) continue; // small numbers can appear in generic strategy words
          for (const hero of HERO_IDS) {
            const words = hintText(skill, level, 1, hero).match(/\d+/g) ?? [];
            expect(words).not.toContain(String(task.answer));
          }
        }
  });

  it('has at least 3 missions per skill plus a bonus mission', () => {
    for (const skill of SKILL_IDS) {
      expect(missionsFor(skill, false).length).toBeGreaterThanOrEqual(3);
      expect(missionsFor(skill, true).length).toBeGreaterThanOrEqual(1);
      for (const m of [...missionsFor(skill, false), ...missionsFor(skill, true)]) {
        const sentences = m.intro.split(/[.!?]+\s/).filter(Boolean);
        expect(sentences.length).toBeLessThanOrEqual(2);
        expect(m.outro.length).toBeGreaterThan(0);
      }
      expect(islandOf(`island-${skill}`)).toBeDefined();
      expect(islandOf(`bonus-${skill}`)).toBeDefined();
    }
  });

  it('has prompts and explanation templates for every generated task', () => {
    for (const skill of SKILL_IDS)
      for (const level of LEVELS)
        for (let i = 0; i < 40; i++) {
          const task = generateTask(skill, level, `c${i}`);
          const prompt = promptText(task);
          expect(prompt).not.toMatch(/[{}]/);
          const { steps, solution } = explain(task);
          for (const step of [...steps, ...solution]) expect(stepText(step)).not.toMatch(/[{}]/);
        }
  });

  it('throws on a missing explanation template', () => {
    expect(() => stepText({ key: 'nope', params: {} })).toThrow();
  });

  it('has 5 dragon stages, abilities for levels 2 to 4 and book entries for every level', () => {
    for (const stage of [1, 2, 3, 4, 5]) expect(stageOf(stage).name).toBeTruthy();
    for (const skill of SKILL_IDS) {
      for (const level of [2, 3, 4]) expect(abilityOf(`${skill}-${level}`)).toBeDefined();
      for (const level of LEVELS) expect(bookText(skill, level)).toMatch(/^Znaš/);
    }
  });

  it('has praise in every hero tone without "smart" labels', () => {
    for (const hero of HERO_IDS) {
      expect(praise(hero, false, 0)).toBeTruthy();
      expect(praise(hero, true, 7)).toBeTruthy();
    }
    expect(JSON.stringify(ui.feedback)).not.toMatch(/pamet(en|na|ni)/i);
  });
});
