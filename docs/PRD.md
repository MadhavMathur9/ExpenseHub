# Product Requirements Document (PRD) — ExpenseHub

## 1. Summary
ExpenseHub is a personal finance web application built with React 19, TypeScript, Vite, and Tailwind CSS v4, backed by Java 21, Spring Boot, and Keycloak. The frontend currently provides an authenticated dashboard (`DashboardPage.tsx`), a filterable transaction ledger with masked date range inputs and Excel export (`TransactionsPage.tsx`, `DateRangeFilter.tsx`), custom income and expense categories (`CategoriesPage.tsx`), multi-horizon savings goals and milestones (`GoalsPage.tsx`), profile and account lifecycle settings (`ProfilePage.tsx`), and multi-provider authentication (`AuthPage.tsx`, `AuthCallbackPage.tsx`).

Currently, `src/App.tsx` routes unauthenticated visitors at `/` directly to `/login`, displaying only a bare authentication card. This PRD defines two deliverables:
1. A high-precision, interactive landing page at `/` for signed-out visitors that previews the real ExpenseHub ledger and Recharts donut mechanics live in the browser.
2. Targeted P1 visual and usability refinements across the existing frontend components without modifying backend endpoints or `AuthContext.tsx` token and session logic.

---

## 2. Goals
- Present signed-out visitors at `/` with an interactive hero ledger and synchronized Recharts donut chart so they can test adding income and expenses before creating an account.
- Showcase all six core capability areas of ExpenseHub using realistic interface fragments that reflect the actual codebase components (`DateRangeFilter.tsx`, `TransactionModal.tsx`, `ReactMarkdown` AI advisor panels, milestone pacing bars, and two-step `DELETE` account protection).
- Resolve P1 interface issues observed in the current build while preserving the light palette, deep emerald accent (`#1B5E3F` / `#1A5F3F`), collapsible `Sidebar.tsx`, and tabular numeral formatting.
- Eliminate layout shifts (CLS = 0.00) during data loading across `TransactionsPage.tsx` and `GoalsPage.tsx` by replacing plain text loading strings with geometry-matched skeletons.

---

## 3. Out of Scope
- Changes to the Java 21, Spring Boot, or Keycloak backend services and API contracts (`src/api/client.ts`).
- Changes to JWT storage, automatic profile hydration, or 401/403 redirect handling inside `src/context/AuthContext.tsx`.
- Alterations to `AuthCallbackPage.tsx` OAuth token exchange or `?activated=true` email verification flows.
- Invented social proof, customer quotes, user counts, or star ratings.
- Dark mode themes or decorative vector illustrations.

---

## 4. Audience and Primary Job
- **Audience**: Salaried professionals, independent contractors, and households who want a fast, structured financial ledger without cluttered ads or upsells.
- **Primary Job to be Done**: Log income and expenses into custom categories, audit historical cash flow using instant search, masked dd/mm/yyyy date filters, and `.xlsx` exports, and track monthly, quarterly, yearly, and total savings milestones with on-demand AI pacing advice.

---

## 5. Landing Page Requirements

### Routing Architecture (`src/App.tsx`)
- Update the root route (`/`) using `useAuth()` from `src/context/AuthContext.tsx`:
  - When `user` is null (and auth hydration is complete), render `LandingPage.tsx`.
  - When `user` is authenticated, render the authenticated `MainLayout` and `DashboardPage`.
- Primary calls to action route directly to `/login?mode=register` for "Create account" and `/login` for "Sign in".

### Hero Section
- **Desktop Layout**: Two-column split inside a 1280px container (5 columns left for copy and actions, 7 columns right for the live interactive ledger and synchronized donut chart).
- **Mobile Layout**: Single-column vertical stack down to 360px width, with headline and actions above the interactive ledger.
- **Interactive Hero Ledger Mechanics**:
  - Displays 5 to 6 sample transactions matching the row architecture of `TransactionsPage.tsx` (Description, Category badge, Date in dd/mm/yyyy format, and right-aligned tabular Amount).
  - Provides `+ Sample income` and `+ Sample expense` buttons in the ledger header. Clicking either appends a realistic transaction, recalculates the live net balance and total spent figures, and redraws the Recharts donut chart.
  - Preserves the two-way synchronized hover behavior from `DashboardPage.tsx` so hovering a slice highlights its legend row and vice versa.
  - Caps visible rows inside a fixed-height container so adding rows causes zero vertical layout shift on the page.

