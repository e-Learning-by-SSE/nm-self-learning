# AGENTS.md

## Scope

This project currently uses Codex only for i18n-related work.

Do not refactor unrelated code, change behavior, or modify non-i18n files unless required to wire translations correctly.

## i18n rules

### Translation file placement

Use the following namespace/file conventions:

- General definitions, shared terminology, common labels, recurring UI text, and translations reused across multiple pages must be placed in:

    `common.json`

- Translations that belong to one specific page must be placed in:

    `pages-<unique-page-name>.json`

    Examples:
    - `pages-dashboard.json`
    - `pages-course-detail.json`
    - `pages-user-settings.json`

- Translations that belong to a library or feature library must be placed in:

    `feature-<lib-name>.json`

    Examples:
    - `feature-teaching.json`
    - `feature-auth.json`
    - `feature-course-management.json`

### Namespace exports for libraries

Every library that uses translations must export an `I18N_NAMESPACE` constant from its `index.ts`.

The export must list all translation namespaces used by that library.

Example:

```ts
export const I18N_NAMESPACE = ["common", "feature-teaching"];
```

If a library depends on another library that already exports its own I18N_NAMESPACE, prefer reusing that exported namespace instead of manually duplicating all individual namespace strings.

### Choosing the correct namespace

Use common only for translations that are genuinely shared or likely to be reused.

Use pages-\* for page-specific wording that is not reused elsewhere.

Use feature-\* for reusable library or feature-specific translations.

Do not place page-specific text in common.json just because it is short.

Do not create duplicate translation keys across namespaces unless the text has intentionally different meanings in different contexts.

### Key naming

Use stable, descriptive translation keys.

Prefer semantic keys over keys based on the current English/German text.

Use underscore to separate words.

Preferred example:

```
{
  "Save_Button": "Save",
  "Empty_State_Title": "No courses found"
}
```

Avoid:

```
{
  "save": "Save",
  "noCoursesFoundTextOnDashboard": "No courses found"
}
```

### When modifying existing translations

Before adding a new key, search existing translation files for a suitable existing key.

Reuse existing shared terms from common.json where appropriate.

Keep naming and nesting consistent with nearby translation files.

When moving a translation between namespaces, update all usages and namespace exports accordingly.
