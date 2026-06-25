export interface AdminAccount {
  id: string;
  nickname: string;
  email: string;
  role: string;
  roleLevel: string;
  status: "ACTIVE" | "LOCKED";
  otpEnabled: boolean;
  lastLogin: string;
  createdDate: string;
  department: string;
  name: string;
}

export interface AuditLogEntry {
  timestamp: string;
  actionType: string;
  details: string;
  ipAddress: string;
  result: "SUCCESS" | "FAILED";
}

export const MOCK_ADMINS: AdminAccount[] = [
  {
    id: "admin_super",
    nickname: "최고관리자",
    name: "김철수",
    email: "super@pikume.com",
    role: "Super Admin",
    roleLevel: "Super Admin (Level 5)",
    status: "ACTIVE",
    otpEnabled: true,
    lastLogin: "2023-10-24 14:30",
    createdDate: "2022-01-15",
    department: "시스템 운영팀",
  },
  {
    id: "mgr_ops_01",
    nickname: "운영팀장",
    name: "이영희",
    email: "ops01@pikume.com",
    role: "Manager",
    roleLevel: "Manager (Level 3)",
    status: "ACTIVE",
    otpEnabled: true,
    lastLogin: "2023-10-24 09:15",
    createdDate: "2022-05-20",
    department: "운영본부",
  },
  {
    id: "dev_viewer",
    nickname: "개발조회용",
    name: "박대기",
    email: "dev_v@pikume.com",
    role: "Viewer",
    roleLevel: "Viewer (Level 1)",
    status: "LOCKED",
    otpEnabled: false,
    lastLogin: "-",
    createdDate: "2023-08-11",
    department: "개발본부",
  },
  {
    id: "admin_1024",
    nickname: "최고관리자",
    name: "김철수",
    email: "admin1024@pikume.com",
    role: "Super Admin",
    roleLevel: "Super Admin (Level 5)",
    status: "ACTIVE",
    otpEnabled: true,
    lastLogin: "2023-10-27 09:15:22 KST",
    createdDate: "2022-01-15",
    department: "시스템 운영팀",
  },
];

export const MOCK_AUDIT_LOGS: Record<string, AuditLogEntry[]> = {
  admin_1024: [
    {
      timestamp: "2023-10-27 09:15:22",
      actionType: "로그인",
      details: "시스템 관리자 콘솔 로그인 성공 (OTP 인증 완료)",
      ipAddress: "192.168.1.105",
      result: "SUCCESS",
    },
    {
      timestamp: "2023-10-26 14:30:11",
      actionType: "정책 수정",
      details: "글로벌 보안 정책 업데이트 (비밀번호 만료 주기 90일 -> 60일)",
      ipAddress: "192.168.1.105",
      result: "SUCCESS",
    },
    {
      timestamp: "2023-10-26 10:05:45",
      actionType: "사용자 조회",
      details: "고객 ID 'user_8891' 상세 정보 조회 (CS 인입 건 확인)",
      ipAddress: "192.168.1.105",
      result: "SUCCESS",
    },
    {
      timestamp: "2023-10-25 18:22:01",
      actionType: "로그아웃",
      details: "시스템 관리자 콘솔 정상 로그아웃",
      ipAddress: "192.168.1.105",
      result: "SUCCESS",
    },
  ],
  admin_super: [
    {
      timestamp: "2023-10-24 14:30:00",
      actionType: "로그인",
      details: "시스템 관리자 콘솔 로그인 성공 (OTP 인증 완료)",
      ipAddress: "192.168.1.105",
      result: "SUCCESS",
    },
  ],
  mgr_ops_01: [
    {
      timestamp: "2023-10-24 09:15:00",
      actionType: "로그인",
      details: "시스템 관리자 콘솔 로그인 성공 (OTP 인증 완료)",
      ipAddress: "192.168.1.105",
      result: "SUCCESS",
    },
  ],
  dev_viewer: [],
};
