# BlastCanvas QA Audit

Date: 21 October 2026
Audited target: `https://blast-designing.pages.dev/` and this repository
Stack: React 19, Next.js 16 via Vinext/Vite, Cloudflare Pages, client-side SVG
Assumptions: metric surface bench blasting; entered site constants and PPV criterion belong to the competent person; no backend, authentication, upload, or persistent storage exists.

## 1. Summary

| ID | Title | Severity | Status |
|---|---|---:|---|
| BUG-001 | Draft values changed results and CSV before Apply | High | Fixed and verified |
| BUG-002 | PPV used charge per hole instead of maximum charge per delay | Critical | Fixed and verified |
| BUG-003 | Invalid geometry could produce non-finite or unsafe output | High | Fixed and verified |
| BUG-004 | Production dependency tree contained a critical Next.js advisory | Critical | Fixed; production audit clean |
| BUG-005 | Declared test command referenced a missing test | Medium | Fixed and verified |

## 2. Detailed bug reports

### BUG-002
**Title:** PPV used charge per hole instead of maximum charge per delay
**Severity:** Critical
**Category:** Calculation / Safety
**Location:** `app/page.tsx`, `Home` calculation and `Pattern` timing summary
**Steps to reproduce:** Configure 2 rows × 2 holes; set inter-hole and inter-row delay to 0 ms; apply.
**Input values:** 4 holes, 68 kg/hole, all at 0 ms, distance 300 m, K 1140, n 1.6.
**Expected result:** Q = 272 kg; scaled distance = 18.19 m/√kg; PPV = 10.99 mm/s; breach of 10 mm/s criterion.
**Actual result before fix:** Q = 68 kg; PPV = 3.63 mm/s; design incorrectly shown within limit.
**Root cause:** PPV always used `charge` for Q and ignored holes sharing a delay.
**Fix (code):** `Pattern` groups holes by cumulative delay, sums charge in each group, and reports the maximum group charge to `Home`; scaled distance and PPV use that value.
**Verification test:** Same input now shows max charge/delay 272 kg, PPV 10.99 mm/s, and Review required.
**Regression risk:** Timing edits and auto patterns change the group calculation. Row snake, custom diagonal, manual connection, and zero-delay cases were exercised after the fix.

### BUG-001
**Title:** Draft values changed results and CSV before Apply
**Severity:** High
**Category:** Calculation / Data
**Location:** `app/page.tsx`, `Home`, output memo and `csv()`
**Steps to reproduce:** Start at 5 × 8; change Rows to 10 without pressing Apply.
**Input values:** Rows 10, holes/row 8.
**Expected result:** Diagram, result cards, status, and CSV remain at the last applied 40-hole design.
**Actual result before fix:** Result cards and CSV changed to 80 holes while the diagram remained at 40.
**Root cause:** Diagram used `applied`; calculations and export used draft state `x`.
**Fix (code):** All outputs, warnings, PPV comparisons, checks, and CSV now use `applied` and `appliedStagger`.
**Verification test:** Changing Rows to 10 without Apply leaves 40 SVG holes and Total holes 40.
**Regression risk:** Every output that previously updated live now updates only on Apply; input editing remains intact.

### BUG-003
**Title:** Invalid geometry could produce non-finite or unsafe output
**Severity:** High
**Category:** Validation / Safety
**Location:** `app/page.tsx`, `Home.invalid`; `app/globals.css`, validation message
**Steps to reproduce:** Set rows to 0, burden to 0, a negative delay, or stemming equal to total hole length.
**Input values:** Rows 0; or burden 0 m; or stemming 11 m with bench 10 m and subdrill 1 m.
**Expected result:** Design cannot be applied; a visible error explains acceptable input.
**Actual result before fix:** Apply remained available and calculations could show Infinity, NaN, or physically impossible charge-column values.
**Root cause:** Inputs had only a permissive HTML minimum and no design-level validation gate.
**Fix (code):** Apply is disabled unless counts are positive integers, required model values are finite and positive, offsets/delays are non-negative, stemming is shorter than hole length, and total holes do not exceed 2,500.
**Verification test:** Rows 0 disables Apply and displays the validation alert; 20 × 25 applies and renders 500 holes and 499 links.
**Regression risk:** Zero delays remain valid because simultaneous firing is a legitimate case that must be evaluated rather than blocked.

### BUG-004
**Title:** Production dependency tree contained a critical Next.js advisory
**Severity:** Critical
**Category:** Security
**Location:** `package.json`, `package-lock.json`
**Steps to reproduce:** Run `npm audit --omit=dev`.
**Input values:** Original dependency lock with Next.js 16.2.6 and unused `xlsx`.
**Expected result:** No known production vulnerabilities.
**Actual result before fix:** 1 critical, 4 high, and 1 moderate production advisories.
**Root cause:** Vulnerable Next.js version and an unused spreadsheet dependency with an unresolved high advisory.
**Fix (code):** Updated Next.js and eslint config to 16.4.2; removed unused runtime packages `xlsx`, `react-loading-skeleton`, and `drizzle-orm`.
**Verification test:** `npm audit --omit=dev` reports 0 vulnerabilities.
**Regression risk:** Build and client bundle were rebuilt after dependency changes; no removed package was imported by application code.

### BUG-005
**Title:** Declared test command referenced a missing test
**Severity:** Medium
**Category:** Environment
**Location:** `tests/rendered-html.test.mjs`, `package.json`
**Steps to reproduce:** Run `npm test`.
**Input values:** None.
**Expected result:** Production build and smoke test pass.
**Actual result before fix:** Node reported `Could not find tests/rendered-html.test.mjs`.
**Root cause:** The script existed but its test file did not.
**Fix (code):** Added a production-client bundle smoke test for the critical controls and secret-like strings.
**Verification test:** `npm test` passes 1/1 after a clean production build.
**Regression risk:** Asset filenames are content hashed; the test discovers the page bundle by prefix rather than using a fixed filename.

