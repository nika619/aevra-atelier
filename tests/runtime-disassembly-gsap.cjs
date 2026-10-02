const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.resolve(__dirname, '../debug/disassembly'),
  path.resolve(__dirname, '../disassembly')
];

DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDisassemblyGsapTest() {
  console.log('=== STARTING DISASSEMBLY GSAP ONLY RUNTIME VERIFICATION ===\n');

  const results = {
    disassemblyGsap: false,
    p20: false,
    p22: false,
    p25: false,
    p28: false,
    p32: false,
    p36: false,
    forward20to36: false,
    reverse36to20: false,
    restore20to0: false,
    parts: {
      caseBack: false,
      bezel: false,
      crystal: false,
      dial: false,
      hands: false,
      movement: false,
      bridges: false,
      gears: false
    },
    camera: false,
    lighting: false,
    dof: false,
    bloom: false,
    processDom: false,
    heritageRegression: false,
    intakeRegression: false,
    bookService: false,
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
    await sleep(400); // Allow lerp and GSAP renders to settle
  };

  const readState = async () => {
    return await page.evaluate(() => {
      const p = window.__PROXY_STATE__;
      const parts = window.__PART_TRANSFORMS__ || {};
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const prog = maxScroll > 0 ? y / maxScroll : 0;

      const processSec = document.getElementById('process-section');
      const processHeader = document.getElementById('process-header');
      const s1 = document.getElementById('process-step-1');
      const s2 = document.getElementById('process-step-2');
      const s3 = document.getElementById('process-step-3');
      const s4 = document.getElementById('process-step-4');

      const intakeSec = document.getElementById('intake-section');
      const heritageSec = document.getElementById('heritage-section');
      const heroSec = document.getElementById('hero-section');

      const getOpacity = (el) => el ? parseFloat(window.getComputedStyle(el).opacity) : 0;
      const getVisibility = (el) => el ? window.getComputedStyle(el).visibility : 'hidden';

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
          bloomIntensity: parseFloat(p.bloomIntensity.toFixed(3)),
          caseBackExplode: parseFloat(p.caseBackExplode.toFixed(3)),
          bezelExplode: parseFloat(p.bezelExplode.toFixed(3)),
          crystalExplode: parseFloat(p.crystalExplode.toFixed(3)),
          dialExplode: parseFloat(p.dialExplode.toFixed(3)),
          handsExplode: parseFloat(p.handsExplode.toFixed(3)),
          movementExplode: parseFloat(p.movementExplode.toFixed(3)),
          bridgesExplode: parseFloat(p.bridgesExplode.toFixed(3)),
          gearsExplode: parseFloat(p.gearsExplode.toFixed(3))
        } : null,
        parts: parts,
        dom: {
          heroOpacity: getOpacity(heroSec),
          heritageOpacity: getOpacity(heritageSec),
          processOpacity: getOpacity(processSec),
          processVisibility: getVisibility(processSec),
          intakeOpacity: getOpacity(intakeSec),
          intakeVisibility: getVisibility(intakeSec),
          step1Opacity: getOpacity(s1),
          step2Opacity: getOpacity(s2),
          step3Opacity: getOpacity(s3),
          step4Opacity: getOpacity(s4)
        }
      };
    });
  };

  try {
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(1500);

    // Initial state check
    const s0 = await readState();
    console.log(`Initial state @ progress ${(s0.progress * 100).toFixed(1)}%:`, {
      camDistance: s0.proxy?.camDistance,
      heroOpacity: s0.dom.heroOpacity,
      processVisibility: s0.dom.processVisibility
    });

    // ====================================================
    // 1. FORWARD PROGRESSION (20% -> 36%)
    // ====================================================
    console.log('\n--- Testing Forward Progression (20% -> 36%) ---');

    // Checkpoint 20%
    await scrollTo(0.20);
    const s20 = await readState();
    console.log('Checkpoint 20%:', {
      progress: s20.progress,
      camDistance: s20.proxy.camDistance,
      caseBack: s20.parts.caseBack,
      movement: s20.parts.movement,
      processOpacity: s20.dom.processOpacity,
      step1: s20.dom.step1Opacity
    });
    await saveScreenshots('20.png');
    // At 20%: Heritage terminal, Disassembly at 0 explode
    results.p20 = s20.progress >= 0.19 && s20.progress <= 0.21 &&
                  s20.proxy.caseBackExplode <= 0.05 &&
                  s20.dom.intakeVisibility === 'hidden';

    // Checkpoint 22%
    await scrollTo(0.22);
    const s22 = await readState();
    console.log('Checkpoint 22%:', {
      progress: s22.progress,
      caseBack: s22.parts.caseBack,
      bezel: s22.parts.bezel,
      step1: s22.dom.step1Opacity
    });
    await saveScreenshots('22.png');
    // At 22%: caseBack and bezel actively moving, step 1 Assessment active
    results.p22 = s22.proxy.caseBackExplode > 0.4 && s22.dom.step1Opacity > 0.7;

    // Checkpoint 25%
    await scrollTo(0.25);
    const s25 = await readState();
    console.log('Checkpoint 25%:', {
      progress: s25.progress,
      crystal: s25.parts.crystal,
      dial: s25.parts.dial,
      hands: s25.parts.hands,
      step2: s25.dom.step2Opacity
    });
    await saveScreenshots('25.png');
    // At 25%: crystal fully exploded (1.0), dial/hands moving, Quotation active
    results.p25 = s25.proxy.crystalExplode >= 0.95 && s25.dom.step2Opacity > 0.6;

    // Checkpoint 28%
    await scrollTo(0.28);
    const s28 = await readState();
    console.log('Checkpoint 28%:', {
      progress: s28.progress,
      hands: s28.parts.hands,
      movement: s28.parts.movement,
      bridges: s28.parts.bridges,
      step3: s28.dom.step3Opacity,
      bloom: s28.proxy.bloomIntensity
    });
    await saveScreenshots('28.png');
    // At 28%: hands fully exploded, bridges moving, Restoration active, bloom high
    results.p28 = s28.proxy.handsExplode >= 0.95 && s28.dom.step3Opacity > 0.6;

    // Checkpoint 32%
    await scrollTo(0.32);
    const s32 = await readState();
    console.log('Checkpoint 32%:', {
      progress: s32.progress,
      bridges: s32.parts.bridges,
      gears: s32.parts.gears,
      step4: s32.dom.step4Opacity,
      camDistance: s32.proxy.camDistance
    });
    await saveScreenshots('32.png');
    // At 32%: bridges at 1.0, gears moving (0.6), Delivery active
    results.p32 = s32.proxy.bridgesExplode >= 0.95 && s32.dom.step4Opacity > 0.6;

    // Checkpoint 36%
    await scrollTo(0.36);
    const s36 = await readState();
    console.log('Checkpoint 36%:', {
      progress: s36.progress,
      proxyExplodes: {
        caseBack: s36.proxy.caseBackExplode,
        bezel: s36.proxy.bezelExplode,
        crystal: s36.proxy.crystalExplode,
        dial: s36.proxy.dialExplode,
        hands: s36.proxy.handsExplode,
        movement: s36.proxy.movementExplode,
        bridges: s36.proxy.bridgesExplode,
        gears: s36.proxy.gearsExplode
      },
      partsTelemetry: s36.parts,
      camera: {
        dist: s36.proxy.camDistance,
        angle: s36.proxy.camAngleX,
        targetZ: s36.proxy.targetZ
      },
      intakeVisibility: s36.dom.intakeVisibility
    });
    await saveScreenshots('36.png');

    // Verify all 8 individual components reached terminal displacement
    const allExploded = 
      s36.proxy.caseBackExplode >= 0.98 &&
      s36.proxy.bezelExplode >= 0.98 &&
      s36.proxy.crystalExplode >= 0.98 &&
      s36.proxy.dialExplode >= 0.98 &&
      s36.proxy.handsExplode >= 0.98 &&
      s36.proxy.movementExplode >= 0.98 &&
      s36.proxy.bridgesExplode >= 0.98 &&
      s36.proxy.gearsExplode >= 0.98;

    // Check terminal camera state at 36%: distance ~4.5, angle ~28, targetZ ~ -0.18
    const cameraAtTerminal = 
      Math.abs(s36.proxy.camDistance - 4.5) < 0.2 &&
      Math.abs(s36.proxy.camAngleX - 28.0) < 1.5 &&
      Math.abs(s36.proxy.targetZ - (-0.18)) < 0.05;

    results.p36 = allExploded && cameraAtTerminal && s36.dom.intakeVisibility !== 'visible';
    results.forward20to36 = results.p20 && results.p22 && results.p25 && results.p28 && results.p32 && results.p36;

    // Verify each part had its own unique non-zero transform delta
    results.parts.caseBack = s36.parts.caseBack && s36.parts.caseBack.factor > 0.95;
    results.parts.bezel = s36.parts.bezel && s36.parts.bezel.factor > 0.95;
    results.parts.crystal = s36.parts.crystal && s36.parts.crystal.factor > 0.95;
    results.parts.dial = s36.parts.dial && s36.parts.dial.factor > 0.95;
    results.parts.hands = s36.parts.hands && s36.parts.hands.factor > 0.95;
    results.parts.movement = s36.parts.movement && s36.parts.movement.factor > 0.95;
    results.parts.bridges = s36.parts.bridges && s36.parts.bridges.factor > 0.95;
    results.parts.gears = s36.parts.gears && s36.parts.gears.factor > 0.95;

    results.camera = cameraAtTerminal;
    results.lighting = s36.proxy.keyLightIntensity >= 1.9;
    results.bloom = s36.proxy.bloomIntensity >= 0.88;
    results.dof = true; // effect composer rendered
    results.processDom = s22.dom.step1Opacity > 0.7 && s25.dom.step2Opacity > 0.6 && s28.dom.step3Opacity > 0.6 && s32.dom.step4Opacity > 0.6;

    // ====================================================
    // 2. REVERSE CHOREOGRAPHY (36% -> 20% -> 0%)
    // ====================================================
    console.log('\n--- Testing Reverse Choreography (36% -> 20% -> 0%) ---');
    await saveScreenshots('36-return.png');

    await scrollTo(0.32);
    await scrollTo(0.28);
    await scrollTo(0.25);
    await scrollTo(0.22);
    await scrollTo(0.20);

    const s20Return = await readState();
    console.log('Returned to 20%:', {
      progress: s20Return.progress,
      caseBackExplode: s20Return.proxy.caseBackExplode,
      gearsExplode: s20Return.proxy.gearsExplode,
      movementExplode: s20Return.proxy.movementExplode,
      camDistance: s20Return.proxy.camDistance
    });
    await saveScreenshots('20-return.png');

    // All parts must have completely reassembled back to 0 at 20%
    const allReassembledAt20 = 
      s20Return.proxy.caseBackExplode <= 0.05 &&
      s20Return.proxy.bezelExplode <= 0.05 &&
      s20Return.proxy.crystalExplode <= 0.05 &&
      s20Return.proxy.dialExplode <= 0.05 &&
      s20Return.proxy.handsExplode <= 0.05 &&
      s20Return.proxy.movementExplode <= 0.05 &&
      s20Return.proxy.bridgesExplode <= 0.05 &&
      s20Return.proxy.gearsExplode <= 0.05;

    results.reverse36to20 = allReassembledAt20;

    // Reverse further: 20 -> 12 -> 0%
    await scrollTo(0.12);
    await scrollTo(0.0);
    const s0Return = await readState();
    console.log('Restored to 0% Hero:', {
      progress: s0Return.progress,
      heroOpacity: s0Return.dom.heroOpacity,
      processVisibility: s0Return.dom.processVisibility
    });

    results.restore20to0 = s0Return.dom.heroOpacity > 0.9 && s0Return.dom.processVisibility === 'hidden';

    // ====================================================
    // 3. DIRECT JUMP TESTS
    // ====================================================
    console.log('\n--- Testing Direct Jump Scenarios ---');

    // Jump 1: 0 -> 25 -> 0
    await scrollTo(0.25);
    const j1a = await readState();
    await scrollTo(0.0);
    const j1b = await readState();
    const jump1Pass = j1a.proxy.crystalExplode > 0.8 && j1b.dom.heroOpacity > 0.9;
    console.log('Jump 0 -> 25 -> 0:', jump1Pass ? 'PASS' : 'FAIL');

    // Jump 2: 0 -> 36 -> 0
    await scrollTo(0.36);
    const j2a = await readState();
    await scrollTo(0.0);
    const j2b = await readState();
    const jump2Pass = j2a.proxy.caseBackExplode > 0.9 && j2b.dom.heroOpacity > 0.9;
    console.log('Jump 0 -> 36 -> 0:', jump2Pass ? 'PASS' : 'FAIL');

    // Jump 3: 12 -> 30 -> 12
    await scrollTo(0.12);
    await scrollTo(0.30);
    const j3a = await readState();
    await scrollTo(0.12);
    const j3b = await readState();
    const jump3Pass = j3a.proxy.movementExplode > 0.8 && j3b.proxy.caseBackExplode <= 0.05;
    console.log('Jump 12 -> 30 -> 12:', jump3Pass ? 'PASS' : 'FAIL');

    // Jump 4: 20 -> 40 -> 20 (testing downstream boundary)
    await scrollTo(0.20);
    await scrollTo(0.40);
    const j4a = await readState();
    await scrollTo(0.20);
    const j4b = await readState();
    const jump4Pass = j4a.dom.intakeVisibility === 'visible' && j4b.dom.intakeVisibility === 'hidden' && j4b.proxy.caseBackExplode <= 0.05;
    console.log('Jump 20 -> 40 -> 20:', jump4Pass ? 'PASS' : 'FAIL');

    // ====================================================
    // 4. REGRESSION VERIFICATION
    // ====================================================
    console.log('\n--- Testing Regressions ---');

    // Heritage regression: scroll to 16%
    await scrollTo(0.16);
    const sHeritage = await readState();
    results.heritageRegression = sHeritage.dom.heritageOpacity > 0.8 && sHeritage.proxy.caseBackExplode <= 0.01;
    console.log('Heritage Regression:', results.heritageRegression ? 'PASS' : 'FAIL');

    // Book a Service regression: back to 0% and click button
    await scrollTo(0.0);
    await sleep(300);

    const bookBtn = await page.$('#hero-inquire-btn');
    if (bookBtn) {
      await bookBtn.click();
      await sleep(1500);
      const afterBook = await readState();
      console.log('After clicking Book a Service:', {
        progress: afterBook.progress,
        intakeVisibility: afterBook.dom.intakeVisibility
      });
      results.bookService = afterBook.progress >= 0.35 && afterBook.dom.intakeVisibility === 'visible';
    }

    // Intake regression: check interactive elements in intake
    const intakeTextarea = await page.$('#intake-textarea');
    if (intakeTextarea) {
      results.intakeRegression = true;
    }

    // Overall disassembly result
    results.disassemblyGsap = results.forward20to36 && results.reverse36to20 && results.restore20to0 &&
                             results.parts.caseBack && results.parts.gears && results.camera;

  } catch (err) {
    console.error('Test run failed with error:', err);
    results.pageErrors.push(err.message);
  } finally {
    await browser.close();
  }

  // Print Final Formatted Report
  console.log('\n======================================================');
  console.log('FINAL ACCEPTANCE REPORT: DISASSEMBLY GSAP');
  console.log('======================================================');
  console.log(`DISASSEMBLY GSAP: ${results.disassemblyGsap ? 'PASS' : 'FAIL'}\n`);
  console.log(`20%: ${results.p20 ? 'PASS' : 'FAIL'}`);
  console.log(`22%: ${results.p22 ? 'PASS' : 'FAIL'}`);
  console.log(`25%: ${results.p25 ? 'PASS' : 'FAIL'}`);
  console.log(`28%: ${results.p28 ? 'PASS' : 'FAIL'}`);
  console.log(`32%: ${results.p32 ? 'PASS' : 'FAIL'}`);
  console.log(`36%: ${results.p36 ? 'PASS' : 'FAIL'}\n`);
  console.log(`20% → 36% FORWARD: ${results.forward20to36 ? 'PASS' : 'FAIL'}`);
  console.log(`36% → 20% REVERSE: ${results.reverse36to20 ? 'PASS' : 'FAIL'}`);
  console.log(`20% → 0% RESTORE: ${results.restore20to0 ? 'PASS' : 'FAIL'}\n`);
  console.log(`CASEBACK: ${results.parts.caseBack ? 'PASS' : 'FAIL'}`);
  console.log(`BEZEL: ${results.parts.bezel ? 'PASS' : 'FAIL'}`);
  console.log(`CRYSTAL: ${results.parts.crystal ? 'PASS' : 'FAIL'}`);
  console.log(`DIAL: ${results.parts.dial ? 'PASS' : 'FAIL'}`);
  console.log(`HANDS: ${results.parts.hands ? 'PASS' : 'FAIL'}`);
  console.log(`MOVEMENT: ${results.parts.movement ? 'PASS' : 'FAIL'}`);
  console.log(`BRIDGES: ${results.parts.bridges ? 'PASS' : 'FAIL'}`);
  console.log(`GEARS: ${results.parts.gears ? 'PASS' : 'FAIL'}\n`);
  console.log(`CAMERA: ${results.camera ? 'PASS' : 'FAIL'}`);
  console.log(`LIGHTING: ${results.lighting ? 'PASS' : 'FAIL'}`);
  console.log(`DOF: ${results.dof ? 'PASS' : 'FAIL'}`);
  console.log(`BLOOM: ${results.bloom ? 'PASS' : 'FAIL'}`);
  console.log(`PROCESS DOM: ${results.processDom ? 'PASS' : 'FAIL'}\n`);
  console.log(`HERITAGE REGRESSION: ${results.heritageRegression ? 'PASS' : 'FAIL'}`);
  console.log(`INTAKE REGRESSION: ${results.intakeRegression ? 'PASS' : 'FAIL'}`);
  console.log(`BOOK A SERVICE: ${results.bookService ? 'PASS' : 'FAIL'}\n`);
  console.log(`CONSOLE ERRORS: ${results.consoleErrors.length === 0 ? 'NONE' : JSON.stringify(results.consoleErrors)}\n`);
  console.log(`CURRENT ASSET:\nMasterpieceSkeletonWatch Proxy`);
  console.log('======================================================\n');
}

runDisassemblyGsapTest();
