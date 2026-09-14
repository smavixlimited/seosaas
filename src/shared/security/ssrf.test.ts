import { describe, it, expect } from "vitest";
import { validateSafeUrl, assertSafeUrlOrThrow } from "./ssrf";

describe("SSRF Protection (validateSafeUrl & assertSafeUrlOrThrow)", () => {
  it("allows safe public https domains", () => {
    const res = validateSafeUrl("https://example.com/blog");
    expect(res.isValid).toBe(true);
    expect(res.cleanUrl).toBe("https://example.com/blog");
    expect(res.hostname).toBe("example.com");
  });

  it("allows safe public http domains", () => {
    const res = validateSafeUrl("http://mybrand.org");
    expect(res.isValid).toBe(true);
    expect(res.cleanUrl).toBe("http://mybrand.org/");
  });

  it("blocks localhost and loopback addresses", () => {
    expect(validateSafeUrl("http://localhost:3000").isValid).toBe(false);
    expect(validateSafeUrl("http://127.0.0.1").isValid).toBe(false);
    expect(validateSafeUrl("http://127.0.0.2:8080").isValid).toBe(false);
    expect(validateSafeUrl("http://[::1]").isValid).toBe(false);
  });

  it("blocks cloud instance metadata endpoints (169.254.169.254)", () => {
    expect(
      validateSafeUrl("http://169.254.169.254/latest/meta-data").isValid,
    ).toBe(false);
    expect(validateSafeUrl("http://metadata.google.internal").isValid).toBe(
      false,
    );
  });

  it("blocks private RFC 1918 IPv4 ranges", () => {
    expect(validateSafeUrl("http://10.0.0.1/admin").isValid).toBe(false);
    expect(validateSafeUrl("http://172.16.0.5").isValid).toBe(false);
    expect(validateSafeUrl("http://192.168.1.1").isValid).toBe(false);
  });

  it("blocks dangerous non-web protocols", () => {
    expect(validateSafeUrl("file:///etc/passwd").isValid).toBe(false);
    expect(validateSafeUrl("ftp://files.example.com").isValid).toBe(false);
    expect(validateSafeUrl("gopher://example.com").isValid).toBe(false);
    expect(validateSafeUrl("javascript:alert(1)").isValid).toBe(false);
  });

  it("assertSafeUrlOrThrow throws on unsafe URLs", () => {
    expect(() => assertSafeUrlOrThrow("http://127.0.0.1")).toThrow();
    expect(() => assertSafeUrlOrThrow("https://google.com")).not.toThrow();
  });
});
