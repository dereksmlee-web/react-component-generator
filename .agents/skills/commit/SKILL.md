---
name: commit
description: "Analyze repository changes and create conventionally formatted Korean Git commits immediately. Use when the user asks to commit, save changes, or says 커밋해줘."
---

# Commit

변경사항을 논리적 커밋 단위로 정리하고, 사용자 승인 없이 즉시 커밋한다.

## Workflow

1. 먼저 저장소 상태를 확인한다. `git status --short`, `git diff --stat`, `git diff`, 그리고 이미 스테이징된 변경이 있으면 `git diff --cached`를 확인한다.
2. 변경의 목적과 의존성을 기준으로 논리적 단위를 분류한다. 서로 독립적인 기능, 수정, 리팩터링, 문서·설정 변경은 하나의 커밋에 섞지 않는다. 같은 동작을 완성하는 코드와 그 테스트는 함께 둔다.
3. 각 단위에 한국어 Conventional Commit 메시지를 제안한다. 형식은 `feat: 요약`, `fix: 요약`, `refactor: 요약`, `chore: 요약`을 사용한다. 필요하면 `docs:`, `test:`, `style:`도 사용한다. 요약은 간결한 명령형 또는 완료형 한국어로 쓴다.
4. 각 단위를 스테이징하고 제안된 메시지로 즉시 커밋한다. 커밋 직전에 `git status --short`를 다시 확인해 분석 이후 생긴 변경은 별도 단위로 분류한다.
5. 각 커밋 후 `git status --short`와 `git log -1 --oneline`으로 결과를 확인하고, 생성한 커밋 해시와 남은 변경사항을 보고한다.

## Guardrails

- 변경사항이 없으면 커밋을 만들지 말고 상태를 알린다.
- 기존에 스테이징된 변경도 분석 대상으로 포함하되, 스테이징을 해제하거나 덮어쓰지 않는다. 필요한 파일만 추가 스테이징해 논리적 단위를 완성한다.
- 사용자 승인 없이 커밋할 수 있지만, 푸시, 리베이스, amend, reset은 요청에 포함되지 않는다.
- 커밋 요청은 원격 저장소 전송 권한을 포함하지 않는다. `git push`는 사용자가 별도로 요청할 때만 수행한다.