### Six Alternating Feature Sections
Each section pairs one short, visitor-focused paragraph with one large interactive or structural product fragment on alternating left/right sides. No multi-card feature grids are permitted.

1. **Financial Overview** (`DashboardPage.tsx` preview): Shows the four summary KPI cards (Total Balance, Total Income, Total Expense, and the period-switchable Savings card across This Month, This Quarter, This Year, and Total with period-over-period comparison) above the two-way synced expense breakdown donut.
2. **Transaction Ledger** (`TransactionsPage.tsx` & `DateRangeFilter.tsx` preview): Demonstrates the filter toolbar with real-time keyword search, category selector, masked dd/mm/yyyy date range inputs with calendar drill-down, sort controls (Date or Amount), and `.xlsx` Excel export.
3. **Custom Categories** (`CategoriesPage.tsx` preview): Displays partitioned Income (Salary, Freelance, Investment) and Expense (Food, Rent/Utilities, Entertainment, Travel, Health, Others) buckets with item counters and linked-transaction deletion safeguards.
4. **Savings Goals and Milestones** (`GoalsPage.tsx` preview): Showcases horizon tabs (Monthly, Quarterly, Yearly, Total) alongside visual milestone cards with custom Lucide icons (Plane, Home, Laptop, PiggyBank), completion percentages, and velocity estimates (~X months to go at current pace).
5. **AI Financial and Goals Advisors** (`DashboardPage.tsx` & `GoalsPage.tsx` preview): Highlights the two specialized ReactMarkdown advisor panels: spending distribution analysis on the Dashboard and milestone pacing feedback on the Goals screen.
6. **Sign In and Account Privacy** (`AuthPage.tsx` & `ProfilePage.tsx` preview): Shows one-click Google and Microsoft SSO alongside email/password authentication and recovery, paired with the Profile Danger Zone two-step DELETE confirmation that lets users permanently purge all personal records.

### Copy Rules
- Write from the visitor's perspective in plain sentence case and active voice.
- Every button names the concrete result (Create account, Sign in, Add income, Add expense, Export Excel).
- Never use em dashes or spaced hyphens anywhere in the copy.
- Never emphasize a single word in a headline with italics, color, or underlines.
- Avoid numbered section labels unless the content represents an actual chronological sequence.

---

## 6. In-App Design Review (P1 to P3)

