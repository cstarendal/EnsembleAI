# Contributing to Ensemble AI

Thank you for your interest in contributing to Ensemble AI! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Git
- OpenRouter API key (for development)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/EnsembleAI.git
   cd EnsembleAI
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:

   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Add your OPENROUTER_API_KEY

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

## Development Workflow

**This project uses PR-based development for everyone, including the maintainer.** This creates a clear history, enables self-review, and helps learn best practices.

### Branch Strategy

- **main**: Always deployable, protected branch
- **Feature branches**: `feature/description` (e.g., `feature/add-source-critic`)
- **Bug fixes**: `fix/description` (e.g., `fix/debate-timeout`)
- **Documentation**: `docs/description`
- **Refactoring**: `refactor/description`
- **Tests**: `test/description`

### Workflow Steps

1. **Pull latest changes:**

   ```bash
   git pull origin main
   ```

2. **Create a branch** from `main`:

   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make changes** following our code standards

4. **Write tests first (TDD)** - Create tests before implementation

5. **Run checks locally** before committing:

   ```bash
   npm run format:check
   npm run lint
   npm run typecheck
   npm test -- --run
   ```

6. **Commit changes** (pre-commit hooks will run automatically):

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

7. **Push branch:**

   ```bash
   git push origin feature/my-feature
   ```

8. **Create Pull Request** on GitHub:
   - Use the PR template
   - Write clear description
   - Reference related issues if any
   - Wait for CI to pass

9. **Self-review** your PR before merging:
   - Review the diff
   - Check CI results
   - Verify all checklist items

10. **Merge when ready** - Use "Squash and merge" to keep history clean

## Code Standards

### Ubiquitous Language (STRICTLY ENFORCED)

**Core Principle:** One term, one meaning, everywhere.

- **Always use registered domain terms** from `ubiquitousLanguage.ts`
- **Never use generic terms** (query, model, chat, discussion, etc.)
- **Use types** to enforce correct terms (`AgentRole`, `SessionStatus`)
- **Validate before commit:** `npm run lint:ubiquitous-language`

**Key Terms:**

- Use `Research` (not "query", "analysis")
- Use `Agent` (not "model", "AI")
- Use `Debate` (not "chat", "discussion")
- Use `Session` (not "job", "task")
- Use `Source` (not "reference", "link")
- Use `Synthesis` (not "summary")

See `docs/UBIQUITOUS_LANGUAGE.md` for complete guide.

### Strict Limits (Enforced)

- **Max 100 lines per function** - NO EXCEPTIONS
- **Max complexity: 12**
- **Max depth: 4**
- **Max params: 4**
- **Max statements: 20**

If your function exceeds these limits, extract utilities or create helper functions.

### Architecture Pattern

Follow **MVC with React Hooks**:

- **Model**: Custom hooks managing state (`useResearchData.ts`)
- **View**: Pure React components (presentation only)
- **Controller**: Custom hooks with business logic (`useDebateController.ts`)
- **Pages**: Orchestrate Model ↔ Controller ↔ View

### Design Tokens

**NEVER hardcode values** - always use design tokens:

```tsx
// ✅ Good
<div className="p-lg bg-card shadow-card">

// ❌ Bad
<div className="p-4 bg-white shadow-md">
```

### TypeScript

- Explicit return types for exported functions
- Use Zod for runtime validation
- Avoid `any` - use `unknown` and type guards
- Run `npm run typecheck` before committing

### Code Style

- Prettier formats automatically on save
- ESLint catches issues
- Follow existing code patterns

## Testing

### Test-Driven Development (TDD)

1. **Write test first**
2. **Run test** (should fail)
3. **Implement** minimum code
4. **Verify** test passes
5. **Refactor** while keeping tests green

### Test Types

- **Unit tests**: `src/**/__tests__/*.test.ts`
- **Component tests**: `src/components/__tests__/*.test.tsx`
- **E2E tests**: `e2e/*.spec.ts`

### Running Tests

```bash
# All tests
npm test

# Frontend only
npm run test:frontend

# Backend only
npm run test:backend

# E2E tests
npm run test:e2e

# Coverage
npm run test:frontend -- --coverage
```

### Coverage Requirements

- Critical files: 70-90% coverage
- `validation.ts`: 90%+
- `apiService.ts`: 85%+
- `debateOrchestrator.ts`: 70%+

## Pull Request Process

### Before Creating PR

- [ ] All tests pass locally
- [ ] Type check passes
- [ ] Linting passes
- [ ] Formatting is correct
- [ ] No hardcoded values (design tokens used)
- [ ] Tests written for new features
- [ ] Documentation updated if needed

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Component tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Tested manually

## Checklist

- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process

1. **Automated checks** must pass (CI) - All jobs must be green
2. **Self-review** - Review your own PR before merging
   - Check the diff carefully
   - Verify all changes are intentional
   - Ensure code follows standards
3. **For external contributors:** Maintainer will review and provide feedback
4. **Address feedback** if requested
5. **Merge when ready** - Use "Squash and merge" to keep history clean

### PR Size Guidelines

- **Small PRs preferred** (< 300 lines changed)
- **Focused changes** (one feature/fix per PR)
- **Large changes** should be split into multiple PRs

## Project Structure

```
EnsembleAI/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # React components (Views)
│   │   ├── hooks/        # Custom hooks (Controllers/Model)
│   │   ├── pages/        # Route pages (Orchestrators)
│   │   ├── services/     # Business logic services
│   │   └── ...
│   └── ...
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── agents/       # AI agent implementations
│   │   ├── orchestrator/ # Debate orchestration
│   │   ├── routes/       # Express routes
│   │   └── ...
│   └── ...
├── docs/              # Documentation
└── e2e/               # E2E tests
```

## Common Mistakes to Avoid

1. **Code quality violations** - Enforce limits from day one
2. **Security issues** - Always validate and sanitize input
3. **Hardcoded values** - Use design tokens
4. **Missing tests** - Write tests first (TDD)
5. **TypeScript errors** - Run typecheck locally
6. **Large PRs** - Keep changes small and focused
7. **Unused code** - Remove immediately, don't accumulate

## Getting Help

- **Questions?** Open a discussion
- **Found a bug?** Open an issue
- **Want to contribute?** Check open issues or suggest features

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Ensemble AI! 🎉
