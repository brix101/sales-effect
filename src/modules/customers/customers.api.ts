import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { CustomersWithPagination } from "./customers.domain.js";

export class CustomerApi extends HttpApiGroup.make("Customers")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(
        Schema.Struct({
          page: Schema.UndefinedOr(Schema.NumberFromString),
          pageSize: Schema.UndefinedOr(Schema.NumberFromString),
        }),
      )
      .addSuccess(CustomersWithPagination),
  )
  .prefix("/customers") {}
