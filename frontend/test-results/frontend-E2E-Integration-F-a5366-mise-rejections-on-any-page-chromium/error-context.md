# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend.spec.ts >> E2E Integration Flows >> E2E-010: Console has no unhandled promise rejections on any page
- Location: tests\frontend.spec.ts:552:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/solar-flare
Call log:
  - navigating to "http://localhost:3000/solar-flare", waiting until "load"

```

# Test source

```ts
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
  522 |       const fatalErrors = errors.filter(e => !e.includes("favicon") && !e.includes("404"));
  523 |       console.log(`[E2E-007] ${label} (${path}) → title: "${title}" | fatal errors: ${fatalErrors.length}`);
  524 |       expect(fatalErrors.length).toBe(0);
  525 |     }
  526 |   });
  527 | 
  528 |   test("E2E-008: lib/api.ts BASE_URL env var used (no hardcoded localhost in production build)", async ({ page }) => {
  529 |     await page.goto(FE);
  530 |     const requests: string[] = [];
  531 |     page.on("request", (req) => {
  532 |       if (req.url().includes("8000") || req.url().includes("space-weather") || req.url().includes("noaa")) {
  533 |         requests.push(req.url());
  534 |       }
  535 |     });
  536 |     await page.goto(`${FE}/sep`);
  537 |     await page.waitForTimeout(5000);
  538 |     console.log(`[E2E-008] API requests made: ${requests.length} | Sample: ${requests.slice(0, 3).join(", ")}`);
  539 |     expect(requests.length).toBeGreaterThan(0);
  540 |   });
  541 | 
  542 |   test("E2E-009: SEP data auto-refresh — last updated timestamp visible", async ({ page }) => {
  543 |     await page.goto(`${FE}/sep`);
  544 |     await page.waitForTimeout(4000);
  545 |     const ts = page.getByText(/last updated/i).first();
  546 |     const visible = await ts.isVisible();
  547 |     const text = visible ? await ts.textContent() : "not shown";
  548 |     console.log(`[E2E-009] Last updated visible: ${visible} | text: "${text}"`);
  549 |     expect(visible).toBeTruthy();
  550 |   });
  551 | 
  552 |   test("E2E-010: Console has no unhandled promise rejections on any page", async ({ page }) => {
  553 |     const rejections: string[] = [];
  554 |     page.on("pageerror", (err) => rejections.push(err.message));
  555 | 
  556 |     for (const path of ["/solar-flare", "/cme", "/sep", "/solar-wind"]) {
> 557 |       await page.goto(`${FE}${path}`);
      |                  ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/solar-flare
  558 |       await page.waitForTimeout(2000);
  559 |     }
  560 |     console.log(`[E2E-010] Unhandled rejections: ${rejections.length > 0 ? rejections.join(" | ") : "none"}`);
  561 |     expect(rejections).toHaveLength(0);
  562 |   });
  563 | });
  564 | 
```