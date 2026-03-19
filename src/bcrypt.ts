import { compare, hash } from "bcrypt";
import * as crypto from "crypto";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class BcryptError extends Data.TaggedError("BcryptError")<{
  cause?: unknown;
  message?: string;
}> { }

type BcryptShape = {
  hash: (data: string) => Effect.Effect<string, BcryptError, never>;
  compare: (
    data: string,
    encrypted: string,
  ) => Effect.Effect<boolean, BcryptError, never>;
};

export class Bcrypt extends Context.Tag("Bcrypt")<Bcrypt, BcryptShape>() { }

type BcryptConfig = {
  saltRounds: string | number;
  pepper: string;
};

const make = (config: BcryptConfig) =>
  Effect.gen(function* () {
    const { saltRounds, pepper } = config;

    return Bcrypt.of({
      hash: Effect.fn("Bcrypt.hash")((data) =>
        Effect.tryPromise({
          try: async () => {
            const pepperData = crypto.createHmac("sha256", pepper).update(data).digest("base64");

            return await hash(pepperData, saltRounds);
          },
          catch: (cause) =>
            new BcryptError({ cause, message: "Hashing failed" }),
        }),
      ),
      compare: Effect.fn("Bcrypt.compare")((data, encrypted) =>
        Effect.tryPromise({
          try: async () => {
            const pepperData = crypto.createHmac("sha256", pepper).update(data).digest("base64");

            return await compare(pepperData, encrypted);
          },
          catch: (cause) =>
            new BcryptError({ cause, message: "Comparison failed" }),
        }),
      ),
    });
  });

export const layer = (config: BcryptConfig) =>
  Layer.scoped(Bcrypt, make(config));

export const fromEnv = Layer.scoped(
  Bcrypt,
  Effect.gen(function* () {
    const saltRounds = yield* Config.integer("BCRYPT_SALT_ROUNDS");
    const pepper = yield* Config.string("BCRYPT_PEPPER");

    return yield* make({ saltRounds, pepper });
  }),
);
