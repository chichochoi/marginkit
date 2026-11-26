export const meta = {
  slug: "poshmark-mercari-depop-fee-calculator",
  category: "ecommerce",
  shortTitle: "Poshmark vs Mercari vs Depop Fees",
  title: "Poshmark vs. Mercari vs. Depop Seller Fee Calculator",
  metaDescription: "Compare 2026 Poshmark, Mercari, and Depop US seller fees, payment processing, shipping deductions, and net profit side by side for resellers.",
  heroSubtitle: "Compare 2026 US marketplace commissions, processing fees, and net payout across Poshmark, Mercari, and Depop.",
  badge: "2026 US Rates",
  updatedAt: "2026-11-26",
  queuedOrder: 8,
  inputs: [
    {
      id: "platform",
      label: "Detailed Breakdown Platform",
      type: "select",
      defaultValue: "poshmark",
      options: [
        { value: "poshmark", label: "Poshmark (20% or $2.95)" },
        { value: "mercari", label: "Mercari (10% seller fee)" },
        { value: "depop", label: "Depop US (0% + 3.3% + $0.45)" }
      ],
      help: "All 3 platform profits appear in the KPI cards; select one for the detailed breakdown."
    },
    {
      id: "salePrice",
      label: "Item Sale Price",
      type: "number",
      defaultValue: 45,
      min: 0,
      step: 0.01,
      prefix: "$"
    },
    {
      id: "buyerPaidShipping",
      label: "Buyer-Paid Shipping",
      type: "number",
      defaultValue: 6.49,
      min: 0,
      step: 0.01,
      prefix: "$",
      help: "Standard shipping paid by the buyer (e.g. $6.49 on Poshmark). Mercari 10% and Depop 3.3% apply to shipping."
    },
    {
      id: "sellerShippingCost",
      label: "Seller Shipping Subsidy / Label",
      type: "number",
      defaultValue: 0,
      min: 0,
      step: 0.01,
      prefix: "$",
      help: "Include any Poshmark shipping discount or seller-paid free-shipping label cost."
    },
    {
      id: "itemCost",
      label: "Item Cost (COGS & Supplies)",
      type: "number",
      defaultValue: 14,
      min: 0,
      step: 0.01,
      prefix: "$"
    },
    {
      id: "depopBoost",
      label: "Depop Boosted Listing Fee",
      type: "select",
      defaultValue: "0",
      options: [
        { value: "0", label: "Not Boosted (0%)" },
        { value: "0.12", label: "Boosted — 12% (2026 US Rate)" },
        { value: "0.08", label: "Boosted — 8% (Legacy Listings)" }
      ],
      help: "Depop increased Boosted Listings to 12% for new US listings in 2026 (legacy listings remain 8%)."
    }
  ],
  howItWorks: {
    summary: "Calculates take-home profit across Poshmark, Mercari, and Depop US simultaneously using each platform's 2026 fee base, payment processing formula, and shipping rules.",
    formulaSteps: [
      "Poshmark Fee = $2.95 flat if Item Price < $15, otherwise Item Price × 20% (buyer shipping excluded)",
      "Mercari Seller Fee = (Item Price + Buyer-Paid Shipping) × 10% ($0 separate processing fee)",
      "Depop US Processing = ((Item Price + Buyer-Paid Shipping) × 3.3%) + $0.45 (0% standard commission)",
      "Depop Boosted Fee (if enabled) = Item Price × 12% (2026 US rate) or 8% (legacy listings)",
      "Net Profit = Item Price − Platform Fees − Seller Shipping Subsidy − Item Cost"
    ],
    feeTable: {
      headers: ["Marketplace", "Selling Commission", "Processing Fee", "Fee Applied To"],
      rows: [
        ["Poshmark US", "$2.95 (< $15) or 20% ($15+)", "Included ($0)", "Item sale price only"],
        ["Mercari US", "10% flat seller fee", "$0 (buyer pays 3.6%)", "Item price + buyer-paid shipping"],
        ["Depop US", "0% standard (12% if Boosted)", "3.3% + $0.45", "Processing on item + shipping"]
      ]
    }
  },
  tips: [
    {
      title: "Avoid Poshmark for items under $15",
      detail: "Poshmark's $2.95 minimum equals 24.6% on a $12 sale and 29.5% on a $10 sale; bundle low-ticket pieces or cross-list them to Mercari or Depop."
    },
    {
      title: "Factor buyer-paid shipping into Mercari pricing",
      detail: "Mercari charges its 10% seller fee on both item price and buyer-paid shipping, so heavier packages with $13+ labels quietly raise your effective commission."
    },
    {
      title: "Reserve Depop Boosting for high-margin inventory",
      detail: "At the 2026 US rate of 12% plus 3.3% + $0.45 processing, a boosted Depop sale approaches 16%+ in total fees—price up accordingly before toggling Boost."
    },
    {
      title: "Follow Poshmark Ground Advantage box rules",
      detail: "Poshmark labels ship via USPS Ground Advantage (up to 5 lbs); using Priority Mail boxes or exceeding 5 lbs without a label upgrade triggers $5+ deductions."
    }
  ],
  faqs: [
    {
      q: "Which platform has the lowest seller fees in 2026?",
      a: "For unboosted sales, Depop US charges the lowest fees (0% commission plus 3.3% + $0.45 processing), followed by Mercari (10% flat seller fee) and Poshmark ($2.95 under $15 or 20% on $15+)."
    },
    {
      q: "Does Mercari still charge payment processing fees to sellers?",
      a: "No. Under Mercari's updated US fee schedule, sellers pay a flat 10% selling fee on item price plus buyer-paid shipping with $0 payment processing fee, while buyers pay a 3.6% buyer protection fee."
    },
    {
      q: "How does Depop's Boosted Listing fee work in 2026?",
      a: "Depop charges 0% standard selling commission in the US, but if a buyer purchases within 28 days of clicking a Boosted Listing, an extra 12% fee applies to new US listings created in 2026 (8% for older legacy listings)."
    },
    {
      q: "Does sales tax affect payment processing fees?",
      a: "On Depop, the 3.3% + $0.45 processing fee applies to the total checkout amount including buyer sales tax, which can trim another $0.10 to $0.30 per order depending on the buyer's state."
    }
  ],
  testCases: [
    {
      name: "Standard $45 item (Depop unboosted)",
      inputs: {
        platform: "depop",
        salePrice: 45,
        buyerPaidShipping: 6.49,
        sellerShippingCost: 0,
        itemCost: 14,
        depopBoost: "0"
      },
      expected: { kpiId: "depopNet", approx: 28.85, tolerance: 0.05 }
    },
    {
      name: "Under-$15 item ($12) on Poshmark",
      inputs: {
        platform: "poshmark",
        salePrice: 12,
        buyerPaidShipping: 4.99,
        sellerShippingCost: 0,
        itemCost: 3,
        depopBoost: "0.12"
      },
      expected: { kpiId: "poshmarkNet", approx: 6.05, tolerance: 0.05 }
    },
    {
      name: "Under-$15 item ($12) on Mercari",
      inputs: {
        platform: "mercari",
        salePrice: 12,
        buyerPaidShipping: 4.99,
        sellerShippingCost: 0,
        itemCost: 3,
        depopBoost: "0.12"
      },
      expected: { kpiId: "mercariNet", approx: 7.30, tolerance: 0.05 }
    }
  ]
};