| Area & File | Finding | Suggestion | Priority |
| :--- | :--- | :--- | :--- |
| **Transactions & Goals loading states** (`TransactionsPage.tsx`, `GoalsPage.tsx`) | Asynchronous fetches render plain grey text (`Loading transactions...`, `Loading savings...`, and `Loading milestones...`), collapsing container height and shifting layout once data resolves. | Replace plain text strings with structured skeleton rows (in `TransactionsPage.tsx`) and skeleton metric/milestone cards (in `GoalsPage.tsx`) matching the exact height of loaded elements. | **P1** |
| **Dashboard expense breakdown donut** (`DashboardPage.tsx`) | All four donut slices (Travel, Health, Food, Entertainment) use closely related shades of green and grey-green, making adjacent segments hard to distinguish. | Keep `#1B5E3F` for the top category and assign a distinct, accessible categorical palette (`#1B5E3F` emerald, `#334155` slate, `#0F766E` teal, `#B45309` ochre, `#475569` stone) with a 2px `#FFFFFF` slice stroke while retaining two-way hover sync. | **P1** |
| **Dashboard savings KPI card** (`DashboardPage.tsx`) | The switchable Savings card displays `+$0.00` in positive green for This Quarter alongside `+$50,000.00` income and `-$18,500.00` expense, leaving users unsure why savings is zero. | Render zero values in neutral ink (`$0.00` without a leading `+`) and display a clear subtitle explaining the active period calculation or period-over-period delta so a zero state is self-explanatory. | **P1** |
| **Dashboard AI Financial Advisor header** (`DashboardPage.tsx`) | AI Financial Advisor uses an unlabeled icon-only refresh button, whereas AI Goals Advisor in `GoalsPage.tsx` uses a labeled Refresh button with icon. | Update the `DashboardPage.tsx` advisor refresh button to match `GoalsPage.tsx` with a visible Refresh text label and icon. | **P1** |
| **Global top bar** (`TopBar.tsx`, `MainLayout.tsx`) | `TopBar.tsx` renders a full-width top strip that repeats the exact page title right above each page's header (Dashboard above Financial Overview, Goals above Goals, etc.). | Remove the redundant `TopBar.tsx` title bar on desktop views (or limit it strictly to a mobile drawer trigger on small viewports) so each page opens cleanly with its primary heading. | **P1** |
| **Profile page spacing & layout** (`ProfilePage.tsx`) | On `/profile`, Account Settings sits much closer to the top edge than headings on other pages, and the single narrow column leaves uneven whitespace on wide screens. | Standardize the outer page wrapper padding (`p-6 lg:p-8`) and header margin in `ProfilePage.tsx` to match `DashboardPage.tsx` and `TransactionsPage.tsx`. | **P1** |
| **Password input placeholders** (`AuthPage.tsx`, `ProfilePage.tsx`) | Both `AuthPage.tsx` and `ProfilePage.tsx` use `••••••••` as the placeholder attribute on password fields, making empty inputs look pre-populated. | Remove bullet dot placeholders; leave the password placeholder empty on `AuthPage.tsx` and use `Leave blank to keep current password` on `ProfilePage.tsx`. | **P1** |
| **Transaction table Type column** (`DashboardPage.tsx`, `TransactionsPage.tsx`) | Both the Dashboard recent feed and the Transaction Ledger include a Type column (`INCOME` / `EXPENSE` pills) that duplicates the `+` / `−` sign and green / red color of the Amount column. | Remove the Type column from both tables (keeping the Type filter dropdown in the `TransactionsPage.tsx` toolbar) to give Description and Category cleaner spacing. | **P1** |
| **Row & category action icons** (`TransactionsPage.tsx`, `CategoriesPage.tsx`) | Edit and delete icon buttons in `TransactionsPage.tsx` and delete icons in `CategoriesPage.tsx` have very faint resting stroke contrast (< 3:1). | Darken resting icon color to `#4B5E54`, provide `#0D1712` (edit) and `#B91C1C` (delete) hover states, and ensure 36px (`h-9 w-9`) accessible hit targets with `:focus-visible` rings. | **P1** |
| **Transaction ledger pagination** (`TransactionsPage.tsx`) | The ledger table ends immediately after the last visible row with no record count or page controls. | Add a table footer bar showing the active count (`Showing 1 to 6 of 6 transactions`) and client-side page size / pagination controls. | **P2** |
| **Input placeholder & disabled contrast** (`AuthPage.tsx`, `ProfilePage.tsx`, `CategoriesPage.tsx`, `TransactionsPage.tsx`, `DateRangeFilter.tsx`) | Input placeholders and the read-only email field on `ProfilePage.tsx` have low contrast. | Darken global `::placeholder` tokens in `index.css` to `#52635A` and style read-only inputs with `#334139` text on `#F3F6F4` background. | **P2** |
| **Currency display formatting** (`src/lib/utils.ts`, pages) | Currency formatting hardcodes `$` across all views alongside dd/mm/yyyy dates. | Centralize currency formatting in `src/lib/utils.ts` with a configurable currency symbol stored in user preferences. | **P3** |

---

## 7. Technical Requirements
- **Stack Alignment**: React 19, TypeScript, Vite, Tailwind CSS v4 (`src/index.css`), Lucide React, Framer Motion, Recharts, and React Markdown.
- **Untouched Layers**: `src/api/client.ts`, `src/context/AuthContext.tsx`, and `src/pages/AuthCallbackPage.tsx` remain untouched.
- **Motion Discipline**: Respect `useReducedMotion()` from Framer Motion and `@media (prefers-reduced-motion: reduce)` in CSS. Restrict landing page animation to a single initial hero load sequence and direct visitor interactions.

---

