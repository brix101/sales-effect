import { Database, DatabaseLive } from "@/db/index";
import { customers } from "@/db/schema/customers";
import { orders, ordersItems } from "@/db/schema/orders";
import { products } from "@/db/schema/products";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { Logger } from "effect";
import * as Effect from "effect/Effect";

config({ path: [".env.local", ".env"] });

const CUSTOMER_COUNT = 1000;
const PRODUCT_COUNT = 5000;
const BATCH_SIZE = 100;

const program = Effect.gen(function* () {
  const timeStart = Date.now();
  const db = yield* Database;

  yield* Effect.log("Seeding database...");

  const hasData = yield* db
    .execute((client) => client.query.customers.findFirst())
    .pipe(
      Effect.map((item) => !!item),
      Effect.catchAll(() => Effect.succeed(false)),
    );

  if (hasData) {
    yield* Effect.log("Database already seeded. Exiting...");
    return;
  }

  const productBatches = Array.from(
    { length: Math.ceil(PRODUCT_COUNT / BATCH_SIZE) },
    (_, i) =>
      Array.from(
        { length: Math.min(BATCH_SIZE, PRODUCT_COUNT - i * BATCH_SIZE) },
        () => ({
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          description: faker.commerce.productDescription(),
          image: faker.image.url(),
        }),
      ),
  );

  yield* Effect.log("Seeding products...");
  const createdProducts = yield* Effect.flatMap(
    Effect.forEach(productBatches, (batch) =>
      db.execute((client) => client.insert(products).values(batch).returning()),
    ),
    (results) => Effect.succeed(results.flat()),
  );

  yield* Effect.log("Seeding customers...");
  const customerBatches = Array.from(
    { length: Math.ceil(CUSTOMER_COUNT / BATCH_SIZE) },
    (_, i) =>
      Array.from(
        { length: Math.min(BATCH_SIZE, CUSTOMER_COUNT - i * BATCH_SIZE) },
        () => ({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: faker.location.streetAddress({ useFullAddress: true }),
        }),
      ),
  );

  const createdCustomers = yield* Effect.forEach(customerBatches, (batch) =>
    db.execute((client) =>
      client.insert(customers).values(batch).onConflictDoNothing().returning(),
    ),
  );

  yield* Effect.log("Seeding sales...");
  const salesResults = yield* Effect.forEach(createdCustomers, (batch) =>
    Effect.gen(function* () {
      const newOrders = yield* Effect.flatMap(
        Effect.forEach(batch, (customer) =>
          Effect.gen(function* () {
            const orderCount = faker.number.int({ min: 1, max: 5 });
            const orderBatch = Array.from({ length: orderCount }, () => ({
              customerId: customer.id,
            }));

            const items = yield* db.execute((client) =>
              client.insert(orders).values(orderBatch).returning(),
            );

            return items;
          }),
        ),
        (results) => Effect.succeed(results.flat()),
      );

      const newOrderItems = yield* Effect.flatMap(
        Effect.forEach(newOrders, (order) =>
          Effect.gen(function* () {
            const itemCount = faker.number.int({ min: 1, max: 10 });
            const orderItemsBatch = Array.from({ length: itemCount }, () => {
              const product = faker.helpers.arrayElement(createdProducts);
              const quantity = faker.number.int({ min: 1, max: 5 });
              return {
                orderId: order.id,
                productId: product.id,
                quantity,
                price: product.price,
              };
            });

            if (orderItemsBatch.length > 0) {
              return yield* db.execute((client) =>
                client.insert(ordersItems).values(orderItemsBatch).returning(),
              );
            }

            return [];
          }),
        ),
        (results) => Effect.succeed(results.flat()),
      );

      return { orders: newOrders.length, orderedItems: newOrderItems.length };
    }),
  );

  const { totalOrderedItems, totalOrders } = salesResults.reduce(
    (acc, curr) => {
      acc.totalOrders += curr.orders;
      acc.totalOrderedItems += curr.orderedItems;
      return acc;
    },
    {
      totalOrders: 0,
      totalOrderedItems: 0,
    },
  );

  yield* Effect.log(
    "Seeding completed.",
    `Created ${createdCustomers.flat().length} customers.`,
    `Created ${createdProducts.length} products.`,
    `Created ${totalOrders} orders with ${totalOrderedItems} items.`,
  );

  const timeEnd = Date.now();
  const duration = (timeEnd - timeStart) / 60000;
  const hours = Math.floor(duration / 60);
  const minutes = Math.floor(duration % 60);
  const seconds = Math.floor((duration * 60) % 60);

  yield* Effect.log(`Total seeding time: ${hours}h ${minutes}m ${seconds}s`);
}).pipe(Effect.provide(DatabaseLive), Effect.provide(Logger.pretty));

Effect.runPromise(program);
