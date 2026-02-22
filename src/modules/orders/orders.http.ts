import { Api } from "@/api";
import { HttpApiBuilder } from "@effect/platform";
import { Effect, Layer } from "effect";
import { OrderService } from "./orders.services.js";

const HttpOrderLive = HttpApiBuilder.group(Api, "Orders", (handlers) =>
  Effect.gen(function* () {
    const service = yield* OrderService;

    return handlers.handle("list", ({ urlParams }) => {
      const page = urlParams.page ?? 1;
      const pageSize = urlParams.pageSize ?? 20;

      return service.findAll(page, pageSize);
    });
  }),
).pipe(Layer.provide(OrderService.Default));

export default HttpOrderLive;
