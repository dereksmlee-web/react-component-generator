# Client Agent Guide

## Module Context

This React/Vite client collects a component request, sends it to the Bun API, and presents generated components through `react-live`. API keys entered in the UI are request-scoped client input, not persisted application state.

## Constraints and Patterns

- Use functional React components and hooks. Keep component-specific state local and place generation lifecycle state in `useComponentGenerator`.
- Keep API calls in [hooks/useComponentGenerator.ts](./hooks/useComponentGenerator.ts#L13-L59); UI components receive behavior through props rather than performing generation fetches themselves.
- Keep partial streaming code in the hook's `draft`. Display it in the code tab without executing it; add a generated record and switch to preview only after the server's normalized `done` event. Discard drafts on errors or incomplete streams.
- Generated components are keyed by a unique id and prepended to the list at [hooks/useComponentGenerator.ts](./hooks/useComponentGenerator.ts#L35-L42). Preserve this newest-first behavior.
- Keep preview code compatible with `react-live`'s `noInline` mode in [components/LivePreview.tsx](./components/LivePreview.tsx). Do not add client-side transforms that bypass server normalization.

## Testing Strategy

- Run `bun run test` for client behavior changes and `bun run build` for TypeScript or styling changes.
- Add interaction tests alongside components when changing disabled states, callbacks, or user input. Prompt submission behavior is covered in [components/PromptInput.test.tsx](./components/PromptInput.test.tsx#L6-L29).

## Local Golden Rules

- Do not store API keys in local storage, URLs, or generated component records. The request body conditionally sends an entered key only at [hooks/useComponentGenerator.ts](./hooks/useComponentGenerator.ts#L23-L27), while generated records keep only id, prompt, code, and timestamp at [hooks/useComponentGenerator.ts](./hooks/useComponentGenerator.ts#L35-L40).
- Keep provider changes resetting the manually entered key, as implemented in [App.tsx](./App.tsx#L41-L44), so credentials cannot cross provider boundaries.
- Preserve the client-side missing-key guard before generation at [App.tsx](./App.tsx#L33-L39); server validation is a separate defense, not a replacement.
- Keep `PromptInput` from submitting empty or concurrent requests. It guards trimmed input and loading state at [components/PromptInput.tsx](./components/PromptInput.tsx#L20-L25) and disables the control at [components/PromptInput.tsx](./components/PromptInput.tsx#L51-L60).
