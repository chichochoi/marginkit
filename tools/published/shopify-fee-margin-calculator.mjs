export const meta = {
  slug: "shopify-fee-margin-calculator",
  category: "ecommerce",
  shortTitle: "Shopify Fee & Margin Calculator",
  title: "Shopify Transaction Fee, Margin & Break-Even ROAS Calculator",
  metaDescription: "Calculate Shopify Payments processing rates (Basic, Grow, Advanced), third-party gateway surcharges, unit profit margin, and break-even ad ROAS.",
  heroSubtitle: "Check your true DTC profit per order and minimum ad ROAS across Shopify plans.",
  badge: "2026 Shopify US",
  updatedAt: "2026-11-25",
  inputs: [
    { id: "salePrice", label: "Order Subtotal", type: "number", defaultValue: 65, min: 0, step: 0.01, prefix: "$" },
    { id: "shippingCharged", label: "Shipping Collected", type: "number", defaultValue: 0, min: 0, step: 0.01, prefix: "$" },
    { id: "cogs", label: "Landed COGS", type: "number", defaultValue: 18, min: 0, step: 0.01, prefix: "$" },
    { id: "fulfillmentCost", label: "Pick, Pack & Shipping Cost", type: "number", defaultValue: 6, min: 0, step: 0.01, prefix: "$" },
    { id: "adSpend", label: "Ad Spend / CPA per Order", type: "number", defaultValue: 14, min: 0, step: 0.01, prefix: "$" },
    {
      id: "plan",
      label: "Shopify Plan Tier",
      type: "select",
      defaultValue: "basic",
      options: [
        { value: "basic", label: "Basic (2.9% + $0.30 online)" },
        { value: "grow", label: "Grow / Shopify (2.7% + $0.30)" },
        { value: "advanced", label: "Advanced (2.5% + $0.30)" }
      ]
    },
    { id: "thirdPartyGateway", label: "Using External Gateway (adds 0.6%–2% surcharge)", type: "checkbox", defaultValue: false }
  ],
  howItWorks: {
    summary: "Shopify Payments eliminates third-party transaction fees, leaving only card processing plus your fulfillment and customer acquisition costs.",
    formulaSteps: [
      "Gross Revenue = Order Subtotal + Shipping Collected",
      "Processing Fee = (Gross Revenue × Plan Card Rate) + $0.30",
      "External Gateway Surcharge = Gross Revenue × (2.0% Basic, 1.0% Grow, or 0.6% Advanced) if enabled",
      "Contribution Before Ads = Gross Revenue - Processing - Surcharge - COGS - Fulfillment",
      "Break-Even ROAS = Gross Revenue / Contribution Before Ads"
    ],
    feeTable: {
      headers: ["Shopify Plan", "Shopify Payments Online", "External Gateway Fee"],
      rows: [
        ["Basic", "2.9% + $0.30", "+2.0% surcharge"],
        ["Grow (Shopify)", "2.7% + $0.30", "+1.0% surcharge"],
        ["Advanced", "2.5% + $0.30", "+0.6% surcharge"]
      ]
    }
  },
  tips: [
    {
      title: "Calculate Break-Even ROAS Before Scaling Ads",
      detail: "Never rely on Meta or Google Ads dashboard ROAS alone—compare actual platform ROAS against your Break-Even ROAS after fulfillment."
    },
    {
      title: "Audit When to Upgrade From Basic to Grow",
      detail: "The 0.2% processing reduction saves $200 per $100k in monthly GMV. Upgrade only when fee savings exceed the monthly plan price jump."
    },
    {
      title: "Use Bundles to Dilute Fixed Shipping Costs",
      detail: "Adding a high-margin upsell lifts AOV while pick-and-pack and $0.30 fixed fees remain nearly constant."
    },
    {
      title: "Avoid Double-Paying Gateway Surcharges",
      detail: "Enabling Shopify Payments removes the 0.6%–2% external fee on credit cards while still allowing PayPal Express at checkout."
    }
  ],
  faqs: [
    {
      q: "What is Shopify's third-party transaction fee?",
      a: "If you disable Shopify Payments and route cards through another gateway, Shopify adds 2% on Basic, 1% on Grow, or 0.6% on Advanced."
    },
    {
      q: "What does Break-Even ROAS mean?",
      a: "Break-Even ROAS is the minimum return on ad spend needed so your contribution margin covers product, shipping, and processing costs with $0 profit."
    },
    {
      q: "Does this include Shopify monthly subscription fees?",
      a: "No, this models per-order unit economics. Fixed monthly SaaS and app subscriptions should be covered by aggregate monthly contribution profit."
    },
    {
      q: "How are international or Amex cards priced?",
      a: "Shopify Payments may charge higher rates on international cards (+1%) or currency conversions; check your merchant payout report for blended effective rates."
    }
  ],
  testCases: [
    {
      name: "Basic plan $65 AOV standard order",
      inputs: { salePrice: 65, shippingCharged: 0, cogs: 18, fulfillmentCost: 6, adSpend: 14, plan: "basic", thirdPartyGateway: false },
      expected: { kpiId: "netProfit", approx: 24.82, tolerance: 0.05 }
    },
    {
      name: "Advanced plan with external gateway surcharge",
      inputs: { salePrice: 100, shippingCharged: 0, cogs: 25, fulfillmentCost: 8, adSpend: 20, plan: "advanced", thirdPartyGateway: true },
      expected: { kpiId: "netProfit", approx: 43.6, tolerance: 0.05 }
    }
  ]
};

