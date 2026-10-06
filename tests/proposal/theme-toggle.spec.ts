import { test, expect } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('page loads with a valid initial data-theme attribute', async ({ page }) => {
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(['light', 'dark']).toContain(theme);
  });

  test('clicking the toggle flips data-theme between light and dark', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle theme' });

    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await toggle.click();
    const afterFirstClick = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(afterFirstClick).not.toBe(initialTheme);

    await toggle.click();
    const afterSecondClick = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(afterSecondClick).toBe(initialTheme);
  });

  test('persists the selected theme to localStorage', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle theme' });
    await toggle.click();

    const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe(themeAttr);
  });

  test('keeps the chosen theme after a page reload', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle theme' });
    await toggle.click();
    const themeBeforeReload = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    await page.reload();

    // data-theme is applied from localStorage via an effect after mount, so poll for it
    // instead of reading immediately after reload.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
      .toBe(themeBeforeReload);
  });
});
