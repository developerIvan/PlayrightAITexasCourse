import { test, expect } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('Landing page - hero and about section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('loads with the correct title and header brand', async ({ page }) => {
    await expect(page).toHaveTitle('Ivan Matamoros — Portfolio');
    await expect(page.getByText('Ivan Matamoros', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Mobile QA & Test Automation')).toBeVisible();
  });

  test('displays the hero heading, intro copy and CTA links', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: /Building & testing.*mobile apps that hold up\./s })
    ).toBeVisible();

    await expect(page.getByText(/mobile QA and test automation engineer/i)).toBeVisible();

    const viewProjects = page.getByRole('link', { name: 'View projects' });
    const getInTouch = page.getByRole('link', { name: 'Get in touch' });
    await expect(viewProjects).toHaveAttribute('href', '#projects');
    await expect(getInTouch).toHaveAttribute('href', '#contact');
  });

  test('shows the four hero skill chips', async ({ page }) => {
    for (const chip of ['Manual QA', 'Test Automation', 'Espresso', 'Maestro']) {
      await expect(page.getByText(chip, { exact: true }).first()).toBeVisible();
    }
  });

  test('renders the decorative Tasks demo widget with 3 items', async ({ page }) => {
    await expect(page.getByText('Tasks', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('3 items')).toBeVisible();
    await expect(page.getByText('Write regression suite')).toBeVisible();
    await expect(page.getByText('Fix DB migration')).toBeVisible();
    await expect(page.getByText('Ship offline outbox')).toBeVisible();

    // Task checkboxes are decorative and must not be interactive.
    const checkboxes = page.locator('main').getByRole('checkbox');
    await expect(checkboxes.first()).toBeDisabled();
  });

  test('"View projects" and "Get in touch" scroll to the right sections', async ({ page }) => {
    await page.getByRole('link', { name: 'View projects' }).click();
    await expect(page).toHaveURL(/#projects$/);

    await page.getByRole('link', { name: 'Get in touch' }).click();
    await expect(page).toHaveURL(/#contact$/);
  });

  test('About section explains the QA-first background', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'QA-minded, test-first.' })).toBeVisible();
    await expect(page.getByText(/writing manual test plans, building automated regression suites/i)).toBeVisible();
    await expect(page.getByText(/themed after QA Tasks Demo/i)).toBeVisible();
  });
});
