// Created by AI
import { Page, Locator } from '@playwright/test';
import { BASE_URL } from './constants';
import { HeaderComponent } from './HeaderComponent';
import { ConfirmDialog } from './ConfirmDialog';

/** One `article.book` card. Markup is specific to Catalog - Home and Book
 * detail render similarly-purposed cards with different markup (`a.recent-item`,
 * `a.rel`), so this component is intentionally not shared across pages. */
export class BookCardComponent {
  readonly root: Locator;
  readonly coverLink: Locator;
  readonly titleLink: Locator;
  readonly editLink: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page, title: string) {
    this.root = page.locator('article.book').filter({ hasText: title });
    this.coverLink = this.root.locator('a.cover-link');
    this.titleLink = this.root.locator('a.title');
    this.editLink = this.root.getByRole('link', { name: 'Edit' });
    this.deleteButton = this.root.getByRole('button', { name: 'Delete' });
  }

  async open(): Promise<void> {
    await this.titleLink.click();
  }

  async edit(): Promise<void> {
    await this.editLink.click();
  }

  /**
   * Created By AI - added for test-artifacts/book-management-test-plan.feature
   * Scenario-11/Scenario-12. The confirmation dialog's exact shape was NOT
   * independently verified live for Delete specifically (every attempt to
   * click Delete against the shared app - via direct click and via
   * browser_evaluate - was blocked by this environment's safety policy, as
   * documented throughout this project's QA notes). This assumes the same
   * role="alertdialog" + Cancel/confirm pattern verified live for "Reset to
   * sample data?" and "Merge "Author"" - confirm this assumption by running
   * the generated test and inspecting its pass/fail result.
   */
  async delete(): Promise<ConfirmDialog> {
    await this.deleteButton.click();
    return new ConfirmDialog(this.root.page());
  }
}

export class CatalogPage {
  readonly header: HeaderComponent;
  readonly exportListButton: Locator;
  readonly addBookLink: Locator;
  readonly searchInput: Locator;
  readonly authorFilter: Locator;
  readonly editionLanguageFilter: Locator;
  readonly editionFormatFilter: Locator;
  readonly inStockOnlyCheckbox: Locator;
  readonly sortSelect: Locator;
  readonly gridViewButton: Locator;
  readonly listViewButton: Locator;
  readonly subjectChips: Locator;
  readonly bookCards: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.exportListButton = page.getByRole('button', { name: 'Export list' });
    this.addBookLink = page.getByRole('link', { name: '+ Add book' });
    this.searchInput = page.getByRole('searchbox', { name: 'Search' });
    this.authorFilter = page.getByLabel('Author');
    this.editionLanguageFilter = page.getByLabel('Edition language');
    this.editionFormatFilter = page.getByLabel('Edition format');
    this.inStockOnlyCheckbox = page.getByRole('checkbox');
    this.sortSelect = page.getByLabel('Sort');
    // Raw glyph accessible names (▦ / ☰) - brittle; flagged in the POM plan
    // for the dev team to add proper aria-labels.
    this.gridViewButton = page.getByRole('button', { name: '▦' });
    this.listViewButton = page.getByRole('button', { name: '☰' });
    this.subjectChips = page.locator('button.chip');
    this.bookCards = page.locator('article.book');
  }

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}#/catalog`);
  }

  bookCard(title: string): BookCardComponent {
    return new BookCardComponent(this.page, title);
  }

  subjectChip(name: string): Locator {
    return this.subjectChips.filter({ hasText: name });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }
}
