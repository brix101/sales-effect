import { Database, DatabaseLive } from "@/db";
import { customers } from "@/db/schema/index";
import { count } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { CustomersWithPagination } from "./customers.domain.js";

export class CustomerService extends Effect.Service<CustomerService>()(
  "CustomerService",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database;

      const findAll = Effect.fn("CustomerService.findAll")(
        //
        function* (page: number, pageSize: number) {
          return yield* db
            .Query((client) =>
              client.transaction(async (tx) => {
                const items = await tx.query.customers.findMany({
                  limit: pageSize,
                  offset: (page - 1) * pageSize,
                });

                const total = await tx
                  .select({ count: count(customers.id) })
                  .from(customers)
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
              Effect.flatMap(Schema.decode(CustomersWithPagination)),
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
    dependencies: [DatabaseLive],
  },
) {}
