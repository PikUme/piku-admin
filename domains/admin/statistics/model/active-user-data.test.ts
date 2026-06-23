import { describe, expect, it } from "vitest";

import {
  ACTIVE_USER_DATA,
  createActiveUserStatisticsData,
} from "./active-user-data";

describe("active user statistics data", () => {
  it("provides completed KST date ranges with one point per day", () => {
    expect(ACTIVE_USER_DATA["7d"].startDate).toBe("2026-06-16");
    expect(ACTIVE_USER_DATA["7d"].endDate).toBe("2026-06-22");
    expect(ACTIVE_USER_DATA["7d"].daily).toHaveLength(7);

    expect(ACTIVE_USER_DATA["30d"].startDate).toBe("2026-05-24");
    expect(ACTIVE_USER_DATA["30d"].endDate).toBe("2026-06-22");
    expect(ACTIVE_USER_DATA["30d"].daily).toHaveLength(30);

    expect(ACTIVE_USER_DATA["3m"].startDate).toBe("2026-03-25");
    expect(ACTIVE_USER_DATA["3m"].endDate).toBe("2026-06-22");
    expect(ACTIVE_USER_DATA["3m"].daily).toHaveLength(90);
  });

  it("derives accumulated member-days and average DAU from daily values", () => {
    const sevenDay = ACTIVE_USER_DATA["7d"];
    const expectedMemberDays = sevenDay.daily.reduce(
      (sum, point) => sum + point.dau,
      0,
    );

    expect(sevenDay.summary.activeMemberDays).toBe(expectedMemberDays);
    expect(sevenDay.summary.averageDau).toBe(
      Math.round(expectedMemberDays / sevenDay.daily.length),
    );
  });

  it("calculates daily changes from the previous KST date", () => {
    const data = createActiveUserStatisticsData({
      range: "7d",
      startDate: "2026-06-16",
      values: [0, 120, 90],
      previousDau: 100,
      uniqueActiveMemberCount: 180,
      uniqueActiveMemberChangeRate: 5,
      averageDauChangeRate: 2,
      activeMemberDaysChangeRate: 3,
    });

    expect(data.daily).toEqual([
      {
        date: "2026-06-16",
        dau: 0,
        changeCount: -100,
        changeRate: -100,
      },
      {
        date: "2026-06-17",
        dau: 120,
        changeCount: 120,
        changeRate: null,
      },
      {
        date: "2026-06-18",
        dau: 90,
        changeCount: -30,
        changeRate: -25,
      },
    ]);
  });

  it("uses the most recent date when the peak DAU is tied", () => {
    const data = createActiveUserStatisticsData({
      range: "7d",
      startDate: "2026-06-16",
      values: [100, 200, 200],
      previousDau: 80,
      uniqueActiveMemberCount: 240,
      uniqueActiveMemberChangeRate: null,
      averageDauChangeRate: null,
      activeMemberDaysChangeRate: null,
    });

    expect(data.summary.peakDau).toBe(200);
    expect(data.summary.peakDate).toBe("2026-06-18");
  });
});
