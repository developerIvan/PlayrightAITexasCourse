# Book Management QA Analysis — Inflecta Library

**Scope:** REQ-4 through REQ-10 ("Book Management" folder), Spira requirements file `test-artifacts/library_requirements_book_management.md`, tested live against `http://192.168.1.24:5173/`.

**Run context:** Fresh crawl performed against a clean, just-reset catalog (11 books / 16 authors / 9 subjects / 19 editions, verified on the home page and Admin page before testing began). This is a **re-run** of an earlier pass; that pass left the app polluted (12 books, a renamed subject) and the caller reset it back to the clean 11-book seed before this pass started. All findings below were re-derived from scratch against the clean state, not assumed from the prior report. Test pollution created during this pass (one duplicate "Pride and Prejudice" record, one duplicate "Science" subject row) was cleaned up at the end via Admin → **Reset to sample data** (confirmed) — see the "State at end of run" note at the bottom.

---

## 0. Known-issue re-verification (vs. the prior pass)

| # | Prior finding | Status this run | Evidence |
|---|---|---|---|
| 1 | Duplicate-ISBN not detected when the new entry uses a different dash/format than the stored ISBN | **Does not reproduce — appears fixed.** | On Add Book, entering ISBN `978-0-14-143951-8` (dashed) correctly matched the stored `9780141439518` (undashed) for *Pride and Prejudice* and showed "ISBN already used by 'Pride and Prejudice'.", blocking submission ("1 field(s) need attention"). |
| 2 | Duplicate title + author not detected | **Partially reproduces — a real duplicate book can still be created.** | Add Book with Title="Pride and Prejudice", Author="Jane Austen", ISBN blank: an inline advisory message appeared ("A book called 'Pride and Prejudice' by Jane Austen already exists. Open it…") but it did **not** block submission — clicking "Add to catalog" created a second, genuine duplicate book (`b-muvtdyc4-zqf0k`). The warning is cosmetic, not a validation gate, and only appears at all in the single-record form. In **Bulk Import**, the identical duplicate row (same title+author) produced **no warning whatsoever** and was marked "Ready" for import — a silent, undetected duplicate path. |
| 3 | Renaming a subject to an existing subject's name creates a second, duplicate-named row instead of merging or being blocked | **Reproduces exactly as before.** | Renamed "Physics" (`s-phys`) to "Science" via Subjects tab → table now shows two separate rows both labeled "Science" (`s-sci`, 3 books, and `s-phys`, 1 book) with no merge, no warning, no block. Visible downstream: Catalog's subject-filter chip row shows two identical "Science" buttons, and *The Feynman Lectures on Physics* now displays subject badges "Science, Science". |
| 4 | No audit logging for subject/author changes | **Reproduces.** | The Physics→Science rename produced zero new Activity entries. Worse: the Activity page's action-type filter dropdown only offers `Added / Edited / Deleted / Restored / Bulk import / Erased all` — there is no action category for subject/author rename, merge, or remove at all, so this isn't a logging gap in one place, it's an absence of the capability in the audit schema. |
| 5 | No per-edition ISBN checksum validation | **Does not reproduce — appears fixed.** | On Edit Book, typing a malformed value (`123-INVALID`) into an edition-level ISBN field and saving produced "Edition ISBN is not valid." and blocked save. Typing a *correctly formatted but checksum-invalid* 13-digit ISBN (`9780141439519`, one digit off from the real one) produced the same rejection — confirming real checksum validation, not just a format regex, now runs on edition ISBNs. |

