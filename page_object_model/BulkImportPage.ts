// Created by AI
import { Page, Locator } from '@playwright/test';
import { BASE_URL } from './constants';
import { HeaderComponent } from './HeaderComponent';

export class BulkImportPage {
  readonly header: HeaderComponent;
  readonly downloadTemplateButton: Locator;
  /** Visually hidden (`input.sr-only`) behind a styled drop-zone. */
  readonly fileInput: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.downloadTemplateButton = page.getByRole('button', { name: 'Download CSV template' });
    this.fileInput = page.locator('input[type="file"]');
  }

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}#/import`);
  }

  /** setInputFiles works on the hidden input directly - no need to simulate drag-and-drop. */
  async importFile(path: string): Promise<void> {
    await this.fileInput.setInputFiles(path);
  }
}
