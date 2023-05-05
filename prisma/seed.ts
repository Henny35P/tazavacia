import { PrismaClient } from "@prisma/client";
import storesData from "./stores.json";

const prisma = new PrismaClient();

interface Store {
  name: string;
  url: string;
  method: string;
  scrapeLocation: string;
  imageUrl: string;
}

interface Stores {
  stores: Store[];
}

export async function seedStores() {
  const mydata: Stores = storesData;
  for (const store of mydata.stores) {
    await prisma.store.upsert({
      // Identifico por URL
      // Se crea o actualiza si ya existe
      where: { url: store.url },
      update: {
        name: store.name,
        url: store.url,
        scrapeLocation: store.scrapeLocation,
        method: store.method,
        imageUrl: store.imageUrl,
      },
      create: {
        name: store.name,
        url: store.url,
        scrapeLocation: store.scrapeLocation,
        method: store.method,
        imageUrl: store.imageUrl,
      },
    });
  }
}

const runSeed = () => {
  seedStores()
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

runSeed();
