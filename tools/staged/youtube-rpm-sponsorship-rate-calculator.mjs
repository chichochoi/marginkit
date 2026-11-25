export const meta = {
  slug: "youtube-rpm-sponsorship-rate-calculator",
  category: "creator",
  shortTitle: "YouTube RPM & Sponsor Calculator",
  title: "YouTube AdSense RPM & Sponsorship Rate Calculator (2026)",
  metaDescription: "Estimate monthly and annual US YouTube earnings by combining long-form RPM, Shorts RPM, and brand integration sponsorship CPM pricing.",
  heroSubtitle: "Project combined YouTube Partner Program ad revenue and brand integration fees across US audiences.",
  badge: "US Creator Revenue",
  updatedAt: "2026-11-25",
  queuedOrder: 5,
  inputs: [
    { id: "longViews", label: "Monthly Long-Form Views", type: "number", defaultValue: 150000, min: 0, step: 5000 },
    { id: "longRpm", label: "Long-Form RPM (per 1k views)", type: "number", defaultValue: 6.5, min: 0, step: 0.25, prefix: "$" },
    { id: "shortsViews", label: "Monthly Shorts Views", type: "number", defaultValue: 400000, min: 0, step: 10000 },
    { id: "shortsRpm", label: "Shorts RPM (per 1k views)", type: "number", defaultValue: 0.08, min: 0, step: 0.01, prefix: "$" },
    { id: "sponsoredVideos", label: "Sponsored Integrations / Month", type: "number", defaultValue: 2, min: 0, max: 30, step: 1 },
    { id: "avgSponsorViews", label: "Expected 30-Day Views / Sponsor Video", type: "number", defaultValue: 50000, min: 0, step: 1000 },
    { id: "sponsorCpm", label: "Sponsor Integration CPM", type: "number", defaultValue: 22, min: 0, step: 1, prefix: "$" }
  ],
  howItWorks: {
    summary: "Separates YouTube AdSense RPM (what you keep after YouTube's 45% cut on long-form) from direct brand sponsorship CPM valuations.",
    formulaSteps: [
      "AdSense Monthly = (Long Views / 1,000 × Long RPM) + (Shorts Views / 1,000 × Shorts RPM)",
      "Single Integration Quote = (Expected 30-Day Views / 1,000) × Sponsor CPM",
      "Total Monthly Revenue = AdSense Monthly + (Sponsored Integrations × Single Integration Quote)"
    ],
    feeTable: {
      headers: ["US YouTube Niche", "Typical Long RPM", "Typical Sponsor CPM"],
      rows: [
        ["Personal Finance / B2B SaaS", "$12 – $28", "$30 – $60"],
        ["Tech / AI / Productivity", "$6 – $14", "$20 – $38"],
        ["Gaming / Lifestyle / Shorts", "$1.50 – $4.50 ($0.05–$0.12 Shorts)", "$10 – $20"]
      ]
    }
  },
  tips: [
    {
      title: "Price Sponsors on Average 30-Day Views, Not Subscribers",
      detail: "US media buyers value reliable 30-day delivery; base quotes on your median recent 10 videos excluding viral outliers."
    },
    {
      title: "Charge Extra for Usage Rights & Whitelisting",
      detail: "Add 25%–50% onto base integration CPM when brands request paid ad whitelisting or raw footage licensing."
    },
    {
      title: "Use 8+ Minute Videos for Mid-Roll Placement",
      detail: "Crossing 8 minutes unlocks mid-roll ad breaks, often lifting long-form RPM by 40%–70% without hurting retention if paced cleanly."
    },
    {
      title: "Track Shorts as Funnel Traffic, Not Primary AdSense",
      detail: "Even 1 million US Shorts views typically earns $60–$120 in direct Shorts RPM, so link Shorts to long-form or digital offers."
    }
  ],
  faqs: [
    {
      q: "What is the difference between YouTube CPM and RPM?",
      a: "CPM is what advertisers pay per 1,000 monetized ad impressions before YouTube's 45% split; RPM is your actual take-home per 1,000 total video views."
    },
    {
      q: "How much do US YouTube sponsorships pay?",
      a: "Dedicated 60–90 second mid-roll integrations commonly price at $18–$35 CPM for tech/business channels and $35–$60+ CPM for finance."
    },
    {
      q: "Why is Shorts RPM so much lower than long-form RPM?",
      a: "Shorts pool ad revenue across feed sessions and split 45% to creators after music licensing deductions, yielding roughly $0.05–$0.12 per 1,000 US views."
    },
    {
      q: "Do creators pay self-employment tax on YouTube AdSense?",
      a: "Yes. Google AdSense issues Form 1099-NEC/MISC for US creators, and net channel profit after gear/editing deductions is taxable self-employment income."
    }
  ],
  testCases: [
    {
      name: "150k long + 400k Shorts + 2 integrations",
      inputs: { longViews: 150000, longRpm: 6.5, shortsViews: 400000, shortsRpm: 0.08, sponsoredVideos: 2, avgSponsorViews: 50000, sponsorCpm: 22 },
      expected: { kpiId: "totalMonthly", approx: 3207, tolerance: 1 }
    },
    {
      name: "AdSense only channel",
      inputs: { longViews: 200000, longRpm: 10, shortsViews: 0, shortsRpm: 0.08, sponsoredVideos: 0, avgSponsorViews: 50000, sponsorCpm: 20 },
      expected: { kpiId: "adsenseMonthly", approx: 2000, tolerance: 1 }
    }
  ]
};

