import { expect, test } from "@playwright/test";
import { AmazonRetailer } from "../src/retailer";
test("finds MacBook Pro M5 items", async () => {
  const retailer = new AmazonRetailer();
  const list = await retailer.getProductList("MacBook Pro M5");
  expect(list.length).toBeGreaterThan(0);
  expect(list[0]).toHaveProperty("title");
  expect(list[0]).toHaveProperty("price");

  const first = list[0];

  // Stricter checks — make sure we have real, useful data
  expect(first).toHaveProperty("title");
  expect(typeof first.title).toBe("string");
  expect(first.title.length).toBeGreaterThan(5); // real title should be long
  expect(first.title).not.toContain("No title"); // reject placeholder

  expect(first).toHaveProperty("price");
  expect(typeof first.price).toBe("string");
  expect(first.price.length).toBeGreaterThan(3); // at least "€X"
  expect(first.price).not.toContain("No price");
});
