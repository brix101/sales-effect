import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { OrdersWithPagination } from "./orders.domain.js";

export class OrderApi extends HttpApiGroup.make("Orders")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(
        Schema.Struct({
          page: Schema.UndefinedOr(Schema.NumberFromString),
          pageSize: Schema.UndefinedOr(Schema.NumberFromString),
        }),
      )
      .addSuccess(OrdersWithPagination),
  )
  .prefix("/orders") {}
