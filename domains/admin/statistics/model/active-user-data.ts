import type { TimeRange } from "./statistics-data";

export interface ActiveUserDailyPoint {
  date: string;
  dau: number;
  changeCount: number;
  changeRate: number | null;
}

export interface ActiveUserStatisticsData {
  range: TimeRange;
  timeZone: "Asia/Seoul";
  startDate: string;
  endDate: string;
  summary: {
    uniqueActiveMemberCount: number;
    uniqueActiveMemberChangeRate: number | null;
    averageDau: number;
    averageDauChangeRate: number | null;
    peakDau: number;
    peakDate: string | null;
    activeMemberDays: number;
    activeMemberDaysChangeRate: number | null;
  };
  daily: ActiveUserDailyPoint[];
}

interface CreateActiveUserStatisticsDataOptions {
  range: TimeRange;
  startDate: string;
  values: number[];
  previousDau: number;
  uniqueActiveMemberCount: number;
  uniqueActiveMemberChangeRate: number | null;
  averageDauChangeRate: number | null;
  activeMemberDaysChangeRate: number | null;
}

function addDays(date: string, offset: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}

function calculateChangeRate(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function createActiveUserStatisticsData({
  range,
  startDate,
  values,
  previousDau,
  uniqueActiveMemberCount,
  uniqueActiveMemberChangeRate,
  averageDauChangeRate,
  activeMemberDaysChangeRate,
}: CreateActiveUserStatisticsDataOptions): ActiveUserStatisticsData {
  let priorDau = previousDau;
  let peakDau = 0;
  let peakDate: string | null = null;

  const daily = values.map((dau, index) => {
    const date = addDays(startDate, index);
    const point = {
      date,
      dau,
      changeCount: dau - priorDau,
      changeRate: calculateChangeRate(dau, priorDau),
    };

    if (peakDate === null || dau >= peakDau) {
      peakDau = dau;
      peakDate = date;
    }

    priorDau = dau;
    return point;
  });

  const activeMemberDays = daily.reduce((sum, point) => sum + point.dau, 0);

  return {
    range,
    timeZone: "Asia/Seoul",
    startDate,
    endDate: daily.at(-1)?.date ?? startDate,
    summary: {
      uniqueActiveMemberCount,
      uniqueActiveMemberChangeRate,
      averageDau:
        daily.length === 0 ? 0 : Math.round(activeMemberDays / daily.length),
      averageDauChangeRate,
      peakDau,
      peakDate,
      activeMemberDays,
      activeMemberDaysChangeRate,
    },
    daily,
  };
}

const sevenDayValues = [5_100, 6_000, 7_800, 6_900, 10_300, 9_400, 12_100];

const thirtyDayValues = Array.from({ length: 30 }, (_, index) => {
  const weekdayLift = index % 7 === 5 || index % 7 === 6 ? 1_050 : 0;
  return 7_200 + ((index * 977) % 4_200) + weekdayLift;
});

const ninetyDayValues = Array.from({ length: 90 }, (_, index) => {
  const growth = Math.floor(index * 34);
  const cycle = (index * 613) % 3_800;
  const weekendLift = index % 7 === 5 || index % 7 === 6 ? 900 : 0;
  return 5_600 + growth + cycle + weekendLift;
});

export const ACTIVE_USER_DATA: Record<TimeRange, ActiveUserStatisticsData> = {
  "7d": createActiveUserStatisticsData({
    range: "7d",
    startDate: "2026-06-16",
    values: sevenDayValues,
    previousDau: 4_850,
    uniqueActiveMemberCount: 32_940,
    uniqueActiveMemberChangeRate: 12.5,
    averageDauChangeRate: 4.2,
    activeMemberDaysChangeRate: 4.2,
  }),
  "30d": createActiveUserStatisticsData({
    range: "30d",
    startDate: "2026-05-24",
    values: thirtyDayValues,
    previousDau: 7_450,
    uniqueActiveMemberCount: 83_420,
    uniqueActiveMemberChangeRate: 8.4,
    averageDauChangeRate: 2.1,
    activeMemberDaysChangeRate: 2.1,
  }),
  "3m": createActiveUserStatisticsData({
    range: "3m",
    startDate: "2026-03-25",
    values: ninetyDayValues,
    previousDau: 5_250,
    uniqueActiveMemberCount: 176_880,
    uniqueActiveMemberChangeRate: 15.3,
    averageDauChangeRate: -1.8,
    activeMemberDaysChangeRate: -1.8,
  }),
};
