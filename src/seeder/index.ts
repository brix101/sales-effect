import * as Database from "@/db";
import { customers } from "@/db/schema/customers";
import { orders, ordersItems } from "@/db/schema/orders";
import { products } from "@/db/schema/products";
import { NodeRuntime } from "@effect/platform-node";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { Data, Layer, Logger } from "effect";
import * as Effect from "effect/Effect";

config({ path: [".env.local", ".env"] });

const CUSTOMER_COUNT = 10000;
const PRODUCT_COUNT = 50000;
const BATCH_SIZE = 100;

class SeederError extends Data.TaggedError("SeederError")<{
  cause: unknown;
  message: string;
}> {}

const main = Effect.gen(function* () {
  const timeStart = Date.now();
  const db = yield* Database.Database;

  yield* Effect.log("Seeding database...");

  const hasData = yield* db
    .use((client) => client.query.customers.findFirst())
    .pipe(
      Effect.map((item) => !!item),
      Effect.catchAll(() => Effect.succeed(false)),
    );

  if (hasData) {
    throw new SeederError({
      cause: "Database already seeded",
      message: "Database already seeded, skipping seeding process.",
    });
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

  const createdProducts = yield* Effect.all(
    productBatches.map(
      (batch, index) =>
        Effect.gen(function* () {
          const percent = (((index + 1) / productBatches.length) * 100).toFixed(
            2,
          );
          yield* Effect.logInfo(`Seeding products: ${percent}%`);
          return yield* db.use((client) =>
            client.insert(products).values(batch).returning(),
          );
        }),
      {
        concurrency: 10,
      },
    ),
  );

  const createdCustomers = yield* Effect.all(
    customerBatches.map((batch, index) =>
      Effect.gen(function* () {
        const percent = (((index + 1) / customerBatches.length) * 100).toFixed(
          2,
        );
        yield* Effect.logInfo(`Seeding customers: ${percent}%`);
        return yield* db.use((client) =>
          client
            .insert(customers)
            .values(batch)
            .onConflictDoNothing()
            .returning(),
        );
      }),
    ),
    { concurrency: 10 },
  );

  const productItems = createdProducts.flat();

  const salesResults = yield* Effect.all(
    createdCustomers.map((batch, index) =>
      Effect.gen(function* () {
        const percent = (((index + 1) / customerBatches.length) * 100).toFixed(
          2,
        );
        yield* Effect.logInfo(`Seeding orders: ${percent}%`);

        const newOrdersBatch = yield* Effect.all(
          batch.map((customer) =>
            Effect.gen(function* () {
              const orderCount = faker.number.int({ min: 1, max: 10 });
              const orderBatch = Array.from({ length: orderCount }, () => ({
                customerId: customer.id,
              }));

              const items = yield* db.use((client) =>
                client.insert(orders).values(orderBatch).returning(),
              );

              return items;
            }),
          ),
          {
            concurrency: 5,
          },
        ).pipe(Effect.map((results) => results.flat()));

        const newOrderItemsbatch = yield* Effect.all(
          newOrdersBatch.map((order) =>
            Effect.gen(function* () {
              const itemCount = faker.number.int({ min: 1, max: 10 });
              const orderItemsBatch = Array.from({ length: itemCount }, () => {
                const product = faker.helpers.arrayElement(productItems);
                const quantity = faker.number.int({ min: 1, max: 5 });
                return {
                  orderId: order.id,
                  productId: product.id,
                  quantity,
                  price: product.price,
                };
              });

              if (orderItemsBatch.length > 0) {
                return yield* db.use((client) =>
                  client
                    .insert(ordersItems)
                    .values(orderItemsBatch)
                    .returning(),
                );
              }

              return [];
            }),
          ),
          {
            concurrency: 10,
          },
        ).pipe(Effect.map((results) => results.flat()));

        return {
          orders: newOrdersBatch.length,
          orderedItems: newOrderItemsbatch.length,
        };
      }),
    ),
    {
      concurrency: 20,
    },
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

  return {
    duration: (Date.now() - timeStart) / 60000,
    count: {
      customers: createdCustomers.flat().length,
      products: createdProducts.length,
      orders: totalOrders,
      orderItems: totalOrderedItems,
    },
  };
}).pipe(
  Effect.withLogSpan("seed"),
  Effect.tap(({ duration, count }) => {
    return Effect.logInfo(
      `Database seeded successfully in ${duration.toFixed(2)} minutes.`,
      `Created ${count.customers} customers`,
      `Created ${count.products} products`,
      `Created ${count.orders} orders with ${count.orderItems} items.`,
    );
  }),
);

const Services = Layer.merge(Database.fromEnv, Logger.pretty);

main.pipe(Effect.provide(Services), NodeRuntime.runMain);
