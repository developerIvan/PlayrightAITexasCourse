// Created by AI
import { Page, Locator } from '@playwright/test';
import { BASE_URL } from './constants';
import { HeaderComponent } from './HeaderComponent';
import { ConfirmDialog } from './ConfirmDialog';

export class BookDetailPage {
  readonly header: HeaderComponent;
  readonly catalogBreadcrumbLink: Locator;
  readonly editBookLink: Locator;
  readonly deleteButton: Locator;
  readonly authorLinks: Locator;
  readonly subjectLinks: Locator;
  readonly keywordTags: Locator;
  readonly externalEbookLinks: Locator;
  /** Same single-link card shape as Home's "recently added" (`a.rel`), not `article.book`. */
  readonly relatedBooks: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.catalogBreadcrumbLink = page.getByRole('link', { name: 'Catalog', exact: true });
    this.editBookLink = page.getByRole('link', { name: 'Edit book' });
    this.deleteButton = page.getByRole('button', { name: 'Delete', exact: true });
    this.authorLinks = page.locator('a[href*="catalog?author="]');
    this.subjectLinks = page.locator('a.plain[href*="catalog?subject="]');
    this.keywordTags = page.locator('a.kw-tag');
    this.externalEbookLinks = page.locator('a[href^="http"]:not([href*="192.168"])');
    this.relatedBooks = page.locator('a.rel');
  }

  async goto(bookId: string): Promise<void> {
    await this.page.goto(`${BASE_URL}#/books/${bookId}`);
  }

  relatedBook(title: string): Locator {
    return this.relatedBooks.filter({ hasText: title });
  }

  /**
   * Delete confirmation behavior is unverified live (destructive clicks are
   * blocked against the shared app per this project's QA notes). Only use
   * against an isolated/disposable instance, never the shared one.
   */
  async clickDelete(): Promise<ConfirmDialog> {
    await this.deleteButton.click();
    return new ConfirmDialog(this.page);
  }
}
