export const meta = {
  slug: "etsy-fee-profit-calculator",
  category: "ecommerce",
  shortTitle: "Etsy Fee & Profit Calculator",
  title: "Etsy Seller Fee & Net Profit Calculator (2026 US)",
  metaDescription: "Calculate exact 2026 Etsy listing, 6.5% transaction, payment processing, and Offsite Ads fees to find your true net profit and break-even price.",
  heroSubtitle: "Model every 2026 Etsy fee layer—including shipping transaction fees and Offsite Ads—before setting your listing price.",
  badge: "2026 Etsy US Rates",
  updatedAt: "2026-11-25",
  inputs: [
    { id: "salePrice", label: "Item Sale Price", type: "number", defaultValue: 45, min: 0, step: 0.01, prefix: "$" },
    { id: "shippingCharged", label: "Shipping Charged to Buyer", type: "number", defaultValue: 5, min: 0, step: 0.01, prefix: "$" },
    { id: "cogs", label: "Product / Materials Cost (COGS)", type: "number", defaultValue: 12, min: 0, step: 0.01, prefix: "$" },
    { id: "shippingCost", label: "Actual Label & Packaging Cost", type: "number", defaultValue: 4.5, min: 0, step: 0.01, prefix: "$" },
    {
      id: "offsiteAds",
      label: "Offsite Ads Attribution",
      type: "select",
      defaultValue: "0",
      options: [
        { value: "0", label: "No Offsite Ads on this order (0%)" },
        { value: "12", label: "Mandatory Over $10k/yr Revenue (12%)" },
        { value: "15", label: "Standard Under $10k/yr Revenue (15%)" }
      ],
      help: "Etsy charges 12% or 15% only on orders attributed to an Offsite Ad click."
    },
    { id: "includeListingFee", label: "Include $0.20 Etsy Listing Renewal Fee", type: "checkbox", defaultValue: true }
  ],
  howItWorks: {
    summary: "Etsy applies both its 6.5% transaction fee and 3% + $0.25 Etsy Payments fee to the combined total of item price plus buyer-paid shipping.",
    formulaSteps: [
      "Gross Order Total = Item Sale Price + Shipping Charged to Buyer",
      "Transaction Fee = Gross Order Total × 6.5% (applies to item and shipping)",
      "Etsy Payments Fee = (Gross Order Total × 3.0%) + $0.25",
      "Offsite Ads Fee = Gross Order Total × (0%, 12%, or 15%)",
      "Net Profit = Gross Order Total - Listing Fee ($0.20) - Transaction Fee - Payment Fee - Offsite Ads - COGS - Label Cost"
    ],
    feeTable: {
      headers: ["Etsy US Fee Component", "2026 Standard Rate", "Fee Base"],
      rows: [
        ["Listing Fee", "$0.20 per unit sold", "Flat per listing / auto-renew"],
        ["Transaction Fee", "6.5%", "Item price + shipping charged"],
        ["Etsy Payments", "3.0% + $0.25", "Total buyer checkout"],
        ["Offsite Ads (Optional / Mandatory)", "15% (<$10k) or 12% (>$10k)", "Attributed order total (capped at $100)"]
      ]
    }
  },
  tips: [
    {
      title: "Price for Mandatory 12% Offsite Ads",
      detail: "Once your shop crosses $10,000 in trailing 12-month sales, Offsite Ads become permanent. Build a 3–5% blended ad reserve into every SKU."
    },
    {
      title: "Stop Subsidizing Free Shipping Losses",
      detail: "Whether you charge $5 shipping separately or roll $5 into the item price, Etsy charges the exact same 9.5% combined fee base."
    },
    {
      title: "Watch Sub-$12 Listings",
      detail: "Fixed $0.45 fees ($0.20 listing + $0.25 payment) consume nearly 5% extra on a $10 item. Bundle stickers or digital items into packs."
    },
    {
      title: "Separate Packaging From COGS",
      detail: "Poly mailers, thank-you cards, and thermal labels typically add $0.40–$0.95 per shipment and belong in actual shipping cost."
    }
  ],
  faqs: [
    {
      q: "Does Etsy charge the 6.5% transaction fee on shipping?",
      a: "Yes. Etsy charges the 6.5% transaction fee on both the item price and any shipping amount you collect from the buyer."
    },
    {
      q: "Is the $0.20 listing fee charged every time an item sells?",
      a: "Yes. Even if you list quantity 50, Etsy charges a $0.20 auto-renewal fee for each unit purchased."
    },
    {
      q: "Are Etsy Offsite Ads charged on every order?",
      a: "No. You only pay the 12% or 15% fee when a buyer clicks an Etsy Offsite Ad and purchases within 30 days, capped at $100 per order."
    },
    {
      q: "Does this calculator include sales tax?",
      a: "Etsy acts as a marketplace facilitator and remits US state sales tax automatically. Processing fees apply to gross checkout; verify small state tax rounding differences in your Payment Account."
    }
  ],
  testCases: [
    {
      name: "Standard $45 item + $5 shipping without Offsite Ads",
      inputs: { salePrice: 45, shippingCharged: 5, cogs: 12, shippingCost: 4.5, offsiteAds: "0", includeListingFee: true },
      expected: { kpiId: "netProfit", approx: 28.3, tolerance: 0.05 }
    },
    {
      name: "Attributed 15% Offsite Ads order",
      inputs: { salePrice: 45, shippingCharged: 5, cogs: 12, shippingCost: 4.5, offsiteAds: "15", includeListingFee: true },
      expected: { kpiId: "netProfit", approx: 20.8, tolerance: 0.05 }
    }
  ]
};

