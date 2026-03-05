import { expect, test } from "@playwright/test";
import { AmazonRetailer } from "../src/retailer";
test("getProductList returns a non-empty list of products", async () => {
  const retailer = new AmazonRetailer();
  const list = await retailer.getProductList("MacBook Pro M5");

  // Core assertions for the list method
  expect(list.length).toBeGreaterThan(0);
  expect(Array.isArray(list)).toBe(true);

  // Check structure of first item (basic)
  const first = list[0];
  expect(first).toHaveProperty("asin"); // must have asin
  expect(typeof first.asin).toBe("string");
  expect(first.asin.length).toBeGreaterThan(5); // real ASINs are 10 chars
});

test("getProductList returns items with title and price", async () => {
  const retailer = new AmazonRetailer();
  const list = await retailer.getProductList("MacBook Pro M5");

  const first = list[0];

  expect(first).toHaveProperty("title");
  expect(typeof first.title).toBe("string");
  expect(first.title.length).toBeGreaterThan(10); // real title, not placeholder
  expect(first.title).not.toContain("No title");

  expect(first).toHaveProperty("price");
  expect(typeof first.price).toBe("string");
  expect(first.price.length).toBeGreaterThan(3); // at least "€X"
  expect(first.price).not.toContain("No price");
});
