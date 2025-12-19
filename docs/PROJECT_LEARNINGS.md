# Project Learnings: Closing The Books

A comprehensive synthesis of architecture, design, code, testing, and operational patterns for future projects.

---

## Table of Contents

1. Architecture & Design Patterns
2. Code Quality & Standards
3. Design System & UI
4. Testing Strategy
5. Security & Privacy
6. Performance & Bundle Management
7. Development Workflow
8. CI/CD & Deployment
9. Internationalization
10. Error Handling & Resilience
11. State Management & Persistence
12. Key Decisions & Trade-offs

---

## Architecture & Design Patterns

### MVC Pattern with React Hooks

**Pattern:** Clear separation of concerns using React hooks to implement MVC architecture.

**Structure:**

- **Model:** Custom hooks managing state & persistence (e.g., `useWorkshopData.ts`)
- **View:** Pure React components (presentation only, minimal logic)
- **Controller:** Custom hooks containing business logic & form handling (e.g., `useTimelineForm.ts`, `useGratitudeController.ts`)
- **Pages:** Orchestrate Model ↔ Controller ↔ View

**Key Learnings:**

- Components should receive callbacks, not direct state mutations
- Extract complex logic from components into controller hooks
- Keep components focused on rendering and user interaction
- Use services for cross-cutting concerns (storage, sharing, analytics)

**Example Pattern:**

```
// Page (Orchestrator)
WorkshopStepPage.tsx
  ↓ uses Model
  useWorkshopData() → state + persistence
  ↓ uses Controller
  useWorkshopStep() → navigation logic
  ↓ renders View
  WorkshopView → TimelineStep → MemoryCard
```

**Anti-patterns to Avoid:**

- Business logic in components
- Direct state mutations from components
- Tight coupling between pages and hooks (use service layer for complex workflows)

### File Structure & Organization

**Naming Conventions:**

- **Components:** PascalCase.tsx (e.g., `ChapterCover.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useTimelineForm.ts`)
- **Utils:** camelCase.ts (e.g., `validation.ts`)
- **Constants:** SCREAMING_SNAKE_CASE inside camelCase.ts files

**Directory Structure:**

```
src/
  components/         # React components (Views)
    __tests__/        # Component tests
    ui/               # shadcn/ui primitives
  hooks/              # Custom hooks (Controllers/Model)
    __tests__/        # Hook tests
  pages/              # Route pages (Orchestrators)
  services/           # Business logic services
  utils/              # Utility functions
  types/              # TypeScript type definitions
  constants/         # Constants and feature flags
  i18n/               # Internationalization
  styles/             # CSS and design tokens
  test/               # Test utilities and setup
```

---

## Code Quality & Standards

### Strict Limits (Enforced via ESLint)

**Function Limits:**

- Max 100 lines per function (strictly enforced in `src/`)
- Max complexity: 12
- Max depth: 4
- Max params: 4
- Max statements: 20

**File Size Budget:**

- Warn when source file grows beyond ~400 lines
- Refactor/split when approaching ~450+ lines
- Exemptions: tests, `src/components/ui/**` (shadcn primitives)

**Rationale:**

- Forces decomposition and single responsibility
- Improves readability and maintainability
- Makes code review easier
- Reduces cognitive load

### TypeScript Best Practices

**Explicit Return Types:**

- Required for exported functions (module boundaries)
- Optional for internal functions
- Use type imports: `import type { ... }`

**Type Safety:**

- Use Zod schemas for runtime validation
- Leverage TypeScript's type system for compile-time safety
- Avoid `any` - use `unknown` and type guards instead

### Code Style Rules

**ESLint Configuration:**

- Complexity rules enforced as errors in `src/`
- Relaxed rules for tests, E2E, and scripts
- Import ordering and deduplication
- Accessibility rules (jsx-a11y)

**Prettier:**

- Automatic formatting on save
- Consistent code style across team
- Integrated with lint-staged for pre-commit

---

## Design System & UI

