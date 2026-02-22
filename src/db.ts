import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Config, Context, Data, Effect, Layer, Redacted } from "effect";
import pg from "pg";

import * as schema from "@/db/schema/index";

type DBSchema = typeof schema;

type Client = NodePgDatabase<DBSchema> & {
  $client: pg.Pool;
};

export class DatabaseConnectionLostError extends Data.TaggedError(
  "DatabaseConnectionLostError",
)<{
  cause: unknown;
  message: string;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly type:
    | "unique_violation"
    | "foreign_key_violation"
    | "connection_error";
  readonly cause: pg.DatabaseError;
}> {
  public override toString() {
    return `DatabaseError: ${this.cause.message}`;
  }

  public get message() {
    return this.cause.message;
  }
}

const make = () =>
  Effect.gen(function* () {
    const url = yield* Config.redacted("DATABASE_URL");
    const isProd = yield* Config.literal(
      "dev",
      "prod",
      "staging",
    )("NODE_ENV").pipe(
      Config.withDefault("dev"),
      Effect.map((env) => env === "prod"),
    );

    const pool = yield* Effect.acquireRelease(
      Effect.sync(
        () =>
          new pg.Pool({
            connectionString: Redacted.value(url),
            ssl: isProd,
            idleTimeoutMillis: 0,
            connectionTimeoutMillis: 0,
          }),
      ),
      (pool) => Effect.promise(() => pool.end()),
    );

    yield* Effect.tryPromise(() => pool.query("SELECT 1")).pipe(
      Effect.timeoutFail({
        duration: "10 seconds",
        onTimeout: () =>
          new DatabaseConnectionLostError({
            cause: new Error("[Database] Failed to connect: timeout"),
            message: "[Database] Failed to connect: timeout",
          }),
      }),
      Effect.catchTag(
        "UnknownException",
        (error) =>
          new DatabaseConnectionLostError({
            cause: error.cause,
            message: "[Database] Failed to connect",
          }),
      ),
      Effect.tap(() =>
        Effect.logInfo(
          "[Database Client]: Connection to database established.",
        ),
      ),
    );

    const db = drizzle(pool, {
      schema,
      casing: "snake_case",
    });

    const Query = Effect.fn("Database.execute")(
      <T>(fn: (client: Client) => Promise<T>) =>
        Effect.tryPromise<T, DatabaseError>({
          try: () => fn(db) as Promise<T>,
          catch: (error) => {
            if (error instanceof pg.DatabaseError) {
              switch (error.code) {
                case "23505":
                  throw new DatabaseError({
                    type: "unique_violation",
                    cause: error,
                  });
                case "23503":
                  throw new DatabaseError({
                    type: "foreign_key_violation",
                    cause: error,
                  });
                case "08000":
                  throw new DatabaseError({
                    type: "connection_error",
                    cause: error,
                  });
              }
            }
            throw error;
          },
        }),
    );

    return {
      db,
      Query,
    };
  });

export class Database extends Context.Tag("Database")<
  Database,
  Effect.Effect.Success<ReturnType<typeof make>>
>() {}

export const DatabaseLive = Layer.scoped(Database, make());
