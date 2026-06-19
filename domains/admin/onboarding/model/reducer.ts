import type {
  CredentialsForm,
  OtpRegistration,
  TemporaryLoginInput,
} from "../api/contracts";

export type OnboardingStep = 1 | 2 | 3;
export type RequestStatus =
  | "initializing"
  | "ready"
  | "submitting"
  | "failed";

export interface OnboardingState {
  step: OnboardingStep;
  status: RequestStatus;
  temporaryLogin: TemporaryLoginInput;
  credentials: CredentialsForm;
  otpCode: string;
  otpRegistration: OtpRegistration | null;
  error: string | null;
}

export const initialOnboardingState: OnboardingState = {
  step: 1,
  status: "initializing",
  temporaryLogin: {
    temporaryId: "",
    temporaryPassword: "",
  },
  credentials: {
    loginId: "",
    password: "",
    confirmation: "",
  },
  otpCode: "",
  otpRegistration: null,
  error: null,
};

export type OnboardingAction =
  | { type: "csrfSucceeded" }
  | { type: "requestStarted" }
  | { type: "requestFailed"; error: string }
  | { type: "errorDismissed" }
  | {
      type: "temporaryFieldChanged";
      field: keyof TemporaryLoginInput;
      value: string;
    }
  | {
      type: "credentialsFieldChanged";
      field: keyof CredentialsForm;
      value: string;
    }
  | { type: "otpCodeChanged"; value: string }
  | { type: "temporaryLoginSucceeded" }
  | { type: "credentialsSucceeded"; registration: OtpRegistration };

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case "csrfSucceeded":
      return { ...state, status: "ready", error: null };
    case "requestStarted":
      return { ...state, status: "submitting", error: null };
    case "requestFailed":
      return { ...state, status: "failed", error: action.error };
    case "errorDismissed":
      return { ...state, status: "ready", error: null };
    case "temporaryFieldChanged":
      return {
        ...state,
        temporaryLogin: {
          ...state.temporaryLogin,
          [action.field]: action.value,
        },
      };
    case "credentialsFieldChanged":
      return {
        ...state,
        credentials: {
          ...state.credentials,
          [action.field]: action.value,
        },
      };
    case "otpCodeChanged":
      return { ...state, otpCode: action.value };
    case "temporaryLoginSucceeded":
      return { ...state, step: 2, status: "ready", error: null };
    case "credentialsSucceeded":
      return {
        ...state,
        step: 3,
        status: "ready",
        otpRegistration: action.registration,
        error: null,
      };
  }
}
