export interface AdminApiProblem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  fieldErrors?: Record<string, string>;
}

export class AdminApiError extends Error {
  readonly status?: number;
  readonly problemType?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(message: string, problem?: Partial<AdminApiProblem>) {
    super(message);
    this.name = "AdminApiError";
    this.status = problem?.status;
    this.problemType = problem?.type;
    this.fieldErrors = problem?.fieldErrors;
  }
}
