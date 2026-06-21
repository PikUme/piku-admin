# Pikume Admin

Next.js App Router 기반 관리자 콘솔입니다. 페이지는 라우팅만 담당하고, 로그인·온보딩·대시보드의 API, 상태, UI는 도메인 단위로 분리되어 있습니다.

## Getting started

```bash
pnpm install
pnpm dev
```

기본 경로는 `/admin/login`으로 이동합니다. 임시 계정을 발급받은 관리자는 로그인 화면의 링크를 통해 `/admin/onboarding`으로 이동할 수 있습니다.

## Environment variables

`.env.sample`을 `.env.local`로 복사해 사용합니다.

```dotenv
NEXT_PUBLIC_API_MODE=remote
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CSRF_COOKIE_NAME=csrf_token
NEXT_PUBLIC_CSRF_HEADER_NAME=csrf_header
```

기본 모드는 `remote`이며 `NEXT_PUBLIC_BACKEND_BASE_URL`의 백엔드 API를 호출합니다. UI만 독립 개발할 때는 `NEXT_PUBLIC_API_MODE=mock`을 명시합니다. 백엔드 기본 CSRF 쿠키명은 `csrf_token`, 헤더명은 `csrf_header`이며 각각 환경변수로 덮어쓸 수 있습니다.

## Verification

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```
