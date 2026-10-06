// Created by AI
import { Page, Locator } from '@playwright/test';
import { BASE_URL } from './constants';
import { HeaderComponent } from './HeaderComponent';

export type ActionFilter = 'All actions' | 'Added' | 'Edited' | 'Deleted' | 'Restored' | 'Bulk import' | 'Erased all';

export class ActivityPage {
  readonly header: HeaderComponent;
  readonly exportCsvButton: Locator;
  readonly filterInput: Locator;
  /** No aria-label captured on this control - scoped positionally as the
   * only <select> in <main>. Flagged in the POM plan for the dev team to
   * add a proper label (e.g. aria-label="Filter by action"). */
  readonly actionFilterSelect: Locator;
  readonly entries: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.exportCsvButton = page.getByRole('button', { name: 'Export CSV' });
    this.filterInput = page.getByPlaceholder('Filter by book or user…');
    this.actionFilterSelect = page.locator('main select');
    this.entries = page.getByRole('listitem');
  }

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}#/activity`);
  }

  async filterByAction(action: ActionFilter): Promise<void> {
    await this.actionFilterSelect.selectOption({ label: action });
  }

  async filterByText(term: string): Promise<void> {
    await this.filterInput.fill(term);
  }

  /** Match by content, not index - log ordering is newest-first and shifts as tests run. */
  entryFor(text: string): Locator {
    return this.entries.filter({ hasText: text });
  }
}
