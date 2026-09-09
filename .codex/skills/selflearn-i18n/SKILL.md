---
name: selflearn-i18n
description: Manage and modify internationalization (i18n) in SELF-learning. Use for adding, moving, reusing, or refactoring translations, namespaces, translation keys, and Trans components.
---

# Internationalization

## Scope

Only modify i18n-related code and files. Do not refactor unrelated code or change behavior unless required to wire translations correctly.

## Namespaces

Use:

- `common.json` for shared terminology, labels, and reusable UI text.
- `pages-<page-name>.json` for page-specific translations.
- `feature-<lib-name>.json` for reusable library or feature translations.

Do not place page-specific text in `common.json` merely because it is short.

Avoid duplicate keys across namespaces unless they intentionally represent different meanings.

## Library namespace exports

Every library using translations must export all required namespaces from its `index.ts`:

```ts
export const I18N_NAMESPACE = ["common", "feature-teaching"];
```

If a dependency already exports `I18N_NAMESPACE`, reuse it instead of duplicating its namespace strings.

## Translation keys

Use stable, descriptive, semantic keys with underscores.

Prefer:

```ts
{
  "Save_Button": "Save",
  "Empty_State_Title": "No courses found"
}
```

Avoid keys derived from wording or implementation details.
Avoid camelCase for translation keys; use underscores instead.

## Formatted translations

Do not split one translated sentence into multiple translation strings only because parts require different formatting.

Use `<Trans>` instead.

Prefer `<Trans>` from `@self-learning/ui/common` over next-i18next because it provides predefined formatting tags.

## Existing translations

Before adding a key:

Search existing translation files for a suitable key.
Reuse shared terms from `common.json` where appropriate.
Follow the naming and nesting conventions of nearby translations.

When moving translations between namespaces, update all usages and I18N_NAMESPACE exports.
