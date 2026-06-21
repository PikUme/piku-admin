import {
  type AuthenticatedAdmin,
  isAuthenticatedAdmin,
} from "./contracts";

export const AUTHENTICATED_ADMIN_STORAGE_KEY =
  "piku.admin.authenticated-admin";
const AUTHENTICATED_ADMIN_CHANGE_EVENT = "piku:admin-auth-change";

function browserSessionStorage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.sessionStorage;
}

function emitChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTHENTICATED_ADMIN_CHANGE_EVENT));
  }
}

export function saveAuthenticatedAdmin(
  admin: AuthenticatedAdmin,
  storage = browserSessionStorage(),
): void {
  storage?.setItem(AUTHENTICATED_ADMIN_STORAGE_KEY, JSON.stringify(admin));
  emitChange();
}

export function clearAuthenticatedAdmin(
  storage = browserSessionStorage(),
): void {
  storage?.removeItem(AUTHENTICATED_ADMIN_STORAGE_KEY);
  emitChange();
}

export function parseAuthenticatedAdminSnapshot(
  snapshot: string | null,
): AuthenticatedAdmin | null {
  if (!snapshot) return null;

  try {
    const value: unknown = JSON.parse(snapshot);
    return isAuthenticatedAdmin(value) ? value : null;
  } catch {
    return null;
  }
}

export function readAuthenticatedAdmin(
  storage = browserSessionStorage(),
): AuthenticatedAdmin | null {
  if (!storage) return null;

  const snapshot = storage.getItem(AUTHENTICATED_ADMIN_STORAGE_KEY);
  const admin = parseAuthenticatedAdminSnapshot(snapshot);

  if (snapshot && !admin) {
    storage.removeItem(AUTHENTICATED_ADMIN_STORAGE_KEY);
  }

  return admin;
}

export function getAuthenticatedAdminSnapshot(): string | null {
  return (
    browserSessionStorage()?.getItem(AUTHENTICATED_ADMIN_STORAGE_KEY) ?? null
  );
}

export function subscribeAuthenticatedAdmin(
  onStoreChange: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTHENTICATED_ADMIN_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTHENTICATED_ADMIN_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTHENTICATED_ADMIN_CHANGE_EVENT, onStoreChange);
  };
}
