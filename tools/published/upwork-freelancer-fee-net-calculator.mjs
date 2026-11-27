export const meta = {
  slug: "upwork-freelancer-fee-net-calculator",
  category: "freelance",
  shortTitle: "Upwork Freelancer Fee Calculator",
  title: "Upwork 10% Service Fee & Net Payout Calculator (2026)",
  metaDescription: "Calculate Upwork freelancer net payout after the 10% flat service fee, Connects cost, and withdrawal fees, or solve the exact client rate to bid.",
  heroSubtitle: "Know your exact Upwork take-home earnings or reverse-calculate the bid rate needed to hit your net target.",
  badge: "2026 Upwork US",
  updatedAt: "2026-11-27",
  queuedOrder: 2,
  inputs: [
    { id: "contractAmount", label: "Contract Total or Target Net", type: "number", defaultValue: 1000, min: 0, step: 10, prefix: "$" },
    {
      id: "mode",
      label: "Calculation Mode",
      type: "select",
      defaultValue: "forward",
      options: [
        { value: "forward", label: "Standard: Net Payout From Bid" },
        { value: "reverse", label: "Reverse: Bid Amount for Target Net" }
      ]
    },
    { id: "serviceFeePct", label: "Upwork Freelancer Service Fee", type: "number", defaultValue: 10, min: 0, max: 25, step: 0.5, suffix: "%" },
    { id: "connectsCost", label: "Amortized Connects Spend / Won Job", type: "number", defaultValue: 6, min: 0, step: 0.5, prefix: "$" },
    { id: "withdrawalFee", label: "Bank / Withdrawal Fee", type: "number", defaultValue: 0.99, min: 0, step: 0.01, prefix: "$" }
  ],
  howItWorks: {
    summary: "Applies Upwork's flat freelancer service fee plus proposal Connects acquisition cost and payout transfer fees.",
    formulaSteps: [
      "Standard Mode: Service Fee = Contract × Fee %; Net Payout = Contract - Service Fee - Connects - Withdrawal Fee",
      "Reverse Mode: Client Charge = (Target Net + Connects + Withdrawal Fee) / (1 - Fee %)",
      "Effective Take-Home % = Net Payout / Total Client Charge"
    ],
    feeTable: {
      headers: ["Upwork Cost Item", "2026 Baseline", "Notes"],
      rows: [
        ["Freelancer Service Fee", "10% flat (variable on select contracts)", "Applies across contract lifetime"],
        ["Connects", "$0.15 per Connect", "Typically 8–24 Connects per proposal"],
        ["Direct to US Bank (ACH)", "$0 (ACH) / $0.99 Local Funds", "Instant Pay or Wire carries higher fees"]
      ]
    }
  },
  tips: [
    {
      title: "Amortize Connects Across Your Win Rate",
      detail: "If you spend 16 Connects ($2.40) per proposal and win 1 in 4 jobs, each won contract carries $9.60 in Connects overhead."
    },
    {
      title: "Use Reverse Bidding on Hourly Proposals",
      detail: "To clear $90/hr net after Upwork's 10% cut, quote $100/hr on your proposal."
    },
    {
      title: "Batch Withdrawals to Minimize Transfer Fees",
      detail: "Withdraw bi-weekly via free US ACH rather than frequent paid instant payouts."
    },
    {
      title: "Reserve 25–30% of Net Payout for IRS 1099 Taxes",
      detail: "Upwork payouts are gross self-employment income before federal, state, and SE taxes."
    }
  ],
  faqs: [
    {
      q: "What is Upwork's freelancer service fee?",
      a: "Upwork's standard freelancer service fee is 10% across most contracts, though variable rates can apply on certain contract categories or client programs."
    },
    {
      q: "Are Upwork Connects deductible on US taxes?",
      a: "Yes. Connects purchased for client acquisition generally qualify as ordinary business marketing expenses on Schedule C."
    },
    {
      q: "Does Upwork charge a fee to withdraw to a US bank account?",
      a: "Standard US ACH transfers are free, whereas Instant Pay, PayPal, or wire transfers carry per-withdrawal fees."
    },
    {
      q: "How do I charge enough to keep $1,000 net?",
      a: "Switch Calculation Mode to Reverse and enter $1,000 to solve the exact proposal total covering the 10% fee and acquisition overhead."
    }
  ],
  testCases: [
    {
      name: "$1,000 standard contract net payout",
      inputs: { contractAmount: 1000, mode: "forward", serviceFeePct: 10, connectsCost: 6, withdrawalFee: 0.99 },
      expected: { kpiId: "netPayout", approx: 893.01, tolerance: 0.05 }
    },
    {
      name: "Reverse mode for $900 target net",
      inputs: { contractAmount: 900, mode: "reverse", serviceFeePct: 10, connectsCost: 0, withdrawalFee: 0 },
      expected: { kpiId: "clientCharge", approx: 1000, tolerance: 0.05 }
    }
  ]
};

export function compute(values) {
  const amount = Math.max(0, Number(values.contractAmount) || 0);
  const mode = String(values.mode || "forward");
  const feeRate = Math.min(0.95, Math.max(0, Number(values.serviceFeePct) || 0) / 100);
  const connects = Math.max(0, Number(values.connectsCost) || 0);
  const withdrawal = Math.max(0, Number(values.withdrawalFee) || 0);

  let clientCharge = amount;
  let serviceFee = 0;
  let netPayout = 0;

  if (mode === "reverse") {
    clientCharge = amount > 0 ? (amount + connects + withdrawal) / (1 - feeRate) : 0;
    serviceFee = clientCharge * feeRate;
    netPayout = amount;
  } else {
    clientCharge = amount;
    serviceFee = amount * feeRate;
    netPayout = amount - serviceFee - connects - withdrawal;
  }

  const totalCost = serviceFee + connects + withdrawal;
  const takeHomePct = clientCharge > 0 ? (netPayout / clientCharge) * 100 : 0;
  const denom = clientCharge > 0 ? clientCharge : 1;

  return {
    kpis: [
      { id: "netPayout", label: "Net Take-Home Payout", value: netPayout, format: "currency", highlight: mode !== "reverse" },
      { id: "clientCharge", label: "Total Client Bid / Charge", value: clientCharge, format: "currency", highlight: mode === "reverse" },
      { id: "serviceFee", label: "Upwork Service Fee", value: serviceFee, format: "currency" },
      { id: "takeHomePct", label: "Effective Take-Home %", value: takeHomePct, format: "percent" }
    ],
    breakdown: [
      { label: "Freelancer Net Payout", amount: Math.max(0, netPayout), share: Math.max(0, (netPayout / denom) * 100), colorKey: "net" },
      { label: "Upwork Service Fee", amount: serviceFee, share: (serviceFee / denom) * 100, colorKey: "fee" },
      { label: "Connects & Transfer Fees", amount: connects + withdrawal, share: ((connects + withdrawal) / denom) * 100, colorKey: "processing" }
    ],
    verdict: {
      tone: takeHomePct >= 86 ? "good" : takeHomePct >= 75 ? "warn" : "bad",
      title: "You keep " + takeHomePct.toFixed(1) + "% of client billing",
      detail: "Total platform, Connects, and transfer drag is $" + totalCost.toFixed(2) + "."
    }
  };
}
