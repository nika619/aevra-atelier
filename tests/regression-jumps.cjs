const puppeteer = require('puppeteer');

async function testJumps() {
  console.log('Testing 0 -> 20 -> 0 and 0 -> 40% jump regressions...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Helper to scroll
  const scrollTo = async (targetProgress) => {
    await page.evaluate((target) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = maxScroll * target;
      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo({ top: targetY });
      }
    }, targetProgress);
    await new Promise(r => setTimeout(r, 600));
  };

  const getSectionStates = async () => {
    return await page.evaluate(() => {
      const hero = document.getElementById('hero-section');
      const heritage = document.getElementById('heritage-section');
      const intake = document.getElementById('intake-section');

      const getStyle = (el) => ({
        opacity: el ? parseFloat(window.getComputedStyle(el).opacity) : 0,
        visibility: el ? window.getComputedStyle(el).visibility : 'hidden',
        pointerEvents: el ? window.getComputedStyle(el).pointerEvents : 'none'
      });

      return {
        hero: getStyle(hero),
        heritage: getStyle(heritage),
        intake: getStyle(intake)
      };
    });
  };

  // Test 1: Scroll 0 -> 20% -> 0
  console.log('[Test 1] 0 -> 20% -> 0 reversal:');
  await scrollTo(0.20);
  const state20 = await getSectionStates();
  console.log('At 20%:', state20);
  if (state20.hero.visibility !== 'hidden' || state20.hero.opacity !== 0) {
    throw new Error('Hero should be hidden at 20%');
  }

  await scrollTo(0.0);
  const stateReturn0 = await getSectionStates();
  console.log('At return 0%:', stateReturn0);
  if (stateReturn0.hero.visibility !== 'visible' || stateReturn0.hero.opacity < 0.9) {
    throw new Error('Hero should be visible at return 0%');
  }
  if (stateReturn0.heritage.visibility !== 'hidden' || stateReturn0.intake.visibility !== 'hidden') {
    throw new Error('Non-hero should be hidden at return 0%');
  }
  console.log('0 -> 20 -> 0 reversal: PASS');

  // Test 2: Jump directly from 0% to 40%
  console.log('\n[Test 2] Direct jump 0% -> 40%:');
  await scrollTo(0.40);
  const state40 = await getSectionStates();
  console.log('At 40%:', state40);
  if (state40.hero.visibility !== 'hidden' || state40.hero.opacity !== 0) {
    throw new Error('Hero should be hidden at 40%');
  }
  if (state40.intake.visibility !== 'visible' || state40.intake.opacity < 0.9) {
    throw new Error('Intake should be visible at 40%');
  }
  console.log('Direct jump 0% -> 40%: PASS');

  // Test 3: Jump back 40% -> 0%
  console.log('\n[Test 3] Jump back 40% -> 0%:');
  await scrollTo(0.0);
  const stateBack0 = await getSectionStates();
  console.log('At back 0%:', stateBack0);
  if (stateBack0.hero.visibility !== 'visible' || stateBack0.hero.opacity < 0.9) {
    throw new Error('Hero should be visible at back 0%');
  }
  if (stateBack0.intake.visibility !== 'hidden' || stateBack0.intake.opacity !== 0) {
    throw new Error('Intake should be hidden at back 0%');
  }
  console.log('Jump back 40% -> 0%: PASS');

  await browser.close();
  console.log('\nALL REGRESSION TESTS PASSED!');
}

testJumps().catch(err => {
  console.error('REGRESSION TEST FAILED:', err);
  process.exit(1);
});
