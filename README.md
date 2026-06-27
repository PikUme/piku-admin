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
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CSRF_COOKIE_NAME=csrf_token
NEXT_PUBLIC_CSRF_HEADER_NAME=csrf_header
```

개발 및 운영 환경에서는 `NEXT_PUBLIC_BACKEND_BASE_URL`의 백엔드 API를 호출합니다. `NEXT_PUBLIC_CSRF_COOKIE_NAME`과 `NEXT_PUBLIC_CSRF_HEADER_NAME`도 필수이며, 관리자 API 요청 생성 시 한곳에서 읽어 CSRF 쿠키 조회와 헤더 주입에 사용합니다.

`pnpm test` 실행 시에만 MSW가 백엔드 요청을 가로채 테스트 응답을 반환합니다. 등록되지 않은 요청은 실제 네트워크로 전달되지 않고 테스트를 실패시킵니다.

## Verification

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```
