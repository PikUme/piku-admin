import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dashboard } from "./dashboard";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("Dashboard", () => {
  it("renders the complete static admin overview", async () => {
    render(<Dashboard />);

    // Wait for the dashboard to finish loading
    expect(await screen.findByRole("navigation", { name: "관리자 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.queryByText("Admin Management")).not.toBeInTheDocument();
    
    // Check metric cards (dynamic values from MSW handler)
    expect(screen.getByText("124,592")).toBeInTheDocument();
    expect(screen.getByText("45,210")).toBeInTheDocument();
    expect(screen.getByText("892,104")).toBeInTheDocument();
    expect(screen.getByText("542,109")).toBeInTheDocument();
    
    expect(
      screen.getByRole("img", { name: "최근 7일 일간 활성 사용자 막대 차트" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "AI 사진 생성 성공률 92%" }),
    ).toBeInTheDocument();
    expect(screen.getByText("API Timeout (Image Gen)")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "날짜별 데이터 요약" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2026-06-22" })).toBeInTheDocument();
  });
});
