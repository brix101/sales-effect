import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { ProductsWithPagination } from "./products.domain.js";

export class ProductApi extends HttpApiGroup.make("Products")
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(
        Schema.Struct({
          page: Schema.UndefinedOr(Schema.NumberFromString),
          pageSize: Schema.UndefinedOr(Schema.NumberFromString),
        }),
      )
      .addSuccess(ProductsWithPagination),
  )
  .prefix("/products") {}
