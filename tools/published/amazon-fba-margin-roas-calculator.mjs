export const meta = {
  slug: "amazon-fba-margin-roas-calculator",
  category: "ecommerce",
  shortTitle: "Amazon FBA Margin Calculator",
  title: "Amazon FBA Fee, Net Margin & Break-Even ACOS Calculator",
  metaDescription: "Estimate 2026 Amazon US FBA fulfillment fees, 15% referral commission, storage, PPC ACOS, and return losses to find true break-even ACOS and ROAS.",
  heroSubtitle: "Model Amazon US FBA unit economics and pinpoint your exact break-even PPC ACOS ceiling.",
  badge: "2026 Amazon FBA US",
  updatedAt: "2026-11-25",
  inputs: [
    { id: "salePrice", label: "Amazon Sale Price", type: "number", defaultValue: 34.99, min: 0, step: 0.01, prefix: "$" },
    { id: "referralPct", label: "Category Referral Fee", type: "number", defaultValue: 15, min: 0, max: 45, step: 0.5, suffix: "%" },
    { id: "fbaFee", label: "FBA Fulfillment Fee / Unit", type: "number", defaultValue: 5.4, min: 0, step: 0.05, prefix: "$" },
    { id: "storageFee", label: "Monthly Storage & Inbound / Unit", type: "number", defaultValue: 0.45, min: 0, step: 0.05, prefix: "$" },
    { id: "landedCogs", label: "Landed COGS (Factory + Freight + Duty)", type: "number", defaultValue: 8.5, min: 0, step: 0.1, prefix: "$" },
    { id: "acosPct", label: "Blended PPC ACOS (or TACoS %)", type: "number", defaultValue: 18, min: 0, max: 100, step: 0.5, suffix: "%" },
    { id: "returnRatePct", label: "Customer Return Rate", type: "number", defaultValue: 4, min: 0, max: 50, step: 0.5, suffix: "%" }
  ],
  howItWorks: {
    summary: "Subtracts Amazon's referral commission, FBA pick-and-pack fee, storage, refund admin reserve, landed product cost, and PPC spend.",
    formulaSteps: [
      "Referral Fee = Sale Price × Referral % (15% for most US categories)",
      "Return Loss Reserve = (FBA Fee + 20% of Referral Fee) × Return Rate %",
      "Total Amazon Fees = Referral Fee + FBA Fee + Storage/Inbound + Return Loss Reserve",
      "Break-Even ACOS = (Sale Price - Total Amazon Fees - Landed COGS) / Sale Price"
    ],
    feeTable: {
      headers: ["Amazon FBA Cost Item", "Typical US Benchmark", "Notes"],
      rows: [
        ["Referral Commission", "8% – 15%", "15% standard across Home, Beauty, Kitchen"],
        ["FBA Fulfillment", "$3.20 – $6.85+", "Depends on dimensional weight tier"],
        ["Q4 Storage / Inbound", "$0.30 – $1.20 / unit", "Higher Oct–Dec storage rates"],
        ["Return Admin Fee", "20% of referral fee (up to $5)", "Plus unrecoverable FBA shipping"]
      ]
    }
  },
  tips: [
    {
      title: "Optimize Packaging to Drop 1 Size Tier",
      detail: "Shaving 0.2 inches off box height can move a product from Large Standard to Small Standard, saving $0.80–$1.40 per unit permanently."
    },
    {
      title: "Track TACoS Alongside ACOS",
      detail: "ACOS measures ad-attributed sales only, whereas TACoS divides total ad spend by total store revenue to show organic ranking lift."
    },
    {
      title: "Don't Ignore Q4 Peak Storage",
      detail: "Standard storage triples in Q4; avoid over-sending slow inventory in September to protect annual net margin."
    },
    {
      title: "Target 25%+ Pre-Ad Margin",
      detail: "Categories with aggressive Sponsored Products CPCs rarely stay profitable unless pre-ad margin exceeds 35–40%."
    }
  ],
  faqs: [
    {
      q: "What is a good Break-Even ACOS on Amazon FBA?",
      a: "Most healthy private-label SKUs have a Break-Even ACOS between 30% and 45%, leaving room for 15–25% actual ACOS and solid profit."
    },
    {
      q: "Does Amazon refund FBA fees when a buyer returns an item?",
      a: "Amazon refunds 80% of the referral commission (keeping up to $5 as a refund administration fee) but does not refund the outbound FBA fulfillment fee."
    },
    {
      q: "What should be included in Landed COGS?",
      a: "Include unit manufacturing cost, prep/labeling, ocean or air freight, customs duties/tariffs, and domestic drayage to Amazon FCs."
    },
    {
      q: "How do I convert Break-Even ACOS to Break-Even ROAS?",
      a: "Break-Even ROAS is simply 100 divided by Break-Even ACOS (e.g., 40% ACOS equals 2.50x ROAS)."
    }
  ],
  testCases: [
    {
      name: "Standard $34.99 private label unit",
      inputs: { salePrice: 34.99, referralPct: 15, fbaFee: 5.4, storageFee: 0.45, landedCogs: 8.5, acosPct: 18, returnRatePct: 4 },
      expected: { kpiId: "netProfit", approx: 8.84, tolerance: 0.05 }
    },
    {
      name: "High ACOS compressed margin scenario",
      inputs: { salePrice: 25, referralPct: 15, fbaFee: 4.5, storageFee: 0.5, landedCogs: 7, acosPct: 35, returnRatePct: 0 },
      expected: { kpiId: "netProfit", approx: 0.5, tolerance: 0.05 }
    }
  ]
};

