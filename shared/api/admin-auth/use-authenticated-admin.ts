"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import {
  clearAuthenticatedAdmin,
  getAuthenticatedAdminSnapshot,
  parseAuthenticatedAdminSnapshot,
  subscribeAuthenticatedAdmin,
} from "./session";

const getServerSnapshot = () => null;

export function useAuthenticatedAdmin() {
  const snapshot = useSyncExternalStore(
    subscribeAuthenticatedAdmin,
    getAuthenticatedAdminSnapshot,
    getServerSnapshot,
  );
  const admin = useMemo(
    () => parseAuthenticatedAdminSnapshot(snapshot),
    [snapshot],
  );

  useEffect(() => {
    if (snapshot && !admin) clearAuthenticatedAdmin();
  }, [admin, snapshot]);

  return admin;
}
