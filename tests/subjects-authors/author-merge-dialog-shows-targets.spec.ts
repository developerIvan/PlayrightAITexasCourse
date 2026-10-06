// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-21, @P0 @REQ-8)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { ManageSubjectsAuthorsPage } from '../../page_object_model/ManageSubjectsAuthorsPage';

test.describe('Subjects & Authors', () => {
  test('Author Merge dialog explains the effect and lists other authors as merge targets', async ({
    page,
  }) => {
    // Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Authors" tab
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const managePage = new ManageSubjectsAuthorsPage(page);
    await managePage.goto();
    await managePage.openAuthorsTab();

    // When I click "Merge" on the author "Terry Pratchett"
    const dialog = await managePage.authors.row('Terry Pratchett').merge();

    // Then a dialog titled "Merge "Terry Pratchett"" appears
    await expect(dialog.root).toBeVisible();
    await expect(dialog.root).toContainText('Terry Pratchett');

    // And it states that all books by this author will be re-linked and this record removed
    await expect(dialog.root).toContainText('re-linked');
    await expect(dialog.root).toContainText('removed');

    // And the "Merge into" dropdown lists every other author except "Terry Pratchett"
    const optionLabels = await dialog.mergeIntoSelect.locator('option').allTextContents();
    expect(optionLabels).toContain('Jane Austen');
    expect(optionLabels).not.toContain('Terry Pratchett');
  });
});
