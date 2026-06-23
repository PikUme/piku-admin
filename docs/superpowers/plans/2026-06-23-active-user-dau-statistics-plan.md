# Active User DAU Statistics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the measurable-in-name-only visitor statistics with a KST-based active-member/DAU view using deterministic data, four precise KPIs, a single-series line chart, a daily comparison table, and matching CSV export.

**Architecture:** Keep the existing member, diary, and AI photo tabs on their current generic data model. Introduce a focused active-user model and UI components for the first tab, then branch at the statistics page composition boundary. This avoids forcing the precise DAU contract into the legacy two-series chart/table abstractions and leaves a clean seam for a future backend API.

**Tech Stack:** Next.js 16.2 App Router, React 19 client components, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Establish the active-user data contract and deterministic fixtures

**Files:**
- Create: `domains/admin/statistics/model/active-user-data.ts`
- Modify: `domains/admin/statistics/model/statistics-data.ts`
- Test: `domains/admin/statistics/model/active-user-data.test.ts`

- [ ] **Step 1: Write failing model tests**

Add tests that require:

```ts
expect(ACTIVE_USER_DATA["7d"].startDate).toBe("2026-06-16");
expect(ACTIVE_USER_DATA["7d"].endDate).toBe("2026-06-22");
expect(ACTIVE_USER_DATA["7d"].daily).toHaveLength(7);
expect(ACTIVE_USER_DATA["30d"].daily).toHaveLength(30);
expect(ACTIVE_USER_DATA["3m"].daily).toHaveLength(90);

const sevenDay = ACTIVE_USER_DATA["7d"];
expect(sevenDay.summary.activeMemberDays).toBe(
  sevenDay.daily.reduce((sum, point) => sum + point.dau, 0),
);
expect(sevenDay.summary.averageDau).toBe(
  Math.round(sevenDay.summary.activeMemberDays / sevenDay.daily.length),
);
```

Also assert that each point's `changeCount` and `changeRate` match its previous-day baseline and that the peak date resolves to the most recent date when values tie.

- [ ] **Step 2: Run the model test and verify RED**

Run:

```bash
pnpm test domains/admin/statistics/model/active-user-data.test.ts
```

Expected: FAIL because `active-user-data.ts` and its exports do not exist.

- [ ] **Step 3: Add the focused model**

Define:

```ts
export interface ActiveUserDailyPoint {
  date: string;
  dau: number;
  changeCount: number;
  changeRate: number | null;
}

export interface ActiveUserStatisticsData {
  range: TimeRange;
  timeZone: "Asia/Seoul";
  startDate: string;
  endDate: string;
  summary: {
    uniqueActiveMemberCount: number;
    uniqueActiveMemberChangeRate: number | null;
    averageDau: number;
    averageDauChangeRate: number | null;
    peakDau: number;
    peakDate: string | null;
    activeMemberDays: number;
    activeMemberDaysChangeRate: number | null;
  };
  daily: ActiveUserDailyPoint[];
}
```

Generate fixed 7-, 30-, and 90-day series ending on `2026-06-22`, calculate summaries from the series, and provide explicit period-unique active-member counts because those cannot be derived from daily DAU alone. Rename the first tab ID from `visitor` to `active`; keep legacy data limited to `member | diary | photo`.

- [ ] **Step 4: Run the model test and verify GREEN**

Run:

```bash
pnpm test domains/admin/statistics/model/active-user-data.test.ts
```

Expected: PASS.

### Task 2: Specify the new first-tab behavior at page level

**Files:**
- Modify: `domains/admin/statistics/ui/statistics.test.tsx`
- Modify: `domains/admin/statistics/ui/tabs.tsx`
- Modify: `domains/admin/statistics/ui/statistics.tsx`

- [ ] **Step 1: Replace obsolete visitor assertions with failing active-user assertions**

Require the initial render to contain:

```ts
expect(screen.getByRole("button", { name: "활성 사용자/DAU" })).toBeInTheDocument();
expect(screen.getByText("7일 활성 회원 수")).toBeInTheDocument();
expect(screen.getByText("평균 DAU")).toBeInTheDocument();
expect(screen.getByText("최대 DAU")).toBeInTheDocument();
expect(screen.getByText("누적 활성 회원·일")).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "DAU 추이" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "날짜별 DAU 상세" })).toBeInTheDocument();
```

Assert the page does not render `평균 체류 시간`, `신규 방문`, `재방문`, `재방문율`, or `가입 전환` in the active tab.

- [ ] **Step 2: Run the page test and verify RED**

Run:

```bash
pnpm test domains/admin/statistics/ui/statistics.test.tsx
```

Expected: FAIL on the old `방문/DAU` label and visitor metrics.

- [ ] **Step 3: Add the active tab composition**

Change the first tab to `{ id: "active", label: "활성 사용자/DAU" }`. In `StatisticsPage`, select `ACTIVE_USER_DATA[timeRange]` for the active tab and render active-specific KPI, chart, table, date range, and CSV behavior. Preserve the existing rendering path for `member`, `diary`, and `photo`.

- [ ] **Step 4: Run the page test and verify the composition passes**

Run:

```bash
pnpm test domains/admin/statistics/ui/statistics.test.tsx
```

Expected: the new composition assertions pass; chart/table component assertions may remain pending until Tasks 3 and 4.

### Task 3: Implement precise KPI cards and the DAU line chart

