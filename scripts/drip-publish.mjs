import fs from "node:fs/promises";
import path from "node:path";
import {
  DATA_DIR,
  TOOLS_PUBLISHED_DIR,
  TOOLS_STAGED_DIR,
  canonicalUrl,
  getTodayUtc,
  listToolFiles,
  loadPublishLog,
  loadSiteConfig,
  loadToolModule
} from "../src/lib.mjs";

async function pingIndexNow(config, urls) {
  if (!urls.length || !config.indexNowKey || !config.siteOrigin) return;
  try {
    const parsed = new URL(config.siteOrigin);
    const keyLocation = canonicalUrl(config.siteOrigin, config.basePath, `/${config.indexNowKey}.txt`);
    const resp = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: parsed.host,
        key: config.indexNowKey,
        keyLocation,
        urlList: urls
      })
    });
    console.log(`IndexNow response: HTTP ${resp.status}`);
  } catch (err) {
    console.warn(`IndexNow ping warning (non-blocking): ${err.message}`);
  }
}

async function setGithubOutput(key, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  await fs.appendFile(process.env.GITHUB_OUTPUT, `${key}=${value}\n`, "utf8");
}

const args = new Set(process.argv.slice(2));
const pingOnly = args.has("--ping-only");
const pingAfter = args.has("--ping-indexnow");

const [config, log] = await Promise.all([loadSiteConfig(), loadPublishLog()]);
const today = getTodayUtc();

if (pingOnly) {
  const latest = Array.isArray(log.history) ? log.history[log.history.length - 1] : null;
  if (latest && latest.date === today && latest.slug) {
    const url = canonicalUrl(config.siteOrigin, config.basePath, `/tools/${latest.slug}/`);
    await pingIndexNow(config, [url]);
  } else {
    console.log("No promotion recorded for today, skipping IndexNow ping.");
  }
  process.exit(0);
}

if (process.env.FORCE_DRIP !== "1" && log.lastPublishedDate === today) {
  console.log(`Already published today (${today}), skipping drip.`);
  await setGithubOutput("promoted", "false");
  process.exit(0);
}

const stagedFiles = await listToolFiles(TOOLS_STAGED_DIR);
if (stagedFiles.length === 0) {
  console.log("Staged reservoir empty, nothing to promote.");
  await setGithubOutput("promoted", "false");
  process.exit(0);
}

const loaded = await Promise.all(stagedFiles.map(loadToolModule));
loaded.sort((a, b) => {
  const oa = Number(a.meta?.queuedOrder ?? 9999);
  const ob = Number(b.meta?.queuedOrder ?? 9999);
  if (oa !== ob) return oa - ob;
  return a.fileName.localeCompare(b.fileName);
});

const chosen = loaded[0];
const slug = chosen.meta?.slug || chosen.slugFromFile;
let source = await fs.readFile(chosen.filePath, "utf8");
source = source.replace(/updatedAt:\s*"[^"]*"/, `updatedAt: "${today}"`);
if (/publishedAt:\s*"[^"]*"/.test(source)) {
  source = source.replace(/publishedAt:\s*"[^"]*"/, `publishedAt: "${today}"`);
}

await fs.mkdir(TOOLS_PUBLISHED_DIR, { recursive: true });
const destPath = path.join(TOOLS_PUBLISHED_DIR, `${slug}.mjs`);
await fs.writeFile(destPath, source, "utf8");
await fs.unlink(chosen.filePath);

const nextLog = {
  lastPublishedDate: today,
  history: [
    ...(Array.isArray(log.history) ? log.history : []),
    { date: today, slug, title: chosen.meta?.shortTitle || slug }
  ]
};
await fs.writeFile(path.join(DATA_DIR, "publish-log.json"), JSON.stringify(nextLog, null, 2) + "\n", "utf8");

console.log(`PROMOTED_SLUG=${slug}`);
await setGithubOutput("promoted", "true");
await setGithubOutput("promoted_slug", slug);

if (pingAfter) {
  const url = canonicalUrl(config.siteOrigin, config.basePath, `/tools/${slug}/`);
  await pingIndexNow(config, [url]);
}
