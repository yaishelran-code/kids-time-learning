import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const base = process.env.LIVE_URL;
assert.ok(base, 'LIVE_URL is required');
const expectedAsset = process.env.EXPECTED_ASSET;
assert.ok(expectedAsset, 'EXPECTED_ASSET is required to verify the deployed build');
const url = new URL(base);
url.searchParams.set('release', process.env.GITHUB_SHA ?? Date.now().toString());
let deployed = false;
for (let attempt = 0; attempt < 18; attempt++) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const html = await response.text();
    if (response.ok && html.includes(expectedAsset)) { deployed = true; break; }
  } catch { /* Allow Pages/CDN propagation, but never accept a stale build. */ }
  await new Promise(resolve => setTimeout(resolve, 5000));
}
assert.ok(deployed, `Live HTML did not reference ${expectedAsset}`);
const asset = await fetch(new URL(expectedAsset, base));
assert.equal(asset.status, 200, 'Published JavaScript asset must load');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined });
await mkdir('.mvp-smoke', { recursive: true });
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const click = name => page.getByRole('button', { name, exact: true }).click();
    try {
      await page.goto(url.href, { waitUntil: 'networkidle' });
      await click('בואו נתרגל');
      await click('מבנה השעון');
      await click('נלמד קודם');
      const hands = page.getByRole('slider');
      assert.equal(await hands.count(), 2);
      await hands.nth(0).focus(); await page.keyboard.press('ArrowRight');
      await hands.nth(1).focus(); await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('.play-time').innerText(), '8:01');
      await click('חזרה לבית'); await click('בואו נתרגל');
      await click('שעות שלמות'); await click('נתחיל לתרגל'); await click('קריאת שעון');
      for (let n = 0; n < 3; n++) await click('3:00');
      await page.getByRole('heading', { name: 'בואו נעצור רגע', exact: true }).waitFor();
      await click('צריך עזרה?'); await click('חזרה לשאלה');
      const pin = page.locator('input[type=password]:visible');
      await pin.waitFor(); await pin.fill('1212'); await click('אישור קוד הורה');
      await click('1:00'); await click('התרגיל הבא'); await click('חזרה לבית');
      await click('המשך התרגול');
      assert.match(await page.locator('main:visible').innerText(), /תרגיל 2 מתוך/);
      await click('חזרה לבית'); await page.reload({ waitUntil: 'networkidle' });
      assert.match(await page.locator('.reward-totals').innerText(), /10 נקודות/);
      await click('אזור הורה'); await page.locator('input[type=password]:visible').fill('1212');
      await click('אישור קוד הורה'); await click('איפוס התגמולים והאוסף'); await click('ביטול');
      await click('חזרה לבית'); assert.match(await page.locator('.reward-totals').innerText(), /10 נקודות/);
      await click('היום שלי');
      for (const name of ['פעילות בדיקה א', 'פעילות בדיקה ב']) {
        await click('הוספת פעילות'); await page.getByLabel('שם הפעילות', { exact: true }).fill(name);
        await click('שמירת פעילות');
      }
      await click('עריכת פעילות בדיקה א');
      await page.getByLabel('שם הפעילות', { exact: true }).fill('טיוטה שלא נשמרה');
      await click('עריכת פעילות בדיקה ב'); await click('להישאר ולערוך');
      assert.equal(await page.getByLabel('שם הפעילות', { exact: true }).inputValue(), 'טיוטה שלא נשמרה');
      await click('עריכת פעילות בדיקה ב'); await click('לעזוב בלי לשמור');
      assert.equal(await page.getByLabel('שם הפעילות', { exact: true }).inputValue(), 'פעילות בדיקה ב');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
      assert.deepEqual(errors, []);
      await page.screenshot({ path: `.mvp-smoke/live-${viewport.width}.png`, fullPage: true });
      console.log(`Live smoke passed: ${viewport.width}x${viewport.height}`);
    } catch (error) {
      await page.screenshot({ path: `.mvp-smoke/failure-${viewport.width}.png`, fullPage: true }).catch(() => {});
      await writeFile('.mvp-smoke/error.txt', String(error));
      throw error;
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
console.log(`Verified live build ${expectedAsset} at ${base}`);
