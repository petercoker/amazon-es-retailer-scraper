# Amazon.es Retailer Scraper

A clean, TDD-driven Node.js + TypeScript + Playwright scraper for **Amazon.es**.  
Implements the two required methods from the assignment:

- `getProductList(keywords)` — searches and returns list of products (asin, title, price)
- `getProduct(id)` — fetches product details page (asin, title, price, images)

## Setup

```bash
git clone <your-repo-url>
cd amazon-es-retailer
npm install
npx playwright install chromium