import { Browser, chromium, Page } from "playwright";

/**
 * Singleton manager for Playwright browser instance.
 * - Launches browser only once
 * - Reuses it across all scraper calls
 * - Provides clean page creation with anti-bot headers
 * - Safe cleanup when done
 */
export class BrowserManager {
  private static instance: BrowserManager | null = null;
  private browser: Browser | null = null;

  // Private constructor, forces use of getInstance()
  private constructor() {}

  /**
   * Get the single instance (singleton pattern)
   * Ensures only one BrowserManager exists
   */
  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  /**
   * Get or lazily create the shared browser instance
   * - Launches browser only the first time
   * - Keeps it alive for reuse
   */
  public async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false, // set to true in production/CI
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      console.log("Browser launched (shared across calls)");
    }
    return this.browser;
  }

  /**
   * Create a new page with anti-bot headers
   * - Reuses the shared browser
   * - Sets a realistic User-Agent to avoid detection
   */
  public async newPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    // Realistic User-Agent — makes scraper look like a normal browser
    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    });

    return page;
  }

  /**
   * Gracefully closeBrowser the browser when finished
   * - Should be called at the end of the script or in cleanup
   */
  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log("Browser closed");
    }
  }
}
