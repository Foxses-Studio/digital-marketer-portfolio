/**
 * Shared by the proxy and server code. No server-only imports here.
 *
 * In production the cookie uses the `__Host-` prefix, which browsers only
 * accept with Secure, Path=/ and no Domain, so it can't be set or
 * overridden by a subdomain or over plain HTTP.
 */
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-dm_session" : "dm_session";

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Session tokens are 32 random bytes, base64url-encoded. */
export const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
