// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-16, @P0 @REQ-7)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { ManageSubjectsAuthorsPage } from '../../page_object_model/ManageSubjectsAuthorsPage';
import { CatalogPage } from '../../page_object_model/CatalogPage';

test.describe('Subjects & Authors', () => {
  test('Renaming a subject to a brand-new name updates it in place', async ({ page }) => {
    // Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Subjects" tab
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const managePage = new ManageSubjectsAuthorsPage(page);
    await managePage.goto();
    await managePage.openSubjectsTab();

    // When I rename the subject "Computer Science" to "Software Engineering"
    // And I save the rename
    await managePage.subjects.row('Computer Science').rename('Software Engineering');

    // Then the subjects table shows "Software Engineering" and no longer shows "Computer Science"
    await expect(managePage.subjects.row('Software Engineering').root).toBeVisible();
    await expect(managePage.subjects.row('Computer Science').root).toHaveCount(0);

    // And all books previously tagged "Computer Science" now show "Software Engineering"
    const catalogPage = new CatalogPage(page);
    await catalogPage.goto();
    const book = catalogPage.bookCard('The Art of Computer Programming, Vol. 1');
    await expect(book.root).toContainText('Software Engineering');
  });
});
