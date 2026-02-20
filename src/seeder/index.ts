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

const program = Effect.gen(function* () {
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

  yield* Effect.log("Seeding customers...");
  const createdCustomers = yield* Effect.flatMap(
    Effect.forEach(Array.from({ length: CUSTOMER_COUNT }), () =>
      db.execute((client) =>
        client
          .insert(customers)
          .values({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress({ useFullAddress: true }),
          })
          .onConflictDoNothing()
          .returning(),
      ),
    ),
    (results) => Effect.succeed(results.flat()),
  );

  yield* Effect.log("Seeding products...");
  const createdProducts = yield* Effect.flatMap(
    Effect.forEach(Array.from({ length: PRODUCT_COUNT }), () =>
      db.execute((client) =>
        client
          .insert(products)
          .values({
            name: faker.commerce.productName(),
            price: Number(faker.commerce.price()),
            description: faker.commerce.productDescription(),
            image: faker.image.url(),
          })
          .returning(),
      ),
    ),
    (results) => Effect.succeed(results.flat()),
  );

  yield* Effect.log("Seeding sales...");
  const salesResults = yield* Effect.forEach(createdCustomers, (newCustomer) =>
    Effect.gen(function* () {
      let customerOrders = 0;
      let customerOrderedItems = 0;
      const orderCount = faker.number.int({ min: 1, max: 5 });
      yield* Effect.forEach(Array.from({ length: orderCount }), () =>
        Effect.gen(function* () {
          const [newOrder] = yield* db.execute((client) =>
            client
              .insert(orders)
              .values({
                customerId: newCustomer.id,
              })
              .returning(),
          );
          if (newOrder) {
            customerOrders++;
            const itemCount = faker.number.int({ min: 1, max: 10 });
            yield* Effect.forEach(Array.from({ length: itemCount }), () => {
              const product = faker.helpers.arrayElement(createdProducts);
              const quantity = faker.number.int({ min: 1, max: 5 });
              customerOrderedItems++;
              return db.execute((client) =>
                client.insert(ordersItems).values({
                  orderId: newOrder.id,
                  productId: product.id,
                  quantity: quantity,
                  price: product.price,
                }),
              );
            });
          }
        }),
      );
      return { orders: customerOrders, orderedItems: customerOrderedItems };
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
    `Created ${createdCustomers.length} customers.`,
    `Created ${createdProducts.length} products.`,
    `Created ${totalOrders} orders with ${totalOrderedItems} items.`,
  );
}).pipe(Effect.provide(DatabaseLive), Effect.provide(Logger.pretty));

Effect.runPromise(program);
