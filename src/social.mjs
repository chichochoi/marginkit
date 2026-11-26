import {
  CATEGORIES,
  canonicalUrl,
  formatMetric,
  getDefaultValues
} from "./lib.mjs";

export function escapeXml(str) {
  return String(str ?? "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text, maxChars, maxLines) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let current = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) {
        const rest = [current, ...words.slice(i + 1)].join(" ");
        current = rest.length > maxChars ? `${rest.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…` : rest;
        break;
      }
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function truncateText(str, maxChars) {
  const clean = String(str ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

const SEG_COLORS = {
  net: "#10b981",
  fee: "#f59e0b",
  processing: "#3b82f6",
  cost: "#64748b",
  tax: "#f43f5e"
};

const HASHTAGS_BY_CATEGORY = {
  ecommerce: ["#EcommerceSeller", "#ProfitMargins"],
  payments: ["#SaaSFounders", "#Stripe"],
  tax: ["#1099Tax", "#SmallBusinessTax"],
  creator: ["#CreatorEconomy", "#NewsletterGrowth"],
  freelance: ["#FreelanceLife", "#ConsultingRates"]
};

const BOARDS_BY_CATEGORY = {
  ecommerce: "Etsy, Amazon & E-Commerce Seller Margins",
  payments: "Payment Processing & SaaS Unit Economics",
  tax: "US 1099 & Small Business Tax Planning",
  creator: "Creator Economy & Paid Newsletter Revenue",
  freelance: "Freelance Pricing & Independent Consulting"
};

function resolveSubreddits(slug, category) {
  if (slug.startsWith("etsy-") || slug.includes("-etsy-")) return ["r/EtsySellers", "r/Etsy"];
  if (slug.startsWith("amazon-")) return ["r/FulfillmentByAmazon", "r/AmazonSeller"];
  if (slug.startsWith("shopify-")) return ["r/shopify", "r/ecommerce"];
  if (slug.startsWith("tiktok-")) return ["r/TikTokShop", "r/ecommerce"];
  if (slug.startsWith("ebay-")) return ["r/Ebay", "r/Flipping"];
  if (slug.startsWith("printify-")) return ["r/Printify", "r/printondemand"];
  if (slug.startsWith("upwork-")) return ["r/Upwork", "r/freelance"];
  if (slug.includes("1099") || slug.includes("s-corp") || category === "tax") {
    return ["r/smallbusiness", "r/tax", "r/freelance"];
  }
  if (slug.startsWith("youtube-")) return ["r/PartneredYoutube", "r/NewTubers"];
  if (category === "creator") return ["r/CreatorEconomy", "r/SideProject"];
  if (category === "payments") return ["r/SaaS", "r/Entrepreneur"];
  if (category === "freelance") return ["r/freelance", "r/consulting"];
  return ["r/ecommerce", "r/smallbusiness"];
}

function formatInputPreview(input) {
  const val = input.defaultValue;
  if (input.type === "checkbox") return `${input.label}: ${val ? "Yes" : "No"}`;
  if (input.type === "select") {
    const opt = (input.options || []).find((o) => String(o.value) === String(val));
    return `${input.label}: ${opt ? opt.label : val}`;
  }
  const num = Number(val);
  const formatted = Number.isFinite(num) ? num.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(val);
  return `${input.label}: ${input.prefix || ""}${formatted}${input.suffix ? ` ${input.suffix}` : ""}`;
}

export function renderDefaultOgSvg(config, toolCount) {
  const hostPath = canonicalUrl(config.siteOrigin, config.basePath, "/").replace(/^https?:\/\//, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(config.siteName)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="44" y="44" width="1112" height="542" rx="24" fill="#0b1220" stroke="#334155" stroke-width="2"/>
  <rect x="84" y="84" width="48" height="48" rx="12" fill="#10b981"/>
  <text x="108" y="117" text-anchor="middle" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="26" font-weight="800" fill="#06281e">M</text>
  <text x="148" y="117" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#f8fafc">${escapeXml(config.siteName)}</text>
  <rect x="904" y="86" width="212" height="42" rx="21" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="1010" y="113" text-anchor="middle" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#6ee7b7">${escapeXml(toolCount)} Live US Tools</text>

  <text x="84" y="216" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="50" font-weight="800" fill="#f8fafc">Free US Fee, Margin &amp; Tax</text>
  <text x="84" y="278" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="50" font-weight="800" fill="#34d399">Calculators for Operators</text>
  <text x="84" y="336" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="24" fill="#94a3b8">Instant 2026 fee breakdowns for Etsy, Amazon FBA, Shopify, Stripe, 1099 taxes &amp; creators.</text>

  <g transform="translate(84, 382)">
    <rect x="0" y="0" width="328" height="110" rx="16" fill="#111827" stroke="#1f2937" stroke-width="2"/>
    <text x="24" y="42" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="#94a3b8">E-Commerce &amp; POD</text>
    <text x="24" y="80" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#f8fafc">True Net Margin</text>

    <rect x="352" y="0" width="328" height="110" rx="16" fill="#111827" stroke="#1f2937" stroke-width="2"/>
    <text x="376" y="42" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="#94a3b8">Payments &amp; Creators</text>
    <text x="376" y="80" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#f8fafc">Reverse Fee Payouts</text>

    <rect x="704" y="0" width="328" height="110" rx="16" fill="#111827" stroke="#1f2937" stroke-width="2"/>
    <text x="728" y="42" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="#94a3b8">1099 &amp; Freelance</text>
    <text x="728" y="80" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#f8fafc">IRS 1040-ES &amp; Rates</text>
  </g>

  <text x="84" y="548" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="20" font-weight="600" fill="#64748b">${escapeXml(hostPath)}</text>
  <text x="1116" y="548" text-anchor="end" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="20" font-weight="600" fill="#34d399">100% Client-Side • Zero Paywalls</text>
</svg>
`;
}

export function renderToolOgSvg(tool, defaultRes, config) {
  const m = tool.meta;
  const cat = CATEGORIES[m.category] || { shortName: m.category };
  const titleLines = wrapLines(m.title, 42, 2);
  const subtitle = truncateText(m.heroSubtitle || m.metaDescription, 88);
  const kpis = (defaultRes.kpis || []).slice(0, 3);
  const breakdown = (defaultRes.breakdown || []).slice(0, 4);
  const totalShare = breakdown.reduce((sum, r) => sum + Math.max(0, Number(r.share) || 0), 0);
  const hostPath = canonicalUrl(config.siteOrigin, config.basePath, `/tools/${m.slug}/`).replace(/^https?:\/\//, "");

  const cardWidth = kpis.length === 2 ? 504 : 328;
  const cardGap = 24;
  const kpiCardsSvg = kpis
    .map((k, idx) => {
      const x = idx * (cardWidth + cardGap);
      const valText = formatMetric(k.value, k.format);
      const border = k.highlight ? "#10b981" : "#1f2937";
      const valColor = k.highlight ? "#34d399" : "#f8fafc";
      return `<g transform="translate(${x}, 0)">
      <rect width="${cardWidth}" height="122" rx="16" fill="#111827" stroke="${border}" stroke-width="2"/>
      <text x="24" y="42" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="#94a3b8">${escapeXml(truncateText(k.label, 28))}</text>
      <text x="24" y="92" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="36" font-weight="800" fill="${valColor}">${escapeXml(valText)}</text>
    </g>`;
    })
    .join("\n    ");

  let barCursor = 0;
  const barTotalWidth = 1032;
  const barSegmentsSvg = breakdown
    .map((r) => {
      const share = Math.max(0, Number(r.share) || 0);
      const w = totalShare > 0 ? (share / totalShare) * barTotalWidth : 0;
      const x = barCursor;
      barCursor += w;
      const color = SEG_COLORS[r.colorKey] || "#64748b";
      return `<rect x="${x.toFixed(1)}" y="0" width="${Math.max(0, w).toFixed(1)}" height="18" fill="${color}"/>`;
    })
    .join("");

  const legendSvg = breakdown
    .map((r, idx) => {
      const x = idx * 258;
      const color = SEG_COLORS[r.colorKey] || "#64748b";
      const label = `${truncateText(r.label, 18)} (${formatMetric(r.share, "percent")})`;
      return `<g transform="translate(${x}, 36)">
      <circle cx="8" cy="-5" r="6" fill="${color}"/>
      <text x="22" y="0" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="16" font-weight="600" fill="#cbd5e1">${escapeXml(label)}</text>
    </g>`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(m.title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <clipPath id="barClip">
      <rect x="0" y="0" width="1032" height="18" rx="9"/>
    </clipPath>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="44" y="44" width="1112" height="542" rx="24" fill="#0b1220" stroke="#334155" stroke-width="2"/>

  <rect x="84" y="80" width="44" height="44" rx="10" fill="#10b981"/>
  <text x="106" y="110" text-anchor="middle" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="24" font-weight="800" fill="#06281e">M</text>
  <text x="142" y="110" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#f8fafc">${escapeXml(config.siteName)}</text>

  <rect x="890" y="82" width="226" height="40" rx="20" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
  <text x="1003" y="108" text-anchor="middle" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="17" font-weight="700" fill="#93c5fd">${escapeXml(cat.shortName)} • ${escapeXml(m.badge || "2026 US")}</text>

  <text x="84" y="182" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="42" font-weight="800" fill="#f8fafc">${escapeXml(titleLines[0] || m.shortTitle)}</text>
  ${
    titleLines[1]
      ? `<text x="84" y="232" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="42" font-weight="800" fill="#f8fafc">${escapeXml(titleLines[1])}</text>
  <text x="84" y="274" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="21" fill="#94a3b8">${escapeXml(subtitle)}</text>`
      : `<text x="84" y="230" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="22" fill="#94a3b8">${escapeXml(subtitle)}</text>`
  }

  <g transform="translate(84, 304)">
    ${kpiCardsSvg}
  </g>

  <g transform="translate(84, 456)">
    <g clip-path="url(#barClip)">
      <rect x="0" y="0" width="1032" height="18" fill="#1f2937"/>
      ${barSegmentsSvg}
    </g>
    ${legendSvg}
  </g>

  <text x="84" y="554" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="#64748b">${escapeXml(truncateText(hostPath, 68))}</text>
  <text x="1116" y="554" text-anchor="end" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#34d399">Sample Baseline • Plug In Your Numbers Free →</text>
</svg>
`;
}

export function renderToolPinSvg(tool, defaultRes, config) {
  const m = tool.meta;
  const cat = CATEGORIES[m.category] || { shortName: m.category };
  const titleLines = wrapLines(m.shortTitle, 24, 2);
  const kpis = (defaultRes.kpis || []).slice(0, 3);
  const steps = (m.howItWorks?.formulaSteps || []).slice(0, 3);
  const tips = (m.tips || []).slice(0, 3);
  const hostPath = canonicalUrl(config.siteOrigin, config.basePath, `/tools/${m.slug}/`).replace(/^https?:\/\//, "");

  const kpiSvg = kpis
    .map((k, idx) => {
      const x = idx * 292;
      const valText = formatMetric(k.value, k.format);
      const border = k.highlight ? "#10b981" : "#1f2937";
      const valColor = k.highlight ? "#34d399" : "#f8fafc";
      return `<g transform="translate(${x}, 0)">
      <rect width="276" height="128" rx="16" fill="#111827" stroke="${border}" stroke-width="2"/>
      <text x="20" y="44" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="#94a3b8">${escapeXml(truncateText(k.label, 22))}</text>
      <text x="20" y="96" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="34" font-weight="800" fill="${valColor}">${escapeXml(valText)}</text>
    </g>`;
    })
    .join("\n    ");

  const stepsSvg = steps
    .map((s, idx) => {
      const y = idx * 62;
      return `<g transform="translate(0, ${y})">
      <rect width="860" height="50" rx="12" fill="#111827" stroke="#1f2937" stroke-width="1.5"/>
      <text x="22" y="32" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="20" font-weight="600" fill="#e2e8f0">${idx + 1}. ${escapeXml(truncateText(s, 66))}</text>
    </g>`;
    })
    .join("\n    ");

  const tipsSvg = tips
    .map((t, idx) => {
      const y = idx * 120;
      return `<g transform="translate(0, ${y})">
      <rect width="860" height="104" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <text x="24" y="40" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#34d399">✓ ${escapeXml(truncateText(t.title, 52))}</text>
      <text x="24" y="76" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="19" fill="#cbd5e1">${escapeXml(truncateText(t.detail, 72))}</text>
    </g>`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500" role="img" aria-label="${escapeXml(m.title)} Cheat Sheet">
  <defs>
    <linearGradient id="pbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="1500" fill="url(#pbg)"/>
  <rect x="36" y="36" width="928" height="1428" rx="28" fill="#0b1220" stroke="#334155" stroke-width="2"/>

  <rect x="70" y="74" width="280" height="44" rx="22" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="210" y="103" text-anchor="middle" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="19" font-weight="700" fill="#6ee7b7">${escapeXml(cat.shortName)} • 2026 Cheat Sheet</text>

  <text x="70" y="188" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="54" font-weight="800" fill="#f8fafc">${escapeXml(titleLines[0] || m.shortTitle)}</text>
  ${
    titleLines[1]
      ? `<text x="70" y="252" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="54" font-weight="800" fill="#34d399">${escapeXml(titleLines[1])}</text>
  <text x="70" y="302" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="23" fill="#94a3b8">${escapeXml(truncateText(m.heroSubtitle, 68))}</text>`
      : `<text x="70" y="246" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="24" fill="#94a3b8">${escapeXml(truncateText(m.heroSubtitle, 68))}</text>`
  }

  <text x="70" y="366" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#93c5fd">SAMPLE BASELINE BREAKDOWN</text>
  <g transform="translate(70, 388)">
    ${kpiSvg}
  </g>

  <text x="70" y="576" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#93c5fd">EXACT ORDER OF OPERATIONS</text>
  <g transform="translate(70, 598)">
    ${stepsSvg}
  </g>

  <text x="70" y="838" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#93c5fd">MARGIN &amp; TAX OPTIMIZATION TIPS</text>
  <g transform="translate(70, 862)">
    ${tipsSvg}
  </g>

  <rect x="70" y="1264" width="860" height="146" rx="20" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
  <text x="500" y="1322" text-anchor="middle" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="30" font-weight="800" fill="#f8fafc">Run Your Own Numbers Free on ${escapeXml(config.siteName)}</text>
  <text x="500" y="1370" text-anchor="middle" font-family="Inter, -apple-system, Segoe UI, Arial, sans-serif" font-size="21" font-weight="600" fill="#a7f3d0">${escapeXml(truncateText(hostPath, 58))}</text>
</svg>
`;
}

export function buildToolSocialEntry(tool, config) {
  const m = tool.meta;
  const defaults = getDefaultValues(m);
  const defaultRes = tool.compute(defaults);
  const url = canonicalUrl(config.siteOrigin, config.basePath, `/tools/${m.slug}/`);
  const ogImageUrl = canonicalUrl(config.siteOrigin, config.basePath, `/og/${m.slug}.svg`);
  const pinImageUrl = canonicalUrl(config.siteOrigin, config.basePath, `/pins/${m.slug}.svg`);

  const sampleInputs = (m.inputs || []).slice(0, 2).map(formatInputPreview).join(", ");
  const kpiSummary = (defaultRes.kpis || [])
    .slice(0, 3)
    .map((k) => `${k.label}: ${formatMetric(k.value, k.format)}`)
    .join(" | ");
  const topTip = m.tips?.[0]
    ? `${m.tips[0].title}: ${m.tips[0].detail}`
    : m.howItWorks?.summary || m.metaDescription;
  const hashtags = HASHTAGS_BY_CATEGORY[m.category] || ["#SmallBusiness", "#UnitEconomics"];
  const subreddits = resolveSubreddits(m.slug, m.category);

  const shortHook = truncateText(
    `Most operators underestimate hidden fee stacking on ${m.shortTitle.replace(/ Calculator$/i, "")}. Baseline (${sampleInputs}) → ${kpiSummary}.`,
    195
  );
  const threadsBluesky = `${shortHook}\n\nFree 2026 interactive breakdown: ${url}\n${hashtags.join(" ")}`;

  const pinTitle = truncateText(`${m.shortTitle} (2026 US Fee & Profit Cheat Sheet)`, 98);
  const pinDescription = truncateText(
    `${m.metaDescription} Baseline (${sampleInputs}) → ${kpiSummary}. Pro tip: ${topTip} ${hashtags.join(" ")}`,
    490
  );

  const breakdownLines = (defaultRes.breakdown || [])
    .map((b) => `| ${b.label} | ${formatMetric(b.amount, "currency")} | ${formatMetric(b.share, "percent")} |`)
    .join("\n");
  const stepLines = (m.howItWorks?.formulaSteps || []).map((s, idx) => `${idx + 1}. ${s}`).join("\n");
  const tipLines = (m.tips || [])
    .slice(0, 3)
    .map((t) => `- **${t.title}:** ${t.detail}`)
    .join("\n");

  const redditTitle = `2026 US Math Breakdown: ${m.shortTitle} (Exact Order of Operations + Sample Scenario)`;
  const redditBody = [
    `Put together a clean 2026 breakdown for anyone modeling **${m.shortTitle}** unit economics (${sampleInputs}):`,
    "",
    "### 1. Baseline Numbers",
    `- **Summary:** ${kpiSummary}`,
    `- **Verdict:** ${defaultRes.verdict?.title || "Baseline"} — ${defaultRes.verdict?.detail || ""}`,
    "",
    "| Component | Amount | Share |",
    "| :--- | ---: | ---: |",
    breakdownLines,
    "",
    "### 2. Order of Operations",
    stepLines,
    "",
    "### 3. Practical Margin Takeaways",
    tipLines,
    "",
    `*(If you want to plug in your own SKU/retainer numbers in the browser, I put the free interactive version here: ${url})*`
  ].join("\n");

  return {
    entry: {
      slug: m.slug,
      shortTitle: m.shortTitle,
      title: m.title,
      category: m.category,
      updatedAt: m.updatedAt,
      url,
      ogImageUrl,
      pinImageUrl,
      sampleInputs,
      kpiSummary,
      rssSummary: `${shortHook} Tip: ${truncateText(topTip, 130)}`,
      threadsBluesky,
      pinterest: {
        board: BOARDS_BY_CATEGORY[m.category] || "US Business Calculators",
        title: pinTitle,
        description: pinDescription,
        link: url,
        imageUrl: pinImageUrl
      },
      reddit: {
        subreddits,
        title: redditTitle,
        bodyMarkdown: redditBody
      }
    },
    ogSvg: renderToolOgSvg(tool, defaultRes, config),
    pinSvg: renderToolPinSvg(tool, defaultRes, config)
  };
}

export function buildEnhancedRssXml({ tools, socialBySlug, publishLog, config }) {
  const siteUrl = canonicalUrl(config.siteOrigin, config.basePath, "/");
  const selfRssUrl = canonicalUrl(config.siteOrigin, config.basePath, "/rss.xml");
  const historyOrder = new Map();
  const history = Array.isArray(publishLog?.history) ? publishLog.history : [];
  history.forEach((item, idx) => {
    if (item?.slug) historyOrder.set(item.slug, idx);
  });

  const sorted = [...tools]
    .sort((a, b) => {
      const dateCmp = String(b.meta.updatedAt || "").localeCompare(String(a.meta.updatedAt || ""));
      if (dateCmp !== 0) return dateCmp;
      const ha = historyOrder.has(a.meta.slug) ? historyOrder.get(a.meta.slug) : -1;
      const hb = historyOrder.has(b.meta.slug) ? historyOrder.get(b.meta.slug) : -1;
      if (ha !== hb) return hb - ha;
      return a.meta.slug.localeCompare(b.meta.slug);
    })
    .slice(0, 25);

  const itemsXml = sorted
    .map((t) => {
      const m = t.meta;
      const cat = CATEGORIES[m.category] || { name: m.category, shortName: m.category };
      const social = socialBySlug.get(m.slug);
      const link = canonicalUrl(config.siteOrigin, config.basePath, `/tools/${m.slug}/`);
      const ogUrl = social?.ogImageUrl || canonicalUrl(config.siteOrigin, config.basePath, `/og/${m.slug}.svg`);
      const pinUrl = social?.pinImageUrl || canonicalUrl(config.siteOrigin, config.basePath, `/pins/${m.slug}.svg`);
      const pubDate = new Date(`${m.updatedAt}T13:17:00Z`).toUTCString();
      const descText = social?.rssSummary || m.metaDescription;
      const stepsHtml = (m.howItWorks?.formulaSteps || [])
        .slice(0, 4)
        .map((s) => `<li>${escapeXml(s)}</li>`)
        .join("");
      const cdataHtml = `<p><strong>${escapeXml(m.heroSubtitle || m.metaDescription)}</strong></p>
<p>${escapeXml(social?.kpiSummary || "")}</p>
<p><img src="${escapeXml(ogUrl)}" alt="${escapeXml(m.title)}" width="1200" height="630" /></p>
<ul>${stepsHtml}</ul>
<p><a href="${escapeXml(link)}">Open the interactive ${escapeXml(m.shortTitle)} &rarr;</a> | <a href="${escapeXml(pinUrl)}">Vertical Cheat Sheet SVG</a></p>`.replace(/]]>/g, "]]]]><![CDATA[>");

      return `  <item>
    <title>${escapeXml(m.title)}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <pubDate>${pubDate}</pubDate>
    <category>${escapeXml(cat.name)}</category>
    <description>${escapeXml(descText)}</description>
    <media:content url="${escapeXml(ogUrl)}" medium="image" type="image/svg+xml" width="1200" height="630" />
    <media:thumbnail url="${escapeXml(ogUrl)}" width="1200" height="630" />
    <content:encoded><![CDATA[${cdataHtml}]]></content:encoded>
  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(config.siteName)} — New US Calculators</title>
  <link>${escapeXml(siteUrl)}</link>
  <atom:link href="${escapeXml(selfRssUrl)}" rel="self" type="application/rss+xml" />
  <description>${escapeXml(config.tagline)}</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
</channel>
</rss>
`;
}
