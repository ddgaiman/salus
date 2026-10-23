import { expect, test } from '@playwright/test';
import { playMission, seed, solveTask, STORAGE_KEY, wrongTask } from './helpers';

test('path 1: first run goes intro, hero, first easy mission', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await expect(page.getByRole('heading', { name: 'Izberi svojega junaka' })).toBeVisible();
  // Two taps: a card, then Izberi.
  await page.getByRole('button', { name: /^Kamikazi/ }).click();
  await page.getByRole('button', { name: 'Izberi' }).click();
  await expect(page.getByRole('button', { name: 'Gremo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Otok zakladov' })).toBeVisible();
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), STORAGE_KEY);
  expect(saved.heroId).toBe('kamikazi');
});

test('path 2: map, mission, outcome, back to map; break after N missions', async ({ page }) => {
  await seed(page, { settings: { missionsBeforeBreak: 2, voice: 'tts' } });
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await expect(page.getByRole('main', { name: 'Zemljevid otokov' })).toBeVisible();

  await page.locator('.map-island.is-open').first().click();
  await playMission(page);
  await page.getByRole('button', { name: 'Na zemljevid' }).click();
  await expect(page.getByRole('main', { name: 'Zemljevid otokov' })).toBeVisible();

  await page.locator('.map-island.is-open').first().click();
  await playMission(page);
  // The last mission of the day leads to the break, never to another mission.
  await page.getByRole('button', { name: 'K Brezzobemu' }).click();
  await expect(page.getByRole('heading', { name: 'Se vidiva jutri' })).toBeVisible();
});

test('path 3: mistakes give a hint, then an explanation, then the method', async ({ page }) => {
  await seed(page, {});
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await page.locator('.map-island.is-open').first().click();
  await page.getByRole('button', { name: 'Gremo' }).click();

  await wrongTask(page);
  await expect(page.locator('.bubble')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await wrongTask(page);
  const dialog = page.getByRole('dialog', { name: 'Poglejva skupaj' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Poskusim' }).click();
  await expect(dialog).toHaveCount(0);

  await wrongTask(page);
  await expect(page.getByText('Zdaj vpiši odgovor sam.')).toBeVisible();

  await solveTask(page);
  await expect(page.getByRole('button', { name: 'Naprej' })).toBeVisible();
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), STORAGE_KEY);
  expect(saved.reviewQueue).toHaveLength(1);
  expect(saved.log[0].score).toBe(0);
});

test('path 4: parent key, adult gate, parent corner', async ({ page }) => {
  await seed(page, {});
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await page.getByRole('button', { name: 'Starševski kotiček' }).click();
  await expect(page.getByRole('main', { name: 'Samo za odrasle' })).toBeVisible();

  // A wrong answer keeps the gate closed.
  await page.getByRole('button', { name: 'Številka 1', exact: true }).click();
  await page.getByRole('button', { name: 'Vstopi' }).click();
  await expect(page.getByText('To ni pravilno. Poskusite znova.')).toBeVisible();

  const question = await page.getByText(/Koliko je \d+ × \d+\?/).textContent();
  const [, a, b] = question!.match(/(\d+) × (\d+)/)!;
  for (const d of String(Number(a) * Number(b)))
    await page.getByRole('button', { name: `Številka ${d}`, exact: true }).click();
  await page.getByRole('button', { name: 'Vstopi' }).click();

  await expect(page.getByRole('main', { name: 'Starševski kotiček' })).toBeVisible();
  await expect(page.getByTestId('skill-addsub')).toContainText('Raven 1 od 4');
  await page.getByRole('button', { name: 'Manj misij' }).click();
  await expect(page.getByTestId('break-setting')).toHaveText('2');
  await page.getByRole('button', { name: 'Zapri' }).click();
  await expect(page.getByRole('main', { name: 'Zemljevid otokov' })).toBeVisible();
});
