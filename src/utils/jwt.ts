/**
 * JWT utility functions for extracting user information from tokens
 */

export interface JWTClaims {
  user_id: string;
  email: string;
  exp: number;
  iat: number;
  nbf: number;
  iss: string;
  sub: string;
}

export interface DecodedToken {
  header: Record<string, any>;
  payload: JWTClaims;
  signature: string;
}

/**
 * Decodes a JWT token without verification (client-side only)
 * Note: This is for extracting user info only, not for security validation
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const [headerB64, payloadB64, signature] = parts;

    // Decode header
    const header = JSON.parse(
      atob(headerB64.replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Decode payload
    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return {
      header,
      payload,
      signature,
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Extracts user information from a JWT token
 */
export function extractUserInfo(
  token: string
): { userId: string; email: string } | null {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  const { payload } = decoded;

  // Check if token is expired
  if (payload.exp && payload.exp < Date.now() / 1000) {
    console.warn("JWT token is expired");
    return null;
  }

  // Extract user info from payload
  const userId = payload.user_id || payload.sub;
  const email = payload.email;

  if (!userId || !email) {
    console.error("Missing user_id or email in JWT payload");
    return null;
  }

  return {
    userId,
    email,
  };
}

/**
 * Checks if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return true;
  }

  const { payload } = decoded;
  if (!payload.exp) {
    return false; // No expiration set
  }

  return payload.exp < Date.now() / 1000;
}

/**
 * Gets token expiration time as Date object
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.payload.exp) {
    return null;
  }

  return new Date(decoded.payload.exp * 1000);
}

/**
 * Gets time until token expires in milliseconds
 */
export function getTimeUntilExpiration(token: string): number | null {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return null;
  }

  return expiration.getTime() - Date.now();
}
