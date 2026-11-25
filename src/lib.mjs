import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, "..");
export const TOOLS_PUBLISHED_DIR = path.join(ROOT_DIR, "tools", "published");
export const TOOLS_STAGED_DIR = path.join(ROOT_DIR, "tools", "staged");
export const DATA_DIR = path.join(ROOT_DIR, "data");
export const DIST_DIR = path.join(ROOT_DIR, "dist");

export const CATEGORIES = {
  ecommerce: {
    slug: "ecommerce",
    name: "E-Commerce Seller Fees",
    shortName: "E-Commerce",
    description: "Net profit, marketplace commission, shipping, and ROAS calculators for US Etsy, Shopify, Amazon FBA, eBay, and TikTok Shop sellers.",
    seoTitle: "E-Commerce Seller Fee & Margin Calculators (US)",
    seoDescription: "Free US seller fee and profit margin calculators for Etsy, Shopify, Amazon FBA, TikTok Shop, eBay, and Print-on-Demand stores."
  },
  payments: {
    slug: "payments",
    name: "Payment Processing & SaaS",
    shortName: "Payments",
    description: "Compare US merchant card processing fees, reverse net payout targets, and SaaS unit economics like LTV, churn, and CAC payback.",
    seoTitle: "US Payment Processing & SaaS Unit Economics Calculators",
    seoDescription: "Calculate Stripe, PayPal, and merchant processing fees plus reverse payout amounts and SaaS LTV/MRR metrics accurately."
  },
  tax: {
    slug: "tax",
    name: "US Freelancer & Small Business Tax",
    shortName: "US Taxes",
    description: "Estimate IRS 1099 self-employment tax, quarterly 1040-ES vouchers, QBI deductions, and LLC vs. S-Corp tax savings.",
    seoTitle: "US 1099 Self-Employment & Small Business Tax Calculators",
    seoDescription: "Free 2026 US 1099 self-employment tax, quarterly IRS 1040-ES estimated payment, and S-Corp election savings calculators."
  },
  creator: {
    slug: "creator",
    name: "Creator Economy & Digital Products",
    shortName: "Creators",
    description: "Calculate creator take-home pay across Substack, Patreon, Gumroad, Lemon Squeezy, and YouTube sponsorship deals.",
    seoTitle: "Creator Economy & Digital Product Payout Calculators",
    seoDescription: "Compare platform take rates and payment processing fees for Substack, Patreon, Gumroad, Lemon Squeezy, and YouTube creators."
  },
  freelance: {
    slug: "freelance",
    name: "Freelance Pricing & Platforms",
    shortName: "Freelance",
    description: "Convert target W-2 salaries into sustainable freelance hourly rates and calculate net platform payouts after service fees.",
    seoTitle: "Freelance Hourly Rate & Marketplace Net Payout Calculators",
    seoDescription: "Convert W-2 compensation to freelance hourly rates and model Upwork service fees, overhead, and client retainers."
  }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export async function readJson(filePath, fallback = null) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === "ENOENT" && fallback !== null) return fallback;
    throw err;
  }
}

export async function loadSiteConfig() {
  const cfg = await readJson(path.join(ROOT_DIR, "site.config.json"));
  const basePath = resolveBasePath(process.env.BASE_PATH ?? cfg.basePath ?? "");
  return {
    ...cfg,
    siteOrigin: String(cfg.siteOrigin || "").replace(/\/+$/, ""),
    basePath
  };
}

export async function loadAffiliates() {
  return readJson(path.join(DATA_DIR, "affiliates.json"), {});
}

export async function loadPublishLog() {
  return readJson(path.join(DATA_DIR, "publish-log.json"), {
    lastPublishedDate: null,
    history: []
  });
}

export async function loadBacklog() {
  return readJson(path.join(DATA_DIR, "backlog.json"), []);
}

export function resolveBasePath(raw) {
  const trimmed = String(raw || "").trim().replace(/\/+$/, "");
  if (!trimmed || trimmed === "/") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function withBase(basePath, routePath) {
  const cleanRoute = routePath.startsWith("/") ? routePath : `/${routePath}`;
  if (!basePath) return cleanRoute;
  if (cleanRoute === "/") return `${basePath}/`;
  return `${basePath}${cleanRoute}`;
}

export function canonicalUrl(siteOrigin, basePath, routePath) {
  return `${siteOrigin}${withBase(basePath, routePath)}`;
}

export function getDefaultValues(meta) {
  const values = {};
  for (const input of meta.inputs || []) {
    values[input.id] = input.defaultValue;
  }
  return values;
}

export function formatMetric(value, format) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  if (format === "currency") {
    const absFormatted = Math.abs(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return num < 0 ? `-$${absFormatted}` : `$${absFormatted}`;
  }
  if (format === "percent") {
    return (
      num.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }) + "%"
    );
  }
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export async function listToolFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".mjs"))
      .map((e) => path.join(dirPath, e.name))
      .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
}

export async function loadToolModule(filePath) {
  const stat = await fs.stat(filePath);
  const url = `${pathToFileURL(filePath).href}?mtime=${stat.mtimeMs}`;
  const mod = await import(url);
  return {
    filePath,
    fileName: path.basename(filePath),
    slugFromFile: path.basename(filePath, ".mjs"),
    meta: mod.meta,
    compute: mod.compute
  };
}

export async function loadAllTools() {
  const [pubFiles, stagedFiles] = await Promise.all([
    listToolFiles(TOOLS_PUBLISHED_DIR),
    listToolFiles(TOOLS_STAGED_DIR)
  ]);
  const [published, staged] = await Promise.all([
    Promise.all(pubFiles.map(loadToolModule)),
    Promise.all(stagedFiles.map(loadToolModule))
  ]);
  return { published, staged };
}

export function getTodayUtc() {
  return new Date().toISOString().slice(0, 10);
}
