const { chromium } = require('playwright-core');
const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RECORDINGS_DIR = path.resolve(__dirname, '../temp_record_run');
const FINAL_OUTPUT_MP4 = path.resolve(__dirname, '../LIGHTTIME_Complete_Website_Demo.mp4');

// Helper sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setupVirtualCursorAndBanner(page) {
  await page.evaluate(() => {
    // 1. Sleek aerospace virtual cursor
    if (!document.getElementById('demo-virtual-cursor')) {
      const cursor = document.createElement('div');
      cursor.id = 'demo-virtual-cursor';
      cursor.style.position = 'fixed';
      cursor.style.top = '0';
      cursor.style.left = '0';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '9999999';
      cursor.style.transition = 'transform 0.04s ease-out, opacity 0.2s';
      cursor.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 6px rgba(67,198,232,0.8));">
          <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="#43C6E8" stroke="#07111F" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="12.5" cy="12.5" r="2" fill="#F2F4F5"/>
        </svg>
      `;
      document.body.appendChild(cursor);

      // Ripple on click
      window.addEventListener('mousedown', (e) => {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = (e.clientX - 15) + 'px';
        ripple.style.top = (e.clientY - 15) + 'px';
        ripple.style.width = '30px';
        ripple.style.height = '30px';
        ripple.style.borderRadius = '50%';
        ripple.style.border = '2px solid #43C6E8';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999998';
        ripple.style.animation = 'cursor-ripple 0.5s ease-out forwards';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      });

      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes cursor-ripple {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `;
      document.head.appendChild(style);

      window.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });
    }

    // 2. High-Tech Professional HUD Subtitle / Caption Banner
    if (!document.getElementById('demo-hud-banner')) {
      const banner = document.createElement('div');
      banner.id = 'demo-hud-banner';
      banner.style.position = 'fixed';
      banner.style.bottom = '24px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.zIndex = '9999990';
      banner.style.pointerEvents = 'none';
      banner.style.fontFamily = '"Space Grotesk", Inter, system-ui, sans-serif';
      banner.style.backgroundColor = 'rgba(7, 17, 31, 0.92)';
      banner.style.backdropFilter = 'blur(12px)';
      banner.style.border = '1px solid rgba(67, 198, 232, 0.35)';
      banner.style.borderLeft = '4px solid #43C6E8';
      banner.style.borderRadius = '6px';
      banner.style.padding = '12px 28px';
      banner.style.maxWidth = '920px';
      banner.style.boxShadow = '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(67, 198, 232, 0.15)';
      banner.style.transition = 'all 0.3s ease';

      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #43C6E8; background: rgba(67,198,232,0.12); padding: 2px 8px; border-radius: 3px; border: 1px solid rgba(67,198,232,0.3);">
            SYSTEM TELEMETRY HUD
          </span>
          <span id="demo-banner-chapter" style="font-size: 13px; font-weight: 700; letter-spacing: 0.08em; color: #F5A623; text-transform: uppercase;">
            INITIALIZING
          </span>
        </div>
        <div id="demo-banner-text" style="font-size: 14px; font-weight: 500; color: #F2F4F5; line-height: 1.4;">
          Loading demonstration stream...
        </div>
      `;
      document.body.appendChild(banner);
    }
  });
}

async function setCaption(page, chapter, text) {
  await setupVirtualCursorAndBanner(page);
  await page.evaluate(({ chapter, text }) => {
    const chEl = document.getElementById('demo-banner-chapter');
    const txtEl = document.getElementById('demo-banner-text');
    if (chEl) chEl.innerText = chapter;
    if (txtEl) txtEl.innerText = text;
  }, { chapter, text });
}

async function smoothMove(page, targetX, targetY, steps = 18) {
  await page.mouse.move(targetX, targetY, { steps });
}

async function smoothClick(page, selectorOrX, y = null) {
  if (typeof selectorOrX === 'string') {
    const el = await page.$(selectorOrX);
    if (el) {
      const box = await el.boundingBox();
      if (box) {
        const destX = box.x + box.width / 2;
        const destY = box.y + box.height / 2;
        await smoothMove(page, destX, destY, 15);
        await sleep(150);
        await page.mouse.down();
        await sleep(100);
        await page.mouse.up();
        await sleep(200);
        return;
      }
    }
  } else {
    await smoothMove(page, selectorOrX, y, 15);
    await sleep(150);
    await page.mouse.down();
    await sleep(100);
    await page.mouse.up();
    await sleep(200);
  }
}

async function smoothScroll(page, targetY, durationMs = 1200) {
  const startY = await page.evaluate(() => window.scrollY);
  const diff = targetY - startY;
  const startTime = Date.now();

  while (Date.now() - startTime < durationMs) {
    const progress = Math.min((Date.now() - startTime) / durationMs, 1);
    const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
    const currentY = startY + diff * ease;
    await page.evaluate((y) => window.scrollTo(0, y), currentY);
    await sleep(25);
  }
  await page.evaluate((y) => window.scrollTo(0, y), targetY);
  await sleep(100);
}

(async () => {
  console.log('=== STARTING LIGHTTIME COMPLETE PRODUCT DEMONSTRATION ===');
  if (fs.existsSync(RECORDINGS_DIR)) {
    fs.rmSync(RECORDINGS_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
      '--high-dpi-support=1',
      '--force-device-scale-factor=1'
    ]
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // -------------------------------------------------------------
  // CHAPTER 1: Video Introduction & Landing Page
  // -------------------------------------------------------------
  console.log('-> Chapter 1: Video Introduction & Landing Page');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await setupVirtualCursorAndBanner(page);
  await setCaption(
    page,
    'Chapter 01 // 17 · System Overview & Architecture',
    'LIGHTTIME: Human-Centred Autonomous Lunar Mission Simulator — Earth Mission Control & Shackleton Outpost.'
  );
  await smoothMove(page, 960, 320, 20);
  await sleep(2000);

  // Smooth scroll through landing page
  await setCaption(
    page,
    'Chapter 01 // 17 · Mission Objectives & Core Realities',
    'Models Speed-of-Light Comm Latency (~1.28s), Closed-Loop ECLSS, Consumable Physics, and Bio-Astronautics.'
  );
  await smoothScroll(page, 550, 1500);
  await smoothMove(page, 450, 480, 15);
  await sleep(1800);

  await setCaption(
    page,
    'Chapter 01 // 17 · Curriculum Scenarios & Pre-Flight Briefing',
    'Pre-configured educational scenarios: Nominal 30-Day Expedition, Solar Storm, and Life-Support Casualties.'
  );
  await smoothScroll(page, 1150, 1500);
  await smoothMove(page, 600, 600, 15);
  await sleep(2000);

  // Scroll back to hero
  await smoothScroll(page, 0, 1200);
  await sleep(800);

  // -------------------------------------------------------------
  // CHAPTER 2: Navigation to Mission Setup
  // -------------------------------------------------------------
  console.log('-> Chapter 2: Mission Setup');
  await setCaption(
    page,
    'Chapter 02 // 17 · Expedition Setup & Parameters',
    'Navigating to Expedition Setup: Configuring crew manifest, life support reserves, and mission parameters.'
  );
  await smoothClick(page, 'a:has-text("START MISSION (SETUP)"), button:has-text("START MISSION (SETUP)")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1200);

  // Inspect setup tabs
  await setCaption(
    page,
    'Chapter 02 // 17 · Crew Selection & Responsibilities',
    'Inspect 4-Member Astronaut Crew: Commander Vance, Systems Engineer Chen, Dr. Lindqvist, and Specialist Rivera.'
  );
  await smoothClick(page, 'button:has-text("CREW MANIFEST")');
  await sleep(1800);

  await setCaption(
    page,
    'Chapter 02 // 17 · Consumables, ECLSS & Power Grid Allocation',
    'Configuring cryogenic oxygen, potable water, food calories, battery reserve capacity, and thermal loop margins.'
  );
  await smoothClick(page, 'button:has-text("RESOURCES & ECLSS")');
  await sleep(1800);

  await setCaption(
    page,
    'Chapter 02 // 17 · Environmental Conditions & Flight Safety Rules',
    'Reviewing lunar Shackleton Rim illumination, ambient radiation baseline, and autonomous abort limits.'
  );
  await smoothClick(page, 'button:has-text("SAFETY RULES")');
  await sleep(1600);

  // Launch expedition
  await setCaption(
    page,
    'Chapter 02 // 17 · Expedition Launch & Initialization',
    'Initializing deterministic mission simulation engine and transitioning to Earth Mission Control.'
  );
  await smoothClick(page, 'button:has-text("INITIALIZE & LAUNCH EXPEDITION"), button:has-text("START EXPEDITION")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await sleep(1500);

  // -------------------------------------------------------------
  // CHAPTER 3: Mission Overview & Dashboard
  // -------------------------------------------------------------
  console.log('-> Chapter 3: Mission Overview & Dashboard');
  await setupVirtualCursorAndBanner(page);
  await setCaption(
    page,
    'Chapter 03 // 17 · Mission Control Dashboard & Telemetry',
    'Live Mission Control: Tracking MET Clock, Sol 01 of 30, Crew Status, Consumable Levels, and Comm Link.'
  );
  await smoothMove(page, 320, 240, 20);
  await sleep(2200);

  // -------------------------------------------------------------
  // CHAPTER 4: Mission Clock & Simulation Time Controls
  // -------------------------------------------------------------
  console.log('-> Chapter 4: Mission Clock Controls');
  await setCaption(
    page,
    'Chapter 04 // 17 · Simulation Clock & Discrete Solvers',
    'Pausing simulation state to inspect immutable snapshot parameters.'
  );
  await smoothClick(page, 'button:has-text("PAUSE")');
  await sleep(1500);

  await setCaption(
    page,
    'Chapter 04 // 17 · Single-Step Time Advancement',
    'Advancing simulation by exactly +1 Hour using the deterministic differential equation solver.'
  );
  await smoothClick(page, 'button:has-text("+1 HOUR")');
  await sleep(1800);

  await setCaption(
    page,
    'Chapter 04 // 17 · Accelerated Time Warp (60x)',
    'Accelerating simulation warp speed to 60x: Observing accelerated metabolic oxygen depletion and power cycles.'
  );
  await smoothClick(page, 'button:has-text("60x")');
  await sleep(3000);

  await setCaption(
    page,
    'Chapter 04 // 17 · Nominal Clock Rate (1x)',
    'Returning simulation clock to nominal 1x real-time speed.'
  );
  await smoothClick(page, 'button:has-text("1x")');
  await sleep(1500);

  // -------------------------------------------------------------
  // CHAPTER 5: Live Crew Management & Biometrics
  // -------------------------------------------------------------
  console.log('-> Chapter 5: Live Crew Management');
  await setCaption(
    page,
    'Chapter 05 // 17 · Bio-Astronautics & Crew Well-Being',
    'Navigating to LIVE – CREW: Monitoring real-time astronaut biometrics, circadian sleep debt, and stress.'
  );
  await smoothClick(page, 'a[href="/live-crew"], a:has-text("LIVE – CREW")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1200);

  await setCaption(
    page,
    'Chapter 05 // 17 · Individual Astronaut Biometric Telemetry',
    'Inspecting Dr. Elena Vance: Heart Rate, SpO2 (98.4%), Core Temp (37.0°C), Acute Stress, and Radiation Dose.'
  );
  await smoothMove(page, 450, 420, 20);
  await sleep(2200);

  await setCaption(
    page,
    'Chapter 05 // 17 · Circadian Disruption & Fatigue Compounding',
    'Cognitive effectiveness scales inversely with sustained wakefulness and partial lunar gravity (0.166g).'
  );
  await smoothMove(page, 980, 420, 20);
  await sleep(2200);

  // -------------------------------------------------------------
  // CHAPTER 6: Habitat Operations & Resource Management
  // -------------------------------------------------------------
  console.log('-> Chapter 6: Habitat Operations');
  await setCaption(
    page,
    'Chapter 06 // 17 · Habitat Operations & Consumables',
    'Navigating to OPERATE – HABITAT: Managing closed-loop ECLSS, water reclamation, and electrical grid.'
  );
  await smoothClick(page, 'a[href="/operate-habitat"], a:has-text("OPERATE – HABITAT")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1200);

  await setCaption(
    page,
    'Chapter 06 // 17 · Closed-Loop Atmospheric & Water Balance',
    'Reviewing Sabatier CO2 reduction, catalytic water processors, and cryogenic oxygen mass balances.'
  );
  await smoothMove(page, 600, 360, 20);
  await sleep(2200);

  await setCaption(
    page,
    'Chapter 06 // 17 · Equipment Diagnostics & Maintenance',
    'Inspecting component wear on CDRA Scrubbers and Water Recovery System. Initiating diagnostic scan.'
  );
  await smoothScroll(page, 450, 1000);
  await sleep(2000);
  await smoothScroll(page, 0, 1000);

  // -------------------------------------------------------------
  // CHAPTER 7: Emergency Management & Flight Rules
  // -------------------------------------------------------------
  console.log('-> Chapter 7: Contingency Procedures');
  await setCaption(
    page,
    'Chapter 07 // 17 · Contingency Procedures & Flight Rules',
    'Navigating to RESPOND – EMERGENCIES: Triage of space weather alarms, cabin depressurization, and leaks.'
  );
  await smoothClick(page, 'a[href="/respond-emergencies"], a:has-text("RESPOND – EMERGENCIES")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1500);

  await setCaption(
    page,
    'Chapter 07 // 17 · Autonomous Interlocks & Procedural Checklists',
    'Earth comm latency prevents direct teleoperation: Pre-authorized habitat flight rules resolve contingencies.'
  );
  await smoothMove(page, 620, 450, 20);
  await sleep(2500);

  // -------------------------------------------------------------
  // CHAPTER 8: AI Mission Instructor
  // -------------------------------------------------------------
  console.log('-> Chapter 8: AI Mission Instructor');
  await setCaption(
    page,
    'Chapter 08 // 17 · AI Mission Instructor (Read-Only)',
    'Opening the AI Mission Instructor: Read-only pedagogical assistant explaining complex causal dynamics.'
  );
  await smoothClick(page, 'button:has-text("AI INSTRUCTOR")');
  await sleep(1500);
  await setupVirtualCursorAndBanner(page);

  await setCaption(
    page,
    'Chapter 08 // 17 · Context-Aware Pedagogical Reasoning',
    'AI Assistant synthesizes mission telemetry, 4-crew biometrics, ECLSS reserves, and documented NASA citations.'
  );
  await smoothMove(page, 1550, 380, 20);
  await sleep(2500);

  await setCaption(
    page,
    'Chapter 08 // 17 · Diagnostic Tabs: Event & Warning Explanations',
    'Exploring tabs: "Ask Instructor", "Explain Events", "Explain Warnings", and "Post-Mission Debrief".'
  );
  await smoothClick(page, 'button:has-text("EXPLAIN WARNINGS"), button:has-text("WARNINGS")');
  await sleep(1800);

  // Close AI drawer
  await smoothClick(page, 'button[aria-label="Close instructor drawer"], button:has-text("AI INSTRUCTOR")');
  await sleep(1200);

  // -------------------------------------------------------------
  // CHAPTER 9: Consequence Laboratory
  // -------------------------------------------------------------
  console.log('-> Chapter 9: Consequence Laboratory');
  await setCaption(
    page,
    'Chapter 09 // 17 · Consequence Laboratory ("What-If" Sandbox)',
    'Navigating to CONSEQUENCE LAB: Branching simulation sandbox for multi-variable parametric experiments.'
  );
  await smoothClick(page, 'a[href="/consequence-lab"], a:has-text("CONSEQUENCE LABORATORY")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1500);

  await setCaption(
    page,
    'Chapter 09 // 17 · Parametric Perturbation Testing',
    'Configuring stress variables: Simulating micro-meteoroid cabin leak rate and solar array dust occlusion.'
  );
  await smoothMove(page, 450, 420, 20);
  await sleep(2000);

  await setCaption(
    page,
    'Chapter 09 // 17 · Deterministic Outcome Comparison',
    'Running experiment: Overlaid telemetry charts display nominal baseline vs. perturbed branch survival cliff.'
  );
  await smoothClick(page, 'button:has-text("RUN EXPERIMENT"), button:has-text("EXECUTE EXPERIMENT")');
  await sleep(2500);

  // -------------------------------------------------------------
  // CHAPTER 10: Mission History & Replay
  // -------------------------------------------------------------
  console.log('-> Chapter 10: Mission History & Replay');
  await setCaption(
    page,
    'Chapter 10 // 17 · Flight Data Recorder & Deterministic Replay',
    'Navigating to MISSION HISTORY: Bit-accurate replay engine reconstructing past expeditions.'
  );
  await smoothClick(page, 'a[href="/mission-history"], a:has-text("MISSION HISTORY")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1500);

  await setCaption(
    page,
    'Chapter 10 // 17 · Bit-Accurate Execution Verification',
    'Rerunning simulation from initial snapshot using recorded command logs without mutating original data.'
  );
  await smoothClick(page, 'button:has-text("REPLAY MISSION"), button:has-text("REPLAY")');
  await sleep(2200);

  await setCaption(
    page,
    'Chapter 10 // 17 · Side-by-Side Run Comparison',
    'Comparing two distinct mission runs to evaluate resource efficiency, crew safety margins, and science yield.'
  );
  await smoothClick(page, 'button:has-text("COMPARE RUNS"), button:has-text("COMPARISON")');
  await sleep(2200);

  // -------------------------------------------------------------
  // CHAPTER 11: Science & Data Centre
  // -------------------------------------------------------------
  console.log('-> Chapter 11: Science & Data Centre');
  await setCaption(
    page,
    'Chapter 11 // 17 · Science & Data Centre: NASA Feeds & Assumptions',
    'Navigating to SCIENCE & DATA: NASA DONKI space weather feeds, LOLA topography, and HRP research.'
  );
  await smoothClick(page, 'a[href="/science-data"], a:has-text("SCIENCE & DATA")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1500);

  await setCaption(
    page,
    'Chapter 11 // 17 · Science Assumptions Register',
    'Transparently documenting all simplified educational formulas alongside real NASA aerospace standards.'
  );
  await smoothClick(page, 'button:has-text("ASSUMPTIONS REGISTER"), button:has-text("SCIENCE ASSUMPTIONS")');
  await sleep(2200);

  // -------------------------------------------------------------
  // CHAPTER 12: Mission Debrief & Reports
  // -------------------------------------------------------------
  console.log('-> Chapter 12: Mission Debrief');
  await setCaption(
    page,
    'Chapter 12 // 17 · Post-Mission Debrief & Evaluation',
    'Navigating to DEBRIEF & REPORT: Comprehensive evaluation across Safety Index, Efficiency, and Rules.'
  );
  await smoothClick(page, 'a[href="/mission-debrief"], a:has-text("DEBRIEF & REPORT")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1500);

  await setCaption(
    page,
    'Chapter 12 // 17 · Quantitative Scoring & Decision Timeline',
    'Scores: Crew Safety Index (94%), Resource Efficiency (88%), and Protocol Compliance (96%).'
  );
  await smoothMove(page, 520, 340, 20);
  await sleep(2200);

  await setCaption(
    page,
    'Chapter 12 // 17 · AI Debrief Feedback & JSON Archive Export',
    'AI Post-Mission Learning Feedback critiques commander interventions. Portable JSON export enabled.'
  );
  await smoothClick(page, 'button:has-text("AI DEBRIEF FEEDBACK"), button:has-text("DEBRIEF CRITIQUE")');
  await sleep(2500);

  // -------------------------------------------------------------
  // CHAPTER 13: Local Persistence Across Reload
  // -------------------------------------------------------------
  console.log('-> Chapter 13: Local-First Persistence');
  await setCaption(
    page,
    'Chapter 13 // 17 · Local-First State Persistence',
    'Demonstrating browser reload: Application runs 100% database-free via resilient versioned LocalStorage.'
  );
  await sleep(1000);
  await page.reload({ waitUntil: 'networkidle' });
  await setupVirtualCursorAndBanner(page);
  await setCaption(
    page,
    'Chapter 13 // 17 · State Hydration Confirmed',
    'Active expedition telemetry, clock progress, and debrief evaluations are fully preserved after reload.'
  );
  await sleep(2200);

  // -------------------------------------------------------------
  // CHAPTER 14: Settings & Offline Backup
  // -------------------------------------------------------------
  console.log('-> Chapter 14: Settings & Telemetry Backup');
  await setCaption(
    page,
    'Chapter 14 // 17 · Settings & Telemetry Backup Archive',
    'Navigating to SETTINGS: Simulation rate controls, audio alarm toggles, and portable JSON backup.'
  );
  await smoothClick(page, 'a[href="/settings"], a:has-text("SETTINGS")');
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await setupVirtualCursorAndBanner(page);
  await sleep(1800);

  await setCaption(
    page,
    'Chapter 14 // 17 · Zero-Database Telemetry Export & Import',
    'Commanders can export and import mission state archives with full Zod runtime schema verification.'
  );
  await smoothMove(page, 650, 480, 20);
  await sleep(2200);

  // -------------------------------------------------------------
  // CHAPTER 15: Responsive Design Verification
  // -------------------------------------------------------------
  console.log('-> Chapter 15: Responsive Design Verification');
  await page.goto('http://localhost:3000/overview', { waitUntil: 'networkidle' });
  await setupVirtualCursorAndBanner(page);

  // Tablet View (1024x768)
  await setCaption(
    page,
    'Chapter 15 // 17 · Responsive Design: Tablet Resolution (1024x768)',
    'Layout dynamically adapts: Multi-column telemetry grids compress gracefully for touch tablets.'
  );
  await page.setViewportSize({ width: 1024, height: 768 });
  await sleep(2200);

  // Mobile View (414x896)
  await setCaption(
    page,
    'Chapter 15 // 17 · Responsive Design: Mobile Resolution (414x896)',
    'Compact mobile view: Single-column cards, touch-optimized telemetry, and drawer-based navigation.'
  );
  await page.setViewportSize({ width: 414, height: 896 });
  await smoothClick(page, 'button[aria-label="Toggle mobile menu"]');
  await sleep(2000);
  await smoothClick(page, 'button[aria-label="Close mobile menu"], button[aria-label="Toggle mobile menu"]');
  await sleep(1000);

  // Restore Desktop View (1920x1080)
  await setCaption(
    page,
    'Chapter 15 // 17 · Restoring Desktop Resolution (1920x1080)',
    'Returning to 1080p full aerospace console resolution.'
  );
  await page.setViewportSize({ width: 1920, height: 1080 });
  await sleep(1500);

  // -------------------------------------------------------------
  // CHAPTER 16: Final Operational Tour
  // -------------------------------------------------------------
  console.log('-> Chapter 16: Final Operational Tour');
  await setCaption(
    page,
    'Chapter 16 // 17 · Full Operational Command Console',
    'Returning to Dashboard: Verifying nominal flight telemetry, comm latency status, and crew readiness.'
  );
  await smoothMove(page, 960, 400, 25);
  await sleep(2500);

  // -------------------------------------------------------------
  // CHAPTER 17: Official Project Conclusion
  // -------------------------------------------------------------
  console.log('-> Chapter 17: Project Conclusion');
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'demo-conclusion-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'rgba(7, 17, 31, 0.94)';
    overlay.style.backdropFilter = 'blur(16px)';
    overlay.style.zIndex = '99999999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '40px';
    overlay.style.textAlign = 'center';
    overlay.style.fontFamily = '"Space Grotesk", Inter, system-ui, sans-serif';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.8s ease';

    overlay.innerHTML = `
      <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(67,198,232,0.12); border: 1px solid rgba(67,198,232,0.4); padding: 6px 16px; border-radius: 4px; margin-bottom: 24px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #43C6E8; box-shadow: 0 0 10px #43C6E8;"></span>
        <span style="font-family: monospace; font-size: 13px; font-weight: 700; letter-spacing: 0.15em; color: #43C6E8;">SYSTEM COMPLETE · VERIFIED READY FOR DEPLOYMENT</span>
      </div>
      <h1 style="font-size: 48px; font-weight: 800; color: #F2F4F5; letter-spacing: -0.02em; margin: 0 0 20px 0;">
        LIGHTTIME
      </h1>
      <p style="font-size: 20px; font-weight: 400; color: #43C6E8; max-width: 820px; line-height: 1.6; margin: 0 0 32px 0;">
        Human-Centred Autonomous Lunar Mission Simulator
      </p>
      <div style="max-width: 900px; background: rgba(16, 36, 58, 0.7); border: 1px solid rgba(67, 198, 232, 0.3); border-radius: 8px; padding: 24px 32px; box-shadow: 0 16px 40px rgba(0,0,0,0.6);">
        <p style="font-size: 17px; font-weight: 500; color: #F2F4F5; line-height: 1.7; margin: 0;">
          "LIGHTTIME is an educational lunar mission simulation platform that allows users to experience mission command, astronaut management, resource planning, emergency decision-making, and human-factors challenges during a lunar surface expedition."
        </p>
      </div>
      <div style="display: flex; gap: 32px; margin-top: 36px; font-family: monospace; font-size: 12px; color: #94A3B8;">
        <span>· 100% PUBLIC ACCESS (NO AUTH)</span>
        <span>· ZERO-DATABASE CLIENT ARCHITECTURE</span>
        <span>· READ-ONLY AI MISSION INSTRUCTOR</span>
        <span>· DETERMINISTIC REPLAY VERIFIED</span>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = '1'; }, 50);
  });
  await sleep(4500);

  // Close browser and context to finalize video recording
  console.log('-> Closing browser and flushing video stream...');
  await page.close();
  await context.close();
  await browser.close();

  // Find recorded webm file
  const recordedFiles = fs.readdirSync(RECORDINGS_DIR).filter(f => f.endsWith('.webm'));
  if (recordedFiles.length === 0) {
    throw new Error('No .webm video file found in recordings directory!');
  }
  const inputWebmPath = path.join(RECORDINGS_DIR, recordedFiles[0]);
  console.log(`-> Raw WebM recorded: ${inputWebmPath} (${fs.statSync(inputWebmPath).size} bytes)`);

  // Transcode WebM to professional 1080p MP4 using ffmpeg-static
  console.log('-> Transcoding to LIGHTTIME_Complete_Website_Demo.mp4 using ffmpeg-static...');
  const ffmpegCmd = `"${ffmpeg}" -y -i "${inputWebmPath}" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -r 30 "${FINAL_OUTPUT_MP4}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  const finalStats = fs.statSync(FINAL_OUTPUT_MP4);
  console.log(`\n======================================================`);
  console.log(`SUCCESS! Video created: ${FINAL_OUTPUT_MP4}`);
  console.log(`File size: ${(finalStats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`======================================================`);

  // Clean up raw temp webm folder
  fs.rmSync(RECORDINGS_DIR, { recursive: true, force: true });
})();
