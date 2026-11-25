export const meta = {
  slug: "ebay-final-value-fee-calculator",
  category: "ecommerce",
  shortTitle: "eBay Final Value Fee Calculator",
  title: "eBay US Final Value Fee & Net Profit Calculator (2026)",
  metaDescription: "Calculate 2026 eBay US Final Value Fees (13.25% + $0.40), Promoted Listings ad rates, shipping costs, and true seller profit margin per order.",
  heroSubtitle: "Model eBay Managed Payments commissions and Promoted Listings costs before setting Buy It Now prices.",
  badge: "2026 eBay US Rates",
  updatedAt: "2026-11-25",
  queuedOrder: 1,
  inputs: [
    { id: "salePrice", label: "Item Sale Price", type: "number", defaultValue: 60, min: 0, step: 0.01, prefix: "$" },
    { id: "shippingCharged", label: "Shipping Charged to Buyer", type: "number", defaultValue: 8, min: 0, step: 0.01, prefix: "$" },
    { id: "cogs", label: "Item Cost (COGS)", type: "number", defaultValue: 20, min: 0, step: 0.01, prefix: "$" },
    { id: "shippingCost", label: "Actual Label & Box Cost", type: "number", defaultValue: 6.5, min: 0, step: 0.01, prefix: "$" },
    { id: "fvfPct", label: "Category Final Value Fee %", type: "number", defaultValue: 13.25, min: 0, max: 25, step: 0.25, suffix: "%" },
    { id: "promotedPct", label: "Promoted Listings Ad Rate", type: "number", defaultValue: 4, min: 0, max: 30, step: 0.5, suffix: "%" }
  ],
  howItWorks: {
    summary: "eBay calculates Final Value Fees and Promoted Listings percentages against the total buyer order amount, including item price and shipping.",
    formulaSteps: [
      "Gross Order Base = Item Sale Price + Shipping Charged to Buyer",
      "Final Value Fee = (Gross Order Base × Category FVF %) + ($0.40 if order > $10, else $0.30)",
      "Promoted Listings Fee = Gross Order Base × Promoted Ad Rate %",
      "Net Profit = Gross Order Base - Final Value Fee - Promoted Listings Fee - COGS - Label Cost"
    ],
    feeTable: {
      headers: ["eBay US Fee Layer", "2026 Standard Rate", "Applies To"],
      rows: [
        ["Most Categories FVF", "13.25% (up to $7,500)", "Item + shipping + sales tax base"],
        ["Per-Order Fixed Fee", "$0.40 (>$10) / $0.30 (<=$10)", "Each checkout transaction"],
        ["eBay Store Discount", "~0.9% – 1.25% lower FVF", "Basic/Premium/Anchor stores"],
        ["Promoted Listings General", "Seller-set % (2%–15%+)", "Orders attributed within 30 days"]
      ]
    }
  },
  tips: [
    {
      title: "Compare Store Subscription Break-Even",
      detail: "A Starter or Basic eBay Store cuts Final Value Fees in many categories by ~0.9%–1.25%, paying for itself around $2,500/mo GMV."
    },
    {
      title: "Check Category Caps for High-Ticket Gear",
      detail: "For items over $7,500 in select categories, eBay drops the Final Value Fee to 2.35% on the portion above $7,500."
    },
    {
      title: "Audit Promoted Listings Attribution",
      detail: "Keep General campaign ad rates around 2%–5% for high-demand SKUs rather than auto-accepting high suggested rates."
    },
    {
      title: "Factor Dimensional Weight Before Free Shipping",
      detail: "Offering free shipping works best when your shipping zone spread stays under $4 difference coast-to-coast."
    }
  ],
  faqs: [
    {
      q: "Does eBay charge Final Value Fees on shipping?",
      a: "Yes. eBay calculates its Final Value Fee percentage on the total amount of the sale, including item price, shipping, and handling."
    },
    {
      q: "When does eBay charge $0.30 vs $0.40 per order?",
      a: "Orders of $10.00 or less carry a $0.30 per-order fee, while orders over $10.00 carry a $0.40 per-order fixed fee."
    },
    {
      q: "Are Promoted Listings fees charged if the item sells organically?",
      a: "With Promoted Listings General, you pay the ad rate only if the buyer clicked your promoted ad within 30 days before buying."
    },
    {
      q: "Does this model include sales tax fee drag?",
      a: "eBay also applies the percentage FVF to collected US sales tax; add roughly 0.8%–1.1% extra buffer for tax-bearing states."
    }
  ],
  testCases: [
    {
      name: "$60 item + $8 shipping with 4% Promoted Listings",
      inputs: { salePrice: 60, shippingCharged: 8, cogs: 20, shippingCost: 6.5, fvfPct: 13.25, promotedPct: 4 },
      expected: { kpiId: "netProfit", approx: 29.37, tolerance: 0.05 }
    },
    {
      name: "Sub-$10 order uses $0.30 per-order fee",
      inputs: { salePrice: 8, shippingCharged: 0, cogs: 2, shippingCost: 1.5, fvfPct: 13.25, promotedPct: 0 },
      expected: { kpiId: "netProfit", approx: 3.14, tolerance: 0.05 }
    }
  ]
};

export function compute(values) {
  const salePrice = Math.max(0, Number(values.salePrice) || 0);
  const shippingCharged = Math.max(0, Number(values.shippingCharged) || 0);
  const cogs = Math.max(0, Number(values.cogs) || 0);
  const shippingCost = Math.max(0, Number(values.shippingCost) || 0);
  const fvfRate = Math.max(0, Number(values.fvfPct) || 0) / 100;
  const promotedRate = Math.max(0, Number(values.promotedPct) || 0) / 100;

  const gross = salePrice + shippingCharged;
  const orderFixed = gross > 10 ? 0.4 : gross > 0 ? 0.3 : 0;
  const fvfFee = gross * fvfRate + orderFixed;
  const promotedFee = gross * promotedRate;
  const totalFees = fvfFee + promotedFee;
  const netProfit = gross - totalFees - cogs - shippingCost;
  const netMargin = gross > 0 ? (netProfit / gross) * 100 : 0;
  const denom = gross > 0 ? gross : 1;

  return {
    kpis: [
      { id: "netProfit", label: "Net Profit", value: netProfit, format: "currency", highlight: true },
      { id: "netMargin", label: "Net Margin", value: netMargin, format: "percent" },
      { id: "totalFees", label: "Total eBay + Ad Fees", value: totalFees, format: "currency" },
      { id: "effectiveFeePct", label: "Effective Fee %", value: (totalFees / denom) * 100, format: "percent" }
    ],
    breakdown: [
      { label: "Net Profit", amount: Math.max(0, netProfit), share: Math.max(0, (netProfit / denom) * 100), colorKey: "net" },
      { label: "eBay Final Value Fee", amount: fvfFee, share: (fvfFee / denom) * 100, colorKey: "fee" },
      { label: "Promoted Listings", amount: promotedFee, share: (promotedFee / denom) * 100, colorKey: "processing" },
      { label: "COGS & Label Cost", amount: cogs + shippingCost, share: ((cogs + shippingCost) / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: netMargin >= 25 ? "good" : netMargin > 8 ? "warn" : "bad",
      title: netMargin >= 25 ? "Healthy eBay resale margin" : netMargin > 8 ? "Moderate margin" : "Thin or negative profit",
      detail: "Combined eBay and Promoted Listings fees consume " + ((totalFees / denom) * 100).toFixed(1) + "% of gross revenue."
    }
  };
}