### Design Tokens (CSS Variables)

**Core Principle:** Never hardcode values - always use tokens.

**Token Categories:**

- Colors: Semantic palette (background, foreground, primary, secondary, etc.)
- Spacing: Scale from `--space-xs` (0.25rem) to `--space-4xl` (6rem)
- Typography: Font families, sizes, line heights
- Layout: Max widths, heights, z-index scale
- Shadows: Soft, card, elevated, inner
- Transitions: Fast, smooth, bounce

**Usage:**

```
// Tailwind classes (preferred)
<div className="p-lg bg-card rounded-[var(--radius)] shadow-card">

// CSS variables (when needed)
.my-component {
  padding: var(--space-lg);
  background: hsl(var(--card));
}
```

**Dark Mode:**

- All tokens have dark mode variants
- Automatic via `.dark` class
- Consistent theming across app

**Validation:**

- Script to check for hardcoded values: `npm run lint:design-tokens`
- Catches violations in CI/CD

### Component Library (shadcn/ui)

**Pattern:** Use shadcn/ui primitives for consistent UI components.

**Benefits:**

- Accessible by default
- Customizable (copy-paste, not npm dependency)
- Consistent design language
- TypeScript support

**Location:** `src/components/ui/`

### Responsive Design

**Approach:**

- Mobile-first design
- Use Tailwind responsive utilities
- Test on multiple devices (Playwright projects)
- Consider reduced motion preferences

---

## Testing Strategy

### Test-Driven Development (TDD)

**Workflow:**

1. Write test first
2. Run test (fail)
3. Implement minimal code
4. Verify test passes
5. Refactor

### Test Types & Organization

**Unit Tests (Vitest):** `src/**/__tests__/*.test.ts`
**Component Tests (React Testing Library):** `src/components/__tests__/*.test.tsx`
**E2E Tests (Playwright):** `e2e/*.spec.ts` (Chromium baseline in CI; full suite manual)

**Deterministic E2E:**

- Set language explicitly (`?lang=sv`)
- Clear state in `beforeEach`
- Semantic selectors (`getByRole`, `getByLabelText`)
- Explicit waits for stability

### Coverage Requirements

- Critical files: 70-90% (e.g., validation 90%+, storage 85%+)
- Coverage reports in `coverage/`
- CI fails if thresholds not met

### Test Utilities

- Custom render with providers
- Mock data factories
- Performance and visual regression optional flags

---

## Security & Privacy

### Privacy-First Architecture

- No backend where possible; local-first storage (IndexedDB)
- No accounts, no cookies by default

### Content Security Policy (CSP)

- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' https://gc.zgo.at`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: blob:`
- `font-src 'self'`
- `connect-src 'self' https://closing-the-books.goatcounter.com`

### XSS Prevention

- DOMPurify for all user input
- Zod validation with length limits
- Regex fallback checks
- Validate/sanitize on both save and load

### Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Input Validation Pattern

- Validate with Zod
- Sanitize with DOMPurify
- Store sanitized data

---

## Performance & Bundle Management

### Bundle Size Budget

- Max 200kB JS (gzipped)
- Max 30kB CSS (gzipped)
- Monitor with `bundlesize` and analyzer

### Code Splitting

- Route-based splitting
- Manual vendor chunks (react, router, motion, radix, utils)

### Optimizations

- Debounced saves to IndexedDB
- Memoization (`useMemo`, `useCallback`)
- Lazy loading heavy components

### Dependency Management

- Prefer lightweight deps
- Tree-shake
- Regular `npm audit`
- Check bundle impact before adding

---

## Development Workflow

### Pre-commit Hooks (Husky)

- Format (Prettier)
- Lint (ESLint)
- Related unit tests (Vitest)
- Type checking (TypeScript)
- Pre-push: Knip for unused exports

### Daily Workflow

- Pull latest
- Run dev server
- Run format/lint/typecheck/tests before commit
- Small, frequent commits (trunk-based)

