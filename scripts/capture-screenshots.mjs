/**
 * Captures real screenshots of the app to use as onboarding images.
 *
 * The landing carousel (src/components/LandingPage.tsx) automatically uses
 * public/onboarding/{hero,collect,progress,trade}.png when present, and falls
 * back to the built-in SVG/CSS mockups when they are absent.
 *
 * Requirements (run locally — needs a real browser):
 *   npm run build && npm run preview   # serve the app on :4173
 *   npx playwright install chromium    # one-time
 *   node scripts/capture-screenshots.mjs
 *
 * Or override the base URL:  BASE_URL=http://localhost:5173 node scripts/capture-screenshots.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/onboarding');
const BASE = process.env.BASE_URL ?? 'http://localhost:4173';

mkdirSync(OUT, { recursive: true });

const shots = [
  { name: 'hero',     tab: 'album',   prep: async () => {} },
  { name: 'collect',  tab: 'album',   prep: async () => {} },
  { name: 'progress', tab: 'stats',   prep: async () => {} },
  { name: 'trade',    tab: 'trading', prep: async () => {} },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 430, height: 800 },
  deviceScaleFactor: 3,
});

await page.goto(BASE, { waitUntil: 'networkidle' });
// Dismiss the onboarding overlay if shown
await page.evaluate(() => localStorage.setItem('copa2026_onboarded', '1'));
await page.reload({ waitUntil: 'networkidle' });

for (const shot of shots) {
  await page.getByRole('button', { name: new RegExp(shot.tab, 'i') }).click().catch(() => {});
  await shot.prep();
  await page.waitForTimeout(600);
  await page.screenshot({ path: resolve(OUT, `${shot.name}.png`) });
  console.log(`✓ ${shot.name}.png`);
}

await browser.close();
console.log('Done. Screenshots written to public/onboarding/');
