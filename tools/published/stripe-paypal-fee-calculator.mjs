export const meta = {
  slug: "stripe-paypal-fee-calculator",
  category: "payments",
  shortTitle: "Stripe & PayPal Fee Calculator",
  title: "Stripe & PayPal Fee Calculator + Reverse Net Payout (2026)",
  metaDescription: "Compare 2026 US Stripe and PayPal merchant processing fees, international card surcharges, and exact reverse invoice totals needed to hit your net target.",
  heroSubtitle: "Calculate net merchant payouts or reverse-solve the exact invoice amount to pass processing fees cleanly.",
  badge: "2026 US Merchant Rates",
  updatedAt: "2026-11-25",
  inputs: [
    { id: "amount", label: "Invoice or Target Net Amount", type: "number", defaultValue: 100, min: 0, step: 0.01, prefix: "$" },
    {
      id: "mode",
      label: "Calculation Mode",
      type: "select",
      defaultValue: "forward",
      options: [
        { value: "forward", label: "Standard: Deduct Fees From Invoice" },
        { value: "reverse", label: "Reverse: Gross Up to Receive Target Net" }
      ]
    },
    {
      id: "processor",
      label: "Payment Processor",
      type: "select",
      defaultValue: "stripe",
      options: [
        { value: "stripe", label: "Stripe Standard Card (2.9% + $0.30)" },
        { value: "paypal_comm", label: "PayPal Commercial / Checkout (3.49% + $0.49)" },
        { value: "paypal_std", label: "PayPal Standard Card / Invoice (2.99% + $0.49)" }
      ]
    },
    { id: "intlCard", label: "International Card Surcharge (+1.5%)", type: "checkbox", defaultValue: false },
    { id: "fxConversion", label: "Currency Conversion Fee (+1.0%)", type: "checkbox", defaultValue: false }
  ],
  howItWorks: {
    summary: "Payment processors deduct a percentage fee plus a fixed cent charge from gross invoice totals, requiring algebraic gross-up to hit an exact net payout.",
    formulaSteps: [
      "Effective Rate = Base Processor % + International Surcharge (1.5%) + FX Conversion (1.0%)",
      "Standard Mode: Fee = (Gross × Effective Rate) + Fixed Cent Fee; Net = Gross - Fee",
      "Reverse Mode: Gross to Charge = (Target Net + Fixed Cent Fee) / (1 - Effective Rate)"
    ],
    feeTable: {
      headers: ["Processor Tier", "Base US Rate", "Cross-Border Add-On"],
      rows: [
        ["Stripe Online Card", "2.90% + $0.30", "+1.5% intl / +1.0% FX"],
        ["PayPal Commercial / Checkout", "3.49% + $0.49", "+1.5% intl / +FX spread"],
        ["PayPal Card / Invoice", "2.99% + $0.49", "+1.5% intl"]
      ]
    }
  },
  tips: [
    {
      title: "Use Reverse Math Correctly",
      detail: "Adding 2.9% + $0.30 directly to a $100 invoice still leaves you short because the processor takes 2.9% of the new higher total."
    },
    {
      title: "Switch B2B Invoices Above $1,500 to ACH",
      detail: "Stripe ACH Direct Debit costs 0.8% capped at $5, saving $24+ on a single $1,000 client retainer compared to card rails."
    },
    {
      title: "Watch International + FX Stacking",
      detail: "Cross-border corporate cards with currency conversion push total Stripe processing to 5.4% + $0.30."
    },
    {
      title: "Check Local Surcharge Laws Before Passing Fees",
      detail: "Instead of labeling a line-item credit card surcharge where restricted, build processing costs into your standard project pricing."
    }
  ],
  faqs: [
    {
      q: "Why does reverse fee calculation give a higher number than multiplying by 2.9%?",
      a: "Because the fee applies to the total amount charged, you must divide (Target Net + $0.30) by (1 - 0.029) so the net payout equals your exact target."
    },
    {
      q: "Are Stripe fees refunded when I issue a customer refund?",
      a: "Generally no—standard US Stripe and PayPal merchant processing fees are not returned when a transaction is refunded."
    },
    {
      q: "Which is cheaper for US invoices: Stripe or PayPal?",
      a: "On standard domestic cards, Stripe (2.9% + $0.30) is cheaper than PayPal Commercial Checkout (3.49% + $0.49) across every order size."
    },
    {
      q: "How much does Stripe charge for ACH bank transfers?",
      a: "Stripe ACH Direct Debit is 0.8% capped at $5.00 per transaction, making it vastly cheaper for invoices over $625."
    }
  ],
  testCases: [
    {
      name: "Standard $100 Stripe card charge",
      inputs: { amount: 100, mode: "forward", processor: "stripe", intlCard: false, fxConversion: false },
      expected: { kpiId: "netPayout", approx: 96.8, tolerance: 0.02 }
    },
    {
      name: "Reverse $100 target net on Stripe",
      inputs: { amount: 100, mode: "reverse", processor: "stripe", intlCard: false, fxConversion: false },
      expected: { kpiId: "chargeAmount", approx: 103.3, tolerance: 0.02 }
    }
  ]
};

