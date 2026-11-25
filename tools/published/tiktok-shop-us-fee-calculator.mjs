export const meta = {
  slug: "tiktok-shop-us-fee-calculator",
  category: "ecommerce",
  shortTitle: "TikTok Shop Fee Calculator",
  title: "TikTok Shop US Seller Fee & Affiliate Margin Calculator (2026)",
  metaDescription: "Calculate 2026 TikTok Shop US 6% referral fees, creator affiliate commissions, seller coupons, shipping, and break-even affiliate payout rates.",
  heroSubtitle: "Model creator commissions and TikTok Shop US marketplace fees before launching viral affiliate campaigns.",
  badge: "2026 TikTok Shop US",
  updatedAt: "2026-11-25",
  inputs: [
    { id: "salePrice", label: "Listed Retail Price", type: "number", defaultValue: 29.99, min: 0, step: 0.01, prefix: "$" },
    { id: "sellerDiscount", label: "Seller-Funded Discount / Coupon", type: "number", defaultValue: 3.0, min: 0, step: 0.01, prefix: "$" },
    { id: "commissionPct", label: "TikTok Shop US Referral Fee", type: "number", defaultValue: 6, min: 0, max: 20, step: 0.5, suffix: "%" },
    { id: "affiliatePct", label: "Creator Affiliate Commission", type: "number", defaultValue: 15, min: 0, max: 50, step: 0.5, suffix: "%" },
    { id: "shippingCost", label: "Seller Net Shipping Cost", type: "number", defaultValue: 4.25, min: 0, step: 0.05, prefix: "$" },
    { id: "cogs", label: "Product COGS", type: "number", defaultValue: 6.5, min: 0, step: 0.05, prefix: "$" },
    { id: "adSpend", label: "Shop Ads Cost / Order", type: "number", defaultValue: 2.0, min: 0, step: 0.1, prefix: "$" }
  ],
  howItWorks: {
    summary: "Applies TikTok Shop's US referral commission and creator affiliate rate to the post-discount buyer checkout amount.",
    formulaSteps: [
      "Net Customer Price = Listed Price - Seller-Funded Discount",
      "Platform Commission = Net Customer Price × Referral % (6% standard US rate)",
      "Creator Commission = Net Customer Price × Affiliate %",
      "Net Profit = Net Customer Price - Platform Commission - Creator Commission - Shipping - COGS - Shop Ads"
    ],
    feeTable: {
      headers: ["TikTok Shop US Item", "Typical Rate", "Paid By"],
      rows: [
        ["Standard Referral Fee", "6.0% (5% jewelry/select)", "Deducted from seller settlement"],
        ["Open/Target Affiliate Rate", "10% – 25% typical", "Only on affiliate-attributed sales"],
        ["Flash Sale / Seller Voucher", "Seller-defined", "Reduces commission base before payout"],
        ["FBT / Seller Shipping", "$3.50 – $6.00+", "Depends on shipping subsidy tier"]
      ]
    }
  },
  tips: [
    {
      title: "Never Layer High Discounts and 25% Affiliate Rates Together",
      detail: "Stacking a 20% flash coupon on top of a 20% creator commission quickly erases net profit once shipping is paid."
    },
    {
      title: "Test Higher Affiliate % With Zero Shop Ads",
      detail: "Offering creators 18–20% with $0 paid ad spend often beats 10% affiliate + heavy paid Shop Ads."
    },
    {
      title: "Factor Free Sample Inventory Cost Separately",
      detail: "Tracking sample seeding conversion rates separately keeps per-order unit economics clean."
    },
    {
      title: "Use Multipack SKUs to Offset Shipping",
      detail: "A 2-pack at $39 instead of a single $22 unit keeps shipping nearly identical while doubling contribution dollars."
    }
  ],
  faqs: [
    {
      q: "What is TikTok Shop's standard US commission fee in 2026?",
      a: "Most US product categories pay a 6% referral fee (inclusive of payment processing), while certain categories like select jewelry carry 5%."
    },
    {
      q: "Are creator affiliate fees calculated before or after seller discounts?",
      a: "Affiliate commissions are calculated on the actual customer payment after seller-funded coupons or flash discounts, excluding sales tax."
    },
    {
      q: "What happens if TikTok funds a platform coupon?",
      a: "Platform-funded subsidies do not reduce your settlement payout, whereas seller-funded coupons come directly out of your net price."
    },
    {
      q: "What affiliate percentage attracts top US creators?",
      a: "Open collaboration rates of 15% to 20% generally attract active TikTok Shop affiliates while keeping healthy margins on 4x+ markup items."
    }
  ],
  testCases: [
    {
      name: "Standard $29.99 item with $3 discount and 15% affiliate",
      inputs: { salePrice: 29.99, sellerDiscount: 3, commissionPct: 6, affiliatePct: 15, shippingCost: 4.25, cogs: 6.5, adSpend: 2 },
      expected: { kpiId: "netProfit", approx: 8.57, tolerance: 0.05 }
    },
    {
      name: "Zero discount organic order",
      inputs: { salePrice: 30, sellerDiscount: 0, commissionPct: 6, affiliatePct: 10, shippingCost: 4, cogs: 8, adSpend: 0 },
      expected: { kpiId: "netProfit", approx: 13.2, tolerance: 0.05 }
    }
  ]
};

