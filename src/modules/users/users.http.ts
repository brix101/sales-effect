import { Api } from "@/api";
import * as Bcrypt from "@/bcrypt";
import * as Database from "@/db";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { UserService } from "./users.services.js";

const HttpUser = HttpApiBuilder.group(Api, "Users", (handlers) =>
  Effect.gen(function* () {
    const service = yield* UserService;

    return handlers.handle("create", ({ payload }) => {
      return service.create(payload);
    });
  }),
).pipe(Layer.provide(UserService.Default))

const InfrastructureLive = Layer.mergeAll(
  Database.fromEnv,
  Bcrypt.fromEnv,
);

const HttpUserLive = HttpUser.pipe(Layer.provide(InfrastructureLive));

export default HttpUserLive;
