import { defineConfig, devices } from '@playwright/test';

// WebKit is the target browser (iPhone Safari). Where WebKit is not installed,
// E2E_BROWSER=chromium runs the same tests in Chromium with the iPhone 13 viewport.
const browser = process.env.E2E_BROWSER === 'chromium' ? 'chromium' : 'webkit';
const iphone = devices['iPhone 13'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: [
    {
      name: `iphone-13-${browser}`,
      use:
        browser === 'webkit'
          ? { ...iphone }
          : {
              viewport: iphone.viewport,
              deviceScaleFactor: iphone.deviceScaleFactor,
              hasTouch: true,
              isMobile: true,
              browserName: 'chromium',
            },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
