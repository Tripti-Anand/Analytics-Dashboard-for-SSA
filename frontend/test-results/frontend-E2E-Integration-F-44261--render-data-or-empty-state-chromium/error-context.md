# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend.spec.ts >> E2E Integration Flows >> E2E-002: CME full flow — all 5 cards render data or empty state
- Location: tests\frontend.spec.ts:420:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/cme", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - link "Overview" [ref=e5] [cursor=pointer]:
        - /url: /
        - button "Overview" [ref=e6]:
          - generic [ref=e8]: Overview
      - link "Solar Flare" [ref=e9] [cursor=pointer]:
        - /url: /solar-flare
        - button "Solar Flare" [ref=e10]:
          - generic [ref=e12]: Solar Flare
      - link "CME" [ref=e13] [cursor=pointer]:
        - /url: /cme
        - button "CME" [ref=e14]:
          - generic [ref=e16]: CME
      - link "Solar Wind" [ref=e17] [cursor=pointer]:
        - /url: /solar-wind
        - button "Solar Wind" [ref=e18]:
          - generic [ref=e20]: Solar Wind
      - link "SEP" [ref=e21] [cursor=pointer]:
        - /url: /sep
        - button "SEP" [ref=e22]:
          - generic [ref=e24]: SEP
      - link "LLM" [ref=e25] [cursor=pointer]:
        - /url: /llm
        - button "LLM" [ref=e26]:
          - generic [ref=e28]: LLM
  - main [ref=e29]:
    - heading "CME" [level=1] [ref=e31]
    - generic [ref=e32]:
      - generic [ref=e36]:
        - generic [ref=e37]: "01"
        - heading "CME Velocity" [level=2] [ref=e38]
        - generic [ref=e40]:
          - paragraph [ref=e41]: Coronal Mass Ejections are massive eruptions of plasma and magnetic field from the Sun's corona.
          - paragraph [ref=e42]: Loading CME data...
      - generic [ref=e47]:
        - generic [ref=e48]: "02"
        - heading "Magnetic Structure" [level=2] [ref=e49]
        - generic [ref=e50]:
          - paragraph [ref=e52]: The magnetic structure determines how the CME interacts with Earth's magnetosphere.
          - paragraph [ref=e54]: Loading...
      - generic [ref=e59]:
        - generic [ref=e60]: "03"
        - heading "Impact Probability" [level=2] [ref=e61]
        - generic [ref=e62]:
          - paragraph [ref=e64]: Impact probability depends on CME trajectory, angular width, and speed relative to the Sun-Earth line.
          - paragraph [ref=e66]: Loading...
      - generic [ref=e71]:
        - generic [ref=e72]: "04"
        - heading "CME Coronagraph Image" [level=2] [ref=e73]
        - generic [ref=e74]:
          - paragraph [ref=e76]: LASCO coronagraph blocks the bright solar disk to reveal faint coronal structures and CMEs propagating outward.
          - img "LASCO CME Coronagraph" [ref=e78]
      - generic [ref=e83]:
        - generic [ref=e84]: "05"
        - heading "CME Event Log" [level=2] [ref=e85]
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88]: ID
            - generic [ref=e89]: Time
            - generic [ref=e90]: Speed
            - generic [ref=e91]: Type
            - generic [ref=e92]: Location
            - generic [ref=e93]: Risk
          - paragraph [ref=e95]: Loading CME events...
  - button "Open Next.js Dev Tools" [ref=e102] [cursor=pointer]:
    - img [ref=e103]
  - alert [ref=e106]
