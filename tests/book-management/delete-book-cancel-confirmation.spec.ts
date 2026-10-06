// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-12, @P1 @REQ-6)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { CatalogPage } from '../../page_object_model/CatalogPage';

test.describe('Book Management', () => {
  test('Cancelling the delete confirmation leaves the book untouched', async ({ page }) => {
    // Given I am signed in as "Administrator" and I have opened the delete-confirmation dialog for "Moby-Dick"
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const catalogPage = new CatalogPage(page);
    await catalogPage.goto();
    const mobyDick = catalogPage.bookCard('Moby-Dick');
    const dialog = await mobyDick.delete();
    await expect(dialog.root).toBeVisible();

    // When I cancel the dialog
    await dialog.cancel();

    // Then "Moby-Dick" remains visible in the catalog with all its editions intact
    await expect(dialog.root).toBeHidden();
    await expect(mobyDick.root).toBeVisible();
    await expect(mobyDick.root).toContainText('edition');
  });
});
