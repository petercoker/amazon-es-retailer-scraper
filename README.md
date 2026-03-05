# Amazon.es Retailer Scraper

A simple Node.js + TypeScript + Playwright scraper for Amazon.es.Implements two main methods:

- `getProductList(keywords)` — searches and returns list of products (asin, title, price)
- `getProduct(id)` — fetches product details page (asin, title, price, images)

## Setup

```bash
git clone <repo-url>
cd amazon-es-retailer
npm install
npx playwright install chromium
```
