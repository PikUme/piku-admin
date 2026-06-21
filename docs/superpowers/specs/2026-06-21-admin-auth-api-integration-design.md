# 관리자 로그인·온보딩 API 연동 설계

## 목적

관리자 로그인과 최초 온보딩을 백엔드의 관리자 세션 인증 계약에 맞게 연동한다. 백엔드 주소, API 모드, CSRF 쿠키명과 헤더명은 공통 API 계층 한 곳에서 관리하고 각 도메인 API는 상대 경로만 사용한다.

## 범위

- 로그인 CSRF 초기화, 자격 증명 검증, OTP 검증
- 온보딩 CSRF 초기화, 임시 로그인, 자격 증명 설정, OTP 등록, OTP 검증
- RFC 9457 Problem Details 오류 전달
- 원격 API를 기본 실행 모드로 설정
- 환경변수와 개발 문서 갱신

대시보드 통계, 로그아웃, 패스워드 변경, 관리자 계정 운영 API는 이번 범위에 포함하지 않는다.

## 공통 API 구조

`shared/api/admin-auth`에 기본 관리자 API 요청 생성을 집중한다.

- `NEXT_PUBLIC_BACKEND_BASE_URL`은 공통 계층에서 한 번만 읽는다.
- 백엔드 기본 주소 뒤에 각 도메인이 전달한 `/api/admin/auth/...` 상대 경로를 결합한다.
- `NEXT_PUBLIC_API_MODE`의 기본값은 `remote`다.
- mock 모드는 환경변수나 테스트 옵션에서 `mock`을 명시한 경우에만 사용한다.
- CSRF 기본 쿠키명은 `csrf_token`, 기본 헤더명은 백엔드 설정과 같은 `csrf_header`다.
- 모든 요청은 `credentials: "include"`를 사용한다.
- 상태 변경 요청은 CSRF 쿠키 값을 헤더에 전달하며 자동 재시도하지 않는다.

로그인과 온보딩 API 팩토리는 공통 설정과 요청 생성을 중복하지 않는다. 테스트에서는 공통 요청 함수 또는 fetch 구현을 주입할 수 있게 유지한다.

## 로그인 계약

### CSRF 초기화

`POST /api/admin/auth/csrf`를 CSRF 헤더 없이 호출한다. 204 응답을 성공으로 처리한다.

### 자격 증명 검증

`POST /api/admin/auth/login`에 `loginId`, `password`를 전달한다.

성공 응답은 다음 값만 허용한다.

```json
{
  "nextStep": "VERIFY_OTP"
}
```

백엔드가 반환하지 않는 `loginId`, `email`, `nickname`, `role`을 challenge 타입에서 제거한다. OTP 화면은 닉네임을 요구하지 않는 일반 안내를 표시한다.

### OTP 검증

`POST /api/admin/auth/otp/verify`에 `otpCode`를 전달한다.

성공 응답은 다음 구조를 검증한다.

```json
{
  "authenticated": true,
  "admin": {
    "nickname": "관리자",
    "role": "SUPER_ADMIN"
  }
}
```

`admin`에는 `nickname`, `role`만 요구한다. `authenticated`가 true인 경우에만 대시보드로 이동한다.

## 온보딩 계약

### 임시 로그인

`POST /api/admin/auth/temporary-login`에 `email`, `temporaryPassword`를 전달한다.

응답의 `nextStep`이 `SET_CREDENTIALS`인지 검증한 후 자격 증명 설정 화면으로 이동한다. 응답의 `nickname`, `role`은 현재 UI에 필요하지 않으므로 저장하지 않는다.

### 자격 증명 설정

`PATCH /api/admin/auth/onboarding/credentials`에 `loginId`, `password`를 함께 전달한다.

응답의 `nextStep`이 `REGISTER_OTP`인지 검증한 후 OTP 등록 API를 호출한다.

### OTP 등록

`POST /api/admin/auth/onboarding/otp` 응답의 `issuer`, `accountName`, `provisioningUri`, `manualEntryKey`를 검증한다. `provisioningUri`는 브라우저에서 QR 데이터 URL로 변환한다.

### OTP 검증

`POST /api/admin/auth/onboarding/otp/verify`에 `otpCode`를 전달한다.

로그인 OTP 검증과 동일한 인증 완료 응답 구조를 검증한다. `authenticated`가 true인 경우에만 대시보드로 이동한다.

## 오류 처리

- 응답이 RFC 9457 Problem Details이면 `status`, `type`, `detail`, `fieldErrors`를 `AdminApiError`에 보존한다.
- `fieldErrors`의 키가 현재 폼 필드와 일치하면 해당 필드 오류로 표시한다.
- 필드에 대응하지 않는 오류는 화면 상단 요청 오류로 표시한다.
- 예상하지 못한 성공 응답은 계약 오류로 처리하고 다음 단계로 이동하지 않는다.
- CSRF 초기화 실패 시 기존 재시도 UI를 유지한다.
- 상태 변경 요청은 실패 후 자동으로 다시 보내지 않는다.

## 테스트

테스트를 먼저 실패시키고 다음 동작을 검증한다.

- 기본 모드가 remote이며 공통 백엔드 주소를 사용하는지
- mock 모드는 명시적으로 선택할 수 있는지
- 기본 CSRF 헤더명이 `csrf_header`인지
- 로그인 challenge가 `nextStep`만으로 통과하는지
- 인증 완료 응답이 `nickname`, `role`만으로 통과하는지
- 온보딩의 각 `nextStep` 불일치를 거부하는지
- 인증 완료 응답이 잘못되면 대시보드로 이동하지 않는지
- 백엔드 필드 오류가 현재 입력 필드에 표시되는지

전체 테스트, 린트, 타입 검사, 프로덕션 빌드로 최종 검증한다.
