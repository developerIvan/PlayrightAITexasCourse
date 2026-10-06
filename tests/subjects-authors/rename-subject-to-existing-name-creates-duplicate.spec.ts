// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-17, @P1 @REQ-7)
// Documents a known defect: subjects have no duplicate-name guard and no
// Merge action, unlike Authors (confirmed live - see
// page_object_model/ManageSubjectsAuthorsPage.ts, TaxonomyRow vs AuthorRow).
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { ManageSubjectsAuthorsPage } from '../../page_object_model/ManageSubjectsAuthorsPage';

test.describe('Subjects & Authors', () => {
  test("Renaming a subject to an existing subject's name creates an unwanted duplicate (known defect)", async ({
    page,
  }) => {
    // Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Subjects" tab
    // And subjects "Physics" and "Science" both already exist as separate entries (true in the clean seed state)
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const managePage = new ManageSubjectsAuthorsPage(page);
    await managePage.goto();
    await managePage.openSubjectsTab();
    await expect(managePage.subjects.row('Physics').root).toBeVisible();
    await expect(managePage.subjects.row('Science').root).toBeVisible();

    // When I rename "Physics" to "Science"
    // And I save the rename
    await managePage.subjects.row('Physics').rename('Science');

    // Then the subjects table shows two separate rows both named "Science"
    // And no merge or warning occurs
    await expect(managePage.subjects.row('Science').root).toHaveCount(2);
  });
});
