export interface KPICardData {
  label: string;
  value: string;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconKind: "users" | "chart" | "calendar" | "clock";
}

export interface ChartDataPoint {
  label: string;
  primary: number;   // e.g., New visitors, New signups, Normal diaries, Successful photos
  secondary: number; // e.g., Re-visitors, Re-signups, Special diaries, Failed photos
}

export interface TableRowData {
  date: string;
  col1: string; // Dynamic depending on tab
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  isPeak?: boolean;
}

export interface TabData {
  kpis: KPICardData[];
  chartData: ChartDataPoint[];
  tableData: TableRowData[];
  chartTitle: string;
  tableTitle: string;
  columns: string[];
}

export type TimeRange = "7d" | "30d" | "3m";
export type TabKind = "active" | "member" | "diary" | "photo";
export type LegacyTabKind = Exclude<TabKind, "active">;

export const STATISTICS_DATA: Record<
  LegacyTabKind,
  Record<TimeRange, TabData>
> = {
  member: {
    "7d": {
      chartTitle: "신규 가입 추이",
      tableTitle: "일자별 가입 상세",
      columns: ["날짜", "신규 가입자", "이메일 가입", "소셜 가입", "이탈률", "프로필 설정 완료"],
      kpis: [
        { label: "총 신규 가입 (7일)", value: "1,107", trend: { value: "18.2%", isPositive: true }, iconKind: "users" },
        { label: "일평균 가입", value: "158", trend: { value: "6.5%", isPositive: true }, iconKind: "chart" },
        { label: "최고 가입일", value: "10월 5일 (목)", iconKind: "calendar" },
        { label: "프로필 완료율", value: "88.4%", trend: { value: "2.4%", isPositive: true }, iconKind: "clock" },
      ],
      chartData: [
        { label: "10.01", primary: 40, secondary: 20 },
        { label: "10.02", primary: 80, secondary: 30 },
        { label: "10.03", primary: 120, secondary: 60 },
        { label: "10.04", primary: 70, secondary: 28 },
        { label: "10.05", primary: 220, secondary: 81 },
        { label: "10.06", primary: 150, secondary: 65 },
        { label: "10.07", primary: 95, secondary: 47 },
      ],
      tableData: [
        { date: "2023.10.07", col1: "142", col2: "95", col3: "47", col4: "12.3%", col5: "128" },
        { date: "2023.10.06", col1: "215", col2: "150", col3: "65", col4: "9.5%", col5: "198" },
        { date: "2023.10.05", col1: "301", col2: "220", col3: "81", col4: "8.2%", col5: "275", isPeak: true },
        { date: "2023.10.04", col1: "98", col2: "70", col3: "28", col4: "14.5%", col5: "85" },
        { date: "2023.10.03", col1: "180", col2: "120", col3: "60", col4: "11.2%", col5: "160" },
        { date: "2023.10.02", col1: "110", col2: "80", col3: "30", col4: "13.4%", col5: "95" },
        { date: "2023.10.01", col1: "60", col2: "40", col3: "20", col4: "15.0%", col5: "50" },
      ],
    },
    "30d": {
      chartTitle: "신규 가입 추이 (최근 30일)",
      tableTitle: "일자별 가입 상세 (30일)",
      columns: ["날짜", "신규 가입자", "이메일 가입", "소셜 가입", "이탈률", "프로필 설정 완료"],
      kpis: [
        { label: "총 신규 가입 (30일)", value: "4,820", trend: { value: "11.2%", isPositive: true }, iconKind: "users" },
        { label: "일평균 가입", value: "160", trend: { value: "3.4%", isPositive: true }, iconKind: "chart" },
        { label: "최고 가입일", value: "9월 28일 (금)", iconKind: "calendar" },
        { label: "프로필 완료율", value: "87.9%", trend: { value: "1.1%", isPositive: true }, iconKind: "clock" },
      ],
      chartData: Array.from({ length: 15 }).map((_, i) => ({
        label: `09.${16 + i}`,
        primary: Math.floor(80 + Math.random() * 120),
        secondary: Math.floor(30 + Math.random() * 50),
      })),
      tableData: Array.from({ length: 30 }).map((_, i) => {
        const primary = Math.floor(80 + Math.random() * 120);
        const secondary = Math.floor(30 + Math.random() * 50);
        const total = primary + secondary;
        const failRate = (5 + Math.random() * 10).toFixed(1) + "%";
        const completed = Math.floor(total * 0.9);
        const date = `2023.09.${(30 - i).toString().padStart(2, "0")}`;
        return {
          date,
          col1: total.toLocaleString(),
          col2: primary.toLocaleString(),
          col3: secondary.toLocaleString(),
          col4: failRate,
          col5: completed.toLocaleString(),
          isPeak: i === 12,
        };
      }),
    },
    "3m": {
      chartTitle: "신규 가입 추이 (최근 3개월)",
      tableTitle: "일자별 가입 상세 (3개월)",
      columns: ["날짜", "신규 가입자", "이메일 가입", "소셜 가입", "이탈률", "프로필 설정 완료"],
      kpis: [
        { label: "총 신규 가입 (3개월)", value: "15,840", trend: { value: "22.5%", isPositive: true }, iconKind: "users" },
        { label: "주평균 가입", value: "1,218", trend: { value: "8.4%", isPositive: true }, iconKind: "chart" },
        { label: "최고 가입일", value: "8월 14일 (월)", iconKind: "calendar" },
        { label: "프로필 완료율", value: "88.1%", trend: { value: "0.5%", isPositive: false }, iconKind: "clock" },
      ],
      chartData: Array.from({ length: 12 }).map((_, i) => ({
        label: `W${i + 1}`,
        primary: Math.floor(800 + Math.random() * 400),
        secondary: Math.floor(300 + Math.random() * 200),
      })),
      tableData: Array.from({ length: 90 }).map((_, i) => {
        const primary = Math.floor(80 + Math.random() * 120);
        const secondary = Math.floor(30 + Math.random() * 50);
        const total = primary + secondary;
        const failRate = (5 + Math.random() * 10).toFixed(1) + "%";
        const completed = Math.floor(total * 0.9);
        const day = (i % 28) + 1;
        const month = 10 - Math.floor(i / 28);
        const date = `2023.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")}`;
        return {
          date,
          col1: total.toLocaleString(),
          col2: primary.toLocaleString(),
          col3: secondary.toLocaleString(),
          col4: failRate,
          col5: completed.toLocaleString(),
          isPeak: i === 45,
        };
      }),
    },
  },
  diary: {
    "7d": {
      chartTitle: "일기 생성 추이",
      tableTitle: "일자별 일기 생성 상세",
      columns: ["날짜", "총 생성 수", "텍스트 일기", "사진 첨부 일기", "평균 글자 수", "완료율"],
      kpis: [
        { label: "총 생성 일기 (7일)", value: "8,924", trend: { value: "14.8%", isPositive: true }, iconKind: "users" },
        { label: "일평균 생성", value: "1,274", trend: { value: "3.7%", isPositive: true }, iconKind: "chart" },
        { label: "최고 생성일", value: "10월 6일 (금)", iconKind: "calendar" },
        { label: "작성 완료율", value: "94.2%", trend: { value: "0.8%", isPositive: true }, iconKind: "clock" },
      ],
      chartData: [
        { label: "10.01", primary: 350, secondary: 450 },
        { label: "10.02", primary: 400, secondary: 550 },
        { label: "10.03", primary: 600, secondary: 780 },
        { label: "10.04", primary: 480, secondary: 610 },
        { label: "10.05", primary: 750, secondary: 980 },
        { label: "10.06", primary: 890, secondary: 1100 },
        { label: "10.07", primary: 450, secondary: 534 },
      ],
      tableData: [
        { date: "2023.10.07", col1: "984", col2: "450", col3: "534", col4: "342자", col5: "93.8%" },
        { date: "2023.10.06", col1: "1,990", col2: "890", col3: "1,100", col4: "389자", col5: "95.4%", isPeak: true },
        { date: "2023.10.05", col1: "1,730", col2: "750", col3: "980", col4: "372자", col5: "94.6%" },
        { date: "2023.10.04", col1: "1,090", col2: "480", col3: "610", col4: "310자", col5: "92.1%" },
        { date: "2023.10.03", col1: "1,380", col2: "600", col3: "780", col4: "354자", col5: "94.1%" },
        { date: "2023.10.02", col1: "950", col2: "400", col3: "550", col4: "298자", col5: "92.7%" },
        { date: "2023.10.01", col1: "800", col2: "350", col3: "450", col4: "284자", col5: "91.8%" },
      ],
    },
    "30d": {
      chartTitle: "일기 생성 추이 (최근 30일)",
      tableTitle: "일자별 일기 생성 상세 (30일)",
      columns: ["날짜", "총 생성 수", "텍스트 일기", "사진 첨부 일기", "평균 글자 수", "완료율"],
      kpis: [
        { label: "총 생성 일기 (30일)", value: "39,450", trend: { value: "11.2%", isPositive: true }, iconKind: "users" },
        { label: "일평균 생성", value: "1,315", trend: { value: "2.4%", isPositive: true }, iconKind: "chart" },
        { label: "최고 생성일", value: "9월 28일 (금)", iconKind: "calendar" },
        { label: "작성 완료율", value: "93.8%", trend: { value: "0.2%", isPositive: false }, iconKind: "clock" },
      ],
      chartData: Array.from({ length: 15 }).map((_, i) => ({
        label: `09.${16 + i}`,
        primary: Math.floor(500 + Math.random() * 500),
        secondary: Math.floor(600 + Math.random() * 600),
      })),
      tableData: Array.from({ length: 30 }).map((_, i) => {
        const primary = Math.floor(500 + Math.random() * 500);
        const secondary = Math.floor(600 + Math.random() * 600);
        const total = primary + secondary;
        const avgWords = Math.floor(250 + Math.random() * 150) + "자";
        const completeRate = (90 + Math.random() * 8).toFixed(1) + "%";
        const date = `2023.09.${(30 - i).toString().padStart(2, "0")}`;
        return {
          date,
          col1: total.toLocaleString(),
          col2: primary.toLocaleString(),
          col3: secondary.toLocaleString(),
          col4: avgWords,
          col5: completeRate,
          isPeak: i === 12,
        };
      }),
    },
    "3m": {
      chartTitle: "일기 생성 추이 (최근 3개월)",
      tableTitle: "일자별 일기 생성 상세 (3개월)",
      columns: ["날짜", "총 생성 수", "텍스트 일기", "사진 첨부 일기", "평균 글자 수", "완료율"],
      kpis: [
        { label: "총 생성 일기 (3개월)", value: "122,400", trend: { value: "19.5%", isPositive: true }, iconKind: "users" },
        { label: "주평균 생성", value: "9,415", trend: { value: "6.8%", isPositive: true }, iconKind: "chart" },
        { label: "최고 생성일", value: "8월 14일 (월)", iconKind: "calendar" },
        { label: "작성 완료율", value: "93.9%", trend: { value: "0.5%", isPositive: true }, iconKind: "clock" },
      ],
      chartData: Array.from({ length: 12 }).map((_, i) => ({
        label: `W${i + 1}`,
        primary: Math.floor(4000 + Math.random() * 2000),
        secondary: Math.floor(5000 + Math.random() * 3000),
      })),
      tableData: Array.from({ length: 90 }).map((_, i) => {
        const primary = Math.floor(500 + Math.random() * 500);
        const secondary = Math.floor(600 + Math.random() * 600);
        const total = primary + secondary;
        const avgWords = Math.floor(250 + Math.random() * 150) + "자";
        const completeRate = (90 + Math.random() * 8).toFixed(1) + "%";
        const day = (i % 28) + 1;
        const month = 10 - Math.floor(i / 28);
        const date = `2023.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")}`;
        return {
          date,
          col1: total.toLocaleString(),
          col2: primary.toLocaleString(),
          col3: secondary.toLocaleString(),
          col4: avgWords,
          col5: completeRate,
          isPeak: i === 45,
        };
      }),
    },
  },
  photo: {
    "7d": {
      chartTitle: "AI 사진 생성 건수",
      tableTitle: "일자별 사진 생성 상세",
      columns: ["날짜", "총 요청 수", "성공 건수", "실패 건수", "성공률", "평균 생성 시간"],
      kpis: [
        { label: "총 생성 사진 (7일)", value: "54,209", trend: { value: "24.1%", isPositive: true }, iconKind: "users" },
        { label: "일평균 생성", value: "7,744", trend: { value: "11.2%", isPositive: true }, iconKind: "chart" },
        { label: "최고 생성일", value: "10월 5일 (목)", iconKind: "calendar" },
        { label: "평균 소요 시간", value: "5.4초", trend: { value: "4.8%", isPositive: false }, iconKind: "clock" },
      ],
      chartData: [
        { label: "10.01", primary: 3800, secondary: 200 },
        { label: "10.02", primary: 4600, secondary: 300 },
        { label: "10.03", primary: 7200, secondary: 400 },
        { label: "10.04", primary: 5800, secondary: 250 },
        { label: "10.05", primary: 12400, secondary: 600 },
        { label: "10.06", primary: 9800, secondary: 450 },
        { label: "10.07", primary: 7900, secondary: 709 },
      ],
      tableData: [
        { date: "2023.10.07", col1: "8,609", col2: "7,900", col3: "709", col4: "91.8%", col5: "6.1초" },
        { date: "2023.10.06", col1: "10,250", col2: "9,800", col3: "450", col4: "95.6%", col5: "5.5초" },
        { date: "2023.10.05", col1: "13,000", col2: "12,400", col3: "600", col4: "95.4%", col5: "5.3초", isPeak: true },
        { date: "2023.10.04", col1: "6,050", col2: "5,800", col3: "250", col4: "95.9%", col5: "5.1초" },
        { date: "2023.10.03", col1: "7,600", col2: "7,200", col3: "400", col4: "94.7%", col5: "5.4초" },
        { date: "2023.10.02", col1: "4,900", col2: "4,600", col3: "300", col4: "93.9%", col5: "5.7초" },
        { date: "2023.10.01", col1: "4,000", col2: "3800", col3: "200", col4: "95.0%", col5: "5.8초" },
      ],
    },
    "30d": {
      chartTitle: "AI 사진 생성 건수 (최근 30일)",
      tableTitle: "일자별 사진 생성 상세 (30일)",
      columns: ["날짜", "총 요청 수", "성공 건수", "실패 건수", "성공률", "평균 생성 시간"],
      kpis: [
        { label: "총 생성 사진 (30일)", value: "220,450", trend: { value: "19.5%", isPositive: true }, iconKind: "users" },
        { label: "일평균 생성", value: "7,348", trend: { value: "5.6%", isPositive: true }, iconKind: "chart" },
        { label: "최고 생성일", value: "9월 28일 (금)", iconKind: "calendar" },
        { label: "평균 소요 시간", value: "5.6초", trend: { value: "1.2%", isPositive: false }, iconKind: "clock" },
      ],
      chartData: Array.from({ length: 15 }).map((_, i) => ({
        label: `09.${16 + i}`,
        primary: Math.floor(6000 + Math.random() * 4000),
        secondary: Math.floor(200 + Math.random() * 300),
      })),
      tableData: Array.from({ length: 30 }).map((_, i) => {
        const primary = Math.floor(6000 + Math.random() * 4000);
        const secondary = Math.floor(200 + Math.random() * 300);
        const total = primary + secondary;
        const successRate = ((primary / total) * 100).toFixed(1) + "%";
        const elapsed = (5.0 + Math.random() * 1.5).toFixed(1) + "초";
        const date = `2023.09.${(30 - i).toString().padStart(2, "0")}`;
        return {
          date,
          col1: total.toLocaleString(),
          col2: primary.toLocaleString(),
          col3: secondary.toLocaleString(),
          col4: successRate,
          col5: elapsed,
          isPeak: i === 12,
        };
      }),
    },
    "3m": {
      chartTitle: "AI 사진 생성 건수 (최근 3개월)",
      tableTitle: "일자별 사진 생성 상세 (3개월)",
      columns: ["날짜", "총 요청 수", "성공 건수", "실패 건수", "성공률", "평균 생성 시간"],
      kpis: [
        { label: "총 생성 사진 (3개월)", value: "680,240", trend: { value: "31.4%", isPositive: true }, iconKind: "users" },
        { label: "주평균 생성", value: "52,326", trend: { value: "12.4%", isPositive: true }, iconKind: "chart" },
        { label: "최고 생성일", value: "8월 14일 (월)", iconKind: "calendar" },
        { label: "평균 소요 시간", value: "5.7초", trend: { value: "2.1%", isPositive: false }, iconKind: "clock" },
      ],
      chartData: Array.from({ length: 12 }).map((_, i) => ({
        label: `W${i + 1}`,
        primary: Math.floor(45000 + Math.random() * 15000),
        secondary: Math.floor(2000 + Math.random() * 1500),
      })),
      tableData: Array.from({ length: 90 }).map((_, i) => {
        const primary = Math.floor(6000 + Math.random() * 4000);
        const secondary = Math.floor(200 + Math.random() * 300);
        const total = primary + secondary;
        const successRate = ((primary / total) * 100).toFixed(1) + "%";
        const elapsed = (5.0 + Math.random() * 1.5).toFixed(1) + "초";
        const day = (i % 28) + 1;
        const month = 10 - Math.floor(i / 28);
        const date = `2023.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")}`;
        return {
          date,
          col1: total.toLocaleString(),
          col2: primary.toLocaleString(),
          col3: secondary.toLocaleString(),
          col4: successRate,
          col5: elapsed,
          isPeak: i === 45,
        };
      }),
    },
  },
};
