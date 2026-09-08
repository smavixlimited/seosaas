const COUNTRY_MAP: Record<string, string> = {
  US: "United States",
  USA: "United States",
  GB: "United Kingdom",
  UK: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  NG: "Nigeria",
  DE: "Germany",
  FR: "France",
  IN: "India",
  ZA: "South Africa",
  KE: "Kenya",
  GH: "Ghana",
  AE: "United Arab Emirates",
  UAE: "United Arab Emirates",
  SA: "Saudi Arabia",
  SG: "Singapore",
  BR: "Brazil",
  MX: "Mexico",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  JP: "Japan",
  NZ: "New Zealand",
  IE: "Ireland",
  SE: "Sweden",
  CH: "Switzerland",
  PL: "Poland",
  EG: "Egypt",
  RW: "Rwanda",
};

export function getCountryDisplayName(codeOrName?: string | null): string {
  if (!codeOrName || !codeOrName.trim()) {
    return "United States";
  }
  const clean = codeOrName.trim();
  const upper = clean.toUpperCase();
  if (COUNTRY_MAP[upper]) {
    return COUNTRY_MAP[upper];
  }
  return clean;
}

export function getCountryCode(codeOrName?: string | null): string {
  if (!codeOrName || !codeOrName.trim()) {
    return "US";
  }
  const clean = codeOrName.trim();
  if (clean.length === 2) {
    return clean.toUpperCase();
  }
  for (const [code, name] of Object.entries(COUNTRY_MAP)) {
    if (name.toLowerCase() === clean.toLowerCase()) {
      return code;
    }
  }
  return clean.slice(0, 2).toUpperCase();
}
