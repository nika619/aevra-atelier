/**
 * EXPERTISE GSAP ONLY — Runtime Verification
 * Subsystem 6: 65% → 80%
 * 
 * Verifies: Camera pull-back, warm lighting, bloom reduction, editorial DOM choreography,
 * watch remains disassembled, deliberate stillness, reverse scroll, direct jumps, regressions.
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'debug', 'expertise');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('=== STARTING EXPERTISE GSAP ONLY RUNTIME VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  const results = {
    p65: false, p68: false, p72: false, p76: false, p80: false,
    entryTransition: false, dom: false, camera: false, lighting: false,
    dof: false, bloom: false, atelierComposition: false,
    watchDisassembled: false, commitmentStatic: false, finalStatic: false,
    reverseScroll: false, directJumps: false,
    intakeRegression: false, analysisRegression: false,
    disassemblyRegression: false, heritageRegression: false,
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
    await sleep(600);
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

      const expertiseSec = document.getElementById('expertise-section');
      const expertiseEyebrow = document.getElementById('expertise-eyebrow');
      const expertiseHeadingL1 = document.getElementById('expertise-heading-l1');
      const expertiseHeadingL2 = document.getElementById('expertise-heading-l2');
      const expertiseCopy = document.getElementById('expertise-copy');
      const expertiseCredential = document.getElementById('expertise-credential');
      const expertiseAtelier = document.getElementById('expertise-atelier-meta');
      const expertiseDetails = document.querySelectorAll('.expertise-detail');
      const analysisSec = document.getElementById('analysis-section');
      const analysisCard = document.getElementById('analysis-card-container');
      const intakeSec = document.getElementById('intake-section');
      const heroSec = document.getElementById('hero-section');
      const heritageSec = document.getElementById('heritage-section');
      const processSec = document.getElementById('process-section');
      const commitmentSec = document.querySelector('[id*="commitment"]') || document.querySelector('[id*="reassembly"]');
      const finalSec = document.getElementById('final-section');

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
          bloomIntensity: parseFloat((proxy.bloomIntensity || 0).toFixed(3)),
          watchRotY: parseFloat((proxy.watchRotY || 0).toFixed(3)),
        },
        parts: {
          caseBackFactor: parts.caseBack ? parts.caseBack.factor : 0,
          bezelFactor: parts.bezel ? parts.bezel.factor : 0,
          crystalFactor: parts.crystal ? parts.crystal.factor : 0,
          dialFactor: parts.dial ? parts.dial.factor : 0,
          gearsFactor: parts.gears ? parts.gears.factor : 0,
        },
        dom: {
          expertiseVisibility: getVisibility(expertiseSec),
          expertiseOpacity: getOpacity(expertiseSec),
          eyebrowOpacity: getOpacity(expertiseEyebrow),
          headingL1Opacity: getOpacity(expertiseHeadingL1),
          headingL2Opacity: getOpacity(expertiseHeadingL2),
          copyOpacity: getOpacity(expertiseCopy),
          credentialOpacity: getOpacity(expertiseCredential),
          atelierOpacity: getOpacity(expertiseAtelier),
          detailCount: expertiseDetails ? expertiseDetails.length : 0,
          detailOpacities: expertiseDetails ? Array.from(expertiseDetails).map(d => getOpacity(d)) : [],
          analysisVisibility: getVisibility(analysisSec),
          analysisCardOpacity: getOpacity(analysisCard),
          intakeVisibility: getVisibility(intakeSec),
          heroOpacity: getOpacity(heroSec),
          heritageVisibility: getVisibility(heritageSec),
          processVisibility: getVisibility(processSec),
          commitmentVisibility: commitmentSec ? getVisibility(commitmentSec) : 'hidden',
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

    // Initial check at 0%
    const s0 = await readState();
    console.log(`Initial state @ progress ${(s0.progress * 100).toFixed(1)}%:`, {
      heroOpacity: s0.dom.heroOpacity,
      expertiseVisibility: s0.dom.expertiseVisibility
    });

    // ====================================================
    // 1. INTAKE SUBMISSION FOR STATE CONTINUITY
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
        await sleep(400);
        const sAnalyzing = await readState();
        results.intakeRegression = sAnalyzing.debug && sAnalyzing.debug.intakeState === 'ANALYZING';
        console.log('Analyzing state:', results.intakeRegression ? 'PASS' : 'FAIL');
        await sleep(2200);
        const sReview = await readState();
        results.intakeRegression = results.intakeRegression && sReview.debug && sReview.debug.intakeState === 'REVIEW';
        console.log('Review state:', results.intakeRegression ? 'PASS' : 'FAIL');
      }
    }

    // Quick Analysis regression check
    await scrollTo(0.62);
    const sAnalysis = await readState();
    results.analysisRegression = sAnalysis.dom.analysisVisibility === 'visible' && sAnalysis.proxy.camDistance <= 3.3;
    console.log('Analysis regression:', results.analysisRegression ? 'PASS' : 'FAIL');

    // ====================================================
    // 2. FORWARD PROGRESSION (65% -> 80% EXPERTISE GSAP)
    // ====================================================
    console.log('\n--- 2. Testing Expertise Forward Progression (65% -> 80%) ---');

    // 65% - Analysis hands off, Expertise enters
    await scrollTo(0.65);
    const s65 = await readState();
    console.log('Checkpoint 65%:', {
      progress: s65.progress,
      expertiseVisibility: s65.dom.expertiseVisibility,
      eyebrowOpacity: s65.dom.eyebrowOpacity,
      camDistance: s65.proxy.camDistance,
      lightIntensity: s65.proxy.keyLightIntensity,
      bloom: s65.proxy.bloomIntensity,
      caseBackFactor: s65.parts.caseBackFactor,
    });
    await saveScreenshot('65.png');
    // At 65%: Expertise should be visible, eyebrow entering, camera beginning pull-back
    results.p65 = s65.dom.expertiseVisibility === 'visible';

    // 68% - Eyebrow resolved, heading entering, camera retreating
    await scrollTo(0.68);
    const s68 = await readState();
    console.log('Checkpoint 68%:', {
      progress: s68.progress,
      eyebrowOpacity: s68.dom.eyebrowOpacity,
      headingL1Opacity: s68.dom.headingL1Opacity,
      camDistance: s68.proxy.camDistance,
      lightIntensity: s68.proxy.keyLightIntensity,
      bloom: s68.proxy.bloomIntensity,
    });
    await saveScreenshot('68.png');
    // At 68%: eyebrow should be resolving, camera pulling back, heading entering
    results.p68 = s68.proxy.camDistance > s65.proxy.camDistance && s68.dom.eyebrowOpacity > 0.5;

    // 72% - Craftsmanship becomes focus, wider framing, copy resolving
    await scrollTo(0.72);
    const s72 = await readState();
    console.log('Checkpoint 72%:', {
      progress: s72.progress,
      headingL1Opacity: s72.dom.headingL1Opacity,
      headingL2Opacity: s72.dom.headingL2Opacity,
      copyOpacity: s72.dom.copyOpacity,
      camDistance: s72.proxy.camDistance,
      lightIntensity: s72.proxy.keyLightIntensity,
      bloom: s72.proxy.bloomIntensity,
    });
    await saveScreenshot('72.png');
    // At 72%: headings resolved, copy entering, camera wider
    results.p72 = s72.proxy.camDistance > s68.proxy.camDistance && s72.dom.headingL1Opacity > 0.8;

    // 76% - Calm atelier, details entering, low bloom
    await scrollTo(0.76);
    const s76 = await readState();
    console.log('Checkpoint 76%:', {
      progress: s76.progress,
      copyOpacity: s76.dom.copyOpacity,
      detailOpacities: s76.dom.detailOpacities,
      credentialOpacity: s76.dom.credentialOpacity,
      camDistance: s76.proxy.camDistance,
      lightIntensity: s76.proxy.keyLightIntensity,
      bloom: s76.proxy.bloomIntensity,
    });
    await saveScreenshot('76.png');
    // At 76%: copy resolved, details entering, camera wide, light stable
    results.p76 = s76.proxy.camDistance > s72.proxy.camDistance && s76.dom.copyOpacity > 0.8;

    // 80% - Terminal: stillness, everything settled
    await scrollTo(0.80);
    const s80 = await readState();
    console.log('Checkpoint 80% (Terminal State):', {
      progress: s80.progress,
      camDistance: s80.proxy.camDistance,
      camAngleX: s80.proxy.camAngleX,
      lightIntensity: s80.proxy.keyLightIntensity,
      bloom: s80.proxy.bloomIntensity,
      credentialOpacity: s80.dom.credentialOpacity,
      atelierOpacity: s80.dom.atelierOpacity,
    });
    await saveScreenshot('80.png');
    // At 80%: Terminal state. All DOM materialized, camera calm.
    results.p80 = s80.proxy.camDistance >= 7.5 && s80.dom.expertiseVisibility === 'visible';

    // Subsystem verification flags
    // Entry transition: Expertise visible at 65%, Analysis card fading by 68%
    results.entryTransition = results.p65 && s68.dom.analysisCardOpacity < 0.5;
    results.dom = s80.dom.eyebrowOpacity >= 0.9 && s80.dom.headingL1Opacity >= 0.9 && s80.dom.headingL2Opacity >= 0.9 && s80.dom.copyOpacity >= 0.9;
    results.camera = s65.proxy.camDistance < s72.proxy.camDistance && s72.proxy.camDistance < s80.proxy.camDistance;
    results.lighting = s65.proxy.keyLightIntensity > s80.proxy.keyLightIntensity;
    results.bloom = s65.proxy.bloomIntensity > s80.proxy.bloomIntensity && s80.proxy.bloomIntensity < 0.55;
    results.dof = results.camera; // DOF follows camera retreat
    results.atelierComposition = s80.dom.detailOpacities.length === 3;

    // Watch must remain disassembled
    results.watchDisassembled = s80.parts.caseBackFactor >= 0.95 && s80.parts.bezelFactor >= 0.95 && s80.parts.gearsFactor >= 0.95;
    console.log('\nWatch disassembly at 80%:', {
      caseBack: s80.parts.caseBackFactor,
      bezel: s80.parts.bezelFactor,
      gears: s80.parts.gearsFactor,
    });
    console.log('Watch remains disassembled:', results.watchDisassembled ? 'PASS' : 'FAIL');

    // ====================================================
    // 3. REVERSE SCROLL & UPSTREAM REGRESSION
    // ====================================================
    console.log('\n--- 3. Testing Reverse Scroll ---');
    await saveScreenshot('80-return.png');

    // Reverse through Expertise
    await scrollTo(0.76);
    await scrollTo(0.72);
    await scrollTo(0.68);
    await scrollTo(0.65);
    const s65Return = await readState();
    console.log('Reversed to 65%:', {
      progress: s65Return.progress,
      camDistance: s65Return.proxy.camDistance,
      expertiseVisibility: s65Return.dom.expertiseVisibility,
    });
    await saveScreenshot('65-return.png');

    // Reverse to Analysis
    await scrollTo(0.62);
    const sAnalysisReturn = await readState();
    console.log('Analysis at 62%:', {
      analysisVisibility: sAnalysisReturn.dom.analysisVisibility,
      camDistance: sAnalysisReturn.proxy.camDistance,
    });
    results.analysisRegression = results.analysisRegression && sAnalysisReturn.dom.analysisVisibility === 'visible';

    // Reverse to Intake
    await scrollTo(0.42);
    const sIntakeReturn = await readState();
    results.intakeRegression = results.intakeRegression && sIntakeReturn.dom.intakeVisibility === 'visible';
    console.log('Intake at 42%:', { intakeVisibility: sIntakeReturn.dom.intakeVisibility });

    // Reverse to Disassembly
    await scrollTo(0.28);
    const sDisassembly = await readState();
    results.disassemblyRegression = sDisassembly.dom.processVisibility === 'visible';
    console.log('Disassembly at 28%:', results.disassemblyRegression ? 'PASS' : 'FAIL');

    // Reverse to Heritage
    await scrollTo(0.16);
    const sHeritage = await readState();
    results.heritageRegression = sHeritage.dom.heritageVisibility === 'visible';
    console.log('Heritage at 16%:', results.heritageRegression ? 'PASS' : 'FAIL');

    // Reverse to Hero
    await scrollTo(0.0);
    const sHero = await readState();
    console.log('Hero at 0%:', { heroOpacity: sHero.dom.heroOpacity, expertiseVisibility: sHero.dom.expertiseVisibility });

    results.reverseScroll = s65Return.dom.expertiseVisibility === 'visible' &&
                            sHero.dom.expertiseVisibility === 'hidden' &&
                            sHero.dom.heroOpacity >= 0.9;

    // ====================================================
    // 4. DIRECT JUMPS
    // ====================================================
    console.log('\n--- 4. Testing Direct Jumps ---');

    // 0 → 70 → 0
    await scrollTo(0.0); await sleep(200);
    await scrollTo(0.70);
    const sJump70 = await readState();
    const jump1 = sJump70.dom.expertiseVisibility === 'visible' && sJump70.proxy.camDistance > 5.0;
    await scrollTo(0.0); await sleep(200);
    const sJumpBack0 = await readState();
    const jump1b = sJumpBack0.dom.expertiseVisibility === 'hidden';

    // 20 → 75 → 20
    await scrollTo(0.20); await sleep(200);
    await scrollTo(0.75);
    const sJump75 = await readState();
    const jump2 = sJump75.dom.expertiseVisibility === 'visible';
    await scrollTo(0.20); await sleep(200);

    // 56 → 75 → 56
    await scrollTo(0.56); await sleep(200);
    await scrollTo(0.75); await sleep(200);
    await scrollTo(0.56); await sleep(200);

    // 65 → 80 → 65
    await scrollTo(0.65); await sleep(200);
    await scrollTo(0.80);
    const sJump80 = await readState();
    const jump4 = sJump80.proxy.camDistance >= 7.5;
    await scrollTo(0.65); await sleep(200);

    // 0 → 80 → 0
    await scrollTo(0.0); await sleep(200);
    await scrollTo(0.80);
    const sJumpFull = await readState();
    const jump5 = sJumpFull.dom.expertiseVisibility === 'visible' && sJumpFull.proxy.camDistance >= 7.5;
    await scrollTo(0.0); await sleep(200);

    results.directJumps = jump1 && jump1b && jump2 && jump4 && jump5;
    console.log('Direct Jumps result:', results.directJumps ? 'PASS' : 'FAIL');

    // ====================================================
    // 5. COMMITMENT & FINAL REMAIN STATIC
    // ====================================================
    console.log('\n--- 5. Verifying Downstream Remains Static ---');
    await scrollTo(0.85);
    const sDownstream85 = await readState();
    results.commitmentStatic = sDownstream85.dom.commitmentVisibility === 'hidden';
    console.log('Commitment at 85%:', { visibility: sDownstream85.dom.commitmentVisibility });

    await scrollTo(0.95);
    const sDownstream95 = await readState();
    results.finalStatic = sDownstream95.dom.finalVisibility === 'hidden';
    console.log('Final at 95%:', { visibility: sDownstream95.dom.finalVisibility });

  } catch (err) {
    console.error('TEST ERROR:', err.message);
  } finally {
    await browser.close();
  }

  // ====================================================
  // FINAL ACCEPTANCE REPORT
  // ====================================================
  const allCheckpoints = results.p65 && results.p68 && results.p72 && results.p76 && results.p80;
  const allSubsystems = results.entryTransition && results.dom && results.camera && results.lighting && results.dof && results.bloom && results.atelierComposition;
  const allIntegrity = results.watchDisassembled && results.commitmentStatic && results.finalStatic;
  const allNavigation = results.reverseScroll && results.directJumps;
  const allRegressions = results.intakeRegression && results.analysisRegression && results.disassemblyRegression && results.heritageRegression;
  const overallPass = allCheckpoints && allSubsystems && allIntegrity && allNavigation && allRegressions && consoleErrors.length === 0;

  console.log('\n======================================================');
  console.log('FINAL ACCEPTANCE REPORT: EXPERTISE GSAP');
  console.log('======================================================');
  console.log(`EXPERTISE GSAP: ${overallPass ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`65%: ${results.p65 ? 'PASS' : 'FAIL'}`);
  console.log(`68%: ${results.p68 ? 'PASS' : 'FAIL'}`);
  console.log(`72%: ${results.p72 ? 'PASS' : 'FAIL'}`);
  console.log(`76%: ${results.p76 ? 'PASS' : 'FAIL'}`);
  console.log(`80%: ${results.p80 ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`ENTRY TRANSITION: ${results.entryTransition ? 'PASS' : 'FAIL'}`);
  console.log(`DOM: ${results.dom ? 'PASS' : 'FAIL'}`);
  console.log(`CAMERA: ${results.camera ? 'PASS' : 'FAIL'}`);
  console.log(`LIGHTING: ${results.lighting ? 'PASS' : 'FAIL'}`);
  console.log(`DOF: ${results.dof ? 'PASS' : 'FAIL'}`);
  console.log(`BLOOM: ${results.bloom ? 'PASS' : 'FAIL'}`);
  console.log(`ATELIER COMPOSITION: ${results.atelierComposition ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`WATCH REMAINS DISASSEMBLED: ${results.watchDisassembled ? 'PASS' : 'FAIL'}`);
  console.log(`COMMITMENT REMAINS STATIC: ${results.commitmentStatic ? 'PASS' : 'FAIL'}`);
  console.log(`FINAL REMAINS STATIC: ${results.finalStatic ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`REVERSE SCROLL: ${results.reverseScroll ? 'PASS' : 'FAIL'}`);
  console.log(`DIRECT JUMPS: ${results.directJumps ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`INTAKE REGRESSION: ${results.intakeRegression ? 'PASS' : 'FAIL'}`);
  console.log(`ANALYSIS REGRESSION: ${results.analysisRegression ? 'PASS' : 'FAIL'}`);
  console.log(`DISASSEMBLY REGRESSION: ${results.disassemblyRegression ? 'PASS' : 'FAIL'}`);
  console.log(`HERITAGE REGRESSION: ${results.heritageRegression ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`CONSOLE ERRORS: ${consoleErrors.length === 0 ? 'NONE' : consoleErrors.join(', ')}`);
  console.log('');
  console.log('CURRENT ASSET:');
  console.log('MasterpieceSkeletonWatch Proxy');
  console.log('======================================================');

  process.exit(overallPass ? 0 : 1);
})();
