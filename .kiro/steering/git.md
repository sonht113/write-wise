# Git Conventions

## Branch Naming

```
[type]/nuicoder/[branch-overview]
```

- **type**: `feat`, `fix`, `chore`, `refactor`, `docs`
- **branch-overview**: kebab-case, ngắn gọn mô tả nội dung branch

Examples:

```
feat/nuicoder/add-timer-component
fix/nuicoder/api-key-validation
chore/nuicoder/update-dependencies
refactor/nuicoder/extract-chart-hooks
docs/nuicoder/update-readme
```

## Commit Message

```
[type]([overview-hint]): [commit-message]
```

- **type**: `feat`, `fix`, `chore`, `refactor`, `docs`
- **overview-hint**: scope ngắn gọn cho biết phần nào bị ảnh hưởng (ví dụ: `timer`, `api`, `chart`, `results`)
- **commit-message**: mô tả thay đổi, tối đa **100 ký tự** tổng cộng cho toàn bộ dòng commit

Examples:

```
feat(results): show feedback section with empty/loading/loaded states
fix(api): handle invalid personal key gracefully
chore(deps): bump recharts to 3.9.0
refactor(chart): extract getDynamicDescription to utils
docs(readme): add environment setup instructions
```

## Rules

- Mỗi commit chỉ chứa một thay đổi logic duy nhất. Không gộp nhiều feature/fix vào một commit.
- Không commit file `.env`, `dist/`, hay `node_modules/`.
- Ưu tiên `git add <file>` cụ thể thay vì `git add .`.
- Không force push lên branch đã share trừ khi được yêu cầu rõ ràng.
