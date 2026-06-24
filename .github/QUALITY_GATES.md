# Quality Gates & CI/CD Standards

## Overview

This document defines the quality gates and continuous integration standards for the MarketPlaceGuitar-TS project.

## Pre-Commit Hooks

### Trigger: Before Committing Code

**Files:**
- `.husky/pre-commit`

**Checks:**
- ESLint validation on staged files
- Type safety checks via TypeScript
- Code formatting consistency (via lint-staged)

**Purpose:** Prevent invalid code from being committed locally

**Run Manually:**
```bash
npx lint-staged
```

## Pre-Push Hooks

### Trigger: Before Pushing to Remote

**Files:**
- `.husky/pre-push`

**Checks:**
- Full TypeScript build (`npm run build`)
- All unit tests pass (`npm run test:run`)

**Purpose:** Ensure only tested, buildable code is pushed to remote

**Run Manually:**
```bash
npm run build && npm run test:run
```

## GitHub Actions CI/CD

### Test Workflow (`.github/workflows/test.yml`)

**Trigger:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Node Versions:** 20.x

**Jobs:**
1. ESLint validation
2. Unit tests with coverage
3. Coverage report upload to Codecov

**Coverage Requirements:**
- Minimum 80% code coverage (recommended)
- Failed tests block merge

**Run Manually:**
```bash
npm run test:run -- --coverage
```

### Build Workflow (`.github/workflows/build.yml`)

**Trigger:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Node Versions:** 20.x

**Jobs:**
1. TypeScript type checking
2. Vite production build
3. Bundle size verification

**Success Criteria:**
- TypeScript compilation succeeds with no errors
- Vite build completes without errors
- Bundle size < 500KB (gzip)

**Run Manually:**
```bash
npm run build
```

## Lint-Staged Configuration

**File:** `package.json` (lint-staged section)

**TypeScript/TSX Files (*.ts, *.tsx):**
- Run `eslint --fix` for auto-fixing
- Run `tsc --noEmit` for type checking

**JavaScript Files (*.js, *.jsx):**
- Run `eslint --fix` for auto-fixing

**Other Files (*.json, *.css, *.md):**
- Run `prettier --write` for formatting

## Branch Protection Rules (Recommended)

Configure in GitHub repository settings:

**Protected Branches:** `main`, `develop`

**Requirements:**
- ✅ Pull request reviews: 1 approval
- ✅ Dismiss stale PR approvals when new commits pushed
- ✅ Require branches to be up to date before merging
- ✅ Require status checks to pass:
  - `test` (all jobs must pass)
  - `build` (all jobs must pass)
- ✅ Require code review from code owners

## Local Development Workflow

### Before Committing:

```bash
# Stage your changes
git add src/components/MyComponent.tsx

# Pre-commit hook automatically runs lint-staged
git commit -m "feat: add MyComponent"

# If linting fails, fix and try again
git add .
git commit -m "feat: add MyComponent"
```

### Before Pushing:

```bash
# Pre-push hook automatically runs tests and build
git push origin feature/my-feature

# If tests fail, fix locally and push again
npm run test:run -- --watch
# or
git push --force-with-lease origin feature/my-feature (only if safe)
```

### During Development:

```bash
# Run dev server
npm run dev

# Watch tests in background
npm run test -- --watch

# Manual linting
npm run lint

# Manual type checking
npx tsc -b --noEmit

# Manual build
npm run build
```

## Troubleshooting

### Husky Hooks Not Running

**Problem:** Pre-commit/pre-push hooks not triggered

**Solution:**
```bash
# Reinstall Husky
npx husky install

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# Verify installation
ls -la .husky/
```

### ESLint Issues in CI

**Problem:** CI fails with ESLint errors but local code passes

**Solution:**
```bash
# Clear and reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# Run linting with --fix
npm run lint -- --fix

# Commit fixes
git add .
git commit -m "fix: eslint issues"
```

### TypeScript Build Errors in CI

**Problem:** Build fails in GitHub Actions but works locally

**Solution:**
```bash
# Clean build
rm -rf dist tsconfig.tsbuildinfo

# Rebuild
npm run build

# Check for missing types
npm install --save-dev @types/[package-name]
```

### Test Coverage Too Low

**Problem:** Coverage report shows < 80% coverage

**Solution:**
```bash
# View coverage report
npm run test:run -- --coverage

# Add tests for uncovered code
npm run test -- --watch

# Rerun with coverage
npm run test:run -- --coverage
```

## Quality Metrics Dashboard

Monitor these metrics in your project:

- **Build Time:** Target < 2 seconds
- **Test Time:** Target < 30 seconds
- **Bundle Size:** Target < 500KB (gzip)
- **ESLint Warnings:** 0
- **ESLint Errors:** 0
- **Code Coverage:** > 80%
- **TypeScript Errors:** 0

## Continuous Improvement

### Weekly Review:

1. Check GitHub Actions history for failing builds
2. Analyze test coverage trends
3. Review bundle size metrics
4. Update lint rules if needed

### Monthly Review:

1. Update dependencies (`npm outdated`)
2. Review and update Node.js version targets
3. Analyze performance metrics
4. Update GitHub Actions versions

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Documentation](https://eslint.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
