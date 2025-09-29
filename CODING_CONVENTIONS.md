## Coding Conventions

These conventions help keep the codebase consistent, easy to review, and simple to maintain. They apply to all code in this repository. Automated checks (ESLint + Prettier) enforce most rules.

### 1) Commit Messages — Conventional Commits

Follow Conventional Commits:

- Format: `<type>(<optional scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `perf`, `style`, `test`, `docs`, `build`, `ops`, `chore`
- Breaking changes: add `!` after type/scope and include a footer starting with `BREAKING CHANGE:`

Examples:

```
feat(auth): add token refresh flow
fix(api): handle 401 errors on profile endpoint
refactor: simplify sidebar collapse state
feat(settings)!: remove legacy theme switcher

BREAKING CHANGE: removed themeSwitch prop from <Header/>
```

References: [Conventional Commits cheatsheet](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13)

### 2) Branching & PRs

- Create feature branches from `main`: `feature/<short-topic>`, `fix/<short-topic>`
- Keep PRs small and focused; do not mix refactors with features/bugfixes
- Title PRs with the same Conventional Commit subject you plan to squash-merge

### 3) JavaScript/TypeScript Style

Prettier controls formatting; ESLint controls code-quality. Key style points:

- Use TypeScript everywhere in the frontend (`.ts`/`.tsx`)
- Use `const` and `let`; avoid `var`
- Prefer explicit types on exported functions and public APIs
- Use descriptive names over abbreviations; avoid 1–2 letter names
- Early returns over deep nesting; handle error/edge cases first
- Avoid unnecessary `try/catch`; never swallow errors silently

General JS conventions reference: [W3Schools JavaScript Conventions](https://www.w3schools.com/js/js_conventions.asp)

### 4) React Conventions

- Component files: `PascalCase.tsx` (e.g., `MainLayout.tsx`)
- Hooks: `useX.ts` and must follow the Rules of Hooks
- Props/state should be strongly typed; export prop types if reused
- Keep components focused; extract UI-only bits into smaller components
- Side effects in `useEffect`; memoize expensive values (`useMemo`, `useCallback`) when needed

### 5) Imports & Project Structure

- Use path aliases defined in `tsconfig.json` (e.g., `@/components/...`)
- Group imports: external libs, internal modules, then relative paths
- Avoid deep relative paths when an alias exists

### 6) Naming

- Files/dirs: `kebab-case` for folders, `PascalCase.tsx` for React components, `camelCase.ts` for utilities
- Variables/functions: `camelCase`; classes/components: `PascalCase`
- Booleans should read like predicates (e.g., `isLoading`, `hasError`)

### 7) Formatting (Prettier)

- Use single quotes in TS/TSX
- Trailing commas where valid in ES5
- Arrow function parentheses always
- Keep lines readable (configured via Prettier)

### 8) Linting

- Run `npm run lint` and `npm run format` locally before pushing
- Zero ESLint warnings in CI for changed code; fix or justify explicitly

### 9) Documentation

- Add concise docstrings for complex logic (explain “why”, not “how”)
- Keep README sections up to date when behavior changes

### 10) Example Commit Template

```
feat(dashboard): add monthly revenue chart

Add a new area chart to the dashboard with dynamic color tokens.
Uses memoized selectors to reduce re-renders and adds tests for data
transforms.

Closes #123
```

Additional reading:

- Conventional Commits cheatsheet: https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13
- Simple style reference: https://www.w3schools.com/js/js_conventions.asp
- Example coding standards gist: https://gist.github.com/anichitiandreea/e1d466022d772ea22db56399a7af576b


