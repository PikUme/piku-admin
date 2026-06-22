export type MetricKind = "members" | "active" | "images" | "diaries";

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  kind: MetricKind;
  trend?: string;
}

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "누적 가입 회원",
    value: "124,592",
    detail: "지난주 대비",
    trend: "+1.2%",
    kind: "members",
  },
  {
    label: "월간 활성 사용자 (MAU)",
    value: "45,210",
    detail: "지난달 대비",
    trend: "+4.8%",
    kind: "active",
  },
  {
    label: "누적 생성된 AI 사진",
    value: "892,104",
    detail: "지난주 대비",
    trend: "+12.4%",
    kind: "images",
  },
  {
    label: "누적 일기 작성 수",
    value: "542,109",
    detail: "지난주 대비",
    trend: "+12.5%",
    kind: "diaries",
  },
];

export const dailyActiveUsers = [
  { label: "5/14", value: 5100 },
  { label: "5/15", value: 6000 },
  { label: "5/16", value: 7800 },
  { label: "5/17", value: 6900 },
  { label: "5/18", value: 10300 },
  { label: "5/19", value: 9400 },
  { label: "5/20", value: 12100 },
];

export const weeklyActivity = [
  { label: "1주", newUsers: 340, diaries: 560 },
  { label: "2주", newUsers: 410, diaries: 460 },
  { label: "3주", newUsers: 680, diaries: 890 },
  { label: "4주", newUsers: 590, diaries: 760 },
];

export type IssueTone = "danger" | "success" | "warning" | "info";

export interface DashboardIssue {
  title: string;
  description: string;
  time: string;
  tone: IssueTone;
}

export const dashboardIssues: DashboardIssue[] = [
  {
    title: "API Timeout (Image Gen)",
    description: "Node-3 failed to respond within 30s.",
    time: "10 mins ago",
    tone: "danger",
  },
  {
    title: "System Backup Complete",
    description: "Daily DB snapshot successful.",
    time: "2 hrs ago",
    tone: "success",
  },
  {
    title: "High CPU Usage",
    description: "Worker server load at 85%.",
    time: "5 hrs ago",
    tone: "warning",
  },
  {
    title: "New Admin Access",
    description: "User 'jdoe' granted Read-Only access.",
    time: "1 day ago",
    tone: "info",
  },
];

export type RowStatus = "Processing" | "Closed";

export interface DailySummaryRow {
  date: string;
  newUsers: string;
  activeUsers: string;
  diariesCreated: string;
  aiRequests: string;
  status: RowStatus;
}

export const dailySummaryRows: DailySummaryRow[] = [
  {
    date: "2024-05-20",
    newUsers: "412",
    activeUsers: "14,205",
    diariesCreated: "8,901",
    aiRequests: "12,402",
    status: "Processing",
  },
  {
    date: "2024-05-19",
    newUsers: "589",
    activeUsers: "16,890",
    diariesCreated: "10,245",
    aiRequests: "15,670",
    status: "Closed",
  },
  {
    date: "2024-05-18",
    newUsers: "620",
    activeUsers: "18,200",
    diariesCreated: "11,500",
    aiRequests: "17,200",
    status: "Closed",
  },
  {
    date: "2024-05-17",
    newUsers: "450",
    activeUsers: "15,100",
    diariesCreated: "9,200",
    aiRequests: "13,800",
    status: "Closed",
  },
];
