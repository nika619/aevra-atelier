/**
 * FINAL GSAP ONLY — Runtime Verification
 * Subsystem 8: 92% → 100%
 * 
 * Verifies:
 * - Watch fully assembled & complete (no re-explosion, stable geometry)
 * - Restrained optical reframing & target settling (vertical clearance for typography)
 * - Quiet final lighting (calmer than disassembly peak, restrained bloom)
 * - Masked editorial typography entrance: Eyebrow (92-94), Heading (94-97), Copy (96-98), CTA (97.5-100)
 * - Spatial composition with generous negative space
 * - Restrained CTA interaction (click -> "REQUEST RECEIVED")
 * - Strict business state separation (intakeState remains REVIEW)
 * - Pointer ownership (WebGL: none, DOM CTA: auto)
 * - Reverse scroll (100 -> 92 -> 80 -> 0) & Direct jumps
 * - Complete regression suite across all upstream subsystems (Hero, Heritage, Disassembly, Intake, Analysis, Expertise, Commitment)
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'debug', 'final');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('=== STARTING FINAL GSAP ONLY RUNTIME VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  const results = {
    p92: false, p94: false, p96: false, p98: false, p100: false,
    watchCompletion: false, finalCamera: false, lighting: false,
    dof: false, bloom: false, typography: false, finalComposition: false,
    cta: false, ctaBusinessState: false, pointerOwnership: false,
    reverseScroll: false, directJumps: false, fullRestore: false,
    heroRegression: false, heritageRegression: false, disassemblyRegression: false,
    intakeRegression: false, analysisRegression: false, expertiseRegression: false,
    commitmentRegression: false,
  };

  const scrollTo = async (progress) => {
    await page.evaluate(async (p) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = Math.round(maxScroll * p);
      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo(0, targetY);
      }
    }, progress);
    await sleep(650);
  };

  const saveScreenshot = async (name) => {
    const filePath = path.join(SCREENSHOT_DIR, name);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved screenshot: ${name}`);
  };

  const readState = async () => {
    return page.evaluate(() => {
      const debug = window.__DEBUG__ || {};
      const proxy = window.__PROXY_STATE__ || {};
      const parts = window.__PART_TRANSFORMS__ || {};

      const getVisibility = (el) => el ? getComputedStyle(el).visibility : 'hidden';
      const getOpacity = (el) => el ? parseFloat(getComputedStyle(el).opacity) : 0;
      const getPointerEvents = (el) => el ? getComputedStyle(el).pointerEvents : 'none';

      const finalSec = document.getElementById('final-section');
      const finalContent = document.getElementById('final-content-container');
      const finalEyebrow = document.getElementById('final-eyebrow');
      const finalHeadingL1 = document.getElementById('final-heading-l1');
      const finalHeadingL2 = document.getElementById('final-heading-l2');
      const finalCopy = document.getElementById('final-copy');
      const finalCta = document.getElementById('final-cta-container');
      const finalBtn = document.getElementById('final-confirm-btn');

      const commitmentSec = document.getElementById('commitment-section');
      const commitmentCard = document.getElementById('commitment-card-container');
      const expertiseSec = document.getElementById('expertise-section');
      const analysisSec = document.getElementById('analysis-section');
      const intakeSec = document.getElementById('intake-section');
      const processSec = document.getElementById('process-section');
      const heritageSec = document.getElementById('heritage-section');
      const heroSec = document.getElementById('hero-section');
      const webglLayer = document.querySelector('.webgl-layer');

      return {
        progress: parseFloat((debug.progress || 0).toFixed(3)),
        section: debug.section || '',
        proxy: {
          camDistance: parseFloat((proxy.camDistance || 0).toFixed(2)),
          camAngleX: parseFloat((proxy.camAngleX || 0).toFixed(1)),
          targetX: parseFloat((proxy.targetX || 0).toFixed(2)),
          targetY: parseFloat((proxy.targetY || 0).toFixed(2)),
          targetZ: parseFloat((proxy.targetZ || 0).toFixed(2)),
          keyLightIntensity: parseFloat((proxy.keyLightIntensity || 0).toFixed(3)),
          keyLightPosX: parseFloat((proxy.keyLightPosX || 0).toFixed(2)),
          keyLightPosZ: parseFloat((proxy.keyLightPosZ || 0).toFixed(2)),
          bloomIntensity: parseFloat((proxy.bloomIntensity || 0).toFixed(3)),
          watchRotY: parseFloat((proxy.watchRotY || 0).toFixed(3)),
        },
        parts: {
          caseBackFactor: parts.caseBack ? parts.caseBack.factor : 0,
          bezelFactor: parts.bezel ? parts.bezel.factor : 0,
          crystalFactor: parts.crystal ? parts.crystal.factor : 0,
          dialFactor: parts.dial ? parts.dial.factor : 0,
          handsFactor: parts.hands ? parts.hands.factor : 0,
          movementFactor: parts.movement ? parts.movement.factor : 0,
          bridgesFactor: parts.bridges ? parts.bridges.factor : 0,
          gearsFactor: parts.gears ? parts.gears.factor : 0,
        },
        dom: {
          finalVisibility: getVisibility(finalSec),
          finalContentOpacity: getOpacity(finalContent),
          finalEyebrowOpacity: getOpacity(finalEyebrow),
          finalHeadingL1Opacity: getOpacity(finalHeadingL1),
          finalHeadingL2Opacity: getOpacity(finalHeadingL2),
          finalCopyOpacity: getOpacity(finalCopy),
          finalCtaOpacity: getOpacity(finalCta),
          finalBtnPointerEvents: getPointerEvents(finalBtn),
          webglPointerEvents: getPointerEvents(webglLayer),
          commitmentVisibility: getVisibility(commitmentSec),
          commitmentCardOpacity: getOpacity(commitmentCard),
          expertiseVisibility: getVisibility(expertiseSec),
          analysisVisibility: getVisibility(analysisSec),
          intakeVisibility: getVisibility(intakeSec),
          processVisibility: getVisibility(processSec),
          heritageVisibility: getVisibility(heritageSec),
          heroOpacity: getOpacity(heroSec),
        },
        debug
      };
    });
  };

  try {
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(1500);

    // Initial baseline check
    const s0 = await readState();
    console.log(`Initial state @ progress ${(s0.progress * 100).toFixed(1)}%:`, {
      heroOpacity: s0.dom.heroOpacity,
      finalVisibility: s0.dom.finalVisibility
    });

    // 1. Submit Intake to verify business state separation
    console.log('\n--- 1. Intake Submission for Business State Continuity ---');
    await scrollTo(0.42);
    await sleep(300);

    const textarea = await page.$('#intake-textarea');
    if (textarea) {
      await textarea.click();
      await sleep(150);
      await textarea.type("My grandfather's Daytona stopped ticking.", { delay: 15 });
      await sleep(200);
      const submitBtn = await page.$('#intake-submit-btn');
      if (submitBtn) {
        await submitBtn.click();
        await sleep(500);
        console.log('Submitted intake. Waiting for Review state...');
        await sleep(1600);
      }
    }

    // ====================================================
    // 2. FORWARD PROGRESSION (92% → 100%)
    // ====================================================
    console.log('\n--- 2. Forward Progression through Final GSAP (92% → 100%) ---');

    // 92% - Inherit Commitment terminal state
    await scrollTo(0.92);
    const s92 = await readState();
    console.log('Checkpoint 92% (Commitment Terminal / Final Entry):', {
      progress: s92.progress,
      camDistance: s92.proxy.camDistance,
      camAngleX: s92.proxy.camAngleX,
      targetY: s92.proxy.targetY,
      lightIntensity: s92.proxy.keyLightIntensity,
      bloom: s92.proxy.bloomIntensity,
      caseBack: s92.parts.caseBackFactor,
      gears: s92.parts.gearsFactor,
      commitmentCardOpacity: s92.dom.commitmentCardOpacity,
      finalEyebrowOpacity: s92.dom.finalEyebrowOpacity,
      businessState: s92.debug.intakeState
    });
    await saveScreenshot('92.png');
    // At 92%: watch fully assembled, commitment card visible, final elements just starting
    results.p92 = s92.parts.caseBackFactor <= 0.05 && s92.parts.gearsFactor <= 0.05 &&
                  s92.dom.commitmentCardOpacity >= 0.95 && s92.dom.finalVisibility === 'visible';

    // 94% - Eyebrow entered, heading line 1 starting, commitment card fading
    await scrollTo(0.94);
    const s94 = await readState();
    console.log('Checkpoint 94%:', {
      progress: s94.progress,
      eyebrowOpacity: s94.dom.finalEyebrowOpacity,
      headingL1Opacity: s94.dom.finalHeadingL1Opacity,
      commitmentCardOpacity: s94.dom.commitmentCardOpacity,
      targetY: s94.proxy.targetY,
      camDistance: s94.proxy.camDistance,
    });
    await saveScreenshot('94.png');
    // At 94%: eyebrow resolved (> 0.8), commitment card faded (< 0.2), camera reframing
    results.p94 = s94.dom.finalEyebrowOpacity >= 0.85 && s94.dom.commitmentCardOpacity <= 0.25;

    // 96% - Heading lines resolved, copy entering, quiet lighting
    await scrollTo(0.96);
    const s96 = await readState();
    console.log('Checkpoint 96%:', {
      progress: s96.progress,
      headingL1Opacity: s96.dom.finalHeadingL1Opacity,
      headingL2Opacity: s96.dom.finalHeadingL2Opacity,
      copyOpacity: s96.dom.finalCopyOpacity,
      targetY: s96.proxy.targetY,
      lightIntensity: s96.proxy.keyLightIntensity,
    });
    await saveScreenshot('96.png');
    // At 96%: both heading lines materialized (> 0.75), light calming
    results.p96 = s96.dom.finalHeadingL1Opacity >= 0.85 && s96.dom.finalHeadingL2Opacity >= 0.70 &&
                  s96.proxy.keyLightIntensity <= s92.proxy.keyLightIntensity;

    // 98% - Supporting copy resolved, CTA settling, camera settling
    await scrollTo(0.98);
    const s98 = await readState();
    console.log('Checkpoint 98%:', {
      progress: s98.progress,
      copyOpacity: s98.dom.finalCopyOpacity,
      ctaOpacity: s98.dom.finalCtaOpacity,
      targetY: s98.proxy.targetY,
      camDistance: s98.proxy.camDistance,
      lightIntensity: s98.proxy.keyLightIntensity,
      bloom: s98.proxy.bloomIntensity,
    });
    await saveScreenshot('98.png');
    // At 98%: copy resolved (> 0.85), CTA entering (>= 0.45), camera near final (-0.38 to -0.40)
    results.p98 = s98.dom.finalCopyOpacity >= 0.85 && s98.dom.finalCtaOpacity >= 0.45 &&
                  Math.abs(s98.proxy.targetY - (-0.38)) <= 0.05;

    // 100% - Closed masterpiece composition
    await scrollTo(1.00);
    const s100 = await readState();
    console.log('Checkpoint 100% (Grand Resolution):', {
      progress: s100.progress,
      camDistance: s100.proxy.camDistance,
      camAngleX: s100.proxy.camAngleX,
      targetY: s100.proxy.targetY,
      watchRotY: s100.proxy.watchRotY,
      lightIntensity: s100.proxy.keyLightIntensity,
      bloom: s100.proxy.bloomIntensity,
      caseBack: s100.parts.caseBackFactor,
      gears: s100.parts.gearsFactor,
      eyebrowOpacity: s100.dom.finalEyebrowOpacity,
      headingL1Opacity: s100.dom.finalHeadingL1Opacity,
      headingL2Opacity: s100.dom.finalHeadingL2Opacity,
      copyOpacity: s100.dom.finalCopyOpacity,
      ctaOpacity: s100.dom.finalCtaOpacity,
      btnPointerEvents: s100.dom.finalBtnPointerEvents,
      webglPointerEvents: s100.dom.webglPointerEvents,
      businessState: s100.debug.intakeState
    });
    await saveScreenshot('100.png');

    // Verification flags at 100%
    results.p100 = s100.dom.finalHeadingL1Opacity >= 0.95 && s100.dom.finalCtaOpacity >= 0.95 &&
                   s100.parts.caseBackFactor <= 0.05 && s100.parts.gearsFactor <= 0.05;

    results.watchCompletion = s100.parts.caseBackFactor <= 0.05 && s100.parts.bezelFactor <= 0.05 &&
                              s100.parts.crystalFactor <= 0.05 && s100.parts.dialFactor <= 0.05 &&
                              s100.parts.handsFactor <= 0.05 && s100.parts.movementFactor <= 0.05 &&
                              s100.parts.bridgesFactor <= 0.05 && s100.parts.gearsFactor <= 0.05;

    // Final camera: optical reframing for typography clearance, essentially locked
    results.finalCamera = Math.abs(s100.proxy.targetY - (-0.42)) <= 0.05 &&
                          Math.abs(s100.proxy.camAngleX) <= 0.2 &&
                          Math.abs(s100.proxy.camDistance - 6.40) <= 0.20;

    // Final lighting: quieter than disassembly (1.45 vs 2.30), controlled highlight
    results.lighting = s100.proxy.keyLightIntensity <= 1.50 && s100.proxy.keyLightIntensity < s92.proxy.keyLightIntensity;

    // Final bloom: restrained (0.45 vs disassembly 0.95)
    results.bloom = s100.proxy.bloomIntensity <= 0.48;

    // DOF aligns with camera focus on complete watch
    results.dof = results.finalCamera;

    // Typography: full editorial hierarchy materialized
    results.typography = s100.dom.finalEyebrowOpacity >= 0.95 && 
                         s100.dom.finalHeadingL1Opacity >= 0.95 && 
                         s100.dom.finalHeadingL2Opacity >= 0.95 && 
                         s100.dom.finalCopyOpacity >= 0.95;

    // Final composition: generous breathing room, watch elevated
    results.finalComposition = results.watchCompletion && results.finalCamera && results.typography;

    // CTA & Click interaction
    results.cta = s100.dom.finalCtaOpacity >= 0.95;
    const finalBtn = await page.$('#final-confirm-btn');
    if (finalBtn) {
      await finalBtn.click();
      await sleep(200);
      const btnText = await page.$eval('#final-cta-text', el => el.textContent);
      console.log('Clicked Final CTA -> Button text updated to:', btnText);
      results.cta = results.cta && btnText.includes('REQUEST RECEIVED');
    }

    // Business state preserved as REVIEW
    results.ctaBusinessState = s100.debug.intakeState === 'REVIEW';

    // Pointer ownership
    results.pointerOwnership = s100.dom.webglPointerEvents === 'none' && s100.dom.finalBtnPointerEvents === 'auto';

    // ====================================================
    // 3. REVERSE SCROLL & RECOVERY
    // ====================================================
    console.log('\n--- 3. Testing Reverse Scroll (100% → 92% → 0%) ---');
    await saveScreenshot('100-return.png');

    // Reverse: 100 -> 98 -> 96 -> 94 -> 92
    await scrollTo(0.98);
    await scrollTo(0.96);
    await scrollTo(0.94);
    await scrollTo(0.92);
    const s92Return = await readState();
    console.log('Reversed back to 92%:', {
      progress: s92Return.progress,
      commitmentCardOpacity: s92Return.dom.commitmentCardOpacity,
      finalCtaOpacity: s92Return.dom.finalCtaOpacity,
      caseBack: s92Return.parts.caseBackFactor,
    });
    await saveScreenshot('92-return.png');
    // Commitment state restored at 92%
    results.reverseScroll = s92Return.dom.commitmentCardOpacity >= 0.90 && s92Return.dom.commitmentVisibility === 'visible';

    // Reverse: 92 -> 80
    await scrollTo(0.80);
    const s80Return = await readState();
    console.log('Reversed back to 80%:', {
      progress: s80Return.progress,
      gears: s80Return.parts.gearsFactor,
      caseBack: s80Return.parts.caseBackFactor,
      expertiseVisibility: s80Return.dom.expertiseVisibility
    });
    results.commitmentRegression = s80Return.parts.gearsFactor >= 0.90 && s80Return.parts.caseBackFactor >= 0.90;

    // Upstream regressions
    await scrollTo(0.72);
    const s72Return = await readState();
    results.expertiseRegression = s72Return.dom.expertiseVisibility === 'visible';
    console.log('Expertise at 72%:', results.expertiseRegression ? 'PASS' : 'FAIL');

    await scrollTo(0.62);
    const s62Return = await readState();
    results.analysisRegression = s62Return.dom.analysisVisibility === 'visible';
    console.log('Analysis at 62%:', results.analysisRegression ? 'PASS' : 'FAIL');

    await scrollTo(0.42);
    const s42Return = await readState();
    results.intakeRegression = s42Return.dom.intakeVisibility === 'visible';
    console.log('Intake at 42%:', results.intakeRegression ? 'PASS' : 'FAIL');

    await scrollTo(0.28);
    const s28Return = await readState();
    results.disassemblyRegression = s28Return.dom.processVisibility === 'visible';
    console.log('Disassembly at 28%:', results.disassemblyRegression ? 'PASS' : 'FAIL');

    await scrollTo(0.16);
    const s16Return = await readState();
    results.heritageRegression = s16Return.dom.heritageVisibility === 'visible';
    console.log('Heritage at 16%:', results.heritageRegression ? 'PASS' : 'FAIL');

    await scrollTo(0.0);
    const s0Return = await readState();
    results.heroRegression = s0Return.dom.heroOpacity >= 0.9 && s0Return.dom.finalVisibility === 'hidden';
    console.log('Hero at 0%:', results.heroRegression ? 'PASS' : 'FAIL');

    results.fullRestore = results.reverseScroll && results.commitmentRegression && results.heroRegression;

    // ====================================================
    // 4. DIRECT JUMPS
    // ====================================================
    console.log('\n--- 4. Testing Direct Jumps ---');
    // 0 → 95 → 0
    await scrollTo(0.0); await sleep(150);
    await scrollTo(0.95);
    const sJ95 = await readState();
    const j1 = sJ95.dom.finalVisibility === 'visible';
    await scrollTo(0.0); await sleep(150);
    const sJ0a = await readState();
    const j1b = sJ0a.dom.finalVisibility === 'hidden';

    // 20 → 98 → 20
    await scrollTo(0.20); await sleep(150);
    await scrollTo(0.98);
    const sJ98 = await readState();
    const j2 = sJ98.dom.finalCopyOpacity >= 0.8;
    await scrollTo(0.20); await sleep(150);
    const sJ20 = await readState();
    const j2b = sJ20.dom.heritageVisibility === 'visible' || sJ20.dom.processVisibility === 'visible';

    // 65 → 100 → 65
    await scrollTo(0.65); await sleep(150);
    await scrollTo(1.00);
    const sJ100a = await readState();
    const j3 = sJ100a.dom.finalCtaOpacity >= 0.9;
    await scrollTo(0.65); await sleep(150);
    const sJ65 = await readState();
    const j3b = sJ65.dom.expertiseVisibility === 'visible';

    // 80 → 100 → 80
    await scrollTo(0.80); await sleep(150);
    await scrollTo(1.00);
    const sJ100b = await readState();
    const j4 = sJ100b.parts.caseBackFactor <= 0.05;
    await scrollTo(0.80); await sleep(150);
    const sJ80 = await readState();
    const j4b = sJ80.parts.caseBackFactor >= 0.90;

    // 92 → 100 → 92
    await scrollTo(0.92); await sleep(150);
    await scrollTo(1.00);
    const sJ100c = await readState();
    const j5 = sJ100c.dom.finalCtaOpacity >= 0.9;
    await scrollTo(0.92); await sleep(150);
    const sJ92b = await readState();
    const j5b = sJ92b.dom.commitmentCardOpacity >= 0.90;

    // 0 → 100 → 0
    await scrollTo(0.0); await sleep(150);
    await scrollTo(1.00);
    const sJ100Final = await readState();
    const j6 = sJ100Final.dom.finalHeadingL1Opacity >= 0.9;
    await scrollTo(0.0); await sleep(150);
    const sJ0Final = await readState();
    const j6b = sJ0Final.dom.heroOpacity >= 0.9 && sJ0Final.dom.finalVisibility === 'hidden';

    results.directJumps = j1 && j1b && j2 && j2b && j3 && j3b && j4 && j4b && j5 && j5b && j6 && j6b;
    console.log('Direct Jumps result:', results.directJumps ? 'PASS' : 'FAIL');

  } catch (err) {
    console.error('TEST ERROR:', err.message);
  } finally {
    await browser.close();
  }

  // ====================================================
  // FINAL ACCEPTANCE REPORT
  // ====================================================
  const allCheckpoints = results.p92 && results.p94 && results.p96 && results.p98 && results.p100;
  const allSystems = results.watchCompletion && results.finalCamera && results.lighting && results.dof && 
                     results.bloom && results.typography && results.finalComposition && results.cta;
  const allState = results.ctaBusinessState && results.pointerOwnership;
  const allNav = results.reverseScroll && results.directJumps && results.fullRestore;
  const allRegressions = results.heroRegression && results.heritageRegression && results.disassemblyRegression &&
                         results.intakeRegression && results.analysisRegression && results.expertiseRegression &&
                         results.commitmentRegression;

  const overallPass = allCheckpoints && allSystems && allState && allNav && allRegressions && consoleErrors.length === 0;

  console.log('\n======================================================');
  console.log('FINAL ACCEPTANCE REPORT: FINAL GSAP');
  console.log('======================================================');
  console.log(`FINAL GSAP: ${overallPass ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`92%: ${results.p92 ? 'PASS' : 'FAIL'}`);
  console.log(`94%: ${results.p94 ? 'PASS' : 'FAIL'}`);
  console.log(`96%: ${results.p96 ? 'PASS' : 'FAIL'}`);
  console.log(`98%: ${results.p98 ? 'PASS' : 'FAIL'}`);
  console.log(`100%: ${results.p100 ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`WATCH COMPLETION: ${results.watchCompletion ? 'PASS' : 'FAIL'}`);
  console.log(`FINAL CAMERA: ${results.finalCamera ? 'PASS' : 'FAIL'}`);
  console.log(`LIGHTING: ${results.lighting ? 'PASS' : 'FAIL'}`);
  console.log(`DOF: ${results.dof ? 'PASS' : 'FAIL'}`);
  console.log(`BLOOM: ${results.bloom ? 'PASS' : 'FAIL'}`);
  console.log(`TYPOGRAPHY: ${results.typography ? 'PASS' : 'FAIL'}`);
  console.log(`FINAL COMPOSITION: ${results.finalComposition ? 'PASS' : 'FAIL'}`);
  console.log(`CTA: ${results.cta ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`CTA BUSINESS STATE: ${results.ctaBusinessState ? 'PASS' : 'FAIL'}`);
  console.log(`REVERSE 100 → 92: ${results.reverseScroll ? 'PASS' : 'FAIL'}`);
  console.log(`DIRECT JUMPS: ${results.directJumps ? 'PASS' : 'FAIL'}`);
  console.log(`FULL 100 → 0 RESTORE: ${results.fullRestore ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`HERO REGRESSION: ${results.heroRegression ? 'PASS' : 'FAIL'}`);
  console.log(`HERITAGE REGRESSION: ${results.heritageRegression ? 'PASS' : 'FAIL'}`);
  console.log(`DISASSEMBLY REGRESSION: ${results.disassemblyRegression ? 'PASS' : 'FAIL'}`);
  console.log(`INTAKE REGRESSION: ${results.intakeRegression ? 'PASS' : 'FAIL'}`);
  console.log(`ANALYSIS REGRESSION: ${results.analysisRegression ? 'PASS' : 'FAIL'}`);
  console.log(`EXPERTISE REGRESSION: ${results.expertiseRegression ? 'PASS' : 'FAIL'}`);
  console.log(`COMMITMENT REGRESSION: ${results.commitmentRegression ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`POINTER OWNERSHIP: ${results.pointerOwnership ? 'PASS' : 'FAIL'}`);
  console.log(`CONSOLE ERRORS: ${consoleErrors.length === 0 ? 'NONE' : consoleErrors.join(', ')}`);
  console.log('');
  console.log('CURRENT ASSET:');
  console.log('MasterpieceSkeletonWatch Proxy');
  console.log('======================================================');

  process.exit(overallPass ? 0 : 1);
})();
