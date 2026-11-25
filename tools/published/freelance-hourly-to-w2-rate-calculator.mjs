export const meta = {
  slug: "freelance-hourly-to-w2-rate-calculator",
  category: "freelance",
  shortTitle: "Freelance Rate vs W-2 Calculator",
  title: "US Freelance Hourly Rate to W-2 Equivalent Calculator (2026)",
  metaDescription: "Convert a target US W-2 salary into the required freelance hourly rate, day rate, and monthly retainer after unpaid PTO, self-employment tax, and overhead.",
  heroSubtitle: "Avoid undercharging by pricing in unpaid admin time, health insurance, vacation weeks, and the employer FICA gap.",
  badge: "US 1099 Pricing",
  updatedAt: "2026-11-25",
  inputs: [
    { id: "targetW2Salary", label: "Target Equivalent W-2 Salary", type: "number", defaultValue: 100000, min: 0, step: 1000, prefix: "$" },
    { id: "vacationWeeks", label: "Unpaid Vacation & Sick Weeks / Yr", type: "number", defaultValue: 4, min: 0, max: 30, step: 1 },
    { id: "billablePct", label: "Billable Utilization % of 40h Week", type: "number", defaultValue: 65, min: 15, max: 100, step: 5, suffix: "%" },
    { id: "annualOverhead", label: "Annual Health Insurance, Gear & SaaS", type: "number", defaultValue: 8400, min: 0, step: 200, prefix: "$" },
    { id: "profitBufferPct", label: "Business Margin / Bench Risk Buffer", type: "number", defaultValue: 10, min: 0, max: 40, step: 1, suffix: "%" }
  ],
  howItWorks: {
    summary: "Converts a W-2 salary into required annual gross billing by adding the 7.65% employer FICA burden and annual overhead, then dividing by true billable hours.",
    formulaSteps: [
      "Employer FICA Offset = Target W-2 Salary × 7.65%",
      "Required Gross Revenue = (Target Salary + Employer FICA Offset + Annual Overhead) × (1 + Buffer %)",
      "Annual Billable Hours = (52 - Unpaid Weeks) × 40 × Billable Utilization %",
      "Required Hourly Rate = Required Gross Revenue / Annual Billable Hours"
    ],
    feeTable: {
      headers: ["Hidden Freelance Cost", "Typical US Impact", "Why It Matters"],
      rows: [
        ["Employer FICA Share", "+7.65% of salary", "1099 contractors pay both halves (15.3%)"],
        ["Non-Billable Time", "25% – 40% of week", "Sales, invoicing, admin, and learning"],
        ["Unpaid PTO / Holidays", "3 – 5 weeks / year", "No paid sick days or company holidays"],
        ["Health & Software Overhead", "$6,000 – $14,000 / yr", "Private ACA/marketplace plans & tools"]
      ]
    }
  },
  tips: [
    {
      title: "Stop Dividing W-2 Salary by 2,080 Hours",
      detail: "A $100k W-2 salary is $48/hr on paper, but charging $48/hr as a 1099 contractor leaves you taking home closer to $55k after taxes and unbilled hours."
    },
    {
      title: "Use Monthly Retainers to Stabilize Utilization",
      detail: "Locking 2–3 anchor clients onto fixed monthly retainers pushes utilization above 70% and shrinks unpaid sales hours."
    },
    {
      title: "Price Day Rates at 8× Minimum Hourly",
      detail: "Day rates discourage scope-creeping hourly micromanagement while honoring your minimum effective hourly floor."
    },
    {
      title: "Revisit Rates Every 6 Months",
      detail: "Raise rates by 10–15% for new clients whenever your pipeline hits 80%+ capacity."
    }
  ],
  faqs: [
    {
      q: "Why do I need to charge roughly double my W-2 hourly rate as a freelancer?",
      a: "Because you lose paid holidays, employer FICA matching, employer health insurance, and 25–35% of your week goes to non-billable business development."
    },
    {
      q: "What is a realistic billable utilization rate for solo consultants?",
      a: "Full-time solo freelancers typically average 60% to 70% billable utilization (24 to 28 billable hours in a 40-hour workweek)."
    },
    {
      q: "Does this include federal income tax?",
      a: "Target W-2 salary is already pre-income-tax, and adding the 7.65% employer FICA share puts 1099 contractors on par with W-2 pre-tax compensation."
    },
    {
      q: "How should I quote clients who prefer flat project fees?",
      a: "Estimate realistic hours, multiply by your Required Hourly Rate, and add 15–20% contingency for revisions."
    }
  ],
  testCases: [
    {
      name: "$100k W-2 equivalent at 65% utilization",
      inputs: { targetW2Salary: 100000, vacationWeeks: 4, billablePct: 65, annualOverhead: 8400, profitBufferPct: 10 },
      expected: { kpiId: "hourlyRate", approx: 102.29, tolerance: 0.25 }
    },
    {
      name: "$120k target with 50% utilization",
      inputs: { targetW2Salary: 120000, vacationWeeks: 4, billablePct: 50, annualOverhead: 10000, profitBufferPct: 0 },
      expected: { kpiId: "hourlyRate", approx: 144.98, tolerance: 0.25 }
    }
  ]
};

export function compute(values) {
  const targetSalary = Math.max(0, Number(values.targetW2Salary) || 0);
  const vacationWeeks = Math.min(50, Math.max(0, Number(values.vacationWeeks) || 0));
  const billablePct = Math.min(100, Math.max(10, Number(values.billablePct) || 10)) / 100;
  const overhead = Math.max(0, Number(values.annualOverhead) || 0);
  const bufferRate = Math.max(0, Number(values.profitBufferPct) || 0) / 100;

  const employerFica = targetSalary * 0.0765;
  const baseNeeded = targetSalary + employerFica + overhead;
  const bufferAmount = baseNeeded * bufferRate;
  const grossRequired = baseNeeded + bufferAmount;

  const workWeeks = Math.max(1, 52 - vacationWeeks);
  const billableHours = Math.max(1, workWeeks * 40 * billablePct);
  const hourlyRate = grossRequired / billableHours;
  const dayRate = hourlyRate * 8;
  const monthlyRetainer = grossRequired / 12;
  const denom = grossRequired > 0 ? grossRequired : 1;

  return {
    kpis: [
      { id: "hourlyRate", label: "Minimum Hourly Rate", value: hourlyRate, format: "currency", highlight: true },
      { id: "dayRate", label: "Equivalent 8h Day Rate", value: dayRate, format: "currency" },
      { id: "monthlyRetainer", label: "Target Monthly Billing", value: monthlyRetainer, format: "currency" },
      { id: "billableHours", label: "Annual Billable Hours", value: billableHours, format: "number" }
    ],
    breakdown: [
      { label: "Equivalent W-2 Compensation", amount: targetSalary, share: (targetSalary / denom) * 100, colorKey: "net" },
      { label: "Employer FICA Offset (7.65%)", amount: employerFica, share: (employerFica / denom) * 100, colorKey: "tax" },
      { label: "Annual Overhead & Benefits", amount: overhead, share: (overhead / denom) * 100, colorKey: "cost" },
      { label: "Margin & Bench Buffer", amount: bufferAmount, share: (bufferAmount / denom) * 100, colorKey: "fee" }
    ],
    verdict: {
      tone: hourlyRate >= 75 ? "good" : "warn",
      title: "Charge at least $" + hourlyRate.toFixed(0) + "/hr (or $" + dayRate.toFixed(0) + "/day)",
      detail: "Based on " + Math.round(billableHours) + " billable hours/year across " + workWeeks + " working weeks."
    }
  };
}
