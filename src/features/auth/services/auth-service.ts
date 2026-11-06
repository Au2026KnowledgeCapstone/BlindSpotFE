import { backendAuth } from "./backend-auth";

/** Every auth operation uses backend-managed HttpOnly cookies, never the SDK session. */
export const authService = backendAuth;
