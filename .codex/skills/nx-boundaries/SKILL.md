---
name: nx-boundaries
description: Enforce architectural boundaries in Nx monorepos between client-capable, neutral, and server-specific TypeScript code. Use when creating, reviewing, refactoring, or debugging Nx library code and imports, especially around JSX, database access, index.ts exports, server.ts exports, and client/server dependency separation.
---

# Nx code boundaries

Classify each file by what it contains and may import.

- **Client-capable code:** code that may be imported by browser/client code. It must not contain database access. It must not import runtime values from files that contain database access; import type is allowed.
- **Server-specific code:** backend-only code such as database operations. It must not contain JSX.
- **Neutral code:** .ts code containing neither JSX nor database access. Both client and server code may import it.

Keep database access and JSX out of the same file.

For each Nx library:

- Export client-capable and neutral public APIs from index.ts.
- Export server-specific public APIs, including database operations, from server.ts.
- Do not expose server-specific runtime code through index.ts.

When reviewing or modifying code, trace runtime imports transitively enough to ensure client code cannot reach database-access code through re-exports. Treat type-only imports as exempt because they do not create a runtime dependency.

Prefer splitting mixed files into neutral, client, and server-specific modules instead of weakening these boundaries.