export function compute(values) {
  const amount = Math.max(0, Number(values.amount) || 0);
  const mode = String(values.mode || "forward");
  const processor = String(values.processor || "stripe");
  const intl = Boolean(values.intlCard);
  const fx = Boolean(values.fxConversion);

  const table = {
    stripe: { rate: 0.029, fixed: 0.3 },
    paypal_comm: { rate: 0.0349, fixed: 0.49 },
    paypal_std: { rate: 0.0299, fixed: 0.49 }
  };
  const base = table[processor] || table.stripe;
  const totalRate = base.rate + (intl ? 0.015 : 0) + (fx ? 0.01 : 0);

  let chargeAmount = amount;
  let totalFee = 0;
  let netPayout = 0;

  if (mode === "reverse") {
    chargeAmount = amount > 0 && totalRate < 1 ? (amount + base.fixed) / (1 - totalRate) : 0;
    totalFee = chargeAmount - amount;
    netPayout = amount;
  } else {
    chargeAmount = amount;
    totalFee = amount > 0 ? amount * totalRate + base.fixed : 0;
    netPayout = amount - totalFee;
  }

  const effectivePct = chargeAmount > 0 ? (totalFee / chargeAmount) * 100 : 0;
  const denom = chargeAmount > 0 ? chargeAmount : 1;

  return {
    kpis: [
      { id: "netPayout", label: "Net Payout You Keep", value: netPayout, format: "currency", highlight: mode !== "reverse" },
      { id: "chargeAmount", label: "Total Amount Charged", value: chargeAmount, format: "currency", highlight: mode === "reverse" },
      { id: "totalFee", label: "Processing Fee", value: totalFee, format: "currency" },
      { id: "effectivePct", label: "Effective Fee Rate", value: effectivePct, format: "percent" }
    ],
    breakdown: [
      { label: "Net Payout", amount: Math.max(0, netPayout), share: Math.max(0, (netPayout / denom) * 100), colorKey: "net" },
      { label: "Base Processor Fee", amount: chargeAmount > 0 ? chargeAmount * base.rate + base.fixed : 0, share: ((chargeAmount > 0 ? chargeAmount * base.rate + base.fixed : 0) / denom) * 100, colorKey: "processing" },
      { label: "Cross-Border / FX Add-On", amount: chargeAmount * ((intl ? 0.015 : 0) + (fx ? 0.01 : 0)), share: ((chargeAmount * ((intl ? 0.015 : 0) + (fx ? 0.01 : 0))) / denom) * 100, colorKey: "fee" }
    ],
    verdict: {
      tone: effectivePct <= 3.5 ? "good" : effectivePct <= 5.0 ? "warn" : "bad",
      title: mode === "reverse" ? "Exact gross-up invoice calculated" : "Merchant payout calculated",
      detail: "Effective processing drag is " + effectivePct.toFixed(2) + "% on $" + chargeAmount.toFixed(2) + " charged."
    }
  };
}
