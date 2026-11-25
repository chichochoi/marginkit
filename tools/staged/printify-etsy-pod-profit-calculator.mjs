export const meta = {
  slug: "printify-etsy-pod-profit-calculator",
  category: "ecommerce",
  shortTitle: "Printify + Etsy POD Calculator",
  title: "Printify + Etsy Print-on-Demand Profit Calculator (2026)",
  metaDescription: "Calculate real Print-on-Demand profit margins selling Printify products on Etsy, including Printify Premium 20% discount, shipping, and Etsy fees.",
  heroSubtitle: "Test retail pricing on tees, hoodies, and mugs after Printify production costs and Etsy's combined fee stack.",
  badge: "US Print-on-Demand",
  updatedAt: "2026-11-25",
  queuedOrder: 4,
  inputs: [
    { id: "salePrice", label: "Etsy Item Price", type: "number", defaultValue: 28, min: 0, step: 0.01, prefix: "$" },
    { id: "shippingCharged", label: "Shipping Charged to Buyer", type: "number", defaultValue: 4.75, min: 0, step: 0.01, prefix: "$" },
    { id: "podBaseCost", label: "Printify Base Blank + Print Cost", type: "number", defaultValue: 11.5, min: 0, step: 0.1, prefix: "$" },
    { id: "podShippingCost", label: "Printify Fulfillment Shipping", type: "number", defaultValue: 4.75, min: 0, step: 0.05, prefix: "$" },
    { id: "printifyPremium", label: "Printify Premium Active (20% off base cost)", type: "checkbox", defaultValue: false },
    { id: "offsiteAds", label: "Etsy Offsite Ads Order (15%)", type: "checkbox", defaultValue: false }
  ],
  howItWorks: {
    summary: "Combines Printify blank printing and US shipping costs with Etsy's $0.20 listing, 6.5% transaction, and 3% + $0.25 payment fees.",
    formulaSteps: [
      "Gross Buyer Checkout = Etsy Item Price + Shipping Charged",
      "Effective Printify Product Cost = Base Cost × 0.80 (if Printify Premium active)",
      "Etsy Fees = $0.20 + (Gross × 6.5%) + (Gross × 3.0% + $0.25) + (Gross × 15% if Offsite Ads)",
      "Net POD Profit = Gross - Etsy Fees - Effective Printify Cost - Printify Shipping"
    ],
    feeTable: {
      headers: ["POD Margin Driver", "Typical US Value", "Optimization Lever"],
      rows: [
        ["Bella+Canvas 3001 / Gildan 18000", "$9.50 – $19.50 base", "20% discount w/ Printify Premium"],
        ["US Standard Shipping", "$4.75 – $8.50", "Pass through or bake into item price"],
        ["Etsy Combined Fees", "9.5% + $0.45 (+12–15% ads)", "Calculated on item + buyer shipping"]
      ]
    }
  },
  tips: [
    {
      title: "Get Printify Premium Around 12–15 Orders/Month",
      detail: "A 20% discount saves roughly $2.20–$4.00 per hoodie or tee, quickly covering the ~$29/mo subscription cost."
    },
    {
      title: "Avoid Price Wars on Basic Tees",
      detail: "Selling a Print-on-Demand shirt at $19.99 with free shipping leaves virtually $0 after Printify shipping and Etsy fees."
    },
    {
      title: "Offer Multi-Item Cart Discounts",
      detail: "Printify reduces shipping dramatically on additional items in the same order, boosting net profit per cart."
    },
    {
      title: "Include Mockup & Etsy Ads Testing Reserve",
      detail: "Reserve $2–$3 per unit for Etsy Ads launch testing on new seasonal designs."
    }
  ],
  faqs: [
    {
      q: "How much profit should I aim for per Etsy Print-on-Demand shirt?",
      a: "Target at least $8 to $12 net profit per shirt (25%–35% margin) so an occasional 12%–15% Offsite Ad order remains profitable."
    },
    {
      q: "Does Printify Premium discount shipping costs?",
      a: "No. Printify Premium provides up to 20% off product blank and printing costs only; carrier shipping rates stay fixed."
    },
    {
      q: "Should I offer free shipping on Etsy POD listings?",
      a: "Etsy charges the exact same 9.5% fee whether shipping is separate ($28 + $4.75) or bundled ($32.75 free shipping)—test conversion rate differences."
    },
    {
      q: "What happens when a buyer orders two different Printify providers?",
      a: "Separate print providers ship separately and charge two full first-item shipping rates, so unify your shop around one US print partner when possible."
    }
  ],
  testCases: [
    {
      name: "Standard $28 tee without Premium or Offsite Ads",
      inputs: { salePrice: 28, shippingCharged: 4.75, podBaseCost: 11.5, podShippingCost: 4.75, printifyPremium: false, offsiteAds: false },
      expected: { kpiId: "netProfit", approx: 12.94, tolerance: 0.05 }
    },
    {
      name: "With Printify Premium 20% off",
      inputs: { salePrice: 28, shippingCharged: 4.75, podBaseCost: 11.5, podShippingCost: 4.75, printifyPremium: true, offsiteAds: false },
      expected: { kpiId: "netProfit", approx: 15.24, tolerance: 0.05 }
    }
  ]
};

export function compute(values) {
  const salePrice = Math.max(0, Number(values.salePrice) || 0);
  const shippingCharged = Math.max(0, Number(values.shippingCharged) || 0);
  const podBase = Math.max(0, Number(values.podBaseCost) || 0);
  const podShip = Math.max(0, Number(values.podShippingCost) || 0);
  const premium = Boolean(values.printifyPremium);
  const offsite = Boolean(values.offsiteAds);

  const gross = salePrice + shippingCharged;
  const effectivePod = premium ? podBase * 0.8 : podBase;
  const etsyCore = gross > 0 ? 0.2 + gross * 0.065 + gross * 0.03 + 0.25 : 0;
  const offsiteFee = offsite ? Math.min(100, gross * 0.15) : 0;
  const totalEtsy = etsyCore + offsiteFee;
  const totalPod = effectivePod + podShip;
  const netProfit = gross - totalEtsy - totalPod;
  const netMargin = gross > 0 ? (netProfit / gross) * 100 : 0;
  const denom = gross > 0 ? gross : 1;

  return {
    kpis: [
      { id: "netProfit", label: "Net Profit / Order", value: netProfit, format: "currency", highlight: true },
      { id: "netMargin", label: "Net Margin", value: netMargin, format: "percent" },
      { id: "totalPod", label: "Printify Fulfillment Cost", value: totalPod, format: "currency" },
      { id: "totalEtsy", label: "Total Etsy Fees", value: totalEtsy, format: "currency" }
    ],
    breakdown: [
      { label: "Net Profit", amount: Math.max(0, netProfit), share: Math.max(0, (netProfit / denom) * 100), colorKey: "net" },
      { label: "Etsy Fees", amount: totalEtsy, share: (totalEtsy / denom) * 100, colorKey: "fee" },
      { label: "Printify Blank + Shipping", amount: totalPod, share: (totalPod / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: netMargin >= 28 ? "good" : netMargin > 10 ? "warn" : "bad",
      title: netMargin >= 28 ? "Healthy POD unit margin" : netMargin > 10 ? "Tight POD cushion" : "Insufficient margin for ads",
      detail: "Net profit is $" + netProfit.toFixed(2) + " per unit (" + netMargin.toFixed(1) + "% margin)."
    }
  };
}
