import {
  type AdminAuthConfigOptions,
  resolveAdminAuthConfig,
} from "./config";
import { createAdminAuthRequest, type AdminAuthRequest } from "./request";

export interface AdminAuthClientOptions extends AdminAuthConfigOptions {
  cookieSource?: () => string;
  fetcher?: typeof fetch;
}

export function createConfiguredAdminAuthRequest(
  options: AdminAuthClientOptions = {},
): AdminAuthRequest {
  const config = resolveAdminAuthConfig(options);

  return createAdminAuthRequest({
    ...config,
    cookieSource: options.cookieSource,
    fetcher: options.fetcher,
  });
}
