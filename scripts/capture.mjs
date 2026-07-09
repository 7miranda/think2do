import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const url = process.argv[2] || "http://127.0.0.1:3000";
const outDir = path.resolve(".qa");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1600);
await page.screenshot({ path: path.join(outDir, "desktop-home.png"), fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 900 }, isMobile: true, deviceScaleFactor: 2 });
await mobile.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await mobile.waitForTimeout(1600);
await mobile.screenshot({ path: path.join(outDir, "mobile-home.png"), fullPage: true });

await browser.close();
console.log(`Screenshots written to ${outDir}`);