export function compute(values) {
  const salePrice = Math.max(0, Number(values.salePrice) || 0);
  const referralPct = Math.max(0, Number(values.referralPct) || 0) / 100;
  const fbaFee = Math.max(0, Number(values.fbaFee) || 0);
  const storageFee = Math.max(0, Number(values.storageFee) || 0);
  const landedCogs = Math.max(0, Number(values.landedCogs) || 0);
  const acosPct = Math.max(0, Number(values.acosPct) || 0) / 100;
  const returnRatePct = Math.max(0, Number(values.returnRatePct) || 0) / 100;

  const referralFee = salePrice * referralPct;
  const returnLoss = (fbaFee + referralFee * 0.2) * returnRatePct;
  const totalAmazonFees = referralFee + fbaFee + storageFee + returnLoss;
  const adSpend = salePrice * acosPct;
  const netProfit = salePrice - totalAmazonFees - landedCogs - adSpend;
  const netMargin = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;
  const breakEvenAcos = salePrice > 0 ? ((salePrice - totalAmazonFees - landedCogs) / salePrice) * 100 : 0;
  const breakEvenRoas = breakEvenAcos > 0 ? 100 / breakEvenAcos : 0;
  const denom = salePrice > 0 ? salePrice : 1;

  return {
    kpis: [
      { id: "netProfit", label: "Net Profit / Unit", value: netProfit, format: "currency", highlight: true },
      { id: "netMargin", label: "Net Margin", value: netMargin, format: "percent" },
      { id: "breakEvenAcos", label: "Break-Even ACOS", value: breakEvenAcos, format: "percent" },
      { id: "breakEvenRoas", label: "Break-Even ROAS", value: breakEvenRoas, format: "number" }
    ],
    breakdown: [
      { label: "Net Profit", amount: Math.max(0, netProfit), share: Math.max(0, (netProfit / denom) * 100), colorKey: "net" },
      { label: "Amazon Referral, FBA & Storage", amount: totalAmazonFees, share: (totalAmazonFees / denom) * 100, colorKey: "fee" },
      { label: "PPC Ad Spend", amount: adSpend, share: (adSpend / denom) * 100, colorKey: "processing" },
      { label: "Landed COGS", amount: landedCogs, share: (landedCogs / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: netMargin >= 20 ? "good" : netMargin > 5 ? "warn" : "bad",
      title: netMargin >= 20 ? "Healthy FBA profit margin" : netMargin > 5 ? "Margin sensitive to CPC spikes" : "Losing money per unit",
      detail: "Keep PPC ACOS below " + Math.max(0, breakEvenAcos).toFixed(1) + "% to remain profitable."
    }
  };
}
