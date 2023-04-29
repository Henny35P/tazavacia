import { chromium, Browser, Page } from "playwright";

interface Product {
  name: string;
  price: string;
  image: string;
  description: string;
}

// export const scrapeWebsiteShopify = async (website: string) => {
//   // leer json
//   console.log("test");
// };
export async function scrapeProducts(website: string): Promise<Product[]> {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();

  await page.goto(website);

  const products: Product[] = [];

  // Find all the product elements on the page and extract the relevant information
  const productElements = await page.$$("ul.products li.product");
  for (const productElement of productElements) {
    let name = "";
    let price = "";
    let image = "";
    let description = "";

    try {
      const nameElement = await productElement.waitForSelector(
        ".woocommerce-loop-product__title",
        { timeout: 5000 }
      );
      const nameText = await nameElement.textContent();
      name = nameText !== null ? nameText : "";
    } catch (error) {
      console.log("Error getting name:");
    }

    try {
      const priceElement = await productElement.waitForSelector(
        ".woocommerce-Price-amount",
        { timeout: 5000 }
      );

      const priceText = await priceElement.textContent();
      price = priceText !== null ? priceText : "";
    } catch (error) {
      console.log("Error getting price:");
    }

    try {
      const imageElement = await productElement.waitForSelector(
        ".attachment-woocommerce_thumbnail",
        { timeout: 5000 }
      );

      const imageText = await imageElement.textContent();
      image = imageText !== null ? imageText : "";
    } catch (error) {
      console.log("Error getting image:");
    }

    try {
      const descriptionElement = await productElement.waitForSelector(
        ".woocommerce-product-details__short-description",
        { timeout: 5000 }
      );

      const descriptionText = await descriptionElement.textContent();
      description = descriptionText !== null ? descriptionText : "";
    } catch (error) {
      console.log("error getting description:");
    }

    products.push({ name, price, image, description });
  }

  await browser.close();

  return products;
}

// Usage example

const products = await scrapeProducts("https://cafealtura.cl/productos");
console.log(products);
