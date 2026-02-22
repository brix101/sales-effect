import { Api } from "@/api";
import { HttpApiBuilder } from "@effect/platform";
import { Effect, Layer } from "effect";
import { CustomerService } from "./customers.services.js";

const HttpCustomerLive = HttpApiBuilder.group(Api, "Customers", (handlers) =>
  Effect.gen(function* () {
    const service = yield* CustomerService;

    return handlers.handle("list", ({ urlParams }) => {
      const page = urlParams.page ?? 1;
      const pageSize = urlParams.pageSize ?? 20;

      return service.findAll(page, pageSize);
    });
  }),
).pipe(Layer.provide(CustomerService.Default));

export default HttpCustomerLive;
