import { expect, test } from '@playwright/test';

test('has an installable manifest for portrait, full-screen play', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.ok()).toBe(true);
  const m = await res.json();
  expect(m).toMatchObject({ display: 'standalone', orientation: 'portrait', lang: 'sl' });
  expect(m.icons.some((i: { sizes: string }) => i.sizes === '512x512')).toBe(true);
});

test('keeps working offline after the first visit', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit does not run service workers offline');
  await page.goto('/');
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active?.state;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Začni' })).toBeVisible();
  await context.setOffline(false);
});
