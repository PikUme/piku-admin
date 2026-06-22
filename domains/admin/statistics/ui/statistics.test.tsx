import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatisticsPage } from "./statistics";

// Mock window.URL.createObjectURL and HTMLAnchorElement click
const mockCreateObjectURL = vi.fn(() => "blob:url");
const mockRevokeObjectURL = vi.fn();
window.URL.createObjectURL = mockCreateObjectURL;
window.URL.revokeObjectURL = mockRevokeObjectURL;

describe("StatisticsPage", () => {
  it("renders the statistics console overview with layout components", () => {
    render(<StatisticsPage />);

    expect(screen.getByRole("navigation", { name: "관리자 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Statistics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "통계 상세" })).toBeInTheDocument();
    
    // KPI Cards check
    expect(screen.getByText("총 방문자 (7일)")).toBeInTheDocument();
    expect(screen.getByText("14,208")).toBeInTheDocument();
    expect(screen.getByText("평균 DAU")).toBeInTheDocument();
    expect(screen.getByText("2,029")).toBeInTheDocument();
    expect(screen.getByText("최대 피크 일자")).toBeInTheDocument();
    expect(screen.getByText("10월 5일 (목)")).toBeInTheDocument();
    expect(screen.getByText("평균 체류 시간")).toBeInTheDocument();
    expect(screen.getByText("04:12")).toBeInTheDocument();
  });

  it("filters table data based on search queries", () => {
    render(<StatisticsPage />);

    const searchInput = screen.getByPlaceholderText("데이터 검색...");
    expect(screen.getByText("2023.10.07")).toBeInTheDocument();
    expect(screen.getByText("2023.10.06")).toBeInTheDocument();

    // Type query to filter only October 7th
    fireEvent.change(searchInput, { target: { value: "10.07" } });
    
    expect(screen.getByText("2023.10.07")).toBeInTheDocument();
    expect(screen.queryByText("2023.10.06")).not.toBeInTheDocument();

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

    expect(screen.getByText("2023.09.08 - 2023.10.07")).toBeInTheDocument();
    expect(screen.getByText("총 방문자 (30일)")).toBeInTheDocument();

    // Toggle to 3 months
    const range3mButton = screen.getByRole("button", { name: "3개월" });
    fireEvent.click(range3mButton);

    expect(screen.getByText("2023.07.08 - 2023.10.07")).toBeInTheDocument();
    expect(screen.getByText("총 방문자 (3개월)")).toBeInTheDocument();
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
