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
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CSRF_COOKIE_NAME=csrf_token
NEXT_PUBLIC_CSRF_HEADER_NAME=csrf_token
```

`NEXT_PUBLIC_API_MODE`가 `mock`이면 정적 mock API를 사용하며, `remote`이면 백엔드 API를 호출합니다. CSRF 쿠키명과 헤더명은 각각 환경변수로 덮어쓸 수 있고 기본값은 모두 `csrf_token`입니다.

## Verification

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```
