import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ADMIN_ROLE } from "@/shared/api/admin-auth/contracts";
import { saveAuthenticatedAdmin } from "@/shared/api/admin-auth/session";

import { ManagementDetail } from "./management-detail";

const { replace, push } = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
}));

describe("ManagementDetail", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("renders unauthorized page for OPERATOR role", async () => {
    saveAuthenticatedAdmin({
      nickname: "운영자",
      role: ADMIN_ROLE.OPERATOR,
    });
    render(<ManagementDetail id="admin_1024" />);

    expect(await screen.findByText("403")).toBeInTheDocument();
    expect(screen.getByText("접근 권한 없음")).toBeInTheDocument();
  });

  it("renders detail page for SUPER_ADMIN role with matched user details", async () => {
    saveAuthenticatedAdmin({
      nickname: "최고 관리자",
      role: ADMIN_ROLE.SUPER_ADMIN,
    });
    render(<ManagementDetail id="admin_1024" />);

    expect(await screen.findByText("관리자 상세 정보")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("admin_1024")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("김철수")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("시스템 운영팀")).toBeInTheDocument();
  });
});
