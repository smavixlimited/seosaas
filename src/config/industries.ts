export const INDUSTRY_CATEGORIES: Record<string, readonly string[]> = {
  "Media & Publishing": [
    "News and Media Brand",
    "News & Digital Journalism",
    "Publishing & Magazine",
    "Content Creation / Media",
    "Broadcasting & Podcast",
  ],
  "Technology & SaaS": [
    "SaaS / Software",
    "Mobile Apps",
    "Artificial Intelligence / AI",
    "Cybersecurity",
    "Web3 / Blockchain",
    "IT Services & Consulting",
    "Hardware / Electronics",
  ],
  "E-commerce & Retail": [
    "E-commerce / Online Retail",
    "Retail / Physical Stores",
    "Wholesale / Distribution",
    "Marketplace / Platform",
    "Dropshipping",
  ],
  "Finance & Fintech": [
    "Fintech / Financial Technology",
    "Banking & Financial Services",
    "Insurance",
    "Accounting & Bookkeeping",
    "Investment & Wealth Management",
    "Cryptocurrency / DeFi",
  ],
  "Agencies & Marketing": [
    "Digital Marketing Agency",
    "Advertising & PR",
    "SEO / Growth Agency",
    "Social Media Management",
    "Branding & Design Agency",
  ],
  "Professional Services": [
    "Consulting / Business Coaching",
    "Legal Services",
    "HR & Recruitment",
    "Management Consulting",
    "Research & Analytics",
  ],
  "Health & Wellness": [
    "Healthcare / MedTech",
    "Mental Health & Therapy",
    "Fitness & Sports",
    "Nutrition & Supplements",
    "Beauty & Personal Care",
    "Pharmaceuticals",
  ],
  "Education": [
    "EdTech / Online Learning",
    "Tutoring & Coaching",
    "Corporate Training",
    "Schools & Universities",
  ],
  "Local & Hospitality": [
    "Local Business / Trades",
    "Food & Beverage / Restaurant",
    "Travel & Tourism",
    "Hotels & Hospitality",
    "Real Estate & Property Management",
    "Construction & Architecture",
  ],
  "Other Industries": [
    "Creator / Influencer",
    "Non-profit / NGO",
    "Logistics & Supply Chain",
    "Automotive",
    "Manufacturing",
    "Other",
  ],
};

export const INDUSTRIES = [
  // News, Media & Publishing
  "News and Media Brand",
  "News & Digital Journalism",
  "Publishing & Magazine",
  "Content Creation / Media",
  "Broadcasting & Podcast",

  // Technology & SaaS
  "SaaS / Software",
  "Mobile Apps",
  "Artificial Intelligence / AI",
  "Cybersecurity",
  "Web3 / Blockchain",
  "IT Services & Consulting",
  "Hardware / Electronics",

  // E-commerce & Retail
  "E-commerce / Online Retail",
  "Retail / Physical Stores",
  "Wholesale / Distribution",
  "Marketplace / Platform",
  "Dropshipping",

  // Finance & Fintech
  "Fintech / Financial Technology",
  "Banking & Financial Services",
  "Insurance",
  "Accounting & Bookkeeping",
  "Investment & Wealth Management",
  "Cryptocurrency / DeFi",

  // Agencies & Marketing
  "Digital Marketing Agency",
  "Advertising & PR",
  "SEO / Growth Agency",
  "Social Media Management",
  "Branding & Design Agency",

  // Professional Services
  "Consulting / Business Coaching",
  "Legal Services",
  "HR & Recruitment",
  "Management Consulting",
  "Research & Analytics",

  // Health & Wellness
  "Healthcare / MedTech",
  "Mental Health & Therapy",
  "Fitness & Sports",
  "Nutrition & Supplements",
  "Beauty & Personal Care",
  "Pharmaceuticals",

  // Education
  "EdTech / Online Learning",
  "Tutoring & Coaching",
  "Corporate Training",
  "Schools & Universities",

  // Local & Hospitality
  "Local Business / Trades",
  "Food & Beverage / Restaurant",
  "Travel & Tourism",
  "Hotels & Hospitality",
  "Real Estate & Property Management",
  "Construction & Architecture",

  // Creator & Other
  "Creator / Influencer",
  "Non-profit / NGO",
  "Logistics & Supply Chain",
  "Automotive",
  "Manufacturing",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const COMPANY_SIZES = ["1-5", "6-10", "11-20", "21+"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const TARGET_COUNTRIES = [
  { code: "US", name: "United States", locationCode: 2840, flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", locationCode: 2826, flag: "🇬🇧" },
  { code: "CA", name: "Canada", locationCode: 2124, flag: "🇨🇦" },
  { code: "AU", name: "Australia", locationCode: 2036, flag: "🇦🇺" },
  { code: "DE", name: "Germany", locationCode: 2276, flag: "🇩🇪" },
  { code: "FR", name: "France", locationCode: 2250, flag: "🇫🇷" },
  { code: "NG", name: "Nigeria", locationCode: 2566, flag: "🇳🇬" },
  { code: "IN", name: "India", locationCode: 2356, flag: "🇮🇳" },
  { code: "BR", name: "Brazil", locationCode: 2076, flag: "🇧🇷" },
  { code: "ZA", name: "South Africa", locationCode: 2710, flag: "🇿🇦" },
  { code: "AE", name: "United Arab Emirates", locationCode: 2784, flag: "🇦🇪" },
] as const;
