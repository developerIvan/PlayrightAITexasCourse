import { test, expect } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('Projects section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('navigation').getByRole('link', { name: 'Projects' }).click();
  });

  test('shows the featured "QA Tasks Demo" project with its case study copy', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'QA Tasks Demo', exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'A full QA pass on an offline-first task manager.' })
    ).toBeVisible();

    const bullets = [
      'Manual test plan covering login, task CRUD, and sync edge cases',
      'Automated regression suite (JUnit, Espresso, Maestro) for core user flows',
      'Instrumented Room DAO + migration tests (v2 → v3)',
      'Exploratory testing focused on the offline outbox sync',
      'Bugs logged, triaged, and verified across iterations',
    ];
    for (const bullet of bullets) {
      await expect(page.getByText(bullet)).toBeVisible();
    }
  });

  test('lists the featured project tech stack chips', async ({ page }) => {
    for (const chip of ['JUnit', 'Espresso', 'Maestro', 'Room Testing', 'Manual Test Design', 'Postman']) {
      await expect(page.getByText(chip, { exact: true }).first()).toBeVisible();
    }
  });

  test('featured project has working "View on GitHub" and "Ask me about it" links', async ({ page }) => {
    const githubLink = page.getByRole('link', { name: 'View on GitHub' });
    const askLink = page.getByRole('link', { name: 'Ask me about it →' });

    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href');

    await askLink.click();
    await expect(page).toHaveURL(/#contact$/);
  });

  test('renders the decorative login + tasks mockup for the featured project', async ({ page }) => {
    await expect(page.getByText('Welcome', { exact: true })).toBeVisible();
    await expect(page.getByText('Log in to manage your tasks')).toBeVisible();
    // The mock "Login" control is a styled <div>, not a real <button>.
    await expect(page.getByText('Login', { exact: true })).toBeVisible();
    await expect(page.getByText('Sync outbox')).toBeVisible();
    await expect(page.getByText('Seed demo data')).toBeVisible();
  });

  test('shows secondary project cards "Project Two" and "Project Three"', async ({ page }) => {
    await expect(page.getByText('Project Two', { exact: true })).toBeVisible();
    await expect(page.getByText('Project Three', { exact: true })).toBeVisible();

    for (const chip of ['Kotlin', 'API Testing', 'CI/CD', 'Java', 'Espresso', 'Automation']) {
      await expect(page.getByText(chip, { exact: true }).first()).toBeVisible();
    }

    const githubLinks = page.getByRole('link', { name: 'GitHub →' });
    await expect(githubLinks).toHaveCount(2);
  });
});
