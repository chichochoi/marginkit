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
  loadSiteConfig
} from "../src/lib.mjs";
import {
  buildTrustPages,
  escapeHtml,
  renderCalculatorPage,
  renderCategoryPage,
  renderHomePage,
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

function buildRssXml(tools, config) {
  const siteUrl = canonicalUrl(config.siteOrigin, config.basePath, "/");
  const sorted = [...tools].sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt)).slice(0, 20);
  const items = sorted
    .map((t) => {
      const link = canonicalUrl(config.siteOrigin, config.basePath, `/tools/${t.meta.slug}/`);
      return `  <item>
    <title>${escapeHtml(t.meta.title)}</title>
    <link>${escapeHtml(link)}</link>
    <guid>${escapeHtml(link)}</guid>
    <pubDate>${new Date(`${t.meta.updatedAt}T12:00:00Z`).toUTCString()}</pubDate>
    <description>${escapeHtml(t.meta.metaDescription)}</description>
  </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeHtml(config.siteName)}</title>
  <link>${escapeHtml(siteUrl)}</link>
  <description>${escapeHtml(config.tagline)}</description>
${items}
</channel>
</rss>
`;
}

export async function buildSite() {
  const { published, staged } = await verifyAllTools();
  const [config, affiliates] = await Promise.all([loadSiteConfig(), loadAffiliates()]);
  const today = getTodayUtc();

  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(path.join(DIST_DIR, "assets"), { recursive: true });

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

  // Published calculator pages
  for (const tool of sortedPublished) {
    const html = renderCalculatorPage({
      tool,
      allTools: sortedPublished,
      config,
      affiliates
    });
    await writeFileEnsuringDir(path.join(DIST_DIR, "tools", tool.meta.slug, "index.html"), html);
    sitemapUrls.push({
      loc: canonicalUrl(config.siteOrigin, config.basePath, `/tools/${tool.meta.slug}/`),
      lastmod: tool.meta.updatedAt || today,
      changefreq: "weekly",
      priority: "0.9"
    });
  }

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
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  await Promise.all([
    writeFileEnsuringDir(path.join(DIST_DIR, "sitemap.xml"), buildSitemapXml(sitemapUrls)),
    writeFileEnsuringDir(path.join(DIST_DIR, "robots.txt"), robotsTxt),
    writeFileEnsuringDir(path.join(DIST_DIR, "rss.xml"), buildRssXml(sortedPublished, config)),
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
    totalPages: 1 + sortedPublished.length + CATEGORY_LIST.length + trustPages.length
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const start = Date.now();
    const summary = await buildSite();
    const elapsed = Date.now() - start;
    console.log(
      `BUILT: ${summary.totalPages} HTML pages (${summary.publishedCount} live tools, ${summary.stagedCount} staged) in ${elapsed}ms.`
    );
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
