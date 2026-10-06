# Inflecta Library — Page Object Model (POM) Plan

Live app: `http://192.168.1.24:5173/` ("Inflecta Library"). Selectors below were extracted directly from the running DOM (`element.id`, `element.getAttribute('name')`, `element.className`) via Playwright's `browser_evaluate`, not guessed from the accessibility tree.

## Global finding: no `id`, `name`, or `data-testid` attributes anywhere

Across every page crawled, almost no interactive element carries an `id` or `name` attribute (three exceptions: `#authors`, `#subjects`, `#kw` on the Add-book form — see below), and **zero** elements carry `data-testid`/`data-test`. Class names are human-readable and semantic (`btn`, `btn primary`, `btn sm`, `btn sm outline-danger`, `chip`, `chip active`, `cover-link`, `title`, `rel`, `kw-tag`), not CSS-module hashes — so class selectors are viable as a *fallback*, but they are layout/styling classes, not stable test hooks, and several are reused across unrelated buttons (e.g. plain `.btn` appears on "Export list", "Download CSV template", "Download backup", and "Reset to sample data" — four different buttons on four different pages share the exact same class).

**Top recommendation across the whole POM:** prefer Playwright's role/label/text locators (`getByRole`, `getByPlaceholder`, `getByText`) over CSS class selectors everywhere below — they already work today because the app has decent ARIA labels and placeholders, and they won't break when class names are refactored for styling. Where a table below lists a CSS selector, treat it as the fallback the POM uses only when no accessible name is available (e.g. a button that's genuinely ambiguous by role+name alone, like the four repeated `.btn` buttons above, which must be disambiguated by role+name instead, e.g. `getByRole('button', { name: 'Reset to sample data' })`). A standing recommendation to hand to the dev team: add `data-testid` to the repeated/ambiguous controls (catalog card actions, subject/author row actions, admin danger buttons) — this is the single highest-leverage change they could make for test stability.

---

## 1. Header / Navigation (present on every page)

| Element | Selector evidence | Recommended Playwright locator |
|---|---|---|
| Brand/home link | `a.brand` → `href="#/"` | `page.getByRole('link', { name: 'Inflecta Library' })` |
| Mobile menu toggle | `button.burger`, `aria-label="Menu"` | `page.getByRole('button', { name: 'Menu' })` |
| Nav links | plain `<a>`, no class, `href="#/catalog"` etc. | `page.getByRole('navigation').getByRole('link', { name: 'Catalog' \| 'Add book' \| 'Bulk import' \| 'Subjects & authors' \| 'Activity' \| 'Admin' })` |
| Role selector | `<select>`, **real `value`s**: `patron`/`librarian`/`admin` (the only element in the whole app with meaningful `value`s) | `page.getByLabel('Role').selectOption('admin')` |

**POM recommendation:** build a `HeaderComponent` (not a page) composed into every Page Object via a `readonly header: HeaderComponent` field, since nav + role switcher are identical on all 8 routes. Expose `header.navigateTo(section)` and `header.signInAs(role: 'patron'|'librarian'|'admin')` using the real `select` values above — this is the one place in the app where value-based selection is safe and preferable to label text.

---

## 2. Home (`#/`)

| Element | Selector evidence | Recommended Playwright locator |
|---|---|---|
| Search input | `aria-label="Search the catalog"`, placeholder `"Search title, author, ISBN or keyword…"` | `page.getByRole('searchbox', { name: 'Search the catalog' })` |
| Search submit | `button.btn.primary[type=submit]`, text "Search" | `page.getByRole('button', { name: 'Search' })` scoped to `page.getByRole('search')` |
| "Browse catalog" / "+ Add a book" CTAs | `a.btn` / `a.btn.ghost` | `page.getByRole('link', { name: 'Browse catalog' \| '+ Add a book' })` |
| Subject chip-links (stat breakdown) | `a.chip-link`, `href="#/catalog?subject=s-lit"` etc. | `page.getByRole('link', { name: /^Literature/ })` — note the accessible name includes the count ("Literature\n5"), so match by prefix |
| Recently-added cards | `a.recent-item` × 6 | `page.locator('a.recent-item').filter({ hasText: 'Pride and Prejudice' })` |
| REQ-4..REQ-10 requirement cards | `a.feature` × 7 | `page.locator('a.feature').filter({ hasText: 'REQ-6' })` |

**POM recommendation:** `HomePage` needs a `searchCatalog(term)` method and a `goToRequirementCard(reqId)` helper (`REQ-4`..`REQ-10`) since these cards are the de-facto sitemap for this training app and will be referenced constantly from tests that trace scenarios back to requirements. **Caveat to carry into every test using this page:** the requirement-card copy text has been observed to change wording between sessions (confirmed twice in this project's QA passes) — don't assert on the full description text of these cards, only on `REQ-n` + the short heading, which have stayed stable.

---

## 3. Add a book (`#/books/new`) — and Edit (`#/books/{id}/edit`, same DOM shape, submit button reads "Save changes" instead of "Add to catalog")

| Field group | Element | Selector evidence | Recommended Playwright locator |
|---|---|---|---|
| Basics | ISBN | plain `<input>`, placeholder `"978-…"` | `page.getByPlaceholder('978-…')` |
| Basics | Auto-fill button | `button.btn[type=button]`, text "Auto-fill from Open Library" | `page.getByRole('button', { name: 'Auto-fill from Open Library' })` |
| Basics | Title | plain `<input>`, accessible name "Title *" (via visually-adjacent label, no `for`/`id` link — verify) | `page.getByLabel('Title')` — **flag for dev:** if this fails, the label isn't programmatically associated; fall back to `page.locator('input').nth(n)` only as a last resort |
| Basics | First published | `<input type="date">`, no placeholder | `page.getByLabel('First published')` |
| Basics | Genre | plain `<input>` with a `<datalist>` of 9 suggestions, **not a `<select>`** — free text | `page.getByLabel('Genre')` |
| Authors & subjects | Authors | **`<input id="authors">`** — one of only 3 real ids in the app | `page.locator('#authors')` (safe to use the id here) |
| Authors & subjects | Subjects | **`<input id="subjects">`** | `page.locator('#subjects')` |
| Description | Summary | `<textarea>`, placeholder "A short description shown in the catalog", live `0/2000` counter | `page.getByPlaceholder('A short description shown in the catalog')` |
| Description | Keywords | **`<input id="kw">`** | `page.locator('#kw')` |
| Editions | "+ Add edition" | `button.btn.sm` | `page.getByRole('button', { name: '+ Add edition' })` |
| Editions (per row, after expanding) | Edition name/Year/Publisher/ISBN/Language/Format/Copies | plain inputs/selects, no id — disambiguate via `getByLabel` within the edition fieldset | `page.getByRole('group', { name: /Edition/ }).getByLabel('Year')` style scoping (verify fieldset has an accessible group role/name once expanded) |
| Physical & digital | Pages/Dimensions/Weight | plain inputs, `type=number` for Pages, placeholders for the other two | `page.getByLabel('Pages')`, `page.getByPlaceholder('20 × 13 × 2 cm')`, `page.getByPlaceholder('350 g')` |
| Physical & digital | "+ Add link" | `button.btn.sm` | `page.getByRole('button', { name: '+ Add link' })` |
| Cover (sidebar) | Image URL / Upload toggle | `button.on` (active state) vs. plain `button` | `page.getByRole('button', { name: 'Image URL' })` / `{ name: 'Upload' }` |
| Cover (sidebar) | Cover URL input | placeholder `"https://…/cover.jpg"` | `page.getByPlaceholder('https://…/cover.jpg')` |
| Submit | Add to catalog / Save changes | `button.btn.primary[type=submit]` | `page.getByRole('button', { name: 'Add to catalog' })` (Add) / `{ name: 'Save changes' }` (Edit) |
| Cancel | | `a.btn.ghost`, `href="#/catalog"` | `page.getByRole('link', { name: 'Cancel' })` |

**POM recommendation:** this is the most complex page in the app and deserves a dedicated `AddEditBookPage` with a shared base (since Add/Edit share the exact DOM shape bar the submit label — inject it as a constructor param, e.g. `new AddEditBookPage(page, { submitLabel: 'Add to catalog' | 'Save changes' })`). Model the "Editions" and "+ Add link" repeatable blocks as a sub-component class (`EditionRow`) returned from an `addEdition()` method, since the form supports N editions and N e-book links and tests will need to target a specific row by index or by its own fields. Expose a single `fillRequiredFields({ title, authors })` convenience method since Title+Authors are the only two fields blocking submission — most P0 tests only need these two.

---

## 4. Book detail (`#/books/{id}`)

| Element | Selector evidence | Recommended Playwright locator |
|---|---|---|
| Edit book | `a.btn.primary`, `href="#/books/{id}/edit"` | `page.getByRole('link', { name: 'Edit book' })` |
| Delete | `button.btn.outline-danger` | `page.getByRole('button', { name: 'Delete', exact: true })` |
| Author link | plain `<a>`, `href="#/catalog?author=a-austen"` | `page.getByRole('link', { name: 'Jane Austen' })` |
| Subject link | `a.plain` | `page.getByRole('link', { name: 'Literature' })` |
| Keyword tags | `a.kw-tag`, `href="#/catalog?q=romance"` | `page.locator('a.kw-tag').filter({ hasText: 'romance' })` |
| External e-book link | plain `<a>` to an external `https://` URL | `page.getByRole('link', { name: /Project Gutenberg/ })` |
| Related books | `a.rel` × up to 4 | `page.locator('a.rel')` |

**POM recommendation:** `BookDetailPage` should expose `clickDelete()` returning a `ConfirmDialog` component (see §9 below — confirmation-dialog shape is still unverified live per the project's QA notes, so the POM method should be written defensively and the first test against it should assert the dialog's actual shape rather than assume one). Keep `relatedBooks` as a `Locator` collection, not individually-named getters, since the set is data-dependent.

---

## 5. Catalog (`#/catalog`)

| Element | Selector evidence | Recommended Playwright locator |
|---|---|---|
| Export list | `button.btn`, text "Export list" (new since last crawl — see note) | `page.getByRole('button', { name: 'Export list' })` |
| + Add book | `a.btn.primary` | `page.getByRole('link', { name: '+ Add book' })` |
| Search | `input[type=search]`, `aria-label="Search"`, placeholder "Title, author, ISBN, keyword…" | `page.getByRole('searchbox', { name: 'Search' })` |
| Author filter | `<select aria-label="Author">` | `page.getByLabel('Author')` |
| Edition language filter | `<select aria-label="Edition language">` | `page.getByLabel('Edition language')` |
| Edition format filter | `<select aria-label="Edition format">` (new since last crawl) | `page.getByLabel('Edition format')` |
| "In stock only" checkbox | `input[type=checkbox]`, no visible label captured — verify accessible name live | `page.getByRole('checkbox')` scoped near the filter bar; confirm label text before relying on `getByLabel` |
| Sort | `<select aria-label="Sort">` | `page.getByLabel('Sort')` |
| Grid/List view toggle | `button.on` (active) / plain `button`, text `▦` / `☰` | `page.getByRole('button', { name: '▦' })` / `{ name: '☰' }` — **brittle**: these are raw glyph characters as the accessible name; ask dev to add `aria-label="Grid view"/"List view"` |
| Subject filter chips | `button.chip` / `button.chip.active` | `page.getByRole('button', { name: 'Literature' })` (scope to the chip row container to avoid colliding with the subject *links* elsewhere on the page) |
| Book card | `article.book` (repeated, one per book) | `page.locator('article.book').filter({ hasText: 'Pride and Prejudice' })` |
| → card cover/title link | `a.cover-link` / `a.title` | `page.locator('article.book', { hasText: title }).getByRole('link', { name: title })` |
| → card Edit | `a.btn.sm`, `href=".../edit"` | `.getByRole('link', { name: 'Edit' })` scoped to the card |
| → card Delete | `button.btn.sm.outline-danger` | `.getByRole('button', { name: 'Delete' })` scoped to the card |

**POM recommendation:** `CatalogPage` should expose a `bookCard(title: string)` method returning a `BookCardComponent` (with `.open()`, `.edit()`, `.delete()`) rather than raw locators — every test in the suite will need to find a card by title, and centralizing the `article.book` scoping here means a future DOM change (e.g. a `data-testid="book-card"` the dev team adds) only needs updating in one place. Treat the filter/sort toolbar as its own `CatalogFilterBar` sub-component, since §5's filter options (language, format) have already changed once between crawls — isolating it limits the blast radius of future UI changes to one file.

---

## 6. Subjects & authors (`#/manage`)

| Element | Selector evidence | Recommended Playwright locator |
|---|---|---|
| Subjects / Authors tabs | `button[role=tab]`, active tab gets class `.on` | `page.getByRole('tab', { name: /Subjects/ })` / `{ name: /Authors/ }` (names include live counts, e.g. "Subjects 9" — match with a regex prefix) |
| Filter box | `input[type=search]`, placeholder "Filter subjects…" / "Filter authors…" | `page.getByPlaceholder('Filter subjects…')` |
| New subject/author name | plain `<input>`, placeholder "New subject name" / "New author name" | `page.getByPlaceholder('New subject name')` |
| Add button | `button.btn.primary[type=submit]`, disabled until text entered | `page.getByRole('button', { name: 'Add', exact: true })` |
| Subject color swatch | **`<input type="color">`**, `aria-label="Color for {Name}"` — this is a genuine native color picker, not a mislabeled textbox (correcting an earlier assumption in this project's QA notes) | `page.getByLabel('Color for Art')` |
| Row Rename | `button.btn.sm` | scoped: `page.getByRole('row', { name: /Art/ }).getByRole('button', { name: 'Rename' })` |
| Row Remove | `button.btn.sm.outline-danger` | `.getByRole('button', { name: 'Remove' })` scoped to the row |
| Row Merge (Authors tab only) | `button.btn.sm`, text "Merge" — **Subjects tab has no equivalent** | `.getByRole('button', { name: 'Merge' })` scoped to the row |

**POM recommendation:** `ManageSubjectsAuthorsPage` with two tab-scoped sub-components, `SubjectsTab` and `AuthorsTab`, sharing a common `TaxonomyRow` component (`rename()`, `remove()`) that `AuthorsTab`'s row extends with `merge(targetName)`. Because `getByRole('row', { name })` matches on the row's full accessible text (which includes the book count, e.g. "Art 2 books"), prefer matching on just the name as a substring/regex rather than exact text — the count changes as books are added/removed and would make tests flaky if matched exactly.

---

## 7. Bulk import (`#/import`)

| Element | Selector evidence | Recommended Playwright locator |
|---|---|---|
| Download CSV template | `button.btn` | `page.getByRole('button', { name: 'Download CSV template' })` |
| File drop zone / picker | `input[type=file]` with class `sr-only` (visually hidden; a styled drop-zone `div` sits in front of it) | `page.getByRole('button', { name: /Drop a .csv or .json file here/ })` to trigger the picker, or `page.locator('input[type=file]').setInputFiles(path)` directly (works even though the input is visually hidden — Playwright doesn't require visibility for `setInputFiles`) |

**POM recommendation:** `BulkImportPage.importFile(path: string)` should call `setInputFiles` directly on the hidden `input[type=file]` rather than trying to drag-and-drop through the styled drop-zone — far more reliable in CI, and the hidden-input approach is standard Playwright practice for custom file-upload widgets like this one.

---

## 8. Activity (`#/activity`)

| Element | Selector evidence | Recommended Playwright locator |
|---|---|---|
| Export CSV | `button.btn` | `page.getByRole('button', { name: 'Export CSV' })` |
| Filter by book/user | `input[type=search]`, placeholder "Filter by book or user…" | `page.getByPlaceholder('Filter by book or user…')` |
| Action-type filter | `<select>` — options now: All actions / Added / Edited / Deleted / **Restored** (new since the project's last crawl) / Bulk import / Erased all | `page.getByRole('combobox').selectOption({ label: 'Deleted' })` — **scope this precisely**, there's no distinguishing `aria-label` captured, so prefer `page.locator('main select')` if the page only has one `<select>` |
| Log entries | `<li class="import">` etc. (class varies by action type, e.g. likely `.add`, `.edit`, `.delete`) — only one entry exists on a freshly-reset app | `page.getByRole('listitem').filter({ hasText: 'Pride and Prejudice' })` |

**POM recommendation:** `ActivityPage.filterByAction(action)` and `.entries()` returning a `Locator` for `li` items; assert on entry text via `.filter({ hasText })` rather than nth-index, since log ordering is newest-first and will shift as tests run. **Flag for the dev team:** the action-type `<select>` has no `aria-label`/associated `<label>` captured in this crawl — recommend adding one (e.g. `aria-label="Filter by action"`) so tests don't have to rely on positional `main select` scoping.

---

## 9. Admin (`#/admin`, Administrator role only)

| Element | Selector evidence | Recommended Playwright locator |
|---|---|---|
| Download backup | `button.btn` | `page.getByRole('button', { name: 'Download backup' })` |
| Restore (file input) | `input[type=file]`, class `sr-only` | `page.locator('input[type=file]').setInputFiles(path)` (same pattern as Bulk Import) |
| Reset to sample data | `button.btn` | `page.getByRole('button', { name: 'Reset to sample data' })` → opens an `alertdialog` ("Reset to sample data?") with **Cancel** / **Reset** buttons — confirmed live in this project's QA work |
| Erase all books | **`button.btn.danger`** — the only button in the whole app with the `danger` class (Delete/Remove buttons use `outline-danger` instead) | `page.getByRole('button', { name: 'Erase all books' })` |

**POM recommendation:** `AdminPage` should expose `resetToSampleData()` as a method that internally handles the confirm dialog (click → `page.getByRole('alertdialog').getByRole('button', { name: 'Reset', exact: true }).click()`), since this project's own QA workflow already uses this action routinely to clean up test pollution between runs — making it a first-class, one-call POM method (rather than ad-hoc dialog handling in every test) will save real duplication. For `eraseAllBooks()` and any single-book `delete()`, write the method but **do not use it in automated regression yet** — per this project's QA analysis, the confirmation-dialog behavior for both of these destructive flows is still unverified, and every attempt to click "Delete" against the live/shared instance has been blocked by the environment's own safety policy. Any test exercising these two flows should run against an isolated/disposable instance, never the shared one.

---

## Cross-cutting POM architecture recommendations

1. **Locator strategy hierarchy, in order of preference:** (1) `getByRole`/`getByLabel` using the real accessible name, (2) `getByPlaceholder` where no accessible name exists, (3) the three real `id`s (`#authors`, `#subjects`, `#kw`), (4) CSS class scoped to a specific parent (e.g. `article.book` filtered by title) — never a bare class selector at the page level, since classes like `.btn` and `.chip` repeat across dozens of unrelated elements.
2. **No `data-testid` exists anywhere** — this is the single biggest risk to long-term POM stability, since every locator above depends on visible text/labels that product copy has already been observed to change between sessions (see Home page note). Recommend the dev team add `data-testid` to: catalog card root + its Edit/Delete buttons, Subjects/Authors row root + its action buttons, and the three admin danger-zone buttons.
3. **Shared components over per-page duplication:** `HeaderComponent` (nav + role switcher), `BookCardComponent` (catalog + home "recently added" + "related books" all render the same card shape), `TaxonomyRow`/`AuthorRow` (Subjects/Authors management), `ConfirmDialog` (Reset-to-sample-data today; Delete and Erase-all once their real confirmation UI is verified).
4. **Isolate anything observed to drift:** the Home page's REQ-4..REQ-10 card descriptions and the Catalog filter bar's exact option set have both changed between this project's crawls. POM methods that touch these areas should expose narrow, stable accessors (e.g. `getRequirementCard('REQ-6')` returning just the card locator) rather than page objects that assert full text content, so the suite doesn't need updating every time the app's own copy drifts.
