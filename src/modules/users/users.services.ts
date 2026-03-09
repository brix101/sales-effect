import * as Bcrypt from "@/bcrypt";
import * as Database from "@/db";
import { users } from "@/db/schema/user";
import { eq } from "drizzle-orm";
import { Array, Effect, Redacted, Schema } from "effect";
import { User, type CreateUserPayloadInput } from "./users.domain.js";

export class UserService extends Effect.Service<UserService>()("UsersService", {
  effect: Effect.gen(function* () {
    const db = yield* Database.Database;
    const bcrypt = yield* Bcrypt.Bcrypt;

    const create = Effect.fn("UsersService.create")(
      //
      function* (data: CreateUserPayloadInput) {
        const password = yield* bcrypt.hash(Redacted.value(data.password)).pipe(
          Effect.catchTags({
            BcryptError: Effect.die,
          }),
        );

        return yield* db
          .use((client) =>
            client
              .insert(users)
              .values({
                ...data,
                password,
              })
              .returning(),
          )
          .pipe(
            Effect.flatMap(Array.head),
            Effect.flatMap(Schema.decode(User)),
            Effect.catchTags({
              DatabaseError: Effect.die,
              NoSuchElementException: () =>
                Effect.dieMessage("Failed to create user"),
              ParseError: Effect.die,
            }),
          );
      },
    );

    const findByEmail = Effect.fn("UsersService.findByEmail")(
      //
      function* (email: string) {
        return yield* db.use((client) =>
          client.query.users.findFirst({
            where: eq(users.email, email),
          }),
        );
      },
    );

    return {
      create,
      findByEmail,
    };
  }),
}) {}
