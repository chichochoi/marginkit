import {
  CATEGORIES,
  CATEGORY_LIST,
  canonicalUrl,
  formatMetric,
  getDefaultValues,
  withBase
} from "./lib.mjs";

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function safeInlineScriptValue(str) {
  return String(str).replace(/<\/script/gi, "<\\/script");
}

function renderHead({ title, description, canonical, config, jsonLdList = [] }) {
  const fullTitle = `${title} | ${config.siteName}`;
  const cssHref = withBase(config.basePath, "/assets/styles.css");
  const adsenseHead = config.adsenseClientId
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapeHtml(config.adsenseClientId)}" crossorigin="anonymous"></script>`
    : "";
  const gaHead = config.gaMeasurementId
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(config.gaMeasurementId)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeHtml(config.gaMeasurementId)}');</script>`
    : "";
  const ldScripts = jsonLdList
    .map((item) => `<script type="application/ld+json">${safeJsonLd(item)}</script>`)
    .join("\n  ");

  return `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:site_name" content="${escapeHtml(config.siteName)}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="${escapeHtml(cssHref)}">
  ${adsenseHead}
  ${gaHead}
  ${ldScripts}
</head>`;
}

function renderHeader(config, activePath = "") {
  const b = config.basePath;
  const navLinks = [
    { label: "All Calculators", href: withBase(b, "/") },
    ...CATEGORY_LIST.map((c) => ({
      label: c.shortName,
      href: withBase(b, `/category/${c.slug}/`)
    })),
    { label: "Methodology", href: withBase(b, "/methodology/") }
  ];

  return `<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${escapeHtml(withBase(b, "/"))}">
      <span class="brand-mark">M</span>
      <span>${escapeHtml(config.siteName)}</span>
    </a>
    <nav class="nav-links" aria-label="Primary">
      ${navLinks
        .map(
          (l) =>
            `<a href="${escapeHtml(l.href)}"${l.href === activePath ? ' class="active"' : ""}>${escapeHtml(l.label)}</a>`
        )
        .join("\n      ")}
    </nav>
  </div>
</header>`;
}

function renderFooter(config) {
  const b = config.basePath;
  const year = new Date().getUTCFullYear();
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <strong>${escapeHtml(config.siteName)}</strong>
        <p>${escapeHtml(config.tagline)}. Fast, transparent, browser-based calculations with zero paywalls.</p>
      </div>
      <div>
        <strong>Categories</strong>
        <ul class="footer-links">
          ${CATEGORY_LIST.map(
            (c) => `<li><a href="${escapeHtml(withBase(b, `/category/${c.slug}/`))}">${escapeHtml(c.name)}</a></li>`
          ).join("\n          ")}
        </ul>
      </div>
      <div>
        <strong>Trust &amp; Policies</strong>
        <ul class="footer-links">
          <li><a href="${escapeHtml(withBase(b, "/about/"))}">About MarginKit</a></li>
          <li><a href="${escapeHtml(withBase(b, "/methodology/"))}">Methodology</a></li>
          <li><a href="${escapeHtml(withBase(b, "/privacy-policy/"))}">Privacy Policy</a></li>
          <li><a href="${escapeHtml(withBase(b, "/terms/"))}">Terms of Use</a></li>
          <li><a href="${escapeHtml(withBase(b, "/contact/"))}">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="disclaimer">
      &copy; ${year} ${escapeHtml(config.siteName)}. For informational and estimation purposes only; not CPA, tax, legal, or financial advice. Published fee schedules can change—verify final settlement numbers directly in your merchant or IRS portal.
    </div>
  </div>
</footer>`;
}

function renderAdSlot(config, slotId = "top") {
  if (!config.adsenseClientId) return "";
  return `<div class="ad-slot" data-ad-slot="${escapeHtml(slotId)}">
  <ins class="adsbygoogle" style="display:block" data-ad-client="${escapeHtml(config.adsenseClientId)}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>`;
}

function renderToolCard(tool, config) {
  const m = tool.meta;
  const cat = CATEGORIES[m.category] || { shortName: m.category };
  const href = withBase(config.basePath, `/tools/${m.slug}/`);
  const searchBlob = `${m.shortTitle} ${m.title} ${m.metaDescription} ${cat.name} ${cat.shortName}`;
  return `<a class="tool-card mk-tool-card" href="${escapeHtml(href)}" data-category="${escapeHtml(m.category)}" data-search="${escapeHtml(searchBlob)}">
  <div>
    <span class="badge">${escapeHtml(cat.shortName)}</span>
    <h3>${escapeHtml(m.shortTitle)}</h3>
    <p>${escapeHtml(m.metaDescription)}</p>
  </div>
  <span class="tool-card-link">Open calculator &rarr;</span>
</a>`;
}

