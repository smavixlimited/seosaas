import { AppError } from "@/server/lib/errors";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "127.0.0.1",
  "::1",
  "[::1]",
  "::",
  "[::]",
  "0.0.0.0",
  "metadata.google.internal",
  "169.254.169.254",
]);

const PRIVATE_IP_PATTERNS = [
  /^127\./, // 127.0.0.0/8 Loopback
  /^10\./, // 10.0.0.0/8 Private
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12 Private
  /^192\.168\./, // 192.168.0.0/16 Private
  /^169\.254\./, // 169.254.0.0/16 Link-local / Metadata
  /^0\./, // 0.0.0.0/8
  /^fc00:/i, // IPv6 Unique Local
  /^fe80:/i, // IPv6 Link Local
];

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const ALLOWED_PORTS = new Set(["", "80", "443", "8080", "8443"]);

interface SafeUrlResult {
  isValid: boolean;
  cleanUrl: string;
  hostname: string;
  protocol: string;
  error?: string;
}

/**
 * Validates whether a given URL is safe to fetch from a backend server,
 * strictly blocking SSRF vectors targeting local networks or cloud metadata.
 */
export function validateSafeUrl(rawUrl: string): SafeUrlResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      isValid: false,
      cleanUrl: "",
      hostname: "",
      protocol: "",
      error: "URL is empty",
    };
  }

  const trimmed = rawUrl.trim();
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return {
      isValid: false,
      cleanUrl: "",
      hostname: "",
      protocol: "",
      error: "Invalid URL syntax",
    };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      isValid: false,
      cleanUrl: "",
      hostname: parsed.hostname,
      protocol: parsed.protocol,
      error: `Protocol '${parsed.protocol}' is not allowed. Only HTTP and HTTPS are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const unbracketedHost = hostname.replace(/^\[|\]$/g, "");

  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    BLOCKED_HOSTNAMES.has(unbracketedHost)
  ) {
    return {
      isValid: false,
      cleanUrl: "",
      hostname,
      protocol: parsed.protocol,
      error: `Access to internal host '${hostname}' is forbidden.`,
    };
  }

  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname) || pattern.test(unbracketedHost)) {
      return {
        isValid: false,
        cleanUrl: "",
        hostname,
        protocol: parsed.protocol,
        error: `Access to private IP range '${hostname}' is forbidden.`,
      };
    }
  }

  if (!ALLOWED_PORTS.has(parsed.port)) {
    return {
      isValid: false,
      cleanUrl: "",
      hostname,
      protocol: parsed.protocol,
      error: `Port '${parsed.port}' is not permitted.`,
    };
  }

  // Remove credentials (user:pass@host)
  parsed.username = "";
  parsed.password = "";

  return {
    isValid: true,
    cleanUrl: parsed.toString(),
    hostname,
    protocol: parsed.protocol,
  };
}

/**
 * Throws a VALIDATION_ERROR AppError if the URL fails SSRF safety checks.
 */
export function assertSafeUrlOrThrow(rawUrl: string): string {
  const result = validateSafeUrl(rawUrl);
  if (!result.isValid) {
    throw new AppError(
      "VALIDATION_ERROR",
      result.error || "Invalid or restricted URL",
    );
  }
  return result.cleanUrl;
}
