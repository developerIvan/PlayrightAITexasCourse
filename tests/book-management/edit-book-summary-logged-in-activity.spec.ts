// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-10, @P1 @REQ-5)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { CatalogPage } from '../../page_object_model/CatalogPage';
import { AddEditBookPage } from '../../page_object_model/AddEditBookPage';
import { ActivityPage } from '../../page_object_model/ActivityPage';

test.describe('Book Management', () => {
  test("Editing an existing book's details is recorded in the Activity log", async ({ page }) => {
    // Given I am signed in as "Administrator" and I am editing the book "Pride and Prejudice"
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const catalogPage = new CatalogPage(page);
    await catalogPage.goto();
    await catalogPage.bookCard('Pride and Prejudice').edit();
    const editBookPage = new AddEditBookPage(page, 'Save changes');

    // When I change the "Summary" field and click "Save changes"
    await editBookPage.summaryTextarea.fill(
      'Elizabeth Bennet navigates manners, marriage and misjudgment in Regency England. Updated by QA automation.'
    );
    await editBookPage.submit();

    // Then a new "Edited" entry for "Pride and Prejudice" appears on the Activity page
    const activityPage = new ActivityPage(page);
    await activityPage.goto();
    const entry = activityPage.entryFor('Pride and Prejudice');
    await expect(entry).toContainText('Edited');

    // And the entry shows the role "Administrator" and a timestamp
    await expect(entry).toContainText('Administrator');
    await expect(entry).toContainText(/\d{1,2}:\d{2}/);
  });
});
