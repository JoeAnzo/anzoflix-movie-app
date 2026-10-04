// This helper is the UI safety layer for auth failures.
// We never want raw Appwrite/backend strings displayed directly to users.
// Instead, we map backend messages into short, friendly, product-safe messages.

export const normalizeAuthError = (error: unknown): string => {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Something went wrong.";

  const normalized = rawMessage.toLowerCase();

  // Email/password and signup validation errors should be human-friendly.
  if (
    normalized.includes("user already exists") ||
    normalized.includes("already exists")
  ) {
    return "An account with this email already exists.";
  }

  if (
    normalized.includes("invalid email") ||
    normalized.includes("email is invalid") ||
    normalized.includes("not valid")
  ) {
    return "Please enter a valid email address.";
  }

  if (
    normalized.includes("invalid credentials") ||
    normalized.includes("wrong password") ||
    normalized.includes("password is invalid") ||
    normalized.includes("incorrect password") ||
    normalized.includes("email or password")
  ) {
    return "Incorrect email or password. Please try again.";
  }

  if (
    normalized.includes("session") ||
    normalized.includes("unauthorized") ||
    normalized.includes("authentication") ||
    normalized.includes("token")
  ) {
    return "Your session expired. Please sign in again.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }

  if (normalized.includes("oauth") || normalized.includes("google")) {
    return "Google sign-in is temporarily unavailable. Please try again.";
  }

  // Final fallback avoids exposing internal backend details to users.
  return "Something went wrong. Please try again.";
};
