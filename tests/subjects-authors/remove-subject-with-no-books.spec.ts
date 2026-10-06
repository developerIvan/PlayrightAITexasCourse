// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-19, @P0 @REQ-7)
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { ManageSubjectsAuthorsPage } from '../../page_object_model/ManageSubjectsAuthorsPage';

test.describe('Subjects & Authors', () => {
  test('Removing a subject with no books linked succeeds without affecting other subjects', async ({
    page,
  }) => {
    // Given I am signed in as "Administrator" and a subject exists with zero linked books
    // (created fresh here so the zero-books precondition is guaranteed)
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const managePage = new ManageSubjectsAuthorsPage(page);
    await managePage.goto();
    await managePage.openSubjectsTab();
    await managePage.subjects.addSubject('Temporary QA Subject');
    const temporarySubject = managePage.subjects.row('Temporary QA Subject');
    await expect(temporarySubject.root).toBeVisible();
    const literatureSubject = managePage.subjects.row('Literature');
    await expect(literatureSubject.bookCountLink).toContainText('5 books');

    // When I click "Remove" on that subject
    const dialog = await temporarySubject.remove();
    await expect(dialog.root).toContainText('not linked to any books');
    await dialog.confirm();

    // Then the subject no longer appears in the Subjects table
    await expect(temporarySubject.root).toHaveCount(0);

    // And all other subjects remain unchanged
    await expect(literatureSubject.root).toBeVisible();
    await expect(literatureSubject.bookCountLink).toContainText('5 books');
  });
});
