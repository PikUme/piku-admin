import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ActiveUserDailyPoint } from "../model/active-user-data";
import { DauLineChart } from "./dau-line-chart";

const points: ActiveUserDailyPoint[] = [
  {
    date: "2026-06-20",
    dau: 100,
    changeCount: 10,
    changeRate: 11.1,
  },
  {
    date: "2026-06-21",
    dau: 120,
    changeCount: 20,
    changeRate: 20,
  },
  {
    date: "2026-06-22",
    dau: 180,
    changeCount: 60,
    changeRate: 50,
  },
];

describe("DauLineChart", () => {
  it("exposes each daily point to keyboard users and marks the peak", () => {
    render(<DauLineChart points={points} peakDate="2026-06-22" />);

    expect(
      screen.getByRole("img", { name: "일별 DAU 선 차트" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "2026.06.21 DAU 120명" }),
    ).toBeInTheDocument();

    const peakPoint = screen.getByRole("button", {
      name: "2026.06.22 DAU 180명, 최대 DAU",
    });
    fireEvent.focus(peakPoint);

    expect(screen.getByText("2026.06.22")).toBeInTheDocument();
    expect(screen.getByText("DAU 180명")).toBeInTheDocument();
  });

  it("renders valid geometry when every DAU value is zero", () => {
    const zeroPoints: ActiveUserDailyPoint[] = points.map((point) => ({
      ...point,
      dau: 0,
    }));

    const { container } = render(
      <DauLineChart points={zeroPoints} peakDate="2026-06-22" />,
    );

    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    expect(
      screen.getByRole("button", {
        name: "2026.06.22 DAU 0명, 최대 DAU",
      }),
    ).toBeInTheDocument();
  });
});