## 3. Complete corrected code

The complete corrected files are committed in the repository:

- `app/page.tsx`
- `app/globals.css`
- `package.json`
- `package-lock.json`
- `tests/rendered-html.test.mjs`

## 4. Test cases

| Test | Input | Expected | Actual |
|---|---|---|---|
| Applied-state consistency | Change rows 5→10 without Apply | Diagram and results remain 40 holes | 40 holes / 40 shown |
| Invalid count | Rows 0 | Apply disabled; alert visible | Passed |
| Impossible stemming | Bench 10, subdrill 1, stemming 11 | Apply disabled | Passed |
| Large pattern | 20 × 25 | 500 holes, 499 row-snake links | Passed; rendered in about 0.55 s in browser automation |
| Same-delay MIC | 2 × 2, both delays 0, 68 kg/hole | MIC 272 kg; PPV 10.99 mm/s; Review required | Passed |
| Custom diagonal | 5 × 7, top free face | 35 holes, 34 directed links | Passed |
| Production build | `npm run build` | Exit 0 | Passed |
| Lint | `npm run lint` | Exit 0 | Passed |
| Test gate | `npm test` | 1/1 pass | Passed |
| Production audit | `npm audit --omit=dev` | 0 vulnerabilities | Passed |

## 5. Features preserved

- [x] Square and staggered geometry
- [x] Apply-controlled design changes
- [x] Pattern, delay, and performance tabs
- [x] Draggable/mobile and fixed holes, overall and row-wise
- [x] Manual connection with per-link delay prompt
- [x] Row snake, row-parallel, column snake, diagonal, and custom diagonal sequences
- [x] Top, bottom, left, and right free-face orientation
- [x] Direction arrows and offset delay labels
- [x] Zoom, fixed zoom controls, and diagram scrolling
- [x] Hole table and hole inspector
- [x] CSV export
- [x] PPV limit warning and Kuz-Ram screening outputs
- [x] Mobile tap-to-connect flow

## 6. Remaining risks and unverified items

- The Konya/Hustrulid/Cunningham equations were not checked against licensed full-text book pages in this audit. The existing Kuz-Ram result remains explicitly a screening estimate. A blasting engineer must confirm the selected equation form and rock factor for the site.
- The entered PPV criterion, K, and n are editable and visible, but the application does not fetch current DGMS circulars. The competent person must enter and verify the current applicable limit.
- Hole inclination, deck charging, in-hole detonator delay, initiation-system range limits, contour plotting, persistence, import, PDF/image export, reset, print, and backend storage are not implemented. They were not silently simulated.
- Automated cross-browser execution was available only in the in-app Chromium surface. Safari, Firefox, and Edge remain unconfirmed.
- No committed visual baseline exists, so pixel-level visual regression is inconclusive.

---

## 2026-10-26 audit addendum

This addendum supersedes older implementation notes where they conflict with the current application.

### Summary

| ID | Finding | Severity | Status |
|---|---|---:|---|
| BUG-006 | Local and secondary deck charge were omitted from summary explosive mass | High | Fixed |
| BUG-007 | A zero-kilogram secondary deck could alter the ±7 ms maximum-charge window | High | Fixed |
| BUG-008 | Global hole defaults were synchronized by a render/effect state cascade | Medium | Fixed |
| BUG-009 | Workflow tabs and live output lacked complete state semantics | Medium | Fixed |
| BUG-010 | Compact row controls could overlap at desktop widths | Medium | Fixed |

### Calculation verification

- Rock volume: `holes × burden × spacing × bench height`.
- Rock mass: `rock volume × rock density`.
- Charge factor: `total explosive ÷ rock mass`, displayed in kg/t.
- User-defined powder factor: `rock mass ÷ total explosive`, displayed in t/kg.
- Scaled distance: `distance ÷ √(maximum charge in the configured firing window)`.
- PPV screening model: `K × scaled distance⁻ⁿ`; K, n, distance, and criterion remain visible and editable.
- Total explosive now sums each hole's primary charge and a positive secondary charge only when deck charging is enabled.
- Maximum charge per delay includes positive charge events whose firing times fall in a ±7 ms window. A zero-charge deck no longer creates a firing window.

### Verification evidence

| Test | Expected | Actual |
|---|---|---|
| Default-like 40-hole calculation | 600 m³; 1,380 t; 0.08058 kg/t | Passed |
| 300 m and 5.56 kg maximum charge | 127.228 m/√kg; 0.489 mm/s | Passed |
| No connected firing charge | PPV 0; scaled distance unavailable | Passed |
| Events at 100, 107, and 115 ms | Maximum ±7 ms window charge 5.56 kg | Passed |
| Deck disabled/enabled total | Disabled secondary omitted; enabled secondary included | Passed |
| 9 rows × 8 holes | 72 holes after Apply | Passed in production browser build |
| Diagonal, 72 holes | 71 directed connections | Passed in production browser build |
| Distance changed to 150 m | No leading zero; PPV 1.48 mm/s; SD 63.6 m/√kg | Passed in production browser build |

### Remaining engineering limits

- The PPV output is a screening prediction, not a site law. Site-specific constants require regression from monitored blasts.
- Full formula comparison against licensed Konya & Walter and Hustrulid text remains unverified. The interface keeps assumptions editable and labels the design as conceptual.
- No committed visual baseline exists, so visual regression remains inconclusive.
- Firefox, Safari, and Edge require separate execution; current automated browser evidence is Chromium based.
