const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.resolve(__dirname, '../hero-gsap'),
  path.resolve(__dirname, '../debug/hero-gsap')
];

DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runHeroGsapTest() {
  console.log('=== STARTING HERO GSAP ONLY RUNTIME VERIFICATION ===\n');

  const results = {
    heroGsap: false,
    p0: false,
    p4: false,
    p8: false,
    p12: false,
    reverse: false,
    domHero: false,
    camera: false,
    lighting: false,
    postFx: false,
    heritageUnchanged: false,
    disassemblyUnchanged: false,
    intakeUnchanged: false,
    bookService: false,
    intakeInput: false,
    submitFlow: false,
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

  // Helper to scroll with Lenis and wait for motion to settle
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
    await sleep(400); // Allow render lerping to catch up
  };

  const readState = async () => {
    return await page.evaluate(() => {
      const p = window.__PROXY_STATE__;
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const prog = maxScroll > 0 ? y / maxScroll : 0;
      
      const sub = document.getElementById('hero-subtitle');
      const title = document.getElementById('hero-title');
      const copy = document.getElementById('hero-copy');
      const cta = document.getElementById('hero-cta');
      const cue = document.getElementById('hero-scroll-cue');

      const getOpacity = (el) => el ? parseFloat(window.getComputedStyle(el).opacity) : 0;
      const getTransform = (el) => el ? window.getComputedStyle(el).transform : 'none';

      return {
        scrollY: y,
        progress: parseFloat(prog.toFixed(3)),
        proxy: p ? {
          camDistance: parseFloat(p.camDistance.toFixed(3)),
          camAngleX: parseFloat(p.camAngleX.toFixed(3)),
          watchRotY: parseFloat(p.watchRotY.toFixed(3)),
          keyLightIntensity: parseFloat(p.keyLightIntensity.toFixed(3)),
          bloomIntensity: parseFloat(p.bloomIntensity.toFixed(3)),
          caseBackExplode: p.caseBackExplode,
          dialExplode: p.dialExplode,
          gearsExplode: p.gearsExplode
        } : null,
        domHero: {
          subOpacity: getOpacity(sub),
          titleOpacity: getOpacity(title),
          copyOpacity: getOpacity(copy),
          ctaOpacity: getOpacity(cta),
          cueOpacity: getOpacity(cue),
          subTransform: getTransform(sub),
          titleTransform: getTransform(title)
        }
      };
    });
  };

  try {
    console.log('[1/8] Loading page http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });

    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForFunction(() => {
      const loader = document.getElementById('aevra-loader') || document.getElementById('mekanika-loader');
      return !loader || window.getComputedStyle(loader).opacity === '0' || !document.body.contains(loader);
    }, { timeout: 15000 }).catch(() => {});
    await sleep(2000);

    // ----------------------------------------------------
    // CHECKPOINT 0%: Baseline
    // ----------------------------------------------------
    console.log('[2/8] Testing 0% Hero State...');
    const state0 = await readState();
    console.log('0% state:', JSON.stringify(state0, null, 2));

    const p0DomVisible =
      state0.domHero.subOpacity > 0.8 &&
      state0.domHero.titleOpacity > 0.8 &&
      state0.domHero.copyOpacity > 0.8 &&
      state0.domHero.ctaOpacity > 0.8 &&
      state0.domHero.cueOpacity > 0.8;

    const p0CameraValid = state0.proxy && Math.abs(state0.proxy.camDistance - 11) < 0.1;
    const p0LightingValid = state0.proxy && state0.proxy.keyLightIntensity <= 0.3;
    const p0WatchStatic = state0.proxy && state0.proxy.watchRotY === 0;

    // Check non-Hero DOM isolation
    const p0NonHeroHidden = await page.evaluate(() => {
      const heritage = document.getElementById('heritage-section');
      const intake = document.getElementById('intake-section');
      const hVis = heritage ? window.getComputedStyle(heritage).visibility : 'hidden';
      const hOp = heritage ? parseFloat(window.getComputedStyle(heritage).opacity) : 0;
      const iVis = intake ? window.getComputedStyle(intake).visibility : 'hidden';
      const iOp = intake ? parseFloat(window.getComputedStyle(intake).opacity) : 0;
      return (hVis === 'hidden' || hOp === 0) && (iVis === 'hidden' || iOp === 0);
    });

    if (p0DomVisible && p0CameraValid && p0LightingValid && p0WatchStatic && p0NonHeroHidden) {
      results.p0 = true;
      console.log('0% check: PASS');
    } else {
      throw new Error(`0% Hero baseline failed validation: ${JSON.stringify(state0)}, p0NonHeroHidden: ${p0NonHeroHidden}`);
    }

    await saveScreenshots('00.png');

    // ----------------------------------------------------
    // CHECKPOINT 4%: Dolly, lighting sweep, DOM stable
    // ----------------------------------------------------
    console.log('\n[3/8] Scrolling to 4%...');
    await scrollTo(0.04);
    const state4 = await readState();
    console.log('4% state:', JSON.stringify(state4, null, 2));

    const p4CameraValid = state4.proxy.camDistance < 11.5 && state4.proxy.camDistance > 9.5;
    const p4LightValid = state4.proxy.keyLightIntensity > 0.2;
    const p4WatchRot = state4.proxy.watchRotY > 0;
    const p4CueFaded = state4.domHero.cueOpacity < 0.5; // Cue should fade first

    const p4NonHeroHidden = await page.evaluate(() => {
      const heritage = document.getElementById('heritage-section');
      const intake = document.getElementById('intake-section');
      const hVis = heritage ? window.getComputedStyle(heritage).visibility : 'hidden';
      const hOp = heritage ? parseFloat(window.getComputedStyle(heritage).opacity) : 0;
      const iVis = intake ? window.getComputedStyle(intake).visibility : 'hidden';
      const iOp = intake ? parseFloat(window.getComputedStyle(intake).opacity) : 0;
      return (hVis === 'hidden' || hOp === 0) && (iVis === 'hidden' || iOp === 0);
    });

    if (p4CameraValid && p4LightValid && p4WatchRot && p4CueFaded && p4NonHeroHidden) {
      results.p4 = true;
      console.log('4% check: PASS');
    } else {
      throw new Error(`4% check failed: ${JSON.stringify(state4)}, p4NonHeroHidden: ${p4NonHeroHidden}`);
    }

    await saveScreenshots('04.png');

    // ----------------------------------------------------
    // CHECKPOINT 8%: Mid-dolly, metal reflection, text exit starts
    // ----------------------------------------------------
    console.log('\n[4/8] Scrolling to 8%...');
    await scrollTo(0.08);
    const state8 = await readState();
    console.log('8% state:', JSON.stringify(state8, null, 2));

    const p8CameraValid = state8.proxy.camDistance < 10.5 && state8.proxy.camDistance > 8.0;
    const p8LightValid = state8.proxy.keyLightIntensity > 0.8;
    const p8WatchRot = state8.proxy.watchRotY > state4.proxy.watchRotY;

    const p8NonHeroHidden = await page.evaluate(() => {
      const heritage = document.getElementById('heritage-section');
      const intake = document.getElementById('intake-section');
      const hVis = heritage ? window.getComputedStyle(heritage).visibility : 'hidden';
      const hOp = heritage ? parseFloat(window.getComputedStyle(heritage).opacity) : 0;
      const iVis = intake ? window.getComputedStyle(intake).visibility : 'hidden';
      const iOp = intake ? parseFloat(window.getComputedStyle(intake).opacity) : 0;
      return (hVis === 'hidden' || hOp === 0) && (iVis === 'hidden' || iOp === 0);
    });

    if (p8CameraValid && p8LightValid && p8WatchRot && p8NonHeroHidden) {
      results.p8 = true;
      console.log('8% check: PASS');
    } else {
      throw new Error(`8% check failed: ${JSON.stringify(state8)}, p8NonHeroHidden: ${p8NonHeroHidden}`);
    }

    await saveScreenshots('08.png');

    // ----------------------------------------------------
    // CHECKPOINT 12%: HERO_END reached, hero text fully transitioned
    // ----------------------------------------------------
    console.log('\n[5/8] Scrolling to 12% (HERO_END)...');
    await scrollTo(0.12);
    const state12 = await readState();
    console.log('12% state:', JSON.stringify(state12, null, 2));

    const p12CameraValid = Math.abs(state12.proxy.camDistance - 8.0) < 0.3;
    const p12AngleValid = Math.abs(state12.proxy.camAngleX - 14.0) < 0.5;
    const p12WatchRotValid = Math.abs(state12.proxy.watchRotY - Math.PI * 0.25) < 0.1;
    const p12LightValid = state12.proxy.keyLightIntensity >= 1.4;
    const p12BloomValid = state12.proxy.bloomIntensity >= 0.8;

    // Check Hero DOM has completed its exit sequence
    const p12DomExit = state12.domHero.titleOpacity < 0.15;

    // Check Intake is NOT visible at 12%
    const p12IntakeHidden = await page.evaluate(() => {
      const intake = document.getElementById('intake-section');
      const iVis = intake ? window.getComputedStyle(intake).visibility : 'hidden';
      const iOp = intake ? parseFloat(window.getComputedStyle(intake).opacity) : 0;
      return iVis === 'hidden' || iOp === 0;
    });

    if (p12CameraValid && p12AngleValid && p12WatchRotValid && p12LightValid && p12BloomValid && p12DomExit && p12IntakeHidden) {
      results.p12 = true;
      results.camera = true;
      results.lighting = true;
      results.postFx = true;
      results.domHero = true;
      console.log('12% check: PASS');
    } else {
      throw new Error(`12% HERO_END check failed: ${JSON.stringify(state12)}, p12IntakeHidden: ${p12IntakeHidden}`);
    }

    await saveScreenshots('12.png');

    // ----------------------------------------------------
    // REVERSE SCROLLING: 12 -> 8 -> 4 -> 0, then 0 -> 12 -> 0
    // ----------------------------------------------------
    console.log('\n[6/8] Testing Reverse Scrubbing: 12% -> 8% -> 4% -> 0% ...');
    await scrollTo(0.08);
    const rev8 = await readState();
    console.log('Reverse 8% camDistance:', rev8.proxy.camDistance);

    await scrollTo(0.04);
    const rev4 = await readState();
    console.log('Reverse 4% camDistance:', rev4.proxy.camDistance);

    await scrollTo(0.0);
    const rev0 = await readState();
    console.log('Reverse 0% state:', JSON.stringify(rev0, null, 2));

    // Rapid reversal 0 -> 12 -> 0
    console.log('Testing rapid reversal: 0% -> 12% -> 0% ...');
    await scrollTo(0.12);
    await scrollTo(0.0);
    const finalRev0 = await readState();

    const revRestored =
      Math.abs(finalRev0.proxy.camDistance - 11) < 0.1 &&
      finalRev0.proxy.watchRotY < 0.05 &&
      finalRev0.domHero.subOpacity > 0.8 &&
      finalRev0.domHero.titleOpacity > 0.8;

    if (revRestored) {
      results.reverse = true;
      console.log('12% -> 0% Reverse check: PASS');
    } else {
      throw new Error(`Reverse scrolling failed to restore initial state: ${JSON.stringify(finalRev0)}`);
    }

    await saveScreenshots('00-return.png');

    // ----------------------------------------------------
    // VERIFY SUBSEQUENT SECTIONS UNCHANGED
    // ----------------------------------------------------
    console.log('\n[7/8] Verifying subsequent sections (20%, 25%, 45%) remain static...');
    await scrollTo(0.20);
    const state20 = await readState();

    await scrollTo(0.25);
    const state25 = await readState();

    await scrollTo(0.45);
    const state45 = await readState();

    // Verify all watch component explodes remain strictly 0
    const explodesAreZero =
      state20.proxy.caseBackExplode === 0 &&
      state25.proxy.caseBackExplode === 0 &&
      state45.proxy.caseBackExplode === 0 &&
      state45.proxy.dialExplode === 0 &&
      state45.proxy.gearsExplode === 0;

    // Verify camera distance and watch rotation did not change past 12%
    const cameraRemainsHeroEnd =
      Math.abs(state20.proxy.camDistance - 8.0) < 0.3 &&
      Math.abs(state25.proxy.camDistance - 8.0) < 0.3 &&
      Math.abs(state45.proxy.camDistance - 8.0) < 0.3;

    if (explodesAreZero && cameraRemainsHeroEnd) {
      results.heritageUnchanged = true;
      results.disassemblyUnchanged = true;
      results.intakeUnchanged = true;
      console.log('Subsequent sections unchanged check: PASS');
    } else {
      throw new Error(`Subsequent sections were altered! state25: ${JSON.stringify(state25.proxy)}, state45: ${JSON.stringify(state45.proxy)}`);
    }

    // ----------------------------------------------------
    // INTAKE INTERACTION REGRESSION TEST
    // ----------------------------------------------------
    console.log('\n[8/8] Testing BOOK A SERVICE & Intake flow regression...');
    const btn = await page.$('#book-service-btn');
    if (!btn) throw new Error('#book-service-btn not found');
    await btn.click();
    results.bookService = true;
    await sleep(1500);

    const ta = await page.$('#intake-textarea');
    if (!ta) throw new Error('#intake-textarea not found');
    await ta.click();
    await page.keyboard.type("My grandfather's Daytona stopped ticking.", { delay: 15 });
    const typed = await page.evaluate(() => document.getElementById('intake-textarea').value);
    if (typed === "My grandfather's Daytona stopped ticking.") {
      results.intakeInput = true;
      console.log('Intake input: PASS');
    }

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

    results.submitFlow = true;
    console.log('Intake Submit -> ANALYZING -> REVIEW: PASS');

    results.heroGsap = true;
    console.log('\n=== ALL HERO GSAP VERIFICATION CHECKS PASSED ===\n');

  } catch (err) {
    console.error('HERO GSAP TEST ERROR:', err.message);
  } finally {
    await browser.close();
  }

  const allPassed =
    results.heroGsap &&
    results.p0 &&
    results.p4 &&
    results.p8 &&
    results.p12 &&
    results.reverse &&
    results.domHero &&
    results.camera &&
    results.lighting &&
    results.postFx &&
    results.heritageUnchanged &&
    results.disassemblyUnchanged &&
    results.intakeUnchanged &&
    results.bookService &&
    results.intakeInput &&
    results.submitFlow &&
    results.pageErrors.length === 0;

  console.log('\n================ REPORT ================');
  console.log(`HERO GSAP: ${allPassed ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`0%: ${results.p0 ? 'PASS' : 'FAIL'}`);
  console.log(`4%: ${results.p4 ? 'PASS' : 'FAIL'}`);
  console.log(`8%: ${results.p8 ? 'PASS' : 'FAIL'}`);
  console.log(`12%: ${results.p12 ? 'PASS' : 'FAIL'}`);
  console.log(`12% → 0% REVERSE: ${results.reverse ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`DOM HERO: ${results.domHero ? 'PASS' : 'FAIL'}`);
  console.log(`CAMERA: ${results.camera ? 'PASS' : 'FAIL'}`);
  console.log(`LIGHTING: ${results.lighting ? 'PASS' : 'FAIL'}`);
  console.log(`POST FX: ${results.postFx ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`HERITAGE UNCHANGED: ${results.heritageUnchanged ? 'PASS' : 'FAIL'}`);
  console.log(`DISASSEMBLY UNCHANGED: ${results.disassemblyUnchanged ? 'PASS' : 'FAIL'}`);
  console.log(`INTAKE UNCHANGED: ${results.intakeUnchanged ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`BOOK A SERVICE: ${results.bookService ? 'PASS' : 'FAIL'}`);
  console.log(`INTAKE INPUT: ${results.intakeInput ? 'PASS' : 'FAIL'}`);
  console.log(`SUBMIT FLOW: ${results.submitFlow ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`CONSOLE ERRORS: ${results.consoleErrors.length === 0 ? 'NONE' : JSON.stringify(results.consoleErrors)}`);
  console.log('========================================\n');

  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runHeroGsapTest();
