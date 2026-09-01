---
name: OpenAPI integer compatibility
description: Compatibility note for this workspace's Orval and Zod versions when defining numeric API fields.
---

OpenAPI `integer` fields currently generate `zod.int()` in the Zod client, and URI formats generate `zod.url()`, but this workspace resolves Zod 3, which does not expose those APIs. Use `number` and plain `string` schemas for generated fields when codegen must pass the library typecheck.

**Why:** Codegen succeeded but the generated library declarations failed until integer and URI schemas were changed to compatible primitive schemas.

**How to apply:** When adding numeric IDs/counts or URI-formatted strings to `lib/api-spec/openapi.yaml`, prefer `number` or plain `string` unless the workspace's Orval/Zod versions have been upgraded together.