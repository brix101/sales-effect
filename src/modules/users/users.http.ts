import { Api } from "@/api";
import * as Bcrypt from "@/bcrypt";
import * as Database from "@/db";
import { HttpApiBuilder } from "@effect/platform";
import { Effect, Layer } from "effect";
import { UserService } from "./users.services.js";

const HttpUser = HttpApiBuilder.group(Api, "Users", (handlers) =>
  Effect.gen(function* () {
    const service = yield* UserService;

    return handlers.handle("create", ({ payload }) => {
      return service.create(payload);
    });
  }),
);
const Services = Layer.mergeAll(
  UserService.Default,
  Database.fromEnv,
  Bcrypt.fromEnv,
);

const HttpUserLive = HttpUser.pipe(Layer.provide(Services));

export default HttpUserLive;
