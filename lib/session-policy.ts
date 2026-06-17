export const SIGN_IN_ROUTE = "/sign-in";

// Server-side JWT/session lifetime. Client activity heartbeats refresh this window.
export const SESSION_IDLE_TIMEOUT_SECONDS = 60 * 30;
export const SESSION_IDLE_TIMEOUT_MS = SESSION_IDLE_TIMEOUT_SECONDS * 1000;

// Activity handling on the client.
export const SESSION_HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
export const SESSION_ACTIVITY_THROTTLE_MS = 15 * 1000;
export const SESSION_ACTIVITY_STORAGE_KEY = "auth:last-activity-at";