export function compute(values) {
  const salePrice = Math.max(0, Number(values.salePrice) || 0);
  const shippingCharged = Math.max(0, Number(values.shippingCharged) || 0);
  const cogs = Math.max(0, Number(values.cogs) || 0);
  const shippingCost = Math.max(0, Number(values.shippingCost) || 0);
  const offsiteRate = Math.max(0, Number(values.offsiteAds) || 0) / 100;
  const includeListing = Boolean(values.includeListingFee);

  const gross = salePrice + shippingCharged;
  const listingFee = includeListing && gross > 0 ? 0.2 : 0;
  const txFee = gross * 0.065;
  const payFee = gross > 0 ? gross * 0.03 + 0.25 : 0;
  const offsiteFee = Math.min(100, gross * offsiteRate);
  const totalEtsyFees = listingFee + txFee + payFee + offsiteFee;
  const totalDirectCosts = cogs + shippingCost;
  const netProfit = gross - totalEtsyFees - totalDirectCosts;
  const netMargin = gross > 0 ? (netProfit / gross) * 100 : 0;
  const denom = gross > 0 ? gross : 1;

  const pctRate = 0.065 + 0.03 + offsiteRate;
  const fixedTotal = totalDirectCosts + listingFee + (gross > 0 ? 0.25 : 0.25);
  const breakEvenGross = pctRate < 1 ? fixedTotal / (1 - pctRate) : 0;
  const breakEvenPrice = Math.max(0, breakEvenGross - shippingCharged);

  return {
    kpis: [
      { id: "netProfit", label: "Net Profit", value: netProfit, format: "currency", highlight: true },
      { id: "netMargin", label: "Net Margin", value: netMargin, format: "percent" },
      { id: "totalFees", label: "Total Etsy Fees", value: totalEtsyFees, format: "currency" },
      { id: "breakEvenPrice", label: "Break-Even Item Price", value: breakEvenPrice, format: "currency" }
    ],
    breakdown: [
      { label: "Net Profit", amount: Math.max(0, netProfit), share: Math.max(0, (netProfit / denom) * 100), colorKey: "net" },
      { label: "Transaction & Listing Fees", amount: txFee + listingFee + offsiteFee, share: ((txFee + listingFee + offsiteFee) / denom) * 100, colorKey: "fee" },
      { label: "Etsy Payments Processing", amount: payFee, share: (payFee / denom) * 100, colorKey: "processing" },
      { label: "COGS & Label Cost", amount: totalDirectCosts, share: (totalDirectCosts / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: netMargin >= 25 ? "good" : netMargin > 5 ? "warn" : "bad",
      title: netMargin >= 25 ? "Strong Etsy unit margin" : netMargin > 5 ? "Tight margin—watch Offsite Ads" : "Unprofitable order",
      detail: "Etsy keeps " + ((totalEtsyFees / denom) * 100).toFixed(1) + "% of gross revenue on this order."
    }
  };
}
