
/**
 * Public exports for the authentication feature.
 * Other features and routes should import from "@/features/auth"
 * instead of directly accessing internal component files.
 */

export { AuthShell } from "./components/AuthShell";
export { AccountMenu } from "./components/AccountMenu";
export { AccountSettings } from "./components/AccountSettings";
export { LoginForm } from "./components/LoginForm";
export { SignupForm } from "./components/SignupForm";
export { authService } from "./services/auth-service";
