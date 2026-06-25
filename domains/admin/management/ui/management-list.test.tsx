import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ADMIN_ROLE } from "@/shared/api/admin-auth/contracts";
import { saveAuthenticatedAdmin } from "@/shared/api/admin-auth/session";

import { ManagementList } from "./management-list";

const { replace, push } = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
}));

describe("ManagementList", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("renders unauthorized page for OPERATOR role", async () => {
    saveAuthenticatedAdmin({
      nickname: "운영자",
      role: ADMIN_ROLE.OPERATOR,
    });
    render(<ManagementList />);

    expect(await screen.findByText("403")).toBeInTheDocument();
    expect(screen.getByText("접근 권한 없음")).toBeInTheDocument();
  });

  it("renders administrator list page for SUPER_ADMIN role", async () => {
    saveAuthenticatedAdmin({
      nickname: "최고 관리자",
      role: ADMIN_ROLE.SUPER_ADMIN,
    });
    render(<ManagementList />);

    expect(await screen.findByText("관리자 목록")).toBeInTheDocument();
    expect(await screen.findByText("admin_super")).toBeInTheDocument();
    expect(await screen.findByText("mgr_ops_01")).toBeInTheDocument();
    expect(await screen.findByText("dev_viewer")).toBeInTheDocument();
  });
});
