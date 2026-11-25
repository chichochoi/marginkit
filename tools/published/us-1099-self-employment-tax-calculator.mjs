export const meta = {
  slug: "us-1099-self-employment-tax-calculator",
  category: "tax",
  shortTitle: "US 1099 Tax Calculator",
  title: "US 1099 Self-Employment & Quarterly Tax Calculator (2026)",
  metaDescription: "Estimate 2026 US 1099 self-employment tax (15.3%), federal brackets, QBI deduction, state tax, and IRS Form 1040-ES quarterly payments.",
  heroSubtitle: "Know exactly how much to reserve from 1099 freelance or seller income for quarterly IRS vouchers.",
  badge: "IRS 1040-ES Estimator",
  updatedAt: "2026-11-25",
  inputs: [
    { id: "grossIncome", label: "Annual Gross 1099 Revenue", type: "number", defaultValue: 90000, min: 0, step: 500, prefix: "$" },
    { id: "expenses", label: "Deductible Business Expenses", type: "number", defaultValue: 12000, min: 0, step: 250, prefix: "$" },
    {
      id: "filingStatus",
      label: "Filing Status",
      type: "select",
      defaultValue: "single",
      options: [
        { value: "single", label: "Single ($15,000 Std. Deduction)" },
        { value: "mfj", label: "Married Filing Jointly ($30,000 Std. Deduction)" }
      ]
    },
    { id: "stateTaxRate", label: "Effective State Income Tax Rate", type: "number", defaultValue: 5, min: 0, max: 15, step: 0.25, suffix: "%" },
    { id: "useQbi", label: "Apply 20% Section 199A QBI Deduction", type: "checkbox", defaultValue: true }
  ],
  howItWorks: {
    summary: "Applies the statutory 92.35% Schedule SE multiplier, Social Security wage cap ($176,100), 50% SE deduction, standard deduction, and QBI deduction.",
    formulaSteps: [
      "Net Schedule C Profit = Gross 1099 Revenue - Business Expenses",
      "SE Taxable Earnings = Net Profit × 92.35%; SE Tax = 12.4% Social Security (up to $176,100 cap) + 2.9% Medicare (+0.9% over threshold)",
      "Federal Taxable Income = Net Profit - (50% SE Tax) - Standard Deduction - 20% QBI Deduction (if eligible)",
      "Quarterly 1040-ES Payment = (SE Tax + Progressive Federal Tax + Estimated State Tax) / 4"
    ],
    feeTable: {
      headers: ["Tax Layer", "2026 Baseline Rule", "Notes"],
      rows: [
        ["Social Security (OASDI)", "12.4% up to $176,100", "Applied to 92.35% of net profit"],
        ["Medicare + Additional", "2.9% + 0.9% over $200k/$250k", "No upper income cap"],
        ["SE Tax Adjustment", "50% of SE tax deductible", "Reduces federal AGI"],
        ["Quarterly Due Dates", "Apr 15, Jun 15, Sep 15, Jan 15", "IRS Form 1040-ES"]
      ]
    }
  },
  tips: [
    {
      title: "Automate a Separate Tax Reserve Account",
      detail: "Transfer your effective total tax rate from every 1099 payout into a dedicated high-yield business savings account on payday."
    },
    {
      title: "Use the Safe Harbor Rule to Avoid Penalties",
      detail: "Paying 100% of last year's tax liability (110% if prior AGI exceeded $150k) in quarterly installments typically protects against underpayment penalties."
    },
    {
      title: "Consider Solo 401(k) or SEP-IRA Contributions",
      detail: "Traditional retirement contributions cut federal income tax at your top marginal bracket while keeping cash invested for yourself."
    },
    {
      title: "Evaluate S-Corp Election Near $80k+ Profit",
      detail: "Once net profit stays comfortably above $80k, splitting reasonable W-2 wages and distributions can trim self-employment taxes."
    }
  ],
  faqs: [
    {
      q: "Why does the IRS multiply net earnings by 92.35%?",
      a: "Because W-2 employees do not pay FICA on the employer's 7.65% share, Schedule SE reduces net self-employment earnings by 7.65% before applying 15.3%."
    },
    {
      q: "When should I pay quarterly IRS estimated taxes?",
      a: "If you expect to owe $1,000 or more when filing your return, IRS Form 1040-ES payments are due April 15, June 15, September 15, and January 15."
    },
    {
      q: "What is the 20% QBI deduction?",
      a: "Section 199A generally allows eligible sole proprietors and LLCs to deduct up to 20% of qualified business income from federal taxable income."
    },
    {
      q: "Does this replace a CPA for multi-income households?",
      a: "No. If you also earn W-2 wages (which eat into the $176,100 Social Security cap) or live in local-tax cities like NYC, consult a CPA."
    }
  ],
  testCases: [
    {
      name: "$90k gross / $12k expenses Single filer",
      inputs: { grossIncome: 90000, expenses: 12000, filingStatus: "single", stateTaxRate: 5, useQbi: true },
      expected: { kpiId: "quarterlyTax", approx: 4891.5, tolerance: 5 }
    },
    {
      name: "$160k gross / $20k expenses MFJ no state tax",
      inputs: { grossIncome: 160000, expenses: 20000, filingStatus: "mfj", stateTaxRate: 0, useQbi: true },
      expected: { kpiId: "seTax", approx: 19781.37, tolerance: 5 }
    }
  ]
};

