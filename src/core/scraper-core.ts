import { BrowserManager } from "../utility/browser-manager";
import { Product } from "./types";

/**
 * Base class for All retailer adapters.
 * Every retailer (Amazon, eBay, AliExpress, etc.) will extend this.
 * Keeps shared logic (browser, cleanup) in one place.
 */
export abstract class ScraperCore {
  protected browserManager = BrowserManager.getInstance();

  /**
   * Search for products by keywords.
   * Must be implemented by each retailer.
   */
  abstract getProductList(keywords: string): Promise<Product[]>;

  /**
   * Get full details for a single product by ID.
   * Must be implemented by each retailer.
   */
  abstract getProduct(id: string): Promise<Product>;

  /**
   * Clean up the shared browser when done.
   * Call this at the end of your script.
   */
  async cleanup(): Promise<void> {
    await this.browserManager.closeBrowser();
  }
}
