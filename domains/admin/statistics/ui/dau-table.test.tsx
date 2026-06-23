import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import type { ActiveUserDailyPoint } from "../model/active-user-data";
import { DauTable } from "./dau-table";

const points: ActiveUserDailyPoint[] = [
  {
    date: "2026-06-19",
    dau: 120,
    changeCount: 120,
    changeRate: null,
  },
  {
    date: "2026-06-20",
    dau: 240,
    changeCount: 120,
    changeRate: 100,
  },
  {
    date: "2026-06-21",
    dau: 210,
    changeCount: -30,
    changeRate: -12.5,
  },
  {
    date: "2026-06-22",
    dau: 210,
    changeCount: 0,
    changeRate: 0,
  },
];

describe("DauTable", () => {
  it("renders newest-first daily changes with explicit signs", () => {
    render(
      <DauTable
        points={points}
        peakDate="2026-06-20"
        searchQuery=""
        onSearchChange={() => {}}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "날짜" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "DAU" })).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "전일 대비" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "전일 대비율" }),
    ).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("2026.06.22")).toBeInTheDocument();
    expect(screen.getAllByText("+120명")).toHaveLength(2);
    expect(screen.getByText("-30명")).toBeInTheDocument();
    expect(screen.getByText("0명")).toBeInTheDocument();
    expect(screen.getByText("+100.0%")).toBeInTheDocument();
    expect(screen.getByText("-12.5%")).toBeInTheDocument();
    expect(screen.getByText("신규")).toBeInTheDocument();
  });

  it("finds a date with ISO, dotted, or month-day input", async () => {
    const user = userEvent.setup();

    function SearchableTable() {
      const [query, setQuery] = useState("");
      return (
        <DauTable
          points={points}
          peakDate="2026-06-20"
          searchQuery={query}
          onSearchChange={setQuery}
        />
      );
    }

    render(<SearchableTable />);
    const search = screen.getByRole("searchbox", { name: "DAU 날짜 검색" });

    await user.type(search, "2026-06-22");
    expect(screen.getByText("2026.06.22")).toBeInTheDocument();
    expect(screen.queryByText("2026.06.21")).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "2026.06.22");
    expect(screen.getByText("2026.06.22")).toBeInTheDocument();
    expect(screen.queryByText("2026.06.21")).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "06.22");
    expect(screen.getByText("2026.06.22")).toBeInTheDocument();
    expect(screen.queryByText("2026.06.21")).not.toBeInTheDocument();
  });
});