export function compute(values) {
  const salePrice = Math.max(0, Number(values.salePrice) || 0);
  const sellerDiscount = Math.max(0, Number(values.sellerDiscount) || 0);
  const commissionRate = Math.max(0, Number(values.commissionPct) || 0) / 100;
  const affiliateRate = Math.max(0, Number(values.affiliatePct) || 0) / 100;
  const shippingCost = Math.max(0, Number(values.shippingCost) || 0);
  const cogs = Math.max(0, Number(values.cogs) || 0);
  const adSpend = Math.max(0, Number(values.adSpend) || 0);

  const customerPay = Math.max(0, salePrice - sellerDiscount);
  const platformFee = customerPay * commissionRate;
  const affiliateFee = customerPay * affiliateRate;
  const netProfit = customerPay - platformFee - affiliateFee - shippingCost - cogs - adSpend;
  const netMargin = customerPay > 0 ? (netProfit / customerPay) * 100 : 0;
  const maxAffiliatePct = customerPay > 0
    ? Math.max(0, ((customerPay - platformFee - shippingCost - cogs - adSpend) / customerPay) * 100)
    : 0;
  const denom = customerPay > 0 ? customerPay : 1;

  return {
    kpis: [
      { id: "netProfit", label: "Net Profit / Order", value: netProfit, format: "currency", highlight: true },
      { id: "netMargin", label: "Net Margin", value: netMargin, format: "percent" },
      { id: "totalCommissions", label: "TikTok + Creator Fees", value: platformFee + affiliateFee, format: "currency" },
      { id: "maxAffiliatePct", label: "Max Break-Even Affiliate %", value: maxAffiliatePct, format: "percent" }
    ],
    breakdown: [
      { label: "Net Profit", amount: Math.max(0, netProfit), share: Math.max(0, (netProfit / denom) * 100), colorKey: "net" },
      { label: "TikTok Referral & Creator Fee", amount: platformFee + affiliateFee, share: ((platformFee + affiliateFee) / denom) * 100, colorKey: "fee" },
      { label: "Shop Ads", amount: adSpend, share: (adSpend / denom) * 100, colorKey: "processing" },
      { label: "COGS & Shipping", amount: cogs + shippingCost, share: ((cogs + shippingCost) / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: netMargin >= 22 ? "good" : netMargin > 5 ? "warn" : "bad",
      title: netMargin >= 22 ? "Strong TikTok Shop contribution margin" : netMargin > 5 ? "Thin margin—trim discount or ad spend" : "Order loses money",
      detail: "You can offer creators up to " + maxAffiliatePct.toFixed(1) + "% commission before hitting $0 unit profit."
    }
  };
}
