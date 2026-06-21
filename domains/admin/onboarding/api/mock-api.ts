import { ADMIN_ROLE } from "@/shared/api/admin-auth/contracts";

import type { OnboardingApi } from "./contracts";

const MOCK_MANUAL_ENTRY_KEY = "JBSWY3DPEHPK3PXP";

const MOCK_QR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 210">
  <rect width="210" height="210" fill="#fff"/>
  <g fill="#172033">
    <path d="M10 10h60v60H10zm10 10v40h40V20zm10 10h20v20H30z"/>
    <path d="M140 10h60v60h-60zm10 10v40h40V20zm10 10h20v20h-20z"/>
    <path d="M10 140h60v60H10zm10 10v40h40v-40zm10 10h20v20H30z"/>
    <path d="M85 10h10v20H85zm20 0h20v10h-20zM80 40h20v10H80zm30-10h10v30h-10zM80 70h10v20H80zm20-10h30v10h-30zM90 90h20v20H90zm30-10h20v10h-20zM70 110h20v10H70zm40 10h20v20h-20zM140 90h20v10h-20zm20 20h30v10h-30zM80 140h20v20H80zm30 10h10v40h-10zM130 130h20v10h-20zm20 20h40v10h-40zM130 170h20v20h-20zm30 0h10v30h-10zm20 10h20v10h-20z"/>
  </g>
</svg>`;

const MOCK_QR_DATA_URL = `data:image/svg+xml,${encodeURIComponent(MOCK_QR_SVG)}`;

export function createMockOnboardingApi({ delay = 180 }: { delay?: number } = {}): OnboardingApi {
  const wait = () => new Promise<void>((resolve) => setTimeout(resolve, delay));

  return {
    initializeCsrf: wait,
    async temporaryLogin() {
      await wait();
    },
    async updateCredentials() {
      await wait();
    },
    async startOtpRegistration() {
      await wait();
      return {
        qrCodeDataUrl: MOCK_QR_DATA_URL,
        manualEntryKey: MOCK_MANUAL_ENTRY_KEY,
      };
    },
    async verifyOtp() {
      await wait();
      return {
        nickname: "Pikume 관리자",
        role: ADMIN_ROLE.SUPER_ADMIN,
      };
    },
  };
}
