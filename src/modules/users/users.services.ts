import { Database, DatabaseLive } from "@/db";
import { users } from "@/db/schema/user";
import { Array, Effect, Redacted, Schema } from "effect";
import { User, type CreateUserPayloadInput } from "./users.domain.js";

export class UserService extends Effect.Service<UserService>()("UsersService", {
  effect: Effect.gen(function* () {
    const db = yield* Database;

    const create = Effect.fn("UsersService.create")(
      //
      function* (data: CreateUserPayloadInput) {
        return yield* db
          .Query((client) =>
            client
              .insert(users)
              .values({
                email: data.email,
                name: data.name,
                password: Redacted.value(data.password),
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

    return {
      create,
    };
  }),
  dependencies: [DatabaseLive],
}) {}
