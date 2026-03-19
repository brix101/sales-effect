import { searchParams } from "@/modules/common/domain";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import { ProductsWithPagination } from "./products.domain.js";

export class ProductApi extends HttpApiGroup.make("Products")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(searchParams)
      .addSuccess(ProductsWithPagination),
  )
  .prefix("/products") { }
