import { Database, DatabaseLive } from "@/db";
import { customers } from "@/db/schema/customers";
import { orders, ordersItems } from "@/db/schema/orders";
import { products } from "@/db/schema/products";
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

const program = Effect.gen(function* () {
  const timeStart = Date.now();
  const db = yield* Database;

  yield* Effect.log("Seeding database...");

  const hasData = yield* db
    .Query((client) => client.query.customers.findFirst())
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

  yield* Effect.log(
    "++++++++++++++++++++++++ Products ++++++++++++++++++++++++",
  );
  const createdProducts = yield* Effect.flatMap(
    Effect.forEach(productBatches, (batch, index) =>
      Effect.gen(function* () {
        const percent = (((index + 1) / productBatches.length) * 100).toFixed(
          2,
        );
        yield* Effect.logInfo(`Seeding products: ${percent}%`);
        const items = yield* db.Query((client) =>
          client.insert(products).values(batch).returning(),
        );
        return items;
      }),
    ),
    (results) => Effect.succeed(results.flat()),
  );

  yield* Effect.log(
    "++++++++++++++++++++++++ Customers ++++++++++++++++++++++++",
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

  const createdCustomers = yield* Effect.forEach(
    customerBatches,
    (batch, index) =>
      Effect.gen(function* () {
        const percent = (((index + 1) / customerBatches.length) * 100).toFixed(
          2,
        );
        yield* Effect.logInfo(`Seeding customers: ${percent}%`);
        const items = yield* db.Query((client) =>
          client
            .insert(customers)
            .values(batch)
            .onConflictDoNothing()
            .returning(),
        );
        return items;
      }),
  );

  yield* Effect.log("++++++++++++++++++++++++ Orders ++++++++++++++++++++++++");
  const salesResults = yield* Effect.forEach(createdCustomers, (batch, index) =>
    Effect.gen(function* () {
      const percent = (((index + 1) / customerBatches.length) * 100).toFixed(2);
      yield* Effect.logInfo(`Seeding orders: ${percent}%`);

      const newOrders = yield* Effect.flatMap(
        Effect.forEach(batch, (customer) =>
          Effect.gen(function* () {
            const orderCount = faker.number.int({ min: 1, max: 10 });
            const orderBatch = Array.from({ length: orderCount }, () => ({
              customerId: customer.id,
            }));

            const items = yield* db.Query((client) =>
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
              return yield* db.Query((client) =>
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
  Effect.provide(Layer.merge(DatabaseLive, Logger.pretty)),
  Effect.tap(({ duration, count }) => {
    return Effect.logInfo(
      `Database seeded successfully in ${duration.toFixed(2)} minutes.`,
      `Created ${count.customers} customers`,
      `Created ${count.products} products`,
      `Created ${count.orders} orders with ${count.orderItems} items.`,
    );
  }),
);

Effect.runPromise(program);