## 8. Quality Requirements
- **Responsive Floor**: Zero horizontal scrolling from 360px mobile viewports up to 1440px+ widescreen displays, including responsive table wrapping or horizontal scroll containment on mobile.
- **Accessibility**: WCAG 2.1 AA contrast (4.5:1 text, 3:1 controls/charts), semantic landmarks, associated `<label>` elements, and visible keyboard focus outlines (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E3F]`).
- **CSS Specificity**: Avoid broad element selectors in `src/index.css` that conflict with Tailwind v4 utilities.

---

## 9. Success Measures
- 0.00 Cumulative Layout Shift in the landing page hero when adding sample transactions and across `TransactionsPage.tsx` and `GoalsPage.tsx` during data fetches.
- All 9 P1 design review items implemented cleanly with zero TypeScript compiler errors (`tsc -b`).

---

# Design Plan

## 1. Color Palette
- **Alabaster Canvas (`#F6F8F7`)**: Primary background surface for the landing page and authenticated layout canvas, harmonizing with the existing warm off-white surface token.
- **Ledger Paper (`#FFFFFF`)**: Crisp white card, modal, and table surface.
- **Obsidian Ink (`#0D1712`)**: Primary typography and net balance figures (17.8:1 contrast against `#FFFFFF`).
- **Slate Muted (`#4B5E54`)**: Secondary descriptions, table column headers, and resting action icons (6.7:1 contrast against `#FFFFFF`).
- **Hairline Mist (`#DCE4DF`)**: Structural 1px borders for cards, table dividers, and form controls.
- **ExpenseHub Emerald (`#1B5E3F` / `#1A5F3F`)**: The single brand color used for primary buttons, active sidebar items, positive inflows, and the primary donut segment.
- *(Supporting semantic colors: `#B91C1C` crimson for negative outflows and the DELETE account danger zone; categorical slice accents `#334155` slate, `#0F766E` teal, and `#B45309` ochre strictly inside the Recharts donut so slices are clearly distinguishable).*

## 2. Typography and Fallback Stacks
- **Primary UI & Display Sans**:
  - Stack: `'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Role: All headlines (`font-semibold`, tracking `-0.025em`), body copy, navigation links, category badges, and form inputs.
- **Numeric & Date Monospace**:
  - Stack: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  - Role: Strictly applied to monetary figures (`$31,500.00`, `+$25,000.00`, `-$18,500.00`), percentages (`54.1%`), and dd/mm/yyyy dates (`16/10/2026`) with `tabular-nums`.

## 3. Layout Concept
- **Desktop (max-w-7xl / 1280px, 12-column grid, gap-8 lg:gap-12)**:
  - Header: Brand logo + Sign in + Create account buttons.
  - Hero: 5 columns copy and CTAs left, 7 columns live interactive hero ledger and synchronized donut chart right.
  - Section 1: Financial Overview (7 cols KPI + period switcher left, 5 cols prose right).
  - Section 2: Transaction Ledger (5 cols prose left, 7 cols DateRangeFilter + table right).
  - Section 3: Custom Categories (7 cols Income/Expense buckets left, 5 cols prose right).
  - Section 4: Savings Goals & Milestones (5 cols prose left, 7 cols milestone pacing bars right).
  - Section 5: AI Advisors (7 cols dual Markdown advisor view left, 5 cols right).
  - Section 6: Sign In & Privacy (5 cols prose left, 7 cols SSO + DELETE guard right).
  - Footer: Clean brand info, direct links, and copyright.
- **Mobile (360px+, single column, px-4 py-12)**:
  - Header condenses to brand mark and Sign in + Create account buttons.
  - Hero stacks headline and full-width buttons above the interactive ledger card; date column hides under 480px so Description, Category, and Amount fit with zero horizontal scroll.
  - Feature sections stack prose above product view.

## 4. Critique Against Generic AI Tells and Revisions Applied
- **No cream background + serif + terracotta**: Kept the cool mineral alabaster canvas (`#F6F8F7`), crisp geometric sans-serif headings, and zero terracotta accents.
- **No dark-mode neon bands**: Maintained the light theme (`#F6F8F7` and `#FFFFFF`) and single forest green brand color (`#1B5E3F`) from header to footer.
- **No zero-radius newspaper grid lines**: Used generous vertical spacing (`py-20 lg:py-28`) between sections and preserved the app's existing rounded card geometry (`rounded-xl` containers, `rounded-lg` buttons).
- **No identical shadowed feature card grids**: Eliminated 3-column feature cards and background gradient blobs. Each of the six sections is a two-column split pairing plain prose with an authentic UI fragment.
- **No tracked all-caps eyebrows, middle-dot meta strings, trailing button arrows, or monospace badges**: Removed section eyebrows above h2 headings, omitted middle dots (`·`), stripped trailing arrows from buttons, and kept category pills in clean sans-serif sentence case.
- **No single-word headline emphasis or arbitrary numbering**: All headlines use uniform weight and color with no numbered prefixes.
