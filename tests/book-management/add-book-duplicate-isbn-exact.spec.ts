// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-04, @P0 @REQ-4)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { AddEditBookPage } from '../../page_object_model/AddEditBookPage';

test.describe('Book Management', () => {
  test('Add Book blocks submission on an exact duplicate ISBN', async ({ page }) => {
    // Given I am signed in as "Administrator" and I am on the "Add a book" page
    // And the book "Pride and Prejudice" by "Jane Austen" already exists with ISBN "9780141439518"
    // (true in the catalog's clean seed state - no setup action needed)
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const addBookPage = AddEditBookPage.add(page);
    await addBookPage.goto();

    // When I enter "9780141439518" into the "ISBN" field
    await addBookPage.isbnInput.fill('9780141439518');

    // And I fill "Title" with "Pride and Prejudice" and "Authors" with "Jane Austen"
    await addBookPage.fillRequiredFields({
      title: 'Pride and Prejudice',
      authors: ['Jane Austen'],
    });

    // And I click "Add to catalog"
    await addBookPage.submit();

    // Then I see the message "ISBN already used by "Pride and Prejudice"."
    await expect(addBookPage.duplicateIsbnError('Pride and Prejudice')).toBeVisible();

    // And the book is not added to the catalog
    await expect(addBookPage.pageHeading).toBeVisible();
  });
});
