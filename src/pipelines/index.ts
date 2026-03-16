import fs from "fs/promises";
import { Product } from "../core/types";

/**
 * Simple JSON pipleline - saves everything to a file
 */
export async function saveToJson(
  products: Product[],
  filename = "products.json",
) {
  await fs.writeFile(filename, JSON.stringify(products, null, 2));
  console.log(`Saved ${products.length} products to ${filename}`);
}

/**
 * Simple CSV pipleline
 */
export async function saveToCsv(
  products: Product[],
  filename = "products.csv",
) {
  const header = "retailer,id,title,price,currency\n";
  const rows = products.map(
    (product) => `"${product.retailer}",
    "${product.id}", "${product.title.replace(/"/g, '""')}",
    "${product.price}","${product.currency}
    `,
  );
  await fs.writeFile(filename, header + rows);
  console.log(`Saved to ${filename}`);
}
