export const meta = {
  slug: "airbnb-vrbo-host-net-payout-calculator",
  category: "ecommerce",
  shortTitle: "Airbnb & Vrbo Host Payout",
  title: "Airbnb vs. Vrbo Host Payout & Occupancy Margin Calculator",
  metaDescription:
    "Compare 2026 Airbnb 15.5% host-only vs. 3% split fees and Vrbo 12% flat or 8% commissions, plus occupancy, turnover cleaning, and monthly STR profit.",
  heroSubtitle:
    "Model monthly short-term rental net payout, RevPAR, and operating margin across Airbnb and Vrbo 2026 US host fee schedules.",
  badge: "2026 US Rates",
  updatedAt: "2026-11-27",
  queuedOrder: 9,
  inputs: [
    {
      id: "channel",
      label: "Booking Channel & Fee Model",
      type: "select",
      defaultValue: "airbnb_host_only",
      options: [
        { value: "airbnb_host_only", label: "Airbnb Host-Only Fee (15.5% 2026 Standard)" },
        { value: "airbnb_split", label: "Airbnb Legacy Split-Fee (3.0% Host)" },
        { value: "vrbo_flat_12", label: "Vrbo Flat Commission (12.0% Late-2026 US)" },
        { value: "vrbo_legacy_8", label: "Vrbo Legacy Pay-Per-Booking (5% + 3% = 8%)" },
        { value: "direct_stripe", label: "Direct Booking (Stripe 2.9% + $0.30/stay)" }
      ],
      help: "Airbnb transitioned standard US hosts to a 15.5% host-only fee by late 2026; Vrbo moved standard US hosts to a 12% flat all-in commission in late 2026."
    },
    {
      id: "nightlyRate",
      label: "Average Nightly Rate",
      type: "number",
      defaultValue: 220,
      min: 0,
      step: 1,
      prefix: "$"
    },
    {
      id: "occupancyPct",
      label: "Monthly Occupancy Rate",
      type: "number",
      defaultValue: 65,
      min: 0,
      max: 100,
      step: 1,
      suffix: "%",
      help: "Percentage of nights booked in a 30-day month."
    },
    {
      id: "avgStayNights",
      label: "Average Length of Stay",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 30,
      step: 0.5,
      suffix: "nights",
      help: "Shorter average stays increase monthly cleaning turnovers."
    },
    {
      id: "cleaningFee",
      label: "Guest Cleaning Fee (Per Stay)",
      type: "number",
      defaultValue: 140,
      min: 0,
      step: 1,
      prefix: "$"
    },
    {
      id: "cleanerCost",
      label: "Actual Turnover Cost (Per Stay)",
      type: "number",
      defaultValue: 125,
      min: 0,
      step: 1,
      prefix: "$",
      help: "What you pay cleaners and laundry services per checkout."
    },
    {
      id: "monthlyFixedOverhead",
      label: "Monthly Fixed Overhead",
      type: "number",
      defaultValue: 1650,
      min: 0,
      step: 10,
      prefix: "$",
      help: "Mortgage or rent, utilities, internet, HOA, and STR insurance."
    },
    {
      id: "includeReserve",
      label: "Include 3% Maintenance & Supplies Reserve",
      type: "checkbox",
      defaultValue: true,
      help: "Sets aside 3% of gross booking revenue for consumables, linens, and routine repairs."
    }
  ],
  howItWorks: {
    summary:
      "Calculates 30-day gross booking revenue (nightly rate plus guest cleaning fees), deducts channel commissions and payment processing fees, then subtracts per-turnover cleaning, supplies reserves, and fixed monthly overhead.",
    formulaSteps: [
      "Booked Nights = 30 × (Occupancy % ÷ 100); Estimated Stays = Booked Nights ÷ Avg Length of Stay",
      "Gross Booking Subtotal = (Booked Nights × Nightly Rate) + (Estimated Stays × Guest Cleaning Fee)",
      "Host Payout = Gross Booking Subtotal − Platform Commission − Payment Processing Fee",
      "Net Monthly Profit = Host Payout − (Estimated Stays × Turnover Cost) − 3% Reserve − Fixed Overhead"
    ],
    feeTable: {
      headers: ["Channel / Schedule", "Host Fee", "Processing", "2026 US Notes"],
      rows: [
        ["Airbnb Host-Only (2026 Standard)", "15.5%", "Included", "Applies to nightly rate + cleaning/pet fees; no guest checkout fee"],
        ["Airbnb Legacy Split-Fee", "3.0%", "Included", "Historical host share before 2026 host-only migration (guest paid ~14%+)"],
        ["Vrbo Flat Commission (Late-2026)", "12.0%", "Included", "All-in host commission on rent + fees when Vrbo processes payment"],
        ["Vrbo Legacy Pay-Per-Booking", "5.0%", "3.0%", "Prior 8% combined structure before late-2026 flat 12% rollout"],
        ["Direct Booking (Stripe)", "0.0%", "2.9% + $0.30", "Lowest fee channel when driving repeat guests to your own site"]
      ]
    }
  },
  tips: [
    {
      title: "Gross up rates for 15.5% host-only fees",
      detail:
        "Moving from Airbnb's old 3% split fee to the 15.5% host-only fee reduces payouts by ~12.9% unless you raise your listed nightly and cleaning rates by roughly 14.8% to keep net payout flat."
    },
    {
      title: "Commission applies to cleaning fees too",
      detail:
        "Both Airbnb and Vrbo deduct their percentage host fee from your guest cleaning fee as well as nightly rent, so price your guest cleaning fee ~15–18% above your actual cleaner invoice to break even."
    },
    {
      title: "Optimize minimum stay lengths",
      detail:
        "A 2-night average stay generates 50% more turnovers than a 3-night stay. If your guest cleaning fee trails actual cleaner costs, short stays quickly compress monthly cash flow."
    },
    {
      title: "Shift repeat guests to direct bookings",
      detail:
        "Capturing just two repeat bookings per month via a direct booking site (Stripe 2.9% + $0.30) instead of a 12%–15.5% OTA saves hundreds in monthly commission without changing guest totals."
    }
  ],
  faqs: [
    {
      q: "Why does Airbnb charge a 15.5% host-only fee in 2026?",
      a: "Airbnb phased out its legacy 3% split-fee model in favor of a single 15.5% host-only fee across PMS-connected and standard US hosts by late 2026 so travelers see one upfront price without a separate service fee added at checkout."
    },
    {
      q: "What is Vrbo's host commission rate in late 2026?",
      a: "In late October 2026, Vrbo transitioned standard US pay-per-booking hosts from its legacy 5% commission plus 3% payment processing fee (8% total) to a streamlined 12% flat all-in commission that includes payment processing."
    },
    {
      q: "Are local lodging and occupancy taxes included in the host fee?",
      a: "No. Neither Airbnb nor Vrbo charges its host commission on pass-through state or municipal lodging taxes. However, host commissions do apply to nightly rent, cleaning fees, pet fees, and extra-guest charges."
    },
    {
      q: "What is a healthy short-term rental operating margin?",
      a: "Before income taxes, well-managed US short-term rentals typically target a 25% to 40% net operating margin after channel fees, cleaning turnovers, utilities, and mortgage or lease overhead."
    }
  ],
  testCases: [
    {
      name: "Airbnb 15.5% Host-Only (65% Occupancy)",
      inputs: {
        channel: "airbnb_host_only",
        nightlyRate: 220,
        occupancyPct: 65,
        avgStayNights: 3,
        cleaningFee: 140,
        cleanerCost: 125,
        monthlyFixedOverhead: 1650,
        includeReserve: true
      },
      expected: { kpiId: "netMonthlyProfit", approx: 1775.5, tolerance: 0.1 }
    },
    {
      name: "Vrbo 12% Flat Commission (50% Occupancy)",
      inputs: {
        channel: "vrbo_flat_12",
        nightlyRate: 250,
        occupancyPct: 50,
        avgStayNights: 5,
        cleaningFee: 150,
        cleanerCost: 140,
        monthlyFixedOverhead: 2000,
        includeReserve: false
      },
      expected: { kpiId: "netMonthlyProfit", approx: 1276.0, tolerance: 0.1 }
    },
    {
      name: "Vrbo Legacy 8% (5% + 3% Processing)",
      inputs: {
        channel: "vrbo_legacy_8",
        nightlyRate: 200,
        occupancyPct: 60,
        avgStayNights: 3,
        cleaningFee: 120,
        cleanerCost: 120,
        monthlyFixedOverhead: 1500,
        includeReserve: true
      },
      expected: { kpiId: "netMonthlyProfit", approx: 1624.8, tolerance: 0.1 }
    }
  ]
};

