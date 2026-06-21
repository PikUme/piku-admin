import {
  ADMIN_AUTH_NEXT_STEP,
  ADMIN_ROLE,
} from "@/shared/api/admin-auth/contracts";

import type { LoginApi } from "./contracts";

export function createMockLoginApi({ delay = 180 }: { delay?: number } = {}): LoginApi {
  const wait = () => new Promise<void>((resolve) => setTimeout(resolve, delay));

  return {
    initializeCsrf: wait,
    async login() {
      await wait();
      return {
        nextStep: ADMIN_AUTH_NEXT_STEP.VERIFY_OTP,
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
