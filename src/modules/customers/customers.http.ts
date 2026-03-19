import { Api } from "@/api";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
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
