import { describe, it, expect, beforeEach } from "vitest";
import { SystemSettingsService } from "@/services/system-settings.service";

describe("SystemSettingsService (Dynamic Branding & Categorized API Manager)", () => {
  beforeEach(() => {
    SystemSettingsService.clearCache();
  });

  describe("Branding & Assets", () => {
    it("returns default branding when no custom settings are stored", async () => {
      const branding = await SystemSettingsService.getBranding();
      expect(branding.siteTitle).toBe("Skorvia");
      expect(branding.lightLogoUrl).toBe("/logo.png");
      expect(branding.publicRegistrationEnabled).toBe(true);
    });

    it("updates and caches branding settings dynamically", async () => {
      await SystemSettingsService.setBranding({
        siteTitle: "Skorvia Pro SEO",
        lightLogoUrl: "https://cdn.example.com/logo-light.svg",
        publicRegistrationEnabled: false,
      });

      const updated = await SystemSettingsService.getBranding();
      expect(updated.siteTitle).toBe("Skorvia Pro SEO");
      expect(updated.lightLogoUrl).toBe("https://cdn.example.com/logo-light.svg");
      expect(updated.publicRegistrationEnabled).toBe(false);

      const isRegOpen = await SystemSettingsService.isPublicRegistrationEnabled();
      expect(isRegOpen).toBe(false);
    });
  });

  describe("Categorized API Manager", () => {
    it("manages SEO & Crawler API credentials", async () => {
      await SystemSettingsService.setSeoApis({
        dataforseoLogin: "admin@enterprise.com",
        dataforseoApiKey: "secret_dfseo_key_123",
        indexnowKey: "custom_indexnow_key",
      });

      const seo = await SystemSettingsService.getSeoApis();
      expect(seo.dataforseoLogin).toBe("admin@enterprise.com");
      expect(seo.dataforseoApiKey).toBe("secret_dfseo_key_123");
      expect(seo.indexnowKey).toBe("custom_indexnow_key");
    });

    it("manages AI & LLM Engine credentials and default model selector", async () => {
      await SystemSettingsService.setAiApis({
        geminiApiKey: "AIzaSy_custom_key",
        defaultModel: "google/gemini-1.5-pro",
      });

      const ai = await SystemSettingsService.getAiApis();
      expect(ai.geminiApiKey).toBe("AIzaSy_custom_key");
      expect(ai.defaultModel).toBe("google/gemini-1.5-pro");
    });

    it("manages Local & Google Maps API credentials", async () => {
      await SystemSettingsService.setLocalMapsApis({
        googlePlacesApiKey: "AIzaSy_places_123",
        googleMapsJsApiKey: "AIzaSy_maps_456",
      });

      const local = await SystemSettingsService.getLocalMapsApis();
      expect(local.googlePlacesApiKey).toBe("AIzaSy_places_123");
      expect(local.googleMapsJsApiKey).toBe("AIzaSy_maps_456");
    });

    it("manages Communications (Resend) credentials", async () => {
      await SystemSettingsService.setCommunicationsApis({
        resendApiKey: "re_test_key_abc",
        senderEmail: "alerts@myagency.com",
        senderName: "Agency Bot",
      });

      const comms = await SystemSettingsService.getCommunicationsApis();
      expect(comms.resendApiKey).toBe("re_test_key_abc");
      expect(comms.senderEmail).toBe("alerts@myagency.com");
      expect(comms.senderName).toBe("Agency Bot");
    });

    it("manages Multi-Gateway Payment credentials and Manual Bank Transfer details", async () => {
      await SystemSettingsService.setPaymentGatewaysApis({
        paystackPublicKey: "pk_live_custom",
        paystackSecretKey: "sk_live_custom",
        manualPaymentBankName: "Guaranty Trust Bank",
        manualPaymentAccountNumber: "0987654321",
        manualPaymentAccountName: "Skorvia Enterprise NG Ltd",
      });

      const payments = await SystemSettingsService.getPaymentGatewaysApis();
      expect(payments.paystackPublicKey).toBe("pk_live_custom");
      expect(payments.manualPaymentBankName).toBe("Guaranty Trust Bank");
      expect(payments.manualPaymentAccountNumber).toBe("0987654321");
      expect(payments.manualPaymentAccountName).toBe("Skorvia Enterprise NG Ltd");
    });
  });
});
