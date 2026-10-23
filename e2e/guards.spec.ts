import { expect, test } from '@playwright/test';
import { seed } from './helpers';

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

test('break screen has no way to continue and returns after a reload', async ({ page }) => {
  await seed(page, { session: { missionsToday: 3, date: todayIso() } });
  await page.goto('/');
  const main = page.getByRole('main', { name: 'Se vidiva jutri' });
  await expect(main).toBeVisible();
  // Only the parent key exists; nothing lets the child play on.
  const buttons = main.getByRole('button');
  await expect(buttons).toHaveCount(1);
  await expect(buttons.first()).toHaveAccessibleName('Starševski kotiček');
  await page.reload();
  await expect(page.getByRole('main', { name: 'Se vidiva jutri' })).toBeVisible();
});

test('a new day starts without a break and without any penalty', async ({ page }) => {
  await seed(page, { session: { missionsToday: 3, date: '2000-01-01' } });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Začni' })).toBeVisible();
});

test('the map offers at most three missions', async ({ page }) => {
  await seed(page, { unlockedIslands: ['bonus-addsub', 'bonus-compare'] });
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await expect(page.locator('.map-island.is-open')).toHaveCount(3);
  await expect(page.locator('.map-island.is-locked')).toHaveCount(1);
});

test('progress survives closing the app', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await page.getByRole('button', { name: /^Viki/ }).click();
  await page.getByRole('button', { name: 'Izberi' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Začni' }).click();
  await expect(page.getByRole('main', { name: 'Zemljevid otokov' })).toBeVisible();
});

test('no requests leave the device while playing', async ({ page, baseURL }) => {
  const outside: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) outside.push(r.url());
  });
  await seed(page, {});
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await page.locator('.map-island.is-open').first().click();
  await page.getByRole('button', { name: 'Gremo' }).click();
  await expect(page.getByText('Naloga 1 od 5')).toBeVisible();
  expect(outside).toEqual([]);
});

test('every button has an accessible name and a 56 point target', async ({ page }) => {
  await seed(page, {});
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni' }).click();
  await page.locator('.map-island.is-open').first().click();
  await page.getByRole('button', { name: 'Gremo' }).click();
  for (const b of await page.getByRole('button').all()) {
    const name = (await b.getAttribute('aria-label')) ?? '';
    expect(name.length).toBeGreaterThan(0);
    const box = await b.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(56);
    expect(box!.height).toBeGreaterThanOrEqual(56);
  }
});