**Net:** 2 of 5 previously-found defects are fixed (duplicate-ISBN format normalization; edition-level ISBN checksum). 2 are unchanged (subject-rename duplication; missing audit trail for taxonomy changes). 1 is partially fixed (duplicate title+author now at least *warns* in the manual form, but still doesn't block there, and bulk import still has zero detection) — the user-visible outcome (a duplicate book can be created) is unchanged even though the UI is better in one of the two entry paths.

**New finding this pass:** the still-open duplicate-detection gap is *worse* in Bulk Import than in the manual Add Book form: the manual form at least shows an advisory message; the import preview table shows the exact same duplicate row as plain "Ready" with no indication at all.

### Requirement-copy drift (risk/finding, not a functional bug)

The home page's REQ-4..REQ-10 requirement cards do not show fixed text — their wording changed between the caller's first and second visits to the app (independently confirmed again in this pass: e.g. REQ-7's card currently reads "...filter and bulk-assign by subject, get related-book recommendations and export subject reading lists," REQ-8 mentions "roles (author, editor, translator, illustrator)," REQ-9 mentions "loan policy and live availability," none of which exist as implemented features today). Because this descriptive copy is a moving target, it **cannot** be used as a test oracle or as the authoritative statement of scope — only the static Spira requirements file can. This analysis is based entirely on that static file; the home-page copy is cited below only as supplementary context on product intent, explicitly flagged anywhere it is unverified against real behavior. We recommend the product team either pin this copy to a single static version per release, or clearly mark it as illustrative/non-binding, since as-is it actively misleads anyone using the UI's own text as a feature checklist.

---

## 1. Requirement gaps and missing business logic (static Spira REQ-4..REQ-10 vs. live app)

**REQ-4 — Add new books.** Spira text calls for "validation checks... such as verifying ISBN numbers and author names against existing records" and "robust access controls." Gaps:
- Author-name duplicate checking exists only as an autosuggest/autocomplete (reuses the existing author record when you pick a suggestion) — there is no hard duplicate check independent of that UI gesture; a user who ignores the suggestion dropdown and keeps typing can still create behavior equivalent to a duplicate.
- Title+author duplicate checking is advisory only in the form and absent entirely in bulk import (see §0). This directly contradicts the spirit of "duplicate detection" called for by the requirement.
- Access control is enforced (verified: Patron cannot reach `#/books/new` by nav or direct URL), satisfying the "only authorized personnel" clause for this path.

**REQ-5 — Edit existing books.** Spira text calls for "a log of all changes made, including who made the change and when" for **any** modification to a book's record, and "auto-suggestions... to avoid duplication" for authors. Gaps:
- Book-level edits (title, basics, editions, etc.) *are* logged (confirmed: adding a book produced an Activity entry with role + timestamp). We did not get to verify an in-place *edit* of an existing book produces its own Activity entry (only "Added" and the original "Bulk import" entries were present after our testing) — this should be explicitly re-tested (see Additional Coverage P0).
- Author auto-suggest exists (confirmed dropdown appears when typing); the requirement's duplicate-prevention intent via this mechanism is honored only if the user selects from it.

**REQ-6 — Delete existing books.** Spira text calls for a "confirmation step" and "a log of all deletions for audit purposes." The home page's current (drifting) copy additionally claims an "on-loan warning," "a reason kept in the audit trail," and "a few seconds to undo" — none of which could be verified in this pass because the test harness's safety policy blocked every Delete click as "Modify Shared Resources" (by design, per our test constraints). **This entire requirement's implementation is effectively unverified** by any live pass to date and should be a top re-test priority in an environment where destructive actions are permitted (e.g., a disposable/throwaway instance).

**REQ-7 — Associate subjects.** Spira text calls for librarians to "easily review and manage the subject assignments, ensuring that the categorization remains accurate and up-to-date" and supports "auditing." Gaps:
- Subjects can be renamed and removed, but not merged (Authors have a dedicated Merge action; Subjects do not). This asymmetry is the direct root cause of defect #3 above: renaming to an existing name has nowhere to go but "create a duplicate," because there is no merge path to fall back to and no duplicate-name guard either.
- No audit trail for any subject management action (rename/remove), contradicting the general auditability intent carried over from REQ-5/REQ-6's explicit audit requirements.
- The home page's current copy additionally claims "bulk-assign by subject," "related-book recommendations," and "export subject reading lists" — a "Related books" section does exist on the book-detail page (verified on *Pride and Prejudice*), but bulk-assign-by-subject and reading-list export were not found anywhere in the UI. If these are intended features, they are missing; if they are not intended, the home-page copy is overstating scope (see drift note above).

**REQ-8 — Associate authors.** Spira text calls for supporting "the addition, modification, and removal of author associations... seamlessly" and accurate multi-author tracking. Gaps:
- Multi-author association works correctly (verified multiple books with 2–3 authors, e.g. *The Feynman Lectures*, *Good Omens*).
- Author Rename/Merge/Remove all exist and the Merge dialog correctly explains its effect ("All books by this author will be re-linked to the author you choose, then this record is removed") — this is the best-specified management flow in the app and should be the model for fixing the Subjects gap.
- No audit log entry for any of these actions (same gap as Subjects).
- The home page's current copy claims per-author "roles (author, editor, translator, illustrator)" — no such role selector exists anywhere in the Add/Edit book author UI; this is either unimplemented scope or stale copy (see drift note; flagged as a clarifying question below).

**REQ-9 — Track editions.** Spira text calls for distinct tracking of publisher, ISBN, language and lending/availability per edition. This is well implemented: editions have independent publisher, year, format, language, loan policy, copies-held/available, and (confirmed this pass) their own validated ISBN with real checksum validation. No gap found against the static requirement text.

**REQ-10 — Erase all books (admin).** Spira text calls for an "administrative-level function" that is otherwise sparse on detail. Implemented as specified: Admin-only route (verified both Librarian and Patron are redirected away from `#/admin`), a confirmation dialog pattern consistent with the one used for Reset ("Reset to sample data?" / "Your current books, authors, subjects and activity will be replaced."), and a Backup-first affordance. The actual Erase action itself was not exercised (blocked by test-harness safety policy, consistent with the task's explicit instruction not to erase/delete), so the erase confirmation copy and post-erase state could not be directly verified this pass.

---

## 2. Clarifying questions for the product team

1. **Duplicate title+author:** should this be a hard block (like duplicate ISBN already is) or an advisory warning the user can dismiss? Today it's advisory-but-non-blocking in the manual Add form and completely silent in Bulk Import — the two paths disagree with each other, and neither matches the "detection" language in REQ-4.
2. **Subjects — merge support:** should Subjects get a Merge action analogous to Authors' Merge (re-link books from the duplicate to the surviving subject, then delete the duplicate)? If renaming to an existing name is supposed to merge automatically, what should happen to color/metadata conflicts between the two records?
3. **ISBN canonical format:** is "strip all punctuation/spaces, compare digits" the intended comparison rule everywhere ISBNs are checked (top-level Add/Edit, per-edition, and Bulk Import), or only in the places where we observed it working?
4. **Audit trail scope:** REQ-5 requires logging "all changes," and REQ-6 requires logging deletions — does this intentionally exclude subject/author taxonomy actions, or should Rename/Merge/Remove on Subjects and Authors also appear in Activity? If yes, what new action-type label(s) should be added to the Activity filter (today: Added/Edited/Deleted/Restored/Bulk import/Erased all)?
5. **Delete flow specifics (REQ-6):** what exactly triggers the "on-loan warning" mentioned on the home page (a specific edition having 0 of N available? any copy checked out?), and how long does the "few seconds to undo" window last, and does it survive a page reload or tab close?
6. **Bulk Import duplicates:** should an exact title+author duplicate row be auto-rejected, flagged for manual review/opt-out (like the invalid-ISBN and missing-title rows already are), or treated as "this is actually a new edition of book X" the way the manual Add form's "Open it… add it there instead" link suggests?
7. **Author "roles" (author/editor/translator/illustrator):** is this real planned scope (home page REQ-8 copy mentions it) or stale/aspirational text? If real, is it per-author-per-book (a book with two authors could have different roles) or a single tag per author globally?
8. **Home-page requirement copy drift:** why does the REQ-4..REQ-10 card text on the home page change between sessions/reloads? If this is intentional (e.g., rotating marketing variants), it should be clearly out of scope for any QA oracle; if unintentional, it's a content bug in its own right since it currently describes several features (bulk-assign by subject, reading-list export, author roles, on-loan warning + undo) that do not appear to exist in the live UI.

---

## 3. Additional test coverage — prioritized regression structure

### P0 — Critical paths
- Add Book: Title and Authors required-field validation blocks submission (verified working).
- Add Book / Edit Book: top-level ISBN checksum validation blocks save on malformed/invalid-checksum input (verified working).
- Edit Book: per-edition ISBN checksum validation blocks save (verified working this pass; was broken in the prior pass — regression-guard this).
- Add Book / Edit Book: duplicate-ISBN detection blocks save regardless of punctuation/dash formatting (verified working this pass — regression-guard this).
- RBAC: Patron cannot reach `#/books/new`, `#/books/:id/edit`, `#/import`, `#/manage`, `#/activity`, `#/admin` via the nav bar (links absent) or via direct URL (redirected to `#/catalog`) — verified for all six.
- RBAC: Librarian can reach Add/Edit/Import/Manage/Activity (nav links present, pages load) but is redirected away from `#/admin` via both nav (link absent) and direct URL — verified.
- Bulk Import: row-level validation correctly flags and excludes (checkbox disabled, not counted in "valid") rows with invalid-checksum ISBN and missing Title; valid rows remain selectable and the "Import N books" count matches the valid-row count — verified.
- Admin "Reset to sample data" restores exactly 11 books / 16 authors / 9 subjects / 19 editions after prior test pollution, with a confirmation dialog gate — verified (used to clean up this pass).
- Book edit form: unsaved-changes guard (`confirm()` on navigating away with modified fields) fires correctly — verified.

### P1 — Important, non-blocking-path coverage
- Duplicate title+author detection: once product decides the intended behavior (see Clarifying Q1), add a regression test asserting that behavior consistently in **both** the Add Book form and Bulk Import.
- Subject rename-to-an-existing-name: regression test asserting no duplicate-named subject row is created (currently fails — defect #3) once fixed.
- Author Merge: confirm books previously linked to the merged-away author are re-linked to the target author, the source author record disappears from the Authors tab, and clicking Cancel in the merge dialog leaves all data untouched (dialog content and option list verified this pass; the actual merge commit was not executed to avoid unnecessary data mutation).
- Activity log completeness: confirm an **edit** to an existing book (not just Add) produces its own Activity entry with correct role/timestamp (only Add was directly observed this pass).
- Activity log, once subject/author actions are added (per Clarifying Q4): confirm Rename/Merge/Remove on both tabs appear with correct actor/timestamp.
- Cover image "Image URL" vs. "Upload" toggle on Add/Edit Book: switching between the two tabs should not silently discard a value already entered in the other.
- Catalog filters — Author, Edition language, Edition format, "Available to borrow" checkbox, subject chips, Sort dropdown, free-text search — verified individually present; add coverage for combinations (e.g., subject chip + author filter + sort together) and for empty-result states.
- Admin Backup (download JSON) → Restore (upload that JSON) round-trips to the same catalog state.
- Delete flow (REQ-6) full verification — confirmation dialog copy, on-loan warning condition, audit-trail reason capture, and the "undo" window — in an environment where destructive actions are permitted (this pass could not exercise Delete at all per test-harness policy).
- Erase All (REQ-10) full verification — confirmation dialog copy, backup-first prompt, and post-erase state (books gone, authors/subjects/activity retained as the Admin page copy currently claims) — same caveat as above.

### P2 — Secondary / polish coverage
- Bulk Import delimiter handling: verify both `;` and `|` work as the multi-value separator for authors/subjects/keywords, per the on-page help text (Excel-in-Spanish-locale case specifically called out in the UI copy).
- "Download CSV template" produces a file whose header row matches the documented column list exactly.
- Edit Book: keyword chip add/remove, e-book/online-resource link add/remove (UI present and interactive; not exhaustively exercised this pass).
- Catalog grid/list view toggle: verify whether the choice persists across reload/navigation (current behavior unconfirmed).
- Catalog "Export list" and Activity "Export CSV" buttons produce correctly formatted output (not exercised — would trigger a file download).
- UX regression: when two subjects share a display name (post defect #3), the Catalog's subject-filter chip row renders two visually identical, unlabeled-as-different chips ("Science" / "Science") and a book can show the same subject name twice as separate badges (observed on *The Feynman Lectures on Physics*) — confusing even before considering the underlying data bug; worth its own visual-regression test once the root cause is fixed, to ensure duplicate-looking chips can't recur.
- Role switch mid-session while an Add/Edit form has unsaved input: verify what happens to the in-progress form (not exercised this pass).

---

## State at end of run

All exploratory test data created during this pass was removed via **Admin → Reset to sample data** (confirmed in the dialog), restoring the app to the clean 11-book / 16-author / 9-subject / 19-edition seed state — the same state this pass started from. The role selector was left on **Administrator**. No Delete or Erase-all actions were attempted at any point, consistent with the test's safety constraints (and independently enforced by the test harness, which refused a Delete-button click as "Modify Shared Resources").