function renderInputControl(input) {
  const idAttr = `mk-in-${escapeHtml(input.id)}`;
  const helpHtml = input.help ? `<span class="field-help">${escapeHtml(input.help)}</span>` : "";

  if (input.type === "checkbox") {
    return `<label class="checkbox-row" for="${idAttr}">
  <input type="checkbox" id="${idAttr}" name="${escapeHtml(input.id)}"${input.defaultValue ? " checked" : ""}>
  <span class="checkbox-row-text">
    <span class="checkbox-row-title">${escapeHtml(input.label)}</span>
    ${helpHtml}
  </span>
</label>`;
  }

  if (input.type === "select") {
    const opts = (input.options || [])
      .map(
        (opt) =>
          `<option value="${escapeHtml(opt.value)}"${String(opt.value) === String(input.defaultValue) ? " selected" : ""}>${escapeHtml(opt.label)}</option>`
      )
      .join("");
    return `<div class="field">
  <label for="${idAttr}">${escapeHtml(input.label)}</label>
  <select id="${idAttr}" name="${escapeHtml(input.id)}">${opts}</select>
  ${helpHtml}
</div>`;
  }

  const minAttr = input.min !== undefined ? ` min="${escapeHtml(input.min)}"` : "";
  const maxAttr = input.max !== undefined ? ` max="${escapeHtml(input.max)}"` : "";
  const stepAttr = input.step !== undefined ? ` step="${escapeHtml(input.step)}"` : ` step="any"`;
  const prefixHtml = input.prefix ? `<span class="input-affix">${escapeHtml(input.prefix)}</span>` : "";
  const suffixHtml = input.suffix
    ? `<span class="input-affix input-affix-right">${escapeHtml(input.suffix)}</span>`
    : "";

  return `<div class="field">
  <label for="${idAttr}">${escapeHtml(input.label)}</label>
  <div class="input-wrap">
    ${prefixHtml}
    <input type="number" id="${idAttr}" name="${escapeHtml(input.id)}" value="${escapeHtml(input.defaultValue)}"${minAttr}${maxAttr}${stepAttr}>
    ${suffixHtml}
  </div>
  ${helpHtml}
</div>`;
}

