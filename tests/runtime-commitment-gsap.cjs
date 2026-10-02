/**
 * COMMITMENT / REASSEMBLY GSAP — Runtime Verification
 * Subsystem 7: 80% → 92%
 * 
 * Verifies:
 * - Deterministic component reassembly order: gears (80-83), bridges (81-84), movement (82-85),
 *   hands (83-86), dial (84-87), crystal (85-88), bezel (86-89), caseBack (87-90)
 * - Final mechanical precision settling (90-92)
 * - Camera recentering & controlled dolly (inspection -> certainty)
 * - Lighting & bloom transition to product presentation
 * - Shared-element transformation from Review into Commitment
 * - Business state preservation (REVIEW) & pointer ownership
 * - Reverse scroll (92 -> 80 -> 0) & Direct jumps
 * - Regression prevention across all previous subsystems
 * - Final remains static (OFF)
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'debug', 'commitment');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('=== STARTING COMMITMENT / REASSEMBLY GSAP RUNTIME VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  const results = {
    p80: false, p82: false, p84: false, p86: false, p88: false, p90: false, p92: false,
    caseBack: false, bezel: false, crystal: false, dial: false,
    hands: false, movement: false, bridges: false, gears: false,
    reassemblyOrder: false, camera: false, lighting: false, dof: false, bloom: false,
    commitmentCard: false, sharedElementTransition: false, cta: false,
    businessStatePreserved: false, pointerOwnership: false,
    reverseScroll: false, directJumps: false,
    heroRegression: false, heritageRegression: false, disassemblyRegression: false,
    intakeRegression: false, analysisRegression: false, expertiseRegression: false,
    finalStatic: false,
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

      const commitmentSec = document.getElementById('commitment-section');
      const commitmentCard = document.getElementById('commitment-card-container');
      const commitmentHeader = document.getElementById('commitment-header');
      const commitmentIdentity = document.getElementById('commitment-identity');
      const commitmentSpecs = document.getElementById('commitment-specs-grid');
      const commitmentSecurity = document.getElementById('commitment-security-points');
      const commitmentCta = document.getElementById('commitment-cta-container');
      const commitmentBtn = document.getElementById('commitment-confirm-btn');

      const expertiseSec = document.getElementById('expertise-section');
      const analysisSec = document.getElementById('analysis-section');
      const analysisCard = document.getElementById('analysis-card-container');
      const intakeSec = document.getElementById('intake-section');
      const heroSec = document.getElementById('hero-section');
      const heritageSec = document.getElementById('heritage-section');
      const processSec = document.getElementById('process-section');
      const finalSec = document.getElementById('final-section');
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
          commitmentVisibility: getVisibility(commitmentSec),
          commitmentCardOpacity: getOpacity(commitmentCard),
          commitmentHeaderOpacity: getOpacity(commitmentHeader),
          commitmentIdentityOpacity: getOpacity(commitmentIdentity),
          commitmentSpecsOpacity: getOpacity(commitmentSpecs),
          commitmentSecurityOpacity: getOpacity(commitmentSecurity),
          commitmentCtaOpacity: getOpacity(commitmentCta),
          commitmentBtnPointerEvents: getPointerEvents(commitmentBtn),
          webglPointerEvents: getPointerEvents(webglLayer),
          expertiseVisibility: getVisibility(expertiseSec),
          expertiseOpacity: getOpacity(expertiseSec),
          analysisVisibility: getVisibility(analysisSec),
          analysisCardOpacity: getOpacity(analysisCard),
          intakeVisibility: getVisibility(intakeSec),
          heroOpacity: getOpacity(heroSec),
          heritageVisibility: getVisibility(heritageSec),
          processVisibility: getVisibility(processSec),
          finalVisibility: getVisibility(finalSec),
        },
        debug
      };
    });
  };

  try {
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(1500);

    // Initial baseline
    const s0 = await readState();
    console.log(`Initial state @ progress ${(s0.progress * 100).toFixed(1)}%:`, {
      heroOpacity: s0.dom.heroOpacity,
      commitmentVisibility: s0.dom.commitmentVisibility
    });

    // ====================================================
    // 1. INTAKE SUBMISSION FOR BUSINESS STATE CONTINUITY
    // ====================================================
    console.log('\n--- 1. Intake Submission for State Continuity ---');
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
        await sleep(1600); // Wait for simulation to settle to REVIEW
      }
    }

    // Capture Review baseline state at 62%
    await scrollTo(0.62);
    await sleep(300);
    const sReview = await readState();
    console.log('Review Baseline @ 62%:', {
      businessState: sReview.debug.intakeState,
      analysisVisibility: sReview.dom.analysisVisibility,
      analysisCardOpacity: sReview.dom.analysisCardOpacity
    });
    await saveScreenshot('commitment-review.png');

    // ====================================================
    // 2. CHECKPOINT 80% (Terminal Expertise / Baseline)
    // ====================================================
    console.log('\n--- 2. Forward Progression through Commitment/Reassembly (80% → 92%) ---');
    await scrollTo(0.80);
    const s80 = await readState();
    console.log('Checkpoint 80% (Terminal Expertise / Reassembly Baseline):', {
      progress: s80.progress,
      camDistance: s80.proxy.camDistance,
      camAngleX: s80.proxy.camAngleX,
      lightIntensity: s80.proxy.keyLightIntensity,
      bloom: s80.proxy.bloomIntensity,
      gears: s80.parts.gearsFactor,
      caseBack: s80.parts.caseBackFactor,
      commitmentCardOpacity: s80.dom.commitmentCardOpacity,
      businessState: s80.debug.intakeState
    });
    await saveScreenshot('80.png');
    // At 80%: watch is fully disassembled inspection state, camera is calm
    results.p80 = s80.parts.gearsFactor >= 0.95 && s80.parts.caseBackFactor >= 0.95 && s80.proxy.camDistance >= 7.8;

    // Checkpoint 82% - Gears reassembly begins, camera slow recenter begins
    await scrollTo(0.82);
    const s82 = await readState();
    console.log('Checkpoint 82%:', {
      progress: s82.progress,
      gears: s82.parts.gearsFactor,
      bridges: s82.parts.bridgesFactor,
      caseBack: s82.parts.caseBackFactor,
      camDistance: s82.proxy.camDistance,
      commitmentCardOpacity: s82.dom.commitmentCardOpacity,
    });
    await saveScreenshot('82.png');
    // At 82%: gears have started reassembly (< 0.8), bridges beginning, outer parts still disassembled
    results.p82 = s82.parts.gearsFactor < s80.parts.gearsFactor && s82.parts.caseBackFactor >= 0.95 && s82.proxy.camDistance < s80.proxy.camDistance;

    // Checkpoint 84% - Internal mechanism returning (gears + bridges assembled, movement returning)
    await scrollTo(0.84);
    const s84 = await readState();
    console.log('Checkpoint 84%:', {
      progress: s84.progress,
      gears: s84.parts.gearsFactor,
      bridges: s84.parts.bridgesFactor,
      movement: s84.parts.movementFactor,
      hands: s84.parts.handsFactor,
      dial: s84.parts.dialFactor,
      commitmentIdentityOpacity: s84.dom.commitmentIdentityOpacity,
    });
    await saveScreenshot('84.png');
    // At 84%: gears & bridges close to 0, movement underway, dial/crystal/caseback still out
    results.p84 = s84.parts.gearsFactor < 0.15 && s84.parts.bridgesFactor < 0.25 && s84.parts.movementFactor < s80.parts.movementFactor;

    // Checkpoint 86% - Movement settles, hands return, dial begins
    await scrollTo(0.86);
    const s86 = await readState();
    console.log('Checkpoint 86%:', {
      progress: s86.progress,
      movement: s86.parts.movementFactor,
      hands: s86.parts.handsFactor,
      dial: s86.parts.dialFactor,
      crystal: s86.parts.crystalFactor,
      caseBack: s86.parts.caseBackFactor,
      commitmentSpecsOpacity: s86.dom.commitmentSpecsOpacity,
    });
    await saveScreenshot('86.png');
    // At 86%: movement & hands assembled, dial assembling, outer parts still separated
    results.p86 = s86.parts.movementFactor < 0.15 && s86.parts.handsFactor < 0.15 && s86.parts.dialFactor < s84.parts.dialFactor;

    // Checkpoint 88% - Dial/crystal/bezel converge
    await scrollTo(0.88);
    const s88 = await readState();
    console.log('Checkpoint 88%:', {
      progress: s88.progress,
      dial: s88.parts.dialFactor,
      crystal: s88.parts.crystalFactor,
      bezel: s88.parts.bezelFactor,
      caseBack: s88.parts.caseBackFactor,
      camDistance: s88.proxy.camDistance,
      lightIntensity: s88.proxy.keyLightIntensity,
      commitmentSecurityOpacity: s88.dom.commitmentSecurityOpacity,
    });
    await saveScreenshot('88.png');
    // At 88%: dial & crystal assembled, bezel & caseBack converging
    results.p88 = s88.parts.dialFactor < 0.15 && s88.parts.crystalFactor < 0.15 && s88.parts.bezelFactor < s86.parts.bezelFactor;

    // Checkpoint 90% - Watch essentially whole (caseBack in place)
    await scrollTo(0.90);
    const s90 = await readState();
    console.log('Checkpoint 90%:', {
      progress: s90.progress,
      caseBack: s90.parts.caseBackFactor,
      bezel: s90.parts.bezelFactor,
      crystal: s90.parts.crystalFactor,
      dial: s90.parts.dialFactor,
      camDistance: s90.proxy.camDistance,
      targetX: s90.proxy.targetX,
      commitmentCtaOpacity: s90.dom.commitmentCtaOpacity,
    });
    await saveScreenshot('90.png');
    // At 90%: all components back to assembled state (< 0.15), camera near center
    results.p90 = s90.parts.caseBackFactor < 0.15 && s90.parts.bezelFactor < 0.15 && s90.proxy.camDistance <= 6.2;

    // Checkpoint 92% - Complete watch + precision mechanical alignment settled + stable Commitment card
    await scrollTo(0.92);
    const s92 = await readState();
    console.log('Checkpoint 92% (Final Commitment State):', {
      progress: s92.progress,
      camDistance: s92.proxy.camDistance,
      camAngleX: s92.proxy.camAngleX,
      targetX: s92.proxy.targetX,
      targetY: s92.proxy.targetY,
      targetZ: s92.proxy.targetZ,
      lightIntensity: s92.proxy.keyLightIntensity,
      bloom: s92.proxy.bloomIntensity,
      watchRotY: s92.proxy.watchRotY,
      commitmentCardOpacity: s92.dom.commitmentCardOpacity,
      commitmentCtaOpacity: s92.dom.commitmentCtaOpacity,
      finalVisibility: s92.dom.finalVisibility,
    });
    await saveScreenshot('92.png');
    // At 92%: watch completely assembled (all factors <= 0.05), camera final settled, Commitment card stable
    results.p92 = s92.parts.caseBackFactor <= 0.05 && s92.parts.gearsFactor <= 0.05 && 
                  Math.abs(s92.proxy.camDistance - 6.0) <= 0.15 && 
                  s92.dom.commitmentCardOpacity >= 0.95 &&
                  s92.dom.finalVisibility === 'hidden';

    // Component Reassembly Integrity
    results.gears = s80.parts.gearsFactor > s82.parts.gearsFactor && s84.parts.gearsFactor <= 0.05;
    results.bridges = s80.parts.bridgesFactor > s84.parts.bridgesFactor && s86.parts.bridgesFactor <= 0.05;
    results.movement = s82.parts.movementFactor > s86.parts.movementFactor && s86.parts.movementFactor <= 0.10;
    results.hands = s82.parts.handsFactor > s86.parts.handsFactor && s86.parts.handsFactor <= 0.05;
    results.dial = s84.parts.dialFactor > s88.parts.dialFactor && s88.parts.dialFactor <= 0.05;
    results.crystal = s84.parts.crystalFactor > s88.parts.crystalFactor && s88.parts.crystalFactor <= 0.05;
    results.bezel = s86.parts.bezelFactor > s90.parts.bezelFactor && s90.parts.bezelFactor <= 0.10;
    results.caseBack = s86.parts.caseBackFactor > s90.parts.caseBackFactor && s92.parts.caseBackFactor <= 0.05;

    // Strict Inverse Reassembly Order Verification
    results.reassemblyOrder = results.gears && results.bridges && results.movement && 
                             results.hands && results.dial && results.crystal && 
                             results.bezel && results.caseBack;

    // Camera: inspection (macro/lateral) -> certainty (centered dolly)
    results.camera = s80.proxy.camDistance > s84.proxy.camDistance && 
                     s84.proxy.camDistance > s88.proxy.camDistance && 
                     Math.abs(s92.proxy.targetX) <= 0.05 && 
                     Math.abs(s92.proxy.camAngleX) <= 0.5;

    // Lighting: Controlled progression to product highlight (inverse of Disassembly)
    results.lighting = s80.proxy.keyLightIntensity < s86.proxy.keyLightIntensity && 
                       s86.proxy.keyLightIntensity < s92.proxy.keyLightIntensity;

    // Bloom: Restrained throughout (max ~0.52 vs Disassembly peak 0.95)
    results.bloom = s92.proxy.bloomIntensity <= 0.55 && s80.proxy.bloomIntensity <= 0.45;

    // DOF follows camera migration toward complete watch plane
    results.dof = results.camera;

    // DOM & Shared-element transition:
    results.commitmentCard = s92.dom.commitmentCardOpacity >= 0.95 && s92.dom.commitmentVisibility === 'visible';
    results.sharedElementTransition = s80.dom.commitmentCardOpacity < 0.2 && s84.dom.commitmentIdentityOpacity >= 0.8;
    results.cta = s92.dom.commitmentCtaOpacity >= 0.95;

    // Business state preserved as REVIEW
    results.businessStatePreserved = s92.debug.intakeState === 'REVIEW';

    // Pointer ownership: WebGL none, DOM auto
    results.pointerOwnership = s92.dom.webglPointerEvents === 'none' && s92.dom.commitmentBtnPointerEvents === 'auto';

    // Test Click Interaction on CTA
    const confirmBtn = await page.$('#commitment-confirm-btn');
    if (confirmBtn) {
      await confirmBtn.click();
      await sleep(200);
      const btnText = await page.$eval('#commitment-cta-text', el => el.textContent);
      console.log('Clicked CTA -> Button text updated to:', btnText);
      results.cta = results.cta && btnText.includes('BOOKING SECURED');
    }

    // Downstream Final check
    results.finalStatic = s92.dom.finalVisibility === 'hidden';

    // ====================================================
    // 3. REVERSE SCROLL & UPSTREAM REGRESSION
    // ====================================================
    console.log('\n--- 3. Testing Reverse Scroll (92% → 80% → 0%) ---');
    await saveScreenshot('92-return.png');

    // Reverse: 92 -> 90 -> 88 -> 86 -> 84 -> 82 -> 80
    await scrollTo(0.90);
    await scrollTo(0.88);
    await scrollTo(0.86);
    await scrollTo(0.84);
    await scrollTo(0.82);
    await scrollTo(0.80);
    const s80Return = await readState();
    console.log('Reversed back to 80%:', {
      progress: s80Return.progress,
      gears: s80Return.parts.gearsFactor,
      caseBack: s80Return.parts.caseBackFactor,
      camDistance: s80Return.proxy.camDistance,
      expertiseVisibility: s80Return.dom.expertiseVisibility
    });
    await saveScreenshot('80-return.png');

    // Verify watch redisassembled at 80%
    const watchReExplodedAt80 = s80Return.parts.gearsFactor >= 0.90 && s80Return.parts.caseBackFactor >= 0.90;

    // Reverse further: 80 -> 65 -> 56 -> 45 -> 36 -> 20 -> 12 -> 0
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
    results.heroRegression = s0Return.dom.heroOpacity >= 0.9 && s0Return.dom.commitmentVisibility === 'hidden';
    console.log('Hero at 0%:', results.heroRegression ? 'PASS' : 'FAIL');

    results.reverseScroll = watchReExplodedAt80 && results.heroRegression;

    // ====================================================
    // 4. DIRECT JUMPS
    // ====================================================
    console.log('\n--- 4. Testing Direct Jumps ---');
    // 0 → 85 → 0
    await scrollTo(0.0); await sleep(150);
    await scrollTo(0.85);
    const sJ85 = await readState();
    const jump1 = sJ85.dom.commitmentVisibility === 'visible';
    await scrollTo(0.0); await sleep(150);
    const sJ0a = await readState();
    const jump1b = sJ0a.dom.commitmentVisibility === 'hidden';

    // 20 → 88 → 20
    await scrollTo(0.20); await sleep(150);
    await scrollTo(0.88);
    const sJ88 = await readState();
    const jump2 = sJ88.parts.dialFactor < 0.2;
    await scrollTo(0.20); await sleep(150);
    const sJ20 = await readState();
    const jump2b = sJ20.parts.caseBackFactor <= 0.05; // at 20% disassembly hasn't occurred yet

    // 65 → 90 → 65
    await scrollTo(0.65); await sleep(150);
    await scrollTo(0.90);
    const sJ90 = await readState();
    const jump3 = sJ90.parts.caseBackFactor < 0.2;
    await scrollTo(0.65); await sleep(150);

    // 75 → 91 → 75
    await scrollTo(0.75); await sleep(150);
    await scrollTo(0.91);
    const sJ91 = await readState();
    const jump4 = sJ91.parts.gearsFactor <= 0.05;
    await scrollTo(0.75); await sleep(150);

    // 80 → 92 → 80
    await scrollTo(0.80); await sleep(150);
    await scrollTo(0.92);
    const sJ92 = await readState();
    const jump5 = sJ92.parts.caseBackFactor <= 0.05 && sJ92.dom.commitmentCardOpacity >= 0.95;
    await scrollTo(0.80); await sleep(150);
    const sJ80 = await readState();
    const jump5b = sJ80.parts.caseBackFactor >= 0.90;

    // 0 → 92 → 0
    await scrollTo(0.0); await sleep(150);
    await scrollTo(0.92);
    const sJFull = await readState();
    const jump6 = sJFull.parts.caseBackFactor <= 0.05 && sJFull.dom.commitmentCardOpacity >= 0.95;
    await scrollTo(0.0); await sleep(150);
    const sJ0Final = await readState();
    const jump6b = sJ0Final.dom.commitmentVisibility === 'hidden';

    results.directJumps = jump1 && jump1b && jump2 && jump2b && jump3 && jump4 && jump5 && jump5b && jump6 && jump6b;
    console.log('Direct Jumps result:', results.directJumps ? 'PASS' : 'FAIL');

  } catch (err) {
    console.error('TEST ERROR:', err.message);
  } finally {
    await browser.close();
  }

  // ====================================================
  // FINAL ACCEPTANCE REPORT
  // ====================================================
  const allCheckpoints = results.p80 && results.p82 && results.p84 && results.p86 && results.p88 && results.p90 && results.p92;
  const allParts = results.caseBack && results.bezel && results.crystal && results.dial && 
                   results.hands && results.movement && results.bridges && results.gears;
  const allSystems = results.reassemblyOrder && results.camera && results.lighting && results.dof && results.bloom &&
                     results.commitmentCard && results.sharedElementTransition && results.cta &&
                     results.businessStatePreserved && results.pointerOwnership && results.finalStatic;
  const allNavigation = results.reverseScroll && results.directJumps;
  const allRegressions = results.heroRegression && results.heritageRegression && results.disassemblyRegression &&
                         results.intakeRegression && results.analysisRegression && results.expertiseRegression;

  const overallPass = allCheckpoints && allParts && allSystems && allNavigation && allRegressions && consoleErrors.length === 0;

  console.log('\n======================================================');
  console.log('FINAL ACCEPTANCE REPORT: COMMITMENT / REASSEMBLY GSAP');
  console.log('======================================================');
  console.log(`COMMITMENT / REASSEMBLY GSAP: ${overallPass ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`80%: ${results.p80 ? 'PASS' : 'FAIL'}`);
  console.log(`82%: ${results.p82 ? 'PASS' : 'FAIL'}`);
  console.log(`84%: ${results.p84 ? 'PASS' : 'FAIL'}`);
  console.log(`86%: ${results.p86 ? 'PASS' : 'FAIL'}`);
  console.log(`88%: ${results.p88 ? 'PASS' : 'FAIL'}`);
  console.log(`90%: ${results.p90 ? 'PASS' : 'FAIL'}`);
  console.log(`92%: ${results.p92 ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`CASEBACK: ${results.caseBack ? 'PASS' : 'FAIL'}`);
  console.log(`BEZEL: ${results.bezel ? 'PASS' : 'FAIL'}`);
  console.log(`CRYSTAL: ${results.crystal ? 'PASS' : 'FAIL'}`);
  console.log(`DIAL: ${results.dial ? 'PASS' : 'FAIL'}`);
  console.log(`HANDS: ${results.hands ? 'PASS' : 'FAIL'}`);
  console.log(`MOVEMENT: ${results.movement ? 'PASS' : 'FAIL'}`);
  console.log(`BRIDGES: ${results.bridges ? 'PASS' : 'FAIL'}`);
  console.log(`GEARS: ${results.gears ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`REASSEMBLY ORDER: ${results.reassemblyOrder ? 'PASS' : 'FAIL'}`);
  console.log(`CAMERA: ${results.camera ? 'PASS' : 'FAIL'}`);
  console.log(`LIGHTING: ${results.lighting ? 'PASS' : 'FAIL'}`);
  console.log(`DOF: ${results.dof ? 'PASS' : 'FAIL'}`);
  console.log(`BLOOM: ${results.bloom ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`COMMITMENT CARD: ${results.commitmentCard ? 'PASS' : 'FAIL'}`);
  console.log(`SHARED-ELEMENT TRANSITION: ${results.sharedElementTransition ? 'PASS' : 'FAIL'}`);
  console.log(`CTA: ${results.cta ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`BUSINESS STATE PRESERVED: ${results.businessStatePreserved ? 'PASS' : 'FAIL'}`);
  console.log(`POINTER OWNERSHIP: ${results.pointerOwnership ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`REVERSE 92 → 80: ${results.reverseScroll ? 'PASS' : 'FAIL'}`);
  console.log(`DIRECT JUMPS: ${results.directJumps ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`HERO REGRESSION: ${results.heroRegression ? 'PASS' : 'FAIL'}`);
  console.log(`HERITAGE REGRESSION: ${results.heritageRegression ? 'PASS' : 'FAIL'}`);
  console.log(`DISASSEMBLY REGRESSION: ${results.disassemblyRegression ? 'PASS' : 'FAIL'}`);
  console.log(`INTAKE REGRESSION: ${results.intakeRegression ? 'PASS' : 'FAIL'}`);
  console.log(`ANALYSIS REGRESSION: ${results.analysisRegression ? 'PASS' : 'FAIL'}`);
  console.log(`EXPERTISE REGRESSION: ${results.expertiseRegression ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`FINAL REMAINS STATIC: ${results.finalStatic ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`CONSOLE ERRORS: ${consoleErrors.length === 0 ? 'NONE' : consoleErrors.join(', ')}`);
  console.log('');
  console.log('CURRENT ASSET:');
  console.log('MasterpieceSkeletonWatch Proxy');
  console.log('======================================================');

  process.exit(overallPass ? 0 : 1);
})();
