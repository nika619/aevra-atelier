const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.resolve(__dirname, '../debug/intake'),
  path.resolve(__dirname, '../intake')
];

DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runIntakeGsapTest() {
  console.log('=== STARTING INTAKE GSAP ONLY RUNTIME VERIFICATION ===\n');

  const results = {
    intakeGsap: false,
    p36: false,
    p38: false,
    p42: false,
    p46: false,
    p50: false,
    p54: false,
    p56: false,
    entryAnimation: false,
    stickyBehavior: false,
    cameraRestraint: false,
    webglStability: false,
    textareaFocus: false,
    typing: false,
    submit: false,
    analyzing: false,
    review: false,
    bookService: false,
    reverseScroll: false,
    directJump: false,
    pointerOwnership: false,
    domWebglSync: false,
    consoleErrors: [],
    pageErrors: []
  };

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('deprecated') && !text.includes('favicon')) {
        results.consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    results.pageErrors.push(err.message);
  });

  const saveScreenshots = async (filename) => {
    for (const dir of DIRS) {
      await page.screenshot({ path: path.join(dir, filename), fullPage: false });
    }
    console.log(`Saved screenshot: ${filename}`);
  };

  const scrollTo = async (targetProgress) => {
    await page.evaluate((target) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = maxScroll * target;
      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { duration: 0.8, immediate: false });
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }, targetProgress);

    const startTime = Date.now();
    while (Date.now() - startTime < 3500) {
      await sleep(80);
      const diff = await page.evaluate((target) => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const prog = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        return Math.abs(prog - target);
      }, targetProgress);
      if (diff < 0.015) break;
    }
    await sleep(400);
  };

  const readState = async () => {
    return await page.evaluate(() => {
      const p = window.__PROXY_STATE__;
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const prog = maxScroll > 0 ? y / maxScroll : 0;

      const intakeSec = document.getElementById('intake-section');
      const intakeCard = document.getElementById('intake-card-container');
      const textarea = document.getElementById('intake-textarea');
      const heroSec = document.getElementById('hero-section');
      const processSec = document.getElementById('process-section');

      const getOpacity = (el) => el ? parseFloat(window.getComputedStyle(el).opacity) : 0;
      const getVisibility = (el) => el ? window.getComputedStyle(el).visibility : 'hidden';
      const getPointerEvents = (el) => el ? window.getComputedStyle(el).pointerEvents : 'none';
      const getRect = (el) => el ? el.getBoundingClientRect() : null;

      const cardRect = getRect(intakeCard);

      return {
        scrollY: y,
        progress: parseFloat(prog.toFixed(3)),
        proxy: p ? {
          camDistance: parseFloat(p.camDistance.toFixed(3)),
          camAngleX: parseFloat(p.camAngleX.toFixed(3)),
          targetX: parseFloat(p.targetX.toFixed(3)),
          targetY: parseFloat(p.targetY.toFixed(3)),
          targetZ: parseFloat(p.targetZ.toFixed(3)),
          watchRotY: parseFloat(p.watchRotY.toFixed(3)),
          keyLightIntensity: parseFloat(p.keyLightIntensity.toFixed(3)),
          bloomIntensity: parseFloat(p.bloomIntensity.toFixed(3))
        } : null,
        dom: {
          intakeSecOpacity: getOpacity(intakeSec),
          intakeSecVisibility: getVisibility(intakeSec),
          intakeSecPointerEvents: getPointerEvents(intakeSec),
          cardOpacity: getOpacity(intakeCard),
          cardPointerEvents: getPointerEvents(intakeCard),
          cardTop: cardRect ? Math.round(cardRect.top) : null,
          cardRight: cardRect ? Math.round(cardRect.right) : null,
          heroOpacity: getOpacity(heroSec),
          processVisibility: getVisibility(processSec),
          textareaValue: textarea ? textarea.value : ''
        }
      };
    });
  };

  try {
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(1500);

    // Initial check at 0%
    const s0 = await readState();
    console.log(`Initial state @ progress ${(s0.progress * 100).toFixed(1)}%:`, {
      heroOpacity: s0.dom.heroOpacity,
      intakeVisibility: s0.dom.intakeSecVisibility
    });

    // ====================================================
    // 1. FORWARD PROGRESSION CHECKPOINTS (36% -> 56%)
    // ====================================================
    console.log('\n--- Testing Forward Progression (36% -> 56%) ---');

    // 36%
    await scrollTo(0.36);
    const s36 = await readState();
    console.log('Checkpoint 36%:', {
      progress: s36.progress,
      visibility: s36.dom.intakeSecVisibility,
      cardOpacity: s36.dom.cardOpacity,
      camDistance: s36.proxy.camDistance
    });
    await saveScreenshots('36.png');
    results.p36 = s36.dom.intakeSecVisibility === 'visible' && s36.dom.cardOpacity <= 0.2;

    // 38%
    await scrollTo(0.38);
    const s38 = await readState();
    console.log('Checkpoint 38%:', {
      progress: s38.progress,
      cardOpacity: s38.dom.cardOpacity,
      cardTop: s38.dom.cardTop,
      camDistance: s38.proxy.camDistance,
      targetX: s38.proxy.targetX
    });
    await saveScreenshots('38.png');
    results.p38 = s38.dom.cardOpacity >= 0.95 && s38.proxy.targetX >= 1.2;
    results.entryAnimation = results.p36 && results.p38;

    // 42%
    await scrollTo(0.42);
    const s42 = await readState();
    console.log('Checkpoint 42%:', {
      progress: s42.progress,
      cardTop: s42.dom.cardTop,
      camDist: s42.proxy.camDistance
    });
    await saveScreenshots('42.png');
    results.p42 = s42.dom.cardOpacity >= 0.95;

    // 46%
    await scrollTo(0.46);
    const s46 = await readState();
    console.log('Checkpoint 46%:', {
      progress: s46.progress,
      cardTop: s46.dom.cardTop,
      camDist: s46.proxy.camDistance
    });
    await saveScreenshots('46.png');
    results.p46 = s46.dom.cardOpacity >= 0.95;

    // 50%
    await scrollTo(0.50);
    const s50 = await readState();
    console.log('Checkpoint 50%:', {
      progress: s50.progress,
      cardTop: s50.dom.cardTop,
      camDist: s50.proxy.camDistance
    });
    await saveScreenshots('50.png');
    results.p50 = s50.dom.cardOpacity >= 0.95;

    // 54%
    await scrollTo(0.54);
    const s54 = await readState();
    console.log('Checkpoint 54%:', {
      progress: s54.progress,
      cardTop: s54.dom.cardTop,
      camDist: s54.proxy.camDistance
    });
    await saveScreenshots('54.png');
    results.p54 = s54.dom.cardOpacity >= 0.90;

    // 56%
    await scrollTo(0.56);
    const s56 = await readState();
    console.log('Checkpoint 56%:', {
      progress: s56.progress,
      cardOpacity: s56.dom.cardOpacity,
      intakeSecOpacity: s56.dom.intakeSecOpacity
    });
    await saveScreenshots('56.png');
    results.p56 = s56.dom.cardOpacity <= 0.1 || s56.dom.intakeSecOpacity <= 0.1;

    // Check sticky behavior: cardTop should remain stable across 38%, 42%, 46%, 50%, 54%
    const cardTops = [s38.dom.cardTop, s42.dom.cardTop, s46.dom.cardTop, s50.dom.cardTop, s54.dom.cardTop].filter(Boolean);
    const maxTopDiff = Math.max(...cardTops) - Math.min(...cardTops);
    results.stickyBehavior = maxTopDiff < 20;
    console.log(`Sticky Card Top Delta across range: ${maxTopDiff}px (${results.stickyBehavior ? 'STABLE' : 'DRIFT'})`);

    // Camera restraint & WebGL stability across intake range
    const camDistDiff = Math.abs(s54.proxy.camDistance - s38.proxy.camDistance);
    const targetXDiff = Math.abs(s54.proxy.targetX - s38.proxy.targetX);
    results.cameraRestraint = camDistDiff < 0.1 && targetXDiff < 0.1;
    results.webglStability = results.cameraRestraint;
    console.log(`Camera distance delta (38-54%): ${camDistDiff.toFixed(3)}, targetX delta: ${targetXDiff.toFixed(3)}`);

    // Pointer ownership: Canvas is none, card is auto
    const canvasPointer = await page.$eval('canvas', (el) => window.getComputedStyle(el).pointerEvents);
    results.pointerOwnership = canvasPointer === 'none' && s46.dom.cardPointerEvents === 'auto';

    // ====================================================
    // 2. INTERACTION FLOW: FOCUS -> TYPE -> SCROLL-WHILE-TYPING -> SUBMIT -> REVIEW
    // ====================================================
    console.log('\n--- Testing Interaction Flow ---');
    await scrollTo(0.42); // Settle in comfortable typing zone

    // Textarea focus
    const textarea = await page.$('#intake-textarea');
    if (textarea) {
      await textarea.click();
      await sleep(200);

      const isFocused = await page.evaluate(() => document.activeElement && document.activeElement.id === 'intake-textarea');
      results.textareaFocus = isFocused;
      console.log('Textarea focused:', results.textareaFocus ? 'PASS' : 'FAIL');

      // Requirement 8 & 13: Typing exact test sentence + scroll-while-typing stability
      const part1 = "My grandfather's ";
      const part2 = "Daytona stopped ticking.";
      const testSentence = part1 + part2;

      await textarea.type(part1, { delay: 20 });
      await sleep(200);

      // Perform a small scroll while focused/typing
      console.log('Testing scroll behavior while typing (small scroll)...');
      await scrollTo(0.435);
      await sleep(200);

      // Verify focus is maintained after small scroll
      const stillFocused = await page.evaluate(() => document.activeElement && document.activeElement.id === 'intake-textarea');
      console.log('Focus preserved during small scroll:', stillFocused ? 'PASS' : 'FAIL');

      // Continue typing remaining part
      await textarea.type(part2, { delay: 20 });
      await sleep(300);

      const typedText = await page.$eval('#intake-textarea', (el) => el.value);
      results.typing = typedText === testSentence;
      console.log('Typed value:', typedText, results.typing ? '(MATCH)' : '(MISMATCH)');

      await saveScreenshots('typed.png');

      // Submit
      const submitBtn = await page.$('#intake-submit-btn');
      if (submitBtn) {
        await submitBtn.click();
        await sleep(650);

        // Check analyzing state
        const isAnalyzing = await page.evaluate(() => {
          const el = document.getElementById('intake-analyzing');
          const debug = window.__DEBUG__;
          return (el !== null) || (debug && debug.intakeState === 'ANALYZING');
        });
        results.analyzing = isAnalyzing;
        console.log('Analyzing state active:', results.analyzing ? 'PASS' : 'FAIL');
        await saveScreenshots('analyzing.png');

        // Wait for mock analysis to complete (1500ms + buffer)
        console.log('Waiting for concierge analysis synthesis...');
        await sleep(1800);

        // Check review state
        const reviewData = await page.evaluate(() => {
          const watchName = document.getElementById('review-watch-name');
          const watchRef = document.getElementById('review-watch-ref');
          const service = document.getElementById('review-service');
          const cost = document.getElementById('review-cost');
          const turnaround = document.getElementById('review-turnaround');
          const debug = window.__DEBUG__;

          return {
            state: debug ? debug.intakeState : null,
            name: watchName ? watchName.textContent : '',
            ref: watchRef ? watchRef.textContent : '',
            service: service ? service.textContent : '',
            cost: cost ? cost.textContent : '',
            turnaround: turnaround ? turnaround.textContent : ''
          };
        });

        console.log('Review Data captured:', reviewData);
        results.review = reviewData.state === 'REVIEW' &&
                         reviewData.name.includes('Rolex Daytona') &&
                         reviewData.service.includes('Full Service') &&
                         reviewData.cost.includes('1,200') &&
                         (reviewData.turnaround.includes('6–8') || reviewData.turnaround.includes('6 - 8') || reviewData.turnaround.includes('6-8'));
        console.log('Review state verified:', results.review ? 'PASS' : 'FAIL');
        await saveScreenshots('review.png');
        results.submit = results.analyzing && results.review;
      }
    }

    // ====================================================
    // 3. REVERSE SCROLL & HERO RESTORATION
    // ====================================================
    console.log('\n--- Testing Reverse Scroll & Restoration ---');
    await saveScreenshots('review-return.png');

    await scrollTo(0.50);
    await scrollTo(0.45);
    await scrollTo(0.40);
    await scrollTo(0.36);
    await scrollTo(0.20);
    await scrollTo(0.0);

    const s0Return = await readState();
    console.log('Returned to 0% Hero:', {
      progress: s0Return.progress,
      heroOpacity: s0Return.dom.heroOpacity,
      intakeVisibility: s0Return.dom.intakeSecVisibility
    });

    results.reverseScroll = s0Return.dom.heroOpacity > 0.9 && s0Return.dom.intakeSecVisibility === 'hidden';

    // ====================================================
    // 4. DIRECT JUMP TESTS
    // ====================================================
    console.log('\n--- Testing Direct Jump Scenarios ---');

    // 0 -> 36 -> 0
    await scrollTo(0.36);
    const j1a = await readState();
    await scrollTo(0.0);
    const j1b = await readState();
    const jump1 = j1a.dom.intakeSecVisibility === 'visible' && j1b.dom.intakeSecVisibility === 'hidden';

    // 0 -> 45 -> 0
    await scrollTo(0.45);
    const j2a = await readState();
    await scrollTo(0.0);
    const j2b = await readState();
    const jump2 = j2a.dom.cardOpacity > 0.9 && j2b.dom.intakeSecVisibility === 'hidden';

    // 20 -> 45
    await scrollTo(0.20);
    await scrollTo(0.45);
    const j3a = await readState();
    const jump3 = j3a.dom.cardOpacity > 0.9;

    // 56 -> 0
    await scrollTo(0.56);
    await scrollTo(0.0);
    const j4a = await readState();
    const jump4 = j4a.dom.heroOpacity > 0.9;

    results.directJump = jump1 && jump2 && jump3 && jump4;
    console.log('Direct Jumps result:', results.directJump ? 'PASS' : 'FAIL');

    // ====================================================
    // 5. BOOK A SERVICE REGRESSION
    // ====================================================
    console.log('\n--- Testing Book a Service CTA Regression ---');
    await scrollTo(0.0);
    await sleep(300);

    // Test top navigation Book a Service button
    const bookNavBtn = await page.$('#book-service-btn');
    if (bookNavBtn) {
      await bookNavBtn.click();
      await sleep(1600);
      const afterBookNav = await readState();
      console.log('After clicking Nav Book a Service:', {
        progress: afterBookNav.progress,
        intakeSecVisibility: afterBookNav.dom.intakeSecVisibility,
        cardOpacity: afterBookNav.dom.cardOpacity
      });
      results.bookService = afterBookNav.progress >= 0.35 && afterBookNav.dom.intakeSecVisibility === 'visible';
    } else {
      const heroInquire = await page.$('#hero-inquire-btn');
      if (heroInquire) {
        await heroInquire.click();
        await sleep(1600);
        const afterHero = await readState();
        results.bookService = afterHero.progress >= 0.35 && afterHero.dom.intakeSecVisibility === 'visible';
      }
    }

    // DOM / WebGL Sync
    results.domWebglSync = results.stickyBehavior && results.webglStability && results.cameraRestraint;

    // Overall subsystem status
    results.intakeGsap = results.p36 && results.p38 && results.p42 && results.p46 && results.p50 && results.p54 && results.p56 &&
                         results.entryAnimation && results.stickyBehavior && results.cameraRestraint && results.webglStability &&
                         results.textareaFocus && results.typing && results.submit && results.analyzing && results.review &&
                         results.bookService && results.reverseScroll && results.directJump && results.pointerOwnership && results.domWebglSync;

  } catch (err) {
    console.error('Test run failed with error:', err);
    results.pageErrors.push(err.message);
  } finally {
    await browser.close();
  }

  // Print Final Acceptance Report
  console.log('\n======================================================');
  console.log('FINAL ACCEPTANCE REPORT: INTAKE GSAP');
  console.log('======================================================');
  console.log(`INTAKE GSAP: ${results.intakeGsap ? 'PASS' : 'FAIL'}\n`);
  console.log(`36%: ${results.p36 ? 'PASS' : 'FAIL'}`);
  console.log(`38%: ${results.p38 ? 'PASS' : 'FAIL'}`);
  console.log(`42%: ${results.p42 ? 'PASS' : 'FAIL'}`);
  console.log(`46%: ${results.p46 ? 'PASS' : 'FAIL'}`);
  console.log(`50%: ${results.p50 ? 'PASS' : 'FAIL'}`);
  console.log(`54%: ${results.p54 ? 'PASS' : 'FAIL'}`);
  console.log(`56%: ${results.p56 ? 'PASS' : 'FAIL'}\n`);
  console.log(`ENTRY ANIMATION: ${results.entryAnimation ? 'PASS' : 'FAIL'}`);
  console.log(`STICKY BEHAVIOR: ${results.stickyBehavior ? 'PASS' : 'FAIL'}`);
  console.log(`CAMERA RESTRAINT: ${results.cameraRestraint ? 'PASS' : 'FAIL'}`);
  console.log(`WEBGL STABILITY: ${results.webglStability ? 'PASS' : 'FAIL'}\n`);
  console.log(`TEXTAREA FOCUS: ${results.textareaFocus ? 'PASS' : 'FAIL'}`);
  console.log(`TYPING: ${results.typing ? 'PASS' : 'FAIL'}`);
  console.log(`SUBMIT: ${results.submit ? 'PASS' : 'FAIL'}`);
  console.log(`ANALYZING: ${results.analyzing ? 'PASS' : 'FAIL'}`);
  console.log(`REVIEW: ${results.review ? 'PASS' : 'FAIL'}\n`);
  console.log(`BOOK A SERVICE REGRESSION: ${results.bookService ? 'PASS' : 'FAIL'}`);
  console.log(`REVERSE SCROLL: ${results.reverseScroll ? 'PASS' : 'FAIL'}`);
  console.log(`DIRECT JUMP: ${results.directJump ? 'PASS' : 'FAIL'}`);
  console.log(`POINTER OWNERSHIP: ${results.pointerOwnership ? 'PASS' : 'FAIL'}\n`);
  console.log(`DOM/WEBGL SYNC: ${results.domWebglSync ? 'PASS' : 'FAIL'}`);
  console.log(`CONSOLE ERRORS: ${results.consoleErrors.length === 0 ? 'NONE' : JSON.stringify(results.consoleErrors)}\n`);
  console.log(`CURRENT ASSET:\nMasterpieceSkeletonWatch Proxy`);
  console.log('======================================================\n');
}

runIntakeGsapTest();