```

# Test source

```ts
  321 |     const classCol = page.getByText("Class", { exact: false }).first();
  322 |     expect(await classCol.isVisible()).toBeTruthy();
  323 |   });
  324 | 
  325 |   test("FC-006: M-class flare badge shows orange color", async ({ page }) => {
  326 |     await page.goto(`${FE}/solar-flare`);
  327 |     await page.waitForTimeout(3000);
  328 |     const mBadge = page.locator("span").filter({ hasText: /^M\d/ }).first();
  329 |     if (await mBadge.count() > 0) {
  330 |       const cls = await mBadge.getAttribute("class") ?? "";
  331 |       console.log(`[FC-006] M-class badge class: "${cls}"`);
  332 |       expect(cls).toContain("orange");
  333 |     } else {
  334 |       console.log(`[FC-006] No M-class flares in current data`);
  335 |       test.skip();
  336 |     }
  337 |   });
  338 | 
  339 |   test("FC-008/FC-009: Shows flare rows or 'No flare events found'", async ({ page }) => {
  340 |     await page.goto(`${FE}/solar-flare`);
  341 |     await page.waitForTimeout(4000);
  342 |     const noFlares = page.getByText("No flare events found").first();
  343 |     const rows     = page.locator(".grid.grid-cols-5 > span").first();
  344 |     const hasNoFlares = await noFlares.isVisible();
  345 |     const hasRows     = await rows.isVisible();
  346 |     console.log(`[FC-008/FC-009] 'No flare events found': ${hasNoFlares} | Flare rows visible: ${hasRows}`);
  347 |     expect(hasNoFlares || hasRows).toBeTruthy();
  348 |   });
  349 | });
  350 | 
  351 | test.describe("Component: CMECards", () => {
  352 |   test("FC-010: CMEVelocity card shows speed + km/s label", async ({ page }) => {
  353 |     await page.goto(`${FE}/cme`);
  354 |     await page.waitForTimeout(2000);
  355 |     const kms = page.getByText("km/s").first();
  356 |     await expect(kms).toBeVisible({ timeout: 15000 });
  357 |     console.log(`[FC-010] 'km/s' label visible: true`);
  358 |   });
  359 | 
  360 |   test("FC-011: CME Impact Probability shows High/Moderate/Low bars", async ({ page }) => {
  361 |     await page.goto(`${FE}/cme`);
  362 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  363 |     await page.waitForTimeout(2000);
  364 |     const high = page.getByText("High").first();
  365 |     const mod  = page.getByText("Moderate").first();
  366 |     console.log(`[FC-011] High visible: ${await high.isVisible()} | Moderate visible: ${await mod.isVisible()}`);
  367 |     expect(await high.isVisible() || await mod.isVisible()).toBeTruthy();
  368 |   });
  369 | 
  370 |   test("FC-012: CME Coronagraph image has src attribute", async ({ page }) => {
  371 |     await page.goto(`${FE}/cme`);
  372 |     await page.waitForTimeout(2000);
  373 |     const img = page.locator("img").filter({ hasNot: page.locator("[alt='']") }).first();
  374 |     const src = await img.getAttribute("src").catch(() => "");
  375 |     console.log(`[FC-012] Image src: "${src}"`);
  376 |     expect(src?.length).toBeGreaterThan(0);
  377 |   });
  378 | 
  379 |   test("FC-013: CME Event Log shows Speed and Risk columns", async ({ page }) => {
  380 |     await page.goto(`${FE}/cme`);
  381 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  382 |     await page.waitForTimeout(2000);
  383 |     const speed = page.getByText("Speed", { exact: false }).first();
  384 |     const risk  = page.getByText("Risk",  { exact: false }).first();
  385 |     console.log(`[FC-013] Speed: ${await speed.isVisible()} | Risk: ${await risk.isVisible()}`);
  386 |     expect(await speed.isVisible() || await risk.isVisible()).toBeTruthy();
  387 |   });
  388 | 
  389 |   test("FC-014: GlassCard renders children (basic check)", async ({ page }) => {
  390 |     await page.goto(`${FE}/sep`);
  391 |     await waitForNoSkeleton(page);
  392 |     // GlassCard wraps stat values — check a rendered value exists
  393 |     const card = page.locator(".glass, [class*='glass']").first();
  394 |     const exists = await card.count() > 0;
  395 |     console.log(`[FC-014] GlassCard element found: ${exists}`);
  396 |     // Even if class differs, page content renders inside a card wrapper
  397 |     expect(true).toBeTruthy();
  398 |   });
  399 | });
  400 | 
  401 | 
  402 | // ═══════════════════════════════════════════════════════════════════════════════
  403 | //  END-TO-END FLOWS  (E2E-001 to E2E-010)
  404 | // ═══════════════════════════════════════════════════════════════════════════════
  405 | 
  406 | test.describe("E2E Integration Flows", () => {
  407 |   test("E2E-001: Solar Flare full flow — page loads with live data, no console errors", async ({ page }) => {
  408 |     const errors: string[] = [];
  409 |     page.on("console", (msg) => {
  410 |       if (msg.type() === "error") errors.push(msg.text());
  411 |     });
  412 |     await page.goto(`${FE}/solar-flare`);
  413 |     await page.waitForTimeout(5000);
  414 |     console.log(`[E2E-001] Console errors: ${errors.length > 0 ? errors.join(" | ") : "none"}`);
  415 |     // No fatal JS errors
  416 |     const fatalErrors = errors.filter(e => !e.includes("favicon") && !e.includes("404"));
  417 |     expect(fatalErrors).toHaveLength(0);
  418 |   });
  419 | 
  420 |   test("E2E-002: CME full flow — all 5 cards render data or empty state", async ({ page }) => {
> 421 |     await page.goto(`${FE}/cme`);
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  422 |     await page.waitForTimeout(4000);
  423 | 
  424 |     // Scroll through all cards
  425 |     for (let i = 0; i < 5; i++) {
  426 |       await page.keyboard.press("PageDown");
  427 |       await page.waitForTimeout(500);
  428 |     }
  429 | 
  430 |     const kmVisible    = await page.getByText("km/s").first().isVisible();
  431 |     const typeVisible  = await page.getByText("Type", { exact: false }).first().isVisible();
  432 |     const highVisible  = await page.getByText("High").first().isVisible();
  433 |     console.log(`[E2E-002] km/s: ${kmVisible} | Type field: ${typeVisible} | High badge: ${highVisible}`);
  434 |     expect(kmVisible || typeVisible || highVisible).toBeTruthy();
  435 |   });
  436 | 
  437 |   test("E2E-003: SEP page full flow — proton + risk level + mission cards", async ({ page }) => {
  438 |     await page.goto(`${FE}/sep`);
  439 |     await waitForNoSkeleton(page);
  440 | 
  441 |     const pfu      = await page.getByText("pfu").first().isVisible();
  442 |     const crew     = await page.getByText("Crew", { exact: false }).first().isVisible();
  443 |     const riskCard = await page.getByText("Radiation Risk Level", { exact: false }).first().isVisible();
  444 |     console.log(`[E2E-003] pfu: ${pfu} | Crew card: ${crew} | Risk Level card: ${riskCard}`);
  445 |     expect(pfu && crew).toBeTruthy();
  446 |   });
  447 | 
  448 |   test("E2E-004: Solar Wind full flow — speed, density, Bz visible", async ({ page }) => {
  449 |     await page.goto(`${FE}/solar-wind`);
  450 |     await waitForNoSkeleton(page);
  451 | 
  452 |     const kms = await page.getByText("km/s").first().isVisible();
  453 |     const nt  = await page.getByText("nT").first().isVisible();
  454 |     console.log(`[E2E-004] km/s: ${kms} | nT: ${nt}`);
  455 |     expect(kms && nt).toBeTruthy();
  456 |   });
  457 | 
  458 |   test("E2E-005: AIA wavelength switch — image updates within 5 sec", async ({ page }) => {
  459 |     await page.goto(`${FE}/solar-flare`);
  460 |     await page.waitForTimeout(2000);
  461 | 
  462 |     let requests = 0;
  463 |     page.on("request", (req) => {
  464 |       if (req.url().includes("aia-image")) requests++;
  465 |     });
  466 | 
  467 |     for (const wl of ["94Å", "193Å", "131Å"]) {
  468 |       const btn = page.getByText(wl, { exact: true }).first();
  469 |       if (await btn.count() > 0) {
  470 |         await btn.click();
  471 |         await page.waitForTimeout(1000);
  472 |         console.log(`[E2E-005] Clicked ${wl} — AIA requests so far: ${requests}`);
  473 |       }
  474 |     }
  475 |     console.log(`[E2E-005] Total AIA image requests triggered: ${requests}`);
  476 |     expect(requests).toBeGreaterThanOrEqual(0); // may be 0 if image is static URL
  477 |   });
  478 | 
  479 |   test("E2E-006: Retry flow — error banner appears when API is mocked to fail then disappears after retry", async ({ page }) => {
  480 |     let callCount = 0;
  481 |     await page.route("**/space-weather/wind/all", async (route) => {
  482 |       callCount++;
  483 |       if (callCount === 1) {
  484 |         await route.fulfill({ status: 500, body: JSON.stringify({ detail: "Simulated" }) });
  485 |       } else {
  486 |         await route.continue();
  487 |       }
  488 |     });
  489 | 
  490 |     await page.goto(`${FE}/solar-wind`);
  491 |     await page.waitForTimeout(3000);
  492 | 
  493 |     const retryBtn = page.getByRole("button", { name: /retry/i });
  494 |     const hasRetry = await retryBtn.isVisible();
  495 |     console.log(`[E2E-006] Retry button after error: ${hasRetry}`);
  496 | 
  497 |     if (hasRetry) {
  498 |       await retryBtn.click();
  499 |       await page.waitForTimeout(4000);
  500 |       const stillError = await retryBtn.isVisible();
  501 |       console.log(`[E2E-006] Retry button after clicking Retry: ${stillError}`);
  502 |     }
  503 |     expect(true).toBeTruthy(); // flow completed without crash
  504 |   });
  505 | 
  506 |   test("E2E-007: Page navigation — all 4 routes load without crash", async ({ page }) => {
  507 |     const routes = [
  508 |       { path: "/solar-flare", label: "Solar Flare" },
  509 |       { path: "/cme",         label: "CME" },
  510 |       { path: "/sep",         label: "SEP" },
  511 |       { path: "/solar-wind",  label: "Solar Wind" },
  512 |     ];
  513 | 
  514 |     for (const { path, label } of routes) {
  515 |       const errors: string[] = [];
  516 |       page.on("console", (msg) => {
  517 |         if (msg.type() === "error") errors.push(msg.text());
  518 |       });
  519 |       await page.goto(`${FE}${path}`);
  520 |       await page.waitForTimeout(2000);
  521 |       const title = await page.title();
```