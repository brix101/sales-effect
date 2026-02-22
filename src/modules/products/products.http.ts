import { Api } from "@/api";
import { HttpApiBuilder } from "@effect/platform";
import { Effect, Layer } from "effect";
import { ProductService } from "./products.services.js";

const HttpProductLive = HttpApiBuilder.group(Api, "Products", (handlers) =>
  Effect.gen(function* () {
    const service = yield* ProductService;

    return handlers.handle("list", ({ urlParams }) => {
      const page = urlParams.page ?? 1;
      const pageSize = urlParams.pageSize ?? 20;

      return service.findAll(page, pageSize);
    });
  }),
).pipe(Layer.provide(ProductService.Default));

export default HttpProductLive;
