// Created by AI
import { Page, Locator } from '@playwright/test';
import { BASE_URL } from './constants';
import { HeaderComponent } from './HeaderComponent';
import { ConfirmDialog } from './ConfirmDialog';

export class AdminPage {
  readonly header: HeaderComponent;
  readonly downloadBackupButton: Locator;
  /** Visually hidden (`input.sr-only`) behind a styled "Choose backup file…" control. */
  readonly restoreFileInput: Locator;
  readonly resetToSampleDataButton: Locator;
  /** The only button in the app with the `danger` class (Delete/Remove use `outline-danger`). */
  readonly eraseAllBooksButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.downloadBackupButton = page.getByRole('button', { name: 'Download backup' });
    this.restoreFileInput = page.locator('input[type="file"]');
    this.resetToSampleDataButton = page.getByRole('button', { name: 'Reset to sample data' });
    this.eraseAllBooksButton = page.getByRole('button', { name: 'Erase all books' });
  }

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}#/admin`);
  }

  async downloadBackup(): Promise<void> {
    await this.downloadBackupButton.click();
  }

  async restoreBackup(path: string): Promise<void> {
    await this.restoreFileInput.setInputFiles(path);
  }

  /**
   * Safe, reversible-by-design - confirmed live via its "Reset to sample
   * data?" alertdialog. This is this project's standard way to clean up
   * test pollution between runs; prefer it over leaving data dirty.
   */
  async resetToSampleData(): Promise<void> {
    await this.resetToSampleDataButton.click();
    const dialog = new ConfirmDialog(this.page);
    await dialog.confirm();
  }

  /**
   * Irreversible. Confirmation-dialog behavior is UNVERIFIED live - every
   * destructive click attempt against the shared app has been blocked by
   * this project's own safety policy. Do not call this against the shared
   * instance; only against an isolated/disposable one.
   */
  async eraseAllBooks(): Promise<ConfirmDialog> {
    await this.eraseAllBooksButton.click();
    return new ConfirmDialog(this.page);
  }
}
