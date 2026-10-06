// Created by AI
import { Page, Locator } from '@playwright/test';
import { BASE_URL } from './constants';
import { HeaderComponent } from './HeaderComponent';

export type RequirementId = 'REQ-4' | 'REQ-5' | 'REQ-6' | 'REQ-7' | 'REQ-8' | 'REQ-9' | 'REQ-10';

export class HomePage {
  readonly header: HeaderComponent;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly browseCatalogLink: Locator;
  readonly addBookCta: Locator;
  readonly recentlyAddedItems: Locator;
  readonly requirementCards: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    const searchForm = page.getByRole('search');
    this.searchInput = page.getByRole('searchbox', { name: 'Search the catalog' });
    this.searchButton = searchForm.getByRole('button', { name: 'Search' });
    this.browseCatalogLink = page.getByRole('link', { name: 'Browse catalog' });
    this.addBookCta = page.getByRole('link', { name: '+ Add a book' });
    // Card markup is `a.recent-item`; no edit/delete controls are exposed here.
    this.recentlyAddedItems = page.locator('a.recent-item');
    // Card markup is `a.feature`; copy within each card has been observed to
    // drift between sessions, so only rely on the REQ id + heading staying stable.
    this.requirementCards = page.locator('a.feature');
  }

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}#/`);
  }

  async searchCatalog(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** Scoped to REQ id + heading only - card description text is known to drift. */
  getRequirementCard(reqId: RequirementId): Locator {
    return this.requirementCards.filter({ hasText: reqId });
  }

  async goToRequirementCard(reqId: RequirementId): Promise<void> {
    await this.getRequirementCard(reqId).click();
  }

  recentlyAddedItem(title: string): Locator {
    return this.recentlyAddedItems.filter({ hasText: title });
  }
}
