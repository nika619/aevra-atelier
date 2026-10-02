const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runProductionPassAudit() {
  console.log('=== AÉVRA PRODUCTION FIDELITY & ULTRA-LOW-LATENCY AUDIT ===\n');

  const screenshotsDir = path.join(__dirname, '..', 'debug', 'production_captures');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // Track network requests
  const networkRequests = [];
  page.on('response', async (response) => {
    try {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      const contentLength = headers['content-length'] ? parseInt(headers['content-length'], 10) : 0;
      networkRequests.push({ url, status, contentLength, type: response.request().resourceType() });
    } catch (e) {}
  });

  console.log('[1/4] Navigating to http://localhost:5173/?debug=0 ...');
  const t0 = Date.now();
  await page.goto('http://localhost:5173/?debug=0', { waitUntil: 'networkidle0', timeout: 30000 });
  const loadTime = Date.now() - t0;
  console.log(`Page networkidle in ${loadTime}ms`);

  // Wait for canvas to be present and initial render
  await page.waitForSelector('canvas', { timeout: 15000 });
  await sleep(1000);

  // Measure browser timing performance metrics
  console.log('\n[2/4] Measuring Performance & Timing Metrics...');
  const perfMetrics = await page.evaluate(async () => {
    const navEntries = performance.getEntriesByType('navigation');
    const nav = navEntries.length > 0 ? navEntries[0] : null;

    const paintEntries = performance.getEntriesByType('paint');
    let fp = 0;
    let fcp = 0;
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') fp = entry.startTime;
      if (entry.name === 'first-contentful-paint') fcp = entry.startTime;
    });

    // LCP
    let lcp = fcp;
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    return {
      fp: Math.round(fp || (nav ? nav.responseEnd : 0)),
      fcp: Math.round(fcp || (nav ? nav.domContentLoadedEventEnd : 0)),
      lcp: Math.round(lcp || fcp),
      domInteractive: Math.round(nav ? nav.domInteractive : 0),
      domComplete: Math.round(nav ? nav.domComplete : 0),
      duration: Math.round(nav ? nav.duration : 0),
    };
  });

  console.log('Performance Timing:', perfMetrics);

  // Measure Frame Rate (FPS) during continuous scroll scrub
  console.log('\n[3/4] Measuring Scrub Frame Rate (FPS)...');
  const fpsResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      let curScroll = 0;
      const step = maxScroll / 60; // 60 steps

      function tick() {
        frames++;
        curScroll += step;
        if (curScroll > maxScroll) curScroll = 0;
        window.scrollTo(0, curScroll);

        const elapsed = performance.now() - startTime;
        if (elapsed < 1500) {
          requestAnimationFrame(tick);
        } else {
          const fps = Math.round((frames / elapsed) * 1000);
          resolve(fps);
        }
      }
      requestAnimationFrame(tick);
    });
  });
  console.log(`Measured Scrub Frame Rate: ${fpsResult} FPS`);

  // [4/4] Capture 10 Checkpoints at ?debug=0
  console.log('\n[4/4] Capturing Clean Checkpoints with ?debug=0 ...');
  const checkpoints = [
    { p: 0.00, name: '00_hero_0pct.png' },
    { p: 0.14, name: '01_heritage_14pct.png' },
    { p: 0.25, name: '02_disassembly_25pct.png' },
    { p: 0.32, name: '03_disassembly_peak_32pct.png' },
    { p: 0.47, name: '04_intake_47pct.png' },
    { p: 0.58, name: '05_analysis_58pct.png' },
    { p: 0.73, name: '06_expertise_73pct.png' },
    { p: 0.85, name: '07_commitment_85pct.png' },
    { p: 0.95, name: '08_final_our_work_95pct.png' },
    { p: 1.00, name: '09_final_resolution_100pct.png' },
  ];

  const capturedFiles = [];
  for (const cp of checkpoints) {
    await page.evaluate((targetProgress) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = maxScroll * targetProgress;
      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo(0, targetY);
      }
    }, cp.p);
    await sleep(600);

    const filePath = path.join(screenshotsDir, cp.name);
    await page.screenshot({ path: filePath, fullPage: false });
    capturedFiles.push({ progress: `${Math.round(cp.p * 100)}%`, file: cp.name, path: filePath });
    console.log(`  Captured ${Math.round(cp.p * 100)}% -> ${cp.name}`);
  }

  // Network Waterfall Analysis
  console.log('\n--- NETWORK WATERFALL BREAKDOWN ---');
  let jsSize = 0;
  let cssSize = 0;
  let imgSize = 0;
  let fontReqs = 0;
  let thirdPartyReqs = 0;
  const imageAssets = [];

  for (const req of networkRequests) {
    const u = req.url;
    if (u.includes('fonts.googleapis.com') || u.includes('fonts.gstatic.com')) {
      fontReqs++;
      thirdPartyReqs++;
    } else if (u.endsWith('.js') || req.type === 'script') {
      jsSize += req.contentLength;
    } else if (u.endsWith('.css') || req.type === 'stylesheet') {
      cssSize += req.contentLength;
    } else if (u.endsWith('.webp') || u.endsWith('.png') || u.endsWith('.jpg') || req.type === 'image') {
      imgSize += req.contentLength;
      imageAssets.push({ url: u.split('/').pop(), sizeKB: (req.contentLength / 1024).toFixed(1) });
    }
  }

  // Mobile evaluation
  console.log('\n--- MOBILE EMULATION AUDIT ---');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobilePage.goto('http://localhost:5173/?debug=0', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1000);
  const mobileScreenshotPath = path.join(screenshotsDir, '10_mobile_hero.png');
  await mobilePage.screenshot({ path: mobileScreenshotPath });
  console.log('Mobile Hero screenshot saved -> 10_mobile_hero.png');

  const mobileFps = await mobilePage.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      let curScroll = 0;
      const step = maxScroll / 50;

      function tick() {
        frames++;
        curScroll += step;
        if (curScroll > maxScroll) curScroll = 0;
        window.scrollTo(0, curScroll);

        const elapsed = performance.now() - startTime;
        if (elapsed < 1200) {
          requestAnimationFrame(tick);
        } else {
          resolve(Math.round((frames / elapsed) * 1000));
        }
      }
      requestAnimationFrame(tick);
    });
  });
  console.log(`Mobile Scrub Frame Rate: ${mobileFps} FPS`);

  await browser.close();

  // Summary Report
  console.log('\n======================================================');
  console.log('FINAL PRODUCTION AUDIT METRICS');
  console.log('======================================================');
  console.log(`FIRST PAINT (FP): ${perfMetrics.fp} ms`);
  console.log(`FIRST CONTENTFUL PAINT (FCP): ${perfMetrics.fcp} ms`);
  console.log(`LARGEST CONTENTFUL PAINT (LCP): ${perfMetrics.lcp} ms`);
  console.log(`TIME TO INTERACTIVE (TTI): ${perfMetrics.domInteractive} ms`);
  console.log(`DESKTOP FPS: ${fpsResult} FPS`);
  console.log(`MOBILE FPS: ${mobileFps} FPS`);
  console.log(`FONT REQUESTS: ${fontReqs}`);
  console.log(`THIRD-PARTY REQUESTS: ${thirdPartyReqs}`);
  console.log(`TOTAL IMAGE PAYLOAD: ${(imgSize / 1024).toFixed(1)} KB`);
  console.log('IMAGE ASSETS DETECTED:', imageAssets);
  console.log('======================================================\n');

  return {
    perfMetrics,
    fpsResult,
    mobileFps,
    fontReqs,
    thirdPartyReqs,
    imgSizeKB: (imgSize / 1024).toFixed(1),
    capturedFiles
  };
}

runProductionPassAudit().catch((err) => {
  console.error('Audit Error:', err);
  process.exit(1);
});
