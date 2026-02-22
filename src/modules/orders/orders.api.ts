import { searchParams } from "@/modules/common/domain";
import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { OrdersWithPagination } from "./orders.domain.js";

export class OrderApi extends HttpApiGroup.make("Orders")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(searchParams)
      .addSuccess(OrdersWithPagination),
  )
  .prefix("/orders") {}
