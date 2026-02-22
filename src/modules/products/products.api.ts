import { searchParams } from "@/modules/common/domain";
import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { ProductsWithPagination } from "./products.domain.js";

export class ProductApi extends HttpApiGroup.make("Products")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(searchParams)
      .addSuccess(ProductsWithPagination),
  )
  .prefix("/products") {}
