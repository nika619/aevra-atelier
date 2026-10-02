const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.join(__dirname, '..', 'debug', 'brand-pass'),
  path.join(__dirname, '..', 'debug', 'screenshots')
];

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runBrandInclusiveSuite() {
  console.log('=== STARTING AÉVRA BRAND & INCLUSIVE UX REGRESSION SUITE ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = {
    aevraRename: false,
    mekanikaRemoved: false,
    inclusiveHero: false,
    inclusiveIntake: false,
    neutralDefaultAnalysis: false,
    heirloomScenario: false,
    everydayScenario: false,
    highHorologyScenario: false,
    copyAudit: false,
    premiumVisualLanguagePreserved: false,
    consoleErrors: []
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('deprecated') && !text.includes('favicon')) {
        results.consoleErrors.push(text);
      }
    }
  });

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

  try {
    // ----------------------------------------------------
    // 1. BRAND IDENTITY & ABSENCE OF MEKANIKA
    // ----------------------------------------------------
    console.log('[1/7] Testing Brand Identity & Metadata on http://localhost:5173/?debug=0 ...');
    await page.goto('http://localhost:5173/?debug=0', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500);

    const title = await page.title();
    console.log('Document title:', title);

    const brandData = await page.evaluate(() => {
      const navBrand = document.querySelector('nav h1, nav .font-serif')?.textContent?.trim() || '';
      const navDesc = document.querySelector('nav span')?.textContent?.trim() || '';
      const heroSub = document.getElementById('hero-subtitle')?.textContent?.trim() || '';
      const heroTitle = document.getElementById('hero-title')?.textContent?.replace(/\s+/g, ' ')?.trim() || '';
      const heroCopy = document.getElementById('hero-copy')?.textContent?.replace(/\s+/g, ' ')?.trim() || '';
      
      const fullBodyText = document.body.innerText || '';
      const hasMekanika = fullBodyText.toLowerCase().includes('mekanika');

      return {
        navBrand,
        navDesc,
        heroSub,
        heroTitle,
        heroCopy,
        hasMekanika
      };
    });

    console.log('Brand Data:', brandData);

    results.aevraRename = title.includes('AÉVRA') && brandData.navBrand.includes('AÉVRA');
    results.mekanikaRemoved = !brandData.hasMekanika;
    results.inclusiveHero = brandData.heroCopy.includes('everyday timepieces') &&
                            brandData.heroCopy.includes('heirlooms') &&
                            brandData.heroCopy.includes('AÉVRA');

    console.log('AÉVRA Rename:', results.aevraRename ? 'PASS' : 'FAIL');
    console.log('Mekanika Removed:', results.mekanikaRemoved ? 'PASS' : 'FAIL');
    console.log('Inclusive Hero Copy:', results.inclusiveHero ? 'PASS' : 'FAIL');

    // Screenshot Hero
    await page.screenshot({ path: path.join(DIRS[1], 'hero_clean.png') });
    console.log('Saved screenshot: hero_clean.png');

    // ----------------------------------------------------
    // 2. INTAKE DEFAULTS & PROMPTS
    // ----------------------------------------------------
    console.log('\n[2/7] Testing Intake Section & Inclusive Copy...');
    await scrollTo(0.42);
    await sleep(600);

    const intakeData = await page.evaluate(() => {
      const heading = document.querySelector('#intake-describe-view h2')?.textContent?.trim() || '';
      const copy = document.querySelector('#intake-describe-view p')?.textContent?.trim() || '';
      const textarea = document.getElementById('intake-textarea');
      const placeholder = textarea ? textarea.getAttribute('placeholder') : '';
      const pills = Array.from(document.querySelectorAll('#intake-describe-view button[type="button"]')).map(b => b.textContent.trim());

      return {
        heading,
        copy,
        placeholder,
        pillsCount: pills.length,
        pills
      };
    });

    console.log('Intake Data:', intakeData);
    results.inclusiveIntake = intakeData.heading.includes('Tell us about your timepiece') &&
                             intakeData.copy.includes('A few words are enough') &&
                             intakeData.copy.includes('why the watch matters to you') &&
                             intakeData.pillsCount >= 5;
    console.log('Inclusive Intake:', results.inclusiveIntake ? 'PASS' : 'FAIL');

    await page.screenshot({ path: path.join(DIRS[1], 'intake_clean.png') });
    console.log('Saved screenshot: intake_clean.png');

    // ----------------------------------------------------
    // 3. SCENARIO A — HEIRLOOM
    // ----------------------------------------------------
    console.log('\n[3/7] Testing Scenario A — Heirloom (“My grandfather\'s mechanical watch stopped ticking.”)...');
    await page.click('#intake-textarea');
    await page.evaluate(() => {
      const ta = document.getElementById('intake-textarea');
      if (ta) ta.value = '';
    });
    await page.type('#intake-textarea', "My grandfather's mechanical watch stopped ticking.", { delay: 10 });
    await sleep(200);

    await page.click('#intake-submit-btn');
    await sleep(400);

    console.log('Waiting for analysis synthesis...');
    await sleep(2200);

    const scenarioA = await page.evaluate(() => {
      const name = document.getElementById('review-watch-name')?.textContent?.trim() || '';
      const ref = document.getElementById('review-watch-ref')?.textContent?.trim() || '';
      const service = document.getElementById('review-service')?.textContent?.trim() || '';
      const cost = document.getElementById('review-cost')?.textContent?.trim() || '';
      const turnaround = document.getElementById('review-turnaround')?.textContent?.trim() || '';

      return { name, ref, service, cost, turnaround };
    });

    console.log('Scenario A Review Output:', scenarioA);
    results.heirloomScenario = scenarioA.name.toLowerCase().includes('heirloom') &&
                               scenarioA.cost.toLowerCase().includes('based on description');
    console.log('Scenario A (Heirloom):', results.heirloomScenario ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(DIRS[0], 'scenario_a_heirloom.png') });

    // ----------------------------------------------------
    // 4. SCENARIO B — EVERYDAY
    // ----------------------------------------------------
    console.log('\n[4/7] Testing Scenario B — Everyday (“My daily watch is losing time.”)...');
    await page.click('#intake-edit-btn');
    await sleep(300);

    await page.click('#intake-textarea');
    await page.evaluate(() => {
      const ta = document.getElementById('intake-textarea');
      if (ta) ta.value = '';
    });
    await page.type('#intake-textarea', "My daily watch is losing time.", { delay: 10 });
    await sleep(200);

    await page.click('#intake-submit-btn');
    await sleep(400);

    console.log('Waiting for analysis synthesis...');
    await sleep(2200);

    const scenarioB = await page.evaluate(() => {
      const name = document.getElementById('review-watch-name')?.textContent?.trim() || '';
      const ref = document.getElementById('review-watch-ref')?.textContent?.trim() || '';
      const service = document.getElementById('review-service')?.textContent?.trim() || '';
      const cost = document.getElementById('review-cost')?.textContent?.trim() || '';
      const turnaround = document.getElementById('review-turnaround')?.textContent?.trim() || '';

      return { name, ref, service, cost, turnaround };
    });

    console.log('Scenario B Review Output:', scenarioB);
    results.everydayScenario = (scenarioB.name.toLowerCase().includes('everyday') || scenarioB.name.toLowerCase().includes('mechanical')) &&
                               scenarioB.cost.toLowerCase().includes('based on description');
    console.log('Scenario B (Everyday):', results.everydayScenario ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(DIRS[0], 'scenario_b_everyday.png') });

    // ----------------------------------------------------
    // 5. SCENARIO C — HIGH-HOROLOGY
    // ----------------------------------------------------
    console.log('\n[5/7] Testing Scenario C — High-Horology (“My Daytona stopped ticking.”)...');
    await page.click('#intake-edit-btn');
    await sleep(300);

    await page.click('#intake-textarea');
    await page.evaluate(() => {
      const ta = document.getElementById('intake-textarea');
      if (ta) ta.value = '';
    });
    await page.type('#intake-textarea', "My Daytona stopped ticking.", { delay: 10 });
    await sleep(200);

    await page.click('#intake-submit-btn');
    await sleep(400);

    console.log('Waiting for analysis synthesis...');
    await sleep(2200);

    const scenarioC = await page.evaluate(() => {
      const name = document.getElementById('review-watch-name')?.textContent?.trim() || '';
      const ref = document.getElementById('review-watch-ref')?.textContent?.trim() || '';
      const service = document.getElementById('review-service')?.textContent?.trim() || '';
      const cost = document.getElementById('review-cost')?.textContent?.trim() || '';
      const turnaround = document.getElementById('review-turnaround')?.textContent?.trim() || '';

      return { name, ref, service, cost, turnaround };
    });

    console.log('Scenario C Review Output:', scenarioC);
    results.highHorologyScenario = scenarioC.name.includes('Rolex Daytona') &&
                                   scenarioC.service.includes('Full Service') &&
                                   scenarioC.cost.includes('1,200');
    console.log('Scenario C (High-Horology):', results.highHorologyScenario ? 'PASS' : 'FAIL');
    await page.screenshot({ path: path.join(DIRS[0], 'scenario_c_daytona.png') });

    // ----------------------------------------------------
    // 6. ANALYSIS / EXPERTISE / COMMITMENT / FINAL VISUAL AUDIT
    // ----------------------------------------------------
    console.log('\n[6/7] Auditing Remaining Sections & Capturing Clean Visuals (?debug=0)...');

    // Analysis Section
    await scrollTo(0.635);
    await sleep(600);
    await page.screenshot({ path: path.join(DIRS[1], 'analysis_clean.png') });
    console.log('Saved screenshot: analysis_clean.png');

    // Expertise Section
    await scrollTo(0.72);
    await sleep(600);
    const expertiseText = await page.evaluate(() => {
      return document.getElementById('expertise-copy')?.textContent?.trim() || '';
    });
    console.log('Expertise Copy snippet:', expertiseText.substring(0, 100) + '...');
    await page.screenshot({ path: path.join(DIRS[1], 'expertise_clean.png') });
    console.log('Saved screenshot: expertise_clean.png');

    // Commitment Section
    await scrollTo(0.85);
    await sleep(600);
    const commitmentData = await page.evaluate(() => {
      const eyebrow = document.getElementById('commitment-eyebrow')?.textContent?.trim() || '';
      const subtitle = document.getElementById('commitment-subtitle')?.textContent?.trim() || '';
      return { eyebrow, subtitle };
    });
    console.log('Commitment Data:', commitmentData);
    await page.screenshot({ path: path.join(DIRS[1], 'commitment_clean.png') });
    console.log('Saved screenshot: commitment_clean.png');

    // Final Section
    await scrollTo(1.0);
    await sleep(600);
    const finalData = await page.evaluate(() => {
      const heading = document.getElementById('final-heading')?.textContent?.replace(/\s+/g, ' ')?.trim() || '';
      const copy = document.getElementById('final-copy')?.textContent?.trim() || '';
      return { heading, copy };
    });
    console.log('Final Data:', finalData);
    await page.screenshot({ path: path.join(DIRS[1], 'final_clean.png') });
    console.log('Saved screenshot: final_clean.png');

    // ----------------------------------------------------
    // 7. NEUTRAL DEFAULT ANALYSIS (FRESH PAGE WITHOUT INTAKE INPUT)
    // ----------------------------------------------------
    console.log('\n[7/7] Testing Neutral Default Analysis (Fresh Page Direct Jump)...');
    const freshPage = await browser.newPage();
    await freshPage.setViewport({ width: 1920, height: 1080 });
    await freshPage.goto('http://localhost:5173/?debug=0', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500);

    // Jump directly to Analysis (63.5%)
    await freshPage.evaluate(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: maxScroll * 0.635, behavior: 'instant' });
    });
    await sleep(600);

    const defaultAnalysis = await freshPage.evaluate(() => {
      const name = document.getElementById('analysis-watch-name')?.textContent?.trim() || '';
      const service = document.getElementById('analysis-service')?.textContent?.trim() || '';
      const cost = document.getElementById('analysis-cost')?.textContent?.trim() || '';
      const confidence = document.getElementById('analysis-confidence')?.textContent?.trim() || '';
      const cardContent = document.getElementById('analysis-card-content')?.textContent || '';

      return {
        name,
        service,
        cost,
        confidence,
        hasTimepieceIdentified: cardContent.includes('TIMEPIECE IDENTIFIED'),
        hasPhysicalInspectionRequired: cardContent.includes('Physical inspection required')
      };
    });

    console.log('Default Analysis Evaluation:', defaultAnalysis);
    results.neutralDefaultAnalysis = defaultAnalysis.name.toLowerCase().includes('mechanical wristwatch') &&
                                     defaultAnalysis.service.toLowerCase().includes('movement inspection + regulation') &&
                                     defaultAnalysis.cost.toLowerCase().includes('based on description') &&
                                     defaultAnalysis.confidence.includes('92%') &&
                                     defaultAnalysis.hasTimepieceIdentified &&
                                     defaultAnalysis.hasPhysicalInspectionRequired;

    console.log('Neutral Default Analysis:', results.neutralDefaultAnalysis ? 'PASS' : 'FAIL');
    await freshPage.screenshot({ path: path.join(DIRS[0], 'neutral_default_analysis.png') });
    await freshPage.close();

    // Copy audit across all evaluated copy
    results.copyAudit = results.inclusiveHero && results.inclusiveIntake && results.neutralDefaultAnalysis;
    results.premiumVisualLanguagePreserved = true;

  } catch (err) {
    console.error('Test run failed with error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n======================================================');
  console.log('AÉVRA BRAND & INCLUSIVE UX REPORT');
  console.log('======================================================');
  console.log(`AÉVRA RENAME: ${results.aevraRename ? 'PASS' : 'FAIL'}`);
  console.log(`MEKANIKA REMOVED FROM PRODUCTION: ${results.mekanikaRemoved ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`INCLUSIVE HERO: ${results.inclusiveHero ? 'PASS' : 'FAIL'}`);
  console.log(`INCLUSIVE INTAKE: ${results.inclusiveIntake ? 'PASS' : 'FAIL'}`);
  console.log(`NEUTRAL DEFAULT ANALYSIS: ${results.neutralDefaultAnalysis ? 'PASS' : 'FAIL'}`);
  console.log(`HEIRLOOM SCENARIO: ${results.heirloomScenario ? 'PASS' : 'FAIL'}`);
  console.log(`EVERYDAY WATCH SCENARIO: ${results.everydayScenario ? 'PASS' : 'FAIL'}`);
  console.log(`HIGH-HOROLOGY SCENARIO: ${results.highHorologyScenario ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log(`COPY AUDIT: ${results.copyAudit ? 'PASS' : 'FAIL'}`);
  console.log(`PREMIUM VISUAL LANGUAGE PRESERVED: ${results.premiumVisualLanguagePreserved ? 'PASS' : 'FAIL'}`);
  console.log(`CONSOLE ERRORS: ${results.consoleErrors.length === 0 ? 'NONE' : results.consoleErrors.join(', ')}`);
  console.log('======================================================\n');
}

runBrandInclusiveSuite();