export function compute(values) {
  const gross = Math.max(0, Number(values.grossIncome) || 0);
  const expenses = Math.max(0, Number(values.expenses) || 0);
  const status = String(values.filingStatus || "single");
  const stateRate = Math.max(0, Number(values.stateTaxRate) || 0) / 100;
  const useQbi = Boolean(values.useQbi);

  const netProfit = Math.max(0, gross - expenses);
  const seBase = netProfit * 0.9235;
  const ssCap = 176100;
  const ssTax = Math.min(seBase, ssCap) * 0.124;
  const addMedThresh = status === "mfj" ? 250000 : 200000;
  const medicareTax = seBase * 0.029 + Math.max(0, seBase - addMedThresh) * 0.009;
  const seTax = ssTax + medicareTax;
  const halfSe = seTax * 0.5;
  const stdDed = status === "mfj" ? 30000 : 15000;
  const qbi = useQbi ? Math.max(0, (netProfit - halfSe) * 0.2) : 0;
  const taxable = Math.max(0, netProfit - halfSe - stdDed - qbi);

  const brackets = status === "mfj"
    ? [[23850, 0.10], [96950, 0.12], [206700, 0.22], [394600, 0.24], [501050, 0.32], [751600, 0.35], [Infinity, 0.37]]
    : [[11925, 0.10], [48475, 0.12], [103350, 0.22], [197300, 0.24], [250525, 0.32], [626350, 0.35], [Infinity, 0.37]];

  let fedTax = 0;
  let prev = 0;
  for (let i = 0; i < brackets.length; i++) {
    const limit = brackets[i][0];
    const rate = brackets[i][1];
    if (taxable <= prev) break;
    const slice = Math.min(taxable, limit) - prev;
    fedTax += slice * rate;
    prev = limit;
  }

  const stateTax = Math.max(0, netProfit - halfSe) * stateRate;
  const totalTax = seTax + fedTax + stateTax;
  const quarterlyTax = totalTax / 4;
  const takeHome = netProfit - totalTax;
  const effRate = netProfit > 0 ? (totalTax / netProfit) * 100 : 0;
  const denom = netProfit > 0 ? netProfit : 1;

  return {
    kpis: [
      { id: "quarterlyTax", label: "Quarterly 1040-ES Payment", value: quarterlyTax, format: "currency", highlight: true },
      { id: "takeHome", label: "Annual Net Take-Home", value: takeHome, format: "currency" },
      { id: "seTax", label: "Self-Employment Tax", value: seTax, format: "currency" },
      { id: "effRate", label: "Effective Tax Rate", value: effRate, format: "percent" }
    ],
    breakdown: [
      { label: "After-Tax Take-Home", amount: Math.max(0, takeHome), share: Math.max(0, (takeHome / denom) * 100), colorKey: "net" },
      { label: "Self-Employment Tax", amount: seTax, share: (seTax / denom) * 100, colorKey: "tax" },
      { label: "Federal Income Tax", amount: fedTax, share: (fedTax / denom) * 100, colorKey: "fee" },
      { label: "State Income Tax", amount: stateTax, share: (stateTax / denom) * 100, colorKey: "processing" }
    ],
    verdict: {
      tone: effRate <= 24 ? "good" : effRate <= 34 ? "warn" : "bad",
      title: "Reserve " + effRate.toFixed(1) + "% of net profit for taxes",
      detail: "Set aside $" + (totalTax / 12).toFixed(0) + "/month to cover $" + quarterlyTax.toFixed(0) + " quarterly IRS & state payments."
    }
  };
}