export function renderCalculatorPage({ tool, allTools, config, affiliates }) {
  const m = tool.meta;
  const cat = CATEGORIES[m.category] || { slug: m.category, name: m.category, shortName: m.category };
  const routePath = `/tools/${m.slug}/`;
  const canonical = canonicalUrl(config.siteOrigin, config.basePath, routePath);
  const defaultValues = getDefaultValues(m);
  const initialRes = tool.compute(defaultValues);
  const runtimeSrc = withBase(config.basePath, "/assets/client-runtime.js");

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: canonicalUrl(config.siteOrigin, config.basePath, "/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: cat.name,
        item: canonicalUrl(config.siteOrigin, config.basePath, `/category/${cat.slug}/`)
      },
      {
        "@type": "ListItem",
        position: 3,
        name: m.shortTitle,
        item: canonical
      }
    ]
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: m.title,
    description: m.metaDescription,
    url: canonical,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (m.faqs || []).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };

  const totalShare = (initialRes.breakdown || []).reduce(
    (sum, r) => sum + Math.max(0, Number(r.share) || 0),
    0
  );

  const partner = affiliates[m.category];
  const partnerHtml = partner
    ? `<aside class="partner-card" aria-label="Recommended resource">
  <div class="partner-body">
    <span class="badge">${escapeHtml(partner.badge)}</span>
    <h3 style="margin-top:8px;">${escapeHtml(partner.headline)}</h3>
    <p style="margin:0;color:var(--text-muted);font-size:0.92rem;">${escapeHtml(partner.description)}</p>
    <div class="partner-disclosure">${
      partner.isAffiliate
        ? `Affiliate Disclosure: MarginKit may earn a commission at no cost to you if you sign up through ${escapeHtml(partner.partnerName)}.`
        : `Editorial Resource: Official ${escapeHtml(partner.partnerName)} platform reference (no paid placement).`
    }</div>
  </div>
  <a class="btn btn-primary" href="${escapeHtml(partner.url)}" target="_blank" rel="${partner.isAffiliate ? "sponsored noopener noreferrer" : "noopener noreferrer"}">${escapeHtml(partner.ctaText)} &rarr;</a>
</aside>`
    : "";

  const sameCategory = allTools.filter((t) => t.meta.slug !== m.slug && t.meta.category === m.category);
  const otherTools = allTools.filter((t) => t.meta.slug !== m.slug && t.meta.category !== m.category);
  const related = [...sameCategory, ...otherTools].slice(0, 3);

  return `${renderHead({
    title: m.title,
    description: m.metaDescription,
    canonical,
    config,
    jsonLdList: [breadcrumbLd, appLd, faqLd]
  })}
<body>
${renderHeader(config)}
<main class="container">
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="${escapeHtml(withBase(config.basePath, "/"))}">Home</a>
    <span>/</span>
    <a href="${escapeHtml(withBase(config.basePath, `/category/${cat.slug}/`))}">${escapeHtml(cat.name)}</a>
    <span>/</span>
    <span>${escapeHtml(m.shortTitle)}</span>
  </nav>

  <section class="hero hero-compact">
    <div class="badge-row">
      <span class="badge">${escapeHtml(m.badge || "2026 US Rates")}</span>
      <span class="badge badge-muted">Last verified: ${escapeHtml(m.updatedAt)}</span>
    </div>
    <h1>${escapeHtml(m.title)}</h1>
    <p class="hero-subtitle">${escapeHtml(m.heroSubtitle)}</p>
  </section>

  ${renderAdSlot(config, "calc-top")}

  <section id="mk-calc-root" class="calc-layout" aria-label="Interactive calculator">
    <div class="panel">
      <div class="panel-header">
        <h2 class="panel-title">Inputs</h2>
      </div>
      <form id="mk-calc-form" class="form-grid" onsubmit="return false;">
        ${(m.inputs || []).map(renderInputControl).join("\n        ")}
      </form>
      <div class="form-actions">
        <button type="button" id="mk-copy-link" class="btn btn-primary">Copy Shareable Link</button>
        <button type="button" id="mk-reset-btn" class="btn">Reset Defaults</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h2 class="panel-title">Instant Breakdown</h2>
      </div>
      <div id="mk-kpi-grid" class="kpi-grid">
        ${(initialRes.kpis || [])
          .map(
            (k) => `<div class="kpi-card${k.highlight ? " highlight" : ""}">
          <div class="kpi-label">${escapeHtml(k.label)}</div>
          <div class="kpi-value">${escapeHtml(formatMetric(k.value, k.format))}</div>
        </div>`
          )
          .join("\n        ")}
      </div>

      <div id="mk-verdict-box" class="verdict-box verdict-${escapeHtml(initialRes.verdict?.tone || "good")}">
        <div class="verdict-title">${escapeHtml(initialRes.verdict?.title || "")}</div>
        <div class="verdict-detail">${escapeHtml(initialRes.verdict?.detail || "")}</div>
      </div>

      <div class="stacked-bar-wrap">
        <div id="mk-stacked-bar" class="stacked-bar">
          ${(initialRes.breakdown || [])
            .map((r) => {
              const share = Math.max(0, Number(r.share) || 0);
              const pct = totalShare > 0 ? (share / totalShare) * 100 : 0;
              return `<div class="seg seg-${escapeHtml(r.colorKey || "cost")}" style="width:${pct.toFixed(2)}%" title="${escapeHtml(r.label)}: ${share.toFixed(1)}%"></div>`;
            })
            .join("")}
        </div>
      </div>

      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Component</th>
            <th class="num">Amount</th>
            <th class="num">Share</th>
          </tr>
        </thead>
        <tbody id="mk-breakdown-body">
          ${(initialRes.breakdown || [])
            .map(
              (r) => `<tr>
            <td><span class="dot seg-${escapeHtml(r.colorKey || "cost")}"></span>${escapeHtml(r.label)}</td>
            <td class="num">${escapeHtml(formatMetric(r.amount, "currency"))}</td>
            <td class="num">${escapeHtml(formatMetric(r.share, "percent"))}</td>
          </tr>`
            )
            .join("\n          ")}
        </tbody>
      </table>
    </div>
  </section>

  ${partnerHtml}

  <section class="content-section">
    <h2>How This Calculator Works</h2>
    <p>${escapeHtml(m.howItWorks.summary)}</p>
    <ol class="formula-list">
      ${(m.howItWorks.formulaSteps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("\n      ")}
    </ol>
    ${
      m.howItWorks.feeTable
        ? `<div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>${m.howItWorks.feeTable.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${m.howItWorks.feeTable.rows
            .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
            .join("\n          ")}
        </tbody>
      </table>
    </div>`
        : ""
    }
  </section>

  ${renderAdSlot(config, "calc-mid")}

  <section class="content-section">
    <h2>Practical Margin &amp; Tax Optimization Tips</h2>
    <div class="tips-grid">
      ${(m.tips || [])
        .map(
          (t) => `<article class="tip-card">
        <h3>${escapeHtml(t.title)}</h3>
        <p>${escapeHtml(t.detail)}</p>
      </article>`
        )
        .join("\n      ")}
    </div>
  </section>

  <section class="content-section">
    <h2>Frequently Asked Questions</h2>
    <div class="faq-list">
      ${(m.faqs || [])
        .map(
          (f, idx) => `<details class="faq-item"${idx === 0 ? " open" : ""}>
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a)}</p>
      </details>`
        )
        .join("\n      ")}
    </div>
  </section>

  <section style="margin-top:32px;">
    <h2>Related Calculators</h2>
    <div class="tools-grid">
      ${related.map((t) => renderToolCard(t, config)).join("\n      ")}
    </div>
  </section>
</main>
${renderFooter(config)}
<script>
window.__MK_INPUTS__ = ${safeInlineScriptValue(JSON.stringify(m.inputs || []))};
window.__MK_COMPUTE__ = ${safeInlineScriptValue(tool.compute.toString())};
</script>
<script defer src="${escapeHtml(runtimeSrc)}"></script>
</body>
</html>`;
}

