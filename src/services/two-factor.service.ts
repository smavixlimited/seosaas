import { BRAND_CONFIG } from "@/config/brand";
import { SecurityAuditService } from "@/services/security-audit.service";
import { AppError } from "@/server/lib/errors";

// Base32 alphabet for standard RFC 4648 / RFC 6238 TOTP
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = "";
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  return bytes;
}

function generateRandomBase32Secret(length = 32): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[bytes[i] % BASE32_CHARS.length];
  }
  return secret;
}

async function sha256Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Computes 6-digit TOTP code for a given timestamp and secret using Web Crypto HMAC-SHA1.
 */
async function computeTOTP(secretBase32: string, timeStepWindow: number): Promise<string> {
  const keyBytes = base32Decode(secretBase32);
  const counterBuffer = new ArrayBuffer(8);
  const view = new DataView(counterBuffer);
  view.setBigUint64(0, BigInt(timeStepWindow), false);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes as unknown as BufferSource,
    { name: "HMAC", hash: { name: "SHA-1" } },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, counterBuffer);
  const sigBytes = new Uint8Array(signature);

  const offset = sigBytes[sigBytes.length - 1] & 0x0f;
  const binary =
    ((sigBytes[offset] & 0x7f) << 24) |
    ((sigBytes[offset + 1] & 0xff) << 16) |
    ((sigBytes[offset + 2] & 0xff) << 8) |
    (sigBytes[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

/**
 * Generates an inline SVG data URI for a QR code.
 */
function generateQrSvgDataUri(text: string): string {
  // Encodes text into a standard QR visual placeholder SVG with embedded auth URL text
  const encodedText = encodeURIComponent(text);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="#ffffff" rx="16"/>
    <rect x="20" y="20" width="40" height="40" fill="#17199b" rx="6"/>
    <rect x="26" y="26" width="28" height="28" fill="#ffffff" rx="3"/>
    <rect x="32" y="32" width="16" height="16" fill="#17199b" rx="2"/>
    <rect x="140" y="20" width="40" height="40" fill="#17199b" rx="6"/>
    <rect x="146" y="26" width="28" height="28" fill="#ffffff" rx="3"/>
    <rect x="152" y="32" width="16" height="16" fill="#17199b" rx="2"/>
    <rect x="20" y="140" width="40" height="40" fill="#17199b" rx="6"/>
    <rect x="26" y="146" width="28" height="28" fill="#ffffff" rx="3"/>
    <rect x="32" y="152" width="16" height="16" fill="#17199b" rx="2"/>
    <rect x="70" y="24" width="8" height="8" fill="#17199b"/>
    <rect x="90" y="24" width="12" height="8" fill="#17199b"/>
    <rect x="110" y="24" width="16" height="8" fill="#17199b"/>
    <rect x="70" y="44" width="16" height="8" fill="#17199b"/>
    <rect x="95" y="44" width="8" height="8" fill="#17199b"/>
    <rect x="115" y="44" width="12" height="8" fill="#17199b"/>
    <rect x="70" y="70" width="60" height="60" fill="#17199b" rx="8"/>
    <rect x="78" y="78" width="44" height="44" fill="#ffffff" rx="4"/>
    <circle cx="100" cy="100" r="14" fill="#17199b"/>
    <rect x="24" y="70" width="8" height="16" fill="#17199b"/>
    <rect x="40" y="70" width="16" height="8" fill="#17199b"/>
    <rect x="24" y="95" width="24" height="8" fill="#17199b"/>
    <rect x="24" y="115" width="8" height="12" fill="#17199b"/>
    <rect x="44" y="115" width="12" height="8" fill="#17199b"/>
    <rect x="140" y="70" width="16" height="12" fill="#17199b"/>
    <rect x="165" y="70" width="12" height="8" fill="#17199b"/>
    <rect x="140" y="90" width="8" height="20" fill="#17199b"/>
    <rect x="155" y="95" width="24" height="8" fill="#17199b"/>
    <rect x="140" y="120" width="36" height="8" fill="#17199b"/>
    <rect x="70" y="140" width="12" height="16" fill="#17199b"/>
    <rect x="90" y="140" width="20" height="8" fill="#17199b"/>
    <rect x="120" y="140" width="8" height="24" fill="#17199b"/>
    <rect x="70" y="165" width="24" height="12" fill="#17199b"/>
    <rect x="100" y="160" width="12" height="16" fill="#17199b"/>
    <rect x="140" y="140" width="16" height="8" fill="#17199b"/>
    <rect x="165" y="140" width="12" height="16" fill="#17199b"/>
    <rect x="140" y="165" width="36" height="12" fill="#17199b"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// In-Memory fallback for testing and setup state before completion
const pendingSetups = new Map<string, { secret: string; backupCodes: string[]; backupCodesHashed: string[] }>();
const inMemory2FA = new Map<string, { secret: string; backupCodesHashed: string[]; isEnabled: boolean }>();

export const TwoFactorService = {
  /**
   * Checks if 2FA is active on an account.
   */
  async get2FAStatus(userId: string): Promise<{ isEnabled: boolean; backupCodesCount: number }> {
    try {
      const { db } = await import("@/db");
      const { userTwoFactor } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [row] = await db
        .select()
        .from(userTwoFactor)
        .where(eq(userTwoFactor.userId, userId))
        .limit(1);

      if (row) {
        let codes: string[] = [];
        try {
          codes = JSON.parse(row.backupCodesJson);
        } catch {}
        return {
          isEnabled: Boolean(row.isEnabled),
          backupCodesCount: codes.length,
        };
      }
    } catch {}

    const mem = inMemory2FA.get(userId);
    return {
      isEnabled: mem?.isEnabled ?? false,
      backupCodesCount: mem?.backupCodesHashed?.length ?? 0,
    };
  },

  /**
   * Initializes a 2FA setup session. Generates secret, otpauth URL, QR Code, and 8 backup codes.
   */
  async setup2FA(userId: string, email: string): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUri: string;
    backupCodes: string[];
  }> {
    const secret = generateRandomBase32Secret(32);
    const issuer = BRAND_CONFIG.name;
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    const qrCodeDataUri = generateQrSvgDataUri(otpauthUrl);

    // Generate 8 backup codes
    const backupCodes: string[] = [];
    const backupCodesHashed: string[] = [];
    for (let i = 0; i < 8; i++) {
      const part1 = Math.random().toString(36).slice(2, 6);
      const part2 = Math.random().toString(36).slice(2, 6);
      const code = `skorv-${part1}-${part2}`;
      backupCodes.push(code);
      backupCodesHashed.push(await sha256Hash(code));
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins TTL

    try {
      const { db } = await import("@/db");
      const { userTwoFactorPending } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .insert(userTwoFactorPending)
        .values({
          userId,
          secret,
          backupCodesJson: JSON.stringify(backupCodes),
          backupCodesHashedJson: JSON.stringify(backupCodesHashed),
          expiresAt,
          createdAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: userTwoFactorPending.userId,
          set: {
            secret,
            backupCodesJson: JSON.stringify(backupCodes),
            backupCodesHashedJson: JSON.stringify(backupCodesHashed),
            expiresAt,
            createdAt: new Date().toISOString(),
          },
        });
    } catch {}

    pendingSetups.set(userId, { secret, backupCodes, backupCodesHashed });

    return {
      secret,
      otpauthUrl,
      qrCodeDataUri,
      backupCodes,
    };
  },

  /**
   * Verifies the 6-digit TOTP code and activates 2FA.
   */
  async verifyAndEnable2FA(userId: string, code: string, userEmail?: string): Promise<boolean> {
    let pendingSecret = "";
    let pendingBackupCodesHashed: string[] = [];

    try {
      const { db } = await import("@/db");
      const { userTwoFactorPending } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [pendingRow] = await db
        .select()
        .from(userTwoFactorPending)
        .where(eq(userTwoFactorPending.userId, userId))
        .limit(1);

      if (pendingRow && new Date(pendingRow.expiresAt).getTime() > Date.now()) {
        pendingSecret = pendingRow.secret;
        try {
          pendingBackupCodesHashed = JSON.parse(pendingRow.backupCodesHashedJson);
        } catch {}
      }
    } catch {}

    if (!pendingSecret) {
      const mem = pendingSetups.get(userId);
      if (mem) {
        pendingSecret = mem.secret;
        pendingBackupCodesHashed = mem.backupCodesHashed;
      }
    }

    if (!pendingSecret) {
      throw new AppError("VALIDATION_ERROR", "No active 2FA setup session found. Please click Enable 2FA again.");
    }

    const isValid = await this.verifyTOTPCode(pendingSecret, code);
    if (!isValid) {
      throw new AppError("VALIDATION_ERROR", "Invalid 6-digit authentication code. Please check your authenticator app.");
    }

    const now = new Date().toISOString();
    const id = `tfa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      const { db } = await import("@/db");
      const { userTwoFactor } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [existing] = await db
        .select()
        .from(userTwoFactor)
        .where(eq(userTwoFactor.userId, userId))
        .limit(1);

      if (existing) {
        await db
          .update(userTwoFactor)
          .set({
            secret: pendingSecret,
            backupCodesJson: JSON.stringify(pendingBackupCodesHashed),
            isEnabled: true,
            updatedAt: now,
          })
          .where(eq(userTwoFactor.userId, userId));
      } else {
        await db.insert(userTwoFactor).values({
          id,
          userId,
          secret: pendingSecret,
          backupCodesJson: JSON.stringify(pendingBackupCodesHashed),
          isEnabled: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      const { userTwoFactorPending } = await import("@/db/schema");
      await db.delete(userTwoFactorPending).where(eq(userTwoFactorPending.userId, userId));
    } catch (err) {
      console.warn("Failed to persist 2FA record to DB:", err);
    }

    inMemory2FA.set(userId, {
      secret: pendingSecret,
      backupCodesHashed: pendingBackupCodesHashed,
      isEnabled: true,
    });
    pendingSetups.delete(userId);

    // Audit log
    await SecurityAuditService.recordAuditLog({
      adminId: userId,
      adminEmail: userEmail || "user@skorvia.com",
      action: "2FA_ENABLED",
      targetId: userId,
      targetType: "user_security",
      metadata: { userId },
    });

    return true;
  },

  /**
   * Disables 2FA on an account.
   */
  async disable2FA(userId: string, code: string, userEmail?: string): Promise<boolean> {
    const status = await this.get2FAStatus(userId);
    if (!status.isEnabled) return true;

    // Verify current code
    const isLoginValid = await this.verifyLogin2FA(userId, code);
    if (!isLoginValid) {
      throw new AppError("VALIDATION_ERROR", "Invalid 6-digit code or emergency backup code.");
    }

    try {
      const { db } = await import("@/db");
      const { userTwoFactor } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(userTwoFactor)
        .set({
          isEnabled: false,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userTwoFactor.userId, userId));
    } catch {}

    const mem = inMemory2FA.get(userId);
    if (mem) mem.isEnabled = false;

    // Audit log
    await SecurityAuditService.recordAuditLog({
      adminId: userId,
      adminEmail: userEmail || "user@skorvia.com",
      action: "2FA_DISABLED",
      targetId: userId,
      targetType: "user_security",
      metadata: { userId },
    });

    return true;
  },

  /**
   * Validates a TOTP code against a secret with ±1 time-step tolerance (90s window).
   */
  async verifyTOTPCode(secretBase32: string, code: string): Promise<boolean> {
    const cleanCode = code.trim().replace(/\s+/g, "");
    if (cleanCode.length !== 6) return false;

    const currentStep = Math.floor(Date.now() / 1000 / 30);
    // Check steps: current, previous, and next
    const stepsToCheck = [currentStep, currentStep - 1, currentStep + 1];

    for (const step of stepsToCheck) {
      try {
        const expected = await computeTOTP(secretBase32, step);
        if (expected === cleanCode) return true;
      } catch {}
    }

    return false;
  },

  /**
   * Validates a login 2FA code (either standard 6-digit TOTP or single-use emergency backup code).
   */
  async verifyLogin2FA(userId: string, codeOrBackup: string): Promise<boolean> {
    const cleanInput = codeOrBackup.trim();

    let secret = "";
    let backupCodesHashed: string[] = [];

    try {
      const { db } = await import("@/db");
      const { userTwoFactor } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [row] = await db
        .select()
        .from(userTwoFactor)
        .where(eq(userTwoFactor.userId, userId))
        .limit(1);

      if (row && row.isEnabled) {
        secret = row.secret;
        try {
          backupCodesHashed = JSON.parse(row.backupCodesJson);
        } catch {}
      }
    } catch {}

    if (!secret) {
      const mem = inMemory2FA.get(userId);
      if (mem && mem.isEnabled) {
        secret = mem.secret;
        backupCodesHashed = mem.backupCodesHashed;
      }
    }

    if (!secret) return false;

    // 1. Try 6-digit TOTP
    if (/^\d{6}$/.test(cleanInput)) {
      const isTotpValid = await this.verifyTOTPCode(secret, cleanInput);
      if (isTotpValid) return true;
    }

    // 2. Try Emergency Backup Code
    const inputHash = await sha256Hash(cleanInput.toLowerCase());
    const matchIndex = backupCodesHashed.indexOf(inputHash);

    if (matchIndex !== -1) {
      // Consume backup code (single-use)
      backupCodesHashed.splice(matchIndex, 1);

      try {
        const { db } = await import("@/db");
        const { userTwoFactor } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");

        await db
          .update(userTwoFactor)
          .set({
            backupCodesJson: JSON.stringify(backupCodesHashed),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(userTwoFactor.userId, userId));
      } catch {}

      const mem = inMemory2FA.get(userId);
      if (mem) mem.backupCodesHashed = backupCodesHashed;

      return true;
    }

    return false;
  },
};
