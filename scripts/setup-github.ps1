$ghBin = "C:\Users\user\AppData\Local\Programs\gh\bin"
if (Test-Path $ghBin) {
  $env:Path = "$ghBin;$env:Path"
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: GitHub CLI (gh) was not found at $ghBin." -ForegroundColor Red
  exit 1
}

Write-Host "=== 1. Checking GitHub authentication ===" -ForegroundColor Cyan
gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Opening browser to sign in to GitHub (approve the code shown below)..." -ForegroundColor Yellow
  gh auth login --hostname github.com --git-protocol https --scopes repo,workflow --web
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub login failed." -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "GitHub CLI is already authenticated." -ForegroundColor Green
}

Write-Host "=== 2. Configuring Git credential helper ===" -ForegroundColor Cyan
gh auth setup-git
if ($LASTEXITCODE -ne 0) {
  Write-Host "WARNING: gh auth setup-git returned non-zero." -ForegroundColor Yellow
}

$repoSlug = "chichochoi/marginkit"
$remoteUrl = "https://github.com/$repoSlug.git"

Write-Host "=== 3. Creating or connecting repository ($repoSlug) ===" -ForegroundColor Cyan
gh repo view $repoSlug *> $null
if ($LASTEXITCODE -ne 0) {
  git remote get-url origin *> $null
  if ($LASTEXITCODE -eq 0) {
    git remote remove origin
  }
  gh repo create $repoSlug --public --source=. --remote=origin --push
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create and push repository." -ForegroundColor Red
    exit 1
  }
} else {
  git remote get-url origin *> $null
  if ($LASTEXITCODE -ne 0) {
    git remote add origin $remoteUrl
  } else {
    git remote set-url origin $remoteUrl
  }
  git push -u origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git push to origin/main failed." -ForegroundColor Red
    exit 1
  }
}

Write-Host "=== 4. Enabling GitHub Pages (GitHub Actions workflow mode) ===" -ForegroundColor Cyan
gh api "repos/$repoSlug/pages" -X POST -f build_type=workflow *> $null
if ($LASTEXITCODE -ne 0) {
  gh api "repos/$repoSlug/pages" -X PUT -f build_type=workflow *> $null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Could not auto-enable Pages via API. Enable Settings -> Pages -> GitHub Actions in your browser." -ForegroundColor Yellow
  } else {
    Write-Host "GitHub Pages updated to GitHub Actions deployment." -ForegroundColor Green
  }
} else {
  Write-Host "GitHub Pages enabled with GitHub Actions deployment." -ForegroundColor Green
}

Write-Host "=== 5. Triggering initial build & deploy workflow ===" -ForegroundColor Cyan
gh workflow run deploy-and-drip.yml *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Workflow deploy-and-drip.yml dispatched." -ForegroundColor Green
} else {
  Write-Host "Initial push already triggers deploy-and-drip.yml automatically." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Live Site (ready ~1-2 min after workflow completes): https://chichochoi.github.io/marginkit/" -ForegroundColor White
Write-Host "Workflow Status: https://github.com/$repoSlug/actions" -ForegroundColor White
