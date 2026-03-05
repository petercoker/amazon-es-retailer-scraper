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


test('getProduct returns full details for a real product', async () => {
  const retailer = new AmazonRetailer();

  // Get a real ASIN from the list method (we know it works)
  const list = await retailer.getProductList('MacBook Pro M5');
  expect(list.length).toBeGreaterThan(0);

  const realAsin = list[0].asin;

  // Call the new method — should return an object
  const detail = await retailer.getProduct(realAsin);

  expect(detail).toBeDefined();
  expect(detail).toHaveProperty('asin');
  expect(detail.asin).toBe(realAsin);

  expect(detail).toHaveProperty('title');
  expect(detail.title).toBeTruthy();           // real title
  expect(detail.title.length).toBeGreaterThan(10);

  expect(detail).toHaveProperty('price');
  expect(detail.price).toBeTruthy();           // real price

  expect(detail).toHaveProperty('images');
  expect(Array.isArray(detail.images)).toBe(true);
  expect(detail.images.length).toBeGreaterThan(0); // at least one image
});