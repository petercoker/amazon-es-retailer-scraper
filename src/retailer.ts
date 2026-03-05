import { chromium } from "playwright";

export class AmazonRetailer {
  async getProductList(keywords: string) {
    console.log("getProductList called with:", keywords); // debug: shows it's running

    const browser = await chromium.launch({ headless: false }); // turn true for visible for debugging
    const page = await browser.newPage();

    // Go to search page - encode keywords so spaces work
    await page.goto(
      `https://www.amazon.es/s?k=${encodeURIComponent(keywords)}`,
    );

    // Wait for product grid to load (timeout 15s - prevents hangs)
    await page.waitForSelector("div.s-result-item", { timeout: 15000 });

    // Grab first 5 ASINs - filter out junk (like ads)
    const items = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("div.s-result-item"))
        .map((el) => {
          const asin = el.getAttribute("data-asin");
          if (!asin || asin.length <= 5) return null;

          // Title: Amazon puts it in h2 > a (full text link)
          const titleEl =
            el.querySelector("h2.a-size-base-plus span") ||
            el.querySelector("h2 span") ||
            el.querySelector("h2");
          const title = titleEl ? titleEl.textContent.trim() : "No title";

          // Price: hidden span with clean € format
          const priceEl = el.querySelector(".a-price .a-offscreen");
          const price = priceEl ? priceEl.textContent.trim() : "No price";

          return { asin, title, price };
        })
        .filter((item) => item !== null) // drop bad ones
        .slice(0, 5);
    });

    await browser.close();
    return items;
  }
}
