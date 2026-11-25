import { execFileSync } from "node:child_process";
import {
  ROOT_DIR,
  loadAllTools,
  loadBacklog,
  loadSiteConfig
} from "../src/lib.mjs";

function tryGitPull() {
  const gitEnv = {
    ...process.env,
    GCM_INTERACTIVE: "never",
    GIT_TERMINAL_PROMPT: "0"
  };
  try {
    execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: ROOT_DIR,
      stdio: "ignore",
      env: gitEnv
    });
  } catch {
    return "no-remote";
  }

  try {
    execFileSync("git", ["pull", "--rebase", "origin", "main"], {
      cwd: ROOT_DIR,
      stdio: "pipe",
      env: gitEnv
    });
    return "pulled";
  } catch (err) {
    return `pull-skipped: ${err.message.split("\n")[0]}`;
  }
}

const gitSync = tryGitPull();
const [config, tools, backlog] = await Promise.all([
  loadSiteConfig(),
  loadAllTools(),
  loadBacklog()
]);

const existingSlugs = new Set([
  ...tools.published.map((t) => t.meta?.slug || t.slugFromFile),
  ...tools.staged.map((t) => t.meta?.slug || t.slugFromFile)
]);

const remainingBacklog = backlog.filter((item) => !existingSlugs.has(item.slug));
const targetReservoirSize = Number(config.targetReservoirSize ?? 7);
const maxGeneratePerRun = Number(config.maxGeneratePerRun ?? 3);
const neededCount = Math.max(0, targetReservoirSize - tools.staged.length);
const batchLimit = Math.min(neededCount, maxGeneratePerRun);

const report = {
  gitSync,
  publishedCount: tools.published.length,
  stagedCount: tools.staged.length,
  targetReservoirSize,
  maxGeneratePerRun,
  neededCount,
  recommendedGenerateCount: batchLimit,
  backlogRemaining: remainingBacklog.length,
  nextTopics: remainingBacklog.slice(0, batchLimit)
};

console.log(JSON.stringify(report, null, 2));
