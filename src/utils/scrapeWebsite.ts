import { chromium, Browser, Page } from "playwright";
import productData from "./productsCafeoutlet.json";
import { PrismaClient } from "@prisma/client";
import { test } from "node:test";

const prisma = new PrismaClient();

interface Product {
  name: string;
  price: string;
  imageUrl: string;
  description: string;
  handle: string;
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

export const scrapeWebsiteShopify = async (store: Store) => {
  // Consigo el json de los productos según la página
  // Para esto, armo el url a usar con los datos de las páginas
  const storeUrl = `https://${store.url}${store.scrapeLocation}.json?limit=1000`;
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
  }

  await browser.close();

  return products;
}

// Usage example

// const products = await scrapeProducts("https://cafealtura.cl/productos");
// console.log(products);

const testingJson = async () => {
  const storeName = "Outlet del café";
  const store = await prisma.store.findUnique({
    where: { name: storeName },
  });

  const products = productData;
  for (const product of products.products) {
    if (!product.variants[0]) {
      return;
    }

    const price = product.variants[0].price;
    const name = product.title;
    const handle = product.handle;
    const imageUrl = product.images[0]?.src ?? "";
    const description = product.body_html;

    await prisma.product.upsert({
      // Identifico por URL
      // Se crea o actualiza si ya existe
      where: { handle: handle },
      update: {
        name: name,
        handle: handle,
        prices: {
          create: [{ price: price }],
        },
        imageUrl: imageUrl,
        description: description,
      },

      create: {
        name: name,
        handle: handle,
        store: {
          connect: { id: 2 },
        },
        prices: { create: [{ price: price }] },
        imageUrl: imageUrl,
        description: description,
      },
    });
  }
};

const runScrape = () => {
  testingJson()
    .then(async () => {
      await prisma.$disconnect();
      console.log("Tiendas updateadas");
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
};

runScrape();