export function renderHomePage({ tools, config }) {
  const canonical = canonicalUrl(config.siteOrigin, config.basePath, "/");
  const runtimeSrc = withBase(config.basePath, "/assets/client-runtime.js");
  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.siteName,
    url: canonical,
    description: config.tagline
  };

  return `${renderHead({
    title: "US Seller, Freelancer & Creator Fee Calculators",
    description: "Free interactive 2026 US calculators for Etsy, Shopify, Amazon FBA, Stripe, PayPal, TikTok Shop, 1099 self-employment tax, and creator payouts.",
    canonical,
    config,
    jsonLdList: [webSiteLd]
  })}
<body>
${renderHeader(config, withBase(config.basePath, "/"))}
<section class="hero">
  <div class="container">
    <div class="badge-row">
      <span class="badge">2026 US Fee &amp; Tax Schedules</span>
      <span class="badge badge-muted">${tools.length} Live Calculators &bull; 100% Free</span>
    </div>
    <h1>Transparent Profit, Fee &amp; Tax Calculators for US Operators</h1>
    <p class="hero-subtitle">Model marketplace take rates, payment processing fees, ad ROAS break-even points, and IRS 1099 quarterly taxes instantly—right in your browser.</p>
    <div class="search-bar-wrap">
      <input id="mk-directory-search" class="search-input" type="search" placeholder="Search calculators (e.g., Etsy, Stripe, 1099 tax, TikTok Shop, Substack)..." aria-label="Search calculators">
    </div>
  </div>
</section>

<main class="container" style="padding-top:16px;">
  <div class="pill-bar" role="tablist" aria-label="Filter by category">
    <button type="button" class="pill mk-cat-pill active" data-category="all">All (${tools.length})</button>
    ${CATEGORY_LIST.map((c) => {
      const count = tools.filter((t) => t.meta.category === c.slug).length;
      return `<button type="button" class="pill mk-cat-pill" data-category="${escapeHtml(c.slug)}">${escapeHtml(c.shortName)} (${count})</button>`;
    }).join("\n    ")}
  </div>

  ${renderAdSlot(config, "home-top")}

  <div class="tools-grid">
    ${tools.map((t) => renderToolCard(t, config)).join("\n    ")}
  </div>
  <div id="mk-empty-state" class="empty-state" style="display:none;">
    No calculators match that search. Try a platform name like "Shopify", "Stripe", or "1099".
  </div>

  <section class="content-section" style="margin-top:36px;">
    <h2>Why Operators Trust MarginKit</h2>
    <div class="tips-grid">
      <div class="tip-card">
        <h3>Real 2026 Fee Schedules</h3>
        <p>Each model separates percentage commissions, per-order fixed cents, payment processing surcharges, and fulfillment costs so hidden margin leaks surface immediately.</p>
      </div>
      <div class="tip-card">
        <h3>Automated Regression Checks</h3>
        <p>Every calculator runs through deterministic mathematical test cases before publishing, preventing stale formulas or broken reverse-fee math.</p>
      </div>
      <div class="tip-card">
        <h3>Client-Side Privacy</h3>
        <p>Your unit economics, revenue, and tax figures never leave your browser. Shareable scenario URLs store only non-sensitive input parameters if you click copy.</p>
      </div>
      <div class="tip-card">
        <h3>Daily Expansion</h3>
        <p>New micro-niche calculators for specific US marketplaces, state tax scenarios, and creator monetization platforms are added continuously.</p>
      </div>
    </div>
  </section>
</main>
${renderFooter(config)}
<script defer src="${escapeHtml(runtimeSrc)}"></script>
</body>
</html>`;
}

