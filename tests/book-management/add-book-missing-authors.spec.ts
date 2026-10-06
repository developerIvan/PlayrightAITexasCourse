// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-02, @P0 @REQ-4)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { AddEditBookPage } from '../../page_object_model/AddEditBookPage';

test.describe('Book Management', () => {
  test('Add Book blocks submission when no Author is given', async ({ page }) => {
    // Given I am signed in as "Administrator" and I am on the "Add a book" page
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const addBookPage = AddEditBookPage.add(page);
    await addBookPage.goto();

    // When I leave the "Authors" field empty
    // (no action - the Authors field starts empty on a fresh Add Book form)

    // And I click "Add to catalog"
    await addBookPage.submit();

    // Then I see the message "Add at least one author."
    await expect(addBookPage.authorsRequiredError).toBeVisible();

    // And the book is not added to the catalog
    await expect(addBookPage.pageHeading).toBeVisible();
  });
});
