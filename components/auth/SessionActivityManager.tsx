"use client";

import { useEffect, useRef } from "react";
import { getSession, signOut, useSession } from "next-auth/react";
import {
  SESSION_ACTIVITY_STORAGE_KEY,
  SESSION_ACTIVITY_THROTTLE_MS,
  SESSION_HEARTBEAT_INTERVAL_MS,
  SESSION_IDLE_TIMEOUT_MS,
  SIGN_IN_ROUTE,
} from "@/lib/session-policy";

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

const readLastActivity = () => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_ACTIVITY_STORAGE_KEY);
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const writeLastActivity = (timestamp: number) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SESSION_ACTIVITY_STORAGE_KEY,
    timestamp.toString(),
  );
};

const clearLastActivity = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_ACTIVITY_STORAGE_KEY);
};

export default function SessionActivityManager() {
  const { status } = useSession();
  const lastActivityRef = useRef<number>(Date.now());
  const lastRefreshRef = useRef<number>(0);
  const logoutInProgressRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      clearLastActivity();
      lastRefreshRef.current = 0;
      logoutInProgressRef.current = false;
      return;
    }

    const now = Date.now();
    const stored = readLastActivity();
    const initialActivity = stored ?? now;

    lastActivityRef.current = initialActivity;
    if (stored === null) {
      writeLastActivity(initialActivity);
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const getLatestActivityTimestamp = () => {
      const stored = readLastActivity();
      const latestActivity =
        stored === null
          ? lastActivityRef.current
          : Math.max(stored, lastActivityRef.current);

      lastActivityRef.current = latestActivity;
      return latestActivity;
    };

    const isIdleExpired = (now = Date.now()) => {
      const latestActivity = getLatestActivityTimestamp();
      return now - latestActivity >= SESSION_IDLE_TIMEOUT_MS;
    };

    const logoutForInactivity = async () => {
      if (logoutInProgressRef.current) return;

      logoutInProgressRef.current = true;
      clearLastActivity();
      await signOut({ callbackUrl: SIGN_IN_ROUTE });
    };

    const refreshSession = async () => {
      if (logoutInProgressRef.current) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) return;

      if (isIdleExpired()) {
        await logoutForInactivity();
        return;
      }

      try {
        const session = await getSession();
        lastRefreshRef.current = Date.now();

        if (!session) {
          await logoutForInactivity();
        }
      } catch (error) {
        console.error("SESSION_REFRESH_ERROR:", error);
      }
    };

    const markActivity = () => {
      const now = Date.now();
      if (isIdleExpired(now)) {
        void logoutForInactivity();
        return;
      }

      if (now - lastActivityRef.current >= SESSION_ACTIVITY_THROTTLE_MS) {
        lastActivityRef.current = now;
        writeLastActivity(now);
      }

      if (now - lastRefreshRef.current >= SESSION_HEARTBEAT_INTERVAL_MS) {
        void refreshSession();
      }
    };

    const handleWindowFocus = () => {
      if (isIdleExpired()) {
        void logoutForInactivity();
        return;
      }

      const now = Date.now();
      lastActivityRef.current = now;
      writeLastActivity(now);
      void refreshSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      if (isIdleExpired()) {
        void logoutForInactivity();
        return;
      }

      handleWindowFocus();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_ACTIVITY_STORAGE_KEY || !event.newValue) return;

      const parsed = Number(event.newValue);
      if (Number.isFinite(parsed)) {
        lastActivityRef.current = parsed;
      }
    };

    const idleCheckTimer = window.setInterval(() => {
      if (isIdleExpired()) {
        void logoutForInactivity();
        return;
      }

      const now = Date.now();
      if (
        document.visibilityState === "visible" &&
        now - lastRefreshRef.current >= SESSION_HEARTBEAT_INTERVAL_MS
      ) {
        void refreshSession();
      }
    }, 60 * 1000);

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (isIdleExpired()) {
      void logoutForInactivity();
    } else {
      void refreshSession();
    }

    return () => {
      window.clearInterval(idleCheckTimer);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status]);

  return null;
}
