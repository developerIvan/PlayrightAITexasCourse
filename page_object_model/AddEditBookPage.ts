// Created by AI
import { Page, Locator } from '@playwright/test';
import { BASE_URL } from './constants';
import { HeaderComponent } from './HeaderComponent';

export type SubmitLabel = 'Add to catalog' | 'Save changes';

/** One expanded row under the "Editions" fieldset. Scoped by index since rows have no id. */
export class EditionRow {
  readonly root: Locator;
  readonly nameInput: Locator;
  readonly yearInput: Locator;
  readonly publisherInput: Locator;
  readonly isbnInput: Locator;
  readonly languageSelect: Locator;
  readonly formatSelect: Locator;
  readonly copiesInput: Locator;
  readonly removeButton: Locator;

  constructor(page: Page, index: number) {
    // The edition fieldset repeats; scope every field to the Nth occurrence.
    this.root = page.locator('fieldset, .edition-row').nth(index);
    this.nameInput = this.root.getByLabel('Edition');
    this.yearInput = this.root.getByLabel('Year');
    this.publisherInput = this.root.getByLabel('Publisher');
    this.isbnInput = this.root.getByLabel('ISBN');
    this.languageSelect = this.root.getByLabel('Language');
    this.formatSelect = this.root.getByLabel('Format');
    this.copiesInput = this.root.getByLabel('Copies');
    this.removeButton = this.root.getByRole('button', { name: /Remove edition/ });
  }
}

export class AddEditBookPage {
  readonly header: HeaderComponent;

  readonly isbnInput: Locator;
  readonly autoFillButton: Locator;
  readonly titleInput: Locator;
  readonly firstPublishedInput: Locator;
  readonly genreInput: Locator;
  readonly authorsInput: Locator;
  readonly subjectsInput: Locator;
  readonly summaryTextarea: Locator;
  readonly keywordsInput: Locator;
  readonly addEditionButton: Locator;
  readonly pagesInput: Locator;
  readonly dimensionsInput: Locator;
  readonly weightInput: Locator;
  readonly addLinkButton: Locator;
  readonly coverImageUrlToggle: Locator;
  readonly coverUploadToggle: Locator;
  readonly coverUrlInput: Locator;
  readonly submitButton: Locator;
  readonly cancelLink: Locator;
  // Created By AI - added for test-artifacts/book-management-test-plan.feature Scenario-01
  readonly pageHeading: Locator;
  readonly titleRequiredError: Locator;
  readonly authorsRequiredError: Locator;
  // Created By AI - added for test-artifacts/book-management-test-plan.feature Scenario-03
  readonly isbnStatusBadge: Locator;
  readonly isbnChecksumError: Locator;

  constructor(private readonly page: Page, private readonly submitLabel: SubmitLabel) {
    this.header = new HeaderComponent(page);
    this.isbnInput = page.getByPlaceholder('978-…');
    this.autoFillButton = page.getByRole('button', { name: 'Auto-fill from Open Library' });
    this.titleInput = page.getByLabel('Title');
    this.firstPublishedInput = page.getByLabel('First published');
    this.genreInput = page.getByLabel('Genre');
    // The only two real ids in the app.
    this.authorsInput = page.locator('#authors');
    this.subjectsInput = page.locator('#subjects');
    this.summaryTextarea = page.getByPlaceholder('A short description shown in the catalog');
    this.keywordsInput = page.locator('#kw');
    this.addEditionButton = page.getByRole('button', { name: '+ Add edition' });
    this.pagesInput = page.getByLabel('Pages');
    this.dimensionsInput = page.getByPlaceholder('20 × 13 × 2 cm');
    this.weightInput = page.getByPlaceholder('350 g');
    this.addLinkButton = page.getByRole('button', { name: '+ Add link' });
    this.coverImageUrlToggle = page.getByRole('button', { name: 'Image URL' });
    this.coverUploadToggle = page.getByRole('button', { name: 'Upload' });
    this.coverUrlInput = page.getByPlaceholder('https://…/cover.jpg');
    this.submitButton = page.getByRole('button', { name: submitLabel });
    this.cancelLink = page.getByRole('link', { name: 'Cancel' });
    // Created By AI - added for test-artifacts/book-management-test-plan.feature Scenario-01
    // Verified live: the Add page's H1 is the fixed string "Add a book", but the
    // Edit page's H1 is the book's own title (data-dependent) - not a fixed string -
    // so only the Add-mode heading can be matched by name.
    this.pageHeading =
      submitLabel === 'Add to catalog'
        ? page.getByRole('heading', { name: 'Add a book', level: 1 })
        : page.getByRole('heading', { level: 1 });
    this.titleRequiredError = page.getByText('Title is required.', { exact: true });
    this.authorsRequiredError = page.getByText('Add at least one author.', { exact: true });
    // Created By AI - added for test-artifacts/book-management-test-plan.feature Scenario-03
    // Verified live markup: <div class="isbn"><input .../><span class="badge valid|invalid">✓ valid|✗ check digit</span></div>
    this.isbnStatusBadge = this.isbnInput.locator('xpath=following-sibling::span[contains(@class, "badge")]');
    this.isbnChecksumError = page.getByText(
      'Not a valid ISBN-10 or ISBN-13 (check digit failed).',
      { exact: true }
    );
  }

  static add(page: Page): AddEditBookPage {
    return new AddEditBookPage(page, 'Add to catalog');
  }

  static edit(page: Page, bookId: string): AddEditBookPage {
    const pom = new AddEditBookPage(page, 'Save changes');
    pom.editBookId = bookId;
    return pom;
  }

  private editBookId?: string;

  async goto(): Promise<void> {
    const path = this.editBookId ? `#/books/${this.editBookId}/edit` : '#/books/new';
    await this.page.goto(`${BASE_URL}${path}`);
  }

  /** Title + Authors are the only two fields blocking submission - most P0 tests need just these. */
  async fillRequiredFields(fields: { title: string; authors: string[] }): Promise<void> {
    await this.titleInput.fill(fields.title);
    for (const author of fields.authors) {
      await this.authorsInput.fill(author);
      await this.page.keyboard.press('Enter');
    }
  }

  /**
   * Created By AI - added for test-artifacts/book-management-test-plan.feature
   * Scenario-04/Scenario-05. Verified live: the exact-duplicate-ISBN error is
   * deferred until submit, like the checksum error, and uses curly quotes
   * (U+201C/U+201D) around the conflicting book's title - confirmed via
   * codepoint inspection, not assumed from the Gherkin source text.
   */
  duplicateIsbnError(conflictingTitle: string): Locator {
    return this.page.getByText(`ISBN already used by “${conflictingTitle}”.`, {
      exact: true,
    });
  }

  async addEdition(): Promise<EditionRow> {
    const existingCount = await this.page.locator('fieldset, .edition-row').count();
    await this.addEditionButton.click();
    return new EditionRow(this.page, existingCount);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  errorFor(fieldLabel: string): Locator {
    return this.page.getByText(new RegExp(`${fieldLabel}.*required|${fieldLabel}.*failed`, 'i'));
  }
}
