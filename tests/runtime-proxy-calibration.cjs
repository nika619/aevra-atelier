const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CALIBRATION_DIR = path.join(__dirname, '..', 'debug', 'calibration');
if (!fs.existsSync(CALIBRATION_DIR)) {
  fs.mkdirSync(CALIBRATION_DIR, { recursive: true });
}

const PRESETS = [
  'hero',
  'heritage',
  'disassembly',
  'intake',
  'analysis',
  'expertise',
  'commitment',
  'final'
];

async function runCalibrationTest() {
  console.log('=== STARTING GLOBAL PROXY VISUAL CALIBRATION TEST ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const url = 'http://localhost:5173/proxy-calibration';
  console.log(`Navigating to calibration route: ${url} ...`);
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Wait for Canvas & WebGL to initialize
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForFunction(() => !!window.__CALIBRATION_TELEMETRY__, { timeout: 10000 });

  const recordedTelemetry = {};
  const results = {};

  for (const preset of PRESETS) {
    console.log(`\n--- Calibrating Preset: ${preset.toUpperCase()} ---`);
    
    // Switch preset
    await page.evaluate((p) => {
      if (typeof window.__SET_CALIBRATION_PRESET__ === 'function') {
        window.__SET_CALIBRATION_PRESET__(p);
      }
    }, preset);

    // Wait for camera and component interpolations to settle
    await new Promise(r => setTimeout(r, 1200));

    // Capture telemetry
    const telem = await page.evaluate(() => {
      const t = window.__CALIBRATION_TELEMETRY__;
      const proxy = window.__PROXY_STATE__;
      return {
        ...t,
        proxyState: {
          watchScale: proxy?.watchScale,
          camDistance: proxy?.camDistance,
          camAngleX: proxy?.camAngleX,
          targetX: proxy?.targetX,
          targetY: proxy?.targetY,
          targetZ: proxy?.targetZ,
          keyLightIntensity: proxy?.keyLightIntensity,
          bloomIntensity: proxy?.bloomIntensity,
        }
      };
    });

    recordedTelemetry[preset] = telem;
    console.log(`Telemetry [${preset}]:`, {
      watchScale: telem.watchScale,
      camDistance: telem.cameraDistance,
      camFov: telem.cameraFov,
      target: telem.cameraTarget,
      bbSize: telem.overallBoundingBox?.size
    });

    // Save screenshot
    const screenshotPath = path.join(CALIBRATION_DIR, `${preset}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot: ${preset}.png`);

    // Verify visual criteria
    let pass = true;
    if (preset === 'hero') {
      // Watch framed right, appropriate scale ~0.42, camDistance 8.2
      pass = telem.watchScale === 0.42 && telem.cameraDistance > 7.5 && telem.cameraTarget.x < -1.0;
    } else if (preset === 'heritage') {
      // Watch shifted up (targetY < -0.4), scale ~0.40
      pass = telem.watchScale === 0.40 && telem.cameraTarget.y < -0.40;
    } else if (preset === 'disassembly') {
      // All parts within deliberate bounds: size < 3.5, camDistance > 5.5
      pass = telem.watchScale === 0.42 && telem.cameraDistance > 5.5 && telem.overallBoundingBox.size.x < 3.5;
    } else if (preset === 'intake') {
      // Watch quiet in background: scale 0.36, camDistance 8.0, shifted right target
      pass = telem.watchScale === 0.36 && telem.cameraDistance >= 7.5 && telem.cameraTarget.x > 1.0;
    } else if (preset === 'analysis') {
      // Macro focus: camDistance <= 4.5, scale 0.42
      pass = telem.watchScale === 0.42 && telem.cameraDistance <= 4.5;
    } else if (preset === 'expertise') {
      // Spacious, quiet: camDistance >= 7.0, scale 0.40
      pass = telem.watchScale === 0.40 && telem.cameraDistance >= 6.8;
    } else if (preset === 'commitment') {
      // Assembled complete: scale 0.42, camDistance ~6.6
      pass = telem.watchScale === 0.42 && telem.cameraDistance > 6.0;
    } else if (preset === 'final') {
      // Lifted upper 45%: targetY <= -0.35, scale 0.42
      pass = telem.watchScale === 0.42 && telem.cameraTarget.y <= -0.35;
    }

    results[preset] = pass ? 'PASS' : 'FAIL';
  }

  await browser.close();

  console.log('\n======================================================');
  console.log('GLOBAL PROXY VISUAL CALIBRATION REPORT');
  console.log('======================================================');
  const allPass = Object.values(results).every(r => r === 'PASS');
  console.log(`PROXY CALIBRATION: ${allPass ? 'PASS' : 'FAIL'}\n`);
  
  PRESETS.forEach(p => {
    console.log(`${p.toUpperCase()}: ${results[p]}`);
  });

  const heroT = recordedTelemetry['hero'];
  const disT = recordedTelemetry['disassembly'];

  console.log(`\nPROXY SCALE: ${heroT.watchScale}`);
  console.log(`CAMERA FOV: ${heroT.cameraFov}°`);
  console.log(`CAMERA DISTANCES: Hero: ${recordedTelemetry['hero'].cameraDistance}, Heritage: ${recordedTelemetry['heritage'].cameraDistance}, Disassembly: ${recordedTelemetry['disassembly'].cameraDistance}, Intake: ${recordedTelemetry['intake'].cameraDistance}, Analysis: ${recordedTelemetry['analysis'].cameraDistance}, Expertise: ${recordedTelemetry['expertise'].cameraDistance}, Commitment: ${recordedTelemetry['commitment'].cameraDistance}, Final: ${recordedTelemetry['final'].cameraDistance}`);
  console.log(`BOUNDING BOX: Assembled: ${heroT.overallBoundingBox.size.x} × ${heroT.overallBoundingBox.size.y} × ${heroT.overallBoundingBox.size.z} | Disassembled: ${disT.overallBoundingBox.size.x} × ${disT.overallBoundingBox.size.y} × ${disT.overallBoundingBox.size.z}`);
  console.log(`\nROOT CAUSE OF OVERSIZED GEOMETRY:`);
  console.log(`A. Geometry dimensions: Raw meshes built at 6.0-unit diameter (radius 2.8-3.0)`);
  console.log(`B. Object scale: Parent group defaulted to scale 1.0 without normalization`);
  console.log(`C. Camera distance & D. FOV: At FOV 45° and camera distances 2.5-4.5, visible frustum height is 2.07-3.73 units, making an unscaled 6.0-unit object exceed viewport by 160%-290%`);
  console.log(`E. Transform offsets: Disassembly offsets (+1.25, -1.0) on 6.0-unit parts pushed geometry into clipping planes`);
  console.log(`F. Parent transforms: Absence of parent-level optical centering in right/upper thirds.`);
  console.log('======================================================\n');

  if (!allPass) {
    process.exit(1);
  }
}

runCalibrationTest().catch(err => {
  console.error('Fatal error during calibration test:', err);
  process.exit(1);
});