export function renderCategoryPage({ category, tools, config }) {
  const routePath = `/category/${category.slug}/`;
  const canonical = canonicalUrl(config.siteOrigin, config.basePath, routePath);
  const activeHref = withBase(config.basePath, routePath);

  return `${renderHead({
    title: category.seoTitle,
    description: category.seoDescription,
    canonical,
    config
  })}
<body>
${renderHeader(config, activeHref)}
<main class="container">
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="${escapeHtml(withBase(config.basePath, "/"))}">Home</a>
    <span>/</span>
    <span>${escapeHtml(category.name)}</span>
  </nav>

  <section class="hero hero-compact">
    <span class="badge">${escapeHtml(tools.length)} Calculators</span>
    <h1 style="margin-top:10px;">${escapeHtml(category.name)}</h1>
    <p class="hero-subtitle">${escapeHtml(category.description)}</p>
  </section>

  ${renderAdSlot(config, `cat-${category.slug}`)}

  <div class="tools-grid">
    ${tools.map((t) => renderToolCard(t, config)).join("\n    ")}
  </div>
</main>
${renderFooter(config)}
</body>
</html>`;
}

export function renderTrustPage({ slug, title, description, bodyHtml, config }) {
  const routePath = `/${slug}/`;
  const canonical = canonicalUrl(config.siteOrigin, config.basePath, routePath);
  return `${renderHead({
    title,
    description,
    canonical,
    config
  })}
<body>
${renderHeader(config, withBase(config.basePath, routePath))}
<main class="container">
  <article class="prose-page">
    <h1>${escapeHtml(title)}</h1>
    <p class="hero-subtitle" style="margin-bottom:20px;">${escapeHtml(description)}</p>
    ${bodyHtml}
  </article>
</main>
${renderFooter(config)}
</body>
</html>`;
}