export function compute(values) {
  const salePrice = Math.max(0, Number(values.salePrice) || 0);
  const shippingCharged = Math.max(0, Number(values.shippingCharged) || 0);
  const cogs = Math.max(0, Number(values.cogs) || 0);
  const fulfillmentCost = Math.max(0, Number(values.fulfillmentCost) || 0);
  const adSpend = Math.max(0, Number(values.adSpend) || 0);
  const plan = String(values.plan || "basic");
  const thirdParty = Boolean(values.thirdPartyGateway);

  const rates = {
    basic: { card: 0.029, ext: 0.02 },
    grow: { card: 0.027, ext: 0.01 },
    advanced: { card: 0.025, ext: 0.006 }
  };
  const tier = rates[plan] || rates.basic;
  const gross = salePrice + shippingCharged;
  const processingFee = gross > 0 ? gross * tier.card + 0.3 : 0;
  const surcharge = thirdParty ? gross * tier.ext : 0;
  const preAdProfit = gross - processingFee - surcharge - cogs - fulfillmentCost;
  const netProfit = preAdProfit - adSpend;
  const netMargin = gross > 0 ? (netProfit / gross) * 100 : 0;
  const breakEvenRoas = preAdProfit > 0 ? gross / preAdProfit : 0;
  const denom = gross > 0 ? gross : 1;

  return {
    kpis: [
      { id: "netProfit", label: "Net Profit / Order", value: netProfit, format: "currency", highlight: true },
      { id: "netMargin", label: "Net Margin", value: netMargin, format: "percent" },
      { id: "breakEvenRoas", label: "Break-Even ROAS", value: breakEvenRoas, format: "number" },
      { id: "totalFees", label: "Payment & Gateway Fees", value: processingFee + surcharge, format: "currency" }
    ],
    breakdown: [
      { label: "Net Profit", amount: Math.max(0, netProfit), share: Math.max(0, (netProfit / denom) * 100), colorKey: "net" },
      { label: "Ad Spend (CPA)", amount: adSpend, share: (adSpend / denom) * 100, colorKey: "fee" },
      { label: "Card & Gateway Fees", amount: processingFee + surcharge, share: ((processingFee + surcharge) / denom) * 100, colorKey: "processing" },
      { label: "COGS & Fulfillment", amount: cogs + fulfillmentCost, share: ((cogs + fulfillmentCost) / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: netMargin >= 20 ? "good" : netMargin > 0 ? "warn" : "bad",
      title: netMargin >= 20 ? "Scalable DTC unit economics" : netMargin > 0 ? "Positive but narrow ad cushion" : "Negative contribution margin",
      detail: breakEvenRoas > 0 ? "You need at least " + breakEvenRoas.toFixed(2) + "x ROAS to break even on ad spend." : "Product & fulfillment costs exceed revenue."
    }
  };
}
