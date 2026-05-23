# Git Conventions

## Branch Naming

```
[type]/nuicoder/[short-description]
```

- **type**: `feat` | `fix` | `docs` | `chore` | `refactor`
- **short-description**: brief overview of the commit, kebab-case

Examples:
- `feat/nuicoder/grammar-checker`
- `fix/nuicoder/api-timeout`
- `docs/nuicoder/readme-setup`

## Commit Message

```
[type]([scope]): [message]
```

- **type**: `feat` | `fix` | `docs` | `chore` | `refactor`
- **scope**: max 20 characters, short description of what changed
- **message**: max 100 characters, imperative mood, lowercase

Examples:
- `feat(grammar): add real-time rule-based grammar checker with fix suggestions`
- `fix(api): handle timeout errors in analysis requests`
- `docs(readme): update installation instructions`
