# Project Agent Guide

## Operational Commands

- Install dependencies: `bun install`
- Run API and Vite together: `bun run dev`
- Run the Bun API only: `bun run server`
- Build the client: `bun run build`
- Lint all source: `bun run lint`
- Run the test suite once: `bun run test`
- Use Bun for project commands. Do not introduce npm, yarn, or pnpm lockfiles.

## Golden Rules

- Keep provider secrets on the server. Environment-backed keys are read in [server/index.ts](./server/index.ts#L59-L66), while `/api/config` returns only their presence as booleans at [server/index.ts](./server/index.ts#L147-L156). Do not expose key values in API responses, client state, logs, or generated UI.
- Preserve the two key paths: a request-scoped key takes precedence over the server key in [server/index.ts](./server/index.ts#L64-L66), and the client only includes a user-entered key when present in [src/hooks/useComponentGenerator.ts](./src/hooks/useComponentGenerator.ts#L23-L27).
- Generated code must remain executable by `react-live` with `noInline`: it must avoid imports and TypeScript syntax per [server/index.ts](./server/index.ts#L9-L20), and must end with a `render(...)` call. Keep the normalizers in [server/generator.ts](./server/generator.ts#L5-L23) in the generation path at [server/index.ts](./server/index.ts#L183-L190).
- Preserve Google model fallback order and last-error behavior. The API intentionally delegates through `withModelFallback` at [server/index.ts](./server/index.ts#L134-L136); its first-success/last-error contract is covered by [server/fallback.test.ts](./server/fallback.test.ts#L5-L40).
- Treat the pure response normalizers and prompt-submit behavior as tested boundaries. Update their focused Vitest tests when changing [server/generator.ts](./server/generator.ts#L5-L23), [server/fallback.ts](./server/fallback.ts#L3-L20), or [src/components/PromptInput.tsx](./src/components/PromptInput.tsx#L17-L77).

## TDD Rule

> **이 규칙은 Rigid — 상황에 맞게 변형하지 마라.**

하위 디렉토리의 `AGENTS.md`에 별도 TDD 규칙이 있으면 **그 규칙을 우선**한다. 이 섹션은 전역 기본값(**fallback**)이다.

### 적용 기준

- **반드시 적용:** 비즈니스 로직, API, 유틸리티, 버그 수정
- **불필요:** 타입 정의, 설정 파일, 순수 UI, SQL

### RED-GREEN-REFACTOR

1. **RED:** 하나의 동작당 테스트 하나를 작성한다. 반드시 실행해 실패를 확인하고, 실패 이유는 **기능 미구현**이어야 한다.
2. **GREEN:** 테스트를 통과시키는 최소 코드만 작성한다. **YAGNI**를 지키고, 신규·기존 테스트가 모두 통과함을 확인한다.
3. **REFACTOR:** 중복 제거, 이름 개선, 헬퍼 추출만 수행한다. green 상태를 유지하며 **새 동작을 추가하지 않는다.**
4. **반복:** 다음 동작의 RED로 돌아간다.

### 삭제 강제 규칙

- 테스트보다 프로덕션 코드를 먼저 작성했다면 **반드시 삭제**하고 RED부터 다시 시작한다.
- "참고용"으로 남겨두는 것도 **금지**한다.

### 변명 차단표

| 변명 | 반론 |
| --- | --- |
| 너무 단순해서 테스트 불필요 | 단순한 동작도 요구사항과 회귀 방지를 검증한다. |
| 나중에 추가하겠다 | 테스트는 구현 전에 작성한다. 나중은 허용되지 않는다. |
| 시간이 없다 | TDD를 생략해 생기는 디버깅·회귀 비용이 더 크다. |
| 삭제하면 낭비 | 잘못된 순서의 코드는 매몰비용이다. 삭제 후 RED로 시작한다. |
| 프로토타입이다 | 적용 대상이면 프로토타입도 동일하게 TDD를 따른다. |

## Project Context

This application turns a natural-language UI request into a standalone React component that users can preview and inspect immediately.

Stack: React 19, TypeScript, Vite, Bun, Vitest, Testing Library, react-live, Anthropic Messages API, Google Gemini API.

## Standards and References

- Follow the existing TypeScript and ESM style; keep client types in `src/types` and avoid server-only values in `src`.
- Use focused Korean Conventional Commit messages such as `feat: 생성 결과 복사 기능 추가` or `fix: Gemini 폴백 오류 처리`.
- A commit request does not authorize `git push`, rebase, amend, or reset.
- When code and these rules diverge, propose an update to the relevant `AGENTS.md` in the same change.

## Context Map

- **[Bun API, provider calls, output normalization](./server/AGENTS.md)** — API routes, model fallback, response shaping, and server tests.
- **[React UI, hooks, and live preview](./src/AGENTS.md)** — client state, UI components, styles, and client tests.
