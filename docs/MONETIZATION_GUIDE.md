# MarginKit 무자본 완전 자동화 운영 & 수익화 가이드

MarginKit은 **유료 AI API 비용 0원**, **서버 호스팅 비용 0원**, 그리고 **내 컴퓨터가 며칠 꺼져 있어도 24시간 중단 없이 사이트가 유지·확장되도록** 설계된 2단계 저수지(Reservoir) 아키텍처입니다.

---

## 1. 컴퓨터가 꺼져도 돌아가는 자동화 구조

1. **클라우드 레이어 (GitHub Pages + GitHub Actions, 24시간 무중단 · 무료)**
   - 웹사이트는 GitHub Pages(`https://chichochoi.github.io/marginkit/`)에서 365일 내내 서비스됩니다.
   - 매일 한국시간 밤 10시 17분(`13:17 UTC`, 미국 동부 오전 8시 17분)에 GitHub Actions 클라우드 서버가 자동으로 깨어나 `tools/staged/` 대기열에서 **완성된 계산기 1개를 꺼내 `tools/published/`로 자동 발행**하고, `sitemap.xml`을 갱신해 사이트를 재배포한 뒤 IndexNow(Bing/DuckDuckGo 검색엔진)에 새 URL을 즉시 알립니다.
   - 따라서 **컴퓨터를 일주일 동안 꺼두셔도** 미리 채워둔 7일 치 저수지(`tools/staged/`) 덕분에 매일 새 미국 타겟 계산기가 1개씩 꼬박꼬박 올라갑니다.

2. **로컬 PC 레이어 (Antigravity 예약 자동화, Antigravity Pro 토큰만 사용)**
   - 컴퓨터가 켜져 있는 시간(매일 10:15, 15:15, 20:15, 23:15 KST)에 Antigravity 예약 작업(`MarginKit Reservoir Auto-Generator`)이 실행됩니다.
   - 가장 먼저 `node scripts/status.mjs`를 돌려 현재 `staged` 대기열 개수를 확인합니다.
   - 이미 7개가 꽉 차 있으면(`neededCount: 0`) **단 1턴 만에 즉시 종료**해 Pro 토큰 낭비를 막습니다.
   - 컴퓨터를 오래 꺼두어서 클라우드가 대기열을 소진했다면(`neededCount > 0`), 부족한 만큼(1회 최대 3개) `data/backlog.json`에서 주제를 꺼내 계산기 코드를 생성하고 수학 테스트(`npm run verify`)를 통과시킨 뒤 GitHub에 자동 푸시합니다.

---

## 2. 단계별 수익화 세팅 방법

### A. 도메인 0원 상태에서 당장 붙이는 고단가 미국 제휴(Affiliate) 수익
구글 애드센스 승인이 나기 전에도, `github.io` 주소 상태에서 B2B 제휴 파트너 링크로 바로 달러 수익을 낼 수 있습니다.
* 추천 제휴 프로그램(Impact / PartnerStack 등에서 무료 가입):
  * **ecommerce:** Shopify Affiliate Program (유료 전환 시 고액 커미션)
  * **payments:** Mercury / Stripe / Wise Business
  * **tax:** QuickBooks Solopreneur / Gusto
  * **creator:** Lemon Squeezy / beehiiv / ConvertKit
* **적용 방법:**
  1. `data/affiliates.json` 파일을 엽니다.
  2. 해당 카테고리의 `"url"`을 본인의 제휴 링크로 바꾸고, `"isAffiliate": true`로 변경합니다. (자동으로 FTC 영문 제휴 공시 문구와 `rel="sponsored"` 속성이 적용됩니다.)
  3. 저장 후 `npm run sync` 실행(또는 다음 자동화 시 자동 반영).

### B. 구글 애드센스(Google AdSense) & 커스텀 도메인 연결 (권장 시기: 일 방문자 발생 시작 후)
* **중요:** 구글 애드센스는 원칙적으로 `*.github.io` 무료 서브도메인 승인이 어렵고, 본인 소유의 1차 도메인(예: `marginkit.com` 또는 `.org` 등 연 약 \$10~12)이 필요합니다.
* 트래픽이 올라오는 것을 확인한 뒤 Cloudflare Registrar / Porkbun 등에서 저렴한 `.com` 도메인 1개를 구매해 연결하시면 됩니다.
* **연결 절차:**
  1. GitHub 저장소 `Settings > Pages > Custom domain`에 도메인 입력 + DNS CNAME 연결
  2. `site.config.json` 수정:
     - `"siteOrigin": "https://본인도메인.com"`
     - `"basePath": ""` (루트 도메인 사용 시 빈 문자열로 변경)
     - `"adsenseClientId": "ca-pub-여기에본인ID"`
     - (선택) `"gaMeasurementId": "G-여기에GA4측정ID"`
  3. `npm run sync`를 실행하면 모든 계산기 페이지·홈·카테고리 페이지에 AdSense 스크립트와 반응형 광고 슬롯이 자동 삽입됩니다.
  4. **이미 포함된 필수 승인 페이지:** `/about/`, `/methodology/`, `/privacy-policy/`, `/terms/`, `/contact/`가 모두 자동 생성되므로 애드센스 심사 요건을 기본 충족합니다.

---

## 3. 검색 노출 가속 팁 (최초 1회만 권장)
1. **Google Search Console**에 사이트를 등록하고 `https://chichochoi.github.io/marginkit/sitemap.xml`을 1회 제출해 두세요.
2. **Bing Webmaster Tools**에도 동일하게 등록해 두면, 매일 밤 GitHub Actions의 **IndexNow** 자동 알림과 시너지가 나서 Bing·DuckDuckGo·ChatGPT 검색 색인이 매우 빨라집니다.
