// Created by AI
import { Page, Locator } from '@playwright/test';
import { BASE_URL } from './constants';
import { HeaderComponent } from './HeaderComponent';
import { ConfirmDialog } from './ConfirmDialog';

/**
 * One row in either the Subjects or Authors table. Matching the row by name
 * is trickier than it looks - verified live via two rounds of test failures:
 *
 * 1. An unanchored substring match (`new RegExp(name)`) made "Science" also
 *    match the "Computer Science" row - a real locator-ambiguity bug.
 * 2. A naive `^name` start-anchor then failed for ALL subject rows, because
 *    a Subjects row's accessible name is actually
 *    "#<hexcolor> <name> <N> book(s) Rename Remove" - the row starts with
 *    the color swatch's hex value, not the name. Authors rows have no such
 *    prefix ("<name> <N> book(s) Rename Merge Remove").
 *
 * The regex below handles both shapes: an optional leading hex-color
 * group, then the exact name, then the book-count suffix that follows it
 * in both tables - which is what actually disambiguates "Science" from
 * "Computer Science" (the name must be immediately followed by "<N> book(s)",
 * or the literal text "Unused" for a brand-new entry with zero linked books -
 * verified live via addSubject() producing a row reading "Unused" instead of
 * a "<N> books" link).
 */
export class TaxonomyRow {
  readonly root: Locator;
  readonly bookCountLink: Locator;
  readonly renameButton: Locator;
  readonly removeButton: Locator;

  constructor(protected readonly page: Page, name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    this.root = page.getByRole('row', {
      name: new RegExp(`^(#[0-9a-fA-F]{6}\\s+)?${escaped}\\s+(\\d+\\s+books?|Unused)\\b`),
    });
    this.bookCountLink = this.root.getByRole('link', { name: /books?$/ });
    this.renameButton = this.root.getByRole('button', { name: 'Rename' });
    this.removeButton = this.root.getByRole('button', { name: 'Remove' });
  }

  /**
   * Created By AI - verified live. Clicking Rename replaces the row's name
   * chip with an unlabelled <input> (pre-filled with the current name)
   * inside a <form class="inline">, with "Save"/"Cancel" buttons. The row's
   * accessible name no longer contains the original text once editing
   * starts (the input's value doesn't contribute to row name the way plain
   * text did), so the editing row is re-scoped via the active inline-edit
   * form rather than by re-matching on the original name.
   */
  async rename(newName: string): Promise<void> {
    await this.renameButton.click();
    const editingRow = this.page.locator('tr').filter({ has: this.page.locator('form.inline') });
    await editingRow.getByRole('textbox').fill(newName);
    await editingRow.getByRole('button', { name: 'Save' }).click();
  }

  /**
   * Created By AI - verified live. Clicking Remove opens a role="alertdialog"
   * ("Remove "<name>"? ... Cancel/Remove"), same pattern as the other
   * confirm dialogs in the app - matching CatalogPage's delete() convention.
   */
  async remove(): Promise<ConfirmDialog> {
    await this.removeButton.click();
    return new ConfirmDialog(this.page);
  }
}

/** Authors rows additionally support Merge; Subjects rows do not. */
export class AuthorRow extends TaxonomyRow {
  readonly mergeButton: Locator;

  constructor(page: Page, name: string) {
    super(page, name);
    this.mergeButton = this.root.getByRole('button', { name: 'Merge' });
  }

  /**
   * Created By AI - verified live. Clicking Merge opens a role="alertdialog"
   * titled "Merge "<name>"" with a "Merge into" dropdown and "Cancel"/
   * "Merge authors" buttons - same pattern as delete()/remove(), returning
   * the dialog rather than completing the merge so callers can inspect it,
   * cancel it, or choose a target and confirm.
   */
  async merge(): Promise<ConfirmDialog> {
    await this.mergeButton.click();
    return new ConfirmDialog(this.page);
  }
}

class SubjectsTab {
  readonly filterInput: Locator;
  readonly newNameInput: Locator;
  readonly addButton: Locator;

  constructor(private readonly page: Page) {
    this.filterInput = page.getByPlaceholder('Filter subjects…');
    this.newNameInput = page.getByPlaceholder('New subject name');
    this.addButton = page.getByRole('button', { name: 'Add', exact: true });
  }

  row(name: string): TaxonomyRow {
    return new TaxonomyRow(this.page, name);
  }

  colorSwatch(name: string): Locator {
    return this.page.getByLabel(`Color for ${name}`);
  }

  async addSubject(name: string): Promise<void> {
    await this.newNameInput.fill(name);
    await this.addButton.click();
  }
}

class AuthorsTab {
  readonly filterInput: Locator;
  readonly newNameInput: Locator;
  readonly addButton: Locator;

  constructor(private readonly page: Page) {
    this.filterInput = page.getByPlaceholder('Filter authors…');
    this.newNameInput = page.getByPlaceholder('New author name');
    this.addButton = page.getByRole('button', { name: 'Add', exact: true });
  }

  row(name: string): AuthorRow {
    return new AuthorRow(this.page, name);
  }

  async addAuthor(name: string): Promise<void> {
    await this.newNameInput.fill(name);
    await this.addButton.click();
  }
}

export class ManageSubjectsAuthorsPage {
  readonly header: HeaderComponent;
  readonly subjectsTabButton: Locator;
  readonly authorsTabButton: Locator;
  readonly subjects: SubjectsTab;
  readonly authors: AuthorsTab;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    // Tab accessible names include live counts ("Subjects 9") - match by prefix.
    this.subjectsTabButton = page.getByRole('tab', { name: /^Subjects/ });
    this.authorsTabButton = page.getByRole('tab', { name: /^Authors/ });
    this.subjects = new SubjectsTab(page);
    this.authors = new AuthorsTab(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}#/manage`);
  }

  async openSubjectsTab(): Promise<void> {
    await this.subjectsTabButton.click();
  }

  async openAuthorsTab(): Promise<void> {
    await this.authorsTabButton.click();
  }
}
