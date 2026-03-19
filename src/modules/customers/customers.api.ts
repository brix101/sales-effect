import { searchParams } from "@/modules/common/domain";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import { CustomersWithPagination } from "./customers.domain.js";

export class CustomerApi extends HttpApiGroup.make("Customers")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(searchParams)
      .addSuccess(CustomersWithPagination),
  )
  .prefix("/customers") { }
