import { test, expect } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('Desktop navigation bar', () => {
  test.beforeEach(async ({ page }) => {
    // Wide viewport keeps the full nav (About/Skills/Projects/Contact) visible
    // instead of the hamburger menu used at mobile widths.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
  });

  test('shows all four nav links and the theme toggle, no hamburger button', async ({ page }) => {
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Skills' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Projects' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveCount(0);
  });

  const navTargets = [
    { linkName: 'About', hash: '#about', headingText: 'QA-minded, test-first.' },
    { linkName: 'Skills', hash: '#skills', headingText: 'What I work with' },
    { linkName: 'Projects', hash: '#projects', headingText: 'Featured project' },
    { linkName: 'Contact', hash: '#contact', headingText: "Let's talk" },
  ] as const;

  for (const { linkName, hash, headingText } of navTargets) {
    test(`"${linkName}" link navigates to ${hash} and reveals its section`, async ({ page }) => {
      await page.getByRole('navigation').getByRole('link', { name: linkName, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`\\${hash}$`));
      await expect(page.getByText(headingText, { exact: false }).first()).toBeInViewport();
    });
  }
});

test.describe('Mobile navigation menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
  });

  test('collapses the nav behind a hamburger button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    // The full nav-links list stays in the DOM (display:none) rather than being removed.
    await expect(page.getByRole('navigation').getByRole('link', { name: 'About', exact: true })).toBeHidden();
  });

  test('opens the menu and navigates to a section', async ({ page }) => {
    await page.getByRole('button', { name: 'Menu' }).click();

    const skillsLink = page.getByRole('link', { name: 'Skills' });
    await expect(skillsLink).toBeVisible();

    await skillsLink.click();
    await expect(page).toHaveURL(/#skills$/);
  });
});
