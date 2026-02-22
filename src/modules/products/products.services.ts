import { Database, DatabaseLive } from "@/db";
import { products } from "@/db/schema/products";
import { count } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { ProductsWithPagination } from "./products.domain.js";

export class ProductService extends Effect.Service<ProductService>()(
  "ProductService",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database;

      const findAll = (page: number, pageSize: number) =>
        db
          .execute((client) =>
            client.transaction(async (tx) => {
              const items = await tx.query.products.findMany({
                limit: pageSize,
                offset: (page - 1) * pageSize,
              });

              const total = await tx
                .select({ count: count(products.id) })
                .from(products)
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
            Effect.flatMap(Schema.decode(ProductsWithPagination)),
            Effect.catchTags({
              DatabaseError: Effect.die,
              ParseError: Effect.die,
            }),
            Effect.withSpan("ProductService.findAll", {
              attributes: { page, pageSize },
            }),
          );

      return {
        findAll,
      };
    }),
    dependencies: [DatabaseLive],
  },
) {}
