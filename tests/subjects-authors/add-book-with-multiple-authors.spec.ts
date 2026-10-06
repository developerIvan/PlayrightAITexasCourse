// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-20, @P0 @REQ-8)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { AddEditBookPage } from '../../page_object_model/AddEditBookPage';
import { BookDetailPage } from '../../page_object_model/BookDetailPage';

test.describe('Subjects & Authors', () => {
  test('Associating multiple authors with a book preserves all of them', async ({ page }) => {
    // Given I am signed in as "Administrator" and I am on the "Add a book" page
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const addBookPage = AddEditBookPage.add(page);
    await addBookPage.goto();

    // When I add the authors "Terry Pratchett" and "Neil Gaiman" to a new book titled "Test Co-Authored Book"
    await addBookPage.fillRequiredFields({
      title: 'Test Co-Authored Book',
      authors: ['Terry Pratchett', 'Neil Gaiman'],
    });

    // And I click "Add to catalog"
    await addBookPage.submit();

    // Then the new book's detail page lists both "Terry Pratchett" and "Neil Gaiman" as authors
    const bookDetailPage = new BookDetailPage(page);
    await expect(bookDetailPage.authorLinks.filter({ hasText: 'Terry Pratchett' })).toBeVisible();
    await expect(bookDetailPage.authorLinks.filter({ hasText: 'Neil Gaiman' })).toBeVisible();
  });
});