### Quality Checks

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test -- --run`
- `npm run knip:ci`

### Trunk-Based Development

- main always deployable
- Push often; use feature flags for unfinished work

---

## CI/CD & Deployment

### GitHub Actions Workflows

- Deploy on push to main; preview on PR
- Steps: install → format → lint → typecheck → unit tests → i18n validate → knip → build → bundle check → deploy
- Light E2E (Chromium) in CI; full E2E via manual workflow

### Deployment Strategy

- Environments: production/staging/preview
- Base path varies by env; configure Vite base and PWA start_url
- PWA via Workbox; exclude heavy assets from SW cache

### Build Configuration

- Dynamic base path
- Manual chunks
- Bundle analyzer (analyze mode)
- PWA plugin

---

## Internationalization

- i18next with detection: querystring → localStorage → navigator
- Namespaces; lazy-loaded translations
- Keys stored per locale (sv/en) under `src/i18n/locales/`
- Validation script (`npm run i18n:validate`)
- E2E always sets `?lang=sv`

---

## Error Handling & Resilience

### Error Boundaries

- App-level and step-level boundaries

### Error Tracking

- Store errors locally (IndexedDB), dedupe, include context and stack

### Validation & Sanitization

- Zod + DOMPurify + length limits + type guards

---

## State Management & Persistence

- IndexedDB via idb-keyval
- Service layer for load/save/delete
- Debounced saves
- Sharing via compressed URL hash with Zod validation and sanitization

---

## Key Decisions & Trade-offs

### Architecture

- MVC with hooks: clear separation, testable
- Local-first storage: privacy-first, offline support

### Technology

- Framer Motion (keep, monitor size)
- shadcn/ui (accessible primitives)
- Vitest + Playwright (fast unit, strong E2E)

### Design

- Design tokens mandatory; validation script
- Strict limits enforced; readability first

### Testing

- TDD workflow prioritized
- E2E deterministic; avoid flakiness

---

## Actionable Takeaways for Next Project

### Must-Haves

- Strict code quality rules
- Design token system
- Comprehensive testing (TDD, coverage targets)
- Security-first (Zod + DOMPurify + CSP)
- Bundle size monitoring

### Should-Haves

- MVC architecture with hooks
- Pre-commit hooks
- CI/CD pipeline with automated checks
- Error handling and i18n validation

### Nice-to-Haves

- Feature flags
- Performance monitoring
- Strong developer experience and documentation

---

## Common Mistakes to Avoid

1. Code quality violations — enforce limits early
2. Security issues — never use innerHTML; always sanitize
3. E2E flakiness — deterministic setup, explicit waits
4. Unused code — use Knip; remove immediately
5. TypeScript errors in CI — run typecheck locally
6. Circular dependencies — plan dependency graph; use services
7. Test discovery issues — align patterns and config
8. Merge conflicts — integrate frequently
9. CI/CD config gaps — test CI locally; document deps
10. Bundle size bloat — check analyzer before adding deps
11. PWA routing issues — test production builds
12. Hardcoded values — enforce design tokens
13. Race conditions — debounce/throttle; test async flows
14. Missing error handling — graceful degradation
15. Property name mismatches — use TypeScript and constants

---

## Summary: Top 5 Mistakes to Prevent

1. Code quality violations
2. Security issues (XSS, lack of validation)
3. E2E flakiness
4. Unused code accumulation
5. TypeScript errors surfacing in CI

---

## Lessons Learned

**What worked well:** strict limits, design tokens, TDD, MVC with hooks, comprehensive testing, privacy-first.

**What could improve:** E2E performance, bundle size monitoring, more service extraction, fresher docs.

**Key insights:** discipline pays off; test first; privacy-first simplifies; design tokens matter; automation catches issues early.

---

## Conclusion

This playbook captures patterns that produced a well-architected React application: clear MVC with hooks, strict quality and design standards, security-first posture, performance awareness, and strong automation. Apply these from day one to replicate success in future projects.

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Project:** Closing The Books
