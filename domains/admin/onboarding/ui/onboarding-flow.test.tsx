import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";

import {
  ADMIN_AUTH_NEXT_STEP,
  ADMIN_ROLE,
} from "@/shared/api/admin-auth/contracts";
import { AUTHENTICATED_ADMIN_STORAGE_KEY } from "@/shared/api/admin-auth/session";
import { TEST_BACKEND_BASE_URL } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

import { OnboardingFlow } from "./onboarding-flow";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("OnboardingFlow", () => {
  beforeEach(() => {
    replace.mockReset();
    sessionStorage.clear();
  });

  it("initializes CSRF and never renders a previous-step control", async () => {
    let csrfRequests = 0;
    server.use(
      http.post(`${TEST_BACKEND_BASE_URL}/api/admin/auth/csrf`, () => {
        csrfRequests += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    render(<OnboardingFlow />);

    await waitFor(() => expect(csrfRequests).toBe(1));
    expect(screen.getByRole("heading", { name: "최초 계정 설정" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.queryByRole("button", { name: /이전/ })).not.toBeInTheDocument();
  });

  it("does not call the temporary login API when fields are empty", async () => {
    const user = userEvent.setup();
    let temporaryLoginRequests = 0;
    server.use(
      http.post(
        `${TEST_BACKEND_BASE_URL}/api/admin/auth/temporary-login`,
        () => {
          temporaryLoginRequests += 1;
          return HttpResponse.json({
            nextStep: ADMIN_AUTH_NEXT_STEP.SET_CREDENTIALS,
          });
        },
      ),
    );
    render(<OnboardingFlow />);
    await screen.findByRole("button", { name: "다음" });

    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText("이메일을 입력해 주세요.")).toBeInTheDocument();
    expect(temporaryLoginRequests).toBe(0);
  });

  it("completes all steps in API order and redirects to the dashboard", async () => {
    const user = userEvent.setup();
    const requestOrder: string[] = [];
    let temporaryLoginBody: unknown;
    let credentialsBody: unknown;
    let otpBody: unknown;
    server.use(
      http.post(
        `${TEST_BACKEND_BASE_URL}/api/admin/auth/temporary-login`,
        async ({ request }) => {
          requestOrder.push("temporary-login");
          temporaryLoginBody = await request.json();
          return HttpResponse.json({
            nextStep: ADMIN_AUTH_NEXT_STEP.SET_CREDENTIALS,
          });
        },
      ),
      http.patch(
        `${TEST_BACKEND_BASE_URL}/api/admin/auth/onboarding/credentials`,
        async ({ request }) => {
          requestOrder.push("credentials");
          credentialsBody = await request.json();
          return HttpResponse.json({
            nextStep: ADMIN_AUTH_NEXT_STEP.REGISTER_OTP,
          });
        },
      ),
      http.post(
        `${TEST_BACKEND_BASE_URL}/api/admin/auth/onboarding/otp`,
        () => {
          requestOrder.push("otp-registration");
          return HttpResponse.json({
            provisioningUri: "otpauth://totp/Piku:test-admin",
            manualEntryKey: "JBSWY3DPEHPK3PXP",
          });
        },
      ),
      http.post(
        `${TEST_BACKEND_BASE_URL}/api/admin/auth/onboarding/otp/verify`,
        async ({ request }) => {
          requestOrder.push("otp-verification");
          otpBody = await request.json();
          return HttpResponse.json({
            nickname: "테스트 운영자",
            role: ADMIN_ROLE.OPERATOR,
          });
        },
      ),
    );
    render(<OnboardingFlow />);
    await screen.findByRole("button", { name: "다음" });

    await user.type(screen.getByLabelText("이메일"), "admin@example.com");
    await user.type(screen.getByLabelText("임시 비밀번호"), "temporary-password");
    await user.click(screen.getByRole("button", { name: "다음" }));

    await screen.findByLabelText("로그인 ID");
    await user.type(screen.getByLabelText("로그인 ID"), "admin_1");
    await user.type(screen.getByLabelText("비밀번호"), "Strong!234");
    await user.type(screen.getByLabelText("비밀번호 확인"), "Strong!234");
    await user.click(screen.getByRole("button", { name: "다음 단계" }));

    await screen.findByLabelText("인증 코드 (6자리)");
    expect(requestOrder).toEqual([
      "temporary-login",
      "credentials",
      "otp-registration",
    ]);
    expect(screen.getByText("JBSWY3DPEHPK3PXP")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");

    await user.type(screen.getByLabelText("인증 코드 (6자리)"), "123456");
    await user.click(screen.getByRole("button", { name: "인증 완료" }));

    await waitFor(() => {
      expect(temporaryLoginBody).toEqual({
        email: "admin@example.com",
        temporaryPassword: "temporary-password",
      });
      expect(credentialsBody).toEqual({
        loginId: "admin_1",
        password: "Strong!234",
      });
      expect(otpBody).toEqual({ otpCode: "123456" });
      expect(requestOrder).toEqual([
        "temporary-login",
        "credentials",
        "otp-registration",
        "otp-verification",
      ]);
      expect(
        JSON.parse(
          sessionStorage.getItem(AUTHENTICATED_ADMIN_STORAGE_KEY) ?? "null",
        ),
      ).toEqual({ nickname: "테스트 운영자", role: ADMIN_ROLE.OPERATOR });
      expect(replace).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows a backend login ID conflict on the credentials step", async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(
        `${TEST_BACKEND_BASE_URL}/api/admin/auth/onboarding/credentials`,
        () => {
          return HttpResponse.json(
            {
              type: "https://pikume.com/problems/admin/duplicate-login-id",
              title: "Conflict",
              status: 409,
              detail: "중복된 로그인 ID입니다.",
              instance: "/api/admin/auth/onboarding/credentials",
              fieldErrors: {
                loginId: "이미 사용 중인 로그인 ID입니다.",
              },
            },
            { status: 409 },
          );
        },
      ),
    );
    render(<OnboardingFlow />);

    await user.type(await screen.findByLabelText("이메일"), "admin@example.com");
    await user.type(
      screen.getByLabelText("임시 비밀번호"),
      "temporary-password",
    );
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.type(await screen.findByLabelText("로그인 ID"), "admin_1");
    await user.type(screen.getByLabelText("비밀번호"), "Strong!234");
    await user.type(screen.getByLabelText("비밀번호 확인"), "Strong!234");
    await user.click(screen.getByRole("button", { name: "다음 단계" }));

    expect(
      await screen.findByText("이미 사용 중인 로그인 ID입니다."),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  it("shows a retry action when CSRF initialization fails", async () => {
    const user = userEvent.setup();
    let csrfRequests = 0;
    server.use(
      http.post(`${TEST_BACKEND_BASE_URL}/api/admin/auth/csrf`, () => {
        csrfRequests += 1;
        return csrfRequests === 1
          ? HttpResponse.error()
          : new HttpResponse(null, { status: 204 });
      }),
    );

    render(<OnboardingFlow />);

    expect(await screen.findByText("보안 연결을 준비하지 못했습니다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitFor(() => expect(csrfRequests).toBe(2));
    expect(await screen.findByLabelText("이메일")).toBeEnabled();
  });
});
