const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.resolve(__dirname, '../debug/runtime');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log('=== STARTING DETERMINISTIC LENIS RUNTIME TEST ===\n');

  const results = {
    canvasFullscreen: false,
    lenisScroll: false,
    sectionReachability: false,
    bookService: false,
    pointerOwnership: false,
    inputFocus: false,
    typing: false,
    submit: false,
    stateTransition: false,
    reverseScroll: false,
    consoleErrors: [],
    pageErrors: [],
    measurements: {}
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
      // Filter out non-fatal dev / framework noise
      if (!text.includes('deprecated') && !text.includes('favicon')) {
        results.consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    results.pageErrors.push(err.message);
  });

  try {
    console.log('[1/10] Navigating to http://localhost:5173/?debug=1 ...');
    await page.goto('http://localhost:5173/?debug=1', { waitUntil: 'networkidle0', timeout: 30000 });

    console.log('[2/10] Waiting for 3D canvas and loader to settle...');
    await page.waitForSelector('canvas', { timeout: 15000 });

    // Wait until AevraLoader is unmounted / hidden
    await page.waitForFunction(() => {
      const loader = document.getElementById('aevra-loader') || document.getElementById('mekanika-loader');
      return !loader || window.getComputedStyle(loader).opacity === '0' || !document.body.contains(loader);
    }, { timeout: 15000 }).catch(() => {});
    await sleep(2000); // Allow render pipeline to stabilize

    // 1. Verify Canvas dimensions and pointer-events
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      const parentStyle = window.getComputedStyle(canvas.parentElement);
      return {
        width: rect.width,
        height: rect.height,
        canvasPointerEvents: style.pointerEvents,
        parentPointerEvents: parentStyle.pointerEvents,
        vw: window.innerWidth,
        vh: window.innerHeight
      };
    });

    console.log('Canvas metrics:', canvasInfo);
    if (
      canvasInfo &&
      canvasInfo.width >= canvasInfo.vw &&
      canvasInfo.height >= canvasInfo.vh &&
      canvasInfo.canvasPointerEvents === 'none'
    ) {
      results.canvasFullscreen = true;
    } else {
      throw new Error(`Canvas fullscreen check failed: ${JSON.stringify(canvasInfo)}`);
    }

    // Helper to read debug values directly from DebugPanel DOM & window state
    const readDebug = async () => {
      return await page.evaluate(() => {
        const scrollyEl = document.getElementById('debug-scrolly');
        const progressEl = document.getElementById('debug-progress');
        const sectionEl = document.getElementById('debug-section');
        const intakeEl = document.getElementById('debug-intake');
        const webglEl = document.getElementById('debug-webgl');
        const y = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const prog = maxScroll > 0 ? y / maxScroll : 0;
        const debugObj = window.__DEBUG__ || {};
        return {
          scrollY: y,
          progress: parseFloat(prog.toFixed(3)),
          progressText: progressEl ? progressEl.innerText.replace('Lenis Progress: ', '') : `${(prog * 100).toFixed(1)}%`,
          sectionText: sectionEl ? sectionEl.innerText.replace('Active Section: ', '') : (debugObj.section || ''),
          intakeState: intakeEl ? intakeEl.innerText.replace('Intake State: ', '') : (debugObj.intakeState || ''),
          webglState: webglEl ? webglEl.innerText.replace('WebGL Proxy State: ', '') : (debugObj.focusTarget || ''),
          maxScroll
        };
      });
    };

    // Helper to scroll smoothly using Lenis and wait for motion to settle
    const scrollToProgress = async (targetProgress) => {
      await page.evaluate((target) => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const targetY = maxScroll * target;
        if (window.__lenis) {
          window.__lenis.scrollTo(targetY, { duration: 1.0, immediate: false });
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }, targetProgress);

      const startTime = Date.now();
      while (Date.now() - startTime < 4000) {
        await sleep(100);
        const diff = await page.evaluate((target) => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const prog = maxScroll > 0 ? window.scrollY / maxScroll : 0;
          return Math.abs(prog - target);
        }, targetProgress);
        if (diff < 0.02) break;
      }
      await sleep(500); // Settle
      return await readDebug();
    };

    // 0% Hero
    console.log('[3/10] Verifying 0% Hero baseline...');
    const state0 = await readDebug();
    results.measurements['0%'] = state0;
    console.log('0% state:', state0);
    const p0Path = path.join(SCREENSHOT_DIR, '00-hero.png');
    await page.screenshot({ path: p0Path, fullPage: false });
    console.log('Saved:', p0Path);

    // Test mouse wheel event interaction
    console.log('Testing mouse wheel interaction...');
    const preWheelY = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel({ deltaY: 300 });
    await sleep(800);
    const postWheelY = await page.evaluate(() => window.scrollY);
    console.log(`Wheel test: before=${preWheelY}px, after=${postWheelY}px`);
    if (postWheelY > preWheelY) {
      results.lenisScroll = true;
    } else {
      throw new Error('Wheel event did not change scrollY');
    }

    // Scroll to 25% (Heritage / Process range)
    console.log('[4/10] Scrolling to 25% (Heritage/Process range)...');
    const state25 = await scrollToProgress(0.25);
    results.measurements['25%'] = state25;
    console.log('25% state:', state25);
    const p25Path = path.join(SCREENSHOT_DIR, '25-process.png');
    await page.screenshot({ path: p25Path, fullPage: false });
    console.log('Saved:', p25Path);

    // Scroll to 45% (Intake range)
    console.log('[5/10] Scrolling to 45% (Intake range)...');
    const state45 = await scrollToProgress(0.45);
    results.measurements['45%'] = state45;
    console.log('45% state:', state45);
    const p45Path = path.join(SCREENSHOT_DIR, '45-intake.png');
    await page.screenshot({ path: p45Path, fullPage: false });
    console.log('Saved:', p45Path);

    // Scroll to 70% (Expertise / Analysis range)
    console.log('[6/10] Scrolling to 70% (Expertise/Analysis range)...');
    const state70 = await scrollToProgress(0.70);
    results.measurements['70%'] = state70;
    console.log('70% state:', state70);
    const p70Path = path.join(SCREENSHOT_DIR, '70-expertise.png');
    await page.screenshot({ path: p70Path, fullPage: false });
    console.log('Saved:', p70Path);

    // Scroll to 100% (Final CTA range)
    console.log('[7/10] Scrolling to 100% (Final range)...');
    const state100 = await scrollToProgress(1.0);
    results.measurements['100%'] = state100;
    console.log('100% state:', state100);
    const p100Path = path.join(SCREENSHOT_DIR, '100-final.png');
    await page.screenshot({ path: p100Path, fullPage: false });
    console.log('Saved:', p100Path);

    // Verify sections reached at each checkpoint
    const reachesProcess = state25.sectionText.includes('DISASSEMBLY') || state25.sectionText.includes('HERITAGE');
    const reachesIntake = state45.sectionText.includes('INTAKE');
    const reachesExpertise = state70.sectionText.includes('EXPERTISE') || state70.sectionText.includes('ANALYSIS');
    const reachesFinal = state100.sectionText.includes('FINAL');

    if (reachesProcess && reachesIntake && reachesExpertise && reachesFinal) {
      results.sectionReachability = true;
    } else {
      throw new Error(`Section reachability failure: 25%=${state25.sectionText}, 45%=${state45.sectionText}, 70%=${state70.sectionText}, 100%=${state100.sectionText}`);
    }

    // Return to 45% to test Intake & BOOK A SERVICE
    console.log('[8/10] Returning to 45% to test Intake interaction...');
    await scrollToProgress(0.45);
    await sleep(500);

    // Test BOOK A SERVICE button & Pointer Ownership
    console.log('Verifying BOOK A SERVICE button pointer ownership...');
    const btnHandle = await page.$('#book-service-btn');
    if (!btnHandle) throw new Error('#book-service-btn not found');

    const btnBox = await btnHandle.boundingBox();
    if (!btnBox) throw new Error('#book-service-btn has no bounding box');

    const topElAtBtn = await page.evaluate((x, y) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.tagName + '#' + el.id : null;
    }, btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);

    console.log(`Element at BOOK A SERVICE button: ${topElAtBtn}`);
    if (topElAtBtn && topElAtBtn.includes('CANVAS')) {
      throw new Error('Canvas intercepted pointer over BOOK A SERVICE button!');
    }

    // Click BOOK A SERVICE using mouse
    await page.mouse.click(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);
    results.bookService = true;
    await sleep(1500); // Allow Lenis scroll to settle at Intake section

    // Verify Textarea pointer ownership & focus
    console.log('Verifying Textarea pointer ownership...');
    const textareaHandle = await page.$('#intake-textarea');
    if (!textareaHandle) throw new Error('#intake-textarea not found');

    const taBox = await textareaHandle.boundingBox();
    if (!taBox) throw new Error('#intake-textarea has no bounding box');

    const topElAtTa = await page.evaluate((x, y) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.tagName + '#' + el.id : null;
    }, taBox.x + taBox.width / 2, taBox.y + taBox.height / 2);

    console.log(`Element at Textarea: ${topElAtTa}`);
    if (topElAtTa && topElAtTa.includes('CANVAS')) {
      throw new Error('Canvas intercepted pointer over Textarea!');
    }

    // Focus textarea by clicking it
    await page.mouse.click(taBox.x + taBox.width / 2, taBox.y + 30);
    const isFocused = await page.evaluate(() => document.activeElement === document.getElementById('intake-textarea'));
    if (isFocused) {
      results.inputFocus = true;
    } else {
      throw new Error('Textarea failed to receive focus after click');
    }

    // Type text into textarea
    const inputText = "My grandfather's Daytona stopped ticking.";
    console.log(`Typing: "${inputText}"...`);
    await page.keyboard.type(inputText, { delay: 20 });
    const typedVal = await page.evaluate(() => document.getElementById('intake-textarea').value);
    if (typedVal === inputText) {
      results.typing = true;
    } else {
      throw new Error(`Textarea value mismatch: "${typedVal}" vs "${inputText}"`);
    }

    // Verify Submit button pointer ownership & clickability
    console.log('Verifying Submit button pointer ownership...');
    const submitBtnHandle = await page.$('#intake-submit-btn');
    if (!submitBtnHandle) throw new Error('#intake-submit-btn not found');

    const submitBox = await submitBtnHandle.boundingBox();
    if (!submitBox) throw new Error('#intake-submit-btn has no bounding box');

    const topElAtSubmit = await page.evaluate((x, y) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.tagName + '#' + el.id : null;
    }, submitBox.x + submitBox.width / 2, submitBox.y + submitBox.height / 2);

    console.log(`Element at Submit button: ${topElAtSubmit}`);
    if (topElAtSubmit && topElAtSubmit.includes('CANVAS')) {
      throw new Error('Canvas intercepted pointer over Submit button!');
    }

    results.pointerOwnership = true;

    // Click submit button
    console.log('Clicking Submit button...');
    await page.mouse.click(submitBox.x + submitBox.width / 2, submitBox.y + submitBox.height / 2);
    results.submit = true;

    // Verify DESCRIBE -> ANALYZING transition
    console.log('Waiting for ANALYZING state...');
    await page.waitForFunction(() => {
      const el = document.getElementById('debug-intake');
      return el && el.innerText.includes('ANALYZING');
    }, { timeout: 3000 });
    console.log('State: ANALYZING confirmed');

    // Verify ANALYZING -> REVIEW transition
    console.log('Waiting for REVIEW state...');
    await page.waitForFunction(() => {
      const el = document.getElementById('debug-intake');
      return el && el.innerText.includes('REVIEW');
    }, { timeout: 6000 });
    console.log('State: REVIEW confirmed');
    results.stateTransition = true;

    await sleep(600);
    const reviewPath = path.join(SCREENSHOT_DIR, 'intake-review.png');
    await page.screenshot({ path: reviewPath, fullPage: false });
    console.log('Saved:', reviewPath);

    // Reverse scroll to 0%
    console.log('[9/10] Performing Reverse Scroll to 0% ...');
    const stateReturn = await scrollToProgress(0.0);
    results.measurements['RETURN'] = stateReturn;
    console.log('Return state:', stateReturn);
    if (stateReturn.progress <= 0.02 && stateReturn.scrollY <= 50) {
      results.reverseScroll = true;
    } else {
      throw new Error(`Reverse scroll failed: progress=${stateReturn.progress}, scrollY=${stateReturn.scrollY}`);
    }

    const returnPath = path.join(SCREENSHOT_DIR, '00-return.png');
    await page.screenshot({ path: returnPath, fullPage: false });
    console.log('Saved:', returnPath);

    console.log('\n[10/10] All test sequences completed successfully.');
  } catch (err) {
    console.error('TEST ERROR:', err.message);
    results.error = err.message;
  } finally {
    await browser.close();
  }

  // Print Summary
  console.log('\n================ TEST RESULTS ================');
  console.log(`CANVAS FULLSCREEN: ${results.canvasFullscreen ? 'PASS' : 'FAIL'}`);
  console.log(`LENIS SCROLL: ${results.lenisScroll ? 'PASS' : 'FAIL'}`);
  console.log(`SECTION REACHABILITY: ${results.sectionReachability ? 'PASS' : 'FAIL'}`);
  console.log(`BOOK A SERVICE: ${results.bookService ? 'PASS' : 'FAIL'}`);
  console.log(`POINTER OWNERSHIP: ${results.pointerOwnership ? 'PASS' : 'FAIL'}`);
  console.log(`INPUT FOCUS: ${results.inputFocus ? 'PASS' : 'FAIL'}`);
  console.log(`TYPING: ${results.typing ? 'PASS' : 'FAIL'}`);
  console.log(`SUBMIT: ${results.submit ? 'PASS' : 'FAIL'}`);
  console.log(`DESCRIBE -> ANALYZING -> REVIEW: ${results.stateTransition ? 'PASS' : 'FAIL'}`);
  console.log(`REVERSE SCROLL: ${results.reverseScroll ? 'PASS' : 'FAIL'}`);
  console.log(`CONSOLE ERRORS: ${results.consoleErrors.length === 0 ? 'NONE' : JSON.stringify(results.consoleErrors)}`);
  console.log(`PAGE ERRORS: ${results.pageErrors.length === 0 ? 'NONE' : JSON.stringify(results.pageErrors)}`);
  console.log('==============================================\n');

  console.log('MEASURED CHECKPOINTS:');
  console.log('0%:  ', JSON.stringify(results.measurements['0%']));
  console.log('25%: ', JSON.stringify(results.measurements['25%']));
  console.log('45%: ', JSON.stringify(results.measurements['45%']));
  console.log('70%: ', JSON.stringify(results.measurements['70%']));
  console.log('100%:', JSON.stringify(results.measurements['100%']));
  console.log('RETURN:', JSON.stringify(results.measurements['RETURN']));

  const allPassed =
    results.canvasFullscreen &&
    results.lenisScroll &&
    results.sectionReachability &&
    results.bookService &&
    results.pointerOwnership &&
    results.inputFocus &&
    results.typing &&
    results.submit &&
    results.stateTransition &&
    results.reverseScroll &&
    results.pageErrors.length === 0;

  if (!allPassed) {
    console.error('\nPUPPETEER RUNTIME TEST FAILED!');
    process.exit(1);
  } else {
    console.log('\nPUPPETEER RUNTIME TEST PASSED!');
    process.exit(0);
  }
}

runTest();
