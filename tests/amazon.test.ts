import { expect, test } from "@playwright/test";
import { AmazonRetailer } from '../src/retailer';
test("finds MacBook Pro M5 items", async () => {
  const retailer = new AmazonRetailer();
  const list = await retailer.getProductList("MacBook Pro M5");
  expect(list.length).toBeGreaterThan(0);
});
