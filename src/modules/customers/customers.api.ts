import { searchParams } from "@/modules/common/domain";
import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { CustomersWithPagination } from "./customers.domain.js";

export class CustomerApi extends HttpApiGroup.make("Customers")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(searchParams)
      .addSuccess(CustomersWithPagination),
  )
  .prefix("/customers") {}