export function compute(values) {
  const longViews = Math.max(0, Number(values.longViews) || 0);
  const longRpm = Math.max(0, Number(values.longRpm) || 0);
  const shortsViews = Math.max(0, Number(values.shortsViews) || 0);
  const shortsRpm = Math.max(0, Number(values.shortsRpm) || 0);
  const sponsorCount = Math.max(0, Number(values.sponsoredVideos) || 0);
  const sponsorViews = Math.max(0, Number(values.avgSponsorViews) || 0);
  const sponsorCpm = Math.max(0, Number(values.sponsorCpm) || 0);

  const longAdsense = (longViews / 1000) * longRpm;
  const shortsAdsense = (shortsViews / 1000) * shortsRpm;
  const adsenseMonthly = longAdsense + shortsAdsense;
  const singleSponsorQuote = (sponsorViews / 1000) * sponsorCpm;
  const sponsorMonthly = sponsorCount * singleSponsorQuote;
  const totalMonthly = adsenseMonthly + sponsorMonthly;
  const annualTotal = totalMonthly * 12;
  const denom = totalMonthly > 0 ? totalMonthly : 1;

  return {
    kpis: [
      { id: "totalMonthly", label: "Monthly Creator Revenue", value: totalMonthly, format: "currency", highlight: true },
      { id: "annualTotal", label: "Annualized Revenue", value: annualTotal, format: "currency" },
      { id: "adsenseMonthly", label: "Monthly AdSense Payout", value: adsenseMonthly, format: "currency" },
      { id: "singleSponsorQuote", label: "Target Quote / Sponsor Slot", value: singleSponsorQuote, format: "currency" }
    ],
    breakdown: [
      { label: "Long-Form AdSense", amount: longAdsense, share: (longAdsense / denom) * 100, colorKey: "net" },
      { label: "Brand Sponsorships", amount: sponsorMonthly, share: (sponsorMonthly / denom) * 100, colorKey: "fee" },
      { label: "Shorts AdSense", amount: shortsAdsense, share: (shortsAdsense / denom) * 100, colorKey: "processing" }
    ],
    verdict: {
      tone: totalMonthly >= 3000 ? "good" : totalMonthly >= 500 ? "warn" : "bad",
      title: "Estimated $" + totalMonthly.toFixed(0) + "/mo (" + ((sponsorMonthly / denom) * 100).toFixed(0) + "% from sponsors)",
      detail: "Quote around $" + singleSponsorQuote.toFixed(0) + " per 60-second mid-roll integration at $" + sponsorCpm + " CPM."
    }
  };
}
