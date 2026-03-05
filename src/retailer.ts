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

  async getProduct(asin: string) {
    // ASIN stands for Amazon Standard Identification Number instead of id
    // It is a unique 10-character alphanumeric code assigned by Amazon to identify every product listed in its store.
    console.log("getProduct called with asin:", asin); // debug - see if test calls it

    const browser = await chromium.launch({ headless: false }); // visible for debug/demo
    const page = await browser.newPage();

    // Amazon product detail page URL format
    await page.goto(`https://www.amazon.es/dp/${asin}`);

    // Wait for the main title element - very stable on detail pages
    await page.waitForSelector("#productTitle", { timeout: 15000 });

    const detail = await page.evaluate((productIdAsin) => {
      const title =
        document.querySelector("#productTitle")?.textContent?.trim() ||
        document.querySelector("h1 span")?.textContent?.trim() ||
        "No title found";

      const priceEl =
        document.querySelector(".a-price .a-offscreen") ||
        document.querySelector("span.a-offscreen");
      const price = priceEl?.textContent?.trim() || "No price";

      const images = Array.from(
        document.querySelectorAll(
          "#landingImage, #imgTagWrapperId img, #altImages img",
        ),
      )
        .map((img) => (img as HTMLImageElement).src)
        .filter(Boolean)
        .slice(0, 5);

      return { asin: productIdAsin, title, price, images };
    }, asin); // ← this sends the Node.js variable "asin" to the browser as "productIdAsin"

    await browser.close();
    return detail;
  }
}
