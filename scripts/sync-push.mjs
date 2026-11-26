import { execFileSync } from "node:child_process";
import { ROOT_DIR } from "../src/lib.mjs";

const gitEnv = {
  ...process.env,
  GCM_INTERACTIVE: "never",
  GIT_TERMINAL_PROMPT: "0"
};

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    cwd: ROOT_DIR,
    stdio: "inherit",
    env: gitEnv,
    ...opts
  });
}

function hasOrigin() {
  try {
    execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: ROOT_DIR,
      stdio: "ignore",
      env: gitEnv
    });
    return true;
  } catch {
    return false;
  }
}

function hasRemoteMain() {
  try {
    const out = execFileSync("git", ["ls-remote", "--heads", "origin", "main"], {
      cwd: ROOT_DIR,
      encoding: "utf8",
      env: gitEnv
    });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

run("node", ["scripts/verify.mjs"]);
run("node", ["scripts/build.mjs"]);

run("git", ["add", "-A"]);
const porcelain = execFileSync("git", ["status", "--porcelain"], {
  cwd: ROOT_DIR,
  encoding: "utf8",
  env: gitEnv
}).trim();

if (!porcelain) {
  console.log("Nothing to commit.");
  process.exit(0);
}

const commitMsg = process.argv[2] || "feat(tools): refill staged calculator reservoir";
run("git", ["commit", "-m", commitMsg]);

if (hasOrigin()) {
  if (hasRemoteMain()) {
    run("git", ["pull", "--rebase", "origin", "main"]);
  }
  run("git", ["push", "-u", "origin", "main"]);
  console.log("Synced and pushed to origin/main.");
} else {
  console.log("Committed locally (no origin remote configured yet).");
}
