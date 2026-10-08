# Server Agent Guide

## Module Context

This Bun server owns provider API calls, server-side key resolution, and the final normalization of generated code before it reaches the React preview. The route module composes the pure generator and fallback helpers.

## Constraints and Patterns

- Use Bun's built-in `fetch`, `Response`, and `Bun.serve`; this module has no provider SDK dependency.
- Keep generated output as plain JavaScript compatible with `react-live`. The prompt constraints are defined at [index.ts](./index.ts#L7-L20).
- Normalize model output with `stripCodeFences` then `ensureRenderCall`, in that order, before returning `{ code }` as done at [index.ts](./index.ts#L183-L190).
- Add a provider fallback by passing the ordered model list through `withModelFallback`; do not duplicate retry loops in route handlers.

## Testing Strategy

- Run `bun run test` after changing generator or fallback helpers.
- Keep `generator.ts` and `fallback.ts` side-effect free so their tests can import them directly.
- Extend [generator.test.ts](./generator.test.ts#L4-L40) for normalization behavior and [fallback.test.ts](./fallback.test.ts#L4-L41) for fallback semantics.

## Local Golden Rules

- Do not move environment key reads into the client or return raw keys from `/api/config`. `ENV_KEYS` is server-local at [index.ts](./index.ts#L59-L62) and the config route intentionally exposes only boolean availability at [index.ts](./index.ts#L147-L156).
- Retain CORS headers on all API responses, including preflight and error paths, as established in [index.ts](./index.ts#L51-L55) and [index.ts](./index.ts#L141-L155).
- Preserve distinct 503 and 429 messages/statuses before the generic error response; the double handling is intentional at [index.ts](./index.ts#L191-L211).
- Do not change `ensureRenderCall` to append a render call blindly. It first recognizes an existing call and only infers uppercase component declarations at [generator.ts](./generator.ts#L16-L23).
