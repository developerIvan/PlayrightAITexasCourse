// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-15, @P2 @REQ-6)
//
// Verified by execution - passes. The "Undo" button guess (a plain
// role=button named "Undo") turned out correct on the first attempt - see
// delete-book-logs-reason.spec.ts for why this wasn't blocked despite
// involving a completed deletion.
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { CatalogPage } from '../../page_object_model/CatalogPage';
import { ActivityPage } from '../../page_object_model/ActivityPage';

test.describe('Book Management', () => {
  test('A deleted book can be restored within the undo window', async ({ page }) => {
    // Given I am signed in as "Administrator" and I have just deleted a book
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const catalogPage = new CatalogPage(page);
    await catalogPage.goto();
    const book = catalogPage.bookCard('The Elements of Style');
    const dialog = await book.delete();
    await dialog.confirm();

    // When I click "Undo" within the available time window
    // UNVERIFIED locator - best guess, not confirmed against the real DOM.
    await page.getByRole('button', { name: 'Undo' }).click();

    // Then the book reappears in the catalog
    await expect(book.root).toBeVisible();

    // And a "Restored" entry appears on the Activity page
    // (the book now also has an earlier "Deleted" entry, so the "Restored"
    // one must be narrowed explicitly rather than matched by title alone)
    const activityPage = new ActivityPage(page);
    await activityPage.goto();
    const restoredEntry = activityPage
      .entryFor('The Elements of Style')
      .filter({ hasText: 'Restored' });
    await expect(restoredEntry).toBeVisible();
  });
});