export function compute(values) {
  const platform = values.platform === "mercari" || values.platform === "depop" ? values.platform : "poshmark";
  const salePrice = Math.max(0, Number(values.salePrice) || 0);
  const buyerShipping = Math.max(0, Number(values.buyerPaidShipping) || 0);
  const sellerShipping = Math.max(0, Number(values.sellerShippingCost) || 0);
  const itemCost = Math.max(0, Number(values.itemCost) || 0);
  const boostRaw = Number(values.depopBoost);
  const boostRate = Number.isFinite(boostRaw) && boostRaw >= 0 ? boostRaw : 0;

  const poshCommission = salePrice <= 0 ? 0 : (salePrice < 15 ? Math.min(salePrice, 2.95) : salePrice * 0.20);
  const poshProcessing = 0;
  const poshNet = salePrice - poshCommission - poshProcessing - sellerShipping - itemCost;

  const mercariCommission = salePrice <= 0 ? 0 : (salePrice + buyerShipping) * 0.10;
  const mercariProcessing = 0;
  const mercariNet = salePrice - mercariCommission - mercariProcessing - sellerShipping - itemCost;

  const depopCommission = salePrice <= 0 ? 0 : salePrice * boostRate;
  const depopProcessing = salePrice <= 0 ? 0 : ((salePrice + buyerShipping) * 0.033 + 0.45);
  const depopNet = salePrice - depopCommission - depopProcessing - sellerShipping - itemCost;

  const selectedCommission = platform === "poshmark" ? poshCommission : platform === "mercari" ? mercariCommission : depopCommission;
  const selectedProcessing = platform === "poshmark" ? poshProcessing : platform === "mercari" ? mercariProcessing : depopProcessing;
  const selectedNet = platform === "poshmark" ? poshNet : platform === "mercari" ? mercariNet : depopNet;
  const selectedMargin = salePrice > 0 ? (selectedNet / salePrice) * 100 : 0;
  const totalCost = sellerShipping + itemCost;
  const denom = salePrice > 0 ? salePrice : 1;

  let bestName = "Poshmark";
  let bestNet = poshNet;
  if (mercariNet > bestNet) {
    bestName = "Mercari";
    bestNet = mercariNet;
  }
  if (depopNet > bestNet) {
    bestName = "Depop US";
    bestNet = depopNet;
  }

  const selectedName = platform === "poshmark" ? "Poshmark" : platform === "mercari" ? "Mercari" : "Depop US";
  const diffVsBest = bestNet - selectedNet;
  const tone = selectedMargin >= 20 ? "good" : selectedMargin > 0 ? "warn" : "bad";
  const title = selectedMargin >= 20
    ? ("Strong margin on " + selectedName + " (" + selectedMargin.toFixed(1) + "%)")
    : selectedMargin > 0
      ? ("Thin margin on " + selectedName + " (" + selectedMargin.toFixed(1) + "%)")
      : ("Negative margin on " + selectedName);
  const detail = diffVsBest > 0.01
    ? (bestName + " yields $" + diffVsBest.toFixed(2) + " more net profit ($" + bestNet.toFixed(2) + ") on this sale.")
    : (selectedName + " delivers the highest net payout ($" + selectedNet.toFixed(2) + ") among all three marketplaces.");

  return {
    kpis: [
      { id: "poshmarkNet", label: "Poshmark Net Profit", value: poshNet, format: "currency", highlight: platform === "poshmark" },
      { id: "mercariNet", label: "Mercari Net Profit", value: mercariNet, format: "currency", highlight: platform === "mercari" },
      { id: "depopNet", label: "Depop US Net Profit", value: depopNet, format: "currency", highlight: platform === "depop" },
      { id: "selectedMargin", label: "Selected Net Margin", value: selectedMargin, format: "percent" }
    ],
    breakdown: [
      { label: "Net Profit", amount: Math.max(0, selectedNet), share: Math.max(0, (selectedNet / denom) * 100), colorKey: "net" },
      { label: "Commission / Boost", amount: selectedCommission, share: (selectedCommission / denom) * 100, colorKey: "fee" },
      { label: "Payment Processing", amount: selectedProcessing, share: (selectedProcessing / denom) * 100, colorKey: "processing" },
      { label: "COGS & Seller Shipping", amount: totalCost, share: (totalCost / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: tone,
      title: title,
      detail: detail
    }
  };
}
