import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATEGORY_LIST,
  DATA_DIR,
  DIST_DIR,
  ROOT_DIR,
  canonicalUrl,
  getTodayUtc,
  loadAffiliates,
  loadPublishLog,
  loadSiteConfig
} from "../src/lib.mjs";
import {
  buildEnhancedRssXml,
  buildToolSocialEntry,
  renderDefaultOgSvg
} from "../src/social.mjs";
import {
  buildTrustPages,
  escapeHtml,
  renderCalculatorPage,
  renderCategoryPage,
  renderHomePage,
  renderPromoKitPage,
  renderTrustPage
} from "../src/templates.mjs";
import { verifyAllTools } from "./verify.mjs";

async function writeFileEnsuringDir(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

function buildSitemapXml(urls) {
  const entries = urls
    .map(
      (u) => `  <url>
    <loc>${escapeHtml(u.loc)}</loc>
    <lastmod>${escapeHtml(u.lastmod)}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

export async function buildSite() {
  const { published, staged } = await verifyAllTools();
  const [config, affiliates, publishLog] = await Promise.all([
    loadSiteConfig(),
    loadAffiliates(),
    loadPublishLog()
  ]);
  const today = getTodayUtc();

  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await Promise.all([
    fs.mkdir(path.join(DIST_DIR, "assets"), { recursive: true }),
    fs.mkdir(path.join(DIST_DIR, "og"), { recursive: true }),
    fs.mkdir(path.join(DIST_DIR, "pins"), { recursive: true })
  ]);

  await Promise.all([
    fs.copyFile(path.join(ROOT_DIR, "src", "styles.css"), path.join(DIST_DIR, "assets", "styles.css")),
    fs.copyFile(
      path.join(ROOT_DIR, "src", "client-runtime.js"),
      path.join(DIST_DIR, "assets", "client-runtime.js")
    )
  ]);

  const sortedPublished = [...published].sort((a, b) =>
    a.meta.shortTitle.localeCompare(b.meta.shortTitle)
  );

  await writeFileEnsuringDir(
    path.join(DIST_DIR, "og", "default.svg"),
    renderDefaultOgSvg(config, sortedPublished.length)
  );

  const sitemapUrls = [
    {
      loc: canonicalUrl(config.siteOrigin, config.basePath, "/"),
      lastmod: today,
      changefreq: "daily",
      priority: "1.0"
    }
  ];

  // Homepage
  await writeFileEnsuringDir(
    path.join(DIST_DIR, "index.html"),
    renderHomePage({ tools: sortedPublished, config })
  );

  const socialEntries = [];
  const socialBySlug = new Map();

  // Published calculator pages + zero-token SVG cards & social copy pack
  for (const tool of sortedPublished) {
    const html = renderCalculatorPage({
      tool,
      allTools: sortedPublished,
      config,
      affiliates
    });
    const { entry, ogSvg, pinSvg } = buildToolSocialEntry(tool, config);
    socialEntries.push(entry);
    socialBySlug.set(tool.meta.slug, entry);

    await Promise.all([
      writeFileEnsuringDir(path.join(DIST_DIR, "tools", tool.meta.slug, "index.html"), html),
      writeFileEnsuringDir(path.join(DIST_DIR, "og", `${tool.meta.slug}.svg`), ogSvg),
      writeFileEnsuringDir(path.join(DIST_DIR, "pins", `${tool.meta.slug}.svg`), pinSvg)
    ]);

    sitemapUrls.push({
      loc: canonicalUrl(config.siteOrigin, config.basePath, `/tools/${tool.meta.slug}/`),
      lastmod: tool.meta.updatedAt || today,
      changefreq: "weekly",
      priority: "0.9"
    });
  }

  // Sort social entries newest-first for operator convenience
  const sortedSocialEntries = [...socialEntries].sort((a, b) => {
    const cmp = String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    return cmp !== 0 ? cmp : a.shortTitle.localeCompare(b.shortTitle);
  });

  // Unlisted noindex operator promo-kit page + JSON pack
  const socialPackPayload =
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        rssFeedUrl: canonicalUrl(config.siteOrigin, config.basePath, "/rss.xml"),
        promoKitUrl: canonicalUrl(config.siteOrigin, config.basePath, "/promo-kit/"),
        count: sortedSocialEntries.length,
        items: sortedSocialEntries
      },
      null,
      2
    ) + "\n";

  await Promise.all([
    writeFileEnsuringDir(
      path.join(DIST_DIR, "promo-kit", "index.html"),
      renderPromoKitPage({ socialEntries: sortedSocialEntries, config })
    ),
    writeFileEnsuringDir(path.join(DIST_DIR, "social-pack.json"), socialPackPayload),
    writeFileEnsuringDir(path.join(DATA_DIR, "social-pack.json"), socialPackPayload)
  ]);

  // Category pages
  for (const category of CATEGORY_LIST) {
    const catTools = sortedPublished.filter((t) => t.meta.category === category.slug);
    const html = renderCategoryPage({ category, tools: catTools, config });
    await writeFileEnsuringDir(path.join(DIST_DIR, "category", category.slug, "index.html"), html);
    sitemapUrls.push({
      loc: canonicalUrl(config.siteOrigin, config.basePath, `/category/${category.slug}/`),
      lastmod: today,
      changefreq: "weekly",
      priority: "0.8"
    });
  }

  // Trust & policy pages
  const trustPages = buildTrustPages(config);
  for (const page of trustPages) {
    const html = renderTrustPage({ ...page, config });
    await writeFileEnsuringDir(path.join(DIST_DIR, page.slug, "index.html"), html);
    sitemapUrls.push({
      loc: canonicalUrl(config.siteOrigin, config.basePath, `/${page.slug}/`),
      lastmod: today,
      changefreq: "monthly",
      priority: "0.5"
    });
  }

  // Sitemaps, RSS, robots, .nojekyll, IndexNow key
  const sitemapUrl = canonicalUrl(config.siteOrigin, config.basePath, "/sitemap.xml");
  const robotsTxt = `User-agent: *\nAllow: /\nDisallow: ${config.basePath || ""}/promo-kit/\n\nSitemap: ${sitemapUrl}\n`;

  await Promise.all([
    writeFileEnsuringDir(path.join(DIST_DIR, "sitemap.xml"), buildSitemapXml(sitemapUrls)),
    writeFileEnsuringDir(path.join(DIST_DIR, "robots.txt"), robotsTxt),
    writeFileEnsuringDir(
      path.join(DIST_DIR, "rss.xml"),
      buildEnhancedRssXml({ tools: sortedPublished, socialBySlug, publishLog, config })
    ),
    writeFileEnsuringDir(path.join(DIST_DIR, ".nojekyll"), ""),
    writeFileEnsuringDir(path.join(DIST_DIR, `${config.indexNowKey}.txt`), `${config.indexNowKey}\n`)
  ]);

  // Compact index so scheduled agents never scan individual tool files
  const catalogIndex = {
    updatedAt: new Date().toISOString(),
    publishedCount: sortedPublished.length,
    stagedCount: staged.length,
    published: sortedPublished.map((t) => ({
      slug: t.meta.slug,
      shortTitle: t.meta.shortTitle,
      category: t.meta.category,
      updatedAt: t.meta.updatedAt
    })),
    staged: staged.map((t) => ({
      slug: t.meta.slug,
      shortTitle: t.meta.shortTitle,
      category: t.meta.category,
      queuedOrder: t.meta.queuedOrder ?? 9999
    }))
  };
  await writeFileEnsuringDir(
    path.join(DATA_DIR, "catalog-index.json"),
    JSON.stringify(catalogIndex, null, 2) + "\n"
  );

  return {
    publishedCount: sortedPublished.length,
    stagedCount: staged.length,
    svgCount: 1 + sortedPublished.length * 2,
    totalPages: 2 + sortedPublished.length + CATEGORY_LIST.length + trustPages.length
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const start = Date.now();
    const summary = await buildSite();
    const elapsed = Date.now() - start;
    console.log(
      `BUILT: ${summary.totalPages} HTML pages, ${summary.svgCount} SVG social cards (${summary.publishedCount} live tools, ${summary.stagedCount} staged) in ${elapsed}ms.`
    );
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
