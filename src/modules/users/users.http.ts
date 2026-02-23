import { Api } from "@/api";
import { HttpApiBuilder } from "@effect/platform";
import { Effect, Layer } from "effect";
import { UserService } from "./users.services.js";

const HttpUserLive = HttpApiBuilder.group(Api, "Users", (handlers) =>
  Effect.gen(function* () {
    const service = yield* UserService;

    return handlers.handle("create", ({ payload }) => {
      return service.create(payload);
    });
  }),
).pipe(Layer.provide(UserService.Default));

export default HttpUserLive;