export function compute(values) {
  const channel = String(values.channel || "airbnb_host_only");
  const nightlyRate = Math.max(0, Number(values.nightlyRate) || 0);
  const occupancyPct = Math.min(100, Math.max(0, Number(values.occupancyPct) || 0));
  const avgStayNights = Math.max(1, Number(values.avgStayNights) || 1);
  const cleaningFee = Math.max(0, Number(values.cleaningFee) || 0);
  const cleanerCost = Math.max(0, Number(values.cleanerCost) || 0);
  const monthlyFixedOverhead = Math.max(0, Number(values.monthlyFixedOverhead) || 0);
  const includeReserve = Boolean(values.includeReserve);

  const daysInMonth = 30;
  const nightsBooked = daysInMonth * (occupancyPct / 100);
  const stays = nightsBooked > 0 ? nightsBooked / avgStayNights : 0;

  const grossNightlyRevenue = nightsBooked * nightlyRate;
  const grossCleaningRevenue = stays * cleaningFee;
  const grossBookingSubtotal = grossNightlyRevenue + grossCleaningRevenue;

  let feeRate = 0.155;
  let processingRate = 0;
  let fixedFeePerStay = 0;

  if (channel === "airbnb_split") {
    feeRate = 0.03;
  } else if (channel === "vrbo_flat_12") {
    feeRate = 0.12;
  } else if (channel === "vrbo_legacy_8") {
    feeRate = 0.05;
    processingRate = 0.03;
  } else if (channel === "direct_stripe") {
    feeRate = 0;
    processingRate = 0.029;
    fixedFeePerStay = 0.3;
  }

  const platformFee = grossBookingSubtotal * feeRate;
  const processingFee =
    grossBookingSubtotal * processingRate + (stays > 0 ? stays * fixedFeePerStay : 0);
  const hostPayout = grossBookingSubtotal - platformFee - processingFee;

  const turnoverCost = stays * cleanerCost;
  const maintenanceReserve = includeReserve ? grossBookingSubtotal * 0.03 : 0;
  const totalOperatingCosts = turnoverCost + maintenanceReserve + monthlyFixedOverhead;

  const netMonthlyProfit = hostPayout - totalOperatingCosts;
  const netMarginPct =
    grossBookingSubtotal > 0 ? (netMonthlyProfit / grossBookingSubtotal) * 100 : 0;
  const effectiveFeePct =
    grossBookingSubtotal > 0 ? ((platformFee + processingFee) / grossBookingSubtotal) * 100 : 0;
  const revPar = grossNightlyRevenue / daysInMonth;

  const denom = grossBookingSubtotal > 0 ? grossBookingSubtotal : 1;

  let tone = "bad";
  let title = "Negative monthly cash flow";
  if (netMarginPct >= 25) {
    tone = "good";
    title = "Healthy STR operating margin";
  } else if (netMonthlyProfit > 0) {
    tone = "warn";
    title = "Thin monthly cash flow";
  }

  return {
    kpis: [
      {
        id: "netMonthlyProfit",
        label: "Monthly Net Profit",
        value: netMonthlyProfit,
        format: "currency",
        highlight: true
      },
      {
        id: "hostPayout",
        label: "Platform Host Payout",
        value: hostPayout,
        format: "currency"
      },
      {
        id: "netMargin",
        label: "Net Operating Margin",
        value: netMarginPct,
        format: "percent"
      },
      {
        id: "revPar",
        label: "RevPAR (Per Avail. Night)",
        value: revPar,
        format: "currency"
      },
      {
        id: "effectiveFeePct",
        label: "Effective Channel Fee",
        value: effectiveFeePct,
        format: "percent"
      }
    ],
    breakdown: [
      {
        label: "Net Monthly Profit",
        amount: Math.max(0, netMonthlyProfit),
        share: Math.max(0, (netMonthlyProfit / denom) * 100),
        colorKey: "net"
      },
      {
        label: "Platform Commission",
        amount: platformFee,
        share: (platformFee / denom) * 100,
        colorKey: "fee"
      },
      {
        label: "Payment Processing",
        amount: processingFee,
        share: (processingFee / denom) * 100,
        colorKey: "processing"
      },
      {
        label: "Turnover & Reserves",
        amount: turnoverCost + maintenanceReserve,
        share: ((turnoverCost + maintenanceReserve) / denom) * 100,
        colorKey: "cost"
      },
      {
        label: "Fixed Overhead",
        amount: monthlyFixedOverhead,
        share: (monthlyFixedOverhead / denom) * 100,
        colorKey: "cost"
      }
    ],
    verdict: {
      tone,
      title,
      detail:
        "On $" +
        grossBookingSubtotal.toFixed(0) +
        " gross monthly bookings (" +
        nightsBooked.toFixed(1) +
        " nights across " +
        stays.toFixed(1) +
        " stays), your payout is $" +
        hostPayout.toFixed(0) +
        " and net profit is $" +
        netMonthlyProfit.toFixed(0) +
        " (" +
        netMarginPct.toFixed(1) +
        "% margin)."
    }
  };
}
