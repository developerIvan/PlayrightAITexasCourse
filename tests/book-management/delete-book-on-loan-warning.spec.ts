// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-14, @P1 @REQ-6)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { CatalogPage } from '../../page_object_model/CatalogPage';

test.describe('Book Management', () => {
  test('Deleting a book with copies currently on loan shows an on-loan warning before deletion completes', async ({
    page,
  }) => {
    // Given I am signed in as "Administrator" and I am deleting a book that has copies currently on loan
    // ("Pride and Prejudice" has 2 of 4 copies on loan on its Penguin Classics edition in the clean seed state)
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const catalogPage = new CatalogPage(page);
    await catalogPage.goto();
    const dialog = await catalogPage.bookCard('Pride and Prejudice').delete();

    // Then I see an on-loan warning before the deletion is finalized
    await expect(dialog.loanWarning).toBeVisible();
    await expect(dialog.loanWarning).toContainText('on loan');

    // Deliberately not confirming the deletion - this scenario only asserts
    // the warning is shown before the action would be finalized.
  });
});
