export const meta = {
  slug: "llc-vs-s-corp-tax-savings-calculator",
  category: "tax",
  shortTitle: "LLC vs S-Corp Tax Savings",
  title: "US LLC vs. S-Corp Tax Election Savings Calculator (2026)",
  metaDescription: "Compare Sole Proprietor / Single-Member LLC self-employment taxes against S-Corp W-2 salary + distributions after payroll and CPA compliance costs.",
  heroSubtitle: "Find the exact business profit threshold where electing S-Corp taxation saves more than payroll and accounting overhead.",
  badge: "US Small Business Tax",
  updatedAt: "2026-11-25",
  queuedOrder: 7,
  inputs: [
    { id: "netProfit", label: "Annual Business Net Profit", type: "number", defaultValue: 120000, min: 0, step: 2500, prefix: "$" },
    { id: "reasonableSalary", label: "Reasonable S-Corp W-2 Salary", type: "number", defaultValue: 60000, min: 0, step: 2500, prefix: "$" },
    { id: "complianceCost", label: "Extra Annual Payroll + CPA Filing Cost", type: "number", defaultValue: 2800, min: 0, step: 100, prefix: "$" },
    { id: "stateSCorpTaxPct", label: "State S-Corp Net Income Tax (e.g. 1.5% CA)", type: "number", defaultValue: 0, min: 0, max: 10, step: 0.25, suffix: "%" }
  ],
  howItWorks: {
    summary: "Compares full 15.3% self-employment tax on Schedule C profit (at 92.35%) against 15.3% FICA payroll tax on only your reasonable W-2 officer salary.",
    formulaSteps: [
      "Sole Prop / LLC SE Tax = 12.4% Social Security (on 92.35% profit up to $176,100 cap) + 2.9% Medicare",
      "S-Corp Payroll Tax = 12.4% Social Security (on W-2 salary up to $176,100) + 2.9% Medicare (distributions avoid FICA)",
      "Net Annual Savings = (LLC SE Tax - S-Corp Payroll Tax) - Extra Payroll/CPA Overhead - Extra State Entity Tax"
    ],
    feeTable: {
      headers: ["Entity Structure", "FICA / SE Tax Base", "Typical Compliance Overhead"],
      rows: [
        ["Single-Member LLC (Schedule C)", "92.35% of total net profit", "Minimal ($0–$500 extra)"],
        ["S-Corp Election (Form 2553)", "Reasonable W-2 officer salary only", "$1,800 – $3,500/yr payroll + 1120-S"],
        ["Break-Even Profit Zone", "~$75,000 – $90,000 net profit", "Below this, overhead eats tax savings"]
      ]
    }
  },
  tips: [
    {
      title: "Wait Until Net Profit Consistently Clears $80k",
      detail: "Below $75k–$80k in net profit, S-Corp payroll software, Form 1120-S CPA prep, and state minimum fees often exceed FICA savings."
    },
    {
      title: "Set a Defensible IRS Reasonable Salary",
      detail: "Paying yourself $15k on $150k profit invites IRS reclassification audits. Document comparable industry W-2 wage data."
    },
    {
      title: "Factor State-Specific S-Corp Taxes",
      detail: "California charges 1.5% ($800 minimum) on S-Corp net income, and NYC does not recognize federal S-Corp status—enter your local state rate above."
    },
    {
      title: "Remember Form 2553 Deadlines",
      detail: "To elect S-Corp status for a calendar tax year, IRS Form 2553 is generally due within 2 months and 15 days of the tax year start."
    }
  ],
  faqs: [
    {
      q: "How does an S-Corp save self-employment tax?",
      a: "As a Single-Member LLC, all net profit faces 15.3% SE tax (up to the Social Security cap). As an S-Corp, only your W-2 officer salary pays FICA, while remaining profit distributions do not."
    },
    {
      q: "Does an S-Corp save federal income tax too?",
      a: "No—both structures pass profit through to your personal 1040 return for ordinary federal income tax. The main savings come from FICA/SE tax reduction, minus minor QBI interactions."
    },
    {
      q: "How much does running an S-Corp cost per year?",
      a: "Expect roughly $600–$1,000 for payroll software (e.g. Gusto) plus $1,200–$2,500 for separate Form 1120-S corporate tax preparation."
    },
    {
      q: "Does a high-profit earner over $200k still save with S-Corp?",
      a: "Yes, primarily on the 2.9% Medicare portion and once salary stays below the $176,100 Social Security cap, though QBI rules for SSTBs also apply."
    }
  ],
  testCases: [
    {
      name: "$120k profit with $60k W-2 salary",
      inputs: { netProfit: 120000, reasonableSalary: 60000, complianceCost: 2800, stateSCorpTaxPct: 0 },
      expected: { kpiId: "netAnnualSavings", approx: 4975.46, tolerance: 5 }
    },
    {
      name: "Low $50k profit where S-Corp barely breaks even",
      inputs: { netProfit: 50000, reasonableSalary: 35000, complianceCost: 2800, stateSCorpTaxPct: 0 },
      expected: { kpiId: "netAnnualSavings", approx: -1089.78, tolerance: 5 }
    }
  ]
};