**Files:**
- Modify: `domains/admin/statistics/ui/kpi-cards.tsx`
- Create: `domains/admin/statistics/ui/dau-line-chart.tsx`
- Create: `domains/admin/statistics/ui/dau-line-chart.test.tsx`
- Modify: `domains/admin/statistics/ui/statistics.tsx`

- [ ] **Step 1: Write failing chart accessibility and peak tests**

Render a three-point series and require:

```ts
expect(screen.getByRole("img", { name: "일별 DAU 선 차트" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "2026.06.21 DAU 120명" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "2026.06.22 DAU 180명, 최대 DAU" })).toBeInTheDocument();
```

Focus the peak point and assert the visible tooltip includes `2026.06.22` and `180명`. Add a zero-only series test to prove there is no invalid SVG geometry.

- [ ] **Step 2: Run the chart test and verify RED**

Run:

```bash
pnpm test domains/admin/statistics/ui/dau-line-chart.test.tsx
```

Expected: FAIL because `DauLineChart` does not exist.

- [ ] **Step 3: Build the chart and KPI help text**

Create an SVG single-series line chart with responsive `viewBox`, deterministic Y-axis ticks, focusable transparent point buttons, mouse/focus tooltip behavior, and peak point emphasis. Extend KPI data with optional `description` and render an accessible info control using `aria-label` and `title`.

- [ ] **Step 4: Run chart and page tests and verify GREEN**

Run:

```bash
pnpm test domains/admin/statistics/ui/dau-line-chart.test.tsx domains/admin/statistics/ui/statistics.test.tsx
```

Expected: PASS.

### Task 4: Implement the daily DAU table and date search

**Files:**
- Create: `domains/admin/statistics/ui/dau-table.tsx`
- Create: `domains/admin/statistics/ui/dau-table.test.tsx`
- Modify: `domains/admin/statistics/ui/statistics.tsx`

- [ ] **Step 1: Write failing table tests**

Require columns `날짜`, `DAU`, `전일 대비`, and `전일 대비율`. Assert descending date order, `+120명`, `-30명`, `0명`, percent formatting, `신규` when `changeRate` is `null`, and filtering with all supported date forms:

```ts
await user.type(search, "2026-06-22");
await user.clear(search);
await user.type(search, "2026.06.22");
await user.clear(search);
await user.type(search, "06.22");
```

- [ ] **Step 2: Run the table test and verify RED**

Run:

```bash
pnpm test domains/admin/statistics/ui/dau-table.test.tsx
```

Expected: FAIL because `DauTable` does not exist.

- [ ] **Step 3: Build the focused table**

Render daily points newest-first without mutating the source array. Normalize `-` and `.` in date searches. Highlight the peak row, format signed counts and rates, and show `검색 결과가 없습니다.` for no matches.

- [ ] **Step 4: Run table and page tests and verify GREEN**

Run:

```bash
pnpm test domains/admin/statistics/ui/dau-table.test.tsx domains/admin/statistics/ui/statistics.test.tsx
```

Expected: PASS.

### Task 5: Complete range switching and active-user CSV export

**Files:**
- Modify: `domains/admin/statistics/ui/statistics.test.tsx`
- Modify: `domains/admin/statistics/ui/statistics.tsx`

- [ ] **Step 1: Add failing range and CSV tests**

Assert:

```ts
fireEvent.click(screen.getByRole("button", { name: "30일" }));
expect(screen.getByText("2026.05.24 - 2026.06.22")).toBeInTheDocument();
expect(screen.getByText("30일 활성 회원 수")).toBeInTheDocument();

fireEvent.click(screen.getByRole("button", { name: "3개월" }));
expect(screen.getByText("2026.03.25 - 2026.06.22")).toBeInTheDocument();
expect(screen.getByText("3개월 활성 회원 수")).toBeInTheDocument();
```

Capture the generated Blob and download attribute. Require the active CSV filename to match `piku_active_users_dau_7d_2026-06-16_2026-06-22.csv` and its headers to be `날짜,DAU,전일 대비,전일 대비율`.

- [ ] **Step 2: Run the page test and verify RED**

Run:

```bash
pnpm test domains/admin/statistics/ui/statistics.test.tsx
```

Expected: FAIL on old hard-coded dates or old CSV filename/columns.

- [ ] **Step 3: Implement active range and export behavior**

Read active date labels from the selected data object. Export the full selected range regardless of the table search query, newest-first, with UTF-8 BOM and the agreed filename. Preserve legacy CSV behavior for the other three tabs.

- [ ] **Step 4: Run the page test and verify GREEN**

Run:

```bash
pnpm test domains/admin/statistics/ui/statistics.test.tsx
```

Expected: PASS.

### Task 6: Regression verification and cleanup

**Files:**
- Modify only if verification exposes a defect.

- [ ] **Step 1: Run the statistics test suite**

Run:

```bash
pnpm test domains/admin/statistics
```

Expected: all statistics tests pass with no React warnings.

- [ ] **Step 2: Run repository verification**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 3: Check removed terminology and diff hygiene**

Run:

```bash
rg -n "평균 체류 시간|신규 방문|재방문율|가입 전환|방문/DAU" domains/admin/statistics
git diff --check
git status --short
```

Expected: removed terminology appears only in tests that assert absence, `git diff --check` is clean, and status contains only intended implementation files.
