import { ProductDetail, ProductListItem } from "./types";
import { BrowserManager } from "./utility/browser";
import { AMAZON_BASE_URL } from "./utility/constants";
import { safeGoto, safeWaitForSelector } from "./utility/page-actions";
/**
 * Main scraper class for Amazon.es.
 * Uses shared browser instance (via BrowserManager) to avoid repeated launches.
 */
export class AmazonRetailer {
  private browserManager = BrowserManager.getInstance();

  /**
   * Search Amazon and return list of products with asin, title, price.
   * @param keywords - Search term (e.g., "MacBook Pro M5")
   * @param page - Optional existing page to reuse (avoids opening/closing)
   * @returns Array of product items (max 5)
   */
  async getProductList(
    keywords: string,
    page?: import("playwright").Page,
  ): Promise<ProductListItem[]> {
    console.log(`Searching for: ${keywords}`);

    const existingPage = page !== undefined;
    const targetPage = page ?? (await this.browserManager.newPage());

    try {
      const url = `${AMAZON_BASE_URL}/s?k=${encodeURIComponent(keywords)}`;
      await safeGoto(targetPage, url);
      await safeWaitForSelector(
        targetPage,
        "div[data-component-type='s-search-result'], .s-result-item[data-asin]",
        3,
      );

      await targetPage.waitForSelector("div.s-result-item", {
        timeout: 15000,
      });

      return await targetPage.evaluate(() => {
        const productListItems: ProductListItem[] = [];
        // Target any div that has a data-asin attribute (standard for search results)
        const nodes = document.querySelectorAll("div[data-asin]");

        for (const node of Array.from(nodes)) {
          const asin = node.getAttribute("data-asin");
          // Filter out empty asins or ads
          if (!asin || asin.length < 5) continue;

          // Use broader selectors for Title and Price
          const titleEl = node.querySelector(
            "h2, .a-size-medium, .a-size-base-plus",
          );
          const title = titleEl?.textContent?.trim() || "No title";

          const priceEl = node.querySelector(
            ".a-price .a-offscreen, .a-color-price",
          );
          const price = priceEl?.textContent?.trim() || "No price";

          if (title && !productListItems.find((i) => i.asin === asin)) {
            productListItems.push({
              asin,
              title,
              price: price || "Check website",
            });
          }
          if (productListItems.length >= 5) break;
        }
        return productListItems;
      });
    } catch (error) {
      // Take a screenshot if it fails so you can see if you got hit by a CAPTCHA
      await targetPage.screenshot({ path: `error-search-${Date.now()}.png` });
      throw new Error(
        `Failed to get product list: ${(error as Error).message}`,
      );
    } finally {
      // Only close the page if we created it (not reusing an existing page)
      if (!existingPage) {
        await targetPage.close();
      }
    }
  }

  /**
   * Fetch full details for a single product by ASIN.
   * @param asin - Amazon product ID (e.g. "B0DLHH2QR6")
   * @param page - Optional existing page to reuse (avoids opening/closing)
   * @returns Product details (asin, title, price, images)
   */
  async getProduct(
    asin: string,
    page?: import("playwright").Page,
  ): Promise<ProductDetail> {
    console.log(`Fetching product: ${asin}`);

    const existingPage = page !== undefined;
    const targetPage = page ?? (await this.browserManager.newPage());

    try {
      const url = `${AMAZON_BASE_URL}/dp/${asin}`;
      // Updated to use the utility
      await safeGoto(targetPage, url);
      await safeWaitForSelector(targetPage, "#productTitle", 3);

      return await targetPage.evaluate((productAsin) => {
        const title =
          document.querySelector("#productTitle")?.textContent?.trim() ||
          "No title found";
        const priceEl =
          document.querySelector(".a-price .a-offscreen") ||
          document.querySelector("#price_inside_buybox");
        const price = priceEl?.textContent?.trim() || "No price";

        const images = Array.from(
          document.querySelectorAll("#landingImage, #imgTagWrapperId img"),
        )
          .map((img) => (img as HTMLImageElement).src)
          .slice(0, 5);

        return { asin: productAsin, title, price, images };
      }, asin);
    } finally {
      // Only close the page if we created it (not reusing an existing page)
      if (!existingPage) {
        await targetPage.close();
      }
    }
  }

  /**
   * Clean up shared browser when application ends.
   * Call this once when your script finishes.
   */
  async cleanup(): Promise<void> {
    await this.browserManager.closeBrowser();
  }
}
