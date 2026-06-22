export interface DashboardKeyMetrics {
  currentCumulativeMemberCount: number;
  cumulativeMemberCountSevenDaysAgo: number;
  recent30DayActiveUserCount: number;
  previous30DayActiveUserCount: number;
  currentAiPhotoSuccessCount: number;
  aiPhotoSuccessCountSevenDaysAgo: number;
  currentDiaryCreationCount: number;
  diaryCreationCountSevenDaysAgo: number;
}

export interface DailyActiveUserPoint {
  date: string; // YYYY-MM-DD
  dau: number;
}

export interface AiPhotoGenerationStats {
  successCount: number;
  failureCount: number;
}

export interface WeeklyActivityPoint {
  periodStartDate: string; // YYYY-MM-DD
  periodEndDate: string;   // YYYY-MM-DD
  newMemberCount: number;
  diaryCreationCount: number;
}

export interface DailySummaryPoint {
  date: string; // YYYY-MM-DD
  newMemberCount: number;
  dau: number;
  diaryCreationCount: number;
  aiPhotoRequestCount: number;
}

export interface DashboardData {
  keyMetrics: DashboardKeyMetrics;
  dailyActiveUsers: DailyActiveUserPoint[];
  aiPhotoGeneration: AiPhotoGenerationStats;
  weeklyActivity: WeeklyActivityPoint[];
  dailySummary: DailySummaryPoint[];
}

export interface DashboardApi {
  getDashboardData(): Promise<DashboardData>;
}
