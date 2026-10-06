// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-11, @P0 @REQ-6)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { CatalogPage } from '../../page_object_model/CatalogPage';

test.describe('Book Management', () => {
  test('Delete requires confirmation before removing a book', async ({ page }) => {
    // Given I am signed in as "Administrator" and I am viewing the catalog
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const catalogPage = new CatalogPage(page);
    await catalogPage.goto();
    const mobyDick = catalogPage.bookCard('Moby-Dick');

    // When I click "Delete" on the book "Moby-Dick"
    const dialog = await mobyDick.delete();

    // Then I am shown a delete-confirmation dialog
    await expect(dialog.root).toBeVisible();

    // And "Moby-Dick" is not removed from the catalog until the dialog is confirmed
    await expect(mobyDick.root).toBeVisible();
  });
});
