# Copilot Instructions for i18n-config-loader

## Project Overview

- This project is a Node.js configuration loader that leverages the i18next ecosystem for configuration management, not for translation.
- Configuration is organized using i18next-compatible directory structures (see `src/__test__/fixture/i18n*` for examples).
- The loader provides merging, fallback, and variable interpolation using i18next's mature features.
- **Do not** store secrets or sensitive data in configuration files—use `.env` for that purpose.

## Key Architectural Patterns

- **Configuration as i18n resources:** All configuration is stored as JSON files in a structure mirroring i18next's language/resource format. Example: `src/__test__/fixture/i18n/lng-A/resource.json`.
- **Environment inheritance:** Environments (e.g., `SIT`, `DEFAULT`) are represented as folders. The loader merges configs using i18next's fallback chain.
- **TypeScript-friendly:** Use the `$t<Type>(key)` helper for type assertions on config values.
- **No hot-reload:** Config is loaded once at startup and never changes during runtime.
- **Node.js only:** Not intended for browser use.

## Developer Workflows

- **Build:** `pnpm build` (uses `tsup` for bundling)
- **Test:** `pnpm test` (uses `vitest`)
- **Publish:** `pnpm publish` (runs build first)
- **Install:** `pnpm install` (uses `pnpm@10.20.0`)

## Project Conventions

- **Folder naming:** Avoid using `BASE` or `*-base` as environment folder names due to i18n Ally and i18next quirks. Use `DEFAULT` or other names instead.
- **Centralized test data:** Test data, selectors, and endpoints should be externalized in config files for reuse and maintainability.
- **No feature requests:** The tool is considered feature-complete; follow existing patterns.

## Integration Points

- **i18next:** All config loading, merging, and interpolation is powered by i18next (see `dependencies` in `package.json`).
- **i18n Ally (VS Code extension):** Recommended for autocompletion, navigation, and linting of config keys.

## Example Usage

```typescript
const loader = await I18nConfigLoader.getInstance('config', 'SIT', 'DEFAULT');
const apiUrl = $t<string>('resource.api.url');
```

## Key Files & Directories

- `src/i18n-config-loader.ts`: Main loader implementation.
- `src/__test__/fixture/i18n*`: Example config directory structures.
- `README.md`: Rationale, usage, and known pitfalls.

## Known Pitfalls

- Folder names like `BASE` or `*-base` may break i18n Ally and i18next. Use alternatives like `DEFAULT`.
- No runtime config reload—restart required for changes.

---

For more details, see `README.md`.