export function buildTrustPages(config) {
  const b = config.basePath;
  return [
    {
      slug: "about",
      title: "About MarginKit",
      description: "Independent US fee, unit-economics, and self-employment tax calculators built for e-commerce sellers, creators, and solo operators.",
      bodyHtml: `
        <p>${escapeHtml(config.siteName)} was built to solve a recurring problem for US online sellers, freelancers, and digital creators: published marketplace pricing pages rarely reflect real net take-home profit once fixed transaction cents, offsite advertising surcharges, fulfillment costs, and self-employment taxes compound.</p>
        <h2>Who MarginKit Serves</h2>
        <ul>
          <li><strong>E-Commerce Merchants:</strong> Etsy, Shopify, Amazon FBA, TikTok Shop, and eBay sellers calibrating retail pricing and ad ROAS thresholds.</li>
          <li><strong>Creators &amp; SaaS Founders:</strong> Newsletter writers, course creators, and solo founders comparing Merchant of Record vs. standard card processing.</li>
          <li><strong>1099 Independent Contractors:</strong> Freelancers converting W-2 salary targets into sustainable hourly rates and planning quarterly IRS Form 1040-ES payments.</li>
        </ul>
        <h2>Zero Paywalls &amp; Browser Privacy</h2>
        <p>All calculators execute directly inside your browser without accounts, spreadsheets, or paywalls. See our <a href="${escapeHtml(withBase(b, "/methodology/"))}">Methodology</a> for how fee schedules are modeled and verified.</p>`
    },
    {
      slug: "methodology",
      title: "Calculation Methodology & Verification",
      description: "How MarginKit sources 2026 US marketplace fee schedules, IRS tax brackets, and validates every formula with automated test suites.",
      bodyHtml: `
        <p>Every calculator on ${escapeHtml(config.siteName)} follows a transparent, deterministic math specification verified automatically before deployment.</p>
        <h2>1. Order of Operations</h2>
        <p>US marketplace commissions and payment processor fees frequently apply to gross buyer checkout amounts (item price plus buyer-paid shipping) rather than item subtotal alone. Where platforms differ, each calculator discloses the exact fee base in its <em>How This Calculator Works</em> section.</p>
        <h2>2. IRS Tax &amp; Wage Base Rules</h2>
        <p>US 1099 tax estimators apply the statutory 92.35% net-earnings multiplier for Self-Employment Tax (12.4% Social Security up to the annual wage base cap plus 2.9% Medicare), the 50% SE tax adjustment, standard deductions, and progressive federal brackets.</p>
        <h2>3. Automated Verification</h2>
        <p>Every published and staged calculator includes unit test cases validated in CI prior to static build deployment, ensuring zero runtime errors or broken reverse-payout equations.</p>`
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      description: "How MarginKit handles browser calculations, analytics, advertising cookies (GDPR/CCPA), and user privacy.",
      bodyHtml: `
        <p><strong>Effective Date:</strong> November 25, 2026</p>
        <h2>1. Calculator Inputs Stay in Your Browser</h2>
        <p>${escapeHtml(config.siteName)} executes all fee, profit, and tax calculations client-side in JavaScript. We do not collect, log, or store financial inputs entered into calculator forms on any backend server.</p>
        <h2>2. Cookies, Analytics &amp; Advertising</h2>
        <p>We may use privacy-respecting web analytics and third-party advertising networks such as Google AdSense. Third-party vendors, including Google, use cookies (such as the DoubleClick cookie) to serve ads based on prior visits to this site or other websites.</p>
        <p>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">Google Ads Settings</a> or <a href="https://www.aboutads.info" rel="noopener noreferrer" target="_blank">aboutads.info</a>.</p>
        <h2>3. California (CCPA) &amp; EEA/UK (GDPR) Rights</h2>
        <p>We do not sell personal financial data. If you have privacy questions or data deletion requests, contact us at <a href="mailto:${escapeHtml(config.contactEmail)}">${escapeHtml(config.contactEmail)}</a>.</p>`
    },
    {
      slug: "terms",
      title: "Terms of Use & Financial Disclaimer",
      description: "Terms governing use of MarginKit calculators, accuracy limitations, and professional advice disclaimers.",
      bodyHtml: `
        <h2>1. Informational Estimates Only</h2>
        <p>All outputs generated by ${escapeHtml(config.siteName)} are for informational, planning, and educational purposes only. They do not constitute certified public accounting (CPA), tax, legal, investment, or financial advice.</p>
        <h2>2. Merchant &amp; Tax Schedule Changes</h2>
        <p>Marketplaces (such as Etsy, Amazon, Shopify, TikTok Shop, Stripe, PayPal, and Upwork) and federal/state tax authorities update fee schedules, surcharges, and brackets periodically. Always confirm exact payout and tax liabilities inside your official merchant dashboard or with a licensed professional.</p>
        <h2>3. Limitation of Liability</h2>
        <p>By using this website, you agree that ${escapeHtml(config.siteName)} and its maintainers are not liable for pricing errors, tax underpayment penalties, or business decisions made using estimated outputs.</p>`
    },
    {
      slug: "contact",
      title: "Contact MarginKit",
      description: "Report a marketplace fee schedule update, suggest a new US calculator, or reach the MarginKit team.",
      bodyHtml: `
        <p>Notice a marketplace rate change, a new payment processor surcharge, or a niche US seller/freelancer calculator you want added?</p>
        <h2>Direct Contact</h2>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:${escapeHtml(config.contactEmail)}">${escapeHtml(config.contactEmail)}</a></li>
          <li><strong>Corrections:</strong> Please include the calculator URL, official platform fee documentation link, and the specific rate that changed.</li>
        </ul>
        <p>We review fee schedule feedback regularly and update verified calculator models across our catalog.</p>`
    }
  ];
}
