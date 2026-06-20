import type { AdminLoginChallenge, LoginInput } from "../api/contracts";

export type LoginStep = 1 | 2;
export type LoginRequestStatus =
  | "initializing"
  | "ready"
  | "submitting"
  | "failed";

export interface LoginState {
  step: LoginStep;
  status: LoginRequestStatus;
  credentials: LoginInput;
  otpCode: string;
  challenge: AdminLoginChallenge | null;
  error: string | null;
}

export const initialLoginState: LoginState = {
  step: 1,
  status: "initializing",
  credentials: { loginId: "", password: "" },
  otpCode: "",
  challenge: null,
  error: null,
};

export type LoginAction =
  | { type: "csrfSucceeded" }
  | { type: "requestStarted" }
  | { type: "requestFailed"; error: string }
  | {
      type: "credentialChanged";
      field: keyof LoginInput;
      value: string;
    }
  | { type: "otpChanged"; value: string }
  | { type: "loginSucceeded"; challenge: AdminLoginChallenge };

export function loginReducer(
  state: LoginState,
  action: LoginAction,
): LoginState {
  switch (action.type) {
    case "csrfSucceeded":
      return { ...state, status: "ready", error: null };
    case "requestStarted":
      return { ...state, status: "submitting", error: null };
    case "requestFailed":
      return { ...state, status: "failed", error: action.error };
    case "credentialChanged":
      return {
        ...state,
        credentials: {
          ...state.credentials,
          [action.field]: action.value,
        },
      };
    case "otpChanged":
      return { ...state, otpCode: action.value };
    case "loginSucceeded":
      return {
        ...state,
        step: 2,
        status: "ready",
        challenge: action.challenge,
        error: null,
      };
  }
}
