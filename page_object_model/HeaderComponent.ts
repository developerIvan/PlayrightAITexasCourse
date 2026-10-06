// Created by AI
import { Page, Locator } from '@playwright/test';

export type Role = 'patron' | 'librarian' | 'admin';

/**
 * The nav bar + role switcher present on every route. Composed into every
 * page object as `readonly header: HeaderComponent` rather than duplicated.
 */
export class HeaderComponent {
  readonly brandLink: Locator;
  readonly menuToggle: Locator;
  readonly catalogLink: Locator;
  readonly addBookLink: Locator;
  readonly bulkImportLink: Locator;
  readonly subjectsAuthorsLink: Locator;
  readonly activityLink: Locator;
  readonly adminLink: Locator;
  readonly roleSelect: Locator;

  constructor(private readonly page: Page) {
    const nav = page.getByRole('navigation');
    this.brandLink = page.getByRole('link', { name: 'Inflecta Library' });
    this.menuToggle = page.getByRole('button', { name: 'Menu' });
    this.catalogLink = nav.getByRole('link', { name: 'Catalog' });
    this.addBookLink = nav.getByRole('link', { name: 'Add book' });
    this.bulkImportLink = nav.getByRole('link', { name: 'Bulk import' });
    this.subjectsAuthorsLink = nav.getByRole('link', { name: 'Subjects & authors' });
    this.activityLink = nav.getByRole('link', { name: 'Activity' });
    this.adminLink = nav.getByRole('link', { name: 'Admin' });
    this.roleSelect = page.getByLabel('Role');
  }

  /**
   * The role <select> is the only element in the app with real option
   * values ('patron' | 'librarian' | 'admin') - use them, not label text.
   */
  async signInAs(role: Role): Promise<void> {
    await this.roleSelect.selectOption(role);
  }

  async navigateTo(
    section: 'Catalog' | 'Add book' | 'Bulk import' | 'Subjects & authors' | 'Activity' | 'Admin'
  ): Promise<void> {
    await this.page.getByRole('navigation').getByRole('link', { name: section }).click();
  }
}
