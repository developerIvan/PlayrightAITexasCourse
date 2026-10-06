// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-22, @P1 @REQ-8)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { ManageSubjectsAuthorsPage } from '../../page_object_model/ManageSubjectsAuthorsPage';

test.describe('Subjects & Authors', () => {
  test('Cancelling an author merge leaves both author records untouched', async ({ page }) => {
    // Given I am signed in as "Administrator" and I have opened the merge dialog for "Terry Pratchett"
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const managePage = new ManageSubjectsAuthorsPage(page);
    await managePage.goto();
    await managePage.openAuthorsTab();
    const terryPratchett = managePage.authors.row('Terry Pratchett');
    const dialog = await terryPratchett.merge();
    await expect(dialog.root).toBeVisible();

    // When I click "Cancel" in the merge dialog
    await dialog.cancel();

    // Then "Terry Pratchett" still appears as a separate author in the Authors table
    await expect(dialog.root).toBeHidden();
    await expect(terryPratchett.root).toBeVisible();

    // And no books are re-linked
    await expect(terryPratchett.bookCountLink).toContainText('1 book');
  });
});