export function compute(values) {
  const netProfit = Math.max(0, Number(values.netProfit) || 0);
  const salary = Math.min(netProfit, Math.max(0, Number(values.reasonableSalary) || 0));
  const compliance = Math.max(0, Number(values.complianceCost) || 0);
  const stateSCorpRate = Math.max(0, Number(values.stateSCorpTaxPct) || 0) / 100;

  const ssCap = 176100;
  const llcSeBase = netProfit * 0.9235;
  const llcSeTax = Math.min(llcSeBase, ssCap) * 0.124 + llcSeBase * 0.029;
  const scorpPayrollTax = Math.min(salary, ssCap) * 0.124 + salary * 0.029;

  const grossTaxSaved = Math.max(0, llcSeTax - scorpPayrollTax);
  const extraStateTax = netProfit * stateSCorpRate;
  const netAnnualSavings = grossTaxSaved - compliance - extraStateTax;
  const distributions = Math.max(0, netProfit - salary - compliance);
  const denom = llcSeTax > 0 ? llcSeTax : 1;

  return {
    kpis: [
      { id: "netAnnualSavings", label: "Net Annual S-Corp Savings", value: netAnnualSavings, format: "currency", highlight: true },
      { id: "llcSeTax", label: "LLC Schedule C SE Tax", value: llcSeTax, format: "currency" },
      { id: "scorpPayrollTax", label: "S-Corp W-2 FICA Tax", value: scorpPayrollTax, format: "currency" },
      { id: "distributions", label: "FICA-Free Owner Distributions", value: distributions, format: "currency" }
    ],
    breakdown: [
      { label: "Net Tax Savings Kept", amount: Math.max(0, netAnnualSavings), share: Math.max(0, (netAnnualSavings / denom) * 100), colorKey: "net" },
      { label: "S-Corp W-2 FICA Tax", amount: scorpPayrollTax, share: (scorpPayrollTax / denom) * 100, colorKey: "tax" },
      { label: "Payroll, CPA & Entity Overhead", amount: compliance + extraStateTax, share: ((compliance + extraStateTax) / denom) * 100, colorKey: "cost" }
    ],
    verdict: {
      tone: netAnnualSavings >= 2000 ? "good" : netAnnualSavings > 0 ? "warn" : "bad",
      title: netAnnualSavings >= 2000 ? "S-Corp saves $" + netAnnualSavings.toFixed(0) + "/year net" : netAnnualSavings > 0 ? "Borderline S-Corp savings" : "Stay Single-Member LLC for now",
      detail: netAnnualSavings > 0 ? "Gross FICA reduction of $" + grossTaxSaved.toFixed(0) + " outweighs $" + (compliance + extraStateTax).toFixed(0) + " in compliance costs." : "Payroll and CPA fees exceed your FICA savings at this profit level."
    }
  };
}
