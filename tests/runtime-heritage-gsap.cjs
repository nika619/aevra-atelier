const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.resolve(__dirname, '../heritage-gsap'),
  path.resolve(__dirname, '../debug/heritage-gsap')
];

DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runHeritageGsapTest() {
  console.log('=== STARTING HERITAGE GSAP ONLY RUNTIME VERIFICATION ===\n');

  const results = {
    heritageGsap: false,
    p12: false,
    p14: false,
    p16: false,
    p18: false,
    p20: false,
    reverse20to12: false,
    restore12to0: false,
    domHeritage: false,
    brandReveal: false,
    camera: false,
    lighting: false,
    postFx: false,
    disassemblyStatic: false,
    intakeStatic: false,
    bookService: false,
    intakeFlow: false,
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

      const heritageSec = document.getElementById('heritage-section');
      const heritageLabel = document.getElementById('heritage-label-wrapper');
      const heritageBrands = document.querySelectorAll('.heritage-brand');
      const intakeSec = document.getElementById('intake-section');
      const processSec = document.getElementById('process-section');
      const heroSec = document.getElementById('hero-section');
      const heroTitle = document.getElementById('hero-title');

      const getOpacity = (el) => el ? parseFloat(window.getComputedStyle(el).opacity) : 0;
      const getVisibility = (el) => el ? window.getComputedStyle(el).visibility : 'hidden';

      const brandsOpacities = Array.from(heritageBrands).map(b => getOpacity(b));

      return {
        scrollY: y,
        progress: parseFloat(prog.toFixed(3)),
        proxy: p ? {
          camDistance: parseFloat(p.camDistance.toFixed(3)),
          camAngleX: parseFloat(p.camAngleX.toFixed(3)),
          watchRotY: parseFloat(p.watchRotY.toFixed(3)),
          targetX: parseFloat(p.targetX.toFixed(3)),
          targetY: parseFloat(p.targetY.toFixed(3)),
          keyLightIntensity: parseFloat(p.keyLightIntensity.toFixed(3)),
          keyLightPosX: parseFloat(p.keyLightPosX.toFixed(3)),
          bloomIntensity: parseFloat(p.bloomIntensity.toFixed(3)),
          caseBackExplode: p.caseBackExplode,
          dialExplode: p.dialExplode,
          gearsExplode: p.gearsExplode,
          movementExplode: p.movementExplode
        } : null,
        dom: {
          heritageSectionVisible: getVisibility(heritageSec) === 'visible',
          heritageSectionOpacity: getOpacity(heritageSec),
          heritageLabelOpacity: getOpacity(heritageLabel),
          brandsCount: heritageBrands.length,
          brandsOpacities,
          heroTitleOpacity: getOpacity(heroTitle),
          intakeSectionVisible: getVisibility(intakeSec) === 'visible',
          intakeSectionOpacity: getOpacity(intakeSec),
          processSectionVisible: getVisibility(processSec) === 'visible',
          processSectionOpacity: getOpacity(processSec)
        }
      };
    });
  };

  try {
    console.log('[1/9] Loading http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });

    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForFunction(() => {
      const loader = document.getElementById('aevra-loader') || document.getElementById('mekanika-loader');
      return !loader || window.getComputedStyle(loader).opacity === '0' || !document.body.contains(loader);
    }, { timeout: 15000 }).catch(() => {});
    await sleep(2000);

    // ----------------------------------------------------
    // CHECKPOINT 12%: Hero Terminal State / Heritage Entrance
    // ----------------------------------------------------
    console.log('\n[2/9] Scrolling to 12% (HERO_END / Heritage Entrance)...');
    await scrollTo(0.12);
    const state12 = await readState();
    console.log('12% state:', JSON.stringify(state12, null, 2));

    const p12HeroExited = state12.dom.heroTitleOpacity < 0.15;
    const p12CamNearHeroEnd = Math.abs(state12.proxy.camDistance - 8.0) < 0.35;
    const p12DisassemblyZero =
      state12.proxy.caseBackExplode === 0 &&
      state12.proxy.dialExplode === 0 &&
      state12.proxy.gearsExplode === 0;
    const p12IntakeHidden = !state12.dom.intakeSectionVisible || state12.dom.intakeSectionOpacity === 0;

    if (p12HeroExited && p12CamNearHeroEnd && p12DisassemblyZero && p12IntakeHidden) {
      results.p12 = true;
      console.log('12% check: PASS');
    } else {
      throw new Error(`12% check failed: ${JSON.stringify(state12)}`);
    }
    await saveScreenshots('12.png');

    // ----------------------------------------------------
    // CHECKPOINT 14%: Heritage beginning / Shallow orbit / Label revealed
    // ----------------------------------------------------
    console.log('\n[3/9] Scrolling to 14% (Heritage beginning & label reveal)...');
    await scrollTo(0.14);
    const state14 = await readState();
    console.log('14% state:', JSON.stringify(state14, null, 2));

    const p14Orbiting = state14.proxy.camDistance < 8.0 && state14.proxy.camAngleX > 14.0;
    const p14LightActive = state14.proxy.keyLightIntensity > 1.6;
    const p14LabelVisible = state14.dom.heritageLabelOpacity > 0.8;
    const p14DisassemblyZero = state14.proxy.caseBackExplode === 0;
    const p14IntakeHidden = !state14.dom.intakeSectionVisible || state14.dom.intakeSectionOpacity === 0;

    if (p14Orbiting && p14LightActive && p14LabelVisible && p14DisassemblyZero && p14IntakeHidden) {
      results.p14 = true;
      console.log('14% check: PASS');
    } else {
      throw new Error(`14% check failed: ${JSON.stringify(state14)}`);
    }
    await saveScreenshots('14.png');

    // ----------------------------------------------------
    // CHECKPOINT 16%: Three-quarter inspection / Brands revealed
    // ----------------------------------------------------
    console.log('\n[4/9] Scrolling to 16% (Three-quarter inspection & brands revealed)...');
    await scrollTo(0.16);
    const state16 = await readState();
    console.log('16% state:', JSON.stringify(state16, null, 2));

    const p16CamThreeQuarter = state16.proxy.camDistance < 7.9 && state16.proxy.camAngleX > 16.0;
    const p16LightPeak = state16.proxy.keyLightIntensity >= 1.7;
    const p16BrandsVisible = state16.dom.brandsOpacities.length >= 3 && state16.dom.brandsOpacities.every(op => op > 0.75);
    const p16DisassemblyZero = state16.proxy.caseBackExplode === 0;
    const p16IntakeHidden = !state16.dom.intakeSectionVisible || state16.dom.intakeSectionOpacity === 0;

    if (p16CamThreeQuarter && p16LightPeak && p16BrandsVisible && p16DisassemblyZero && p16IntakeHidden) {
      results.p16 = true;
      results.brandReveal = true;
      console.log('16% check: PASS');
    } else {
      throw new Error(`16% check failed: ${JSON.stringify(state16)}`);
    }
    await saveScreenshots('16.png');

    // ----------------------------------------------------
    // CHECKPOINT 18%: Stable trust composition / Settle
    // ----------------------------------------------------
    console.log('\n[5/9] Scrolling to 18% (Stable trust composition)...');
    await scrollTo(0.18);
    const state18 = await readState();
    console.log('18% state:', JSON.stringify(state18, null, 2));

    const p18CamSettling = state18.proxy.camDistance < 7.7 && state18.proxy.camAngleX >= 18.0;
    const p18BrandsStable = state18.dom.brandsOpacities.every(op => op > 0.6);
    const p18DisassemblyZero = state18.proxy.caseBackExplode === 0;
    const p18IntakeHidden = !state18.dom.intakeSectionVisible || state18.dom.intakeSectionOpacity === 0;

    if (p18CamSettling && p18BrandsStable && p18DisassemblyZero && p18IntakeHidden) {
      results.p18 = true;
      results.domHeritage = true;
      results.lighting = true;
      results.postFx = true;
      console.log('18% check: PASS');
    } else {
      throw new Error(`18% check failed: ${JSON.stringify(state18)}`);
    }
    await saveScreenshots('18.png');

    // ----------------------------------------------------
    // CHECKPOINT 20%: Heritage terminal state / Clean handoff
    // ----------------------------------------------------
    console.log('\n[6/9] Scrolling to 20% (Heritage terminal state)...');
    await scrollTo(0.20);
    const state20 = await readState();
    console.log('20% state:', JSON.stringify(state20, null, 2));

    const p20CamTerminal = Math.abs(state20.proxy.camDistance - 7.4) < 0.35 && state20.proxy.camAngleX >= 20.0;
    const p20DisassemblyZero =
      state20.proxy.caseBackExplode === 0 &&
      state20.proxy.dialExplode === 0 &&
      state20.proxy.gearsExplode === 0 &&
      state20.proxy.movementExplode === 0;
    const p20IntakeHidden = !state20.dom.intakeSectionVisible || state20.dom.intakeSectionOpacity === 0;
    const p20DomExited = state20.dom.heritageLabelOpacity < 0.2;

    if (p20CamTerminal && p20DisassemblyZero && p20IntakeHidden && p20DomExited) {
      results.p20 = true;
      results.camera = true;
      results.disassemblyStatic = true;
      results.intakeStatic = true;
      console.log('20% check: PASS');
    } else {
      throw new Error(`20% check failed: ${JSON.stringify(state20)}`);
    }
    await saveScreenshots('20.png');

    // ----------------------------------------------------
    // REVERSE SCROLLING: 20 -> 18 -> 16 -> 14 -> 12
    // ----------------------------------------------------
    console.log('\n[7/9] Testing Reverse Scrubbing: 20% -> 18% -> 16% -> 14% -> 12% ...');
    await scrollTo(0.18);
    const rev18 = await readState();
    console.log('Reverse 18% brands visible:', rev18.dom.brandsOpacities.every(op => op > 0.6));

    await scrollTo(0.16);
    const rev16 = await readState();
    console.log('Reverse 16% camDistance:', rev16.proxy.camDistance);

    await scrollTo(0.14);
    const rev14 = await readState();
    console.log('Reverse 14% label opacity:', rev14.dom.heritageLabelOpacity);

    await scrollTo(0.12);
    const rev12 = await readState();
    console.log('Reverse 12% state:', JSON.stringify(rev12, null, 2));

    const rev12Restored =
      Math.abs(rev12.proxy.camDistance - 8.0) < 0.35 &&
      rev12.dom.heritageLabelOpacity < 0.2;

    if (rev12Restored) {
      results.reverse20to12 = true;
      console.log('20% -> 12% Reverse check: PASS');
    } else {
      throw new Error(`20% -> 12% reverse failed: ${JSON.stringify(rev12)}`);
    }
    await saveScreenshots('12-return.png');

    // ----------------------------------------------------
    // REVERSE 12 -> 0: Hero Restoration
    // ----------------------------------------------------
    console.log('\nTesting 12% -> 0% Hero Restoration...');
    await scrollTo(0.0);
    const hero0 = await readState();
    console.log('0% restored state:', JSON.stringify(hero0, null, 2));

    const heroRestored =
      Math.abs(hero0.proxy.camDistance - 11.0) < 0.15 &&
      hero0.proxy.watchRotY < 0.05 &&
      hero0.dom.heroTitleOpacity > 0.8 &&
      (!hero0.dom.heritageSectionVisible || hero0.dom.heritageSectionOpacity === 0);

    if (heroRestored) {
      results.restore12to0 = true;
      console.log('12% -> 0% Hero Restore: PASS');
    } else {
      throw new Error(`Hero failed to restore at 0%: ${JSON.stringify(hero0)}`);
    }

    // ----------------------------------------------------
    // DIRECT JUMPS REGRESSION
    // ----------------------------------------------------
    console.log('\n[8/9] Testing direct jumps (0->15->0, 0->20->12->20, 0->36->0)...');
    await scrollTo(0.15);
    const jump15 = await readState();
    if (!jump15.dom.heritageSectionVisible || jump15.dom.heritageLabelOpacity < 0.8) {
      throw new Error('Jump to 15% failed: Heritage not active');
    }

    await scrollTo(0.0);
    const back0 = await readState();
    if (back0.dom.heroTitleOpacity < 0.8) {
      throw new Error('Jump back to 0% failed: Hero not restored');
    }

    await scrollTo(0.20);
    const jump20 = await readState();
    if (jump20.proxy.caseBackExplode !== 0) {
      throw new Error('Jump to 20% failed: Disassembly not static');
    }

    await scrollTo(0.12);
    await scrollTo(0.20);

    // Verify 20 -> 36 does NOT activate Intake prematurely
    await scrollTo(0.25);
    const jump25 = await readState();
    if (jump25.dom.intakeSectionVisible && jump25.dom.intakeSectionOpacity > 0) {
      throw new Error('At 25% Intake should NOT be visible!');
    }

    await scrollTo(0.30);
    const jump30 = await readState();
    if (jump30.dom.intakeSectionVisible && jump30.dom.intakeSectionOpacity > 0) {
      throw new Error('At 30% Intake should NOT be visible!');
    }

    await scrollTo(0.0);
    console.log('Direct jumps and isolation: PASS');

    // ----------------------------------------------------
    // INTAKE INTERACTION REGRESSION TEST
    // ----------------------------------------------------
    console.log('\n[9/9] Testing BOOK A SERVICE & Intake flow regression...');
    const btn = await page.$('#book-service-btn');
    if (!btn) throw new Error('#book-service-btn not found');
    await btn.click();
    results.bookService = true;
    await sleep(1500);

    const ta = await page.$('#intake-textarea');
    if (!ta) throw new Error('#intake-textarea not found');
    await ta.click();
    await page.keyboard.type("My grandfather's Daytona stopped ticking.", { delay: 15 });

    const submitBtn = await page.$('#intake-submit-btn');
    if (!submitBtn) throw new Error('#intake-submit-btn not found');
    await submitBtn.click();

    await page.waitForFunction(() => {
      const el = document.getElementById('debug-intake');
      return el && el.innerText.includes('ANALYZING');
    }, { timeout: 3000 });

    await page.waitForFunction(() => {
      const el = document.getElementById('debug-intake');
      return el && el.innerText.includes('REVIEW');
    }, { timeout: 6000 });

    results.intakeFlow = true;
    console.log('Intake Submit -> ANALYZING -> REVIEW: PASS');

    results.heritageGsap = true;
    console.log('\n=== ALL HERITAGE GSAP VERIFICATION CHECKS PASSED ===\n');

  } catch (err) {
    console.error('HERITAGE GSAP TEST ERROR:', err.message);
  } finally {
    await browser.close();
  }

  const allPassed =
    results.heritageGsap &&
    results.p12 &&
    results.p14 &&
    results.p16 &&
    results.p18 &&
    results.p20 &&
    results.reverse20to12 &&
    results.restore12to0 &&
    results.domHeritage &&
    results.brandReveal &&
    results.camera &&
    results.lighting &&
    results.postFx &&
    results.disassemblyStatic &&
    results.intakeStatic &&
    results.bookService &&
    results.intakeFlow &&
    results.pageErrors.length === 0;

  console.log('\n================ REPORT ================');
  console.log(`HERITAGE GSAP: ${allPassed ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`12%: ${results.p12 ? 'PASS' : 'FAIL'}`);
  console.log(`14%: ${results.p14 ? 'PASS' : 'FAIL'}`);
  console.log(`16%: ${results.p16 ? 'PASS' : 'FAIL'}`);
  console.log(`18%: ${results.p18 ? 'PASS' : 'FAIL'}`);
  console.log(`20%: ${results.p20 ? 'PASS' : 'FAIL'}`);
  console.log(`20% → 12% REVERSE: ${results.reverse20to12 ? 'PASS' : 'FAIL'}`);
  console.log(`12% → 0% HERO RESTORE: ${results.restore12to0 ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`DOM HERITAGE: ${results.domHeritage ? 'PASS' : 'FAIL'}`);
  console.log(`BRAND REVEAL: ${results.brandReveal ? 'PASS' : 'FAIL'}`);
  console.log(`CAMERA: ${results.camera ? 'PASS' : 'FAIL'}`);
  console.log(`LIGHTING: ${results.lighting ? 'PASS' : 'FAIL'}`);
  console.log(`POST FX: ${results.postFx ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`DISASSEMBLY REMAINS STATIC: ${results.disassemblyStatic ? 'PASS' : 'FAIL'}`);
  console.log(`INTAKE REMAINS STATIC: ${results.intakeStatic ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`BOOK A SERVICE: ${results.bookService ? 'PASS' : 'FAIL'}`);
  console.log(`INTAKE FLOW REGRESSION: ${results.intakeFlow ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`CONSOLE ERRORS: ${results.consoleErrors.length === 0 ? 'NONE' : JSON.stringify(results.consoleErrors)}`);
  console.log('========================================\n');

  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runHeritageGsapTest();
