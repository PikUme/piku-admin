export const TEST_BACKEND_BASE_URL = "http://localhost:8080";
export const TEST_CSRF_COOKIE_NAME = "csrf_token";
export const TEST_CSRF_HEADER_NAME = "csrf_header";

export const testAdminAuthEnv = {
  NEXT_PUBLIC_BACKEND_BASE_URL: TEST_BACKEND_BASE_URL,
  NEXT_PUBLIC_CSRF_COOKIE_NAME: TEST_CSRF_COOKIE_NAME,
  NEXT_PUBLIC_CSRF_HEADER_NAME: TEST_CSRF_HEADER_NAME,
} as const;
