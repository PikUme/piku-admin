import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_AUTH_NEXT_STEP,
  ADMIN_ROLE,
  AdminApiError,
} from "@/shared/api/admin-auth/contracts";
import {
  AUTHENTICATED_ADMIN_STORAGE_KEY,
} from "@/shared/api/admin-auth/session";

import type { LoginApi } from "../api/contracts";
import { LoginFlow } from "./login-flow";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

function createApi(): LoginApi {
  return {
    initializeCsrf: vi.fn().mockResolvedValue(undefined),
    login: vi.fn().mockResolvedValue({
      nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
    }),
    verifyOtp: vi.fn().mockResolvedValue({
      nickname: "운영자",
      role: ADMIN_ROLE.SUPER_ADMIN,
    }),
  };
}

describe("LoginFlow", () => {
  beforeEach(() => {
    replace.mockReset();
    sessionStorage.clear();
  });

  it("initializes CSRF and links temporary accounts to onboarding", async () => {
    const api = createApi();
    render(<LoginFlow api={api} />);

    await waitFor(() => expect(api.initializeCsrf).toHaveBeenCalledOnce());
    expect(screen.getByRole("heading", { name: "관리자 로그인" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(
      screen.getByRole("link", { name: "임시 계정을 발급받으셨나요?" }),
    ).toHaveAttribute("href", "/admin/onboarding");
    expect(screen.queryByRole("button", { name: /이전/ })).not.toBeInTheDocument();
  });

  it("does not call login with invalid fields", async () => {
    const user = userEvent.setup();
    const api = createApi();
    render(<LoginFlow api={api} />);
    await screen.findByRole("button", { name: "로그인" });

    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(screen.getByText(/4~15자의 영문 소문자/)).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
    expect(api.login).not.toHaveBeenCalled();
  });

  it("submits credentials, sends otpCode, and redirects", async () => {
    const user = userEvent.setup();
    const api = createApi();
    render(<LoginFlow api={api} />);
    await waitFor(() => expect(api.initializeCsrf).toHaveBeenCalledOnce());

    await user.type(screen.getByLabelText("로그인 ID"), "admin_1");
    await user.type(screen.getByLabelText("비밀번호"), "Strong!234");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByText("OTP 코드를 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    await user.type(screen.getByLabelText("인증 코드 (6자리)"), "123456");
    await user.click(screen.getByRole("button", { name: "OTP 인증" }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        loginId: "admin_1",
        password: "Strong!234",
      });
      expect(api.verifyOtp).toHaveBeenCalledWith({ otpCode: "123456" });
      expect(
        JSON.parse(
          sessionStorage.getItem(AUTHENTICATED_ADMIN_STORAGE_KEY) ?? "null",
        ),
      ).toEqual({ nickname: "운영자", role: ADMIN_ROLE.SUPER_ADMIN });
      expect(replace).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows backend field errors without advancing", async () => {
    const user = userEvent.setup();
    const api = createApi();
    vi.mocked(api.login).mockRejectedValue(
      new AdminApiError("입력 오류", {
        status: 400,
        fieldErrors: { loginId: "로그인 ID를 확인해 주세요." },
      }),
    );
    render(<LoginFlow api={api} />);

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
    const api = createApi();
    vi.mocked(api.initializeCsrf)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(undefined);
    render(<LoginFlow api={api} />);

    expect(await screen.findByText("보안 연결을 준비하지 못했습니다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitFor(() => expect(api.initializeCsrf).toHaveBeenCalledTimes(2));
    expect(await screen.findByLabelText("로그인 ID")).toBeEnabled();
  });
});
