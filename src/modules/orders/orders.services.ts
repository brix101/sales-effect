import * as Database from "@/db";
import { orders } from "@/db/schema/orders";
import { count } from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { OrdersWithPagination } from "./orders.domain.js";

export class OrderService extends Effect.Service<OrderService>()(
  "OrderService",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database.Database;

      const findAll = Effect.fn("OrderService.findAll")(
        //
        function* (page: number, pageSize: number) {
          return yield* db
            .use((client) =>
              client.transaction(async (tx) => {
                const items = await tx.query.orders.findMany({
                  limit: pageSize,
                  offset: (page - 1) * pageSize,
                  columns: {
                    customerId: false,
                  },
                  with: {
                    customer: true,
                    items: {
                      columns: {
                        productId: false,
                      },
                      with: {
                        product: true,
                      },
                    },
                  },
                });

                const total = await tx
                  .select({ count: count(orders.id) })
                  .from(orders)
                  .then((res) => res[0]?.count ?? 0);

                return {
                  items,
                  meta: {
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize),
                    nextPage: page * pageSize < total ? page + 1 : null,
                  },
                };
              }),
            )
            .pipe(
              Effect.flatMap(Schema.decode(OrdersWithPagination)),
              Effect.catchTags({
                DatabaseError: Effect.die,
                ParseError: Effect.die,
              }),
            );
        },
      );

      return {
        findAll,
      };
    }),
    dependencies: [Database.fromEnv],
  },
) { }
