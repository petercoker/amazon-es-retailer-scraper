export class AmazonRetailer {
  async getProductList(keywords: string) {
    console.log('getProductList called with:', keywords); // debug: see if it even runs
    return []; // empty on purpose — test should fail
  }
}