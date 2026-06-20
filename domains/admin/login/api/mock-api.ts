import type { LoginApi } from "./contracts";

export function createMockLoginApi({ delay = 180 }: { delay?: number } = {}): LoginApi {
  let loginId = "admin_1";
  const wait = () => new Promise<void>((resolve) => setTimeout(resolve, delay));

  return {
    initializeCsrf: wait,
    async login(input) {
      await wait();
      loginId = input.loginId;
      return {
        nextStep: "VERIFY_OTP",
        loginId,
        nickname: "Pikume 관리자",
        email: "admin@pikume.example",
        role: "SUPER_ADMIN",
      };
    },
    async verifyOtp() {
      await wait();
      return {
        authenticated: true,
        admin: {
          loginId,
          nickname: "Pikume 관리자",
          email: "admin@pikume.example",
          role: "SUPER_ADMIN",
        },
      };
    },
  };
}
