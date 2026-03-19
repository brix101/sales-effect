import { searchParams } from "@/modules/common/domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { OrdersWithPagination } from "./orders.domain.js";

export class OrderApi extends HttpApiGroup.make("Orders")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(searchParams)
      .addSuccess(OrdersWithPagination),
  )
  .prefix("/orders") { }
