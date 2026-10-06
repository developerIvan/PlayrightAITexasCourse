import { test, expect } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('navigation').getByRole('link', { name: 'Contact' }).click();
  });

  // The Name/Email/Message labels are visual siblings, not <label for="...">,
  // so fields aren't addressable via getByRole(..., { name }) and must be
  // scoped through their wrapping ".text-field" container instead.
  const getFields = (page: import('@playwright/test').Page) => ({
    name: page.locator('.text-field', { has: page.locator('label', { hasText: 'Name' }) }).locator('input'),
    email: page.locator('.text-field', { has: page.locator('label', { hasText: 'Email' }) }).locator('input'),
    message: page.locator('.text-field', { has: page.locator('label', { hasText: 'Message' }) }).locator('textarea'),
    submit: page.getByRole('button', { name: 'Send message' }),
  });

  test('renders the Name, Email, Message fields and Send message button', async ({ page }) => {
    const { name, email, message, submit } = getFields(page);
    await expect(name).toBeVisible();
    await expect(email).toBeVisible();
    await expect(message).toBeVisible();
    await expect(submit).toBeVisible();
  });

  test('marks Name, Email and Message as required, and Email as type="email"', async ({ page }) => {
    const { name, email, message } = getFields(page);
    await expect(name).toHaveAttribute('required', '');
    await expect(email).toHaveAttribute('required', '');
    await expect(email).toHaveAttribute('type', 'email');
    await expect(message).toHaveAttribute('required', '');
  });

  test('blocks submission via native HTML5 validation when fields are empty', async ({ page }) => {
    const { name, submit } = getFields(page);
    await submit.click();

    // The browser keeps focus/validity failure on the first invalid required field
    // instead of navigating away or throwing.
    const isValid = await name.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(false);
  });

  test('rejects a malformed email address via the email input type', async ({ page }) => {
    const { name, email, message } = getFields(page);
    await name.fill('Jane Doe');
    await email.fill('not-an-email');
    await message.fill('Hello, I would like to get in touch.');

    const isEmailValid = await email.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isEmailValid).toBe(false);
  });

  test('accepts a fully filled, valid form', async ({ page }) => {
    const { name, email, message, submit } = getFields(page);
    await name.fill('Jane Doe');
    await email.fill('jane.doe@example.com');
    await message.fill('Hello, I would like to get in touch about a QA role.');

    await expect(name).toHaveValue('Jane Doe');
    await expect(email).toHaveValue('jane.doe@example.com');
    await expect(message).toHaveValue('Hello, I would like to get in touch about a QA role.');

    const formIsValid = await name.evaluate((el: HTMLInputElement) => el.form?.checkValidity());
    expect(formIsValid).toBe(true);

    await submit.click();
  });
});
