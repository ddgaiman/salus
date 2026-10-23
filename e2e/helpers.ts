import { expect, type Page } from '@playwright/test';

export const STORAGE_KEY = 'zau:v1';

/** Seeds a saved game before the app loads. */
export async function seed(page: Page, patch: Record<string, unknown>) {
  await page.addInitScript(
    ([key, p]) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const skill = { level: 1, window: [], mastered: false };
      const base = {
        schemaVersion: 1,
        heroId: 'viki',
        skills: { addsub: skill, compare: skill, muldiv: skill },
        reviewQueue: [],
        dragonStage: 1,
        abilities: [],
        unlockedIslands: [],
        dragonBook: [],
        session: { missionsToday: 0, date: today },
        settings: { missionsBeforeBreak: 3, voice: 'tts' },
        log: [],
      };
      localStorage.setItem(key as string, JSON.stringify({ ...base, ...(p as object) }));
    },
    [STORAGE_KEY, patch] as const,
  );
}

async function answerOf(page: Page): Promise<number> {
  return Number(await page.getByTestId('board').getAttribute('data-answer'));
}

/** Gives an answer by tapping: a choice button, an island, or the number pad. */
export async function give(page: Page, value: number) {
  const board = page.getByTestId('board');
  const choice = board.getByRole('button', {
    name: new RegExp(`(^Izberi ${value}$)|(^Otok, ${value} )`),
  });
  if ((await board.locator('.choice, .island-btn').count()) > 0) {
    if ((await choice.count()) > 0) {
      await choice.first().click();
    } else {
      // The wrong value is not on screen: pick any other option.
      const right = await answerOf(page);
      const options = board.locator('.choice, .island-btn');
      for (let i = 0; i < (await options.count()); i++) {
        const label = (await options.nth(i).getAttribute('aria-label')) ?? '';
        if (!label.match(new RegExp(`\\b${right}\\b`))) {
          await options.nth(i).click();
          return;
        }
      }
    }
    return;
  }
  for (const d of String(value)) {
    await page.getByRole('button', { name: `Številka ${d}`, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Preveri' }).click();
}

export async function solveTask(page: Page) {
  await give(page, await answerOf(page));
}

export async function wrongTask(page: Page) {
  await give(page, (await answerOf(page)) + 1);
}

/** Plays one full mission from S4 and stops on S7. */
export async function playMission(page: Page) {
  await page.getByRole('button', { name: 'Gremo' }).click();
  for (let i = 1; i <= 5; i++) {
    await expect(page.getByText(`Naloga ${i} od 5`)).toBeVisible();
    await solveTask(page);
    await page.getByRole('button', { name: i === 5 ? 'Konec misije' : 'Naprej' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Misija opravljena!' })).toBeVisible();
}
