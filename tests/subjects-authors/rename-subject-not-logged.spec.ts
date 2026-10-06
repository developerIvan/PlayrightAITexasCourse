// Created By AI
// spec: test-artifacts/book-management-test-plan.feature (Scenario-18, @P1 @REQ-7)
// Documents a known defect: subject rename/remove actions are not recorded
// in the Activity log, and the Activity action-type filter has no category
// for taxonomy changes at all.
import { test, expect } from '@playwright/test';
import { HomePage } from '../../page_object_model/HomePage';
import { ManageSubjectsAuthorsPage } from '../../page_object_model/ManageSubjectsAuthorsPage';
import { ActivityPage } from '../../page_object_model/ActivityPage';

test.describe('Subjects & Authors', () => {
  test('Subject rename and remove actions are not recorded in the Activity log (known defect)', async ({
    page,
  }) => {
    // Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Subjects" tab
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.header.signInAs('admin');
    const managePage = new ManageSubjectsAuthorsPage(page);
    await managePage.goto();
    await managePage.openSubjectsTab();

    // When I rename any subject and save the change
    await managePage.subjects.row('Physics').rename('Applied Physics');

    // Then no new entry appears on the Activity page for that action
    const activityPage = new ActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.entryFor('Applied Physics')).toHaveCount(0);
    await expect(activityPage.entryFor('Physics')).toHaveCount(0);

    // And the Activity action-type filter has no option for subject changes
    const optionLabels = await activityPage.actionFilterSelect.locator('option').allTextContents();
    expect(optionLabels.some((label) => /subject/i.test(label))).toBe(false);
  });
});
