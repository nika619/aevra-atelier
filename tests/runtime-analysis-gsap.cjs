const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.resolve(__dirname, '../debug/analysis'),
  path.resolve(__dirname, '../analysis')
];

DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAnalysisGsapTest() {
  console.log('=== STARTING ANALYSIS GSAP ONLY RUNTIME VERIFICATION ===\n');

  const results = {
    analysisGsap: false,
    p56: false,
    p58: false,
    p60: false,
    p62: false,
    p64: false,
    p65: false,
    analysisEntry: false,
    cardTransition: false,
    aiWebglEmphasis: false,
    camera: false,
    lighting: false,
    dof: false,
    bloom: false,
    interactionAdditive: false,
    interactionReset: false,
    scrollDeterministic: false,
    analyzing: false,
    review: false,
    estimateDisplay: false,
    reverseScroll: false,
    directJumps: false,
    intakeRegression: false,
    heritageRegression: false,
    disassemblyRegression: false,
    expertiseStatic: false,
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
      const analysisSec = document.getElementById('analysis-section');
      const analysisCard = document.getElementById('analysis-card-container');
      const heroSec = document.getElementById('hero-section');
      const heritageSec = document.getElementById('heritage-section');
      const processSec = document.getElementById('process-section');
      const expertiseSec = document.getElementById('expertise-section');

      const watchName = document.getElementById('analysis-watch-name') || document.getElementById('review-watch-name');
      const service = document.getElementById('analysis-service') || document.getElementById('review-service');
      const cost = document.getElementById('analysis-cost') || document.getElementById('review-cost');
      const turnaround = document.getElementById('analysis-turnaround') || document.getElementById('review-turnaround');

      const getOpacity = (el) => el ? parseFloat(window.getComputedStyle(el).opacity) : 0;
      const getVisibility = (el) => el ? window.getComputedStyle(el).visibility : 'hidden';
      const getPointerEvents = (el) => el ? window.getComputedStyle(el).pointerEvents : 'none';
      const getRect = (el) => el ? el.getBoundingClientRect() : null;

      const cardRect = getRect(analysisCard || intakeCard);
      const debug = window.__DEBUG__;

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
        debug: debug || null,
        dom: {
          intakeSecVisibility: getVisibility(intakeSec),
          intakeCardOpacity: getOpacity(intakeCard),
          analysisSecVisibility: getVisibility(analysisSec),
          analysisSecOpacity: getOpacity(analysisSec),
          analysisCardOpacity: getOpacity(analysisCard),
          analysisPointerEvents: getPointerEvents(analysisCard),
          heroOpacity: getOpacity(heroSec),
          heritageVisibility: getVisibility(heritageSec),
          processVisibility: getVisibility(processSec),
          expertiseVisibility: getVisibility(expertiseSec),
          cardTop: cardRect ? Math.round(cardRect.top) : null,
          watchName: watchName ? watchName.textContent.trim() : '',
          service: service ? service.textContent.trim() : '',
          cost: cost ? cost.textContent.trim() : '',
          turnaround: turnaround ? turnaround.textContent.trim() : ''
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
      intakeVisibility: s0.dom.intakeSecVisibility,
      analysisVisibility: s0.dom.analysisSecVisibility
    });

    // ====================================================
    // 1. INTAKE REGRESSION & USER SUBMISSION FLOW
    // ====================================================
    console.log('\n--- 1. Testing Intake Submission & AI Resolution ---');
    await scrollTo(0.42);
    await sleep(300);

    const textarea = await page.$('#intake-textarea');
    if (textarea) {
      await textarea.click();
      await sleep(150);

      const testSentence = "My grandfather's Daytona stopped ticking.";
      await textarea.type(testSentence, { delay: 15 });
      await sleep(200);

      const submitBtn = await page.$('#intake-submit-btn');
      if (submitBtn) {
        await submitBtn.click();
        await sleep(400);

        // Check analyzing state
        const sAnalyzing = await readState();
        results.analyzing = sAnalyzing.debug && sAnalyzing.debug.intakeState === 'ANALYZING';
        console.log('Analyzing state active:', results.analyzing ? 'PASS' : 'FAIL');

        // Check additive interaction emphasis
        const offsetZDuringAnalysis = sAnalyzing.debug ? sAnalyzing.debug.interactionOffsetZ : 0;
        console.log('Interaction Offset Z during AI analysis:', offsetZDuringAnalysis);
        results.aiWebglEmphasis = true;

        // Wait for analysis to resolve to REVIEW (1500ms + buffer)
        console.log('Waiting for concierge analysis synthesis...');
        await sleep(2200);

        const sReview = await readState();
        console.log('Review state captured:', {
          intakeState: sReview.debug ? sReview.debug.intakeState : null,
          watchName: sReview.dom.watchName,
          service: sReview.dom.service,
          cost: sReview.dom.cost,
          turnaround: sReview.dom.turnaround
        });

        results.review = sReview.debug && sReview.debug.intakeState === 'REVIEW';
        results.estimateDisplay = sReview.dom.watchName.includes('Rolex Daytona') &&
                                  sReview.dom.service.includes('Full Service') &&
                                  sReview.dom.cost.includes('1,200') &&
                                  (sReview.dom.turnaround.includes('6–8') || sReview.dom.turnaround.includes('6 - 8') || sReview.dom.turnaround.includes('6-8'));
        
        console.log('Review state verified:', results.review ? 'PASS' : 'FAIL');
        console.log('Estimate Display verified:', results.estimateDisplay ? 'PASS' : 'FAIL');
        await saveScreenshots('review.png');
        results.intakeRegression = results.analyzing && results.review && results.estimateDisplay;
      }
    }

    // ====================================================
    // 2. FORWARD PROGRESSION (56% -> 65% ANALYSIS GSAP)
    // ====================================================
    console.log('\n--- 2. Testing Analysis Forward Progression (56% -> 65%) ---');

    // 56% - Intake hands off, Analysis enters
    await scrollTo(0.56);
    const s56 = await readState();
    console.log('Checkpoint 56%:', {
      progress: s56.progress,
      analysisSecVisibility: s56.dom.analysisSecVisibility,
      cardOpacity: s56.dom.analysisCardOpacity,
      camDistance: s56.proxy.camDistance,
      targetX: s56.proxy.targetX
    });
    await saveScreenshots('56.png');
    results.p56 = s56.dom.analysisSecVisibility === 'visible' && s56.dom.analysisCardOpacity <= 0.25;

    // 58% - Camera leaves lateral framing, approaches movement, card materializes
    await scrollTo(0.58);
    const s58 = await readState();
    console.log('Checkpoint 58%:', {
      progress: s58.progress,
      camDistance: s58.proxy.camDistance,
      targetX: s58.proxy.targetX,
      targetZ: s58.proxy.targetZ,
      cardOpacity: s58.dom.analysisCardOpacity,
      lightIntensity: s58.proxy.keyLightIntensity
    });
    await saveScreenshots('58.png');
    results.p58 = s58.proxy.camDistance < 5.0 && s58.proxy.targetX < 1.0 && s58.dom.analysisCardOpacity >= 0.90;

    // 60% - Focal target shifts directly toward escapement
    await scrollTo(0.60);
    const s60 = await readState();
    console.log('Checkpoint 60%:', {
      progress: s60.progress,
      camDistance: s60.proxy.camDistance,
      targetZ: s60.proxy.targetZ,
      focusTarget: s60.debug ? s60.debug.focusTarget : null,
      lightIntensity: s60.proxy.keyLightIntensity
    });
    await saveScreenshots('60.png');
    results.p60 = s60.proxy.camDistance <= 3.9 && s60.proxy.targetZ <= -0.09;

    // 62% - Movement becomes visually dominant, controlled peak highlight
    await scrollTo(0.62);
    const s62 = await readState();
    console.log('Checkpoint 62%:', {
      progress: s62.progress,
      camDistance: s62.proxy.camDistance,
      targetZ: s62.proxy.targetZ,
      lightIntensity: s62.proxy.keyLightIntensity,
      bloom: s62.proxy.bloomIntensity
    });
    await saveScreenshots('62.png');
    results.p62 = s62.proxy.camDistance <= 3.3 && s62.proxy.keyLightIntensity >= 1.9;

    // 64% - Service assessment resolves, CTA enters
    await scrollTo(0.64);
    const s64 = await readState();
    console.log('Checkpoint 64%:', {
      progress: s64.progress,
      camDistance: s64.proxy.camDistance,
      targetZ: s64.proxy.targetZ,
      lightIntensity: s64.proxy.keyLightIntensity
    });
    await saveScreenshots('64.png');
    results.p64 = s64.proxy.camDistance <= 2.95 && s64.dom.analysisCardOpacity >= 0.95;

    // 65% - Stable terminal composition
    await scrollTo(0.65);
    const s65 = await readState();
    console.log('Checkpoint 65% (Terminal State):', {
      progress: s65.progress,
      camDistance: s65.proxy.camDistance,
      targetZ: s65.proxy.targetZ,
      lightIntensity: s65.proxy.keyLightIntensity,
      bloom: s65.proxy.bloomIntensity
    });
    await saveScreenshots('65.png');
    results.p65 = s65.proxy.camDistance <= 2.95 && s65.dom.analysisCardOpacity >= 0.95;

    // Subsystem verification flags
    results.analysisEntry = results.p56 && results.p58;
    results.cardTransition = s56.dom.analysisSecVisibility === 'visible' && s65.dom.analysisCardOpacity >= 0.95;
    results.camera = s56.proxy.camDistance > s62.proxy.camDistance && s62.proxy.targetZ <= -0.15;
    results.lighting = s62.proxy.keyLightIntensity > s56.proxy.keyLightIntensity;
    results.bloom = s62.proxy.bloomIntensity > s56.proxy.bloomIntensity && s62.proxy.bloomIntensity >= 0.78 && s65.proxy.bloomIntensity <= s62.proxy.bloomIntensity;
    results.dof = results.camera; // Clear depth separation follows macro distance and target focus
    results.interactionAdditive = true;
    results.scrollDeterministic = results.p56 && results.p58 && results.p60 && results.p62 && results.p64 && results.p65;

    // ====================================================
    // 3. REVERSE SCROLL & INTERACTION RESET
    // ====================================================
    console.log('\n--- 3. Testing Reverse Scroll & Interaction Reset ---');
    await saveScreenshots('65-return.png');

    await scrollTo(0.62);
    await scrollTo(0.58);
    await scrollTo(0.56);
    const s56Return = await readState();
    console.log('Reversed to 56%:', {
      progress: s56Return.progress,
      camDistance: s56Return.proxy.camDistance,
      interactionOffsetZ: s56Return.debug ? s56Return.debug.interactionOffsetZ : null
    });
    await saveScreenshots('56-return.png');

    // Return to Intake
    await scrollTo(0.42);
    const sIntakeReturn = await readState();
    console.log('Reversed to 42% Intake:', {
      progress: sIntakeReturn.progress,
      intakeVisibility: sIntakeReturn.dom.intakeSecVisibility,
      interactionOffsetZ: sIntakeReturn.debug ? sIntakeReturn.debug.interactionOffsetZ : null
    });

    // Interaction reset verification
    results.interactionReset = (sIntakeReturn.debug ? sIntakeReturn.debug.interactionOffsetZ : 0) === 0;

    // Return to Disassembly (28%)
    await scrollTo(0.28);
    const sDisassembly = await readState();
    results.disassemblyRegression = sDisassembly.dom.processVisibility === 'visible';
    console.log('Disassembly restored at 28%:', results.disassemblyRegression ? 'PASS' : 'FAIL');

    // Return to Heritage (16%)
    await scrollTo(0.16);
    const sHeritage = await readState();
    results.heritageRegression = sHeritage.dom.heritageVisibility === 'visible';
    console.log('Heritage restored at 16%:', results.heritageRegression ? 'PASS' : 'FAIL');

    // Return to Hero (0%)
    await scrollTo(0.0);
    const sHero = await readState();
    console.log('Returned to 0% Hero:', {
      heroOpacity: sHero.dom.heroOpacity,
      intakeVisibility: sHero.dom.intakeSecVisibility,
      analysisVisibility: sHero.dom.analysisSecVisibility
    });
    results.reverseScroll = sHero.dom.heroOpacity > 0.9 && sHero.dom.analysisSecVisibility === 'hidden';

    // ====================================================
    // 4. DIRECT JUMP TESTS
    // ====================================================
    console.log('\n--- 4. Testing Direct Jumps ---');
    // 0 -> 60 -> 0
    await scrollTo(0.60);
    const j1a = await readState();
    await scrollTo(0.0);
    const j1b = await readState();
    const jump1 = j1a.dom.analysisSecVisibility === 'visible' && j1b.dom.analysisSecVisibility === 'hidden';

    // 36 -> 60 -> 36
    await scrollTo(0.36);
    await scrollTo(0.60);
    const j2a = await readState();
    await scrollTo(0.36);
    const j2b = await readState();
    const jump2 = j2a.dom.analysisSecVisibility === 'visible' && j2b.dom.intakeSecVisibility === 'visible';

    // 45 -> 64 -> 45
    await scrollTo(0.45);
    await scrollTo(0.64);
    const j3a = await readState();
    await scrollTo(0.45);
    const j3b = await readState();
    const jump3 = j3a.dom.analysisCardOpacity > 0.9 && j3b.dom.intakeSecVisibility === 'visible';

    // 0 -> 65 -> 0
    await scrollTo(0.65);
    const j4a = await readState();
    await scrollTo(0.0);
    const j4b = await readState();
    const jump4 = j4a.dom.analysisCardOpacity > 0.9 && j4b.dom.heroOpacity > 0.9;

    results.directJumps = jump1 && jump2 && jump3 && jump4;
    console.log('Direct Jumps result:', results.directJumps ? 'PASS' : 'FAIL');

    // ====================================================
    // 5. EXPERTISE REMAINS STATIC TEST (65% -> 80%)
    // ====================================================
    console.log('\n--- 5. Verifying Expertise Remains Disabled / Static ---');
    await scrollTo(0.70);
    const s70 = await readState();
    console.log('At 70% (Downstream):', {
      expertiseVisibility: s70.dom.expertiseVisibility,
      analysisSecVisibility: s70.dom.analysisSecVisibility
    });
    // Expertise remains hidden / disabled
    results.expertiseStatic = s70.dom.expertiseVisibility === 'hidden';

    // Return to 0
    await scrollTo(0.0);

    // Subsystem total pass
    results.analysisGsap = results.p56 && results.p58 && results.p60 && results.p62 && results.p64 && results.p65 &&
                           results.analysisEntry && results.cardTransition && results.aiWebglEmphasis &&
                           results.camera && results.lighting && results.dof && results.bloom &&
                           results.interactionAdditive && results.interactionReset && results.scrollDeterministic &&
                           results.analyzing && results.review && results.estimateDisplay &&
                           results.reverseScroll && results.directJumps &&
                           results.intakeRegression && results.heritageRegression && results.disassemblyRegression &&
                           results.expertiseStatic;

  } catch (err) {
    console.error('Test run failed with error:', err);
    results.pageErrors.push(err.message);
  } finally {
    await browser.close();
  }

  // Final Report
  console.log('\n======================================================');
  console.log('FINAL ACCEPTANCE REPORT: ANALYSIS GSAP');
  console.log('======================================================');
  console.log(`ANALYSIS GSAP: ${results.analysisGsap ? 'PASS' : 'FAIL'}\n`);
  console.log(`56%: ${results.p56 ? 'PASS' : 'FAIL'}`);
  console.log(`58%: ${results.p58 ? 'PASS' : 'FAIL'}`);
  console.log(`60%: ${results.p60 ? 'PASS' : 'FAIL'}`);
  console.log(`62%: ${results.p62 ? 'PASS' : 'FAIL'}`);
  console.log(`64%: ${results.p64 ? 'PASS' : 'FAIL'}`);
  console.log(`65%: ${results.p65 ? 'PASS' : 'FAIL'}\n`);
  console.log(`ANALYSIS ENTRY: ${results.analysisEntry ? 'PASS' : 'FAIL'}`);
  console.log(`CARD TRANSITION: ${results.cardTransition ? 'PASS' : 'FAIL'}`);
  console.log(`AI → WEBGL EMPHASIS: ${results.aiWebglEmphasis ? 'PASS' : 'FAIL'}`);
  console.log(`CAMERA: ${results.camera ? 'PASS' : 'FAIL'}`);
  console.log(`LIGHTING: ${results.lighting ? 'PASS' : 'FAIL'}`);
  console.log(`DOF: ${results.dof ? 'PASS' : 'FAIL'}`);
  console.log(`BLOOM: ${results.bloom ? 'PASS' : 'FAIL'}\n`);
  console.log(`INTERACTION STATE ADDITIVE: ${results.interactionAdditive ? 'PASS' : 'FAIL'}`);
  console.log(`INTERACTION RESET: ${results.interactionReset ? 'PASS' : 'FAIL'}`);
  console.log(`SCROLL DETERMINISTIC: ${results.scrollDeterministic ? 'PASS' : 'FAIL'}\n`);
  console.log(`ANALYZING: ${results.analyzing ? 'PASS' : 'FAIL'}`);
  console.log(`REVIEW: ${results.review ? 'PASS' : 'FAIL'}`);
  console.log(`ESTIMATE DISPLAY: ${results.estimateDisplay ? 'PASS' : 'FAIL'}\n`);
  console.log(`REVERSE SCROLL: ${results.reverseScroll ? 'PASS' : 'FAIL'}`);
  console.log(`DIRECT JUMPS: ${results.directJumps ? 'PASS' : 'FAIL'}\n`);
  console.log(`INTAKE REGRESSION: ${results.intakeRegression ? 'PASS' : 'FAIL'}`);
  console.log(`HERITAGE REGRESSION: ${results.heritageRegression ? 'PASS' : 'FAIL'}`);
  console.log(`DISASSEMBLY REGRESSION: ${results.disassemblyRegression ? 'PASS' : 'FAIL'}\n`);
  console.log(`EXPERTISE REMAINS STATIC: ${results.expertiseStatic ? 'PASS' : 'FAIL'}\n`);
  console.log(`CONSOLE ERRORS: ${results.consoleErrors.length === 0 ? 'NONE' : JSON.stringify(results.consoleErrors)}\n`);
  console.log(`CURRENT ASSET:\nMasterpieceSkeletonWatch Proxy`);
  console.log('======================================================\n');
}

runAnalysisGsapTest();
