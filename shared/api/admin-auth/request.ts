import { AdminApiError, type AdminApiProblem } from "./contracts";
import { readCookie } from "./cookies";
import { baseUrl } from "./client";

type AdminMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface AdminRequestOptions {
  method?: AdminMethod;
  body?: object;
  csrf?: boolean;
}

interface CreateAdminAuthRequestOptions {
  csrfCookieName: string;
  csrfHeaderName: string;
  cookieSource?: () => string;
  fetcher?: typeof fetch;
}

export type AdminAuthRequest = <T = unknown>(
  path: string,
  options?: AdminRequestOptions,
) => Promise<T>;

function isProblem(body: unknown): body is AdminApiProblem {
  return (
    typeof body === "object" &&
    body !== null &&
    "type" in body &&
    typeof body.type === "string" &&
    "status" in body &&
    typeof body.status === "number" &&
    "detail" in body &&
    typeof body.detail === "string"
  );
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function createAdminAuthRequest({
  csrfCookieName,
  csrfHeaderName,
  cookieSource = () => (typeof document === "undefined" ? "" : document.cookie),
  fetcher = fetch,
}: CreateAdminAuthRequestOptions): AdminAuthRequest {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return async function request<T = unknown>(
    path: string,
    { method = "GET", body, csrf }: AdminRequestOptions = {},
  ): Promise<T> {
    const unsafe = method === "POST" || method === "PATCH" || method === "DELETE";
    const shouldAttachCsrf = csrf ?? unsafe;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (shouldAttachCsrf) {
      const token = readCookie(csrfCookieName, cookieSource());
      if (!token) {
        throw new AdminApiError("CSRF 쿠키를 찾을 수 없습니다.");
      }
      headers[csrfHeaderName] = token;
    }

    const response = await fetcher(`${normalizedBaseUrl}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const responseBody = await readResponseBody(response);

    if (!response.ok) {
      if (isProblem(responseBody)) {
        throw new AdminApiError(responseBody.detail, responseBody);
      }
      throw new AdminApiError(
        "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        { status: response.status },
      );
    }

    return responseBody as T;
  };
}
