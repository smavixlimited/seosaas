import { describe, it, expect } from "vitest";
import { SUPPORTED_CURRENCIES } from "@/client/lib/currency";
import { SUPPORTED_LANGUAGES } from "@/client/lib/language";

describe("Internationalization: Multi-Currency & Language Suite", () => {
  it("supports all major global and Flutterwave-supported currencies", () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);

    // African & Flutterwave currencies
    expect(codes).toContain("NGN"); // Nigerian Naira
    expect(codes).toContain("GHS"); // Ghanaian Cedi
    expect(codes).toContain("KES"); // Kenyan Shilling
    expect(codes).toContain("ZAR"); // South African Rand
    expect(codes).toContain("UGX"); // Ugandan Shilling
    expect(codes).toContain("TZS"); // Tanzanian Shilling
    expect(codes).toContain("RWF"); // Rwandan Franc
    expect(codes).toContain("XOF"); // West African CFA
    expect(codes).toContain("XAF"); // Central African CFA

    // Global currencies
    expect(codes).toContain("USD"); // US Dollar
    expect(codes).toContain("EUR"); // Euro
    expect(codes).toContain("GBP"); // British Pound
    expect(codes).toContain("CAD"); // Canadian Dollar
    expect(codes).toContain("AUD"); // Australian Dollar
  });

  it("supports global and multilingual language locales", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("fr");
    expect(codes).toContain("es");
    expect(codes).toContain("de");
    expect(codes).toContain("pt");
    expect(codes).toContain("ar");
    expect(codes).toContain("zh");
    expect(codes).toContain("yo");
  });
});
