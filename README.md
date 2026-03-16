# E-Commerce Retailer Scraper Framework

A clean, extensible, TDD-built scraper for E-Commerce using Playwright + Node.js/TypeScript .

## Features

- `getProductList(keywords)` – returns top 5 organic products
- `getProduct(id)` – returns full product details + images
- Reusable BrowserManager (singleton)
- Decoupled pipelines (JSON + CSV export)
- Retry logic + cookie handling
- Ready for more retailers (eBay, AliExpress, etc.)

## Quick Start

```bash
npm install
npx playwright install chromium
npm run demo          # or npm run demo "wireless earbuds"
```


