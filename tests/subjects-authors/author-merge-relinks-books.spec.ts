// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-23, @P1 @REQ-8)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { ManageSubjectsAuthorsPage } from '../../page_object_model/ManageSubjectsAuthorsPage';
import { CatalogPage } from '../../page_object_model/CatalogPage';

test.describe('Subjects & Authors', () => {
  test('Merging one author into another re-links their books and removes the source author', async ({
    page,
  }) => {
    // Given I am signed in as "Administrator" and I have opened the merge dialog for an author with one linked book
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const managePage = new ManageSubjectsAuthorsPage(page);
    await managePage.goto();
    await managePage.openAuthorsTab();
    const neilGaiman = managePage.authors.row('Neil Gaiman');
    const dialog = await neilGaiman.merge();

    // When I choose a target author and click "Merge authors"
    await dialog.mergeIntoSelect.selectOption({ label: 'Terry Pratchett' });
    await dialog.confirm();

    // Then the merged-away author no longer appears in the Authors table
    await expect(managePage.authors.row('Neil Gaiman').root).toHaveCount(0);

    // And the book previously linked to it now lists the target author instead
    const catalogPage = new CatalogPage(page);
    await catalogPage.goto();
    await expect(catalogPage.bookCard('Good Omens').root).toContainText('Terry Pratchett');
  });
});
