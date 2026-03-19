import { Api } from "@/api";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
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
