---
name: OpenAPI integer compatibility
description: Compatibility note for this workspace's Orval and Zod versions when defining numeric API fields.
---

OpenAPI `integer` fields currently generate `zod.int()` in the Zod client, but this workspace resolves Zod 3, which does not expose that API. Use `number` for API numeric fields when codegen must pass the library typecheck.

**Why:** Codegen succeeded but the generated library declarations failed until integer schemas were changed to compatible numeric schemas.

**How to apply:** When adding numeric IDs or counts to `lib/api-spec/openapi.yaml`, prefer `number` unless the workspace's Orval/Zod versions have been upgraded together.