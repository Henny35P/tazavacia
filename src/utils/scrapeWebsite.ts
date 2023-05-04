import data from "./stores.json";
import { chromium, Browser, Page } from "playwright";

interface Product {
  name: string;
  price: string;
  image: string;
  description: string;
}
interface Store {
  name: string;
  url: string;
  method: string;
  scrapeLocation: string;
}

interface Stores {
  stores: Store[];
}

//console.log(mydata);
//console.log(mydata.stores[0]);
export const testFx = async () => {
  const mydata: Stores = data;
  if (!mydata) {
    return "No hay datos";
  }

  // await scrapeWebsitestoreify(mydata.stores[0]);
};

export const scrapeWebsitestoreify = async (store: Store) => {
  // Consigo el json de los productos según la página
  // Para esto, armo el url a usar con los datos de las páginas
  const storeUrl = `https://${store.url}${store.scrapeLocation}.json`;
  const storePromise = await fetch(storeUrl);
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const productJson = await storePromise.json();
    // Ver que hacer con los datos obtenidos.
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Error al obtener los productos de ${store.name}`);
  }
};

export async function scrapeWebsiteWoocommerce(
  website: string
): Promise<Product[]> {
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

// const products = await scrapeProducts("https://cafealtura.cl/productos");
// console.log(products);
