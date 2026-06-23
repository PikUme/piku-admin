import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatisticsPage } from "./statistics";

// Mock window.URL.createObjectURL and HTMLAnchorElement click
const mockCreateObjectURL = vi.fn(() => "blob:url");
const mockRevokeObjectURL = vi.fn();
window.URL.createObjectURL = mockCreateObjectURL;
window.URL.revokeObjectURL = mockRevokeObjectURL;

describe("StatisticsPage", () => {
  it("renders measurable active-user and DAU statistics by default", () => {
    render(<StatisticsPage />);

    expect(screen.getByRole("navigation", { name: "관리자 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Statistics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "통계 상세" })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "활성 사용자/DAU" }),
    ).toBeInTheDocument();
    expect(screen.getByText("7일 활성 회원 수")).toBeInTheDocument();
    expect(screen.getByText("32,940")).toBeInTheDocument();
    expect(screen.getByText("평균 DAU")).toBeInTheDocument();
    expect(screen.getByText("8,229")).toBeInTheDocument();
    expect(screen.getByText("최대 DAU")).toBeInTheDocument();
    expect(screen.getByText("12,100명 · 2026.06.22")).toBeInTheDocument();
    expect(screen.getByText("누적 활성 회원·일")).toBeInTheDocument();
    expect(screen.getByText("57,600")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "DAU 추이" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "날짜별 DAU 상세" }),
    ).toBeInTheDocument();

    expect(screen.queryByText("평균 체류 시간")).not.toBeInTheDocument();
    expect(screen.queryByText("신규 방문")).not.toBeInTheDocument();
    expect(screen.queryByText("재방문")).not.toBeInTheDocument();
    expect(screen.queryByText("재방문율")).not.toBeInTheDocument();
    expect(screen.queryByText("가입 전환")).not.toBeInTheDocument();
  });

  it("filters table data based on search queries", () => {
    render(<StatisticsPage />);

    const searchInput = screen.getByPlaceholderText("데이터 검색...");
    expect(screen.getByText("2026.06.22")).toBeInTheDocument();
    expect(screen.getByText("2026.06.21")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "06.22" } });
    
    expect(screen.getByText("2026.06.22")).toBeInTheDocument();
    expect(screen.queryByText("2026.06.21")).not.toBeInTheDocument();

    // Type a query that yields no results
    fireEvent.change(searchInput, { target: { value: "invalid-query" } });
    expect(screen.getByText("검색 결과가 없습니다.")).toBeInTheDocument();
  });

  it("updates view when clicking different categories", () => {
    render(<StatisticsPage />);

    const diaryTab = screen.getByRole("button", { name: "일기 생성" });
    fireEvent.click(diaryTab);

    // Header updates
    expect(screen.getByRole("heading", { name: "일기 생성 추이" })).toBeInTheDocument();
    
    // KPIs update
    expect(screen.getByText("총 생성 일기 (7일)")).toBeInTheDocument();
    expect(screen.getByText("8,924")).toBeInTheDocument();
  });

  it("updates view and dates when clicking different ranges", () => {
    render(<StatisticsPage />);

    // Toggle to 30 days
    const range30dButton = screen.getByRole("button", { name: "30일" });
    fireEvent.click(range30dButton);

    expect(screen.getByText("2026.05.24 - 2026.06.22")).toBeInTheDocument();
    expect(screen.getByText("30일 활성 회원 수")).toBeInTheDocument();

    // Toggle to 3 months
    const range3mButton = screen.getByRole("button", { name: "3개월" });
    fireEvent.click(range3mButton);

    expect(screen.getByText("2026.03.25 - 2026.06.22")).toBeInTheDocument();
    expect(screen.getByText("3개월 활성 회원 수")).toBeInTheDocument();
  });

  it("triggers CSV download when clicking CSV 다운로드 button", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    
    render(<StatisticsPage />);

    const downloadButton = screen.getByRole("button", { name: "CSV 파일 다운로드" });
    fireEvent.click(downloadButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });
});
