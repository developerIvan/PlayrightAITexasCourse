// Created by AI
import { Page, Locator } from '@playwright/test';

/**
 * Shared shape for the app's confirm/alert dialogs. Verified live for
 * "Reset to sample data?", "Delete this book?" (including confirming it -
 * see delete-book-logs-reason.spec.ts and delete-book-undo-restores.spec.ts),
 * "Remove "<subject>"?", and "Merge "<author>"" (including completing the
 * merge - see author-merge-relinks-books.spec.ts). Erase-all's dialog has
 * NOT been attempted via a clean POM-based test (out of scope for the
 * scenarios generated so far) - treat ConfirmDialog.confirm() on Erase-all
 * as unverified until it's actually exercised by a test.
 */
export class ConfirmDialog {
  readonly root: Locator;
  readonly cancelButton: Locator;
  readonly confirmButton: Locator;
  /** Created By AI - Delete-dialog only. Verified live via diagnostic run:
   * <p class="loan-warn"> ⚠ N copies are currently on loan. Make sure they
   * are returned or written off first. </p> - absent entirely (no element)
   * when the book has no copies on loan. */
  readonly loanWarning: Locator;
  /** Created By AI - Delete-dialog only. Verified live: an optional <select>
   * labelled "Reason (optional, saved to the audit log)" with options Lost /
   * Damaged / Outdated / Withdrawn from collection / Duplicate record. */
  readonly reasonSelect: Locator;
  /** Created By AI - Author-merge-dialog only. Verified live: titled
   * "Merge "<author>"" with a "Merge into" <select> listing every other
   * author except the one being merged away, plus a "Merge authors" confirm
   * button. */
  readonly mergeIntoSelect: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('alertdialog');
    this.cancelButton = this.root.getByRole('button', { name: 'Cancel' });
    this.confirmButton = this.root.getByRole('button', { name: /^(Reset|Delete|Erase|Merge|Remove)/ });
    this.loanWarning = this.root.locator('.loan-warn');
    this.reasonSelect = this.root.getByLabel(/Reason/);
    this.mergeIntoSelect = this.root.getByLabel('Merge into');
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
