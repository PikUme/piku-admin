import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ADMIN_ROLE } from "@/shared/api/admin-auth/contracts";
import { saveAuthenticatedAdmin } from "@/shared/api/admin-auth/session";

import { DashboardSidebar } from "./dashboard-sidebar";

describe("DashboardSidebar", () => {
  beforeEach(() => sessionStorage.clear());

  it("shows Admin Management for SUPER_ADMIN", async () => {
    saveAuthenticatedAdmin({
      nickname: "최고 관리자",
      role: ADMIN_ROLE.SUPER_ADMIN,
    });
    render(<DashboardSidebar />);

    expect(await screen.findByText("Admin Management")).toBeInTheDocument();
  });

  it.each([ADMIN_ROLE.OPERATOR, ADMIN_ROLE.VIEWER])(
    "hides Admin Management for %s",
    async (role) => {
      saveAuthenticatedAdmin({ nickname: "관리자", role });
      render(<DashboardSidebar />);

      await waitFor(() => {
        expect(screen.queryByText("Admin Management")).not.toBeInTheDocument();
      });
    },
  );

  it("hides Admin Management without a stored admin", () => {
    render(<DashboardSidebar />);

    expect(screen.queryByText("Admin Management")).not.toBeInTheDocument();
  });
});
