import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OnboardingApi } from "../api/contracts";
import { OnboardingFlow } from "./onboarding-flow";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

function createApi(): OnboardingApi {
  return {
    initializeCsrf: vi.fn().mockResolvedValue(undefined),
    temporaryLogin: vi.fn().mockResolvedValue(undefined),
    updateCredentials: vi.fn().mockResolvedValue(undefined),
    startOtpRegistration: vi.fn().mockResolvedValue({
      qrCodeDataUrl: "data:image/svg+xml,qr",
      manualEntryKey: "JBSWY3DPEHPK3PXP",
    }),
    verifyOtp: vi.fn().mockResolvedValue(undefined),
  };
}

describe("OnboardingFlow", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("initializes CSRF and never renders a previous-step control", async () => {
    const api = createApi();
    render(<OnboardingFlow api={api} />);

    await waitFor(() => expect(api.initializeCsrf).toHaveBeenCalledOnce());
    expect(screen.getByRole("heading", { name: "최초 계정 설정" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.queryByRole("button", { name: /이전/ })).not.toBeInTheDocument();
  });

  it("does not call the temporary login API when fields are empty", async () => {
    const user = userEvent.setup();
    const api = createApi();
    render(<OnboardingFlow api={api} />);
    await screen.findByRole("button", { name: "다음" });

    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText("임시 ID를 입력해 주세요.")).toBeInTheDocument();
    expect(api.temporaryLogin).not.toHaveBeenCalled();
  });

  it("completes all steps in API order and redirects to the dashboard", async () => {
    const user = userEvent.setup();
    const api = createApi();
    render(<OnboardingFlow api={api} />);
    await waitFor(() => expect(api.initializeCsrf).toHaveBeenCalledOnce());

    await user.type(screen.getByLabelText("임시 ID"), "temp.user.123");
    await user.type(screen.getByLabelText("임시 비밀번호"), "temporary-password");
    await user.click(screen.getByRole("button", { name: "다음" }));

    await screen.findByLabelText("로그인 ID");
    await user.type(screen.getByLabelText("로그인 ID"), "admin_1");
    await user.type(screen.getByLabelText("비밀번호"), "Strong!234");
    await user.type(screen.getByLabelText("비밀번호 확인"), "Strong!234");
    await user.click(screen.getByRole("button", { name: "다음 단계" }));

    await screen.findByLabelText("인증 코드 (6자리)");
    expect(api.updateCredentials).toHaveBeenCalledBefore(
      api.startOtpRegistration as ReturnType<typeof vi.fn>,
    );
    expect(screen.getByText("JBSWY3DPEHPK3PXP")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");

    await user.type(screen.getByLabelText("인증 코드 (6자리)"), "123456");
    await user.click(screen.getByRole("button", { name: "인증 완료" }));

    await waitFor(() => {
      expect(api.verifyOtp).toHaveBeenCalledWith({ code: "123456" });
      expect(replace).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows a retry action when CSRF initialization fails", async () => {
    const user = userEvent.setup();
    const api = createApi();
    vi.mocked(api.initializeCsrf)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(undefined);

    render(<OnboardingFlow api={api} />);

    expect(await screen.findByText("보안 연결을 준비하지 못했습니다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitFor(() => expect(api.initializeCsrf).toHaveBeenCalledTimes(2));
    expect(await screen.findByLabelText("임시 ID")).toBeEnabled();
  });
});
