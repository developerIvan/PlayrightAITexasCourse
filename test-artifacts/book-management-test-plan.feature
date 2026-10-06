Feature: Book Management (REQ-4 .. REQ-10) — Inflecta Library
  As a Librarian, Administrator or Patron of the Inflecta Library demo
  I want add/edit/delete books and their subjects, authors and editions to behave correctly
  So that the catalog stays accurate, de-duplicated and auditable

  Background:
    Given the catalog is in its clean seed state of 11 books, 16 authors, 9 subjects and 19 editions

  # Scenario-01
  @P0 @REQ-4
  Scenario: Add Book blocks submission when Title is missing
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    When I leave the "Title" field empty
    And I click "Add to catalog"
    Then I see the message "Title is required."
    And the book is not added to the catalog

  # Scenario-02
  @P0 @REQ-4
  Scenario: Add Book blocks submission when no Author is given
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    When I leave the "Authors" field empty
    And I click "Add to catalog"
    Then I see the message "Add at least one author."
    And the book is not added to the catalog

  # Scenario-03
  @P0 @REQ-4
  Scenario: Add Book rejects an ISBN that fails checksum validation
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    When I enter "9999999999999" into the "ISBN" field
    Then the ISBN field shows "✗ check digit"
    And I see the message "Not a valid ISBN-10 or ISBN-13 (check digit failed)."

  # Scenario-04
  @P0 @REQ-4
  Scenario: Add Book blocks submission on an exact duplicate ISBN
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    And the book "Pride and Prejudice" by "Jane Austen" already exists with ISBN "9780141439518"
    When I enter "9780141439518" into the "ISBN" field
    And I fill "Title" with "Pride and Prejudice" and "Authors" with "Jane Austen"
    And I click "Add to catalog"
    Then I see the message "ISBN already used by “Pride and Prejudice”."
    And the book is not added to the catalog

  # Scenario-05
  @P0 @REQ-4
  Scenario: Add Book blocks submission on a duplicate ISBN even with different dash formatting
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    And the book "Pride and Prejudice" by "Jane Austen" already exists with ISBN "9780141439518"
    When I enter "978-0-14-143951-8" into the "ISBN" field
    And I fill "Title" with "Pride and Prejudice" and "Authors" with "Jane Austen"
    And I click "Add to catalog"
    Then I see the message "ISBN already used by “Pride and Prejudice”."
    And the book is not added to the catalog

  # Scenario-06
  @P1 @REQ-4
  Scenario: Add Book shows a duplicate title+author warning but does not block submission when ISBN is blank
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    And the book "Pride and Prejudice" by "Jane Austen" already exists
    When I leave the "ISBN" field blank
    And I fill "Title" with "Pride and Prejudice" and "Authors" with "Jane Austen"
    Then I see the advisory message "A book called “Pride and Prejudice” by Jane Austen already exists."
    When I click "Add to catalog"
    Then a second book titled "Pride and Prejudice" by "Jane Austen" is created in the catalog
    # This documents a known defect: duplicate detection is advisory-only here, not a hard block.

  # Scenario-07
  @P0 @REQ-5
  Scenario: Edit Book rejects a malformed per-edition ISBN
    Given I am signed in as "Administrator" and I am editing the book "Pride and Prejudice"
    When I set the ISBN of the second edition to "123-INVALID"
    And I click "Save changes"
    Then I see the message "Edition ISBN is not valid."
    And the edit is not saved

  # Scenario-08
  @P0 @REQ-5
  Scenario: Edit Book rejects a per-edition ISBN that fails checksum validation
    Given I am signed in as "Administrator" and I am editing the book "Pride and Prejudice"
    When I set the ISBN of the second edition to "9780141439519"
    And I click "Save changes"
    Then I see the message "Edition ISBN is not valid."
    And the edit is not saved

  # Scenario-09
  @P1 @REQ-5
  Scenario: Edit Book warns before discarding unsaved changes
    Given I am signed in as "Administrator" and I am editing the book "Pride and Prejudice"
    When I change the "Title" field without saving
    And I navigate away from the edit page
    Then I am shown a confirmation prompt "You have unsaved changes. Leave this page?"
    When I accept the prompt
    Then my unsaved changes are discarded and I leave the edit page

  # Scenario-10
  @P1 @REQ-5
  Scenario: Editing an existing book's details is recorded in the Activity log
    Given I am signed in as "Administrator" and I am editing the book "Pride and Prejudice"
    When I change the "Summary" field and click "Save changes"
    Then a new "Edited" entry for "Pride and Prejudice" appears on the Activity page
    And the entry shows the role "Administrator" and a timestamp

  # Scenario-11
  @P0 @REQ-6
  Scenario: Delete requires confirmation before removing a book
    Given I am signed in as "Administrator" and I am viewing the catalog
    When I click "Delete" on the book "Moby-Dick"
    Then I am shown a delete-confirmation dialog
    And "Moby-Dick" is not removed from the catalog until the dialog is confirmed

  # Scenario-12
  @P1 @REQ-6
  Scenario: Cancelling the delete confirmation leaves the book untouched
    Given I am signed in as "Administrator" and I have opened the delete-confirmation dialog for "Moby-Dick"
    When I cancel the dialog
    Then "Moby-Dick" remains visible in the catalog with all its editions intact

  # Scenario-13
  @P1 @REQ-6
  Scenario: Deleting a book records a "Deleted" entry in the Activity log with a reason
    Given I am signed in as "Administrator" and I have confirmed deletion of a book with no copies on loan
    Then a new "Deleted" entry for that book appears on the Activity page
    And the entry records the role, the timestamp and the reason given for deletion

  # Scenario-14
  @P1 @REQ-6
  Scenario: Deleting a book with copies currently on loan shows an on-loan warning before deletion completes
    Given I am signed in as "Administrator" and I am deleting a book that has copies currently on loan
    Then I see an on-loan warning before the deletion is finalized

  # Scenario-15
  @P2 @REQ-6
  Scenario: A deleted book can be restored within the undo window
    Given I am signed in as "Administrator" and I have just deleted a book
    When I click "Undo" within the available time window
    Then the book reappears in the catalog
    And a "Restored" entry appears on the Activity page

  # Scenario-16
  @P0 @REQ-7
  Scenario: Renaming a subject to a brand-new name updates it in place
    Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Subjects" tab
    When I rename the subject "Computer Science" to "Software Engineering"
    And I save the rename
    Then the subjects table shows "Software Engineering" and no longer shows "Computer Science"
    And all books previously tagged "Computer Science" now show "Software Engineering"

  # Scenario-17
  @P1 @REQ-7
  Scenario: Renaming a subject to an existing subject's name creates an unwanted duplicate (known defect)
    Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Subjects" tab
    And subjects "Physics" and "Science" both already exist as separate entries
    When I rename "Physics" to "Science"
    And I save the rename
    Then the subjects table shows two separate rows both named "Science"
    And no merge or warning occurs
    # Documents known defect: subjects have no duplicate-name guard and no Merge action, unlike Authors.

  # Scenario-18
  @P1 @REQ-7
  Scenario: Subject rename and remove actions are not recorded in the Activity log (known defect)
    Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Subjects" tab
    When I rename any subject and save the change
    Then no new entry appears on the Activity page for that action
    And the Activity action-type filter has no option for subject changes

  # Scenario-19
  @P0 @REQ-7
  Scenario: Removing a subject with no books linked succeeds without affecting other subjects
    Given I am signed in as "Administrator" and a subject exists with zero linked books
    When I click "Remove" on that subject
    Then the subject no longer appears in the Subjects table
    And all other subjects remain unchanged

  # Scenario-20
  @P0 @REQ-8
  Scenario: Associating multiple authors with a book preserves all of them
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    When I add the authors "Terry Pratchett" and "Neil Gaiman" to a new book titled "Test Co-Authored Book"
    And I click "Add to catalog"
    Then the new book's detail page lists both "Terry Pratchett" and "Neil Gaiman" as authors

  # Scenario-21
  @P0 @REQ-8
  Scenario: Author Merge dialog explains the effect and lists other authors as merge targets
    Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Authors" tab
    When I click "Merge" on the author "Terry Pratchett"
    Then a dialog titled "Merge “Terry Pratchett”" appears
    And it states that all books by this author will be re-linked and this record removed
    And the "Merge into" dropdown lists every other author except "Terry Pratchett"

  # Scenario-22
  @P1 @REQ-8
  Scenario: Cancelling an author merge leaves both author records untouched
    Given I am signed in as "Administrator" and I have opened the merge dialog for "Terry Pratchett"
    When I click "Cancel" in the merge dialog
    Then "Terry Pratchett" still appears as a separate author in the Authors table
    And no books are re-linked

  # Scenario-23
  @P1 @REQ-8
  Scenario: Merging one author into another re-links their books and removes the source author
    Given I am signed in as "Administrator" and I have opened the merge dialog for an author with one linked book
    When I choose a target author and click "Merge authors"
    Then the merged-away author no longer appears in the Authors table
    And the book previously linked to it now lists the target author instead

  # Scenario-24
  @P1 @REQ-8
  Scenario: Author rename, merge and remove actions are not recorded in the Activity log (known defect)
    Given I am signed in as "Administrator" and I am on the "Subjects & authors" page, "Authors" tab
    When I rename any author and save the change
    Then no new entry appears on the Activity page for that action

  # Scenario-25
  @P0 @REQ-9
  Scenario: Each edition of a book tracks its own publisher, ISBN, language, format and availability
    Given I am signed in as "Administrator" and I am viewing the book "Pride and Prejudice"
    Then the "Editions" table lists "First edition" with publisher "T. Egerton", no ISBN and "In library use only"
    And it lists "Penguin Classics" with publisher "Penguin", ISBN "978-0-1414-3951-8" and "2 of 4 available"

  # Scenario-26
  @P1 @REQ-9
  Scenario: Adding a new edition to an existing book does not affect its other editions
    Given I am signed in as "Administrator" and I am editing the book "Pride and Prejudice"
    When I click "+ Add edition" and fill in a new edition's details
    And I click "Save changes"
    Then the book now shows three editions
    And the original two editions' details are unchanged

  # Scenario-27
  @P1 @REQ-9
  Scenario: Removing an edition updates the book's total edition count
    Given I am signed in as "Administrator" and I am editing a book that has two editions
    When I click "Remove" on one edition
    And I click "Save changes"
    Then the book now shows only one edition

  # Scenario-28
  @P0 @REQ-10
  Scenario: Erase All Books is only visible and reachable to the Administrator role
    Given I am signed in as "Patron"
    Then the "Admin" navigation link is not visible
    And navigating directly to the admin URL redirects me to the catalog
    Given I am signed in as "Librarian"
    Then the "Admin" navigation link is not visible
    And navigating directly to the admin URL redirects me to the catalog

  # Scenario-29
  @P0 @REQ-10
  Scenario: Reset to sample data requires confirmation and restores the original seed state
    Given I am signed in as "Administrator" and I am on the "Admin tools" page
    And the catalog currently has test data beyond the original 11 books
    When I click "Reset to sample data"
    Then I am shown a confirmation dialog warning that current books, authors, subjects and activity will be replaced
    When I confirm the dialog
    Then the catalog is restored to exactly 11 books, 16 authors, 9 subjects and 19 editions
    And I see the message "Demo data restored."

  # Scenario-30
  @P1 @REQ-10
  Scenario: Erase All Books requires confirmation before permanently removing every book
    Given I am signed in as "Administrator" and I am on the "Admin tools" page
    When I click "Erase all books"
    Then I am shown a confirmation dialog before anything is erased
    And no book is removed until the dialog is confirmed

  # Scenario-31
  @P0 @REQ-4
  Scenario: Bulk Import flags an invalid-checksum ISBN row and excludes it from import
    Given I am signed in as "Administrator" and I am on the "Import books" page
    When I upload a CSV file containing a row with ISBN "1234567890123"
    Then that row's status shows "Not a valid ISBN-10 or ISBN-13 (check digit failed)."
    And that row's checkbox is disabled and it is not counted in the valid-row total

  # Scenario-32
  @P0 @REQ-4
  Scenario: Bulk Import flags a row missing a required Title and excludes it from import
    Given I am signed in as "Administrator" and I am on the "Import books" page
    When I upload a CSV file containing a row with no value in the "title" column
    Then that row's status shows "Title is required."
    And that row's checkbox is disabled and it is not counted in the valid-row total

  # Scenario-33
  @P1 @REQ-4
  Scenario: Bulk Import does not flag a row that exactly duplicates an existing book's title and author (known defect)
    Given I am signed in as "Administrator" and I am on the "Import books" page
    And the book "Pride and Prejudice" by "Jane Austen" already exists in the catalog
    When I upload a CSV file containing a row with title "Pride and Prejudice" and author "Jane Austen"
    Then that row's status shows "Ready" with no duplicate warning
    # Documents known defect: unlike the manual Add Book form, Bulk Import gives no duplicate signal at all.

  # Scenario-34
  @P2 @REQ-4
  Scenario: Bulk Import accepts the pipe delimiter for multi-value columns in semicolon-locale files
    Given I am signed in as "Administrator" and I am on the "Import books" page
    When I upload a CSV file whose "authors" column uses "|" to separate two author names
    Then the import preview splits that cell into two distinct authors

  # Scenario-35
  @P0 @REQ-4
  Scenario: Only valid, checked rows are imported when Bulk Import is confirmed
    Given I am signed in as "Administrator" and I have uploaded a CSV with 2 valid rows and 2 invalid rows
    When I click "Import 2 books"
    Then exactly 2 new books are added to the catalog
    And a "Bulk import" entry appears on the Activity page

  # Scenario-36
  @P1 @REQ-4
  Scenario: Add Book's ISBN "Auto-fill from Open Library" populates the form without requiring manual entry
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    When I enter a valid, known ISBN and click "Auto-fill from Open Library"
    Then the Title, Authors and other available fields are populated from the lookup result

  # Scenario-37
  @P2 @REQ-7
  Scenario: Catalog subject-filter chips do not display two indistinguishable duplicate-named chips (regression guard)
    Given the catalog's subjects contain no two entries with the same display name
    When I view the catalog page
    Then every subject-filter chip has a unique, unambiguous label

  # Scenario-38
  @P1 @REQ-5 @REQ-8
  Scenario: Authors textbox offers existing-author suggestions to avoid creating near-duplicates
    Given I am signed in as "Administrator" and I am on the "Add a book" page
    When I start typing "Jane A" into the "Authors" field
    Then a suggestion list includes "Jane Austen"
    When I select that suggestion
    Then the existing "Jane Austen" author record is reused rather than a new one being created
