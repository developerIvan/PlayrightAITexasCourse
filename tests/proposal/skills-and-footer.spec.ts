import { test, expect } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('Skills section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('navigation').getByRole('link', { name: 'Skills' }).click();
  });

  test('shows the "QA & testing" and "Tools & practices" skill groups', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'QA & testing' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tools & practices' })).toBeVisible();

    const qaSkills = ['JUnit', 'Espresso', 'Maestro', 'Room migration tests', 'Postman', 'CI pipelines'];
    for (const skill of qaSkills) {
      await expect(page.getByText(skill, { exact: true }).first()).toBeVisible();
    }

    const toolSkills = ['Android Studio', 'Git', 'WorkManager', 'REST APIs', 'Retrofit', 'Agile / Scrum'];
    for (const tool of toolSkills) {
      await expect(page.getByText(tool, { exact: true }).first()).toBeVisible();
    }
  });
});

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('shows the copyright notice and GitHub, LinkedIn, Email links', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByText(/© 2026 Ivan Matamoros/)).toBeVisible();

    await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href');
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href');
    await expect(footer.getByRole('link', { name: 'Email' })).toHaveAttribute('href');
  });
});

test.describe('General page health', () => {
  test('has exactly one <h1> and does not throw unexpected console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(BASE_URL);
    await expect(page.locator('h1')).toHaveCount(1);

    // The only known error on this environment is a missing favicon; fail on anything else.
    const unexpectedErrors = consoleErrors.filter((e) => !e.includes('favicon'));
    expect(unexpectedErrors).toEqual([]);
  });
});
