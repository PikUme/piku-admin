# 관리자 로그인·온보딩 API 연동 설계

## 목적

관리자 로그인과 최초 온보딩을 백엔드의 관리자 세션 인증 계약에 맞게 연동한다. 백엔드 주소, API 모드, CSRF 쿠키명과 헤더명은 공통 API 계층 한 곳에서 관리하고 각 도메인 API는 상대 경로만 사용한다.

## 범위

- 로그인 CSRF 초기화, 자격 증명 검증, OTP 검증
- 온보딩 CSRF 초기화, 임시 로그인, 자격 증명 설정, OTP 등록, OTP 검증
- 인증 완료 사용자 정보의 탭 단위 유지와 역할별 사이드바 메뉴 노출
- RFC 9457 Problem Details 오류 전달
- 원격 API를 기본 실행 모드로 설정
- 환경변수와 개발 문서 갱신

대시보드 통계, 로그아웃, 패스워드 변경, 관리자 계정 운영 API와 Admin Management 화면 구현은 이번 범위에 포함하지 않는다. 기존 사이드바의 Admin Management 메뉴 노출 조건만 변경한다.

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

## 공통 인증 계약

백엔드가 반환하는 인증 단계와 역할 문자열은 `shared/api/admin-auth`의 공통 계약에서 한 번만 선언한다.

```ts
export const ADMIN_AUTH_NEXT_STEP = {
  VERIFY_OTP: "VERIFY_OTP",
  SET_CREDENTIALS: "SET_CREDENTIALS",
  REGISTER_OTP: "REGISTER_OTP",
} as const;

export const ADMIN_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATOR: "OPERATOR",
  VIEWER: "VIEWER",
} as const;
```

- 로그인과 온보딩의 응답 타입, 파서, mock, reducer 테스트는 위 상수를 참조한다.
- 문자열 리터럴을 각 도메인에 다시 선언하지 않는다.
- 백엔드 계약이 바뀌면 공통 계약과 그 계약 테스트를 한 곳에서 수정한다.
- 화면 진행을 위한 `1 | 2 | 3` 단계는 백엔드 응답 값이 아니므로 각 UI 도메인 내부 상태로 유지한다.

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
  "nickname": "관리자",
  "role": "SUPER_ADMIN"
}
```

인증 완료 여부를 나타내는 `authenticated` 필드와 `admin` 래퍼는 사용하지 않는다. 2xx 응답에서 최상위 `nickname`, `role`을 검증한 경우에만 OTP 검증 성공으로 처리한다. 검증된 사용자 정보를 공통 세션 저장소에 기록한 뒤 대시보드로 이동한다.

## 온보딩 계약

### 임시 로그인

`POST /api/admin/auth/temporary-login`에 `email`, `temporaryPassword`를 전달한다.

응답은 `nextStep`만 반환한다. 값이 `SET_CREDENTIALS`인지 검증한 후 자격 증명 설정 화면으로 이동한다.

### 자격 증명 설정

`PATCH /api/admin/auth/onboarding/credentials`에 `loginId`, `password`를 함께 전달한다.

응답의 `nextStep`이 `REGISTER_OTP`인지 검증한 후 OTP 등록 API를 호출한다.

### OTP 등록

`POST /api/admin/auth/onboarding/otp` 응답은 다음 값만 반환한다.

```json
{
  "provisioningUri": "otpauth://totp/...",
  "manualEntryKey": "..."
}
```

`issuer`, `accountName` 필드는 요구하거나 보관하지 않는다. `provisioningUri`는 브라우저에서 QR 데이터 URL로 변환하고 원본 응답과 생성된 등록 정보는 OTP 등록 화면에서만 유지한다. 백엔드의 `Cache-Control: no-store` 정책에 맞춰 별도 영속 저장이나 캐시를 하지 않는다.

### OTP 검증

`POST /api/admin/auth/onboarding/otp/verify`에 `otpCode`를 전달한다.

로그인 OTP 검증과 동일하게 최상위 `nickname`, `role` 응답을 검증한다. 2xx 응답과 유효한 사용자 정보가 모두 확인된 경우에만 공통 세션 저장소에 사용자 정보를 기록하고 대시보드로 이동한다.

## 인증 사용자 정보와 사이드바

OTP 검증 성공 응답의 `nickname`, `role`은 공통 세션 저장소를 통해 `sessionStorage`에 저장한다.

- 저장 키, 직렬화, 파싱, 유효성 검증은 공통 모듈 한 곳에서 관리한다.
- 로그인과 온보딩은 같은 저장 함수를 사용한다.
- 로그인 또는 온보딩 인증 흐름을 새로 시작할 때 이전 사용자 정보를 제거해 오래된 역할이 남지 않게 한다.
- 잘못된 JSON이나 지원하지 않는 역할은 인증 사용자 정보가 없는 상태로 처리하고 저장값을 제거한다.
- `sessionStorage`는 탭을 새로고침해도 유지되지만 새 탭이나 브라우저 종료 후에는 공유하지 않는다.

대시보드 사이드바는 공통 저장소에서 복원한 역할이 `ADMIN_ROLE.SUPER_ADMIN`일 때만 기존 `Admin Management` 메뉴를 렌더링한다. `OPERATOR`, `VIEWER`, 사용자 정보 없음, 손상된 저장값에서는 메뉴를 렌더링하지 않는다. 초기 렌더에서는 권한 메뉴를 숨기고 클라이언트에서 유효한 역할을 복원한 뒤 노출해 권한 메뉴가 잠깐 잘못 보이는 현상을 방지한다.

이 메뉴 조건은 UI 노출 제어일 뿐 권한 검사가 아니다. `sessionStorage` 값은 사용자가 변경할 수 있으므로 Admin Management API의 실제 권한은 항상 백엔드가 검증해야 한다.

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
- 임시 로그인 응답이 `nextStep`만으로 통과하고 사용자 정보를 요구하지 않는지
- OTP 등록 응답이 `provisioningUri`, `manualEntryKey`만으로 통과하는지
- 인증 완료 응답이 최상위 `nickname`, `role`만으로 통과하는지
- 로그인과 온보딩이 동일한 공통 사용자 정보 저장소에 인증 결과를 기록하는지
- 저장된 사용자 정보가 새로고침 후 복원되고 손상된 값은 제거되는지
- `SUPER_ADMIN`에게만 Admin Management 메뉴가 보이는지
- `OPERATOR`, `VIEWER`, 사용자 정보 없음에서는 Admin Management 메뉴가 보이지 않는지
- 인증 단계와 역할 비교가 공통 상수를 사용하는지
- 온보딩의 각 `nextStep` 불일치를 거부하는지
- 인증 완료 사용자 정보가 잘못되면 대시보드로 이동하지 않는지
- 백엔드 필드 오류가 현재 입력 필드에 표시되는지

전체 테스트, 린트, 타입 검사, 프로덕션 빌드로 최종 검증한다.
