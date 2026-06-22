import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";

import {
  ADMIN_AUTH_NEXT_STEP,
  ADMIN_ROLE,
} from "@/shared/api/admin-auth/contracts";
import {
  AUTHENTICATED_ADMIN_STORAGE_KEY,
} from "@/shared/api/admin-auth/session";
import { TEST_BACKEND_BASE_URL } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

import { LoginFlow } from "./login-flow";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("LoginFlow", () => {
  beforeEach(() => {
    replace.mockReset();
    sessionStorage.clear();
  });

  it("initializes CSRF and links temporary accounts to onboarding", async () => {
    let csrfRequests = 0;
    server.use(
      http.post(`${TEST_BACKEND_BASE_URL}/api/admin/auth/csrf`, () => {
        csrfRequests += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    render(<LoginFlow />);

    await waitFor(() => expect(csrfRequests).toBe(1));
    expect(screen.getByRole("heading", { name: "관리자 로그인" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(
      screen.getByRole("link", { name: "임시 계정을 발급받으셨나요?" }),
    ).toHaveAttribute("href", "/admin/onboarding");
    expect(screen.queryByRole("button", { name: /이전/ })).not.toBeInTheDocument();
  });

  it("does not call login with invalid fields", async () => {
    const user = userEvent.setup();
    let loginRequests = 0;
    server.use(
      http.post(`${TEST_BACKEND_BASE_URL}/api/admin/auth/login`, () => {
        loginRequests += 1;
        return HttpResponse.json({
          nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
        });
      }),
    );
    render(<LoginFlow />);
    await screen.findByRole("button", { name: "로그인" });

    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(screen.getByText(/4~15자의 영문 소문자/)).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
    expect(loginRequests).toBe(0);
  });

  it("submits credentials, sends otpCode, and redirects", async () => {
    const user = userEvent.setup();
    let loginBody: unknown;
    let otpBody: unknown;
    server.use(
      http.post(
        `${TEST_BACKEND_BASE_URL}/api/admin/auth/login`,
        async ({ request }) => {
          loginBody = await request.json();
          return HttpResponse.json({
            nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
          });
        },
      ),
      http.post(
        `${TEST_BACKEND_BASE_URL}/api/admin/auth/otp/verify`,
        async ({ request }) => {
          otpBody = await request.json();
          return HttpResponse.json({
            nickname: "테스트 관리자",
            role: ADMIN_ROLE.SUPER_ADMIN,
          });
        },
      ),
    );
    render(<LoginFlow />);
    await screen.findByRole("button", { name: "로그인" });

    await user.type(screen.getByLabelText("로그인 ID"), "admin_1");
    await user.type(screen.getByLabelText("비밀번호"), "Strong!234");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByText("OTP 코드를 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    await user.type(screen.getByLabelText("인증 코드 (6자리)"), "123456");
    await user.click(screen.getByRole("button", { name: "OTP 인증" }));

    await waitFor(() => {
      expect(loginBody).toEqual({
        loginId: "admin_1",
        password: "Strong!234",
      });
      expect(otpBody).toEqual({ otpCode: "123456" });
      expect(
        JSON.parse(
          sessionStorage.getItem(AUTHENTICATED_ADMIN_STORAGE_KEY) ?? "null",
        ),
      ).toEqual({ nickname: "테스트 관리자", role: ADMIN_ROLE.SUPER_ADMIN });
      expect(replace).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows backend field errors without advancing", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${TEST_BACKEND_BASE_URL}/api/admin/auth/login`, () => {
        return HttpResponse.json(
          {
            type: "https://pikume.com/problems/admin/invalid-login-id",
            title: "Bad Request",
            status: 400,
            detail: "입력 오류",
            instance: "/api/admin/auth/login",
            fieldErrors: { loginId: "로그인 ID를 확인해 주세요." },
          },
          { status: 400 },
        );
      }),
    );
    render(<LoginFlow />);

    await user.type(await screen.findByLabelText("로그인 ID"), "admin_1");
    await user.type(screen.getByLabelText("비밀번호"), "Strong!234");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(
      await screen.findByText("로그인 ID를 확인해 주세요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
  });

  it("shows a retry screen when CSRF initialization fails", async () => {
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
    render(<LoginFlow />);

    expect(await screen.findByText("보안 연결을 준비하지 못했습니다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitFor(() => expect(csrfRequests).toBe(2));
    expect(await screen.findByLabelText("로그인 ID")).toBeEnabled();
  });
});
