import { Effect } from "effect";
import { Database, DatabaseLive } from "./db/index.js";

export const program = Effect.gen(function* () {
  const db = yield* Database;

  const products = yield* db.execute((client) => client.query.products.findMany());

  yield* Effect.logInfo(products);
  return products;

}).pipe(Effect.provide(DatabaseLive));
